const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { db } = require('../database')

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads')
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Фақат PDF файлларни юклаш мумкин'))
    }
  }
})

// GET all patents
router.get('/', (req, res) => {
  const { status, institution, search } = req.query
  
  let query = 'SELECT * FROM patents WHERE 1=1'
  const params = []

  if (status && status !== 'all') {
    query += ' AND status = ?'
    params.push(status)
  }

  if (institution && institution !== 'all') {
    query += ' AND institution = ?'
    params.push(institution)
  }

  if (search) {
    query += ` AND (
      patent_number LIKE ? OR 
      title LIKE ? OR 
      application_number LIKE ? OR 
      authors LIKE ? OR
      institution_name LIKE ?
    )`
    const searchTerm = `%${search}%`
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm)
  }

  query += ' ORDER BY created_at DESC'

  db.all(query, params, (err, patents) => {
    if (err) {
      console.error('Error fetching patents:', err)
      return res.status(500).json({ error: 'Патентларни олишда хато' })
    }

    res.json({ 
      success: true, 
      count: patents.length,
      patents 
    })
  })
})

// GET single patent by ID
router.get('/:id', (req, res) => {
  const query = 'SELECT * FROM patents WHERE id = ?'
  
  db.get(query, [req.params.id], (err, patent) => {
    if (err) {
      console.error('Error fetching patent:', err)
      return res.status(500).json({ error: 'Патентни олишда хато' })
    }

    if (!patent) {
      return res.status(404).json({ error: 'Патент топилмади' })
    }

    res.json({ success: true, patent })
  })
})

// Check for duplicate application number
router.get('/check-duplicate/:applicationNumber', (req, res) => {
  const query = 'SELECT id, patent_number FROM patents WHERE application_number = ?'
  
  db.get(query, [req.params.applicationNumber], (err, patent) => {
    if (err) {
      console.error('Error checking duplicate:', err)
      return res.status(500).json({ error: 'Текширишда хато' })
    }

    if (patent) {
      return res.json({ 
        isDuplicate: true, 
        patent: {
          id: patent.id,
          patentNumber: patent.patent_number
        }
      })
    }

    res.json({ isDuplicate: false })
  })
})

// CREATE new patent
router.post('/', upload.single('file'), (req, res) => {
  const {
    patentNumber,
    title,
    type,
    applicationNumber,
    submissionDate,
    registrationDate,
    year,
    authors,
    institution,
    institutionName,
    createdBy
  } = req.body

  // Validation
  if (!patentNumber || !title || !type || !applicationNumber || !submissionDate || !registrationDate || !authors || !year) {
    return res.status(400).json({ error: 'Барча майдонларни тўлдиринг' })
  }

  // Validate year
  const currentYear = new Date().getFullYear()
  const patentYear = parseInt(year)
  
  if (isNaN(patentYear) || patentYear < 2000 || patentYear > currentYear) {
    return res.status(400).json({ 
      error: `Йил 2000 дан ${currentYear} гача бўлиши керак` 
    })
  }

  // Check for duplicate
  const checkQuery = 'SELECT id FROM patents WHERE application_number = ?'
  db.get(checkQuery, [applicationNumber], (err, existing) => {
    if (err) {
      console.error('Error checking duplicate:', err)
      return res.status(500).json({ error: 'Текширишда хато' })
    }

    if (existing) {
      return res.status(409).json({ error: 'Бу талабнома рақами аллақачон мавжуд' })
    }

    // Insert patent
    const query = `
      INSERT INTO patents (
        patent_number, title, type, application_number, submission_date,
        registration_date, year, authors, institution, institution_name, status,
        file_path, file_name, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const filePath = req.file ? `/uploads/${req.file.filename}` : null
    const fileName = req.file ? req.file.originalname : null

    db.run(query, [
      patentNumber,
      title,
      type,
      applicationNumber,
      submissionDate,
      registrationDate,
      patentYear,
      authors,
      institution,
      institutionName,
      'pending', // Default status
      filePath,
      fileName,
      createdBy
    ], function(err) {
      if (err) {
        console.error('Error creating patent:', err)
        return res.status(500).json({ error: 'Патентни сақлашда хато' })
      }

      res.status(201).json({
        success: true,
        message: 'Патент муваффақиятли қўшилди',
        patentId: this.lastID
      })
    })
  })
})

// UPDATE patent
router.put('/:id', upload.single('file'), (req, res) => {
  const {
    patentNumber,
    title,
    type,
    submissionDate,
    registrationDate,
    year,
    authors
  } = req.body

  // Validate year if provided
  if (year) {
    const currentYear = new Date().getFullYear()
    const patentYear = parseInt(year)
    
    if (isNaN(patentYear) || patentYear < 2000 || patentYear > currentYear) {
      return res.status(400).json({ 
        error: `Йил 2000 дан ${currentYear} гача бўлиши керак` 
      })
    }
  }

  let query = `
    UPDATE patents 
    SET patent_number = ?, title = ?, type = ?, submission_date = ?,
        registration_date = ?, year = ?, authors = ?, updated_at = CURRENT_TIMESTAMP
  `
  const params = [patentNumber, title, type, submissionDate, registrationDate, year, authors]

  // If new file is uploaded
  if (req.file) {
    query += `, file_path = ?, file_name = ?`
    params.push(`/uploads/${req.file.filename}`, req.file.originalname)
  }

  query += ` WHERE id = ?`
  params.push(req.params.id)

  db.run(query, params, function(err) {
    if (err) {
      console.error('Error updating patent:', err)
      return res.status(500).json({ error: 'Патентни янгилашда хато' })
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Патент топилмади' })
    }

    res.json({
      success: true,
      message: 'Патент муваффақиятли янгиланди'
    })
  })
})

// DELETE patent
router.delete('/:id', (req, res) => {
  // First get the file path to delete the file
  db.get('SELECT file_path FROM patents WHERE id = ?', [req.params.id], (err, patent) => {
    if (err) {
      console.error('Error fetching patent:', err)
      return res.status(500).json({ error: 'Патентни олишда хато' })
    }

    if (!patent) {
      return res.status(404).json({ error: 'Патент топилмади' })
    }

    // Delete the file if it exists
    if (patent.file_path) {
      const filePath = path.join(__dirname, '..', patent.file_path)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    // Delete from database
    db.run('DELETE FROM patents WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        console.error('Error deleting patent:', err)
        return res.status(500).json({ error: 'Патентни ўчиришда хато' })
      }

      res.json({
        success: true,
        message: 'Патент муваффақиятли ўчирилди'
      })
    })
  })
})

// APPROVE patent (admin only)
router.patch('/:id/approve', (req, res) => {
  const { approvedBy } = req.body

  const query = `
    UPDATE patents 
    SET status = 'approved', approved_by = ?, approved_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `

  db.run(query, [approvedBy, req.params.id], function(err) {
    if (err) {
      console.error('Error approving patent:', err)
      return res.status(500).json({ error: 'Патентни тасдиқлашда хато' })
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Патент топилмади' })
    }

    res.json({
      success: true,
      message: 'Патент тасдиқланди'
    })
  })
})

// REJECT patent (admin only)
router.patch('/:id/reject', (req, res) => {
  const query = `
    UPDATE patents 
    SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `

  db.run(query, [req.params.id], function(err) {
    if (err) {
      console.error('Error rejecting patent:', err)
      return res.status(500).json({ error: 'Патентни рад этишда хато' })
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Патент топилмади' })
    }

    res.json({
      success: true,
      message: 'Патент рад этилди'
    })
  })
})

// GET statistics
router.get('/stats/summary', (req, res) => {
  const queries = {
    total: 'SELECT COUNT(*) as count FROM patents',
    approved: 'SELECT COUNT(*) as count FROM patents WHERE status = "approved"',
    pending: 'SELECT COUNT(*) as count FROM patents WHERE status = "pending"',
    rejected: 'SELECT COUNT(*) as count FROM patents WHERE status = "rejected"',
    byInstitution: 'SELECT institution, COUNT(*) as count FROM patents GROUP BY institution'
  }

  const stats = {}

  // Get total
  db.get(queries.total, (err, result) => {
    if (err) return res.status(500).json({ error: 'Статистикани олишда хато' })
    stats.total = result.count

    // Get approved
    db.get(queries.approved, (err, result) => {
      if (err) return res.status(500).json({ error: 'Статистикани олишда хато' })
      stats.approved = result.count

      // Get pending
      db.get(queries.pending, (err, result) => {
        if (err) return res.status(500).json({ error: 'Статистикани олишда хато' })
        stats.pending = result.count

        // Get rejected
        db.get(queries.rejected, (err, result) => {
          if (err) return res.status(500).json({ error: 'Статистикани олишда хато' })
          stats.rejected = result.count

          // Get by institution
          db.all(queries.byInstitution, (err, results) => {
            if (err) return res.status(500).json({ error: 'Статистикани олишда хато' })
            stats.byInstitution = results

            res.json({ success: true, stats })
          })
        })
      })
    })
  })
})

module.exports = router