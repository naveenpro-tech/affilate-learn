from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
import logging

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.studio import CommunityPost
from app.models.comment import Comment
from app.schemas.comment import CommentCreate, CommentUpdate, CommentResponse, CommentListResponse
from app.services.notification_service import notify_post_commented

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/posts/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    post_id: int,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new comment on a post"""
    # Verify post exists and is not hidden
    post = db.query(CommunityPost).filter(
        CommunityPost.id == post_id,
        CommunityPost.is_hidden == False
    ).first()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Create comment
    comment = Comment(
        post_id=post_id,
        user_id=current_user.id,
        text=comment_data.text
    )
    
    db.add(comment)
    db.commit()
    db.refresh(comment)

    # Send notification to post owner (if not commenting on own post)
    if post.user_id != current_user.id:
        try:
            commenter_name = current_user.full_name or current_user.email
            notify_post_commented(
                db=db,
                post_owner_id=post.user_id,
                commenter_name=commenter_name,
                post_id=post_id,
                comment_id=comment.id,
                from_user_id=current_user.id
            )
        except Exception as e:
            logger.warning(f"Failed to send comment notification: {e}")

    # Build response
    response = CommentResponse(
        id=comment.id,
        post_id=comment.post_id,
        user_id=comment.user_id,
        user_name=current_user.username,
        text=comment.text,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
        is_own=True
    )

    return response


@router.get("/posts/{post_id}/comments", response_model=CommentListResponse)
def get_comments(
    post_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all comments for a post"""
    # Verify post exists
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Get comments
    query = db.query(Comment).join(User).filter(
        Comment.post_id == post_id,
        Comment.is_deleted == False
    ).order_by(desc(Comment.created_at))
    
    total = query.count()
    comments = query.offset(skip).limit(limit).all()
    
    # Build responses
    items = []
    for comment in comments:
        user = db.query(User).filter(User.id == comment.user_id).first()
        items.append(CommentResponse(
            id=comment.id,
            post_id=comment.post_id,
            user_id=comment.user_id,
            user_name=user.username if user else "Unknown",
            text=comment.text,
            created_at=comment.created_at,
            updated_at=comment.updated_at,
            is_own=(comment.user_id == current_user.id)
        ))
    
    return CommentListResponse(
        items=items,
        total=total,
        skip=skip,
        limit=limit
    )


@router.put("/comments/{comment_id}", response_model=CommentResponse)
def update_comment(
    comment_id: int,
    comment_data: CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a comment (only by owner)"""
    comment = db.query(Comment).filter(
        Comment.id == comment_id,
        Comment.is_deleted == False
    ).first()
    
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Check ownership
    if comment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own comments"
        )
    
    # Update comment
    comment.text = comment_data.text
    db.commit()
    db.refresh(comment)
    
    # Build response
    response = CommentResponse(
        id=comment.id,
        post_id=comment.post_id,
        user_id=comment.user_id,
        user_name=current_user.username,
        text=comment.text,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
        is_own=True
    )
    
    return response


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a comment (by owner or admin)"""
    comment = db.query(Comment).filter(
        Comment.id == comment_id,
        Comment.is_deleted == False
    ).first()
    
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Check ownership or admin
    if comment.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own comments"
        )
    
    # Soft delete
    comment.is_deleted = True
    db.commit()
    
    return None


@router.get("/posts/{post_id}/comments/count")
def get_comment_count(
    post_id: int,
    db: Session = Depends(get_db)
):
    """Get comment count for a post"""
    count = db.query(Comment).filter(
        Comment.post_id == post_id,
        Comment.is_deleted == False
    ).count()
    
    return {"count": count}

