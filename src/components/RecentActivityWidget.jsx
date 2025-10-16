import { Card, Table, Badge } from 'react-bootstrap'
import { FaFileAlt, FaBook, FaCheckCircle, FaClock, FaTimesCircle, FaFire } from 'react-icons/fa'

const RecentActivityWidget = ({ patents, publications }) => {
  // Combine and sort by date
  const activities = [
    ...patents.map(p => ({
      type: 'patent',
      id: p.id,
      title: p.title,
      status: p.status,
      created_at: p.created_at,
      institution: p.institution_name,
      number: p.patent_number
    })),
    ...publications.map(p => ({
      type: 'publication',
      id: p.id,
      title: p.title,
      status: p.status,
      created_at: p.created_at,
      institution: p.institution_name,
      author: p.author_full_name
    }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10)

  const formatTimeAgo = (dateString) => {
    // SQLite CURRENT_TIMESTAMP returns UTC time without 'Z' suffix
    // We need to ensure JavaScript treats it as UTC, not local time
    const utcDateString = dateString.includes('Z') ? dateString : dateString + 'Z'
    const date = new Date(utcDateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Ҳозир'
    if (diffMins < 60) return `${diffMins} дақиқа олдин`
    if (diffHours < 24) return `${diffHours} соат олдин`
    if (diffDays < 7) return `${diffDays} кун олдин`
    
    return date.toLocaleDateString('uz-UZ')
  }

  const getStatusBadge = (status) => {
    if (status === 'approved') return { bg: 'success', text: 'Тасдиқланган', icon: FaCheckCircle }
    if (status === 'pending') return { bg: 'warning', text: 'Кутилмоқда', icon: FaClock }
    return { bg: 'danger', text: 'Рад этилган', icon: FaTimesCircle }
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white border-bottom py-3">
        <h5 className="mb-0 fw-bold">
          <FaFire className="me-2 text-danger" />
          Сўнгги фаолият
        </h5>
      </Card.Header>
      <Card.Body className="p-0">
        {activities.length === 0 ? (
          <div className="text-center py-5 text-muted">
            Ҳозирча фаолият йўқ
          </div>
        ) : (
          <Table hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '100px' }}>Вақт</th>
                <th style={{ width: '60px' }}>Тур</th>
                <th>Номи</th>
                <th>Муассаса</th>
                <th className="text-center" style={{ width: '120px' }}>Ҳолат</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity, idx) => {
                const statusBadge = getStatusBadge(activity.status)
                const StatusIcon = statusBadge.icon
                
                return (
                  <tr key={`${activity.type}-${activity.id}`}>
                    <td className="text-muted small">
                      {formatTimeAgo(activity.created_at)}
                    </td>
                    <td>
                      {activity.type === 'patent' ? (
                        <Badge bg="primary" title="Патент">
                          <FaFileAlt />
                        </Badge>
                      ) : (
                        <Badge bg="purple" style={{ backgroundColor: '#6f42c1' }} title="Мақола">
                          <FaBook />
                        </Badge>
                      )}
                    </td>
                    <td>
                      <div className="text-truncate" style={{ maxWidth: 350 }}>
                        {activity.type === 'patent' && (
                          <Badge bg="secondary" className="me-2">{activity.number}</Badge>
                        )}
                        {activity.type === 'publication' && (
                          <small className="text-muted me-2">{activity.author}:</small>
                        )}
                        {activity.title}
                      </div>
                    </td>
                    <td>
                      <small className="text-muted">{activity.institution}</small>
                    </td>
                    <td className="text-center">
                      <Badge bg={statusBadge.bg}>
                        <StatusIcon className="me-1" size={10} />
                        {statusBadge.text}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  )
}

export default RecentActivityWidget
