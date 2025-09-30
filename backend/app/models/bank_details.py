from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class BankDetails(Base):
    __tablename__ = "bank_details"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    account_holder_name = Column(String(200), nullable=False)
    bank_name = Column(String(200), nullable=False)
    account_number = Column(String(50), nullable=False)
    ifsc_code = Column(String(11), nullable=False)
    upi_id = Column(String(100), nullable=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="bank_details")

