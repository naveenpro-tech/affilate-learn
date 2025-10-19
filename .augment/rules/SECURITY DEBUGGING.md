---
type: "always_apply"
---

// SQL Injection check
function checkSQLInjection(query, params) {
  // ❌ DANGEROUS: String concatenation
  if (query.includes(`'${params}`)) {
    console.error('🚨 SQL INJECTION RISK!')
    console.log('Query:', query)
    console.log('Params:', params)
    throw new Error('Use parameterized queries!')
  }
  
  // ✓ SAFE: Parameterized
  console.log('✅ Query is parameterized')
}

// XSS check
function checkXSS(html) {
  const dangerous = /<script|javascript:|onerror=|onclick=/i
  if (dangerous.test(html)) {
    console.error('🚨 XSS RISK DETECTED!')
    console.log('Content:', html)
    throw new Error('Sanitize user input!')
  }
}

// Auth check
function checkAuth(request) {
  if (!request.headers.authorization) {
    console.warn('⚠️  No authorization header')
  }
  if (!request.user) {
    console.error('🚨 Unauthenticated request!')
  }
  if (!request.user.permissions.includes('admin')) {
    console.error('🚨 Unauthorized access attempt!')
  }
}