from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Payout(Base):
    """Weekly payout records"""
    
    __tablename__ = "payouts"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # User receiving payout
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Payout details
    amount = Column(Float, nullable=False)
    
    # Status
    status = Column(String(20), default="pending")  # pending, processing, completed, failed
    
    # Payment details
    transaction_id = Column(String(100), nullable=True)
    payment_method = Column(String(50), nullable=True)  # bank_transfer, upi, etc.
    
    # Bank details (encrypted in production)
    bank_account_number = Column(String(100), nullable=True)
    bank_ifsc = Column(String(20), nullable=True)
    upi_id = Column(String(100), nullable=True)
    
    # Notes
    notes = Column(Text, nullable=True)
    
    # Timestamps
    payout_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="payouts")
    commissions = relationship("Commission", back_populates="payout")
    
    def __repr__(self):
        return f"<Payout user_id={self.user_id} amount=₹{self.amount} status={self.status}>"

