import { Routes, Route, Navigate } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import UserDashboard from './pages/UserDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import { useNotification } from './components/Notification'
import './App.css'

function App() {
  const { NotificationContainer } = useNotification()

  return (
    <ErrorBoundary>
      <div className="app-container">
        <Container fluid className="p-0">
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requiredRole="institution">
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Container>
        
        {/* Global Notifications */}
        <NotificationContainer />
      </div>
    </ErrorBoundary>
  )
}

export default App