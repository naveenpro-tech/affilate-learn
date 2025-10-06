from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
import razorpay
from datetime import datetime

from app.core.database import get_db, engine
from app.core.dependencies import get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.course import Course
from app.models.user_course_purchase import UserCoursePurchase
from app.models.payment import Payment
from app.models.wallet import Wallet
from app.schemas.user_course_purchase import (
    CoursePurchaseRequest,
    CoursePurchaseInitResponse,
    UserCoursePurchaseResponse
)
from app.services.razorpay_service import razorpay_service

router = APIRouter()

# Initialize Razorpay client
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


@router.post("/initiate", response_model=CoursePurchaseInitResponse)
def initiate_course_purchase(
    request: CoursePurchaseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Initiate individual course purchase
    Creates Razorpay order for course payment
    """
    # Ensure table exists
    UserCoursePurchase.__table__.create(bind=engine, checkfirst=True)
    
    # Get course
    course = db.query(Course).filter(Course.id == request.course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Check if course is available for individual purchase
    if not course.available_for_individual_purchase:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This course is not available for individual purchase"
        )
    
    # Check if user already purchased this course
    existing_purchase = db.query(UserCoursePurchase).filter(
        UserCoursePurchase.user_id == current_user.id,
        UserCoursePurchase.course_id == request.course_id,
        UserCoursePurchase.is_active == True
    ).first()
    
    if existing_purchase:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already purchased this course"
        )
    
    # Check if user has package access to this course
    from app.api.courses import check_user_access
    if check_user_access(current_user, course, db):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have access to this course through your package"
        )
    
    # Get course price
    amount = course.individual_price or 199.0
    amount_in_paise = int(amount * 100)
    
    # Create Razorpay order
    try:
        razorpay_order = razorpay_client.order.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "payment_capture": 1,
            "notes": {
                "user_id": current_user.id,
                "course_id": course.id,
                "purchase_type": "individual_course"
            }
        })
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payment order: {str(e)}"
        )
    
    return {
        "order_id": razorpay_order["id"],
        "amount": amount,
        "currency": "INR",
        "course_id": course.id,
        "course_title": course.title,
        "razorpay_key": settings.RAZORPAY_KEY_ID
    }


@router.post("/verify")
def verify_course_purchase(
    razorpay_order_id: str = Query(..., description="Razorpay order ID"),
    razorpay_payment_id: str = Query(..., description="Razorpay payment ID"),
    razorpay_signature: str = Query(..., description="Razorpay signature"),
    course_id: int = Query(..., description="Course ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verify Razorpay payment and grant course access
    """
    print(f"[COURSE PURCHASE VERIFY] User: {current_user.email}")
    print(f"[COURSE PURCHASE VERIFY] Order ID: {razorpay_order_id}")
    print(f"[COURSE PURCHASE VERIFY] Payment ID: {razorpay_payment_id}")
    print(f"[COURSE PURCHASE VERIFY] Course ID: {course_id}")

    # Verify payment signature using the same method as package purchases
    is_valid = razorpay_service.verify_payment_signature(
        razorpay_order_id=razorpay_order_id,
        razorpay_payment_id=razorpay_payment_id,
        razorpay_signature=razorpay_signature
    )

    if not is_valid:
        print(f"[COURSE PURCHASE VERIFY] Payment signature verification failed")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment signature"
        )

    print(f"[COURSE PURCHASE VERIFY] Payment signature verified successfully")
    
    # Get course
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Get payment details from Razorpay
    try:
        payment_details = razorpay_client.payment.fetch(razorpay_payment_id)
        amount_paid = payment_details["amount"] / 100  # Convert paise to rupees
    except:
        amount_paid = course.individual_price or 199.0
    
    # Create payment record
    payment = Payment(
        user_id=current_user.id,
        package_id=None,  # Individual course purchase, not package
        amount=amount_paid,
        razorpay_order_id=razorpay_order_id,
        razorpay_payment_id=razorpay_payment_id,
        razorpay_signature=razorpay_signature,
        status="completed",
        completed_at=datetime.utcnow()
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    # Create course purchase record
    course_purchase = UserCoursePurchase(
        user_id=current_user.id,
        course_id=course_id,
        amount_paid=amount_paid,
        payment_id=payment.id,
        access_expires_at=None,  # Lifetime access
        is_active=True
    )
    db.add(course_purchase)
    db.commit()
    db.refresh(course_purchase)
    
    # Send purchase confirmation email
    try:
        from app.utils.email import send_email
        send_email(
            to_email=current_user.email,
            subject=f"Course Purchase Confirmation - {course.title}",
            html_content=f"""
            <h2>Course Purchase Successful!</h2>
            <p>Hello {current_user.full_name},</p>
            <p>You have successfully purchased the course: <strong>{course.title}</strong></p>
            <p>Amount Paid: ₹{amount_paid:,.2f}</p>
            <p>Transaction ID: {razorpay_payment_id}</p>
            <p>You now have lifetime access to this course!</p>
            <p><a href="{settings.FRONTEND_URL}/courses/{course.id}">Start Learning</a></p>
            """,
            body=f"Course Purchase Successful! You purchased {course.title} for ₹{amount_paid:,.2f}"
        )
    except Exception as e:
        print(f"Error sending email: {e}")
    
    return {
        "success": True,
        "message": "Course purchased successfully",
        "course_id": course_id,
        "purchase_id": course_purchase.id,
        "access_type": "lifetime"
    }


@router.get("/my-purchases", response_model=List[UserCoursePurchaseResponse])
def get_my_course_purchases(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all courses purchased by the current user
    """
    UserCoursePurchase.__table__.create(bind=engine, checkfirst=True)
    
    purchases = db.query(UserCoursePurchase).filter(
        UserCoursePurchase.user_id == current_user.id,
        UserCoursePurchase.is_active == True
    ).all()
    
    return purchases


@router.get("/check-access/{course_id}")
def check_course_access(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if user has access to a course (via package or individual purchase)
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Check package access
    from app.api.courses import check_user_access
    has_package_access = check_user_access(current_user, course, db)
    
    # Check individual purchase
    UserCoursePurchase.__table__.create(bind=engine, checkfirst=True)
    individual_purchase = db.query(UserCoursePurchase).filter(
        UserCoursePurchase.user_id == current_user.id,
        UserCoursePurchase.course_id == course_id,
        UserCoursePurchase.is_active == True
    ).first()
    
    has_individual_access = individual_purchase is not None
    
    return {
        "has_access": has_package_access or has_individual_access,
        "access_type": "package" if has_package_access else ("individual" if has_individual_access else None),
        "is_locked": not (has_package_access or has_individual_access),
        "course_id": course_id,
        "course_title": course.title,
        "individual_price": course.individual_price,
        "available_for_purchase": course.available_for_individual_purchase and not (has_package_access or has_individual_access)
    }

