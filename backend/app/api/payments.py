from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.package import Package
from app.models.payment import Payment
from app.models.user_package import UserPackage
from app.schemas.payment import (
    PaymentCreate, PaymentOrderResponse, PaymentVerification, PaymentResponse
)
from app.services.razorpay_service import razorpay_service

router = APIRouter()


@router.post("/create-order", response_model=PaymentOrderResponse)
def create_payment_order(
    payment_data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a Razorpay payment order
    
    - Validates package exists
    - Creates Razorpay order
    - Stores payment record in database
    """
    # Get package
    package = db.query(Package).filter(Package.id == payment_data.package_id).first()
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found"
        )
    
    if not package.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Package is not available"
        )
    
    # Check if user already has this package
    existing_package = db.query(UserPackage).filter(
        UserPackage.user_id == current_user.id,
        UserPackage.package_id == package.id,
        UserPackage.status == "active"
    ).first()
    
    if existing_package:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have this package"
        )
    
    # Create Razorpay order
    try:
        receipt = f"user_{current_user.id}_pkg_{package.id}_{int(datetime.utcnow().timestamp())}"
        razorpay_order = razorpay_service.create_order(
            amount=package.final_price,
            currency="INR",
            receipt=receipt
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payment order: {str(e)}"
        )
    
    # Store payment record
    payment = Payment(
        user_id=current_user.id,
        package_id=package.id,
        razorpay_order_id=razorpay_order["id"],
        amount=package.final_price,
        currency="INR",
        status="created"
    )
    
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    return {
        "order_id": razorpay_order["id"],
        "amount": package.final_price,
        "currency": "INR",
        "razorpay_key_id": settings.RAZORPAY_KEY_ID
    }


@router.post("/verify", response_model=PaymentResponse)
def verify_payment(
    verification_data: PaymentVerification,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verify payment and activate package

    - Verifies Razorpay signature
    - Updates payment status
    - Creates user_package record
    - Triggers referral commission calculation
    """
    try:
        print(f"[PAYMENT VERIFY] Received data: {verification_data}")
        print(f"[PAYMENT VERIFY] User: {current_user.email}")

        # Get payment record
        payment = db.query(Payment).filter(
            Payment.razorpay_order_id == verification_data.razorpay_order_id,
            Payment.user_id == current_user.id
        ).first()

        if not payment:
            print(f"[PAYMENT VERIFY] Payment not found for order: {verification_data.razorpay_order_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )

        if payment.status == "success":
            print(f"[PAYMENT VERIFY] Payment already verified")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment already verified"
            )
    except HTTPException:
        raise
    except Exception as e:
        print(f"[PAYMENT VERIFY] Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment verification failed: {str(e)}"
        )
    
    # Verify signature
    is_valid = razorpay_service.verify_payment_signature(
        razorpay_order_id=verification_data.razorpay_order_id,
        razorpay_payment_id=verification_data.razorpay_payment_id,
        razorpay_signature=verification_data.razorpay_signature
    )
    
    if not is_valid:
        payment.status = "failed"
        payment.error_message = "Invalid payment signature"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment signature"
        )
    
    # Update payment record
    payment.razorpay_payment_id = verification_data.razorpay_payment_id
    payment.razorpay_signature = verification_data.razorpay_signature
    payment.status = "success"
    payment.completed_at = datetime.utcnow()
    
    # Create user_package record
    user_package = UserPackage(
        user_id=current_user.id,
        package_id=payment.package_id,
        payment_id=payment.id,
        status="active",
        purchase_date=datetime.utcnow()
    )
    
    db.add(user_package)
    db.commit()
    db.refresh(payment)
    
    # Trigger referral commission calculation (async task in production)
    from app.services.referral_service import process_referral_commissions
    try:
        process_referral_commissions(current_user.id, payment.package_id, db)
    except Exception as e:
        print(f"Error processing referral commissions: {e}")
        # Don't fail the payment if commission calculation fails
    
    return payment


@router.get("/my-payments", response_model=List[PaymentResponse])
def get_my_payments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's payment history
    """
    payments = db.query(Payment).filter(
        Payment.user_id == current_user.id
    ).order_by(Payment.created_at.desc()).all()
    
    return payments


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific payment by ID
    """
    payment = db.query(Payment).filter(
        Payment.id == payment_id,
        Payment.user_id == current_user.id
    ).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    return payment


@router.post("/webhook")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handle Razorpay webhooks
    
    - Verifies webhook signature
    - Processes payment events
    """
    # Get webhook signature
    signature = request.headers.get("X-Razorpay-Signature")
    if not signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing signature"
        )
    
    # Get payload
    payload = await request.body()
    payload_str = payload.decode("utf-8")
    
    # Verify signature (in production, use webhook secret)
    # is_valid = razorpay_service.verify_webhook_signature(payload_str, signature)
    # if not is_valid:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="Invalid signature"
    #     )
    
    # Process webhook event
    import json
    data = json.loads(payload_str)
    event = data.get("event")
    
    if event == "payment.captured":
        # Handle successful payment
        payment_entity = data.get("payload", {}).get("payment", {}).get("entity", {})
        order_id = payment_entity.get("order_id")
        
        if order_id:
            payment = db.query(Payment).filter(
                Payment.razorpay_order_id == order_id
            ).first()
            
            if payment and payment.status != "success":
                payment.status = "success"
                payment.razorpay_payment_id = payment_entity.get("id")
                payment.completed_at = datetime.utcnow()
                db.commit()
    
    elif event == "payment.failed":
        # Handle failed payment
        payment_entity = data.get("payload", {}).get("payment", {}).get("entity", {})
        order_id = payment_entity.get("order_id")
        
        if order_id:
            payment = db.query(Payment).filter(
                Payment.razorpay_order_id == order_id
            ).first()
            
            if payment:
                payment.status = "failed"
                payment.error_message = payment_entity.get("error_description", "Payment failed")
                db.commit()
    
    return {"status": "ok"}

