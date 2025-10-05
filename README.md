# Patent Management System 📄

A comprehensive web application for managing patents and intellectual property documents for geological science institutions in Uzbekistan.

## 🌟 Features

- **User Management**: Role-based access control (Admin/Institution)
- **Patent Management**: Complete CRUD operations for patents
- **File Upload**: PDF document management with validation
- **Export Features**: Excel and ZIP export capabilities
- **Search & Filter**: Advanced filtering by status, institution, and search terms
- **Multilingual Support**: Full Uzbek language interface
- **Responsive Design**: Mobile-friendly Bootstrap UI
- **Activity Logging**: Comprehensive audit trail

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd patent-management-system
```

2. **Quick Start (Recommended)**
```bash
./start-dev.sh
```
This script will automatically:
- Install all dependencies
- Start both backend and frontend servers
- Open the application in your browser

3. **Manual Setup**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Start backend server
npm run dev

# In another terminal, start frontend
cd ..
npm run dev
```

### 🔑 Default Login Credentials

**Administrator:**
- Username: `admin`
- Password: `admin123`

**Institution Users:**
- Username: `neftgaz` | Password: `neftgaz123`
- Username: `mineral` | Password: `mineral123`
- Username: `gidro` | Password: `gidro123`
- Username: `geofizika` | Password: `geofizika123`

## 📁 Project Structure

```
patent-management-system/
├── 📂 backend/                 # Express.js API server
│   ├── 📂 routes/             # API routes
│   ├── 📂 uploads/            # File storage
│   ├── 📄 database.js         # SQLite database setup
│   ├── 📄 server.js           # Express server
│   └── 📄 .env               # Environment variables
├── 📂 src/                    # React frontend
│   ├── 📂 components/         # Reusable components
│   ├── 📂 pages/              # Page components
│   ├── 📂 services/           # API services
│   ├── 📂 styles/             # CSS styles
│   └── 📂 utils/              # Utility functions
├── 📂 docker/                 # Docker configuration
├── 📄 docker-compose.yml      # Docker Compose setup
├── 📄 start-dev.sh           # Development startup script
├── 📄 API_DOCUMENTATION.md   # Complete API docs
└── 📄 README.md              # This file
```

## 🐳 Docker Deployment

### Development with Docker
```bash
docker-compose up --build
```

### Production Deployment
```bash
# Build and run in production mode
docker-compose -f docker-compose.yml up -d --build
```

The application will be available at:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:5001

## 🔧 Technology Stack

### Frontend
- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and dev server
- **React Bootstrap** - UI component library
- **React Router** - Client-side routing
- **React Icons** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite3** - Lightweight database
- **Multer** - File upload handling
- **Archiver** - ZIP file creation

### Development Tools
- **ESLint** - Code linting
- **Docker** - Containerization
- **Nginx** - Production web server

## 📊 Database Schema

The application uses SQLite with three main tables:

### Users Table
- User authentication and role management
- Institution information
- Contact details

### Patents Table
- Patent metadata and documents
- Status tracking (pending/approved/rejected)
- File associations

### Activity Logs Table
- Audit trail for all user actions
- Security and compliance tracking

## 🛠️ Development

### Available Scripts

**Frontend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

**Backend:**
```bash
npm start            # Start production server
npm run dev          # Start development server with nodemon
```

### Environment Variables

Create a `.env` file in the backend directory:
```env
PORT=5001
NODE_ENV=development
HOST=localhost
DB_NAME=patent_system.db
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=.pdf
```

## 📚 API Documentation

Complete API documentation is available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

**Key Endpoints:**
- `POST /api/auth/login` - User authentication
- `GET /api/patents` - List patents with filtering
- `POST /api/patents` - Create new patent
- `GET /api/export/download-zip` - Download ZIP archive
- `GET /api/users` - User management (admin)

## 🔒 Security Features

- Role-based access control
- File type validation (PDF only)
- Input sanitization and validation
- Activity logging and audit trails
- Phone number format validation (Uzbekistan)
- SQL injection protection

## 🌐 Supported Institutions

- **Neftgaz**: Нефт ва газ конлари геологияси ҳамда қидируви институти
- **Mineral**: Минерал ресурслар институти
- **Gidro**: Гидрогеология ва инженерлик геологияси институти
- **Geofizika**: Ҳ.М. Абдуллаев номидаги геология ва геофизика институти

## 📋 Patent Types Supported

- Фойдали моделга патент
- Ихтирога патент
- Саноат намунаси патенти
- Маълумотлар базаси гувоҳномаси
- ЭХМ учун дастур
- Муаллифлик ҳуқуқи

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the [API Documentation](./API_DOCUMENTATION.md)
- Review the project structure above
- Check the browser console for errors
- Ensure all dependencies are installed correctly

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added Docker support and improved documentation
- **v1.2.0** - Enhanced UI and added export features
