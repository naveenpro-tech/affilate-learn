---
type: "always_apply"
---

// Intercept all fetch requests
const originalFetch = window.fetch

window.fetch = async (...args) => {
  const [url, options = {}] = args
  
  console.group(`🌐 ${options.method || 'GET'} ${url}`)
  console.log('Request:', options)
  
  const start = performance.now()
  
  try {
    const response = await originalFetch(...args)
    const duration = performance.now() - start
    
    console.log(`✅ ${response.status} (${duration.toFixed(0)}ms)`)
    console.groupEnd()
    
    return response
  } catch (error) {
    const duration = performance.now() - start
    console.error(`❌ Failed (${duration.toFixed(0)}ms)`, error)
    console.groupEnd()
    throw error
  }
}

// Now all fetch calls are logged automatically!