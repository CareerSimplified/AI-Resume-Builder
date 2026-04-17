const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');

async function testV3() {
    try {
        console.log('Testing PDFJS v3 LEGACY...');
        const minimalPdf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj\n4 0 obj<</Length 21>>stream\nBT /F1 12 Tf 100 700 Td (Hello World) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000212 00000 n\ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n0\n%%EOF');
        
        const loadingTask = pdfjs.getDocument({
            data: new Uint8Array(minimalPdf),
            verbostity: 0,
            disableWorker: true, // This works perfectly in v3 Node
        });
        
        const pdf = await loadingTask.promise;
        console.log('PDF Loaded! Pages:', pdf.numPages);
        
        const page = await pdf.getPage(1);
        const content = await page.getTextContent();
        const text = content.items.map(i => i.str).join(' ');
        console.log('Result:', text);
    } catch (err) {
        console.error('V3 Test failed:', err);
    }
}

testV3();
