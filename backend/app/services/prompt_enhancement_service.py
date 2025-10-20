"""
Prompt Enhancement Service with LLM Provider Adapters
Supports: Hugging Face, Google Gemini, OpenAI, Claude, Local LLM
"""

import logging
import google.generativeai as genai
from typing import Optional
from app.core.config import settings
from app.services.huggingface_prompt_enhancer import HuggingFacePromptEnhancer

logger = logging.getLogger(__name__)


class PromptEnhancerAdapter:
    """Base adapter for prompt enhancement providers"""

    async def enhance(self, prompt: str) -> str:
        """Enhance prompt using LLM. Returns enhanced prompt."""
        raise NotImplementedError


class HuggingFaceAdapter(PromptEnhancerAdapter):
    """Hugging Face adapter wrapper for prompt enhancement"""

    def __init__(self, api_key: Optional[str] = None):
        self.enhancer = HuggingFacePromptEnhancer(api_key)

    async def enhance(self, prompt: str) -> str:
        """Enhance prompt using Hugging Face"""
        return await self.enhancer.enhance_prompt(prompt)


class GeminiAdapter(PromptEnhancerAdapter):
    """Google Gemini adapter for prompt enhancement"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not configured")
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(settings.PROMPT_ENHANCER_MODEL_ID)
        # Simple in-memory cache: {prompt: (enhanced, ts)}
        self._cache: dict[str, tuple[str, float]] = {}
        self._cache_max = 100
        self._cache_ttl = 15 * 60  # 15 minutes

    async def enhance(self, prompt: str) -> str:
        """
        Enhance prompt using Gemini with timeout and caching
        Returns: enhanced prompt string
        """
        import asyncio, time
        try:
            logger.info(f"Enhancing prompt via Gemini: {prompt[:50]}...")

            # Cache hit
            now = time.time()
            cached = self._cache.get(prompt)
            if cached and (now - cached[1] < self._cache_ttl):
                return cached[0]

            enhancement_prompt = f"""You are an expert AI image prompt engineer.
Your task is to enhance and improve the following image generation prompt to make it more detailed,
vivid, and likely to produce high-quality images.

Original prompt: {prompt}

Please provide an enhanced version that:
1. Adds specific visual details and descriptors
2. Includes art style references if appropriate
3. Specifies lighting, mood, and atmosphere
4. Maintains the core intent of the original prompt
5. Is concise but comprehensive (under 150 words)

Return ONLY the enhanced prompt, nothing else."""

            # Run blocking SDK call in a thread with timeout
            def _run():
                resp = self.model.generate_content(enhancement_prompt)
                return (resp.text or "").strip()

            timeout = getattr(settings, "PROMPT_ENHANCER_TIMEOUT_SECONDS", 3.0) or 3.0
            enhanced = await asyncio.wait_for(asyncio.to_thread(_run), timeout=timeout)
            enhanced = enhanced or prompt

            # Cache put (evict simple LRU by size)
            self._cache[prompt] = (enhanced, now)
            if len(self._cache) > self._cache_max:
                # remove oldest
                oldest_key = min(self._cache.items(), key=lambda kv: kv[1][1])[0]
                self._cache.pop(oldest_key, None)

            logger.info(f"Enhanced prompt: {enhanced[:50]}...")
            return enhanced

        except Exception as e:
            logger.error(f"Gemini enhancement failed: {e}")
            # Return original prompt if enhancement fails or times out
            return prompt


class PromptEnhancementService:
    """Main service for prompt enhancement with provider abstraction"""
    
    def __init__(self):
        self.provider = settings.PROMPT_ENHANCER_PROVIDER
        self.adapter = self._get_adapter()
    
    def _get_adapter(self) -> PromptEnhancerAdapter:
        """Get appropriate adapter based on configuration"""
        if self.provider == "huggingface":
            return HuggingFaceAdapter(settings.HUGGINGFACE_API_KEY)
        elif self.provider == "gemini":
            return GeminiAdapter(settings.GEMINI_API_KEY)
        elif self.provider == "openai":
            # TODO: Implement OpenAI adapter
            raise NotImplementedError("OpenAI adapter not yet implemented")
        elif self.provider == "claude":
            # TODO: Implement Claude adapter
            raise NotImplementedError("Claude adapter not yet implemented")
        elif self.provider == "local":
            # TODO: Implement local LLM adapter
            raise NotImplementedError("Local LLM adapter not yet implemented")
        else:
            raise ValueError(f"Unknown prompt enhancer provider: {self.provider}")
    
    async def enhance_prompt(self, prompt: str) -> str:
        """
        Enhance a prompt using the configured LLM provider
        Returns: enhanced prompt string
        """
        logger.info(f"Enhancing prompt: {prompt[:50]}...")
        enhanced = await self.adapter.enhance(prompt)
        return enhanced


# Singleton instance
_prompt_enhancer_service: Optional[PromptEnhancementService] = None


def get_prompt_enhancement_service() -> PromptEnhancementService:
    """Get or create prompt enhancement service"""
    global _prompt_enhancer_service
    if _prompt_enhancer_service is None:
        _prompt_enhancer_service = PromptEnhancementService()
    return _prompt_enhancer_service

