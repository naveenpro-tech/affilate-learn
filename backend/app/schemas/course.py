from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.schemas.module import ModuleWithTopics


class VideoBase(BaseModel):
    """Base video schema"""
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    display_order: int = Field(default=0)


class VideoCreate(VideoBase):
    """Schema for creating a video"""
    course_id: int
    cloudinary_public_id: str
    cloudinary_url: str
    thumbnail_url: Optional[str] = None
    duration: Optional[int] = None


class VideoUpdate(BaseModel):
    """Schema for updating a video"""
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    display_order: Optional[int] = None
    is_published: Optional[bool] = None


class VideoResponse(VideoBase):
    """Schema for video response"""
    id: int
    course_id: int
    cloudinary_public_id: str
    cloudinary_url: str
    thumbnail_url: Optional[str]
    duration: Optional[int]
    is_published: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class CourseBase(BaseModel):
    """Base course schema"""
    title: str = Field(..., max_length=200)
    slug: str = Field(..., max_length=200)
    description: Optional[str] = None
    package_id: int
    display_order: int = Field(default=0)
    individual_price: Optional[float] = 199.0
    available_for_individual_purchase: bool = True


class CourseCreate(CourseBase):
    """Schema for creating a course"""
    thumbnail_url: Optional[str] = None


class CourseUpdate(BaseModel):
    """Schema for updating a course"""
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    display_order: Optional[int] = None
    is_published: Optional[bool] = None
    package_id: Optional[int] = None
    individual_price: Optional[float] = None
    available_for_individual_purchase: Optional[bool] = None


class CourseResponse(CourseBase):
    """Schema for course response"""
    id: int
    thumbnail_url: Optional[str]
    is_published: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CourseWithVideos(CourseResponse):
    """Course with videos"""
    videos: List[VideoResponse] = []
    package_name: Optional[str] = None
    video_count: int = 0


class CourseWithModules(CourseResponse):
    """Course with modules and topics (new hierarchical structure)"""
    modules: List[ModuleWithTopics] = []
    package_name: Optional[str] = None
    total_topics: int = 0


class CourseWithAccess(CourseResponse):
    """Course with user access information"""
    package_name: Optional[str] = None
    video_count: int = 0
    has_access: bool = False
    access_type: Optional[str] = None  # "package", "individual", or None
    is_locked: bool = True

