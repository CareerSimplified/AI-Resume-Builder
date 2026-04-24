import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'

// Use the JS helper to avoid 'canvas' resolution issues in Turbopack
const { extractTextFromPDF } = require('@/lib/pdf-helper');

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function extractTextFromDOCX(buffer: Buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer })
    return {
      text: result.value.trim(),
      pages: 1
    }
  } catch (err: any) {
    console.error('[API/extract-text] mammoth error:', err.message)
    throw new Error(`Failed to parse DOCX: ${err.message}`)
  }
}

export async function POST(req: NextRequest) {
  try {
    let file: File | null = null
    try {
      const formData = await req.formData()
      file = formData.get('file') as File
    } catch (parseError) {
      // Fallback for direct binary uploads
      const blob = await req.blob()
      if (blob && blob.size > 0) {
        const arrayBuffer = await blob.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        if (buffer.toString('utf8', 0, 5) === '%PDF-') {
          const { text, pages } = await extractTextFromPDF(buffer)
          return NextResponse.json({ success: true, text, pages })
        }
      }
    }

    if (!file || file.size === 0) {
      return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 })
    }

    console.log('[API/extract-text] Processing file:', file.name)

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const text = await file.text()
      return NextResponse.json({ success: true, text: text.trim(), pages: 1 })
    }

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const arrayBuffer = await file.arrayBuffer()
      const { text, pages } = await extractTextFromPDF(Buffer.from(arrayBuffer))
      
      if (!text) {
        return NextResponse.json({ success: false, error: 'The PDF has no readable text.' }, { status: 422 })
      }

      return NextResponse.json({ success: true, text, pages })
    }

    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
      const arrayBuffer = await file.arrayBuffer()
      const { text, pages } = await extractTextFromDOCX(Buffer.from(arrayBuffer))
      
      if (!text) {
        return NextResponse.json({ success: false, error: 'The DOCX has no readable text.' }, { status: 422 })
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