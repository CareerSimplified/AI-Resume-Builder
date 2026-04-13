# Resume Analyzer SaaS - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Setup & Installation](#setup--installation)
5. [Configuration](#configuration)
6. [Authentication](#authentication)
7. [Database Schema](#database-schema)
8. [API Routes](#api-routes)
9. [Components](#components)
10. [User Flow](#user-flow)
11. [Admin Features](#admin-features)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)

---

## Project Overview

Resume Analyzer is a production-ready SaaS web application that helps job seekers optimize their resumes using AI-powered analysis. The platform matches resumes against job descriptions and provides detailed insights on:

- **Match Score**: How well your resume matches the job
- **ATS Score**: Applicant Tracking System compatibility
- **Strengths**: What's working well in your resume
- **Weaknesses**: Areas for improvement
- **Missing Skills**: Required skills not mentioned in resumeResume
- **Suggestions**: Actionable recommendations

### Key Features

✅ User Authentication (Email/Password + Google OAuth)
✅ Job Description Management
✅ Resume Upload & Parsing (PDF/DOCX)
✅ AI-Powered Analysis
✅ Detailed Analytics Reports
✅ Download Reports
✅ Admin Dashboard with Platform Analytics
✅ Responsive Design (Mobile & Desktop)
✅ Professional UI with Tailwind CSS
✅ Role-Based Access Control

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15+ (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **Authentication** | Supabase Auth + Google OAuth |
| **Database** | PostgreSQL (via Supabase) |
| **Storage** | Supabase Storage (for PDFs/DOCX) |
| **UI Components** | Custom + Lucide React Icons |
| **Notifications** | React Hot Toast |
| **State Management** | React Hooks + Zustand (Optional) |
| **API Client** | @supabase/supabase-js |
| **Form Handling** | React Form Hooks |
| **PDF Processing** | PDF.js |

---

## Project Structure

```
air-resume-analyser/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx           # Login page
│   │   ├── signup/page.tsx          # Sign up page
│   │   └── callback/page.tsx        # OAuth callback
│   ├── dashboard/
│   │   ├── page.tsx                 # Main dashboard
│   │   ├── create-jd/page.tsx       # Create job description
│   │   ├── upload-resume/page.tsx   # Upload resume
│   │   ├── my-resumes/page.tsx      # View all resumes
│   │   ├── reports/page.tsx         # View reports
│   │   └── settings/page.tsx        # User settings
│   ├── admin/
│   │   ├── page.tsx                 # Admin dashboard
│   │   ├── users/page.tsx           # Manage users
│   │   └── resumes/page.tsx         # Manage resumes
│   ├── api/
│   │   ├── analyze-resume/route.ts  # Resume analysis endpoint
│   │   └── admin/analytics/route.ts # Analytics endpoint
│   ├── layout.tsx                   # Root layout with Toaster
│   ├── page.tsx                     # Landing page
│   └── globals.css                  # Global styles
│
├── components/
│   ├── Button.tsx                   # Button component
│   ├── Card.tsx                     # Card component
│   ├── Form.tsx                     # Form inputs (Input, TextArea, Select)
│   ├── Sidebar.tsx                  # Sidebar + Mobile drawer
│   ├── DashboardLayout.tsx          # Dashboard layout wrapper
│   ├── Navbar.tsx                   # Landing page navbar
│   ├── Loading.tsx                  # Loading skeletons
│   └── UI.tsx                       # Badge, Alert, ProgressBar
│
├── lib/
│   ├── supabase.ts                  # Supabase client
│   └── supabase-admin.ts            # Admin Supabase client
│
├── services/
│   ├── auth.service.ts              # Authentication functions
│   ├── database.service.ts          # Database operations
│   ├── file.service.ts              # File upload & parsing
│   └── ai.service.ts                # AI analysis
│
├── hooks/
│   ├── useAuth.ts                   # Auth hooks
│   └── useToast.ts                  # Toast notifications
│
├── types/
│   └── index.ts                     # TypeScript types
│
├── utils/
│   └── (utility functions)
│
├── docs/
│   ├── INDEX.md                     # This file
│   ├── DATABASE_SCHEMA.md           # Database setup
│   ├── API_DOCUMENTATION.md         # API reference
│   └── DEPLOYMENT.md                # Deployment guide
│
├── middleware.ts                    # Route protection middleware
├── .env.local.example               # Environment variables template
├── package.json                     # Dependencies
├── tailwind.config.ts               # Tailwind configuration
├── tsconfig.json                    # TypeScript configuration
└── next.config.ts                   # Next.js configuration

```

---

## Setup & Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google OAuth credentials (optional, for Google login)

### Step 1: Clone & Install

```bash
cd air-resume-analyser
npm install
```

### Step 2: Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://nwsweqmpklpymrnvoicx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Optional: AI API Configuration
NEXT_PUBLIC_AI_API_URL=
AI_API_KEY=
```

### Step 3: Create Database Tables

Run the SQL migrations in your Supabase dashboard:

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for complete SQL setup.

### Step 4: Configure Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Create OAuth 2.0 credentials
4. Add redirect URI: `https://[your-supabase-domain].supabase.co/auth/v1/callback`
5. Update Supabase Auth settings with OAuth credentials

### Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Configuration

### Tailwind CSS

Colors are defined in `tailwind.config.ts`:

```typescript
colors: {
  primary: '#2563eb',
  'primary-hover': '#1d4ed8',
  'light-gray': '#f3f4f6',
  'dark-gray': '#6b7280',
  'border-gray': '#e5e7eb',
}
```

### Supabase Configuration

Supabase clients are configured in `lib/`:

- **`supabase.ts`**: Client-side Supabase (public key)
- **`supabase-admin.ts`**: Server-side Supabase (service role key)

---

## Authentication

### Email/Password Flow

1. User signs up with email and password
2. Supabase sends verification email
3. User logs in after verification
4. User data saved to `users` table
5. Session persisted via Supabase session cookie

### Google OAuth Flow

1. User clicks "Sign in with Google"
2. Redirected to Google login
3. Callback to `/auth/callback`
4. Session established
5. User redirected to dashboard

### Protected Routes

Middleware checks user authentication and role:

```typescript
// /dashboard/* → Requires authentication
// /admin/* → Requires admin role
// /auth/* → Redirects to dashboard if logged in
```

---

## Database Schema

### Users Table

```sql
create table public.users (
  id uuid primary key references auth.users,
  email text not null unique,
  name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default now()
);
```

### Job Descriptions Table

```sql
create table public.job_descriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users,
  title text not null,
  company text not null,
  skills text[] not null,
  experience text not null,
  description text not null,
  created_at timestamp with time zone default now()
);
```

### Resumes Table

```sql
create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users,
  jd_id uuid not null references public.job_descriptions,
  file_url text not null,
  extracted_text text not null,
  file_name text not null,
  created_at timestamp with time zone default now()
);
```

### Reports Table

```sql
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes,
  user_id uuid not null references public.users,
  jd_id uuid not null references public.job_descriptions,
  match_score integer not null,
  ats_score integer not null,
  strengths text[] not null,
  weaknesses text[] not null,
  missing_skills text[] not null,
  suggestions text[] not null,
  created_at timestamp with time zone default now()
);
```

---

## API Routes

### Resume Analysis

```
POST /api/analyze-resume
Content-Type: application/json

{
  "resumeText": "string",
  "jobDescription": "string"
}

Response:
{
  "analysis": {
    "match_score": 85,
    "ats_score": 92,
    "strengths": ["string"],
    "weaknesses": ["string"],
    "missing_skills": ["string"],
    "suggestions": ["string"]
  }
}
```

### Admin Analytics

```
GET /api/admin/analytics

Response:
{
  "totalUsers": 150,
  "totalResumes": 450,
  "totalReports": 400
}
```

---

## Components

### Button

```typescript
<Button 
  variant="primary" // primary | secondary | danger
  size="md"  // sm | md | lg
  loading={isLoading}
  fullWidth
>
  Submit
</Button>
```

### Card

```typescript
<Card>
  <CardHeader title="Title" subtitle="Subtitle" />
  <CardBody>
    Content here
  </CardBody>
</Card>
```

### Form Inputs

```typescript
<Input 
  label="Name" 
  type="text" 
  error="Error message"
  helperText="Helper text"
/>

<TextArea 
  label="Description" 
  rows={5}
/>

<Select 
  label="Option"
  options={[{ value: '1', label: 'Option 1' }]}
/>
```

### Sidebar

```typescript
<Sidebar 
  items={sidebarItems}
  isOpen={isOpen}
  onClose={handleClose}
  isMobile={true}
/>
```

---

## User Flow

### Step 1: Authentication

```
Landing Page → Sign Up → Email Verification → Login → Dashboard
      ↓
   Login → Dashboard
      ↓
   Google OAuth → Dashboard
```

### Step 2: Create Job Description

```
Dashboard → Create JD → Fill Form → Save → Upload Resume Screen
```

### Step 3: Upload Resume

```
Upload Resume → Select JD → Choose File → Extract Text → Upload to Storage → Save to DB
```

### Step 4: AI Analysis

```
Resume Uploaded → Trigger AI Analysis → Store Results → Generate Report
```

### Step 5: View Reports

```
Reports Page → View Score → See Details → Download Report
```

---

## Admin Features

### Admin Dashboard

- **Total Users**: Count of all non-admin users
- **Total Resumes**: Count of all uploaded resumes
- **Total Reports**: Count of all generated reports

### User Management

- View all users
- Delete users
- View user stats

### Resume Management

- View all resumes
- Delete resumes
- View file info

### Authorization

Admin role is checked via middleware. Users cannot access `/admin/*` routes without admin role.

---

## Styling & Theming

### Color Scheme

**Light Theme (Professional SaaS)**

- **Primary**: #2563eb (Blue)
- **Background**: #f3f4f6 (Light Gray)
- **Cards**: #ffffff (White)
- **Text**: #111827 (Dark Gray)
- **Borders**: #e5e7eb (Border Gray)

### Responsive Design

Uses Tailwind CSS breakpoints:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

Mobile-first approach with hidden desktop elements on mobile.

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

### Build Command

```bash
npm run build
```

### Start Command

```bash
npm start
```

---

## Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution**: Ensure all environment variables are set in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Issue: "Cannot extract PDF text"

**Solution**: Ensure PDF.js worker is properly configured in `services/file.service.ts`

### Issue: "Authentication fails"

**Solution**: 
1. Check Supabase project settings
2. Verify OAuth redirect URI
3. Check browser cookies enabled

### Issue: "Resume upload fails"

**Solution**:
1. Check Supabase Storage bucket exists
2. Verify bucket permissions
3. Check file size < 10MB

### Issue: "Admin routes return 404"

**Solution**: Ensure user has `admin` role in `users` table

---

## Future Enhancements

- [ ] Integration with real AI services (OpenAI, Claude)
- [ ] Resume templates
- [ ] Batch resume upload
- [ ] Email notifications
- [ ] Interview preparation module
- [ ] Job recommendations
- [ ] Team collaboration
- [ ] Multi-language support
- [ ] Export to PDF
- [ ] Browser extension

---

## Support & Contributing

For issues or contributions, please visit the project repository or contact support.

---

**Last Updated**: December 2024
**Version**: 1.0.0
**License**: MIT
