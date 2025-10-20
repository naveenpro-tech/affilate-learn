"""
Community AI Studio Models
- ImageTemplate: Predefined templates for image generation
- ImageCategory: Categories for organizing templates and posts
- GeneratedImage: User-generated images from the studio
- CommunityPost: Published images shared in the community feed
- PostLike: Likes on community posts
- PostReport: Moderation reports on community posts
- PromptReuseEvent: Tracking when users remix/reuse prompts
- CreditLedger: Transaction log for credit economy
- ReferralEvent: Tracking referral bonuses and milestones
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Float, JSON, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
import enum


class ImageTemplate(Base):
    """Predefined templates for image generation"""
    __tablename__ = "image_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category_id = Column(Integer, ForeignKey("image_categories.id"), nullable=False)
    prompt_text = Column(Text, nullable=False)
    description = Column(String(500), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    category = relationship("ImageCategory", back_populates="templates")
    creator = relationship("User", foreign_keys=[created_by])


class ImageCategory(Base):
    """Categories for organizing templates and posts"""
    __tablename__ = "image_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(String(500), nullable=True)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    templates = relationship("ImageTemplate", back_populates="category")
    posts = relationship("CommunityPost", back_populates="category")


class GeneratedImage(Base):
    """User-generated images from the studio"""
    __tablename__ = "generated_images"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    template_id = Column(Integer, ForeignKey("image_templates.id"), nullable=True)
    prompt_text = Column(Text, nullable=False)
    enhanced_prompt = Column(Text, nullable=True)
    tier = Column(String(20), default="standard")  # standard, premium2, premium4
    image_url = Column(String(500), nullable=True)
    width = Column(Integer, default=1024)
    height = Column(Integer, default=1024)
    provider = Column(String(50), default="replicate")  # replicate, stability, etc.
    job_id = Column(String(255), nullable=True, unique=True)  # Provider's job ID
    status = Column(String(20), default="queued")  # queued, running, succeeded, failed
    error_message = Column(Text, nullable=True)
    credits_spent = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    template = relationship("ImageTemplate")


class CommunityPost(Base):
    """Published images shared in the community feed"""
    __tablename__ = "community_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    image_id = Column(Integer, ForeignKey("generated_images.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey("image_categories.id"), nullable=False)
    tags = Column(JSON, default=list)  # List of tags
    likes_count = Column(Integer, default=0)
    reuse_count = Column(Integer, default=0)
    visibility = Column(String(20), default="public")  # public, private
    is_hidden = Column(Boolean, default=False)  # Moderation flag
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    image = relationship("GeneratedImage")
    user = relationship("User", foreign_keys=[user_id])
    category = relationship("ImageCategory", back_populates="posts")
    likes = relationship("PostLike", back_populates="post", cascade="all, delete-orphan")
    reports = relationship("PostReport", back_populates="post", cascade="all, delete-orphan")
    reuse_events = relationship("PromptReuseEvent", back_populates="source_post")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")


class PostLike(Base):
    """Likes on community posts"""
    __tablename__ = "post_likes"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("community_posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    post = relationship("CommunityPost", back_populates="likes")
    user = relationship("User")
    
    # Unique constraint: one like per user per post
    __table_args__ = (
        __import__('sqlalchemy').UniqueConstraint('post_id', 'user_id', name='uq_post_user_like'),
    )


class PostReport(Base):
    """Moderation reports on community posts"""
    __tablename__ = "post_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("community_posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reason = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="open")  # open, closed, resolved
    acted_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # Admin who acted
    action_taken = Column(String(50), nullable=True)  # hide, delete, warn
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    post = relationship("CommunityPost", back_populates="reports")
    reporter = relationship("User", foreign_keys=[user_id])
    admin = relationship("User", foreign_keys=[acted_by])


class PromptReuseEvent(Base):
    """Tracking when users remix/reuse prompts"""
    __tablename__ = "prompt_reuse_events"
    
    id = Column(Integer, primary_key=True, index=True)
    source_post_id = Column(Integer, ForeignKey("community_posts.id"), nullable=False)
    remixer_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    remixed_image_id = Column(Integer, ForeignKey("generated_images.id"), nullable=False)
    rewarded = Column(Boolean, default=False)
    reward_credits = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    source_post = relationship("CommunityPost", back_populates="reuse_events")
    remixer = relationship("User", foreign_keys=[remixer_user_id])
    remixed_image = relationship("GeneratedImage")
    
    # Unique constraint: one reuse per remixer per source post per image
    __table_args__ = (
        __import__('sqlalchemy').UniqueConstraint(
            'source_post_id', 'remixer_user_id', 'remixed_image_id',
            name='uq_reuse_event'
        ),
    )


class CreditLedger(Base):
    """Transaction log for credit economy"""
    __tablename__ = "credit_ledger"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    delta = Column(Float, nullable=False)  # Positive or negative
    reason = Column(String(50), nullable=False)  # generation, reward, purchase, referral, admin
    ref_id = Column(String(255), nullable=True)  # Reference to related entity (image_id, order_id, etc.)
    idempotency_key = Column(String(255), unique=True, nullable=True)  # For idempotent operations
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")


class ReferralEvent(Base):
    """Tracking referral bonuses and milestones"""
    __tablename__ = "referral_events"
    
    id = Column(Integer, primary_key=True, index=True)
    referrer_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    referee_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_type = Column(String(50), nullable=False)  # signup, first_generation, milestone
    milestone_count = Column(Integer, nullable=True)  # For milestone events (e.g., 10 qualified signups)
    credits_awarded = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    referrer = relationship("User", foreign_keys=[referrer_user_id])
    referee = relationship("User", foreign_keys=[referee_user_id])

