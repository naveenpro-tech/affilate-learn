from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Payment(Base):
    """Payment transaction records (Razorpay)"""
    
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # User making payment
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Package being purchased
    package_id = Column(Integer, ForeignKey("packages.id"), nullable=False)
    
    # Razorpay details
    razorpay_order_id = Column(String(100), unique=True, nullable=False)
    razorpay_payment_id = Column(String(100), unique=True, nullable=True)
    razorpay_signature = Column(String(200), nullable=True)
    
    # Payment details
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    
    # Status
    status = Column(String(20), default="created")  # created, pending, success, failed
    
    # Additional info
    payment_method = Column(String(50), nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="payments")
    package = relationship("Package")
    user_package = relationship("UserPackage", back_populates="payment", uselist=False)
    
    def __repr__(self):
        return f"<Payment order_id={self.razorpay_order_id} status={self.status}>"

