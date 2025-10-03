// Patent types
export const PATENT_TYPES = [
  'Ихтирога патент',
  'Фойдали моделга патент',
  'Саноат намунаси патенти',
  'Маълумотлар базаси гувоҳномаси',
  'Муаллифлик ҳуқуқи',
  'ЭХМ учун дастур'
]

// Institution info (for display purposes)
export const INSTITUTION_INFO = {
  neftgaz: {
    name: 'Нефт ва газ конлари геологияси ҳамда қидируви институти',
    shortName: 'Нефт ва газ институти'
  },
  mineral: {
    name: 'Минерал ресурслар институти',
    shortName: 'Минерал ресурслар институти'
  },
  gidro: {
    name: 'Гидрогеология ва инженерлик геологияси институти',
    shortName: 'Гидрогеология институти'
  },
  geofizika: {
    name: 'Ҳ.М. Абдуллаев номидаги геология ва геофизика институти',
    shortName: 'Геофизика институти'
  }
}

// Legacy compatibility - keep old name
export const INSTITUTION_STATS = INSTITUTION_INFO

// Re-export API functions for backward compatibility
export { 
  getAllPatents,
  checkDuplicate,
  getStatistics as getTotalStats
} from '../services/patentService'