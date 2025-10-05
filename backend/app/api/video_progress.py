"""
Video Progress API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.video_progress import VideoProgress
from app.models.topic import Topic
from app.models.module import Module
from app.models.course import Course
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


# Schemas
class VideoProgressUpdate(BaseModel):
    topic_id: int
    watched_seconds: float
    last_position: float
    completed: bool = False


class VideoProgressResponse(BaseModel):
    id: int
    topic_id: int
    watched_seconds: float
    last_position: float
    completed: bool
    updated_at: datetime

    class Config:
        from_attributes = True


class CourseProgressResponse(BaseModel):
    course_id: int
    course_title: str
    total_topics: int
    completed_topics: int
    total_duration: int  # in seconds
    watched_duration: int  # in seconds
    progress_percentage: float


@router.post("/update", response_model=VideoProgressResponse)
async def update_video_progress(
    progress_data: VideoProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update or create video progress for a topic"""
    
    # Check if topic exists
    topic = db.query(Topic).filter(Topic.id == progress_data.topic_id).first()
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )
    
    # Check if progress already exists
    progress = db.query(VideoProgress).filter(
        VideoProgress.user_id == current_user.id,
        VideoProgress.topic_id == progress_data.topic_id
    ).first()
    
    if progress:
        # Update existing progress
        progress.watched_seconds = progress_data.watched_seconds
        progress.last_position = progress_data.last_position
        progress.completed = progress_data.completed
        progress.updated_at = datetime.utcnow()
    else:
        # Create new progress
        progress = VideoProgress(
            user_id=current_user.id,
            topic_id=progress_data.topic_id,
            watched_seconds=progress_data.watched_seconds,
            last_position=progress_data.last_position,
            completed=progress_data.completed
        )
        db.add(progress)
    
    db.commit()
    db.refresh(progress)
    
    return progress


@router.get("/topic/{topic_id}", response_model=VideoProgressResponse)
async def get_topic_progress(
    topic_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get progress for a specific topic"""
    
    progress = db.query(VideoProgress).filter(
        VideoProgress.user_id == current_user.id,
        VideoProgress.topic_id == topic_id
    ).first()
    
    if not progress:
        # Return default progress if not found
        return VideoProgressResponse(
            id=0,
            topic_id=topic_id,
            watched_seconds=0.0,
            last_position=0.0,
            completed=False,
            updated_at=datetime.utcnow()
        )
    
    return progress


@router.get("/course/{course_id}", response_model=CourseProgressResponse)
async def get_course_progress(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get overall progress for a course"""
    
    # Get course
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Get all modules for this course
    modules = db.query(Module).filter(Module.course_id == course_id).all()
    
    # Get all topics for these modules
    module_ids = [m.id for m in modules]
    topics = db.query(Topic).filter(Topic.module_id.in_(module_ids)).all()
    
    total_topics = len(topics)
    total_duration = sum(t.duration or 0 for t in topics)
    
    # Get progress for all topics
    topic_ids = [t.id for t in topics]
    progress_records = db.query(VideoProgress).filter(
        VideoProgress.user_id == current_user.id,
        VideoProgress.topic_id.in_(topic_ids)
    ).all()
    
    completed_topics = sum(1 for p in progress_records if p.completed)
    watched_duration = sum(p.watched_seconds for p in progress_records)
    
    # Calculate progress percentage
    if total_topics > 0:
        progress_percentage = (completed_topics / total_topics) * 100
    else:
        progress_percentage = 0.0
    
    return CourseProgressResponse(
        course_id=course_id,
        course_title=course.title,
        total_topics=total_topics,
        completed_topics=completed_topics,
        total_duration=total_duration,
        watched_duration=int(watched_duration),
        progress_percentage=round(progress_percentage, 2)
    )


@router.get("/my-progress", response_model=List[CourseProgressResponse])
async def get_my_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get progress for all courses the user has access to"""
    
    # Get all courses (we'll filter by access in the frontend)
    courses = db.query(Course).filter(Course.is_published == True).all()
    
    progress_list = []
    
    for course in courses:
        # Get all modules for this course
        modules = db.query(Module).filter(Module.course_id == course.id).all()
        
        # Get all topics for these modules
        module_ids = [m.id for m in modules]
        topics = db.query(Topic).filter(Topic.module_id.in_(module_ids)).all()
        
        total_topics = len(topics)
        total_duration = sum(t.duration or 0 for t in topics)
        
        # Get progress for all topics
        topic_ids = [t.id for t in topics]
        progress_records = db.query(VideoProgress).filter(
            VideoProgress.user_id == current_user.id,
            VideoProgress.topic_id.in_(topic_ids)
        ).all()
        
        completed_topics = sum(1 for p in progress_records if p.completed)
        watched_duration = sum(p.watched_seconds for p in progress_records)
        
        # Calculate progress percentage
        if total_topics > 0:
            progress_percentage = (completed_topics / total_topics) * 100
        else:
            progress_percentage = 0.0
        
        # Only include courses with some progress
        if completed_topics > 0 or watched_duration > 0:
            progress_list.append(CourseProgressResponse(
                course_id=course.id,
                course_title=course.title,
                total_topics=total_topics,
                completed_topics=completed_topics,
                total_duration=total_duration,
                watched_duration=int(watched_duration),
                progress_percentage=round(progress_percentage, 2)
            ))
    
    return progress_list


@router.post("/mark-complete/{topic_id}")
async def mark_topic_complete(
    topic_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a topic as completed"""
    
    # Check if topic exists
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )
    
    # Check if progress already exists
    progress = db.query(VideoProgress).filter(
        VideoProgress.user_id == current_user.id,
        VideoProgress.topic_id == topic_id
    ).first()
    
    if progress:
        progress.completed = True
        progress.watched_seconds = topic.duration or 0
        progress.last_position = topic.duration or 0
        progress.updated_at = datetime.utcnow()
    else:
        progress = VideoProgress(
            user_id=current_user.id,
            topic_id=topic_id,
            watched_seconds=topic.duration or 0,
            last_position=topic.duration or 0,
            completed=True
        )
        db.add(progress)
    
    db.commit()
    
    return {"message": "Topic marked as complete", "topic_id": topic_id}

