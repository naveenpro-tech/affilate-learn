from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_admin_user
from app.models.user import User
from app.models.commission import Commission
from app.models.referral import Referral
from app.models.package import Package
from app.schemas.commission import CommissionResponse, CommissionWithDetails, CommissionSummary

router = APIRouter()


@router.get("/my-commissions", response_model=List[CommissionWithDetails])
def get_my_commissions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    status_filter: str = None
):
    """
    Get current user's commissions with details
    
    Query params:
    - status_filter: Filter by status (pending, paid, cancelled)
    """
    query = db.query(Commission).filter(Commission.user_id == current_user.id)
    
    if status_filter:
        query = query.filter(Commission.status == status_filter)
    
    commissions = query.order_by(Commission.created_at.desc()).all()
    
    result = []
    for commission in commissions:
        # Get referral details
        referral = db.query(Referral).filter(Referral.id == commission.referral_id).first()
        
        commission_data = {
            "id": commission.id,
            "user_id": commission.user_id,
            "referral_id": commission.referral_id,
            "amount": commission.amount,
            "commission_type": commission.commission_type,
            "status": commission.status,
            "created_at": commission.created_at,
            "paid_at": commission.paid_at,
            "referee_email": None,
            "referee_name": None,
            "package_name": None,
            "level": None
        }
        
        if referral:
            # Get referee details
            referee = db.query(User).filter(User.id == referral.referee_id).first()
            if referee:
                commission_data["referee_email"] = referee.email
                commission_data["referee_name"] = referee.full_name
            
            # Get package details
            package = db.query(Package).filter(Package.id == referral.package_id).first()
            if package:
                commission_data["package_name"] = package.name
            
            commission_data["level"] = referral.level
        
        result.append(commission_data)
    
    return result


@router.get("/summary", response_model=CommissionSummary)
def get_commission_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get commission summary for current user
    """
    from sqlalchemy import func
    
    # Total commissions
    total = db.query(func.sum(Commission.amount)).filter(
        Commission.user_id == current_user.id
    ).scalar() or 0.0
    
    # Pending commissions
    pending = db.query(func.sum(Commission.amount)).filter(
        Commission.user_id == current_user.id,
        Commission.status == "pending"
    ).scalar() or 0.0
    
    # Paid commissions
    paid = db.query(func.sum(Commission.amount)).filter(
        Commission.user_id == current_user.id,
        Commission.status == "paid"
    ).scalar() or 0.0
    
    # Level 1 commissions
    level1 = db.query(func.sum(Commission.amount)).filter(
        Commission.user_id == current_user.id,
        Commission.commission_type == "level1"
    ).scalar() or 0.0
    
    # Level 2 commissions
    level2 = db.query(func.sum(Commission.amount)).filter(
        Commission.user_id == current_user.id,
        Commission.commission_type == "level2"
    ).scalar() or 0.0
    
    # Counts
    total_count = db.query(Commission).filter(
        Commission.user_id == current_user.id
    ).count()
    
    pending_count = db.query(Commission).filter(
        Commission.user_id == current_user.id,
        Commission.status == "pending"
    ).count()
    
    paid_count = db.query(Commission).filter(
        Commission.user_id == current_user.id,
        Commission.status == "paid"
    ).count()
    
    return {
        "total_commissions": float(total),
        "pending_commissions": float(pending),
        "paid_commissions": float(paid),
        "level1_commissions": float(level1),
        "level2_commissions": float(level2),
        "total_count": total_count,
        "pending_count": pending_count,
        "paid_count": paid_count
    }


@router.get("/all", response_model=List[CommissionWithDetails])
def get_all_commissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    status_filter: str = None,
    limit: int = 100
):
    """
    Get all commissions (Admin only)
    
    Query params:
    - status_filter: Filter by status
    - limit: Maximum number of records to return
    """
    query = db.query(Commission)
    
    if status_filter:
        query = query.filter(Commission.status == status_filter)
    
    commissions = query.order_by(Commission.created_at.desc()).limit(limit).all()
    
    result = []
    for commission in commissions:
        referral = db.query(Referral).filter(Referral.id == commission.referral_id).first()
        
        commission_data = {
            "id": commission.id,
            "user_id": commission.user_id,
            "referral_id": commission.referral_id,
            "amount": commission.amount,
            "commission_type": commission.commission_type,
            "status": commission.status,
            "created_at": commission.created_at,
            "paid_at": commission.paid_at,
            "referee_email": None,
            "referee_name": None,
            "package_name": None,
            "level": None
        }
        
        if referral:
            referee = db.query(User).filter(User.id == referral.referee_id).first()
            if referee:
                commission_data["referee_email"] = referee.email
                commission_data["referee_name"] = referee.full_name
            
            package = db.query(Package).filter(Package.id == referral.package_id).first()
            if package:
                commission_data["package_name"] = package.name
            
            commission_data["level"] = referral.level
        
        result.append(commission_data)
    
    return result

