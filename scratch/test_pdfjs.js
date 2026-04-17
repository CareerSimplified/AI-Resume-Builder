const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');

async function testPdfJs() {
  try {
    console.log('Testing pdfjs-dist...');
    const minimalPdf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj\n4 0 obj<</Length 21>>stream\nBT /F1 12 Tf 100 700 Td (Hello World) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000212 00000 n\ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n0\n%%EOF');

    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(minimalPdf), disableFontFace: true, nativeImageDecoderSupport: 'none' });
    const pdf = await loadingTask.promise;
    console.log('PDF loaded, pages:', pdf.numPages);
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(' ');
        fullText += pageText + '\n';
    }
    console.log('Text extracted:', fullText.trim());
  } catch (err) {
    console.error('pdfjs-dist failed:', err);
  }
}

testPdfJs();
