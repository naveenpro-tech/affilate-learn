from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class CommentCreate(BaseModel):
    """Schema for creating a comment"""
    text: str = Field(..., min_length=1, max_length=500, description="Comment text")


class CommentUpdate(BaseModel):
    """Schema for updating a comment"""
    text: str = Field(..., min_length=1, max_length=500, description="Updated comment text")


class CommentResponse(BaseModel):
    """Schema for comment response"""
    id: int
    post_id: int
    user_id: int
    user_name: str
    text: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_own: bool = False  # Whether the comment belongs to the requesting user

    class Config:
        from_attributes = True


class CommentListResponse(BaseModel):
    """Schema for list of comments"""
    items: list[CommentResponse]
    total: int
    skip: int
    limit: int

