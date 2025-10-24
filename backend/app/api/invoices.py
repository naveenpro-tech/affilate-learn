"""Invoice API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import os

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.invoice import Invoice
from app.schemas.invoice import InvoiceResponse
from app.services.invoice_service import InvoiceService


router = APIRouter(prefix="/invoices", tags=["invoices"])


@router.post("/generate/{payment_id}", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
def generate_invoice(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate invoice for a payment
    - Requires authentication
    - Only the user who made the payment can generate invoice
    - Auto-generates PDF
    """
    try:
        service = InvoiceService(db)
        invoice = service.create_invoice(payment_id)
        
        # Verify user owns this invoice
        if invoice.user_id != current_user.id and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this invoice"
            )
        
        return invoice
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate invoice: {str(e)}"
        )


@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(
    invoice_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get invoice by ID
    - Requires authentication
    - Only the user who owns the invoice can access it
    """
    service = InvoiceService(db)
    invoice = service.get_invoice_by_id(invoice_id)
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Verify user owns this invoice
    if invoice.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this invoice"
        )
    
    return invoice


@router.get("/{invoice_id}/download")
def download_invoice(
    invoice_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Download invoice PDF
    - Requires authentication
    - Only the user who owns the invoice can download it
    """
    service = InvoiceService(db)
    invoice = service.get_invoice_by_id(invoice_id)
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Verify user owns this invoice
    if invoice.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this invoice"
        )
    
    # Check if PDF exists
    if not invoice.pdf_url or not os.path.exists(invoice.pdf_url):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice PDF not found"
        )
    
    return FileResponse(
        path=invoice.pdf_url,
        filename=f"{invoice.invoice_number}.pdf",
        media_type="application/pdf"
    )


@router.get("/", response_model=List[InvoiceResponse])
def get_my_invoices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all invoices for current user
    - Requires authentication
    - Returns invoices ordered by date (newest first)
    """
    service = InvoiceService(db)
    invoices = service.get_user_invoices(current_user.id)
    return invoices


@router.get("/payment/{payment_id}", response_model=InvoiceResponse)
def get_invoice_by_payment(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get invoice by payment ID
    - Requires authentication
    - Only the user who made the payment can access invoice
    """
    service = InvoiceService(db)
    invoice = service.get_invoice_by_payment_id(payment_id)
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found for this payment"
        )
    
    # Verify user owns this invoice
    if invoice.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this invoice"
        )
    
    return invoice

