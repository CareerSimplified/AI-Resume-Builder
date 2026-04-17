import { NextRequest, NextResponse } from 'next/server'
import { createRequire } from 'module'

// We move the require inside the POST handler or a lazy getter
// to prevent "Failed to collect page data" errors during Next.js build evaluation.
// Some libraries like pdf-parse perform FS operations or have ESM/CJS logic
// that crashes the Next.js static analysis if called at the top level.

export const runtime = 'nodejs'
// Prevent static optimization for this route
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

    // Validate file type
    if (file.type && file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Only PDF files are supported' },
        { status: 400 }
      )
    }

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
            'Could not extract text from this PDF. The file may be scanned/image-based.',
        },
        { status: 422 }
      )
    }

    return NextResponse.json({
      success: true,
      text,
      pages: data.numpages,
    })
  } catch (error: any) {
    console.error('Extract Text Error:', error?.message || error)
    return NextResponse.json(
      {
        success: false,
        error:
          process.env.NODE_ENV === 'development'
            ? `Service Error: ${error?.message}`
            : 'Failed to process file. Please try again.',
      },
      { status: 500 }
    )
  }
}
