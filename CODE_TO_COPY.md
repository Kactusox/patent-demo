# Code to Copy - User Export & Password Change

## File 1: `src/services/authService.js`

**Location to update:** Around line 11-25

**Replace this section:**
```javascript
    if (data.success && data.user) {
      // Create session data
      const sessionData = {
        username: data.user.username,
        role: data.user.role,
        name: data.user.username,
        fullName: data.user.fullName || data.user.institutionName,
        shortName: data.user.institutionName,
        loginTime: new Date().toISOString(),
      }

      // Store session
      sessionStorage.setItem('currentUser', JSON.stringify(sessionData))
```

**With this:**
```javascript
    if (data.success && data.user) {
      // Create session data
      const sessionData = {
        id: data.user.id,
        username: data.user.username,
        role: data.user.role,
        name: data.user.username,
        fullName: data.user.fullName || data.user.institutionName,
        shortName: data.user.institutionName,
        phoneNumber: data.user.phoneNumber,
        loginTime: new Date().toISOString(),
      }

      // Store session
      sessionStorage.setItem('currentUser', JSON.stringify(sessionData))
```

---

## File 2: `src/pages/UserDashboard.jsx`

### Part A: Update imports (around line 10-20)

**Replace this:**
```javascript
import { 
  getAllPatents, 
  createPatent, 
  updatePatent, 
  deletePatent, 
  checkDuplicate,
  downloadPatent 
} from '../services/patentService'
import { PATENT_TYPES } from '../utils/patentData'
```

**With this:**
```javascript
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
```

### Part B: Add state variables (around line 44-48)

**After this line:**
```javascript
  const [formErrors, setFormErrors] = useState({})
  const [duplicateWarning, setDuplicateWarning] = useState('')
```

**Add this:**
```javascript
  
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
```

### Part C: Add useEffect for export stats (around line 65-67)

**After this:**
```javascript
  // Load patents on mount
  useEffect(() => {
    loadPatents()
  }, [])
```

**Add this:**
```javascript
  
  // Load export stats when documents tab is active
  useEffect(() => {
    if (activeTab === 'documents') {
      loadExportStats()
    }
  }, [activeTab])
```

### Part D: Add handler functions (around line 280)

**After this function:**
```javascript
  const handleDownload = (patent) => {
    downloadPatent(patent)
  }
```

**Add these functions:**
```javascript
  
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
```

### Part E: Update Documents Tab UI (around line 508-536)

**Find the Search Bar section that looks like:**
```javascript
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
                  {searchQuery && (
                    <small className="text-muted mt-2 d-block">
                      Топилди: <strong>{filteredPatents.length}</strong> натижа
                    </small>
                  )}
                </Card.Body>
              </Card>
```

**Replace it with:**
```javascript
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
```

### Part F: Update Profile Tab Password Form (around line 690-715)

**Find this section:**
```javascript
              <Col md={6}>
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-white border-bottom">
                    <h5 className="mb-0 fw-bold">Паролни ўзгартириш</h5>
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
```

**Replace it with:**
```javascript
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
```

---

## ✅ That's It!

These are all the changes you need to make. Copy each section carefully into your VSCode editor.

### Quick Checklist:
- [ ] Update `src/services/authService.js` (1 change)
- [ ] Update `src/pages/UserDashboard.jsx` (6 sections)

### Files that DON'T need changes:
- ✅ Backend routes (already working)
- ✅ userService.js (already has changePassword function)
- ✅ exportService.js (already has export functions)
- ✅ api.js (already has endpoints)
