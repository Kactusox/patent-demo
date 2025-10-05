import React from 'react'
import { Alert, Button, Card } from 'react-bootstrap'
import { FaExclamationTriangle, FaRefresh } from 'react-icons/fa'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
          <Card className="w-100" style={{ maxWidth: '600px' }}>
            <Card.Header className="bg-danger text-white">
              <h4 className="mb-0">
                <FaExclamationTriangle className="me-2" />
                Тизимда хато юз берди
              </h4>
            </Card.Header>
            <Card.Body className="p-4">
              <Alert variant="danger">
                <Alert.Heading>Кечирасиз, тизимда кўзда тутилмаган хато юз берди.</Alert.Heading>
                <p>
                  Бу хато автоматик равишда қайд этилди. Агар бу хато қайта-қайта юз берса, 
                  тизим администраторига мурожаат қилинг.
                </p>
                <hr />
                <p className="mb-0">
                  <strong>Хато коди:</strong> {this.state.error?.name || 'N/A'}
                </p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-3">
                    <summary>Техник тафсилотлар</summary>
                    <pre className="mt-2 p-2 bg-light rounded small">
                      {this.state.error.toString()}
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </Alert>
              
              <div className="d-flex gap-2 mt-3">
                <Button 
                  variant="primary" 
                  onClick={this.handleReset}
                  className="d-flex align-items-center"
                >
                  <FaRefresh className="me-2" />
                  Қайта уриниш
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={this.handleReload}
                  className="d-flex align-items-center"
                >
                  <FaRefresh className="me-2" />
                  Саҳифани янгилаш
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary