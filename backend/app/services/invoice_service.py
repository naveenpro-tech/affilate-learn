"""Invoice generation service using ReportLab"""
import os
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT

from app.models.invoice import Invoice
from app.models.payment import Payment
from app.models.user import User
from app.models.package import Package


class InvoiceService:
    """Service for generating PDF invoices"""
    
    def __init__(self, db: Session):
        self.db = db
        self.invoice_dir = "invoices"
        os.makedirs(self.invoice_dir, exist_ok=True)
    
    def generate_invoice_number(self) -> str:
        """Generate unique invoice number"""
        year = datetime.now().year
        # Get count of invoices this year
        count = self.db.query(Invoice).filter(
            Invoice.invoice_number.like(f"INV-{year}-%")
        ).count()
        return f"INV-{year}-{count + 1:05d}"
    
    def create_invoice(self, payment_id: int) -> Invoice:
        """Create invoice record for a payment"""
        # Get payment details
        payment = self.db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment:
            raise ValueError(f"Payment {payment_id} not found")
        
        if payment.status != "success":
            raise ValueError(f"Payment {payment_id} is not successful")
        
        # Check if invoice already exists
        existing = self.db.query(Invoice).filter(Invoice.payment_id == payment_id).first()
        if existing:
            return existing
        
        # Get user details
        user = self.db.query(User).filter(User.id == payment.user_id).first()
        
        # Determine invoice type and item name
        invoice_type = "package"
        item_name = "Unknown Item"
        item_description = ""
        
        if payment.package_id:
            package = self.db.query(Package).filter(Package.id == payment.package_id).first()
            if package:
                item_name = f"{package.name} Package"
                item_description = package.description or ""
        
        # Calculate GST
        gst_percentage = 18.0
        base_amount = payment.amount / (1 + gst_percentage / 100)
        gst_amount = payment.amount - base_amount
        
        # Generate invoice number
        invoice_number = self.generate_invoice_number()
        
        # Create invoice record
        invoice = Invoice(
            invoice_number=invoice_number,
            user_id=payment.user_id,
            payment_id=payment.id,
            invoice_type=invoice_type,
            item_name=item_name,
            item_description=item_description,
            amount=base_amount,
            gst_percentage=gst_percentage,
            gst_amount=gst_amount,
            total_amount=payment.amount,
            invoice_date=payment.completed_at or datetime.utcnow()
        )
        
        self.db.add(invoice)
        self.db.commit()
        self.db.refresh(invoice)
        
        # Generate PDF
        pdf_path = self.generate_pdf(invoice, user, payment)
        invoice.pdf_url = pdf_path
        self.db.commit()
        
        return invoice
    
    def generate_pdf(self, invoice: Invoice, user: User, payment: Payment) -> str:
        """Generate PDF invoice"""
        filename = f"{invoice.invoice_number}.pdf"
        filepath = os.path.join(self.invoice_dir, filename)
        
        # Create PDF document
        doc = SimpleDocTemplate(filepath, pagesize=A4)
        story = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=12,
        )
        
        # Company Header
        story.append(Paragraph("Affiliate Learning Platform", title_style))
        story.append(Paragraph("Tax Invoice", styles['Heading2']))
        story.append(Spacer(1, 0.3 * inch))
        
        # Invoice details table
        invoice_data = [
            ['Invoice Number:', invoice.invoice_number, 'Invoice Date:', invoice.invoice_date.strftime('%d-%m-%Y')],
            ['Payment ID:', payment.razorpay_payment_id or 'N/A', 'Payment Method:', payment.payment_method or 'Online'],
        ]
        
        invoice_table = Table(invoice_data, colWidths=[1.5*inch, 2*inch, 1.5*inch, 2*inch])
        invoice_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        
        story.append(invoice_table)
        story.append(Spacer(1, 0.3 * inch))
        
        # Billing details
        story.append(Paragraph("Bill To:", heading_style))
        
        billing_info = [
            f"<b>Name:</b> {user.full_name}",
            f"<b>Email:</b> {user.email}",
        ]
        
        if user.phone:
            billing_info.append(f"<b>Phone:</b> {user.phone}")
        
        if user.address_line1:
            address_parts = [user.address_line1]
            if user.address_line2:
                address_parts.append(user.address_line2)
            if user.city:
                address_parts.append(user.city)
            if user.state:
                address_parts.append(user.state)
            if user.postal_code:
                address_parts.append(user.postal_code)
            if user.country:
                address_parts.append(user.country)
            
            billing_info.append(f"<b>Address:</b> {', '.join(address_parts)}")
        
        for info in billing_info:
            story.append(Paragraph(info, styles['Normal']))
        
        story.append(Spacer(1, 0.3 * inch))
        
        # Items table
        story.append(Paragraph("Invoice Details:", heading_style))
        
        items_data = [
            ['#', 'Description', 'Amount (₹)'],
            ['1', invoice.item_name, f"{invoice.amount:.2f}"],
            ['', 'GST (18%)', f"{invoice.gst_amount:.2f}"],
            ['', '<b>Total Amount</b>', f"<b>₹{invoice.total_amount:.2f}</b>"],
        ]
        
        items_table = Table(items_data, colWidths=[0.5*inch, 4.5*inch, 2*inch])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (2, 0), (2, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -2), colors.beige),
            ('GRID', (0, 0), (-1, -2), 1, colors.black),
            ('LINEBELOW', (0, -1), (-1, -1), 2, colors.HexColor('#1e40af')),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 12),
        ]))
        
        story.append(items_table)
        story.append(Spacer(1, 0.5 * inch))
        
        # Footer
        footer_text = """
        <para align=center>
        <b>Thank you for your purchase!</b><br/>
        For any queries, please contact us at support@affiliatelearning.com<br/>
        <i>This is a computer-generated invoice and does not require a signature.</i>
        </para>
        """
        story.append(Paragraph(footer_text, styles['Normal']))
        
        # Build PDF
        doc.build(story)
        
        return filepath
    
    def get_invoice_by_id(self, invoice_id: int) -> Optional[Invoice]:
        """Get invoice by ID"""
        return self.db.query(Invoice).filter(Invoice.id == invoice_id).first()
    
    def get_invoice_by_payment_id(self, payment_id: int) -> Optional[Invoice]:
        """Get invoice by payment ID"""
        return self.db.query(Invoice).filter(Invoice.payment_id == payment_id).first()
    
    def get_user_invoices(self, user_id: int) -> list[Invoice]:
        """Get all invoices for a user"""
        return self.db.query(Invoice).filter(Invoice.user_id == user_id).order_by(Invoice.created_at.desc()).all()

