from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class InvoiceBase(BaseModel):
    """Base invoice schema"""
    invoice_type: str = Field(..., description="Type of invoice: 'package' or 'course'")
    item_name: str = Field(..., min_length=1, max_length=200)
    item_description: Optional[str] = None
    amount: float = Field(..., gt=0)
    gst_percentage: float = Field(default=18.0, ge=0, le=100)


class InvoiceCreate(InvoiceBase):
    """Schema for creating an invoice"""
    payment_id: int = Field(..., gt=0)


class InvoiceResponse(InvoiceBase):
    """Schema for invoice response"""
    id: int
    invoice_number: str
    user_id: int
    payment_id: int
    gst_amount: float
    total_amount: float
    invoice_date: datetime
    pdf_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class InvoiceWithUserDetails(InvoiceResponse):
    """Invoice with user details for PDF generation"""
    user_full_name: str
    user_email: str
    user_phone: Optional[str] = None
    user_address_line1: Optional[str] = None
    user_address_line2: Optional[str] = None
    user_city: Optional[str] = None
    user_state: Optional[str] = None
    user_postal_code: Optional[str] = None
    user_country: Optional[str] = None

