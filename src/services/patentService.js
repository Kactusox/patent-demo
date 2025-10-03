import { apiCall, API_ENDPOINTS } from './api'
import API_BASE_URL from './api'

// Get all patents with optional filters
export const getAllPatents = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams()

    if (filters.status && filters.status !== 'all') {
      queryParams.append('status', filters.status)
    }
    if (filters.institution && filters.institution !== 'all') {
      queryParams.append('institution', filters.institution)
    }
    if (filters.search) {
      queryParams.append('search', filters.search)
    }

    const queryString = queryParams.toString()
    const endpoint = queryString ? `${API_ENDPOINTS.PATENTS}?${queryString}` : API_ENDPOINTS.PATENTS

    const data = await apiCall(endpoint)
    return data.patents || []
  } catch (error) {
    console.error('Error fetching patents:', error)
    throw error
  }
}

// Get single patent by ID
export const getPatentById = async (id) => {
  try {
    const data = await apiCall(API_ENDPOINTS.PATENT_BY_ID(id))
    return data.patent
  } catch (error) {
    console.error('Error fetching patent:', error)
    throw error
  }
}

// Create new patent
export const createPatent = async (patentData, file) => {
  try {
    const formData = new FormData()

    // Add all patent data to FormData
    Object.keys(patentData).forEach(key => {
      if (patentData[key] !== null && patentData[key] !== undefined) {
        formData.append(key, patentData[key])
      }
    })

    // Add file if provided
    if (file) {
      formData.append('file', file)
    }

    const data = await apiCall(API_ENDPOINTS.PATENTS, {
      method: 'POST',
      body: formData,
    })

    return data
  } catch (error) {
    console.error('Error creating patent:', error)
    throw error
  }
}

// Update patent
export const updatePatent = async (id, patentData, file) => {
  try {
    const formData = new FormData()

    // Add all patent data to FormData
    Object.keys(patentData).forEach(key => {
      if (patentData[key] !== null && patentData[key] !== undefined) {
        formData.append(key, patentData[key])
      }
    })

    // Add file if provided
    if (file) {
      formData.append('file', file)
    }

    const data = await apiCall(API_ENDPOINTS.PATENT_BY_ID(id), {
      method: 'PUT',
      body: formData,
    })

    return data
  } catch (error) {
    console.error('Error updating patent:', error)
    throw error
  }
}

// Delete patent
export const deletePatent = async (id) => {
  try {
    const data = await apiCall(API_ENDPOINTS.PATENT_BY_ID(id), {
      method: 'DELETE',
    })
    return data
  } catch (error) {
    console.error('Error deleting patent:', error)
    throw error
  }
}

// Check for duplicate application number
export const checkDuplicate = async (applicationNumber) => {
  try {
    const data = await apiCall(API_ENDPOINTS.CHECK_DUPLICATE(encodeURIComponent(applicationNumber)))
    return data.isDuplicate ? data.patent : null
  } catch (error) {
    console.error('Error checking duplicate:', error)
    return null
  }
}

// Approve patent (admin only)
export const approvePatent = async (id, approvedBy) => {
  try {
    const data = await apiCall(API_ENDPOINTS.APPROVE_PATENT(id), {
      method: 'PATCH',
      body: JSON.stringify({ approvedBy }),
    })
    return data
  } catch (error) {
    console.error('Error approving patent:', error)
    throw error
  }
}

// Reject patent (admin only)
export const rejectPatent = async (id) => {
  try {
    const data = await apiCall(API_ENDPOINTS.REJECT_PATENT(id), {
      method: 'PATCH',
    })
    return data
  } catch (error) {
    console.error('Error rejecting patent:', error)
    throw error
  }
}

// Get statistics
export const getStatistics = async () => {
  try {
    const data = await apiCall(API_ENDPOINTS.PATENT_STATS)
    return data.stats || {}
  } catch (error) {
    console.error('Error fetching statistics:', error)
    throw error
  }
}

// Get file URL
export const getFileUrl = (filePath) => {
  if (!filePath) return null
  return `${API_BASE_URL.replace('/api', '')}${filePath}`
}

// Download patent file
export const downloadPatent = (patent) => {
  if (!patent.file_path) {
    alert('Файл мавжуд эмас')
    return
  }

  const fileUrl = getFileUrl(patent.file_path)
  const link = document.createElement('a')
  link.href = fileUrl
  link.download = patent.file_name || `${patent.patent_number}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}