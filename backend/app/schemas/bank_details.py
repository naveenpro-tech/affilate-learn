from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional
import re

class BankDetailsBase(BaseModel):
    account_holder_name: str = Field(..., min_length=2, max_length=200)
    bank_name: str = Field(..., min_length=2, max_length=200)
    account_number: str = Field(..., min_length=9, max_length=18)
    ifsc_code: str = Field(..., min_length=11, max_length=11)
    upi_id: Optional[str] = Field(None, max_length=100)

    @validator('ifsc_code')
    def validate_ifsc(cls, v):
        # IFSC code format: 4 letters + 0 + 6 alphanumeric
        pattern = r'^[A-Z]{4}0[A-Z0-9]{6}$'
        if not re.match(pattern, v.upper()):
            raise ValueError('Invalid IFSC code format')
        return v.upper()

    @validator('account_number')
    def validate_account_number(cls, v):
        # Remove spaces and validate
        v = v.replace(' ', '')
        if not v.isdigit():
            raise ValueError('Account number must contain only digits')
        return v

    @validator('upi_id')
    def validate_upi(cls, v):
        if v:
            # Basic UPI ID validation: something@something
            if '@' not in v:
                raise ValueError('Invalid UPI ID format')
        return v

class BankDetailsCreate(BankDetailsBase):
    pass

class BankDetailsUpdate(BaseModel):
    account_holder_name: Optional[str] = Field(None, min_length=2, max_length=200)
    bank_name: Optional[str] = Field(None, min_length=2, max_length=200)
    account_number: Optional[str] = Field(None, min_length=9, max_length=18)
    ifsc_code: Optional[str] = Field(None, min_length=11, max_length=11)
    upi_id: Optional[str] = Field(None, max_length=100)

class BankDetailsResponse(BankDetailsBase):
    id: int
    user_id: int
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

