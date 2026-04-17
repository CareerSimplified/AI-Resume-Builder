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

async function extractTextFromBuffer(buffer: Buffer) {
  const _require = createRequire(import.meta.url)
  const pdfjs = _require('pdfjs-dist')
  
  // Forces execution without worker file for Vercel/Serverless
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    disableFontFace: true,
    nativeImageDecoderSupport: 'none',
    maxImageSize: -1,
    disableWorker: true,
  })
  
  const pdf = await loadingTask.promise
  let fullText = ''
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items.map((item: any) => item.str).join(' ')
    fullText += pageText + ' \n'
  }
  
  return fullText.trim()
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

    console.log('[API/upload-resume] Uploading for user:', userId)

    // FALLBACK: If extraction was not done or is too short, do it here with PURE PDFJS
    if (!extractedText || extractedText === 'undefined' || extractedText.length < 10) {
      console.log('[API/upload-resume] Fallback extraction starting with PURE PDFJS...')
      try {
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          const arrayBuffer = await file.arrayBuffer()
          extractedText = await extractTextFromBuffer(Buffer.from(arrayBuffer))
          console.log('[API/upload-resume] Fallback extraction successful:', extractedText.length)
        } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
          extractedText = await file.text()
        }
      } catch (extErr: any) {
        console.error('[API/upload-resume] Fallback extraction failed:', extErr.message)
      }
    }

    if (!extractedText || extractedText.length < 10) {
      return NextResponse.json({ 
        error: 'Unable to read resume content. Please ensure the file is a valid PDF or Text file.' 
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

    if (supabase) {
      const { data } = await supabase.from('resumes').insert(dbPayload).select().single()
      if (data) resumeData = data
    }

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
