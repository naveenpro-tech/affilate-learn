import random
import string


def generate_referral_code(length: int = 8) -> str:
    """
    Generate a unique referral code
    
    Args:
        length: Length of the referral code (default: 8)
        
    Returns:
        Random alphanumeric referral code in uppercase
    """
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choices(characters, k=length))


def is_valid_referral_code(code: str) -> bool:
    """
    Validate referral code format
    
    Args:
        code: Referral code to validate
        
    Returns:
        True if valid format, False otherwise
    """
    if not code or len(code) < 6 or len(code) > 12:
        return False
    
    return code.isalnum() and code.isupper()

