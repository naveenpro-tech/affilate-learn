---
type: "manual"
---

// Problem: Code breaks somewhere in 1000 lines

1. Comment out lines 500-1000 → Still broken?
   If YES: Bug is in lines 1-500
   If NO: Bug is in lines 500-1000

2. Narrow to 250 lines → Repeat
3. Narrow to 125 lines → Repeat
4. Narrow to 60 lines → Repeat
5. Found exact line!

Time: Log(n) instead of O(n)
```

**Time-Travel Debugging (Auto-apply):**
```
Git bisect approach:
1. Find last known good commit
2. Find first known bad commit
3. git bisect start
4. git bisect good <good-commit>
5. git bisect bad <bad-commit>
6. Git checks out middle commit
7. Test → Mark good or bad
8. Repeat until exact commit found

Result: Know EXACTLY what change caused bug
```

**Rubber Duck Debugging (Auto-simulate):**
```
Explain the code to yourself line by line:
"This function receives user data..."
"Then it validates the email..."
"Wait, it doesn't check if email exists!"
"That's the bug!"

Force yourself to articulate every assumption
```

---

**RULE 3: REVERSE ENGINEERING STRATEGIES**

**Code Archaeology (Auto-investigate):**
```
When encountering unknown code:

1. READ TOP-DOWN
   - Start with entry point (main, index)
   - Follow execution flow
   - Map out architecture

2. IDENTIFY PATTERNS
   - What framework/library is this?
   - What design patterns are used?
   - What conventions are followed?

3. FIND KEY FUNCTIONS
   - What's the core business logic?
   - What are the critical paths?
   - What are the side effects?

4. MAP DEPENDENCIES
   - What depends on what?
   - Draw a dependency graph
   - Identify circular dependencies

5. TRACE DATA FLOW
   - Where does data enter?
   - How is it transformed?
   - Where does it exit?
```

**Black Box Analysis (Auto-apply):**
```
When you can't read the code:

1. TEST BOUNDARIES
   Input → [BLACK BOX] → Output
   
   Try:
   - Normal inputs → Expected output?
   - Edge cases → How does it handle?
   - Invalid inputs → Errors?
   - Empty inputs → Defaults?
   - Huge inputs → Performance?
   - Special characters → Sanitization?

2. MONITOR BEHAVIOR
   - Network requests (DevTools)
   - Console logs/errors
   - DOM changes
   - State changes
   - Performance metrics

3. REVERSE ENGINEER API
   - Watch network tab
   - Copy API calls
   - Test in Postman/curl
   - Document endpoints
   - Recreate functionality
```

---

**RULE 4: ERROR MESSAGE DECODING**

**Read Error Messages Like a Pro (Auto-analyze):**
```
Error: "Cannot read property 'name' of undefined"

DECODE:
✓ "Cannot read property" → Trying to access property
✓ "'name'" → Specifically the 'name' property
✓ "of undefined" → Object is undefined

INVESTIGATION:
1. Find where 'name' is accessed
2. Check what object should have 'name'
3. Trace back: Why is object undefined?
4. Check: API call? Missing data? Race condition?

COMMON PATTERNS:
- "undefined" → Variable not initialized or async issue
- "null" → Intentionally empty or failed lookup
- "is not a function" → Wrong type or method doesn't exist
- "Maximum call stack exceeded" → Infinite recursion
- "CORS error" → Server configuration issue
- "404" → Wrong endpoint or route
- "401/403" → Authentication/authorization issue
- "500" → Server-side error (check logs)
```

**Stack Trace Analysis (Auto-read):**
```
Example Stack Trace:
```
Error: Invalid email
    at validateEmail (auth.js:45)
    at createUser (user.js:23)
    at handleSubmit (form.js:67)
    at onClick (button.jsx:12)
```

READ BOTTOM-TO-TOP:
1. button.jsx:12 → User clicked button
2. form.js:67 → handleSubmit called
3. user.js:23 → createUser called
4. auth.js:45 → validateEmail THREW ERROR

The error is in validateEmail, but:
- Check if email format is correct (auth.js)
- Check if email was passed correctly (user.js)
- Check if form data is valid (form.js)
- Check if event handling is correct (button.jsx)
```

---

**RULE 5: ADVANCED DEBUGGING TOOLS**

**Browser DevTools Mastery (Auto-use):**
```
CONSOLE:
✓ console.log() → Basic output
✓ console.table() → View arrays/objects as table
✓ console.trace() → See call stack
✓ console.time/timeEnd() → Measure performance
✓ console.assert() → Test conditions
✓ console.group() → Organize logs

DEBUGGER:
✓ Breakpoints → Pause execution
✓ Conditional breakpoints → Pause only when condition true
✓ Watch expressions → Monitor variables
✓ Call stack → See execution path
✓ Step over/into/out → Navigate code
✓ debugger; keyword → Force breakpoint in code

NETWORK TAB:
✓ Inspect all requests
✓ Check request headers
✓ Check response data
✓ Check timing
✓ Filter by type
✓ Throttle network speed
✓ Preserve logs across navigation

PERFORMANCE TAB:
✓ Record performance
✓ Find bottlenecks
✓ Check frame rate
✓ Memory profiling
✓ CPU profiling