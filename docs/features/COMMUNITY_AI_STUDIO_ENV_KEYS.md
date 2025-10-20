# Community AI Studio  External Services, API Keys, and .env Plan

Status: Draft for approval (confirm providers before development)

---

## 1) Provider Options (select one per category)
A. Image Generation Providers (pick 1 primary, 1 fallback)
- Replicate (SDXL, Flux variants)
- Stability AI (Stable Image)
- Fal.ai (curated models)
- OpenAI Images (DALL·E variants)
- Local/Hosted SDXL (later phase; GPU required)

B. Prompt Enhancement (LLM) Providers (pick 1)
- Google Gemini (Flash 2.5 / 1.5 Pro)
- OpenAI (GPT-4o mini / GPT-4.1/4.1 mini)
- Claude (Haiku/Sonnet)
- Local LLM via server (later phase)

C. Storage/CDN Providers (pick 1)
- Cloudinary (simple, fast transforms)
- AWS S3 + CloudFront
- Cloudflare R2 + CDN

---

## 2) Required Secrets and Environment Variables (proposed)

Common
- FRONTEND_URL
- BACKEND_URL
- NODE_ENV / ENV

Auth & Platform (existing)
- JWT_SECRET (existing)
- DATABASE_URL (existing; ensure capacity for new tables)
- PAYMENT_GATEWAY_KEY / SECRET (existing Razorpay/Stripe)

Image Generation (choose provider)
- IMAGEGEN_PROVIDER=replicate|stability|fal|openai|local
- IMAGEGEN_API_KEY=<key>
- IMAGEGEN_API_BASE=<https://api...> (if applicable)
- IMAGEGEN_MODEL_ID=<model-id-or-name>
- IMAGEGEN_DEFAULT_TIER=standard

Prompt Enhancement (choose provider)
- PROMPT_ENHANCER_PROVIDER=gemini|openai|claude|local
- PROMPT_ENHANCER_API_KEY=<key>
- PROMPT_ENHANCER_API_BASE=<https://api...> (if applicable)
- PROMPT_ENHANCER_MODEL_ID=<model>

Storage/CDN (choose provider)
- STORAGE_PROVIDER=cloudinary|s3|r2
- CLOUDINARY_CLOUD_NAME=
- CLOUDINARY_API_KEY=
- CLOUDINARY_API_SECRET=
- S3_BUCKET=
- S3_REGION=
- AWS_ACCESS_KEY_ID=
- AWS_SECRET_ACCESS_KEY=
- R2_ACCOUNT_ID=
- R2_ACCESS_KEY_ID=
- R2_SECRET_ACCESS_KEY=
- R2_BUCKET=

Operational & Security
- RATE_LIMIT_CONFIG="{...}"
- LOG_LEVEL=info
- FEATURE_FLAGS="{\"premium_tiers\":true,\"ab_test_pricing\":true}"

Admin/Provider Key Management
- KEY_ENCRYPTION_SECRET=<for encrypting stored provider keys>

---

## 3) Minimal .env Template (to be tailored post-selection)
```
# Core
ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# Image Generation
IMAGEGEN_PROVIDER=replicate
IMAGEGEN_API_KEY=
IMAGEGEN_API_BASE=https://api.replicate.com
IMAGEGEN_MODEL_ID=stability-ai/sdxl

# Prompt Enhancement
PROMPT_ENHANCER_PROVIDER=gemini
PROMPT_ENHANCER_API_KEY=
PROMPT_ENHANCER_API_BASE=https://generativelanguage.googleapis.com
PROMPT_ENHANCER_MODEL_ID=gemini-1.5-flash

# Storage (Cloudinary example)
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Admin key management
KEY_ENCRYPTION_SECRET=

# Feature flags
FEATURE_FLAGS={"premium_tiers":true,"ab_test_pricing":true}
```

---

## 4) Confirmation Needed (please choose)
- Image Generation: [Replicate | Stability | Fal.ai | OpenAI | Local later]
- Prompt Enhancement: [Gemini | OpenAI | Claude | Local later]
- Storage/CDN: [Cloudinary | S3 + CloudFront | Cloudflare R2]

Please confirm the providers above and we will finalize the .env entries and proceed to implementation planning.

