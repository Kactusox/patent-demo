import { useState, useEffect } from 'react'
import { Modal, Form, InputGroup, ListGroup, Badge, Spinner } from 'react-bootstrap'
import { FaSearch, FaTimes, FaFileAlt, FaBook, FaBuilding } from 'react-icons/fa'

const GlobalSearch = ({ show, onHide, patents, publications, onSelectItem }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ patents: [], publications: [] })
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setResults({ patents: [], publications: [] })
      return
    }

    setSearching(true)
    const timeoutId = setTimeout(() => {
      performSearch(query)
      setSearching(false)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, patents, publications])

  const performSearch = (searchQuery) => {
    const lowerQuery = searchQuery.toLowerCase()

    // Search patents
    const patentResults = patents.filter(patent => 
      patent.title.toLowerCase().includes(lowerQuery) ||
      patent.patent_number.toLowerCase().includes(lowerQuery) ||
      patent.authors.toLowerCase().includes(lowerQuery) ||
      patent.type.toLowerCase().includes(lowerQuery) ||
      patent.institution_name.toLowerCase().includes(lowerQuery)
    ).slice(0, 10)

    // Search publications
    const publicationResults = publications.filter(pub => 
      pub.title.toLowerCase().includes(lowerQuery) ||
      pub.author_full_name.toLowerCase().includes(lowerQuery) ||
      pub.journal_name?.toLowerCase().includes(lowerQuery) ||
      pub.keywords?.toLowerCase().includes(lowerQuery) ||
      pub.institution_name.toLowerCase().includes(lowerQuery)
    ).slice(0, 10)

    setResults({
      patents: patentResults,
      publications: publicationResults
    })
  }

  const handleSelectPatent = (patent) => {
    onSelectItem('patent', patent)
    handleClose()
  }

  const handleSelectPublication = (publication) => {
    onSelectItem('publication', publication)
    handleClose()
  }

  const handleClose = () => {
    setQuery('')
    setResults({ patents: [], publications: [] })
    onHide()
  }

  const totalResults = results.patents.length + results.publications.length

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header className="border-bottom-0 pb-0">
        <div className="w-100">
          <InputGroup size="lg">
            <InputGroup.Text className="bg-white border-end-0">
              <FaSearch className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Патент номи, муаллиф, мақола номи ёки DOI бўйича қидириш..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-start-0 border-end-0"
              autoFocus
            />
            <InputGroup.Text className="bg-white border-start-0">
              {searching && <Spinner animation="border" size="sm" />}
            </InputGroup.Text>
          </InputGroup>
        </div>
        <button 
          type="button" 
          className="btn-close ms-2" 
          onClick={handleClose}
          aria-label="Close"
        />
      </Modal.Header>

      <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {!query.trim() ? (
          <div className="text-center py-5 text-muted">
            <FaSearch size={48} className="mb-3 opacity-50" />
            <p className="mb-0">Қидириш учун матн киритинг</p>
            <small>Патентлар, илмий мақолалар ва муаллифлар орасида қидириш</small>
          </div>
        ) : totalResults === 0 ? (
          <div className="text-center py-5 text-muted">
            <FaSearch size={48} className="mb-3 opacity-50" />
            <p className="mb-0">Натижа топилмади</p>
            <small>Бошқа калит сўзларни синаб кўринг</small>
          </div>
        ) : (
          <>
            {/* Patent Results */}
            {results.patents.length > 0 && (
              <div className="mb-4">
                <h6 className="fw-bold mb-3">
                  <FaFileAlt className="me-2 text-primary" />
                  Патентлар ({results.patents.length})
                </h6>
                <ListGroup>
                  {results.patents.map(patent => (
                    <ListGroup.Item 
                      key={patent.id}
                      action
                      onClick={() => handleSelectPatent(patent)}
                      className="border-start-0 border-end-0"
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-2">
                            <Badge bg="primary" className="me-2">{patent.patent_number}</Badge>
                            <Badge 
                              bg={patent.status === 'approved' ? 'success' : patent.status === 'pending' ? 'warning' : 'danger'}
                              className="me-2"
                            >
                              {patent.status === 'approved' ? 'Тасдиқланган' : patent.status === 'pending' ? 'Кутилмоқда' : 'Рад этилган'}
                            </Badge>
                          </div>
                          <div className="fw-semibold mb-1">{patent.title}</div>
                          <small className="text-muted">
                            <FaBuilding className="me-1" />
                            {patent.institution_name} • {patent.authors}
                          </small>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            )}

            {/* Publication Results */}
            {results.publications.length > 0 && (
              <div>
                <h6 className="fw-bold mb-3">
                  <FaBook className="me-2 text-success" />
                  Илмий мақолалар ({results.publications.length})
                </h6>
                <ListGroup>
                  {results.publications.map(pub => (
                    <ListGroup.Item 
                      key={pub.id}
                      action
                      onClick={() => handleSelectPublication(pub)}
                      className="border-start-0 border-end-0"
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-2">
                            <Badge bg="info" className="me-2">{pub.publication_year}</Badge>
                            <Badge 
                              bg={pub.status === 'approved' ? 'success' : pub.status === 'pending' ? 'warning' : 'danger'}
                            >
                              {pub.status === 'approved' ? 'Тасдиқланган' : pub.status === 'pending' ? 'Кутилмоқда' : 'Рад этилган'}
                            </Badge>
                          </div>
                          <div className="fw-semibold mb-1">{pub.title}</div>
                          <small className="text-muted">
                            {pub.author_full_name} • {pub.journal_name || 'N/A'}
                            <br />
                            <FaBuilding className="me-1" />
                            {pub.institution_name} • {pub.total_citations} iqtibos
                          </small>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            )}
          </>
        )}
      </Modal.Body>
    </Modal>
  )
}

export default GlobalSearch
