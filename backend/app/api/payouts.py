from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_admin_user
from app.models.user import User
from app.models.payout import Payout
from app.models.commission import Commission
from app.models.bank_details import BankDetails
from app.schemas.payout import (
    PayoutResponse, PayoutWithUser, PayoutRequest, PayoutUpdate, AvailableBalanceResponse
)
from app.services.payout_service import (
    get_user_payout_history,
    calculate_pending_payouts,
    create_payout_batch,
    process_payout,
    cancel_payout,
    get_payout_statistics
)

router = APIRouter()


@router.get("/my-payouts", response_model=List[PayoutResponse])
def get_my_payouts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's payout history
    """
    payouts = get_user_payout_history(current_user.id, db)
    return payouts


@router.get("/my-pending-amount")
def get_my_pending_amount(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's pending payout amount
    """
    from sqlalchemy import func

    pending_amount = db.query(func.sum(Commission.amount)).filter(
        Commission.user_id == current_user.id,
        Commission.status == 'pending'
    ).scalar() or 0.0

    processing_amount = db.query(func.sum(Commission.amount)).filter(
        Commission.user_id == current_user.id,
        Commission.status == 'processing'
    ).scalar() or 0.0

    from app.core.config import settings

    return {
        'pending_amount': float(pending_amount),
        'processing_amount': float(processing_amount),
        'total_pending': float(pending_amount + processing_amount),
        'minimum_payout': settings.MINIMUM_PAYOUT_AMOUNT,
        'eligible_for_payout': pending_amount >= settings.MINIMUM_PAYOUT_AMOUNT
    }


@router.get("/available-balance", response_model=AvailableBalanceResponse)
def get_available_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get available balance for payout from wallet

    Wallet is the single source of truth for all earnings and payouts.
    Commissions are auto-credited to wallet when earned.
    """
    from sqlalchemy import func
    from app.core.config import settings
    from app.api.wallet import get_or_create_wallet

    # Get wallet balance (single source of truth)
    wallet = get_or_create_wallet(db, current_user.id)

    # Calculate pending payouts (money already requested but not yet paid)
    pending_payouts = db.query(func.sum(Payout.amount)).filter(
        Payout.user_id == current_user.id,
        Payout.status.in_(["pending", "processing"])
    ).scalar() or 0.0

    # Check if user can request payout
    has_bank_details = db.query(BankDetails).filter(BankDetails.user_id == current_user.id).first() is not None
    can_request_payout = wallet.balance >= settings.MINIMUM_PAYOUT_AMOUNT and has_bank_details

    return {
        "total_commissions": wallet.total_earned,  # Total earned from commissions
        "paid_amount": wallet.total_withdrawn,     # Total withdrawn via payouts
        "available_balance": wallet.balance,       # Current wallet balance
        "pending_payouts": pending_payouts,        # Payouts in pending/processing status
        "can_request_payout": can_request_payout,
        "minimum_payout_amount": settings.MINIMUM_PAYOUT_AMOUNT
    }


@router.post("/request", response_model=PayoutResponse)
def request_payout(
    payout_request: PayoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Request a payout from wallet balance

    Wallet is the single source of truth. This endpoint:
    1. Checks wallet balance
    2. Debits wallet immediately
    3. Creates payout request for admin approval
    4. Creates wallet transaction for audit trail
    """
    from app.core.config import settings
    from app.api.wallet import get_or_create_wallet, create_transaction
    from app.models.wallet import TransactionType, TransactionSource

    # Check if user has bank details
    bank_details = db.query(BankDetails).filter(BankDetails.user_id == current_user.id).first()
    if not bank_details:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please add your bank details before requesting a payout"
        )

    # Get wallet balance
    wallet = get_or_create_wallet(db, current_user.id)

    if wallet.balance < settings.MINIMUM_PAYOUT_AMOUNT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum payout amount is ₹{settings.MINIMUM_PAYOUT_AMOUNT}. Your balance: ₹{wallet.balance}"
        )

    # Check if user already has a pending payout request
    existing_payout = db.query(Payout).filter(
        Payout.user_id == current_user.id,
        Payout.status.in_(['pending', 'processing'])
    ).first()

    if existing_payout:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a pending payout request"
        )

    # Use full wallet balance for payout
    payout_amount = wallet.balance

    # Create payout record using bank details
    payout = Payout(
        user_id=current_user.id,
        amount=payout_amount,
        status='pending',
        bank_account_number=bank_details.account_number,
        bank_ifsc=bank_details.ifsc_code,
        upi_id=bank_details.upi_id
    )

    db.add(payout)
    db.flush()

    # Debit wallet immediately (money is now "locked" for payout)
    transaction = create_transaction(
        db=db,
        wallet=wallet,
        transaction_type=TransactionType.DEBIT,
        source=TransactionSource.PAYOUT,
        amount=payout_amount,
        description=f"Payout request #{payout.id} - Pending admin approval",
        reference_id=f"payout_{payout.id}"
    )

    db.commit()
    db.refresh(payout)

    return payout


# Admin endpoints

@router.get("/all", response_model=List[PayoutWithUser])
def get_all_payouts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    status_filter: str = None,
    limit: int = 100
):
    """
    Get all payouts (Admin only)
    """
    query = db.query(Payout)
    
    if status_filter:
        query = query.filter(Payout.status == status_filter)
    
    payouts = query.order_by(Payout.created_at.desc()).limit(limit).all()
    
    result = []
    for payout in payouts:
        user = db.query(User).filter(User.id == payout.user_id).first()
        
        # Count commissions in this payout
        commission_count = db.query(Commission).filter(
            Commission.payout_id == payout.id
        ).count()
        
        payout_data = {
            **payout.__dict__,
            'user_email': user.email if user else None,
            'user_name': user.full_name if user else None,
            'commission_count': commission_count
        }
        
        result.append(payout_data)
    
    return result


@router.post("/batch-create")
def create_batch_payouts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Create payout batch for all eligible users (Admin only)
    
    This should be run weekly
    """
    payouts = create_payout_batch(db)
    
    return {
        'message': f'Created {len(payouts)} payout records',
        'count': len(payouts),
        'payouts': [{'id': p.id, 'user_id': p.user_id, 'amount': p.amount} for p in payouts]
    }


@router.put("/{payout_id}/process", response_model=PayoutResponse)
def process_payout_endpoint(
    payout_id: int,
    payout_update: PayoutUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Mark a payout as completed (Admin only)
    """
    try:
        payout = process_payout(
            payout_id=payout_id,
            db=db,
            transaction_id=payout_update.transaction_id,
            payment_method=payout_update.payment_method
        )
        return payout
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.put("/{payout_id}/approve", response_model=PayoutResponse)
def approve_payout_endpoint(
    payout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Approve a payout (Admin only) — sets status to 'processing'.
    """
    payout = db.query(Payout).filter(Payout.id == payout_id).first()
    if not payout:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payout not found")

    # Set payout to processing; commissions already set to 'processing' at request time
    payout.status = 'processing'
    db.commit()
    db.refresh(payout)
    return payout


@router.put("/{payout_id}/cancel", response_model=PayoutResponse)
def cancel_payout_endpoint(
    payout_id: int,
    reason: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Cancel a payout (Admin only)
    """
    try:
        payout = cancel_payout(payout_id=payout_id, db=db, reason=reason)
        return payout
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/statistics")
def get_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get payout statistics (Admin only)
    """
    stats = get_payout_statistics(db)
    return stats


@router.get("/pending-users")
def get_pending_payout_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get users eligible for payout (Admin only)
    """
    pending_payouts = calculate_pending_payouts(db)
    
    result = []
    for payout_data in pending_payouts:
        user = db.query(User).filter(User.id == payout_data['user_id']).first()
        if user:
            result.append({
                'user_id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'pending_amount': payout_data['amount']
            })
    
    return result

