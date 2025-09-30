from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Course(Base):
    """Course model for educational content"""
    
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    
    # Package tier requirement
    package_id = Column(Integer, ForeignKey("packages.id"), nullable=False)
    
    # Thumbnail
    thumbnail_url = Column(String(500), nullable=True)
    
    # Display order
    display_order = Column(Integer, default=0)
    
    # Status
    is_published = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    package = relationship("Package", back_populates="courses")
    videos = relationship("Video", back_populates="course", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Course {self.title}>"

