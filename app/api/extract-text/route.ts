import { NextRequest, NextResponse } from 'next/server'
import { createRequire } from 'module'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    console.log('[API/extract-text] Processing:', file.name, 'type:', file.type)

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const text = await file.text()
      return NextResponse.json({ success: true, text: text.trim(), pages: 1 })
    }

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const _require = createRequire(import.meta.url)
      const pdfParse = _require('pdf-parse')

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Support for different library versions (function vs property)
      let data;
      if (typeof pdfParse === 'function') {
        data = await pdfParse(buffer)
      } else if (pdfParse.default && typeof pdfParse.default === 'function') {
        data = await pdfParse.default(buffer)
      } else if (typeof pdfParse.PDFParse === 'function') {
        // Fallback for some newer class-based forks
        const parser = new pdfParse.PDFParse();
        data = await parser.parse(buffer);
      } else {
        throw new Error('PDF parsing library is misconfigured or incompatible structure.')
      }
      
      const text = data?.text?.trim()
      if (!text) {
        return NextResponse.json({ 
          success: false, 
          error: 'Could not extract text. The PDF might be scanned or image-based.' 
        }, { status: 422 })
      }

      return NextResponse.json({ success: true, text, pages: data.numpages || 1 })
    }

    return NextResponse.json({ success: false, error: 'Unsupported file type' }, { status: 400 })
  } catch (error: any) {
    console.error('[API/extract-text] Fatal Error:', error.message)
    return NextResponse.json({ 
      success: false, 
      error: `Extraction failed: ${error.message || 'The file could not be read'}` 
    }, { status: 500 })
  }
}
