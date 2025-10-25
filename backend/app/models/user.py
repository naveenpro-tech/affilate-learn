from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class User(Base):
    """User model for authentication and profile management"""
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)

    # Profile fields (PRIORITY 3)
    username = Column(String(50), unique=True, nullable=True, index=True)
    bio = Column(String(500), nullable=True)
    instagram_url = Column(String(200), nullable=True)
    twitter_url = Column(String(200), nullable=True)
    linkedin_url = Column(String(200), nullable=True)

    # Address fields
    address_line1 = Column(String(200), nullable=True)
    address_line2 = Column(String(200), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    country = Column(String(100), nullable=True, default='India')
    
    # Referral system
    referral_code = Column(String(12), unique=True, index=True, nullable=False)
    referred_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Account status
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

    # Email verification
    email_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    verification_token_expires = Column(DateTime, nullable=True)

    # Password reset
    reset_token = Column(String, nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)

    # Onboarding
    onboarding_completed = Column(Boolean, default=False)
    onboarding_completed_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    referred_by = relationship("User", remote_side=[id], backref="direct_referrals")
    packages = relationship("UserPackage", back_populates="user")
    referrals_made = relationship("Referral", foreign_keys="Referral.referrer_id", back_populates="referrer")
    referrals_received = relationship("Referral", foreign_keys="Referral.referee_id", back_populates="referee")
    commissions = relationship("Commission", back_populates="user")
    payouts = relationship("Payout", back_populates="user")
    payments = relationship("Payment", back_populates="user")
    bank_details = relationship("BankDetails", back_populates="user", uselist=False)
    notifications = relationship("Notification", foreign_keys="Notification.user_id", back_populates="user")
    wallet = relationship("Wallet", back_populates="user", uselist=False)
    invoices = relationship("Invoice", back_populates="user")
    
    def __repr__(self):
        return f"<User {self.email}>"

