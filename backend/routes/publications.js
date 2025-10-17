const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { db, logActivity } = require('../database')

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'pub-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Фақат PDF, JPG ва PNG файллари қабул қилинади'))
    }
  }
})

// GET all publications with filters
router.get('/', (req, res) => {
  const { institution, status, year, author } = req.query
  
  let query = 'SELECT * FROM publications WHERE 1=1'
  const params = []
  
  if (institution && institution !== 'all') {
    query += ' AND institution = ?'
    params.push(institution)
  }
  
  if (status) {
    query += ' AND status = ?'
    params.push(status)
  }
  
  if (year) {
    query += ' AND publication_year = ?'
    params.push(parseInt(year))
  }
  
  if (author) {
    query += ' AND author_full_name LIKE ?'
    params.push(`%${author}%`)
  }
  
  query += ' ORDER BY created_at DESC'
  
  db.all(query, params, (err, publications) => {
    if (err) {
      console.error('Error fetching publications:', err)
      return res.status(500).json({ error: 'Мақолаларни олишда хато' })
    }
    
    res.json({ success: true, publications })
  })
})

// GET single publication by ID
router.get('/:id', (req, res) => {
  const query = 'SELECT * FROM publications WHERE id = ?'
  
  db.get(query, [req.params.id], (err, publication) => {
    if (err) {
      console.error('Error fetching publication:', err)
      return res.status(500).json({ error: 'Мақолани олишда хато' })
    }
    
    if (!publication) {
      return res.status(404).json({ error: 'Мақола топилмади' })
    }
    
    res.json({ success: true, publication })
  })
})

// Check for duplicate publication (by title, author, and year)
router.post('/check-duplicate', (req, res) => {
  const { title, authorFullName, publicationYear, excludeId } = req.body
  
  if (!title || !authorFullName || !publicationYear) {
    return res.status(400).json({ error: 'Барча майдонлар керак' })
  }
  
  let query = `
    SELECT id, title, author_full_name, publication_year, institution_name, created_by 
    FROM publications 
    WHERE LOWER(TRIM(title)) = LOWER(TRIM(?)) 
    AND LOWER(TRIM(author_full_name)) = LOWER(TRIM(?))
    AND publication_year = ?
  `
  const params = [title, authorFullName, parseInt(publicationYear)]
  
  // Exclude current publication when editing
  if (excludeId) {
    query += ' AND id != ?'
    params.push(parseInt(excludeId))
  }
  
  db.get(query, params, (err, publication) => {
    if (err) {
      console.error('Error checking duplicate publication:', err)
      return res.status(500).json({ error: 'Текширишда хато' })
    }

    if (publication) {
      return res.json({ 
        isDuplicate: true, 
        publication: {
          id: publication.id,
          title: publication.title,
          authorFullName: publication.author_full_name,
          publicationYear: publication.publication_year,
          institutionName: publication.institution_name,
          createdBy: publication.created_by
        }
      })
    }

    res.json({ isDuplicate: false })
  })
})

// CREATE new publication
router.post('/', upload.single('file'), (req, res) => {
  console.log('=== Publication Creation Request ===')
  console.log('Has file:', !!req.file)
  console.log('Body keys:', Object.keys(req.body))
  console.log('Body data:', req.body)
  
  const {
    authorFullName,
    authorOrcid,
    scopusAuthorId,
    scopusProfileUrl,
    wosProfileUrl,
    googleScholarUrl,
    totalArticles,
    totalCitations,
    hIndex,
    title,
    publicationYear,
    journalName,
    language,
    sjr,
    coAuthors,
    keywords,
    abstract,
    institution,
    institutionName,
    createdBy
  } = req.body
  
  // Validation
  if (!authorFullName || !title || !publicationYear || !institution || !institutionName) {
    console.error('Validation failed:', { 
      authorFullName: !!authorFullName, 
      title: !!title, 
      publicationYear: !!publicationYear, 
      institution: !!institution,
      institutionName: !!institutionName
    })
    return res.status(400).json({ error: 'Барча зарур майдонларни тўлдиринг (institution name киритинг)' })
  }
  
  // Validate year
  const currentYear = new Date().getFullYear()
  const pubYear = parseInt(publicationYear)
  
  if (isNaN(pubYear) || pubYear < 1900 || pubYear > currentYear + 1) {
    return res.status(400).json({ 
      error: `Йил 1900 дан ${currentYear + 1} гача бўлиши керак` 
    })
  }
  
  // Insert publication
  const query = `
    INSERT INTO publications (
      author_full_name, author_orcid, scopus_author_id, scopus_profile_url,
      wos_profile_url, google_scholar_url, total_articles, total_citations, h_index,
      title, publication_year, journal_name, publication_type, language,
      sjr, co_authors, keywords, abstract,
      institution, institution_name, status, file_path, file_name, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  
  const filePath = req.file ? `/uploads/${req.file.filename}` : null
  const fileName = req.file ? req.file.originalname : null
  
  db.run(query, [
    authorFullName,
    authorOrcid || null,
    scopusAuthorId || null,
    scopusProfileUrl || null,
    wosProfileUrl || null,
    googleScholarUrl || null,
    parseInt(totalArticles) || 0,
    parseInt(totalCitations) || 0,
    parseInt(hIndex) || 0,
    title,
    pubYear,
    journalName || null,
    'Илмий мақола', // Default type
    language || 'English',
    parseFloat(sjr) || null,
    coAuthors || null,
    keywords || null,
    abstract || null,
    institution,
    institutionName,
    'pending', // Default status
    filePath,
    fileName,
    createdBy
  ], function(err) {
    if (err) {
      console.error('❌ Database error creating publication:', err)
      console.error('Error code:', err.code)
      console.error('Error message:', err.message)
      console.error('Publication data:', { 
        authorFullName, 
        title, 
        publicationYear, 
        institution, 
        institutionName,
        filePath,
        fileName 
      })
      return res.status(500).json({ error: 'Мақолани сақлашда хато: ' + err.message })
    }
    
    console.log('✅ Publication created successfully, ID:', this.lastID)
    
    // Log activity
    logActivity(null, createdBy, 'CREATE_PUBLICATION', `Created publication: ${title}`)
    
    res.json({
      success: true,
      message: 'Мақола муваффақиятли қўшилди',
      publicationId: this.lastID
    })
  })
})

// UPDATE publication
router.put('/:id', upload.single('file'), (req, res) => {
  const {
    authorFullName,
    authorOrcid,
    scopusAuthorId,
    scopusProfileUrl,
    wosProfileUrl,
    googleScholarUrl,
    totalArticles,
    totalCitations,
    hIndex,
    title,
    publicationYear,
    journalName,
    language,
    sjr,
    coAuthors,
    keywords,
    abstract
  } = req.body
  
  // Validate year if provided
  if (publicationYear) {
    const currentYear = new Date().getFullYear()
    const pubYear = parseInt(publicationYear)
    
    if (isNaN(pubYear) || pubYear < 1900 || pubYear > currentYear + 1) {
      return res.status(400).json({ 
        error: `Йил 1900 дан ${currentYear + 1} гача бўлиши керак` 
      })
    }
  }
  
  let query = `
    UPDATE publications 
    SET author_full_name = ?, author_orcid = ?, scopus_author_id = ?,
        scopus_profile_url = ?, wos_profile_url = ?, google_scholar_url = ?,
        total_articles = ?, total_citations = ?, h_index = ?,
        title = ?, publication_year = ?, journal_name = ?,
        language = ?, sjr = ?, co_authors = ?, keywords = ?, abstract = ?,
        updated_at = CURRENT_TIMESTAMP
  `
  
  const params = [
    authorFullName,
    authorOrcid || null,
    scopusAuthorId || null,
    scopusProfileUrl || null,
    wosProfileUrl || null,
    googleScholarUrl || null,
    parseInt(totalArticles) || 0,
    parseInt(totalCitations) || 0,
    parseInt(hIndex) || 0,
    title,
    parseInt(publicationYear),
    journalName || null,
    language || 'English',
    parseFloat(sjr) || null,
    coAuthors || null,
    keywords || null,
    abstract || null
  ]
  
  // If new file is uploaded
  if (req.file) {
    query += `, file_path = ?, file_name = ?`
    params.push(`/uploads/${req.file.filename}`, req.file.originalname)
  }
  
  query += ` WHERE id = ?`
  params.push(req.params.id)
  
  db.run(query, params, function(err) {
    if (err) {
      console.error('Error updating publication:', err)
      return res.status(500).json({ error: 'Мақолани янгилашда хато' })
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Мақола топилмади' })
    }
    
    res.json({
      success: true,
      message: 'Мақола муваффақиятли янгиланди'
    })
  })
})

// DELETE publication
router.delete('/:id', (req, res) => {
  // First get the file path to delete the file
  db.get('SELECT file_path FROM publications WHERE id = ?', [req.params.id], (err, publication) => {
    if (err) {
      console.error('Error fetching publication:', err)
      return res.status(500).json({ error: 'Мақолани олишда хато' })
    }
    
    if (!publication) {
      return res.status(404).json({ error: 'Мақола топилмади' })
    }
    
    // Delete the file if it exists
    if (publication.file_path) {
      const filePath = path.join(__dirname, '..', publication.file_path)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }
    
    // Delete from database
    db.run('DELETE FROM publications WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        console.error('Error deleting publication:', err)
        return res.status(500).json({ error: 'Мақолани ўчиришда хато' })
      }
      
      res.json({
        success: true,
        message: 'Мақола муваффақиятли ўчирилди'
      })
    })
  })
})

// APPROVE publication
router.patch('/:id/approve', (req, res) => {
  const { approvedBy } = req.body
  
  const query = `
    UPDATE publications 
    SET status = 'approved', approved_by = ?, approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `
  
  db.run(query, [approvedBy, req.params.id], function(err) {
    if (err) {
      console.error('Error approving publication:', err)
      return res.status(500).json({ error: 'Мақолани тасдиқлашда хато' })
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Мақола топилмади' })
    }
    
    // Log activity
    logActivity(null, approvedBy, 'APPROVE_PUBLICATION', `Approved publication ID: ${req.params.id}`)
    
    res.json({
      success: true,
      message: 'Мақола тасдиқланди'
    })
  })
})

// REJECT publication
router.patch('/:id/reject', (req, res) => {
  const query = `
    UPDATE publications 
    SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `
  
  db.run(query, [req.params.id], function(err) {
    if (err) {
      console.error('Error rejecting publication:', err)
      return res.status(500).json({ error: 'Мақолани рад этишда хато' })
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Мақола топилмади' })
    }
    
    res.json({
      success: true,
      message: 'Мақола рад этилди'
    })
  })
})

// GET statistics
router.get('/stats/summary', (req, res) => {
  const { institution } = req.query
  
  let query = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
      SUM(total_citations) as total_citations,
      AVG(h_index) as avg_h_index,
      COUNT(DISTINCT author_full_name) as unique_authors
    FROM publications
  `
  
  const params = []
  
  if (institution && institution !== 'all') {
    query += ' WHERE institution = ?'
    params.push(institution)
  }
  
  db.get(query, params, (err, stats) => {
    if (err) {
      console.error('Error fetching statistics:', err)
      return res.status(500).json({ error: 'Статистикани олишда хато' })
    }
    
    res.json({ success: true, stats })
  })
})

// GET unique authors
router.get('/authors/list', (req, res) => {
  const { institution } = req.query
  
  let query = `
    SELECT 
      author_full_name,
      MAX(total_articles) as total_articles,
      MAX(total_citations) as total_citations,
      MAX(h_index) as h_index,
      MAX(scopus_profile_url) as scopus_profile_url,
      institution,
      institution_name,
      COUNT(*) as publications_count
    FROM publications
  `
  
  const params = []
  
  if (institution && institution !== 'all') {
    query += ' WHERE institution = ?'
    params.push(institution)
  }
  
  query += ' GROUP BY author_full_name, institution ORDER BY total_citations DESC'
  
  db.all(query, params, (err, authors) => {
    if (err) {
      console.error('Error fetching authors:', err)
      return res.status(500).json({ error: 'Муаллифларни олишда хато' })
    }
    
    res.json({ success: true, authors })
  })
})

module.exports = router
