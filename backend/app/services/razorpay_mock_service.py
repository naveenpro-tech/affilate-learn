"""
Mock Razorpay Service for Development/Testing
Simulates Razorpay API responses without requiring real API keys
"""

import uuid
import hmac
import hashlib
from datetime import datetime
from typing import Dict, Any


class MockRazorpayService:
    """Mock Razorpay service for development and testing"""
    
    def __init__(self):
        """Initialize mock service"""
        self.orders = {}
        self.payments = {}
        print("[RAZORPAY MOCK] Service initialized in mock mode")
    
    def create_order(self, amount: float, currency: str = "INR", receipt: str = None) -> Dict[str, Any]:
        """
        Create a mock Razorpay order
        
        Args:
            amount: Amount in rupees (will be converted to paise)
            currency: Currency code (default: INR)
            receipt: Receipt ID for reference
            
        Returns:
            Order details from Razorpay
        """
        try:
            # Convert amount to paise (smallest currency unit)
            amount_in_paise = int(amount * 100)
            
            # Generate mock order ID
            order_id = f"order_{uuid.uuid4().hex[:12]}"
            
            order_data = {
                "id": order_id,
                "entity": "order",
                "amount": amount_in_paise,
                "amount_paid": 0,
                "amount_due": amount_in_paise,
                "currency": currency,
                "receipt": receipt or f"receipt_{uuid.uuid4().hex[:8]}",
                "offer_id": None,
                "status": "created",
                "attempts": 0,
                "notes": {},
                "created_at": int(datetime.utcnow().timestamp())
            }
            
            # Store order
            self.orders[order_id] = order_data
            
            print(f"[RAZORPAY MOCK] Order created: {order_id} for ₹{amount}")
            return order_data
            
        except Exception as e:
            print(f"[RAZORPAY MOCK] Error creating order: {str(e)}")
            raise
    
    def verify_payment_signature(self, razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
        """
        Mock signature verification - always returns True for testing
        
        Args:
            razorpay_order_id: Order ID from Razorpay
            razorpay_payment_id: Payment ID from Razorpay
            razorpay_signature: Signature from Razorpay
            
        Returns:
            True if signature is valid (always True in mock mode)
        """
        print(f"[RAZORPAY MOCK] Verifying payment signature for order {razorpay_order_id}")
        # In mock mode, always return True
        return True
    
    def get_payment_details(self, payment_id: str) -> Dict[str, Any]:
        """
        Get mock payment details
        
        Args:
            payment_id: Payment ID
            
        Returns:
            Payment details
        """
        return {
            "id": payment_id,
            "entity": "payment",
            "amount": 295000,
            "currency": "INR",
            "status": "captured",
            "method": "card",
            "description": "Test payment",
            "amount_refunded": 0,
            "refund_status": None,
            "captured": True,
            "email": "test@example.com",
            "contact": "+919876543210",
            "fee": 0,
            "tax": 0,
            "error_code": None,
            "error_description": None,
            "error_source": None,
            "error_reason": None,
            "error_step": None,
            "error_field": None,
            "acquirer_data": {"auth_code": None},
            "vpa": None,
            "notes": {},
            "fee_details": None,
            "wallet": None,
            "created_at": int(datetime.utcnow().timestamp())
        }
    
    def get_order_details(self, order_id: str) -> Dict[str, Any]:
        """
        Get mock order details
        
        Args:
            order_id: Order ID
            
        Returns:
            Order details
        """
        if order_id in self.orders:
            return self.orders[order_id]
        
        return {
            "id": order_id,
            "entity": "order",
            "amount": 295000,
            "amount_paid": 295000,
            "amount_due": 0,
            "currency": "INR",
            "receipt": f"receipt_{order_id[:8]}",
            "offer_id": None,
            "status": "paid",
            "attempts": 1,
            "notes": {},
            "created_at": int(datetime.utcnow().timestamp())
        }

