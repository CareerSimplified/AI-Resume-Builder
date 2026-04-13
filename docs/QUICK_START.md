# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free)

---

## Step 1: Setup Supabase (2 min)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings → API**
4. Copy:
   - `Project URL`
   - `anon` key
   - `service_role` key

---

## Step 2: Clone & Install (1 min)

```bash
# Clone repository
git clone <your-repo-url>
cd air-resume-analyser

# Install dependencies
npm install
```

---

## Step 3: Configure Environment

```bash
# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your Supabase credentials
nano .env.local  # or use your editor
```

**Add to `.env.local`:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## Step 4: Setup Database (1 min)

1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Create new query
4. Copy all SQL from `docs/DATABASE_SCHEMA.md`
5. Run the query
6. Wait for completion ✅

---

## Step 5: Run Application (1 min)

```bash
# Start development server
npm run dev

# Open browser
# Visit: http://localhost:3000
```

✅ **You're done!** App is running locally.

---

## First Steps

1. **Create an account**: Click "Sign Up" on landing page
2. **Create a Job Description**: Click "Create JD" 
3. **Upload Resume**: Click "Upload Resume"
4. **View Report**: See analysis results
5. **Download Report**: Export as PDF or JSON

---

## Next: Deploy to Production

Ready to go live? See [DEPLOYMENT.md](./DEPLOYMENT.md)

**Recommended: Deploy to Vercel** (5 minutes)

```bash
# 1. Push to GitHub
git push origin main

# 2. Go to vercel.com and import your GitHub repo
# 3. Add environment variables in Vercel dashboard
# 4. Deploy!

# Your app is now live at: https://your-app.vercel.app
```

---

## Troubleshooting

### Port 3000 already in use?

```bash
npm run dev -- -p 3001
# App runs on http://localhost:3001
```

### Missing database tables?

*Make sure you ran all SQL migrations in step 4.*

### Authentication not working?

*Check environment variables are correct in `.env.local`*

### Can't upload files?

*Verify Supabase storage bucket named `resumes` exists*

---

## Documentation

- 📖 **Full Docs**: `docs/INDEX.md`
- 🗄️ **Database**: `docs/DATABASE_SCHEMA.md`
- 📡 **API**: `docs/API_DOCUMENTATION.md`
- 🚀 **Deployment**: `docs/DEPLOYMENT.md`

---

## Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review documentation
3. Check Supabase logs
4. Open GitHub issue

---

**Total setup time: ~5 minutes**

Start building! 🎉
