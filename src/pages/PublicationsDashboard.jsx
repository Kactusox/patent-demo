import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Table, Badge, Button, Form, Spinner, Nav, Alert } from 'react-bootstrap'
import { FaBook, FaQuoteRight, FaTrophy, FaUsers, FaPlus, FaDownload, FaFileExcel, FaEye, FaEdit, FaTrash, FaExternalLinkAlt } from 'react-icons/fa'
import { 
  getAllPublications, 
  getPublicationStats, 
  getUniqueAuthors,
  createPublication,
  deletePublication,
  downloadPublicationFile 
} from '../services/publicationService'
import { formatCitations, getQuartileBadge, getStatusBadge } from '../utils/publicationData'
import AddPublicationModal from '../components/AddPublicationModal'

const PublicationsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [publications, setPublications] = useState([])
  const [authors, setAuthors] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Get current user
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}')

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const institution = currentUser.role === 'admin' ? 'all' : currentUser.name
      
      const [pubsData, statsData, authorsData] = await Promise.all([
        getAllPublications({ institution }),
        getPublicationStats(institution),
        getUniqueAuthors(institution)
      ])
      
      setPublications(pubsData)
      setStats(statsData)
      setAuthors(authorsData)
    } catch (err) {
      console.error('Error loading publications:', err)
      setError('Маълумотларни юклашда хато юз берди')
    } finally {
      setLoading(false)
    }
  }

  // Handle add publication
  const handleAddPublication = async (publicationData, file) => {
    try {
      setSubmitting(true)
      await createPublication(publicationData, file)
      setShowAddModal(false)
      loadData()
      alert('✅ Мақола муваффақиятли қўшилди!')
    } catch (err) {
      console.error('Error adding publication:', err)
      alert('❌ Хато: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle delete publication
  const handleDelete = async (id) => {
    if (!window.confirm('Ушбу мақолани ўчиришни хоҳлайсизми?')) return
    
    try {
      await deletePublication(id)
      loadData()
      alert('✅ Мақола ўчирилди')
    } catch (err) {
      console.error('Error deleting publication:', err)
      alert('❌ Хато: ' + err.message)
    }
  }

  // Filter publications
  const filteredPublications = publications.filter(pub => {
    const matchesSearch = searchTerm === '' || 
      pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.author_full_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesYear = filterYear === '' || pub.publication_year === parseInt(filterYear)
    const matchesStatus = filterStatus === '' || pub.status === filterStatus
    
    return matchesSearch && matchesYear && matchesStatus
  })

  // Get unique years
  const uniqueYears = [...new Set(publications.map(p => p.publication_year))].sort((a, b) => b - a)

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    )
  }

  return (
    <Container fluid className="p-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold mb-2">📚 Илмий мақолалар</h2>
          <p className="text-muted">Scopus ва Web of Science тизимлари</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <FaPlus className="me-2" />
            Янги мақола
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Nav variant="tabs" className="mb-4">
        <Nav.Item>
          <Nav.Link active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            Умумий кўриниш
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link active={activeTab === 'publications'} onClick={() => setActiveTab('publications')}>
            Мақолалар ({publications.length})
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link active={activeTab === 'authors'} onClick={() => setActiveTab('authors')}>
            Муаллифлар ({authors.length})
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <Row className="g-4 mb-4">
            <Col md={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                  <FaBook className="text-primary mb-2" size={32} />
                  <h3 className="fw-bold mb-1">{stats.total || 0}</h3>
                  <p className="text-muted mb-0">Жами мақолалар</p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                  <FaQuoteRight className="text-info mb-2" size={32} />
                  <h3 className="fw-bold mb-1">{formatCitations(stats.total_citations || 0)}</h3>
                  <p className="text-muted mb-0">Жами iqtiboslar</p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                  <FaTrophy className="text-warning mb-2" size={32} />
                  <h3 className="fw-bold mb-1">{stats.avg_h_index ? stats.avg_h_index.toFixed(1) : '0.0'}</h3>
                  <p className="text-muted mb-0">Ўртача h-индекс</p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                  <FaUsers className="text-success mb-2" size={32} />
                  <h3 className="fw-bold mb-1">{stats.unique_authors || 0}</h3>
                  <p className="text-muted mb-0">Муаллифлар</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Top Authors */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold">
                <FaTrophy className="me-2 text-warning" />
                Топ муаллифлар
              </h5>
            </Card.Header>
            <Card.Body>
              <Table hover responsive>
                <thead className="table-light">
                  <tr>
                    <th>№</th>
                    <th>Муаллиф</th>
                    <th className="text-center">Мақолалар</th>
                    <th className="text-center">Iqtiboslar</th>
                    <th className="text-center">h-индекс</th>
                    <th className="text-center">Профил</th>
                  </tr>
                </thead>
                <tbody>
                  {authors.slice(0, 10).map((author, idx) => (
                    <tr key={idx}>
                      <td>
                        {idx < 3 ? (
                          <Badge bg={idx === 0 ? 'warning' : idx === 1 ? 'secondary' : 'light'}>
                            {idx + 1}
                          </Badge>
                        ) : (
                          idx + 1
                        )}
                      </td>
                      <td className="fw-semibold">{author.author_full_name}</td>
                      <td className="text-center">
                        <Badge bg="primary">{author.total_articles}</Badge>
                      </td>
                      <td className="text-center">
                        <Badge bg="info">{formatCitations(author.total_citations)}</Badge>
                      </td>
                      <td className="text-center">
                        <Badge bg="success">{author.h_index}</Badge>
                      </td>
                      <td className="text-center">
                        {author.scopus_profile_url && (
                          <a href={author.scopus_profile_url} target="_blank" rel="noopener noreferrer">
                            <FaExternalLinkAlt className="text-primary" />
                          </a>
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

      {/* Publications Tab */}
      {activeTab === 'publications' && (
        <>
          {/* Filters */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Control
                    type="search"
                    placeholder="Қидириш..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Col>
                <Col md={3}>
                  <Form.Select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                    <option value="">Барча йиллар</option>
                    {uniqueYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">Барча ҳолатлар</option>
                    <option value="approved">Тасдиқланган</option>
                    <option value="pending">Кутилмоқда</option>
                    <option value="rejected">Рад этилган</option>
                  </Form.Select>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Publications Table */}
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Table hover responsive>
                <thead className="table-light">
                  <tr>
                    <th>Муаллиф</th>
                    <th>Мақола</th>
                    <th>Йил</th>
                    <th>Журнал</th>
                    <th>Quartile</th>
                    <th>Ҳолат</th>
                    <th className="text-center">Ҳаракатлар</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPublications.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-4">
                        Мақолалар топилмади
                      </td>
                    </tr>
                  ) : (
                    filteredPublications.map((pub) => {
                      const quartileBadge = getQuartileBadge(pub.quartile)
                      const statusBadge = getStatusBadge(pub.status)
                      
                      return (
                        <tr key={pub.id}>
                          <td>
                            <div className="fw-semibold">{pub.author_full_name}</div>
                            <small className="text-muted">
                              {pub.total_articles} мақола • {formatCitations(pub.total_citations)} iqtibos • h={pub.h_index}
                            </small>
                          </td>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: 300 }}>
                              {pub.title}
                            </div>
                            {pub.doi && (
                              <small className="text-muted d-block">DOI: {pub.doi}</small>
                            )}
                          </td>
                          <td>{pub.publication_year}</td>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: 150 }}>
                              {pub.journal_name || 'N/A'}
                            </div>
                            {pub.impact_factor && (
                              <small className="text-muted">IF: {pub.impact_factor}</small>
                            )}
                          </td>
                          <td>
                            <Badge bg={quartileBadge.variant}>{quartileBadge.text}</Badge>
                          </td>
                          <td>
                            <Badge bg={statusBadge.variant}>{statusBadge.text}</Badge>
                          </td>
                          <td className="text-center">
                            {pub.file_path && (
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => downloadPublicationFile(pub)}
                                title="Файлни кўриш"
                              >
                                <FaEye />
                              </Button>
                            )}
                            {pub.scopus_profile_url && (
                              <a
                                href={pub.scopus_profile_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-link btn-sm"
                                title="Scopus профил"
                              >
                                <FaExternalLinkAlt />
                              </a>
                            )}
                            {(currentUser.role === 'admin' || pub.created_by === currentUser.username) && (
                              <Button
                                variant="link"
                                size="sm"
                                className="text-danger"
                                onClick={() => handleDelete(pub.id)}
                                title="Ўчириш"
                              >
                                <FaTrash />
                              </Button>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </>
      )}

      {/* Authors Tab */}
      {activeTab === 'authors' && (
        <Row className="g-4">
          {authors.map((author, idx) => (
            <Col md={6} lg={4} key={idx}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex align-items-start mb-3">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 50, height: 50 }}>
                      <FaUsers size={24} />
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="fw-bold mb-1">{author.author_full_name}</h6>
                      <small className="text-muted">{author.institution_name}</small>
                    </div>
                  </div>
                  
                  <Row className="g-2 mb-3">
                    <Col xs={4}>
                      <div className="text-center p-2 bg-light rounded">
                        <div className="fw-bold text-primary">{author.total_articles}</div>
                        <small className="text-muted">Мақолалар</small>
                      </div>
                    </Col>
                    <Col xs={4}>
                      <div className="text-center p-2 bg-light rounded">
                        <div className="fw-bold text-info">{formatCitations(author.total_citations)}</div>
                        <small className="text-muted">Iqtibос</small>
                      </div>
                    </Col>
                    <Col xs={4}>
                      <div className="text-center p-2 bg-light rounded">
                        <div className="fw-bold text-success">{author.h_index}</div>
                        <small className="text-muted">h-индекс</small>
                      </div>
                    </Col>
                  </Row>
                  
                  {author.scopus_profile_url && (
                    <a
                      href={author.scopus_profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary w-100"
                    >
                      <FaExternalLinkAlt className="me-2" />
                      Scopus профил
                    </a>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Add Publication Modal */}
      <AddPublicationModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onSubmit={handleAddPublication}
        currentUser={currentUser}
        submitting={submitting}
      />
    </Container>
  )
}

export default PublicationsDashboard
