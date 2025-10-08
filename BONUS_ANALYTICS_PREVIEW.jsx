// 🎁 BONUS: Simple Analytics Component Preview
// This shows how easy it is to add analytics to the admin dashboard!

import { Card, Row, Col, Table, Badge } from 'react-bootstrap'
import { FaTrophy, FaChartLine, FaFire } from 'react-icons/fa'

// Add this to AdminDashboard.jsx overview tab

{/* Analytics Section - Add after stats cards */}
<Row className="g-4 mb-4">
  {/* Top Authors */}
  <Col md={6}>
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white border-bottom py-3">
        <h5 className="mb-0 fw-bold">
          <FaTrophy className="me-2 text-warning" />
          Топ муаллифлар
        </h5>
      </Card.Header>
      <Card.Body>
        <Table hover className="mb-0">
          <thead className="table-light">
            <tr>
              <th>№</th>
              <th>Муаллиф</th>
              <th className="text-center">Патентлар</th>
            </tr>
          </thead>
          <tbody>
            {getTopAuthors(patents, 10).map((author, idx) => (
              <tr key={idx}>
                <td>
                  {idx < 3 ? (
                    <Badge bg={idx === 0 ? 'warning' : idx === 1 ? 'secondary' : 'light'}>
                      {idx + 1}
                    </Badge>
                  ) : (
                    idx + 1
                  )}
                </td>
                <td>{author.name}</td>
                <td className="text-center">
                  <Badge bg="primary">{author.count}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  </Col>

  {/* Patent Trends */}
  <Col md={6}>
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white border-bottom py-3">
        <h5 className="mb-0 fw-bold">
          <FaChartLine className="me-2 text-success" />
          Йиллик тенденция
        </h5>
      </Card.Header>
      <Card.Body>
        <Table hover className="mb-0">
          <thead className="table-light">
            <tr>
              <th>Йил</th>
              <th className="text-center">Жами</th>
              <th className="text-center">Тасдиқланган</th>
              <th className="text-center">Ўсиш</th>
            </tr>
          </thead>
          <tbody>
            {getYearlyStats(patents).map((yearStat, idx) => (
              <tr key={yearStat.year}>
                <td className="fw-semibold">{yearStat.year}</td>
                <td className="text-center">
                  <Badge bg="primary">{yearStat.total}</Badge>
                </td>
                <td className="text-center">
                  <Badge bg="success">{yearStat.approved}</Badge>
                </td>
                <td className="text-center">
                  {yearStat.growth > 0 ? (
                    <span className="text-success">
                      ↗ +{yearStat.growth}%
                    </span>
                  ) : yearStat.growth < 0 ? (
                    <span className="text-danger">
                      ↘ {yearStat.growth}%
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  </Col>
</Row>

{/* Recent Activity */}
<Card className="border-0 shadow-sm mb-4">
  <Card.Header className="bg-white border-bottom py-3">
    <h5 className="mb-0 fw-bold">
      <FaFire className="me-2 text-danger" />
      Сўнгги фаолият
    </h5>
  </Card.Header>
  <Card.Body>
    <Table hover className="mb-0">
      <thead className="table-light">
        <tr>
          <th>Вақт</th>
          <th>Патент</th>
          <th>Муассаса</th>
          <th className="text-center">Ҳаракат</th>
        </tr>
      </thead>
      <tbody>
        {getRecentActivity(patents, 10).map((activity, idx) => (
          <tr key={idx}>
            <td className="text-muted small">
              {formatTimeAgo(activity.created_at)}
            </td>
            <td>
              <div className="text-truncate" style={{ maxWidth: 300 }}>
                {activity.title}
              </div>
            </td>
            <td>
              <small>{INSTITUTION_INFO[activity.institution]?.shortName}</small>
            </td>
            <td className="text-center">
              {activity.status === 'approved' && (
                <Badge bg="success">Тасдиқланди</Badge>
              )}
              {activity.status === 'pending' && (
                <Badge bg="warning">Кутилмоқда</Badge>
              )}
              {activity.status === 'rejected' && (
                <Badge bg="danger">Рад этилди</Badge>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  </Card.Body>
</Card>


// ========================================
// HELPER FUNCTIONS - Add these to AdminDashboard.jsx
// ========================================

// Get top authors by patent count
const getTopAuthors = (patents, limit = 10) => {
  const authorCounts = {}
  
  patents.forEach(patent => {
    const authors = patent.authors.split(';').map(a => a.trim())
    authors.forEach(author => {
      // Remove percentage for copyright
      const cleanName = author.replace(/\s*\(\d+%\)/, '').trim()
      authorCounts[cleanName] = (authorCounts[cleanName] || 0) + 1
    })
  })
  
  return Object.entries(authorCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

// Get yearly statistics with growth percentage
const getYearlyStats = (patents) => {
  const currentYear = new Date().getFullYear()
  const years = [currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear]
  
  const yearlyData = years.map(year => {
    const yearPatents = patents.filter(p => p.year === year)
    const approved = yearPatents.filter(p => p.status === 'approved').length
    
    return {
      year,
      total: yearPatents.length,
      approved
    }
  })
  
  // Calculate growth percentage
  return yearlyData.map((data, idx) => {
    if (idx === 0) {
      return { ...data, growth: 0 }
    }
    const prevTotal = yearlyData[idx - 1].total
    const growth = prevTotal === 0 ? 0 : Math.round(((data.total - prevTotal) / prevTotal) * 100)
    return { ...data, growth }
  })
}

// Get recent activity (last N patents created/updated)
const getRecentActivity = (patents, limit = 10) => {
  return patents
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit)
}

// Format time ago (3 hours ago, 2 days ago, etc.)
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Ҳозир'
  if (diffMins < 60) return `${diffMins} дақиқа олdin`
  if (diffHours < 24) return `${diffHours} соат олdin`
  if (diffDays < 7) return `${diffDays} кун олdin`
  
  return date.toLocaleDateString('uz-UZ')
}


// ========================================
// USAGE INSTRUCTIONS
// ========================================

/*
To add this to your AdminDashboard:

1. Copy the helper functions to the bottom of AdminDashboard.jsx
   (before the return statement)

2. Add the JSX components to the overview tab
   (after the institution stats table)

3. Enjoy beautiful analytics! 📊

This gives you:
- Top 10 authors leaderboard
- Yearly trends with growth percentage
- Recent activity feed
- All without any external libraries!

Later, you can enhance with Chart.js for visual graphs.
*/
