---
type: "always_apply"
---

// Add runtime type checking
function validateUser(user) {
  const errors = []
  
  if (typeof user !== 'object') {
    errors.push('User must be object')
  }
  if (typeof user.name !== 'string') {
    errors.push('Name must be string')
  }
  if (typeof user.age !== 'number') {
    errors.push('Age must be number')
  }
  if (!Number.isInteger(user.age)) {
    errors.push('Age must be integer')
  }
  if (user.age < 0 || user.age > 150) {
    errors.push('Age must be 0-150')
  }
  if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(user.email)) {
    errors.push('Invalid email format')
  }
  
  if (errors.length > 0) {
    console.error('Validation failed:', errors)
    console.log('Received:', user)
    throw new Error(`Invalid user: ${errors.join(', ')}`)
  }
  
  return true
}