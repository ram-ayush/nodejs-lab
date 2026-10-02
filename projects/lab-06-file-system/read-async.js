const fs = require('node:fs');
const filePath = require('./file-path');

fs.readFile(filePath('sample.txt'), 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err.message);
    process.exitCode = 1;
    return;
  }
  console.log(data.trimEnd());
});
console.log('This line runs BEFORE the file content is printed.');
