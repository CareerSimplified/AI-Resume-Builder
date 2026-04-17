import { NextRequest, NextResponse } from 'next/server'

// Polyfill DOMMatrix for Node.js environments
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

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function extractTextFromBuffer(buffer: Uint8Array) {
  const { getDocumentProxy, extractText } = await import('unpdf')
  
  const pdf = await getDocumentProxy(buffer)
  const { text } = await extractText(pdf)
  
  const finalText = Array.isArray(text) ? text.join(' ') : text
  return { text: finalText.trim(), pages: pdf.numPages }
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
