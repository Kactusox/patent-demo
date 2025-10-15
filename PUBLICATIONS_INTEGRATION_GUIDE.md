# Publications Full Integration Guide

## Overview
This guide shows how to integrate Publications CRUD directly into AdminDashboard and UserDashboard,
matching the exact pattern used for Patents.

## Required Changes

### 1. Import Statements (Add to both dashboards)

```javascript
// Add to existing imports
import { 
  getAllPublications, 
  createPublication,
  updatePublication,
  deletePublication, 
  approvePublication, 
  rejectPublication,
  getPublicationStats 
} from '../services/publicationService'
import { 
  AddPublicationModal,
  ViewPublicationModal,
  DeletePublicationModal,
  ApprovePublicationModal,
  RejectPublicationModal
} from '../components/PublicationModals'
import { formatCitations } from '../utils/publicationData'
```

### 2. State Variables (Add to both dashboards)

```javascript
// Publications state
const [publications, setPublications] = useState([])
const [selectedPublication, setSelectedPublication] = useState(null)
const [showAddPublicationModal, setShowAddPublicationModal] = useState(false)
const [showViewPublicationModal, setShowViewPublicationModal] = useState(false)
const [showDeletePublicationModal, setShowDeletePublicationModal] = useState(false)
const [showApprovePublicationModal, setShowApprovePublicationModal] = useState(false)
const [showRejectPublicationModal, setShowRejectPublicationModal] = useState(false)
const [filterPublicationStatus, setFilterPublicationStatus] = useState('all')
const [filterPublicationInstitution, setFilterPublicationInstitution] = useState('all') // Admin only
const [publicationSearchQuery, setPublicationSearchQuery] = useState('')
const [publicationLoading, setPublicationLoading] = useState(false)
const [publicationSubmitting, setPublicationSubmitting] = useState(false)
```

### 3. Load Functions

```javascript
const loadPublications = async () => {
  setPublicationLoading(true)
  try {
    const filters = currentUser.role === 'admin' 
      ? {} 
      : { institution: currentUser.name }
    const allPublications = await getAllPublications(filters)
    setPublications(allPublications)
  } catch (error) {
    console.error('Error loading publications:', error)
    alert('Мақолаларни юклашда хато: ' + error.message)
  } finally {
    setPublicationLoading(false)
  }
}

// Call in useEffect
useEffect(() => {
  loadPatents()
  loadPublications() // Add this
  loadStatistics()
  loadUsers() // Admin only
}, [])
```

### 4. CRUD Handlers

```javascript
const handleAddPublication = () => {
  setShowAddPublicationModal(true)
}

const handleSubmitPublication = async (publicationData, file) => {
  setPublicationSubmitting(true)
  try {
    await createPublication(publicationData, file)
    alert('Мақола муваффақиятли қўшилди!')
    setShowAddPublicationModal(false)
    await loadPublications()
  } catch (error) {
    console.error('Error creating publication:', error)
    alert('Хато: ' + error.message)
  } finally {
    setPublicationSubmitting(false)
  }
}

const handleViewPublication = (publication) => {
  setSelectedPublication(publication)
  setShowViewPublicationModal(true)
}

const handleDeletePublication = (publication) => {
  setSelectedPublication(publication)
  setShowDeletePublicationModal(true)
}

const confirmDeletePublication = async () => {
  setPublicationSubmitting(true)
  try {
    await deletePublication(selectedPublication.id)
    alert('Мақола ўчирилди')
    await loadPublications()
    setShowDeletePublicationModal(false)
    setSelectedPublication(null)
  } catch (error) {
    console.error('Error deleting publication:', error)
    alert('Ўчиришда хато: ' + error.message)
  } finally {
    setPublicationSubmitting(false)
  }
}

const handleApprovePublication = (publication) => {
  setSelectedPublication(publication)
  setShowApprovePublicationModal(true)
}

const confirmApprovePublication = async () => {
  setPublicationSubmitting(true)
  try {
    await approvePublication(selectedPublication.id, currentUser.username)
    alert('Мақола тасдиқланди!')
    await loadPublications()
    setShowApprovePublicationModal(false)
    setSelectedPublication(null)
  } catch (error) {
    console.error('Error approving publication:', error)
    alert('Тасдиқлашда хато: ' + error.message)
  } finally {
    setPublicationSubmitting(false)
  }
}

const handleRejectPublication = (publication) => {
  setSelectedPublication(publication)
  setShowRejectPublicationModal(true)
}

const confirmRejectPublication = async () => {
  setPublicationSubmitting(true)
  try {
    await rejectPublication(selectedPublication.id)
    alert('Мақола рад этилди')
    await loadPublications()
    setShowRejectPublicationModal(false)
    setSelectedPublication(null)
  } catch (error) {
    console.error('Error rejecting publication:', error)
    alert('Рад этишда хато: ' + error.message)
  } finally {
    setPublicationSubmitting(false)
  }
}
```

### 5. Filtering Logic

```javascript
const filteredPublications = publications.filter(pub => {
  const matchesSearch = !publicationSearchQuery || 
    pub.title.toLowerCase().includes(publicationSearchQuery.toLowerCase()) ||
    pub.author_full_name.toLowerCase().includes(publicationSearchQuery.toLowerCase()) ||
    (pub.journal_name && pub.journal_name.toLowerCase().includes(publicationSearchQuery.toLowerCase()))
  
  const matchesStatus = filterPublicationStatus === 'all' || pub.status === filterPublicationStatus
  
  const matchesInstitution = currentUser.role === 'admin'
    ? (filterPublicationInstitution === 'all' || pub.institution === filterPublicationInstitution)
    : true
  
  return matchesSearch && matchesStatus && matchesInstitution
})
```

### 6. Replace Publications Tab Content

**REPLACE THIS:**
```javascript
{activeTab === 'publications' && (
  <PublicationsDashboard />
)}
```

**WITH THIS:** (See separate file for full inline section)

The Publications tab should mirror the Patents tab exactly with:
- Search and filters
- Add/Export buttons
- Full table with CRUD actions
- All modals at the end

### 7. Add Modals at End (Before closing tags)

```javascript
{/* Publication Modals */}
<AddPublicationModal
  show={showAddPublicationModal}
  onHide={() => setShowAddPublicationModal(false)}
  onSubmit={handleSubmitPublication}
  currentUser={currentUser}
  submitting={publicationSubmitting}
/>

<ViewPublicationModal
  show={showViewPublicationModal}
  onHide={() => {
    setShowViewPublicationModal(false)
    setSelectedPublication(null)
  }}
  publication={selectedPublication}
/>

<DeletePublicationModal
  show={showDeletePublicationModal}
  onHide={() => {
    setShowDeletePublicationModal(false)
    setSelectedPublication(null)
  }}
  onConfirm={confirmDeletePublication}
  publication={selectedPublication}
  submitting={publicationSubmitting}
/>

<ApprovePublicationModal
  show={showApprovePublicationModal}
  onHide={() => {
    setShowApprovePublicationModal(false)
    setSelectedPublication(null)
  }}
  onConfirm={confirmApprovePublication}
  publication={selectedPublication}
  submitting={publicationSubmitting}
/>

<RejectPublicationModal
  show={showRejectPublicationModal}
  onHide={() => {
    setShowRejectPublicationModal(false)
    setSelectedPublication(null)
  }}
  onConfirm={confirmRejectPublication}
  publication={selectedPublication}
  submitting={publicationSubmitting}
/>
```

## Summary

The key is to:
1. Add all publications state
2. Add all CRUD handlers
3. Replace `<PublicationsDashboard />` with inline section matching Patents structure
4. Add all modals at the end
5. Import the new PublicationModals component

This gives full CRUD control exactly like Patents!
