# API Testing Guide - Course Hierarchy & New Features

## Prerequisites
1. Backend server running: `cd backend && ./venv/Scripts/python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000`
2. Get admin token: Login as admin and copy the JWT token
3. Use Postman, curl, or Swagger UI at http://localhost:8000/docs

---

## 1. Testing Course Hierarchy (Module → Topic)

### 1.1 Create a Module
```bash
POST http://localhost:8000/api/modules/
Headers:
  Authorization: Bearer <admin_token>
  Content-Type: application/json

Body:
{
  "course_id": 1,
  "title": "Module 1: SEO Basics",
  "description": "Learn the fundamentals of Search Engine Optimization",
  "display_order": 1,
  "is_published": true
}

Response: 201 Created
{
  "id": 1,
  "course_id": 1,
  "title": "Module 1: SEO Basics",
  "description": "Learn the fundamentals of Search Engine Optimization",
  "display_order": 1,
  "is_published": true,
  "created_at": "2025-01-XX...",
  "updated_at": "2025-01-XX..."
}
```

### 1.2 Create a Topic (with YouTube video)
```bash
POST http://localhost:8000/api/modules/1/topics
Headers:
  Authorization: Bearer <admin_token>
  Content-Type: application/json

Body:
{
  "module_id": 1,
  "title": "Topic 1: Keyword Research",
  "description": "How to find profitable keywords",
  "video_source_type": "youtube",
  "external_video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "duration": 600,
  "display_order": 1,
  "is_published": true
}

Response: 201 Created
```

### 1.3 Upload Video for Topic (Cloudinary)
```bash
POST http://localhost:8000/api/modules/1/topics/upload-video
Headers:
  Authorization: Bearer <admin_token>
  Content-Type: multipart/form-data

Form Data:
  title: "Topic 2: On-Page SEO"
  description: "Optimize your web pages"
  display_order: 2
  file: <select video file>

Response: 201 Created
{
  "id": 2,
  "module_id": 1,
  "title": "Topic 2: On-Page SEO",
  "video_source_type": "cloudinary",
  "cloudinary_public_id": "courses/module_1/xyz123",
  "cloudinary_url": "https://res.cloudinary.com/...",
  "thumbnail_url": "https://res.cloudinary.com/.../thumbnail.jpg",
  "duration": 450,
  ...
}
```

### 1.4 Get Module with Topics
```bash
GET http://localhost:8000/api/modules/1
Headers:
  Authorization: Bearer <user_token>

Response: 200 OK
{
  "id": 1,
  "course_id": 1,
  "title": "Module 1: SEO Basics",
  "description": "...",
  "topics": [
    {
      "id": 1,
      "title": "Topic 1: Keyword Research",
      "video_source_type": "youtube",
      "external_video_url": "https://www.youtube.com/watch?v=...",
      ...
    },
    {
      "id": 2,
      "title": "Topic 2: On-Page SEO",
      "video_source_type": "cloudinary",
      "cloudinary_url": "https://res.cloudinary.com/...",
      ...
    }
  ]
}
```

### 1.5 Get Course with Full Hierarchy
```bash
GET http://localhost:8000/api/courses/1/with-modules
Headers:
  Authorization: Bearer <user_token>

Response: 200 OK
{
  "id": 1,
  "title": "Digital Marketing Mastery",
  "description": "...",
  "package_name": "Platinum",
  "total_topics": 5,
  "modules": [
    {
      "id": 1,
      "title": "Module 1: SEO Basics",
      "topics": [
        { "id": 1, "title": "Topic 1: Keyword Research", ... },
        { "id": 2, "title": "Topic 2: On-Page SEO", ... }
      ]
    },
    {
      "id": 2,
      "title": "Module 2: Social Media",
      "topics": [...]
    }
  ]
}
```

### 1.6 Update Topic
```bash
PUT http://localhost:8000/api/modules/1/topics/1
Headers:
  Authorization: Bearer <admin_token>
  Content-Type: application/json

Body:
{
  "title": "Topic 1: Advanced Keyword Research",
  "description": "Updated description",
  "duration": 720
}

Response: 200 OK
```

### 1.7 Delete Topic
```bash
DELETE http://localhost:8000/api/modules/1/topics/1
Headers:
  Authorization: Bearer <admin_token>

Response: 200 OK
{
  "message": "Topic deleted successfully"
}
```

---

## 2. Testing User Profile Enhancements

### 2.1 Update User Profile (with new fields)
```bash
PUT http://localhost:8000/api/auth/profile
Headers:
  Authorization: Bearer <user_token>
  Content-Type: application/json

Body:
{
  "full_name": "John Doe",
  "phone": "+1234567890",
  "username": "johndoe123",
  "bio": "Digital marketing enthusiast and MLM expert",
  "instagram_url": "https://instagram.com/johndoe",
  "twitter_url": "https://twitter.com/johndoe",
  "linkedin_url": "https://linkedin.com/in/johndoe"
}

Response: 200 OK
```

### 2.2 Get User Profile
```bash
GET http://localhost:8000/api/auth/me
Headers:
  Authorization: Bearer <user_token>

Response: 200 OK
{
  "id": 1,
  "email": "john@example.com",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "username": "johndoe123",
  "bio": "Digital marketing enthusiast...",
  "instagram_url": "https://instagram.com/johndoe",
  "twitter_url": "https://twitter.com/johndoe",
  "linkedin_url": "https://linkedin.com/in/johndoe",
  "referral_code": "ABC123",
  ...
}
```

---

## 3. Testing Certificates

### 3.1 Issue Certificate (after completing all videos)
```bash
POST http://localhost:8000/api/courses/1/certificate/issue
Headers:
  Authorization: Bearer <user_token>

Response: 200 OK (if all videos completed)
{
  "id": 1,
  "user_id": 1,
  "course_id": 1,
  "certificate_number": "A1B2C3D4",
  "issued_at": "2025-01-XX..."
}

Response: 400 Bad Request (if not all videos completed)
{
  "detail": "All videos must be completed to issue certificate"
}
```

---

## 4. Testing Payout System

### 4.1 Get Available Balance
```bash
GET http://localhost:8000/api/payouts/available-balance
Headers:
  Authorization: Bearer <user_token>

Response: 200 OK
{
  "available_balance": 1500.00,
  "pending_payouts": 0.00,
  "minimum_payout": 500.00,
  "can_request_payout": true,
  "has_bank_details": true
}
```

### 4.2 Request Payout
```bash
POST http://localhost:8000/api/payouts/request
Headers:
  Authorization: Bearer <user_token>
  Content-Type: application/json

Body:
{
  "amount": 1000.00
}

Response: 201 Created
{
  "id": 1,
  "user_id": 1,
  "amount": 1000.00,
  "status": "pending",
  "created_at": "2025-01-XX..."
}
```

### 4.3 Admin: Get Pending Payouts
```bash
GET http://localhost:8000/api/payouts/all?status_filter=pending&limit=100
Headers:
  Authorization: Bearer <admin_token>

Response: 200 OK
[
  {
    "id": 1,
    "user_id": 1,
    "amount": 1000.00,
    "status": "pending",
    "user": {
      "full_name": "John Doe",
      "email": "john@example.com"
    },
    ...
  }
]
```

### 4.4 Admin: Approve Payout
```bash
PUT http://localhost:8000/api/payouts/1/approve
Headers:
  Authorization: Bearer <admin_token>

Response: 200 OK
{
  "id": 1,
  "status": "processing",
  ...
}
```

### 4.5 Admin: Complete Payout
```bash
PUT http://localhost:8000/api/payouts/1/process
Headers:
  Authorization: Bearer <admin_token>
  Content-Type: application/json

Body:
{
  "transaction_id": "TXN123456789"
}

Response: 200 OK
{
  "id": 1,
  "status": "completed",
  "transaction_id": "TXN123456789",
  "completed_at": "2025-01-XX...",
  ...
}
```

### 4.6 Admin: Reject Payout
```bash
PUT http://localhost:8000/api/payouts/1/cancel?reason=Insufficient+balance
Headers:
  Authorization: Bearer <admin_token>

Response: 200 OK
{
  "id": 1,
  "status": "failed",
  ...
}
```

---

## 5. Testing Video Progress

### 5.1 Get Video Progress
```bash
GET http://localhost:8000/api/courses/1/videos/1/progress
Headers:
  Authorization: Bearer <user_token>

Response: 200 OK
{
  "id": 1,
  "user_id": 1,
  "video_id": 1,
  "watched_seconds": 120.5,
  "completed": false,
  "created_at": "2025-01-XX...",
  "updated_at": "2025-01-XX..."
}
```

### 5.2 Update Video Progress
```bash
POST http://localhost:8000/api/courses/1/videos/1/progress
Headers:
  Authorization: Bearer <user_token>
  Content-Type: application/json

Body:
{
  "watched_seconds": 250.0,
  "completed": false
}

Response: 200 OK
{
  "id": 1,
  "watched_seconds": 250.0,
  "completed": false,
  ...
}
```

### 5.3 Mark Video as Completed
```bash
POST http://localhost:8000/api/courses/1/videos/1/progress
Headers:
  Authorization: Bearer <user_token>
  Content-Type: application/json

Body:
{
  "watched_seconds": 600.0,
  "completed": true
}

Response: 200 OK
{
  "id": 1,
  "watched_seconds": 600.0,
  "completed": true,
  ...
}
```

---

## 6. Testing Avatar Upload

### 6.1 Upload Avatar
```bash
POST http://localhost:8000/api/profile/avatar
Headers:
  Authorization: Bearer <user_token>
  Content-Type: multipart/form-data

Form Data:
  file: <select image file>

Response: 200 OK
{
  "id": 1,
  "user_id": 1,
  "avatar_url": "https://res.cloudinary.com/dihv0v8hr/image/upload/v.../avatars/1/xyz.jpg",
  ...
}
```

### 6.2 Get Profile with Avatar
```bash
GET http://localhost:8000/api/profile/me
Headers:
  Authorization: Bearer <user_token>

Response: 200 OK
{
  "id": 1,
  "user_id": 1,
  "avatar_url": "https://res.cloudinary.com/...",
  ...
}
```

---

## Common Error Responses

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```
**Solution**: Include valid JWT token in Authorization header

### 403 Forbidden
```json
{
  "detail": "Admin access required"
}
```
**Solution**: Use admin user token

### 404 Not Found
```json
{
  "detail": "Course not found"
}
```
**Solution**: Check if resource ID exists

### 400 Bad Request
```json
{
  "detail": "All videos must be completed to issue certificate"
}
```
**Solution**: Check validation requirements

---

## Quick Test Workflow

1. **Login as Admin**:
   ```
   POST /api/auth/login
   { "email": "admin@example.com", "password": "admin123" }
   ```

2. **Create Course Hierarchy**:
   - Create Module
   - Upload video for Topic
   - Add YouTube topic

3. **Login as User**:
   ```
   POST /api/auth/login
   { "email": "user@example.com", "password": "user123" }
   ```

4. **Test User Features**:
   - Update profile with username/bio/social links
   - Upload avatar
   - Watch videos (update progress)
   - Request payout

5. **Admin Actions**:
   - View pending payouts
   - Approve and complete payout

---

**Tip**: Use Swagger UI at http://localhost:8000/docs for interactive API testing!

