const path = require('node:path');

// Resolve beside these scripts so running from another working directory works.
// Tests and evidence capture use an isolated temporary LAB_DATA_DIR.
module.exports = name => path.join(process.env.LAB_DATA_DIR || __dirname, name);
