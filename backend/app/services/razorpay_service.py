import razorpay
import hmac
import hashlib
from app.core.config import settings


class RazorpayService:
    """Service for Razorpay payment gateway integration"""
    
    def __init__(self):
        self.client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    
    def create_order(self, amount: float, currency: str = "INR", receipt: str = None) -> dict:
        """
        Create a Razorpay order
        
        Args:
            amount: Amount in rupees (will be converted to paise)
            currency: Currency code (default: INR)
            receipt: Receipt ID for reference
            
        Returns:
            Order details from Razorpay
        """
        # Convert amount to paise (smallest currency unit)
        amount_in_paise = int(amount * 100)
        
        order_data = {
            "amount": amount_in_paise,
            "currency": currency,
            "payment_capture": 1  # Auto capture payment
        }
        
        if receipt:
            order_data["receipt"] = receipt
        
        order = self.client.order.create(data=order_data)
        return order
    
    def verify_payment_signature(
        self,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str
    ) -> bool:
        """
        Verify Razorpay payment signature
        
        Args:
            razorpay_order_id: Order ID from Razorpay
            razorpay_payment_id: Payment ID from Razorpay
            razorpay_signature: Signature from Razorpay
            
        Returns:
            True if signature is valid, False otherwise
        """
        try:
            # Create signature string
            message = f"{razorpay_order_id}|{razorpay_payment_id}"
            
            # Generate expected signature
            expected_signature = hmac.new(
                settings.RAZORPAY_KEY_SECRET.encode(),
                message.encode(),
                hashlib.sha256
            ).hexdigest()
            
            # Compare signatures
            return hmac.compare_digest(expected_signature, razorpay_signature)
        except Exception as e:
            print(f"Error verifying signature: {e}")
            return False
    
    def get_payment_details(self, payment_id: str) -> dict:
        """
        Get payment details from Razorpay
        
        Args:
            payment_id: Payment ID
            
        Returns:
            Payment details
        """
        try:
            payment = self.client.payment.fetch(payment_id)
            return payment
        except Exception as e:
            print(f"Error fetching payment: {e}")
            return None
    
    def get_order_details(self, order_id: str) -> dict:
        """
        Get order details from Razorpay
        
        Args:
            order_id: Order ID
            
        Returns:
            Order details
        """
        try:
            order = self.client.order.fetch(order_id)
            return order
        except Exception as e:
            print(f"Error fetching order: {e}")
            return None
    
    def verify_webhook_signature(self, payload: str, signature: str, secret: str = None) -> bool:
        """
        Verify Razorpay webhook signature
        
        Args:
            payload: Webhook payload
            signature: Webhook signature
            secret: Webhook secret (optional, uses key secret if not provided)
            
        Returns:
            True if signature is valid, False otherwise
        """
        try:
            if secret is None:
                secret = settings.RAZORPAY_KEY_SECRET
            
            expected_signature = hmac.new(
                secret.encode(),
                payload.encode(),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(expected_signature, signature)
        except Exception as e:
            print(f"Error verifying webhook signature: {e}")
            return False


# Singleton instance
razorpay_service = RazorpayService()

