// User Types
export interface User {
  id: string
  email: string
  name: string | null
  role: 'user' | 'admin'
  created_at: string
}

// Job Description Types
export interface JobDescription {
  id: string
  user_id: string
  title: string
  company: string
  skills: string[]
  experience: string
  description: string
  created_at: string
}

// Resume Types
export interface Resume {
  id: string
  user_id: string
  jd_id: string
  file_url: string
  extracted_text: string
  file_name: string
  created_at: string
}

// Report Types
export interface ScoreBreakdown {
  score: number
  alignment: number
  quantification: number
  keywords: number
  structure: number
}

export interface Gaps {
  missing_skills: string[]
  missing_frameworks: string[]
  missing_keywords: string[]
  missing_metrics: string[]
  missing_leadership: string[]
}

export interface QualityVerdict {
  rating: 'weak' | 'moderate' | 'strong'
  issues: string[]
  improvementsMade: string[]
}

export interface ReportAnalysis {
  match_score: number | ScoreBreakdown
  ats_score: number
  strengths: string[]
  weaknesses: string[]
  missing_skills: string[]
  suggestions: string[]
  gaps?: Gaps
  qualityVerdict?: QualityVerdict
  rewrittenResume?: string
  coverLetter?: string
  interviewPrep?: string
  plan306090?: string
}

export interface Report {
  id: string
  resume_id: string
  user_id: string
  jd_id: string | null
  match_score: number
  score_breakdown?: ScoreBreakdown
  ats_score: number
  strengths: string[]
  weaknesses: string[]
  missing_skills: string[]
  suggestions: string[]
  gaps?: Gaps
  rewritten_resume?: string
  cover_letter?: string
  interview_prep?: string
  plan_306090?: string
  mode: 'MBA_POLISH' | 'JD_ALIGNMENT'
  created_at: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Auth Session Type
export interface AuthSession {
  user: User | null
  session: any
}

export interface Plan {
  id: string
  name: string
  price_inr: number
  description: string
  features: string[]
  is_popular: boolean
  credit_limit: number
  created_at: string
  updated_at: string
}
