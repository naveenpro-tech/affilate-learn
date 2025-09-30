from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Referral(Base):
    """Referral tracking model for 2-level commission system"""
    
    __tablename__ = "referrals"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Referrer (person who earns commission)
    referrer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Referee (person who was referred and made a purchase)
    referee_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Referral level (1 = direct, 2 = indirect)
    level = Column(Integer, nullable=False)  # 1 or 2
    
    # Package purchased by referee
    package_id = Column(Integer, ForeignKey("packages.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    referrer = relationship("User", foreign_keys=[referrer_id], back_populates="referrals_made")
    referee = relationship("User", foreign_keys=[referee_id], back_populates="referrals_received")
    package = relationship("Package")
    commissions = relationship("Commission", back_populates="referral")
    
    def __repr__(self):
        return f"<Referral referrer={self.referrer_id} referee={self.referee_id} level={self.level}>"

