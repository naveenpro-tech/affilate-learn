# AI Studio - Community Image Generation Platform

Complete AI-powered image generation studio with community features, integrated into the Affiliate Learning Platform.

---

## 🚀 Features

### Core Features
- **AI Image Generation** - Generate images using multiple AI providers
  - OpenAI DALL-E 3
  - Google Gemini
  - HuggingFace
  - Replicate
  - Mock provider (for testing)

- **Template System** - 15+ pre-built templates across 5 categories
  - Portraits
  - Landscapes
  - Abstract
  - Product
  - Marketing

- **Quality Tiers**
  - Standard (512x512) - 10 credits
  - Premium (1024x1024) - 20 credits
  - Premium 4K (2048x2048) - 40 credits

### Community Features
- **Community Gallery** - Browse and discover AI-generated images
- **Publishing System** - Share your creations with the community
- **Likes & Engagement** - Like and interact with posts
- **Comments System** - Discuss and provide feedback
- **Remix Feature** - Use others' prompts as inspiration
- **Reporting System** - Flag inappropriate content

### Advanced Features
- **Search & Filters**
  - Search by title/description
  - Filter by tier (standard, premium, premium4)
  - Filter by provider (openai, gemini, huggingface, etc.)
  - Sort by newest, popular, trending, most remixed

- **User Profiles**
  - View user statistics
  - See published posts
  - Track achievements

- **Admin Moderation**
  - Review reported posts
  - Hide/unhide content
  - Manage users and templates

### Security & Performance
- **Rate Limiting** - 200 requests/hour default
- **Input Sanitization** - XSS and SQL injection prevention
- **Profanity Filter** - Content moderation
- **Optimistic UI** - Fast, responsive experience
- **Image Optimization** - Lazy loading and caching

---

## 📊 Database Models

### Studio Models
1. **ImageCategory** - Template categories
2. **ImageTemplate** - Pre-built prompt templates
3. **GeneratedImage** - User-generated images
4. **CommunityPost** - Published images
5. **PostLike** - Like tracking
6. **PostReport** - Content moderation
7. **Comment** - Post comments
8. **PromptReuseEvent** - Remix tracking
9. **CreditLedger** - Credit transactions

---

## 🔌 API Endpoints

### Studio Generation
- `POST /api/studio/generate` - Generate image
- `GET /api/studio/my-images` - Get user's images
- `GET /api/studio/templates` - Get templates
- `GET /api/studio/categories` - Get categories

### Community
- `GET /api/studio/community/feed` - Get community posts
- `POST /api/studio/community/publish` - Publish image
- `GET /api/studio/community/posts/{id}` - Get post details
- `POST /api/studio/posts/{id}/like` - Like/unlike post
- `POST /api/studio/posts/{id}/remix` - Remix post

### Comments
- `POST /api/studio/posts/{id}/comments` - Add comment
- `GET /api/studio/posts/{id}/comments` - Get comments
- `PUT /api/studio/comments/{id}` - Update comment
- `DELETE /api/studio/comments/{id}` - Delete comment

### Admin
- `GET /api/admin/studio/templates` - Manage templates
- `POST /api/admin/studio/templates` - Create template
- `GET /api/admin/studio/reported-posts` - View reports
- `POST /api/admin/studio/posts/{id}/hide` - Hide post

---

## 💳 Credit System

### Credit Costs
- Standard Image (512x512): 10 credits
- Premium Image (1024x1024): 20 credits
- Premium 4K (2048x2048): 40 credits

### Earning Credits
- First post published: +50 credits
- 10 posts milestone: +100 credits
- 50 posts milestone: +500 credits
- Post reaches 100 likes: +200 credits
- Daily login: +10 credits

### Purchasing Credits
- Integrated with Razorpay payment system
- Multiple credit packages available
- Instant credit delivery

---

## 🎨 Frontend Components

### Pages
- `/studio` - Main generation interface
- `/studio/my-creations` - User's generated images
- `/studio/community` - Community gallery
- `/studio/community/[id]` - Post detail page
- `/studio/profile/[id]` - User profile page

### Components
- `TemplateSelector` - Template selection UI
- `ImageGenerator` - Generation interface
- `SearchBar` - Debounced search input
- `FilterSidebar` - Advanced filters
- `CommentsSection` - Comments UI
- `SkeletonLoaders` - Loading states
- `EmptyStates` - Empty state messages

---

## 🔒 Security Features

### Backend Security
- **Rate Limiting** - Slowapi with configurable limits
- **Input Sanitization** - `sanitization.py` module
  - HTML escaping
  - SQL injection prevention
  - Prompt injection prevention
  - Profanity filtering
- **Authentication** - JWT tokens required
- **CORS** - Configured for specific origins
- **File Validation** - Image type and size checks

### Frontend Security
- **Input Validation** - `sanitize.ts` module
  - XSS prevention
  - Form validation
  - Filename sanitization
- **Debouncing** - Prevent spam
- **Optimistic UI** - Better UX with rollback

---

## 📁 File Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── studio.py          # Generation endpoints
│   │   ├── community.py       # Community endpoints
│   │   ├── comments.py        # Comments endpoints
│   │   └── admin_studio.py    # Admin endpoints
│   ├── models/
│   │   ├── studio.py          # Studio models
│   │   └── comment.py         # Comment model
│   ├── schemas/
│   │   ├── studio.py          # Studio schemas
│   │   └── comment.py         # Comment schemas
│   ├── core/
│   │   ├── sanitization.py    # Input sanitization
│   │   └── rate_limit.py      # Rate limiting
│   └── services/
│       └── image_generation.py # AI providers

frontend/
├── app/
│   └── studio/
│       ├── page.tsx                    # Main studio
│       ├── my-creations/page.tsx       # User gallery
│       ├── community/page.tsx          # Community gallery
│       └── community/[id]/page.tsx     # Post detail
├── components/
│   └── studio/
│       ├── TemplateSelector.tsx
│       ├── SearchBar.tsx
│       ├── FilterSidebar.tsx
│       ├── CommentsSection.tsx
│       └── SkeletonLoaders.tsx
└── lib/
    ├── api.ts              # API client
    └── sanitize.ts         # Input sanitization
```

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Add your AI API keys to .env

# Run migrations
python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"

# Seed studio data
python app/scripts/seed_studio_data.py

# Start server
uvicorn app.main:app --reload
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### 3. Access the Studio

- Frontend: `http://localhost:3000/studio`
- Backend API: `http://localhost:8000/docs`

---

## 🧪 Testing

### Test Image Generation

```bash
# Using curl
curl -X POST http://localhost:8000/api/studio/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "template_id": 1,
    "custom_prompt": "A beautiful sunset",
    "tier": "standard"
  }'
```

### Test Community Features

1. Generate an image
2. Publish to community
3. Like and comment on posts
4. Search and filter posts
5. Remix others' prompts

---

## 📈 Performance Optimization

### Backend
- Database indexes on frequently queried columns
- Connection pooling for database
- Static file serving optimized
- Rate limiting to prevent abuse

### Frontend
- Image lazy loading
- Debounced search input
- Optimistic UI updates
- Skeleton loading states
- Code splitting

---

## 🔧 Configuration

### AI Provider Configuration

```python
# backend/.env
OPENAI_API_KEY=your-key
GEMINI_API_KEY=your-key
HUGGINGFACE_API_KEY=your-key
REPLICATE_API_TOKEN=your-token

IMAGEGEN_PROVIDER=auto  # or specific: openai_dalle, gemini, etc.
IMAGEGEN_MODEL_ID=dall-e-3
```

### Rate Limiting

```python
# backend/app/core/rate_limit.py
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200/hour"],
)
```

---

## 📝 Phase Completion Status

- ✅ **Phase 1: MVP Studio** (100%)
- ✅ **Phase 2: Community Features** (100%)
- ✅ **Phase 3: Advanced Features** (100%)
- ✅ **Phase 4: Polish & Security** (100%)
- ✅ **Deployment Ready** (100%)

---

## 🎯 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Marketplace for templates
- [ ] AI model fine-tuning
- [ ] Video generation support
- [ ] Collaborative editing
- [ ] NFT minting integration

---

## 📄 Documentation

- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)
- [API Documentation](http://localhost:8000/docs)
- [Phase 4 Plan](PHASE_4_PLAN.md)

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-20  
**Status:** Production Ready ✅

