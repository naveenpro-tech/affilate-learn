from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import tempfile

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_admin_user
from app.models.user import User
from app.models.course import Course
from app.models.video import Video
from app.models.package import Package
from app.models.user_package import UserPackage
from app.schemas.course import (
    CourseResponse, CourseCreate, CourseUpdate, CourseWithVideos, CourseWithModules,
    VideoResponse, VideoCreate, VideoUpdate
)
from app.models.module import Module
from app.models.topic import Topic
from app.services.cloudinary_service import cloudinary_service
from app.models.video_progress import VideoProgress
from app.schemas.progress import VideoProgressCreate, VideoProgressResponse

from app.models.certificate import Certificate
from app.schemas.certificate import CertificateResponse

router = APIRouter()


def check_user_access(user: User, course: Course, db: Session) -> bool:
    """Check if user has access to a course based on their package"""
    if user.is_admin:
        return True

    # Get user's active package
    user_package = db.query(UserPackage).filter(
        UserPackage.user_id == user.id,
        UserPackage.status == "active"
    ).order_by(UserPackage.purchase_date.desc()).first()

    if not user_package:
        return False

    # Get package hierarchy
    package_hierarchy = {"Silver": 1, "Gold": 2, "Platinum": 3}

    user_pkg = db.query(Package).filter(Package.id == user_package.package_id).first()
    course_pkg = db.query(Package).filter(Package.id == course.package_id).first()

    if not user_pkg or not course_pkg:
        return False

    # User can access courses of their package level or lower
    return package_hierarchy.get(user_pkg.name, 0) >= package_hierarchy.get(course_pkg.name, 0)


@router.get("/", response_model=List[CourseWithVideos])
def get_courses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all courses accessible to the current user
    """
    # Get user's package
    user_package = db.query(UserPackage).filter(
        UserPackage.user_id == current_user.id,
        UserPackage.status == "active"
    ).order_by(UserPackage.purchase_date.desc()).first()

    if not user_package and not current_user.is_admin:
        return []

    # Get accessible courses
    if current_user.is_admin:
        courses = db.query(Course).order_by(Course.display_order).all()
    else:
        # Get package hierarchy
        package_hierarchy = {"Silver": 1, "Gold": 2, "Platinum": 3}
        user_pkg = db.query(Package).filter(Package.id == user_package.package_id).first()
        user_level = package_hierarchy.get(user_pkg.name, 0)

        # Get all packages at or below user's level
        accessible_packages = db.query(Package).filter(
            Package.name.in_([k for k, v in package_hierarchy.items() if v <= user_level])
        ).all()

        package_ids = [pkg.id for pkg in accessible_packages]

        courses = db.query(Course).filter(
            Course.package_id.in_(package_ids),
            Course.is_published == True
        ).order_by(Course.display_order).all()

    # Build response with videos
    result = []
    for course in courses:
        videos = db.query(Video).filter(
            Video.course_id == course.id,
            Video.is_published == True
        ).order_by(Video.display_order).all()

        package = db.query(Package).filter(Package.id == course.package_id).first()

        course_data = {
            **course.__dict__,
            "videos": videos,
            "package_name": package.name if package else None,
            "video_count": len(videos)
        }
        result.append(course_data)

    return result


@router.get("/{course_id}", response_model=CourseWithVideos)
def get_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific course with videos
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Check access
    if not check_user_access(current_user, course, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this course"
        )

    # Get videos
    videos = db.query(Video).filter(Video.course_id == course_id).order_by(Video.display_order).all()

    return {
        **course.__dict__,
        "videos": videos,
        "package_name": Package.query.filter(Package.id == course.package_tier).first().name if course.package_tier else None
    }


@router.get("/{course_id}/with-modules", response_model=CourseWithModules)
def get_course_with_modules(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a course with its modules and topics (new hierarchical structure)
    """
    Module.__table__.create(bind=engine, checkfirst=True)
    Topic.__table__.create(bind=engine, checkfirst=True)

    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Check access
    if not check_user_access(current_user, course, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this course"
        )

    # Get package name
    package = db.query(Package).filter(Package.id == course.package_id).first()

    # Count total topics
    total_topics = 0
    for module in course.modules:
        total_topics += len(module.topics)

    return {
        **course.__dict__,
        "modules": course.modules,
        "package_name": package.name if package else None,
        "total_topics": total_topics
    }


@router.post("/", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(
    course_data: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Create a new course (Admin only)
    """
    # Check if slug exists
    existing = db.query(Course).filter(Course.slug == course_data.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Course with this slug already exists"
        )

    # Verify package exists
    package = db.query(Package).filter(Package.id == course_data.package_id).first()
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found"
        )

    new_course = Course(**course_data.dict())
    db.add(new_course)
    db.commit()
    db.refresh(new_course)

    return new_course


@router.put("/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: int,
    course_data: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Update a course (Admin only)
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    update_data = course_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(course, field, value)

    db.commit()
    db.refresh(course)

    return course


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Delete a course (Admin only)
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Delete associated videos from Cloudinary
    videos = db.query(Video).filter(Video.course_id == course_id).all()
    for video in videos:
        try:
            cloudinary_service.delete_video(video.cloudinary_public_id)
        except Exception as e:
            print(f"Error deleting video from Cloudinary: {e}")

    db.delete(course)
    db.commit()

    return None


# Video endpoints

@router.post("/{course_id}/videos", response_model=VideoResponse, status_code=status.HTTP_201_CREATED)
async def upload_video(
    course_id: int,
    title: str = Form(...),
    description: Optional[str] = Form(None),
    display_order: int = Form(0),
    video_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Upload a video to a course (Admin only)
    """
    # Verify course exists
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(video_file.filename)[1]) as tmp_file:
        content = await video_file.read()
        tmp_file.write(content)
        tmp_file_path = tmp_file.name

    try:
        # Upload to Cloudinary
        upload_result = cloudinary_service.upload_video(
            file_path=tmp_file_path,
            folder=f"courses/{course_id}",
            public_id=None
        )

        # Create video record
        new_video = Video(
            course_id=course_id,
            title=title,
            description=description,
            cloudinary_public_id=upload_result["public_id"],
            cloudinary_url=upload_result["url"],
            thumbnail_url=upload_result.get("thumbnail_url"),
            duration=upload_result.get("duration"),
            display_order=display_order,
            is_published=False
        )

        db.add(new_video)
        db.commit()
        db.refresh(new_video)

        return new_video

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload video: {str(e)}"
        )
    finally:
        # Clean up temporary file
        if os.path.exists(tmp_file_path):
            os.remove(tmp_file_path)


@router.get("/{course_id}/videos/{video_id}", response_model=VideoResponse)
def get_video(
    course_id: int,
    video_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific video
    """
    video = db.query(Video).filter(
        Video.id == video_id,
        Video.course_id == course_id
    ).first()

    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )

    # Check course access
    course = db.query(Course).filter(Course.id == course_id).first()
    if not check_user_access(current_user, course, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this video"
        )

    return video


@router.get("/{course_id}/videos/{video_id}/progress", response_model=VideoProgressResponse)
def get_video_progress(
    course_id: int,
    video_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's progress for a video"""
    # Ensure table exists (safe if already created)
    from app.core.database import engine
    VideoProgress.__table__.create(bind=engine, checkfirst=True)

    # Access control
    course = db.query(Course).filter(Course.id == course_id).first()
    if not check_user_access(current_user, course, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    vp = db.query(VideoProgress).filter(
        VideoProgress.user_id == current_user.id,
        VideoProgress.video_id == video_id,
    ).first()
    if not vp:
        vp = VideoProgress(user_id=current_user.id, video_id=video_id, watched_seconds=0.0, completed=False)
        db.add(vp)
        db.commit()
        db.refresh(vp)
    return vp


@router.post("/{course_id}/videos/{video_id}/progress", response_model=VideoProgressResponse)
def upsert_video_progress(
    course_id: int,
    video_id: int,
    payload: VideoProgressCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create or update the user's progress for a video"""
    # Ensure table exists (safe if already created)
    from app.core.database import engine
    VideoProgress.__table__.create(bind=engine, checkfirst=True)

    # Access control
    course = db.query(Course).filter(Course.id == course_id).first()
    if not check_user_access(current_user, course, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    vp = db.query(VideoProgress).filter(
        VideoProgress.user_id == current_user.id,
        VideoProgress.video_id == video_id,
    ).first()

    if vp:
        # Only increase watched_seconds, do not allow decreasing
        vp.watched_seconds = max(vp.watched_seconds, float(payload.watched_seconds))
        if payload.completed:
            vp.completed = True
    else:
        vp = VideoProgress(
            user_id=current_user.id,
            video_id=video_id,
            watched_seconds=float(payload.watched_seconds),
            completed=bool(payload.completed),
        )
        db.add(vp)

    db.commit()
    db.refresh(vp)
    return vp

@router.post("/{course_id}/certificate/issue", response_model=CertificateResponse)
def issue_certificate(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Issue a completion certificate when all course videos are completed"""
    # Lazy-create table
    from app.core.database import engine
    Certificate.__table__.create(bind=engine, checkfirst=True)

    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if not check_user_access(current_user, course, db):
        raise HTTPException(status_code=403, detail="Access denied")

    videos = db.query(Video).filter(Video.course_id == course_id).all()
    if not videos:
        raise HTTPException(status_code=400, detail="Course has no videos")

    # Check completion
    video_ids = [v.id for v in videos]
    completed_count = db.query(VideoProgress).filter(
        VideoProgress.user_id == current_user.id,
        VideoProgress.video_id.in_(video_ids),
        VideoProgress.completed == True,
    ).count()
    if completed_count != len(videos):
        raise HTTPException(status_code=400, detail="All videos must be completed to issue certificate")

    # Upsert certificate
    existing = db.query(Certificate).filter(Certificate.user_id == current_user.id, Certificate.course_id == course_id).first()
    if existing:
        return existing

    import uuid
    cert = Certificate(
        user_id=current_user.id,
        course_id=course_id,
        certificate_number=str(uuid.uuid4())[:8].upper()
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert


@router.put("/{course_id}/videos/{video_id}", response_model=VideoResponse)
def update_video(
    course_id: int,
    video_id: int,
    video_data: VideoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Update a video (Admin only)
    """
    video = db.query(Video).filter(
        Video.id == video_id,
        Video.course_id == course_id
    ).first()

    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )

    update_data = video_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(video, field, value)

    db.commit()
    db.refresh(video)

    return video


@router.delete("/{course_id}/videos/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_video(
    course_id: int,
    video_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Delete a video (Admin only)
    """
    video = db.query(Video).filter(
        Video.id == video_id,
        Video.course_id == course_id
    ).first()

    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )

    # Delete from Cloudinary
    try:
        cloudinary_service.delete_video(video.cloudinary_public_id)
    except Exception as e:
        print(f"Error deleting video from Cloudinary: {e}")

    db.delete(video)
    db.commit()

    return None

