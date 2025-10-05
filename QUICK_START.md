# 🚀 Quick Start Guide

## Step-by-Step Instructions

### 1️⃣ Installation (First Time Only)
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2️⃣ Start the Application

**Option A: Using Two Terminal Windows**

Terminal 1 - Backend:
```bash
cd backend
npm start
```
✅ Backend running at: http://localhost:5001

Terminal 2 - Frontend:
```bash
npm run dev
```
✅ Frontend running at: http://localhost:5173

**Option B: Using npm scripts (if available)**
```bash
# Start both frontend and backend
npm run dev
```

### 3️⃣ Login to the System

Open your browser and go to: **http://localhost:5173**

**Admin Login:**
- Username: `admin`
- Password: `admin123`

**Institution Login (Example):**
- Username: `neftgaz`
- Password: `neftgaz123`

## 🎯 What Can You Do?

### As Admin:
1. **View Dashboard** - See statistics and overview
2. **Manage Patents** - Approve/reject pending patents
3. **Manage Users** - Add, edit, delete institution users
4. **Export Data** - Download patents as ZIP or Excel
5. **View Logs** - Check activity logs

### As Institution:
1. **Submit Patents** - Add new patents with PDF files
2. **View My Patents** - See all your submissions
3. **Edit Patents** - Update patent information
4. **Track Status** - Monitor approval status
5. **Download Files** - Get your patent documents

## 📋 Patent Submission Fields

When submitting a new patent:
- **Patent Number** (e.g., FAP 2745)
- **Application Number** (e.g., FAP 20240425)
- **Title** - Patent/invention name
- **Type** - Select from dropdown:
  - Ихтирога патент (Patent for Invention)
  - Фойдали моделга патент (Utility Model Patent)
  - Саноат намунаси патенти (Industrial Design Patent)
  - Муаллифлик ҳуқуқи (Copyright)
  - ЭХМ учун дастур (Computer Program)
  - Маълумотлар базаси гувоҳномаси (Database Certificate)
- **Year** - Patent year
- **Submission Date** - When patent was submitted
- **Registration Date** - When patent was registered
- **Authors** - Semicolon-separated list
- **PDF File** - Upload patent document (max 10MB)

## ⚡ Pro Tips

1. **For Admins:**
   - Use filters to quickly find patents by institution or status
   - Export data regularly for backup
   - Monitor activity logs for security

2. **For Institutions:**
   - Check for duplicate application numbers before submission
   - Keep your contact information updated
   - Download copies of approved patents

3. **Security:**
   - Change default passwords after first login
   - Log out when finished
   - Keep your credentials secure

## 🔍 Common Tasks

### How to Approve a Patent (Admin)
1. Login as admin
2. Go to "Патентлар" (Patents) tab
3. Click "Кўриш" (View) or "Тасдиқлаш" (Approve) button
4. Review patent details
5. Click "Тасдиқлаш" to approve

### How to Submit a Patent (Institution)
1. Login with institution credentials
2. Click "Янги қўшиш" (Add New) button
3. Fill in all required fields (marked with *)
4. Upload PDF file
5. Click "Сақлаш" (Save)
6. Wait for admin approval

### How to Export All Patents (Admin)
1. Login as admin
2. Go to "Патентлар" tab
3. Apply filters if needed (optional)
4. Click "ZIP юклаб олиш" or "Excel экспорт"
5. File will download automatically

## 🐛 Quick Fixes

**Problem: Can't login**
- Check username and password (case-sensitive)
- Make sure backend server is running
- Check browser console for errors

**Problem: File upload fails**
- Check file is PDF format
- Check file size is under 10MB
- Verify backend server is running

**Problem: Server won't start**
- Check if port 5001 is already in use
- Try changing PORT in backend/.env
- Check for error messages in terminal

## 📞 Need Help?
Refer to `PROJECT_SETUP.md` for detailed documentation.

---
Happy Patent Managing! 🎉
