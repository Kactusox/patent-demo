import { apiCall, API_BASE_URL } from './api'

// Get all publications with optional filters
export const getAllPublications = async (filters = {}) => {
  try {
    const params = new URLSearchParams()
    
    if (filters.institution) params.append('institution', filters.institution)
    if (filters.status) params.append('status', filters.status)
    if (filters.year) params.append('year', filters.year)
    if (filters.author) params.append('author', filters.author)
    
    const queryString = params.toString()
    const url = queryString ? `/publications?${queryString}` : '/publications'
    
    const response = await apiCall(url)
    return response.publications || []
  } catch (error) {
    console.error('Error fetching publications:', error)
    throw error
  }
}

// Get single publication by ID
export const getPublicationById = async (id) => {
  try {
    const response = await apiCall(`/publications/${id}`)
    return response.publication
  } catch (error) {
    console.error('Error fetching publication:', error)
    throw error
  }
}

// Create new publication
export const createPublication = async (publicationData, file) => {
  try {
    const formData = new FormData()
    
    // Add all publication fields
    Object.keys(publicationData).forEach(key => {
      if (publicationData[key] !== null && publicationData[key] !== undefined && publicationData[key] !== '') {
        formData.append(key, publicationData[key])
      }
    })
    
    // Add file if provided
    if (file) {
      formData.append('file', file)
    }
    
    const response = await fetch(`${API_BASE_URL}/publications`, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Мақолани қўшишда хато')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating publication:', error)
    throw error
  }
}

// Update publication
export const updatePublication = async (id, publicationData, file) => {
  try {
    const formData = new FormData()
    
    // Add all publication fields
    Object.keys(publicationData).forEach(key => {
      if (publicationData[key] !== null && publicationData[key] !== undefined && publicationData[key] !== '') {
        formData.append(key, publicationData[key])
      }
    })
    
    // Add file if provided
    if (file) {
      formData.append('file', file)
    }
    
    const response = await fetch(`${API_BASE_URL}/publications/${id}`, {
      method: 'PUT',
      body: formData
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Мақолани янгилашда хато')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error updating publication:', error)
    throw error
  }
}

// Delete publication
export const deletePublication = async (id) => {
  try {
    const response = await apiCall(`/publications/${id}`, {
      method: 'DELETE'
    })
    return response
  } catch (error) {
    console.error('Error deleting publication:', error)
    throw error
  }
}

// Approve publication (admin only)
export const approvePublication = async (id, approvedBy) => {
  try {
    const response = await apiCall(`/publications/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ approvedBy })
    })
    return response
  } catch (error) {
    console.error('Error approving publication:', error)
    throw error
  }
}

// Reject publication (admin only)
export const rejectPublication = async (id) => {
  try {
    const response = await apiCall(`/publications/${id}/reject`, {
      method: 'PATCH'
    })
    return response
  } catch (error) {
    console.error('Error rejecting publication:', error)
    throw error
  }
}

// Get publication statistics
export const getPublicationStats = async (institution = 'all') => {
  try {
    const url = institution === 'all' 
      ? '/publications/stats/summary'
      : `/publications/stats/summary?institution=${institution}`
    
    const response = await apiCall(url)
    return response.stats || {}
  } catch (error) {
    console.error('Error fetching publication stats:', error)
    throw error
  }
}

// Get unique authors
export const getUniqueAuthors = async (institution = 'all') => {
  try {
    const url = institution === 'all'
      ? '/publications/authors/list'
      : `/publications/authors/list?institution=${institution}`
    
    const response = await apiCall(url)
    return response.authors || []
  } catch (error) {
    console.error('Error fetching authors:', error)
    throw error
  }
}

// Download publication file
export const downloadPublicationFile = async (publication) => {
  try {
    if (!publication.file_path) {
      throw new Error('Файл мавжуд эмас')
    }
    
    const fileUrl = `${API_BASE_URL}${publication.file_path}`
    window.open(fileUrl, '_blank')
  } catch (error) {
    console.error('Error downloading file:', error)
    throw error
  }
}

// Search publications by title or author
export const searchPublications = async (searchTerm, filters = {}) => {
  try {
    const allPublications = await getAllPublications(filters)
    
    if (!searchTerm) return allPublications
    
    const lowerSearch = searchTerm.toLowerCase()
    return allPublications.filter(pub => 
      pub.title.toLowerCase().includes(lowerSearch) ||
      pub.author_full_name.toLowerCase().includes(lowerSearch) ||
      (pub.journal_name && pub.journal_name.toLowerCase().includes(lowerSearch)) ||
      (pub.doi && pub.doi.toLowerCase().includes(lowerSearch))
    )
  } catch (error) {
    console.error('Error searching publications:', error)
    throw error
  }
}

// Get publications by year range
export const getPublicationsByYearRange = async (startYear, endYear, institution = 'all') => {
  try {
    const allPublications = await getAllPublications({ institution })
    return allPublications.filter(pub => 
      pub.publication_year >= startYear && pub.publication_year <= endYear
    )
  } catch (error) {
    console.error('Error fetching publications by year range:', error)
    throw error
  }
}

// Get publications grouped by year
export const getPublicationsByYear = async (institution = 'all') => {
  try {
    const publications = await getAllPublications({ institution })
    const grouped = {}
    
    publications.forEach(pub => {
      const year = pub.publication_year
      if (!grouped[year]) {
        grouped[year] = []
      }
      grouped[year].push(pub)
    })
    
    return grouped
  } catch (error) {
    console.error('Error grouping publications by year:', error)
    throw error
  }
}

// Get top authors by citations
export const getTopAuthorsByCitations = async (limit = 10, institution = 'all') => {
  try {
    const authors = await getUniqueAuthors(institution)
    return authors
      .sort((a, b) => b.total_citations - a.total_citations)
      .slice(0, limit)
  } catch (error) {
    console.error('Error fetching top authors:', error)
    throw error
  }
}

// Get top authors by h-index
export const getTopAuthorsByHIndex = async (limit = 10, institution = 'all') => {
  try {
    const authors = await getUniqueAuthors(institution)
    return authors
      .sort((a, b) => b.h_index - a.h_index)
      .slice(0, limit)
  } catch (error) {
    console.error('Error fetching top authors by h-index:', error)
    throw error
  }
}

// Get publications by research field
export const getPublicationsByField = async (institution = 'all') => {
  try {
    const publications = await getAllPublications({ institution })
    const grouped = {}
    
    publications.forEach(pub => {
      const field = pub.research_field || 'Boshqa'
      if (!grouped[field]) {
        grouped[field] = []
      }
      grouped[field].push(pub)
    })
    
    return grouped
  } catch (error) {
    console.error('Error grouping publications by field:', error)
    throw error
  }
}

// Get publications by quartile
export const getPublicationsByQuartile = async (institution = 'all') => {
  try {
    const publications = await getAllPublications({ institution })
    const grouped = { Q1: [], Q2: [], Q3: [], Q4: [], 'N/A': [] }
    
    publications.forEach(pub => {
      const quartile = pub.quartile || 'N/A'
      grouped[quartile].push(pub)
    })
    
    return grouped
  } catch (error) {
    console.error('Error grouping publications by quartile:', error)
    throw error
  }
}

// Calculate total impact factor
export const getTotalImpactFactor = async (institution = 'all') => {
  try {
    const publications = await getAllPublications({ institution })
    return publications.reduce((sum, pub) => {
      return sum + (parseFloat(pub.impact_factor) || 0)
    }, 0)
  } catch (error) {
    console.error('Error calculating total impact factor:', error)
    throw error
  }
}

// Get recent publications (last N months)
export const getRecentPublications = async (months = 12, institution = 'all') => {
  try {
    const publications = await getAllPublications({ institution })
    const cutoffDate = new Date()
    cutoffDate.setMonth(cutoffDate.getMonth() - months)
    
    return publications.filter(pub => {
      const pubDate = new Date(pub.created_at)
      return pubDate >= cutoffDate
    })
  } catch (error) {
    console.error('Error fetching recent publications:', error)
    throw error
  }
}

// Export publications as ZIP
export const downloadPublicationsZip = async (institution = 'all') => {
  try {
    const url = `${API_BASE_URL}/export/download-publications-zip?institution=${institution}`
    window.open(url, '_blank')
  } catch (error) {
    console.error('Error downloading publications ZIP:', error)
    throw error
  }
}

// Export publications to Excel
export const exportPublicationsToExcel = async (institution = 'all') => {
  try {
    const XLSX = (await import('xlsx')).default
    const { saveAs } = await import('file-saver')
    
    const url = `${API_BASE_URL}/export/export-publications-excel?institution=${institution}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error('Экспорт қилишда хато')
    }
    
    const result = await response.json()
    
    // Create workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(result.data)
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Мақолалар')
    
    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    
    // Download file
    saveAs(blob, result.fileName)
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    throw error
  }
}

// Export all functions
export default {
  getAllPublications,
  getPublicationById,
  createPublication,
  updatePublication,
  deletePublication,
  approvePublication,
  rejectPublication,
  getPublicationStats,
  getUniqueAuthors,
  downloadPublicationFile,
  searchPublications,
  getPublicationsByYearRange,
  getPublicationsByYear,
  getTopAuthorsByCitations,
  getTopAuthorsByHIndex,
  getPublicationsByField,
  getPublicationsByQuartile,
  getTotalImpactFactor,
  getRecentPublications,
  downloadPublicationsZip,
  exportPublicationsToExcel
}
