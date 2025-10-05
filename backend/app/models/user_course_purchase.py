from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class UserCoursePurchase(Base):
    """Model for individual course purchases (non-package purchases)"""
    
    __tablename__ = "user_course_purchases"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    
    # Payment details
    amount_paid = Column(Float, nullable=False)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=True)
    
    # Access details
    purchase_date = Column(DateTime, default=datetime.utcnow)
    access_expires_at = Column(DateTime, nullable=True)  # NULL = lifetime access
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="course_purchases")
    course = relationship("Course", backref="individual_purchases")
    payment = relationship("Payment", backref="course_purchase")
    
    def __repr__(self):
        return f"<UserCoursePurchase user_id={self.user_id} course_id={self.course_id}>"

