const fs = require('node:fs');
const filePath = require('./file-path');

// A second run with different text demonstrates overwriting, not appending.
const text = process.argv[2] || 'Hello from Lab 06!';
fs.writeFile(filePath('output.txt'), text, (err) => {
  if (err) {
    console.error('Error writing file:', err.message);
    process.exitCode = 1;
    return;
  }
  console.log('File written successfully.');
});
