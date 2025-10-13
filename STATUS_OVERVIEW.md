# Affiliate Learning Platform – Comprehensive Codebase Status (2025-10-12)

This document summarizes the current state of the codebase (frontend + backend), documentation, and runtime readiness based on a full repository scan and spot‑checks of key files.

## 1) Repository & Tech Stack

- Root scripts: start-backend.ps1, start-frontend.ps1, restart.ps1
- Apps:
  - backend/ (FastAPI + SQLAlchemy + Pydantic v2)
  - frontend/ (Next.js 15 + React 19 + Tailwind + TypeScript)
- Tests: tests/ (frontend GUI flow), backend/test_*.py; Playwright-related helpers present
- Documentation: Many .md files in root; extensive archive in completed/

Stack summary:
- Backend: FastAPI 0.115.6, SQLAlchemy 2.0.36, Pydantic 2.10.x, uvicorn, passlib[bcrypt], python-jose, slowapi (rate limiting), alembic
- Frontend: Next.js 15.5.x, React 19, Typescript 5.9.x, TailwindCSS 3.x, Zustand 5, Axios, Framer Motion
- DB: PostgreSQL (Neon serverless)
- 3rd‑party: Razorpay, Cloudinary, SMTP (Hostinger)

## 2) Architecture Overview

### Backend (FastAPI)
- Entry: backend/app/main.py – sets up CORS, rate limiting, Sentry, and includes routers
- Routers included (prefix → module):
  - /api/auth → app/api/auth.py
  - /api/email-verification → app/api/email_verification.py
  - /api/packages → app/api/packages.py
  - /api/payments → app/api/payments.py
  - /api/referrals → app/api/referrals.py
  - /api/commissions → app/api/commissions.py
  - /api/courses → app/api/courses.py
  - /api/course-purchases → app/api/course_purchases.py
  - /api/modules → app/api/modules.py
  - /api/certificates → app/api/certificates.py
  - /api/notifications → app/api/notifications.py
  - /api/wallet → app/api/wallet.py
  - /api/video-progress → app/api/video_progress.py
  - /api/payouts → app/api/payouts.py
  - /api/bank-details → app/api/bank_details.py
  - /api/profile → app/api/profile.py
  - /api/admin → app/api/admin.py
- Models & Schemas present for all major domains (users, packages, payments, referrals, commissions, payouts, courses, modules, topics, certificates, wallet, video_progress, bank_details, profiles)
- Notable confirmation: Certificates API endpoints are implemented (my‑certificates, verify/{number}, by id)

### Frontend (Next.js App Router)
- Core routes (app/):
  - auth: login, register, forgot-password, reset-password, verify-email
  - user: dashboard, profile (+ bank-details), packages, courses, earnings, payouts, referrals (+ tree), notifications, wallet, leaderboard, payments
  - certificates: /certificates (listing), /certificates/[number] (viewer)
  - admin: /admin (dashboard), /admin/users, /admin/payouts, /admin/courses, /admin/modules
- Observations:
  - earnings/page_old.tsx suggests legacy leftover to be cleaned up
  - No explicit topic‑level player route found yet (e.g., /courses/[id]/topics/[topicId]) – likely pending

## 3) Dependencies (high level)
- backend/requirements.txt (pinned): fastapi, uvicorn[standard], sqlalchemy, psycopg2-binary, alembic, python-jose[cryptography], passlib[bcrypt], bcrypt, pydantic, pydantic-settings, email-validator, python-dotenv, razorpay, cloudinary, aiosmtplib, slowapi, sentry-sdk
- frontend/package.json: next 15.5.x, react 19.1.x, zustand 5.x, axios 1.12.x, framer-motion 12.x, recharts 3.x, tailwindcss 3.x, typescript 5.9.x

## 4) Feature Status (code‑verified)
- Present in code (backend + frontend routing/components):
  - Auth (JWT), email verification, packages, payments (Razorpay), referrals (2‑level), commissions, courses, modules/topics (backend), certificates (backend + pages), notifications, wallet, payouts, bank details, profile, admin, video progress, course purchases
- Likely pending/incomplete (based on code paths):
  - Topic video player page in frontend (multi‑source player components mentioned in docs not yet present)
  - Some UI cleanup (legacy: earnings/page_old.tsx)

## 5) Documentation Review – Current vs. Outdated
- README.md: Accurate, comprehensive overview and setup; includes endpoints and remaining frontend tasks
- PENDING_FEATURES.md: Declares core platform 100% complete; lists optional enhancements only
- PROJECT_STATUS_REPORT.md (2025‑10‑04): Marks Certificates API as missing – OUTDATED (endpoints exist now)
- DOCUMENTATION_AUDIT.md: Suggests moving many completed docs into completed/ and keeping root clean – sensible
- BACKEND_FRONTEND_TESTING_REPORT.md (2025‑01‑15): Confirms end‑to‑end runs succeeded previously on another environment (backend 8000, frontend 3001)

Conclusion: Some docs conflict. Source of truth should be README.md + this STATUS_OVERVIEW.md. PROJECT_STATUS_REPORT.md appears stale regarding certificates.

## 6) Issues & Technical Debt Identified
1) Backend server not starting on this machine
   - start-backend.ps1 fails: embedded venv points to a Python path that does not exist on this system (non‑portable venv). uvicorn shim references "C:\Users\cluad ai\...\Python312\python.exe".
   - Fix: Recreate a local venv and reinstall dependencies from requirements.txt (needs permission).

2) Secrets exposure in docs
   - README shows concrete values for DATABASE_URL, SMTP, Cloudinary, Razorpay (likely test creds). Recommend: scrub/replace with placeholders and ensure .env is git‑ignored.

3) Docs sprawl and duplication
   - Many “FINAL_*” and summary docs in root duplicate those already in completed/. Create a single docs index and (optionally) move stragglers to completed/ to declutter.

4) Frontend pending route(s)
   - Topic video player page and multi‑source players are not found; add route and components to align with backend topics API.

5) Minor cleanup
   - Remove/rename legacy page_old files, ensure consistent routing, dedupe admin modules page vs new unified flow (if applicable).

## 7) Runtime Validation (today)
- Frontend: ✅ Up at http://localhost:3000 (HTTP 200)
- Backend: ❌ Not running due to broken venv (see Issue #1)
- Frontend↔Backend communication: Not testable today because backend failed to launch

## 8) Recommended Next Actions
- A. Backend enablement (requires permission to install packages)
  1. cd backend
  2. python -m venv venv (Python 3.12.x)
  3. .\venv\Scripts\activate
  4. pip install -r requirements.txt
  5. uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

- B. Frontend verification
  - With backend up, validate login, dashboard, courses, certificates pages, payouts, referrals. Add GUI tests as needed.

- C. Documentation organization
  - Create a docs index (see DOCUMENTATION_INDEX.md) and optionally move completed root docs into completed/ (non‑destructive). Keep README.md, PENDING_FEATURES.md, STATUS_OVERVIEW.md at root.

- D. Security hygiene
  - Replace concrete secrets in README with placeholders; ensure .env files are not committed.

- E. Complete topic video player
  - Implement /courses/[id]/topics/[topicId] and player components (YouTube/Vimeo/Cloudinary/External) + progress tracking.

## 9) References (key files inspected)
- Backend: app/main.py; api/certificates.py; requirements.txt
- Frontend: app/certificates/page.tsx; app/certificates/[number]/page.tsx; app/verify-email/page.tsx; package.json
- Docs: README.md, PENDING_FEATURES.md, PROJECT_STATUS_REPORT.md, SETUP_GUIDE.md, BACKEND_FRONTEND_TESTING_REPORT.md, DOCUMENTATION_AUDIT.md

—
Maintained by: Augment Agent (2025‑10‑12)

