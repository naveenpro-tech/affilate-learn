"""
Image Generation Service with Provider Adapters
Supports: Replicate, Stability AI, Fal.ai, OpenAI
"""

import logging
import os
import base64
import io
from typing import Optional, Dict, Any

import httpx
import replicate
from app.core.config import settings
from app.services.cloudinary_service import cloudinary_service

logger = logging.getLogger(__name__)


class ImageGenerationAdapter:
    """Base adapter for image generation providers"""

    async def generate(self, prompt: str, tier: str = "standard") -> Dict[str, Any]:
        """Generate image from prompt. Returns {job_id, status}"""
        raise NotImplementedError


class ReplicateAdapter(ImageGenerationAdapter):
    """Replicate.com adapter for SDXL and other models"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.IMAGEGEN_API_KEY
        if not self.api_key:
            raise ValueError("IMAGEGEN_API_KEY not configured")
        # Configure Replicate via environment variable expected by the SDK
        os.environ["REPLICATE_API_TOKEN"] = self.api_key

    async def generate(self, prompt: str, tier: str = "standard") -> Dict[str, Any]:
        """
        Generate image using Replicate API
        Returns: {job_id, status, model_id}
        """
        try:
            # Map tier to model parameters
            params = self._get_tier_params(tier)

            logger.info(f"Generating image via Replicate: {prompt[:50]}...")

            # Use SDXL model
            output = replicate.run(
                "stability-ai/sdxl:39ed52f2a60c3b36b96384b26f1ea0d2f189777d8112e482141f519b238ca9d3",
                input={
                    "prompt": prompt,
                    "negative_prompt": "blurry, low quality, distorted",
                    "num_outputs": 1,
                    "scheduler": "K_EULER",
                    "num_inference_steps": params.get("steps", 50),
                    "guidance_scale": params.get("guidance_scale", 7.5),
                    "width": params.get("width", 1024),
                    "height": params.get("height", 1024),
                }
            )

            # Replicate returns list of URLs
            image_url = output[0] if output else None

            import uuid
            return {
                "job_id": f"replicate-{uuid.uuid4().hex[:12]}",  # ensure unique
                "status": "succeeded",
                "image_url": image_url,
                "provider": "replicate",
                "width": params.get("width", 1024),
                "height": params.get("height", 1024),
            }

        except Exception as e:
            logger.error(f"Replicate generation failed: {e}")
            return {
                "job_id": None,
                "status": "failed",
                "error": str(e),
                "provider": "replicate",
            }

    def _get_tier_params(self, tier: str) -> Dict[str, Any]:
        """Get parameters based on tier"""
        tiers = {
            "standard": {"width": 1024, "height": 1024, "steps": 50, "guidance_scale": 7.5},
            "premium2": {"width": 1280, "height": 1280, "steps": 75, "guidance_scale": 8.0},
            "premium4": {"width": 1536, "height": 1536, "steps": 100, "guidance_scale": 8.5},
        }
        return tiers.get(tier, tiers["standard"])

class GeminiNanoBananaAdapter(ImageGenerationAdapter):
    """Google Gemini 2.5 Flash Image (Nano Banana) - Latest 2025 model"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not configured")
        self.api_base = getattr(settings, "PROMPT_ENHANCER_API_BASE", "https://generativelanguage.googleapis.com")
        self.model_id = "gemini-2.5-flash-image"  # Nano Banana

    def _tier_params(self, tier: str) -> Dict[str, Any]:
        # Gemini 2.5 Flash Image supports various aspect ratios
        # Map tiers to aspect ratios and resolutions
        mapping = {
            "standard": {"aspectRatio": "1:1", "width": 1024, "height": 1024},
            "premium2": {"aspectRatio": "3:2", "width": 1248, "height": 832},
            "premium4": {"aspectRatio": "16:9", "width": 1344, "height": 768},
        }
        return mapping.get(tier, mapping["standard"])

    async def generate(self, prompt: str, tier: str = "standard", user_id: int = 0) -> Dict[str, Any]:
        try:
            params = self._tier_params(tier)
            url = f"{self.api_base}/v1beta/models/{self.model_id}:generateContent"
            headers = {
                "x-goog-api-key": self.api_key,
                "Content-Type": "application/json",
            }

            # Build request according to 2025 Gemini API documentation
            payload = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }],
                "generationConfig": {
                    "responseModalities": ["Image"],
                    "imageConfig": {
                        "aspectRatio": params["aspectRatio"]
                    }
                }
            }

            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.post(url, headers=headers, json=payload)
                if resp.status_code != 200:
                    err_txt = resp.text
                    logger.error(f"Nano Banana generate failed: {resp.status_code} {err_txt}")
                    return {
                        "job_id": None,
                        "status": "failed",
                        "error": f"Nano Banana API error: {resp.status_code}",
                        "provider": "gemini_nano_banana",
                    }
                data = resp.json()

            # Extract base64 image from response (inline_data format)
            b64 = None
            candidates = data.get("candidates", [])
            if candidates:
                content = candidates[0].get("content", {})
                parts = content.get("parts", [])
                for part in parts:
                    inline_data = part.get("inlineData") or part.get("inline_data")
                    if inline_data:
                        b64 = inline_data.get("data")
                        if b64:
                            break

            if not b64:
                logger.error(f"Nano Banana response missing image data: {data}")
                return {
                    "job_id": None,
                    "status": "failed",
                    "error": "No image in response",
                    "provider": "gemini_nano_banana",
                }

            img_bytes = base64.b64decode(b64)
            buf = io.BytesIO(img_bytes)

            # Save to local storage instead of Cloudinary
            from app.services.local_storage_service import get_local_storage_service
            storage = get_local_storage_service()
            image_url = storage.save_image(img_bytes, user_id, extension="png")

            import uuid
            return {
                "job_id": f"nano-banana-{uuid.uuid4().hex[:12]}",
                "status": "succeeded",
                "image_url": image_url,
                "provider": "gemini_nano_banana",
                "width": params.get("width", 1024),
                "height": params.get("height", 1024),
            }
        except Exception as e:
            logger.error(f"Gemini Nano Banana generation failed: {e}")
            return {
                "job_id": None,
                "status": "failed",
                "error": str(e),
                "provider": "gemini_nano_banana",
            }


class OpenAIDALLEAdapter(ImageGenerationAdapter):
    """OpenAI DALL-E 3 adapter for image generation"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not configured")
        self.api_base = "https://api.openai.com/v1"

    def _tier_params(self, tier: str) -> Dict[str, Any]:
        """Map tiers to DALL-E 3 parameters"""
        mapping = {
            "standard": {"size": "1024x1024", "quality": "standard"},
            "premium2": {"size": "1024x1792", "quality": "standard"},  # Portrait
            "premium4": {"size": "1792x1024", "quality": "hd"},  # Landscape HD
        }
        return mapping.get(tier, mapping["standard"])

    async def generate(self, prompt: str, tier: str = "standard", user_id: int = 0) -> Dict[str, Any]:
        """Generate image using OpenAI DALL-E 3"""
        try:
            from app.services.local_storage_service import get_local_storage_service

            params = self._tier_params(tier)
            url = f"{self.api_base}/images/generations"
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }

            payload = {
                "model": "dall-e-3",
                "prompt": prompt,
                "n": 1,
                "size": params["size"],
                "quality": params["quality"],
                "response_format": "url"  # Get URL directly
            }

            logger.info(f"Generating image via DALL-E 3: {prompt[:50]}...")

            async with httpx.AsyncClient(timeout=120.0) as client:
                resp = await client.post(url, headers=headers, json=payload)
                if resp.status_code != 200:
                    err_txt = resp.text
                    logger.error(f"DALL-E 3 generate failed: {resp.status_code} {err_txt}")
                    return {
                        "job_id": None,
                        "status": "failed",
                        "error": f"DALL-E 3 API error: {resp.status_code}",
                        "provider": "openai_dalle",
                    }
                data = resp.json()

            # Extract image URL from response
            image_url = data["data"][0]["url"]

            # Download and save to local storage
            async with httpx.AsyncClient(timeout=60.0) as client:
                img_resp = await client.get(image_url)
                img_bytes = img_resp.content

            # Save locally instead of Cloudinary
            storage = get_local_storage_service()
            local_url = storage.save_image(img_bytes, user_id, extension="png")

            import uuid
            return {
                "job_id": f"dalle3-{uuid.uuid4().hex[:12]}",
                "status": "succeeded",
                "image_url": local_url,
                "provider": "openai_dalle",
                "width": int(params["size"].split("x")[0]),
                "height": int(params["size"].split("x")[1]),
            }
        except Exception as e:
            logger.error(f"OpenAI DALL-E 3 generation failed: {e}")
            import traceback
            traceback.print_exc()
            return {
                "job_id": None,
                "status": "failed",
                "error": str(e),
                "provider": "openai_dalle",
            }


class HuggingFaceAdapter(ImageGenerationAdapter):
    """Hugging Face Inference API adapter (Free tier: 1000 calls/day)"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.HUGGINGFACE_API_KEY
        if not self.api_key:
            raise ValueError("HUGGINGFACE_API_KEY not configured")
        # Using Stable Diffusion XL model on HF
        self.model_id = "stabilityai/stable-diffusion-xl-base-1.0"
        self.api_url = f"https://api-inference.huggingface.co/models/{self.model_id}"

    def _tier_params(self, tier: str) -> Dict[str, Any]:
        """Map tiers to parameters"""
        mapping = {
            "standard": {"width": 1024, "height": 1024},
            "premium2": {"width": 1024, "height": 1536},
            "premium4": {"width": 1536, "height": 1024},
        }
        return mapping.get(tier, mapping["standard"])

    async def generate(self, prompt: str, tier: str = "standard", user_id: int = 0) -> Dict[str, Any]:
        """Generate image using Hugging Face Inference API"""
        try:
            from app.services.local_storage_service import get_local_storage_service

            params = self._tier_params(tier)
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }

            payload = {
                "inputs": prompt,
                "parameters": {
                    "width": params["width"],
                    "height": params["height"],
                    "num_inference_steps": 30,
                }
            }

            logger.info(f"Generating image via Hugging Face: {prompt[:50]}...")

            async with httpx.AsyncClient(timeout=120.0) as client:
                resp = await client.post(self.api_url, headers=headers, json=payload)
                if resp.status_code != 200:
                    err_txt = resp.text
                    logger.error(f"Hugging Face generate failed: {resp.status_code} {err_txt}")
                    return {
                        "job_id": None,
                        "status": "failed",
                        "error": f"Hugging Face API error: {resp.status_code}",
                        "provider": "huggingface",
                    }

                # Response is raw image bytes
                img_bytes = resp.content

            # Save to local storage instead of Cloudinary
            storage = get_local_storage_service()
            local_url = storage.save_image(img_bytes, user_id, extension="png")

            import uuid
            return {
                "job_id": f"hf-{uuid.uuid4().hex[:12]}",
                "status": "succeeded",
                "image_url": local_url,
                "provider": "huggingface",
                "width": params["width"],
                "height": params["height"],
            }
        except Exception as e:
            logger.error(f"Hugging Face generation failed: {e}")
            import traceback
            traceback.print_exc()
            return {
                "job_id": None,
                "status": "failed",
                "error": str(e),
                "provider": "huggingface",
            }


class MockImageGenerationAdapter(ImageGenerationAdapter):
    """Mock adapter for testing - generates images locally with PIL"""

    async def generate(self, prompt: str, tier: str = "standard", user_id: int = 0) -> Dict[str, Any]:
        """
        Generate mock image using PIL (local generation)
        Returns: {job_id, status, image_url}
        """
        try:
            import uuid
            from datetime import datetime
            from PIL import Image, ImageDraw, ImageFont
            from app.services.local_storage_service import get_local_storage_service

            # Generate unique job ID
            job_id = f"mock-{uuid.uuid4().hex[:12]}"

            # Get tier parameters
            params = self._get_tier_params(tier)
            width = params.get("width", 1024)
            height = params.get("height", 1024)

            logger.info(f"Generating mock image: {job_id} for prompt: {prompt[:50]}...")

            # Generate color from prompt hash
            color = self._get_color_from_prompt(prompt)

            # Create image with solid color background
            img = Image.new('RGB', (width, height), color)
            draw = ImageDraw.Draw(img)

            # Add text overlay with prompt
            try:
                # Try to use a nice font
                font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 40)
            except:
                # Fallback to default font
                font = ImageDraw.ImageFont.load_default()

            # Add "MOCK IMAGE" watermark
            watermark = "MOCK IMAGE"
            draw.text((20, 20), watermark, fill='white', font=font)

            # Add prompt text (wrapped)
            prompt_text = self._wrap_text(prompt, 40)
            draw.text((20, 80), prompt_text, fill='white', font=font)

            # Add tier and dimensions info
            info_text = f"{tier.upper()} | {width}x{height}"
            draw.text((20, height - 60), info_text, fill='white', font=font)

            # Convert to bytes
            buf = io.BytesIO()
            img.save(buf, format='PNG')
            image_bytes = buf.getvalue()

            # Save to local storage
            storage = get_local_storage_service()
            image_url = storage.save_image(image_bytes, user_id, extension="png")

            logger.info(f"Mock image saved: {image_url}")

            return {
                "job_id": job_id,
                "status": "succeeded",
                "image_url": image_url,
                "provider": "mock",
                "width": width,
                "height": height,
                "created_at": datetime.utcnow().isoformat(),
            }

        except Exception as e:
            logger.error(f"Mock generation failed: {e}")
            import traceback
            traceback.print_exc()
            return {
                "job_id": None,
                "status": "failed",
                "error": str(e),
                "provider": "mock",
            }

    def _get_color_from_prompt(self, prompt: str) -> tuple:
        """Generate a color from prompt hash"""
        hash_val = abs(hash(prompt))
        r = (hash_val % 200) + 55  # 55-255
        g = ((hash_val // 256) % 200) + 55
        b = ((hash_val // 65536) % 200) + 55
        return (r, g, b)

    def _wrap_text(self, text: str, max_chars: int) -> str:
        """Wrap text to max characters per line"""
        words = text.split()
        lines = []
        current_line = []
        current_length = 0

        for word in words:
            if current_length + len(word) + 1 <= max_chars:
                current_line.append(word)
                current_length += len(word) + 1
            else:
                if current_line:
                    lines.append(' '.join(current_line))
                current_line = [word]
                current_length = len(word)

        if current_line:
            lines.append(' '.join(current_line))

        return '\n'.join(lines[:5])  # Max 5 lines

    def _get_tier_params(self, tier: str) -> Dict[str, Any]:
        """Get parameters based on tier"""
        tiers = {
            "standard": {
                "width": 1024,
                "height": 1024,
                "steps": 50,
                "guidance_scale": 7.5,
            },
            "premium2": {
                "width": 1280,
                "height": 1280,
                "steps": 75,
                "guidance_scale": 8.0,
            },
            "premium4": {
                "width": 1536,
                "height": 1536,
                "steps": 100,
                "guidance_scale": 8.5,
            },
        }
        return tiers.get(tier, tiers["standard"])


class ImageGenerationService:
    """Main service for image generation with provider abstraction"""

    def __init__(self):
        self.provider = settings.IMAGEGEN_PROVIDER
        self.adapter = self._get_adapter()

    def _get_adapter(self, provider_override: Optional[str] = None) -> ImageGenerationAdapter:
        """Get appropriate adapter based on configuration or override"""
        provider = provider_override or self.provider

        # Gemini Nano Banana (2.5 Flash Image)
        if provider in ("gemini", "imagen", "gemini_imagen", "nano_banana", "gemini_nano_banana"):
            if not settings.GEMINI_API_KEY:
                logger.warning("Gemini API key not configured, using mock adapter")
                return MockImageGenerationAdapter()
            return GeminiNanoBananaAdapter(settings.GEMINI_API_KEY)

        # OpenAI DALL-E 3
        elif provider in ("openai", "dalle", "dalle3", "openai_dalle"):
            if not settings.OPENAI_API_KEY:
                logger.warning("OpenAI API key not configured, using mock adapter")
                return MockImageGenerationAdapter()
            return OpenAIDALLEAdapter(settings.OPENAI_API_KEY)

        # Hugging Face (Free tier)
        elif provider in ("huggingface", "hf"):
            if not settings.HUGGINGFACE_API_KEY:
                logger.warning("Hugging Face API key not configured, using mock adapter")
                return MockImageGenerationAdapter()
            return HuggingFaceAdapter(settings.HUGGINGFACE_API_KEY)

        # Replicate
        elif provider == "replicate":
            if not settings.IMAGEGEN_API_KEY:
                logger.warning("Replicate API key not configured, using mock adapter")
                return MockImageGenerationAdapter()
            return ReplicateAdapter(settings.IMAGEGEN_API_KEY)

        # Mock for testing
        elif provider == "mock":
            return MockImageGenerationAdapter()

        # Auto mode: Try providers in order until one works
        elif provider == "auto":
            # Try OpenAI first (best quality, you have API key)
            if settings.OPENAI_API_KEY:
                logger.info("Auto mode: Using OpenAI DALL-E 3")
                return OpenAIDALLEAdapter(settings.OPENAI_API_KEY)
            # Try Hugging Face (free tier)
            elif settings.HUGGINGFACE_API_KEY:
                logger.info("Auto mode: Using Hugging Face")
                return HuggingFaceAdapter(settings.HUGGINGFACE_API_KEY)
            # Try Gemini
            elif settings.GEMINI_API_KEY:
                logger.info("Auto mode: Using Gemini Nano Banana")
                return GeminiNanoBananaAdapter(settings.GEMINI_API_KEY)
            # Fallback to mock
            else:
                logger.warning("Auto mode: No API keys configured, using mock adapter")
                return MockImageGenerationAdapter()

        else:
            raise ValueError(f"Unknown image generation provider: {provider}")

    async def generate_image(
        self,
        prompt: str,
        tier: str = "standard",
        provider: Optional[str] = None,
        user_id: int = 0
    ) -> Dict[str, Any]:
        """
        Generate image from prompt
        Args:
            prompt: Text description of image to generate
            tier: Quality tier (standard, premium2, premium4)
            provider: Override provider (openai_dalle, huggingface, gemini_nano_banana, auto, etc.)
            user_id: User ID for organizing files
        Returns: {job_id, status, image_url?, error?}
        """
        # Use provider override if specified
        adapter = self._get_adapter(provider) if provider else self.adapter

        logger.info(f"Generating image with tier={tier}, provider={provider or self.provider}: {prompt[:50]}...")
        result = await adapter.generate(prompt, tier, user_id=user_id)
        return result

    async def get_generation_status(self, job_id: str) -> Dict[str, Any]:
        """Get status of a generation job"""
        # For Replicate (synchronous), status is already known
        # For async providers, this would poll the API
        logger.info(f"Checking status for job: {job_id}")
        return {
            "job_id": job_id,
            "status": "succeeded",  # Replicate is synchronous
        }


# Singleton instance
_image_gen_service: Optional[ImageGenerationService] = None


def get_image_generation_service() -> ImageGenerationService:
    """Get or create image generation service"""
    global _image_gen_service
    if _image_gen_service is None:
        _image_gen_service = ImageGenerationService()
    return _image_gen_service

