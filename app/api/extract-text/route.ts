import { NextRequest, NextResponse } from 'next/server'
import { createRequire } from 'module'

// We move the require inside the POST handler or a lazy getter
// to prevent "Failed to collect page data" errors during Next.js build evaluation.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log('[API/extract-text] Processing file:', file.name, 'type:', file.type)

    // Handle Plain Text files directly
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const text = await file.text()
      return NextResponse.json({ success: true, text: text.trim(), pages: 1 })
    }

    // Handle PDF files
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // Lazy load pdf-parse only at runtime
      const _require = createRequire(import.meta.url)
      const pdfParse = _require('pdf-parse')

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const data = await pdfParse(buffer)
      const text = data?.text?.trim()

      if (!text) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Could not extract text from this PDF. The file may be scanned/image-based or corrupted.',
          },
          { status: 422 }
        )
      }

      return NextResponse.json({
        success: true,
        text,
        pages: data.numpages,
      })
    }

    // For Docx or other types we haven't implemented server-side yet
    return NextResponse.json(
      { success: false, error: `File type ${file.type} is not yet supported for text extraction on the server.` },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('[API/extract-text] Fatal Error:', error?.message || error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to process file: ${error?.message || 'Internal error'}`,
      },
      { status: 500 }
    )
  }
}
