import { Navigate } from 'react-router-dom'
import { isAuthenticated, hasRole } from '../utils/auth'

const ProtectedRoute = ({ children, requiredRole }) => {
  // Check if user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  
  // Check if user has required role
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

export default ProtectedRoute