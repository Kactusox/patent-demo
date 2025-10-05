import { useState, useEffect } from 'react'
import { Alert, Toast, ToastContainer } from 'react-bootstrap'
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa'

const Notification = ({ 
  show, 
  onClose, 
  type = 'info', 
  title, 
  message, 
  duration = 5000,
  position = 'top-end'
}) => {
  const [visible, setVisible] = useState(show)

  useEffect(() => {
    setVisible(show)
    
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onClose, 300) // Wait for animation to complete
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [show, duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-success" />
      case 'error':
        return <FaExclamationTriangle className="text-danger" />
      case 'warning':
        return <FaExclamationTriangle className="text-warning" />
      default:
        return <FaInfoCircle className="text-info" />
    }
  }

  const getVariant = () => {
    switch (type) {
      case 'success':
        return 'success'
      case 'error':
        return 'danger'
      case 'warning':
        return 'warning'
      default:
        return 'info'
    }
  }

  if (!visible) return null

  return (
    <ToastContainer position={position} className="p-3">
      <Toast 
        show={visible} 
        onClose={() => {
          setVisible(false)
          setTimeout(onClose, 300)
        }}
        delay={duration}
        autohide={duration > 0}
        className="border-0 shadow"
      >
        <Toast.Header closeButton={false} className={`bg-${getVariant()} text-white`}>
          <div className="d-flex align-items-center w-100">
            {getIcon()}
            <strong className="ms-2 me-auto">{title || 'Хабар'}</strong>
            <button 
              type="button" 
              className="btn-close btn-close-white"
              onClick={() => {
                setVisible(false)
                setTimeout(onClose, 300)
              }}
            >
              <FaTimes size={12} />
            </button>
          </div>
        </Toast.Header>
        <Toast.Body className="bg-white">
          {message}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  )
}

// Hook for easy notification management
export const useNotification = () => {
  const [notifications, setNotifications] = useState([])

  const addNotification = (notification) => {
    const id = Date.now() + Math.random()
    const newNotification = { id, ...notification }
    
    setNotifications(prev => [...prev, newNotification])
    
    return id
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const showSuccess = (message, title = 'Муваффақиятли') => {
    return addNotification({ type: 'success', title, message })
  }

  const showError = (message, title = 'Хато') => {
    return addNotification({ type: 'error', title, message })
  }

  const showWarning = (message, title = 'Огоҳлантириш') => {
    return addNotification({ type: 'warning', title, message })
  }

  const showInfo = (message, title = 'Маълумот') => {
    return addNotification({ type: 'info', title, message })
  }

  const NotificationContainer = () => (
    <>
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          show={true}
          onClose={() => removeNotification(notification.id)}
          {...notification}
        />
      ))}
    </>
  )

  return {
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    NotificationContainer
  }
}

export default Notification