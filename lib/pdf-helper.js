// lib/pdf-helper.js
// Use CommonJS to bypass strict Turbopack/TS resolution of optional dependencies
try {
  const pdfjs = require('pdfjs-dist/legacy/build/pdf');
  
  // Set worker source explicitly to avoid "Cannot find module './pdf.worker.js'" error
  // In Node.js, we point it to the actual worker file path or require it
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/legacy/build/pdf.worker.js');
  }

  async function extractTextFromPDF(buffer) {
    const data = new Uint8Array(buffer);
    const loadingTask = pdfjs.getDocument({
      data,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
      disableFontFace: true,
      // Increase transparency for Node.js
      verbosity: 0, 
    });
    
    const pdfDocument = await loadingTask.promise;
    const maxPages = pdfDocument.numPages;
    let fullText = '';

    for (let i = 1; i <= maxPages; i++) {
      try {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      } catch (e) {
        console.warn(`[pdf-helper] Page ${i} error:`, e.message);
      }
    }
    return { text: fullText.trim(), pages: maxPages };
  }

  module.exports = { extractTextFromPDF };
} catch (err) {
  console.error('[pdf-helper] Initialization error:', err.message);
  module.exports = {
    extractTextFromPDF: async (buffer) => {
        // Ultimate fallback if initialization fails
        const text = buffer.toString('utf8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
        return { text: text.substring(0, 10000), pages: 1 };
    }
  };
}
