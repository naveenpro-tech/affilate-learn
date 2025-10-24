# Mobile Testing Guide
**Date:** 2025-10-24  
**Purpose:** Guide for testing the platform on mobile devices on the same network

---

## 🔧 Setup for Mobile Testing

### **Problem:**
When testing on mobile devices on the same network, you cannot use `localhost` or `127.0.0.1` because these refer to the mobile device itself, not your development computer.

### **Solution:**
Use your computer's local IP address instead.

---

## 📱 Step-by-Step Setup

### **Step 1: Find Your Computer's Local IP Address**

#### **On Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually starts with `192.168.x.x` or `10.0.x.x`)

#### **On macOS/Linux:**
```bash
ifconfig
# or
ip addr show
```
Look for `inet` address under your active network interface (usually `en0` or `wlan0`)

**Example:** `192.168.1.100`

---

### **Step 2: Update Frontend Environment Variables**

Create or update `affilate-learn/frontend/.env.local`:

```env
# For mobile testing, use your computer's local IP address
NEXT_PUBLIC_API_URL=http://192.168.1.100:8000

# Replace 192.168.1.100 with YOUR computer's actual IP address
```

**Important:** Replace `192.168.1.100` with your actual local IP address from Step 1.

---

### **Step 3: Start Backend Server**

The backend is already configured to listen on `0.0.0.0:8000`, which means it accepts connections from any network interface.

```bash
cd affilate-learn/backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Verify:** You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

---

### **Step 4: Start Frontend Server**

```bash
cd affilate-learn/frontend
npm run dev
```

**Verify:** You should see:
```
- Local:        http://localhost:3000
- Network:      http://192.168.1.100:3000
```

---

### **Step 5: Access from Mobile Device**

1. **Ensure mobile device is on the same WiFi network** as your computer
2. **Open browser on mobile** (Safari on iPhone, Chrome on Android)
3. **Navigate to:** `http://192.168.1.100:3000` (replace with your IP)

---

## 🔍 Troubleshooting

### **Issue 1: Cannot connect from mobile**

**Possible Causes:**
1. Mobile device is on a different network
2. Firewall is blocking connections
3. Wrong IP address

**Solutions:**
```bash
# Check if backend is accessible from mobile
# On mobile browser, try: http://192.168.1.100:8000/docs

# If that doesn't work, check firewall:
# Windows: Allow port 8000 and 3000 in Windows Firewall
# macOS: System Preferences > Security & Privacy > Firewall > Firewall Options
# Linux: sudo ufw allow 8000 && sudo ufw allow 3000
```

---

### **Issue 2: Login not working on mobile**

**Possible Causes:**
1. Frontend is still using `localhost` instead of local IP
2. CORS configuration issue
3. Cookie/session issue

**Solutions:**
1. **Verify `.env.local` is correct:**
   ```bash
   cat frontend/.env.local
   # Should show: NEXT_PUBLIC_API_URL=http://192.168.1.100:8000
   ```

2. **Restart frontend server** after changing `.env.local`:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

3. **Check browser console** on mobile:
   - Open Safari/Chrome DevTools on mobile
   - Look for CORS errors or network errors

---

### **Issue 3: Scrolling is laggy/stuttering**

**Fixed in latest commit!** The following optimizations were applied:

1. **Throttled scroll event listeners** using `requestAnimationFrame`
2. **Reduced blur effects** from `blur-3xl` to `blur-2xl`
3. **Added GPU acceleration** with `will-change-transform` and `translateZ(0)`
4. **Reduced opacity** of animated gradients
5. **Hidden grid pattern on mobile** for better performance

**If still experiencing issues:**
- Clear browser cache on mobile
- Try in incognito/private mode
- Restart the frontend server

---

## 🚀 Performance Optimizations Applied

### **1. Scroll Event Optimization**
**Files:** `EnhancedNavbar.tsx`, `ModernNavbar.tsx`

**Before:**
```typescript
window.addEventListener('scroll', handleScroll);
```

**After:**
```typescript
let ticking = false;
const handleScroll = () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      setIsScrolled(window.scrollY > 20);
      ticking = false;
    });
    ticking = true;
  }
};
window.addEventListener('scroll', handleScroll, { passive: true });
```

**Impact:** Reduces scroll jank by throttling updates to 60fps

---

### **2. Homepage Animation Optimization**
**File:** `app/page.tsx`

**Changes:**
- Blur: `blur-3xl` → `blur-2xl` (less GPU intensive)
- Opacity: Reduced by ~30% (less compositing work)
- GPU Acceleration: Added `will-change-transform` and `translateZ(0)`
- Grid Pattern: Hidden on mobile (`hidden md:block`)

**Impact:** Smoother scrolling, reduced CPU/GPU usage

---

## 📊 Testing Checklist

### **Mobile Performance:**
- [ ] Scrolling is smooth (60fps)
- [ ] No stuttering or lag
- [ ] Animations are fluid
- [ ] Page loads in < 3 seconds

### **Mobile Login:**
- [ ] Can access login page
- [ ] Can enter credentials
- [ ] Login button works
- [ ] Redirects to dashboard after login
- [ ] Session persists on refresh

### **Mobile Navigation:**
- [ ] Hamburger menu opens/closes smoothly
- [ ] Backdrop appears correctly
- [ ] Touch targets are 44px minimum
- [ ] All links work

### **Mobile Forms:**
- [ ] Numeric keyboard appears for account numbers
- [ ] Email keyboard appears for email fields
- [ ] Phone keyboard appears for phone fields
- [ ] No auto-zoom on input focus
- [ ] Submit buttons are accessible

---

## 🔐 Security Note

**Important:** The local IP address (`192.168.x.x`) is only accessible on your local network. This is safe for development and testing.

**For production:**
- Use HTTPS with a valid SSL certificate
- Use a proper domain name
- Never expose development servers to the public internet

---

## 📝 Quick Reference

### **Common IP Address Ranges:**
- `192.168.x.x` - Most home routers
- `10.0.x.x` - Some corporate networks
- `172.16.x.x` to `172.31.x.x` - Some networks

### **Default Ports:**
- Frontend: `3000`
- Backend: `8000`
- Backend API Docs: `8000/docs`

### **Environment Variables:**
```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://YOUR_IP:8000

# Backend (.env)
FRONTEND_URL=http://YOUR_IP:3000
```

---

## 🎯 Expected Results

After following this guide:
- ✅ Mobile device can access frontend at `http://YOUR_IP:3000`
- ✅ Mobile device can login successfully
- ✅ Scrolling is smooth with no stuttering
- ✅ All features work the same as on desktop
- ✅ Touch targets are comfortable to tap
- ✅ Forms are easy to use on mobile

---

**Last Updated:** 2025-10-24  
**Related Fixes:** Performance optimization commit, CORS configuration

