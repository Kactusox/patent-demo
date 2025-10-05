# 🎓 Patent Management System

A comprehensive web-based patent management system for Geological Science University institutions.

![React](https://img.shields.io/badge/React-19.1.1-blue)
![Node.js](https://img.shields.io/badge/Node.js-22+-green)
![License](https://img.shields.io/badge/license-ISC-orange)

## 🌟 Features

### 👨‍💼 Admin Features
- ✅ View and manage all patents from all institutions
- ✅ Approve or reject patent submissions
- ✅ User management (create, edit, delete, reset passwords)
- ✅ Export patents to ZIP or Excel
- ✅ Activity logging and monitoring
- ✅ Statistics and analytics dashboard
- ✅ Advanced search and filtering

### 🏢 Institution Features  
- ✅ Submit new patents with PDF documents
- ✅ Edit and manage their own patents
- ✅ Track approval status
- ✅ Download patent files
- ✅ Duplicate detection
- ✅ Search functionality

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ (v22.20.0 recommended)
- npm v10+

### Installation

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Backend runs at: `http://localhost:5001`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Frontend runs at: `http://localhost:5173`

### Default Login Credentials

**Admin:**
- Username: `admin`
- Password: `admin123`

**Institution (example):**
- Username: `neftgaz`
- Password: `neftgaz123`

See `QUICK_START.md` for more credentials and details.

## 📚 Documentation

- **[Quick Start Guide](QUICK_START.md)** - Get up and running in 5 minutes
- **[Complete Setup Guide](PROJECT_SETUP.md)** - Detailed documentation and API reference

## 🏗️ Tech Stack

- **Frontend:** React 19 + Vite + Bootstrap 5 + React Router
- **Backend:** Node.js + Express + SQLite3
- **Authentication:** Session-based auth
- **File Handling:** Multer (PDF uploads)
- **Export:** XLSX + Archiver (ZIP)

## 📁 Project Structure

```
patent-management-system/
├── backend/              # Express server & API
│   ├── routes/          # API endpoints
│   ├── database.js      # SQLite database
│   └── server.js        # Server configuration
├── src/
│   ├── pages/           # React pages
│   ├── components/      # Reusable components
│   ├── services/        # API services
│   └── utils/           # Helper functions
└── uploads/             # Patent PDF files
```

## 🔒 Security

- Role-based access control (Admin vs Institution)
- Protected routes
- SQL injection prevention
- File type validation (PDF only)
- File size limits (10MB)
- Activity logging for audit trails

## 🎯 Supported Patent Types

- Ихтирога патент (Patent for Invention)
- Фойдали моделга патент (Utility Model Patent)
- Саноат намунаси патенти (Industrial Design Patent)
- Муаллифлик ҳуқуқи (Copyright)
- ЭХМ учун дастур (Computer Program)
- Маълумотлар базаси гувоҳномаси (Database Certificate)

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Edit backend/.env
PORT=5002
```

**Reset database:**
```bash
cd backend
rm patent_system.db
npm start  # Will recreate with sample data
```

## 📊 Database

SQLite database with three main tables:
- **users** - System users (admin & institutions)
- **patents** - Patent submissions
- **activity_logs** - Audit trail

Sample data is automatically loaded on first run.

## 🔄 Development

```bash
# Backend with auto-reload
cd backend
npm run dev

# Frontend with HMR
npm run dev

# Build for production
npm run build
```

## 📝 API Endpoints

- `POST /api/auth/login` - User authentication
- `GET /api/patents` - Get patents (role-filtered)
- `POST /api/patents` - Submit new patent
- `PUT /api/patents/:id/approve` - Approve patent (admin)
- `GET /api/export/zip` - Export patents as ZIP (admin)
- `GET /api/users` - Get users (admin)

See [PROJECT_SETUP.md](PROJECT_SETUP.md) for complete API documentation.

## 🤝 Contributing

This is a university project. For issues or improvements, please contact the development team.

## 📄 License

ISC License

## 👨‍💻 Author

**Geological Science University**  
Patent Management System Development Team

---

Made with ❤️ for Geological Science University
