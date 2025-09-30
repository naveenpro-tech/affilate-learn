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


# ==================== COURSE MANAGEMENT ====================

@router.get("/courses")
def get_all_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    skip: int = 0,
    limit: int = 100
):
    """
    Get all courses for admin management
    """
    courses = db.query(Course).offset(skip).limit(limit).all()
    return courses


@router.post("/courses")
def create_course(
    title: str,
    description: str,
    package_tier: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Create a new course
    """
    course = Course(
        title=title,
        description=description,
        package_tier=package_tier,
        is_published=True
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.put("/courses/{course_id}")
def update_course(
    course_id: int,
    title: str = None,
    description: str = None,
    package_tier: str = None,
    is_published: bool = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Update a course
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    if title is not None:
        course.title = title
    if description is not None:
        course.description = description
    if package_tier is not None:
        course.package_tier = package_tier
    if is_published is not None:
        course.is_published = is_published

    db.commit()
    db.refresh(course)
    return course


@router.delete("/courses/{course_id}")
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Delete a course
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    db.delete(course)
    db.commit()
    return {"message": "Course deleted successfully"}


# ==================== PAYOUT MANAGEMENT ====================

@router.get("/payouts/pending")
def get_pending_payouts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get all pending payout requests
    """
    payouts = db.query(Payout).filter(
        Payout.status == 'pending'
    ).order_by(Payout.created_at.desc()).all()

    result = []
    for payout in payouts:
        user = db.query(User).filter(User.id == payout.user_id).first()
        result.append({
            'id': payout.id,
            'user_id': payout.user_id,
            'user_name': user.full_name if user else 'Unknown',
            'user_email': user.email if user else 'Unknown',
            'amount': payout.amount,
            'status': payout.status,
            'created_at': payout.created_at,
            'updated_at': payout.updated_at
        })

    return result


@router.get("/payouts/all")
def get_all_payouts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    skip: int = 0,
    limit: int = 100
):
    """
    Get all payouts with pagination
    """
    payouts = db.query(Payout).order_by(
        Payout.created_at.desc()
    ).offset(skip).limit(limit).all()

    result = []
    for payout in payouts:
        user = db.query(User).filter(User.id == payout.user_id).first()
        result.append({
            'id': payout.id,
            'user_id': payout.user_id,
            'user_name': user.full_name if user else 'Unknown',
            'user_email': user.email if user else 'Unknown',
            'amount': payout.amount,
            'status': payout.status,
            'created_at': payout.created_at,
            'updated_at': payout.updated_at,
            'processed_at': payout.processed_at
        })

    return result


@router.put("/payouts/{payout_id}/approve")
def approve_payout(
    payout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Approve a payout request
    """
    from datetime import datetime

    payout = db.query(Payout).filter(Payout.id == payout_id).first()
    if not payout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payout not found"
        )

    if payout.status != 'pending':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot approve payout with status: {payout.status}"
        )

    # Update payout status
    payout.status = 'processing'
    payout.processed_at = datetime.utcnow()

    # Update related commissions to 'paid'
    db.query(Commission).filter(
        Commission.user_id == payout.user_id,
        Commission.status == 'pending'
    ).update({'status': 'paid'})

    db.commit()
    db.refresh(payout)

    return {
        'id': payout.id,
        'status': payout.status,
        'message': 'Payout approved and processing'
    }


@router.put("/payouts/{payout_id}/reject")
def reject_payout(
    payout_id: int,
    reason: str = "Rejected by admin",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Reject a payout request
    """
    payout = db.query(Payout).filter(Payout.id == payout_id).first()
    if not payout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payout not found"
        )

    if payout.status != 'pending':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reject payout with status: {payout.status}"
        )

    payout.status = 'cancelled'
    db.commit()
    db.refresh(payout)

    return {
        'id': payout.id,
        'status': payout.status,
        'message': f'Payout rejected: {reason}'
    }


@router.put("/payouts/{payout_id}/complete")
def complete_payout(
    payout_id: int,
    transaction_id: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Mark a payout as completed
    """
    from datetime import datetime

    payout = db.query(Payout).filter(Payout.id == payout_id).first()
    if not payout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payout not found"
        )

    if payout.status not in ['pending', 'processing']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot complete payout with status: {payout.status}"
        )

    payout.status = 'completed'
    payout.processed_at = datetime.utcnow()

    db.commit()
    db.refresh(payout)

    return {
        'id': payout.id,
        'status': payout.status,
        'message': 'Payout completed successfully'
    }

