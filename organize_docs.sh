#!/bin/bash

# Documentation Organization Script
# Moves scattered documentation files into organized docs/ directory

echo "📚 Organizing project documentation..."

# Create docs directory structure
mkdir -p docs/{api,setup,guides,testing,deployment,completed,features,audit}

echo "✅ Created docs directory structure"

# Move API documentation
mv -f API_TESTING_GUIDE.md docs/api/ 2>/dev/null || true
mv -f CORS_FIX_GUIDE.md docs/api/ 2>/dev/null || true

# Move setup and deployment guides
mv -f SETUP_GUIDE.md docs/setup/ 2>/dev/null || true
mv -f DEPLOYMENT_GUIDE.md docs/deployment/ 2>/dev/null || true
mv -f DEPLOYMENT_SUCCESS.md docs/deployment/ 2>/dev/null || true
mv -f DEPLOYMENT_STATUS.md docs/deployment/ 2>/dev/null || true
mv -f DEPLOYMENT_COMPLETE_SUMMARY.md docs/deployment/ 2>/dev/null || true
mv -f DEPLOYMENT_FIXES_APPLIED.md docs/deployment/ 2>/dev/null || true
mv -f FINAL_DEPLOYMENT_SUMMARY.md docs/deployment/ 2>/dev/null || true
mv -f PRODUCTION_DEPLOYMENT_PLAN.md docs/deployment/ 2>/dev/null || true
mv -f PRODUCTION_READINESS_CHECKLIST.md docs/deployment/ 2>/dev/null || true
mv -f PRODUCTION_READINESS_ASSESSMENT.md docs/deployment/ 2>/dev/null || true
mv -f README_DEPLOYMENT.md docs/deployment/ 2>/dev/null || true
mv -f VERCEL_ENV_SETUP.md docs/deployment/ 2>/dev/null || true

# Move testing documentation
mv -f TESTING_SESSION_COMPLETE.md docs/testing/ 2>/dev/null || true
mv -f TESTING_COMPLETE_SUMMARY.md docs/testing/ 2>/dev/null || true
mv -f TEST_LOGIN_RESULTS.md docs/testing/ 2>/dev/null || true
mv -f SYSTEM_TESTING_REPORT_JAN15.md docs/testing/ 2>/dev/null || true
mv -f FINAL_TESTING_SUMMARY.md docs/testing/ 2>/dev/null || true
mv -f REGISTRATION_LOGIN_TESTING_COMPLETE.md docs/testing/ 2>/dev/null || true
mv -f TESTING_REPORT_2025-10-19.md docs/testing/ 2>/dev/null || true
mv -f PAYMENT_TESTING_COMPLETE_REPORT.md docs/testing/ 2>/dev/null || true
mv -f PHASE_1_TESTING_GUIDE.md docs/testing/ 2>/dev/null || true
mv -f END_TO_END_TESTING_PROGRESS.md docs/testing/ 2>/dev/null || true
mv -f COMPREHENSIVE_TESTING_GUIDE.md docs/testing/ 2>/dev/null || true
mv -f FINAL_END_TO_END_TESTING_REPORT.md docs/testing/ 2>/dev/null || true
mv -f COMPLETE_GUI_TESTING_CHECKLIST.md docs/testing/ 2>/dev/null || true
mv -f BACKEND_FRONTEND_TESTING_REPORT.md docs/testing/ 2>/dev/null || true
mv -f COMPLETE_TESTING_FINAL_SUMMARY.md docs/testing/ 2>/dev/null || true
mv -f TEST_REPORT_PRIORITY_3.md docs/testing/ 2>/dev/null || true
mv -f QUICK_START_TESTING_GUIDE.md docs/testing/ 2>/dev/null || true
mv -f DEBUGGING_SESSION_COMPLETE_JAN15_2025.md docs/testing/ 2>/dev/null || true
mv -f END_TO_END_TESTING_LOG.md docs/testing/ 2>/dev/null || true
mv -f COMPREHENSIVE_TESTING_SUMMARY.md docs/testing/ 2>/dev/null || true
mv -f GUI_BUILD_FIX_AND_TESTING_REPORT.md docs/testing/ 2>/dev/null || true
mv -f FINAL_GUI_TESTING_SUMMARY.md docs/testing/ 2>/dev/null || true

# Move feature documentation
mv -f COMMUNITY_AI_STUDIO_SPEC.md docs/features/ 2>/dev/null || true
mv -f COMMUNITY_AI_STUDIO_ENV_KEYS.md docs/features/ 2>/dev/null || true
mv -f COMMUNITY_AI_STUDIO_CHECKLIST.md docs/features/ 2>/dev/null || true
mv -f COMPLETE_COURSE_SYSTEM_GUIDE.md docs/features/ 2>/dev/null || true
mv -f COURSE_MANAGEMENT_COMPLETE_SUMMARY.md docs/features/ 2>/dev/null || true
mv -f COURSE_PURCHASE_FIX_SUMMARY.md docs/features/ 2>/dev/null || true
mv -f COURSE_SYSTEM_FIXES_SUMMARY.md docs/features/ 2>/dev/null || true
mv -f HYBRID_COURSE_MODEL_IMPLEMENTATION.md docs/features/ 2>/dev/null || true
mv -f UNIFIED_COURSE_WORKFLOW.md docs/features/ 2>/dev/null || true
mv -f EMAIL_VERIFICATION_IMPLEMENTATION.md docs/features/ 2>/dev/null || true
mv -f WORKFLOW_FIX_SUMMARY.md docs/features/ 2>/dev/null || true
mv -f PENDING_FEATURES.md docs/features/ 2>/dev/null || true

# Move audit reports
mv -f DOCUMENTATION_AUDIT.md docs/audit/ 2>/dev/null || true
mv -f CODEBASE_AUDIT_REPORT.md docs/audit/ 2>/dev/null || true
mv -f COMPREHENSIVE_CODEBASE_AUDIT_2025.md docs/audit/ 2>/dev/null || true
mv -f AUDIT_REPORT_JAN15_2025.md docs/audit/ 2>/dev/null || true
mv -f UI_AUDIT_AND_MISSING_FEATURES.md docs/audit/ 2>/dev/null || true
mv -f AUDIT_EXECUTIVE_SUMMARY.md docs/audit/ 2>/dev/null || true
mv -f FEATURE_AUDIT_COMPLETE.md docs/audit/ 2>/dev/null || true
mv -f AUDIT_FIXES_COMPLETE.md docs/audit/ 2>/dev/null || true

# Move UI/UX documentation
mv -f UI_UX_TRANSFORMATION_REPORT.md docs/guides/ 2>/dev/null || true
mv -f DARK_THEME_TRANSFORMATION_SUMMARY.md docs/guides/ 2>/dev/null || true
mv -f UI_TRANSFORMATION_PROGRESS.md docs/guides/ 2>/dev/null || true
mv -f UI_UX_IMPROVEMENTS_PROGRESS.md docs/guides/ 2>/dev/null || true
mv -f UI_UX_PROGRESS.md docs/guides/ 2>/dev/null || true
mv -f UI_UX_ENHANCEMENT_PLAN.md docs/guides/ 2>/dev/null || true
mv -f UI_UX_IMPLEMENTATION_SUMMARY.md docs/guides/ 2>/dev/null || true
mv -f COMPREHENSIVE_UI_UX_SUMMARY.md docs/guides/ 2>/dev/null || true

# Move fix summaries
mv -f THREE_CRITICAL_FIXES_SUMMARY.md docs/guides/ 2>/dev/null || true
mv -f LOGIN_FIX_COMPLETE.md docs/guides/ 2>/dev/null || true
mv -f CRITICAL_ISSUES_RESOLUTION_REPORT.md docs/guides/ 2>/dev/null || true
mv -f CRITICAL_FIXES_APPLIED.md docs/guides/ 2>/dev/null || true
mv -f ALL_ISSUES_FIXED_SUMMARY.md docs/guides/ 2>/dev/null || true
mv -f CRITICAL_FIXES_SUMMARY.md docs/guides/ 2>/dev/null || true
mv -f CRITICAL_FIXES_COMPLETED.md docs/guides/ 2>/dev/null || true
mv -f DUPLICATE_NAVBAR_FIX.md docs/guides/ 2>/dev/null || true
mv -f CHUNKLOADERROR_FIX_COMPLETE.md docs/guides/ 2>/dev/null || true
mv -f PAYMENT_ISSUE_ANALYSIS_AND_FIX.md docs/guides/ 2>/dev/null || true
mv -f USER_ISSUES_RESOLVED.md docs/guides/ 2>/dev/null || true
mv -f REGISTRATION_LOGIN_FIXES_REPORT.md docs/guides/ 2>/dev/null || true

# Move implementation summaries
mv -f IMPLEMENTATION_STATUS_FINAL.md docs/guides/ 2>/dev/null || true
mv -f IMPLEMENTATION_PROGRESS.md docs/guides/ 2>/dev/null || true
mv -f IMPLEMENTATION_COMPLETE_SUMMARY.md docs/guides/ 2>/dev/null || true
mv -f TASK_COMPLETION_REPORT.md docs/guides/ 2>/dev/null || true
mv -f AUTONOMOUS_IMPLEMENTATION_PLAN.md docs/guides/ 2>/dev/null || true
mv -f AUTONOMOUS_IMPROVEMENTS_COMPLETE.md docs/guides/ 2>/dev/null || true
mv -f ALL_PRIORITIES_COMPLETE.md docs/guides/ 2>/dev/null || true
mv -f BUILD_SUCCESS_REPORT.md docs/guides/ 2>/dev/null || true
mv -f FRONTEND_IMPLEMENTATION_COMPLETE.md docs/guides/ 2>/dev/null || true
mv -f FINAL_IMPLEMENTATION_SUMMARY.md docs/guides/ 2>/dev/null || true
mv -f FINAL_AUTONOMOUS_IMPLEMENTATION.md docs/guides/ 2>/dev/null || true

# Move status reports
mv -f PROJECT_STATUS_REPORT.md docs/guides/ 2>/dev/null || true
mv -f STATUS_OVERVIEW.md docs/guides/ 2>/dev/null || true
mv -f SYSTEM_STATUS_FINAL_REPORT.md docs/guides/ 2>/dev/null || true
mv -f SYSTEM_READY_FOR_TESTING.md docs/guides/ 2>/dev/null || true
mv -f FINAL_STATUS_REPORT.md docs/guides/ 2>/dev/null || true
mv -f FINAL_SUMMARY.md docs/guides/ 2>/dev/null || true
mv -f SESSION_SUMMARY_2025-10-19.md docs/guides/ 2>/dev/null || true

# Move phase reports
mv -f PHASE_1_PROGRESS_REPORT.md docs/guides/ 2>/dev/null || true
mv -f PHASE_1_FRONTEND_COMPLETE.md docs/guides/ 2>/dev/null || true
mv -f PHASE_1_COMPLETION_SUMMARY.md docs/guides/ 2>/dev/null || true

# Move task planning
mv -f TASK_BREAKDOWN_AND_ROADMAP.md docs/guides/ 2>/dev/null || true
mv -f NEXT_STEPS.md docs/guides/ 2>/dev/null || true
mv -f DOCUMENTATION_INDEX.md docs/guides/ 2>/dev/null || true

# Move completed folder contents
mv -f completed docs/ 2>/dev/null || true

# Move newfeture folder
mv -f newfeture docs/ 2>/dev/null || true

# Keep these in root (active/important)
# - README.md (main project readme)
# - START_HERE.md (entry point)
# - backend/README.md (backend specific)
# - frontend/styles/design-system.md (active design reference)

echo "✅ Documentation organized into docs/ directory"
echo ""
echo "📁 Directory structure:"
echo "  docs/api/          - API documentation and guides"
echo "  docs/setup/        - Setup and configuration guides"
echo "  docs/deployment/   - Deployment guides and status"
echo "  docs/testing/      - Testing reports and guides"
echo "  docs/features/     - Feature specifications and guides"
echo "  docs/audit/        - Audit reports and assessments"
echo "  docs/guides/       - General guides and summaries"
echo "  docs/completed/    - Completed tasks archive"
echo ""
echo "📝 Files kept in root:"
echo "  - README.md"
echo "  - START_HERE.md"
echo ""
echo "✨ Documentation cleanup complete!"

