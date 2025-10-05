// Logging middleware for patent management system

const { logActivity } = require('../database')

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now()
  
  // Log request
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - ${req.ip}`)
  
  // Override res.end to log response
  const originalEnd = res.end
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start
    const statusCode = res.statusCode
    
    // Log response
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - ${statusCode} - ${duration}ms`)
    
    // Call original end
    originalEnd.call(this, chunk, encoding)
  }
  
  next()
}

// Activity logging middleware
const activityLogger = (action, details = '') => {
  return (req, res, next) => {
    // Store original res.json
    const originalJson = res.json
    
    // Override res.json to log activity
    res.json = function(data) {
      // Only log successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.id || null
        const username = req.user?.username || 'anonymous'
        const ipAddress = req.ip || req.connection.remoteAddress
        
        // Log activity
        logActivity(userId, username, action, details, ipAddress)
      }
      
      // Call original json
      return originalJson.call(this, data)
    }
    
    next()
  }
}

// Security logging middleware
const securityLogger = (req, res, next) => {
  // Log suspicious activities
  const suspiciousPatterns = [
    /\.\./,  // Directory traversal
    /<script/i,  // XSS attempts
    /union.*select/i,  // SQL injection
    /drop.*table/i,  // SQL injection
    /delete.*from/i,  // SQL injection
    /insert.*into/i,  // SQL injection
    /update.*set/i,  // SQL injection
  ]
  
  const checkSuspicious = (str) => {
    if (typeof str !== 'string') return false
    return suspiciousPatterns.some(pattern => pattern.test(str))
  }
  
  // Check URL
  if (checkSuspicious(req.url)) {
    console.warn(`SECURITY WARNING: Suspicious URL detected - ${req.ip} - ${req.url}`)
  }
  
  // Check query parameters
  Object.values(req.query).forEach(value => {
    if (checkSuspicious(value)) {
      console.warn(`SECURITY WARNING: Suspicious query parameter - ${req.ip} - ${value}`)
    }
  })
  
  // Check body parameters
  if (req.body) {
    Object.values(req.body).forEach(value => {
      if (typeof value === 'string' && checkSuspicious(value)) {
        console.warn(`SECURITY WARNING: Suspicious body parameter - ${req.ip} - ${value}`)
      }
    })
  }
  
  next()
}

// Rate limiting logger
const rateLimitLogger = (req, res, next) => {
  const key = `${req.ip}-${req.url}`
  const now = Date.now()
  
  // Simple in-memory rate limiting (in production, use Redis)
  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map()
  }
  
  const requests = global.rateLimitStore.get(key) || []
  const recentRequests = requests.filter(time => now - time < 60000) // Last minute
  
  if (recentRequests.length >= 100) { // 100 requests per minute
    console.warn(`RATE LIMIT: Too many requests from ${req.ip} to ${req.url}`)
    return res.status(429).json({
      success: false,
      error: 'Жуда кўп сўровлар. Илтимос, бир оз кутинг.',
      retryAfter: 60
    })
  }
  
  recentRequests.push(now)
  global.rateLimitStore.set(key, recentRequests)
  
  next()
}

module.exports = {
  requestLogger,
  activityLogger,
  securityLogger,
  rateLimitLogger
}