# Community AI Studio & Marketing System  Implementation Checklist

Owner: Engineering
Status: Draft for approval (no development started)

Legend: [ ] TODO  [/ ] In Progress  [x] Done  [-] N/A  (ET = Estimated Time)

---

## Phase 0  Planning & Guardrails
- [x] P0.1 Approve Product Spec (this repo: COMMUNITY_AI_STUDIO_SPEC.md)  (ET: 0.5d)
- [x] P0.2 Create Implementation Checklist (this file)  (ET: 0.5d)
- [x] P0.3 Document Providers, API Keys, .env (ENV_KEYS doc)  (ET: 0.5d)
- [ ] P0.4 Provider Selection Confirmed (image + enhancer + storage)  (ET: 0.5d)  (Depends: P0.3)
- [ ] P0.5 Analytics/KPI Event Plan Approved  (ET: 0.5d)  (Depends: P0.1)
- [ ] P0.6 Content Policy & Moderation Process Approved  (ET: 0.5d)

## Phase 1  MVP Studio
### Backend (Monolith, provider adapters)
- [ ] P1.BE.1 Credit Ledger Extensions (reasons, idempotency)  (ET: 1d)
- [ ] P1.BE.2 Templates & Categories Models + CRUD  (ET: 1.5d)
- [ ] P1.BE.3 Prompt Enhancer Adapter (LLM provider)  (ET: 1d)
- [ ] P1.BE.4 Image Generation Adapter (provider-agnostic)  (ET: 2d)
- [ ] P1.BE.5 Storage Integration (signed upload/serve)  (ET: 1d)
- [ ] P1.BE.6 Generate Endpoint (async job + status)  (ET: 1.5d)
- [ ] P1.BE.7 My Creations Endpoints (list/delete)  (ET: 0.5d)
- [ ] P1.BE.8 Credit Packs Purchase/Verify (gateway)  (ET: 1.5d)
- [ ] P1.BE.9 Analytics Events (generation, purchase, first-gen)  (ET: 0.5d)
- [ ] P1.BE.10 Rate Limiting & Error Handling  (ET: 0.5d)

### Frontend (Next.js)
- [ ] P1.FE.1 Creative Studio UI (prompt + enhanced preview)  (ET: 2d)
- [ ] P1.FE.2 Tier Selection (Standard/Premium) + Credit Confirm  (ET: 1d)
- [ ] P1.FE.3 Generation Progress + Result + Retry  (ET: 1d)
- [ ] P1.FE.4 My Creations Gallery  (ET: 1d)
- [ ] P1.FE.5 Credit Packs Purchase Flow  (ET: 1.5d)
- [ ] P1.FE.6 Wallet Bar: credits used/remaining (monthly)  (ET: 0.5d)
- [ ] P1.FE.7 Analytics Events (client)  (ET: 0.5d)
- [ ] P1.FE.8 Empty/Loading/Error States + A11y  (ET: 0.5d)

### QA & Docs
- [ ] P1.QA.1 Unit/Integration Tests (BE)  (ET: 1.5d)
- [ ] P1.QA.2 UI E2E Happy Paths  (ET: 1d)
- [ ] P1.QA.3 Performance & Error Budgets  (ET: 0.5d)
- [ ] P1.DOC.1 Update README + Admin Runbook  (ET: 0.5d)

## Phase 2  Community + Remix + Rewards
### Backend
- [ ] P2.BE.1 Community Posts (publish/list)  (ET: 1.5d)  (Depends: P1)
- [ ] P2.BE.2 Likes API + Anti-spam Rules  (ET: 0.5d)
- [ ] P2.BE.3 Remix Open + Prefill API  (ET: 0.5d)
- [ ] P2.BE.4 Reward Accounting + Caps Enforcement  (ET: 1d)
- [ ] P2.BE.5 Trending Algorithm (score, recency)  (ET: 1d)
- [ ] P2.BE.6 Reporting + Moderation Queue  (ET: 1d)

### Frontend
- [ ] P2.FE.1 Community Feed UI (filters, infinite scroll)  (ET: 1.5d)
- [ ] P2.FE.2 Post Card (likes, reuse count, remix CTA)  (ET: 0.5d)
- [ ] P2.FE.3 Publish Flow (metadata, visibility)  (ET: 0.5d)
- [ ] P2.FE.4 Remix Flow (opens Studio prefilled)  (ET: 0.5d)
- [ ] P2.FE.5 Reporting & Moderation UI (admin)  (ET: 1d)

### QA & Docs
- [ ] P2.QA.1 Security/Abuse Tests (velocity, distinct-user checks)  (ET: 1d)
- [ ] P2.QA.2 Reward Distribution Integrity Tests  (ET: 0.5d)
- [ ] P2.DOC.1 Community Guidelines & Takedown Process  (ET: 0.5d)

## Phase 3  Growth + Referral + Pricing Experiments
### Backend/Frontend
- [ ] P3.1 Referral Credits Integration (+5/+10, milestone +50)  (ET: 1d)  (Depends: P1)
- [ ] P3.2 Watermark Strategy (free default, paid removal/custom)  (ET: 0.5d)
- [ ] P3.3 A/B Testing: credit price bands & premium tiers  (ET: 1d)
- [ ] P3.4 Share Flows (social) + Tracking  (ET: 0.5d)

### QA & Docs
- [ ] P3.QA.1 Conversion Funnel & Retention Dashboards  (ET: 1d)
- [ ] P3.DOC.1 Marketing Ops Playbook  (ET: 0.5d)

## Phase 4  Admin + Analytics + Provider Management
- [ ] P4.1 Admin UI: templates/categories/pricing/rewards  (ET: 2d)
- [ ] P4.2 Provider Keys Management (encrypt, rotate, audit)  (ET: 1.5d)
- [ ] P4.3 Analytics Dashboards (usage, margin, rewards distr.)  (ET: 1.5d)
- [ ] P4.4 Anti-fraud Tuning & Alerts  (ET: 1d)

## Phase 5  Expansion
- [ ] P5.1 Marketplace/Licensing Pilot (small)  (ET: 3d)
- [ ] P5.2 Premium Template Packs  (ET: 1d)
- [ ] P5.3 Animated Posters/Video (investigate)  (ET: 2d)

---

## Dependencies Summary
- Phase 1 is prerequisite for Phases 23
- Provider selection (P0.4) blocks adapters in P1
- Credit packs rely on gateway config already in platform
- Moderation requires policy approval (P0.6)

## Risk Register (Mitigations referenced to spec)
- Abuse/fraud  velocity caps, distinct-user checks, anomaly review
- Cost drift  provider swap via adapters; price bands via flags
- Storage bloat  lifecycle policies, size caps
- Content/IP  watermark defaults, policy + takedown

## Sign-off Checklist
- [ ] Product approves spec and KPIs
- [ ] Security approves policy and rate limits
- [ ] Data approves retention and residency plan
- [ ] Eng approves milestones and estimates
- [ ] Ops approves monitoring and on-call

