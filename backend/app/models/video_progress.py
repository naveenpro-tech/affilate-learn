from sqlalchemy import Column, Integer, DateTime, Boolean, ForeignKey, Float, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class VideoProgress(Base):
    """Tracks how much of a topic/video a user has watched"""

    __tablename__ = "video_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "topic_id", name="uq_user_topic_progress"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False, index=True)
    watched_seconds = Column(Float, default=0.0)
    completed = Column(Boolean, default=False)
    last_position = Column(Float, default=0.0)  # Last playback position in seconds

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User")
    topic = relationship("Topic")

