const fs = require('node:fs');
const filePath = require('./file-path');
const note = process.argv.slice(2).join(' ').trim();

if (!note) {
  console.error('Please provide a note. Example: node add-note.js "Buy groceries"');
  process.exit(1);
}
// Keep each note on one line, even if the argument contains a newline.
const entry = `[${new Date().toISOString()}] ${note.replace(/[\r\n]+/g, ' ')}\n`;
fs.appendFile(filePath('notes.txt'), entry, (err) => {
  if (err) {
    console.error('Error saving note:', err.message);
    process.exitCode = 1;
    return;
  }
  console.log('Note added!');
});
