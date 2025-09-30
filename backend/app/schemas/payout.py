from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class PayoutBase(BaseModel):
    """Base payout schema"""
    amount: float
    status: str


class PayoutCreate(BaseModel):
    """Schema for creating a payout"""
    user_id: int
    amount: float
    bank_account_number: Optional[str] = None
    bank_ifsc: Optional[str] = None
    upi_id: Optional[str] = None
    notes: Optional[str] = None


class PayoutUpdate(BaseModel):
    """Schema for updating a payout"""
    status: Optional[str] = None
    transaction_id: Optional[str] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None


class PayoutResponse(PayoutBase):
    """Schema for payout response"""
    id: int
    user_id: int
    transaction_id: Optional[str]
    payment_method: Optional[str]
    payout_date: Optional[datetime]
    created_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class PayoutWithUser(PayoutResponse):
    """Payout with user details"""
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    commission_count: int = 0


class PayoutRequest(BaseModel):
    """Schema for requesting a payout"""
    bank_account_number: Optional[str] = Field(None, max_length=100)
    bank_ifsc: Optional[str] = Field(None, max_length=20)
    upi_id: Optional[str] = Field(None, max_length=100)


class AvailableBalanceResponse(BaseModel):
    """Schema for available balance response"""
    total_commissions: float
    paid_amount: float
    available_balance: float
    pending_payouts: float
    can_request_payout: bool
    minimum_payout_amount: float

