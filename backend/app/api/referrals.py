from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.referral import Referral
from app.models.package import Package
from app.schemas.referral import ReferralResponse, ReferralWithDetails
from app.services.referral_service import get_referral_tree

router = APIRouter()


@router.get("/my-referrals", response_model=List[ReferralWithDetails])
def get_my_referrals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's referrals with details
    Shows ALL users referred by current user, regardless of purchase status
    """
    # Get all users referred by current user (from users.referred_by_id)
    referred_users = db.query(User).filter(
        User.referred_by_id == current_user.id
    ).order_by(User.created_at.desc()).all()

    result = []
    for referee in referred_users:
        # Check if they have purchased a package
        from app.models.user_package import UserPackage
        user_package = db.query(UserPackage).filter(
            UserPackage.user_id == referee.id,
            UserPackage.status == "active"
        ).order_by(UserPackage.purchase_date.desc()).first()

        # Get package details if they have one
        package = None
        if user_package:
            package = db.query(Package).filter(Package.id == user_package.package_id).first()

        # Get referral record if exists (created after purchase)
        referral = db.query(Referral).filter(
            Referral.referrer_id == current_user.id,
            Referral.referee_id == referee.id
        ).first()

        # Get commission amount if referral exists
        commission_amount = None
        if referral:
            from app.models.commission import Commission
            commission = db.query(Commission).filter(
                Commission.referral_id == referral.id
            ).first()
            commission_amount = commission.amount if commission else None

        referral_data = {
            "id": referral.id if referral else referee.id,  # Use referee.id if no referral record yet
            "referrer_id": current_user.id,
            "referee_id": referee.id,
            "level": referral.level if referral else 1,  # Default to level 1
            "package_id": user_package.package_id if user_package else None,
            "created_at": referral.created_at if referral else referee.created_at,
            "referee_email": referee.email,
            "referee_name": referee.full_name,
            "package_name": package.name if package else "No Package",
            "commission_amount": commission_amount
        }

        result.append(referral_data)

    return result


@router.get("/tree")
def get_my_referral_tree(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get referral tree for current user
    """
    tree = get_referral_tree(current_user.id, db)
    return tree


@router.get("/stats")
def get_referral_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed referral statistics
    Shows ALL referred users, not just those who purchased
    """
    # Count all users directly referred by current user (Level 1)
    level1_count = db.query(User).filter(
        User.referred_by_id == current_user.id
    ).count()

    # Count indirect referrals (Level 2)
    # Get all direct referrals first
    direct_referrals = db.query(User).filter(
        User.referred_by_id == current_user.id
    ).all()

    level2_count = 0
    for direct_ref in direct_referrals:
        # Count users referred by each direct referral
        indirect_count = db.query(User).filter(
            User.referred_by_id == direct_ref.id
        ).count()
        level2_count += indirect_count

    # Get package breakdown (only for users who purchased)
    from sqlalchemy import func
    from app.models.user_package import UserPackage

    # Get all referred users with their packages
    referred_users = db.query(User).filter(
        User.referred_by_id == current_user.id
    ).all()

    breakdown = {}
    for referee in referred_users:
        user_package = db.query(UserPackage).filter(
            UserPackage.user_id == referee.id,
            UserPackage.status == "active"
        ).order_by(UserPackage.purchase_date.desc()).first()

        if user_package:
            package = db.query(Package).filter(Package.id == user_package.package_id).first()
            if package:
                if package.name not in breakdown:
                    breakdown[package.name] = {"level1": 0, "level2": 0}
                breakdown[package.name]["level1"] += 1

    return {
        "total_referrals": level1_count + level2_count,
        "level1_referrals": level1_count,
        "level2_referrals": level2_count,
        "package_breakdown": breakdown
    }

