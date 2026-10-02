const http = require('node:http');

const students = [
  { id: 1, name: 'Aman', course: 'BCA' },
  { id: 2, name: 'Nandani', course: 'BCA' },
  { id: 3, name: 'Abhishek', course: 'BIT' }
];

// Task 3: an original directory of five books.
const items = [
  { id: 1, title: 'The Hobbit', author: 'J. R. R. Tolkien' },
  { id: 2, title: 'The Little Prince', author: 'Antoine de Saint-Exupery' },
  { id: 3, title: 'Wings of Fire', author: 'A. P. J. Abdul Kalam' },
  { id: 4, title: 'The Alchemist', author: 'Paulo Coelho' },
  { id: 5, title: 'A Brief History of Time', author: 'Stephen Hawking' }
];

function createServer() {
  return http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const send = (status, body) => { res.writeHead(status); res.end(JSON.stringify(body)); };
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return send(405, { error: 'Method not allowed' });
    }
    const pathname = new URL(req.url, 'http://localhost').pathname;
    // split('/') turns /students/2 into ['', 'students', '2'].
    const parts = pathname.split('/');
    if (pathname === '/students') return send(200, students);
    if (pathname === '/items') return send(200, items);
    if (parts.length === 4 && parts[1] === 'students' && parts[2] === 'course') {
      let course;
      try { course = decodeURIComponent(parts[3]); }
      catch { return send(400, { error: 'Invalid course encoding' }); }
      if (!course.trim()) return send(400, { error: 'Course is required' });
      return send(200, students.filter(student => student.course.toLowerCase() === course.toLowerCase()));
    }
    if (parts.length === 3 && ['students', 'items'].includes(parts[1])) {
      if (!/^[1-9]\d*$/.test(parts[2]) || !Number.isSafeInteger(Number(parts[2]))) {
        return send(400, { error: 'ID must be a positive integer' });
      }
      const collection = parts[1] === 'students' ? students : items;
      const item = collection.find(entry => entry.id === Number(parts[2]));
      return item ? send(200, item) : send(404, { error: parts[1] === 'students' ? 'Student not found' : 'Item not found' });
    }
    send(404, { error: 'Route not found' });
  });
}

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  createServer().listen(PORT, () => console.log(`Directory running at http://localhost:${PORT}`));
}
module.exports = { createServer, students, items };
