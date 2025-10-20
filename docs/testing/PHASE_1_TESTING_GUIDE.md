# Phase 1 Testing Guide - Community AI Studio

## 🚀 Quick Start

### Prerequisites
- Backend running: `http://localhost:8000`
- Frontend running: `http://localhost:3000`
- User logged in
- Razorpay test credentials configured

---

## 📋 Testing Scenarios

### Scenario 1: Create Image (Standard Tier)

**Steps**:
1. Navigate to `/studio`
2. Enter prompt: "A beautiful sunset over mountains with golden light"
3. Select "Standard" tier
4. Click "Enhance Prompt"
5. Wait for enhancement (should show enhanced version)
6. Click "Generate Image"
7. Wait for generation (polling every 5 seconds)
8. View result with both prompts

**Expected Results**:
- ✅ Prompt enhanced with visual details
- ✅ Image generated successfully
- ✅ Credits deducted (1 credit)
- ✅ Image displayed in preview
- ✅ Both prompts shown and copyable

**Troubleshooting**:
- If generation fails: Check Replicate API key in `.env`
- If enhancement fails: Check Gemini API key
- If credits not deducted: Check credit ledger service

---

### Scenario 2: View My Creations

**Steps**:
1. Navigate to `/studio/my-creations`
2. See gallery of generated images
3. Hover over image to see actions
4. Click download button
5. Click share button
6. Click delete button (confirm)

**Expected Results**:
- ✅ Gallery loads with all images
- ✅ Download starts
- ✅ Share dialog opens (or URL copied)
- ✅ Image deleted after confirmation
- ✅ Gallery updates in real-time

**Troubleshooting**:
- If gallery empty: Generate images first
- If download fails: Check browser download settings
- If delete fails: Check API response in console

---

### Scenario 3: Buy Credits

**Steps**:
1. Navigate to `/studio/buy-credits`
2. See current credit balance
3. Select "50 credits" package (popular)
4. Review order summary
5. Click "Buy 50 Credits"
6. Complete Razorpay payment (test card: 4111111111111111)
7. Verify credits added

**Expected Results**:
- ✅ Package selected with ring highlight
- ✅ Order summary shows correct total
- ✅ Razorpay modal opens
- ✅ Payment processed
- ✅ Credits added to balance
- ✅ Redirect to studio

**Test Payment Details**:
- Card: 4111111111111111
- Expiry: Any future date (e.g., 12/25)
- CVV: Any 3 digits (e.g., 123)
- OTP: 123456

**Troubleshooting**:
- If payment fails: Check Razorpay test keys
- If credits not added: Check payment verification
- If redirect fails: Check router configuration

---

### Scenario 4: Tier Comparison

**Steps**:
1. Go to `/studio`
2. Generate image with Standard tier (1 credit)
3. Go to `/studio/my-creations`
4. Note image quality
5. Return to `/studio`
6. Generate image with Premium 2K tier (2 credits)
7. Compare quality

**Expected Results**:
- ✅ Standard: Lower resolution, fewer steps
- ✅ Premium 2K: Higher resolution, more steps
- ✅ Premium 4K: Highest resolution, most steps
- ✅ Credits deducted correctly

---

### Scenario 5: Error Handling

**Test Cases**:

**5a. Insufficient Credits**
- Have 0 credits
- Try to generate image
- Should show error: "Insufficient credits"

**5b. Invalid Prompt**
- Enter prompt < 10 characters
- Button should be disabled
- Cannot submit

**5c. Generation Timeout**
- Start generation
- Wait > 5 minutes
- Should show timeout error

**5d. Network Error**
- Disconnect internet
- Try to generate
- Should show error message

---

## 🔍 API Testing (Swagger)

### Access Swagger UI
- URL: `http://localhost:8000/docs`

### Test Endpoints

**1. Enhance Prompt**
```
POST /api/studio/enhance-prompt
Body: { "prompt": "a cat" }
Expected: 200 with enhanced_prompt
```

**2. Generate Image**
```
POST /api/studio/generate
Body: {
  "prompt": "enhanced prompt here",
  "tier": "standard",
  "watermark": true
}
Expected: 200 with job_id
```

**3. Check Status**
```
GET /api/studio/generate/{job_id}
Expected: 200 with status (pending/completed/failed)
```

**4. Get My Creations**
```
GET /api/studio/my-creations?skip=0&limit=20
Expected: 200 with images array
```

**5. Get Credits Balance**
```
GET /api/studio/credits/balance
Expected: 200 with balance number
```

---

## 📊 Database Verification

### Check Tables Created
```sql
-- SQLite
.tables
-- Should show: image_categories, image_templates, generated_images, 
--              community_posts, post_likes, credit_ledger, etc.
```

### Check Credit Ledger
```sql
SELECT * FROM credit_ledger WHERE user_id = 1;
-- Should show debit entries for generations
```

### Check Generated Images
```sql
SELECT * FROM generated_images WHERE user_id = 1;
-- Should show created images with URLs
```

---

## 🐛 Debugging Tips

### Frontend Console
- Open DevTools (F12)
- Check Console tab for errors
- Check Network tab for API calls
- Check Application tab for localStorage (token)

### Backend Logs
- Check terminal where backend is running
- Look for error messages
- Check request/response logs

### Common Issues

**Issue**: "ModuleNotFoundError: No module named 'app.core.auth'"
- **Fix**: Already fixed - import from `app.core.dependencies`

**Issue**: "Pydantic validation error: regex is removed"
- **Fix**: Already fixed - use `pattern` instead of `regex`

**Issue**: "Image generation fails"
- **Fix**: Add Replicate API key to `.env`

**Issue**: "Prompt enhancement fails"
- **Fix**: Check Gemini API key in `.env`

**Issue**: "Payment verification fails"
- **Fix**: Check Razorpay test keys in `.env`

---

## ✅ Sign-Off Checklist

- [ ] Backend server running without errors
- [ ] Frontend loads without errors
- [ ] Can log in successfully
- [ ] Can navigate to studio pages
- [ ] Can generate image (with Replicate key)
- [ ] Can view my creations
- [ ] Can buy credits (test payment)
- [ ] Credit balance updates correctly
- [ ] All error states work
- [ ] All loading states work
- [ ] Responsive on mobile/tablet/desktop
- [ ] No console errors
- [ ] No network errors

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review backend logs
3. Check frontend console
4. Verify API keys in `.env`
5. Check database tables exist
6. Verify Razorpay test mode

---

## 🎯 Next Steps After Testing

1. **Fix any bugs found**
2. **Add unit tests**
3. **Add integration tests**
4. **Performance optimization**
5. **Deploy to staging**
6. **User acceptance testing**
7. **Deploy to production**

---

**Status**: Ready for comprehensive testing! 🚀

