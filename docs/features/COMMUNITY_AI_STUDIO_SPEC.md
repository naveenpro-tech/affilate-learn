# Community AI Studio & Marketing System — Product & Integration Spec (Single Source of Truth)

Date: 2025-10-19
Owner: Product/CTO
Status: Draft for approval (Planning only; no code changes yet)

---

## 1) Purpose and Scope
This document defines the end-to-end requirements for adding a Community AI Studio & Marketing System to the existing Affiliate Learning Platform. It focuses on business logic, user journeys, credit economy, APIs, schema changes, integration points, KPIs, and compliance. It is the single source of truth for implementation and QA.

In-scope:
- AI Image Studio with prompt enhancement and generation tiers
- Community feed, publish, remix, trending, and moderation
- Credit economy (pricing, bundles, rewards, referral incentives)
- Admin controls (templates, categories, pricing, moderation, provider keys)
- Analytics, anti-abuse, and compliance guardrails

Out of scope (v1):
- Video generation/animated posters
- Prompt marketplace/licensing (Phase 4+)

---

## 2) Roles and Personas
- Visitor: Unauthenticated, can view public info only (optional gated view)
- User: Authenticated learner/creator; can generate, publish, remix
- Creator: Any user whose prompts/images are reused (earns rewards)
- Admin: Manages templates, categories, moderation, pricing, provider keys

---

## 3) User Journeys (Happy Paths)
A. First Generation (Activation)
1) User logs in → navigates to “Creative Studio”
2) Selects a template or types a prompt → Prompt Enhancer shows improved version
3) Chooses Standard (1 credit) or Premium (2–4 credits) generation → confirms
4) Credits deducted → image generated → saved to “My Creations”
5) User downloads or publishes to Community (optional watermark)

B. Remix Flow (Network Effects)
1) User opens Community feed → clicks “Remix this prompt” on a card
2) Studio opens with prefilled enhanced prompt → user tweaks → generates
3) Original creator earns 0.5 credit per reuse (caps apply)

C. Buy Credits → Generate
1) User opens Wallet → buys credit pack (₹5 per credit; bundle discounts)
2) Generates images using credits → sees usage and remaining balance

D. Referral Incentive
1) New user signs up with referral link → gets +5 credits on signup
2) After first generation, referrer receives +10 credits
3) Milestone: +50 credits every 10 qualified signups (qualified = first purchase OR 7-day retention with ≥3 generations)

E. Admin Lifecycle
1) Admin adds/edits templates and categories; configures pricing and rewards
2) Admin moderates reported content; manages model API keys with audit logs
3) Admin reviews analytics dashboards (usage, spend, margin, rewards distribution)

---

## 4) Feature Requirements
4.1 AI Studio
- Prompt input + Enhanced Preview
- Generation tiers:
  - Standard: 1 credit, default resolution
  - Premium: 2–4 credits, higher resolution/effects/options
- Branding overlay/watermark options:
  - Free users: default watermark on public images
  - Paid users: watermark removal or custom branding
- My Creations gallery: list, detail, download, delete, re-open in Studio
- Credit deduction must be atomic and idempotent
- Error handling with clear states; retry-safe operations

4.2 Community & Remix
- Publish flow: image + prompt + metadata (category/tags, visibility)
- Feed: infinite scroll, filters by category, sort by Trending/Latest
- Card: image thumbnail, title, author, likes, reuse count, “Remix” CTA
- Remix: opens Studio prefilled; generates counts as reuse when billable
- Likes: per-user toggle; anti-spam limits
- Trending: combine likes, reuse, recency (e.g., weighted score)
- Reporting/Moderation: report reasons, admin queue, actions (hide, delete)

4.3 Credit Economy
- Price: ₹5 per credit (A/B test bands: ₹4/₹5/₹6) with bundles (5–15% discount)
- Spend per generation: Standard 1 credit; Premium 2–4 credits
- Rewards for reuse: 0.5 credit per reuse
  - Caps: 20 credits per asset; 10 credits/day per creator from reuse
  - Count only distinct users’ billable generations (no preview spam)
- Daily/seasonal bonuses: streak rewards (optional in later phase)

4.4 Referral Incentives
- Referee: +5 credits on signup via referral link
- Referrer: +10 credits after referee’s first generation
- Milestone: +50 credits per 10 qualified signups (definition above)
- Fraud checks: velocity limits, device/IP heuristics, anomaly review

4.5 Admin Controls
- Templates/Categories CRUD (5–10 per starter category)
- Pricing knobs (cost per tier), rewards, caps, bonus campaigns
- Moderation queue with actions and audit logs
- Model provider settings: API keys/endpoints; provider selection switch
- Analytics dashboards (see KPIs) with export

4.6 Non-Functional
- Availability: ≥99.5% for core APIs
- Latency targets: generate request acknowledged in <1s; image ready per provider SLA (async acceptable)
- Observability: structured logs, trace IDs, rate-limit metrics, error budgets

---

## 5) API Specifications (Monolith-first; provider adapters)
Notes: JSON; JWT required unless noted; use 2xx/4xx/5xx semantics; idempotency keys for credit spend.

5.1 Studio / Prompt Enhancement
- POST /api/studio/enhance-prompt
  - Body: { prompt: string }
  - 200: { enhancedPrompt: string, suggestions?: string[] }

5.2 Studio / Generate Image
- POST /api/studio/generate
  - Body: { prompt: string, tier: "standard"|"premium2"|"premium4", templateId?: string, watermark?: boolean }
  - 202: { jobId: string, creditDebited: number }
- GET /api/studio/generate/{jobId}
  - 200: { status: "queued"|"running"|"succeeded"|"failed", imageUrl?: string, error?: string }

5.3 My Creations
- GET /api/studio/my-creations?cursor=...
  - 200: { items: [...], nextCursor?: string }
- DELETE /api/studio/my-creations/{imageId}
  - 204

5.4 Community
- POST /api/community/publish
  - Body: { imageId: string, title: string, categoryId: string, tags?: string[] , visibility: "public"|"private"}
  - 201: { postId: string }
- GET /api/community/feed?sort=trending|latest&categoryId=...&cursor=...
  - 200: { items: [...], nextCursor?: string }
- POST /api/community/{postId}/like
  - 200: { liked: boolean, likes: number }
- POST /api/community/{postId}/report
  - Body: { reason: string }
  - 202

5.5 Remix & Rewards
- POST /api/community/{postId}/remix/open
  - 200: { templatePrompt: string, enhancedPrompt: string, sourcePostId: string }
- POST /api/community/{postId}/remix/record
  - Body: { generatedImageId: string }
  - 200: { rewarded: boolean, rewardCredits?: number, creatorTotalForAsset?: number }

5.6 Credits & Wallet
- GET /api/credits/balance
  - 200: { credits: number, monthlyUsed: number, monthlyRemaining: number }
- POST /api/credits/purchase
  - Body: { packId: string | quantity: number }
  - 201: { orderId: string, gateway: string, amount: number }
- POST /api/credits/purchase/verify
  - Body: { orderId: string, signature: string }
  - 200: { creditsAdded: number }

5.7 Admin
- GET/POST /api/admin/templates, /api/admin/categories
- GET/POST /api/admin/moderation (list, act)
- GET/POST /api/admin/config (pricing/rewards/caps, feature flags)
- GET/POST /api/admin/providers (set API keys/endpoints; rotate keys)
- GET /api/admin/analytics (usage, margin, rewards distribution)

---

## 6) Data Model and Schema Changes (Conceptual)
New tables (or models) — names indicative:
1) image_templates
- id (pk), title, category_id, prompt_text, is_active, created_by, created_at

2) image_categories
- id (pk), name, display_order, is_active

3) generated_images
- id (pk), user_id (fk), prompt_id (nullable), prompt_text, tier, image_url, width, height, provider, job_id, status, published_post_id (nullable), created_at

4) community_posts
- id (pk), image_id (fk), user_id (fk), title, category_id, tags (json), likes_count, reuse_count, visibility, is_hidden, created_at, updated_at

5) post_likes
- id (pk), post_id (fk), user_id (fk), created_at (unique: post_id+user_id)

6) post_reports
- id (pk), post_id (fk), user_id (fk), reason, status (open/closed), acted_by (admin), created_at, updated_at

7) prompt_reuse_events
- id (pk), source_post_id (fk), remixer_user_id (fk), remixed_image_id (fk), rewarded (bool), reward_credits, created_at (unique: source_post_id+remixer_user_id+remixed_image_id)

8) credit_ledger (if not already present)
- id (pk), user_id (fk), delta, reason (generation|reward|purchase|referral|admin), ref_id, idempotency_key, created_at, notes

9) referral_events (if not already present)
- id (pk), referrer_user_id, referee_user_id, type (signup|first_generation|milestone), credits_awarded, created_at

10) admin_provider_keys
- id (pk), provider_name, key_alias, encrypted_value, created_at, rotated_at, updated_by

Indexes: feed sort (created_at desc), trending (composite), foreign keys, unique constraints as noted.

---

## 7) Integration Points with Existing Platform
- Auth/JWT: reuse existing sessions and roles
- Wallet/Payments: extend to sell credit packs; map purchases to credit_ledger entries
- Referrals: connect referral_events to existing referral tracking
- Notifications: new events (like, reuse reward, moderation actions)
- Admin: extend current admin UI/API; reuse RBAC
- Analytics: integrate with existing telemetry stack; define events now

---

## 8) KPIs and Success Metrics (60-day targets)
- Activation: ≥25% new users generate within 48h
- Engagement: ≥3 generations/user/week; reuse rate ≥10%
- Monetization: ≥5% paid conversion; ARPPU uplift vs baseline; LTV/CAC ≥ 3.0
- Creator economy: ≥30% of active users earn credits; healthy distribution (track Gini)
- Reliability: error rate <1%, P95 generate-ack <1s

---

## 9) Security, Abuse Prevention, Compliance
- DPDP 2023 aligned; India data residency as required
- Content policy: brand-safe; clear ToS and takedown process; watermark defaults for public images
- Abuse controls: device/IP heuristics, velocity caps, distinct-user checks, manual review for anomalies
- Rate limiting on costly endpoints; idempotency for purchases and credit spends
- Secrets management: env-based; rotated via admin with audit logs
- Logging: structured logs, request IDs, PII minimization, retention policy

---

## 10) Rollout Plan and Phases
- Phase 1: MVP Studio — Credits, Templates, Enhance, Generate, My Creations, Credit Packs
- Phase 2: Community + Remix + Rewards — Feed, Publish, Remix, Rewards, Moderation, Trending
- Phase 3: Growth + Referral — Referral bonuses, watermark strategies, A/B pricing, share flows
- Phase 4: Admin + Analytics — Full controls, dashboards, provider key management, anti-fraud tuning
- Phase 5: Expansion — Marketplace/licensing, premium packs, video/animated posters

---

## 11) Acceptance Criteria (per phase)
- Functional stories pass; analytics events tracked; caps/limits enforced; admin controls functional; security tests pass; docs updated

---

## 12) Open Decisions (to confirm with stakeholder)
- Provider selection for image generation and prompt enhancement
- Exact bundle sizes/discounts; premium tier multipliers
- Public feed visibility for unauthenticated users
- Initial categories (5 starter verticals) and number of seed templates

---

## 13) Appendices
A. Event Tracking (indicative)
- user_signed_up, first_generation_done, credits_purchased, image_generated, image_published, remix_opened, remix_generated, reward_credited, referral_milestone_awarded

B. Error Codes (indicative)
- insufficient_credits, provider_unavailable, content_policy_violation, idempotency_conflict, rate_limited, moderation_required

