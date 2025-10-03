const express = require('express')
const router = express.Router()
const { db, logActivity } = require('../database')

// Login endpoint
router.post('/login', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ 
      error: 'Илтимос, барча майдонларни тўлдиринг' 
    })
  }

  const query = `
    SELECT id, username, role, institution_name, full_name, phone_number, is_active 
    FROM users 
    WHERE username = ? AND password = ?
  `

  db.get(query, [username, password], (err, user) => {
    if (err) {
      console.error('Login error:', err)
      return res.status(500).json({ error: 'Тизимда хато юз берди' })
    }

    if (!user) {
      return res.status(401).json({ error: 'Фойдаланувчи топилмади ёки парол нотўғри' })
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Сизнинг аккаунтингиз ўчирилган' })
    }

    // Log the login activity
    logActivity(user.id, username, 'LOGIN', `User ${username} logged in`, req.ip)

    // Return user data (without password)
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        institutionName: user.institution_name,
        fullName: user.full_name,
        phoneNumber: user.phone_number
      }
    })
  })
})

// Logout endpoint
router.post('/logout', (req, res) => {
  // In a real app, you'd invalidate tokens here
  res.json({ success: true, message: 'Муваффақиятли чиқдингиз' })
})

// Check authentication status
router.get('/check', (req, res) => {
  // In a real app with JWT, you'd verify the token here
  res.json({ authenticated: false })
})

module.exports = router