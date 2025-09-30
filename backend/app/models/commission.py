from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Commission(Base):
    """Commission records for referral earnings"""
    
    __tablename__ = "commissions"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # User who earned the commission
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Related referral
    referral_id = Column(Integer, ForeignKey("referrals.id"), nullable=False)
    
    # Commission details
    amount = Column(Float, nullable=False)
    commission_type = Column(String(20), nullable=False)  # level1, level2
    
    # Status
    status = Column(String(20), default="pending")  # pending, paid, cancelled
    
    # Payout reference (when paid)
    payout_id = Column(Integer, ForeignKey("payouts.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    paid_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="commissions")
    referral = relationship("Referral", back_populates="commissions")
    payout = relationship("Payout", back_populates="commissions")
    
    def __repr__(self):
        return f"<Commission user_id={self.user_id} amount=₹{self.amount} status={self.status}>"

