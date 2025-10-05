from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db, engine
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.wallet import Wallet, WalletTransaction, TransactionType, TransactionSource
from app.schemas.wallet import (
    WalletResponse,
    WalletTransactionResponse,
    WalletWithTransactions,
    WalletStats
)

router = APIRouter()

def get_or_create_wallet(db: Session, user_id: int) -> Wallet:
    """Get user's wallet or create if doesn't exist"""
    Wallet.__table__.create(bind=engine, checkfirst=True)
    WalletTransaction.__table__.create(bind=engine, checkfirst=True)
    
    wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
    if not wallet:
        wallet = Wallet(user_id=user_id, balance=0.0, total_earned=0.0, total_withdrawn=0.0, total_spent=0.0)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    return wallet

def create_transaction(
    db: Session,
    wallet: Wallet,
    transaction_type: TransactionType,
    source: TransactionSource,
    amount: float,
    description: str,
    reference_id: str = None
) -> WalletTransaction:
    """Create a wallet transaction"""
    balance_before = wallet.balance
    
    if transaction_type == TransactionType.CREDIT:
        wallet.balance += amount
        if source == TransactionSource.COMMISSION:
            wallet.total_earned += amount
    else:  # DEBIT
        if wallet.balance < amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient wallet balance"
            )
        wallet.balance -= amount
        if source == TransactionSource.PAYOUT:
            wallet.total_withdrawn += amount
        elif source == TransactionSource.PURCHASE:
            wallet.total_spent += amount
    
    balance_after = wallet.balance
    
    transaction = WalletTransaction(
        wallet_id=wallet.id,
        type=transaction_type,
        source=source,
        amount=amount,
        balance_before=balance_before,
        balance_after=balance_after,
        description=description,
        reference_id=reference_id
    )
    
    db.add(transaction)
    wallet.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(wallet)
    db.refresh(transaction)
    
    return transaction

@router.get("/", response_model=WalletResponse)
def get_wallet(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's wallet"""
    wallet = get_or_create_wallet(db, current_user.id)
    return wallet

@router.get("/stats", response_model=WalletStats)
def get_wallet_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get wallet statistics"""
    wallet = get_or_create_wallet(db, current_user.id)
    
    # Count recent transactions (last 30 days)
    from datetime import timedelta
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_count = db.query(WalletTransaction).filter(
        WalletTransaction.wallet_id == wallet.id,
        WalletTransaction.created_at >= thirty_days_ago
    ).count()
    
    return {
        "balance": wallet.balance,
        "total_earned": wallet.total_earned,
        "total_withdrawn": wallet.total_withdrawn,
        "total_spent": wallet.total_spent,
        "available_for_withdrawal": wallet.balance,
        "recent_transactions_count": recent_count
    }

@router.get("/transactions", response_model=List[WalletTransactionResponse])
def get_transactions(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get wallet transactions"""
    wallet = get_or_create_wallet(db, current_user.id)
    
    transactions = db.query(WalletTransaction).filter(
        WalletTransaction.wallet_id == wallet.id
    ).order_by(WalletTransaction.created_at.desc()).offset(skip).limit(limit).all()
    
    return transactions

@router.get("/with-transactions", response_model=WalletWithTransactions)
def get_wallet_with_transactions(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get wallet with recent transactions"""
    wallet = get_or_create_wallet(db, current_user.id)
    
    transactions = db.query(WalletTransaction).filter(
        WalletTransaction.wallet_id == wallet.id
    ).order_by(WalletTransaction.created_at.desc()).limit(limit).all()
    
    return {
        **wallet.__dict__,
        "transactions": transactions
    }

@router.post("/credit")
def credit_wallet(
    amount: float,
    description: str,
    source: str = "admin",
    reference_id: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Credit wallet (admin only or internal use)"""
    if not current_user.is_admin and source != "commission":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to credit wallet"
        )
    
    wallet = get_or_create_wallet(db, current_user.id)
    
    try:
        source_enum = TransactionSource(source)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid source: {source}"
        )
    
    transaction = create_transaction(
        db, wallet, TransactionType.CREDIT, source_enum,
        amount, description, reference_id
    )
    
    return {
        "message": "Wallet credited successfully",
        "transaction": transaction,
        "new_balance": wallet.balance
    }

@router.post("/debit")
def debit_wallet(
    amount: float,
    description: str,
    source: str = "purchase",
    reference_id: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Debit wallet"""
    wallet = get_or_create_wallet(db, current_user.id)
    
    try:
        source_enum = TransactionSource(source)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid source: {source}"
        )
    
    transaction = create_transaction(
        db, wallet, TransactionType.DEBIT, source_enum,
        amount, description, reference_id
    )
    
    return {
        "message": "Wallet debited successfully",
        "transaction": transaction,
        "new_balance": wallet.balance
    }

@router.post("/withdraw")
def withdraw_from_wallet(
    amount: float,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Withdraw money from wallet to bank account"""
    wallet = get_or_create_wallet(db, current_user.id)
    
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be greater than 0"
        )
    
    if amount < 500:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Minimum withdrawal amount is ₹500"
        )
    
    if wallet.balance < amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient balance. Available: ₹{wallet.balance}"
        )
    
    # Create payout request
    from app.models.payout import Payout
    payout = Payout(
        user_id=current_user.id,
        amount=amount,
        status="pending"
    )
    db.add(payout)
    db.commit()
    db.refresh(payout)
    
    # Debit wallet
    transaction = create_transaction(
        db, wallet, TransactionType.DEBIT, TransactionSource.PAYOUT,
        amount, f"Withdrawal to bank account (Payout #{payout.id})",
        f"payout_{payout.id}"
    )
    
    return {
        "message": "Withdrawal request created successfully",
        "payout_id": payout.id,
        "amount": amount,
        "new_balance": wallet.balance,
        "transaction": transaction
    }

# Helper function for internal use
def credit_wallet_internal(
    db: Session,
    user_id: int,
    amount: float,
    source: TransactionSource,
    description: str,
    reference_id: str = None
):
    """Internal helper to credit wallet"""
    wallet = get_or_create_wallet(db, user_id)
    return create_transaction(
        db, wallet, TransactionType.CREDIT, source,
        amount, description, reference_id
    )

def debit_wallet_internal(
    db: Session,
    user_id: int,
    amount: float,
    source: TransactionSource,
    description: str,
    reference_id: str = None
):
    """Internal helper to debit wallet"""
    wallet = get_or_create_wallet(db, user_id)
    return create_transaction(
        db, wallet, TransactionType.DEBIT, source,
        amount, description, reference_id
    )

