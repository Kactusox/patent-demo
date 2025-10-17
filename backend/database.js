const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// Create database file
const dbPath = path.join(__dirname, 'patent_system.db')
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message)
  } else {
    console.log('✅ Connected to SQLite database')
  }
})

// Initialize database tables
const initDatabase = () => {
  // Users table - UPDATED with phone
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'institution')),
      institution_name TEXT,
      full_name TEXT,
      phone_number TEXT,
      is_active INTEGER DEFAULT 1,
      access_expires_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating users table:', err.message)
    } else {
      console.log('✅ Users table ready')
      // Add phone column if it doesn't exist
      db.run(`ALTER TABLE users ADD COLUMN phone_number TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Error adding phone column:', err.message)
        }
      })
      insertDefaultUsers()
    }
  })

  // Patents table - UPDATED with year
  db.run(`
    CREATE TABLE IF NOT EXISTS patents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patent_number TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      application_number TEXT UNIQUE NOT NULL,
      submission_date TEXT NOT NULL,
      registration_date TEXT NOT NULL,
      year INTEGER NOT NULL,
      authors TEXT NOT NULL,
      institution TEXT NOT NULL,
      institution_name TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      file_path TEXT,
      file_name TEXT,
      created_by TEXT,
      approved_by TEXT,
      approved_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating patents table:', err.message)
    } else {
      console.log('✅ Patents table ready')
      // Add year column if it doesn't exist
      db.run(`ALTER TABLE patents ADD COLUMN year INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Error adding year column:', err.message)
        }
      })
    }
  })

  // Activity logs table
  db.run(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      username TEXT,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating activity_logs table:', err.message)
    } else {
      console.log('✅ Activity logs table ready')
    }
  })

  // Publications table - NEW for Scopus/Web of Science tracking
  db.run(`
    CREATE TABLE IF NOT EXISTS publications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      
      -- Author Information
      author_full_name TEXT NOT NULL,
      author_orcid TEXT,
      scopus_author_id TEXT,
      scopus_profile_url TEXT,
      wos_profile_url TEXT,
      google_scholar_url TEXT,
      
      -- Author Metrics
      total_articles INTEGER DEFAULT 0,
      total_citations INTEGER DEFAULT 0,
      h_index INTEGER DEFAULT 0,
      
      -- Publication Details
      title TEXT NOT NULL,
      publication_year INTEGER NOT NULL,
      journal_name TEXT,
      doi TEXT,
      publication_type TEXT DEFAULT 'Илмий мақола',
      language TEXT DEFAULT 'English',
      
      -- Impact Metrics
      impact_factor REAL,
      quartile TEXT,
      sjr REAL,
      
      -- Additional Information
      co_authors TEXT,
      research_field TEXT,
      keywords TEXT,
      abstract TEXT,
      
      -- Institution
      institution TEXT NOT NULL,
      institution_name TEXT NOT NULL,
      
      -- File
      file_path TEXT,
      file_name TEXT,
      
      -- Status
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      
      -- Metadata
      created_by TEXT,
      approved_by TEXT,
      approved_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating publications table:', err.message)
    } else {
      console.log('✅ Publications table ready')
      
      // Create indexes for better performance
      db.run('CREATE INDEX IF NOT EXISTS idx_publications_author ON publications(author_full_name)')
      db.run('CREATE INDEX IF NOT EXISTS idx_publications_year ON publications(publication_year)')
      db.run('CREATE INDEX IF NOT EXISTS idx_publications_institution ON publications(institution)')
      db.run('CREATE INDEX IF NOT EXISTS idx_publications_status ON publications(status)')
    }
  })
}

// Insert default users
const insertDefaultUsers = () => {
  // Check if users already exist
  db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
    if (err) {
      console.error('Error checking users:', err)
      return
    }
    
    // Only insert if no users exist
    if (row.count > 0) {
      console.log('✅ Users already exist, skipping default user insertion')
      return
    }
    
    console.log('📝 Inserting default users...')
    const users = [
      {
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        full_name: 'Система администратори',
        phone_number: '+998901234567'
      },
      {
        username: 'neftgaz',
        password: 'neftgaz123',
        role: 'institution',
        institution_name: 'Нефт ва газ конлари геологияси ҳамда қидируви институти',
        full_name: 'Нефт ва газ институти',
        phone_number: '+998901234568'
      },
      {
        username: 'mineral',
        password: 'mineral123',
        role: 'institution',
        institution_name: 'Минерал ресурслар институти',
        full_name: 'Минерал ресурслар институти',
        phone_number: '+998901234569'
      },
      {
        username: 'gidro',
        password: 'gidro123',
        role: 'institution',
        institution_name: 'Гидрогеология ва инженерлик геологияси институти',
        full_name: 'Гидрогеология институти',
        phone_number: '+998901234570'
      },
      {
        username: 'geofizika',
        password: 'geofizika123',
        role: 'institution',
        institution_name: 'Ҳ.М. Абдуллаев номидаги геология ва геофизика институти',
        full_name: 'Геофизика институти',
        phone_number: '+998901234571'
      }
    ]

    const stmt = db.prepare(`
      INSERT INTO users (username, password, role, institution_name, full_name, phone_number)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    users.forEach(user => {
      stmt.run(
        user.username,
        user.password,
        user.role,
        user.institution_name || null,
        user.full_name,
        user.phone_number
      )
    })

    stmt.finalize(() => {
      console.log('✅ Default users inserted successfully')
    })
  })
}


// Helper: Log activity
const logActivity = (userId, username, action, details, ipAddress = null) => {
  const query = `
    INSERT INTO activity_logs (user_id, action, details, ip_address)
    VALUES (?, ?, ?, ?)
  `
  
  db.run(query, [userId, action, details, ipAddress], (err) => {
    if (err) {
      console.error('Error logging activity:', err)
    }
  })
}

// Initialize database on startup
initDatabase()

module.exports = { db, logActivity }