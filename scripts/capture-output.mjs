import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile, copyFile, mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';
import { projects } from './catalog.mjs';

const exec = promisify(execFile);
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const records = {};
const run = async (project, file, args = [], env = {}, expectedExit = 0) => {
  const location = path.join(root, 'projects', project.folder);
  try {
    const result = await exec(process.execPath, [path.join(location, file), ...args], {
      cwd: location,
      env: { ...process.env, ORDER_OUTCOME: '', FAIL_STAGE: '', FAIL_ORDER: '', ...env },
      timeout: 30000
    });
    if (expectedExit) throw new Error(`Expected ${file} to exit with ${expectedExit}`);
    return (result.stdout + result.stderr).trimEnd();
  } catch (error) {
    if (expectedExit && error.code === expectedExit) return (error.stdout + error.stderr).trimEnd();
    throw error;
  }
};
const section = (title, command, output, image, source) => ({ title, command, output, image, source });

const first = projects[0];
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
// Invoke the Windows npm launcher through cmd only for this non-filesystem command.
const npmVersion = process.platform === 'win32'
  ? (await exec('cmd.exe', ['/d', '/c', 'npm.cmd --version'])).stdout.trim()
  : (await exec(npmCommand, ['--version'])).stdout.trim();
const runtime = `node -v\n${process.version}\n\nnpm -v\n${npmVersion}`;
await writeFile(path.join(root, 'projects', first.folder, 'runtime-version.txt'), runtime + '\n');
await copyFile(path.join(root, 'node-version.png'), path.join(root, 'projects', first.folder, 'node-version.png'));
records[first.id] = [section('Student profile & data types', 'node app.js', await run(first, 'app.js'), 'output.png'), section('Verification runtime', 'node -v && npm -v', runtime, 'runtime-version.png')];

async function captureApi(project, filename, groups) {
  const { createServer } = require(path.join(root, 'projects', project.folder, filename));
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    records[project.id] = [];
    for (const [title, image, routes] of groups) {
      const blocks = [];
      for (const route of routes) {
        const response = await fetch(base + route);
        let text = await response.text();
        if (response.headers.get('content-type').includes('application/json')) text = JSON.stringify(JSON.parse(text), null, 2);
        blocks.push(`GET ${route}\nHTTP ${response.status}\nContent-Type: ${response.headers.get('content-type')}\n\n${text}`);
      }
      records[project.id].push(section(title, `node ${filename}\n# GET requests against the running server`, blocks.join('\n\n' + '─'.repeat(48) + '\n\n'), image));
    }
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
}
await captureApi(projects[1], 'server.js', [
  ['Welcome route', 'server-running.png', ['/']],
  ['Routes & JSON profile', 'routes-output.png', ['/', '/about', '/college', '/profile', '/unknown']]
]);
await captureApi(projects[2], 'students-server.js', [
  ['Student directory & bonus', 'students-output.png', ['/students', '/students/1', '/students/2', '/students/99', '/students/abc', '/students/course/BCA']],
  ['Book directory', 'items-output.png', ['/items', '/items/1', '/items/99']]
]);
await captureApi(projects[3], 'advanced-server.js', [
  ['Search, filters, sorting & validation', 'advanced-output.png', [
    '/students', '/students?course=BCA', '/students?minMarks=60', '/students?search=a',
    '/students?sort=marks&order=desc', '/students?sort=xyz', '/students?minMarks=abc',
    '/students?course=BCA&minMarks=60&search=a&sort=marks&order=desc',
    '/students/course/BCA?minMarks=60&sort=marks&order=desc', '/students?sort=name', '/students?order=wrong'
  ]]
]);
console.log('Captured Labs 01–04. Running real asynchronous examples...');

const asyncProject = projects[4];
const randomRuns = [];
let fulfilled = false;
let rejected = false;
for (let i = 0; i < 50 && (i < 5 || !fulfilled || !rejected); i++) {
  const output = await run(asyncProject, 'promise-version.js');
  randomRuns.push(`Run ${i + 1}\n$ node promise-version.js\n${output}`);
  fulfilled ||= output.includes('Fulfilled:');
  rejected ||= output.includes('Rejected:');
}
if (!fulfilled || !rejected) throw new Error('Could not capture both random outcomes; run capture again.');
const outputs = await Promise.all([
  run(asyncProject, 'callback-version.js'),
  run(asyncProject, 'chaining-version.js'),
  run(asyncProject, 'async-await-version.js'),
  run(asyncProject, 'concurrent-orders.js')
]);
records[asyncProject.id] = [
  section('Three nested callbacks', 'node callback-version.js', outputs[0], 'callback-output.png', 'callback-version.js'),
  section('Random Promise outcomes', 'node promise-version.js (at least 5 runs)', randomRuns.join('\n\n'), 'promise-output.png'),
  section('Promise chaining', 'node chaining-version.js', outputs[1], 'chaining-output.png'),
  section('Async / await', 'node async-await-version.js', outputs[2], 'async-await-output.png'),
  section('Concurrent orders', 'node concurrent-orders.js', outputs[3], 'concurrent-output.png')
];

const filesProject = projects[5];
const temp = await mkdtemp(path.join(os.tmpdir(), 'node-lab-evidence-'));
const env = { LAB_DATA_DIR: temp };
try {
  await copyFile(path.join(root, 'projects', filesProject.folder, 'sample.txt'), path.join(temp, 'sample.txt'));
  const asyncRead = await run(filesProject, 'read-async.js', [], env);
  const syncRead = await run(filesProject, 'read-sync.js', [], env);
  const operations = [];
  for (const args of [[], ['This replaces the first message.']]) {
    operations.push(`$ node write-file.js${args.length ? ' "' + args[0] + '"' : ''}\n${await run(filesProject, 'write-file.js', args, env)}\noutput.txt: ${await readFile(path.join(temp, 'output.txt'), 'utf8')}`);
  }
  for (let i = 0; i < 3; i++) operations.push(`$ node append-file.js\n${await run(filesProject, 'append-file.js', [], env)}`);
  operations.push(`output.txt after 3 appends:\n${await readFile(path.join(temp, 'output.txt'), 'utf8')}`);
  operations.push(`$ node delete-file.js\n${await run(filesProject, 'delete-file.js', [], env)}`);
  operations.push(`$ node delete-file.js (again)\n${await run(filesProject, 'delete-file.js', [], env, 1)}\nExit code: 1`);
  operations.push(`$ node async-await-version.js\n${await run(filesProject, 'async-await-version.js', [], env)}`);
  const copied = await readFile(path.join(temp, 'copy.txt'), 'utf8');
  if (copied !== await readFile(path.join(temp, 'sample.txt'), 'utf8')) throw new Error('Copy content differs');
  operations.push(`copy.txt matches sample.txt: true\n${copied.trimEnd()}`);
  const noteLines = [`$ node read-notes.js\n${await run(filesProject, 'read-notes.js', [], env)}`];
  for (const note of ['Submit Lab 06 by Friday', 'Revise the Event Loop before the mid-term']) {
    noteLines.push(`$ node add-note.js "${note}"\n${await run(filesProject, 'add-note.js', [note], env)}`);
  }
  noteLines.push(`$ node read-notes.js\n${await run(filesProject, 'read-notes.js', [], env)}`);
  records[filesProject.id] = [
    section('Async versus sync reads', 'node read-async.js\nnode read-sync.js', `$ node read-async.js\n${asyncRead}\n\n$ node read-sync.js\n${syncRead}`, 'read-comparison.png'),
    section('Write, append, delete & copy', 'node write-file.js\nnode append-file.js\nnode delete-file.js\nnode async-await-version.js', operations.join('\n\n'), 'file-operations.png'),
    section('Persistent notes app', 'node add-note.js "Submit Lab 06 by Friday"\nnode read-notes.js', noteLines.join('\n\n'), 'notes-app-output.png')
  ];
} finally {
  // This is the specific temporary folder just created, never the project folder.
  await rm(temp, { recursive: true, force: true });
}

await mkdir(path.join(root, 'assets'), { recursive: true });
const data = { capturedAt: new Date().toISOString(), nodeVersion: process.version, records };
await writeFile(path.join(root, 'assets', 'captured-output.json'), JSON.stringify(data, null, 2) + '\n');
for (const project of projects) {
  const name = project.id === 'file-system' ? 'evidence.txt' : 'output.txt';
  const text = records[project.id].map(record => `${record.title}\n${'='.repeat(record.title.length)}\n$ ${record.command}\n\n${record.output}`).join('\n\n');
  await writeFile(path.join(root, 'projects', project.folder, name), text + '\n');
}
console.log('Captured all six projects. Run npm run build, then npm run screenshots.');
