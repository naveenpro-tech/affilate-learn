# 🤖 Ollama Local LLM for Prompt Enhancement

**Why Ollama?**
- ✅ **Completely FREE** - No API costs ever
- ✅ **No quota limits** - Unlimited usage
- ✅ **Privacy** - Data stays on your machine
- ✅ **Fast** - Local processing
- ✅ **Works offline** - No internet needed
- ✅ **Open source** - MIT license

---

## 📥 Installation

### **Step 1: Install Ollama**

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**macOS:**
```bash
# Download from https://ollama.com/download
# Or use Homebrew:
brew install ollama
```

**Windows:**
```bash
# Download installer from https://ollama.com/download
# Run the installer
```

### **Step 2: Start Ollama Service**

```bash
# Start the service
ollama serve

# Should see:
# Ollama is running on http://localhost:11434
```

### **Step 3: Pull a Model**

**Recommended Models for Prompt Enhancement:**

```bash
# Small & Fast (1.3GB) - Best for quick enhancements
ollama pull llama3.2:1b

# Medium Quality (1.7GB) - Good balance
ollama pull gemma2:2b

# High Quality (2.7GB) - Best results
ollama pull qwen2.5:1.5b

# Large & Powerful (5.5GB) - Highest quality
ollama pull llama3.2:3b
```

**Check installed models:**
```bash
ollama list
```

---

## 🔧 Implementation

### **Backend: Add Ollama Adapter**

Create `backend/app/services/ollama_prompt_enhancer.py`:

```python
import httpx
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class OllamaPromptEnhancer:
    """Local LLM prompt enhancement using Ollama"""
    
    def __init__(
        self, 
        host: str = "http://localhost:11434",
        model: str = "llama3.2:1b"
    ):
        self.host = host
        self.model = model
        self.api_url = f"{host}/api/generate"
    
    async def enhance_prompt(
        self, 
        prompt: str, 
        style: str = "detailed"
    ) -> str:
        """
        Enhance prompt using local Ollama LLM
        
        Args:
            prompt: Original prompt
            style: Enhancement style (detailed, photorealistic, etc.)
        
        Returns:
            Enhanced prompt
        """
        try:
            # Style-specific system prompts
            style_prompts = {
                "detailed": "Add rich, specific details and vivid descriptions",
                "photorealistic": "Add camera settings, lighting, and photographic details",
                "cinematic": "Add cinematic composition, lighting, and atmosphere",
                "artistic": "Add artistic style, medium, and aesthetic elements",
                "fantasy": "Add magical, fantastical elements and atmosphere",
                "cyberpunk": "Add cyberpunk aesthetics, neon, and futuristic elements",
            }
            
            style_instruction = style_prompts.get(style, style_prompts["detailed"])
            
            # Create enhancement prompt
            system_prompt = f"""You are an expert AI image prompt enhancer. 
Your task is to take a simple prompt and enhance it with specific, vivid details.

Style: {style_instruction}

Rules:
1. Keep the core concept from the original prompt
2. Add specific visual details
3. Include lighting, composition, and atmosphere
4. Make it concise but descriptive (max 150 words)
5. Return ONLY the enhanced prompt, no explanations

Original prompt: {prompt}

Enhanced prompt:"""

            # Call Ollama API
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.api_url,
                    json={
                        "model": self.model,
                        "prompt": system_prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.7,
                            "top_p": 0.9,
                        }
                    }
                )
                
                if response.status_code != 200:
                    logger.error(f"Ollama API error: {response.status_code}")
                    return prompt  # Return original on error
                
                data = response.json()
                enhanced = data.get("response", "").strip()
                
                # Clean up response
                enhanced = enhanced.replace("Enhanced prompt:", "").strip()
                enhanced = enhanced.strip('"\'')
                
                logger.info(f"Ollama enhanced: {prompt[:50]}... -> {enhanced[:50]}...")
                return enhanced if enhanced else prompt
                
        except Exception as e:
            logger.error(f"Ollama enhancement failed: {e}")
            return prompt  # Return original on error
    
    async def is_available(self) -> bool:
        """Check if Ollama service is running"""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.host}/api/tags")
                return response.status_code == 200
        except:
            return False
```

### **Update Configuration**

Add to `backend/app/core/config.py`:

```python
# Ollama (Local LLM)
OLLAMA_HOST: str = "http://localhost:11434"
OLLAMA_MODEL: str = "llama3.2:1b"
OLLAMA_ENABLED: bool = True
```

Add to `backend/.env`:

```ini
# Ollama (Local LLM for Prompt Enhancement)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2:1b
OLLAMA_ENABLED=true
```

### **Update Prompt Enhancement Service**

Modify `backend/app/services/prompt_enhancement_service.py`:

```python
from app.services.ollama_prompt_enhancer import OllamaPromptEnhancer
from app.core.config import settings

class PromptEnhancementService:
    def __init__(self):
        self.gemini_enhancer = GeminiPromptEnhancer()
        self.ollama_enhancer = OllamaPromptEnhancer(
            host=settings.OLLAMA_HOST,
            model=settings.OLLAMA_MODEL
        )
    
    async def enhance_prompt(
        self, 
        prompt: str, 
        provider: str = "auto",
        style: str = "detailed"
    ) -> str:
        """
        Enhance prompt using specified provider
        
        Args:
            prompt: Original prompt
            provider: "gemini", "ollama", or "auto"
            style: Enhancement style
        """
        if provider == "ollama":
            return await self.ollama_enhancer.enhance_prompt(prompt, style)
        
        elif provider == "auto":
            # Try Ollama first (free, fast)
            if settings.OLLAMA_ENABLED:
                is_available = await self.ollama_enhancer.is_available()
                if is_available:
                    return await self.ollama_enhancer.enhance_prompt(prompt, style)
            
            # Fallback to Gemini
            return await self.gemini_enhancer.enhance_prompt(prompt)
        
        else:  # gemini
            return await self.gemini_enhancer.enhance_prompt(prompt)
```

---

## 🎨 Frontend: Add Provider & Style Selection

Update `frontend/app/studio/page.tsx`:

```tsx
// Add state
const [enhancementProvider, setEnhancementProvider] = useState<string>('auto');
const [enhancementStyle, setEnhancementStyle] = useState<string>('detailed');

// Add UI before "Enhance Prompt" button
<div className="space-y-2">
  <label className="block text-sm font-medium text-slate-700">
    Enhancement Provider
  </label>
  <select
    value={enhancementProvider}
    onChange={(e) => setEnhancementProvider(e.target.value)}
    className="w-full p-2 border rounded-lg"
  >
    <option value="auto">🤖 Auto (Ollama → Gemini)</option>
    <option value="ollama">🏠 Ollama (Local, Free)</option>
    <option value="gemini">🌟 Gemini (Cloud)</option>
  </select>
</div>

<div className="space-y-2">
  <label className="block text-sm font-medium text-slate-700">
    Enhancement Style
  </label>
  <select
    value={enhancementStyle}
    onChange={(e) => setEnhancementStyle(e.target.value)}
    className="w-full p-2 border rounded-lg"
  >
    <option value="detailed">📝 Detailed</option>
    <option value="photorealistic">📷 Photorealistic</option>
    <option value="cinematic">🎬 Cinematic</option>
    <option value="artistic">🎨 Artistic</option>
    <option value="fantasy">🧙 Fantasy</option>
    <option value="cyberpunk">🤖 Cyberpunk</option>
  </select>
</div>
```

Update API call:

```tsx
const response = await studioAPI.enhancePrompt(
  prompt,
  enhancementProvider,
  enhancementStyle
);
```

---

## 🧪 Testing

### **Test Ollama Service**

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Test generation
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2:1b",
  "prompt": "Enhance this: A sunset",
  "stream": false
}'
```

### **Test in Python**

```python
import asyncio
from app.services.ollama_prompt_enhancer import OllamaPromptEnhancer

async def test():
    enhancer = OllamaPromptEnhancer()
    
    # Check availability
    available = await enhancer.is_available()
    print(f"Ollama available: {available}")
    
    # Test enhancement
    original = "A beautiful sunset"
    enhanced = await enhancer.enhance_prompt(original, "cinematic")
    print(f"Original: {original}")
    print(f"Enhanced: {enhanced}")

asyncio.run(test())
```

---

## 📊 Performance Comparison

| Provider | Speed | Cost | Quality | Quota | Offline |
|----------|-------|------|---------|-------|---------|
| **Ollama (llama3.2:1b)** | ⚡⚡⚡ Fast | FREE | ⭐⭐⭐ Good | Unlimited | ✅ Yes |
| **Ollama (llama3.2:3b)** | ⚡⚡ Medium | FREE | ⭐⭐⭐⭐ Great | Unlimited | ✅ Yes |
| **Gemini** | ⚡⚡⚡ Fast | $$ | ⭐⭐⭐⭐⭐ Best | Limited | ❌ No |

---

## 💡 Recommendations

**For Development:**
- Use Ollama (free, unlimited)
- Model: `llama3.2:1b` (fast)

**For Production:**
- Use "Auto" mode (Ollama → Gemini fallback)
- Saves API costs
- Always available

**For Best Quality:**
- Use Gemini (cloud)
- Or Ollama with `llama3.2:3b` (local)

---

## 🎯 Benefits Summary

**Cost Savings:**
- Gemini: ~$0.001 per enhancement
- Ollama: $0 (FREE!)
- Savings: 100% on prompt enhancement

**Performance:**
- Ollama (1b): ~1-2 seconds
- Ollama (3b): ~3-5 seconds
- Gemini: ~2-3 seconds

**Reliability:**
- No quota limits
- No API failures
- Works offline
- Always available

---

**Ready to implement! 🚀**

**Installation time:** 5 minutes  
**Implementation time:** 30 minutes  
**Cost savings:** 100% on prompt enhancement

