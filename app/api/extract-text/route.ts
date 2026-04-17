import { NextRequest, NextResponse } from 'next/server'
import { createRequire } from 'module'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function extractTextFromBuffer(buffer: Buffer) {
  const _require = createRequire(import.meta.url)
  // Use the legacy build which is Node-friendly and doesn't require a worker
  const pdfjs = _require('pdfjs-dist/legacy/build/pdf.js')
  
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    disableFontFace: true,
    nativeImageDecoderSupport: 'none',
    maxImageSize: -1,
    disableWorker: true, // Self-contained in v3 legacy
    verbosity: 0
  })
  
  const pdf = await loadingTask.promise
  let fullText = ''
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items.map((item: any) => item.str).join(' ')
    fullText += pageText + ' \n'
  }
  
  return { text: fullText.trim(), pages: pdf.numPages }
}

export async function POST(req: NextRequest) {
  try {
    let file: File | null = null
    
    // Robust parsing
    try {
      const formData = await req.formData()
      file = formData.get('file') as File
    } catch (parseError) {
      console.warn('[API/extract-text] FormData parsing failed, trying Blob fallback...')
      try {
        const blob = await req.blob()
        if (blob && blob.size > 0) {
          const arrayBuffer = await blob.arrayBuffer()
          const { text, pages } = await extractTextFromBuffer(Buffer.from(arrayBuffer))
          return NextResponse.json({ success: true, text, pages })
        }
      } catch (blobError) {}
      return NextResponse.json({ success: false, error: 'Malformed request body.' }, { status: 400 })
    }

    if (!file || file.size === 0) {
      return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 })
    }

    console.log('[API/extract-text] Extractive processing via PDFJS v3 Legacy for:', file.name)

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const text = await file.text()
      return NextResponse.json({ success: true, text: text.trim(), pages: 1 })
    }

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const arrayBuffer = await file.arrayBuffer()
      const { text, pages } = await extractTextFromBuffer(Buffer.from(arrayBuffer))
      
      if (!text) {
        return NextResponse.json({ success: false, error: 'No readable text content found in PDF.' }, { status: 422 })
      }

      console.log('[API/extract-text] Extraction Complete:', text.length, 'chars')
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
