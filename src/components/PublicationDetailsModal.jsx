import { Modal, Button, Row, Col, Badge, Table } from 'react-bootstrap'
import { FaTimes, FaExternalLinkAlt, FaDownload } from 'react-icons/fa'
import { formatCitations, getQuartileBadge, getStatusBadge } from '../utils/publicationData'

const PublicationDetailsModal = ({ show, onHide, publication }) => {
  if (!publication) return null

  const quartileBadge = getQuartileBadge(publication.quartile)
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
                  <Badge bg="primary">{publication.total_articles} мақола</Badge>
                  <Badge bg="info">{formatCitations(publication.total_citations)} iqtibос</Badge>
                  <Badge bg="success">h-индекс: {publication.h_index}</Badge>
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
                <td className="fw-semibold">DOI</td>
                <td>
                  {publication.doi ? (
                    <a href={`https://doi.org/${publication.doi}`} target="_blank" rel="noopener noreferrer">
                      {publication.doi} <FaExternalLinkAlt size={12} />
                    </a>
                  ) : 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="fw-semibold">Тур</td>
                <td>{publication.publication_type}</td>
              </tr>
              <tr>
                <td className="fw-semibold">Тил</td>
                <td>{publication.language}</td>
              </tr>
              <tr>
                <td className="fw-semibold">Impact Factor</td>
                <td>{publication.impact_factor || 'N/A'}</td>
              </tr>
              <tr>
                <td className="fw-semibold">Quartile</td>
                <td>
                  <Badge bg={quartileBadge.variant}>{quartileBadge.text}</Badge>
                </td>
              </tr>
              {publication.co_authors && (
                <tr>
                  <td className="fw-semibold">Ҳаммуаллифлар</td>
                  <td>{publication.co_authors}</td>
                </tr>
              )}
              {publication.research_field && (
                <tr>
                  <td className="fw-semibold">Соҳа</td>
                  <td>{publication.research_field}</td>
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
                  onClick={() => window.open(`http://localhost:5001/api${publication.file_path}`, '_blank')}
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

export default PublicationDetailsModal
