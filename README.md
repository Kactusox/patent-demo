# Patent Management System

A comprehensive patent management system for Geological Science University, built with React and Node.js.

## 🚀 Features

### For Institutions
- **Patent Submission**: Submit new patents with detailed information
- **Document Management**: Upload and manage PDF documents
- **Status Tracking**: Track patent approval status
- **Search & Filter**: Find patents by various criteria
- **Profile Management**: Manage institution profile

### For Administrators
- **Patent Approval**: Review and approve/reject patent submissions
- **User Management**: Manage institution users and permissions
- **Statistics Dashboard**: View comprehensive statistics and reports
- **Export Functionality**: Export data to Excel and ZIP formats
- **Activity Logs**: Monitor system activity and user actions

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool and dev server
- **React Bootstrap** - UI component library
- **React Router** - Client-side routing
- **React Icons** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite** - Lightweight database
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)

## 🚀 Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd patent-management-system
```

### 2. Install dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../
npm install
```

### 3. Environment Configuration

Create a `.env` file in the backend directory:
```env
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# File upload settings
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=.pdf

# Database
DB_NAME=patent_system.db
```

### 4. Start the application

#### Start Backend Server
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:5001`

#### Start Frontend Development Server
```bash
npm run dev
```
The frontend will run on `http://localhost:5173`

## 📊 Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `password` - Hashed password
- `role` - User role (admin/institution)
- `institution_name` - Institution name
- `full_name` - User's full name
- `phone_number` - Contact number
- `is_active` - Account status
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Patents Table
- `id` - Primary key
- `patent_number` - Unique patent number
- `title` - Patent title
- `type` - Patent type
- `application_number` - Application number
- `submission_date` - Submission date
- `registration_date` - Registration date
- `year` - Patent year
- `authors` - Author names
- `institution` - Institution code
- `institution_name` - Institution name
- `status` - Patent status (pending/approved/rejected)
- `file_path` - File path
- `file_name` - Original file name
- `created_by` - Creator username
- `approved_by` - Approver username
- `approved_at` - Approval timestamp
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Activity Logs Table
- `id` - Primary key
- `user_id` - User ID
- `username` - Username
- `action` - Action performed
- `details` - Action details
- `ip_address` - User IP address
- `created_at` - Timestamp

## 🔐 Default Users

The system comes with pre-configured users:

### Administrator
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Administrator

### Institution Users
- **Username**: `neftgaz` | **Password**: `neftgaz123`
- **Username**: `mineral` | **Password**: `mineral123`
- **Username**: `gidro` | **Password**: `gidro123`
- **Username**: `geofizika` | **Password**: `geofizika123`

## 📁 Project Structure

```
patent-management-system/
├── backend/
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   ├── logging.js
│   │   └── validation.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── patents.js
│   │   ├── users.js
│   │   └── export.js
│   ├── uploads/
│   ├── database.js
│   ├── server.js
│   └── package.json
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   └── styles/
├── public/
└── package.json
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check` - Check authentication status

### Patents
- `GET /api/patents` - Get all patents
- `GET /api/patents/:id` - Get patent by ID
- `POST /api/patents` - Create new patent
- `PUT /api/patents/:id` - Update patent
- `DELETE /api/patents/:id` - Delete patent
- `PATCH /api/patents/:id/approve` - Approve patent
- `PATCH /api/patents/:id/reject` - Reject patent
- `GET /api/patents/check-duplicate/:appNumber` - Check duplicate
- `GET /api/patents/stats/summary` - Get statistics

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PATCH /api/users/:id/password` - Reset password

### Export
- `GET /api/export/zip` - Download ZIP file
- `GET /api/export/excel` - Export to Excel

## 🎨 UI Features

### Responsive Design
- Mobile-first approach
- Bootstrap-based responsive layout
- Modern and clean interface

### Multi-language Support
- Primary language: Uzbek
- Secondary language: Russian
- Easy to extend for additional languages

### User Experience
- Intuitive navigation
- Real-time validation
- Loading states and feedback
- Error handling and notifications

## 🔒 Security Features

- Input validation and sanitization
- SQL injection prevention
- XSS protection
- File upload security
- Rate limiting
- Activity logging
- CORS configuration

## 📈 Performance Optimizations

- Database indexing
- File compression
- Lazy loading
- Efficient queries
- Caching strategies

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
npm test
```

## 🚀 Deployment

### Production Build
```bash
# Build frontend
npm run build

# Start production server
cd backend
npm start
```

### Environment Variables
Set the following environment variables for production:
- `NODE_ENV=production`
- `PORT=5001`
- `FRONTEND_URL=https://yourdomain.com`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 📞 Support

For support and questions, please contact the development team.

## 🔄 Version History

### v1.0.0
- Initial release
- Basic patent management functionality
- User authentication and authorization
- File upload and management
- Statistics and reporting
- Export functionality

---

**Developed for Geological Science University**  
*Patent Management System - Streamlining patent workflows for academic institutions*