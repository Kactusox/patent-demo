import { Card, Row, Col } from 'react-bootstrap'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import { FaChartBar, FaChartLine, FaChartPie } from 'react-icons/fa'

const AnalyticsCharts = ({ patents, publications }) => {
  // Process data for charts
  
  // 1. Publications by Year
  const publicationsByYear = publications.reduce((acc, pub) => {
    const year = pub.publication_year
    acc[year] = (acc[year] || 0) + 1
    return acc
  }, {})
  
  const yearData = Object.keys(publicationsByYear)
    .sort()
    .map(year => ({
      year,
      count: publicationsByYear[year]
    }))

  // 2. Patents by Type
  const patentsByType = patents.reduce((acc, patent) => {
    acc[patent.type] = (acc[patent.type] || 0) + 1
    return acc
  }, {})

  const typeData = Object.keys(patentsByType).map(type => ({
    name: type,
    value: patentsByType[type]
  }))

  // 3. Publications by Quartile
  const quartileData = publications.reduce((acc, pub) => {
    const q = pub.quartile || 'N/A'
    acc[q] = (acc[q] || 0) + 1
    return acc
  }, {})

  const quartilePieData = Object.keys(quartileData).map(q => ({
    name: q,
    value: quartileData[q]
  }))

  // 4. Status Distribution
  const patentStatusData = [
    { name: 'Тасдиқланган', patents: patents.filter(p => p.status === 'approved').length },
    { name: 'Кутилмоқда', patents: patents.filter(p => p.status === 'pending').length },
    { name: 'Рад этилган', patents: patents.filter(p => p.status === 'rejected').length }
  ]

  const publicationStatusData = [
    { name: 'Тасдиқланган', publications: publications.filter(p => p.status === 'approved').length },
    { name: 'Кутилмоқда', publications: publications.filter(p => p.status === 'pending').length },
    { name: 'Рад этилган', publications: publications.filter(p => p.status === 'rejected').length }
  ]

  // 5. Citations Trend
  const citationsByYear = publications.reduce((acc, pub) => {
    const year = pub.publication_year
    acc[year] = (acc[year] || 0) + (pub.total_citations || 0)
    return acc
  }, {})

  const citationTrendData = Object.keys(citationsByYear)
    .sort()
    .map(year => ({
      year,
      citations: citationsByYear[year]
    }))

  // Colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']
  const STATUS_COLORS = {
    'Тасдиқланган': '#28a745',
    'Кутилмоқда': '#ffc107',
    'Рад этилган': '#dc3545'
  }

  return (
    <div>
      <h5 className="fw-bold mb-4">
        <FaChartBar className="me-2" />
        Визуал аналитика
      </h5>

      <Row className="g-4">
        {/* Publications by Year */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom py-3">
              <h6 className="mb-0 fw-semibold">
                <FaChartLine className="me-2 text-primary" />
                Йил бўйича мақолалар
              </h6>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={yearData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#0088FE" 
                    strokeWidth={3}
                    name="Мақолалар сони"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Patents by Type */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom py-3">
              <h6 className="mb-0 fw-semibold">
                <FaChartPie className="me-2 text-success" />
                Патентлар тури
              </h6>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Citations Trend */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom py-3">
              <h6 className="mb-0 fw-semibold">
                <FaChartLine className="me-2 text-info" />
                Iqtiboslar динамикаси
              </h6>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={citationTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="citations" fill="#00C49F" name="Iqtiboslar" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Status Comparison */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom py-3">
              <h6 className="mb-0 fw-semibold">
                <FaChartBar className="me-2 text-warning" />
                Ҳолат бўйича қиёслаш
              </h6>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  {
                    name: 'Тасдиқланган',
                    Патентлар: patentStatusData[0].patents,
                    Мақолалар: publicationStatusData[0].publications
                  },
                  {
                    name: 'Кутилмоқда',
                    Патентлар: patentStatusData[1].patents,
                    Мақолалар: publicationStatusData[1].publications
                  },
                  {
                    name: 'Рад этилган',
                    Патентлар: patentStatusData[2].patents,
                    Мақолалар: publicationStatusData[2].publications
                  }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Патентлар" fill="#0088FE" />
                  <Bar dataKey="Мақолалар" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Quartile Distribution */}
        {quartilePieData.length > 0 && (
          <Col lg={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-bottom py-3">
                <h6 className="mb-0 fw-semibold">
                  <FaChartPie className="me-2 text-danger" />
                  Quartile бўйича тақсимот
                </h6>
              </Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={quartilePieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {quartilePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Top Authors by Citations */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom py-3">
              <h6 className="mb-0 fw-semibold">
                <FaChartBar className="me-2 text-purple" style={{ color: '#6f42c1' }} />
                Топ муаллифлар (iqtiboslar)
              </h6>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={publications
                    .sort((a, b) => b.total_citations - a.total_citations)
                    .slice(0, 5)
                    .map(p => ({
                      name: p.author_full_name.split(' ').slice(0, 2).join(' '),
                      citations: p.total_citations
                    }))}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="citations" fill="#6f42c1" name="Iqtiboslar" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AnalyticsCharts
