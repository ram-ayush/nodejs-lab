const fs = require('node:fs');
const filePath = require('./file-path');

fs.readFile(filePath('notes.txt'), 'utf8', (err, data) => {
  if (err) {
    if (err.code === 'ENOENT') console.log('No notes found yet.');
    else {
      console.error('Error reading notes:', err.message);
      process.exitCode = 1;
    }
    return;
  }
  console.log(data.trimEnd());
});
