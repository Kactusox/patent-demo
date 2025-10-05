// API Configuration
const API_BASE_URL = 'http://localhost:5002/api'

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  // Remove Content-Type for FormData
  if (options.body instanceof FormData) {
    delete defaultOptions.headers['Content-Type']
  }

  try {
    const response = await fetch(url, defaultOptions)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Тизимда хато юз берди')
    }

    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  CHECK_AUTH: '/auth/check',

  // Patents
  PATENTS: '/patents',
  PATENT_BY_ID: (id) => `/patents/${id}`,
  CHECK_DUPLICATE: (appNumber) => `/patents/check-duplicate/${appNumber}`,
  APPROVE_PATENT: (id) => `/patents/${id}/approve`,
  REJECT_PATENT: (id) => `/patents/${id}/reject`,
  PATENT_STATS: '/patents/stats/summary',

  // Users
  USERS: '/users',
  USER_BY_ID: (id) => `/users/${id}`,
  CHANGE_PASSWORD: (id) => `/users/${id}/password`,
}

export default API_BASE_URL