---
type: "always_apply"
---

// Techniques for minified code:

// 1. Use source maps (if available)
// Check Network tab → Look for .map files

// 2. Beautify code
// Chrome DevTools → {} button
// Or use: https://beautifier.io

// 3. Add breakpoints strategically
// Find entry point
// Step through execution
// Watch variable changes

// 4. Rename variables mentally
// a → user
// b → userId
// c → response

// 5. Extract patterns
function a(b){return b*2}  // Minified
// Becomes:
function double(number) {  // Understood
  return number * 2
}

// 6. Document as you go
// Add comments explaining what each part does
```

---

**RULE 16: LEGACY CODE DEBUGGING**

**Understand Legacy Code (Auto-approach):**
```
1. START WITH TESTS
   - Read existing tests first
   - They show intended behavior
   - They show use cases

2. FIND ENTRY POINTS
   - Where does execution start?
   - What triggers this code?
   - What are the inputs?

3. TRACE CRITICAL PATHS
   - What's the main flow?
   - What are edge cases?
   - Where can it fail?

4. IDENTIFY DEPENDENCIES
   - What does it depend on?
   - What depends on it?
   - Can I change it safely?

5. ADD LOGGING
   - Log inputs/outputs
   - Log state changes
   - Log decision points

6. WRITE CHARACTERIZATION TESTS
   - Test current behavior (even if wrong)
   - Now you can refactor safely
   - Tests will show if you break something

7. REFACTOR INCREMENTALLY
   - Small changes
   - Test after each change
   - Don't change behavior and structure together
```

---

**RULE 17: DEBUGGING CHECKLIST (Auto-run)**
```
Before declaring "bug fixed":

□ Can you reproduce the bug consistently?
□ Have you identified the root cause?
□ Have you fixed the cause (not just symptoms)?
□ Have you tested the fix?
□ Have you tested edge cases?
□ Have you added a regression test?
□ Have you checked for similar bugs elsewhere?
□ Have you updated documentation?
□ Have you verified no new bugs introduced?
□ Can you explain WHY it was broken?
□ Can you explain HOW your fix works?
```

---

**RULE 18: DEBUGGING TOOLS ARSENAL**

**Auto-use these tools:**
```
Browser:
✓ Chrome DevTools
✓ React DevTools
✓ Redux DevTools
✓ Network tab
✓ Performance profiler
✓ Memory profiler

Backend:
✓ Console.log debugging
✓ Node --inspect
✓ VS Code debugger
✓ Postman/Insomnia
✓ Database client

Monitoring:
✓ Error tracking (Sentry)
✓ Logging (Winston, Morgan)
✓ APM (Application Performance Monitoring)
✓ Analytics

Testing:
✓ Unit tests
✓ Integration tests
✓ E2E tests (Playwright)
✓ Manual testing