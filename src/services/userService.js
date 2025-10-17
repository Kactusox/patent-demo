import { apiCall, API_ENDPOINTS } from './api'

// Get all institutions (for dropdowns and filters)
export const getInstitutions = async () => {
  try {
    const data = await apiCall('/users/institutions')
    return data.institutions || []
  } catch (error) {
    console.error('Error fetching institutions:', error)
    throw error
  }
}

// Get all users
export const getAllUsers = async () => {
  try {
    const data = await apiCall(API_ENDPOINTS.USERS)
    return data.users || []
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

// Get single user by ID
export const getUserById = async (id) => {
  try {
    const data = await apiCall(API_ENDPOINTS.USER_BY_ID(id))
    return data.user
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

// Get activity logs
export const getActivityLogs = async () => {
  try {
    const data = await apiCall('/users/logs/activity')
    return data.logs || []
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    throw error
  }
}

// Create new user
export const createUser = async (userData) => {
  try {
    const data = await apiCall(API_ENDPOINTS.USERS, {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    return data
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

// Update user
export const updateUser = async (id, userData) => {
  try {
    const data = await apiCall(API_ENDPOINTS.USER_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
    return data
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

// Delete user
export const deleteUser = async (id) => {
  try {
    const data = await apiCall(API_ENDPOINTS.USER_BY_ID(id), {
      method: 'DELETE',
    })
    return data
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

// Change password
export const changePassword = async (id, currentPassword, newPassword) => {
  try {
    const data = await apiCall(API_ENDPOINTS.CHANGE_PASSWORD(id), {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    return data
  } catch (error) {
    console.error('Error changing password:', error)
    throw error
  }
}

// Admin reset user password
export const resetUserPassword = async (id, newPassword) => {
  try {
    const data = await apiCall(`/users/${id}/reset-password`, {
      method: 'PATCH',
      body: JSON.stringify({ newPassword }),
    })
    return data
  } catch (error) {
    console.error('Error resetting password:', error)
    throw error
  }
}