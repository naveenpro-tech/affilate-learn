from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.studio import GeneratedImage, CommunityPost, PostLike, CreditLedger

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/my-stats")
async def get_user_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get analytics for the current user
    """
    # Image generation stats
    total_images = db.query(func.count(GeneratedImage.id)).filter(
        GeneratedImage.user_id == current_user.id
    ).scalar()
    
    successful_images = db.query(func.count(GeneratedImage.id)).filter(
        GeneratedImage.user_id == current_user.id,
        GeneratedImage.status == 'succeeded'
    ).scalar()
    
    # Post stats
    total_posts = db.query(func.count(CommunityPost.id)).filter(
        CommunityPost.user_id == current_user.id
    ).scalar()
    
    public_posts = db.query(func.count(CommunityPost.id)).filter(
        CommunityPost.user_id == current_user.id,
        CommunityPost.visibility == 'public'
    ).scalar()
    
    # Engagement stats
    total_likes_received = db.query(func.sum(CommunityPost.likes_count)).filter(
        CommunityPost.user_id == current_user.id
    ).scalar() or 0
    
    total_remixes = db.query(func.sum(CommunityPost.reuse_count)).filter(
        CommunityPost.user_id == current_user.id
    ).scalar() or 0
    
    # Credit stats
    credits_earned = db.query(func.sum(CreditLedger.amount)).filter(
        CreditLedger.user_id == current_user.id,
        CreditLedger.transaction_type == 'reward'
    ).scalar() or 0
    
    credits_spent = db.query(func.sum(CreditLedger.amount)).filter(
        CreditLedger.user_id == current_user.id,
        CreditLedger.transaction_type == 'generation'
    ).scalar() or 0
    
    # Most popular post
    most_popular_post = db.query(CommunityPost).filter(
        CommunityPost.user_id == current_user.id
    ).order_by(desc(CommunityPost.likes_count)).first()
    
    # Recent activity (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    recent_images = db.query(func.count(GeneratedImage.id)).filter(
        GeneratedImage.user_id == current_user.id,
        GeneratedImage.created_at >= thirty_days_ago
    ).scalar()
    
    recent_posts = db.query(func.count(CommunityPost.id)).filter(
        CommunityPost.user_id == current_user.id,
        CommunityPost.created_at >= thirty_days_ago
    ).scalar()
    
    return {
        'images': {
            'total': total_images,
            'successful': successful_images,
            'recent_30_days': recent_images,
        },
        'posts': {
            'total': total_posts,
            'public': public_posts,
            'recent_30_days': recent_posts,
        },
        'engagement': {
            'total_likes': total_likes_received,
            'total_remixes': total_remixes,
            'avg_likes_per_post': round(total_likes_received / total_posts, 2) if total_posts > 0 else 0,
        },
        'credits': {
            'earned': credits_earned,
            'spent': abs(credits_spent),
            'current_balance': current_user.credits_balance or 0,
        },
        'most_popular_post': {
            'id': most_popular_post.id if most_popular_post else None,
            'title': most_popular_post.title if most_popular_post else None,
            'likes': most_popular_post.likes_count if most_popular_post else 0,
        } if most_popular_post else None,
    }


@router.get("/post/{post_id}/stats")
async def get_post_analytics(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get analytics for a specific post
    """
    # Verify post exists and belongs to user
    post = db.query(CommunityPost).filter(
        CommunityPost.id == post_id,
        CommunityPost.user_id == current_user.id
    ).first()
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Get likes over time (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    likes_by_day = db.query(
        func.date(PostLike.created_at).label('date'),
        func.count(PostLike.id).label('count')
    ).filter(
        PostLike.post_id == post_id,
        PostLike.created_at >= thirty_days_ago
    ).group_by(func.date(PostLike.created_at)).all()
    
    # Get comments count
    from app.models.comment import Comment
    comments_count = db.query(func.count(Comment.id)).filter(
        Comment.post_id == post_id,
        ~Comment.is_deleted
    ).scalar()
    
    return {
        'post_id': post.id,
        'title': post.title,
        'created_at': post.created_at,
        'total_likes': post.likes_count,
        'total_remixes': post.reuse_count,
        'total_comments': comments_count,
        'visibility': post.visibility,
        'likes_by_day': [
            {'date': str(day.date), 'count': day.count}
            for day in likes_by_day
        ],
    }


@router.get("/growth")
async def get_growth_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get growth metrics over time
    """
    # Get posts by month (last 6 months)
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    
    posts_by_month = db.query(
        func.strftime('%Y-%m', CommunityPost.created_at).label('month'),
        func.count(CommunityPost.id).label('count')
    ).filter(
        CommunityPost.user_id == current_user.id,
        CommunityPost.created_at >= six_months_ago
    ).group_by(func.strftime('%Y-%m', CommunityPost.created_at)).all()
    
    # Get images by month
    images_by_month = db.query(
        func.strftime('%Y-%m', GeneratedImage.created_at).label('month'),
        func.count(GeneratedImage.id).label('count')
    ).filter(
        GeneratedImage.user_id == current_user.id,
        GeneratedImage.created_at >= six_months_ago
    ).group_by(func.strftime('%Y-%m', GeneratedImage.created_at)).all()
    
    return {
        'posts_by_month': [
            {'month': month.month, 'count': month.count}
            for month in posts_by_month
        ],
        'images_by_month': [
            {'month': month.month, 'count': month.count}
            for month in images_by_month
        ],
    }

