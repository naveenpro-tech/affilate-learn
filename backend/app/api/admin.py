from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_admin_user
from app.models.user import User
from app.models.package import Package
from app.models.user_package import UserPackage
from app.models.payment import Payment
from app.models.referral import Referral
from app.models.commission import Commission
from app.models.payout import Payout
from app.models.course import Course
from app.models.video import Video

router = APIRouter()


@router.get("/dashboard")
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get admin dashboard statistics
    """
    # User statistics
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    
    # Package statistics
    total_packages_sold = db.query(UserPackage).filter(
        UserPackage.status == 'active'
    ).count()
    
    silver_count = db.query(UserPackage).join(Package).filter(
        Package.name == 'Silver',
        UserPackage.status == 'active'
    ).count()
    
    gold_count = db.query(UserPackage).join(Package).filter(
        Package.name == 'Gold',
        UserPackage.status == 'active'
    ).count()
    
    platinum_count = db.query(UserPackage).join(Package).filter(
        Package.name == 'Platinum',
        UserPackage.status == 'active'
    ).count()
    
    # Revenue statistics
    total_revenue = db.query(func.sum(Payment.amount)).filter(
        Payment.status == 'success'
    ).scalar() or 0.0
    
    # Commission statistics
    total_commissions = db.query(func.sum(Commission.amount)).scalar() or 0.0
    pending_commissions = db.query(func.sum(Commission.amount)).filter(
        Commission.status == 'pending'
    ).scalar() or 0.0
    paid_commissions = db.query(func.sum(Commission.amount)).filter(
        Commission.status == 'paid'
    ).scalar() or 0.0
    
    # Referral statistics
    total_referrals = db.query(Referral).count()
    level1_referrals = db.query(Referral).filter(Referral.level == 1).count()
    level2_referrals = db.query(Referral).filter(Referral.level == 2).count()
    
    # Payout statistics
    total_payouts = db.query(func.sum(Payout.amount)).filter(
        Payout.status == 'completed'
    ).scalar() or 0.0
    pending_payouts = db.query(func.sum(Payout.amount)).filter(
        Payout.status == 'pending'
    ).scalar() or 0.0
    
    # Content statistics
    total_courses = db.query(Course).count()
    published_courses = db.query(Course).filter(Course.is_published == True).count()
    total_videos = db.query(Video).count()
    published_videos = db.query(Video).filter(Video.is_published == True).count()
    
    return {
        'users': {
            'total': total_users,
            'active': active_users
        },
        'packages': {
            'total_sold': total_packages_sold,
            'silver': silver_count,
            'gold': gold_count,
            'platinum': platinum_count
        },
        'revenue': {
            'total': float(total_revenue),
            'net_profit': float(total_revenue - total_commissions)
        },
        'commissions': {
            'total': float(total_commissions),
            'pending': float(pending_commissions),
            'paid': float(paid_commissions)
        },
        'referrals': {
            'total': total_referrals,
            'level1': level1_referrals,
            'level2': level2_referrals
        },
        'payouts': {
            'total': float(total_payouts),
            'pending': float(pending_payouts)
        },
        'content': {
            'courses': total_courses,
            'published_courses': published_courses,
            'videos': total_videos,
            'published_videos': published_videos
        }
    }


@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    skip: int = 0,
    limit: int = 100
):
    """
    Get all users with their package information
    """
    users = db.query(User).offset(skip).limit(limit).all()
    
    result = []
    for user in users:
        # Get user's current package
        user_package = db.query(UserPackage).filter(
            UserPackage.user_id == user.id,
            UserPackage.status == 'active'
        ).order_by(UserPackage.purchase_date.desc()).first()
        
        package_name = None
        if user_package:
            package = db.query(Package).filter(Package.id == user_package.package_id).first()
            if package:
                package_name = package.name
        
        # Get referral stats
        direct_referrals = db.query(Referral).filter(
            Referral.referrer_id == user.id,
            Referral.level == 1
        ).count()
        
        # Get commission stats
        total_earnings = db.query(func.sum(Commission.amount)).filter(
            Commission.user_id == user.id
        ).scalar() or 0.0
        
        result.append({
            'id': user.id,
            'email': user.email,
            'full_name': user.full_name,
            'phone': user.phone,
            'referral_code': user.referral_code,
            'is_active': user.is_active,
            'is_admin': user.is_admin,
            'created_at': user.created_at,
            'current_package': package_name,
            'direct_referrals': direct_referrals,
            'total_earnings': float(total_earnings)
        })
    
    return result


@router.put("/users/{user_id}/toggle-active")
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Toggle user active status
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = not user.is_active
    db.commit()
    
    return {
        'user_id': user.id,
        'is_active': user.is_active
    }


@router.put("/users/{user_id}/toggle-admin")
def toggle_user_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Toggle user admin status
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_admin = not user.is_admin
    db.commit()
    
    return {
        'user_id': user.id,
        'is_admin': user.is_admin
    }


@router.get("/recent-activity")
def get_recent_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    limit: int = 20
):
    """
    Get recent platform activity
    """
    # Recent registrations
    recent_users = db.query(User).order_by(User.created_at.desc()).limit(5).all()
    
    # Recent purchases
    recent_purchases = db.query(Payment).filter(
        Payment.status == 'success'
    ).order_by(Payment.completed_at.desc()).limit(5).all()
    
    # Recent commissions
    recent_commissions = db.query(Commission).order_by(
        Commission.created_at.desc()
    ).limit(5).all()
    
    return {
        'recent_users': [
            {
                'id': u.id,
                'email': u.email,
                'full_name': u.full_name,
                'created_at': u.created_at
            } for u in recent_users
        ],
        'recent_purchases': [
            {
                'id': p.id,
                'user_id': p.user_id,
                'amount': p.amount,
                'completed_at': p.completed_at
            } for p in recent_purchases
        ],
        'recent_commissions': [
            {
                'id': c.id,
                'user_id': c.user_id,
                'amount': c.amount,
                'type': c.commission_type,
                'created_at': c.created_at
            } for c in recent_commissions
        ]
    }

