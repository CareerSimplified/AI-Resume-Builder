# Deployment Guide

## Deployment Platforms

The Resume Analyzer application can be deployed to multiple platforms:

1. **Vercel** (Recommended)
2. **AWS** 
3. **Docker** (Self-hosted)
4. **Railway**
5. **Heroku** (Legacy)

---

## Deploy to Vercel (Recommended)

Vercel is the easiest deployment option as it's optimized for Next.js.

### Step 1: Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select "Import Git Repository"
4. Paste your GitHub repo URL
5. Select Import

### Step 3: Configure Environment Variables

In Vercel Project Settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=https://yourapp.vercel.app
NODE_ENV=production
```

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Access your app at `https://yourapp.vercel.app`

### Auto-deployments

Any push to `main` branch automatically deploys.

### Rollback

```bash
vercel rollback
```

---

## Deploy to AWS

### Prerequisites

- AWS Account
- AWS CLI installed and configured
- Docker installed

### Option A: AWS App Runner (Easiest)

```bash
# 1. Build Docker image
docker build -t resume-analyzer .

# 2. Push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin [YOUR_ECR_URI]
docker tag resume-analyzer:latest [YOUR_ECR_URI]:latest
docker push [YOUR_ECR_URI]:latest

# 3. Create App Runner service
aws apprunner create-service \
  --service-name resume-analyzer \
  --source-configuration ImageRepository='{ImageIdentifier=[YOUR_ECR_URI]:latest,ImageRepositoryType=ECR}'
```

### Option B: AWS Amplify

```bash
# 1. Install Amplify CLI
npm install -g @aws-amplify/cli

# 2. Initialize Amplify
amplify init

# 3. Add hosting
amplify add hosting

# 4. Publish
amplify publish
```

### Option C: EC2 + RDS

1. Launch EC2 instance (Ubuntu 20.04)
2. Install Node.js & npm
3. Clone repository
4. Install dependencies
5. Configure environment variables
6. Start application with PM2
7. Setup nginx reverse proxy

```bash
# On EC2 instance
sudo apt update && sudo apt install -y nodejs npm nginx
git clone [your-repo]
cd air-resume-analyser
npm install
npm run build
npm install -g pm2
pm2 start npm --name "resume-analyzer" -- start
pm2 startup
pm2 save
```

---

## Docker Deployment

### Create Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build Next.js
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### Create .dockerignore

```
.git
node_modules
.next
.env
.env.local
.vercel
.DS_Store
```

### Build & Run

```bash
# Build image
docker build -t resume-analyzer:latest .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  -e SUPABASE_SERVICE_ROLE_KEY=your_key \
  resume-analyzer:latest
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}
      NEXT_PUBLIC_APP_URL: ${NEXT_PUBLIC_APP_URL}
      NODE_ENV: production
    restart: unless-stopped
```

```bash
docker-compose up -d
```

---

## Environment Variables for Production

### Critical Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production

# Optional: AI Service
NEXT_PUBLIC_AI_API_URL=https://api.openai.com/v1
AI_API_KEY=sk-...
```

### Security Best Practices

1. **Never commit `.env.local`** to repository
2. Use secret management (Vercel, AWS Secrets Manager)
3. Rotate API keys regularly
4. Use different keys for dev/prod/staging
5. Enable HTTPS everywhere
6. Set CSP headers
7. Enable CORS carefully

---

## Database Deployment on Supabase

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Set region (closest to your users)
4. Wait for project initialization (2-3 minutes)

### Step 2: Run SQL Migrations

1. Go to Project → SQL Editor
2. Run all SQL from `docs/DATABASE_SCHEMA.md`
3. Verify all tables created successfully

### Step 3: Configure Storage

1. Go to Project → Storage
2. Create bucket named `resumes` (public)
3. Enable RLS policies

### Step 4: Configure Authentication

1. Go to Project → Authentication → Providers
2. Enable Email/Password
3. Enable Google OAuth (optional)
4. Configure redirect URLs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`

---

## SSL Certificate Setup

### For Vercel
- Automatic ✅

### For AWS/Docker
Use Let's Encrypt with certbot:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com
sudo certbot renew --dry-run  # Test renewal
```

---

## Monitoring & Logging

### Vercel Analytics

1. Dashboard → Settings → Analytics
2. View performance metrics
3. Monitor function execution time

### Error Tracking

Add error monitoring (optional):

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Application Logging

Logs automatically sent to Vercel:

```bash
vercel logs your-app-name
```

---

## Performance Optimization

### Build Optimization

```bash
npm run build
# Check output size
du -sh .next

# Analyze bundle
npm install @next/bundle-analyzer
```

### Image Optimization

Already configured in Next.js, but ensure:

```typescript
import Image from 'next/image'

// Always specify dimensions
<Image src="/image.jpg" width={400} height={300} />
```

### Database Query Optimization

See `docs/DATABASE_SCHEMA.md` for indexes.

---

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npm run type-check
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
```

---

## Backup & Disaster Recovery

### Database Backups

**Supabase automatic backups:**
- Daily backups kept for 7 days
- Weekly backups kept for 4 weeks
- Monthly backups kept for 12 months

**Manual backup:**

```bash
# Export database
supabase db pull > backup-$(date +%Y%m%d).sql

# Import database
supabase db push < backup-20240101.sql
```

### Code Backup

```bash
# Create backup branch
git checkout -b backup-prod-$(date +%Y%m%d)
git push origin backup-prod-$(date +%Y%m%d)
```

---

## Troubleshooting Deployment

### Build Fails

```bash
# Check logs
vercel logs --tail

# Test build locally
npm run build
npm start
```

### Runtime Errors

```bash
# Check environment variables
vercel env list

# View logs
vercel logs --tail
```

### Database Connection Issues

```bash
# Test Supabase connection
npm install @supabase/supabase-js

# Check credentials
echo $NEXT_PUBLIC_SUPABASE_URL
```

---

## Post-Deployment Checklist

- [ ] Test all pages load correctly
- [ ] Test authentication flows (email, Google)
- [ ] Test file uploads
- [ ] Test database operations
- [ ] Check mobile responsiveness
- [ ] Enable monitoring/logging
- [ ] Configure domain/DNS
- [ ] Setup SSL certificate
- [ ] Test payment (if applicable)
- [ ] Configure email notifications
- [ ] Setup backup strategy
- [ ] Monitor error rates
- [ ] Test admin features
- [ ] Update DNS records
- [ ] Configure CDN (optional)

---

Last Updated: December 2024
