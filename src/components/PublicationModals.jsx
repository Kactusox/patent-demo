import { useState, useEffect } from 'react'
import { Modal, Button, Form, Row, Col, Badge, Table, Alert } from 'react-bootstrap'
import { FaTimes, FaSave, FaExternalLinkAlt, FaDownload, FaCheck, FaExclamationTriangle } from 'react-icons/fa'
import { LANGUAGES, formatCitations, getStatusBadge } from '../utils/publicationData'
import { INSTITUTION_INFO } from '../utils/patentData'

// ==================== ADD PUBLICATION MODAL ====================
export const AddPublicationModal = ({ show, onHide, onSubmit, currentUser, submitting }) => {
  const [formData, setFormData] = useState({
    authorFullName: '',
    authorOrcid: '',
    scopusAuthorId: '',
    scopusProfileUrl: '',
    wosProfileUrl: '',
    googleScholarUrl: '',
    totalArticles: '',
    totalCitations: '',
    hIndex: '',
    title: '',
    publicationYear: new Date().getFullYear(),
    journalName: '',
    language: 'English',
    sjr: '',
    coAuthors: '',
    keywords: '',
    abstract: '',
    institution: currentUser?.role === 'admin' ? 'neftgaz' : (currentUser?.name || 'neftgaz'),
    file: null
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, files } = e.target

    if (name === 'file') {
      if (files[0]) {
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (files[0].size > maxSize) {
          alert('⚠️ Файл ҳажми 10MB дан кичик бўлиши керак!')
          e.target.value = ''
          return
        }
        setFormData(prev => ({ ...prev, file: files[0] }))
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.authorFullName.trim()) newErrors.authorFullName = 'Муаллиф исми киритилиши шарт'
    if (!formData.title.trim()) newErrors.title = 'Мақола номи киритилиши шарт'
    if (!formData.publicationYear) {
      newErrors.publicationYear = 'Йил киритилиши шарт'
    } else {
      const year = parseInt(formData.publicationYear)
      const currentYear = new Date().getFullYear()
      if (year < 1900 || year > currentYear + 1) {
        newErrors.publicationYear = `Йил 1900 дан ${currentYear + 1} гача бўлиши керак`
      }
    }
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const selectedInst = currentUser?.role === 'admin' ? formData.institution : (currentUser?.name || 'neftgaz')
    const publicationData = {
      ...formData,
      institution: selectedInst,
      institutionName: INSTITUTION_INFO[selectedInst]?.fullName || currentUser?.fullName || '',
      createdBy: currentUser?.username || 'unknown'
    }

    onSubmit(publicationData, formData.file)
  }

  const handleClose = () => {
    setFormData({
      authorFullName: '',
      authorOrcid: '',
      scopusAuthorId: '',
      scopusProfileUrl: '',
      wosProfileUrl: '',
      googleScholarUrl: '',
      totalArticles: '',
      totalCitations: '',
      hIndex: '',
      title: '',
      publicationYear: new Date().getFullYear(),
      journalName: '',
      language: 'English',
      sjr: '',
      coAuthors: '',
      keywords: '',
      abstract: '',
      institution: currentUser?.role === 'admin' ? 'neftgaz' : (currentUser?.name || 'neftgaz'),
      file: null
    })
    setErrors({})
    onHide()
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header>
        <Modal.Title>Илмий мақола қўшиш</Modal.Title>
        <Button variant="link" onClick={handleClose} className="text-secondary">
          <FaTimes />
        </Button>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Institution Selection for Admin */}
          {currentUser?.role === 'admin' && (
            <>
              <h6 className="fw-bold mb-3 text-primary">ИНСТИТУТ ТАНЛАШ</h6>
              <Row className="g-3 mb-4">
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Институт <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      name="institution"
                      value={formData.institution}
                      onChange={handleChange}
                      disabled={submitting}
                    >
                      {Object.entries(INSTITUTION_INFO).map(([key, info]) => (
                        <option key={key} value={key}>
                          {info.fullName}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}

          {/* Author Information */}
          <h6 className="fw-bold mb-3 text-primary">МУАЛЛИФ МАЪЛУМОТЛАРИ</h6>
          <Row className="g-3 mb-4">
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Ф.И.Ш. <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="authorFullName"
                  value={formData.authorFullName}
                  onChange={handleChange}
                  isInvalid={!!errors.authorFullName}
                  placeholder="Masalan: Shukurov N. E."
                  disabled={submitting}
                />
                <Form.Control.Feedback type="invalid">{errors.authorFullName}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Жами мақолалар</Form.Label>
                <Form.Control
                  type="number"
                  name="totalArticles"
                  value={formData.totalArticles}
                  onChange={handleChange}
                  placeholder="28"
                  min="0"
                  disabled={submitting}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Жами iqtiboslar</Form.Label>
                <Form.Control
                  type="number"
                  name="totalCitations"
                  value={formData.totalCitations}
                  onChange={handleChange}
                  placeholder="570"
                  min="0"
                  disabled={submitting}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>h-индекс</Form.Label>
                <Form.Control
                  type="number"
                  name="hIndex"
                  value={formData.hIndex}
                  onChange={handleChange}
                  placeholder="13"
                  min="0"
                  disabled={submitting}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Scopus профил хаволаси</Form.Label>
                <Form.Control
                  type="url"
                  name="scopusProfileUrl"
                  value={formData.scopusProfileUrl}
                  onChange={handleChange}
                  placeholder="https://www.scopus.com/authid/detail.uri?authorId=..."
                  disabled={submitting}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>ORCID</Form.Label>
                <Form.Control
                  type="text"
                  name="authorOrcid"
                  value={formData.authorOrcid}
                  onChange={handleChange}
                  placeholder="0000-0002-1234-5678"
                  disabled={submitting}
                />
                <Form.Text className="text-muted">Формат: 0000-0002-1234-5678</Form.Text>
              </Form.Group>
            </Col>
          </Row>

          {/* Publication Details */}
          <h6 className="fw-bold mb-3 text-primary">МАҚОЛА МАЪЛУМОТЛАРИ</h6>
          <Row className="g-3 mb-4">
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Мақола номи <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  isInvalid={!!errors.title}
                  placeholder="Geochemistry and risk assessment..."
                  disabled={submitting}
                />
                <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Йил <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="number"
                  name="publicationYear"
                  value={formData.publicationYear}
                  onChange={handleChange}
                  isInvalid={!!errors.publicationYear}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  disabled={submitting}
                />
                <Form.Control.Feedback type="invalid">{errors.publicationYear}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Тил</Form.Label>
                <Form.Select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  disabled={submitting}
                >
                  {LANGUAGES.map((lang, idx) => (
                    <option key={idx} value={lang}>{lang}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Журнал номи</Form.Label>
                <Form.Control
                  type="text"
                  name="journalName"
                  value={formData.journalName}
                  onChange={handleChange}
                  placeholder="Environmental Geochemistry"
                  disabled={submitting}
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group>
                <Form.Label>Ҳаммуаллифлар</Form.Label>
                <Form.Control
                  type="text"
                  name="coAuthors"
                  value={formData.coAuthors}
                  onChange={handleChange}
                  placeholder="John Smith; Jane Doe; Ali Karimov"
                  disabled={submitting}
                />
                <Form.Text className="text-muted">Нуқтали вергул (;) билан ажратинг</Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group>
                <Form.Label>Файл (PDF, JPG, PNG) - Ихтиёрий</Form.Label>
                <Form.Control
                  type="file"
                  name="file"
                  onChange={handleChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  disabled={submitting}
                />
                <Form.Text className="text-muted">
                  Макс. 10MB. Ихтиёрий - агар тўғридан-тўғри ҳаволалар мавжуд бўлса.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Бекор қилиш
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Сақланмоқда...' : 'Сақлаш'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

// ==================== VIEW PUBLICATION MODAL ====================
export const ViewPublicationModal = ({ show, onHide, publication }) => {
  if (!publication) return null

  const statusBadge = getStatusBadge(publication.status)

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header>
        <Modal.Title>Мақола тафсилотлари</Modal.Title>
        <Button variant="link" onClick={onHide} className="text-secondary">
          <FaTimes />
        </Button>
      </Modal.Header>

      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {/* Author Section */}
        <div className="mb-4">
          <h6 className="fw-bold text-primary mb-3">МУАЛЛИФ МАЪЛУМОТЛАРИ</h6>
          <Row className="g-3">
            <Col xs={12}>
              <div className="bg-light p-3 rounded">
                <h5 className="fw-bold mb-2">{publication.author_full_name}</h5>
                <div className="d-flex gap-3 mb-2">
                  <Badge bg="primary">{publication.total_articles || 0} мақола</Badge>
                  <Badge bg="info">{formatCitations(publication.total_citations || 0)} iqtibос</Badge>
                  <Badge bg="success">h-индекс: {publication.h_index || 0}</Badge>
                </div>
                {publication.author_orcid && (
                  <div className="mb-1">
                    <strong>ORCID:</strong> {publication.author_orcid}
                  </div>
                )}
                {publication.scopus_profile_url && (
                  <div>
                    <a href={publication.scopus_profile_url} target="_blank" rel="noopener noreferrer">
                      <FaExternalLinkAlt className="me-1" />
                      Scopus профилни кўриш
                    </a>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </div>

        {/* Publication Section */}
        <div className="mb-4">
          <h6 className="fw-bold text-primary mb-3">МАҚОЛА МАЪЛУМОТЛАРИ</h6>
          <Table bordered>
            <tbody>
              <tr>
                <td className="fw-semibold" style={{ width: '30%' }}>Номи</td>
                <td>{publication.title}</td>
              </tr>
              <tr>
                <td className="fw-semibold">Йил</td>
                <td>{publication.publication_year}</td>
              </tr>
              <tr>
                <td className="fw-semibold">Журнал</td>
                <td>{publication.journal_name || 'N/A'}</td>
              </tr>
              <tr>
                <td className="fw-semibold">Тил</td>
                <td>{publication.language}</td>
              </tr>
              {publication.co_authors && (
                <tr>
                  <td className="fw-semibold">Ҳаммуаллифлар</td>
                  <td>{publication.co_authors}</td>
                </tr>
              )}
              <tr>
                <td className="fw-semibold">Муассаса</td>
                <td>{publication.institution_name}</td>
              </tr>
              <tr>
                <td className="fw-semibold">Ҳолат</td>
                <td>
                  <Badge bg={statusBadge.variant}>{statusBadge.text}</Badge>
                </td>
              </tr>
              <tr>
                <td className="fw-semibold">Қўшилган сана</td>
                <td>{new Date(publication.created_at).toLocaleString('uz-UZ')}</td>
              </tr>
            </tbody>
          </Table>
        </div>

        {/* File Section */}
        {publication.file_path && (
          <div>
            <h6 className="fw-bold text-primary mb-3">ФАЙЛ</h6>
            <div className="bg-light p-3 rounded">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{publication.file_name}</strong>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => window.open(`http://localhost:5001${publication.file_path}`, '_blank')}
                >
                  <FaDownload className="me-2" />
                  Юклаб олиш
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Ёпиш
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

// ==================== EDIT PUBLICATION MODAL ====================
export const EditPublicationModal = ({ show, onHide, onSubmit, publication, submitting }) => {
  const [formData, setFormData] = useState({
    authorFullName: '',
    authorOrcid: '',
    scopusAuthorId: '',
    scopusProfileUrl: '',
    wosProfileUrl: '',
    googleScholarUrl: '',
    totalArticles: '',
    totalCitations: '',
    hIndex: '',
    title: '',
    publicationYear: new Date().getFullYear(),
    journalName: '',
    language: 'English',
    sjr: '',
    coAuthors: '',
    keywords: '',
    abstract: '',
    file: null
  })
  const [errors, setErrors] = useState({})

  // Load publication data when modal opens
  useEffect(() => {
    if (publication) {
      setFormData({
        authorFullName: publication.author_full_name || '',
        authorOrcid: publication.author_orcid || '',
        scopusAuthorId: publication.scopus_author_id || '',
        scopusProfileUrl: publication.scopus_profile_url || '',
        wosProfileUrl: publication.wos_profile_url || '',
        googleScholarUrl: publication.google_scholar_url || '',
        totalArticles: publication.total_articles || '',
        totalCitations: publication.total_citations || '',
        hIndex: publication.h_index || '',
        title: publication.title || '',
        publicationYear: publication.publication_year || new Date().getFullYear(),
        journalName: publication.journal_name || '',
        language: publication.language || 'English',
        sjr: publication.sjr || '',
        coAuthors: publication.co_authors || '',
        keywords: publication.keywords || '',
        abstract: publication.abstract || '',
        file: null
      })
    }
  }, [publication])

  const handleChange = (e) => {
    const { name, value, files } = e.target

    if (name === 'file') {
      if (files[0]) {
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (files[0].size > maxSize) {
          alert('⚠️ Файл ҳажми 10MB дан кичик бўлиши керак!')
          e.target.value = ''
          return
        }
        setFormData(prev => ({ ...prev, file: files[0] }))
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.authorFullName.trim()) newErrors.authorFullName = 'Муаллиф исми киритилиши шарт'
    if (!formData.title.trim()) newErrors.title = 'Мақола номи киритилиши шарт'
    if (!formData.publicationYear) {
      newErrors.publicationYear = 'Йил киритилиши шарт'
    } else {
      const year = parseInt(formData.publicationYear)
      const currentYear = new Date().getFullYear()
      if (year < 1900 || year > currentYear + 1) {
        newErrors.publicationYear = `Йил 1900 дан ${currentYear + 1} гача бўлиши керак`
      }
    }
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(publication.id, formData, formData.file)
  }

  const handleClose = () => {
    setErrors({})
    onHide()
  }

  if (!publication) return null

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header>
        <Modal.Title>Мақолани таҳрирлаш</Modal.Title>
        <Button variant="link" onClick={handleClose} className="text-secondary">
          <FaTimes />
        </Button>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Author Information */}
          <h6 className="fw-bold mb-3 text-primary">МУАЛЛИФ МАЪЛУМОТЛАРИ</h6>
          <Row className="g-3 mb-4">
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Ф.И.Ш. <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="authorFullName"
                  value={formData.authorFullName}
                  onChange={handleChange}
                  isInvalid={!!errors.authorFullName}
                  disabled={submitting}
                />
                <Form.Control.Feedback type="invalid">{errors.authorFullName}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Жами мақолалар</Form.Label>
                <Form.Control
                  type="number"
                  name="totalArticles"
                  value={formData.totalArticles}
                  onChange={handleChange}
                  min="0"
                  disabled={submitting}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Жами iqtiboslar</Form.Label>
                <Form.Control
                  type="number"
                  name="totalCitations"
                  value={formData.totalCitations}
                  onChange={handleChange}
                  min="0"
                  disabled={submitting}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>h-индекс</Form.Label>
                <Form.Control
                  type="number"
                  name="hIndex"
                  value={formData.hIndex}
                  onChange={handleChange}
                  min="0"
                  disabled={submitting}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Scopus профил хаволаси</Form.Label>
                <Form.Control
                  type="url"
                  name="scopusProfileUrl"
                  value={formData.scopusProfileUrl}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>ORCID</Form.Label>
                <Form.Control
                  type="text"
                  name="authorOrcid"
                  value={formData.authorOrcid}
                  onChange={handleChange}
                  placeholder="0000-0002-1234-5678"
                  disabled={submitting}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Publication Details */}
          <h6 className="fw-bold mb-3 text-primary">МАҚОЛА МАЪЛУМОТЛАРИ</h6>
          <Row className="g-3 mb-4">
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Мақола номи <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  isInvalid={!!errors.title}
                  disabled={submitting}
                />
                <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Йил <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="number"
                  name="publicationYear"
                  value={formData.publicationYear}
                  onChange={handleChange}
                  isInvalid={!!errors.publicationYear}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  disabled={submitting}
                />
                <Form.Control.Feedback type="invalid">{errors.publicationYear}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Тил</Form.Label>
                <Form.Select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  disabled={submitting}
                >
                  {LANGUAGES.map((lang, idx) => (
                    <option key={idx} value={lang}>{lang}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Журнал номи</Form.Label>
                <Form.Control
                  type="text"
                  name="journalName"
                  value={formData.journalName}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group>
                <Form.Label>Ҳаммуаллифлар</Form.Label>
                <Form.Control
                  type="text"
                  name="coAuthors"
                  value={formData.coAuthors}
                  onChange={handleChange}
                  placeholder="John Smith; Jane Doe"
                  disabled={submitting}
                />
                <Form.Text className="text-muted">Нуқтали вергул (;) билан ажратинг</Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group>
                <Form.Label>Файл (PDF, JPG, PNG) - Ихтиёрий</Form.Label>
                <Form.Control
                  type="file"
                  name="file"
                  onChange={handleChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  disabled={submitting}
                />
                <Form.Text className="text-muted">
                  Макс. 10MB. Файл юкламасангиз, эски файл сақланади.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Бекор қилиш
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
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
  )
}

// ==================== DELETE PUBLICATION MODAL ====================
export const DeletePublicationModal = ({ show, onHide, onConfirm, publication, submitting }) => {
  if (!publication) return null

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header>
        <Modal.Title className="text-danger">
          <FaExclamationTriangle className="me-2" />
          Мақолани ўчириш
        </Modal.Title>
        <Button variant="link" onClick={onHide} className="text-secondary">
          <FaTimes />
        </Button>
      </Modal.Header>

      <Modal.Body>
        <Alert variant="warning">
          <FaExclamationTriangle className="me-2" />
          <strong>Огоҳлантириш!</strong> Бу амалдан кейин қайтариб бўлмайди.
        </Alert>
        <p className="mb-2">Қуйидаги мақолани ўчиришга ишончингиз комилми?</p>
        <div className="bg-light p-3 rounded">
          <div className="mb-2">
            <strong>Муаллиф:</strong> {publication.author_full_name}
          </div>
          <div className="mb-2">
            <strong>Мақола:</strong> {publication.title}
          </div>
          <div>
            <strong>Йил:</strong> {publication.publication_year}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={submitting}>
          Бекор қилиш
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={submitting}>
          {submitting ? 'Ўчирилмоқда...' : 'Ҳа, ўчириш'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

// ==================== APPROVE PUBLICATION MODAL ====================
export const ApprovePublicationModal = ({ show, onHide, onConfirm, publication, submitting }) => {
  if (!publication) return null

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header>
        <Modal.Title className="text-success">
          <FaCheck className="me-2" />
          Мақолани тасдиқлаш
        </Modal.Title>
        <Button variant="link" onClick={onHide} className="text-secondary">
          <FaTimes />
        </Button>
      </Modal.Header>

      <Modal.Body>
        <p className="mb-2">Қуйидаги мақолани тасдиқламоқчимисиз?</p>
        <div className="bg-light p-3 rounded">
          <div className="mb-2">
            <strong>Муаллиф:</strong> {publication.author_full_name}
          </div>
          <div className="mb-2">
            <strong>Мақола:</strong> {publication.title}
          </div>
          <div className="mb-2">
            <strong>Йил:</strong> {publication.publication_year}
          </div>
          <div>
            <strong>Муассаса:</strong> {publication.institution_name}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={submitting}>
          Бекор қилиш
        </Button>
        <Button variant="success" onClick={onConfirm} disabled={submitting}>
          {submitting ? 'Тасдиқланмоқда...' : 'Ҳа, тасдиқлаш'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

// ==================== REJECT PUBLICATION MODAL ====================
export const RejectPublicationModal = ({ show, onHide, onConfirm, publication, submitting }) => {
  if (!publication) return null

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header>
        <Modal.Title className="text-warning">
          <FaTimes className="me-2" />
          Мақолани рад этиш
        </Modal.Title>
        <Button variant="link" onClick={onHide} className="text-secondary">
          <FaTimes />
        </Button>
      </Modal.Header>

      <Modal.Body>
        <p className="mb-2">Қуйидаги мақолани рад этмоқчимисиз?</p>
        <div className="bg-light p-3 rounded">
          <div className="mb-2">
            <strong>Муаллиф:</strong> {publication.author_full_name}
          </div>
          <div className="mb-2">
            <strong>Мақола:</strong> {publication.title}
          </div>
          <div className="mb-2">
            <strong>Йил:</strong> {publication.publication_year}
          </div>
          <div>
            <strong>Муассаса:</strong> {publication.institution_name}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={submitting}>
          Бекор қилиш
        </Button>
        <Button variant="warning" onClick={onConfirm} disabled={submitting}>
          {submitting ? 'Рад этилмоқда...' : 'Ҳа, рад этиш'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
