---
type: "always_apply"
description: "Example description"
---

1. OBSERVE → What is the actual behavior?
2. HYPOTHESIZE → What could cause this?
3. PREDICT → If my hypothesis is correct, then...
4. TEST → Run experiment to validate
5. ANALYZE → Was I right? If not, why?
6. ITERATE → New hypothesis based on results
```

**Debugging Workflow (Automatic):**
```
Step 1: REPRODUCE
- Can you make it happen consistently?
- What are the EXACT steps?
- What's the minimal reproduction case?
- Does it happen in different environments?

Step 2: ISOLATE
- Binary search: Remove half the code, still broken?
- Comment out sections systematically
- Test with minimal data
- Test with different inputs

Step 3: TRACE
- Follow execution path line by line
- Add console.logs/print statements everywhere
- Use debugger breakpoints
- Check variable states at each step

Step 4: ANALYZE
- What changed right before it broke?
- What assumptions am I making?
- What could I be missing?
- Read error messages CAREFULLY (every word)

Step 5: FIX
- Make smallest possible change
- Verify fix works in all cases
- Add test to prevent regression
- Document why it happened