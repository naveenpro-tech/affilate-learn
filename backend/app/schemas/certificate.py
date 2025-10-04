from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CertificateBase(BaseModel):
    """Base certificate schema"""
    course_id: int


class CertificateCreate(CertificateBase):
    """Schema for creating a certificate"""
    user_id: int
    certificate_number: str


class CertificateResponse(BaseModel):
    """Schema for certificate response"""
    id: int
    certificate_number: str
    user_id: int
    course_id: int
    course_title: str
    issued_at: datetime
    user_name: str

    class Config:
        from_attributes = True


class CertificateVerify(BaseModel):
    """Schema for certificate verification (public endpoint)"""
    id: int
    certificate_number: str
    user_id: int
    user_name: str
    user_email: Optional[str] = None
    course_id: int
    course_title: str
    issued_at: datetime
    is_valid: bool = True

    class Config:
        from_attributes = True
