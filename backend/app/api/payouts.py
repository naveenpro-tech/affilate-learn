from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_admin_user
from app.models.user import User
from app.models.payout import Payout
from app.models.commission import Commission
from app.schemas.payout import (
    PayoutResponse, PayoutWithUser, PayoutRequest, PayoutUpdate
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


@router.post("/request", response_model=PayoutResponse)
def request_payout(
    payout_request: PayoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Request a payout (user must have pending commissions above minimum threshold)
    
    Note: In production, this would trigger an admin approval workflow
    """
    from sqlalchemy import func
    from app.core.config import settings
    
    # Calculate pending amount
    pending_amount = db.query(func.sum(Commission.amount)).filter(
        Commission.user_id == current_user.id,
        Commission.status == 'pending'
    ).scalar() or 0.0
    
    if pending_amount < settings.MINIMUM_PAYOUT_AMOUNT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum payout amount is ₹{settings.MINIMUM_PAYOUT_AMOUNT}"
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
    
    # Create payout record
    payout = Payout(
        user_id=current_user.id,
        amount=pending_amount,
        status='pending',
        bank_account_number=payout_request.bank_account_number,
        bank_ifsc=payout_request.bank_ifsc,
        upi_id=payout_request.upi_id
    )
    
    db.add(payout)
    db.flush()
    
    # Link pending commissions to payout
    pending_commissions = db.query(Commission).filter(
        Commission.user_id == current_user.id,
        Commission.status == 'pending'
    ).all()
    
    for commission in pending_commissions:
        commission.payout_id = payout.id
        commission.status = 'processing'
    
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

