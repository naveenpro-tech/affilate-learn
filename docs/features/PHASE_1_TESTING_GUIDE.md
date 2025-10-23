# Phase 1 Testing Guide

**Date:** 2025-10-23  
**Status:** Ready for Testing  
**Components:** Mobile Feed, FeedCard, RemixModal, Backend API

---

## 🎯 What Was Implemented

### Frontend Components (3 files)

1. **`components/mobile/FeedCard.tsx`**
   - Full-screen vertical card (100vw × 100vh)
   - Double-tap like with heart animation
   - Overlay gradient with author info
   - Remix button in thumb-zone
   - iOS safe area support

2. **`components/mobile/RemixModal.tsx`**
   - Blurred preview image
   - Take Photo / Choose from Gallery buttons
   - Smooth fade + slide animations
   - Phase 1 placeholder alerts

3. **`app/studio/feed/page.tsx`**
   - Responsive mobile feed route
   - Swipe navigation (Framer Motion)
   - Cursor-based pagination
   - Like, remix, share handlers

### Backend Improvements (2 files)

4. **`backend/app/schemas/studio.py`**
   - Added `author_avatar_url: Optional[str]` to `CommunityPostCard`
   - Added `comments_count: int = 0` to `CommunityPostCard`

5. **`backend/app/api/community.py`**
   - Updated feed endpoint to query `Profile` for avatar_url
   - Updated feed endpoint to count comments per post
   - Imported `Profile` and `Comment` models

---

## 🧪 Manual Testing Instructions

### Prerequisites

1. **Backend server must be running:**
   ```bash
   cd affilate-learn/backend
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Frontend server must be running:**
   ```bash
   cd affilate-learn/frontend
   npm run dev
   ```

   **Note:** If you encounter a git hook error (`git: 'commit-m' is not a git command`), try:
   ```bash
   npx next dev -p 3000
   ```

3. **Ensure you have test data:**
   - At least 5-10 community posts in the database
   - Posts should have images, titles, authors
   - Some posts should have likes and comments

---

## 📱 Testing Checklist

### 1. Route Accessibility

- [ ] Navigate to `http://localhost:3000/studio/feed`
- [ ] Page loads without errors
- [ ] No console errors in browser DevTools
- [ ] Loading state shows spinner and message
- [ ] Posts load and display correctly

### 2. Mobile Viewport Testing (Chrome DevTools)

**Setup:**
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M or Cmd+Shift+M)
3. Select "iPhone 12 Pro" or similar device
4. Refresh the page

**Tests:**
- [ ] Feed card displays full-screen (100vw × 100vh)
- [ ] Image displays correctly with black letterboxing
- [ ] Overlay gradient is visible and readable
- [ ] Author info shows username (and avatar if available)
- [ ] Title displays with 2-line clamp
- [ ] Engagement stats show (likes, comments, remixes)
- [ ] Remix button is in thumb-zone (bottom 1/3)
- [ ] Secondary actions visible (save, share, more)

### 3. Swipe Navigation

**Mobile (Touch Simulation):**
- [ ] Swipe up → navigates to next post
- [ ] Swipe down → navigates to previous post
- [ ] Smooth transition animation (0.3s ease-out)
- [ ] No jank or stuttering
- [ ] Post counter updates (e.g., "2 / 10")

**Desktop (Keyboard):**
- [ ] Arrow Up → navigates to next post
- [ ] Arrow Down → navigates to previous post
- [ ] Same smooth transitions as mobile

### 4. Double-Tap Like

**Test Steps:**
1. Double-tap on the image (quickly tap twice)
2. Observe heart animation in center
3. Check like count increments
4. Check heart icon fills with red

**Expected:**
- [ ] Heart animation appears (scale 0 → 1.2 → 1)
- [ ] Animation duration: 0.8s
- [ ] Like count increments by 1
- [ ] Heart icon turns red
- [ ] Double-tap again does nothing (already liked)

### 5. Like Button

**Test Steps:**
1. Tap the heart icon in stats section
2. Observe like count changes
3. Tap again to unlike

**Expected:**
- [ ] Like count increments/decrements
- [ ] Heart icon fills/unfills
- [ ] Optimistic UI update (instant feedback)
- [ ] API call succeeds in background

### 6. Remix Button

**Test Steps:**
1. Tap the "🎨 Remix" button
2. Observe modal opens
3. Check modal content

**Expected:**
- [ ] Modal opens with smooth animation
- [ ] Blurred preview image displays
- [ ] "Remix this style with your photo" title shows
- [ ] "Take Photo" button visible
- [ ] "Choose from Gallery" button visible
- [ ] Close button (X) visible in top-right

### 7. Remix Modal Interactions

**Test Steps:**
1. Tap "Take Photo" button
2. Tap "Choose from Gallery" button
3. Tap close button (X)
4. Tap backdrop (outside modal)
5. Press Escape key

**Expected:**
- [ ] "Take Photo" shows alert: "Photo capture coming in Phase 2"
- [ ] "Choose from Gallery" shows alert: "Gallery picker coming in Phase 2"
- [ ] Close button dismisses modal
- [ ] Backdrop click dismisses modal
- [ ] Escape key dismisses modal
- [ ] Body scroll locked when modal open
- [ ] Body scroll restored when modal closed

### 8. Share Functionality

**Test Steps:**
1. Tap the share icon
2. Observe native share dialog (mobile) or clipboard copy (desktop)

**Expected:**
- [ ] Native share API opens (if supported)
- [ ] Share URL includes post ID
- [ ] Share text includes post title
- [ ] Fallback: Link copied to clipboard
- [ ] Toast notification: "Link copied to clipboard!"

### 9. Pagination

**Test Steps:**
1. Swipe through posts until reaching last 3 posts
2. Observe loading indicator
3. Check new posts load automatically

**Expected:**
- [ ] Pagination triggers when approaching end
- [ ] Loading state shows briefly
- [ ] New posts append to feed
- [ ] No duplicate posts
- [ ] Smooth transition to new posts

### 10. Loading States

**Test Steps:**
1. Refresh page
2. Observe initial loading state
3. Simulate slow network (DevTools → Network → Slow 3G)

**Expected:**
- [ ] Loading spinner displays
- [ ] "Loading feed..." message shows
- [ ] No layout shift when posts load
- [ ] Images load progressively

### 11. Error States

**Test Steps:**
1. Stop backend server
2. Refresh page
3. Observe error state

**Expected:**
- [ ] Error message displays
- [ ] "Retry" button visible
- [ ] Clicking retry attempts to reload
- [ ] No infinite loading spinner

### 12. Empty State

**Test Steps:**
1. Clear all posts from database (or filter to empty category)
2. Refresh page

**Expected:**
- [ ] "No posts available" message shows
- [ ] No errors in console
- [ ] Clean empty state UI

---

## 🎨 Design Verification

### Color Palette
- [ ] Remix button: `#667eea` (purple)
- [ ] Secondary button: `#f9fafb` (light gray)
- [ ] Text primary: `#111827` (dark gray)
- [ ] Overlay gradient: `rgba(0,0,0,0.8)` to transparent

### Spacing
- [ ] Padding: 8px, 12px, 16px, 24px (multiples of 4)
- [ ] Gap between stats: 16px
- [ ] Margin bottom for title: 12px

### Typography
- [ ] Author username: 14px, font-weight 500
- [ ] Post title: 18px, font-weight 600
- [ ] Engagement stats: 14px
- [ ] Remix button: 16px, font-weight 600

### Animations
- [ ] Heart pop: 0.8s ease-out
- [ ] Swipe transition: 0.3s ease-out
- [ ] Modal fade: 0.2s
- [ ] Modal slide: 0.3s ease-out
- [ ] Button active: scale(0.95)

---

## 🔧 Backend API Verification

### Test Feed Endpoint

**Request:**
```bash
curl -X GET "http://localhost:8000/api/studio/community/feed?cursor=0&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "items": [
    {
      "id": 1,
      "image_url": "/uploads/...",
      "title": "Cyberpunk cat warrior",
      "author_name": "John Doe",
      "author_avatar_url": "https://...",  // NEW FIELD
      "category_name": "Fantasy",
      "likes_count": 42,
      "reuse_count": 15,
      "comments_count": 8,  // NEW FIELD
      "user_liked": false,
      "created_at": "2025-10-23T..."
    }
  ],
  "next_cursor": "5"
}
```

**Verify:**
- [ ] `author_avatar_url` field present (null if no profile)
- [ ] `comments_count` field present (0 if no comments)
- [ ] All other fields unchanged
- [ ] Response time < 500ms

---

## 📊 Performance Testing

### Lighthouse Audit (Mobile)

**Steps:**
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select "Mobile" device
4. Select "Performance" category
5. Click "Analyze page load"

**Target Metrics:**
- [ ] Performance Score: >90
- [ ] First Contentful Paint: <2s
- [ ] Largest Contentful Paint: <2.5s
- [ ] Time to Interactive: <3s
- [ ] Cumulative Layout Shift: <0.1

### Scroll Performance

**Steps:**
1. Open DevTools → Performance tab
2. Start recording
3. Swipe through 10 posts
4. Stop recording
5. Check FPS graph

**Target:**
- [ ] Consistent 60 FPS during swipe
- [ ] No dropped frames
- [ ] No long tasks (>50ms)

---

## 🐛 Known Issues & Limitations

### Current Limitations (Phase 1)

1. **No Photo Upload:**
   - Remix modal shows placeholder alerts
   - Camera/gallery integration deferred to Phase 2

2. **No Virtual Scrolling:**
   - All posts loaded in memory
   - May cause performance issues with 100+ posts
   - Virtual scrolling planned for Phase 2

3. **No Image Preloading:**
   - Images load on demand
   - May cause brief loading delay when swiping
   - Preloading planned for Phase 2

4. **No Thumbnail Optimization:**
   - Serves full-size images
   - May be slow on 3G networks
   - Thumbnail generation planned for Phase 2

### Backend Gaps

1. **Avatar URL:**
   - Returns null if user has no profile
   - Frontend shows placeholder (first letter of username)

2. **Comments Count:**
   - Counted on every request (not cached)
   - May be slow with many comments
   - Consider adding `comments_count` column to `community_posts` table

---

## 🚀 Next Steps (Phase 2)

### Week 2 Tasks (Days 4-7)

1. **Photo Upload Integration (Day 4)**
   - Implement camera capture
   - Implement gallery picker
   - Add image preview
   - Validate file size/format

2. **Remix API Integration (Day 5)**
   - Connect to generation endpoint
   - Handle credit deduction
   - Show generation progress

3. **Background Job Polling (Day 6)**
   - Poll for generation status
   - Show progress bar
   - Handle success/errors

4. **Performance Optimization (Day 7)**
   - Implement virtual scrolling
   - Add image preloading
   - Optimize bundle size
   - Run Lighthouse audit

---

## 📝 Testing Report Template

**Tester:** _______________  
**Date:** _______________  
**Device:** _______________  
**Browser:** _______________  

### Summary
- [ ] All features working as expected
- [ ] Minor issues found (list below)
- [ ] Major issues found (list below)

### Issues Found
1. _______________
2. _______________
3. _______________

### Screenshots
- Attach screenshots of any issues
- Include console errors if any

### Performance
- Lighthouse Score: ___/100
- FPS during swipe: ___
- Load time: ___s

### Recommendations
- _______________
- _______________

---

**End of Testing Guide**

