# 📚 Scopus/Web of Science Publications Feature - Implementation Plan

## 🎯 FEATURE OVERVIEW

**Goal:** Add a complete publication tracking system alongside the patent system

**Benefits:**
- Track all university research publications
- Monitor citation metrics
- Showcase research impact
- Generate reports for rankings
- Integrated with patent system

---

## 📊 DATA STRUCTURE

### Core Fields (From Your Example):
1. **F.I.Sh.** - Full Name (e.g., "Shukurov N. E.")
2. **Jami maqolalar soni** - Total articles count
3. **Jami iqtiboslar soni** - Total citations
4. **h-indeks** - h-index
5. **Maqola nomi** - Article/Publication title
6. **Scopus havolasi** - Scopus author profile link
7. **PDF** - Article PDF file (optional)

### Additional Recommended Fields:
8. **Web of Science havolasi** - WoS profile link
9. **Yil** - Publication year
10. **Jurnal nomi** - Journal name
11. **DOI** - Digital Object Identifier
12. **Impact Factor** - Journal impact factor
13. **Quartile** - Q1, Q2, Q3, Q4
14. **Hammuallif(lar)** - Co-authors
15. **Mavzu** - Research topic/field
16. **Til** - Language (English/Russian/Uzbek)
17. **Tur** - Type (Article/Review/Conference/Book Chapter)
18. **Muassasa** - Institution
19. **ORCID** - Researcher ORCID ID
20. **Google Scholar** - Google Scholar profile

---

## 🗄️ DATABASE SCHEMA

```sql
-- New table: publications
CREATE TABLE publications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Author Info
  author_full_name TEXT NOT NULL,
  author_orcid TEXT,
  scopus_author_id TEXT,
  scopus_profile_url TEXT,
  wos_profile_url TEXT,
  google_scholar_url TEXT,
  
  -- Author Metrics
  total_articles INTEGER DEFAULT 0,
  total_citations INTEGER DEFAULT 0,
  h_index INTEGER DEFAULT 0,
  
  -- Publication Details
  title TEXT NOT NULL,
  publication_year INTEGER NOT NULL,
  journal_name TEXT,
  doi TEXT,
  publication_type TEXT, -- Article, Review, Conference, Book
  language TEXT, -- English, Russian, Uzbek
  
  -- Impact Metrics
  impact_factor REAL,
  quartile TEXT, -- Q1, Q2, Q3, Q4
  sjr REAL, -- Scimago Journal Rank
  
  -- Additional Info
  co_authors TEXT, -- Comma-separated
  research_field TEXT,
  keywords TEXT,
  abstract TEXT,
  
  -- Institution
  institution TEXT NOT NULL,
  institution_name TEXT NOT NULL,
  
  -- File
  file_path TEXT,
  file_name TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  
  -- Metadata
  created_by TEXT,
  approved_by TEXT,
  approved_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX idx_publications_author ON publications(author_full_name);
CREATE INDEX idx_publications_year ON publications(publication_year);
CREATE INDEX idx_publications_institution ON publications(institution);
CREATE INDEX idx_publications_status ON publications(status);
```

---

## 🎨 UI/UX DESIGN

### New Sidebar Structure:

```
┌─────────────────────────────────┐
│ 🏛️ Институт Панели             │
├─────────────────────────────────┤
│ 📊 Умумий кўриниш              │ ← Enhanced overview
├─────────────────────────────────┤
│ 📋 ИНТЕЛЛЕКТУАЛ МУЛК            │
│   🔍 Патентлар                  │
│   📝 Менинг патентларим         │
├─────────────────────────────────┤
│ 📚 ИЛМИЙ НАШРЛАР                │ ← NEW SECTION
│   📖 Мақолалар                  │
│   ✍️ Менинг мақолаларим         │
│   👥 Муаллифлар                 │
├─────────────────────────────────┤
│ 📈 Статистика                   │ ← NEW
│   📊 Кўрсаткичлар              │
│   📉 Тенденциялар              │
├─────────────────────────────────┤
│ 👤 Профил                       │
│ 🚪 Чиқиш                        │
└─────────────────────────────────┘
```

### Admin Sidebar:

```
┌─────────────────────────────────┐
│ 🔧 Администратор Панели         │
├─────────────────────────────────┤
│ 📊 Умумий кўриниш              │ ← NEW: Combined view
├─────────────────────────────────┤
│ 📋 Патентлар                    │
│ 📚 Мақолалар                    │ ← NEW
│ 👥 Фойдаланувчилар             │
│ 📈 Статистика                   │ ← NEW: Enhanced
│ 📜 Фаолият журнали             │
└─────────────────────────────────┘
```

---

## 🎨 MAIN PAGE REDESIGN (Attention-Grabbing)

### NEW: Dashboard Hero Section

```jsx
┌────────────────────────────────────────────────────┐
│  🎓 Геология фанлари университети                   │
│  Илмий изланишлар ва интеллектуал мулк бошқаруви   │
│                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │   287    │  │   856    │  │   1,425  │        │
│  │ Патентлар│  │ Мақолалар│  │ Iqtiboslar│       │
│  └──────────┘  └──────────┘  └──────────┘        │
└────────────────────────────────────────────────────┘
```

### Quick Stats Cards (Eye-Catching):

```jsx
┌─────────────────────────────────────────────────┐
│  Бу йил                                         │
│  ↗ +45 мақолалар    ↗ +12 патентлар            │
│  ↗ +234 iqtiboslar  ↗ Ўртача h-index: 8.5     │
└─────────────────────────────────────────────────┘
```

### Interactive Charts:
1. **Publications by Year** (Line chart)
2. **Citations Trend** (Area chart)
3. **Top Authors** (Leaderboard)
4. **Institution Comparison** (Bar chart)
5. **Research Fields** (Pie chart)

### Recent Activity Feed:
```
🆕 Shukurov N.E. added new article (5 min ago)
✅ Admin approved patent FAP 2745 (1 hour ago)
📊 Nurtaev B. reached 600 citations! (2 hours ago)
```

---

## 📝 STEP-BY-STEP IMPLEMENTATION PLAN

### 🔴 PHASE 1: Database & Backend (Day 1-2)

#### Step 1.1: Update Database Schema
```bash
File: backend/database.js
```

**Tasks:**
- [ ] Add publications table
- [ ] Add sample data (your examples)
- [ ] Create indexes
- [ ] Test database creation

**Code Preview:**
```javascript
// Add after patents table
db.run(`
  CREATE TABLE IF NOT EXISTS publications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_full_name TEXT NOT NULL,
    total_articles INTEGER DEFAULT 0,
    total_citations INTEGER DEFAULT 0,
    h_index INTEGER DEFAULT 0,
    title TEXT NOT NULL,
    scopus_profile_url TEXT,
    wos_profile_url TEXT,
    publication_year INTEGER,
    journal_name TEXT,
    doi TEXT,
    impact_factor REAL,
    quartile TEXT,
    co_authors TEXT,
    research_field TEXT,
    institution TEXT NOT NULL,
    institution_name TEXT NOT NULL,
    file_path TEXT,
    file_name TEXT,
    status TEXT DEFAULT 'pending',
    created_by TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`)

// Insert sample data
db.run(`
  INSERT INTO publications (
    author_full_name, total_articles, total_citations, h_index,
    title, scopus_profile_url, publication_year,
    institution, institution_name, status, created_by
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`, [
  'Shukurov N. E.',
  28,
  570,
  13,
  'Geochemistry and risk assessment of potentially toxic elements in surface river sediments (Chirchik-Akhangaran basin, Uzbekistan)',
  'https://www.scopus.com/authid/detail.uri?authorId=23390955600',
  2025,
  'neftgaz',
  'Нефт ва газ конлари геологияси ҳамда қидируви институти',
  'approved',
  'admin'
])
```

#### Step 1.2: Create Publications API Routes
```bash
File: backend/routes/publications.js (NEW)
```

**Endpoints:**
- GET `/api/publications` - List all publications
- GET `/api/publications/:id` - Get single publication
- POST `/api/publications` - Create publication
- PUT `/api/publications/:id` - Update publication
- DELETE `/api/publications/:id` - Delete publication
- PATCH `/api/publications/:id/approve` - Approve publication
- PATCH `/api/publications/:id/reject` - Reject publication
- GET `/api/publications/stats` - Get statistics
- GET `/api/publications/authors` - Get unique authors

#### Step 1.3: Update Server
```bash
File: backend/server.js
```

**Tasks:**
- [ ] Import publications routes
- [ ] Add route middleware
- [ ] Update CORS if needed

---

### 🟡 PHASE 2: Frontend Services (Day 2-3)

#### Step 2.1: Create Publications Service
```bash
File: src/services/publicationService.js (NEW)
```

**Functions:**
```javascript
export const getAllPublications = async (filters = {})
export const getPublicationById = async (id)
export const createPublication = async (publicationData, file)
export const updatePublication = async (id, publicationData, file)
export const deletePublication = async (id)
export const approvePublication = async (id, approvedBy)
export const rejectPublication = async (id)
export const getPublicationStats = async ()
export const getUniqueAuthors = async ()
```

#### Step 2.2: Update API Config
```bash
File: src/services/api.js
```

**Add endpoints:**
```javascript
// Publications endpoints
export const API_ENDPOINTS = {
  // ... existing endpoints
  
  // Publications
  PUBLICATIONS: '/api/publications',
  PUBLICATION_STATS: '/api/publications/stats',
  PUBLICATION_AUTHORS: '/api/publications/authors',
  // ...
}
```

#### Step 2.3: Create Publication Data Utils
```bash
File: src/utils/publicationData.js (NEW)
```

**Constants:**
```javascript
export const PUBLICATION_TYPES = [
  'Илмий мақола',
  'Шарҳ мақола',
  'Конференция мақоласи',
  'Китоб бўлими',
  'Монография'
]

export const QUARTILES = ['Q1', 'Q2', 'Q3', 'Q4']

export const LANGUAGES = ['English', 'Russian', 'Uzbek', 'Boshqa']

export const RESEARCH_FIELDS = [
  'Геология',
  'Нефт ва газ',
  'Минералогия',
  'Гидрогеология',
  'Геофизика',
  'Геокимё',
  'Экология',
  'Boshqa'
]
```

---

### 🟢 PHASE 3: Publications Page (Day 3-5)

#### Step 3.1: Create Publications Dashboard Component
```bash
File: src/pages/PublicationsDashboard.jsx (NEW)
```

**Structure:**
```jsx
- Overview Tab
  - Statistics cards
  - Charts
  - Recent publications
  
- Publications List Tab
  - Sortable table
  - Search & filters
  - Actions (view, edit, delete)
  
- Add Publication Tab
  - Dynamic form
  - File upload
  - Validation
  
- Authors Tab
  - Author list
  - Author metrics
  - Publications per author
```

#### Step 3.2: Create Publication Components
```bash
Files:
- src/components/PublicationCard.jsx
- src/components/PublicationModal.jsx
- src/components/AddPublicationModal.jsx
- src/components/EditPublicationModal.jsx
- src/components/PublicationDetailsModal.jsx
- src/components/AuthorCard.jsx
```

#### Step 3.3: Create Charts Components
```bash
Files:
- src/components/charts/PublicationTrendsChart.jsx
- src/components/charts/CitationsChart.jsx
- src/components/charts/TopAuthorsChart.jsx
- src/components/charts/ResearchFieldsChart.jsx
```

---

### 🔵 PHASE 4: Enhanced Overview Page (Day 5-6)

#### Step 4.1: Redesign Dashboard Overview
```bash
File: src/pages/UserDashboard.jsx (Update)
File: src/pages/AdminDashboard.jsx (Update)
```

**New Layout:**
```jsx
<Container fluid className="dashboard-home">
  {/* Hero Section */}
  <Row className="hero-section">
    <Col>
      <HeroStats />
    </Col>
  </Row>
  
  {/* Combined Stats */}
  <Row>
    <Col md={3}><StatCard type="patents" /></Col>
    <Col md={3}><StatCard type="publications" /></Col>
    <Col md={3}><StatCard type="citations" /></Col>
    <Col md={3}><StatCard type="h-index" /></Col>
  </Row>
  
  {/* Interactive Charts */}
  <Row>
    <Col md={8}>
      <CombinedTrendsChart />
    </Col>
    <Col md={4}>
      <TopPerformersWidget />
    </Col>
  </Row>
  
  {/* Activity Feed */}
  <Row>
    <Col>
      <RecentActivityFeed />
    </Col>
  </Row>
</Container>
```

#### Step 4.2: Create Attention-Grabbing Components
```bash
Files:
- src/components/HeroStats.jsx - Big numbers showcase
- src/components/CombinedTrendsChart.jsx - Patents + Publications
- src/components/TopPerformersWidget.jsx - Leaderboard
- src/components/RecentActivityFeed.jsx - Live updates
- src/components/AchievementBadges.jsx - Milestones
```

---

### 🟣 PHASE 5: Integration & Polish (Day 6-7)

#### Step 5.1: Update Navigation
```bash
File: src/pages/UserDashboard.jsx
File: src/pages/AdminDashboard.jsx
```

**Tasks:**
- [ ] Add "Мақолалар" to sidebar
- [ ] Add icons
- [ ] Update routing
- [ ] Add navigation guards

#### Step 5.2: Update Statistics
```bash
File: Multiple files
```

**Tasks:**
- [ ] Combine patent + publication stats
- [ ] Update overview cards
- [ ] Update export functionality
- [ ] Add combined reports

#### Step 5.3: Create Combined Export
```bash
File: backend/routes/export.js (Update)
```

**New exports:**
- [ ] Export publications as ZIP
- [ ] Export publications as Excel
- [ ] Combined export (patents + publications)
- [ ] Author report export

---

### ⚪ PHASE 6: Testing & Documentation (Day 7-8)

#### Step 6.1: Testing
- [ ] Test all CRUD operations
- [ ] Test file uploads
- [ ] Test statistics calculations
- [ ] Test filters and search
- [ ] Test permissions
- [ ] Test exports

#### Step 6.2: Documentation
- [ ] Update user guide
- [ ] Create admin guide for publications
- [ ] API documentation
- [ ] Database schema docs

---

## 🎨 MOCKUP: Add Publication Form

```jsx
┌──────────────────────────────────────────┐
│  Илмий мақола қўшиш                      │
├──────────────────────────────────────────┤
│                                          │
│  МУАЛЛИФ МАЪЛУМОТЛАРИ                    │
│  ┌────────────────────────────────────┐  │
│  │ Ф.И.Ш. *                           │  │
│  │ [Shukurov N. E.               ]    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐  │
│  │ Мақолалар│ │ Iqtibos │ │ h-indeks │  │
│  │ [28    ]│ │ [570   ]│ │ [13    ] │  │
│  └─────────┘ └─────────┘ └──────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Scopus профил хаволаси             │  │
│  │ [https://scopus.com/...       ]    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ ORCID                              │  │
│  │ [0000-0002-1234-5678          ]    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  МАҚОЛА МАЪЛУМОТЛАРИ                     │
│  ┌────────────────────────────────────┐  │
│  │ Мақола номи *                      │  │
│  │ [Geochemistry and risk...     ]    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌──────────┐ ┌──────────────────────┐  │
│  │ Йил *    │ │ Журнал номи *        │  │
│  │ [2025  ]│ │ [Environmental...  ] │  │
│  └──────────┘ └──────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ DOI                                │  │
│  │ [10.1016/j.envres.2025.01.001 ]    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────┐ ┌────────┐ ┌────────────┐  │
│  │ Tur    │ │ Quartile│ │ Impact F. │  │
│  │ [Maqola▼]│ [Q1    ]│ │ [4.5    ] │  │
│  └────────┘ └────────┘ └────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Hammuallif(lar)                    │  │
│  │ [John Smith; Jane Doe; ...    ]    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Файл (PDF) - Опциал                │  │
│  │ [Файл танлаш...              ] 📎  │  │
│  └────────────────────────────────────┘  │
│                                          │
│  [Бекор қилиш]  [Сақлаш]                │
└──────────────────────────────────────────┘
```

---

## 📊 MOCKUP: Publications Dashboard

```jsx
┌────────────────────────────────────────────────────┐
│  📚 ИЛМИЙ МАҚОЛАЛАР                                │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌────────┐ ┌────────┐ ┌─────────┐ ┌──────────┐ │
│  │  856   │ │ 12,450 │ │  Ўртача │ │   42     │ │
│  │ Мақолалар│ │ Iqtibos│ │ h-index │ │ Муаллиф  │ │
│  │  📖    │ │   📊   │ │   8.5   │ │   👥     │ │
│  └────────┘ └────────┘ └─────────┘ └──────────┘ │
│                                                    │
│  📈 Йиллик тенденция                               │
│  ┌────────────────────────────────────────────┐   │
│  │         📊                                 │   │
│  │    📊  📊                                  │   │
│  │📊 📊  📊  📊                               │   │
│  │──────────────────────────────────────────  │   │
│  │2020 2021 2022 2023 2024 2025              │   │
│  └────────────────────────────────────────────┘   │
│                                                    │
│  🏆 Топ муаллифлар                                 │
│  ┌────────────────────────────────────────────┐   │
│  │ 🥇 Shukurov N.E.     28 мақола  570 iqtibos│   │
│  │ 🥈 Nurtaev B.        31 мақола  567 iqtibos│   │
│  │ 🥉 Karimov A.        25 мақола  445 iqtibos│   │
│  └────────────────────────────────────────────┘   │
│                                                    │
│  [+ Янги мақола]  [📥 Экспорт]  [🔍 Қидириш]     │
└────────────────────────────────────────────────────┘
```

---

## 💡 ADDITIONAL IMPROVEMENTS

### 1. **Author Profiles**
Create dedicated pages for each author showing:
- All their publications
- Total metrics
- Citation graph
- Collaboration network
- Research interests

### 2. **Citation Tracker**
Automatic updates from Scopus/WoS:
- Periodically check for new citations
- Update h-index automatically
- Alert when milestones reached

### 3. **Research Impact Score**
Calculate institutional impact:
```
Impact Score = (Total Citations × 0.4) + 
               (h-index × 0.3) + 
               (Q1 Publications × 0.3)
```

### 4. **Collaboration Network**
Visualize author collaborations:
- Who works with whom
- Research clusters
- Inter-institutional collaboration

### 5. **Achievements System**
Gamification:
- 🏆 First publication
- 🌟 100 citations milestone
- 🎯 h-index 10
- 🔥 Most cited author

### 6. **Reports Generator**
Auto-generate reports:
- Monthly publication summary
- Annual research report
- Author performance report
- Institution comparison report

---

## 📅 TIMELINE SUMMARY

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Phase 1** | 2 days | Database & Backend |
| **Phase 2** | 1 day | Frontend Services |
| **Phase 3** | 2 days | Publications Page |
| **Phase 4** | 1 day | Enhanced Overview |
| **Phase 5** | 1 day | Integration |
| **Phase 6** | 1 day | Testing & Docs |
| **Total** | **8 days** | Complete Feature |

---

## ✅ SUCCESS CRITERIA

Feature is complete when:
- [ ] Can add/edit/delete publications
- [ ] All fields captured correctly
- [ ] File upload works (optional)
- [ ] Statistics calculate correctly
- [ ] Charts display properly
- [ ] Search & filter work
- [ ] Admin can approve/reject
- [ ] Export functions work
- [ ] Mobile responsive
- [ ] Documentation complete

---

## 🎯 QUICK START

### Step 1: Review This Plan
- Read entire document
- Ask questions
- Suggest changes

### Step 2: Approve
- Confirm data fields
- Approve UI mockups
- Approve timeline

### Step 3: Start Implementation
- I'll create all code
- You test and provide feedback
- We iterate until perfect

---

**Ready to start? Which phase should we begin with?** 🚀

I recommend starting with **Phase 1 (Database & Backend)** to build solid foundation!
