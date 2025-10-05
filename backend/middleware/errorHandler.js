// Error handling middleware for patent management system

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack)

  // Default error
  let statusCode = 500
  let message = 'Тизимда хато юз берди'
  let details = null

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = 'Валидация хатоси'
    details = err.details || err.message
  } else if (err.name === 'MulterError') {
    statusCode = 400
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Файл ҳажми жуда катта. Максимум 10MB'
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Жуда кўп файл юкланган'
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Кўзда тутилмаган файл юкланган'
    } else {
      message = 'Файл юклашда хато'
    }
  } else if (err.code === 'SQLITE_CONSTRAINT') {
    statusCode = 409
    if (err.message.includes('UNIQUE constraint failed')) {
      message = 'Бу маълумот аллақачон мавжуд'
    } else {
      message = 'Маълумотлар базасида хатолик'
    }
  } else if (err.code === 'ENOENT') {
    statusCode = 404
    message = 'Файл топилмади'
  } else if (err.code === 'EACCES') {
    statusCode = 403
    message = 'Файлга кириш рад этилди'
  } else if (err.code === 'EMFILE' || err.code === 'ENFILE') {
    statusCode = 503
    message = 'Тизимда файл дескрипторлари тугаган'
  }

  // Handle custom errors with status codes
  if (err.statusCode) {
    statusCode = err.statusCode
    message = err.message
    details = err.details
  }

  // Log error details for debugging
  console.error('Error Details:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  })

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    details: details,
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  })
}

// 404 handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint топилмади',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  })
}

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
}