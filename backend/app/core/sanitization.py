"""
Input Sanitization and Validation
Protects against XSS, SQL injection, and other attacks
"""

import re
import html
import unicodedata
from typing import Optional
from urllib.parse import urlparse
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
    Preserves full extension sequence (e.g., .tar.gz)
    """
    if not filename:
        return filename

    # Remove path separators and special characters
    sanitized = re.sub(r'[/\\:*?"<>|]', '', filename)

    # Handle filenames starting with dot (e.g., .env)
    if sanitized.startswith('.') and sanitized.count('.') == 1:
        # Single leading dot - treat as hidden file with no extension
        max_length = 255
        return sanitized[:max_length]

    # Remove leading dots for regular files
    sanitized = sanitized.lstrip('.')

    # Preserve full extension sequence
    max_length = 255
    if len(sanitized) > max_length:
        if '.' in sanitized:
            # Find first dot to preserve all extensions
            first_dot_idx = sanitized.find('.')
            base = sanitized[:first_dot_idx]
            ext = sanitized[first_dot_idx:]  # Everything from first dot onward

            # Truncate base to fit within max_length
            available_space = max_length - len(ext)
            if available_space > 0:
                sanitized = base[:available_space] + ext
            else:
                # Extension too long, just truncate whole thing
                sanitized = sanitized[:max_length]
        else:
            # No extension, just truncate
            sanitized = sanitized[:max_length]

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
            # Log generic message without revealing the actual word
            logger.warning("Profanity detected in input")
            raise ValueError("Input contains inappropriate language")
    
    # Sanitize HTML if not allowed
    if not allow_html:
        sanitized = sanitize_html(sanitized)

    # NOTE: SQL injection prevention removed - use parameterized queries instead
    # All database access must use parameterized queries/prepared statements

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
    Validate URL format using urllib.parse
    Accepts http/https URLs with hostnames, IPs, localhost, ports, queries, fragments
    """
    if not url:
        return False

    try:
        result = urlparse(url)
        # Check scheme is http or https
        if result.scheme not in ('http', 'https'):
            return False
        # Check netloc (hostname/IP) is non-empty
        if not result.netloc:
            return False
        return True
    except Exception:
        return False


def sanitize_prompt(prompt: str) -> str:
    """
    Sanitize AI prompt input
    Removes potentially harmful instructions with improved detection

    NOTE: This is a deterrent only. Pair with rate-limiting and output validation.
    """
    if not prompt:
        return prompt

    # Step 1: Normalize Unicode (NFKC) to handle homoglyphs and width variants
    sanitized = unicodedata.normalize('NFKC', prompt)

    # Step 2: Remove zero-width and combining characters
    sanitized = ''.join(c for c in sanitized if unicodedata.category(c) not in ('Mn', 'Cf'))

    # Step 3: Collapse whitespace to prevent "i g n o r e" bypasses
    sanitized = re.sub(r'\s+', ' ', sanitized)

    # Step 4: Remove common prompt injection patterns with word boundaries
    # Allow optional separators/leet variants between letters
    dangerous_patterns = [
        r"\b(i\W*g\W*n\W*o\W*r\W*e)\b.*\b(instructions?|previous|all)\b",
        r"\b(d\W*i\W*s\W*r\W*e\W*g\W*a\W*r\W*d)\b.*\b(instructions?|previous|all)\b",
        r"\b(f\W*o\W*r\W*g\W*e\W*t)\b.*\b(instructions?|previous|all)\b",
        r"\b(s\W*y\W*s\W*t\W*e\W*m)\W*:?\W*",
        r"\b(a\W*d\W*m\W*i\W*n)\W*:?\W*",
        r"\b(r\W*o\W*o\W*t)\W*:?\W*",
    ]

    for pattern in dangerous_patterns:
        match = re.search(pattern, sanitized, flags=re.IGNORECASE)
        if match:
            # Log detection for telemetry (without revealing full prompt)
            logger.warning(f"Prompt injection pattern detected: {pattern[:30]}...")
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
    Does NOT use sanitize_sql to preserve legitimate tags like "select-color"
    """
    if not tags:
        return []

    sanitized_tags = []
    for tag in tags:
        # Trim whitespace
        sanitized = tag.strip()

        # Truncate to max 50 characters
        if len(sanitized) > 50:
            sanitized = sanitized[:50]

        # Remove special characters except hyphens and underscores
        sanitized = re.sub(r'[^a-zA-Z0-9_-]', '', sanitized)

        # Collapse multiple hyphens/underscores
        sanitized = re.sub(r'[-_]+', '-', sanitized)

        # Lowercase and skip empty tags
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

