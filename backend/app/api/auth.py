from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
import logging

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.core.dependencies import get_current_user
from app.core.rate_limit import limiter
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, UserWithPackage, UserUpdate
from app.utils.referral_code import generate_referral_code
from app.utils.email import send_welcome_email, send_password_reset_email
import secrets

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/validate-referral-code")
def validate_referral_code(code: str, db: Session = Depends(get_db)):
    """
    Validate referral code and return referrer's name

    Args:
        code: Referral code to validate
        db: Database session

    Returns:
        dict with valid status and referrer_name if valid
    """
    if not code:
        return {"valid": False, "referrer_name": None}

    # Find user with this referral code
    referrer = db.query(User).filter(User.referral_code == code.upper()).first()

    if referrer:
        return {
            "valid": True,
            "referrer_name": referrer.full_name,
            "referrer_email": referrer.email
        }
    else:
        return {"valid": False, "referrer_name": None}


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
@limiter.limit("100/hour")  # Increased for testing
def register(request: Request, user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user and return JWT token

    - Validates email uniqueness
    - Generates unique referral code
    - Tracks referrer if referral code provided
    - Hashes password
    - Returns access token
    """
    # Ensure notification table exists
    from app.models.notification import Notification
    from app.core.database import engine
    Notification.__table__.create(bind=engine, checkfirst=True)

    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Handle referral code
    referred_by_id = None
    referrer = None
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

    # Create wallet with sign-up bonus
    try:
        from app.models.wallet import Wallet, WalletTransaction, TransactionType, TransactionSource
        from app.core.database import engine

        # Ensure tables exist
        Wallet.__table__.create(bind=engine, checkfirst=True)
        WalletTransaction.__table__.create(bind=engine, checkfirst=True)

        # Create wallet with sign-up bonus (₹10 = 10 credits)
        signup_bonus = 10.0
        wallet = Wallet(
            user_id=new_user.id,
            balance=signup_bonus,
            total_earned=signup_bonus,
            total_withdrawn=0.0,
            total_spent=0.0
        )
        db.add(wallet)
        db.commit()
        db.refresh(wallet)

        # Create transaction record for sign-up bonus
        transaction = WalletTransaction(
            wallet_id=wallet.id,
            type=TransactionType.CREDIT,
            source=TransactionSource.ADMIN,
            amount=signup_bonus,
            balance_before=0.0,
            balance_after=signup_bonus,
            description="Sign-up bonus",
            reference_id=f"signup-{new_user.id}"
        )
        db.add(transaction)
        db.commit()
        logger.info(f"Sign-up bonus of ₹{signup_bonus} credited to user {new_user.id}")
    except Exception as e:
        logger.error(f"Failed to create wallet with sign-up bonus: {str(e)}")
        # Continue with registration even if wallet creation fails

    # Create notification for referrer if referred
    if referrer:
        try:
            from app.models.notification import Notification
            notification = Notification(
                user_id=referrer.id,
                title="New Referral! 🎉",
                message=f"{new_user.full_name} just joined using your referral code! They can now purchase a package to earn you commissions.",
                type="referral",
                link="/referrals"
            )
            db.add(notification)
            db.commit()
            logger.info(f"Referral notification created for user {referrer.id}")
        except Exception as e:
            logger.error(f"Failed to create referral notification: {str(e)}")
            # Continue with registration even if notification fails

    # Generate verification token for email verification
    verification_token = secrets.token_urlsafe(32)
    verification_expires = datetime.utcnow() + timedelta(hours=24)
    new_user.verification_token = verification_token
    new_user.verification_token_expires = verification_expires
    new_user.email_verified = False
    db.commit()
    db.refresh(new_user)

    # Send welcome email (non-blocking - don't fail registration if email fails)
    try:
        send_welcome_email(
            to_email=new_user.email,
            user_name=new_user.full_name,
            referral_code=new_user.referral_code
        )
        logger.info(f"Welcome email sent to {new_user.email}")
    except Exception as e:
        logger.error(f"Failed to send welcome email to {new_user.email}: {str(e)}")
        # Continue with registration even if email fails

    # Send verification email (non-blocking)
    try:
        from app.services.email_service import send_verification_email
        import threading

        def send_email_thread():
            import asyncio
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                loop.run_until_complete(send_verification_email(
                    email=new_user.email,
                    name=new_user.full_name,
                    token=verification_token
                ))
                logger.info(f"Verification email sent to {new_user.email}")
            except Exception as e:
                logger.error(f"Failed to send verification email: {str(e)}")
            finally:
                loop.close()

        # Start email sending in background thread
        email_thread = threading.Thread(target=send_email_thread)
        email_thread.daemon = True
        email_thread.start()
        logger.info(f"Verification email queued for {new_user.email}")
    except Exception as e:
        logger.error(f"Failed to queue verification email to {new_user.email}: {str(e)}")
        # Continue with registration even if email fails

    # Generate JWT token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(new_user.id), "email": new_user.email},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
@limiter.limit("10/minute")  # 10 login attempts per minute per IP
def login(request: Request, credentials: UserLogin, db: Session = Depends(get_db)):
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


@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile

    - Updates full_name and/or phone
    - Returns updated user data
    """
    # Update only provided fields
    if profile_data.full_name is not None:
        current_user.full_name = profile_data.full_name

    if profile_data.phone is not None:
        current_user.phone = profile_data.phone

    db.commit()
    db.refresh(current_user)

    return current_user


@router.post("/change-password")
def change_password(
    current_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change current user's password

    - Verifies current password
    - Updates to new password
    - Returns success message
    """
    # Verify current password
    if not verify_password(current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    # Validate new password length
    if len(new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long"
        )

    # Update password
    current_user.hashed_password = get_password_hash(new_password)
    db.commit()

    return {"message": "Password changed successfully"}


@router.post("/forgot-password")
@limiter.limit("3/hour")  # 3 password reset requests per hour per IP
def forgot_password(request: Request, email: str, db: Session = Depends(get_db)):
    """
    Request password reset

    - Generates reset token
    - Sends reset email
    - Returns success message (even if email doesn't exist for security)
    """
    # Find user by email
    user = db.query(User).filter(User.email == email).first()

    if user:
        # Generate secure reset token
        reset_token = secrets.token_urlsafe(32)

        # Set token expiration (1 hour from now)
        from datetime import datetime, timedelta
        user.reset_token = reset_token
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)

        db.commit()

        # Send password reset email
        try:
            send_password_reset_email(
                to_email=user.email,
                reset_token=reset_token
            )
            logger.info(f"Password reset email sent to {user.email}")
        except Exception as e:
            logger.error(f"Failed to send password reset email to {user.email}: {str(e)}")

    # Always return success message (don't reveal if email exists)
    return {"message": "If the email exists, a password reset link has been sent"}


@router.post("/reset-password")
@limiter.limit("5/hour")  # 5 password reset attempts per hour per IP
def reset_password(
    request: Request,
    token: str,
    new_password: str,
    db: Session = Depends(get_db)
):
    """
    Reset password using token

    - Validates reset token
    - Checks token expiration
    - Updates password
    - Clears reset token
    """
    from datetime import datetime

    # Find user by reset token
    user = db.query(User).filter(User.reset_token == token).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    # Check if token is expired
    if not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired"
        )

    # Validate new password length
    if len(new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )

    # Update password and clear reset token
    user.hashed_password = get_password_hash(new_password)
    user.reset_token = None
    user.reset_token_expires = None

    db.commit()

    return {"message": "Password reset successfully"}

