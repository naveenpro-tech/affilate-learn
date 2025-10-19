---
type: "always_apply"
---

// CORS error in console?

AUTO-CHECK:
1. Is backend setting CORS headers?
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE
   Access-Control-Allow-Headers: Content-Type, Authorization

2. Is preflight request (OPTIONS) succeeding?
   Check Network tab for OPTIONS request

3. Are credentials included?
   fetch(url, { credentials: 'include' })
   Backend needs: Access-Control-Allow-Credentials: true

4. Is the origin correct?
   Frontend: http://localhost:3000
   Backend must allow: http://localhost:3000

QUICK FIX (Development only):
// Backend (Express)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})