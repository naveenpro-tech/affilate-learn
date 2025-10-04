from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db, engine
from app.core.dependencies import get_current_user, get_current_admin_user
from app.models.user import User
from app.models.course import Course
from app.models.module import Module
from app.models.topic import Topic
from app.schemas.module import (
    ModuleResponse, ModuleCreate, ModuleUpdate, ModuleWithTopics,
    TopicResponse, TopicCreate, TopicUpdate
)
from app.services.cloudinary_service import cloudinary_service

router = APIRouter()


# ============ MODULE ENDPOINTS ============

@router.post("/", response_model=ModuleResponse)
def create_module(
    module_data: ModuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new module (Admin only)"""
    Module.__table__.create(bind=engine, checkfirst=True)
    
    # Verify course exists
    course = db.query(Course).filter(Course.id == module_data.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    module = Module(**module_data.dict())
    db.add(module)
    db.commit()
    db.refresh(module)
    return module


@router.get("/{module_id}", response_model=ModuleWithTopics)
def get_module(
    module_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a module with its topics"""
    Module.__table__.create(bind=engine, checkfirst=True)
    Topic.__table__.create(bind=engine, checkfirst=True)
    
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    return module


@router.put("/{module_id}", response_model=ModuleResponse)
def update_module(
    module_id: int,
    module_data: ModuleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a module (Admin only)"""
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    for key, value in module_data.dict(exclude_unset=True).items():
        setattr(module, key, value)
    
    db.commit()
    db.refresh(module)
    return module


@router.delete("/{module_id}")
def delete_module(
    module_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a module (Admin only)"""
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    db.delete(module)
    db.commit()
    return {"message": "Module deleted successfully"}


# ============ TOPIC ENDPOINTS ============

@router.post("/{module_id}/topics", response_model=TopicResponse)
def create_topic(
    module_id: int,
    topic_data: TopicCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new topic in a module (Admin only)"""
    Topic.__table__.create(bind=engine, checkfirst=True)
    
    # Verify module exists
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    # Override module_id from path
    topic_dict = topic_data.dict()
    topic_dict['module_id'] = module_id
    
    topic = Topic(**topic_dict)
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return topic


@router.post("/{module_id}/topics/upload-video", response_model=TopicResponse)
async def upload_topic_video(
    module_id: int,
    title: str = Form(...),
    description: Optional[str] = Form(None),
    display_order: int = Form(0),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Upload a video for a topic (Admin only)"""
    Topic.__table__.create(bind=engine, checkfirst=True)
    
    # Verify module exists
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    # Save file temporarily
    import os, tempfile
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    try:
        # Upload to Cloudinary
        result = cloudinary_service.upload_video(tmp_path, folder=f"courses/module_{module_id}")
        
        # Create topic
        topic = Topic(
            module_id=module_id,
            title=title,
            description=description,
            video_source_type="cloudinary",
            cloudinary_public_id=result.get("public_id"),
            cloudinary_url=result.get("url"),
            thumbnail_url=result.get("thumbnail_url"),
            duration=int(result.get("duration", 0)),
            display_order=display_order,
            is_published=True
        )
        db.add(topic)
        db.commit()
        db.refresh(topic)
        return topic
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            os.remove(tmp_path)
        except:
            pass


@router.get("/{module_id}/topics/{topic_id}", response_model=TopicResponse)
def get_topic(
    module_id: int,
    topic_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific topic"""
    Topic.__table__.create(bind=engine, checkfirst=True)
    
    topic = db.query(Topic).filter(
        Topic.id == topic_id,
        Topic.module_id == module_id
    ).first()
    
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    return topic


@router.put("/{module_id}/topics/{topic_id}", response_model=TopicResponse)
def update_topic(
    module_id: int,
    topic_id: int,
    topic_data: TopicUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a topic (Admin only)"""
    topic = db.query(Topic).filter(
        Topic.id == topic_id,
        Topic.module_id == module_id
    ).first()
    
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    for key, value in topic_data.dict(exclude_unset=True).items():
        setattr(topic, key, value)
    
    db.commit()
    db.refresh(topic)
    return topic


@router.delete("/{module_id}/topics/{topic_id}")
def delete_topic(
    module_id: int,
    topic_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a topic (Admin only)"""
    topic = db.query(Topic).filter(
        Topic.id == topic_id,
        Topic.module_id == module_id
    ).first()
    
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    # Delete from Cloudinary if it's a cloudinary video
    if topic.video_source_type == "cloudinary" and topic.cloudinary_public_id:
        try:
            cloudinary_service.delete_video(topic.cloudinary_public_id)
        except:
            pass
    
    db.delete(topic)
    db.commit()
    return {"message": "Topic deleted successfully"}

