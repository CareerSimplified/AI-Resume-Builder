# Custom Auth API Endpoints

## 🚀 New API Endpoints Created

I've created custom API endpoints for authentication that you can call directly with curl, Postman, or any HTTP client.

---

## 📍 API Endpoints

### **Base URL:**
```
http://localhost:3000/api/auth
```

---

## 1️⃣ **Register User (Signup)**

**Endpoint:** `POST /api/auth/register`

**URL:** `http://localhost:3000/api/auth/register`

### **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "John Doe"
}
```

### **Required Fields:**
- `email` (string, required) - User's email address
- `password` (string, required) - Must be at least 6 characters
- `name` (string, optional) - User's full name

### **Curl Example:**
```bash
curl -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ram@gmail.com",
    "password": "Ram@2026",
    "name": "ram"
  }'
```

### **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "uuid-here",
    "email": "ram@gmail.com",
    "name": "ram",
    "createdAt": "2026-04-06T10:30:00.000Z",
    "emailConfirmed": false
  }
}
```

### **Error Responses:**

**400 - Bad Request:**
```json
{
  "success": false,
  "error": "Email and password are required",
  "message": "Please provide email and password"
}
```

**400 - Password Too Short:**
```json
{
  "success": false,
  "error": "Password too short",
  "message": "Password must be at least 6 characters"
}
```

**409 - User Already Exists:**
```json
{
  "success": false,
  "error": "User already exists",
  "message": "An account with this email already exists"
}
```

---

## 2️⃣ **Login User (Sign In)**

**Endpoint:** `POST /api/auth/login`

**URL:** `http://localhost:3000/api/auth/login`

### **Request Body:**
```json
{
  "email": "ram@gmail.com",
  "password": "Ram@2026"
}
```

### **Required Fields:**
- `email` (string, required) - User's email address
- `password` (string, required) - User's password

### **Curl Example:**
```bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ram@gmail.com",
    "password": "Ram@2026"
  }'
```

### **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "ram@gmail.com",
      "name": "ram",
      "role": "user"
    },
    "session": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600,
      "tokenType": "bearer"
    }
  }
}
```

### **Error Responses:**

**401 - Invalid Credentials:**
```json
{
  "success": false,
  "error": "Invalid credentials",
  "message": "Email or password is incorrect"
}
```

**403 - Email Not Confirmed:**
```json
{
  "success": false,
  "error": "Email not confirmed",
  "message": "Please verify your email address first"
}
```

---

## 3️⃣ **Get Current User Profile**

**Endpoint:** `GET /api/auth/me`

**URL:** `http://localhost:3000/api/auth/me`

### **Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### **Required Headers:**
- `Authorization` (string, required) - Bearer token from login response

### **Curl Example:**
```bash
curl -X GET "http://localhost:3000/api/auth/me" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "uuid-here",
    "email": "ram@gmail.com",
    "name": "ram",
    "role": "user",
    "createdAt": "2026-04-06T10:30:00.000Z",
    "emailConfirmed": true
  }
}
```

### **Error Responses:**

**401 - Unauthorized:**
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "No access token provided"
}
```

**401 - Invalid Token:**
```json
{
  "success": false,
  "error": "Invalid token",
  "message": "Access token is invalid or expired"
}
```

---

## 🧪 Complete Testing Flow

### **Step 1: Register a New User**
```bash
curl -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'
```

**Expected:** User created, returns userId

### **Step 2: Login with the User**
```bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

**Expected:** Returns accessToken and refreshToken

### **Step 3: Get User Profile**
```bash
# Replace YOUR_ACCESS_TOKEN with the token from Step 2
curl -X GET "http://localhost:3000/api/auth/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected:** Returns user profile information

---

## 📊 Database Integration

### **What Happens When You Register:**

1. **API Call:** `POST /api/auth/register`
2. **Supabase Auth:** Creates user in `auth.users` table
3. **Database Trigger:** `handle_new_user()` fires automatically
4. **Your Database:** Creates record in `users` table with:
   ```sql
   {
     id: "uuid-from-supabase",
     email: "test@example.com",
     name: "Test User",
     role: "user",
     created_at: NOW()
   }
   ```

### **Users Table Structure:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔧 Configuration

### **Required Environment Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Database Setup:**
Make sure you've run the SQL setup script:
```bash
sql/setup-complete.sql
```

This creates:
- ✅ `users` table
- ✅ Database trigger `handle_new_user()`
- ✅ RLS policies
- ✅ Storage bucket

---

## 🚨 Important Notes

### **Email Confirmation:**
By default, Supabase may require email verification. To disable for development:

1. Go to **Supabase Dashboard**
2. **Authentication** → **Settings**
3. **Email Auth** → Disable "Confirm email"
4. **Save**

Now users can login immediately after registration.

### **Security:**
- ✅ Password validation (min 6 characters)
- ✅ Email format validation
- ✅ Duplicate email detection
- ✅ Secure token handling
- ✅ RLS policies protect data

### **Error Handling:**
All API endpoints return consistent JSON responses:
```json
{
  "success": true/false,
  "message": "Human readable message",
  "error": "Error type (if failed)",
  "data": { ... } // Response data (if successful)
}
```

---

## 📝 HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful login |
| 201 | Created | Successful registration |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Invalid credentials or token |
| 403 | Forbidden | Email not confirmed |
| 409 | Conflict | User already exists |
| 500 | Server Error | Internal error |

---

## 🎯 Quick Test

### **Test with Your Email:**
```bash
curl -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ram@gmail.com",
    "password": "Ram@2026",
    "name": "ram"
  }'
```

**If successful, you'll see:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "...",
    "email": "ram@gmail.com",
    "name": "ram",
    "createdAt": "...",
    "emailConfirmed": false
  }
}
```

---

## ✨ Summary

**API Endpoints Available:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

**All endpoints:**
- ✅ Return consistent JSON format
- ✅ Proper HTTP status codes
- ✅ Error handling
- ✅ Input validation
- ✅ Database integration

**Ready to use!** 🎉
