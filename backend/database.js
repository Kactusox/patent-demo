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
      insertSamplePatents()
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
}

// Insert default users
const insertDefaultUsers = () => {
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
    INSERT OR IGNORE INTO users (username, password, role, institution_name, full_name, phone_number)
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

  stmt.finalize()
}

// Insert sample patents with year
const insertSamplePatents = () => {
  const currentYear = new Date().getFullYear()
  const patents = [
    {
      patent_number: 'FAP 2745',
      title: 'Kaolinni kompleks qayta ishlash usuli',
      type: 'Фойдали моделга патент',
      application_number: 'FAP 20240425',
      submission_date: '15.11.2024',
      registration_date: '11.06.2025',
      year: 2024,
      authors: 'ISOQOV MAQSUD UZOQOVICH; TURAMURATOV ILXOMBAY BEKCHANOVICH',
      institution: 'neftgaz',
      institution_name: 'Нефт ва газ конлари геологияси ҳамда қидируви институти',
      status: 'approved',
      created_by: 'neftgaz',
      approved_by: 'admin',
      approved_at: '2025-06-11T14:30:00Z'
    },
    {
      patent_number: 'FAP 2746',
      title: 'Talk namunalarini qayta ishlash usuli',
      type: 'Фойдали моделга патент',
      application_number: 'FAP 20250069',
      submission_date: '26.02.2025',
      registration_date: '11.06.2025',
      year: 2025,
      authors: 'ISOQOV MAQSUD UZOQOVICH; TURAMURATOV ILXOMBAY BEKCHANOVICH',
      institution: 'neftgaz',
      institution_name: 'Нефт ва газ конлари геологияси ҳамда қидируви институти',
      status: 'approved',
      created_by: 'neftgaz',
      approved_by: 'admin',
      approved_at: '2025-06-11T15:00:00Z'
    },
    {
      patent_number: 'FAP 2764',
      title: 'Burg\'ilash koronkasi',
      type: 'Фойдали моделга патент',
      application_number: 'FAP 20240240',
      submission_date: '30.05.2024',
      registration_date: '03.07.2025',
      year: 2024,
      authors: 'KAMALOV MAXMUDJAN TASHKENBAYEVICH',
      institution: 'neftgaz',
      institution_name: 'Нефт ва газ конлари геологияси ҳамда қидируви институти',
      status: 'approved',
      created_by: 'neftgaz',
      approved_by: 'admin',
      approved_at: '2025-07-03T10:45:00Z'
    },
    {
      patent_number: 'FAP 2673',
      title: 'Рангли металлургиянинг техноген хомашёсини эритишни оптималлаштириш усули',
      type: 'Ихтирога патент',
      application_number: 'FAP 20230032',
      submission_date: '07.02.2023',
      registration_date: '24.02.2025',
      year: 2023,
      authors: 'Аллабергенов Роман; Ибрагимов Азиз',
      institution: 'mineral',
      institution_name: 'Минерал ресурслар институти',
      status: 'approved',
      created_by: 'mineral',
      approved_by: 'admin',
      approved_at: '2025-02-24T16:20:00Z'
    },
    {
      patent_number: 'SAP 2712',
      title: 'Buhorо-Xiva neftgazli regioni turli fatsiyali yuqori yura oksford-kimeridj davri karbonat yotqiziqlari',
      type: 'Саноат намунаси патенти',
      application_number: 'SAP 20240203',
      submission_date: '30.10.2024',
      registration_date: '27.05.2025',
      year: 2024,
      authors: 'QARSHIYEV ODASH ABDUGAFFOROVICH; YEVSEYEVA GALINA BORISOVNA; TOKAREVA KSENIYA MUDJAXIDOVNA; KUDASHEVA LILIYA RAFKATOVNA',
      institution: 'neftgaz',
      institution_name: 'Нефт ва газ конлари геологияси ҳамда қидируви институти',
      status: 'approved',
      created_by: 'neftgaz',
      approved_by: 'admin',
      approved_at: '2025-05-27T12:00:00Z'
    },
    {
      patent_number: 'BGU 1905',
      title: 'Farg\'ona neft va gaz regioni Janubiy pog\'onasi mezazoy va kaynozoy yotqiziqlari qatlam suvlarining fizik-kimyoviy xususiyatlari',
      type: 'Маълумотлар базаси гувоҳномаси',
      application_number: 'MB 20250122',
      submission_date: '18.03.2025',
      registration_date: '18.03.2025',
      year: 2025,
      authors: 'QARSHIYEV ODASH ABDUGAFFOROVICH; XUDOYBERDIYEV XAYRULLA FAYZULLAYEVICH; YUSUPOV KARIMBOY BOBOMUROD O\'G\'LI',
      institution: 'neftgaz',
      institution_name: 'Нефт ва газ конлари геологияси ҳамда қидируви институти',
      status: 'approved',
      created_by: 'neftgaz',
      approved_by: 'admin',
      approved_at: '2025-03-18T14:10:00Z'
    },
    {
      patent_number: '008736',
      title: 'Золотосодережащие расслолы заподного Узбекистана (Монографи)',
      type: 'Муаллифлик ҳуқуқи',
      application_number: '008736',
      submission_date: '17.03.2025',
      registration_date: '17.03.2025',
      year: 2025,
      authors: 'Ибрагимов Азиз',
      institution: 'gidro',
      institution_name: 'Гидрогеология ва инженерлик геологияси институти',
      status: 'approved',
      created_by: 'gidro',
      approved_by: 'admin',
      approved_at: '2025-03-17T10:30:00Z'
    },
    {
      patent_number: 'DGU 50085',
      title: 'Uran resurslarini baholash va monitoringi tizimi boʻyicha dasturiy taʼminot',
      type: 'ЭХМ учун дастур',
      application_number: 'DT 202503143',
      submission_date: '14.04.2025',
      registration_date: '29.04.2025',
      year: 2025,
      authors: 'XALILOV AKMAL ABDUJALILOVICH; TEN VIKTOR VALENTINOVICH; ISOQOV MAQSUD UZOQOVICH; MIRZAAXMEDOV MIRZABOBIR MIRZAXAKIM O\'G\'LI; BEGMATOV BEKZOD BAXTIYOR O\'G\'LI',
      institution: 'gidro',
      institution_name: 'Гидрогеология ва инженерлик геологияси институти',
      status: 'approved',
      created_by: 'gidro',
      approved_by: 'admin',
      approved_at: '2025-04-29T11:15:00Z'
    }
  ]

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO patents (
      patent_number, title, type, application_number, submission_date,
      registration_date, year, authors, institution, institution_name, status,
      created_by, approved_by, approved_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  patents.forEach(patent => {
    stmt.run(
      patent.patent_number,
      patent.title,
      patent.type,
      patent.application_number,
      patent.submission_date,
      patent.registration_date,
      patent.year,
      patent.authors,
      patent.institution,
      patent.institution_name,
      patent.status,
      patent.created_by,
      patent.approved_by,
      patent.approved_at
    )
  })

  stmt.finalize()
}

// Helper: Log activity
const logActivity = (userId, username, action, details, ipAddress = null) => {
  const query = `
    INSERT INTO activity_logs (user_id, username, action, details, ip_address)
    VALUES (?, ?, ?, ?, ?)
  `
  
  db.run(query, [userId, username, action, details, ipAddress], (err) => {
    if (err) {
      console.error('Error logging activity:', err)
    }
  })
}

// Initialize database on startup
initDatabase()

module.exports = { db, logActivity }