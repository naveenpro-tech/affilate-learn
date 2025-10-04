from sqlalchemy import Column, Integer, DateTime, Boolean, ForeignKey, Float, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class VideoProgress(Base):
    """Tracks how much of a video a user has watched"""

    __tablename__ = "video_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "video_id", name="uq_user_video_progress"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False, index=True)
    watched_seconds = Column(Float, default=0.0)
    completed = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User")
    video = relationship("Video")

