const fs = require('node:fs');
const filePath = require('./file-path');

fs.appendFile(filePath('output.txt'), '\nThis line was appended.', (err) => {
  if (err) {
    console.error('Error appending file:', err.message);
    process.exitCode = 1;
    return;
  }
  console.log('Content appended successfully.');
});
