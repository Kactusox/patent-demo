# Patent Management System - API Documentation

This document provides comprehensive documentation for the Patent Management System API.

## Base URL

**Development**: `http://localhost:5001/api`  
**Production**: `https://your-domain.com/api`

## Authentication

The system uses simple username/password authentication. No JWT tokens are currently implemented.

## API Endpoints

### 🔐 Authentication Endpoints

#### POST /auth/login
**Description**: Authenticate user and return user information  
**Body**:
```json
{
  "username": "string",
  "password": "string"
}
```
**Response**:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin|institution",
    "institutionName": "string",
    "fullName": "string",
    "phoneNumber": "string"
  }
}
```

#### POST /auth/logout
**Description**: Logout user  
**Response**:
```json
{
  "success": true,
  "message": "Муваффақиятли чиқдингиз"
}
```

---

### 📄 Patent Endpoints

#### GET /patents
**Description**: Get all patents with optional filters  
**Query Parameters**:
- `status` (optional): `all`, `approved`, `pending`, `rejected`
- `institution` (optional): `all`, `neftgaz`, `mineral`, `gidro`, `geofizika`
- `search` (optional): Search in patent number, title, application number, authors, institution

**Response**:
```json
{
  "success": true,
  "count": 25,
  "patents": [
    {
      "id": 1,
      "patent_number": "FAP 2745",
      "title": "Patent title",
      "type": "Фойдали моделга патент",
      "application_number": "FAP 20240425",
      "submission_date": "15.11.2024",
      "registration_date": "11.06.2025",
      "year": 2024,
      "authors": "AUTHOR NAME",
      "institution": "neftgaz",
      "institution_name": "Institution Full Name",
      "status": "approved",
      "file_path": "/uploads/file.pdf",
      "file_name": "original-file.pdf",
      "created_by": "username",
      "approved_by": "admin",
      "approved_at": "2025-06-11T14:30:00Z",
      "created_at": "2024-11-15T10:00:00Z",
      "updated_at": "2025-06-11T14:30:00Z"
    }
  ]
}
```

#### GET /patents/:id
**Description**: Get single patent by ID  
**Response**: Same as single patent object above

#### POST /patents
**Description**: Create new patent (with file upload)  
**Content-Type**: `multipart/form-data`  
**Form Fields**:
- `patentNumber` (string, required)
- `title` (string, required)
- `type` (string, required)
- `applicationNumber` (string, required)
- `submissionDate` (string, required, format: YYYY-MM-DD)
- `registrationDate` (string, required, format: YYYY-MM-DD)
- `year` (integer, required)
- `authors` (string, required)
- `institution` (string, required)
- `institutionName` (string, required)
- `createdBy` (string, required)
- `file` (file, required, PDF only)

**Response**:
```json
{
  "success": true,
  "message": "Патент муваффақиятли қўшилди",
  "patentId": 1
}
```

#### PUT /patents/:id
**Description**: Update existing patent  
**Content-Type**: `multipart/form-data`  
**Form Fields**: Same as POST, but `file` is optional

#### DELETE /patents/:id
**Description**: Delete patent and associated file  
**Response**:
```json
{
  "success": true,
  "message": "Патент муваффақиятли ўчирилди"
}
```

#### GET /patents/check-duplicate/:applicationNumber
**Description**: Check if application number already exists  
**Response**:
```json
{
  "isDuplicate": true,
  "patent": {
    "id": 1,
    "patentNumber": "FAP 2745"
  }
}
```

#### PATCH /patents/:id/approve
**Description**: Approve patent (admin only)  
**Body**:
```json
{
  "approvedBy": "admin_username"
}
```

#### PATCH /patents/:id/reject
**Description**: Reject patent (admin only)

#### GET /patents/stats/summary
**Description**: Get patent statistics  
**Response**:
```json
{
  "success": true,
  "stats": {
    "total": 25,
    "approved": 20,
    "pending": 3,
    "rejected": 2,
    "byInstitution": [
      {
        "institution": "neftgaz",
        "count": 15
      }
    ]
  }
}
```

---

### 👥 User Management Endpoints

#### GET /users
**Description**: Get all users (admin only)  
**Response**:
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "institution_name": null,
      "full_name": "Administrator",
      "phone_number": "+998901234567",
      "is_active": 1,
      "access_expires_at": null,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### GET /users/:id
**Description**: Get single user by ID

#### POST /users
**Description**: Create new user (admin only)  
**Body**:
```json
{
  "username": "newuser",
  "password": "password123",
  "role": "institution",
  "institutionName": "Institution Name",
  "fullName": "Full Name",
  "phoneNumber": "+998901234567"
}
```

#### PUT /users/:id
**Description**: Update user information  
**Body**:
```json
{
  "institutionName": "Updated Institution",
  "fullName": "Updated Name",
  "phoneNumber": "+998901234567",
  "isActive": true
}
```

#### DELETE /users/:id
**Description**: Delete user (admin only, cannot delete admin user with ID 1)

#### PATCH /users/:id/password
**Description**: Change user password  
**Body**:
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

#### PATCH /users/:id/reset-password
**Description**: Admin reset user password  
**Body**:
```json
{
  "newPassword": "newpassword123"
}
```

#### GET /users/logs/activity
**Description**: Get activity logs (admin only)  
**Response**:
```json
{
  "success": true,
  "logs": [
    {
      "id": 1,
      "user_id": 1,
      "username": "admin",
      "action": "LOGIN",
      "details": "User admin logged in",
      "ip_address": "127.0.0.1",
      "created_at": "2024-01-01T10:00:00Z",
      "full_name": "Administrator"
    }
  ]
}
```

---

### 📊 Export Endpoints

#### GET /export/download-zip
**Description**: Download patents as ZIP archive  
**Query Parameters**:
- `institution` (optional): Filter by institution

**Response**: ZIP file download

#### GET /export/export-excel
**Description**: Get patent data for Excel export  
**Query Parameters**:
- `institution` (optional): Filter by institution

**Response**:
```json
{
  "success": true,
  "data": {
    "neftgaz": [
      {
        "Патент рақами": "FAP 2745",
        "Номи": "Patent Title",
        "Тури": "Фойдали моделга патент",
        // ... other fields in Uzbek
      }
    ]
  },
  "totalCount": 25
}
```

#### GET /export/stats
**Description**: Get export statistics  
**Query Parameters**:
- `institution` (optional): Filter by institution

**Response**:
```json
{
  "success": true,
  "byType": [
    {
      "type": "Фойдали моделга патент",
      "count": 15
    }
  ],
  "totalFiles": 20
}
```

---

### 🏥 Health Check

#### GET /health
**Description**: System health check  
**Response**:
```json
{
  "status": "OK",
  "message": "Patent Management System API is running",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Барча майдонларни тўлдиринг"
}
```

### 401 Unauthorized
```json
{
  "error": "Фойдаланувчи топилмади ёки парол нотўғри"
}
```

### 403 Forbidden
```json
{
  "error": "Сизнинг аккаунтингиз ўчирилган"
}
```

### 404 Not Found
```json
{
  "error": "Патент топилмади"
}
```

### 409 Conflict
```json
{
  "error": "Бу талабнома рақами аллақачон мавжуд"
}
```

### 500 Internal Server Error
```json
{
  "error": "Тизимда хато юз берди"
}
```

---

## Data Models

### Patent Types
- `"Фойдали моделга патент"`
- `"Ихтирога патент"`
- `"Саноат намунаси патенти"`
- `"Маълумотлар базаси гувоҳномаси"`
- `"ЭХМ учун дастур"`
- `"Муаллифлик ҳуқуқи"`

### Institution Keys
- `neftgaz`: Нефт ва газ конлари геологияси ҳамда қидируви институти
- `mineral`: Минерал ресурслар институти
- `gidro`: Гидрогеология ва инженерлик геологияси институти
- `geofizika`: Ҳ.М. Абдуллаев номидаги геология ва геофизика институти

### Patent Status
- `pending`: Кутилмоқда (default for new patents)
- `approved`: Тасдиқланган
- `rejected`: Рад этилган

### User Roles
- `admin`: Administrator with full access
- `institution`: Institution user with limited access

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding rate limiting for production use.

## File Upload

- **Supported formats**: PDF only
- **Maximum file size**: 10MB
- **Storage**: Local filesystem under `/uploads/` directory
- **File naming**: `timestamp-randomnumber.pdf`

## Notes

- All dates are stored as strings in the format shown in examples
- Phone numbers must follow Uzbekistan format: `+998XXXXXXXXX`
- The system uses SQLite database
- All text responses are in Uzbek language
- File uploads use `multipart/form-data` encoding