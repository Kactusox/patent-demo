// Validation middleware for patent management system

// Validate patent data
const validatePatent = (req, res, next) => {
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
    institutionName
  } = req.body

  const errors = []

  // Required fields validation
  if (!patentNumber || patentNumber.trim().length === 0) {
    errors.push('Патент рақами киритилмаган')
  }

  if (!title || title.trim().length === 0) {
    errors.push('Ихтиро номи киритилмаган')
  }

  if (!type || type.trim().length === 0) {
    errors.push('Патент тури танланмаган')
  }

  if (!applicationNumber || applicationNumber.trim().length === 0) {
    errors.push('Талабнома рақами киритилмаган')
  }

  if (!submissionDate || submissionDate.trim().length === 0) {
    errors.push('Топширилган сана киритилмаган')
  }

  if (!registrationDate || registrationDate.trim().length === 0) {
    errors.push('Рўйхатдан ўтказилган сана киритилмаган')
  }

  if (!year) {
    errors.push('Йил киритилмаган')
  }

  if (!authors || authors.trim().length === 0) {
    errors.push('Муаллифлар киритилмаган')
  }

  if (!institution || institution.trim().length === 0) {
    errors.push('Муассаса танланмаган')
  }

  if (!institutionName || institutionName.trim().length === 0) {
    errors.push('Муассаса номи киритилмаган')
  }

  // Format validation
  if (patentNumber && !/^[A-Z0-9\s]+$/.test(patentNumber.trim())) {
    errors.push('Патент рақами нотўғри форматда')
  }

  if (applicationNumber && !/^[A-Z0-9\s]+$/.test(applicationNumber.trim())) {
    errors.push('Талабнома рақами нотўғри форматда')
  }

  // Year validation
  if (year) {
    const currentYear = new Date().getFullYear()
    const patentYear = parseInt(year)
    
    if (isNaN(patentYear) || patentYear < 2000 || patentYear > currentYear) {
      errors.push(`Йил 2000 дан ${currentYear} гача бўлиши керак`)
    }
  }

  // Date validation
  if (submissionDate) {
    const subDate = new Date(submissionDate)
    if (isNaN(subDate.getTime())) {
      errors.push('Топширилган сана нотўғри форматда')
    }
  }

  if (registrationDate) {
    const regDate = new Date(registrationDate)
    if (isNaN(regDate.getTime())) {
      errors.push('Рўйхатдан ўтказилган сана нотўғри форматда')
    }
  }

  // Authors validation
  if (authors && authors.split(';').length < 1) {
    errors.push('Камида битта муаллиф киритинг')
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Валидация хатоси',
      details: errors
    })
  }

  next()
}

// Validate user data
const validateUser = (req, res, next) => {
  const {
    username,
    password,
    role,
    institutionName,
    fullName,
    phoneNumber
  } = req.body

  const errors = []

  // Required fields validation
  if (!username || username.trim().length === 0) {
    errors.push('Фойдаланувчи номи киритилмаган')
  }

  if (!password || password.length < 6) {
    errors.push('Парол камида 6 та белгидан иборат бўлиши керак')
  }

  if (!role || !['admin', 'institution'].includes(role)) {
    errors.push('Роль нотўғри танланган')
  }

  if (role === 'institution' && (!institutionName || institutionName.trim().length === 0)) {
    errors.push('Муассаса номи киритилмаган')
  }

  if (!fullName || fullName.trim().length === 0) {
    errors.push('Тўлиқ исм киритилмаган')
  }

  // Format validation
  if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Фойдаланувчи номи фақат ҳарф, рақам ва _ белгисини ўз ичига олиши керак')
  }

  if (phoneNumber && !/^\+998\d{9}$/.test(phoneNumber)) {
    errors.push('Телефон рақами нотўғри форматда. Намуна: +998901234567')
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Валидация хатоси',
      details: errors
    })
  }

  next()
}

// Validate login data
const validateLogin = (req, res, next) => {
  const { username, password } = req.body

  const errors = []

  if (!username || username.trim().length === 0) {
    errors.push('Фойдаланувчи номи киритилмаган')
  }

  if (!password || password.length === 0) {
    errors.push('Парол киритилмаган')
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Валидация хатоси',
      details: errors
    })
  }

  next()
}

// Sanitize input data
const sanitizeInput = (req, res, next) => {
  // Sanitize string inputs
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str
    return str.trim().replace(/[<>]/g, '')
  }

  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key])
      }
    })
  }

  next()
}

module.exports = {
  validatePatent,
  validateUser,
  validateLogin,
  sanitizeInput
}