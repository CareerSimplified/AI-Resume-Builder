# Air Resume Analyzer - AI-Powered Resume Analysis SaaS

A production-ready Resume Analyzer SaaS web application built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

### User Features
- **Authentication**: Email/Password + Google OAuth login via Supabase
- **Job Description Management**: Create and manage job descriptions with required fields
- **Resume Upload**: Drag & drop or manual upload of PDF/DOCX files
- **AI Analysis**: Automatic resume analysis using Google Gemini AI
- **Detailed Reports**: 
  - Match Score (resume vs job description)
  - ATS Score (Applicant Tracking System compatibility)
  - Strengths & Weaknesses analysis
  - Missing skills identification
  - Actionable improvement suggestions
- **Report Management**: View, copy, and download analysis reports
- **Responsive Dashboard**: Professional SaaS layout with collapsible sidebar

### Admin Features
- **Admin Dashboard**: Platform-wide statistics and insights
- **User Management**: View, search, and delete users
- **Resume Management**: View and delete uploaded resumes
- **Analytics**: Total users, resumes, reports, and job descriptions
- **Protected Routes**: Role-based access control

### Technical Features
- **Authentication**: Session persistence with cookies
- **Protected Routes**: Middleware-based route protection
- **File Storage**: Supabase Storage for resume files
- **Database**: PostgreSQL with Row Level Security (RLS)
- **AI Integration**: Google Gemini API with fallback mock analysis
- **Responsive UI**: Mobile-first design with Tailwind CSS
- **Clean Architecture**: Organized folder structure with separation of concerns

## 📋 Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4, Lucide React Icons
- **Backend**: Supabase (Auth + Database + Storage)
- **AI**: Google Gemini API
- **State Management**: React Hooks
- **File Processing**: pdfjs-dist for PDF parsing
- **Notifications**: react-hot-toast
- **Utilities**: clsx, date-fns, axios, js-cookie

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ or Node.js 20+
- npm, yarn, or pnpm
- A Supabase account and project
- Google Cloud Platform account (for Google OAuth and Gemini API)

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd air-resume-analyser
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to your project dashboard
3. Navigate to **SQL Editor** and run the SQL setup script:
   
```bash
# Copy the SQL from docs/DATABASE_SETUP.sql
# Paste and run it in Supabase SQL Editor
```

This will create:
- `users` table with RLS policies
- `job_descriptions` table with RLS policies
- `resumes` table with RLS policies
- `reports` table with RLS policies
- Storage bucket for resume files
- Automatic user creation trigger

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI Configuration (Google Gemini)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

**Where to find these values:**
- `NEXT_PUBLIC_SUPABASE_URL`: Found in Supabase Project Settings > API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Found in Supabase Project Settings > API (public/anon key)
- `SUPABASE_SERVICE_ROLE_KEY`: Found in Supabase Project Settings > API (service_role secret key)
- `NEXT_PUBLIC_GEMINI_API_KEY`: Get from [Google AI Studio](https://aistudio.google.com/)

### 5. Set Up Google OAuth (Supabase)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials (Web application type)
5. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
6. In Supabase Dashboard > Authentication > Providers, enable Google
7. Add your Google Client ID and Client Secret

### 6. Set Up Admin User

After creating your first user, make them an admin by running this in Supabase SQL Editor:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

Or use the provided function:

```sql
SELECT set_user_as_admin('your-email@example.com');
```

### 7. Create Storage Bucket

In Supabase Dashboard > Storage:
1. Create a new bucket named `resumes`
2. Set it to **Private** (not public)
3. Set file size limit to **10MB**
4. Allowed MIME types: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/msword`

The SQL setup script also handles this automatically.

## 🚀 Development

### Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run start
```

## 📁 Project Structure

```
air-resume-analyser/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin panel routes
│   │   ├── analytics/            # Platform analytics
│   │   ├── resumes/              # Resume management
│   │   └── users/                # User management
│   ├── api/                      # API routes
│   │   ├── admin/analytics/      # Admin analytics API
│   │   └── analyze-resume/       # Resume analysis API
│   ├── auth/                     # Authentication pages
│   │   ├── login/                # Login page
│   │   ├── signup/               # Registration page
│   │   └── callback/             # OAuth callback handler
│   └── dashboard/                # User dashboard routes
│       ├── create-jd/            # Job description creation
│       ├── my-resumes/           # User's resumes list
│       ├── reports/              # Reports list and detail view
│       ├── upload-resume/        # Resume upload
│       └── settings/             # User settings
├── components/                   # Reusable UI components
│   ├── Button.tsx                # Button component
│   ├── Card.tsx                  # Card components
│   ├── DashboardLayout.tsx       # Dashboard layout wrapper
│   ├── Form.tsx                  # Form components (Input, Select, TextArea)
│   ├── Loading.tsx               # Loading skeletons
│   ├── Navbar.tsx                # Landing page navbar
│   ├── Sidebar.tsx               # Collapsible sidebar
│   └── UI.tsx                    # UI components (Badge, Alert, ProgressBar)
├── docs/                         # Documentation
│   ├── DATABASE_SCHEMA.md        # Database documentation
│   ├── DATABASE_SETUP.sql        # SQL setup script
│   ├── DEPLOYMENT.md             # Deployment guide
│   └── QUICK_START.md            # Quick start guide
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts                # Authentication hooks
│   └── useToast.ts               # Toast notification hook
├── lib/                          # Library configurations
│   ├── supabase.ts               # Client-side Supabase client
│   └── supabase-admin.ts         # Server-side Supabase admin client
├── middleware/                    # Middleware (if needed)
├── services/                     # Business logic services
│   ├── ai.service.ts             # AI analysis service
│   ├── auth.service.ts           # Authentication service
│   ├── database.service.ts       # Database CRUD operations
│   └── file.service.ts           # File processing service
├── types/                        # TypeScript type definitions
│   ├── database.ts               # Database types from Supabase
│   └── index.ts                  # Application types
├── middleware.ts                 # Next.js middleware for route protection
├── .env.local                    # Environment variables (gitignored)
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
```

## 🔐 Security Features

- **Row Level Security (RLS)**: All database tables have RLS policies
- **Route Protection**: Middleware validates authentication tokens
- **Role-Based Access**: Separate routes for users and admins
- **Secure File Storage**: Private storage bucket with access policies
- **Environment Variables**: Sensitive keys stored securely
- **Session Management**: Secure cookie-based sessions

## 🎨 UI Features

### Landing Page
- Hero section with call-to-action
- Features showcase (8 feature cards)
- How it works section (4 steps)
- User testimonials
- Professional footer with links

### User Dashboard
- Collapsible sidebar with navigation
- User profile display
- Quick actions and statistics
- Recent resumes list
- Upload progress indicators

### Admin Panel
- Platform statistics dashboard
- User management with search
- Resume management
- Analytics and insights
- Delete confirmation dialogs

### Reports
- Match Score visualization
- ATS Score display
- Strengths & Weaknesses breakdown
- Missing skills tags
- Improvement suggestions
- Copy to clipboard functionality
- Download as text file

## 🔄 User Flow

1. **Sign Up/Login**: Create account or login with email/Google
2. **Create Job Description**: Enter job title, company, skills, and description
3. **Upload Resume**: Drag & drop or select PDF/DOCX file
4. **AI Analysis**: System automatically analyzes resume against JD
5. **View Report**: See match score, ATS score, strengths, weaknesses, and suggestions
6. **Export Report**: Copy or download report for future reference

## 📊 Database Schema

### Tables
- **users**: User profiles with role (user/admin)
- **job_descriptions**: Job postings with required skills
- **resumes**: Uploaded resume files with extracted text
- **reports**: AI analysis results with scores and suggestions

### Storage
- **resumes bucket**: Private storage for PDF/DOCX files

See `docs/DATABASE_SCHEMA.md` for complete documentation.

## 🚨 Error Handling

- API endpoints return proper HTTP status codes
- Database errors are caught and logged
- User-friendly error messages via toast notifications
- Fallback to mock analysis if AI API fails
- Loading states for all async operations

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npm run type-check

# Build production
npm run build
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Other Platforms

See `docs/DEPLOYMENT.md` for detailed deployment instructions for:
- Vercel
- Netlify
- Railway
- Supabase (for backend)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in `/docs`
- Review the Supabase documentation for backend-related questions

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- Google Gemini for AI capabilities
- Tailwind CSS for the utility-first framework
- Lucide for beautiful icons

---

Built with ❤️ for job seekers worldwide
