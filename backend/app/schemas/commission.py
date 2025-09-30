from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CommissionBase(BaseModel):
    """Base commission schema"""
    user_id: int
    referral_id: int
    amount: float
    commission_type: str
    status: str


class CommissionResponse(CommissionBase):
    """Schema for commission response"""
    id: int
    created_at: datetime
    paid_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class CommissionWithDetails(CommissionResponse):
    """Commission with referral details"""
    referee_email: Optional[str] = None
    referee_name: Optional[str] = None
    package_name: Optional[str] = None
    level: Optional[int] = None


class CommissionSummary(BaseModel):
    """Commission summary for a user"""
    total_commissions: float
    pending_commissions: float
    paid_commissions: float
    level1_commissions: float
    level2_commissions: float
    total_count: int
    pending_count: int
    paid_count: int

