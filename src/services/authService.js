import { apiCall, API_ENDPOINTS } from './api'

// Login user
export const login = async (username, password, rememberMe = false) => {
  try {
    const data = await apiCall(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })

    if (data.success && data.user) {
      // Create session data
      const sessionData = {
        id: data.user.id,
        username: data.user.username,
        role: data.user.role,
        name: data.user.username,
        fullName: data.user.fullName || data.user.institutionName,
        shortName: data.user.institutionName,
        phoneNumber: data.user.phoneNumber,
        loginTime: new Date().toISOString(),
      }

      // Store session
      sessionStorage.setItem('currentUser', JSON.stringify(sessionData))

      // Remember me functionality
      if (rememberMe) {
        localStorage.setItem('rememberedUser', username)
      } else {
        localStorage.removeItem('rememberedUser')
      }

      return sessionData
    }

    throw new Error('Тизимга кириш мумкин эмас')
  } catch (error) {
    throw error
  }
}

// Logout user
export const logout = async () => {
  try {
    await apiCall(API_ENDPOINTS.LOGOUT, {
      method: 'POST',
    })
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    sessionStorage.removeItem('currentUser')
    window.location.href = '/login'
  }
}

// Get current user
export const getCurrentUser = () => {
  const userStr = sessionStorage.getItem('currentUser')
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch (e) {
    return null
  }
}

// Check if user is authenticated
export const isAuthenticated = () => {
  return getCurrentUser() !== null
}

// Check if user has specific role
export const hasRole = (requiredRole) => {
  const user = getCurrentUser()
  if (!user) return false

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role)
  }

  return user.role === requiredRole
}

// Get remembered username
export const getRememberedUser = () => {
  return localStorage.getItem('rememberedUser')
}