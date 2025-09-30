from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Video(Base):
    """Video model for course lessons"""
    
    __tablename__ = "videos"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    
    # Cloudinary video details
    cloudinary_public_id = Column(String(200), nullable=False)
    cloudinary_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500), nullable=True)
    
    # Video metadata
    duration = Column(Integer, nullable=True)  # Duration in seconds
    
    # Display order
    display_order = Column(Integer, default=0)
    
    # Status
    is_published = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    course = relationship("Course", back_populates="videos")
    
    def __repr__(self):
        return f"<Video {self.title}>"

