from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
import enum


class VideoSourceType(str, enum.Enum):
    """Video source types"""
    CLOUDINARY = "cloudinary"
    YOUTUBE = "youtube"
    VIMEO = "vimeo"
    EXTERNAL = "external"


class Topic(Base):
    """Topic model - represents a lesson/topic within a module"""
    
    __tablename__ = "topics"
    
    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    
    # Video source
    video_source_type = Column(SQLEnum(VideoSourceType), default=VideoSourceType.CLOUDINARY)
    
    # Cloudinary video details (if source is cloudinary)
    cloudinary_public_id = Column(String(200), nullable=True)
    cloudinary_url = Column(String(500), nullable=True)
    
    # External video URL (YouTube, Vimeo, or any other)
    external_video_url = Column(String(500), nullable=True)
    
    # Thumbnail
    thumbnail_url = Column(String(500), nullable=True)
    
    # Video metadata
    duration = Column(Integer, nullable=True)  # Duration in seconds
    
    # Display order within the module
    display_order = Column(Integer, default=0)
    
    # Status
    is_published = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    module = relationship("Module", back_populates="topics")
    
    def __repr__(self):
        return f"<Topic {self.title}>"

