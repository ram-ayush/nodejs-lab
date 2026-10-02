const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { once } = require('node:events');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const exec = promisify(execFile);
const root = path.resolve(__dirname, '..');
const project = folder => path.join(root, 'projects', folder);

async function run(folder, filename, args = [], env = {}, exit = 0) {
  try {
    const result = await exec(process.execPath, [path.join(project(folder), filename), ...args], {
      cwd: root, timeout: 20000,
      env: { ...process.env, ORDER_OUTCOME: '', FAIL_STAGE: '', FAIL_ORDER: '', DELAY_MS: '15', ...env }
    });
    assert.equal(exit, 0, 'Expected a nonzero exit');
    return result.stdout + result.stderr;
  } catch (error) {
    if (exit && error.code === exit) return error.stdout + error.stderr;
    throw error;
  }
}
async function withServer(folder, filename, body) {
  const { createServer } = require(path.join(project(folder), filename));
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const get = async (url, options) => {
    const response = await fetch(base + url, options);
    const text = await response.text();
    return { status: response.status, headers: response.headers, data: response.headers.get('content-type')?.includes('application/json') ? JSON.parse(text) : text };
  };
  try { await body(get); }
  finally { await new Promise(resolve => server.close(resolve)); }
}

test('Lab 01: introduction, required console messages, and all five data types', async () => {
  const text = await run('lab-01-getting-started', 'app.js');
  for (const expected of ['Ayush Ram Tripathi', '23145004', 'BCA', 'VII', 'DSVV', 'Hello Node.js', 'Learning Backend Development', "Today's Lab Completed Successfully", 'typeof: string', 'typeof: number', 'typeof: boolean', 'typeof: undefined', 'result: null | typeof: object']) assert.ok(text.includes(expected), expected);
});

test('Lab 02: welcome, profile, all text routes, query strings and status codes', async t => {
  await withServer('lab-02-http-server', 'server.js', async get => {
    for (const [route, expected] of [['/', '23145004'], ['/about', 'Ayush'], ['/college', 'Semester: VII'], ['/?test=1', 'Welcome']]) {
      await t.test(route, async () => { const response = await get(route); assert.equal(response.status, 200); assert.ok(response.data.includes(expected)); });
    }
    await t.test('JSON profile includes all required fields', async () => {
      const response = await get('/profile');
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type'), /^application\/json/);
      assert.deepEqual(response.data, { name: 'Ayush Ram Tripathi', scholarNumber: '23145004', course: 'BCA', semester: 'VII', college: 'DSVV' });
    });
    await t.test('unknown route', async () => { const r = await get('/nope'); assert.equal(r.status, 404); assert.equal(r.data, 'Page Not Found'); });
    await t.test('method rejection', async () => { const r = await get('/profile', { method: 'POST' }); assert.equal(r.status, 405); assert.equal(r.headers.get('allow'), 'GET'); });
  });
});

test('Lab 03: directories, every ID route, course bonus, and invalid IDs', async t => {
  await withServer('lab-03-student-directory', 'students-server.js', async get => {
    await t.test('full student directory', async () => { assert.equal((await get('/students')).data.length, 3); });
    for (let id = 1; id <= 3; id++) await t.test(`student ${id}`, async () => { const r = await get(`/students/${id}`); assert.equal(r.status, 200); assert.equal(r.data.id, id); });
    await t.test('five books', async () => { assert.ok((await get('/items')).data.length >= 5); });
    for (let id = 1; id <= 5; id++) await t.test(`book ${id}`, async () => { assert.equal((await get(`/items/${id}`)).data.id, id); });
    await t.test('course filter', async () => { const r = await get('/students/course/bca'); assert.equal(r.data.length, 2); assert.ok(r.data.every(s => s.course === 'BCA')); });
    for (const route of ['/students/99', '/items/99', '/unknown', '/students/1/extra']) await t.test(`404 ${route}`, async () => { assert.equal((await get(route)).status, 404); });
    for (const route of ['/students/abc', '/students/1.5', '/students/-1', '/items/abc', '/students/9007199254740992', '/students/course/%E0%A4%A']) await t.test(`400 ${route}`, async () => { const r = await get(route); assert.equal(r.status, 400); assert.ok(r.data.error); });
    await t.test('query string does not corrupt ID', async () => { assert.equal((await get('/students/2?x=1')).data.name, 'Nandani'); });
  });
});

test('Lab 04: combined AND filters, partial search, sorting, bonus and validation', async t => {
  await withServer('lab-04-advanced-search', 'advanced-server.js', async get => {
    const all = (await get('/students')).data;
    await t.test('eight varied student records', () => { assert.equal(all.length, 8); assert.equal(new Set(all.map(s => s.course)).size, 2); assert.ok(all.every(s => Number.isFinite(s.marks))); });
    for (const [query, expected] of [
      ['course=BCA', all.filter(s => s.course === 'BCA')],
      ['minMarks=60', all.filter(s => s.marks >= 60)],
      ['course=BCA&minMarks=70', all.filter(s => s.course === 'BCA' && s.marks >= 70)],
      ['search=AN', all.filter(s => s.name.toLowerCase().includes('an'))],
      ['course=BIT&minMarks=0', all.filter(s => s.course === 'BIT')],
      ['minMarks=100', []]
    ]) await t.test(query, async () => { assert.deepEqual((await get('/students?' + query)).data, expected); });
    for (const sort of ['name', 'marks']) for (const order of ['asc', 'desc']) {
      await t.test(`sort ${sort} ${order}`, async () => {
        const expected = [...all].sort((a, b) => (order === 'asc' ? 1 : -1) * (sort === 'name' ? a.name.localeCompare(b.name) : a.marks - b.marks));
        assert.deepEqual((await get(`/students?sort=${sort}&order=${order}`)).data, expected);
      });
    }
    await t.test('ascending default', async () => { assert.deepEqual((await get('/students?sort=marks')).data, [...all].sort((a, b) => a.marks - b.marks)); });
    await t.test('everything combined', async () => {
      const expected = all.filter(s => s.course === 'BCA' && s.marks >= 60 && s.name.toLowerCase().includes('a')).sort((a, b) => b.marks - a.marks);
      assert.deepEqual((await get('/students?course=BCA&minMarks=60&search=a&sort=marks&order=desc')).data, expected);
    });
    await t.test('bonus path and queries', async () => { const expected = all.filter(s => s.course === 'BCA' && s.marks >= 60).sort((a, b) => b.marks - a.marks); assert.deepEqual((await get('/students/course/BCA?minMarks=60&sort=marks&order=desc')).data, expected); });
    await t.test('conflicting course filters apply AND logic', async () => { assert.deepEqual((await get('/students/course/BCA?course=BIT')).data, []); });
    for (const query of ['minMarks=abc', 'minMarks=Infinity', 'minMarks=NaN', 'minMarks=', 'minMarks=%20', 'sort=xyz', 'order=wrong', 'course=', 'search=', 'sort=', 'course=BCA&course=BIT', 'extra=value']) {
      await t.test(`400 ${query}`, async () => { const r = await get('/students?' + query); assert.equal(r.status, 400); assert.ok(r.data.error); });
    }
    await t.test('sorting never mutates the original dataset', async () => { assert.deepEqual((await get('/students')).data, all); });
    await t.test('invalid course encoding', async () => { assert.equal((await get('/students/course/%E0%A4%A')).status, 400); });
    await t.test('unknown route and method', async () => { assert.equal((await get('/unknown')).status, 404); assert.equal((await get('/students', { method: 'DELETE' })).status, 405); });
  });
});

test('Lab 05: ordered lifecycle, both Promise outcomes, every stage failure and concurrent timing', async t => {
  const folder = 'lab-05-food-delivery';
  await t.test('callback sequence', async () => {
    const text = await run(folder, 'callback-version.js');
    assert.match(text, /Order placed: Pizza[\s\S]*Preparing: Pizza[\s\S]*Out for Delivery: Pizza[\s\S]*Pizza: Delivered/);
  });
  for (const file of ['chaining-version.js', 'async-await-version.js']) {
    await t.test(file, async () => { const text = await run(folder, file); assert.match(text, /Order Placed: Pasta[\s\S]*Preparing: Pasta[\s\S]*Out for Delivery: Pasta[\s\S]*Delivered: Pasta/); });
    for (const stage of ['Order Placed', 'Preparing', 'Out for Delivery']) await t.test(`${file} handles ${stage} failure`, async () => { const text = await run(folder, file, [], { FAIL_STAGE: stage }); assert.ok(text.includes(`Order failed: ${stage} failed`)); assert.ok(!text.includes('Delivered:')); });
  }
  await t.test('Promise success and rejection', async () => {
    assert.match(await run(folder, 'promise-version.js', [], { ORDER_OUTCOME: 'success' }), /Fulfilled: Burger is out for delivery/);
    assert.match(await run(folder, 'promise-version.js', [], { ORDER_OUTCOME: 'fail' }), /Rejected: Sorry/);
  });
  await t.test('Promise.all handles rejection', async () => { assert.match(await run(folder, 'concurrent-orders.js', [], { FAIL_ORDER: 'Burger' }), /Order failed: Could not prepare Burger/); });
  await t.test('Promise.all duration is roughly the longest real timer', async () => {
    const text = await run(folder, 'concurrent-orders.js', [], { DELAY_MS: undefined });
    const delays = [...text.matchAll(/\((\d+)ms\)/g)].map(m => Number(m[1]));
    const duration = Number(text.match(/All orders: ([\d.]+)(ms|s)/)[1]) * (text.match(/All orders: ([\d.]+)(ms|s)/)[2] === 's' ? 1000 : 1);
    assert.equal(delays.length, 3);
    assert.ok(duration >= Math.max(...delays) - 20);
    assert.ok(duration < delays.reduce((sum, value) => sum + value, 0) - 500);
    assert.ok(text.includes('Coffee is out for delivery!'));
  });
});

test('Lab 06: execution order, overwrite, repeat append, delete, copy, and saved notes', async t => {
  const folder = 'lab-06-file-system';
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'node-lab-test-'));
  const env = { LAB_DATA_DIR: temp };
  const sample = await fs.readFile(path.join(project(folder), 'sample.txt'), 'utf8');
  await fs.writeFile(path.join(temp, 'sample.txt'), sample);
  try {
    await t.test('opposite async and sync read order', async () => {
      const asyncText = await run(folder, 'read-async.js', [], env);
      const syncText = await run(folder, 'read-sync.js', [], env);
      assert.ok(asyncText.indexOf('BEFORE') < asyncText.indexOf('Welcome'));
      assert.ok(syncText.indexOf('Welcome') < syncText.indexOf('AFTER'));
    });
    await t.test('writeFile overwrites previous contents', async () => {
      await run(folder, 'write-file.js', [], env);
      assert.equal(await fs.readFile(path.join(temp, 'output.txt'), 'utf8'), 'Hello from Lab 06!');
      await run(folder, 'write-file.js', ['Replacement'], env);
      assert.equal(await fs.readFile(path.join(temp, 'output.txt'), 'utf8'), 'Replacement');
    });
    await t.test('three appends preserve existing text', async () => {
      for (let i = 0; i < 3; i++) await run(folder, 'append-file.js', [], env);
      assert.equal(await fs.readFile(path.join(temp, 'output.txt'), 'utf8'), 'Replacement' + '\nThis line was appended.'.repeat(3));
    });
    await t.test('delete succeeds once, second delete explains ENOENT', async () => {
      await run(folder, 'delete-file.js', [], env);
      await assert.rejects(fs.stat(path.join(temp, 'output.txt')), { code: 'ENOENT' });
      assert.match(await run(folder, 'delete-file.js', [], env, 1), /ENOENT.*already been deleted/);
    });
    await t.test('async/await copies identical content', async () => { await run(folder, 'async-await-version.js', [], env); assert.equal(await fs.readFile(path.join(temp, 'copy.txt'), 'utf8'), sample); });
    await t.test('missing notes and empty input', async () => {
      assert.match(await run(folder, 'read-notes.js', [], env), /No notes found yet/);
      assert.match(await run(folder, 'add-note.js', ['   '], env, 1), /Please provide a note/);
    });
    await t.test('two notes persist and have timestamps', async () => {
      await run(folder, 'add-note.js', ['Submit Lab 06 by Friday'], env);
      await run(folder, 'add-note.js', ['Revise the Event Loop before the mid-term'], env);
      const text = await run(folder, 'read-notes.js', [], env);
      assert.match(text, /\[\d{4}-\d\d-\d\dT.*\] Submit Lab 06 by Friday/);
      assert.ok(text.includes('Revise the Event Loop before the mid-term'));
      assert.equal(text.trim().split('\n').length, 2);
    });
    await t.test('missing sample read and copy errors are reported', async () => {
      await fs.unlink(path.join(temp, 'sample.txt'));
      assert.match(await run(folder, 'read-async.js', [], env, 1), /Error reading file/);
      assert.match(await run(folder, 'read-sync.js', [], env, 1), /Error reading file/);
      assert.match(await run(folder, 'async-await-version.js', [], env, 1), /Something went wrong/);
    });
  } finally { await fs.rm(temp, { recursive: true, force: true }); }
});
