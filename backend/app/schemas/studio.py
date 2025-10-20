"""
Pydantic schemas for Community AI Studio API
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# Templates & Categories
class ImageCategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    display_order: int = 0
    is_active: bool = True


class ImageCategoryCreate(ImageCategoryBase):
    pass


class ImageCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class ImageCategoryResponse(ImageCategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ImageTemplateBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    category_id: int
    prompt_text: str = Field(..., min_length=10, max_length=1000)
    description: Optional[str] = Field(None, max_length=500)
    thumbnail_url: Optional[str] = None
    is_active: bool = True


class ImageTemplateCreate(ImageTemplateBase):
    pass


class ImageTemplateUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    category_id: Optional[int] = None
    prompt_text: Optional[str] = Field(None, min_length=10, max_length=1000)
    description: Optional[str] = Field(None, max_length=500)
    thumbnail_url: Optional[str] = None
    is_active: Optional[bool] = None


class ImageTemplateResponse(ImageTemplateBase):
    id: int
    created_by: Optional[int]
    created_at: datetime
    updated_at: datetime
    category_name: Optional[str] = None  # Joined from category

    class Config:
        from_attributes = True


class TemplatesListResponse(BaseModel):
    items: List[ImageTemplateResponse]
    total: int


class CategoriesListResponse(BaseModel):
    items: List[ImageCategoryResponse]
    total: int


# Prompt Enhancement
class EnhancePromptRequest(BaseModel):
    prompt: str = Field(..., min_length=10, max_length=500)


class EnhancePromptResponse(BaseModel):
    enhanced_prompt: str
    suggestions: Optional[List[str]] = None


# Image Generation
class GenerateImageRequest(BaseModel):
    prompt: str = Field(..., min_length=10, max_length=500)
    tier: str = Field(default="standard", pattern="^(standard|premium2|premium4)$")
    template_id: Optional[int] = None
    watermark: bool = True
    enhance_prompt: bool = False
    provider: Optional[str] = Field(default=None, pattern="^(auto|openai_dalle|huggingface|gemini_nano_banana|mock)?$")


class GenerateImageResponse(BaseModel):
    job_id: str
    status: str
    credits_debited: int
    estimated_time_seconds: int = 30
    image_url: Optional[str] = None  # Include image_url for synchronous providers


class GenerationStatusResponse(BaseModel):
    job_id: str
    status: str  # queued, running, succeeded, failed
    image_url: Optional[str] = None
    error: Optional[str] = None
    progress_percent: Optional[int] = None
    credits_used: Optional[int] = None


# My Creations
class GeneratedImageDetail(BaseModel):
    id: int
    prompt_text: str
    enhanced_prompt: Optional[str]
    tier: str
    image_url: Optional[str]
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class MyCreationsResponse(BaseModel):
    items: List[GeneratedImageDetail]
    total: int
    next_cursor: Optional[str] = None


# Community Posts
class PublishPostRequest(BaseModel):
    image_id: int
    title: str = Field(..., min_length=5, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    category_id: int
    tags: Optional[List[str]] = None
    visibility: str = Field(default="public", pattern="^(public|private)$")


class PublishPostResponse(BaseModel):
    post_id: int
    image_id: int
    title: str
    created_at: datetime


class CommunityPostCard(BaseModel):
    id: int
    image_url: str
    title: str
    author_name: str
    category_name: str
    likes_count: int
    reuse_count: int
    user_liked: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class CommunityFeedResponse(BaseModel):
    items: List[CommunityPostCard]
    next_cursor: Optional[str] = None


# Likes
class LikePostRequest(BaseModel):
    post_id: int


class LikePostResponse(BaseModel):
    liked: bool
    likes_count: int


# Remix
class RemixOpenResponse(BaseModel):
    template_prompt: str
    enhanced_prompt: str
    source_post_id: int


class RemixRecordRequest(BaseModel):
    generated_image_id: int


class RemixRecordResponse(BaseModel):
    rewarded: bool
    reward_credits: Optional[float] = None
    creator_total_for_asset: Optional[int] = None


# Reports
class ReportPostRequest(BaseModel):
    post_id: int
    reason: str = Field(..., min_length=5, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)


class ReportPostResponse(BaseModel):
    id: int
    post_id: int
    reason: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# Post Details
class CommunityPostDetail(BaseModel):
    id: int
    image_id: int
    user_id: int
    title: str
    description: Optional[str]
    category_id: int
    category_name: Optional[str] = None
    tags: List[str]
    likes_count: int
    reuse_count: int
    visibility: str
    is_hidden: bool
    created_at: datetime
    updated_at: datetime
    # Image details
    image_url: Optional[str] = None
    prompt_text: Optional[str] = None
    enhanced_prompt: Optional[str] = None
    tier: Optional[str] = None
    provider: Optional[str] = None
    # User details
    user_name: Optional[str] = None
    # Current user interaction
    is_liked_by_me: bool = False

    class Config:
        from_attributes = True


# Credits & Wallet
class CreditBalance(BaseModel):
    credits: float
    monthly_used: int
    monthly_remaining: int


class CreditPackOption(BaseModel):
    id: str
    quantity: int
    price_inr: float
    discount_percent: int


class PurchaseCreditsRequest(BaseModel):
    pack_id: Optional[str] = None
    quantity: Optional[int] = None


class PurchaseCreditsResponse(BaseModel):
    order_id: str
    gateway: str
    amount: float
    currency: str = "INR"


class VerifyPurchaseRequest(BaseModel):
    order_id: str
    signature: str


class VerifyPurchaseResponse(BaseModel):
    success: bool
    credits_added: int
    new_balance: float


# Admin - Templates
class ImageTemplateCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    category_id: int
    prompt_text: str = Field(..., min_length=20, max_length=1000)
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None


class ImageTemplateResponse(BaseModel):
    id: int
    title: str
    category_id: int
    prompt_text: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Admin - Categories
class ImageCategoryCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = None
    display_order: int = 0


class ImageCategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    display_order: int
    is_active: bool
    
    class Config:
        from_attributes = True


# Admin - Moderation
class PostReportRequest(BaseModel):
    post_id: int
    reason: str = Field(..., min_length=5, max_length=255)
    description: Optional[str] = None


class PostReportResponse(BaseModel):
    report_id: int
    status: str
    created_at: datetime


class ModerationQueueItem(BaseModel):
    report_id: int
    post_id: int
    reason: str
    reporter_name: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class ModerationActionRequest(BaseModel):
    report_id: int
    action: str = Field(..., pattern="^(hide|delete|warn|dismiss)$")
    notes: Optional[str] = None


# Analytics
class AnalyticsMetrics(BaseModel):
    total_generations: int
    total_credits_spent: float
    total_credits_earned: float
    average_generation_time: float
    most_used_tier: str
    total_posts_published: int
    total_likes_received: int
    total_reuse_rewards: float

