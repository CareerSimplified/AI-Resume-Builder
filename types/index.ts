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
export interface ReportAnalysis {
  match_score: number
  ats_score: number
  strengths: string[]
  weaknesses: string[]
  missing_skills: string[]
  suggestions: string[]
}

export interface Report {
  id: string
  resume_id: string
  user_id: string
  jd_id: string
  match_score: number
  ats_score: number
  strengths: string[]
  weaknesses: string[]
  missing_skills: string[]
  suggestions: string[]
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
