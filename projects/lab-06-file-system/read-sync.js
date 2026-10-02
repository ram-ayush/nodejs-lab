const fs = require('node:fs');
const filePath = require('./file-path');

try {
  const data = fs.readFileSync(filePath('sample.txt'), 'utf8');
  console.log(data.trimEnd());
  console.log('This line runs AFTER the file has been fully read.');
} catch (err) {
  console.error('Error reading file:', err.message);
  process.exitCode = 1;
}
