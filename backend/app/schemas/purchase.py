"""Purchase history schemas"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PurchaseHistoryItem(BaseModel):
    """Schema for a single purchase history item"""
    id: int
    purchase_type: str  # 'package' or 'course'
    item_name: str
    item_description: Optional[str] = None
    amount_paid: float
    payment_status: str
    purchase_date: datetime
    payment_id: Optional[int] = None
    invoice_id: Optional[int] = None
    invoice_number: Optional[str] = None
    has_invoice: bool = False
    
    class Config:
        from_attributes = True


class PurchaseHistoryResponse(BaseModel):
    """Response schema for purchase history"""
    total_purchases: int
    total_spent: float
    purchases: list[PurchaseHistoryItem]
    
    class Config:
        from_attributes = True

