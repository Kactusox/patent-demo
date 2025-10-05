const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
require('dotenv').config()
const { logActivity } = require('./database')

// Import middlewares
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler')
const { requestLogger, securityLogger, rateLimitLogger } = require('./middleware/logging')

const app = express()
const PORT = process.env.PORT || 5001

// Security middleware
app.use(securityLogger)
app.use(rateLimitLogger)

// Logging middleware
app.use(requestLogger)

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Import routes
const authRoutes = require('./routes/auth')
const patentRoutes = require('./routes/patents')
const userRoutes = require('./routes/users')
const exportRoutes = require('./routes/export')

// Use routes
app.use('/api/auth', authRoutes)
app.use('/api/patents', patentRoutes)
app.use('/api/users', userRoutes)
app.use('/api/export', exportRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Patent Management System API is running',
    timestamp: new Date().toISOString()
  })
})

// Error handling middleware
app.use(notFoundHandler)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log('==============================================')
  console.log('🚀 Patent Management System API Server')
  console.log('==============================================')
  console.log(`✅ Server running on: http://localhost:${PORT}`)
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`)
  console.log(`✅ Uploads folder: ${uploadsDir}`)
  console.log('==============================================')
})