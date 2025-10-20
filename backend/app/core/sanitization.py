"""
Input Sanitization and Validation
Protects against XSS, SQL injection, and other attacks
"""

import re
import html
from typing import Optional
import logging

logger = logging.getLogger(__name__)


# Profanity filter word list (basic - can be expanded)
PROFANITY_LIST = [
    'badword1', 'badword2', 'badword3',  # Replace with actual words
    # Add more as needed
]


def sanitize_html(text: str) -> str:
    """
    Sanitize HTML to prevent XSS attacks
    Escapes HTML special characters
    """
    if not text:
        return text
    
    # Escape HTML special characters
    sanitized = html.escape(text)
    
    return sanitized


def sanitize_sql(text: str) -> str:
    """
    Basic SQL injection prevention
    Note: Always use parameterized queries as primary defense
    """
    if not text:
        return text
    
    # Remove common SQL injection patterns
    dangerous_patterns = [
        r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)",
        r"(--|;|\/\*|\*\/)",
        r"(\bOR\b.*=.*)",
        r"(\bAND\b.*=.*)",
        r"('.*--)",
    ]
    
    sanitized = text
    for pattern in dangerous_patterns:
        sanitized = re.sub(pattern, '', sanitized, flags=re.IGNORECASE)
    
    return sanitized.strip()


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent directory traversal
    """
    if not filename:
        return filename
    
    # Remove path separators and special characters
    sanitized = re.sub(r'[/\\:*?"<>|]', '', filename)
    
    # Remove leading dots (hidden files)
    sanitized = sanitized.lstrip('.')
    
    # Limit length
    max_length = 255
    if len(sanitized) > max_length:
        name, ext = sanitized.rsplit('.', 1) if '.' in sanitized else (sanitized, '')
        sanitized = name[:max_length - len(ext) - 1] + '.' + ext if ext else name[:max_length]
    
    return sanitized


def check_profanity(text: str) -> tuple[bool, Optional[str]]:
    """
    Check text for profanity
    Returns (has_profanity, matched_word)
    """
    if not text:
        return False, None
    
    text_lower = text.lower()
    
    for word in PROFANITY_LIST:
        # Use word boundaries to avoid false positives
        pattern = r'\b' + re.escape(word) + r'\b'
        if re.search(pattern, text_lower):
            return True, word
    
    return False, None


def sanitize_user_input(
    text: str,
    max_length: Optional[int] = None,
    allow_html: bool = False,
    check_profanity_flag: bool = False
) -> str:
    """
    Comprehensive user input sanitization
    
    Args:
        text: Input text to sanitize
        max_length: Maximum allowed length
        allow_html: Whether to allow HTML (default: False)
        check_profanity_flag: Whether to check for profanity
    
    Returns:
        Sanitized text
    
    Raises:
        ValueError: If input contains profanity or exceeds max length
    """
    if not text:
        return text
    
    # Trim whitespace
    sanitized = text.strip()
    
    # Check length
    if max_length and len(sanitized) > max_length:
        raise ValueError(f"Input exceeds maximum length of {max_length} characters")
    
    # Check profanity
    if check_profanity_flag:
        has_profanity, word = check_profanity(sanitized)
        if has_profanity:
            logger.warning(f"Profanity detected: {word}")
            raise ValueError("Input contains inappropriate language")
    
    # Sanitize HTML if not allowed
    if not allow_html:
        sanitized = sanitize_html(sanitized)
    
    # Basic SQL injection prevention
    sanitized = sanitize_sql(sanitized)
    
    return sanitized


def validate_email(email: str) -> bool:
    """
    Validate email format
    """
    if not email:
        return False
    
    # Basic email regex
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_url(url: str) -> bool:
    """
    Validate URL format
    """
    if not url:
        return False
    
    # Basic URL regex
    pattern = r'^https?://[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(/.*)?$'
    return bool(re.match(pattern, url))


def sanitize_prompt(prompt: str) -> str:
    """
    Sanitize AI prompt input
    Removes potentially harmful instructions
    """
    if not prompt:
        return prompt
    
    # Remove common prompt injection patterns
    dangerous_patterns = [
        r"ignore (previous|all) instructions?",
        r"disregard (previous|all) instructions?",
        r"forget (previous|all) instructions?",
        r"system:?\s*",
        r"admin:?\s*",
        r"root:?\s*",
    ]
    
    sanitized = prompt
    for pattern in dangerous_patterns:
        sanitized = re.sub(pattern, '', sanitized, flags=re.IGNORECASE)
    
    # Trim and limit length
    sanitized = sanitized.strip()
    max_prompt_length = 2000
    if len(sanitized) > max_prompt_length:
        sanitized = sanitized[:max_prompt_length]
    
    return sanitized


def sanitize_tags(tags: list[str]) -> list[str]:
    """
    Sanitize list of tags
    """
    if not tags:
        return []
    
    sanitized_tags = []
    for tag in tags:
        # Sanitize each tag
        sanitized = sanitize_user_input(tag, max_length=50)
        
        # Remove special characters except hyphens and underscores
        sanitized = re.sub(r'[^a-zA-Z0-9_-]', '', sanitized)
        
        # Skip empty tags
        if sanitized:
            sanitized_tags.append(sanitized.lower())
    
    # Remove duplicates while preserving order
    seen = set()
    unique_tags = []
    for tag in sanitized_tags:
        if tag not in seen:
            seen.add(tag)
            unique_tags.append(tag)
    
    # Limit number of tags
    max_tags = 10
    return unique_tags[:max_tags]


# Example usage in API endpoints:
"""
from app.core.sanitization import sanitize_user_input, sanitize_prompt

@router.post("/create-post")
async def create_post(title: str, description: str):
    # Sanitize inputs
    title = sanitize_user_input(title, max_length=200, check_profanity_flag=True)
    description = sanitize_user_input(description, max_length=1000, check_profanity_flag=True)
    
    # Process...
"""

