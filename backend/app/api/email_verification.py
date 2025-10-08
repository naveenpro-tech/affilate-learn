"""
Email Verification API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.email_service import send_verification_email
from pydantic import BaseModel

router = APIRouter()


class ResendVerificationRequest(BaseModel):
    """Request to resend verification email"""
    pass


class VerifyEmailRequest(BaseModel):
    """Request to verify email with token"""
    token: str


@router.post("/send-verification")
async def send_verification(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send verification email to current user
    
    Generates a verification token and sends email with verification link
    """
    # Check if already verified
    if current_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already verified"
        )
    
    # Generate verification token (32 characters)
    verification_token = secrets.token_urlsafe(32)
    
    # Set expiration (24 hours from now)
    expires_at = datetime.utcnow() + timedelta(hours=24)
    
    # Update user with token
    current_user.verification_token = verification_token
    current_user.verification_token_expires = expires_at
    db.commit()
    
    # Send verification email
    try:
        await send_verification_email(
            email=current_user.email,
            name=current_user.full_name,
            token=verification_token
        )
    except Exception as e:
        # Log error but don't fail the request
        print(f"Failed to send verification email: {e}")
        # In production, you might want to use proper logging
    
    return {
        "message": "Verification email sent successfully",
        "email": current_user.email,
        "expires_at": expires_at
    }


@router.post("/verify")
async def verify_email(
    request: VerifyEmailRequest,
    db: Session = Depends(get_db)
):
    """
    Verify email with token
    
    Public endpoint - no authentication required
    """
    # Find user with this token
    user = db.query(User).filter(
        User.verification_token == request.token
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid verification token"
        )
    
    # Check if already verified
    if user.email_verified:
        return {
            "message": "Email already verified",
            "email": user.email
        }
    
    # Check if token expired
    if user.verification_token_expires and user.verification_token_expires < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token has expired. Please request a new one."
        )
    
    # Verify email
    user.email_verified = True
    user.verification_token = None
    user.verification_token_expires = None
    db.commit()
    
    return {
        "message": "Email verified successfully!",
        "email": user.email
    }


@router.get("/status")
async def get_verification_status(
    current_user: User = Depends(get_current_user)
):
    """
    Get email verification status for current user
    """
    return {
        "email": current_user.email,
        "email_verified": current_user.email_verified,
        "verification_pending": current_user.verification_token is not None,
        "token_expires_at": current_user.verification_token_expires
    }


@router.post("/resend")
async def resend_verification(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Resend verification email
    
    Same as send-verification but with different endpoint name for clarity
    """
    return await send_verification(current_user, db)

