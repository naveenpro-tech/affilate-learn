from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class VideoProgressCreate(BaseModel):
    watched_seconds: float = Field(ge=0)
    completed: Optional[bool] = False


class VideoProgressResponse(BaseModel):
    id: int
    user_id: int
    video_id: int
    watched_seconds: float
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

