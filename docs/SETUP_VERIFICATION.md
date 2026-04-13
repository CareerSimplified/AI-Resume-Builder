# Setup and Verification Guide

## Quick Setup Checklist

Follow these steps to get your Resume Analyzer up and running:

### ✅ Pre-Setup (10 minutes)

- [ ] Node.js 18+ installed
- [ ] npm/yarn/pnpm installed
- [ ] Git installed (if cloning)
- [ ] Code editor ready (VS Code recommended)

### ✅ Supabase Setup (15 minutes)

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for free account
   - Create new project

2. **Get Supabase Credentials**
   - Go to Project Settings > API
   - Copy these values:
     - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
     - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`

3. **Run Database Setup**
   - Go to SQL Editor in Supabase dashboard
   - Copy entire contents of `docs/DATABASE_SETUP.sql`
   - Paste and click "Run"
   - Verify success (should see "Success. No rows returned")

4. **Create Storage Bucket**
   - Go to Storage in Supabase dashboard
   - Click "New Bucket"
   - Name: `resumes`
   - Public: **No** (keep it private)
   - File size limit: `10485760` (10MB)
   - Click "Create bucket"
   
   OR run this SQL (included in DATABASE_SETUP.sql):
   ```sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('resumes', 'resumes', false)
   ON CONFLICT (id) DO NOTHING;
   ```

5. **Set Storage Policies** (included in DATABASE_SETUP.sql)
   - The SQL file automatically creates policies for:
     - Upload access for authenticated users
     - Read access for authenticated users
     - Delete access for authenticated users

### ✅ Google OAuth Setup (10 minutes)

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing
   - Name it something like "Resume Analyzer"

2. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

3. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: **Web application**
   - Name: "Resume Analyzer"
   - Add authorized redirect URI:
     ```
     https://your-project-id.supabase.co/auth/v1/callback
     ```
     (Replace `your-project-id` with your actual Supabase project ID)
   - Click "Create"
   - Copy the **Client ID** and **Client Secret**

4. **Configure Supabase Google Provider**
   - Go to Supabase Dashboard > Authentication > Providers
   - Find "Google" and click it
   - Toggle "Enable Sign in with Google"
   - Paste your **Client ID** and **Client Secret**
   - Click "Save"

### ✅ Google Gemini API Setup (5 minutes)

1. **Get Gemini API Key**
   - Go to [Google AI Studio](https://aistudio.google.com/)
   - Sign in with Google account
   - Click "Get API key"
   - Create new API key
   - Copy the key

2. **Alternative: Use Mock Analysis**
   - If you don't want to set up Gemini API yet
   - The app will fallback to mock analysis automatically
   - Just leave `NEXT_PUBLIC_GEMINI_API_KEY` empty or unset

### ✅ Environment Variables (2 minutes)

1. **Create `.env.local` file**
   - In project root directory
   - Copy this template:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI Configuration (Google Gemini)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

2. **Replace placeholder values**
   - Use the credentials you copied earlier
   - Save the file

### ✅ Install & Run (3 minutes)

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   - Go to `http://localhost:3000`
   - You should see the landing page

### ✅ Create Admin User (2 minutes)

1. **Sign Up as Regular User**
   - Go to `http://localhost:3000/auth/signup`
   - Create account with your email
   - Verify email if required

2. **Make Yourself Admin**
   - Go to Supabase Dashboard > SQL Editor
   - Run this query:
     ```sql
     UPDATE users 
     SET role = 'admin' 
     WHERE email = 'your-email@example.com';
     ```
   - Replace with your actual email
   - Click "Run"

3. **Verify Admin Access**
   - Logout from the app
   - Login again
   - You should be redirected to `/admin` dashboard
   - If not, manually go to `http://localhost:3000/admin`

## Verification Checklist

### ✅ Landing Page
- [ ] Can access `http://localhost:3000`
- [ ] See hero section with title and CTA buttons
- [ ] See features section (8 cards)
- [ ] See "How It Works" section (4 steps)
- [ ] See testimonials section
- [ ] See footer with links
- [ ] "Get Started Free" button works
- [ ] "Learn More" button scrolls to features

### ✅ Authentication
- [ ] Can access `/auth/signup`
- [ ] Email/password signup form works
- [ ] Can create new account
- [ ] Can access `/auth/login`
- [ ] Email/password login works
- [ ] Google login button visible (if configured)
- [ ] After login, redirected to `/dashboard`
- [ ] Session persists on page refresh
- [ ] Logout button works
- [ ] After logout, redirected to `/auth/login`

### ✅ User Dashboard
- [ ] Can access `/dashboard` after login
- [ ] See welcome message with name
- [ ] See statistics (resumes, JDs, reports)
- [ ] See quick action buttons
- [ ] See recent resumes list (if any)
- [ ] Sidebar navigation works
- [ ] Sidebar collaps/expand works (desktop)
- [ ] Mobile menu works (mobile view)
- [ ] User profile shows in sidebar
- [ ] Logout button works

### ✅ Job Description Creation
- [ ] Can access `/dashboard/create-jd`
- [ ] Form shows all fields:
  - [ ] Job Title
  - [ ] Company Name
  - [ ] Required Skills
  - [ ] Experience Level (dropdown)
  - [ ] Job Description (textarea)
- [ ] Can submit form
- [ ] Success message appears
- [ ] Redirected to upload resume page
- [ ] Validation works (required fields)
- [ ] Can cancel and go back to dashboard

### ✅ Resume Upload
- [ ] Can access `/dashboard/upload-resume`
- [ ] Job description dropdown shows (if JDs exist)
- [ ] Drag & drop zone visible
- [ ] Click to browse files works
- [ ] File validation works:
  - [ ] Rejects invalid file types
  - [ ] Rejects files > 10MB
  - [ ] Accepts PDF files
  - [ ] Accepts DOCX files
- [ ] Selected file name shows
- [ ] Can submit upload
- [ ] Upload progress shows
- [ ] Success message appears
- [ ] Redirected to report page
- [ ] Report generated successfully

### ✅ Reports
- [ ] Can access `/dashboard/reports`
- [ ] Reports list shows (if any exist)
- [ ] Empty state shows if no reports
- [ ] Each report shows:
  - [ ] Match Score with progress bar
  - [ ] ATS Score with progress bar
  - [ ] Strengths count
  - [ ] Weaknesses count
  - [ ] Date/time
- [ ] "View Full Report" button works
- [ ] "Download" button works
- [ ] Can access individual report at `/dashboard/reports/[id]`
- [ ] Full report shows:
  - [ ] Match Score (large, colored)
  - [ ] ATS Score (large, colored)
  - [ ] Strengths list (green cards)
  - [ ] Weaknesses list (red cards)
  - [ ] Missing Skills (tags)
  - [ ] Suggestions (numbered list)
- [ ] "Copy" button copies report to clipboard
- [ ] "Download" button downloads text file
- [ ] "Back" button returns to reports list

### ✅ My Resumes Page
- [ ] Can access `/dashboard/my-resumes`
- [ ] Resumes list shows (if any exist)
- [ ] Each resume shows:
  - [ ] File name
  - [ ] Upload date
  - [ ] Analysis status
  - [ ] View report button
- [ ] Empty state shows if no resumes
- [ ] Can delete resume (with confirmation)

### ✅ Settings Page
- [ ] Can access `/dashboard/settings`
- [ ] User profile information shows
- [ ] Can update profile (if implemented)
- [ ] Can change password (if implemented)

### ✅ Admin Dashboard
- [ ] Can access `/admin` (admin only)
- [ ] See platform statistics:
  - [ ] Total Users
  - [ ] Total Resumes
  - [ ] Total Reports
- [ ] Non-admin users redirected
- [ ] Sidebar navigation works

### ✅ Admin Users Page
- [ ] Can access `/admin/users` (admin only)
- [ ] Users table shows
- [ ] Search functionality works
- [ ] Can delete user (with confirmation)
- [ ] User count shows
- [ ] Empty state if no users
- [ ] Table shows:
  - [ ] Name with avatar
  - [ ] Email
  - [ ] Role badge
  - [ ] Join date
  - [ ] Delete button

### ✅ Admin Resumes Page
- [ ] Can access `/admin/resumes` (admin only)
- [ ] Resumes table shows
- [ ] Can delete resume (with confirmation)
- [ ] Resume count shows
- [ ] Empty state if no resumes
- [ ] Table shows:
  - [ ] File name
  - [ ] User ID
  - [ ] Upload date
  - [ ] Delete button

### ✅ Admin Analytics Page
- [ ] Can access `/admin/analytics` (admin only)
- [ ] Statistics cards show:
  - [ ] Total Users
  - [ ] Total Resumes
  - [ ] Total Reports
  - [ ] Job Descriptions
- [ ] Additional insights:
  - [ ] Average resumes per user
  - [ ] Analysis rate percentage

### ✅ Responsive Design
- [ ] Landing page responsive on mobile
- [ ] Auth pages responsive on mobile
- [ ] Dashboard responsive on mobile
- [ ] Sidebar converts to drawer on mobile
- [ ] Tables scroll horizontally on mobile
- [ ] All buttons accessible on mobile
- [ ] Text readable on all screen sizes

### ✅ Error Handling
- [ ] Invalid login shows error message
- [ ] Duplicate email shows error
- [ ] Wrong password shows error
- [ ] Network errors handled gracefully
- [ ] Missing required fields show validation
- [ ] File upload errors show messages
- [ ] AI API failure falls back to mock
- [ ] Toast notifications appear

### ✅ Security
- [ ] Cannot access `/dashboard/*` without login
- [ ] Cannot access `/admin/*` without admin role
- [ ] Authenticated users redirected from `/auth/*`
- [ ] Session expires after logout
- [ ] Cannot view other users' reports
- [ ] Cannot access resumes without permission
- [ ] Storage bucket is private
- [ ] RLS policies active on all tables

## Common Issues & Solutions

### Issue: "Missing Supabase environment variables"
**Solution**: Create `.env.local` file with correct credentials

### Issue: "Failed to signup"
**Solution**: 
- Check Supabase credentials are correct
- Verify database setup SQL was run
- Check browser console for errors

### Issue: "Google login not working"
**Solution**:
- Verify Google OAuth credentials in Supabase
- Check redirect URI matches exactly
- Ensure Google+ API is enabled

### Issue: "Cannot access admin"
**Solution**:
- Run SQL to set role = 'admin' for your email
- Logout and login again
- Check users table in Supabase

### Issue: "Resume upload fails"
**Solution**:
- Verify storage bucket exists and is named 'resumes'
- Check storage policies are set correctly
- Ensure file is < 10MB
- Check file type is PDF or DOCX

### Issue: "AI analysis not working"
**Solution**:
- Verify Gemini API key is correct
- Check API key has permissions
- App will fallback to mock analysis if API fails

### Issue: "Reports not showing"
**Solution**:
- Check if resume was uploaded successfully
- Verify AI analysis completed
- Check reports table in Supabase

## Next Steps

After verification:

1. **Customize Branding**
   - Update app name in components
   - Change color scheme in Tailwind config
   - Add your logo

2. **Configure Email**
   - Set up email verification in Supabase
   - Configure email templates
   - Add password reset functionality

3. **Add More Features**
   - Email notifications
   - Resume templates
   - Batch upload
   - Export to PDF
   - Resume versioning
   - Team/collaboration features

4. **Deploy to Production**
   - Follow `docs/DEPLOYMENT.md`
   - Set production environment variables
   - Configure custom domain
   - Set up monitoring

## Support

If you encounter issues not covered here:
1. Check browser console for errors
2. Check Supabase logs
3. Review `docs/DATABASE_SCHEMA.md`
4. Create an issue on GitHub

---

Happy Resume Analyzing! 🚀
