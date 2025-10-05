from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserCoursePurchaseBase(BaseModel):
    """Base schema for user course purchase"""
    course_id: int
    amount_paid: float


class UserCoursePurchaseCreate(UserCoursePurchaseBase):
    """Schema for creating a course purchase"""
    payment_id: Optional[int] = None
    access_expires_at: Optional[datetime] = None


class UserCoursePurchaseResponse(UserCoursePurchaseBase):
    """Schema for course purchase response"""
    id: int
    user_id: int
    payment_id: Optional[int]
    purchase_date: datetime
    access_expires_at: Optional[datetime]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class CoursePurchaseRequest(BaseModel):
    """Schema for initiating a course purchase"""
    course_id: int
    payment_method: str = "razorpay"  # razorpay or wallet


class CoursePurchaseInitResponse(BaseModel):
    """Schema for course purchase initialization response"""
    order_id: str
    amount: float
    currency: str
    course_id: int
    course_title: str
    razorpay_key: str

