const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
require('dotenv').config()
const { logActivity } = require('./database')

const app = express()
const PORT = process.env.PORT || 5001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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
app.use((err, req, res, next) => {
  console.error('Error:', err.stack)
  res.status(500).json({ 
    error: 'Тизимда хато юз берди', 
    message: err.message 
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint topilmadi',
    path: req.originalUrl 
  })
})

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