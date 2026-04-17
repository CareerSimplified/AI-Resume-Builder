const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

async function testPdfParse() {
  try {
    console.log('Starting pdf-parse test...');
    
    // Create a dummy buffer if no file exists, but ideally we use a real PDF
    // For now let's just see if it loads
    console.log('pdf-parse loaded successfully');
    
    // Test with a minimal PDF buffer (empty PDF structure)
    const minimalPdf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj\n4 0 obj<</Length 21>>stream\nBT /F1 12 Tf 100 700 Td (Hello World) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000212 00000 n\ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n0\n%%EOF');

    const data = await pdfParse(minimalPdf);
    console.log('Extraction success!');
    console.log('Text:', data.text);
  } catch (err) {
    console.error('pdf-parse failed:', err);
  }
}

testPdfParse();
