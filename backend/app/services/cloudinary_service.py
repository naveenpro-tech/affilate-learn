import cloudinary
import cloudinary.uploader
import cloudinary.api
from app.core.config import settings

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)


class CloudinaryService:
    """Service for Cloudinary video and image management"""
    
    def upload_video(self, file_path: str, folder: str = "courses", public_id: str = None) -> dict:
        """
        Upload a video to Cloudinary
        
        Args:
            file_path: Path to the video file or file object
            folder: Cloudinary folder to store the video
            public_id: Optional custom public ID
            
        Returns:
            Upload result with URL and public_id
        """
        try:
            upload_options = {
                "resource_type": "video",
                "folder": folder,
                "overwrite": True,
                "notification_url": None,  # Add webhook URL in production
            }
            
            if public_id:
                upload_options["public_id"] = public_id
            
            result = cloudinary.uploader.upload(file_path, **upload_options)
            
            return {
                "public_id": result.get("public_id"),
                "url": result.get("secure_url"),
                "duration": result.get("duration"),
                "format": result.get("format"),
                "resource_type": result.get("resource_type"),
                "thumbnail_url": self.get_video_thumbnail(result.get("public_id"))
            }
        except Exception as e:
            print(f"Error uploading video: {e}")
            raise
    
    def upload_image(self, file_path: str, folder: str = "thumbnails", public_id: str = None) -> dict:
        """
        Upload an image to Cloudinary
        
        Args:
            file_path: Path to the image file or file object
            folder: Cloudinary folder to store the image
            public_id: Optional custom public ID
            
        Returns:
            Upload result with URL and public_id
        """
        try:
            upload_options = {
                "resource_type": "image",
                "folder": folder,
                "overwrite": True,
            }
            
            if public_id:
                upload_options["public_id"] = public_id
            
            result = cloudinary.uploader.upload(file_path, **upload_options)
            
            return {
                "public_id": result.get("public_id"),
                "url": result.get("secure_url"),
                "format": result.get("format"),
                "width": result.get("width"),
                "height": result.get("height")
            }
        except Exception as e:
            print(f"Error uploading image: {e}")
            raise
    
    def delete_video(self, public_id: str) -> bool:
        """
        Delete a video from Cloudinary
        
        Args:
            public_id: Public ID of the video
            
        Returns:
            True if successful
        """
        try:
            result = cloudinary.uploader.destroy(public_id, resource_type="video")
            return result.get("result") == "ok"
        except Exception as e:
            print(f"Error deleting video: {e}")
            return False
    
    def delete_image(self, public_id: str) -> bool:
        """
        Delete an image from Cloudinary
        
        Args:
            public_id: Public ID of the image
            
        Returns:
            True if successful
        """
        try:
            result = cloudinary.uploader.destroy(public_id, resource_type="image")
            return result.get("result") == "ok"
        except Exception as e:
            print(f"Error deleting image: {e}")
            return False
    
    def get_video_url(self, public_id: str, transformation: dict = None) -> str:
        """
        Get video URL with optional transformations
        
        Args:
            public_id: Public ID of the video
            transformation: Optional transformation parameters
            
        Returns:
            Video URL
        """
        if transformation:
            return cloudinary.CloudinaryVideo(public_id).build_url(**transformation)
        return cloudinary.CloudinaryVideo(public_id).build_url()
    
    def get_video_thumbnail(self, public_id: str) -> str:
        """
        Get video thumbnail URL
        
        Args:
            public_id: Public ID of the video
            
        Returns:
            Thumbnail URL
        """
        return cloudinary.CloudinaryVideo(public_id).build_url(
            format="jpg",
            resource_type="video",
            transformation=[
                {"width": 640, "height": 360, "crop": "fill"},
                {"quality": "auto"}
            ]
        )
    
    def get_streaming_url(self, public_id: str, format: str = "m3u8") -> str:
        """
        Get adaptive streaming URL for video
        
        Args:
            public_id: Public ID of the video
            format: Streaming format (m3u8 for HLS, mpd for DASH)
            
        Returns:
            Streaming URL
        """
        return cloudinary.CloudinaryVideo(public_id).build_url(
            resource_type="video",
            format=format,
            streaming_profile="auto"
        )


# Singleton instance
cloudinary_service = CloudinaryService()

