import { useState, useEffect } from 'react'
import { Row, Col, Card, Button, Badge, Table, Form, Modal, Alert, InputGroup, Spinner } from 'react-bootstrap'
import { 
  FaHome, FaFileAlt, FaUpload, FaUser, FaSignOutAlt, FaBuilding, 
  FaCheckCircle, FaClock, FaEye, FaEdit, FaTrash, FaExclamationTriangle,
  FaDownload, FaSave, FaTimes, FaSearch, FaBook
} from 'react-icons/fa'
import { getCurrentUser } from '../utils/auth'
import { logout } from '../services/authService'
import { 
  getAllPatents, 
  createPatent, 
  updatePatent, 
  deletePatent, 
  checkDuplicate,
  downloadPatent 
} from '../services/patentService'
import { changePassword } from '../services/userService'
import { downloadZipFile, exportToExcel, getExportStats } from '../services/exportService'
import { PATENT_TYPES } from '../utils/patentData'
import PublicationsDashboard from './PublicationsDashboard'

// Import institution logos
import neftgazLogo from '../images/neftgazlogo.png'
import mineralLogo from '../images/mrilogo.jpg'
import gidroLogo from '../images/gidrologo.webp'
import geofizikaLogo from '../images/ggilogo.png'

// Institution logo mapping
const INSTITUTION_LOGOS = {
  neftgaz: neftgazLogo,
  mineral: mineralLogo,
  gidro: gidroLogo,
  geofizika: geofizikaLogo
}


const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPatent, setSelectedPatent] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [patents, setPatents] = useState([])
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    patentNumber: '',
    title: '',
    type: '',
    applicationNumber: '',
    submissionDate: '',
    registrationDate: '',
    year: new Date().getFullYear(),
    authors: '',
    file: null
  })
  const [formErrors, setFormErrors] = useState({})
  const [duplicateWarning, setDuplicateWarning] = useState('')
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)
  
  // Export state
  const [exportStats, setExportStats] = useState(null)
  const [exportLoading, setExportLoading] = useState(false)

  const currentUser = getCurrentUser()
  
  // Load patents on mount
  useEffect(() => {
    loadPatents()
  }, [])
  
  // Load export stats when documents tab is active
  useEffect(() => {
    if (activeTab === 'documents') {
      loadExportStats()
    }
  }, [activeTab])

  const loadPatents = async () => {
    setLoading(true)
    try {
      const allPatents = await getAllPatents({ institution: currentUser.name })
      setPatents(allPatents)
    } catch (error) {
      console.error('Error loading patents:', error)
      alert('Патентларни юклашда хато: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter patents by search
  const filteredPatents = searchQuery 
    ? patents.filter(p => 
        p.patent_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.application_number.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : patents

  const stats = [
    { 
      label: 'Жами ҳужжатлар', 
      value: patents.length.toString(), 
      icon: FaFileAlt, 
      color: '#0d6efd',
      bgColor: '#e7f1ff'
    },
    { 
      label: 'Тасдиқланган', 
      value: patents.filter(p => p.status === 'approved').length.toString(), 
      icon: FaCheckCircle, 
      color: '#198754',
      bgColor: '#d1f7e5'
    },
    { 
      label: 'Кутилмоқда', 
      value: patents.filter(p => p.status === 'pending').length.toString(), 
      icon: FaClock, 
      color: '#ffc107',
      bgColor: '#fff3cd'
    }
  ]

  const handleLogout = () => {
    if (window.confirm('Тизимдан чиқмоқчимисиз?')) {
      logout()
    }
  }

  const handleFormChange = async (e) => {
    const { name, value, files } = e.target
    
    if (name === 'file') {
      if (files[0]) {
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (files[0].size > maxSize) {
          alert('⚠️ Файл ҳажми 10MB дан кичик бўлиши керак!')
          e.target.value = '' // Clear input
          return
        }
        setFormData(prev => ({ ...prev, file: files[0] }))
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }

    // Check for duplicates when application number changes
    if (name === 'applicationNumber' && value) {
      const duplicate = await checkDuplicate(value)
      if (duplicate) {
        setDuplicateWarning(`⚠️ Огоҳлантириш: Бу талабнома рақами аллақачон мавжуд (${duplicate.patentNumber})`)
      } else {
        setDuplicateWarning('')
      }
    }
  }

  const validateForm = () => {
    const errors = {}
    const isCopyright = formData.type === 'Муаллифлик ҳуқуқи'
    
    if (!formData.patentNumber.trim()) {
      errors.patentNumber = isCopyright ? 'Гувоҳнома рақамини киритинг' : 'Патент рақамини киритинг'
    }
    if (!formData.title.trim()) {
      errors.title = isCopyright ? 'Муаллифлик ҳуқуқи номини киритинг' : 'Ихтиро номини киритинг'
    }
    if (!formData.type) {
      errors.type = 'Турини танланг'
    }
    
    // Application number only for non-copyright types
    if (!isCopyright && !formData.applicationNumber.trim()) {
      errors.applicationNumber = 'Талабнома рақамини киритинг'
    }
    
    // Submission date only for non-copyright types
    if (!isCopyright && !formData.submissionDate) {
      errors.submissionDate = 'Топширилган санани киритинг'
    }
    
    if (!formData.registrationDate) {
      errors.registrationDate = isCopyright ? 'Реестрга киритилган санани киритинг' : 'Рўйхатдан ўтказилган санани киритинг'
    }
    if (!formData.year) {
      errors.year = 'Йилни танланг'
    }
    const currentYear = new Date().getFullYear()
    if (formData.year && (formData.year < 2000 || formData.year > currentYear)) {
      errors.year = `Йил 2000 дан ${currentYear} гача бўлиши керак`
    }
    if (!formData.authors.trim()) {
      errors.authors = 'Камида битта муаллиф киритинг'
    }
    if (!formData.file && !selectedPatent) {
      errors.file = 'Файлни юкланг'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      const patentData = {
        patentNumber: formData.patentNumber,
        title: formData.title,
        type: formData.type,
        applicationNumber: formData.applicationNumber,
        submissionDate: formData.submissionDate,
        registrationDate: formData.registrationDate,
        year: formData.year,
        authors: formData.authors,
        institution: currentUser.name,
        institutionName: currentUser.fullName,
        createdBy: currentUser.username
      }

      if (selectedPatent) {
        // Update existing patent
        await updatePatent(selectedPatent.id, patentData, formData.file)
        alert('Патент муваффақиятли янгиланди!')
      } else {
        // Create new patent
        await createPatent(patentData, formData.file)
        alert('Патент муваффақиятли қўшилди!\n\nАдмин тасдиқлагандан сўнг кўринади.')
      }

      // Reload patents
      await loadPatents()

      // Reset form
      resetForm()
      setShowUploadModal(false)
      setShowEditModal(false)
    } catch (error) {
      console.error('Error submitting patent:', error)
      alert('Хато: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      patentNumber: '',
      title: '',
      type: '',
      applicationNumber: '',
      submissionDate: '',
      registrationDate: '',
      year: new Date().getFullYear(),
      authors: '',
      file: null
    })
    setFormErrors({})
    setDuplicateWarning('')
    setSelectedPatent(null)
  }

  const handleView = (patent) => {
    setSelectedPatent(patent)
    setShowViewModal(true)
  }

  const handleEdit = (patent) => {
    setSelectedPatent(patent)
    setFormData({
      patentNumber: patent.patent_number,
      title: patent.title,
      type: patent.type,
      applicationNumber: patent.application_number,
      submissionDate: patent.submission_date,
      registrationDate: patent.registration_date,
      year: patent.year || new Date().getFullYear(),
      authors: patent.authors,
      file: null
    })
    setShowEditModal(true)
  }

  const handleDelete = (patent) => {
    setSelectedPatent(patent)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    setSubmitting(true)
    try {
      await deletePatent(selectedPatent.id)
      alert('Патент муваффақиятли ўчирилди')
      await loadPatents()
      setShowDeleteModal(false)
      setSelectedPatent(null)
    } catch (error) {
      console.error('Error deleting patent:', error)
      alert('Ўчиришда хато: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownload = (patent) => {
    downloadPatent(patent)
  }
  
  // Load export stats
  const loadExportStats = async () => {
    try {
      const stats = await getExportStats(currentUser.name)
      setExportStats(stats)
    } catch (error) {
      console.error('Error loading export stats:', error)
    }
  }
  
  // Export handlers
  const handleDownloadZip = async () => {
    setExportLoading(true)
    try {
      await downloadZipFile(currentUser.name)
      // Success - file will download automatically
    } catch (error) {
      console.error('Error downloading ZIP:', error)
      alert('ZIP юклашда хато: ' + error.message)
    } finally {
      setExportLoading(false)
    }
  }

  const handleExportExcel = async () => {
    setExportLoading(true)
    try {
      await exportToExcel(currentUser.name)
      alert('Excel файли муваффақиятли юклаб олинди!')
    } catch (error) {
      console.error('Error exporting Excel:', error)
      alert('Excel экспорт қилишда хато: ' + error.message)
    } finally {
      setExportLoading(false)
    }
  }
  
  // Password change handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
    
    // Clear error for this field
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }))
    }
  }
  
  const validatePasswordForm = () => {
    const errors = {}
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Жорий паролни киритинг'
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'Янги паролни киритинг'
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Парол камида 6 та белгидан иборат бўлиши керак'
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Паролни тасдиқланг'
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Паролlar мос келмади'
    }
    
    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (!validatePasswordForm()) {
      return
    }
    
    setPasswordSubmitting(true)
    try {
      await changePassword(
        currentUser.id,
        passwordData.currentPassword,
        passwordData.newPassword
      )
      
      alert('Парол муваффақиятли ўзгартирилди!')
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setPasswordErrors({})
    } catch (error) {
      console.error('Error changing password:', error)
      alert('Паролни ўзгартиришда хато: ' + error.message)
    } finally {
      setPasswordSubmitting(false)
    }
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              {/* <FaBuilding /> */}
              {INSTITUTION_LOGOS[currentUser?.name] ? (
                <img 
                  src={INSTITUTION_LOGOS[currentUser?.name]} 
                  alt={`${currentUser?.fullName} Logo`} 
                  className="sidebar-logo" 
                />
              ) : (
                <FaBuilding />
              )}
            </div>
            <div className="sidebar-brand-text">
              <h5>Институт Панели</h5>
              <small>Patent System</small>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item">
            <a 
              href="#" 
              className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('overview'); }}
            >
              <FaHome className="nav-icon" />
              <span>Асосий</span>
            </a>
          </div>
          <div className="nav-item">
            <a 
              href="#" 
              className={`nav-link ${activeTab === 'documents' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('documents'); }}
            >
              <FaFileAlt className="nav-icon" />
              <span>Менинг ҳужжатларим</span>
              <Badge bg="light" text="dark" className="ms-auto">
                {patents.length}
              </Badge>
            </a>
          </div>
          <div className="nav-item">
            <a 
              href="#" 
              className={`nav-link ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setShowUploadModal(true); }}
            >
              <FaUpload className="nav-icon" />
              <span>Янги қўшиш</span>
            </a>
          </div>
          <div className="nav-item">
            <a 
              href="#" 
              className={`nav-link ${activeTab === 'publications' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('publications'); }}
            >
              <FaBook className="nav-icon" />
              <span>Илмий мақолалар</span>
            </a>
          </div>
          <div className="nav-item">
            <a 
              href="#" 
              className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('profile'); }}
            >
              <FaUser className="nav-icon" />
              <span>Профил</span>
            </a>
          </div>
          <div className="nav-item mt-4">
            <a 
              href="#" 
              className="nav-link text-danger"
              onClick={(e) => { e.preventDefault(); handleLogout(); }}
            >
              <FaSignOutAlt className="nav-icon" />
              <span>Чиқиш</span>
            </a>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Navbar */}
        <div className="top-navbar">
          <Row className="align-items-center">
            <Col>
              <div className="navbar-welcome">
                <h4>Хуш келибсиз!</h4>
                <p className="text-muted mb-0">
                  <FaBuilding className="me-2" />
                  {currentUser?.fullName}
                </p>
              </div>
            </Col>
            <Col xs="auto">
              <Button 
                variant="primary"
                onClick={() => setShowUploadModal(true)}
              >
                <FaUpload className="me-2" />
                Янги қўшиш
              </Button>
            </Col>
          </Row>
        </div>

        {/* Content Section */}
        <div className="content-section">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              {/* Statistics Cards */}
              <Row className="g-4 mb-4">
                {stats.map((stat, idx) => (
                  <Col key={idx} xs={12} sm={6} lg={4}>
                    <Card className="stats-card border-0 h-100">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <p className="text-muted mb-1 small">{stat.label}</p>
                            <h2 className="mb-0 fw-bold">{stat.value}</h2>
                          </div>
                          <div 
                            className="stats-icon" 
                            style={{ backgroundColor: stat.bgColor, color: stat.color }}
                          >
                            <stat.icon />
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Welcome Card */}
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-3">Марҳабо!</h5>
                  <p className="mb-3">
                    Сиз патент бошқарув тизимига муваффақиятли кирдингиз. 
                    Бу ерда сиз ўз ҳужжатларингизни бошқаришингиз, янги патентлар қўшишингиз ва мавжуд маълумотларни кўришингиз мумкин.
                  </p>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="primary"
                      onClick={() => setShowUploadModal(true)}
                    >
                      <FaUpload className="me-2" />
                      Янги ҳужжат қўшиш
                    </Button>
                    <Button 
                      variant="outline-primary"
                      onClick={() => setActiveTab('documents')}
                    >
                      <FaFileAlt className="me-2" />
                      Ҳужжатларни кўриш
                    </Button>
                  </div>
                </Card.Body>
              </Card>

              {/* Recent Documents */}
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom py-3">
                  <h5 className="mb-0 fw-bold">Сўнгги ҳужжатлар</h5>
                </Card.Header>
                <Card.Body className="p-0">
                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <p className="text-muted mt-3">Юкланмоқда...</p>
                    </div>
                  ) : patents.length === 0 ? (
                    <div className="text-center py-5">
                      <FaFileAlt size={48} className="text-muted mb-3" />
                      <p className="text-muted mb-0">Ҳозирча ҳужжатлар йўқ</p>
                    </div>
                  ) : (
                    <Table responsive hover className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th className="px-4 py-3">Патент рақами</th>
                          <th className="px-4 py-3">Номи</th>
                          <th className="px-4 py-3 text-center">Ҳолати</th>
                          <th className="px-4 py-3 text-center">Амаллар</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patents.slice(0, 5).map((patent) => (
                          <tr key={patent.id}>
                            <td className="px-4 py-3">
                              <Badge bg="primary">{patent.patent_number}</Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-truncate" style={{ maxWidth: 400 }}>
                                {patent.title}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {patent.status === 'approved' && (
                                <Badge bg="success">
                                  <FaCheckCircle className="me-1" /> Тасдиқланган
                                </Badge>
                              )}
                              {patent.status === 'pending' && (
                                <Badge bg="warning">
                                  <FaClock className="me-1" /> Кутилмоқда
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => handleView(patent)}
                              >
                                <FaEye />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </>
          )}

          {/* DOCUMENTS TAB */}
          {activeTab === 'documents' && (
            <>
              {/* Search Bar */}
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Патент рақами, номи ёки талабнома рақами бўйича қидириш..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <Button 
                        variant="outline-secondary"
                        onClick={() => setSearchQuery('')}
                      >
                        <FaTimes />
                      </Button>
                    )}
                  </InputGroup>
                  
                  {/* Export Buttons Row */}
                  <Row className="mt-3">
                    <Col>
                      <div className="d-flex gap-2 align-items-center">
                        <Button 
                          variant="success" 
                          size="sm"
                          onClick={handleDownloadZip}
                          disabled={exportLoading || filteredPatents.length === 0}
                        >
                          {exportLoading ? (
                            <Spinner animation="border" size="sm" className="me-2" />
                          ) : (
                            <FaDownload className="me-2" />
                          )}
                          ZIP юклаб олиш
                        </Button>
                        
                        <Button 
                          variant="info" 
                          size="sm"
                          onClick={handleExportExcel}
                          disabled={exportLoading || filteredPatents.length === 0}
                        >
                          {exportLoading ? (
                            <Spinner animation="border" size="sm" className="me-2" />
                          ) : (
                            <FaDownload className="me-2" />
                          )}
                          Excel экспорт
                        </Button>
                        
                        {exportStats && (
                          <small className="text-muted ms-3">
                            Жами файллар: <strong>{exportStats.totalFiles}</strong>
                            {exportStats.byType && exportStats.byType.length > 0 && (
                              <span className="ms-2">
                                ({exportStats.byType.map(t => `${t.type}: ${t.count}`).join(', ')})
                              </span>
                            )}
                          </small>
                        )}
                      </div>
                    </Col>
                  </Row>
                  
                  {searchQuery && (
                    <small className="text-muted mt-2 d-block">
                      Топилди: <strong>{filteredPatents.length}</strong> натижа
                    </small>
                  )}
                </Card.Body>
              </Card>

              {/* Documents Table */}
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom py-3">
                  <h5 className="mb-0 fw-bold">
                    <FaFileAlt className="me-2 text-primary" />
                    Менинг ҳужжатларим
                  </h5>
                </Card.Header>
                <Card.Body className="p-0">
                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <p className="text-muted mt-3">Юкланмоқда...</p>
                    </div>
                  ) : filteredPatents.length === 0 ? (
                    <div className="text-center py-5">
                      <FaFileAlt size={48} className="text-muted mb-3" />
                      <p className="text-muted mb-3">
                        {searchQuery ? 'Ҳеч қандай натижа топилмади' : 'Ҳозирча ҳужжатлар йўқ'}
                      </p>
                      {!searchQuery && (
                        <Button 
                          variant="primary"
                          onClick={() => setShowUploadModal(true)}
                        >
                          <FaUpload className="me-2" />
                          Биринчи ҳужжатни қўшиш
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table hover className="mb-0">
                        <thead className="bg-light">
                          <tr>
                            <th className="px-4 py-3">№</th>
                            <th className="px-4 py-3">Патент рақами</th>
                            <th className="px-4 py-3">Номи</th>
                            <th className="px-4 py-3">Тури</th>
                            <th className="px-4 py-3 text-center">Ҳолати</th>
                            <th className="px-4 py-3 text-center">Амаллар</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPatents.map((patent, idx) => (
                            <tr key={patent.id}>
                              <td className="px-4 py-3">{idx + 1}</td>
                              <td className="px-4 py-3">
                                <Badge bg="primary" className="font-monospace">
                                  {patent.patent_number}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-truncate" style={{ maxWidth: 300 }}>
                                  {patent.title}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <small className="text-muted">{patent.type}</small>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {patent.status === 'approved' && (
                                  <Badge bg="success">
                                    <FaCheckCircle className="me-1" /> Тасдиқланган
                                  </Badge>
                                )}
                                {patent.status === 'pending' && (
                                  <Badge bg="warning">
                                    <FaClock className="me-1" /> Кутилмоқда
                                  </Badge>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="d-flex gap-2 justify-content-center">
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    onClick={() => handleView(patent)}
                                    title="Кўриш"
                                  >
                                    <FaEye />
                                  </Button>
                                  <Button 
                                    variant="outline-success" 
                                    size="sm"
                                    onClick={() => handleDownload(patent)}
                                    title="Юклаб олиш"
                                    disabled={!patent.file_path}
                                  >
                                    <FaDownload />
                                  </Button>
                                  <Button 
                                    variant="outline-warning" 
                                    size="sm"
                                    onClick={() => handleEdit(patent)}
                                    title="Таҳрирлаш"
                                  >
                                    <FaEdit />
                                  </Button>
                                  <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    onClick={() => handleDelete(patent)}
                                    title="Ўчириш"
                                  >
                                    <FaTrash />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <Row className="g-4">
              <Col md={6}>
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-white border-bottom">
                    <h5 className="mb-0 fw-bold">Профил маълумотлари</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <label className="text-muted mb-1 small">Фойдаланувчи номи</label>
                      <p className="fw-semibold mb-0">{currentUser?.username}</p>
                    </div>
                    <div className="mb-3">
                      <label className="text-muted mb-1 small">Муассаса</label>
                      <p className="fw-semibold mb-0">{currentUser?.fullName}</p>
                    </div>
                    <div className="mb-3">
                      <label className="text-muted mb-1 small">Роль</label>
                      <p className="mb-0">
                        <Badge bg="info">Институт фойдаланувчиси</Badge>
                      </p>
                    </div>
                    <div className="mb-3">
                      <label className="text-muted mb-1 small">Кириш вақти</label>
                      <p className="fw-semibold mb-0">
                        {new Date(currentUser?.loginTime).toLocaleString('uz-UZ')}
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-white border-bottom">
                    <h5 className="mb-0 fw-bold">Паролни ўзгартириш</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form onSubmit={handlePasswordSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Жорий парол <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          isInvalid={!!passwordErrors.currentPassword}
                          disabled={passwordSubmitting}
                        />
                        <Form.Control.Feedback type="invalid">
                          {passwordErrors.currentPassword}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Янги парол <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          isInvalid={!!passwordErrors.newPassword}
                          disabled={passwordSubmitting}
                        />
                        <Form.Control.Feedback type="invalid">
                          {passwordErrors.newPassword}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                          Камида 6 та белги
                        </Form.Text>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Паролни тасдиқлаш <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          isInvalid={!!passwordErrors.confirmPassword}
                          disabled={passwordSubmitting}
                        />
                        <Form.Control.Feedback type="invalid">
                          {passwordErrors.confirmPassword}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <Button 
                        variant="warning" 
                        type="submit"
                        disabled={passwordSubmitting}
                      >
                        {passwordSubmitting ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Ўзгартирилмоқда...
                          </>
                        ) : (
                          <>
                            <FaSave className="me-2" />
                            Паролни ўзгартириш
                          </>
                        )}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* PUBLICATIONS TAB */}
          {activeTab === 'publications' && (
            <PublicationsDashboard />
          )}
        </div>
      </div>

      {/* Upload/Add New Patent Modal */}
      <Modal 
        show={showUploadModal} 
        onHide={() => {
          if (!submitting) {
            setShowUploadModal(false)
            resetForm()
          }
        }}
        size="lg"
        backdrop={submitting ? 'static' : true}
        keyboard={!submitting}
      >
        <Modal.Header closeButton={!submitting} className="bg-primary text-white">
          <Modal.Title>
            <FaUpload className="me-2" />
            Янги патент қўшиш
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {duplicateWarning && (
              <Alert variant="warning">
                <FaExclamationTriangle className="me-2" />
                {duplicateWarning}
              </Alert>
            )}
            
            <Row className="g-3">
              {/* Type Selection - Always First */}
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Тури <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleFormChange}
                    isInvalid={!!formErrors.type}
                    disabled={submitting}
                  >
                    <option value="">Турини танланг</option>
                    {PATENT_TYPES.map((type, idx) => (
                      <option key={idx} value={type}>{type}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formErrors.type}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Conditional Fields based on Type */}
              {formData.type === 'Муаллифлик ҳуқуқи' ? (
                <>
                  {/* Copyright Fields */}
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>Гувоҳнома рақами <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="patentNumber"
                        value={formData.patentNumber}
                        onChange={handleFormChange}
                        isInvalid={!!formErrors.patentNumber}
                        placeholder="№ 008647"
                        disabled={submitting}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.patentNumber}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>Муаллифлик ҳуқуқи номи <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="title"
                        value={formData.title}
                        onChange={handleFormChange}
                        isInvalid={!!formErrors.title}
                        placeholder="Муаллифлик ҳуқуқи номини киритинг"
                        disabled={submitting}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.title}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>Муаллифлик ҳуқуқи муаллиф(лар)и <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="authors"
                        value={formData.authors}
                        onChange={handleFormChange}
                        isInvalid={!!formErrors.authors}
                        placeholder="Масалан: Qarshiyev Odash (25%), Yevseyeva Galina (20%), Tokareva Kseniya (20%)"
                        disabled={submitting}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.authors}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Муаллифларни фоиз улушлари билан киритинг
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Реестрга киритилган сана <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="date"
                        name="registrationDate"
                        value={formData.registrationDate}
                        onChange={handleFormChange}
                        isInvalid={!!formErrors.registrationDate}
                        disabled={submitting}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.registrationDate}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Йил <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="number"
                        name="year"
                        value={formData.year}
                        onChange={handleFormChange}
                        isInvalid={!!formErrors.year}
                        disabled={submitting}
                        min="2000"
                        max={new Date().getFullYear()}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.year}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </>
              ) : formData.type ? (
                <>
                  {/* Regular Patent Fields */}
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Патент рақами <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="patentNumber"
                        value={formData.patentNumber}
                        onChange={handleFormChange}
                        isInvalid={!!formErrors.patentNumber}
                        placeholder="FAP 2745"
                        disabled={submitting}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.patentNumber}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Талабнома рақами <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="applicationNumber"
                        value={formData.applicationNumber}
                        onChange={handleFormChange}
                        isInvalid={!!formErrors.applicationNumber}
                        placeholder="FAP 20240425"
                        disabled={submitting}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.applicationNumber}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Дубликатларни текшириш учун ишлатилади
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>Ихтиро номи <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="title"
                        value={formData.title}
                        onChange={handleFormChange}
                        isInvalid={!!formErrors.title}
                        placeholder="Патент номини киритинг"
                        disabled={submitting}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.title}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Йил <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="number"
                        name="year"
                        value={formData.year}
                        onChange={handleFormChange}
                        isInvalid={!!formErrors.year}
                        disabled={submitting}
                        min="2000"
                        max={new Date().getFullYear()}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.year}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Топширилган сана <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="date"
                        name="submissionDate"
                        value={formData.submissionDate}
                        onChange={handleFormChange}
                        isInvalid={!!formErrors.submissionDate}
                        disabled={submitting}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.submissionDate}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Рўйхатдан ўтган сана <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="date"
                        name="registrationDate"
                        value={formData.registrationDate}
                        onChange={handleFormChange}
                        isInvalid={!!formErrors.registrationDate}
                        disabled={submitting}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.registrationDate}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>Муаллифлар <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="authors"
                        value={formData.authors}
                        onChange={handleFormChange}
                        isInvalid={!!formErrors.authors}
                        placeholder="Муаллифларни нуқтали вергул (;) билан ажратинг"
                        disabled={submitting}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.authors}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Бир неча муаллифларни нуқтали вергул (;) билан ажратинг
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </>
              ) : null}

              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Файл (PDF, JPG, PNG) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="file"
                    name="file"
                    onChange={handleFormChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    isInvalid={!!formErrors.file}
                    disabled={submitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.file}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    PDF, JPG ёки PNG форматидаги файлларни юкланг
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowUploadModal(false)
                resetForm()
              }}
              disabled={submitting}
            >
              <FaTimes className="me-2" />
              Бекор қилиш
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Сақланмоқда...
                </>
              ) : (
                <>
                  <FaSave className="me-2" />
                  Сақлаш
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Patent Modal */}
      <Modal 
        show={showEditModal} 
        onHide={() => {
          if (!submitting) {
            setShowEditModal(false)
            resetForm()
          }
        }}
        size="lg"
        backdrop={submitting ? 'static' : true}
        keyboard={!submitting}
      >
        <Modal.Header closeButton={!submitting} className="bg-warning text-dark">
          <Modal.Title>
            <FaEdit className="me-2" />
            Патентни таҳрирлаш
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {duplicateWarning && (
              <Alert variant="warning">
                <FaExclamationTriangle className="me-2" />
                {duplicateWarning}
              </Alert>
            )}
            
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Патент рақами <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="patentNumber"
                    value={formData.patentNumber}
                    onChange={handleFormChange}
                    isInvalid={!!formErrors.patentNumber}
                    disabled={submitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.patentNumber}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Талабнома рақами <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="applicationNumber"
                    value={formData.applicationNumber}
                    onChange={handleFormChange}
                    isInvalid={!!formErrors.applicationNumber}
                    disabled
                  />
                  <Form.Text className="text-muted">
                    Талабнома рақами ўзгартирилмайди
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Ихтиро номи <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    isInvalid={!!formErrors.title}
                    disabled={submitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.title}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Тури <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleFormChange}
                    isInvalid={!!formErrors.type}
                    disabled={submitting}
                  >
                    <option value="">Турини танланг</option>
                    {PATENT_TYPES.map((type, idx) => (
                      <option key={idx} value={type}>{type}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formErrors.type}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={2}>
                <Form.Group>
                  <Form.Label>Йил <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleFormChange}
                    isInvalid={!!formErrors.year}
                    disabled={submitting}
                    min="2000"
                    max={new Date().getFullYear()}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.year}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={2}>
                <Form.Group>
                  <Form.Label>Топширилган сана <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="submissionDate"
                    value={formData.submissionDate}
                    onChange={handleFormChange}
                    isInvalid={!!formErrors.submissionDate}
                    disabled={submitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.submissionDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={2}>
                <Form.Group>
                  <Form.Label>Рўйхатдан ўтган сана <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="registrationDate"
                    value={formData.registrationDate}
                    onChange={handleFormChange}
                    isInvalid={!!formErrors.registrationDate}
                    disabled={submitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.registrationDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Муаллифлар <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="authors"
                    value={formData.authors}
                    onChange={handleFormChange}
                    isInvalid={!!formErrors.authors}
                    disabled={submitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.authors}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Янги файл юклаш (ихтиёрий)</Form.Label>
                  <Form.Control
                    type="file"
                    name="file"
                    onChange={handleFormChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    disabled={submitting}
                  />
                  <Form.Text className="text-muted">
                    Файлни алмаштириш учун янгисини юкланг (PDF, JPG, PNG)
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowEditModal(false)
                resetForm()
              }}
              disabled={submitting}
            >
              <FaTimes className="me-2" />
              Бекор қилиш
            </Button>
            <Button variant="warning" type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Сақланмоқда...
                </>
              ) : (
                <>
                  <FaSave className="me-2" />
                  Ўзгаришларни сақлаш
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* View Patent Details Modal */}
      <Modal 
        show={showViewModal} 
        onHide={() => setShowViewModal(false)}
        size="lg"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <FaFileAlt className="me-2" />
            Патент тафсилотлари
          </Modal.Title>
        </Modal.Header>
        {selectedPatent && (
          <Modal.Body>
            <Row className="g-4">
              <Col md={6}>
                <h6 className="text-muted mb-3">Асосий маълумотлар</h6>
                <div className="mb-3">
                  <small className="text-muted">Патент рақами</small>
                  <p className="fw-bold mb-0">{selectedPatent.patent_number}</p>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Талабнома рақами</small>
                  <p className="fw-bold mb-0">{selectedPatent.application_number}</p>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Тури</small>
                  <p className="mb-0">{selectedPatent.type}</p>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Топширилган сана</small>
                  <p className="mb-0">{selectedPatent.submission_date}</p>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Рўйхатдан ўтказилган сана</small>
                  <p className="mb-0">{selectedPatent.registration_date}</p>
                </div>
              </Col>
              <Col md={6}>
                <h6 className="text-muted mb-3">Қўшимча маълумотлар</h6>
                <div className="mb-3">
                  <small className="text-muted">Муассаса</small>
                  <p className="mb-0">{selectedPatent.institution_name}</p>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Ҳолати</small>
                  <p className="mb-0">
                    {selectedPatent.status === 'approved' && (
                      <Badge bg="success">
                        <FaCheckCircle className="me-1" /> Тасдиқланган
                      </Badge>
                    )}
                    {selectedPatent.status === 'pending' && (
                      <Badge bg="warning">
                        <FaClock className="me-1" /> Кутилмоқда
                      </Badge>
                    )}
                  </p>
                </div>
                {selectedPatent.approved_by && (
                  <div className="mb-3">
                    <small className="text-muted">Тасдиқлаган</small>
                    <p className="mb-0">{selectedPatent.approved_by}</p>
                  </div>
                )}
              </Col>
              <Col xs={12}>
                <h6 className="text-muted mb-2">Номи</h6>
                <p className="mb-4">{selectedPatent.title}</p>
                
                <h6 className="text-muted mb-2">Муаллифлар</h6>
                <ul className="mb-0">
                  {selectedPatent.authors.split(';').map((author, idx) => (
                    <li key={idx}>{author.trim()}</li>
                  ))}
                </ul>
              </Col>
            </Row>
          </Modal.Body>
        )}
        <Modal.Footer>
          {selectedPatent?.file_path && (
            <Button 
              variant="success" 
              onClick={() => handleDownload(selectedPatent)}
            >
              <FaDownload className="me-2" />
              Юклаб олиш
            </Button>
          )}
          <Button 
            variant="warning" 
            onClick={() => {
              setShowViewModal(false)
              handleEdit(selectedPatent)
            }}
          >
            <FaEdit className="me-2" />
            Таҳрирлаш
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => setShowViewModal(false)}
          >
            Ёпиш
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        show={showDeleteModal} 
        onHide={() => !submitting && setShowDeleteModal(false)}
        centered
        backdrop={submitting ? 'static' : true}
        keyboard={!submitting}
      >
        <Modal.Header closeButton={!submitting} className="bg-danger text-white">
          <Modal.Title>
            <FaExclamationTriangle className="me-2" />
            Ўчиришни тасдиқлаш
          </Modal.Title>
        </Modal.Header>
        {selectedPatent && (
          <Modal.Body>
            <Alert variant="warning">
              <FaExclamationTriangle className="me-2" />
              Бу амал қайтарилмайди!
            </Alert>
            <p>
              Сиз ҳақиқатан ҳам қуйидаги патентни ўчирмоқчимисиз?
            </p>
            <div className="bg-light p-3 rounded">
              <p className="mb-1">
                <strong>Патент рақами:</strong> {selectedPatent.patent_number}
              </p>
              <p className="mb-0">
                <strong>Номи:</strong> {selectedPatent.title}
              </p>
            </div>
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)}
            disabled={submitting}
          >
            Бекор қилиш
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={submitting}>
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Ўчирилмоқда...
              </>
            ) : (
              <>
                <FaTrash className="me-2" />
                Ҳа, ўчириш
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default UserDashboard