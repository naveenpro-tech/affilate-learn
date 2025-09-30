from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, UserWithPackage
from app.utils.referral_code import generate_referral_code

router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user and return JWT token

    - Validates email uniqueness
    - Generates unique referral code
    - Tracks referrer if referral code provided
    - Hashes password
    - Returns access token
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Handle referral code
    referred_by_id = None
    if user_data.referred_by_code:
        referrer = db.query(User).filter(User.referral_code == user_data.referred_by_code).first()
        if not referrer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid referral code"
            )
        referred_by_id = referrer.id

    # Generate unique referral code
    while True:
        referral_code = generate_referral_code()
        existing_code = db.query(User).filter(User.referral_code == referral_code).first()
        if not existing_code:
            break

    # Create user
    new_user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        phone=user_data.phone,
        referral_code=referral_code,
        referred_by_id=referred_by_id,
        is_active=True,
        is_admin=False
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate JWT token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(new_user.id), "email": new_user.email},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login user and return JWT token
    
    - Validates email and password
    - Returns access token
    """
    # Get user by email
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserWithPackage)
def get_current_user_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get current user profile with package information
    """
    from app.models.user_package import UserPackage
    from app.models.package import Package
    
    # Get user's current package
    user_package = db.query(UserPackage).filter(
        UserPackage.user_id == current_user.id,
        UserPackage.status == "active"
    ).order_by(UserPackage.purchase_date.desc()).first()
    
    response_data = {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "referral_code": current_user.referral_code,
        "is_active": current_user.is_active,
        "is_admin": current_user.is_admin,
        "created_at": current_user.created_at,
        "current_package": None,
        "package_purchased_at": None
    }
    
    if user_package:
        package = db.query(Package).filter(Package.id == user_package.package_id).first()
        if package:
            response_data["current_package"] = package.name
            response_data["package_purchased_at"] = user_package.purchase_date
    
    return response_data


@router.get("/referral-stats")
def get_referral_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get referral statistics for current user
    """
    from app.models.referral import Referral
    from app.models.commission import Commission
    
    # Count direct referrals (level 1)
    direct_referrals = db.query(Referral).filter(
        Referral.referrer_id == current_user.id,
        Referral.level == 1
    ).count()
    
    # Count indirect referrals (level 2)
    indirect_referrals = db.query(Referral).filter(
        Referral.referrer_id == current_user.id,
        Referral.level == 2
    ).count()
    
    # Calculate total earnings
    total_earnings = db.query(Commission).filter(
        Commission.user_id == current_user.id
    ).with_entities(
        db.func.sum(Commission.amount)
    ).scalar() or 0.0
    
    # Calculate pending earnings
    pending_earnings = db.query(Commission).filter(
        Commission.user_id == current_user.id,
        Commission.status == "pending"
    ).with_entities(
        db.func.sum(Commission.amount)
    ).scalar() or 0.0
    
    # Calculate paid earnings
    paid_earnings = db.query(Commission).filter(
        Commission.user_id == current_user.id,
        Commission.status == "paid"
    ).with_entities(
        db.func.sum(Commission.amount)
    ).scalar() or 0.0
    
    return {
        "referral_code": current_user.referral_code,
        "direct_referrals": direct_referrals,
        "indirect_referrals": indirect_referrals,
        "total_referrals": direct_referrals + indirect_referrals,
        "total_earnings": float(total_earnings),
        "pending_earnings": float(pending_earnings),
        "paid_earnings": float(paid_earnings)
    }

