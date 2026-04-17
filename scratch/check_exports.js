const pdf = require('pdf-parse');
console.log('Type of require("pdf-parse"):', typeof pdf);
console.log('Keys of require("pdf-parse"):', Object.keys(pdf));

if (typeof pdf === 'function') {
    console.log('It is a function');
} else if (pdf.default && typeof pdf.default === 'function') {
    console.log('It is in .default');
} else {
    console.log('Not a function or .default');
}
