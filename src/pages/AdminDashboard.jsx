import { useState, useEffect } from 'react'
import { Row, Col, Card, Button, Badge, Table, Form, InputGroup, Modal, Alert, Spinner } from 'react-bootstrap'
import { 
  FaHome, FaUsers, FaFileAlt, FaCog, FaSignOutAlt, FaShieldAlt, 
  FaChartBar, FaCheckCircle, FaBuilding, FaSearch, FaEye, FaTrash,
  FaDownload, FaClock, FaTimes, FaPlus, FaEdit, FaExclamationTriangle, FaCheck, FaKey, FaBook, FaChartLine, FaBars
} from 'react-icons/fa'
import { getCurrentUser } from '../utils/auth'
import { logout } from '../services/authService'
import { 
  getAllPatents, 
  createPatent,
  deletePatent, 
  approvePatent, 
  rejectPatent,
  getStatistics,
  downloadPatent,
  checkDuplicate
} from '../services/patentService'
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  resetUserPassword,
  getActivityLogs,
  getInstitutions
} from '../services/userService'
import { downloadZipFile, exportToExcel, getExportStats } from '../services/exportService'
import { PATENT_TYPES } from '../utils/patentData'
import { 
  AddUserModal, 
  EditUserModal, 
  DeleteUserModal, 
  ResetPasswordModal,
  ActivityLogsModal 
} from '../components/UserManagementModals'
import PublicationsDashboard from './PublicationsDashboard'
import AnalyticsCharts from '../components/AnalyticsCharts'
import { 
  getAllPublications,
  createPublication,
  updatePublication,
  deletePublication,
  approvePublication,
  rejectPublication
} from '../services/publicationService'
import { 
  AddPublicationModal,
  EditPublicationModal,
  ViewPublicationModal,
  DeletePublicationModal,
  ApprovePublicationModal,
  RejectPublicationModal
} from '../components/PublicationModals'
import { formatCitations } from '../utils/publicationData'
import GlobalSearch from '../components/GlobalSearch'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPatent, setSelectedPatent] = useState(null)
  const [showPatentModal, setShowPatentModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showAddPatentModal, setShowAddPatentModal] = useState(false)
  const [showGlobalSearch, setShowGlobalSearch] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterInstitution, setFilterInstitution] = useState('all')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [patents, setPatents] = useState([])
  const [publications, setPublications] = useState([])
  const [users, setUsers] = useState([])
  const [institutions, setInstitutions] = useState([])
  const [activityLogs, setActivityLogs] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    byInstitution: []
  })
  const [exportStats, setExportStats] = useState(null)
  const [exportLoading, setExportLoading] = useState(false)
  
  // Publications state
  const [selectedPublication, setSelectedPublication] = useState(null)
  const [showAddPublicationModal, setShowAddPublicationModal] = useState(false)
  const [showEditPublicationModal, setShowEditPublicationModal] = useState(false)
  const [showViewPublicationModal, setShowViewPublicationModal] = useState(false)
  const [showDeletePublicationModal, setShowDeletePublicationModal] = useState(false)
  const [showApprovePublicationModal, setShowApprovePublicationModal] = useState(false)
  const [showRejectPublicationModal, setShowRejectPublicationModal] = useState(false)
  const [filterPublicationStatus, setFilterPublicationStatus] = useState('all')
  const [filterPublicationInstitution, setFilterPublicationInstitution] = useState('all')
  const [publicationSearchQuery, setPublicationSearchQuery] = useState('')
  const [publicationLoading, setPublicationLoading] = useState(false)
  const [publicationSubmitting, setPublicationSubmitting] = useState(false)
  
  // User management modals
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [showActivityLogsModal, setShowActivityLogsModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  
  // User form state
  const [userFormData, setUserFormData] = useState({
    username: '',
    password: '',
    role: 'institution',
    institutionName: '',
    fullName: '',
    phoneNumber: '',
    isActive: true
  })
  const [userFormErrors, setUserFormErrors] = useState({})
  const [newPassword, setNewPassword] = useState('')
  
  // Add patent form state
  const [patentFormData, setPatentFormData] = useState({
    patentNumber: '',
    title: '',
    type: '',
    applicationNumber: '',
    submissionDate: '',
    registrationDate: '',
    year: new Date().getFullYear(),
    authors: '',
    institution: '', // Will be set when institutions load
    file: null
  })
  const [patentFormErrors, setPatentFormErrors] = useState({})
  const [patentDuplicateWarning, setPatentDuplicateWarning] = useState('')
  
  const currentUser = getCurrentUser()

  // Load data on mount
  useEffect(() => {
    loadPatents()
    loadPublications()
    loadStatistics()
    loadUsers()
    loadInstitutions()
  }, [])

  const loadPatents = async () => {
    setLoading(true)
    try {
      const allPatents = await getAllPatents()
      setPatents(allPatents)
    } catch (error) {
      console.error('Error loading patents:', error)
      alert('Патентларни юклашда хато: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadPublications = async () => {
    setPublicationLoading(true)
    try {
      const allPublications = await getAllPublications()
      setPublications(allPublications)
    } catch (error) {
      console.error('Error loading publications:', error)
      alert('Мақолаларни юклашда хато: ' + error.message)
    } finally {
      setPublicationLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const statistics = await getStatistics()
      setStats(statistics)
    } catch (error) {
      console.error('Error loading statistics:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const allUsers = await getAllUsers()
      setUsers(allUsers)
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadInstitutions = async () => {
    try {
      const allInstitutions = await getInstitutions()
      setInstitutions(allInstitutions)
    } catch (error) {
      console.error('Error loading institutions:', error)
    }
  }

  const loadActivityLogs = async () => {
    try {
      const logs = await getActivityLogs()
      setActivityLogs(logs)
      setShowActivityLogsModal(true)
    } catch (error) {
      console.error('Error loading activity logs:', error)
      alert('Логларни юклашда хато: ' + error.message)
    }
  }

  const loadExportStats = async () => {
    try {
      const stats = await getExportStats(filterInstitution)
      setExportStats(stats)
    } catch (error) {
      console.error('Error loading export stats:', error)
    }
  }

  // Load export stats when institution filter changes
  useEffect(() => {
    if (activeTab === 'patents') {
      loadExportStats()
    }
  }, [filterInstitution, activeTab])

  const handleLogout = () => {
    if (window.confirm('Тизимдан чиқмоқчимисиз?')) {
      logout()
    }
  }

  const handleSearchSelect = (type, item) => {
    if (type === 'patent') {
      setSelectedPatent(item)
      setActiveTab('patents')
      // Optionally open view modal
      setTimeout(() => setShowPatentModal(true), 300)
    } else if (type === 'publication') {
      setActiveTab('publications')
    }
  }

  const handleViewPatent = (patent) => {
    setSelectedPatent(patent)
    setShowPatentModal(true)
  }

  const handleDeletePatent = (patent) => {
    setSelectedPatent(patent)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    setSubmitting(true)
    try {
      await deletePatent(selectedPatent.id)
      alert('Патент муваффақиятли ўчирилди')
      await loadPatents()
      await loadStatistics()
      setShowDeleteModal(false)
      setSelectedPatent(null)
    } catch (error) {
      console.error('Error deleting patent:', error)
      alert('Ўчиришда хато: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = (patent) => {
    setSelectedPatent(patent)
    setShowApproveModal(true)
  }

  const confirmApprove = async () => {
    setSubmitting(true)
    try {
      await approvePatent(selectedPatent.id, currentUser.username)
      alert('Патент тасдиқланди!')
      await loadPatents()
      await loadStatistics()
      setShowApproveModal(false)
      setSelectedPatent(null)
    } catch (error) {
      console.error('Error approving patent:', error)
      alert('Тасдиқлашда хато: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = (patent) => {
    setSelectedPatent(patent)
    setShowRejectModal(true)
  }

  const confirmReject = async () => {
    setSubmitting(true)
    try {
      await rejectPatent(selectedPatent.id)
      alert('Патент рад этилди')
      await loadPatents()
      await loadStatistics()
      setShowRejectModal(false)
      setSelectedPatent(null)
    } catch (error) {
      console.error('Error rejecting patent:', error)
      alert('Рад этишда хато: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownload = (patent) => {
    downloadPatent(patent)
  }

  // ========================================
  // PUBLICATION MANAGEMENT HANDLERS
  // ========================================

  const handleAddPublication = () => {
    setShowAddPublicationModal(true)
  }

  const handleSubmitPublication = async (publicationData, file) => {
    setPublicationSubmitting(true)
    try {
      await createPublication(publicationData, file)
      alert('Мақола муваффақиятли қўшилди!')
      setShowAddPublicationModal(false)
      await loadPublications()
    } catch (error) {
      console.error('Error creating publication:', error)
      alert('Хато: ' + error.message)
    } finally {
      setPublicationSubmitting(false)
    }
  }

  const handleViewPublication = (publication) => {
    setSelectedPublication(publication)
    setShowViewPublicationModal(true)
  }

  const handleEditPublication = (publication) => {
    setSelectedPublication(publication)
    setShowEditPublicationModal(true)
  }

  const handleUpdatePublication = async (id, publicationData, file) => {
    setPublicationSubmitting(true)
    try {
      await updatePublication(id, publicationData, file)
      alert('Мақола муваффақиятли янгиланди!')
      setShowEditPublicationModal(false)
      setSelectedPublication(null)
      await loadPublications()
    } catch (error) {
      console.error('Error updating publication:', error)
      alert('Янгилашда хато: ' + error.message)
    } finally {
      setPublicationSubmitting(false)
    }
  }

  const handleDeletePublication = (publication) => {
    setSelectedPublication(publication)
    setShowDeletePublicationModal(true)
  }

  const confirmDeletePublication = async () => {
    setPublicationSubmitting(true)
    try {
      await deletePublication(selectedPublication.id)
      alert('Мақола ўчирилди')
      await loadPublications()
      setShowDeletePublicationModal(false)
      setSelectedPublication(null)
    } catch (error) {
      console.error('Error deleting publication:', error)
      alert('Ўчиришда хато: ' + error.message)
    } finally {
      setPublicationSubmitting(false)
    }
  }

  const handleApprovePublication = (publication) => {
    setSelectedPublication(publication)
    setShowApprovePublicationModal(true)
  }

  const confirmApprovePublication = async () => {
    setPublicationSubmitting(true)
    try {
      await approvePublication(selectedPublication.id, currentUser.username)
      alert('Мақола тасдиқланди!')
      await loadPublications()
      setShowApprovePublicationModal(false)
      setSelectedPublication(null)
    } catch (error) {
      console.error('Error approving publication:', error)
      alert('Тасдиқлашда хато: ' + error.message)
    } finally {
      setPublicationSubmitting(false)
    }
  }

  const handleRejectPublication = (publication) => {
    setSelectedPublication(publication)
    setShowRejectPublicationModal(true)
  }

  const confirmRejectPublication = async () => {
    setPublicationSubmitting(true)
    try {
      await rejectPublication(selectedPublication.id)
      alert('Мақола рад этилди')
      await loadPublications()
      setShowRejectPublicationModal(false)
      setSelectedPublication(null)
    } catch (error) {
      console.error('Error rejecting publication:', error)
      alert('Рад этишда хато: ' + error.message)
    } finally {
      setPublicationSubmitting(false)
    }
  }

  // Filtered publications
  const filteredPublications = publications.filter(pub => {
    const matchesSearch = !publicationSearchQuery || 
      pub.title.toLowerCase().includes(publicationSearchQuery.toLowerCase()) ||
      pub.author_full_name.toLowerCase().includes(publicationSearchQuery.toLowerCase()) ||
      (pub.journal_name && pub.journal_name.toLowerCase().includes(publicationSearchQuery.toLowerCase()))
    
    const matchesStatus = filterPublicationStatus === 'all' || pub.status === filterPublicationStatus
    const matchesInstitution = filterPublicationInstitution === 'all' || pub.institution === filterPublicationInstitution
    
    return matchesSearch && matchesStatus && matchesInstitution
  })

  // ========================================
  // USER MANAGEMENT HANDLERS
  // ========================================

  const handleAddUser = () => {
    setUserFormData({
      username: '',
      password: '',
      role: 'institution',
      institutionName: '',
      fullName: '',
      phoneNumber: '',
      isActive: true
    })
    setUserFormErrors({})
    setShowAddUserModal(true)
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setUserFormData({
      username: user.username,
      password: '',
      role: user.role,
      institutionName: user.institution_name || '',
      fullName: user.full_name || '',
      phoneNumber: user.phone_number || '',
      isActive: user.is_active === 1
    })
    setUserFormErrors({})
    setShowEditUserModal(true)
  }

  const handleDeleteUser = (user) => {
    setSelectedUser(user)
    setShowDeleteUserModal(true)
  }

  const handleResetPassword = (user) => {
    setSelectedUser(user)
    setNewPassword('')
    setShowResetPasswordModal(true)
  }

  const handleUserFormChange = (e) => {
    const { name, value } = e.target
    
    // Convert isActive string to boolean
    let finalValue = value
    if (name === 'isActive') {
      finalValue = value === 'true' || value === true
    }
    
    setUserFormData(prev => ({ ...prev, [name]: finalValue }))
    // Clear error for this field
    if (userFormErrors[name]) {
      setUserFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateUserForm = (isEdit = false) => {
    const errors = {}
    
    if (!isEdit && !userFormData.username.trim()) {
      errors.username = 'Фойдаланувчи номини киритинг'
    }
    
    if (!isEdit && !userFormData.password) {
      errors.password = 'Паролни киритинг'
    } else if (!isEdit && userFormData.password.length < 6) {
      errors.password = 'Парол камида 6 та белгидан иборат бўлиши керак'
    }
    
    if (userFormData.role === 'institution' && !userFormData.institutionName.trim()) {
      errors.institutionName = 'Муассаса номини киритинг'
    }
    
    if (userFormData.phoneNumber && !userFormData.phoneNumber.match(/^\+998\d{9}$/)) {
      errors.phoneNumber = 'Телефон рақами нотўғри форматда. Намуна: +998901234567'
    }

    setUserFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleUserFormSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateUserForm(false)) {
      return
    }

    setSubmitting(true)
    try {
      await createUser({
        username: userFormData.username,
        password: userFormData.password,
        role: userFormData.role,
        institutionName: userFormData.institutionName,
        fullName: userFormData.fullName,
        phoneNumber: userFormData.phoneNumber
      })
      
      alert('Фойдаланувчи муваффақиятли яратилди!')
      await loadUsers()
      setShowAddUserModal(false)
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Хато: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  // ========================================
  // EXPORT HANDLERS
  // ========================================

  const handleDownloadZip = async () => {
    setExportLoading(true)
    try {
      await downloadZipFile(filterInstitution)
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
      await exportToExcel(filterInstitution)
      alert('Excel файли муваффақиятли юклаб олинди!')
    } catch (error) {
      console.error('Error exporting Excel:', error)
      alert('Excel экспорт қилишда хато: ' + error.message)
    } finally {
      setExportLoading(false)
    }
  }

  const handleUserEditSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateUserForm(true)) {
      return
    }

    setSubmitting(true)
    try {
      await updateUser(selectedUser.id, {
        institutionName: userFormData.institutionName,
        fullName: userFormData.fullName,
        phoneNumber: userFormData.phoneNumber,
        isActive: userFormData.isActive === true || userFormData.isActive === 'true'
      })
      
      alert('Фойдаланувчи муваффақиятли янгиланди!')
      await loadUsers()
      setShowEditUserModal(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Хато: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDeleteUser = async () => {
    setSubmitting(true)
    try {
      await deleteUser(selectedUser.id)
      alert('Фойдаланувчи муваффақиятли ўчирилди')
      await loadUsers()
      setShowDeleteUserModal(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Ўчиришда хато: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const confirmResetPassword = async (e) => {
    e.preventDefault()
    
    if (!newPassword || newPassword.length < 6) {
      alert('Парол камида 6 та белгидан иборат бўлиши керак')
      return
    }

    setSubmitting(true)
    try {
      await resetUserPassword(selectedUser.id, newPassword)
      alert('Парол муваффақиятли тикланди!')
      setShowResetPasswordModal(false)
      setSelectedUser(null)
      setNewPassword('')
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('Хато: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  // ========================================
  // PATENT MANAGEMENT HANDLERS (Admin)
  // ========================================

  const handleAddPatent = () => {
    setPatentFormData({
      patentNumber: '',
      title: '',
      type: '',
      applicationNumber: '',
      submissionDate: '',
      registrationDate: '',
      year: new Date().getFullYear(),
      authors: '',
      institution: institutions.length > 0 ? institutions[0].username : '',
      file: null
    })
    setPatentFormErrors({})
    setShowAddPatentModal(true)
  }

  const handlePatentFormChange = async (e) => {
    const { name, value, files } = e.target
    
    if (name === 'file') {
      if (files[0]) {
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (files[0].size > maxSize) {
          alert('⚠️ Файл ҳажми 10MB дан кичик бўлиши керак!')
          e.target.value = '' // Clear input
          return
        }
        setPatentFormData(prev => ({ ...prev, file: files[0] }))
      }
    } else {
      setPatentFormData(prev => ({ ...prev, [name]: value }))
      
      // Check for duplicates when patent number or application number changes
      if ((name === 'patentNumber' || name === 'applicationNumber') && value) {
        const checkPatentNum = name === 'patentNumber' ? value : patentFormData.patentNumber
        const checkAppNum = name === 'applicationNumber' ? value : patentFormData.applicationNumber
        
        if (checkPatentNum || checkAppNum) {
          const duplicate = await checkDuplicate(checkPatentNum, checkAppNum)
          if (duplicate) {
            const field = duplicate.matchedField === 'patent_number' ? 'Патент рақами' : 'Талабнома рақами'
            setPatentDuplicateWarning(
              `⚠️ ОГОҲЛАНТИРИШ: ${field} аллақачон тизимда мавжуд!\n` +
              `Муассаса: ${duplicate.institutionName}\n` +
              `Қўшган: ${duplicate.createdBy}\n` +
              `Илтимос, такрорий киритмасликка ишонч ҳосил қилинг.`
            )
          } else {
            setPatentDuplicateWarning('')
          }
        }
      }
    }
    
    // Clear error for this field
    if (patentFormErrors[name]) {
      setPatentFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validatePatentForm = () => {
    const errors = {}
    const isCopyright = patentFormData.type === 'Муаллифлик ҳуқуқи'
    
    if (!patentFormData.patentNumber.trim()) {
      errors.patentNumber = isCopyright ? 'Гувоҳнома рақамини киритинг' : 'Патент рақамини киритинг'
    }
    if (!patentFormData.title.trim()) {
      errors.title = isCopyright ? 'Муаллифлик ҳуқуқи номини киритинг' : 'Ихтиро номини киритинг'
    }
    if (!patentFormData.type) {
      errors.type = 'Турини танланг'
    }
    
    // Application number only for non-copyright types
    if (!isCopyright && !patentFormData.applicationNumber.trim()) {
      errors.applicationNumber = 'Талабнома рақамини киритинг'
    }
    
    // Submission date only for non-copyright types
    if (!isCopyright && !patentFormData.submissionDate) {
      errors.submissionDate = 'Топширилган санани киритинг'
    }
    
    if (!patentFormData.registrationDate) {
      errors.registrationDate = isCopyright ? 'Реестрга киритилган санани киритинг' : 'Рўйхатдан ўтказилган санани киритинг'
    }
    if (!patentFormData.year) {
      errors.year = 'Йилни танланг'
    }
    const currentYear = new Date().getFullYear()
    if (patentFormData.year && (patentFormData.year < 2000 || patentFormData.year > currentYear)) {
      errors.year = `Йил 2000 дан ${currentYear} гача бўлиши керак`
    }
    if (!patentFormData.authors.trim()) {
      errors.authors = 'Камида битта муаллиф киритинг'
    }
    if (!patentFormData.institution) {
      errors.institution = 'Муассасани танланг'
    }
    if (!patentFormData.file) {
      errors.file = 'Файлни юкланг'
    }

    setPatentFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePatentFormSubmit = async (e) => {
    e.preventDefault()
    
    if (!validatePatentForm()) {
      return
    }

    setSubmitting(true)
    try {
      // Get institution name from institutions array
      const selectedInstitution = institutions.find(inst => inst.username === patentFormData.institution)
      
      const patentData = {
        patentNumber: patentFormData.patentNumber,
        title: patentFormData.title,
        type: patentFormData.type,
        applicationNumber: patentFormData.applicationNumber,
        submissionDate: patentFormData.submissionDate,
        registrationDate: patentFormData.registrationDate,
        year: patentFormData.year,
        authors: patentFormData.authors,
        institution: patentFormData.institution,
        institutionName: selectedInstitution?.institution_name || patentFormData.institution,
        createdBy: currentUser.username
      }

      await createPatent(patentData, patentFormData.file)
      alert('Патент муваффақиятли қўшилди!')
      
      // Reload patents and stats
      await loadPatents()
      await loadStatistics()
      
      setShowAddPatentModal(false)
    } catch (error) {
      console.error('Error adding patent:', error)
      alert('Хато: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Filter patents
  const getFilteredPatents = () => {
    let filtered = patents

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.patent_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.application_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.institution_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus)
    }

    if (filterInstitution !== 'all') {
      filtered = filtered.filter(p => p.institution === filterInstitution)
    }

    return filtered
  }

  const filteredPatents = getFilteredPatents()

  // Calculate comprehensive statistics
  const totalPublications = publications.length
  const approvedPublications = publications.filter(p => p.status === 'approved').length
  const pendingPublications = publications.filter(p => p.status === 'pending').length
  const rejectedPublications = publications.filter(p => p.status === 'rejected').length
  
  const totalDocuments = stats.total + totalPublications
  const totalApproved = stats.approved + approvedPublications
  const totalPending = stats.pending + pendingPublications
  const totalRejected = stats.rejected + rejectedPublications
  
  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentPatents = patents.filter(p => {
    const createdAt = new Date(p.created_at + 'Z')
    return createdAt >= sevenDaysAgo
  })
  const recentPublications = publications.filter(p => {
    const createdAt = new Date(p.created_at + 'Z')
    return createdAt >= sevenDaysAgo
  })
  
  // Combined recent activity
  const recentActivity = [
    ...recentPatents.map(p => ({ ...p, type: 'patent', timestamp: new Date(p.created_at + 'Z') })),
    ...recentPublications.map(p => ({ ...p, type: 'publication', timestamp: new Date(p.created_at + 'Z') }))
  ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10)

  const statsCards = [
    { 
      label: 'Жами ҳужжатлар', 
      value: totalDocuments.toString(), 
      subValue: `${stats.total} патент + ${totalPublications} мақола`,
      icon: FaFileAlt, 
      color: '#0d6efd',
      bgColor: '#e7f1ff',
      trend: recentPatents.length + recentPublications.length > 0 ? `+${recentPatents.length + recentPublications.length} (7 кун)` : null
    },
    { 
      label: 'Муассасалар', 
      value: institutions.length.toString(), 
      subValue: `${users.filter(u => u.role === 'institution' && u.is_active).length} актив фойдаланувчи`,
      icon: FaBuilding, 
      color: '#198754',
      bgColor: '#d1f7e5',
      trend: null
    },
    { 
      label: 'Тасдиқланган', 
      value: totalApproved.toString(), 
      subValue: `${((totalApproved/totalDocuments)*100).toFixed(1)}% умумийдан`,
      icon: FaCheckCircle, 
      color: '#198754',
      bgColor: '#d1f7e5',
      trend: null
    },
    { 
      label: 'Кутилмоқда', 
      value: totalPending.toString(), 
      subValue: `${stats.pending} патент + ${pendingPublications} мақола`,
      icon: FaClock, 
      color: '#ffc107',
      bgColor: '#fff3cd',
      trend: totalPending > 0 ? 'Тасдиқлаш керак!' : null
    },
    { 
      label: 'Патентлар', 
      value: stats.total.toString(), 
      subValue: `${stats.approved} тасдиқланган`,
      icon: FaFileAlt, 
      color: '#6610f2',
      bgColor: '#e7e3fc',
      trend: recentPatents.length > 0 ? `+${recentPatents.length} (7 кун)` : null
    },
    { 
      label: 'Илмий мақолалар', 
      value: totalPublications.toString(), 
      subValue: `${approvedPublications} тасдиқланган`,
      icon: FaBook, 
      color: '#d63384',
      bgColor: '#f7d6e6',
      trend: recentPublications.length > 0 ? `+${recentPublications.length} (7 кун)` : null
    },
    { 
      label: 'Жами фойдаланувчилар', 
      value: users.length.toString(), 
      subValue: `${users.filter(u => u.is_active).length} актив`,
      icon: FaUsers, 
      color: '#0dcaf0',
      bgColor: '#cff4fc',
      trend: null
    },
    { 
      label: 'Рад этилган', 
      value: totalRejected.toString(), 
      subValue: `${stats.rejected} патент + ${rejectedPublications} мақола`,
      icon: FaTimes, 
      color: '#dc3545',
      bgColor: '#f8d7da',
      trend: null
    }
  ]

  // Group patents and publications by institution for stats table
  const institutionStats = institutions.map(inst => {
    const instPatents = patents.filter(p => p.institution === inst.username)
    const instPublications = publications.filter(p => p.institution === inst.username)
    const total = instPatents.length + instPublications.length
    const approved = instPatents.filter(p => p.status === 'approved').length + 
                    instPublications.filter(p => p.status === 'approved').length
    const pending = instPatents.filter(p => p.status === 'pending').length + 
                   instPublications.filter(p => p.status === 'pending').length
    const rejected = instPatents.filter(p => p.status === 'rejected').length + 
                    instPublications.filter(p => p.status === 'rejected').length
    
    return {
      key: inst.username,
      name: inst.institution_name,
      fullName: inst.institution_name,
      patents: instPatents.length,
      publications: instPublications.length,
      total,
      approved,
      pending,
      rejected,
      approvalRate: total > 0 ? ((approved / total) * 100).toFixed(1) : '0'
    }
  }).sort((a, b) => b.total - a.total)

  return (
    <div className="dashboard-container">
      {/* Mobile Menu Toggle */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        <FaBars />
      </button>

      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              {/* <FaShieldAlt /> */}
              <img src='src/images/logo.png' alt="Logo" className="sidebar-logo" />
            </div>
            <div className="sidebar-brand-text">
              <h5>Админ Панели</h5>
              <small>Patent System</small>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item">
            <a 
              href="#" 
              className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('overview'); setSidebarOpen(false); }}
            >
              <FaHome className="nav-icon" />
              <span>Асосий</span>
            </a>
          </div>
          <div className="nav-item">
            <a 
              href="#" 
              className={`nav-link ${activeTab === 'patents' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('patents'); setSidebarOpen(false); }}
            >
              <FaFileAlt className="nav-icon" />
              <span>Патентлар</span>
              <Badge bg="light" text="dark" className="ms-auto">
                {patents.length}
              </Badge>
            </a>
          </div>
          <div className="nav-item">
            <a 
              href="#" 
              className={`nav-link ${activeTab === 'publications' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('publications'); setSidebarOpen(false); }}
            >
              <FaBook className="nav-icon" />
              <span>Илмий мақолалар</span>
            </a>
          </div>
          <div className="nav-item">
            <a 
              href="#" 
              className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('analytics'); setSidebarOpen(false); }}
            >
              <FaChartLine className="nav-icon" />
              <span>Аналитика</span>
            </a>
          </div>
          <div className="nav-item">
            <a 
              href="#" 
              className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('users'); setSidebarOpen(false); }}
            >
              <FaUsers className="nav-icon" />
              <span>Фойдаланувчилар</span>
            </a>
          </div>
          <div className="nav-item">
            <a 
              href="#" 
              className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('settings'); setSidebarOpen(false); }}
            >
              <FaCog className="nav-icon" />
              <span>Созламалар</span>
            </a>
          </div>
          <div className="nav-item mt-4">
            <a 
              href="#" 
              className="nav-link"
              onClick={(e) => { e.preventDefault(); setShowGlobalSearch(true); }}
            >
              <FaSearch className="nav-icon" />
              <span>Қидириш</span>
            </a>
          </div>
          <div className="nav-item">
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
                <h4>Хуш келибсиз, {currentUser?.fullName}</h4>
                <p className="text-muted mb-0">
                  {new Date().toLocaleDateString('uz-UZ', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </Col>
            <Col xs="auto">
              <Badge bg="primary" className="p-2 px-3">
                <FaShieldAlt className="me-2" />
                Администратор
              </Badge>
            </Col>
          </Row>
        </div>

        {/* Content Section */}
        <div className="content-section">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              {/* Page Header */}
              <div className="mb-4">
                <h3 className="fw-bold mb-1">Бош саҳифа - Умумий кўриниш</h3>
                <p className="text-muted mb-0">Тизимнинг тўлиқ статистикаси ва ҳолати</p>
              </div>

              {/* Statistics Cards */}
              <Row className="g-4 mb-4">
                {statsCards.map((stat, idx) => (
                  <Col key={idx} xs={12} sm={6} xl={3}>
                    <Card className="stats-card border-0 h-100 shadow-sm hover-lift">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <p className="text-muted mb-1 small text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
                              {stat.label}
                            </p>
                            <h2 className="mb-1 fw-bold" style={{ fontSize: '2rem' }}>{stat.value}</h2>
                            <small className="text-muted d-block mb-2" style={{ fontSize: '0.8rem' }}>
                              {stat.subValue}
                            </small>
                            {stat.trend && (
                              <Badge 
                                bg={stat.trend.includes('керак') ? 'danger' : 'success'} 
                                className="mt-1"
                                style={{ fontSize: '0.7rem' }}
                              >
                                {stat.trend}
                              </Badge>
                            )}
                          </div>
                          <div 
                            className="stats-icon rounded-3 d-flex align-items-center justify-content-center" 
                            style={{ 
                              backgroundColor: stat.bgColor, 
                              color: stat.color,
                              width: '50px',
                              height: '50px',
                              fontSize: '1.5rem'
                            }}
                          >
                            <stat.icon />
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Quick Actions */}
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                  <h5 className="fw-bold mb-3">Тезкор амаллар</h5>
                  <Row className="g-3">
                    <Col xs={12} sm={6} md={3}>
                      <Button 
                        variant="primary" 
                        className="w-100 d-flex align-items-center justify-content-center py-3"
                        onClick={handleAddPatent}
                      >
                        <FaPlus className="me-2" /> Патент қўшиш
                      </Button>
                    </Col>
                    <Col xs={12} sm={6} md={3}>
                      <Button 
                        variant="info" 
                        className="w-100 d-flex align-items-center justify-content-center py-3"
                        onClick={handleAddPublication}
                      >
                        <FaBook className="me-2" /> Мақола қўшиш
                      </Button>
                    </Col>
                    <Col xs={12} sm={6} md={3}>
                      <Button 
                        variant="success" 
                        className="w-100 d-flex align-items-center justify-content-center py-3"
                        onClick={handleAddUser}
                      >
                        <FaUsers className="me-2" /> Фойдаланувчи қўшиш
                      </Button>
                    </Col>
                    <Col xs={12} sm={6} md={3}>
                      <Button 
                        variant="warning" 
                        className="w-100 d-flex align-items-center justify-content-center py-3"
                        onClick={() => setActiveTab('analytics')}
                      >
                        <FaChartLine className="me-2" /> Аналитика
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Institutions Statistics Table - Full Width */}
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white border-bottom py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">
                      <FaBuilding className="me-2 text-primary" />
                      Муассасалар бўйича статистика
                    </h5>
                    <Badge bg="secondary">{institutionStats.length} муассаса</Badge>
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
                  <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <Table responsive hover className="mb-0">
                      <thead className="bg-light sticky-top">
                        <tr>
                          <th className="px-3 py-3">#</th>
                          <th className="px-3 py-3">Муассаса</th>
                          <th className="px-3 py-3 text-center">Патентлар</th>
                          <th className="px-3 py-3 text-center">Мақолалар</th>
                          <th className="px-3 py-3 text-center">Жами</th>
                          <th className="px-3 py-3 text-center">Тасдиқланган</th>
                          <th className="px-3 py-3 text-center">Кутилмоқда</th>
                          <th className="px-3 py-3 text-center">Фоиз</th>
                          <th className="px-3 py-3 text-center">Амаллар</th>
                        </tr>
                      </thead>
                      <tbody>
                        {institutionStats.length === 0 ? (
                          <tr>
                            <td colSpan="9" className="text-center py-5 text-muted">
                              <FaBuilding size={48} className="mb-3 opacity-50" />
                              <p className="mb-0">Ҳозирча муассасалар мавжуд эмас</p>
                            </td>
                          </tr>
                        ) : (
                          institutionStats.map((inst, idx) => (
                            <tr key={inst.key}>
                              <td className="px-3 py-3 text-muted fw-semibold">{idx + 1}</td>
                              <td className="px-3 py-3">
                                <div className="d-flex align-items-center">
                                  <div 
                                    className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                    style={{ width: 35, height: 35, backgroundColor: '#e7f1ff' }}
                                  >
                                    <FaBuilding className="text-primary" style={{ fontSize: '0.9rem' }} />
                                  </div>
                                  <div>
                                    <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>{inst.name}</div>
                                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>{inst.key}</small>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <Badge bg="primary" pill className="px-2">{inst.patents}</Badge>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <Badge bg="info" pill className="px-2">{inst.publications}</Badge>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <Badge bg="dark" pill className="px-2 py-1 fw-bold">{inst.total}</Badge>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <Badge bg="success" pill className="px-2">{inst.approved}</Badge>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <Badge bg="warning" pill className="px-2">{inst.pending}</Badge>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <span className="fw-semibold text-success">{inst.approvalRate}%</span>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  onClick={() => {
                                    setFilterInstitution(inst.key)
                                    setActiveTab('patents')
                                  }}
                                >
                                  <FaEye className="me-1" /> Кўриш
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>

              {/* Recent Activity - Single Section with Taller Height */}
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white border-bottom py-3">
                  <h5 className="mb-0 fw-bold">
                    <FaClock className="me-2 text-info" />
                    Сўнгги фаолият
                  </h5>
                </Card.Header>
                <Card.Body>
                  {recentActivity.length === 0 ? (
                    <div className="text-center text-muted py-5">
                      <FaClock size={48} className="mb-3 opacity-50" />
                      <p className="mb-0">Сўнгги фаолият йўқ</p>
                    </div>
                  ) : (
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                      {recentActivity.map((item, idx) => (
                        <div 
                          key={`${item.type}-${item.id}`} 
                          className={`py-3 ${idx < recentActivity.length - 1 ? 'border-bottom' : ''}`}
                        >
                          <div className="d-flex align-items-start gap-3">
                            <Badge 
                              bg={item.type === 'patent' ? 'primary' : 'danger'} 
                              className="px-2 py-1"
                              style={{ fontSize: '0.7rem', minWidth: '60px', textAlign: 'center' }}
                            >
                              {item.type === 'patent' ? 'Патент' : 'Мақола'}
                            </Badge>
                            <div className="flex-grow-1">
                              <Badge 
                                bg={
                                  item.status === 'approved' ? 'success' : 
                                  item.status === 'pending' ? 'warning' : 
                                  'danger'
                                }
                                className="mb-2"
                                style={{ fontSize: '0.7rem' }}
                              >
                                {item.status === 'approved' ? 'Тасдиқланган' : 
                                 item.status === 'pending' ? 'Кутилмоқда' : 
                                 'Рад этилган'}
                              </Badge>
                              <div className="fw-semibold mb-1">
                                {item.title}
                              </div>
                              <small className="text-muted d-block">
                                {item.institution_name}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </>
          )}

          {/* PATENTS TAB */}
          {activeTab === 'patents' && (
            <>
              {/* Search and Filters */}
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                  <Row className="g-3 align-items-end">
                    <Col md={6}>
                      <InputGroup>
                        <InputGroup.Text>
                          <FaSearch />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Патент рақами, номи, муаллиф ёки муассаса бўйича қидириш..."
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
                    </Col>
                    <Col md={3}>
                      <Form.Select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="all">Барча ҳолатлар</option>
                        <option value="approved">Тасдиқланган</option>
                        <option value="pending">Кутилмоқда</option>
                        <option value="rejected">Рад этилган</option>
                      </Form.Select>
                    </Col>
                    <Col md={3}>
                      <Form.Select 
                        value={filterInstitution}
                        onChange={(e) => setFilterInstitution(e.target.value)}
                      >
                        <option value="all">Барча муассасалар</option>
                        {institutions.map(inst => (
                          <option key={inst.username} value={inst.username}>
                            {inst.institution_name}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                  </Row>
                  
                  {/* Export Buttons Row */}
                  <Row className="mt-3">
                    <Col>
                      <div className="d-flex gap-2 align-items-center">
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={handleAddPatent}
                        >
                          <FaPlus className="me-2" />
                          Патент қўшиш
                        </Button>
                        
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

                  {(searchQuery || filterStatus !== 'all' || filterInstitution !== 'all') && (
                    <div className="mt-3">
                      <small className="text-muted">
                        Топилди: <strong>{filteredPatents.length}</strong> натижа
                      </small>
                      {(filterStatus !== 'all' || filterInstitution !== 'all') && (
                        <Button 
                          variant="link" 
                          size="sm"
                          className="ms-2"
                          onClick={() => {
                            setFilterStatus('all')
                            setFilterInstitution('all')
                            setSearchQuery('')
                          }}
                        >
                          Филтрларни тозалаш
                        </Button>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* Patents Table */}
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <p className="text-muted mt-3">Юкланмоқда...</p>
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
                            <th className="px-4 py-3">Муассаса</th>
                            <th className="px-4 py-3 text-center">Ҳолати</th>
                            <th className="px-4 py-3 text-center">Амаллар</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPatents.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="text-center py-5">
                                <FaFileAlt size={48} className="text-muted mb-3 d-block mx-auto" />
                                <p className="text-muted mb-0">Ҳеч қандай патент топилмади</p>
                              </td>
                            </tr>
                          ) : (
                            filteredPatents.map((patent, idx) => (
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
                                <td className="px-4 py-3">
                                  <small>{patent.institution_name}</small>
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
                                  {patent.status === 'rejected' && (
                                    <Badge bg="danger">
                                      <FaTimes className="me-1" /> Рад этилган
                                    </Badge>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <div className="d-flex gap-1 justify-content-center flex-wrap">
                                    <Button 
                                      variant="outline-primary" 
                                      size="sm"
                                      onClick={() => handleViewPatent(patent)}
                                      title="Кўриш"
                                    >
                                      <FaEye />
                                    </Button>
                                    {patent.status === 'pending' && (
                                      <>
                                        <Button 
                                          variant="outline-success" 
                                          size="sm"
                                          onClick={() => handleApprove(patent)}
                                          title="Тасдиқлаш"
                                        >
                                          <FaCheck />
                                        </Button>
                                        <Button 
                                          variant="outline-warning" 
                                          size="sm"
                                          onClick={() => handleReject(patent)}
                                          title="Рад этиш"
                                        >
                                          <FaTimes />
                                        </Button>
                                      </>
                                    )}
                                    <Button 
                                      variant="outline-info" 
                                      size="sm"
                                      onClick={() => handleDownload(patent)}
                                      title="Юклаб олиш"
                                      disabled={!patent.file_path}
                                    >
                                      <FaDownload />
                                    </Button>
                                    <Button 
                                      variant="outline-danger" 
                                      size="sm"
                                      onClick={() => handleDeletePatent(patent)}
                                      title="Ўчириш"
                                    >
                                      <FaTrash />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">
                    <FaUsers className="me-2 text-primary" />
                    Фойдаланувчилар бошқаруви
                  </h5>
                  <div className="d-flex gap-2">
                    <Button variant="info" size="sm" onClick={loadActivityLogs}>
                      <FaEye className="me-2" />
                      Фаолият журнали
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleAddUser}>
                      <FaPlus className="me-2" />
                      Янги фойдаланувчи
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table responsive hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="px-4 py-3">Фойдаланувчи</th>
                        <th className="px-4 py-3">Муассаса</th>
                        <th className="px-4 py-3">Телефон</th>
                        <th className="px-4 py-3">Роль</th>
                        <th className="px-4 py-3 text-center">Ҳолати</th>
                        <th className="px-4 py-3 text-center">Амаллар</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-4 py-3">
                            <div className="d-flex align-items-center">
                              <div 
                                className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                style={{ 
                                  width: 40, 
                                  height: 40, 
                                  backgroundColor: user.role === 'admin' ? '#e7f1ff' : '#d1f7e5' 
                                }}
                              >
                                {user.role === 'admin' ? (
                                  <FaShieldAlt className="text-primary" />
                                ) : (
                                  <FaBuilding className="text-success" />
                                )}
                              </div>
                              <div>
                                <div className="fw-semibold">{user.username}</div>
                                <small className="text-muted">
                                  {user.full_name || user.institution_name || '—'}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <small>{user.institution_name || '—'}</small>
                          </td>
                          <td className="px-4 py-3">
                            <small>{user.phone_number || '—'}</small>
                          </td>
                          <td className="px-4 py-3">
                            <Badge bg={user.role === 'admin' ? 'danger' : 'info'}>
                              {user.role === 'admin' ? 'Администратор' : 'Институт'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge bg={user.is_active ? 'success' : 'secondary'}>
                              {user.is_active ? 'Фаол' : 'Нофаол'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {user.id === 1 ? (
                              <Button variant="outline-secondary" size="sm" disabled>
                                <FaEdit className="me-1" /> Асосий админ
                              </Button>
                            ) : (
                              <div className="d-flex gap-1 justify-content-center flex-wrap">
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  onClick={() => handleEditUser(user)}
                                  title="Таҳрирлаш"
                                >
                                  <FaEdit />
                                </Button>
                                <Button 
                                  variant="outline-info" 
                                  size="sm"
                                  onClick={() => handleResetPassword(user)}
                                  title="Паролни тиклаш"
                                >
                                  <FaKey />
                                </Button>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={() => handleDeleteUser(user)}
                                  title="Ўчириш"
                                >
                                  <FaTrash />
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </>
          )}

          {/* PUBLICATIONS TAB */}
          {activeTab === 'publications' && (
            <>
              {/* Search and Filters */}
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                  <Row className="g-3 align-items-end">
                    <Col md={5}>
                      <InputGroup>
                        <InputGroup.Text>
                          <FaSearch />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Мақола, муаллиф ёки журнал бўйича қидириш..."
                          value={publicationSearchQuery}
                          onChange={(e) => setPublicationSearchQuery(e.target.value)}
                        />
                        {publicationSearchQuery && (
                          <Button 
                            variant="outline-secondary"
                            onClick={() => setPublicationSearchQuery('')}
                          >
                            <FaTimes />
                          </Button>
                        )}
                      </InputGroup>
                    </Col>
                    <Col md={3}>
                      <Form.Select 
                        value={filterPublicationStatus}
                        onChange={(e) => setFilterPublicationStatus(e.target.value)}
                      >
                        <option value="all">Барча ҳолатлар</option>
                        <option value="approved">Тасдиқланган</option>
                        <option value="pending">Кутилмоқда</option>
                        <option value="rejected">Рад этилган</option>
                      </Form.Select>
                    </Col>
                    <Col md={4}>
                      <Form.Select 
                        value={filterPublicationInstitution}
                        onChange={(e) => setFilterPublicationInstitution(e.target.value)}
                      >
                        <option value="all">Барча муассасалар</option>
                        {institutions.map((inst) => (
                          <option key={inst.username} value={inst.username}>
                            {inst.institution_name}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                  </Row>
                  
                  {/* Action Buttons Row */}
                  <Row className="mt-3">
                    <Col>
                      <div className="d-flex gap-2 align-items-center">
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={handleAddPublication}
                        >
                          <FaPlus className="me-2" />
                          Мақола қўшиш
                        </Button>
                        
                        <small className="text-muted ms-3">
                          Топилди: <strong>{filteredPublications.length}</strong> мақола
                        </small>
                      </div>
                    </Col>
                  </Row>

                  {(publicationSearchQuery || filterPublicationStatus !== 'all' || filterPublicationInstitution !== 'all') && (
                    <div className="mt-3">
                      <Button 
                        variant="link" 
                        size="sm"
                        onClick={() => {
                          setFilterPublicationStatus('all')
                          setFilterPublicationInstitution('all')
                          setPublicationSearchQuery('')
                        }}
                      >
                        Филтрларни тозалаш
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* Publications Table */}
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                  {publicationLoading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <p className="text-muted mt-3">Юкланмоқда...</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table hover className="mb-0">
                        <thead className="bg-light">
                          <tr>
                            <th className="px-4 py-3">№</th>
                            <th className="px-4 py-3">Муаллиф</th>
                            <th className="px-4 py-3">Мақола</th>
                            <th className="px-4 py-3">Йил</th>
                            <th className="px-4 py-3">Журнал</th>
                            <th className="px-4 py-3">Муассаса</th>
                            <th className="px-4 py-3 text-center">Ҳолати</th>
                            <th className="px-4 py-3 text-center">Амаллар</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPublications.length === 0 ? (
                            <tr>
                              <td colSpan="8" className="text-center py-5">
                                <FaBook size={48} className="text-muted mb-3 d-block mx-auto" />
                                <p className="text-muted mb-0">Ҳеч қандай мақола топилмади</p>
                              </td>
                            </tr>
                          ) : (
                            filteredPublications.map((pub, idx) => (
                              <tr key={pub.id}>
                                <td className="px-4 py-3">{idx + 1}</td>
                                <td className="px-4 py-3">
                                  <div className="fw-semibold">{pub.author_full_name}</div>
                                  <small className="text-muted">
                                    {pub.total_articles} мақола • {formatCitations(pub.total_citations)} иқтибос • h={pub.h_index}
                                  </small>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-truncate" style={{ maxWidth: 300 }}>
                                    {pub.title}
                                  </div>
                                </td>
                                <td className="px-4 py-3">{pub.publication_year}</td>
                                <td className="px-4 py-3">
                                  <small className="text-muted">{pub.journal_name || 'N/A'}</small>
                                </td>
                                <td className="px-4 py-3">
                                  <small>{pub.institution_name}</small>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {pub.status === 'approved' && (
                                    <Badge bg="success">
                                      <FaCheckCircle className="me-1" /> Тасдиқланган
                                    </Badge>
                                  )}
                                  {pub.status === 'pending' && (
                                    <Badge bg="warning">
                                      <FaClock className="me-1" /> Кутилмоқда
                                    </Badge>
                                  )}
                                  {pub.status === 'rejected' && (
                                    <Badge bg="danger">
                                      <FaTimes className="me-1" /> Рад этилган
                                    </Badge>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <div className="d-flex gap-1 justify-content-center flex-wrap">
                                    <Button 
                                      variant="outline-primary" 
                                      size="sm"
                                      onClick={() => handleViewPublication(pub)}
                                      title="Кўриш"
                                    >
                                      <FaEye />
                                    </Button>
                                    <Button 
                                      variant="outline-info" 
                                      size="sm"
                                      onClick={() => handleEditPublication(pub)}
                                      title="Таҳрирлаш"
                                    >
                                      <FaEdit />
                                    </Button>
                                    {pub.status === 'pending' && (
                                      <>
                                        <Button 
                                          variant="outline-success" 
                                          size="sm"
                                          onClick={() => handleApprovePublication(pub)}
                                          title="Тасдиқлаш"
                                        >
                                          <FaCheck />
                                        </Button>
                                        <Button 
                                          variant="outline-warning" 
                                          size="sm"
                                          onClick={() => handleRejectPublication(pub)}
                                          title="Рад этиш"
                                        >
                                          <FaTimes />
                                        </Button>
                                      </>
                                    )}
                                    <Button 
                                      variant="outline-danger" 
                                      size="sm"
                                      onClick={() => handleDeletePublication(pub)}
                                      title="Ўчириш"
                                    >
                                      <FaTrash />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h4 className="fw-bold mb-1">Визуал аналитика ва статистика</h4>
                  <p className="text-muted mb-0">Барча патентлар ва илмий мақолалар бўйича тўлиқ аналитик маълумотлар</p>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="text-muted mt-3">Юкланмоқда...</p>
                </div>
              ) : (
                <AnalyticsCharts patents={patents} publications={publications} />
              )}
            </>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <Row className="g-4">
              <Col md={6}>
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-white border-bottom">
                    <h5 className="mb-0 fw-bold">Система созламалари</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label>Университет номи</Form.Label>
                        <Form.Control 
                          type="text" 
                          defaultValue="Геология фанлари университети"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Тизим тили</Form.Label>
                        <Form.Select>
                          <option>Ўзбекча</option>
                          <option>Русский</option>
                          <option>English</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Check 
                          type="checkbox"
                          label="Автоматик тасдиқлаш"
                          defaultChecked={false}
                        />
                      </Form.Group>
                      <Button variant="primary">
                        Сақлаш
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-white border-bottom">
                    <h5 className="mb-0 fw-bold">Хавфсизлик</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label>Эски парол</Form.Label>
                        <Form.Control type="password" />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Янги парол</Form.Label>
                        <Form.Control type="password" />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Паролни тасдиқлаш</Form.Label>
                        <Form.Control type="password" />
                      </Form.Group>
                      <Button variant="warning">
                        Паролни ўзгартириш
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </div>
      </div>

      {/* Patent Details Modal */}
      <Modal 
        show={showPatentModal} 
        onHide={() => setShowPatentModal(false)}
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
                    {selectedPatent.status === 'rejected' && (
                      <Badge bg="danger">
                        <FaTimes className="me-1" /> Рад этилган
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
          {selectedPatent?.status === 'pending' && (
            <>
              <Button 
                variant="success"
                onClick={() => {
                  setShowPatentModal(false)
                  handleApprove(selectedPatent)
                }}
              >
                <FaCheck className="me-2" />
                Тасдиқлаш
              </Button>
              <Button 
                variant="warning"
                onClick={() => {
                  setShowPatentModal(false)
                  handleReject(selectedPatent)
                }}
              >
                <FaTimes className="me-2" />
                Рад этиш
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={() => setShowPatentModal(false)}>
            Ёпиш
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Approve Confirmation Modal */}
      <Modal 
        show={showApproveModal} 
        onHide={() => !submitting && setShowApproveModal(false)}
        centered
        backdrop={submitting ? 'static' : true}
        keyboard={!submitting}
      >
        <Modal.Header closeButton={!submitting} className="bg-success text-white">
          <Modal.Title>
            <FaCheck className="me-2" />
            Тасдиқлаш
          </Modal.Title>
        </Modal.Header>
        {selectedPatent && (
          <Modal.Body>
            <Alert variant="success">
              <FaCheckCircle className="me-2" />
              Сиз бу патентни тасдиқламоқчимисиз?
            </Alert>
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
            onClick={() => setShowApproveModal(false)}
            disabled={submitting}
          >
            Бекор қилиш
          </Button>
          <Button variant="success" onClick={confirmApprove} disabled={submitting}>
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Тасдиқланмоқда...
              </>
            ) : (
              <>
                <FaCheck className="me-2" />
                Ҳа, тасдиқлаш
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal 
        show={showRejectModal} 
        onHide={() => !submitting && setShowRejectModal(false)}
        centered
        backdrop={submitting ? 'static' : true}
        keyboard={!submitting}
      >
        <Modal.Header closeButton={!submitting} className="bg-warning text-dark">
          <Modal.Title>
            <FaTimes className="me-2" />
            Рад этиш
          </Modal.Title>
        </Modal.Header>
        {selectedPatent && (
          <Modal.Body>
            <Alert variant="warning">
              <FaExclamationTriangle className="me-2" />
              Сиз бу патентни рад этмоқчимисиз?
            </Alert>
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
            onClick={() => setShowRejectModal(false)}
            disabled={submitting}
          >
            Бекор қилиш
          </Button>
          <Button variant="warning" onClick={confirmReject} disabled={submitting}>
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Рад этилмоқда...
              </>
            ) : (
              <>
                <FaTimes className="me-2" />
                Ҳа, рад этиш
              </>
            )}
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
            <Alert variant="danger">
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

      {/* User Management Modals */}
      <AddUserModal
        show={showAddUserModal}
        onHide={() => setShowAddUserModal(false)}
        formData={userFormData}
        onChange={handleUserFormChange}
        onSubmit={handleUserFormSubmit}
        errors={userFormErrors}
        submitting={submitting}
      />

      <EditUserModal
        show={showEditUserModal}
        onHide={() => {
          setShowEditUserModal(false)
          setSelectedUser(null)
        }}
        formData={userFormData}
        onChange={handleUserFormChange}
        onSubmit={handleUserEditSubmit}
        errors={userFormErrors}
        submitting={submitting}
      />

      <DeleteUserModal
        show={showDeleteUserModal}
        onHide={() => {
          setShowDeleteUserModal(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
        onConfirm={confirmDeleteUser}
        submitting={submitting}
      />

      <ResetPasswordModal
        show={showResetPasswordModal}
        onHide={() => {
          setShowResetPasswordModal(false)
          setSelectedUser(null)
          setNewPassword('')
        }}
        user={selectedUser}
        password={newPassword}
        onPasswordChange={setNewPassword}
        onConfirm={confirmResetPassword}
        submitting={submitting}
      />

      <ActivityLogsModal
        show={showActivityLogsModal}
        onHide={() => setShowActivityLogsModal(false)}
        logs={activityLogs}
      />

      {/* Add Patent Modal (Admin) */}
      <Modal 
        show={showAddPatentModal} 
        onHide={() => {
          if (!submitting) {
            setShowAddPatentModal(false)
          }
        }}
        size="lg"
        backdrop={submitting ? 'static' : true}
        keyboard={!submitting}
      >
        <Modal.Header closeButton={!submitting} className="bg-primary text-white">
          <Modal.Title>
            <FaPlus className="me-2" />
            Янги патент қўшиш (Админ)
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handlePatentFormSubmit}>
          <Modal.Body>
            {/* Duplicate Warning */}
            {patentDuplicateWarning && (
              <Alert variant="danger" className="mb-3">
                <FaExclamationTriangle className="me-2" />
                <strong>Такрорий патент!</strong>
                <div className="mt-2" style={{ whiteSpace: 'pre-line' }}>
                  {patentDuplicateWarning}
                </div>
              </Alert>
            )}
            
            <Row className="g-3">
              {/* Type Selection - Always First */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Тури <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="type"
                    value={patentFormData.type}
                    onChange={handlePatentFormChange}
                    isInvalid={!!patentFormErrors.type}
                    disabled={submitting}
                  >
                    <option value="">Турини танланг</option>
                    {PATENT_TYPES.map((type, idx) => (
                      <option key={idx} value={type}>{type}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {patentFormErrors.type}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Муассаса <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="institution"
                    value={patentFormData.institution}
                    onChange={handlePatentFormChange}
                    isInvalid={!!patentFormErrors.institution}
                    disabled={submitting}
                  >
                    <option value="">Муассасани танланг</option>
                    {institutions.map((inst) => (
                      <option key={inst.username} value={inst.username}>
                        {inst.institution_name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {patentFormErrors.institution}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Conditional Fields based on Type */}
              {patentFormData.type === 'Муаллифлик ҳуқуқи' ? (
                <>
                  {/* Copyright Fields */}
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>Гувоҳнома рақами <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="patentNumber"
                        value={patentFormData.patentNumber}
                        onChange={handlePatentFormChange}
                        isInvalid={!!patentFormErrors.patentNumber}
                        placeholder="№ 008647"
                        disabled={submitting}
                      />
                      <Form.Control.Feedback type="invalid">
                        {patentFormErrors.patentNumber}
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
                        value={patentFormData.title}
                        onChange={handlePatentFormChange}
                        isInvalid={!!patentFormErrors.title}
                        placeholder="Муаллифлик ҳуқуқи номини киритинг"
                        disabled={submitting}
                      />
                      <Form.Control.Feedback type="invalid">
                        {patentFormErrors.title}
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
                        value={patentFormData.authors}
                        onChange={handlePatentFormChange}
                        isInvalid={!!patentFormErrors.authors}
                        placeholder="Масалан: Qarshiyev Odash (25%), Yevseyeva Galina (20%), Tokareva Kseniya (20%)"
                        disabled={submitting}
                      />
                      <Form.Control.Feedback type="invalid">
                        {patentFormErrors.authors}
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
                        value={patentFormData.registrationDate}
                        onChange={handlePatentFormChange}
                        isInvalid={!!patentFormErrors.registrationDate}
                        disabled={submitting}
                      />
                      <Form.Control.Feedback type="invalid">
                        {patentFormErrors.registrationDate}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Йил <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="number"
                        name="year"
                        value={patentFormData.year}
                        onChange={handlePatentFormChange}
                        isInvalid={!!patentFormErrors.year}
                        disabled={submitting}
                        min="2000"
                        max={new Date().getFullYear()}
                      />
                      <Form.Control.Feedback type="invalid">
                        {patentFormErrors.year}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </>
              ) : patentFormData.type ? (
                <>
                  {/* Regular Patent Fields */}
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Патент рақами <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="patentNumber"
                        value={patentFormData.patentNumber}
                        onChange={handlePatentFormChange}
                        isInvalid={!!patentFormErrors.patentNumber}
                        placeholder="FAP 2745"
                        disabled={submitting}
                      />
                      <Form.Control.Feedback type="invalid">
                        {patentFormErrors.patentNumber}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Талабнома рақами <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="applicationNumber"
                        value={patentFormData.applicationNumber}
                        onChange={handlePatentFormChange}
                        isInvalid={!!patentFormErrors.applicationNumber}
                        placeholder="FAP 20240425"
                        disabled={submitting}
                      />
                      <Form.Control.Feedback type="invalid">
                        {patentFormErrors.applicationNumber}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>Ихтиро номи <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="title"
                        value={patentFormData.title}
                        onChange={handlePatentFormChange}
                        isInvalid={!!patentFormErrors.title}
                        placeholder="Патент номини киритинг"
                        disabled={submitting}
                      />
                      <Form.Control.Feedback type="invalid">
                        {patentFormErrors.title}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Йил <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="number"
                        name="year"
                        value={patentFormData.year}
                        onChange={handlePatentFormChange}
                        isInvalid={!!patentFormErrors.year}
                        disabled={submitting}
                        min="2000"
                        max={new Date().getFullYear()}
                      />
                      <Form.Control.Feedback type="invalid">
                        {patentFormErrors.year}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Топширилган сана <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="date"
                        name="submissionDate"
                        value={patentFormData.submissionDate}
                        onChange={handlePatentFormChange}
                        isInvalid={!!patentFormErrors.submissionDate}
                        disabled={submitting}
                      />
                      <Form.Control.Feedback type="invalid">
                        {patentFormErrors.submissionDate}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Рўйхатдан ўтган сана <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="date"
                        name="registrationDate"
                        value={patentFormData.registrationDate}
                        onChange={handlePatentFormChange}
                        isInvalid={!!patentFormErrors.registrationDate}
                        disabled={submitting}
                      />
                      <Form.Control.Feedback type="invalid">
                        {patentFormErrors.registrationDate}
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
                        value={patentFormData.authors}
                        onChange={handlePatentFormChange}
                        isInvalid={!!patentFormErrors.authors}
                        placeholder="Муаллифларни нуқтали вергул (;) билан ажратинг"
                        disabled={submitting}
                      />
                      <Form.Control.Feedback type="invalid">
                        {patentFormErrors.authors}
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
                    onChange={handlePatentFormChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    isInvalid={!!patentFormErrors.file}
                    disabled={submitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    {patentFormErrors.file}
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
              onClick={() => setShowAddPatentModal(false)}
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
                  <FaPlus className="me-2" />
                  Қўшиш
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Global Search Modal */}
      <GlobalSearch
        show={showGlobalSearch}
        onHide={() => setShowGlobalSearch(false)}
        patents={patents}
        publications={publications}
        onSelectItem={handleSearchSelect}
      />

      {/* Publication Modals */}
      <AddPublicationModal
        show={showAddPublicationModal}
        onHide={() => setShowAddPublicationModal(false)}
        onSubmit={handleSubmitPublication}
        currentUser={currentUser}
        submitting={publicationSubmitting}
        institutions={institutions}
      />

      <EditPublicationModal
        show={showEditPublicationModal}
        onHide={() => {
          setShowEditPublicationModal(false)
          setSelectedPublication(null)
        }}
        onSubmit={handleUpdatePublication}
        publication={selectedPublication}
        submitting={publicationSubmitting}
      />

      <ViewPublicationModal
        show={showViewPublicationModal}
        onHide={() => {
          setShowViewPublicationModal(false)
          setSelectedPublication(null)
        }}
        publication={selectedPublication}
      />

      <DeletePublicationModal
        show={showDeletePublicationModal}
        onHide={() => {
          setShowDeletePublicationModal(false)
          setSelectedPublication(null)
        }}
        onConfirm={confirmDeletePublication}
        publication={selectedPublication}
        submitting={publicationSubmitting}
      />

      <ApprovePublicationModal
        show={showApprovePublicationModal}
        onHide={() => {
          setShowApprovePublicationModal(false)
          setSelectedPublication(null)
        }}
        onConfirm={confirmApprovePublication}
        publication={selectedPublication}
        submitting={publicationSubmitting}
      />

      <RejectPublicationModal
        show={showRejectPublicationModal}
        onHide={() => {
          setShowRejectPublicationModal(false)
          setSelectedPublication(null)
        }}
        onConfirm={confirmRejectPublication}
        publication={selectedPublication}
        submitting={publicationSubmitting}
      />
    </div>
  )
}

export default AdminDashboard