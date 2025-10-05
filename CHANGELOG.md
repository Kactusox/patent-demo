# Changelog

All notable changes to the Patent Management System project.

## [1.0.0] - 2025-10-05

### 🎉 Initial Release

#### ✨ Features Added

**Backend**
- Complete Express.js REST API
- SQLite database with automatic initialization
- User authentication system
- Patent CRUD operations
- File upload handling (PDF, max 10MB)
- Export functionality (ZIP and Excel)
- Activity logging system
- Role-based access control
- Duplicate detection for patent applications

**Frontend**
- React 19 with Vite build system
- Admin dashboard with full management capabilities
- Institution dashboard for patent submissions
- Responsive design with Bootstrap 5
- Protected routes and authentication flow
- Real-time search and filtering
- Modal-based forms and confirmations
- File upload with validation

**Admin Features**
- Dashboard with statistics and overview
- Patent management (approve/reject/delete)
- User management (CRUD operations)
- Password reset functionality
- Activity log viewing
- Export to ZIP (with all PDF files)
- Export to Excel (patent list)
- Advanced filtering by institution and status

**Institution Features**
- Submit new patents with metadata and PDF
- View all own patent submissions
- Edit patent information
- Track approval status
- Download patent files
- Duplicate warning on submission
- Search own patents

#### 📦 Dependencies Installed
- Frontend: React 19, Vite 7, Bootstrap 5, React Router 7
- Backend: Express 4, SQLite3 5, Multer 1.4, Archiver 7
- Utilities: XLSX for Excel export, File-saver for downloads

#### 🗄️ Database Schema
- **users** table with 5 default users (1 admin, 4 institutions)
- **patents** table with 8 sample patents
- **activity_logs** table for audit trail

#### 📚 Documentation
- README.md - Project overview and quick start
- QUICK_START.md - Step-by-step guide for new users
- PROJECT_SETUP.md - Complete technical documentation
- SECURITY.md - Security considerations and best practices
- CHANGELOG.md - This file

#### 🔒 Security
- Session-based authentication
- Role-based access control (Admin vs Institution)
- Protected API endpoints
- SQL injection prevention via parameterized queries
- File type validation (PDF only)
- File size limits
- Activity logging for audit

#### 🌍 Localization
- Interface in Uzbek (Uzbek Cyrillic)
- Date formatting in Uzbek locale

### 🐛 Known Issues
- xlsx library has known vulnerabilities (CVE-2024-xxxx)
  - Low risk in current admin-only context
  - See SECURITY.md for details and mitigation
- Passwords stored in plaintext (should implement bcrypt hashing)
- No rate limiting on login attempts
- No session timeout implemented

### 📋 Default Credentials

**Admin**
- Username: admin / Password: admin123

**Institutions**
- neftgaz / neftgaz123 - Oil & Gas Institute
- mineral / mineral123 - Mineral Resources Institute  
- gidro / gidro123 - Hydrogeology Institute
- geofizika / geofizika123 - Geophysics Institute

### 🎯 Patent Types Supported
1. Ихтирога патент (Patent for Invention)
2. Фойдали моделга патент (Utility Model Patent)
3. Саноат намунаси патенти (Industrial Design Patent)
4. Муаллифлик ҳуқуқи (Copyright)
5. ЭХМ учун дастур (Computer Program)
6. Маълумотлар базаси гувоҳномаси (Database Certificate)

### 🔧 Configuration
- Backend port: 5001 (configurable in .env)
- Frontend port: 5173 (Vite default)
- Max upload size: 10MB
- Database: SQLite (patent_system.db)
- Upload directory: backend/uploads/

### 📊 Sample Data Included
- 8 sample patents across different institutions
- Various patent types and statuses
- Realistic Uzbek-language patent data
- Multiple authors per patent examples

---

## Future Roadmap

### Planned for v1.1.0
- [ ] Password hashing with bcrypt
- [ ] Session timeout and auto-logout
- [ ] Rate limiting for API endpoints
- [ ] Email notifications for status changes
- [ ] Bulk patent upload via Excel
- [ ] Advanced search with more filters
- [ ] Patent file preview in browser

### Planned for v1.2.0
- [ ] Two-factor authentication (2FA)
- [ ] Patent versioning history
- [ ] Comments/notes on patents
- [ ] Advanced analytics dashboard
- [ ] Multi-language support (Russian, English)
- [ ] Dark mode theme
- [ ] Mobile app

### Planned for v2.0.0
- [ ] Microservices architecture
- [ ] Docker containerization
- [ ] PostgreSQL migration option
- [ ] Cloud storage integration (S3)
- [ ] Advanced reporting tools
- [ ] API for external integrations
- [ ] Real-time notifications (WebSocket)
- [ ] Patent expiration tracking

---

**Format:** [Major.Minor.Patch]
- **Major**: Breaking changes
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes, minor improvements

**Date Format:** YYYY-MM-DD
