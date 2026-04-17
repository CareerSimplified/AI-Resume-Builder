import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createRequire } from 'module'

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
    let extractedText = formData.get('extractedText') as string

    if (!file || !jdId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('[API/upload-resume] Received upload request for:', file.name)

    // FALLBACK: If extraction was not done on client/previous step, do it here
    if (!extractedText || extractedText === 'undefined' || extractedText.length < 10) {
      console.log('[API/upload-resume] Extracted text missing or too short, performing server-side extraction fallback...')
      try {
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          const _require = createRequire(import.meta.url)
          const pdfParse = _require('pdf-parse')
          const arrayBuffer = await file.arrayBuffer()
          const data = await pdfParse(Buffer.from(arrayBuffer))
          extractedText = data.text || ''
          console.log('[API/upload-resume] Fallback extraction successful, chars:', extractedText.length)
        } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
          extractedText = await file.text()
        }
      } catch (extErr: any) {
        console.error('[API/upload-resume] Fallback extraction failed:', extErr.message)
      }
    }

    if (!extractedText || extractedText.length < 10) {
      return NextResponse.json({ 
        error: 'Unable to read resume content. Please ensure the file is a valid PDF or Text file and is not scanned/image-only.' 
      }, { status: 422 })
    }

    const fileName = `${userId}/${Date.now()}-${file.name}`
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    // 1. Storage Upload
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server storage configuration error' }, { status: 500 })
    }

    const { error: uploadError } = await supabaseAdmin
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
    
    const dbPayload = {
      user_id: userId,
      jd_id: jdId,
      file_url: fileUrl,
      file_name: file.name,
      extracted_text: extractedText,
    }

    // Try user session
    if (supabase) {
      const { data } = await supabase.from('resumes').insert(dbPayload).select().single()
      if (data) resumeData = data
    }

    // Fallback Admin
    if (!resumeData && supabaseAdmin) {
      const { data } = await supabaseAdmin.from('resumes').insert(dbPayload).select().single()
      if (data) resumeData = data
    }

    if (!resumeData) {
      return NextResponse.json({ error: 'Failed to record resume in database' }, { status: 500 })
    }

    return NextResponse.json({ success: true, resume: resumeData })
  } catch (error: any) {
    console.error('[API/upload-resume] Fatal Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
