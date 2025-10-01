"""
Rate limiting configuration using slowapi
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

# Create limiter instance
# In production, use Redis: storage_uri="redis://localhost:6379"
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200/hour"],  # Default limit for all endpoints
    storage_uri="memory://",  # Use in-memory storage for now
)

