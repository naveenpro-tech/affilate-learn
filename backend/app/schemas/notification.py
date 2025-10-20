from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class NotificationBase(BaseModel):
    title: str
    message: str
    type: str  # 'referral', 'commission', 'payout', 'course', 'system'
    link: Optional[str] = None

class NotificationCreate(NotificationBase):
    user_id: int
    post_id: Optional[int] = None
    comment_id: Optional[int] = None
    from_user_id: Optional[int] = None

class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None
    post_id: Optional[int] = None
    comment_id: Optional[int] = None
    from_user_id: Optional[int] = None
    from_user_name: Optional[str] = None
    from_user_avatar: Optional[str] = None

    class Config:
        from_attributes = True

class NotificationStats(BaseModel):
    total: int
    unread: int
    read: int

class NotificationListResponse(BaseModel):
    items: list[NotificationResponse]
    total: int
    unread_count: int
    has_more: bool

