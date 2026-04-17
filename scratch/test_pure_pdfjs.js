const pdfjs = require('pdfjs-dist');

async function extractText(buffer) {
    try {
        console.log('Loading PDF document...');
        
        // For Node.js, we need to provide a fake worker or handle it
        // In 4.0+ pdfjs-dist, it might require a worker path.
        // But let's try reading it directly first.
        
        const loadingTask = pdfjs.getDocument({
            data: new Uint8Array(buffer),
            useSystemFonts: true,
            disableFontFace: true,
            nativeImageDecoderSupport: 'none'
        });
        
        const pdf = await loadingTask.promise;
        console.log('PDF loaded successfully. Pages:', pdf.numPages);
        
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map(item => item.str);
            text += strings.join(' ') + '\n';
        }
        
        return text.trim();
    } catch (err) {
        throw err;
    }
}

async function test() {
    try {
        // Minimal PDF buffer (valid enough for pdfjs)
        const minimalPdf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj\n4 0 obj<</Length 21>>stream\nBT /F1 12 Tf 100 700 Td (Hello World) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000212 00000 n\ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n0\n%%EOF');
        
        const text = await extractText(minimalPdf);
        console.log('Extraction Result:', text);
    } catch (err) {
        console.error('Test failed:', err);
    }
}

test();
