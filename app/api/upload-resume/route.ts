import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

async function getServerSupabase() {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) return null
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value },
      set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }) },
      remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: '', ...options }) },
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const jdId = formData.get('jdId') as string
    const userId = formData.get('userId') as string
    const extractedText = formData.get('extractedText') as string

    if (!file || !jdId || !userId || !extractedText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('[API/upload-resume] Starting upload for user:', userId)
    const fileName = `${userId}/${Date.now()}-${file.name}`
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    // 1. Storage Upload (Always use Admin for storage to avoid complex RLS hurdles during upload)
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server storage configuration error' }, { status: 500 })
    }

    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('resumes')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      return NextResponse.json({ error: `Storage error: ${uploadError.message}` }, { status: 500 })
    }

    const { data: urlData } = supabaseAdmin.storage.from('resumes').getPublicUrl(fileName)
    const fileUrl = urlData.publicUrl

    // 2. Database Save
    let resumeData = null;
    const supabase = await getServerSupabase()
    
    // Try user session
    if (supabase) {
      const { data, error } = await supabase
        .from('resumes')
        .insert({
          user_id: userId,
          jd_id: jdId,
          file_url: fileUrl,
          file_name: file.name,
          extracted_text: extractedText,
        })
        .select()
        .single()
      
      if (data) resumeData = data
    }

    // Fallback Admin
    if (!resumeData && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('resumes')
        .insert({
          user_id: userId,
          jd_id: jdId,
          file_url: fileUrl,
          file_name: file.name,
          extracted_text: extractedText,
        })
        .select()
        .single()
      
      if (data) resumeData = data
    }

    if (!resumeData) {
      return NextResponse.json({ error: 'Failed to record resume in database' }, { status: 500 })
    }

    return NextResponse.json({ success: true, resume: resumeData })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
