import { NextRequest, NextResponse } from 'next/server'
import { createRequire } from 'module'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function extractTextFromBuffer(buffer: Buffer) {
  const _require = createRequire(import.meta.url)
  const pdf = _require('pdf-parse')
  
  try {
    const data = await pdf(buffer)
    return { 
      text: data.text || '', 
      pages: data.numpages || 0 
    }
  } catch (err: any) {
    console.error('[PDF-Parse Error]:', err.message)
    throw new Error(`Failed to parse PDF: ${err.message}`)
  }
}

export async function POST(req: NextRequest) {
  try {
    let file: File | null = null
    try {
      const formData = await req.formData()
      file = formData.get('file') as File
    } catch (parseError) {
      const blob = await req.blob()
      if (blob && blob.size > 0) {
        const arrayBuffer = await blob.arrayBuffer()
        const { text, pages } = await extractTextFromBuffer(Buffer.from(arrayBuffer))
        return NextResponse.json({ success: true, text, pages })
      }
    }

    if (!file || file.size === 0) {
      return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 })
    }

    console.log('[API/extract-text] Processing with pdf-parse:', file.name)

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const text = await file.text()
      return NextResponse.json({ success: true, text: text.trim(), pages: 1 })
    }

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const arrayBuffer = await file.arrayBuffer()
      const { text, pages } = await extractTextFromBuffer(Buffer.from(arrayBuffer))
      
      if (!text) {
        return NextResponse.json({ success: false, error: 'The PDF has no readable text.' }, { status: 422 })
      }

      return NextResponse.json({ success: true, text, pages })
    }

    return NextResponse.json({ success: false, error: 'Unsupported file type.' }, { status: 400 })
  } catch (error: any) {
    console.error('[API/extract-text] Fatal Error:', error.message)
    return NextResponse.json({ 
      success: false, 
      error: `Extraction failed: ${error.message}` 
    }, { status: 500 })
  }
}
