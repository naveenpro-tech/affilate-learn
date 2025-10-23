# Phase 2 Quick Start Guide

**🎉 Photo Upload Integration is Complete!**

---

## 🚀 Quick Test (5 Minutes)

### 1. Start Servers

```bash
# Backend (Terminal 1)
cd /home/butta/Music/affilate-learn/backend
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend (Terminal 2)
cd /home/butta/Music/affilate-learn/frontend
pkill -9 node  # Kill any existing processes
npx next dev -p 3000
```

### 2. Open Mobile Feed

```
http://localhost:3000/studio/feed
```

### 3. Test Photo Upload

1. **Open DevTools** (F12)
2. **Toggle mobile view** (Ctrl+Shift+M)
3. **Select iPhone 12 Pro**
4. **Tap Remix button** on any post
5. **Choose "Choose from Gallery"** (easier to test)
6. **Select a photo** (JPEG or PNG, <10MB)
7. **Tap "Use This Photo"**
8. **Watch upload progress**
9. **See success toast!**

---

## ✅ What to Test

### Camera Capture (Requires HTTPS or localhost)
- [ ] Tap "Take Photo"
- [ ] Camera opens with live preview
- [ ] Tap flip button (switches front/back)
- [ ] Tap capture button (white circle)
- [ ] Photo appears in preview
- [ ] Tap "Use This Photo"
- [ ] Upload succeeds

### Gallery Picker
- [ ] Tap "Choose from Gallery"
- [ ] File picker opens
- [ ] Select JPEG or PNG file
- [ ] Preview shows selected image
- [ ] Tap "Use This Photo"
- [ ] Upload succeeds
- [ ] Success toast appears

### File Validation
- [ ] Try uploading GIF → See error toast
- [ ] Try uploading file >10MB → See error toast
- [ ] Try uploading JPEG <10MB → Success
- [ ] Try uploading PNG <10MB → Success

### Error Handling
- [ ] Stop backend server
- [ ] Try uploading photo
- [ ] See "Failed to upload image" error
- [ ] Restart backend
- [ ] Try again → Success

---

## 📱 Real Device Testing

### Get Local IP
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Access from Phone
```
http://YOUR_LOCAL_IP:3000/studio/feed
```

### Test Camera on Real Device
1. Open feed on phone
2. Tap Remix button
3. Tap "Take Photo"
4. Grant camera permission
5. Take a selfie
6. Confirm and upload
7. See success!

---

## 🎯 Expected Behavior

### Camera Capture
- ✅ Full-screen black interface
- ✅ Live video preview
- ✅ White capture button (bottom center)
- ✅ Flip camera button (top right)
- ✅ Close button (top left)
- ✅ Smooth animations

### Image Preview
- ✅ Full-screen black background
- ✅ Selected image centered
- ✅ Cancel button (bottom left, white/20%)
- ✅ Confirm button (bottom right, purple)
- ✅ Upload spinner during upload
- ✅ Buttons disabled during upload

### Upload
- ✅ Progress indicator shows
- ✅ Upload completes in 1-3 seconds
- ✅ Success toast: "Photo uploaded successfully!"
- ✅ All modals close
- ✅ Ready for Phase 3 (generation)

---

## 🐛 Troubleshooting

### Camera Not Working
**Issue:** "Unable to access camera"

**Solutions:**
1. Use HTTPS or localhost (camera requires secure context)
2. Check browser permissions (allow camera access)
3. Try different browser (Chrome recommended)
4. Use "Choose from Gallery" as fallback

### Upload Fails
**Issue:** "Failed to upload image"

**Solutions:**
1. Check backend is running on port 8000
2. Check file size (<10MB)
3. Check file type (JPEG/PNG only)
4. Check auth token (login again if needed)
5. Check Cloudinary credentials in backend .env

### Preview Not Showing
**Issue:** Image preview is blank

**Solutions:**
1. Check file was selected
2. Check browser console for errors
3. Try different image file
4. Refresh page and try again

---

## 📊 API Testing (Optional)

### Test Upload Endpoint Directly

```bash
# Get auth token (login first)
TOKEN="your_jwt_token_here"

# Upload test image
curl -X POST "http://localhost:8000/api/studio/upload-source-image" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/test-image.jpg"

# Expected response:
{
  "url": "https://res.cloudinary.com/.../remix/user_123/abc123.jpg",
  "public_id": "remix/user_123/abc123",
  "width": 1920,
  "height": 1080
}
```

---

## 🎯 Next Steps (Phase 3)

### Day 5: Remix API Integration

**What's Next:**
1. Connect photo upload to generation API
2. Call `/api/studio/generate` with `source_image_url`
3. Show generation progress modal
4. Handle credit deduction
5. Navigate to result on success

**Estimated Time:** 4-6 hours

---

## 📝 Files Created/Modified

### Backend (2 files)
- `backend/app/api/studio.py` (added upload endpoint)
- `backend/app/schemas/studio.py` (added source_image_url field)

### Frontend (4 files)
- `components/mobile/CameraCapture.tsx` (NEW - 210 lines)
- `components/mobile/ImagePreview.tsx` (NEW - 110 lines)
- `components/mobile/RemixModal.tsx` (UPDATED - 283 lines)
- `app/studio/feed/page.tsx` (needs Phase 3 update)

### Documentation (2 files)
- `docs/features/PHASE_2_IMPLEMENTATION_SUMMARY.md` (NEW - 300+ lines)
- `PHASE_2_QUICK_START.md` (this file)

---

## ✅ Phase 2 Checklist

- [x] Camera capture component
- [x] Gallery picker integration
- [x] Image preview component
- [x] File validation (type, size)
- [x] Upload to Cloudinary
- [x] Error handling
- [x] Toast notifications
- [x] RemixModal integration
- [x] Backend endpoint
- [x] Schema updates
- [x] Documentation
- [ ] Phase 3: Generation integration (next)

---

**🎉 Phase 2 is Complete!**

**Status:** ✅ Ready for Testing  
**Next:** Test photo upload, then proceed to Phase 3 (Remix API Integration)

**Estimated Testing Time:** 15-30 minutes  
**Estimated Phase 3 Time:** 4-6 hours


