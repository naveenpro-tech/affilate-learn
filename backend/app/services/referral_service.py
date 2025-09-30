"""
Referral Service

Handles referral tracking and commission creation when a user purchases a package
"""
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.package import Package
from app.models.user_package import UserPackage
from app.models.referral import Referral
from app.models.commission import Commission
from app.services.commission_calculator import calculate_commission


def process_referral_commissions(user_id: int, package_id: int, db: Session):
    """
    Process referral commissions when a user purchases a package
    
    This function:
    1. Identifies the user's referrer (level 1)
    2. Identifies the referrer's referrer (level 2)
    3. Gets the referrer's current package
    4. Calculates commissions based on the matrix
    5. Creates referral and commission records
    
    Args:
        user_id: ID of the user who made the purchase
        package_id: ID of the package purchased
        db: Database session
    """
    # Get the user who made the purchase
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.referred_by_id:
        # User was not referred by anyone
        return
    
    # Get the package purchased
    purchased_package = db.query(Package).filter(Package.id == package_id).first()
    if not purchased_package:
        return
    
    # Process Level 1 (Direct) Referral
    level_1_referrer = db.query(User).filter(User.id == user.referred_by_id).first()
    if level_1_referrer:
        process_level_1_commission(
            referrer=level_1_referrer,
            referee=user,
            purchased_package=purchased_package,
            db=db
        )
        
        # Process Level 2 (Indirect) Referral
        if level_1_referrer.referred_by_id:
            level_2_referrer = db.query(User).filter(User.id == level_1_referrer.referred_by_id).first()
            if level_2_referrer:
                process_level_2_commission(
                    referrer=level_2_referrer,
                    referee=user,
                    purchased_package=purchased_package,
                    db=db
                )


def process_level_1_commission(
    referrer: User,
    referee: User,
    purchased_package: Package,
    db: Session
):
    """
    Process level 1 (direct) referral commission
    
    Args:
        referrer: User who referred the buyer
        referee: User who made the purchase
        purchased_package: Package that was purchased
        db: Database session
    """
    # Get referrer's current package
    referrer_package = get_user_current_package(referrer.id, db)
    if not referrer_package:
        # Referrer doesn't have a package yet, no commission
        return
    
    # Calculate commission
    try:
        commission_amount = calculate_commission(
            referrer_package=referrer_package.name,
            referee_package=purchased_package.name,
            level=1
        )
    except ValueError as e:
        print(f"Error calculating level 1 commission: {e}")
        return
    
    # Create referral record
    referral = Referral(
        referrer_id=referrer.id,
        referee_id=referee.id,
        level=1,
        package_id=purchased_package.id
    )
    db.add(referral)
    db.flush()  # Get referral ID
    
    # Create commission record
    commission = Commission(
        user_id=referrer.id,
        referral_id=referral.id,
        amount=commission_amount,
        commission_type="level1",
        status="pending"
    )
    db.add(commission)
    db.commit()
    
    print(f"Level 1 commission created: ₹{commission_amount} for user {referrer.id}")


def process_level_2_commission(
    referrer: User,
    referee: User,
    purchased_package: Package,
    db: Session
):
    """
    Process level 2 (indirect) referral commission
    
    Args:
        referrer: User who referred the person who referred the buyer
        referee: User who made the purchase
        purchased_package: Package that was purchased
        db: Database session
    """
    # Get referrer's current package
    referrer_package = get_user_current_package(referrer.id, db)
    if not referrer_package:
        # Referrer doesn't have a package yet, no commission
        return
    
    # Calculate commission
    try:
        commission_amount = calculate_commission(
            referrer_package=referrer_package.name,
            referee_package=purchased_package.name,
            level=2
        )
    except ValueError as e:
        print(f"Error calculating level 2 commission: {e}")
        return
    
    # Create referral record
    referral = Referral(
        referrer_id=referrer.id,
        referee_id=referee.id,
        level=2,
        package_id=purchased_package.id
    )
    db.add(referral)
    db.flush()  # Get referral ID
    
    # Create commission record
    commission = Commission(
        user_id=referrer.id,
        referral_id=referral.id,
        amount=commission_amount,
        commission_type="level2",
        status="pending"
    )
    db.add(commission)
    db.commit()
    
    print(f"Level 2 commission created: ₹{commission_amount} for user {referrer.id}")


def get_user_current_package(user_id: int, db: Session) -> Package:
    """
    Get user's current active package
    
    Args:
        user_id: User ID
        db: Database session
        
    Returns:
        Package object or None
    """
    user_package = db.query(UserPackage).filter(
        UserPackage.user_id == user_id,
        UserPackage.status == "active"
    ).order_by(UserPackage.purchase_date.desc()).first()
    
    if not user_package:
        return None
    
    package = db.query(Package).filter(Package.id == user_package.package_id).first()
    return package


def get_referral_tree(user_id: int, db: Session, max_depth: int = 2) -> dict:
    """
    Get referral tree for a user
    
    Args:
        user_id: User ID
        db: Database session
        max_depth: Maximum depth to traverse (default: 2 for 2-level system)
        
    Returns:
        Dictionary with referral tree structure
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    tree = {
        "user_id": user.id,
        "email": user.email,
        "referral_code": user.referral_code,
        "direct_referrals": []
    }
    
    # Get direct referrals (level 1)
    direct_referrals = db.query(User).filter(User.referred_by_id == user_id).all()
    
    for referral in direct_referrals:
        referral_data = {
            "user_id": referral.id,
            "email": referral.email,
            "referral_code": referral.referral_code,
            "indirect_referrals": []
        }
        
        # Get indirect referrals (level 2) if max_depth allows
        if max_depth >= 2:
            indirect_referrals = db.query(User).filter(User.referred_by_id == referral.id).all()
            for indirect in indirect_referrals:
                referral_data["indirect_referrals"].append({
                    "user_id": indirect.id,
                    "email": indirect.email,
                    "referral_code": indirect.referral_code
                })
        
        tree["direct_referrals"].append(referral_data)
    
    return tree

