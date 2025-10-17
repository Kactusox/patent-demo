import { useState, useEffect, useRef } from 'react'
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap'
import { FaTimes } from 'react-icons/fa'
import { LANGUAGES } from '../utils/publicationData'
import { INSTITUTION_INFO } from '../utils/patentData'

const AddPublicationModal = ({ show, onHide, onSubmit, currentUser, submitting }) => {
  const fileInputRef = useRef(null)
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
    institution: currentUser.role === 'admin' ? 'neftgaz' : currentUser.name,
    file: null
  })

  const [errors, setErrors] = useState({})

  // Reset form when modal is closed
  useEffect(() => {
    if (!show) {
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
        institution: currentUser.role === 'admin' ? 'neftgaz' : currentUser.name,
        file: null
      })
      setErrors({})
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [show, currentUser])

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

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.authorFullName.trim()) {
      newErrors.authorFullName = 'Муаллиф исми киритилиши шарт'
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Мақола номи киритилиши шарт'
    }

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

    // Prepare data for submission
    const selectedInst = currentUser.role === 'admin' ? formData.institution : currentUser.name
    const publicationData = {
      ...formData,
      institution: selectedInst,
      institutionName: INSTITUTION_INFO[selectedInst]?.name || currentUser.institutionName || 'Unknown Institution',
      createdBy: currentUser.username
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
      institution: currentUser.role === 'admin' ? 'neftgaz' : currentUser.name,
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
          {currentUser.role === 'admin' && (
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
                          {info.name}
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
                <Form.Control.Feedback type="invalid">
                  {errors.authorFullName}
                </Form.Control.Feedback>
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
                <Form.Label>Жами иқтибослар</Form.Label>
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
                <Form.Text className="text-muted">
                  Формат: 0000-0002-1234-5678
                </Form.Text>
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
                <Form.Control.Feedback type="invalid">
                  {errors.title}
                </Form.Control.Feedback>
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
                <Form.Control.Feedback type="invalid">
                  {errors.publicationYear}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
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

            <Col xs={12}>
              <Form.Group>
                <Form.Label>Журнал номи</Form.Label>
                <Form.Control
                  type="text"
                  name="journalName"
                  value={formData.journalName}
                  onChange={handleChange}
                  placeholder="Environmental Geochemistry and Health"
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
                <Form.Text className="text-muted">
                  Нуқтали вергул (;) билан ажратинг
                </Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group>
                <Form.Label>Файл (PDF, JPG, PNG) - Ихтиёрий</Form.Label>
                <Form.Control
                  type="file"
                  name="file"
                  ref={fileInputRef}
                  onChange={handleChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  disabled={submitting}
                />
                <Form.Text className="text-muted">
                  Макс. 10MB. Ихтиёрий - агар тўғридан-тўғри ҳаволалар мавжуд бўлса, юкламасангиз ҳам бўлади.
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

export default AddPublicationModal
