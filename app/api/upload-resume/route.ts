import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

if (typeof global.DOMMatrix === 'undefined') {
  // @ts-ignore
  global.DOMMatrix = class DOMMatrix {
    m11 = 1; m12 = 0; m13 = 0; m14 = 0;
    m21 = 0; m22 = 1; m23 = 0; m24 = 0;
    m31 = 0; m32 = 0; m33 = 1; m34 = 0;
    m41 = 0; m42 = 0; m43 = 0; m44 = 1;
    constructor() {}
  };
}

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

async function extractTextFromBuffer(buffer: Uint8Array) {
  const { getDocumentProxy, extractText } = await import('unpdf')
  const pdf = await getDocumentProxy(buffer)
  const { text } = await extractText(pdf)
  return text.trim()
}


export async function POST(req: NextRequest) {
  try {
    let file: File | null = null
    let jdId: string | null = null
    let userId: string | null = null
    let extractedText: string | null = null

    try {
      const formData = await req.formData()
      file = formData.get('file') as File
      jdId = formData.get('jdId') as string
      userId = formData.get('userId') as string
      extractedText = formData.get('extractedText') as string
    } catch (e) {}

    if (!file || file.size === 0 || !jdId || !userId) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    // FALLBACK: If extraction missing, do it here with UNPDF
    if (!extractedText || extractedText === 'undefined' || extractedText.length < 10) {
      try {
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          const arrayBuffer = await file.arrayBuffer()
          extractedText = await extractTextFromBuffer(Buffer.from(arrayBuffer))
        } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
          extractedText = await file.text()
        }
      } catch (extErr: any) {
        console.error('[API/upload-resume] Fallback Error:', extErr.message)
      }
    }

    if (!extractedText || extractedText.length < 10) {
      return NextResponse.json({ error: 'Unable to read content.' }, { status: 422 })
    }

    const fileName = `${userId}/${Date.now()}-${file.name}`
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Storage error.' }, { status: 500 })
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

    const supabase = await getServerSupabase()
    const dbPayload = {
      user_id: userId,
      jd_id: jdId,
      file_url: fileUrl,
      file_name: file.name,
      extracted_text: extractedText,
    }

    let resumeData = null
    if (supabase) {
      const { data } = await supabase.from('resumes').insert(dbPayload).select().single()
      if (data) resumeData = data
    }

    if (!resumeData && supabaseAdmin) {
      const { data } = await supabaseAdmin.from('resumes').insert(dbPayload).select().single()
      if (data) resumeData = data
    }

    if (!resumeData) {
      return NextResponse.json({ error: 'Database save failed.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, resume: resumeData })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
