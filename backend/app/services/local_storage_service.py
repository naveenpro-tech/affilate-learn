"""
Local Storage Service for Development
Stores generated images locally instead of Cloudinary
"""

import os
import uuid
import logging
from pathlib import Path
from datetime import datetime
from typing import BinaryIO, Union
from app.core.config import settings

logger = logging.getLogger(__name__)


class LocalStorageService:
    """Service for storing images locally during development"""
    
    def __init__(self):
        # Base directory for storing images (absolute path under backend/static/generated)
        # __file__ = .../backend/app/services/local_storage_service.py
        # parents[0] = .../backend/app/services/
        # parents[1] = .../backend/app/
        # parents[2] = .../backend/
        backend_root = Path(__file__).resolve().parents[2]  # backend/
        self.base_dir = backend_root / "static" / "generated"

        # Base URL for serving images
        # In production, this would be your domain
        self.base_url = f"{settings.API_BASE_URL}/static/generated"

        # Create base directory if it doesn't exist
        self.base_dir.mkdir(parents=True, exist_ok=True)

        logger.info(f"LocalStorageService initialized: {self.base_dir}")
    
    def save_image(
        self, 
        image_data: Union[bytes, BinaryIO], 
        user_id: int,
        extension: str = "png"
    ) -> str:
        """
        Save image locally and return public URL
        
        Args:
            image_data: Image bytes or file-like object
            user_id: User ID for organizing files
            extension: File extension (default: png)
        
        Returns:
            Public URL to access the image
        """
        try:
            # Create directory structure: YYYY/MM/DD/
            now = datetime.now()
            date_path = now.strftime("%Y/%m/%d")
            dir_path = self.base_dir / date_path
            dir_path.mkdir(parents=True, exist_ok=True)
            
            # Generate unique filename: user-{id}-{timestamp}-{uuid}.{ext}
            timestamp = now.strftime("%H%M%S")
            unique_id = uuid.uuid4().hex[:8]
            filename = f"user-{user_id}-{timestamp}-{unique_id}.{extension}"
            file_path = dir_path / filename
            
            # Save file
            if isinstance(image_data, bytes):
                with open(file_path, 'wb') as f:
                    f.write(image_data)
            else:
                # File-like object
                with open(file_path, 'wb') as f:
                    f.write(image_data.read())
            
            # Generate public URL
            public_url = f"{self.base_url}/{date_path}/{filename}"
            
            logger.info(f"Image saved: {file_path} -> {public_url}")
            return public_url
            
        except Exception as e:
            logger.error(f"Failed to save image locally: {e}")
            raise
    
    def delete_image(self, image_url: str) -> bool:
        """
        Delete image from local storage
        
        Args:
            image_url: Public URL of the image
        
        Returns:
            True if deleted successfully
        """
        try:
            # Extract relative path from URL
            # URL format: http://localhost:8000/static/generated/2025/01/15/user-123-abc.png
            # Extract: 2025/01/15/user-123-abc.png
            path_parts = image_url.split("/static/generated/")
            if len(path_parts) != 2:
                logger.error(f"Invalid image URL format: {image_url}")
                return False

            relative_path = path_parts[1]
            file_path = (self.base_dir / relative_path).resolve()

            # Security: Verify the resolved path is within base_dir
            base_dir_resolved = self.base_dir.resolve()
            try:
                file_path.relative_to(base_dir_resolved)
            except ValueError:
                logger.error(f"Directory traversal attempt detected: {image_url}")
                return False

            if file_path.exists():
                file_path.unlink()
                logger.info(f"Image deleted: {file_path}")
                return True
            else:
                logger.warning(f"Image not found: {file_path}")
                return False

        except Exception as e:
            logger.error(f"Failed to delete image: {e}")
            return False
    
    def get_file_path(self, image_url: str) -> Path:
        """
        Get local file path from public URL
        
        Args:
            image_url: Public URL of the image
        
        Returns:
            Path object to the local file
        """
        path_parts = image_url.split("/static/generated/")
        if len(path_parts) != 2:
            raise ValueError(f"Invalid image URL format: {image_url}")

        relative_path = path_parts[1]
        file_path = (self.base_dir / relative_path).resolve()

        # Security: Verify the resolved path is within base_dir
        base_dir_resolved = self.base_dir.resolve()
        try:
            file_path.relative_to(base_dir_resolved)
        except ValueError:
            raise ValueError(f"Directory traversal attempt detected: {image_url}")

        return file_path
    
    def cleanup_old_images(self, days: int = 30) -> int:
        """
        Clean up images older than specified days
        
        Args:
            days: Number of days to keep images
        
        Returns:
            Number of images deleted
        """
        try:
            from datetime import timedelta
            
            cutoff_date = datetime.now() - timedelta(days=days)
            deleted_count = 0
            
            # Walk through all files
            for file_path in self.base_dir.rglob("*.png"):
                # Check file modification time
                mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
                if mtime < cutoff_date:
                    file_path.unlink()
                    deleted_count += 1
            
            logger.info(f"Cleaned up {deleted_count} old images (older than {days} days)")
            return deleted_count
            
        except Exception as e:
            logger.error(f"Failed to cleanup old images: {e}")
            return 0


# Singleton instance
_local_storage_service = None


def get_local_storage_service() -> LocalStorageService:
    """Get singleton instance of LocalStorageService"""
    global _local_storage_service
    if _local_storage_service is None:
        _local_storage_service = LocalStorageService()
    return _local_storage_service

