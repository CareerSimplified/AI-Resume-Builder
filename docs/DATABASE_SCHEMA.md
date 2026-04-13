# Database Schema & Setup Guide

## Complete SQL Setup

Copy and run all of these SQL queries in your Supabase SQL Editor (Database > SQL Editor).

### 1. Enable UUID Extension

```sql
create extension if not exists "uuid-ossp";
```

### 2. Create Users Table

```sql
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Add RLS policies
alter table public.users enable row level security;

create policy "Users can read their own data"
  on public.users for select
  using (auth.uid () = id or (select role from public.users where id = auth.uid()) = 'admin');

create policy "Users can update their own data"
  on public.users for update
  using (auth.uid () = id);

-- Create index
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_role on public.users(role);
```

### 3. Create Job Descriptions Table

```sql
create table if not exists public.job_descriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  company text not null,
  skills text[] not null default array[]::text[],
  experience text not null check (experience in ('entry', 'mid', 'senior', 'lead', 'executive')),
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Add RLS policies
alter table public.job_descriptions enable row level security;

create policy "Users can read their own job descriptions"
  on public.job_descriptions for select
  using (auth.uid () = user_id or (select role from public.users where id = auth.uid()) = 'admin');

create policy "Users can create job descriptions"
  on public.job_descriptions for insert
  with check (auth.uid () = user_id);

create policy "Users can update their own job descriptions"
  on public.job_descriptions for update
  using (auth.uid () = user_id);

create policy "Users can delete their own job descriptions"
  on public.job_descriptions for delete
  using (auth.uid () = user_id);

-- Create indexes
create index if not exists idx_job_descriptions_user_id on public.job_descriptions(user_id);
create index if not exists idx_job_descriptions_created_at on public.job_descriptions(created_at);
```

### 4. Create Resumes Table

```sql
create table if not exists public.resumes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  jd_id uuid not null references public.job_descriptions(id) on delete cascade,
  file_url text not null,
  extracted_text text not null,
  file_name text not null,
  file_size integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Add RLS policies
alter table public.resumes enable row level security;

create policy "Users can read their own resumes"
  on public.resumes for select
  using (auth.uid () = user_id or (select role from public.users where id = auth.uid()) = 'admin');

create policy "Users can create resumes"
  on public.resumes for insert
  with check (auth.uid () = user_id);

create policy "Users can delete their own resumes"
  on public.resumes for delete
  using (auth.uid () = user_id);

-- Create indexes
create index if not exists idx_resumes_user_id on public.resumes(user_id);
create index if not exists idx_resumes_jd_id on public.resumes(jd_id);
create index if not exists idx_resumes_created_at on public.resumes(created_at);
```

### 5. Create Reports Table

```sql
create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  jd_id uuid not null references public.job_descriptions(id) on delete cascade,
  match_score integer not null check (match_score >= 0 and match_score <= 100),
  ats_score integer not null check (ats_score >= 0 and ats_score <= 100),
  strengths text[] not null default array[]::text[],
  weaknesses text[] not null default array[]::text[],
  missing_skills text[] not null default array[]::text[],
  suggestions text[] not null default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Add RLS policies
alter table public.reports enable row level security;

create policy "Users can read their own reports"
  on public.reports for select
  using (auth.uid () = user_id or (select role from public.users where id = auth.uid()) = 'admin');

create policy "Users can create reports"
  on public.reports for insert
  with check (auth.uid () = user_id);

create policy "Users can delete their own reports"
  on public.reports for delete
  using (auth.uid () = user_id);

-- Create indexes
create index if not exists idx_reports_user_id on public.reports(user_id);
create index if not exists idx_reports_resume_id on public.reports(resume_id);
create index if not exists idx_reports_jd_id on public.reports(jd_id);
create index if not exists idx_reports_created_at on public.reports(created_at);
```

### 6. Setup Storage Bucket

```sql
-- Run in Supabase Storage settings or via SQL:
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', true)
on conflict do nothing;

-- Create policy for resumesucket
create policy "Public Access" 
  on storage.objects 
  for select 
  using (bucket_id = 'resumes');

create policy "Users can upload resumes"
  on storage.objects
  for insert
  with check (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their resumes"
  on storage.objects
  for delete
  using (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);
```

### 7. Create Admin User (Setup)

```sql
-- First create a user via the UI
-- Then set their role to 'admin'
update public.users
set role = 'admin'
where email = 'admin@example.com';
```

---

## Data Relationships

```
users (1) ──→ (many) job_descriptions
users (1) ──→ (many) resumes
job_descriptions (1) ──→ (many) resumes
resumes (1) ──→ (1) reports
users (1) ──→ (many) reports
job_descriptions (1) ──→ (many) reports
```

---

## Table Descriptions

### users
- **Storage**: User authentication data
- **Purpose**: Store user profiles and roles
- **RLS**: Users can only read/update their own data
- **Admin Access**: Admins can view all users

### job_descriptions
- **Storage**: Job posting details
- **Purpose**: Store job postings to match resumes against
- **RLS**: Users can only manage their own job descriptions
- **Admin Access**: Admins can view all job descriptions

### resumes
- **Storage**: Resume file references and extracted text
- **Purpose**: Store resume data for analysis
- **RLS**: Users can only manage their own resumes
- **Admin Access**: Admins can view all resumes
- **Storage**: Files stored in `resumes/` bucket

### reports
- **Storage**: Analysis results from AI service
- **Purpose**: Store resume analysis results
- **RLS**: Users can only view their own reports
- **Admin Access**: Admins can view all reports
- **Data**: Match/ATS scores, strengths, weaknesses, etc.

---

## Backup & Restore

### Backup Database

```sql
-- Via Supabase dashboard: Project Settings > Database > Backups
-- Weekly automated backups are created
```

### Restore Database

```sql
-- Download backup from dashboard and restore via Supabase CLI
supabase db pull < backup.sql
```

---

## Performance Optimization

### Indexes Created

- `idx_users_email` - Quick email lookup
- `idx_users_role` - Filter users by role
- `idx_job_descriptions_user_id` - User's job descriptions
- `idx_job_descriptions_created_at` - Recent job descriptions
- `idx_resumes_user_id` - User's resumes
- `idx_resumes_jd_id` - Resumes for specific job
- `idx_resumes_created_at` - Recent resumes
- `idx_reports_user_id` - User's reports
- `idx_reports_resume_id` - Reports for specific resume
- `idx_reports_jd_id` - Reports for specific job

### Query Optimization Tips

1. Always filter by `user_id` for faster queries
2. Use indexes on frequently queried columns
3. Limit results with pagination
4. Cache frequently accessed data

---

## Monitoring

### Check Table Sizes

```sql
select
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
from pg_tables
where schemaname not in ('pg_catalog', 'information_schema')
order by pg_total_relation_size(schemaname||'.'||tablename) desc;
```

### Check Row Counts

```sql
select count(*) from public.users;
select count(*) from public.resumes;
select count(*) from public.reports;
```

---

## Troubleshooting

### Issue: RLS Policies Not Working

**Solution**: Ensure policies are enabled and check policy syntax in dashboard.

### Issue: Foreign Key Violations

**Solution**: Ensure referenced records exist before inserting child records.

### Issue: Slow Queries

**Solution**: Check indexes, enable query caching, optimize queries with EXPLAIN.

---

Last Updated: December 2024
