export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          role: 'user' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          role?: 'user' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: 'user' | 'admin'
          created_at?: string
        }
      }
      job_descriptions: {
        Row: {
          id: string
          user_id: string
          title: string
          company: string
          skills: string[]
          experience: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          company: string
          skills?: string[]
          experience: string
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          company?: string
          skills?: string[]
          experience?: string
          description?: string
          created_at?: string
        }
      }
      resumes: {
        Row: {
          id: string
          user_id: string
          jd_id: string
          file_url: string
          file_name: string
          extracted_text: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          jd_id: string
          file_url: string
          file_name: string
          extracted_text: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          jd_id?: string
          file_url?: string
          file_name?: string
          extracted_text?: string
          created_at?: string
        }
      }
      reports: {
        Row: {
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
        Insert: {
          id?: string
          resume_id: string
          user_id: string
          jd_id: string
          match_score: number
          ats_score: number
          strengths?: string[]
          weaknesses?: string[]
          missing_skills?: string[]
          suggestions?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          resume_id?: string
          user_id?: string
          jd_id?: string
          match_score?: number
          ats_score?: number
          strengths?: string[]
          weaknesses?: string[]
          missing_skills?: string[]
          suggestions?: string[]
          created_at?: string
        }
      }
    }
    Views: {
      admin_analytics: {
        Row: {
          total_users: number
          total_resumes: number
          total_reports: number
          total_job_descriptions: number
        }
      }
    }
  }
}
