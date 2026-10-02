export const projects = [
  {
    id: 'getting-started', folder: 'lab-01-getting-started', number: '01',
    title: 'Hello, Node.js', category: 'Fundamentals', icon: 'terminal', accent: 'orange',
    description: 'The first hello. Meet the runtime, print your student profile, and explore JavaScript data types.',
    tags: ['Console', 'Variables', 'Data types'], entry: 'app.js',
    command: 'node app.js',
    tasks: [
      ['01', 'Verify the runtime', 'Node.js and npm version evidence is included. The original installation screenshot records Node v22.16.0 and npm 10.9.2.'],
      ['02–03', 'Create and initialize a project', 'A separate project folder and package.json with a working start command.'],
      ['04–06', 'Print a student introduction', 'Name, scholar number, course, semester, college, and the three required console messages.'],
      ['07', 'Explore five data types', 'String, Number, Boolean, Undefined, and Null with typeof output.'],
      ['08', 'Compare JavaScript environments', 'Seven differences between browsers and Node.js in difference.txt.']
    ],
    captures: ['output.png', 'code.png', 'runtime-version.png', 'node-version.png'],
    pdf: 'Nodejs- Assignment 1.pdf'
  },
  {
    id: 'http-server', folder: 'lab-02-http-server', number: '02',
    title: 'Your first server', category: 'APIs', icon: 'network', accent: 'blue',
    description: 'A small HTTP server with a welcome page, personal routes, a JSON profile, and a proper 404.',
    tags: ['HTTP', 'Routing', 'JSON'], entry: 'server.js', command: 'node server.js',
    tasks: [
      ['01–03', 'Start a Node.js HTTP server', 'An independent package uses the built-in http module and serves a student welcome message.'],
      ['04', 'Handle multiple routes', '/about describes the student; /college returns college and semester.'],
      ['05', 'Send a JSON response', '/profile returns the complete student profile with an application/json header.'],
      ['06–07', 'Handle errors and configure the port', 'Unknown routes return 404. PORT defaults to 3000 and can be changed through the environment.'],
      ['08', 'Explain the architecture', 'Event loop, single-threaded JavaScript, worker threads, and libuv notes.']
    ],
    captures: ['server-running.png', 'routes-output.png', 'code.png'],
    pdf: 'Node-Lab-Assignment-02.docx (1).pdf'
  },
  {
    id: 'student-directory', folder: 'lab-03-student-directory', number: '03',
    title: 'The directory API', category: 'APIs', icon: 'directory', accent: 'green',
    description: 'Find a student by ID, browse a five-book library, or filter a course. Every route tells a story.',
    tags: ['Parameters', 'Arrays', 'Validation'], entry: 'students-server.js', command: 'node students-server.js',
    tasks: [
      ['01–02', 'Build a student directory', '/students returns all students; /students/:id returns one or a clear 404.'],
      ['03', 'Create an original directory', 'A five-book collection is available through /items and /items/:id.'],
      ['04', 'Complete the bonus challenges', '/students/course/BCA uses filter(). Nonnumeric IDs produce status 400 with a useful message.'],
      ['README', 'Document URL splitting', 'The README explains how split("/") extracts an ID or course from the path.']
    ],
    captures: ['students-output.png', 'items-output.png', 'code.png'],
    pdf: 'Node-Lab-03_Student-Directory-API (1).pdf'
  },
  {
    id: 'advanced-search', folder: 'lab-04-advanced-search', number: '04',
    title: 'Find. Filter. Sort.', category: 'APIs', icon: 'search', accent: 'purple',
    description: 'Turn eight student records into a useful search API with composable filters and predictable sorting.',
    tags: ['Search', 'Filters', 'Sorting'], entry: 'advanced-server.js', command: 'node advanced-server.js',
    tasks: [
      ['01–02', 'Create a richer dataset', 'Eight student records with numeric marks, two courses, and varied scores.'],
      ['03–04', 'Combine filters and partial search', 'course and minMarks combine with AND logic. search matches names without case sensitivity.'],
      ['05–06', 'Sort the filtered results', 'sort=name or sort=marks, order=asc or desc. All options work together; ascending is the default.'],
      ['07', 'Validate inputs', 'Invalid numbers, sort fields, orders, empty values, repeated fields, and unknown parameters return 400 JSON errors.'],
      ['08', 'Complete the bonus route', '/students/course/BCA accepts all the same query options.']
    ],
    captures: ['advanced-output.png', 'code.png'],
    pdf: 'Node-Lab-04 Advanced-Search-API.pdf'
  },
  {
    id: 'food-delivery', folder: 'lab-05-food-delivery', number: '05',
    title: 'Dinner, asynchronously', category: 'Async', icon: 'clock', accent: 'pink',
    description: 'Follow an order from kitchen to doorstep with callbacks, promises, async/await, and concurrent orders.',
    tags: ['Callbacks', 'Promises', 'Async/await'], entry: 'async-await-version.js', command: 'node async-await-version.js',
    tasks: [
      ['01–02', 'Nest callback stages', 'Place, track, and confirm a Pizza order with real timers and three callback levels.'],
      ['03', 'Explore Promise outcomes', 'An 80% random success rate. Output evidence includes at least five real runs and both fulfilled and rejected outcomes.'],
      ['04', 'Chain the order lifecycle', 'Three Promise stages with one final catch and the original item passed through every step.'],
      ['05', 'Refactor with async/await', 'The same functions run sequentially inside an async function and try/catch.'],
      ['06–07', 'Run concurrent orders and reflect', 'Promise.all starts three orders together and measures elapsed time. Reflection notes explain the longest delay and event loop.']
    ],
    captures: ['callback-output.png', 'promise-output.png', 'chaining-output.png', 'async-await-output.png', 'concurrent-output.png', 'code.png'],
    pdf: 'Node-Lab-Assignment-05-Async-JS-Food-Delivery.pdf'
  },
  {
    id: 'file-system', folder: 'lab-06-file-system', number: '06',
    title: 'A place for your notes', category: 'Files', icon: 'file', accent: 'yellow',
    description: 'Read, write, append, and delete files, then bring it together in a tiny persistent command-line notes app.',
    tags: ['File system', 'CLI', 'Persistence'], entry: 'add-note.js', command: 'node add-note.js "Buy groceries"\nnode read-notes.js',
    tasks: [
      ['01–03', 'Compare async and sync reads', 'Read the same sample.txt using callbacks and readFileSync; observe opposite output order.'],
      ['04–06', 'Write, append, and delete', 'Demonstrate overwriting, repeated appending, and a clear ENOENT message on the second delete.'],
      ['07', 'Copy with async/await', 'fs.promises reads sample.txt and writes identical content to copy.txt inside try/catch.'],
      ['08', 'Build the notes app', 'add-note.js stores timestamped notes; read-notes.js lists them. Missing notes and empty input are handled.'],
      ['09', 'Explain blocking and concurrency', 'Reflection notes discuss execution order and risks when concurrent processes append to one file.']
    ],
    captures: ['read-comparison.png', 'notes-app-output.png', 'file-operations.png', 'code.png'],
    pdf: 'Node-Lab-Assignment-06-File-System (1).pdf'
  }
];
