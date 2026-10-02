const http = require('node:http');

const students = [
  { id: 1, name: 'Aman', course: 'BCA', marks: 72 },
  { id: 2, name: 'Nandani', course: 'BCA', marks: 91 },
  { id: 3, name: 'Abhishek', course: 'BIT', marks: 58 },
  { id: 4, name: 'Chandan', course: 'BCA', marks: 64 },
  { id: 5, name: 'Sanya', course: 'BIT', marks: 85 },
  { id: 6, name: 'Ayush', course: 'BCA', marks: 96 },
  { id: 7, name: 'Priya', course: 'BIT', marks: 43 },
  { id: 8, name: 'Rahul', course: 'BCA', marks: 52 }
];

function searchStudents(params, routeCourse) {
  const allowed = ['course', 'minMarks', 'search', 'sort', 'order'];
  for (const key of params.keys()) {
    if (!allowed.includes(key)) throw new Error(`Unknown parameter: ${key}`);
    if (params.getAll(key).length > 1) throw new Error(`${key} must be provided once`);
    if (!params.get(key).trim()) throw new Error(`${key} must not be empty`);
  }
  const minMarks = params.has('minMarks') ? Number(params.get('minMarks')) : undefined;
  if (minMarks !== undefined && !Number.isFinite(minMarks)) throw new Error('minMarks must be a number');
  const sort = params.get('sort');
  const order = params.get('order') || 'asc';
  if (sort && !['name', 'marks'].includes(sort)) throw new Error('sort must be name or marks');
  if (!['asc', 'desc'].includes(order)) throw new Error('order must be asc or desc');
  const course = params.get('course');
  const search = params.get('search');

  // Apply each filter to the previous result: all conditions must match.
  let result = students.filter(student =>
    (!routeCourse || student.course.toLowerCase() === routeCourse.toLowerCase()) &&
    (!course || student.course.toLowerCase() === course.toLowerCase()) &&
    (minMarks === undefined || student.marks >= minMarks) &&
    (!search || student.name.toLowerCase().includes(search.toLowerCase()))
  );
  // filter() makes a new array, so sorting never changes the original data.
  if (sort) {
    const direction = order === 'desc' ? -1 : 1;
    result.sort((a, b) => direction * (sort === 'marks'
      ? a.marks - b.marks
      : a.name.localeCompare(b.name)));
  }
  return result;
}

function createServer() {
  return http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const send = (status, body) => { res.writeHead(status); res.end(JSON.stringify(body)); };
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return send(405, { error: 'Method not allowed' });
    }
    const url = new URL(req.url, 'http://localhost');
    const match = url.pathname.match(/^\/students\/course\/([^/]+)$/);
    if (url.pathname !== '/students' && !match) return send(404, { error: 'Route not found' });
    try {
      const routeCourse = match ? decodeURIComponent(match[1]) : undefined;
      if (routeCourse !== undefined && !routeCourse.trim()) throw new Error('Course is required');
      send(200, searchStudents(url.searchParams, routeCourse));
    } catch (error) {
      send(400, { error: error instanceof URIError ? 'Invalid course encoding' : error.message });
    }
  });
}

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  createServer().listen(PORT, () => console.log(`Search API running at http://localhost:${PORT}`));
}
module.exports = { createServer, searchStudents, students };
