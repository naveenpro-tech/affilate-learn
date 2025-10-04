from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class TopicBase(BaseModel):
    title: str
    description: Optional[str] = None
    video_source_type: str = "cloudinary"
    cloudinary_public_id: Optional[str] = None
    cloudinary_url: Optional[str] = None
    external_video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    duration: Optional[int] = None
    display_order: int = 0
    is_published: bool = False


class TopicCreate(TopicBase):
    module_id: int


class TopicUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    video_source_type: Optional[str] = None
    cloudinary_public_id: Optional[str] = None
    cloudinary_url: Optional[str] = None
    external_video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    duration: Optional[int] = None
    display_order: Optional[int] = None
    is_published: Optional[bool] = None


class TopicResponse(TopicBase):
    id: int
    module_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ModuleBase(BaseModel):
    title: str
    description: Optional[str] = None
    display_order: int = 0
    is_published: bool = False


class ModuleCreate(ModuleBase):
    course_id: int


class ModuleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    display_order: Optional[int] = None
    is_published: Optional[bool] = None


class ModuleResponse(ModuleBase):
    id: int
    course_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ModuleWithTopics(ModuleResponse):
    topics: List[TopicResponse] = []

    class Config:
        from_attributes = True

