const http = require('node:http');

const profile = {
  name: 'Ayush Ram Tripathi',
  scholarNumber: '23145004',
  course: 'BCA',
  semester: 'VII',
  college: 'DSVV'
};

function createServer() {
  return http.createServer((req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    if (req.method !== 'GET') {
      res.writeHead(405, { Allow: 'GET' });
      return res.end('Method Not Allowed');
    }
    if (pathname === '/') {
      res.end(`Welcome to Node.js!\nName: ${profile.name}\nScholar Number: ${profile.scholarNumber}\nCourse: ${profile.course}`);
    } else if (pathname === '/about') {
      res.end('I am Ayush Ram Tripathi, a BCA student learning backend development with Node.js.');
    } else if (pathname === '/college') {
      res.end(`College: ${profile.college}\nSemester: ${profile.semester}`);
    } else if (pathname === '/profile') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(profile));
    } else {
      res.writeHead(404);
      res.end('Page Not Found');
    }
  });
}

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  createServer().listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}
module.exports = { createServer, profile };
