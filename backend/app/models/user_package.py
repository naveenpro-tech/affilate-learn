from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class UserPackage(Base):
    """User package purchase records"""
    
    __tablename__ = "user_packages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    package_id = Column(Integer, ForeignKey("packages.id"), nullable=False)
    
    # Payment reference
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=True)
    
    # Status
    status = Column(String(20), default="active")  # active, expired, cancelled
    
    # Timestamps
    purchase_date = Column(DateTime, default=datetime.utcnow)
    expiry_date = Column(DateTime, nullable=True)  # For future subscription model
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="packages")
    package = relationship("Package", back_populates="user_packages")
    payment = relationship("Payment", back_populates="user_package")
    
    def __repr__(self):
        return f"<UserPackage user_id={self.user_id} package_id={self.package_id}>"

