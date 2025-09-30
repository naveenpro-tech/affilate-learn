"""
Payout Service

Handles weekly payout calculations and processing
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Dict

from app.models.user import User
from app.models.commission import Commission
from app.models.payout import Payout
from app.core.config import settings


def calculate_pending_payouts(db: Session) -> List[Dict]:
    """
    Calculate pending payouts for all users with pending commissions
    
    Returns:
        List of dictionaries with user_id and pending amount
    """
    # Get users with pending commissions above minimum threshold
    results = db.query(
        Commission.user_id,
        func.sum(Commission.amount).label('total_amount')
    ).filter(
        Commission.status == 'pending'
    ).group_by(
        Commission.user_id
    ).having(
        func.sum(Commission.amount) >= settings.MINIMUM_PAYOUT_AMOUNT
    ).all()
    
    payouts = []
    for user_id, total_amount in results:
        payouts.append({
            'user_id': user_id,
            'amount': float(total_amount)
        })
    
    return payouts


def create_payout_batch(db: Session) -> List[Payout]:
    """
    Create payout records for all eligible users
    
    This should be run weekly (e.g., every Monday)
    
    Returns:
        List of created payout records
    """
    pending_payouts = calculate_pending_payouts(db)
    
    created_payouts = []
    for payout_data in pending_payouts:
        user_id = payout_data['user_id']
        amount = payout_data['amount']
        
        # Get pending commissions for this user
        pending_commissions = db.query(Commission).filter(
            Commission.user_id == user_id,
            Commission.status == 'pending'
        ).all()
        
        # Create payout record
        payout = Payout(
            user_id=user_id,
            amount=amount,
            status='pending',
            payout_date=datetime.utcnow()
        )
        
        db.add(payout)
        db.flush()  # Get payout ID
        
        # Link commissions to payout
        for commission in pending_commissions:
            commission.payout_id = payout.id
            commission.status = 'processing'
        
        created_payouts.append(payout)
    
    db.commit()
    
    return created_payouts


def process_payout(payout_id: int, db: Session, transaction_id: str = None, payment_method: str = None) -> Payout:
    """
    Mark a payout as completed
    
    Args:
        payout_id: Payout ID
        db: Database session
        transaction_id: Transaction ID from payment gateway
        payment_method: Payment method used
        
    Returns:
        Updated payout record
    """
    payout = db.query(Payout).filter(Payout.id == payout_id).first()
    if not payout:
        raise ValueError("Payout not found")
    
    # Update payout status
    payout.status = 'completed'
    payout.completed_at = datetime.utcnow()
    
    if transaction_id:
        payout.transaction_id = transaction_id
    
    if payment_method:
        payout.payment_method = payment_method
    
    # Update associated commissions
    commissions = db.query(Commission).filter(
        Commission.payout_id == payout_id
    ).all()
    
    for commission in commissions:
        commission.status = 'paid'
        commission.paid_at = datetime.utcnow()
    
    db.commit()
    db.refresh(payout)
    
    return payout


def cancel_payout(payout_id: int, db: Session, reason: str = None) -> Payout:
    """
    Cancel a payout and reset commissions to pending
    
    Args:
        payout_id: Payout ID
        db: Database session
        reason: Reason for cancellation
        
    Returns:
        Updated payout record
    """
    payout = db.query(Payout).filter(Payout.id == payout_id).first()
    if not payout:
        raise ValueError("Payout not found")
    
    # Update payout status
    payout.status = 'failed'
    if reason:
        payout.notes = reason
    
    # Reset associated commissions to pending
    commissions = db.query(Commission).filter(
        Commission.payout_id == payout_id
    ).all()
    
    for commission in commissions:
        commission.status = 'pending'
        commission.payout_id = None
    
    db.commit()
    db.refresh(payout)
    
    return payout


def get_user_payout_history(user_id: int, db: Session) -> List[Payout]:
    """
    Get payout history for a user
    
    Args:
        user_id: User ID
        db: Database session
        
    Returns:
        List of payout records
    """
    payouts = db.query(Payout).filter(
        Payout.user_id == user_id
    ).order_by(Payout.created_at.desc()).all()
    
    return payouts


def get_payout_statistics(db: Session) -> Dict:
    """
    Get overall payout statistics
    
    Returns:
        Dictionary with payout statistics
    """
    # Total payouts
    total_payouts = db.query(func.sum(Payout.amount)).filter(
        Payout.status == 'completed'
    ).scalar() or 0.0
    
    # Pending payouts
    pending_payouts = db.query(func.sum(Payout.amount)).filter(
        Payout.status == 'pending'
    ).scalar() or 0.0
    
    # Processing payouts
    processing_payouts = db.query(func.sum(Payout.amount)).filter(
        Payout.status == 'processing'
    ).scalar() or 0.0
    
    # Count of payouts
    total_count = db.query(Payout).filter(
        Payout.status == 'completed'
    ).count()
    
    pending_count = db.query(Payout).filter(
        Payout.status == 'pending'
    ).count()
    
    return {
        'total_payouts': float(total_payouts),
        'pending_payouts': float(pending_payouts),
        'processing_payouts': float(processing_payouts),
        'total_count': total_count,
        'pending_count': pending_count
    }

