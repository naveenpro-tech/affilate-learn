"""
Email Service for sending verification and notification emails
"""
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings


async def send_email(to_email: str, subject: str, html_content: str):
    """
    Send email using SMTP
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML content of the email
    """
    # Create message
    message = MIMEMultipart("alternative")
    message["From"] = settings.SMTP_FROM_EMAIL
    message["To"] = to_email
    message["Subject"] = subject
    
    # Add HTML content
    html_part = MIMEText(html_content, "html")
    message.attach(html_part)
    
    # Use SMTP_USERNAME if set, otherwise use SMTP_USER
    smtp_username = settings.SMTP_USERNAME if settings.SMTP_USERNAME else settings.SMTP_USER
    
    # Send email
    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=smtp_username,
            password=settings.SMTP_PASSWORD,
            use_tls=settings.SMTP_USE_TLS,
        )
        print(f"✅ Email sent successfully to {to_email}")
    except Exception as e:
        print(f"❌ Failed to send email to {to_email}: {e}")
        raise


async def send_verification_email(email: str, name: str, token: str):
    """
    Send email verification email
    
    Args:
        email: User's email address
        name: User's full name
        token: Verification token
    """
    # Construct verification URL
    frontend_url = settings.FRONTEND_URL or "http://localhost:3000"
    verification_url = f"{frontend_url}/verify-email?token={token}"
    
    subject = "Verify Your Email - MLM Affiliate Learning Platform"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
                background: #f9fafb;
                padding: 30px;
                border-radius: 0 0 10px 10px;
            }}
            .button {{
                display: inline-block;
                padding: 15px 30px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                margin: 20px 0;
            }}
            .footer {{
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
            }}
            .warning {{
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 15px;
                margin: 20px 0;
                border-radius: 5px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🎓 Email Verification</h1>
        </div>
        <div class="content">
            <h2>Hello {name}!</h2>
            <p>Thank you for registering with MLM Affiliate Learning Platform.</p>
            <p>To complete your registration and verify your email address, please click the button below:</p>
            
            <div style="text-align: center;">
                <a href="{verification_url}" class="button">Verify Email Address</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">{verification_url}</p>
            
            <div class="warning">
                <strong>⚠️ Important:</strong> This verification link will expire in 24 hours.
            </div>
            
            <p>If you didn't create an account with us, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>© 2025 MLM Affiliate Learning Platform. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
        </div>
    </body>
    </html>
    """
    
    await send_email(email, subject, html_content)


async def send_welcome_email(email: str, name: str, referral_code: str):
    """
    Send welcome email after successful registration
    
    Args:
        email: User's email address
        name: User's full name
        referral_code: User's referral code
    """
    subject = "Welcome to MLM Affiliate Learning Platform!"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
                background: #f9fafb;
                padding: 30px;
                border-radius: 0 0 10px 10px;
            }}
            .referral-code {{
                background: white;
                border: 2px dashed #667eea;
                padding: 20px;
                text-align: center;
                border-radius: 10px;
                margin: 20px 0;
            }}
            .code {{
                font-size: 24px;
                font-weight: bold;
                color: #667eea;
                letter-spacing: 2px;
            }}
            .footer {{
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🎉 Welcome Aboard!</h1>
        </div>
        <div class="content">
            <h2>Hello {name}!</h2>
            <p>Welcome to the MLM Affiliate Learning Platform! We're excited to have you join our community.</p>
            
            <div class="referral-code">
                <p style="margin: 0; color: #6b7280;">Your Referral Code</p>
                <p class="code">{referral_code}</p>
                <p style="margin: 0; font-size: 14px; color: #6b7280;">Share this code to earn commissions!</p>
            </div>
            
            <h3>🚀 Get Started:</h3>
            <ul>
                <li>Browse our courses and choose a package</li>
                <li>Share your referral code with friends</li>
                <li>Earn commissions on every referral</li>
                <li>Track your earnings in the dashboard</li>
            </ul>
            
            <h3>💰 Commission Structure:</h3>
            <ul>
                <li><strong>Level 1:</strong> 40% commission on direct referrals</li>
                <li><strong>Level 2:</strong> 10% commission on indirect referrals</li>
            </ul>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
            
            <p>Happy learning and earning!</p>
        </div>
        <div class="footer">
            <p>© 2025 MLM Affiliate Learning Platform. All rights reserved.</p>
        </div>
    </body>
    </html>
    """
    
    await send_email(email, subject, html_content)

