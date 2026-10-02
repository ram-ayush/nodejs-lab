const fs = require('node:fs');
const filePath = require('./file-path');

fs.unlink(filePath('output.txt'), (err) => {
  if (err) {
    console.error(err.code === 'ENOENT'
      ? 'ENOENT: output.txt does not exist; it may have already been deleted.'
      : `Error deleting file: ${err.message}`);
    process.exitCode = 1;
    return;
  }
  console.log('File deleted successfully.');
});
