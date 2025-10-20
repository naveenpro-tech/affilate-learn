# 🤗 Get Hugging Face API Key (FREE)

**Time Required:** 2 minutes  
**Cost:** FREE  
**Quota:** 1000 image generations per day

---

## Why Hugging Face?

- ✅ **Completely FREE** - No credit card required
- ✅ **1000 calls/day** - More than enough for development
- ✅ **Good quality** - Uses Stable Diffusion XL
- ✅ **No quota issues** - Unlike Gemini
- ✅ **Perfect for testing** - Unlimited testing within daily limit

---

## Step-by-Step Guide

### 1. Create Account (if you don't have one)
```
Visit: https://huggingface.co/join
- Enter email
- Choose username
- Set password
- Verify email
```

### 2. Generate API Token
```
Visit: https://huggingface.co/settings/tokens
- Click "New token"
- Name: "AI Studio Development"
- Type: "Read" (default)
- Click "Generate token"
- Copy the token (starts with "hf_")
```

### 3. Add to .env File
```bash
# Open backend/.env
# Find the line:
HUGGINGFACE_API_KEY=

# Replace with your token:
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxx
```

### 4. Restart Backend Server
```bash
# The server will auto-reload, or restart manually:
./start_backend.sh
```

### 5. Test in GUI
```
1. Open http://localhost:3000/studio
2. Select provider: "Hugging Face (Free Tier)"
3. Generate an image
4. Enjoy free image generation!
```

---

## API Token Example

```
hf_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```

**Important:**
- Keep your token secret
- Don't commit to Git
- Don't share publicly

---

## Quota Information

**Free Tier:**
- 1000 requests per day
- Resets every 24 hours
- No credit card required
- No upgrade needed for development

**Rate Limits:**
- ~30 requests per minute
- Plenty for development and testing

---

## Troubleshooting

### "Model is loading" Error
```
Solution: Wait 20-30 seconds and try again
Reason: Model needs to warm up on first use
```

### "Rate limit exceeded"
```
Solution: Wait a few minutes
Reason: Too many requests too fast
```

### "Invalid API token"
```
Solution: Check token is copied correctly
Reason: Token must start with "hf_"
```

---

## Alternative: Use OpenAI DALL-E 3

If you don't want to get Hugging Face API key, you can use OpenAI DALL-E 3 (already configured):

**Pros:**
- Already configured (your API key in .env)
- Best quality
- Fast generation
- No quota issues

**Cons:**
- Costs ~$0.04 per image
- Pay-as-you-go

**To use:**
- Select "OpenAI DALL-E 3" in provider dropdown
- Or use "Auto" mode (will use OpenAI by default)

---

## Recommendation

**For Development/Testing:**
- Get Hugging Face API key (FREE, 1000/day)
- Use for most testing and development
- Save OpenAI credits for demos

**For Production/Demos:**
- Use OpenAI DALL-E 3 (best quality)
- Or use "Auto" mode (smart selection)

---

**Ready to get your free API key? Visit: https://huggingface.co/settings/tokens**

