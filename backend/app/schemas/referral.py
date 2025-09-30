from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ReferralBase(BaseModel):
    """Base referral schema"""
    referrer_id: int
    referee_id: int
    level: int
    package_id: int


class ReferralResponse(ReferralBase):
    """Schema for referral response"""
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class ReferralWithDetails(ReferralResponse):
    """Referral with user and package details"""
    referee_email: Optional[str] = None
    referee_name: Optional[str] = None
    package_name: Optional[str] = None
    commission_amount: Optional[float] = None

