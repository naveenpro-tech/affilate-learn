# Changelog

All notable changes to the Affiliate Learning Platform project.

---

## [Unreleased] - 2025-10-20

### 🔒 Security Enhancements

#### Critical Security Fixes (CodeRabbit Report)
- **Removed exposed API keys** from 10 documentation files
  - Hugging Face API keys
  - OpenAI API keys
  - Gemini API keys
  - GCP API keys
  - Razorpay keys (test & live)
  - Cloudinary credentials
  - Neon DB connection strings
  - SMTP passwords
  - Admin passwords
- **Added directory traversal protection** in `local_storage_service.py`
  - Validates file paths using `Path.resolve()`
  - Prevents `../../../etc/passwd` attacks
- **Enhanced input sanitization** in `sanitization.py`
  - Unicode normalization (NFKC)
  - Zero-width character removal
  - Improved prompt injection detection
  - Fixed filename extension preservation
  - Removed SQL sanitization (use parameterized queries)
- **Added access control** to module and topic endpoints
  - `GET /api/modules/{module_id}` now validates course access
  - `GET /api/modules/{module_id}/topics/{topic_id}` now validates course access

### 🐛 Bug Fixes

#### Backend Fixes (11 files)
- **admin.py** (8 fixes)
  - Added missing `datetime` import
  - Fixed CreditLedger query using wrong field names
  - Fixed ImageTemplate category_name ORM mutation
  - Fixed `post.image_url` → `post.image.image_url` with null guards
  - Fixed `user.name` → `user.full_name`
  - Updated schema imports for renamed admin schemas
  - Fixed all category/template endpoints
- **analytics.py** (1 fix)
  - Fixed boolean comparison: `Comment.is_deleted == False` → `~Comment.is_deleted`
- **comments.py** (2 fixes)
  - Added `joinedload` import
  - Fixed N+1 query with eager loading
- **community.py** (3 fixes)
  - Fixed `user.name` → `user.full_name` (2 locations)
  - Fixed `post.image_url` → `post.image.image_url`
- **studio.py** (3 fixes)
  - **CRITICAL:** Fixed debit failure allowing free generations
  - Added imports: `uuid`, `time`
  - Fixed reference_id collision
- **sanitization.py** (7 fixes)
  - See Security Enhancements section
- **schemas/studio.py** (3 fixes)
  - Renamed duplicate `ImageTemplateCreate` → `AdminImageTemplateCreate`
  - Renamed duplicate `ImageCategoryCreate` → `AdminImageCategoryCreate`
  - Added `category_name` field to `AdminImageTemplateResponse`
- **local_storage_service.py** (2 fixes)
  - See Security Enhancements section
- **notification_service.py** (1 fix)
  - Added `Optional` type hints
- **prompt_enhancement_service.py** (1 fix)
  - Added thread-safe singleton initialization
- **reward_service.py** (3 fixes)
  - Added imports: `Optional`, `IntegrityError`
  - Fixed `reference_id` type hint
  - Enhanced duplicate reward prevention

#### Script Fixes (2 files)
- **mint_token.py**
  - Replaced assertion with proper error handling
  - Accept email as CLI argument
- **seed_demo_data.py**
  - Removed unused `idx` variable
  - Added validation for package IDs

#### Infrastructure Fixes
- **Dockerfile**
  - Fixed HEALTHCHECK using unavailable `requests` library
  - Changed to `urllib.request.urlopen()` (Python stdlib)

#### Frontend Fixes
- **Build Error:** Installed missing `date-fns` package (v4.1.0)
- **Login Issue:** Fixed SQLAlchemy relationship configuration errors

### ⚡ Performance Improvements
- **Eliminated N+1 query** in comments endpoint using eager loading
- **Optimized course access** validation with proper indexing

### 📝 Documentation
- **Organized documentation** into structured folders
  - `docs/phases/` - Phase completion reports
  - `docs/completed/` - Completion summaries
  - `docs/guides/` - Implementation guides
  - `docs/deployment/` - Deployment documentation
  - `docs/features/` - Feature documentation
- **Created comprehensive guides**
  - `ACCESS_CONTROL_VERIFICATION.md` - Course access control documentation
  - `CODE_RABBIT_FIXES_COMPLETE.md` - Detailed fix breakdown
  - `FINAL_CODERABBIT_FIXES_SUMMARY.md` - Executive summary

---

## [Phase 4] - 2025-10-19

### ✨ Features

#### Comments System
- **Backend:** 7 new endpoints in `comments.py`
  - Create, read, update, delete comments
  - Reply to comments (nested structure)
  - Like/unlike comments
  - Report comments
- **Frontend:** `CommentsSection.tsx` component
  - Real-time comment display
  - Nested replies with indentation
  - Like/unlike functionality
  - Report functionality
  - User avatars and timestamps
- **Database:** `comments` table with relationships

#### Advanced Search & Filters
- **Backend:** Enhanced `/api/community/posts` endpoint
  - Search by title, description, tags
  - Filter by category
  - Sort by: newest, oldest, most liked, trending
- **Frontend:** Search bar and filter controls
  - Real-time search
  - Category dropdown
  - Sort dropdown

#### Notifications System
- **Backend:** 8 new endpoints in `notifications.py`
  - Get user notifications
  - Mark as read
  - Mark all as read
  - Delete notification
  - Get unread count
- **Frontend:** Notification bell with badge
  - Real-time unread count
  - Notification dropdown
  - Mark as read on click
- **Database:** `notifications` table
- **Triggers:** Automatic notifications for
  - New comments on user's posts
  - Replies to user's comments
  - Likes on user's posts
  - Credit rewards
  - Milestones

#### Automatic Credit Rewards
- **Service:** `reward_service.py`
  - First post published: +50 credits
  - Daily login bonus: +10 credits
  - Post reaches 10 likes: +20 credits
  - Post reaches 50 likes: +50 credits
  - Post reaches 100 likes: +100 credits
- **Integration:** Automatic triggers on events

#### Admin Enhancements
- **Moderation Panel:** `/admin/studio/moderation`
  - View reported posts
  - Approve/reject reports
  - Delete posts
  - Ban users
- **Analytics Dashboard:** `/admin/analytics`
  - Total users, posts, images generated
  - Revenue metrics
  - Top creators
  - Popular categories
  - Activity charts

#### Analytics Dashboard
- **Backend:** 15 new endpoints in `analytics.py`
  - User statistics
  - Post statistics
  - Revenue metrics
  - Top creators
  - Popular categories
  - Activity over time
- **Frontend:** Admin analytics page
  - Charts and graphs
  - Real-time metrics
  - Export functionality

### 🔧 Improvements
- **Enhanced UX & Polish**
  - Loading states
  - Error handling
  - Toast notifications
  - Smooth animations
  - Responsive design
- **Security & Validation**
  - Input sanitization
  - XSS prevention
  - CSRF protection
  - Rate limiting
- **Deployment Preparation**
  - Environment variable configuration
  - Production settings
  - Docker configuration
  - CI/CD setup

---

## [Phase 3] - 2025-10-18

### ✨ Features

#### Admin Moderation Panel
- **Backend:** 7 new endpoints in `admin.py`
  - Get reported posts
  - Approve report
  - Reject report
  - Delete post
  - Ban user
  - Get moderation stats
- **Frontend:** `/admin/studio/moderation` page
  - Reported posts table
  - Approve/reject actions
  - Delete post action
  - Ban user action

#### Remix Flow Integration
- **Backend:** Enhanced `/api/studio/generate` endpoint
  - Detect `remixPostId` parameter
  - Automatically record remix relationship
- **Frontend:** URL parameter detection
  - Detect `?remix={postId}` in URL
  - Auto-populate prompt from original post
  - Show "Remixing from..." indicator

#### Enhanced Publish Dialog
- **Frontend:** Professional modal dialog
  - Title input
  - Description textarea
  - Category dropdown
  - Tags input (comma-separated)
  - Publish button
- **Replaced:** `window.prompt()` with modal

#### User Profile Pages
- **Backend:** `/api/community/users/{userId}` endpoint
  - User statistics
  - Published posts
  - Follower/following counts
- **Frontend:** `/profile/{userId}` page
  - User avatar and name
  - Statistics cards
  - Published posts grid
  - Follow/unfollow button

---

## [Phase 2] - 2025-10-17

### ✨ Features

#### Community Features
- **Backend:** 12 new endpoints in `community.py`
  - Publish post
  - Get community gallery
  - Like/unlike post
  - Remix post
  - Report post
  - Get user's published posts
- **Frontend:** Community gallery page
  - Grid layout
  - Category filtering
  - Like button
  - Remix button
  - Report button
- **Database:** `community_posts`, `post_likes`, `post_reports` tables

---

## [Phase 1] - 2025-10-16

### ✨ Features

#### AI Studio (MVP)
- **Backend:** 15 API endpoints
  - Image generation with 5 providers
  - Template system (15 templates, 5 categories)
  - Credit economy
  - Quality tiers (Standard, HD, Ultra HD)
  - Real-time status tracking
- **Frontend:** Studio page
  - Template selection
  - Prompt enhancement
  - Image generation
  - My Creations gallery
  - Buy Credits page
- **Database:** 9 new tables
  - `image_templates`
  - `image_categories`
  - `generated_images`
  - `credit_ledger`
  - `prompt_reuse_events`
  - `referral_events`
  - And more...

#### Image Generation Providers
- Mock Provider (development)
- Hugging Face (Stable Diffusion)
- OpenAI DALL-E 3
- Google Gemini
- Replicate (Flux)

#### Template System
- **Categories:** Art, Photography, Design, Marketing, Fun
- **Templates:** 15 pre-built templates
- **Customization:** User can modify prompts

#### Credit Economy
- **Purchase:** Buy credits via Razorpay
- **Spend:** Generate images (cost varies by quality)
- **Earn:** Referrals, rewards, bonuses

#### Quality Tiers
- **Standard:** 10 credits
- **HD:** 20 credits
- **Ultra HD:** 30 credits

---

## [Initial Release] - 2025-10-15

### ✨ Features

#### Authentication System
- User registration with email validation
- Login with JWT tokens
- Password hashing (bcrypt)
- Forgot password flow
- Reset password with token
- Change password
- Profile update
- Rate limiting

#### Package System
- 3 package tiers: Silver, Gold, Platinum
- Package listing
- Package purchase via Razorpay
- Active package tracking

#### Course System
- Course creation (admin)
- Module and topic structure
- Video upload to Cloudinary
- Course enrollment
- Progress tracking
- Certificate generation

#### Payment Integration
- Razorpay integration
- Order creation
- Payment verification
- Transaction history

#### Referral System
- Unique referral codes
- Multi-level commissions
- Referral tracking
- Commission calculation

#### Admin Panel
- User management
- Course management
- Package management
- Payment tracking
- Analytics

---

## Database Schema

### Tables Created
1. `users` - User accounts
2. `packages` - Package tiers
3. `user_packages` - User package purchases
4. `courses` - Course content
5. `modules` - Course modules
6. `topics` - Module topics
7. `videos` - Video content
8. `video_progress` - User video progress
9. `payments` - Payment records
10. `referrals` - Referral relationships
11. `commissions` - Commission records
12. `certificates` - User certificates
13. `image_templates` - AI Studio templates
14. `image_categories` - Template categories
15. `generated_images` - Generated images
16. `community_posts` - Community posts
17. `post_likes` - Post likes
18. `post_reports` - Post reports
19. `comments` - Post comments
20. `notifications` - User notifications
21. `credit_ledger` - Credit transactions
22. `prompt_reuse_events` - Prompt reuse tracking
23. `referral_events` - Referral events
24. `user_course_purchases` - Individual course purchases

---

## API Endpoints

### Total Endpoints: 150+

#### Authentication (8 endpoints)
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/forgot-password`
- POST `/api/auth/reset-password`
- POST `/api/auth/change-password`
- GET `/api/auth/me`
- PUT `/api/auth/profile`
- POST `/api/auth/verify-email`

#### Packages (5 endpoints)
- GET `/api/packages`
- GET `/api/packages/{id}`
- POST `/api/packages` (admin)
- PUT `/api/packages/{id}` (admin)
- DELETE `/api/packages/{id}` (admin)

#### Courses (20+ endpoints)
- GET `/api/courses`
- GET `/api/courses/{id}`
- POST `/api/courses` (admin)
- PUT `/api/courses/{id}` (admin)
- DELETE `/api/courses/{id}` (admin)
- And more...

#### AI Studio (15 endpoints)
- GET `/api/studio/templates`
- GET `/api/studio/categories`
- POST `/api/studio/generate`
- GET `/api/studio/my-creations`
- POST `/api/studio/buy-credits`
- And more...

#### Community (12 endpoints)
- POST `/api/community/publish`
- GET `/api/community/posts`
- POST `/api/community/posts/{id}/like`
- POST `/api/community/posts/{id}/remix`
- POST `/api/community/posts/{id}/report`
- And more...

#### Comments (7 endpoints)
- POST `/api/comments`
- GET `/api/comments/post/{postId}`
- PUT `/api/comments/{id}`
- DELETE `/api/comments/{id}`
- POST `/api/comments/{id}/like`
- POST `/api/comments/{id}/report`
- POST `/api/comments/{id}/reply`

#### Notifications (8 endpoints)
- GET `/api/notifications`
- GET `/api/notifications/unread-count`
- PUT `/api/notifications/{id}/read`
- PUT `/api/notifications/mark-all-read`
- DELETE `/api/notifications/{id}`
- And more...

#### Analytics (15 endpoints)
- GET `/api/analytics/overview`
- GET `/api/analytics/users`
- GET `/api/analytics/posts`
- GET `/api/analytics/revenue`
- GET `/api/analytics/top-creators`
- And more...

#### Admin (30+ endpoints)
- User management
- Course management
- Package management
- Studio management
- Moderation
- Analytics
- And more...

---

## Technology Stack

### Backend
- **Framework:** FastAPI 0.104.1
- **Database:** SQLite (dev) → PostgreSQL (prod)
- **ORM:** SQLAlchemy 2.0.23
- **Validation:** Pydantic v2
- **Authentication:** JWT (python-jose)
- **Password Hashing:** bcrypt 3.2.2
- **Email:** SMTP (Hostinger)
- **Payment:** Razorpay
- **Storage:** Cloudinary
- **Rate Limiting:** slowapi

### Frontend
- **Framework:** Next.js 15.5.4
- **React:** 19.1.1
- **Styling:** Tailwind CSS
- **State:** Zustand
- **HTTP:** Axios
- **Animations:** Framer Motion
- **Notifications:** React Hot Toast
- **Icons:** Lucide React
- **Date:** date-fns 4.1.0

### DevOps
- **Containerization:** Docker
- **CI/CD:** GitHub Actions (planned)
- **Hosting:** Render (planned)
- **Database:** Neon PostgreSQL (planned)

---

## Contributors
- Development Team
- Augment Agent (AI Assistant)

---

## License
Proprietary - All Rights Reserved

