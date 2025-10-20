from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import os
import uuid
from pathlib import Path

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
from app.models.studio import ImageCategory, ImageTemplate, GeneratedImage, CommunityPost, PostReport
from app.schemas.studio import (
    ImageCategoryCreate, ImageCategoryUpdate, ImageCategoryResponse,
    ImageTemplateCreate, ImageTemplateUpdate, ImageTemplateResponse,
)

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

    # Studio statistics
    total_images = db.query(GeneratedImage).count()
    successful_images = db.query(GeneratedImage).filter(GeneratedImage.status == 'succeeded').count()
    total_posts = db.query(CommunityPost).count()
    public_posts = db.query(CommunityPost).filter(CommunityPost.visibility == 'public').count()
    total_likes = db.query(func.sum(CommunityPost.likes_count)).scalar() or 0
    total_reports = db.query(PostReport).count()
    pending_reports = db.query(PostReport).filter(PostReport.status == 'pending').count()

    # Studio revenue (credits purchased)
    from app.models.studio import CreditLedger
    credits_purchased = db.query(func.sum(CreditLedger.amount)).filter(
        CreditLedger.transaction_type == 'purchase'
    ).scalar() or 0
    credits_spent = db.query(func.sum(CreditLedger.amount)).filter(
        CreditLedger.transaction_type == 'generation'
    ).scalar() or 0

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
        },
        'studio': {
            'total_images': total_images,
            'successful_images': successful_images,
            'total_posts': total_posts,
            'public_posts': public_posts,
            'total_likes': total_likes,
            'total_reports': total_reports,
            'pending_reports': pending_reports,
            'credits_purchased': credits_purchased,
            'credits_spent': abs(credits_spent),
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

    Note: This endpoint auto-generates slug and maps package_tier to package_id
    """
    import re

    # Generate slug from title
    slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')

    # Check if slug exists, if so, append a number
    existing_count = db.query(Course).filter(Course.slug.like(f"{slug}%")).count()
    if existing_count > 0:
        slug = f"{slug}-{existing_count + 1}"

    # Map package_tier to package_id
    package_tier_map = {
        'silver': 1,
        'gold': 2,
        'platinum': 3
    }

    package_id = package_tier_map.get(package_tier.lower())
    if not package_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid package_tier: {package_tier}. Must be silver, gold, or platinum"
        )

    # Verify package exists
    package = db.query(Package).filter(Package.id == package_id).first()
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Package with id {package_id} not found"
        )

    course = Course(
        title=title,
        slug=slug,
        description=description,
        package_id=package_id,
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
            'completed_at': payout.completed_at
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
            'completed_at': payout.completed_at,
            'transaction_id': payout.transaction_id
        })

    return result


@router.put("/payouts/{payout_id}/approve")
def approve_payout(
    payout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Approve a payout request (change status from pending to processing)
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
            detail=f"Cannot approve payout with status: {payout.status}"
        )

    payout.status = 'processing'
    db.commit()
    db.refresh(payout)

    return payout


@router.put("/payouts/{payout_id}/reject")
def reject_payout(
    payout_id: int,
    reason: str = None,
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

    if payout.status not in ['pending', 'processing']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reject payout with status: {payout.status}"
        )

    payout.status = 'failed'
    if reason:
        payout.notes = reason

    # Revert commissions back to pending
    commissions = db.query(Commission).filter(
        Commission.payout_id == payout_id
    ).all()

    for commission in commissions:
        commission.status = 'pending'
        commission.payout_id = None

    db.commit()
    db.refresh(payout)

    return payout


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
    payout.completed_at = datetime.utcnow()

    if transaction_id:
        payout.transaction_id = transaction_id

    # Mark commissions as paid
    commissions = db.query(Commission).filter(
        Commission.payout_id == payout_id
    ).all()

    for commission in commissions:
        commission.status = 'paid'

    db.commit()
    db.refresh(payout)

    return payout


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


# ============================================================================
# ADMIN STUDIO MANAGEMENT
# ============================================================================

@router.get("/studio/stats")
def get_studio_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get studio usage statistics"""
    total_images = db.query(GeneratedImage).count()
    succeeded_images = db.query(GeneratedImage).filter(
        GeneratedImage.status == 'succeeded'
    ).count()
    failed_images = db.query(GeneratedImage).filter(
        GeneratedImage.status == 'failed'
    ).count()

    total_templates = db.query(ImageTemplate).count()
    active_templates = db.query(ImageTemplate).filter(
        ImageTemplate.is_active == True
    ).count()

    total_categories = db.query(ImageCategory).count()
    active_categories = db.query(ImageCategory).filter(
        ImageCategory.is_active == True
    ).count()

    # Get recent generations
    recent_generations = db.query(GeneratedImage).order_by(
        GeneratedImage.created_at.desc()
    ).limit(10).all()

    return {
        'total_images': total_images,
        'succeeded_images': succeeded_images,
        'failed_images': failed_images,
        'total_templates': total_templates,
        'active_templates': active_templates,
        'total_categories': total_categories,
        'active_categories': active_categories,
        'recent_generations': [
            {
                'id': img.id,
                'user_id': img.user_id,
                'prompt': img.prompt_text[:50] + '...' if len(img.prompt_text) > 50 else img.prompt_text,
                'provider': img.provider,
                'status': img.status,
                'credits_spent': img.credits_spent,
                'created_at': img.created_at.isoformat()
            }
            for img in recent_generations
        ]
    }


# Categories Management
@router.post("/studio/categories", response_model=ImageCategoryResponse)
def create_category(
    category: ImageCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new image category"""
    # Check if category name already exists
    existing = db.query(ImageCategory).filter(
        ImageCategory.name == category.name
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists"
        )

    db_category = ImageCategory(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)

    return db_category


@router.put("/studio/categories/{category_id}", response_model=ImageCategoryResponse)
def update_category(
    category_id: int,
    category: ImageCategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update an image category"""
    db_category = db.query(ImageCategory).filter(
        ImageCategory.id == category_id
    ).first()

    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    # Update only provided fields
    update_data = category.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_category, field, value)

    db.commit()
    db.refresh(db_category)

    return db_category


@router.delete("/studio/categories/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Deactivate a category (soft delete)"""
    db_category = db.query(ImageCategory).filter(
        ImageCategory.id == category_id
    ).first()

    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    db_category.is_active = False
    db.commit()

    return {"message": "Category deactivated successfully"}


# Templates Management
@router.post("/studio/templates", response_model=ImageTemplateResponse)
def create_template(
    template: ImageTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new image template"""
    # Verify category exists
    category = db.query(ImageCategory).filter(
        ImageCategory.id == template.category_id
    ).first()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    db_template = ImageTemplate(
        **template.dict(),
        created_by=current_user.id
    )
    db.add(db_template)
    db.commit()
    db.refresh(db_template)

    # Enrich with category name
    db_template.category_name = category.name

    return db_template


@router.put("/studio/templates/{template_id}", response_model=ImageTemplateResponse)
def update_template(
    template_id: int,
    template: ImageTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update an image template"""
    db_template = db.query(ImageTemplate).filter(
        ImageTemplate.id == template_id
    ).first()

    if not db_template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )

    # Update only provided fields
    update_data = template.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_template, field, value)

    db.commit()
    db.refresh(db_template)

    # Enrich with category name
    if db_template.category:
        db_template.category_name = db_template.category.name

    return db_template


@router.delete("/studio/templates/{template_id}")
def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Deactivate a template (soft delete)"""
    db_template = db.query(ImageTemplate).filter(
        ImageTemplate.id == template_id
    ).first()

    if not db_template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )

    db_template.is_active = False
    db.commit()

    return {"message": "Template deactivated successfully"}


@router.post("/studio/upload-thumbnail")
async def upload_thumbnail(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin_user)
):
    """Upload a thumbnail image for templates"""
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )

    # Validate file size (max 5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size must be less than 5MB"
        )

    # Create thumbnails directory if it doesn't exist
    thumbnails_dir = Path("app/static/thumbnails")
    thumbnails_dir.mkdir(parents=True, exist_ok=True)

    # Generate unique filename
    file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = thumbnails_dir / unique_filename

    # Save file
    with open(file_path, 'wb') as f:
        f.write(contents)

    # Return URL
    url = f"/static/thumbnails/{unique_filename}"
    return {"url": url}


# ============================================================================
# ADMIN MODERATION PANEL
# ============================================================================

@router.get("/studio/moderation/reports")
def get_all_reports(
    status_filter: str = None,  # open, closed, resolved, all
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get all reported posts with filtering"""
    query = db.query(PostReport).join(CommunityPost).join(User, PostReport.user_id == User.id)

    if status_filter and status_filter != 'all':
        query = query.filter(PostReport.status == status_filter)

    total = query.count()
    reports = query.order_by(PostReport.created_at.desc()).offset(skip).limit(limit).all()

    # Enrich with post and user data
    items = []
    for report in reports:
        post = report.post
        reporter = report.reporter
        admin = report.admin if report.acted_by else None

        items.append({
            'id': report.id,
            'post_id': report.post_id,
            'post_title': post.title if post else None,
            'post_image_url': post.image_url if post else None,
            'post_is_hidden': post.is_hidden if post else False,
            'reporter_id': report.user_id,
            'reporter_name': reporter.name if reporter else 'Unknown',
            'reason': report.reason,
            'description': report.description,
            'status': report.status,
            'action_taken': report.action_taken,
            'acted_by_name': admin.name if admin else None,
            'created_at': report.created_at.isoformat(),
            'updated_at': report.updated_at.isoformat(),
        })

    return {
        'items': items,
        'total': total,
        'skip': skip,
        'limit': limit
    }


@router.get("/studio/moderation/stats")
def get_moderation_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get moderation statistics"""
    total_reports = db.query(PostReport).count()
    open_reports = db.query(PostReport).filter(PostReport.status == 'open').count()
    closed_reports = db.query(PostReport).filter(PostReport.status == 'closed').count()
    resolved_reports = db.query(PostReport).filter(PostReport.status == 'resolved').count()
    hidden_posts = db.query(CommunityPost).filter(CommunityPost.is_hidden == True).count()

    return {
        'total_reports': total_reports,
        'open_reports': open_reports,
        'closed_reports': closed_reports,
        'resolved_reports': resolved_reports,
        'hidden_posts': hidden_posts
    }


@router.post("/studio/moderation/posts/{post_id}/hide")
def hide_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Hide a community post"""
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.is_hidden = True
    db.commit()

    return {"message": "Post hidden successfully", "post_id": post_id}


@router.post("/studio/moderation/posts/{post_id}/unhide")
def unhide_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Unhide a community post"""
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.is_hidden = False
    db.commit()

    return {"message": "Post unhidden successfully", "post_id": post_id}


@router.delete("/studio/moderation/posts/{post_id}")
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a community post permanently"""
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    db.delete(post)
    db.commit()

    return {"message": "Post deleted successfully", "post_id": post_id}


@router.put("/studio/moderation/reports/{report_id}/resolve")
def resolve_report(
    report_id: int,
    action_taken: str,  # hide, delete, warn, no_action
    notes: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Resolve a report with action"""
    report = db.query(PostReport).filter(PostReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report.status = 'resolved'
    report.action_taken = action_taken
    report.acted_by = current_user.id
    report.updated_at = datetime.utcnow()

    db.commit()

    return {
        "message": "Report resolved successfully",
        "report_id": report_id,
        "action_taken": action_taken
    }


@router.put("/studio/moderation/reports/{report_id}/close")
def close_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Close a report without action"""
    report = db.query(PostReport).filter(PostReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report.status = 'closed'
    report.acted_by = current_user.id
    report.updated_at = datetime.utcnow()

    db.commit()

    return {"message": "Report closed successfully", "report_id": report_id}

