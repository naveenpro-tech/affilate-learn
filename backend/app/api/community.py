"""
Community Features API Routes
Endpoints for community posts, likes, reports, and remixes
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_admin_user
from app.models import User, GeneratedImage, CommunityPost, PostLike, PostReport, PromptReuseEvent, ImageCategory, Profile, Comment
from app.schemas.studio import (
    PublishPostRequest, PublishPostResponse,
    CommunityPostCard, CommunityFeedResponse, CommunityPostDetail,
    LikePostRequest, LikePostResponse,
    ReportPostRequest, ReportPostResponse,
    RemixOpenResponse, RemixRecordRequest, RemixRecordResponse,
)
from app.services.notification_service import notify_post_liked
from app.services.reward_service import (
    check_first_post_reward,
    check_post_milestone_rewards,
    check_likes_milestone_reward,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/community", tags=["community"])


# ============================================================================
# PUBLISH POST
# ============================================================================

@router.post("/publish", response_model=PublishPostResponse)
async def publish_post(
    request: PublishPostRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Publish a generated image to the community feed
    POST /api/studio/community/publish
    """
    try:
        # Verify image exists and belongs to user
        image = db.query(GeneratedImage).filter(
            GeneratedImage.id == request.image_id,
            GeneratedImage.user_id == current_user.id,
            GeneratedImage.status == "succeeded",
        ).first()
        
        if not image:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Image not found or not owned by you"
            )
        
        # Check if already published
        existing_post = db.query(CommunityPost).filter(
            CommunityPost.image_id == request.image_id
        ).first()
        
        if existing_post:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Image already published to community"
            )
        
        # Verify category exists
        category = db.query(ImageCategory).filter(
            ImageCategory.id == request.category_id,
            ImageCategory.is_active == True
        ).first()
        
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
        
        # Create community post
        post = CommunityPost(
            image_id=request.image_id,
            user_id=current_user.id,
            title=request.title,
            description=request.description,
            category_id=request.category_id,
            tags=request.tags or [],
            visibility=request.visibility,
        )
        
        db.add(post)
        db.commit()
        db.refresh(post)

        logger.info(f"User {current_user.id} published post {post.id}")

        # Check for rewards
        try:
            check_first_post_reward(db, current_user.id)
            check_post_milestone_rewards(db, current_user.id)
        except Exception as e:
            logger.warning(f"Failed to check post rewards: {e}")

        return PublishPostResponse(
            post_id=post.id,
            image_id=post.image_id,
            title=post.title,
            created_at=post.created_at,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error publishing post: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to publish post"
        )


# ============================================================================
# COMMUNITY FEED
# ============================================================================

@router.get("/feed", response_model=CommunityFeedResponse)
async def get_community_feed(
    cursor: int = 0,
    limit: int = 20,
    category_id: int | None = None,
    search: str | None = None,
    tier: str | None = None,
    provider: str | None = None,
    sort_by: str = "newest",  # newest, popular, trending, most_remixed
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get community feed with pagination, search, and filters
    GET /api/studio/community/feed

    Query Parameters:
    - cursor: Pagination cursor (default: 0)
    - limit: Number of items per page (default: 20, max: 50)
    - category_id: Filter by category ID
    - search: Search in title and description
    - tier: Filter by quality tier (standard, premium, premium4)
    - provider: Filter by provider (mock, huggingface, openai_dalle, gemini_nano_banana)
    - sort_by: Sort order (newest, popular, trending, most_remixed)
    """
    try:
        # Limit max items per page
        limit = min(limit, 50)

        # Build base query with joins
        query = db.query(CommunityPost).join(
            GeneratedImage, CommunityPost.image_id == GeneratedImage.id
        ).filter(
            CommunityPost.visibility == "public",
            CommunityPost.is_hidden == False,
        )

        # Filter by category if provided
        if category_id:
            query = query.filter(CommunityPost.category_id == category_id)

        # Search in title and description
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (CommunityPost.title.ilike(search_term)) |
                (CommunityPost.description.ilike(search_term))
            )

        # Filter by tier
        if tier:
            query = query.filter(GeneratedImage.tier == tier)

        # Filter by provider
        if provider:
            query = query.filter(GeneratedImage.provider == provider)

        # Apply sorting
        if sort_by == "popular":
            # Sort by likes count
            query = query.order_by(desc(CommunityPost.likes_count))
        elif sort_by == "trending":
            # Sort by likes in last 7 days (simplified: just by likes for now)
            query = query.order_by(desc(CommunityPost.likes_count))
        elif sort_by == "most_remixed":
            # Sort by reuse count
            query = query.order_by(desc(CommunityPost.reuse_count))
        else:  # newest (default)
            query = query.order_by(desc(CommunityPost.created_at))

        # Paginate
        posts = query.offset(cursor).limit(limit + 1).all()
        
        has_next = len(posts) > limit
        items = posts[:limit]
        
        # Build response with enriched data
        result_items = []
        for post in items:
            # Get user info
            user = db.query(User).filter(User.id == post.user_id).first()

            # Get user profile for avatar
            profile = db.query(Profile).filter(Profile.user_id == post.user_id).first()

            # Get category info
            category = db.query(ImageCategory).filter(ImageCategory.id == post.category_id).first()

            # Check if current user liked this post
            user_liked = db.query(PostLike).filter(
                PostLike.post_id == post.id,
                PostLike.user_id == current_user.id
            ).first() is not None

            # Count comments for this post
            comments_count = db.query(Comment).filter(
                Comment.post_id == post.id,
                Comment.is_deleted == False
            ).count()

            result_items.append(CommunityPostCard(
                id=post.id,
                image_url=post.image.image_url if post.image else "",
                title=post.title,
                author_name=user.full_name if user else "Unknown",
                author_avatar_url=profile.avatar_url if profile else None,
                category_name=category.name if category else "Uncategorized",
                likes_count=post.likes_count,
                reuse_count=post.reuse_count,
                comments_count=comments_count,
                user_liked=user_liked,
                created_at=post.created_at,
            ))
        
        return CommunityFeedResponse(
            items=result_items,
            next_cursor=str(cursor + limit) if has_next else None,
        )
        
    except Exception as e:
        logger.error(f"Error getting community feed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get community feed"
        )


# ============================================================================
# POST DETAILS
# ============================================================================

@router.get("/posts/{post_id}", response_model=CommunityPostDetail)
async def get_post_details(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get detailed information about a community post
    GET /api/studio/community/posts/{post_id}
    """
    try:
        post = db.query(CommunityPost).filter(
            CommunityPost.id == post_id,
            CommunityPost.is_hidden == False,
        ).first()
        
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )
        
        # Check visibility
        if post.visibility == "private" and post.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to view this post"
            )
        
        # Get enriched data
        user = db.query(User).filter(User.id == post.user_id).first()
        category = db.query(ImageCategory).filter(ImageCategory.id == post.category_id).first()
        image = db.query(GeneratedImage).filter(GeneratedImage.id == post.image_id).first()
        
        # Check if current user liked this post
        is_liked = db.query(PostLike).filter(
            PostLike.post_id == post.id,
            PostLike.user_id == current_user.id
        ).first() is not None
        
        return CommunityPostDetail(
            id=post.id,
            image_id=post.image_id,
            user_id=post.user_id,
            title=post.title,
            description=post.description,
            category_id=post.category_id,
            category_name=category.name if category else None,
            tags=post.tags or [],
            likes_count=post.likes_count,
            reuse_count=post.reuse_count,
            visibility=post.visibility,
            is_hidden=post.is_hidden,
            created_at=post.created_at,
            updated_at=post.updated_at,
            image_url=image.image_url if image else None,
            prompt_text=image.prompt_text if image else None,
            enhanced_prompt=image.enhanced_prompt if image else None,
            tier=image.tier if image else None,
            provider=image.provider if image else None,
            user_name=user.full_name if user else None,
            is_liked_by_me=is_liked,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting post details: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get post details"
        )


# ============================================================================
# LIKES
# ============================================================================

@router.post("/posts/{post_id}/like", response_model=LikePostResponse)
async def toggle_like(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Toggle like on a community post
    POST /api/studio/community/posts/{post_id}/like
    """
    try:
        # Verify post exists
        post = db.query(CommunityPost).filter(
            CommunityPost.id == post_id,
            CommunityPost.is_hidden == False,
        ).first()
        
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )
        
        # Check if already liked
        existing_like = db.query(PostLike).filter(
            PostLike.post_id == post_id,
            PostLike.user_id == current_user.id
        ).first()
        
        if existing_like:
            # Unlike
            db.delete(existing_like)
            post.likes_count = max(0, post.likes_count - 1)
            liked = False
        else:
            # Like
            new_like = PostLike(
                post_id=post_id,
                user_id=current_user.id
            )
            db.add(new_like)
            post.likes_count += 1
            liked = True

            # Send notification to post owner (if not liking own post)
            if post.user_id != current_user.id:
                try:
                    liker_name = current_user.full_name or current_user.email
                    notify_post_liked(
                        db=db,
                        post_owner_id=post.user_id,
                        liker_name=liker_name,
                        post_id=post_id,
                        from_user_id=current_user.id
                    )
                except Exception as e:
                    logger.warning(f"Failed to send like notification: {e}")

        db.commit()
        db.refresh(post)

        # Check for likes milestone reward (if liked, not unliked)
        if liked:
            try:
                check_likes_milestone_reward(db, post_id)
            except Exception as e:
                logger.warning(f"Failed to check likes milestone reward: {e}")

        return LikePostResponse(
            liked=liked,
            likes_count=post.likes_count
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error toggling like: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to toggle like"
        )


# ============================================================================
# REPORTS
# ============================================================================

@router.post("/posts/{post_id}/report", response_model=ReportPostResponse)
async def report_post(
    post_id: int,
    request: ReportPostRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Report a community post for moderation
    POST /api/studio/community/posts/{post_id}/report
    """
    try:
        # Verify post exists
        post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()

        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )

        # Check if user already reported this post
        existing_report = db.query(PostReport).filter(
            PostReport.post_id == post_id,
            PostReport.user_id == current_user.id,
            PostReport.status == "open"
        ).first()

        if existing_report:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already reported this post"
            )

        # Create report
        report = PostReport(
            post_id=post_id,
            user_id=current_user.id,
            reason=request.reason,
            description=request.description,
            status="open"
        )

        db.add(report)
        db.commit()
        db.refresh(report)

        logger.info(f"User {current_user.id} reported post {post_id}")

        return ReportPostResponse(
            id=report.id,
            post_id=report.post_id,
            reason=report.reason,
            status=report.status,
            created_at=report.created_at
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reporting post: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to report post"
        )


# ============================================================================
# REMIX / REUSE
# ============================================================================

@router.get("/posts/{post_id}/remix", response_model=RemixOpenResponse)
async def get_remix_prompt(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get prompt from a community post for remixing
    GET /api/studio/community/posts/{post_id}/remix
    """
    try:
        post = db.query(CommunityPost).filter(
            CommunityPost.id == post_id,
            CommunityPost.is_hidden == False,
        ).first()

        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )

        # Get image details
        image = db.query(GeneratedImage).filter(GeneratedImage.id == post.image_id).first()

        if not image:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Image not found"
            )

        return RemixOpenResponse(
            template_prompt=image.prompt_text or "",
            enhanced_prompt=image.enhanced_prompt or "",
            source_post_id=post.id
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting remix prompt: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get remix prompt"
        )


@router.post("/posts/{post_id}/remix/record", response_model=RemixRecordResponse)
async def record_remix(
    post_id: int,
    request: RemixRecordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Record that a user remixed a post (after generating new image)
    POST /api/studio/community/posts/{post_id}/remix/record
    """
    try:
        # Verify source post exists
        source_post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()

        if not source_post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Source post not found"
            )

        # Verify new image exists and belongs to current user
        new_image = db.query(GeneratedImage).filter(
            GeneratedImage.id == request.generated_image_id,
            GeneratedImage.user_id == current_user.id
        ).first()

        if not new_image:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Generated image not found"
            )

        # Check if already recorded
        existing_reuse = db.query(PromptReuseEvent).filter(
            PromptReuseEvent.source_post_id == post_id,
            PromptReuseEvent.remixer_user_id == current_user.id,
            PromptReuseEvent.remixed_image_id == request.generated_image_id
        ).first()

        if existing_reuse:
            return RemixRecordResponse(
                rewarded=existing_reuse.rewarded,
                reward_credits=existing_reuse.reward_credits,
                creator_total_for_asset=source_post.reuse_count
            )

        # Create reuse event
        reuse_event = PromptReuseEvent(
            source_post_id=post_id,
            remixer_user_id=current_user.id,
            remixed_image_id=request.generated_image_id,
            rewarded=False,  # Reward logic can be added later
            reward_credits=0.0
        )

        db.add(reuse_event)

        # Increment reuse count on source post
        source_post.reuse_count += 1

        db.commit()
        db.refresh(source_post)

        logger.info(f"User {current_user.id} remixed post {post_id}")

        return RemixRecordResponse(
            rewarded=False,
            reward_credits=None,
            creator_total_for_asset=source_post.reuse_count
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error recording remix: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record remix"
        )


# ============================================================================
# USER PROFILES
# ============================================================================

@router.get("/users/{user_id}/profile")
def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get user profile with statistics"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Get statistics
        total_posts = db.query(CommunityPost).filter(
            CommunityPost.user_id == user_id,
            CommunityPost.visibility == 'public',
            CommunityPost.is_hidden == False
        ).count()

        total_likes = db.query(func.sum(CommunityPost.likes_count)).filter(
            CommunityPost.user_id == user_id
        ).scalar() or 0

        total_remixes = db.query(func.sum(CommunityPost.reuse_count)).filter(
            CommunityPost.user_id == user_id
        ).scalar() or 0

        return {
            'user_id': user.id,
            'user_name': user.full_name,
            'total_posts': total_posts,
            'total_likes_received': total_likes,
            'total_remixes': total_remixes,
            'member_since': user.created_at.isoformat() if hasattr(user, 'created_at') else None
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user profile"
        )


@router.get("/users/{user_id}/posts")
def get_user_posts(
    user_id: int,
    cursor: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get user's public posts"""
    try:
        # Build query
        query = db.query(CommunityPost).filter(
            CommunityPost.user_id == user_id,
            CommunityPost.visibility == 'public',
            CommunityPost.is_hidden == False
        )

        # Pagination
        total = query.count()
        posts = query.order_by(desc(CommunityPost.created_at)).offset(cursor).limit(limit).all()

        # Enrich posts
        items = []
        for post in posts:
            user = db.query(User).filter(User.id == post.user_id).first()
            category = db.query(ImageCategory).filter(ImageCategory.id == post.category_id).first()

            items.append({
                'id': post.id,
                'image_url': post.image.image_url if post.image else None,
                'title': post.title,
                'author_name': user.full_name if user else 'Unknown',
                'category_name': category.name if category else None,
                'likes_count': post.likes_count,
                'reuse_count': post.reuse_count,
                'user_liked': False,  # Not checking for specific user
                'created_at': post.created_at.isoformat()
            })

        next_cursor = cursor + limit if cursor + limit < total else None

        return {
            'items': items,
            'total': total,
            'cursor': cursor,
            'next_cursor': next_cursor
        }

    except Exception as e:
        logger.error(f"Error getting user posts: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user posts"
        )

