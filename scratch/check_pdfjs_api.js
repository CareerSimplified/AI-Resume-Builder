const pdfjs = require('pdfjs-dist');
console.log('PDFJS keys:', Object.keys(pdfjs));
if (pdfjs.getDocument) {
    console.log('getDocument found');
} else {
    console.log('getDocument NOT found');
}
