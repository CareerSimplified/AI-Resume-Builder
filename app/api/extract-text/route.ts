import { NextRequest, NextResponse } from 'next/server'
import * as pdfjsLib from 'pdfjs-dist'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Use worker from pdfjs-dist package
    const pdfjsWorkerSrc = `/pdf.worker.min.js`
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerSrc

    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      disableRange: true,
    });

    const pdf = await loadingTask.promise
    let fullText = ''

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')

      fullText += pageText + '\n'
    }

    return NextResponse.json({ success: true, text: fullText })
  } catch (error: any) {
    const isDev = process.env.NODE_ENV === 'development'
    if (isDev) console.error('Extract Text Error:', error)
    return NextResponse.json({
      success: false,
      error: isDev ? `Service Error: ${error.message}` : 'Failed to process file. Please try again.'
    }, { status: 500 })
  }
}
