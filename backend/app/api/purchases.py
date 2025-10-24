"""Purchase history API endpoints"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from datetime import datetime
from typing import Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.user_package import UserPackage
from app.models.user_course_purchase import UserCoursePurchase
from app.models.payment import Payment
from app.models.package import Package
from app.models.course import Course
from app.models.invoice import Invoice
from app.schemas.purchase import PurchaseHistoryResponse, PurchaseHistoryItem


router = APIRouter()


@router.get("/history", response_model=PurchaseHistoryResponse)
def get_purchase_history(
    purchase_type: Optional[str] = Query(None, description="Filter by type: 'package' or 'course'"),
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
    limit: int = Query(100, ge=1, le=500, description="Number of items to return"),
    offset: int = Query(0, ge=0, description="Number of items to skip"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get purchase history for current user
    - Returns all package and course purchases
    - Includes invoice information if available
    - Supports filtering by type and date range
    - Supports pagination
    """
    purchases = []
    total_spent = 0.0
    
    # Get package purchases
    if not purchase_type or purchase_type == 'package':
        package_purchases = db.query(UserPackage).filter(
            UserPackage.user_id == current_user.id
        )
        
        # Apply date filters
        if start_date:
            package_purchases = package_purchases.filter(UserPackage.purchase_date >= start_date)
        if end_date:
            package_purchases = package_purchases.filter(UserPackage.purchase_date <= end_date)
        
        package_purchases = package_purchases.all()
        
        for up in package_purchases:
            # Get package details
            package = db.query(Package).filter(Package.id == up.package_id).first()
            
            # Get payment details
            payment = None
            if up.payment_id:
                payment = db.query(Payment).filter(Payment.id == up.payment_id).first()
            
            # Get invoice details
            invoice = None
            if payment:
                invoice = db.query(Invoice).filter(Invoice.payment_id == payment.id).first()
            
            amount = payment.amount if payment else (package.price if package else 0.0)
            total_spent += amount
            
            purchases.append(PurchaseHistoryItem(
                id=up.id,
                purchase_type='package',
                item_name=package.name if package else 'Unknown Package',
                item_description=package.description if package else None,
                amount_paid=amount,
                payment_status=payment.status if payment else 'unknown',
                purchase_date=up.purchase_date,
                payment_id=payment.id if payment else None,
                invoice_id=invoice.id if invoice else None,
                invoice_number=invoice.invoice_number if invoice else None,
                has_invoice=invoice is not None
            ))
    
    # Get course purchases
    if not purchase_type or purchase_type == 'course':
        course_purchases = db.query(UserCoursePurchase).filter(
            UserCoursePurchase.user_id == current_user.id
        )
        
        # Apply date filters
        if start_date:
            course_purchases = course_purchases.filter(UserCoursePurchase.purchase_date >= start_date)
        if end_date:
            course_purchases = course_purchases.filter(UserCoursePurchase.purchase_date <= end_date)
        
        course_purchases = course_purchases.all()
        
        for cp in course_purchases:
            # Get course details
            course = db.query(Course).filter(Course.id == cp.course_id).first()
            
            # Get payment details
            payment = None
            if cp.payment_id:
                payment = db.query(Payment).filter(Payment.id == cp.payment_id).first()
            
            # Get invoice details
            invoice = None
            if payment:
                invoice = db.query(Invoice).filter(Invoice.payment_id == payment.id).first()
            
            total_spent += cp.amount_paid
            
            purchases.append(PurchaseHistoryItem(
                id=cp.id,
                purchase_type='course',
                item_name=course.title if course else 'Unknown Course',
                item_description=course.description if course else None,
                amount_paid=cp.amount_paid,
                payment_status=payment.status if payment else 'completed',
                purchase_date=cp.purchase_date,
                payment_id=payment.id if payment else None,
                invoice_id=invoice.id if invoice else None,
                invoice_number=invoice.invoice_number if invoice else None,
                has_invoice=invoice is not None
            ))
    
    # Sort by purchase date (newest first)
    purchases.sort(key=lambda x: x.purchase_date, reverse=True)
    
    # Apply pagination
    total_purchases = len(purchases)
    purchases = purchases[offset:offset + limit]
    
    return PurchaseHistoryResponse(
        total_purchases=total_purchases,
        total_spent=total_spent,
        purchases=purchases
    )

