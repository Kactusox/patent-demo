# Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  })

  // Default error
  let error = {
    success: false,
    error: 'Тизимда хато юз берди'
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.error = 'Файл ҳажми жуда катта (максимум 10MB)'
    return res.status(400).json(error)
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error.error = 'Жуда кўп файл юкланган'
    return res.status(400).json(error)
  }

  if (err.message === 'Фақат PDF файлларни юклаш мумкин') {
    error.error = err.message
    return res.status(400).json(error)
  }

  // SQLite errors
  if (err.code === 'SQLITE_CONSTRAINT') {
    if (err.message.includes('UNIQUE constraint failed')) {
      error.error = 'Маълумот аллақачон мавжуд'
    } else {
      error.error = 'Маълумотлар базасида хато'
    }
    return res.status(409).json(error)
  }

  // File system errors
  if (err.code === 'ENOENT') {
    error.error = 'Файл топилмади'
    return res.status(404).json(error)
  }

  if (err.code === 'EACCES' || err.code === 'EPERM') {
    error.error = 'Файлга кириш рухсати йўқ'
    return res.status(403).json(error)
  }

  // JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error.error = 'Нотўғри маълумот формати'
    return res.status(400).json(error)
  }

  // Default server error
  res.status(err.status || 500).json(error)
}

// Request validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Маълумотлар нотўғри: ' + error.details[0].message
      })
    }
    next()
  }
}

// Rate limiting middleware
const rateLimit = (windowMs, max) => {
  const requests = new Map()
  
  return (req, res, next) => {
    const ip = req.ip
    const now = Date.now()
    const windowStart = now - windowMs
    
    if (!requests.has(ip)) {
      requests.set(ip, [])
    }
    
    const ipRequests = requests.get(ip)
    const validRequests = ipRequests.filter(time => time > windowStart)
    
    if (validRequests.length >= max) {
      return res.status(429).json({
        success: false,
        error: 'Жуда кўп сўров. Бироз кутинг ва қайта уриниб кўринг.'
      })
    }
    
    validRequests.push(now)
    requests.set(ip, validRequests)
    
    next()
  }
}

// CORS middleware
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost',
      process.env.FRONTEND_URL
    ].filter(Boolean)
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.warn(`Blocked CORS request from origin: ${origin}`)
      callback(new Error('CORS рухсат берилмаган'), false)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Remove powered by header
  res.removeHeader('X-Powered-By')
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade')
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob:; " +
    "font-src 'self'; " +
    "connect-src 'self'; " +
    "frame-src 'none'"
  )
  
  next()
}

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    }
    
    if (res.statusCode >= 400) {
      console.error('Request Error:', logData)
    } else {
      console.log('Request:', logData)
    }
  })
  
  next()
}

module.exports = {
  errorHandler,
  validateRequest,
  rateLimit,
  corsOptions,
  securityHeaders,
  requestLogger
}