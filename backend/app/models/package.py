from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Package(Base):
    """Package model for Silver, Gold, and Platinum tiers"""
    
    __tablename__ = "packages"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)  # Silver, Gold, Platinum
    slug = Column(String(50), unique=True, nullable=False)  # silver, gold, platinum
    description = Column(Text, nullable=True)
    
    # Pricing (in INR)
    base_price = Column(Float, nullable=False)
    gst_amount = Column(Float, nullable=False)
    final_price = Column(Float, nullable=False)
    
    # Display order
    display_order = Column(Integer, default=0)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user_packages = relationship("UserPackage", back_populates="package")
    courses = relationship("Course", back_populates="package")
    
    def __repr__(self):
        return f"<Package {self.name} - ₹{self.final_price}>"

