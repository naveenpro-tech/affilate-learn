from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db, engine
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.certificate import Certificate
from app.models.course import Course
from app.schemas.certificate import CertificateResponse, CertificateVerify

router = APIRouter()


@router.get("/my-certificates", response_model=List[CertificateResponse])
def get_my_certificates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all certificates for the current user
    
    Returns certificates ordered by issue date (newest first)
    """
    # Ensure table exists
    Certificate.__table__.create(bind=engine, checkfirst=True)
    
    certificates = db.query(Certificate).filter(
        Certificate.user_id == current_user.id
    ).order_by(Certificate.issued_at.desc()).all()
    
    # Enrich with course information
    result = []
    for cert in certificates:
        course = db.query(Course).filter(Course.id == cert.course_id).first()
        cert_dict = {
            "id": cert.id,
            "certificate_number": cert.certificate_number,
            "user_id": cert.user_id,
            "course_id": cert.course_id,
            "course_title": course.title if course else "Unknown Course",
            "issued_at": cert.issued_at,
            "user_name": current_user.username or current_user.full_name,
        }
        result.append(cert_dict)
    
    return result


@router.get("/verify/{certificate_number}", response_model=CertificateVerify)
def verify_certificate(
    certificate_number: str,
    db: Session = Depends(get_db)
):
    """
    Verify a certificate by its number (public endpoint - no auth required)
    
    Returns certificate details if valid, 404 if not found
    """
    # Ensure table exists
    Certificate.__table__.create(bind=engine, checkfirst=True)
    
    certificate = db.query(Certificate).filter(
        Certificate.certificate_number == certificate_number
    ).first()
    
    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )
    
    # Get user and course information
    user = db.query(User).filter(User.id == certificate.user_id).first()
    course = db.query(Course).filter(Course.id == certificate.course_id).first()
    
    return {
        "id": certificate.id,
        "certificate_number": certificate.certificate_number,
        "user_id": certificate.user_id,
        "user_name": user.username or user.full_name if user else "Unknown User",
        "user_email": user.email if user else None,
        "course_id": certificate.course_id,
        "course_title": course.title if course else "Unknown Course",
        "issued_at": certificate.issued_at,
        "is_valid": True,
    }


@router.get("/{certificate_id}", response_model=CertificateResponse)
def get_certificate(
    certificate_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific certificate by ID
    
    User can only access their own certificates
    """
    Certificate.__table__.create(bind=engine, checkfirst=True)
    
    certificate = db.query(Certificate).filter(
        Certificate.id == certificate_id
    ).first()
    
    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )
    
    # Check ownership
    if certificate.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this certificate"
        )
    
    # Get course information
    course = db.query(Course).filter(Course.id == certificate.course_id).first()
    
    return {
        "id": certificate.id,
        "certificate_number": certificate.certificate_number,
        "user_id": certificate.user_id,
        "course_id": certificate.course_id,
        "course_title": course.title if course else "Unknown Course",
        "issued_at": certificate.issued_at,
        "user_name": current_user.username or current_user.full_name,
    }

