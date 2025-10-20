"""
Hugging Face Prompt Enhancement Service
Uses free Hugging Face Inference API for prompt enhancement
"""

import logging
import httpx
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


class HuggingFacePromptEnhancer:
    """Prompt enhancement using Hugging Face Inference API (Free tier)"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.HUGGINGFACE_API_KEY
        if not self.api_key:
            raise ValueError("HUGGINGFACE_API_KEY not configured")
        
        # Use a good free model for text generation
        # Mistral-7B-Instruct is excellent for prompt enhancement
        self.model = "mistralai/Mistral-7B-Instruct-v0.2"
        self.api_url = f"https://api-inference.huggingface.co/models/{self.model}"
    
    async def enhance_prompt(self, prompt: str) -> str:
        """
        Enhance a prompt using Hugging Face LLM
        
        Args:
            prompt: Original prompt to enhance
        
        Returns:
            Enhanced prompt with more details
        """
        try:
            # Create instruction for the model
            instruction = f"""<s>[INST] You are an expert AI image prompt enhancer. Your task is to take a simple prompt and enhance it with vivid, specific details for image generation.

Rules:
1. Keep the core concept from the original prompt
2. Add specific visual details (colors, lighting, composition, style)
3. Include atmosphere and mood
4. Make it concise but descriptive (max 150 words)
5. Return ONLY the enhanced prompt, no explanations or extra text

Original prompt: {prompt}

Enhanced prompt: [/INST]"""

            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }
            
            payload = {
                "inputs": instruction,
                "parameters": {
                    "max_new_tokens": 200,
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "do_sample": True,
                    "return_full_text": False,
                }
            }
            
            logger.info(f"Enhancing prompt via Hugging Face: {prompt[:50]}...")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.api_url,
                    headers=headers,
                    json=payload
                )
                
                if response.status_code != 200:
                    logger.error(f"Hugging Face API error: {response.status_code} {response.text}")
                    # Return original prompt on error
                    return prompt
                
                data = response.json()
                
                # Extract generated text
                if isinstance(data, list) and len(data) > 0:
                    enhanced = data[0].get("generated_text", "").strip()
                else:
                    enhanced = ""
                
                # Clean up the response
                enhanced = enhanced.replace("[/INST]", "").strip()
                enhanced = enhanced.replace("Enhanced prompt:", "").strip()
                enhanced = enhanced.strip('"\'')
                
                # If enhancement failed or is empty, return original
                if not enhanced or len(enhanced) < 10:
                    logger.warning("Enhancement produced empty result, using original")
                    return prompt
                
                logger.info(f"Prompt enhanced: {prompt[:30]}... -> {enhanced[:30]}...")
                return enhanced
                
        except Exception as e:
            logger.error(f"Prompt enhancement failed: {e}")
            # Return original prompt on error
            return prompt
    
    async def is_available(self) -> bool:
        """Check if Hugging Face API is available"""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(
                    "https://api-inference.huggingface.co/",
                    headers={"Authorization": f"Bearer {self.api_key}"}
                )
                return response.status_code in [200, 404]  # 404 is OK, means API is up
        except:
            return False

