const { PDFParse } = require('pdf-parse');

async function testNewApi() {
    try {
        console.log('Testing Mehmet Kozan version of pdf-parse...');
        const minimalPdf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj\n4 0 obj<</Length 21>>stream\nBT /F1 12 Tf 100 700 Td (Hello World) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000212 00000 n\ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n0\n%%EOF');
        
        const parser = new PDFParse();
        console.log('Parser instance created');
        
        const data = await parser.parse(minimalPdf);
        console.log('Success! Text extracted:');
        console.log(data.text);
    } catch (err) {
        console.error('New API failed:', err);
    }
}

testNewApi();
