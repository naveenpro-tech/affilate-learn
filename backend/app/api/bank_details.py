from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.bank_details import BankDetails
from app.schemas.bank_details import BankDetailsCreate, BankDetailsUpdate, BankDetailsResponse

router = APIRouter()

@router.post("/", response_model=BankDetailsResponse, status_code=status.HTTP_201_CREATED)
def create_bank_details(
    bank_details: BankDetailsCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create bank details for the current user"""
    
    # Check if user already has bank details
    existing = db.query(BankDetails).filter(BankDetails.user_id == current_user.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bank details already exist. Use PUT to update."
        )
    
    # Create new bank details
    db_bank_details = BankDetails(
        user_id=current_user.id,
        **bank_details.dict()
    )
    
    db.add(db_bank_details)
    db.commit()
    db.refresh(db_bank_details)
    
    return db_bank_details


@router.get("/", response_model=Optional[BankDetailsResponse])
def get_bank_details(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get bank details for the current user"""
    
    bank_details = db.query(BankDetails).filter(BankDetails.user_id == current_user.id).first()
    return bank_details


@router.put("/", response_model=BankDetailsResponse)
def update_bank_details(
    bank_details: BankDetailsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update bank details for the current user"""
    
    db_bank_details = db.query(BankDetails).filter(BankDetails.user_id == current_user.id).first()
    
    if not db_bank_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bank details not found. Use POST to create."
        )
    
    # Update only provided fields
    update_data = bank_details.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_bank_details, field, value)
    
    db.commit()
    db.refresh(db_bank_details)
    
    return db_bank_details


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
def delete_bank_details(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete bank details for the current user"""
    
    db_bank_details = db.query(BankDetails).filter(BankDetails.user_id == current_user.id).first()
    
    if not db_bank_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bank details not found"
        )
    
    db.delete(db_bank_details)
    db.commit()
    
    return None

