// Publication Types
export const PUBLICATION_TYPES = [
  'Илмий мақола',
  'Шарҳ мақола',
  'Конференция мақоласи',
  'Китоб бўлими',
  'Монография'
]

// Journal Quartiles
export const QUARTILES = ['Q1', 'Q2', 'Q3', 'Q4']

// Publication Languages
export const LANGUAGES = [
  'English',
  'Russian',
  'Uzbek',
  'Boshqa'
]

// Research Fields
export const RESEARCH_FIELDS = [
  'Геология',
  'Нефт ва газ',
  'Минералогия',
  'Гидрогеология',
  'Геофизика',
  'Геокимё',
  'Экология',
  'Палеонтология',
  'Петрография',
  'Стратиграфия',
  'Boshqa'
]

// Publication Status
export const PUBLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

// Status Labels
export const STATUS_LABELS = {
  pending: 'Кутилмоқда',
  approved: 'Тасдиқланган',
  rejected: 'Рад этилган'
}

// Status Colors
export const STATUS_COLORS = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger'
}

// Quartile Colors
export const QUARTILE_COLORS = {
  Q1: 'success',
  Q2: 'info',
  Q3: 'warning',
  Q4: 'secondary'
}

// Sort Options
export const SORT_OPTIONS = [
  { value: 'created_at_desc', label: 'Энг янги' },
  { value: 'created_at_asc', label: 'Энг эски' },
  { value: 'year_desc', label: 'Йил (камайиш)' },
  { value: 'year_asc', label: 'Йил (ўсиш)' },
  { value: 'citations_desc', label: 'Iqtiboslar (кўп)' },
  { value: 'h_index_desc', label: 'h-index (юқори)' },
  { value: 'author_asc', label: 'Муаллиф (А-Я)' }
]

// Helper: Format author name for display
export const formatAuthorName = (fullName) => {
  if (!fullName) return 'Номаълум'
  return fullName
}

// Helper: Format citation count
export const formatCitations = (count) => {
  if (!count || count === 0) return '0'
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return count.toString()
}

// Helper: Get quartile badge props
export const getQuartileBadge = (quartile) => {
  if (!quartile) return { variant: 'secondary', text: 'N/A' }
  return {
    variant: QUARTILE_COLORS[quartile] || 'secondary',
    text: quartile
  }
}

// Helper: Get status badge props
export const getStatusBadge = (status) => {
  return {
    variant: STATUS_COLORS[status] || 'secondary',
    text: STATUS_LABELS[status] || status
  }
}

// Helper: Validate DOI format
export const isValidDOI = (doi) => {
  if (!doi) return true // Optional field
  const doiPattern = /^10\.\d{4,}(\.\d+)*\/[-._;()/:A-Z0-9]+$/i
  return doiPattern.test(doi)
}

// Helper: Validate ORCID format
export const isValidORCID = (orcid) => {
  if (!orcid) return true // Optional field
  const orcidPattern = /^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/
  return orcidPattern.test(orcid)
}

// Helper: Format impact factor
export const formatImpactFactor = (value) => {
  if (!value) return 'N/A'
  return parseFloat(value).toFixed(2)
}

// Helper: Parse co-authors string to array
export const parseCoAuthors = (coAuthorsString) => {
  if (!coAuthorsString) return []
  return coAuthorsString.split(';').map(author => author.trim()).filter(Boolean)
}

// Helper: Format co-authors for display
export const formatCoAuthors = (coAuthorsString, maxDisplay = 3) => {
  const authors = parseCoAuthors(coAuthorsString)
  if (authors.length === 0) return 'Йўқ'
  if (authors.length <= maxDisplay) return authors.join(', ')
  const remaining = authors.length - maxDisplay
  return `${authors.slice(0, maxDisplay).join(', ')} +${remaining}`
}

// Helper: Calculate author metrics summary
export const getAuthorMetricsSummary = (publication) => {
  return {
    articles: publication.total_articles || 0,
    citations: publication.total_citations || 0,
    hIndex: publication.h_index || 0
  }
}

// Helper: Get year range for filters
export const getYearRange = () => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let year = currentYear; year >= 2000; year--) {
    years.push(year)
  }
  return years
}

// Helper: Generate Scopus search URL
export const getScopusSearchUrl = (authorName) => {
  const query = encodeURIComponent(authorName)
  return `https://www.scopus.com/results/authorNamesList.uri?s=AUTHLASTNAME(${query})`
}

// Helper: Generate Google Scholar search URL
export const getGoogleScholarUrl = (authorName) => {
  const query = encodeURIComponent(authorName)
  return `https://scholar.google.com/scholar?q=${query}`
}

// Helper: Check if publication has metrics
export const hasMetrics = (publication) => {
  return publication.total_articles > 0 || 
         publication.total_citations > 0 || 
         publication.h_index > 0
}

// Helper: Check if publication is recent (within last year)
export const isRecentPublication = (publication) => {
  const currentYear = new Date().getFullYear()
  return publication.publication_year === currentYear || 
         publication.publication_year === currentYear - 1
}

// Helper: Get publication age in years
export const getPublicationAge = (publication) => {
  const currentYear = new Date().getFullYear()
  return currentYear - publication.publication_year
}

// Export all as default
export default {
  PUBLICATION_TYPES,
  QUARTILES,
  LANGUAGES,
  RESEARCH_FIELDS,
  PUBLICATION_STATUS,
  STATUS_LABELS,
  STATUS_COLORS,
  QUARTILE_COLORS,
  SORT_OPTIONS,
  formatAuthorName,
  formatCitations,
  getQuartileBadge,
  getStatusBadge,
  isValidDOI,
  isValidORCID,
  formatImpactFactor,
  parseCoAuthors,
  formatCoAuthors,
  getAuthorMetricsSummary,
  getYearRange,
  getScopusSearchUrl,
  getGoogleScholarUrl,
  hasMetrics,
  isRecentPublication,
  getPublicationAge
}
