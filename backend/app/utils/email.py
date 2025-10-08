"""
Email utility for sending emails via SMTP
"""
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None
) -> bool:
    """
    Send an email using SMTP configuration from settings
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML content of the email
        text_content: Plain text content (optional, will use html if not provided)
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['From'] = settings.EMAIL_FROM
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Add text and HTML parts
        if text_content:
            part1 = MIMEText(text_content, 'plain')
            msg.attach(part1)
        
        part2 = MIMEText(html_content, 'html')
        msg.attach(part2)
        
        # Connect to SMTP server and send email
        logger.info(f"Connecting to SMTP server: {settings.SMTP_HOST}:{settings.SMTP_PORT}")
        
        # Use SSL connection for port 465
        if settings.SMTP_PORT == 465:
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
        else:
            # Use TLS for other ports
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False


def send_welcome_email(to_email: str, user_name: str, referral_code: str) -> bool:
    """
    Send welcome email to newly registered user
    
    Args:
        to_email: User's email address
        user_name: User's full name
        referral_code: User's unique referral code
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    subject = f"Welcome to {settings.APP_NAME}! 🎉"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }}
            .content {{
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
            }}
            .referral-box {{
                background: white;
                border: 2px dashed #667eea;
                padding: 20px;
                margin: 20px 0;
                border-radius: 8px;
                text-align: center;
            }}
            .referral-code {{
                font-size: 24px;
                font-weight: bold;
                color: #667eea;
                letter-spacing: 2px;
                margin: 10px 0;
            }}
            .button {{
                display: inline-block;
                background: #667eea;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
            }}
            .footer {{
                text-align: center;
                margin-top: 30px;
                color: #666;
                font-size: 12px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Welcome to {settings.APP_NAME}!</h1>
        </div>
        <div class="content">
            <h2>Hello {user_name}! 👋</h2>
            
            <p>Thank you for joining our affiliate learning platform! We're excited to have you on board.</p>
            
            <p>Your account has been successfully created and you can now:</p>
            <ul>
                <li>Browse and purchase learning packages</li>
                <li>Access exclusive video courses</li>
                <li>Earn commissions by referring others</li>
                <li>Build your network and grow your income</li>
            </ul>
            
            <div class="referral-box">
                <h3>Your Unique Referral Code</h3>
                <div class="referral-code">{referral_code}</div>
                <p>Share this code with friends and family to earn commissions!</p>
                <p><strong>Your Referral Link:</strong><br>
                {settings.FRONTEND_URL}/register?ref={referral_code}</p>
            </div>
            
            <p>Start earning today by sharing your referral link and helping others discover our amazing courses!</p>
            
            <center>
                <a href="{settings.FRONTEND_URL}/login" class="button">Login to Your Dashboard</a>
            </center>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
            
            <p>Best regards,<br>
            The {settings.APP_NAME} Team</p>
        </div>
        <div class="footer">
            <p>This email was sent to {to_email}</p>
            <p>&copy; 2025 {settings.APP_NAME}. All rights reserved.</p>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Welcome to {settings.APP_NAME}!
    
    Hello {user_name}!
    
    Thank you for joining our affiliate learning platform! We're excited to have you on board.
    
    Your Unique Referral Code: {referral_code}
    
    Your Referral Link: {settings.FRONTEND_URL}/register?ref={referral_code}
    
    Share this code with friends and family to earn commissions!
    
    Login to your dashboard: {settings.FRONTEND_URL}/login
    
    Best regards,
    The {settings.APP_NAME} Team
    """
    
    return send_email(to_email, subject, html_content, text_content)


def send_password_reset_email(to_email: str, reset_token: str) -> bool:
    """
    Send password reset email with reset link
    
    Args:
        to_email: User's email address
        reset_token: Password reset token
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    subject = "Password Reset Request"
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: #667eea;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }}
            .content {{
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
            }}
            .button {{
                display: inline-block;
                background: #667eea;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
            }}
            .warning {{
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Password Reset Request</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            
            <p>We received a request to reset your password for your {settings.APP_NAME} account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <center>
                <a href="{reset_link}" class="button">Reset Password</a>
            </center>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">{reset_link}</p>
            
            <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
            </div>
            
            <p>Best regards,<br>
            The {settings.APP_NAME} Team</p>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Password Reset Request
    
    Hello,
    
    We received a request to reset your password for your {settings.APP_NAME} account.
    
    Click this link to reset your password: {reset_link}
    
    This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
    
    Best regards,
    The {settings.APP_NAME} Team
    """
    
    return send_email(to_email, subject, html_content, text_content)


def send_notification_email(to_email: str, subject: str, body: str) -> bool:
    """
    Send a generic notification email
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        body: Email body content (can include HTML)
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .content {{
                background: #f9f9f9;
                padding: 30px;
                border-radius: 10px;
            }}
        </style>
    </head>
    <body>
        <div class="content">
            {body}
            <p>Best regards,<br>
            The {settings.APP_NAME} Team</p>
        </div>
    </body>
    </html>
    """
    
    return send_email(to_email, subject, html_content, body)


def send_purchase_confirmation_email(
    to_email: str,
    user_name: str,
    package_name: str,
    package_price: float,
    transaction_id: str,
    purchase_date,
    additional_note: str = ""
) -> bool:
    """
    Send package purchase confirmation email

    Args:
        to_email: User's email address
        user_name: User's full name
        package_name: Name of purchased package
        package_price: Price of the package
        transaction_id: Razorpay transaction ID
        purchase_date: Date of purchase
        additional_note: Optional additional note (e.g., about existing individual purchases)

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    subject = f"Package Purchase Confirmation - {package_name}"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }}
            .content {{
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
            }}
            .details-box {{
                background: white;
                border: 1px solid #ddd;
                padding: 20px;
                margin: 20px 0;
                border-radius: 8px;
            }}
            .detail-row {{
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #eee;
            }}
            .detail-label {{
                font-weight: bold;
                color: #666;
            }}
            .detail-value {{
                color: #333;
            }}
            .button {{
                display: inline-block;
                background: #667eea;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
            }}
            .success-icon {{
                font-size: 48px;
                color: #28a745;
                text-align: center;
                margin: 20px 0;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Purchase Successful! 🎉</h1>
        </div>
        <div class="content">
            <div class="success-icon">✓</div>

            <h2>Hello {user_name}!</h2>

            <p>Thank you for purchasing the <strong>{package_name}</strong> package!</p>

            <div class="details-box">
                <h3>Purchase Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Package:</span>
                    <span class="detail-value">{package_name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Price:</span>
                    <span class="detail-value">₹{package_price:,.2f}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Transaction ID:</span>
                    <span class="detail-value">{transaction_id}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Purchase Date:</span>
                    <span class="detail-value">{purchase_date.strftime('%B %d, %Y at %I:%M %p') if purchase_date else 'N/A'}</span>
                </div>
            </div>

            <p>You can now access all courses included in your package!</p>

            {f'<div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;"><strong>Note:</strong>{additional_note}</div>' if additional_note else ''}

            <center>
                <a href="{settings.FRONTEND_URL}/courses" class="button">Access Your Courses</a>
            </center>

            <p>If you have any questions about your purchase, please don't hesitate to contact our support team.</p>

            <p>Best regards,<br>
            The {settings.APP_NAME} Team</p>
        </div>
    </body>
    </html>
    """

    text_content = f"""
    Package Purchase Confirmation - {package_name}

    Hello {user_name}!

    Thank you for purchasing the {package_name} package!

    Purchase Details:
    - Package: {package_name}
    - Price: ₹{package_price:,.2f}
    - Transaction ID: {transaction_id}
    - Purchase Date: {purchase_date.strftime('%B %d, %Y at %I:%M %p') if purchase_date else 'N/A'}

    You can now access all courses included in your package!

    Access Your Courses: {settings.FRONTEND_URL}/courses

    Best regards,
    The {settings.APP_NAME} Team
    """

    return send_email(to_email, subject, html_content, text_content)


def send_commission_notification_email(
    to_email: str,
    referrer_name: str,
    commission_amount: float,
    level: int,
    referee_name: str,
    package_name: str
) -> bool:
    """
    Send commission notification email to referrer

    Args:
        to_email: Referrer's email address
        referrer_name: Referrer's full name
        commission_amount: Commission amount earned
        level: Commission level (1 or 2)
        referee_name: Name of person who made purchase
        package_name: Package purchased

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    subject = f"You Earned a Commission! 💰 ₹{commission_amount:,.2f}"

    level_text = "Direct" if level == 1 else "Indirect"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }}
            .content {{
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
            }}
            .commission-box {{
                background: white;
                border: 2px solid #28a745;
                padding: 20px;
                margin: 20px 0;
                border-radius: 8px;
                text-align: center;
            }}
            .commission-amount {{
                font-size: 36px;
                font-weight: bold;
                color: #28a745;
                margin: 10px 0;
            }}
            .details-box {{
                background: white;
                border: 1px solid #ddd;
                padding: 20px;
                margin: 20px 0;
                border-radius: 8px;
            }}
            .detail-row {{
                padding: 8px 0;
                border-bottom: 1px solid #eee;
            }}
            .detail-label {{
                font-weight: bold;
                color: #666;
            }}
            .button {{
                display: inline-block;
                background: #28a745;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🎉 Congratulations!</h1>
            <h2>You Earned a Commission!</h2>
        </div>
        <div class="content">
            <h2>Hello {referrer_name}!</h2>

            <p>Great news! You've earned a commission from your referral network.</p>

            <div class="commission-box">
                <h3>Commission Earned</h3>
                <div class="commission-amount">₹{commission_amount:,.2f}</div>
                <p>This amount has been automatically credited to your wallet!</p>
            </div>

            <div class="details-box">
                <h3>Commission Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Level:</span> Level {level} ({level_text} Referral)
                </div>
                <div class="detail-row">
                    <span class="detail-label">From:</span> {referee_name}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Package Purchased:</span> {package_name}
                </div>
            </div>

            <p>Keep referring to earn more commissions! Share your referral link with friends and family.</p>

            <center>
                <a href="{settings.FRONTEND_URL}/wallet" class="button">View Your Wallet</a>
            </center>

            <p>Best regards,<br>
            The {settings.APP_NAME} Team</p>
        </div>
    </body>
    </html>
    """

    text_content = f"""
    You Earned a Commission! 💰

    Hello {referrer_name}!

    Great news! You've earned a commission from your referral network.

    Commission Earned: ₹{commission_amount:,.2f}

    Commission Details:
    - Level: Level {level} ({level_text} Referral)
    - From: {referee_name}
    - Package Purchased: {package_name}

    This amount has been automatically credited to your wallet!

    View Your Wallet: {settings.FRONTEND_URL}/wallet

    Keep referring to earn more commissions!

    Best regards,
    The {settings.APP_NAME} Team
    """

    return send_email(to_email, subject, html_content, text_content)

