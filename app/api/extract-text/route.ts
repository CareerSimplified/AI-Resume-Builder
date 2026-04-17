import { NextRequest, NextResponse } from 'next/server'
import { createRequire } from 'module'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function extractTextFromBuffer(buffer: Buffer) {
  const _require = createRequire(import.meta.url)
  const pdfjs = _require('pdfjs-dist')
  
  // CRITICAL: Disable the worker for server-side environments to avoid path resolution errors
  // We use the synchronous-ish loading task on the main thread for these small-to-medium PDFs
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    disableFontFace: true,
    nativeImageDecoderSupport: 'none',
    maxImageSize: -1,
    disableWorker: true, // Forces execution without an external worker file
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
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    console.log('[API/extract-text] Using PURE PDFJS (Worker Disabled) for:', file.name)

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const text = await file.text()
      return NextResponse.json({ success: true, text: text.trim(), pages: 1 })
    }

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      const { text, pages } = await extractTextFromBuffer(buffer)
      
      if (!text) {
        return NextResponse.json({ 
          success: false, 
          error: 'The PDF content is empty or contains only images (scanned document).' 
        }, { status: 422 })
      }

      console.log('[API/extract-text] Success, extracted', text.length, 'chars')
      return NextResponse.json({ success: true, text, pages })
    }

    return NextResponse.json({ success: false, error: 'Unsupported file type' }, { status: 400 })
  } catch (error: any) {
    console.error('[API/extract-text] Fatal Error:', error.message)
    return NextResponse.json({ 
      success: false, 
      error: `Extraction failed: ${error.message || 'Corrupted file or processing error'}` 
    }, { status: 500 })
  }
}
