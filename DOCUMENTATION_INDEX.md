# Documentation Index

A curated entry point to the project documentation. Use this index to navigate the most relevant documents. Historical/archived docs live in `completed/`.

## Active (keep in root)
- README.md  Main project overview, stack, setup, endpoints
- SETUP_GUIDE.md  Environment & run instructions
- QUICK_START_GUIDE.md  Short runbook for local start
- PENDING_FEATURES.md  Optional enhancements backlog
- STATUS_OVERVIEW.md  Current codebase status (this audit)
- DOCUMENTATION_AUDIT.md  Prior audit and file categorization

## Testing & Reports
- BACKEND_FRONTEND_TESTING_REPORT.md  Recent end-to-end run results
- COMPREHENSIVE_TESTING_GUIDE.md  Testing guidance
- SYSTEM_TESTING_REPORT_JAN15.md  System testing session report
- TEST_REPORT_PRIORITY_3.md  Prior test outcomes

## Planning & Status (root)
- PROJECT_STATUS_REPORT.md  High-level feature matrix (note: some items outdated)
- IMPLEMENTATION_PROGRESS.md  In-flight notes
- NEXT_STEPS.md  Immediate tasks & test checklist

## Completed/Archive (see folder)
Open `completed/` for finalized summaries and historical documents, including for example:
- completed/ADMIN_FRONTEND_COMPLETE.md
- completed/ADMIN_IMPLEMENTATION_COMPLETE.md
- completed/CRITICAL_FIXES_COMPLETE.md
- completed/FEATURE_AUDIT_COMPLETE.md
- completed/FINAL_IMPLEMENTATION_SUMMARY.md
- completed/FINAL_STATUS_REPORT.md
- completed/REFERRAL_SYSTEM_DOCUMENTATION.md
- completed/RENDER_DEPLOYMENT_GUIDE.md
- completed/SETUP_GUIDE.md
- completed/TESTING_INSTRUCTIONS.md
- completed/UI_UX_FIXES_COMPLETE.md

## Suggested Organization (non-destructive)
- Keep only these at root for day-to-day use: README.md, STATUS_OVERVIEW.md, PENDING_FEATURES.md, SETUP_GUIDE.md, DOCUMENTATION_INDEX.md, BACKEND_FRONTEND_TESTING_REPORT.md
- Everything else can remain where it is for now, or be moved into `completed/` (if not already present) to reduce root clutter. Do not delete anything.

## Notes on Conflicts/Outdated Docs
- Certificates API: PROJECT_STATUS_REPORT.md marks it missing; code review confirms endpoints exist in `backend/app/api/certificates.py`. Treat README.md + STATUS_OVERVIEW.md as the current source of truth.
- Some docs contain concrete credentials for test services within code blocks; avoid reusing those in production. Replace with placeholders in future revisions.

 Maintained by Augment Agent (2025-10-12)

