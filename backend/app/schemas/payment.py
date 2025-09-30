from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class PaymentCreate(BaseModel):
    """Schema for creating a payment order"""
    package_id: int = Field(..., gt=0)


class PaymentOrderResponse(BaseModel):
    """Schema for Razorpay order response"""
    order_id: str
    amount: float
    currency: str
    razorpay_key_id: str


class PaymentVerification(BaseModel):
    """Schema for payment verification"""
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentResponse(BaseModel):
    """Schema for payment response"""
    id: int
    user_id: int
    package_id: int
    razorpay_order_id: str
    razorpay_payment_id: Optional[str]
    amount: float
    currency: str
    status: str
    created_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class PaymentWebhook(BaseModel):
    """Schema for Razorpay webhook"""
    event: str
    payload: dict

