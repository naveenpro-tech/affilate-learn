from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Invoice(Base):
    """Invoice records for payments"""
    
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Invoice number (unique identifier like INV-2024-0001)
    invoice_number = Column(String(50), unique=True, nullable=False, index=True)
    
    # User who made the purchase
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Payment reference
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=False, index=True)
    
    # Invoice type (package or course)
    invoice_type = Column(String(20), nullable=False)  # 'package' or 'course'
    
    # Item details
    item_name = Column(String(200), nullable=False)
    item_description = Column(Text, nullable=True)
    
    # Financial details
    amount = Column(Float, nullable=False)  # Base amount
    gst_percentage = Column(Float, default=18.0)  # GST percentage
    gst_amount = Column(Float, nullable=False)  # Calculated GST amount
    total_amount = Column(Float, nullable=False)  # Total including GST
    
    # Invoice date
    invoice_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # PDF storage
    pdf_url = Column(String(500), nullable=True)  # URL or path to PDF file
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="invoices")
    payment = relationship("Payment", backref="invoice")
    
    def __repr__(self):
        return f"<Invoice {self.invoice_number} user_id={self.user_id}>"

