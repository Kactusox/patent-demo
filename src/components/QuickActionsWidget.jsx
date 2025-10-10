import { Card, Row, Col, Button } from 'react-bootstrap'
import { FaPlus, FaBook, FaFileAlt, FaDownload, FaChartBar } from 'react-icons/fa'

const QuickActionsWidget = ({ onAddPatent, onAddPublication, onViewPatents, onViewPublications }) => {
  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Header className="bg-white border-bottom py-3">
        <h6 className="mb-0 fw-bold">Тез амаллар</h6>
      </Card.Header>
      <Card.Body>
        <Row className="g-3">
          <Col xs={6} md={3}>
            <Button 
              variant="outline-primary" 
              className="w-100 py-3"
              onClick={onAddPatent}
            >
              <FaPlus className="d-block mx-auto mb-2" size={24} />
              <small>Патент қўшиш</small>
            </Button>
          </Col>
          <Col xs={6} md={3}>
            <Button 
              variant="outline-purple" 
              className="w-100 py-3"
              style={{ borderColor: '#6f42c1', color: '#6f42c1' }}
              onClick={onAddPublication}
            >
              <FaBook className="d-block mx-auto mb-2" size={24} />
              <small>Мақола қўшиш</small>
            </Button>
          </Col>
          <Col xs={6} md={3}>
            <Button 
              variant="outline-secondary" 
              className="w-100 py-3"
              onClick={onViewPatents}
            >
              <FaFileAlt className="d-block mx-auto mb-2" size={24} />
              <small>Патентлар</small>
            </Button>
          </Col>
          <Col xs={6} md={3}>
            <Button 
              variant="outline-info" 
              className="w-100 py-3"
              onClick={onViewPublications}
            >
              <FaChartBar className="d-block mx-auto mb-2" size={24} />
              <small>Мақолалар</small>
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}

export default QuickActionsWidget
