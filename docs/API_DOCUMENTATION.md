# API Documentation

## Authentication Endpoints

### POST /auth/signup

Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Status Codes:**
- 200: Success
- 400: Invalid input
- 409: Email already exists

---

### POST /auth/login

Authenticate user with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session": "token",
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    }
  }
}
```

**Status Codes:**
- 200: Success
- 401: Invalid credentials
- 404: User not found

---

### POST /auth/google

Sign in with Google OAuth.

**Response:**
Redirects to Google login, then to `/auth/callback`

---

### POST /auth/logout

Sign out current user.

**Response:**
```json
{
  "success": true
}
```

---

## Job Description Endpoints

### POST /api/job-descriptions

Create a new job description.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "title": "Senior Software Engineer",
  "company": "Tech Corp",
  "skills": ["React", "Node.js", "TypeScript"],
  "experience": "senior",
  "description": "Full job description..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "Senior Software Engineer",
    "company": "Tech Corp",
    "skills": ["React", "Node.js", "TypeScript"],
    "experience": "senior",
    "description": "...",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Status Codes:**
- 201: Created
- 401: Unauthorized
- 400: Invalid data

---

### GET /api/job-descriptions

Get all job descriptions for current user.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Senior Software Engineer",
      ...
    }
  ]
}
```

---

## Resume Endpoints

### POST /api/resumes/upload

Upload a resume file.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: File (PDF or DOCX)
- `jd_id`: UUID (job description ID)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "jd_id": "uuid",
    "file_url": "https://...",
    "file_name": "resume.pdf",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Status Codes:**
- 200: Success
- 400: Invalid file format (must be PDF or DOCX)
- 413: File too large (>10MB)
- 401: Unauthorized

---

### GET /api/resumes

Get all resumes for current user.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit`: Number of records (default: 10)
- `offset`: Number of records to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "file_name": "resume.pdf",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 5
}
```

---

### GET /api/resumes/{id}

Get specific resume by ID.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "jd_id": "uuid",
    "file_url": "https://...",
    "extracted_text": "...",
    "file_name": "resume.pdf",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### DELETE /api/resumes/{id}

Delete a resume.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true
}
```

---

## Analysis Endpoints

### POST /api/analyze-resume

Analyze resume against job description.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "resumeText": "Resume content...",
  "jobDescription": "Job description content...",
  "resume_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "match_score": 85,
    "ats_score": 92,
    "strengths": [
      "Strong technical background",
      "Relevant experience"
    ],
    "weaknesses": [
      "Limited leadership experience"
    ],
    "missing_skills": [
      "Kubernetes",
      "GraphQL"
    ],
    "suggestions": [
      "Add more quantifiable metrics",
      "Include more project details"
    ]
  }
}
```

**Status Codes:**
- 200: Success
- 400: Invalid input
- 503: AI service unavailable

---

## Report Endpoints

### GET /api/reports

Get all reports for current user.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit`: Number of records (default: 10)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "resume_id": "uuid",
      "match_score": 85,
      "ats_score": 92,
      "strengths": [...],
      "weaknesses": [...],
      "missing_skills": [...],
      "suggestions": [...],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 10
}
```

---

### GET /api/reports/{id}

Get specific report by ID.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "resume_id": "uuid",
    "match_score": 85,
    "ats_score": 92,
    "strengths": [...],
    "weaknesses": [...],
    "missing_skills": [...],
    "suggestions": [...],
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### POST /api/reports/{id}/download

Download report as PDF or JSON.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `format`: "pdf" or "json" (default: "json")

**Response:**
```
File download (application/pdf or application/json)
```

---

## Admin Endpoints

### GET /api/admin/users

Get all users (admin only).

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### DELETE /api/admin/users/{id}

Delete user (admin only).

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true
}
```

---

### GET /api/admin/analytics

Get platform analytics (admin only).

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalResumes": 450,
    "totalReports": 400,
    "avgMatchScore": 78,
    "avgAtsScore": 84
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_INPUT` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | User not authenticated |
| `FORBIDDEN` | 403 | User lacks permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

---

## Rate Limiting

API endpoints are rate limited:

- **Regular Users**: 100 requests/minute
- **Admin Users**: 1000 requests/minute
- **File Upload**: 10 MB/second

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1704067200
```

---

## Pagination

List endpoints support pagination:

```
GET /api/resumes?limit=10&offset=20
```

**Response includes:**
```json
{
  "data": [...],
  "pagination": {
    "limit": 10,
    "offset": 20,
    "total": 150,
    "pages": 15
  }
}
```

---

Last Updated: December 2024
