import { Modal, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap'
import { FaPlus, FaEdit, FaSave, FaTimes, FaExclamationTriangle, FaTrash, FaKey } from 'react-icons/fa'

// Add User Modal
export const AddUserModal = ({ show, onHide, formData, onChange, onSubmit, errors, submitting }) => {
  return (
    <Modal show={show} onHide={!submitting ? onHide : undefined} size="lg" backdrop={submitting ? 'static' : true}>
      <Modal.Header closeButton={!submitting} className="bg-primary text-white">
        <Modal.Title>
          <FaPlus className="me-2" />
          Янги фойдаланувчи қўшиш
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Фойдаланувчи номи <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={onChange}
                  isInvalid={!!errors.username}
                  placeholder="neftgaz"
                  disabled={submitting}
                />
                <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Парол <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={onChange}
                  isInvalid={!!errors.password}
                  placeholder="Камида 6 та белги"
                  disabled={submitting}
                />
                <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Роль <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={onChange}
                  disabled={submitting}
                >
                  <option value="institution">Институт</option>
                  <option value="admin">Администратор</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Телефон рақами</Form.Label>
                <Form.Control
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={onChange}
                  isInvalid={!!errors.phoneNumber}
                  placeholder="+998901234567"
                  disabled={submitting}
                />
                <Form.Control.Feedback type="invalid">{errors.phoneNumber}</Form.Control.Feedback>
                <Form.Text className="text-muted">Формат: +998XXXXXXXXX</Form.Text>
              </Form.Group>
            </Col>
            {formData.role === 'institution' && (
              <>
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Муассаса номи <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="institutionName"
                      value={formData.institutionName}
                      onChange={onChange}
                      isInvalid={!!errors.institutionName}
                      placeholder="Институт номини киритинг"
                      disabled={submitting}
                    />
                    <Form.Control.Feedback type="invalid">{errors.institutionName}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Тўлиқ номи</Form.Label>
                    <Form.Control
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={onChange}
                      placeholder="Қисқа номи"
                      disabled={submitting}
                    />
                  </Form.Group>
                </Col>
              </>
            )}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={submitting}>
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

// Edit User Modal
export const EditUserModal = ({ show, onHide, formData, onChange, onSubmit, errors, submitting }) => {
  return (
    <Modal show={show} onHide={!submitting ? onHide : undefined} size="lg" backdrop={submitting ? 'static' : true}>
      <Modal.Header closeButton={!submitting} className="bg-warning text-dark">
        <Modal.Title>
          <FaEdit className="me-2" />
          Фойдаланувчини таҳрирлаш
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Муассаса номи</Form.Label>
                <Form.Control
                  type="text"
                  name="institutionName"
                  value={formData.institutionName}
                  onChange={onChange}
                  disabled={submitting}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Тўлиқ номи</Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={onChange}
                  disabled={submitting}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Телефон рақами</Form.Label>
                <Form.Control
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={onChange}
                  isInvalid={!!errors.phoneNumber}
                  placeholder="+998901234567"
                  disabled={submitting}
                />
                <Form.Control.Feedback type="invalid">{errors.phoneNumber}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Ҳолати</Form.Label>
                <Form.Select
                  name="isActive"
                  value={formData.isActive}
                  onChange={onChange}
                  disabled={submitting}
                >
                  <option value={true}>Фаол</option>
                  <option value={false}>Нофаол</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={submitting}>
            <FaTimes className="me-2" />
            Бекор қилиш
          </Button>
          <Button variant="warning" type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Сақланмоқда...
              </>
            ) : (
              <>
                <FaSave className="me-2" />
                Ўзгаришларни сақлаш
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

// Delete User Modal
export const DeleteUserModal = ({ show, onHide, user, onConfirm, submitting }) => {
  return (
    <Modal show={show} onHide={!submitting ? onHide : undefined} centered backdrop={submitting ? 'static' : true}>
      <Modal.Header closeButton={!submitting} className="bg-danger text-white">
        <Modal.Title>
          <FaExclamationTriangle className="me-2" />
          Ўчиришни тасдиқлаш
        </Modal.Title>
      </Modal.Header>
      {user && (
        <Modal.Body>
          <Alert variant="danger">
            <FaExclamationTriangle className="me-2" />
            Бу амал қайтарилмайди!
          </Alert>
          <p>Сиз ҳақиқатан ҳам қуйидаги фойдаланувчини ўчирмоқчимисиз?</p>
          <div className="bg-light p-3 rounded">
            <p className="mb-1">
              <strong>Фойдаланувчи:</strong> {user.username}
            </p>
            <p className="mb-0">
              <strong>Номи:</strong> {user.full_name || user.institution_name || '—'}
            </p>
          </div>
        </Modal.Body>
      )}
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={submitting}>
          Бекор қилиш
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={submitting}>
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
  )
}

// Reset Password Modal
export const ResetPasswordModal = ({ show, onHide, user, password, onPasswordChange, onConfirm, submitting }) => {
  return (
    <Modal show={show} onHide={!submitting ? onHide : undefined} centered backdrop={submitting ? 'static' : true}>
      <Modal.Header closeButton={!submitting} className="bg-info text-white">
        <Modal.Title>
          <FaKey className="me-2" />
          Паролни тиклаш
        </Modal.Title>
      </Modal.Header>
      {user && (
        <Form onSubmit={onConfirm}>
          <Modal.Body>
            <p>
              <strong>Фойдаланувчи:</strong> {user.username}
            </p>
            <Form.Group>
              <Form.Label>Янги парол <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="Камида 6 та белги"
                disabled={submitting}
                required
              />
              <Form.Text className="text-muted">
                Фойдаланувчига янги парол берилади
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onHide} disabled={submitting}>
              Бекор қилиш
            </Button>
            <Button variant="info" type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Тикланмоқда...
                </>
              ) : (
                <>
                  <FaKey className="me-2" />
                  Паролни тиклаш
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      )}
    </Modal>
  )
}

// Activity Logs Modal
export const ActivityLogsModal = ({ show, onHide, logs }) => {
  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>Фаолият журнали</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {logs.length === 0 ? (
          <p className="text-center text-muted">Ҳозирча фаолият йўқ</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm table-hover">
              <thead className="table-light">
                <tr>
                  <th>Вақт</th>
                  <th>Фойдаланувчи</th>
                  <th>Амал</th>
                  <th>Тафсилотлар</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr key={idx}>
                    <td className="text-nowrap">
                      {new Date(log.created_at).toLocaleString('uz-UZ')}
                    </td>
                    <td>{log.username || '—'}</td>
                    <td>
                      <Badge bg="secondary">{log.action}</Badge>
                    </td>
                    <td><small>{log.details}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
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