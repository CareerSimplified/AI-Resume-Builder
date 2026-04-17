import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { User, JobDescription, Resume, Report } from '@/types'

// User Service
export const userService = {
  async createOrUpdateUser(userId: string, email: string, name: string | null) {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email,
        name: name || '',
        role: 'user',
        created_at: new Date().toISOString(),
      } as any)
      .select()
    return { data: (data as any[]) || null, error }
  },

  async getUserById(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    return { data: (data as unknown as User) || null, error }
  },

  async getAdminByEmail(email: string) {
    if (!supabaseAdmin) {
      return { data: null, error: new Error('Admin credentials not configured') }
    }
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('role', 'admin')
      .single()
    return { data, error }
  },

  async updateUser(userId: string, updates: { name?: string; role?: string }) {
    const { data, error } = await (supabase as any)
      .from('users')
      .update(updates as any)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getUserStats(userId: string) {
    try {
      const response = await fetch(`/api/user/${userId}/stats`)
      const result = await response.json()
      if (result.success) {
        return result.data.stats
      }
      throw new Error(result.error || 'Failed to fetch stats')
    } catch (err) {
      console.error('Error in getUserStats service:', err)
      return {
        totalResumes: 0,
        totalReports: 0,
        totalJobDescriptions: 0,
      }
    }
  },
}

// Job Description Service
export const jobDescriptionService = {
  async create(userId: string, jd: Omit<JobDescription, 'id' | 'user_id' | 'created_at'>) {
    try {
      const response = await fetch('/api/job-descriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          ...jd
        }),
      })
      const result = await response.json()
      return { data: result.data || null, error: result.success ? null : new Error(result.error) }
    } catch (error: any) {
      return { data: null, error }
    }
  },


  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('job_descriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data: (data as JobDescription[]) || [], error }
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('job_descriptions')
      .select('*')
      .eq('id', id)
      .single()
    return { data: (data as JobDescription | null), error }
  },

  async update(id: string, updates: Partial<JobDescription>) {
    const { data, error } = await (supabase as any)
      .from('job_descriptions')
      .update(updates as any)
      .eq('id', id)
      .select()
    return { data, error }
  },

  async delete(id: string) {
    const { data, error } = await supabase
      .from('job_descriptions')
      .delete()
      .eq('id', id)
    return { data, error }
  },
}

// Resume Service
export const resumeService = {
  async create(userId: string, jdId: string, fileUrl: string, extractedText: string, fileName: string) {
    const { data, error } = await supabase
      .from('resumes')
      .insert({
        user_id: userId,
        jd_id: jdId,
        file_url: fileUrl,
        extracted_text: extractedText,
        file_name: fileName,
        created_at: new Date().toISOString(),
      } as any)
      .select()
    return { data: (data as any[]) || null, error }
  },

  async getByUserId(userId: string) {
    try {
      const response = await fetch(`/api/resumes?userId=${userId}`)
      const result = await response.json()
      return { data: (result.data as Resume[]) || [], error: result.success ? null : new Error(result.error) }
    } catch (err: any) {
      return { data: [], error: err }
    }
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .single()
    return { data: (data as Resume | null), error }
  },

  async delete(id: string) {
    const { data, error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id)
    return { data, error }
  },
}

// Report Service
export const reportService = {
  async create(resumeId: string, userId: string, jdId: string, analysis: any) {
    const { data, error } = await supabase
      .from('reports')
      .insert({
        resume_id: resumeId,
        user_id: userId,
        jd_id: jdId,
        match_score: analysis.match_score,
        ats_score: analysis.ats_score,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        missing_skills: analysis.missing_skills,
        suggestions: analysis.suggestions,
        created_at: new Date().toISOString(),
      } as any)
      .select()
    return { data, error }
  },

  async getByResumeId(resumeId: string) {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('resume_id', resumeId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    return { data, error }
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data: (data as Report[]) || [], error }
  },

  async getAll() {
    if (!supabaseAdmin) {
      return { data: null, error: new Error('Admin credentials not configured') }
    }
    const { data, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },
}

// Admin Service
export const adminService = {
  async getAllUsers() {
    if (!supabaseAdmin) {
      return { data: null, error: new Error('Admin credentials not configured') }
    }
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .neq('role', 'admin')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async deleteUser(userId: string) {
    if (!supabaseAdmin) {
      return { error: new Error('Admin credentials not configured') }
    }
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (authError) return { error: authError }

    const { error: dbError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)
    return { error: dbError }
  },

  async updateUserRole(userId: string, role: string) {
    if (!supabaseAdmin) {
      return { error: new Error('Admin credentials not configured') }
    }
    const { error } = await supabaseAdmin
      .from('users')
      .update({ role })
      .eq('id', userId)
    return { error }
  },

  async getAllResumes() {
    if (!supabaseAdmin) {
      return { data: null, error: new Error('Admin credentials not configured') }
    }
    const { data, error } = await supabaseAdmin
      .from('resumes')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async deleteResume(resumeId: string) {
    if (!supabaseAdmin) {
      return { error: new Error('Admin credentials not configured') }
    }
    const { data: resume, error: fetchError } = await supabaseAdmin
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single()

    if (fetchError) return { error: fetchError }

    if (resume?.file_url) {
      const fileName = resume.file_url.split('/').pop() || ''
      await supabaseAdmin.storage.from('resumes').remove([fileName])
    }

    const { error: dbError } = await supabaseAdmin
      .from('resumes')
      .delete()
      .eq('id', resumeId)
    return { error: dbError }
  },

  async getAnalytics() {
    if (!supabaseAdmin) {
      return {
        totalUsers: 0,
        totalResumes: 0,
        totalReports: 0,
        totalJobDescriptions: 0,
      }
    }
    try {
      const { count: totalUsers, error: usersError } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'user')

      if (usersError) throw usersError

      const { count: totalResumes, error: resumesError } = await supabaseAdmin
        .from('resumes')
        .select('*', { count: 'exact', head: true })

      if (resumesError) throw resumesError

      const { count: totalReports, error: reportsError } = await supabaseAdmin
        .from('reports')
        .select('*', { count: 'exact', head: true })

      if (reportsError) throw reportsError

      const { count: totalJobDescriptions, error: jdError } = await supabaseAdmin
        .from('job_descriptions')
        .select('*', { count: 'exact', head: true })

      if (jdError) throw jdError

      return {
        totalUsers: totalUsers || 0,
        totalResumes: totalResumes || 0,
        totalReports: totalReports || 0,
        totalJobDescriptions: totalJobDescriptions || 0,
      }
    } catch (error) {
      console.error('Analytics error:', error)
      return {
        totalUsers: 0,
        totalResumes: 0,
        totalReports: 0,
        totalJobDescriptions: 0,
      }
    }
  },

  async getUserStats(userId: string) {
    try {
      const [resumesRes, reportsRes, jdRes] = await Promise.all([
        supabase.from('resumes').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('job_descriptions').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      ])
      return {
        totalResumes: resumesRes.count || 0,
        totalReports: reportsRes.count || 0,
        totalJobDescriptions: jdRes.count || 0,
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
      return {
        totalResumes: 0,
        totalReports: 0,
        totalJobDescriptions: 0,
      }
    }
  },
}
