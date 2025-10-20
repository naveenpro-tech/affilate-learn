# 🎓 COMPLETE END-TO-END COURSE MANAGEMENT SYSTEM

**Date:** January 15, 2025  
**Purpose:** Comprehensive guide for course creation, editing, module/topic management, and user access  
**Status:** ✅ **FULLY FUNCTIONAL**

---

## 📋 TABLE OF CONTENTS

1. [System Architecture](#system-architecture)
2. [Course Creation Flow](#course-creation-flow)
3. [Module & Topic Management](#module--topic-management)
4. [Course Access Control](#course-access-control)
5. [Video Management](#video-management)
6. [API Endpoints Reference](#api-endpoints-reference)
7. [Frontend Pages](#frontend-pages)
8. [Testing Guide](#testing-guide)
9. [Troubleshooting](#troubleshooting)

---

## 🏗️ SYSTEM ARCHITECTURE

### Database Models

```
Course (courses table)
├── id: Primary key
├── title: Course name
├── slug: URL-friendly identifier
├── description: Course description
├── package_id: Required package tier (Silver/Gold/Platinum)
├── individual_price: Price for individual purchase (default ₹199)
├── available_for_individual_purchase: Boolean flag
├── thumbnail_url: Course thumbnail
├── display_order: Sort order
├── is_published: Visibility status
└── Relationships:
    ├── modules: One-to-many (cascade delete)
    ├── package: Many-to-one
    └── videos: One-to-many (legacy, for backward compatibility)

Module (modules table)
├── id: Primary key
├── course_id: Foreign key to courses
├── title: Module name
├── description: Module description
├── display_order: Sort order within course
├── is_published: Visibility status
└── Relationships:
    └── topics: One-to-many (cascade delete)

Topic (topics table)
├── id: Primary key
├── module_id: Foreign key to modules
├── title: Topic name
├── description: Topic description
├── video_source_type: 'cloudinary' or 'external'
├── cloudinary_public_id: Cloudinary video ID (if cloudinary)
├── cloudinary_url: Cloudinary video URL (if cloudinary)
├── external_video_url: YouTube/Vimeo URL (if external)
├── thumbnail_url: Video thumbnail
├── duration: Video length in seconds
├── display_order: Sort order within module
└── is_published: Visibility status
```

### Access Control Logic

```python
def check_user_access(user, course, db):
    # Admins have access to all courses
    if user.is_admin:
        return True
    
    # Check package-based access
    user_package = get_active_package(user)
    if user_package:
        if package_hierarchy[user_package] >= package_hierarchy[course.package]:
            return True
    
    # Check individual purchase
    individual_purchase = db.query(UserCoursePurchase).filter(
        UserCoursePurchase.user_id == user.id,
        UserCoursePurchase.course_id == course.id,
        UserCoursePurchase.status == "active"
    ).first()
    
    if individual_purchase:
        return True
    
    return False
```

---

## 🎯 COURSE CREATION FLOW

### Step 1: Navigate to Course Creation
- **URL:** `/admin/courses/new`
- **Access:** Admin only
- **Page:** `frontend/app/admin/courses/new/page.tsx`

### Step 2: Fill Course Details

**Required Fields:**
- **Title:** Course name (max 200 chars)
- **Slug:** URL-friendly identifier (auto-generated from title)
- **Description:** Course description (text area)
- **Package Tier:** Select Silver/Gold/Platinum (dropdown)

**Optional Fields:**
- **Available for Individual Purchase:** Checkbox (default: checked)
- **Individual Purchase Price:** Number input (default: ₹199)
- **Thumbnail URL:** Image URL (optional)
- **Published:** Checkbox (default: unchecked)

### Step 3: Add Modules

Click "Add Module" button to create a new module:
- **Title:** Module name (required)
- **Description:** Module description (optional)
- **Display Order:** Auto-incremented
- **Published:** Checkbox

### Step 4: Add Topics to Modules

For each module, click "Add Topic" to create topics:

**Topic Fields:**
- **Title:** Topic name (required)
- **Description:** Topic description (optional)
- **Video Source Type:** Choose between:
  - **Cloudinary:** Upload video file
  - **External URL:** YouTube/Vimeo link
- **Video URL/Upload:** Based on source type
- **Duration:** Video length in seconds (optional)
- **Display Order:** Auto-incremented
- **Published:** Checkbox

### Step 5: Save Course

Click "Save Course" button:
1. Validates all required fields
2. Creates course in database
3. Creates all modules
4. Creates all topics for each module
5. Uploads videos to Cloudinary (if applicable)
6. Redirects to course list

---

## 📚 MODULE & TOPIC MANAGEMENT

### Adding Modules

**Endpoint:** `POST /api/modules/`

**Request Body:**
```json
{
  "course_id": 1,
  "title": "Introduction to Python",
  "description": "Learn Python basics",
  "display_order": 0,
  "is_published": true
}
```

**Frontend API Call:**
```typescript
await adminAPI.createModule({
  course_id: courseId,
  title: 'New Module',
  description: '',
  display_order: modules.length,
  is_published: false
});
```

### Adding Topics

**Endpoint:** `POST /api/modules/{module_id}/topics`

**Request Body:**
```json
{
  "module_id": 1,
  "title": "Variables and Data Types",
  "description": "Understanding Python variables",
  "video_source_type": "cloudinary",
  "cloudinary_public_id": "courses/python/video1",
  "cloudinary_url": "https://res.cloudinary.com/...",
  "duration": 600,
  "display_order": 0,
  "is_published": true
}
```

**Frontend API Call:**
```typescript
await adminAPI.createTopic(moduleId, {
  module_id: moduleId,  // REQUIRED for validation
  title: 'New Topic',
  description: '',
  video_source_type: 'external',
  external_video_url: 'https://youtube.com/watch?v=...',
  duration: 0,
  display_order: topics.length,
  is_published: false
});
```

### Uploading Videos to Cloudinary

**Endpoint:** `POST /api/modules/{module_id}/topics/upload-video`

**Request:** Multipart form data
- `title`: Topic title
- `description`: Topic description
- `display_order`: Sort order
- `file`: Video file (MP4, MOV, etc.)

**Frontend API Call:**
```typescript
const formData = new FormData();
formData.append('title', topic.title);
formData.append('description', topic.description);
formData.append('display_order', topic.display_order.toString());
formData.append('file', videoFile);

await adminAPI.uploadTopicVideo(moduleId, formData);
```

### Updating Modules

**Endpoint:** `PUT /api/modules/{module_id}`

**Request Body:**
```json
{
  "title": "Updated Module Title",
  "description": "Updated description",
  "is_published": true
}
```

### Updating Topics

**Endpoint:** `PUT /api/modules/{module_id}/topics/{topic_id}`

**Request Body:**
```json
{
  "title": "Updated Topic Title",
  "description": "Updated description",
  "is_published": true
}
```

### Deleting Modules

**Endpoint:** `DELETE /api/modules/{module_id}`

**Effect:** Cascade deletes all topics in the module

### Deleting Topics

**Endpoint:** `DELETE /api/modules/{module_id}/topics/{topic_id}`

**Effect:** Removes topic and associated video from Cloudinary

---

## 🔐 COURSE ACCESS CONTROL

### Access Types

1. **Package-Based Access**
   - User has active package (Silver/Gold/Platinum)
   - Can access courses at or below their package tier
   - Hierarchical: Platinum > Gold > Silver

2. **Individual Purchase Access**
   - User purchased specific course individually
   - Lifetime access to that course
   - Independent of package tier

3. **Admin Access**
   - Admins have access to ALL courses
   - No package or purchase required

### Checking Access

**Endpoint:** `GET /api/courses/all-with-access`

**Response:**
```json
[
  {
    "id": 1,
    "title": "Python Basics",
    "slug": "python-basics",
    "description": "Learn Python",
    "package_id": 1,
    "package_name": "Silver",
    "individual_price": 199,
    "available_for_individual_purchase": true,
    "has_access": true,
    "access_type": "package",  // or "individual_purchase" or "none"
    "modules": [...],
    "total_topics": 15
  }
]
```

### Frontend Usage

```typescript
const response = await coursesAPI.getAllWithAccess();
const courses = response.data;

courses.forEach(course => {
  if (course.has_access) {
    // Show "Start Learning" button
  } else {
    // Show "Buy This Course" button with lock icon
  }
});
```

---

## 🎥 VIDEO MANAGEMENT

### Video Source Types

1. **Cloudinary (Uploaded Videos)**
   - Videos uploaded to Cloudinary
   - Stored in `courses/{course_slug}/` folder
   - Automatic thumbnail generation
   - Streaming optimized

2. **External URLs (YouTube/Vimeo)**
   - Embed external videos
   - No storage cost
   - Requires internet connection

### Video Player

**Component:** `frontend/components/VideoPlayer.tsx`

**Props:**
```typescript
interface VideoPlayerProps {
  videoUrl: string;
  videoType: 'cloudinary' | 'external';
  onProgress?: (seconds: number) => void;
  onComplete?: () => void;
}
```

**Usage:**
```typescript
<VideoPlayer
  videoUrl={topic.cloudinary_url || topic.external_video_url}
  videoType={topic.video_source_type}
  onProgress={(seconds) => saveProgress(seconds)}
  onComplete={() => markComplete()}
/>
```

---

## 📡 API ENDPOINTS REFERENCE

### Course Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/courses/` | Get all accessible courses | User |
| GET | `/api/courses/all-with-access` | Get all courses with access info | User |
| GET | `/api/courses/{id}` | Get specific course | User (with access) |
| GET | `/api/courses/{id}/with-modules` | Get course with modules/topics | User (with access) |
| POST | `/api/courses/` | Create new course | Admin |
| PUT | `/api/courses/{id}` | Update course | Admin |
| DELETE | `/api/courses/{id}` | Delete course | Admin |

### Module Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/modules/` | Create module | Admin |
| PUT | `/api/modules/{id}` | Update module | Admin |
| DELETE | `/api/modules/{id}` | Delete module | Admin |

### Topic Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/modules/{module_id}/topics` | Create topic | Admin |
| POST | `/api/modules/{module_id}/topics/upload-video` | Upload video topic | Admin |
| PUT | `/api/modules/{module_id}/topics/{topic_id}` | Update topic | Admin |
| DELETE | `/api/modules/{module_id}/topics/{topic_id}` | Delete topic | Admin |

---

## 🖥️ FRONTEND PAGES

### Admin Pages

1. **Course List:** `/admin/courses`
   - View all courses
   - Create new course button
   - Edit/Delete actions

2. **Create Course:** `/admin/courses/new`
   - Course creation form
   - Module/topic management
   - Video upload

3. **Edit Course:** `/admin/courses/[id]/edit`
   - Update course details
   - Manage modules/topics
   - Reorder content

### User Pages

1. **Course Catalog:** `/courses`
   - Browse all courses
   - Lock/unlock indicators
   - Package tier badges

2. **Course Detail:** `/courses/[id]`
   - Course overview
   - Module/topic list
   - Start learning button

3. **Course Purchase:** `/courses/[id]/purchase`
   - Individual purchase page
   - Razorpay integration
   - Price display

4. **Course Player:** `/courses/[id]/modules`
   - Video player
   - Progress tracking
   - Next/previous navigation

---

## 🧪 TESTING GUIDE

### Test Course Creation

1. Login as admin
2. Navigate to `/admin/courses/new`
3. Fill course details
4. Add 2-3 modules
5. Add 2-3 topics per module
6. Upload videos or add external URLs
7. Save course
8. Verify course appears in list

### Test Course Editing

1. Navigate to `/admin/courses/[id]/edit`
2. Update course title
3. Add new module
4. Add new topic
5. Delete a topic
6. Save changes
7. Verify changes persist

### Test User Access

1. Login as user with Silver package
2. Navigate to `/courses`
3. Verify Silver courses are unlocked
4. Verify Gold/Platinum courses are locked
5. Click locked course
6. Verify redirects to purchase page

### Test Individual Purchase

1. Login as user without package
2. Navigate to `/courses/[id]/purchase`
3. Click "Buy This Course"
4. Complete Razorpay payment
5. Verify access granted
6. Verify can view course content

---

## 🔧 TROUBLESHOOTING

### Issue: Courses Not Loading

**Symptoms:** Network error, 404, or blank page

**Solutions:**
1. Check backend is running on port 8000
2. Check frontend is running (port 3000 or 3001)
3. Verify CORS configuration includes frontend port
4. Check browser console for specific errors

### Issue: 403 Forbidden on Course Access

**Symptoms:** "You don't have access to this course"

**Solutions:**
1. Verify user has active package or individual purchase
2. Check package hierarchy (Silver < Gold < Platinum)
3. For admins, verify `is_admin=True` in database
4. Use `getAllWithAccess` endpoint instead of `getById`

### Issue: Videos Not Showing

**Symptoms:** Zero videos displayed after adding topics

**Solutions:**
1. Verify topics are published (`is_published=True`)
2. Check `video_source_type` matches video data
3. For Cloudinary: Verify `cloudinary_url` is set
4. For external: Verify `external_video_url` is valid
5. Check module has topics relationship loaded

### Issue: 422 Validation Error on Topic Creation

**Symptoms:** "Unprocessable Entity" error

**Solutions:**
1. Ensure `module_id` is included in request body
2. Verify all required fields are present
3. Check field types match schema (int, str, bool)
4. Review error detail for specific field issues

---

## ✅ SUMMARY

The complete course management system includes:

✅ **Course CRUD:** Create, read, update, delete courses  
✅ **Module Management:** Add, edit, delete, reorder modules  
✅ **Topic Management:** Add, edit, delete, reorder topics  
✅ **Video Upload:** Cloudinary integration for video hosting  
✅ **External Videos:** YouTube/Vimeo embedding  
✅ **Access Control:** Package-based + individual purchase  
✅ **Admin Interface:** Full course management UI  
✅ **User Interface:** Course browsing and learning  
✅ **Progress Tracking:** Video progress and completion  
✅ **Payment Integration:** Razorpay for individual purchases  

**Status:** 🚀 **PRODUCTION READY**

