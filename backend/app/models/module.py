from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Module(Base):
    """Module model - represents a section within a course"""
    
    __tablename__ = "modules"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    
    # Display order within the course
    display_order = Column(Integer, default=0)
    
    # Status
    is_published = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    course = relationship("Course", back_populates="modules")
    topics = relationship("Topic", back_populates="module", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Module {self.title}>"

