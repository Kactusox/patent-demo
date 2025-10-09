const express = require('express')
const router = express.Router()
const archiver = require('archiver')
const path = require('path')
const fs = require('fs')
const { db } = require('../database')

// Download all files as ZIP (organized by type and date)
router.get('/download-zip', async (req, res) => {
  try {
    const { institution } = req.query
    
    // Query patents
    let query = 'SELECT * FROM patents WHERE file_path IS NOT NULL'
    const params = []
    
    if (institution && institution !== 'all') {
      query += ' AND institution = ?'
      params.push(institution)
    }
    
    db.all(query, params, (err, patents) => {
      if (err) {
        console.error('Error fetching patents:', err)
        return res.status(500).json({ error: 'Патентларни олишда хато' })
      }

      if (patents.length === 0) {
        return res.status(404).json({ error: 'Файллар топилмади' })
      }

      // Create ZIP archive
      const archive = archiver('zip', { zlib: { level: 9 } })
      
      // Set response headers
      const downloadDate = new Date().toISOString().split('T')[0]
      const filename = institution && institution !== 'all' 
        ? `patents_${institution}_${downloadDate}.zip`
        : `patents_all_${downloadDate}.zip`
      
      res.attachment(filename)
      archive.pipe(res)

      // Group patents by type
      const patentsByType = {}
      patents.forEach(patent => {
        if (!patentsByType[patent.type]) {
          patentsByType[patent.type] = []
        }
        patentsByType[patent.type].push(patent)
      })

      // Add files to archive organized by type
      Object.entries(patentsByType).forEach(([type, typePatents]) => {
        const folderName = `${type} (${downloadDate})`
        
        typePatents.forEach(patent => {
          const filePath = path.join(__dirname, '..', patent.file_path)
          
          if (fs.existsSync(filePath)) {
            const fileExt = path.extname(patent.file_name)
            const fileName = `${patent.patent_number}${fileExt}`
            archive.file(filePath, { name: `${folderName}/${fileName}` })
          }
        })
      })

      // Finalize archive
      archive.finalize()
    })
  } catch (error) {
    console.error('Error creating ZIP:', error)
    res.status(500).json({ error: 'ZIP яратишда хато' })
  }
})

// Export data to Excel JSON (frontend will create Excel)
router.get('/export-excel', (req, res) => {
  try {
    const { institution } = req.query
    
    // Query patents
    let query = `
      SELECT 
        patent_number, title, type, application_number, 
        submission_date, registration_date, year, authors, 
        institution, institution_name, status, 
        created_at, approved_by, approved_at
      FROM patents
    `
    const params = []
    
    if (institution && institution !== 'all') {
      query += ' WHERE institution = ?'
      params.push(institution)
    }
    
    query += ' ORDER BY year DESC, created_at DESC'
    
    db.all(query, params, (err, patents) => {
      if (err) {
        console.error('Error fetching patents:', err)
        return res.status(500).json({ error: 'Патентларни олишда хато' })
      }

      // Group by institution for separate sheets
      const groupedData = {}
      
      patents.forEach(patent => {
        if (!groupedData[patent.institution]) {
          groupedData[patent.institution] = []
        }
        
        groupedData[patent.institution].push({
          'Патент рақами': patent.patent_number,
          'Номи': patent.title,
          'Тури': patent.type,
          'Талабнома рақами': patent.application_number,
          'Топширилган сана': patent.submission_date,
          'Рўйхатдан ўтказилган сана': patent.registration_date,
          'Йил': patent.year,
          'Муаллифлар': patent.authors,
          'Муассаса': patent.institution_name,
          'Ҳолати': patent.status === 'approved' ? 'Тасдиқланган' : 
                    patent.status === 'pending' ? 'Кутилмоқда' : 'Рад этилган',
          'Тасдиқлаган': patent.approved_by || '',
          'Тасдиқланган сана': patent.approved_at || ''
        })
      })

      res.json({
        success: true,
        data: groupedData,
        totalCount: patents.length
      })
    })
  } catch (error) {
    console.error('Error exporting data:', error)
    res.status(500).json({ error: 'Маълумотларни экспорт қилишда хато' })
  }
})

// Get export statistics
router.get('/stats', (req, res) => {
  try {
    const { institution } = req.query
    
    let query = 'SELECT type, COUNT(*) as count FROM patents WHERE 1=1'
    const params = []
    
    if (institution && institution !== 'all') {
      query += ' AND institution = ?'
      params.push(institution)
    }
    
    query += ' GROUP BY type'
    
    db.all(query, params, (err, stats) => {
      if (err) {
        console.error('Error fetching stats:', err)
        return res.status(500).json({ error: 'Статистикани олишда хато' })
      }

      // Count files with actual file_path
      let fileQuery = 'SELECT COUNT(*) as count FROM patents WHERE file_path IS NOT NULL'
      const fileParams = []
      
      if (institution && institution !== 'all') {
        fileQuery += ' AND institution = ?'
        fileParams.push(institution)
      }
      
      db.get(fileQuery, fileParams, (err, fileCount) => {
        if (err) {
          console.error('Error counting files:', err)
          return res.status(500).json({ error: 'Файлларни санашда хато' })
        }

        res.json({
          success: true,
          byType: stats,
          totalFiles: fileCount.count
        })
      })
    })
  } catch (error) {
    console.error('Error getting stats:', error)
    res.status(500).json({ error: 'Статистикани олишда хато' })
  }
})

// Download publications as ZIP
router.get('/download-publications-zip', async (req, res) => {
  try {
    const { institution } = req.query
    
    // Query publications
    let query = 'SELECT * FROM publications WHERE file_path IS NOT NULL'
    const params = []
    
    if (institution && institution !== 'all') {
      query += ' AND institution = ?'
      params.push(institution)
    }
    
    db.all(query, params, (err, publications) => {
      if (err) {
        console.error('Error fetching publications:', err)
        return res.status(500).json({ error: 'Мақолаларни олишда хато' })
      }

      if (publications.length === 0) {
        return res.status(404).json({ error: 'Файллар топилмади' })
      }

      // Create ZIP archive
      const archive = archiver('zip', { zlib: { level: 9 } })
      
      // Set response headers
      const downloadDate = new Date().toISOString().split('T')[0]
      const filename = institution && institution !== 'all' 
        ? `publications_${institution}_${downloadDate}.zip`
        : `publications_all_${downloadDate}.zip`
      
      res.attachment(filename)
      archive.pipe(res)

      // Group publications by author
      const pubsByAuthor = {}
      publications.forEach(pub => {
        const authorKey = pub.author_full_name
        if (!pubsByAuthor[authorKey]) {
          pubsByAuthor[authorKey] = []
        }
        pubsByAuthor[authorKey].push(pub)
      })

      // Add files to archive organized by author
      Object.entries(pubsByAuthor).forEach(([author, authorPubs]) => {
        const folderName = `${author}`
        
        authorPubs.forEach(pub => {
          const filePath = path.join(__dirname, '..', pub.file_path)
          
          if (fs.existsSync(filePath)) {
            const fileExt = path.extname(pub.file_name)
            const fileName = `${pub.publication_year}_${pub.title.substring(0, 50).replace(/[^a-zA-Z0-9]/g, '_')}${fileExt}`
            archive.file(filePath, { name: `${folderName}/${fileName}` })
          }
        })
      })

      // Finalize archive
      archive.finalize()
    })
  } catch (error) {
    console.error('Error creating publications ZIP:', error)
    res.status(500).json({ error: 'ZIP яратишда хато' })
  }
})

// Export publications to Excel
router.get('/export-publications-excel', (req, res) => {
  try {
    const { institution } = req.query
    
    let query = 'SELECT * FROM publications ORDER BY publication_year DESC, author_full_name ASC'
    const params = []
    
    if (institution && institution !== 'all') {
      query = 'SELECT * FROM publications WHERE institution = ? ORDER BY publication_year DESC, author_full_name ASC'
      params.push(institution)
    }
    
    db.all(query, params, (err, publications) => {
      if (err) {
        console.error('Error fetching publications:', err)
        return res.status(500).json({ error: 'Мақолаларни олишда хато' })
      }

      // Format data for Excel
      const excelData = publications.map(pub => ({
        'Муаллиф': pub.author_full_name,
        'Мақола номи': pub.title,
        'Журнал': pub.journal_name || 'N/A',
        'Йил': pub.publication_year,
        'DOI': pub.doi || 'N/A',
        'Тур': pub.publication_type,
        'Quartile': pub.quartile || 'N/A',
        'Impact Factor': pub.impact_factor || 'N/A',
        'Жами мақолалар': pub.total_articles,
        'Жами iqtibosлар': pub.total_citations,
        'h-индекс': pub.h_index,
        'Ҳаммуаллифлар': pub.co_authors || 'N/A',
        'Соҳа': pub.research_field || 'N/A',
        'Муассаса': pub.institution_name,
        'Scopus профил': pub.scopus_profile_url || 'N/A',
        'Ҳолат': pub.status === 'approved' ? 'Тасдиқланган' : pub.status === 'pending' ? 'Кутилмоқда' : 'Рад этилган',
        'Қўшилган сана': pub.created_at
      }))

      res.json({
        success: true,
        data: excelData,
        fileName: institution && institution !== 'all' 
          ? `publications_${institution}_${new Date().toISOString().split('T')[0]}.xlsx`
          : `publications_all_${new Date().toISOString().split('T')[0]}.xlsx`
      })
    })
  } catch (error) {
    console.error('Error exporting publications:', error)
    res.status(500).json({ error: 'Экспорт қилишда хато' })
  }
})

module.exports = router