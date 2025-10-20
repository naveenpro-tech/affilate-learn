# 🎯 **Next.js + Supabase Architecture Evaluation**
## **Affiliate Video Learning Platform - Complete Implementation Guide**

---

## **EXECUTIVE SUMMARY**

**Verdict:** ✅ **YES - Feasible with Important Caveats**

You CAN build this platform from scratch with Next.js + Supabase, but you will encounter **significant challenges** in 3 critical areas:
1. **Complex MLM Commission Logic** - Requires careful architecture
2. **Video Security & Streaming** - Supabase Storage has limitations
3. **Payment Webhook Reliability** - Needs robust error handling

**Recommendation:** **Next.js + Supabase with Cloudinary for videos** (Hybrid approach)

---

# 📊 **PART 1: FEATURE-BY-FEATURE FEASIBILITY ANALYSIS**

## **1. Authentication System**

### ✅ **Feasible: YES**

**Implementation:**
- **Supabase Auth** for user authentication (email/password, OAuth)
- **Custom user metadata** for referral codes and admin roles
- **Row Level Security (RLS)** for data access control

**Technical Approach:**
```typescript
// Supabase Auth with custom claims
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: {
      referral_code: generateReferralCode(),
      referred_by: referrerUserId,
      is_admin: false
    }
  }
})
```

**Problems:**
- ⚠️ **Custom JWT claims** - Supabase doesn't support custom JWT claims out of the box
  - **Solution:** Use database triggers to sync user metadata to a `profiles` table
- ⚠️ **Admin role management** - Need to implement custom middleware
  - **Solution:** Check `is_admin` flag in database before allowing admin actions

**Severity:** Low - Easily solvable

---

## **2. 2-Level MLM Referral System**

### ⚠️ **Feasible: YES (with significant complexity)**

**Implementation Options:**

### **Option A: Database Functions (Recommended)**
```sql
-- PostgreSQL function for commission calculation
CREATE OR REPLACE FUNCTION calculate_commissions(
  referee_id UUID,
  package_id INTEGER
)
RETURNS void AS $$
DECLARE
  level1_referrer UUID;
  level2_referrer UUID;
  package_price DECIMAL;
BEGIN
  -- Get package price
  SELECT final_price INTO package_price FROM packages WHERE id = package_id;
  
  -- Get level 1 referrer
  SELECT referred_by INTO level1_referrer FROM profiles WHERE id = referee_id;
  
  IF level1_referrer IS NOT NULL THEN
    -- Calculate level 1 commission (10%)
    INSERT INTO commissions (user_id, referral_id, amount, commission_type, status)
    VALUES (level1_referrer, referee_id, package_price * 0.10, 'level1', 'pending');
    
    -- Get level 2 referrer
    SELECT referred_by INTO level2_referrer FROM profiles WHERE id = level1_referrer;
    
    IF level2_referrer IS NOT NULL THEN
      -- Calculate level 2 commission (5%)
      INSERT INTO commissions (user_id, referral_id, amount, commission_type, status)
      VALUES (level2_referrer, referee_id, package_price * 0.05, 'level2', 'pending');
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **Option B: Edge Functions**
```typescript
// Supabase Edge Function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { refereeId, packageId } = await req.json()
  const supabase = createClient(...)
  
  // Complex commission calculation logic
  // ...
  
  return new Response(JSON.stringify({ success: true }))
})
```

### **Option C: Next.js API Routes**
```typescript
// app/api/commissions/calculate/route.ts
export async function POST(request: Request) {
  const { refereeId, packageId } = await request.json()
  
  // Commission calculation logic
  // ...
  
  return Response.json({ success: true })
}
```

**Problems:**

1. **🔴 CRITICAL: Recursive Queries Performance**
   - **Problem:** Finding all referrals in a chain requires recursive queries
   - **Impact:** Slow performance with deep referral chains (1000+ users)
   - **Solution:** Use PostgreSQL recursive CTEs with proper indexing
   ```sql
   WITH RECURSIVE referral_chain AS (
     SELECT id, referred_by, 1 as level FROM profiles WHERE id = $1
     UNION ALL
     SELECT p.id, p.referred_by, rc.level + 1
     FROM profiles p
     JOIN referral_chain rc ON p.referred_by = rc.id
     WHERE rc.level < 2
   )
   SELECT * FROM referral_chain;
   ```

2. **🔴 CRITICAL: Transaction Atomicity**
   - **Problem:** Commission calculations must be atomic (all or nothing)
   - **Impact:** Partial commission credits if process fails mid-way
   - **Solution:** Use PostgreSQL transactions in database functions
   ```sql
   BEGIN;
     -- All commission calculations
   COMMIT;
   ```

3. **🟡 HIGH: Race Conditions**
   - **Problem:** Multiple simultaneous payments could cause duplicate commissions
   - **Impact:** Financial losses or incorrect commission amounts
   - **Solution:** Use database locks and idempotency keys
   ```sql
   SELECT * FROM payments WHERE id = $1 FOR UPDATE;
   ```

4. **🟡 HIGH: Complex Matrix Logic (3x3x2)**
   - **Problem:** Implementing complex MLM matrix rules in SQL is difficult
   - **Impact:** Hard to maintain and debug
   - **Solution:** Use database functions with clear documentation

**Severity:** High - Requires expert PostgreSQL knowledge

**Recommendation:** Use **Database Functions** for commission calculations, not Edge Functions or API Routes, because:
- ✅ Better performance (no network latency)
- ✅ Atomic transactions
- ✅ Direct database access
- ✅ Easier to test and debug

---

## **3. Payment Integration (Razorpay)**

### ✅ **Feasible: YES**

**Implementation:**
```typescript
// app/api/payments/create-order/route.ts
import Razorpay from 'razorpay'

export async function POST(request: Request) {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!
  })
  
  const order = await razorpay.orders.create({
    amount: 295000, // ₹2,950 in paise
    currency: 'INR',
    receipt: `order_${Date.now()}`
  })
  
  return Response.json(order)
}
```

**Webhook Handling:**
```typescript
// app/api/webhooks/razorpay/route.ts
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('x-razorpay-signature')
  
  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')
  
  if (signature !== expectedSignature) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }
  
  const event = JSON.parse(body)
  
  // Process payment
  const supabase = createClient(...)
  await supabase.from('payments').update({
    status: 'success',
    razorpay_payment_id: event.payload.payment.entity.id
  }).eq('razorpay_order_id', event.payload.payment.entity.order_id)
  
  // Trigger commission calculation
  await supabase.rpc('calculate_commissions', {
    referee_id: userId,
    package_id: packageId
  })
  
  return Response.json({ success: true })
}
```

**Problems:**

1. **🔴 CRITICAL: Webhook Reliability**
   - **Problem:** Webhooks can fail due to network issues, timeouts, or server downtime
   - **Impact:** Payments succeed but commissions not calculated
   - **Solution:** Implement webhook retry logic + manual reconciliation
   ```typescript
   // Store webhook events in database for retry
   await supabase.from('webhook_events').insert({
     event_type: 'payment.success',
     payload: event,
     status: 'pending',
     retry_count: 0
   })
   
   // Background job to retry failed webhooks
   ```

2. **🟡 HIGH: Idempotency**
   - **Problem:** Razorpay may send duplicate webhooks
   - **Impact:** Duplicate commission calculations
   - **Solution:** Use idempotency keys
   ```typescript
   const { data, error } = await supabase
     .from('payments')
     .update({ status: 'success' })
     .eq('razorpay_order_id', orderId)
     .eq('status', 'created') // Only update if still pending
   ```

3. **🟡 HIGH: Webhook Timeout**
   - **Problem:** Next.js API routes have 10-second timeout on Vercel (60s on Pro)
   - **Impact:** Complex commission calculations may timeout
   - **Solution:** Use background jobs or queue system
   ```typescript
   // Option 1: Trigger Edge Function (no timeout)
   await fetch('https://your-project.supabase.co/functions/v1/process-payment', {
     method: 'POST',
     body: JSON.stringify({ orderId })
   })

   // Option 2: Use Vercel Queue (paid feature)
   await queue.enqueue('process-payment', { orderId })
   ```

4. **🟢 MEDIUM: Webhook Security**
   - **Problem:** Webhooks are public endpoints
   - **Impact:** Malicious actors could send fake webhooks
   - **Solution:** Always verify signature (already implemented above)

**Severity:** High - Requires robust error handling

**Recommendation:**
- ✅ Use Next.js API Routes for webhook handling
- ✅ Implement webhook event logging in database
- ✅ Create admin panel to manually retry failed webhooks
- ✅ Use Edge Functions for long-running commission calculations

---

## **4. Video Course Management**

### ⚠️ **Feasible: PARTIALLY (Supabase Storage has limitations)**

### **A. Video Storage Options**

#### **Option 1: Supabase Storage (Not Recommended)**

**Pros:**
- ✅ Integrated with Supabase
- ✅ Simple to use
- ✅ Automatic CDN (Cloudflare)

**Cons:**
- ❌ **No adaptive bitrate streaming** (HLS/DASH)
- ❌ **No video transformations** (resize, compress, watermark)
- ❌ **Limited security** (signed URLs expire, but no DRM)
- ❌ **No video analytics** (views, watch time, etc.)
- ❌ **Storage costs** (expensive for large videos)

**Implementation:**
```typescript
// Upload video to Supabase Storage
const { data, error } = await supabase.storage
  .from('videos')
  .upload(`courses/${courseId}/${videoId}.mp4`, file)

// Generate signed URL (expires in 1 hour)
const { data: signedUrl } = await supabase.storage
  .from('videos')
  .createSignedUrl(`courses/${courseId}/${videoId}.mp4`, 3600)
```

**Problems:**
1. **🔴 CRITICAL: No Adaptive Streaming**
   - **Problem:** Users on slow connections will buffer constantly
   - **Impact:** Poor user experience, high bounce rate
   - **Solution:** Use Cloudinary or AWS MediaConvert

2. **🔴 CRITICAL: Download Prevention**
   - **Problem:** Signed URLs can be shared or downloaded
   - **Impact:** Video piracy
   - **Solution:** Use Cloudinary with token authentication or AWS CloudFront signed cookies

3. **🟡 HIGH: Storage Costs**
   - **Problem:** Supabase charges $0.021/GB/month for storage
   - **Impact:** 100GB of videos = $2.10/month (seems cheap, but bandwidth is expensive)
   - **Bandwidth:** $0.09/GB (100GB bandwidth = $9/month)
   - **Total:** 100GB storage + 500GB bandwidth = $47.10/month
   - **Cloudinary:** 100GB storage + 500GB bandwidth = $99/month (but includes transformations, adaptive streaming, analytics)

#### **Option 2: Cloudinary (Recommended)**

**Pros:**
- ✅ Adaptive bitrate streaming (HLS/DASH)
- ✅ Video transformations (resize, compress, watermark)
- ✅ Secure streaming (signed URLs, token auth)
- ✅ Video analytics
- ✅ Global CDN
- ✅ DRM support (paid add-on)

**Cons:**
- ❌ Additional service to manage
- ❌ Higher cost at scale

**Implementation:**
```typescript
// Upload to Cloudinary
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const result = await cloudinary.uploader.upload(filePath, {
  resource_type: 'video',
  folder: `courses/${courseId}`,
  type: 'authenticated' // Requires authentication
})

// Generate secure URL
const secureUrl = cloudinary.url(result.public_id, {
  resource_type: 'video',
  type: 'authenticated',
  sign_url: true,
  secure: true
})
```

**Recommendation:** **Use Cloudinary for videos**, not Supabase Storage

---

### **B. Course/Module/Lesson Structure**

**Database Schema:**
```sql
-- Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  package_id INTEGER REFERENCES packages(id),
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modules table
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT, -- Cloudinary URL
  video_public_id TEXT, -- Cloudinary public ID
  duration INTEGER, -- seconds
  is_published BOOLEAN DEFAULT FALSE,
  is_free_preview BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User progress table
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0,
  last_watched_position INTEGER DEFAULT 0, -- seconds
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Course enrollments table
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ,
  progress_percentage INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);
```

**RLS Policies:**
```sql
-- Users can only view courses for their package tier
CREATE POLICY "Users can view courses for their package"
ON courses FOR SELECT
USING (
  package_id <= (
    SELECT package_id FROM user_packages
    WHERE user_id = auth.uid()
    AND status = 'active'
    ORDER BY purchase_date DESC
    LIMIT 1
  )
);

-- Users can only view their own progress
CREATE POLICY "Users can view own progress"
ON user_progress FOR SELECT
USING (user_id = auth.uid());

-- Users can update their own progress
CREATE POLICY "Users can update own progress"
ON user_progress FOR UPDATE
USING (user_id = auth.uid());
```

**Problems:**

1. **🟡 HIGH: RLS Policy Complexity**
   - **Problem:** Complex package tier logic in RLS policies
   - **Impact:** Slow queries, potential security bypasses
   - **Solution:** Use database functions for complex logic
   ```sql
   CREATE FUNCTION user_has_access_to_course(course_id UUID)
   RETURNS BOOLEAN AS $$
     SELECT EXISTS (
       SELECT 1 FROM courses c
       JOIN user_packages up ON up.package_id >= c.package_id
       WHERE c.id = course_id
       AND up.user_id = auth.uid()
       AND up.status = 'active'
     )
   $$ LANGUAGE SQL SECURITY DEFINER;

   CREATE POLICY "Users can view accessible courses"
   ON courses FOR SELECT
   USING (user_has_access_to_course(id));
   ```

2. **🟢 MEDIUM: Progress Tracking Performance**
   - **Problem:** Frequent updates to user_progress table
   - **Impact:** Database write load
   - **Solution:** Batch updates every 10 seconds instead of real-time

**Severity:** Medium - Manageable with proper architecture

---

## **5. Payout System**

### ✅ **Feasible: YES**

**Implementation:**
```typescript
// Database function for payout calculation
CREATE OR REPLACE FUNCTION calculate_pending_payout(user_id_param UUID)
RETURNS DECIMAL AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM commissions
  WHERE user_id = user_id_param
  AND status = 'pending'
$$ LANGUAGE SQL SECURITY DEFINER;

// Next.js API Route for payout request
export async function POST(request: Request) {
  const { userId } = await request.json()
  const supabase = createClient(...)

  // Get pending amount
  const { data: pendingAmount } = await supabase
    .rpc('calculate_pending_payout', { user_id_param: userId })

  if (pendingAmount < 500) {
    return Response.json({ error: 'Minimum payout is ₹500' }, { status: 400 })
  }

  // Create payout request
  const { data, error } = await supabase.from('payouts').insert({
    user_id: userId,
    amount: pendingAmount,
    status: 'pending'
  })

  return Response.json(data)
}
```

**Problems:**

1. **🟢 MEDIUM: Bank Details Validation**
   - **Problem:** Need to validate bank account numbers, IFSC codes
   - **Impact:** Failed payouts
   - **Solution:** Use third-party API for validation (e.g., Razorpay Fund Account Validation)

2. **🟢 LOW: Payout Scheduling**
   - **Problem:** Need to run weekly payout calculations
   - **Impact:** Manual work
   - **Solution:** Use Vercel Cron Jobs or Supabase pg_cron
   ```sql
   -- Supabase pg_cron
   SELECT cron.schedule(
     'weekly-payout-calculation',
     '0 0 * * 1', -- Every Monday at midnight
     $$
       UPDATE payouts SET status = 'processing'
       WHERE status = 'pending'
       AND created_at < NOW() - INTERVAL '7 days'
     $$
   );
   ```

**Severity:** Low - Straightforward implementation

---

## **6. Admin Panel**

### ✅ **Feasible: YES**

**Implementation:**
- Use Next.js Server Components for admin pages
- Implement middleware to check admin role
- Use Supabase RLS policies for admin access

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = createMiddlewareClient({ req: request })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*'
}
```

**Problems:**

1. **🟢 MEDIUM: Dashboard Analytics Performance**
   - **Problem:** Complex aggregation queries for dashboard stats
   - **Impact:** Slow page load
   - **Solution:** Use materialized views or caching
   ```sql
   -- Materialized view for dashboard stats
   CREATE MATERIALIZED VIEW admin_dashboard_stats AS
   SELECT
     (SELECT COUNT(*) FROM profiles) as total_users,
     (SELECT COUNT(*) FROM payments WHERE status = 'success') as total_payments,
     (SELECT SUM(amount) FROM payments WHERE status = 'success') as total_revenue,
     (SELECT COUNT(*) FROM payouts WHERE status = 'pending') as pending_payouts
   WITH DATA;

   -- Refresh every hour
   SELECT cron.schedule(
     'refresh-dashboard-stats',
     '0 * * * *',
     'REFRESH MATERIALIZED VIEW admin_dashboard_stats'
   );
   ```

**Severity:** Low - Standard admin panel implementation

---

# 📊 **PART 2: SPECIFIC TECHNICAL CONCERNS**

## **1. Complex Business Logic (MLM Commissions)**

**Answer:** Use **Database Functions** (PostgreSQL stored procedures)

**Why:**
- ✅ **Performance:** No network latency
- ✅ **Atomicity:** Transactions ensure all-or-nothing
- ✅ **Security:** SECURITY DEFINER ensures proper permissions
- ✅ **Maintainability:** SQL is easier to test than Edge Functions

**When to use Edge Functions:**
- ✅ Long-running tasks (>10 seconds)
- ✅ External API calls
- ✅ Complex business logic that doesn't fit in SQL

**When to use Next.js API Routes:**
- ✅ Simple CRUD operations
- ✅ Webhook handling
- ✅ Third-party integrations

---

## **2. Video Storage & Security**

**Answer:** **Use Cloudinary, NOT Supabase Storage**

**Comparison:**

| Feature | Supabase Storage | Cloudinary |
|---------|------------------|------------|
| Adaptive Streaming | ❌ No | ✅ Yes (HLS/DASH) |
| Video Transformations | ❌ No | ✅ Yes |
| Secure Streaming | ⚠️ Basic (signed URLs) | ✅ Advanced (token auth, DRM) |
| Download Prevention | ❌ Weak | ✅ Strong |
| CDN | ✅ Cloudflare | ✅ Global CDN |
| Analytics | ❌ No | ✅ Yes |
| Cost (100GB + 500GB BW) | ~$47/month | ~$99/month |

**Recommendation:** Pay the extra $52/month for Cloudinary - it's worth it for video security and streaming quality.

---

## **3. Payment Webhooks**

**Problems & Solutions:**

1. **Webhook Failures:**
   - **Solution:** Log all webhook events in database
   - **Solution:** Implement retry mechanism
   - **Solution:** Create admin panel to manually retry

2. **Timeout Issues:**
   - **Solution:** Use Edge Functions for long-running tasks
   - **Solution:** Return 200 OK immediately, process asynchronously

3. **Duplicate Webhooks:**
   - **Solution:** Use idempotency keys
   - **Solution:** Check payment status before processing

**Implementation:**
```typescript
// app/api/webhooks/razorpay/route.ts
export async function POST(request: Request) {
  // 1. Verify signature
  // 2. Log event in database
  // 3. Return 200 OK immediately
  // 4. Trigger Edge Function for processing

  const event = await request.json()

  await supabase.from('webhook_events').insert({
    event_type: event.event,
    payload: event,
    status: 'pending'
  })

  // Trigger Edge Function (no timeout)
  fetch('https://your-project.supabase.co/functions/v1/process-webhook', {
    method: 'POST',
    body: JSON.stringify(event)
  })

  return Response.json({ success: true })
}
```

---

## **4. Database Complexity**

**Can Supabase PostgreSQL handle it?** ✅ **YES**

**Recursive Queries:**
```sql
-- Efficient recursive query with limit
WITH RECURSIVE referral_chain AS (
  SELECT id, referred_by, 1 as level
  FROM profiles
  WHERE id = $1

  UNION ALL

  SELECT p.id, p.referred_by, rc.level + 1
  FROM profiles p
  JOIN referral_chain rc ON p.referred_by = rc.id
  WHERE rc.level < 2 -- Limit to 2 levels
)
SELECT * FROM referral_chain;
```

**Transaction Management:**
```sql
BEGIN;
  -- Update payment status
  UPDATE payments SET status = 'success' WHERE id = $1;

  -- Create user package
  INSERT INTO user_packages (user_id, package_id) VALUES ($2, $3);

  -- Calculate commissions
  SELECT calculate_commissions($2, $3);
COMMIT;
```

**RLS Policies:**
```sql
-- Complex RLS policy with function
CREATE POLICY "Users can view own data"
ON commissions FOR SELECT
USING (user_id = auth.uid());

-- Admin bypass
CREATE POLICY "Admins can view all data"
ON commissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_admin = TRUE
  )
);
```

**Problems:**

1. **🟡 HIGH: RLS Performance**
   - **Problem:** Complex RLS policies slow down queries
   - **Impact:** Slow page loads
   - **Solution:** Use database functions, add indexes, cache results

2. **🟢 MEDIUM: Transaction Deadlocks**
   - **Problem:** Concurrent transactions may deadlock
   - **Impact:** Failed payments
   - **Solution:** Use proper locking order, retry logic

---

## **5. Performance & Scalability**

### **1000+ Simultaneous Payments**

**Problem:** Database connection pool exhaustion

**Solution:**
- ✅ Use Supabase connection pooling (PgBouncer)
- ✅ Implement queue system for payment processing
- ✅ Use Edge Functions for async processing

### **Complex Commission Calculations**

**Problem:** Long-running calculations block database

**Solution:**
- ✅ Use database functions with proper indexing
- ✅ Batch process commissions (every 5 minutes instead of real-time)
- ✅ Use materialized views for aggregations

### **100+ Concurrent Video Streams**

**Problem:** Bandwidth costs, CDN performance

**Solution:**
- ✅ Use Cloudinary CDN (handles millions of requests)
- ✅ Implement video caching
- ✅ Use adaptive bitrate streaming

### **Admin Dashboard Queries**

**Problem:** Complex aggregations slow down dashboard

**Solution:**
- ✅ Use materialized views
- ✅ Cache results in Redis (Upstash)
- ✅ Implement pagination

---

## **6. Security Issues**

### **RLS Policy Bypasses**

**Problem:** Complex RLS policies may have security holes

**Solution:**
- ✅ Test RLS policies thoroughly
- ✅ Use database functions for complex logic
- ✅ Implement additional checks in API routes

### **API Route Security**

**Problem:** API routes are public endpoints

**Solution:**
- ✅ Always verify authentication
- ✅ Implement rate limiting
- ✅ Validate all inputs
- ✅ Use CSRF tokens

### **JWT Token Management**

**Problem:** Tokens can be stolen or leaked

**Solution:**
- ✅ Use httpOnly cookies
- ✅ Implement token refresh
- ✅ Short token expiration (1 hour)
- ✅ Implement logout on all devices

### **Unauthorized Video Access**

**Problem:** Signed URLs can be shared

**Solution:**
- ✅ Use Cloudinary token authentication
- ✅ Short URL expiration (1 hour)
- ✅ Implement watermarking
- ✅ Track video access in database

---

# 🏗️ **PART 3: COMPLETE ARCHITECTURE DOCUMENTATION**

## **1. Complete Tech Stack**

```yaml
Frontend:
  - Next.js 15 (App Router)
  - React 19
  - TypeScript
  - Tailwind CSS
  - Shadcn UI
  - Framer Motion

Backend:
  - Supabase (PostgreSQL, Auth, Storage, Edge Functions)
  - Next.js API Routes (webhooks, integrations)

Database:
  - Supabase PostgreSQL
  - Row Level Security (RLS)
  - Database Functions (PL/pgSQL)
  - pg_cron (scheduled jobs)

Video:
  - Cloudinary (video storage, streaming, transformations)

Payments:
  - Razorpay (payment gateway)

Email:
  - Resend (transactional emails)

Monitoring:
  - Sentry (error tracking)
  - Vercel Analytics

Deployment:
  - Vercel (Next.js hosting)
  - Supabase (database, auth, storage)

Development:
  - Supabase CLI (local development)
  - Prisma (type-safe database client)
  - Zod (validation)
```

---

## **2. Database Schema Design**

### **Complete Schema:**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by UUID REFERENCES profiles(id),
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Packages table
CREATE TABLE packages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  gst_amount DECIMAL(10,2) NOT NULL,
  final_price DECIMAL(10,2) NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User packages table
CREATE TABLE user_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  package_id INTEGER REFERENCES packages(id),
  payment_id UUID REFERENCES payments(id),
  status TEXT DEFAULT 'active', -- active, expired, cancelled
  purchase_date TIMESTAMPTZ DEFAULT NOW(),
  expiry_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  package_id INTEGER REFERENCES packages(id),
  razorpay_order_id TEXT UNIQUE NOT NULL,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'created', -- created, success, failed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referrals table
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  level INTEGER NOT NULL, -- 1 or 2
  package_id INTEGER REFERENCES packages(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commissions table
CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referral_id UUID REFERENCES referrals(id),
  amount DECIMAL(10,2) NOT NULL,
  commission_type TEXT NOT NULL, -- level1, level2
  status TEXT DEFAULT 'pending', -- pending, paid, cancelled
  payout_id UUID REFERENCES payouts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- Payouts table
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  transaction_id TEXT,
  payment_method TEXT,
  bank_account_number TEXT,
  bank_ifsc TEXT,
  upi_id TEXT,
  notes TEXT,
  payout_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Bank details table
CREATE TABLE bank_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  account_holder_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  ifsc_code TEXT NOT NULL,
  upi_id TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  package_id INTEGER REFERENCES packages(id),
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modules table
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  video_public_id TEXT,
  duration INTEGER,
  is_published BOOLEAN DEFAULT FALSE,
  is_free_preview BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User progress table
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0,
  last_watched_position INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Course enrollments table
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ,
  progress_percentage INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

-- Webhook events table (for reliability)
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, processed, failed
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX idx_profiles_referred_by ON profiles(referred_by);
CREATE INDEX idx_user_packages_user_id ON user_packages(user_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referee_id ON referrals(referee_id);
CREATE INDEX idx_commissions_user_id ON commissions(user_id);
CREATE INDEX idx_commissions_status ON commissions(status);
CREATE INDEX idx_payouts_user_id ON payouts(user_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_course_enrollments_user_id ON course_enrollments(user_id);
```

### **RLS Policies:**

```sql
-- Profiles: Users can view own profile, admins can view all
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Payments: Users can view own payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
ON payments FOR SELECT
USING (user_id = auth.uid());

-- Commissions: Users can view own commissions
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own commissions"
ON commissions FOR SELECT
USING (user_id = auth.uid());

-- Payouts: Users can view own payouts
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payouts"
ON payouts FOR SELECT
USING (user_id = auth.uid());

-- Courses: Users can view courses for their package tier
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view accessible courses"
ON courses FOR SELECT
USING (
  package_id <= (
    SELECT package_id FROM user_packages
    WHERE user_id = auth.uid()
    AND status = 'active'
    ORDER BY purchase_date DESC
    LIMIT 1
  )
);

-- User progress: Users can view/update own progress
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
ON user_progress FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update own progress"
ON user_progress FOR UPDATE
USING (user_id = auth.uid());
```

### **Database Functions:**

```sql
-- Function to calculate commissions
CREATE OR REPLACE FUNCTION calculate_commissions(
  referee_id_param UUID,
  package_id_param INTEGER
)
RETURNS void AS $$
DECLARE
  level1_referrer UUID;
  level2_referrer UUID;
  package_price DECIMAL;
BEGIN
  -- Get package price
  SELECT final_price INTO package_price
  FROM packages
  WHERE id = package_id_param;

  -- Get level 1 referrer
  SELECT referred_by INTO level1_referrer
  FROM profiles
  WHERE id = referee_id_param;

  IF level1_referrer IS NOT NULL THEN
    -- Create level 1 referral record
    INSERT INTO referrals (referrer_id, referee_id, level, package_id)
    VALUES (level1_referrer, referee_id_param, 1, package_id_param);

    -- Calculate level 1 commission (10%)
    INSERT INTO commissions (user_id, referral_id, amount, commission_type, status)
    VALUES (
      level1_referrer,
      (SELECT id FROM referrals WHERE referrer_id = level1_referrer AND referee_id = referee_id_param ORDER BY created_at DESC LIMIT 1),
      package_price * 0.10,
      'level1',
      'pending'
    );

    -- Get level 2 referrer
    SELECT referred_by INTO level2_referrer
    FROM profiles
    WHERE id = level1_referrer;

    IF level2_referrer IS NOT NULL THEN
      -- Create level 2 referral record
      INSERT INTO referrals (referrer_id, referee_id, level, package_id)
      VALUES (level2_referrer, referee_id_param, 2, package_id_param);

      -- Calculate level 2 commission (5%)
      INSERT INTO commissions (user_id, referral_id, amount, commission_type, status)
      VALUES (
        level2_referrer,
        (SELECT id FROM referrals WHERE referrer_id = level2_referrer AND referee_id = referee_id_param ORDER BY created_at DESC LIMIT 1),
        package_price * 0.05,
        'level2',
        'pending'
      );
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate pending payout amount
CREATE OR REPLACE FUNCTION calculate_pending_payout(user_id_param UUID)
RETURNS DECIMAL AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM commissions
  WHERE user_id = user_id_param
  AND status = 'pending'
$$ LANGUAGE SQL SECURITY DEFINER;

-- Trigger function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, referral_code, referred_by)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)),
    (NEW.raw_user_meta_data->>'referred_by')::UUID
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## **3. Application Architecture**

### **Folder Structure:**

```
affiliate-learning-platform/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── courses/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── referrals/
│   │   │   └── page.tsx
│   │   ├── earnings/
│   │   │   └── page.tsx
│   │   ├── payouts/
│   │   │   └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   ├── admin/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── users/
│   │   │   └── page.tsx
│   │   ├── courses/
│   │   │   └── page.tsx
│   │   └── payouts/
│   │       └── page.tsx
│   ├── api/
│   │   ├── payments/
│   │   │   ├── create-order/
│   │   │   │   └── route.ts
│   │   │   └── verify/
│   │   │       └── route.ts
│   │   ├── webhooks/
│   │   │   └── razorpay/
│   │   │       └── route.ts
│   │   └── videos/
│   │       └── secure-url/
│   │           └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── courses/
│   │   ├── CourseCard.tsx
│   │   ├── VideoPlayer.tsx
│   │   └── ProgressTracker.tsx
│   ├── admin/
│   │   ├── UserTable.tsx
│   │   └── PayoutApproval.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── ...
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── razorpay.ts
│   ├── cloudinary.ts
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useCourses.ts
│   └── useCommissions.ts
├── types/
│   ├── database.types.ts
│   └── index.ts
├── middleware.ts
├── supabase/
│   ├── migrations/
│   │   └── 20250101000000_initial_schema.sql
│   └── functions/
│       └── process-webhook/
│           └── index.ts
└── package.json
```

### **Server Components vs. Client Components:**

**Server Components (Default):**
- Dashboard pages
- Course listing pages
- Admin pages
- Any page that fetches data

**Client Components:**
- Forms (login, register, course creation)
- Interactive UI (video player, progress tracker)
- Components with state or effects

### **Authentication Flow:**

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']
}
```

---

## **4. Feature Implementation Guide**

### **A. User Registration with Referral Tracking**

```typescript
// app/(auth)/register/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const referralCode = searchParams.get('ref')

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    // 1. Find referrer by referral code
    let referrerId = null
    if (referralCode) {
      const { data: referrer } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', referralCode)
        .single()

      referrerId = referrer?.id
    }

    // 2. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
          referred_by: referrerId
        }
      }
    })

    if (authError) {
      console.error('Error:', authError)
      return
    }

    // 3. Profile created automatically by database trigger
    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

---

### **B. Payment Flow with Razorpay**

```typescript
// app/api/payments/create-order/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@/lib/supabase/server'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
})

export async function POST(request: NextRequest) {
  const { packageId } = await request.json()
  const supabase = createClient()

  // Get user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get package
  const { data: pkg } = await supabase
    .from('packages')
    .select('*')
    .eq('id', packageId)
    .single()

  if (!pkg) {
    return NextResponse.json({ error: 'Package not found' }, { status: 404 })
  }

  // Create Razorpay order
  const order = await razorpay.orders.create({
    amount: Math.round(pkg.final_price * 100), // Convert to paise
    currency: 'INR',
    receipt: `order_${Date.now()}`,
    notes: {
      user_id: user.id,
      package_id: packageId
    }
  })

  // Store payment record
  await supabase.from('payments').insert({
    user_id: user.id,
    package_id: packageId,
    razorpay_order_id: order.id,
    amount: pkg.final_price,
    status: 'created'
  })

  return NextResponse.json({
    order_id: order.id,
    amount: pkg.final_price,
    currency: 'INR',
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  })
}

// app/api/payments/verify/route.ts
export async function POST(request: NextRequest) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()
  const supabase = createClient()

  // Verify signature
  const crypto = require('crypto')
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Update payment
  const { data: payment } = await supabase
    .from('payments')
    .update({
      razorpay_payment_id,
      razorpay_signature,
      status: 'success'
    })
    .eq('razorpay_order_id', razorpay_order_id)
    .select()
    .single()

  // Create user package
  await supabase.from('user_packages').insert({
    user_id: payment.user_id,
    package_id: payment.package_id,
    payment_id: payment.id,
    status: 'active'
  })

  // Calculate commissions
  await supabase.rpc('calculate_commissions', {
    referee_id_param: payment.user_id,
    package_id_param: payment.package_id
  })

  return NextResponse.json({ success: true })
}
```

---

### **C. Secure Video Streaming**

```typescript
// app/api/videos/secure-url/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function POST(request: NextRequest) {
  const { lessonId } = await request.json()
  const supabase = createClient()

  // Get user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get lesson
  const { data: lesson } = await supabase
    .from('lessons')
    .select('*, course:courses(*)')
    .eq('id', lessonId)
    .single()

  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
  }

  // Check user has access to course
  const { data: userPackage } = await supabase
    .from('user_packages')
    .select('package_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('purchase_date', { ascending: false })
    .limit(1)
    .single()

  if (!userPackage || userPackage.package_id < lesson.course.package_id) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  // Generate signed URL (expires in 1 hour)
  const secureUrl = cloudinary.url(lesson.video_public_id, {
    resource_type: 'video',
    type: 'authenticated',
    sign_url: true,
    secure: true,
    transformation: [
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  })

  return NextResponse.json({ video_url: secureUrl })
}

// components/courses/VideoPlayer.tsx
'use client'

import { useEffect, useRef, useState } from 'react'

export default function VideoPlayer({ lessonId }: { lessonId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  useEffect(() => {
    // Fetch secure URL
    fetch('/api/videos/secure-url', {
      method: 'POST',
      body: JSON.stringify({ lessonId })
    })
      .then(res => res.json())
      .then(data => setVideoUrl(data.video_url))
  }, [lessonId])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Disable right-click
    video.addEventListener('contextmenu', (e) => e.preventDefault())

    // Track progress
    const interval = setInterval(() => {
      if (video.currentTime > 0) {
        const progress = (video.currentTime / video.duration) * 100

        // Update progress in database
        fetch('/api/progress/update', {
          method: 'POST',
          body: JSON.stringify({
            lessonId,
            progress,
            lastWatchedPosition: video.currentTime
          })
        })
      }
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [lessonId])

  if (!videoUrl) return <div>Loading...</div>

  return (
    <video
      ref={videoRef}
      src={videoUrl}
      controls
      controlsList="nodownload"
      disablePictureInPicture
      className="w-full aspect-video"
    />
  )
}
```

---

## **5. Deployment & DevOps**

### **Supabase Project Setup:**

```bash
# 1. Install Supabase CLI
npm install -g supabase

# 2. Login to Supabase
supabase login

# 3. Initialize project
supabase init

# 4. Link to remote project
supabase link --project-ref your-project-ref

# 5. Push database schema
supabase db push

# 6. Deploy Edge Functions
supabase functions deploy process-webhook
```

### **Vercel Deployment:**

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add RAZORPAY_KEY_ID
vercel env add RAZORPAY_KEY_SECRET
vercel env add CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET
```

### **Environment Variables:**

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx

CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

RESEND_API_KEY=re_xxx
```

---

## **6. Cost Analysis**

### **MVP (0-100 users):**

| Service | Plan | Cost |
|---------|------|------|
| Supabase | Free | $0 |
| Vercel | Hobby | $0 |
| Cloudinary | Free | $0 |
| Razorpay | Pay-as-you-go | 2% per transaction |
| Resend | Free | $0 |
| **Total** | | **$0/month** |

**Notes:**
- Supabase Free: 500MB database, 1GB file storage, 2GB bandwidth
- Vercel Hobby: 100GB bandwidth, unlimited sites
- Cloudinary Free: 25GB storage, 25GB bandwidth
- Razorpay: 2% + GST per transaction (no setup/monthly fees)
- Resend Free: 3,000 emails/month

### **Growth (100-1000 users):**

| Service | Plan | Cost |
|---------|------|------|
| Supabase | Pro | $25/month |
| Vercel | Pro | $20/month |
| Cloudinary | Plus | $99/month |
| Razorpay | Pay-as-you-go | 2% per transaction |
| Resend | Pro | $20/month |
| **Total** | | **$164/month** |

**Notes:**
- Supabase Pro: 8GB database, 100GB file storage, 250GB bandwidth
- Vercel Pro: 1TB bandwidth, advanced analytics
- Cloudinary Plus: 100GB storage, 100GB bandwidth, video transformations
- Resend Pro: 50,000 emails/month

### **Scale (1000+ users):**

| Service | Plan | Cost |
|---------|------|------|
| Supabase | Team | $599/month |
| Vercel | Enterprise | Custom pricing (~$500/month) |
| Cloudinary | Advanced | $224/month |
| Razorpay | Pay-as-you-go | 2% per transaction |
| Resend | Business | $85/month |
| **Total** | | **~$1,408/month** |

**Notes:**
- Supabase Team: Dedicated resources, priority support
- Vercel Enterprise: Custom bandwidth, SLA, support
- Cloudinary Advanced: 500GB storage, 500GB bandwidth
- Resend Business: 100,000 emails/month

### **Cost Comparison: Next.js + Supabase vs FastAPI + Neon**

| Phase | Next.js + Supabase | FastAPI + Neon | Difference |
|-------|-------------------|----------------|------------|
| MVP (0-100) | $0/month | $0/month | $0 |
| Growth (100-1000) | $164/month | ~$100/month | +$64 |
| Scale (1000+) | ~$1,408/month | ~$800/month | +$608 |

**Analysis:**
- **MVP:** Both stacks are free to start
- **Growth:** Next.js + Supabase is slightly more expensive due to Cloudinary
- **Scale:** Next.js + Supabase becomes significantly more expensive
- **Trade-off:** You pay more for Supabase's managed services, but save on DevOps time

---

# 🚨 **PART 4: PROBLEMS & CHALLENGES DOCUMENTATION**

## **1. Technical Problems**

### **🔴 CRITICAL Problems**

#### **A. Webhook Reliability**
- **Problem:** Razorpay webhooks can fail due to network issues, timeouts, or server downtime
- **Impact:** Payments succeed but commissions not calculated, leading to financial losses
- **Severity:** CRITICAL
- **Solution:**
  1. Log all webhook events in `webhook_events` table
  2. Implement retry mechanism with exponential backoff
  3. Create admin panel to manually retry failed webhooks
  4. Set up monitoring alerts for failed webhooks
  5. Use Edge Functions for long-running commission calculations

#### **B. Recursive Query Performance**
- **Problem:** Finding all referrals in a chain requires recursive queries that can be slow
- **Impact:** Slow performance with deep referral chains (1000+ users)
- **Severity:** CRITICAL
- **Solution:**
  1. Use PostgreSQL recursive CTEs with LIMIT
  2. Add proper indexes on `referred_by` column
  3. Cache referral chain results
  4. Consider denormalizing referral data for faster queries

#### **C. Transaction Atomicity**
- **Problem:** Commission calculations must be atomic (all or nothing)
- **Impact:** Partial commission credits if process fails mid-way
- **Severity:** CRITICAL
- **Solution:**
  1. Use PostgreSQL transactions in database functions
  2. Implement proper error handling and rollback
  3. Use database locks to prevent race conditions
  4. Test thoroughly with concurrent transactions

#### **D. Video Download Prevention**
- **Problem:** Signed URLs can be shared or downloaded
- **Impact:** Video piracy, loss of revenue
- **Severity:** CRITICAL
- **Solution:**
  1. Use Cloudinary token authentication (not just signed URLs)
  2. Short URL expiration (1 hour)
  3. Implement watermarking with user ID
  4. Track video access in database
  5. Consider DRM for premium content (paid add-on)

### **🟡 HIGH Problems**

#### **A. RLS Policy Complexity**
- **Problem:** Complex package tier logic in RLS policies can slow down queries
- **Impact:** Slow page loads, potential security bypasses
- **Severity:** HIGH
- **Solution:**
  1. Use database functions for complex logic
  2. Add proper indexes
  3. Cache results where possible
  4. Test RLS policies thoroughly
  5. Monitor query performance

#### **B. Race Conditions in Payments**
- **Problem:** Multiple simultaneous payments could cause duplicate commissions
- **Impact:** Financial losses or incorrect commission amounts
- **Severity:** HIGH
- **Solution:**
  1. Use database locks (`SELECT ... FOR UPDATE`)
  2. Implement idempotency keys
  3. Check payment status before processing
  4. Use unique constraints on critical tables

#### **C. Webhook Timeout**
- **Problem:** Next.js API routes have 10-second timeout on Vercel (60s on Pro)
- **Impact:** Complex commission calculations may timeout
- **Severity:** HIGH
- **Solution:**
  1. Return 200 OK immediately
  2. Trigger Edge Function for async processing
  3. Use Vercel Queue (paid feature)
  4. Implement background job system

#### **D. Storage Costs**
- **Problem:** Video storage and bandwidth can be expensive at scale
- **Impact:** High monthly costs
- **Severity:** HIGH
- **Solution:**
  1. Use Cloudinary for better compression
  2. Implement adaptive bitrate streaming
  3. Cache videos on CDN
  4. Monitor bandwidth usage
  5. Consider tiered storage (hot/cold)

### **🟢 MEDIUM Problems**

#### **A. Progress Tracking Performance**
- **Problem:** Frequent updates to user_progress table
- **Impact:** Database write load
- **Severity:** MEDIUM
- **Solution:**
  1. Batch updates every 10 seconds instead of real-time
  2. Use debouncing
  3. Consider using Redis for temporary storage

#### **B. Dashboard Analytics Performance**
- **Problem:** Complex aggregation queries for dashboard stats
- **Impact:** Slow page load
- **Severity:** MEDIUM
- **Solution:**
  1. Use materialized views
  2. Cache results in Redis (Upstash)
  3. Implement pagination
  4. Use pg_cron to refresh stats periodically

#### **C. Bank Details Validation**
- **Problem:** Need to validate bank account numbers, IFSC codes
- **Impact:** Failed payouts
- **Severity:** MEDIUM
- **Solution:**
  1. Use Razorpay Fund Account Validation API
  2. Implement client-side validation
  3. Store validation status in database

#### **D. Transaction Deadlocks**
- **Problem:** Concurrent transactions may deadlock
- **Impact:** Failed payments
- **Severity:** MEDIUM
- **Solution:**
  1. Use proper locking order
  2. Implement retry logic with exponential backoff
  3. Monitor deadlock frequency

---

## **2. Operational Problems**

### **🟡 HIGH Problems**

#### **A. Database Migration Management**
- **Problem:** Managing schema changes in production
- **Impact:** Downtime, data loss
- **Severity:** HIGH
- **Solution:**
  1. Use Supabase CLI for migrations
  2. Test migrations in staging first
  3. Implement rollback strategy
  4. Use zero-downtime migration techniques

#### **B. Monitoring & Debugging**
- **Problem:** Difficult to debug issues in production
- **Impact:** Slow incident response
- **Severity:** HIGH
- **Solution:**
  1. Use Sentry for error tracking
  2. Implement structured logging
  3. Use Vercel Analytics
  4. Set up alerts for critical errors

### **🟢 MEDIUM Problems**

#### **A. Backup & Recovery**
- **Problem:** Need regular backups of database
- **Impact:** Data loss in case of disaster
- **Severity:** MEDIUM
- **Solution:**
  1. Supabase Pro includes daily backups
  2. Implement point-in-time recovery
  3. Test restore process regularly

#### **B. Payout Scheduling**
- **Problem:** Need to run weekly payout calculations
- **Impact:** Manual work
- **Severity:** MEDIUM
- **Solution:**
  1. Use Vercel Cron Jobs
  2. Use Supabase pg_cron
  3. Implement monitoring for cron jobs

---

## **3. Business Problems**

### **🟡 HIGH Problems**

#### **A. Cost Overruns**
- **Problem:** Costs can increase rapidly with scale
- **Impact:** Reduced profitability
- **Severity:** HIGH
- **Solution:**
  1. Monitor usage closely
  2. Implement cost alerts
  3. Optimize queries and bandwidth
  4. Consider reserved capacity for predictable costs

#### **B. Vendor Lock-in**
- **Problem:** Heavily dependent on Supabase and Vercel
- **Impact:** Difficult to migrate to other platforms
- **Severity:** HIGH
- **Solution:**
  1. Use standard PostgreSQL features where possible
  2. Avoid Supabase-specific features
  3. Keep business logic in application code
  4. Document all dependencies

### **🟢 MEDIUM Problems**

#### **A. Scalability Limitations**
- **Problem:** Supabase Free/Pro tiers have limits
- **Impact:** Need to upgrade frequently
- **Severity:** MEDIUM
- **Solution:**
  1. Plan for growth
  2. Monitor usage metrics
  3. Upgrade proactively
  4. Consider Team plan for production

#### **B. Feature Limitations**
- **Problem:** Some features require paid add-ons
- **Impact:** Additional costs
- **Severity:** MEDIUM
- **Solution:**
  1. Evaluate feature requirements upfront
  2. Budget for paid features
  3. Consider alternatives where possible

---

# 🎯 **FINAL RECOMMENDATION**

## **Verdict: YES - Build with Next.js + Supabase (with Cloudinary)**

### **Why Next.js + Supabase?**

✅ **Pros:**
1. **Faster Development:** Built-in auth, database, storage
2. **Better DX:** TypeScript, type-safe queries, auto-generated types
3. **Easier Deployment:** One-click deploy to Vercel
4. **Better Scalability:** Managed infrastructure, auto-scaling
5. **Lower DevOps Overhead:** No server management
6. **Modern Stack:** Latest Next.js 15, React 19, Server Components
7. **Free to Start:** $0 for MVP phase

❌ **Cons:**
1. **Higher Cost at Scale:** ~$1,408/month vs ~$800/month for FastAPI
2. **Vendor Lock-in:** Dependent on Supabase and Vercel
3. **Learning Curve:** Need to learn Supabase, RLS policies, Edge Functions
4. **Complex MLM Logic:** Requires expert PostgreSQL knowledge
5. **Video Security:** Need Cloudinary (additional service)

### **When to Choose Next.js + Supabase:**

✅ **Choose this stack if:**
- You want to build and launch quickly (MVP in 2-4 weeks)
- You prefer managed services over self-hosting
- You want to focus on features, not infrastructure
- You're comfortable with vendor lock-in
- You have budget for scaling costs
- You want modern DX and tooling

❌ **Don't choose this stack if:**
- You need maximum cost efficiency at scale
- You want full control over infrastructure
- You have complex custom requirements
- You're concerned about vendor lock-in
- You have existing FastAPI expertise

### **Recommended Approach:**

**Option 1: Full Next.js + Supabase (Recommended for New Projects)**
- Use Next.js 15 + Supabase + Cloudinary
- Implement all features from scratch
- Estimated timeline: 4-6 weeks
- Estimated cost: $0 (MVP) → $164 (Growth) → $1,408 (Scale)

**Option 2: Hybrid Approach (Recommended for Existing Projects)**
- Keep FastAPI backend for complex business logic
- Use Next.js frontend for better UX
- Use Supabase for auth and real-time features
- Estimated timeline: 2-3 weeks (migration)
- Estimated cost: $50 (MVP) → $150 (Growth) → $1,000 (Scale)

**Option 3: Stick with FastAPI + Neon (Recommended for Cost-Sensitive Projects)**
- Continue with current stack
- Focus on fixing existing bugs
- Optimize performance and costs
- Estimated timeline: 1-2 weeks (fixes)
- Estimated cost: $0 (MVP) → $100 (Growth) → $800 (Scale)

### **My Final Recommendation:**

**For your specific use case (Affiliate Video Learning Platform with MLM), I recommend:**

🎯 **Option 1: Full Next.js + Supabase + Cloudinary**

**Reasons:**
1. **You're starting from scratch** - No migration overhead
2. **Complex MLM logic** - PostgreSQL database functions are perfect for this
3. **Video security** - Cloudinary provides best-in-class video streaming
4. **Fast time-to-market** - Launch MVP in 4-6 weeks
5. **Modern stack** - Better DX, easier to hire developers
6. **Scalability** - Managed infrastructure handles growth automatically

**Implementation Plan:**
1. **Week 1-2:** Set up Supabase project, database schema, RLS policies
2. **Week 3-4:** Implement auth, payments, MLM commission logic
3. **Week 5-6:** Build course management, video player, admin panel
4. **Week 7-8:** Testing, bug fixes, deployment

**Total Cost Estimate:**
- **Development:** 6-8 weeks
- **MVP (0-100 users):** $0/month
- **Growth (100-1000 users):** $164/month
- **Scale (1000+ users):** $1,408/month

**ROI Analysis:**
- If each user pays ₹5,000 average (across all tiers)
- 100 users = ₹5,00,000 revenue ($6,000) - $164 costs = **$5,836 profit/month**
- 1000 users = ₹50,00,000 revenue ($60,000) - $1,408 costs = **$58,592 profit/month**

**Conclusion:** The higher infrastructure costs are negligible compared to revenue potential. The faster time-to-market and better DX make Next.js + Supabase the clear winner for this project.

---

## **Next Steps:**

1. ✅ Create Supabase project
2. ✅ Set up Next.js 15 project with TypeScript
3. ✅ Implement database schema and RLS policies
4. ✅ Build authentication flow
5. ✅ Implement payment integration
6. ✅ Build MLM commission logic
7. ✅ Integrate Cloudinary for videos
8. ✅ Build admin panel
9. ✅ Deploy to Vercel
10. ✅ Test and launch MVP

**Good luck with your project! 🚀**

