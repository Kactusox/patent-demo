const express = require('express')
const router = express.Router()
const { db, logActivity } = require('../database')

// GET all users (admin only)
router.get('/', (req, res) => {
  const query = `
    SELECT id, username, role, institution_name, full_name, phone_number, 
           is_active, access_expires_at, created_at 
    FROM users 
    ORDER BY role DESC, username ASC
  `
  
  db.all(query, (err, users) => {
    if (err) {
      console.error('Error fetching users:', err)
      return res.status(500).json({ error: 'Фойдаланувчиларни олишда хато' })
    }

    res.json({ success: true, users })
  })
})

// GET single user by ID
router.get('/:id', (req, res) => {
  const query = `
    SELECT id, username, role, institution_name, full_name, phone_number,
           is_active, access_expires_at, created_at 
    FROM users WHERE id = ?
  `
  
  db.get(query, [req.params.id], (err, user) => {
    if (err) {
      console.error('Error fetching user:', err)
      return res.status(500).json({ error: 'Фойдаланувчини олишда хато' })
    }

    if (!user) {
      return res.status(404).json({ error: 'Фойдаланувчи топилмади' })
    }

    res.json({ success: true, user })
  })
})

// GET activity logs
router.get('/logs/activity', (req, res) => {
  const query = `
    SELECT a.*, u.full_name 
    FROM activity_logs a
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC
    LIMIT 100
  `
  
  db.all(query, (err, logs) => {
    if (err) {
      console.error('Error fetching activity logs:', err)
      return res.status(500).json({ error: 'Логларни олишда хато' })
    }

    res.json({ success: true, logs })
  })
})

// CREATE new user (admin only)
router.post('/', (req, res) => {
  const { username, password, role, institutionName, fullName, phoneNumber } = req.body

  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Барча майдонларни тўлдиринг' })
  }

  // Validate phone number format (Uzbekistan)
  if (phoneNumber && !phoneNumber.match(/^\+998\d{9}$/)) {
    return res.status(400).json({ 
      error: 'Телефон рақами нотўғри форматда. Намуна: +998901234567' 
    })
  }

  // Check if username already exists
  db.get('SELECT id FROM users WHERE username = ?', [username], (err, existing) => {
    if (err) {
      console.error('Error checking username:', err)
      return res.status(500).json({ error: 'Текширишда хато' })
    }

    if (existing) {
      return res.status(409).json({ error: 'Бу фойдаланувчи номи банд' })
    }

    // Insert new user
    const query = `
      INSERT INTO users (username, password, role, institution_name, full_name, phone_number)
      VALUES (?, ?, ?, ?, ?, ?)
    `

    db.run(query, [username, password, role, institutionName, fullName, phoneNumber], function(err) {
      if (err) {
        console.error('Error creating user:', err)
        return res.status(500).json({ error: 'Фойдаланувчини яратишда хато' })
      }

      // Log activity
      logActivity(this.lastID, username, 'USER_CREATED', `New user created: ${username}`)

      res.status(201).json({
        success: true,
        message: 'Фойдаланувчи муваффақиятли яратилди',
        userId: this.lastID
      })
    })
  })
})

// UPDATE user
router.put('/:id', (req, res) => {
  const { institutionName, fullName, phoneNumber, isActive } = req.body

  // Validate phone number format if provided
  if (phoneNumber && !phoneNumber.match(/^\+998\d{9}$/)) {
    return res.status(400).json({ 
      error: 'Телефон рақами нотўғри форматда. Намуна: +998901234567' 
    })
  }

  const query = `
    UPDATE users 
    SET institution_name = ?, full_name = ?, phone_number = ?, 
        is_active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `

  db.run(query, [institutionName, fullName, phoneNumber, isActive ? 1 : 0, req.params.id], function(err) {
    if (err) {
      console.error('Error updating user:', err)
      return res.status(500).json({ error: 'Фойдаланувчини янгилашда хато' })
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Фойдаланувчи топилмади' })
    }

    // Log activity
    db.get('SELECT username FROM users WHERE id = ?', [req.params.id], (err, user) => {
      if (user) {
        logActivity(req.params.id, user.username, 'USER_UPDATED', `User info updated`)
      }
    })

    res.json({
      success: true,
      message: 'Фойдаланувчи муваффақиятли янгиланди'
    })
  })
})

// DELETE user (admin only)
router.delete('/:id', (req, res) => {
  // Don't allow deleting admin user with ID 1
  if (req.params.id === '1') {
    return res.status(403).json({ error: 'Асосий админ фойдаланувчини ўчириб бўлмайди' })
  }

  // Check user role
  db.get('SELECT role, username FROM users WHERE id = ?', [req.params.id], (err, user) => {
    if (err) {
      console.error('Error fetching user:', err)
      return res.status(500).json({ error: 'Фойдаланувчини олишда хато' })
    }

    if (!user) {
      return res.status(404).json({ error: 'Фойдаланувчи топилмади' })
    }

    // Delete user
    db.run('DELETE FROM users WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        console.error('Error deleting user:', err)
        return res.status(500).json({ error: 'Фойдаланувчини ўчиришда хато' })
      }

      // Log activity
      logActivity(null, 'admin', 'USER_DELETED', `User deleted: ${user.username}`)

      res.json({
        success: true,
        message: 'Фойдаланувчи муваффақиятли ўчирилди'
      })
    })
  })
})

// Change password
router.patch('/:id/password', (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Барча майдонларни тўлдиринг' })
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Парол камида 6 та белгидан иборат бўлиши керак' })
  }

  // Verify current password
  db.get('SELECT password, username FROM users WHERE id = ?', [req.params.id], (err, user) => {
    if (err) {
      console.error('Error fetching user:', err)
      return res.status(500).json({ error: 'Фойдаланувчини олишда хато' })
    }

    if (!user) {
      return res.status(404).json({ error: 'Фойдаланувчи топилмади' })
    }

    if (user.password !== currentPassword) {
      return res.status(401).json({ error: 'Жорий парол нотўғри' })
    }

    // Update password
    const query = 'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    
    db.run(query, [newPassword, req.params.id], function(err) {
      if (err) {
        console.error('Error updating password:', err)
        return res.status(500).json({ error: 'Паролни янгилашда хато' })
      }

      // Log activity
      logActivity(req.params.id, user.username, 'PASSWORD_CHANGED', 'Password updated')

      res.json({
        success: true,
        message: 'Парол муваффақиятли ўзгартирилди'
      })
    })
  })
})

// Admin reset user password
router.patch('/:id/reset-password', (req, res) => {
  const { newPassword } = req.body

  if (!newPassword) {
    return res.status(400).json({ error: 'Янги паролни киритинг' })
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Парол камида 6 та белгидан иборат бўлиши керак' })
  }

  db.get('SELECT username FROM users WHERE id = ?', [req.params.id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'Фойдаланувчи топилмади' })
    }

    const query = 'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    
    db.run(query, [newPassword, req.params.id], function(err) {
      if (err) {
        console.error('Error resetting password:', err)
        return res.status(500).json({ error: 'Паролни тиклашда хато' })
      }

      // Log activity
      logActivity(req.params.id, user.username, 'PASSWORD_RESET_BY_ADMIN', 'Password reset by admin')

      res.json({
        success: true,
        message: 'Парол муваффақиятли тикланди'
      })
    })
  })
})

module.exports = router