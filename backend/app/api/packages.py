from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_admin_user, optional_current_user
from app.models.package import Package
from app.models.user import User
from app.schemas.package import PackageResponse, PackageCreate, PackageUpdate

router = APIRouter()


@router.get("/", response_model=List[PackageResponse])
def get_packages(
    db: Session = Depends(get_db),
    current_user: User = Depends(optional_current_user)
):
    """
    Get all active packages
    
    - Public endpoint (no authentication required)
    - Returns packages ordered by display_order
    """
    packages = db.query(Package).filter(
        Package.is_active == True
    ).order_by(Package.display_order).all()
    
    return packages


@router.get("/{package_id}", response_model=PackageResponse)
def get_package(
    package_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific package by ID
    """
    package = db.query(Package).filter(Package.id == package_id).first()
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found"
        )
    
    return package


@router.get("/slug/{slug}", response_model=PackageResponse)
def get_package_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    """
    Get a specific package by slug
    """
    package = db.query(Package).filter(Package.slug == slug).first()
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found"
        )
    
    return package


@router.post("/", response_model=PackageResponse, status_code=status.HTTP_201_CREATED)
def create_package(
    package_data: PackageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Create a new package (Admin only)
    """
    # Check if slug already exists
    existing = db.query(Package).filter(Package.slug == package_data.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Package with this slug already exists"
        )
    
    new_package = Package(**package_data.dict())
    db.add(new_package)
    db.commit()
    db.refresh(new_package)
    
    return new_package


@router.put("/{package_id}", response_model=PackageResponse)
def update_package(
    package_id: int,
    package_data: PackageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Update a package (Admin only)
    """
    package = db.query(Package).filter(Package.id == package_id).first()
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found"
        )
    
    # Update fields
    update_data = package_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(package, field, value)
    
    db.commit()
    db.refresh(package)
    
    return package


@router.delete("/{package_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_package(
    package_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Delete a package (Admin only)
    
    Note: This is a soft delete (sets is_active to False)
    """
    package = db.query(Package).filter(Package.id == package_id).first()
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found"
        )
    
    package.is_active = False
    db.commit()
    
    return None

