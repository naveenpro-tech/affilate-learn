from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class PackageBase(BaseModel):
    """Base package schema"""
    name: str = Field(..., max_length=50)
    slug: str = Field(..., max_length=50)
    description: Optional[str] = None
    base_price: float = Field(..., gt=0)
    gst_amount: float = Field(..., ge=0)
    final_price: float = Field(..., gt=0)
    display_order: int = Field(default=0)
    is_active: bool = Field(default=True)


class PackageCreate(PackageBase):
    """Schema for creating a package"""
    pass


class PackageUpdate(BaseModel):
    """Schema for updating a package"""
    name: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    base_price: Optional[float] = Field(None, gt=0)
    gst_amount: Optional[float] = Field(None, ge=0)
    final_price: Optional[float] = Field(None, gt=0)
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class PackageResponse(PackageBase):
    """Schema for package response"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

