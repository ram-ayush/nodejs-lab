const fs = require('node:fs').promises;
const filePath = require('./file-path');

async function copyContent() {
  try {
    const data = await fs.readFile(filePath('sample.txt'), 'utf8');
    await fs.writeFile(filePath('copy.txt'), data);
    console.log('Copied successfully.');
  } catch (err) {
    console.error('Something went wrong:', err.message);
    process.exitCode = 1;
  }
}
copyContent();
