import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import { FaUser, FaLock, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa'
import { login, isAuthenticated, getRememberedUser, getCurrentUser } from '../utils/auth'

const LoginPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      const user = getCurrentUser()
      if (user.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    }
    
    // Load remembered username
    const remembered = getRememberedUser()
    if (remembered) {
      setFormData(prev => ({ ...prev, username: remembered, rememberMe: true }))
    }
  }, [navigate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setError('') // Clear error when user types
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate inputs
      if (!formData.username || !formData.password) {
        throw new Error('Илтимос, барча майдонларни тўлдиринг')
      }

      // Attempt login
      const user = await login(formData.username, formData.password, formData.rememberMe)

      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col xs={12} sm={10} md={8} lg={5} xl={4}>
            <Card className="login-card shadow-lg border-0">
              <Card.Body className="p-5">
                {/* Logo and Header */}
                <div className="text-center mb-4">
                  <img src='src/images/logo.png' alt="Logo" className="logo-image" />
                    
                  {/* <div className="logo-circle mx-auto mb-3">
                    <FaShieldAlt className="logo-icon" />
                  </div> */}

                  <h2 className="fw-bold text-dark mb-2">
                    Геология фанлари университети
                  </h2>
                  <p className="text-muted">
                    Интеллектуал мулк бошқарув тизими
                  </p>
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert variant="danger" dismissible onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}

                {/* Login Form */}
                <Form onSubmit={handleSubmit}>
                  {/* Username Field */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      Фойдаланувчи номи
                    </Form.Label>
                    <div className="input-icon-wrapper">
                      <FaUser className="input-icon" />
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Фойдаланувчи номини киритинг"
                        className="ps-5"
                        disabled={loading}
                      />
                    </div>
                  </Form.Group>

                  {/* Password Field */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Парол</Form.Label>
                    <div className="input-icon-wrapper position-relative">
                      <FaLock className="input-icon" />
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Паролни киритинг"
                        className="ps-5 pe-5"
                        disabled={loading}
                      />
                      <Button
                        variant="link"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        type="button"
                        disabled={loading}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </div>
                  </Form.Group>

                  {/* Remember Me & Forgot Password */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <Form.Check
                      type="checkbox"
                      name="rememberMe"
                      label="Мени эслаб қолиш"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <a href="#" className="text-primary text-decoration-none">
                      Паролни унутдингизми?
                    </a>
                  </div>

                  {/* Submit Button */}
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 py-2 fw-semibold"
                    disabled={loading}
                  >
                    {loading ? 'Кирилмоқда...' : 'Кириш'}
                  </Button>
                </Form>

                {/* Demo Credentials */}
                <div className="mt-4 p-3 bg-light rounded demo">
                  <small className="text-muted d-block mb-2">
                    <strong>Демо кириш маълумотлари:</strong>
                  </small>
                  <small className="text-muted d-block">
                    Админ: <code>admin</code> / <code>admin123</code>
                  </small>
                  <small className="text-muted d-block">
                    Институт: <code>neftgaz</code> / <code>neftgaz123</code>
                  </small>
                </div>
              </Card.Body>

              {/* Footer */}
              <Card.Footer className="text-center text-muted py-3 bg-light">
                <small>© 2025 Geological Science University</small>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Background Decoration */}
      <div className="login-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
    </div>
  )
}

export default LoginPage