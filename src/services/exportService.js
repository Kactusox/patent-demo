import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import API_BASE_URL from './api'

// Download all files as ZIP
export const downloadZipFile = async (institution = 'all') => {
  try {
    const url = `${API_BASE_URL}/export/download-zip${institution !== 'all' ? `?institution=${institution}` : ''}`
    
    // Open download in new window
    window.open(url, '_blank')
    
    return { success: true }
  } catch (error) {
    console.error('Error downloading ZIP:', error)
    throw error
  }
}

// Export data to Excel
export const exportToExcel = async (institution = 'all') => {
  try {
    const url = `${API_BASE_URL}/export/export-excel${institution !== 'all' ? `?institution=${institution}` : ''}`
    
    const response = await fetch(url)
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Экспорт қилишда хато')
    }

    const { data } = result
    
    // Create workbook
    const workbook = XLSX.utils.book_new()
    
    // Add a sheet for each institution
    Object.entries(data).forEach(([institutionKey, patents]) => {
      // Get institution name
      const sheetName = getInstitutionShortName(institutionKey)
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(patents)
      
      // Set column widths
      const columnWidths = [
        { wch: 15 }, // Патент рақами
        { wch: 50 }, // Номи
        { wch: 30 }, // Тури
        { wch: 20 }, // Талабнома рақами
        { wch: 15 }, // Топширилган сана
        { wch: 20 }, // Рўйхатдан ўтказилган сана
        { wch: 8 },  // Йил
        { wch: 50 }, // Муаллифлар
        { wch: 40 }, // Муассаса
        { wch: 15 }, // Ҳолати
        { wch: 15 }, // Тасдиқлаган
        { wch: 20 }  // Тасдиқланган сана
      ]
      worksheet['!cols'] = columnWidths
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
    })
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    // Download file
    const downloadDate = new Date().toISOString().split('T')[0]
    const filename = institution !== 'all' 
      ? `patents_${institution}_${downloadDate}.xlsx`
      : `patents_all_${downloadDate}.xlsx`
    
    saveAs(blob, filename)
    
    return { success: true }
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    throw error
  }
}

// Get export statistics
export const getExportStats = async (institution = 'all') => {
  try {
    const url = `${API_BASE_URL}/export/stats${institution !== 'all' ? `?institution=${institution}` : ''}`
    
    const response = await fetch(url)
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Статистикани олишда хато')
    }
    
    return result
  } catch (error) {
    console.error('Error getting export stats:', error)
    throw error
  }
}

// Helper function to get institution short name
const getInstitutionShortName = (key) => {
  const names = {
    'neftgaz': 'Нефт ва газ',
    'mineral': 'Минерал ресурслар',
    'gidro': 'Гидрогеология',
    'geofizika': 'Геофизика'
  }
  return names[key] || key
}