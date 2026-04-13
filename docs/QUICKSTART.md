# 🚀 Quick Start Guide - Resume Analyzer

Get your Resume Analyzer running in **under 10 minutes**!

## Step 1: Install Dependencies (1 min)

```bash
cd D:\Air-Resume\air-resume-analyser
npm install
```

## Step 2: Setup Supabase (5 mins)

### 2.1 Create Supabase Project
1. Go to https://supabase.com
2. Sign up (free)
3. Click "New Project"
4. Fill in project details
5. Wait for project to be ready (~2 mins)

### 2.2 Get Credentials
1. Go to **Project Settings** → **API**
2. Copy these 3 values:
   ```
   Project URL → https://xxxxx.supabase.co
   anon public → eyJhbGc...
   service_role → eyJhbGc... (keep secret!)
   ```

### 2.3 Setup Database
1. Go to **SQL Editor** in Supabase
2. Click "New Query"
3. Open file: `docs/DATABASE_SETUP.sql`
4. Copy ALL the SQL code
5. Paste into Supabase SQL Editor
6. Click **"Run"**
7. Verify success message

### 2.4 Create Storage Bucket
The SQL script creates this automatically, but to verify:
1. Go to **Storage** in Supabase
2. You should see a bucket named `resumes`
3. If not created, create manually:
   - Name: `resumes`
   - Public: **No**
   - File size limit: `10485760` (10MB)

## Step 3: Setup Google OAuth (3 mins)

### 3.1 Create Google Cloud Project
1. Go to https://console.cloud.google.com
2. Click project dropdown → **"New Project"**
3. Name it "Resume Analyzer"
4. Click **Create**

### 3.2 Enable Google+ API
1. Go to **APIs & Services** → **Library**
2. Search "Google+ API"
3. Click **Enable**

### 3.3 Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: "Resume Analyzer"
5. Add **Authorized redirect URI**:
   ```
   https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
   ```
   (Replace YOUR-PROJECT-ID with actual Supabase project ID)
6. Click **Create**
7. Copy **Client ID** and **Client Secret**

### 3.4 Configure Supabase
1. Go to Supabase → **Authentication** → **Providers**
2. Find **Google** → Click it
3. Toggle **Enable Sign in with Google**
4. Paste **Client ID** and **Client Secret**
5. Click **Save**

## Step 4: Get Gemini API Key (1 min)

1. Go to https://aistudio.google.com
2. Sign in with Google account
3. Click **Get API key**
4. Click **Create API key**
5. Copy the key

**Note**: This is optional! The app will use mock analysis if not set.

## Step 5: Create .env.local (1 min)

Create file `.env.local` in project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI Configuration (Google Gemini) - OPTIONAL
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

**Replace all placeholder values** with your actual credentials!

## Step 6: Run the App (30 seconds)

```bash
npm run dev
```

Open http://localhost:3000

## Step 7: Create Admin Account (1 min)

### 7.1 Signup
1. Go to http://localhost:3000/auth/signup
2. Create account with your email
3. Fill in name and password
4. Click **Sign Up**
5. You'll be redirected to dashboard

### 7.2 Make Yourself Admin
1. Go to Supabase → **SQL Editor**
2. Run this query:
   ```sql
   UPDATE users 
   SET role = 'admin' 
   WHERE email = 'YOUR-EMAIL@example.com';
   ```
3. Replace with your actual email
4. Click **Run**

### 7.3 Verify Admin Access
1. Logout from the app
2. Login again
3. Navigate to http://localhost:3000/admin
4. You should see admin dashboard!

## ✅ Verify Everything Works

### Landing Page
- [ ] http://localhost:3000 loads
- [ ] See hero section
- [ ] See features
- [ ] See "How It Works"

### Authentication
- [ ] Can signup at `/auth/signup`
- [ ] Can login at `/auth/login`
- [ ] Redirected to `/dashboard` after login
- [ ] Can logout

### User Dashboard
- [ ] See welcome message
- [ ] See sidebar with navigation
- [ ] See statistics

### Create Job Description
- [ ] Go to `/dashboard/create-jd`
- [ ] Fill in all fields
- [ ] Click **Create Job Description**
- [ ] Success message appears

### Upload Resume
- [ ] Go to `/dashboard/upload-resume`
- [ ] Select job description from dropdown
- [ ] Drag PDF file or click to browse
- [ ] Click **Upload and Analyze**
- [ ] Wait for analysis
- [ ] Redirected to report

### View Report
- [ ] See match score and ATS score
- [ ] See strengths (green)
- [ ] See weaknesses (red)
- [ ] See missing skills
- [ ] See suggestions
- [ ] Click **Copy** button
- [ ] Click **Download** button

### Admin Panel
- [ ] Go to `/admin`
- [ ] See statistics
- [ ] Go to `/admin/users`
- [ ] See users table
- [ ] Go to `/admin/analytics`
- [ ] See platform stats

## 🎉 You're Done!

Your Resume Analyzer is now fully functional!

## Common Issues

### "Missing Supabase environment variables"
**Fix**: Check `.env.local` exists and has correct values

### "Failed to signup"
**Fix**: 
- Verify database SQL was run successfully
- Check Supabase credentials are correct

### "Google login not working"
**Fix**:
- Verify redirect URI matches exactly
- Check Google credentials in Supabase

### "Cannot access admin"
**Fix**: Run the SQL query to set role='admin' for your email

### "Resume upload fails"
**Fix**:
- Check storage bucket exists
- Verify file is PDF or DOCX
- Ensure file < 10MB

## 📚 Next Steps

- Read `README.md` for full documentation
- Check `SETUP_VERIFICATION.md` for detailed verification
- See `PROJECT_SUMMARY.md` for complete feature list

## 🆘 Need Help?

1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Review `.env.local` values
4. Verify database setup completed

---

**Enjoy your Resume Analyzer! 🚀**
