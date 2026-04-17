import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const jdId = formData.get('jdId') as string
    const userId = formData.get('userId') as string
    const extractedText = formData.get('extractedText') as string

    if (!file || !jdId || !userId || !extractedText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    console.log('[upload-resume API] Starting upload for user:', userId)

    // Step 1: Upload to Supabase storage using admin client
    const fileName = `${userId}/${Date.now()}-${file.name}`
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('resumes')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('[upload-resume API] Storage upload error:', uploadError)
      return NextResponse.json(
        { error: `Failed to upload file: ${uploadError.message}` },
        { status: 500 }
      )
    }

    console.log('[upload-resume API] File uploaded to storage:', uploadData.path)

    // Step 2: Get public URL
    const { data: urlData } = supabaseAdmin
      .storage
      .from('resumes')
      .getPublicUrl(fileName)

    const fileUrl = urlData.publicUrl
    console.log('[upload-resume API] Public URL generated:', fileUrl)

    // Step 3: Save to database using admin client (bypasses RLS)
    const { data: resumeData, error: dbError } = await supabaseAdmin
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

    if (dbError) {
      console.error('[upload-resume API] Database error:', dbError)
      return NextResponse.json(
        { error: `Failed to save resume: ${dbError.message}` },
        { status: 500 }
      )
    }

    console.log('[upload-resume API] Resume saved to database, ID:', resumeData.id)

    return NextResponse.json({
      success: true,
      resume: resumeData,
      message: 'Resume uploaded and saved successfully'
    })
  } catch (error: any) {
    console.error('[upload-resume API] Fatal error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload resume' },
      { status: 500 }
    )
  }
}
