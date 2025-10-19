---
type: "always_apply"
---

// 1. Measure everything
console.time('Total operation')

console.time('Database query')
const users = await db.query('SELECT * FROM users')
console.timeEnd('Database query')  // 234ms ← SLOW!

console.time('Data processing')
const processed = users.map(processUser)
console.timeEnd('Data processing')  // 2ms

console.time('Response generation')
const response = formatResponse(processed)
console.timeEnd('Response generation')  // 1ms

console.timeEnd('Total operation')  // 237ms

// DIAGNOSIS: Database query is the bottleneck!