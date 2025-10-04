from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db, engine
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.schemas.profile import ProfileResponse
from app.services.cloudinary_service import cloudinary_service

router = APIRouter()


@router.get("/me", response_model=ProfileResponse)
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Ensure table exists
    Profile.__table__.create(bind=engine, checkfirst=True)

    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.post("/avatar", response_model=ProfileResponse)
def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Ensure table exists
    Profile.__table__.create(bind=engine, checkfirst=True)

    # Save file temporarily
    import os, tempfile
    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
        content = file.file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        # Upload to Cloudinary
        result = cloudinary_service.upload_image(tmp_path, folder=f"avatars/{current_user.id}")

        # Upsert profile
        profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
        if not profile:
            profile = Profile(user_id=current_user.id)
            db.add(profile)
            db.flush()
        profile.avatar_public_id = result.get("public_id")
        profile.avatar_url = result.get("url")
        db.commit()
        db.refresh(profile)
        return profile
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass

