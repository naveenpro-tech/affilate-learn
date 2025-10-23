#!/usr/bin/env python3
"""
Razorpay API Verification Script

This script verifies that your Razorpay API credentials are valid and working.
Run this after updating your .env file with valid Razorpay test credentials.

Usage:
    python3 verify_razorpay.py
"""

import sys
from app.core.config import settings

def print_header(text):
    """Print a formatted header"""
    print("\n" + "=" * 70)
    print(f"  {text}")
    print("=" * 70)

def print_success(text):
    """Print success message"""
    print(f"✅ {text}")

def print_error(text):
    """Print error message"""
    print(f"❌ {text}")

def print_info(text):
    """Print info message"""
    print(f"ℹ️  {text}")

def verify_config():
    """Verify configuration settings"""
    print_header("Step 1: Verifying Configuration")
    
    print(f"RAZORPAY_KEY_ID: {settings.RAZORPAY_KEY_ID}")
    print(f"USE_RAZORPAY_MOCK: {settings.USE_RAZORPAY_MOCK}")
    
    if settings.USE_RAZORPAY_MOCK:
        print_error("Mock service is ENABLED!")
        print_info("Set USE_RAZORPAY_MOCK=false in .env file")
        return False
    
    if not settings.RAZORPAY_KEY_ID.startswith('rzp_test_'):
        print_error("Key ID doesn't start with 'rzp_test_'")
        print_info("Make sure you're using TEST mode credentials")
        return False
    
    if not settings.RAZORPAY_KEY_SECRET:
        print_error("RAZORPAY_KEY_SECRET is empty!")
        return False
    
    print_success("Configuration looks good!")
    return True

def verify_razorpay_client():
    """Verify Razorpay client initialization"""
    print_header("Step 2: Verifying Razorpay Client Initialization")
    
    try:
        import razorpay
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        print_success("Razorpay client initialized successfully")
        return client
    except Exception as e:
        print_error(f"Failed to initialize Razorpay client: {e}")
        return None

def verify_order_creation(client):
    """Verify order creation"""
    print_header("Step 3: Verifying Order Creation")
    
    try:
        order = client.order.create(data={
            'amount': 100000,  # ₹1000 in paise
            'currency': 'INR',
            'payment_capture': 1,
            'receipt': 'test_receipt_verification'
        })
        
        print_success(f"Test order created successfully!")
        print(f"   Order ID: {order.get('id')}")
        print(f"   Amount: ₹{order.get('amount') / 100}")
        print(f"   Currency: {order.get('currency')}")
        print(f"   Status: {order.get('status')}")
        return True
        
    except Exception as e:
        print_error(f"Failed to create order: {e}")
        
        if "Authentication failed" in str(e):
            print_info("Your API credentials are INVALID or EXPIRED")
            print_info("Steps to fix:")
            print_info("1. Go to https://dashboard.razorpay.com/")
            print_info("2. Make sure you're in TEST MODE")
            print_info("3. Go to Settings > API Keys")
            print_info("4. Regenerate your test API keys")
            print_info("5. Update your .env file with new credentials")
            print_info("6. Restart the backend server")
        
        return False

def verify_service_import():
    """Verify the razorpay service is using real service"""
    print_header("Step 4: Verifying Service Import")
    
    try:
        from app.services.razorpay_service import razorpay_service
        
        service_type = type(razorpay_service).__name__
        print(f"Service Type: {service_type}")
        
        if service_type == "MockRazorpayService":
            print_error("Mock service is being used!")
            print_info("Make sure USE_RAZORPAY_MOCK=false in .env")
            print_info("Restart the backend server after changing .env")
            return False
        
        if service_type == "RazorpayService":
            print_success("Real Razorpay service is being used!")
            return True
        
        print_error(f"Unknown service type: {service_type}")
        return False
        
    except Exception as e:
        print_error(f"Failed to import service: {e}")
        return False

def main():
    """Main verification function"""
    print_header("Razorpay API Verification")
    print("This script will verify your Razorpay API credentials")
    
    # Step 1: Verify config
    if not verify_config():
        print_header("VERIFICATION FAILED")
        print_error("Configuration is incorrect. Please fix the issues above.")
        sys.exit(1)
    
    # Step 2: Verify client
    client = verify_razorpay_client()
    if not client:
        print_header("VERIFICATION FAILED")
        print_error("Failed to initialize Razorpay client. Check your credentials.")
        sys.exit(1)
    
    # Step 3: Verify order creation
    if not verify_order_creation(client):
        print_header("VERIFICATION FAILED")
        print_error("Failed to create test order. Your credentials may be invalid.")
        sys.exit(1)
    
    # Step 4: Verify service import
    if not verify_service_import():
        print_header("VERIFICATION FAILED")
        print_error("Service import verification failed.")
        sys.exit(1)
    
    # All checks passed
    print_header("✅ ALL VERIFICATIONS PASSED!")
    print_success("Your Razorpay API credentials are VALID and working!")
    print_success("The payment integration is ready to use!")
    print("\nNext steps:")
    print("1. Make sure backend server is running")
    print("2. Test the payment flow in the UI")
    print("3. Use test cards for testing payments")
    print("\nTest Cards:")
    print("  Success: 4111 1111 1111 1111")
    print("  Failure: 4000 0000 0000 0002")
    print("  CVV: Any 3 digits")
    print("  Expiry: Any future date")
    print("  OTP: 123456")
    
    sys.exit(0)

if __name__ == "__main__":
    main()

