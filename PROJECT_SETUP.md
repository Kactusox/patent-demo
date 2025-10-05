# 🎓 Patent Management System - Setup Guide

## 📋 Overview
This is a comprehensive Patent Management System developed for the Geological Science University. It allows institutions to submit patents and administrators to manage and approve them.

## 🏗️ Architecture
- **Frontend**: React 19 + Vite + Bootstrap 5
- **Backend**: Node.js + Express + SQLite
- **Authentication**: Session-based authentication
- **File Storage**: Local file system (PDF uploads)

## 🔧 Prerequisites
- Node.js v18+ (Tested with v22.20.0)
- npm v10+
- Modern web browser

## 📦 Installation

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
npm install
```

### 2. Configuration
The backend already has a `.env` file configured with:
- Port: 5001
- Max file size: 10MB
- Allowed file types: PDF only

### 3. Database
The SQLite database (`patent_system.db`) is automatically created and initialized with:
- Default admin user
- 4 institution users
- Sample patent data

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
npm start
# or for development with auto-reload:
npm run dev
```
Server will start at: `http://localhost:5001`

### Start Frontend Development Server
```bash
# In the root directory
npm run dev
```
Frontend will start at: `http://localhost:5173`

## 👥 Default Users

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Administrator
- **Permissions**: 
  - View all patents
  - Approve/reject patents
  - Manage users
  - Export data to ZIP/Excel
  - View activity logs

### Institution Accounts

1. **Neft va Gaz Institute**
   - Username: `neftgaz`
   - Password: `neftgaz123`

2. **Mineral Resources Institute**
   - Username: `mineral`
   - Password: `mineral123`

3. **Hydrogeology Institute**
   - Username: `gidro`
   - Password: `gidro123`

4. **Geophysics Institute**
   - Username: `geofizika`
   - Password: `geofizika123`

**Institution Permissions**:
- Submit new patents
- Edit their own patents
- View patent status
- Download their patent files

## 🎯 Features

### For Administrators
- ✅ Dashboard with statistics
- ✅ View all patents from all institutions
- ✅ Approve or reject pending patents
- ✅ Search and filter patents by status, institution, or keyword
- ✅ Export patents as ZIP archive
- ✅ Export patent list to Excel
- ✅ User management (add, edit, delete, reset passwords)
- ✅ Activity logging and monitoring
- ✅ Settings management

### For Institutions
- ✅ Submit new patents with PDF files
- ✅ View their own patent submissions
- ✅ Edit patent information
- ✅ Track approval status
- ✅ Download patent documents
- ✅ Duplicate detection (warns if application number exists)
- ✅ Search functionality

## 📁 Project Structure

```
patent-management-system/
├── backend/
│   ├── database.js          # Database initialization and helpers
│   ├── server.js            # Express server configuration
│   ├── routes/
│   │   ├── auth.js          # Authentication endpoints
│   │   ├── patents.js       # Patent management endpoints
│   │   ├── users.js         # User management endpoints
│   │   └── export.js        # Export functionality
│   ├── uploads/             # PDF file storage
│   ├── patent_system.db     # SQLite database
│   └── package.json
├── src/
│   ├── pages/
│   │   ├── LoginPage.jsx         # Login interface
│   │   ├── AdminDashboard.jsx    # Admin panel
│   │   └── UserDashboard.jsx     # Institution panel
│   ├── components/
│   │   ├── ProtectedRoute.jsx    # Route protection
│   │   └── UserManagementModals.jsx
│   ├── services/
│   │   ├── api.js              # Axios configuration
│   │   ├── authService.js      # Authentication API
│   │   ├── patentService.js    # Patent API
│   │   ├── userService.js      # User API
│   │   └── exportService.js    # Export API
│   └── utils/
│       ├── auth.js             # Auth helpers
│       └── patentData.js       # Constants and data
├── package.json
└── vite.config.js
```

## 🔒 Security Features
- Password-based authentication
- Role-based access control (Admin vs Institution)
- Protected routes on frontend
- SQL injection prevention with parameterized queries
- File type validation (PDF only)
- File size limits (10MB)
- Activity logging for audit trails

## 📊 Database Schema

### Users Table
- id, username, password, role, institution_name
- full_name, phone_number, is_active
- access_expires_at, created_at, updated_at

### Patents Table
- id, patent_number, title, type, application_number
- submission_date, registration_date, year, authors
- institution, institution_name, status
- file_path, file_name, created_by, approved_by
- approved_at, created_at, updated_at

### Activity Logs Table
- id, user_id, username, action, details
- ip_address, created_at

## 🐛 Troubleshooting

### Port Already in Use
If port 5001 is in use:
```bash
# Change PORT in backend/.env
PORT=5002
```

### Database Issues
To reset the database:
```bash
cd backend
rm patent_system.db
node server.js  # Will recreate with default data
```

### Missing Dependencies
```bash
# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install

cd backend
rm -rf node_modules package-lock.json
npm install
```

## 🔄 Development Workflow

1. **Backend Development**
   ```bash
   cd backend
   npm run dev  # Uses nodemon for auto-reload
   ```

2. **Frontend Development**
   ```bash
   npm run dev  # Vite HMR enabled
   ```

3. **Building for Production**
   ```bash
   npm run build
   npm run preview  # Preview production build
   ```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/validate` - Validate session
- `POST /api/auth/logout` - User logout

### Patents
- `GET /api/patents` - Get all patents (filtered by role)
- `POST /api/patents` - Create new patent
- `PUT /api/patents/:id` - Update patent
- `DELETE /api/patents/:id` - Delete patent
- `POST /api/patents/:id/approve` - Approve patent
- `POST /api/patents/:id/reject` - Reject patent
- `GET /api/patents/check-duplicate/:applicationNumber` - Check duplicates
- `GET /api/patents/statistics` - Get statistics

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/reset-password` - Reset password
- `GET /api/users/activity-logs` - Get activity logs

### Export (Admin only)
- `GET /api/export/zip` - Download patents as ZIP
- `GET /api/export/excel` - Export to Excel
- `GET /api/export/stats` - Get export statistics

## 📱 Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🎨 UI Features
- Modern, responsive design
- Bootstrap 5 components
- React Icons
- Custom CSS styling
- Mobile-friendly interface
- Loading states and spinners
- Toast notifications
- Confirmation modals

## 🔐 Password Policy
- Minimum 6 characters (can be customized)
- Default passwords should be changed after first login
- Admin can reset user passwords

## 📈 Future Enhancements
- [ ] Email notifications for patent status changes
- [ ] Advanced search with filters
- [ ] Bulk patent upload
- [ ] Patent versioning
- [ ] Multi-language support (Currently Uzbek)
- [ ] Two-factor authentication
- [ ] Advanced analytics and reports
- [ ] Patent expiration tracking
- [ ] API rate limiting
- [ ] Docker containerization

## 🤝 Support
For issues or questions:
1. Check the troubleshooting section
2. Review the database logs
3. Check browser console for frontend errors
4. Review backend server logs

## 📜 License
ISC

## 👨‍💻 Authors
Geological Science University

---
**Last Updated**: October 2025
