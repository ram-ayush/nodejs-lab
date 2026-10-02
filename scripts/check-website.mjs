import { chromium, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { once } from 'node:events';
import assert from 'node:assert/strict';
import { projects } from './catalog.mjs';
import { createSiteServer } from './serve.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const server = createSiteServer();
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;
const errors = [];
let browser;
let checks = 0;
const passed = message => { checks++; console.log(`✓ ${message}`); };
try {
  browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto(base);
  await expect(page.locator('.project-card')).toHaveCount(6);
  await expect(page.locator('h1')).toContainText('Small projects.');
  passed('Home lists all six projects');
  for (const [name, count] of [['APIs', 3], ['Fundamentals', 1], ['Async', 1], ['Files', 1], ['All projects', 6]]) {
    await page.getByRole('button', { name, exact: name !== 'All projects' }).click();
    await expect(page.locator('.project-card')).toHaveCount(count);
  }
  passed('Every category filter returns the correct projects');
  await page.getByRole('searchbox').fill('Dinner');
  await expect(page.locator('.project-card')).toHaveCount(1);
  await page.getByRole('searchbox').fill('something missing');
  await expect(page.locator('.project-card')).toHaveCount(0);
  await page.getByRole('button', { name: 'Show all projects' }).click();
  await expect(page.locator('.project-card')).toHaveCount(6);
  await page.keyboard.press('/');
  await expect(page.getByRole('searchbox')).toBeFocused();
  passed('Search, empty state, reset, and keyboard shortcut work');

  for (const project of projects) {
    await page.goto(`${base}/#project/${project.id}`);
    await expect(page.locator('h1')).toHaveText(project.title);
    const sourceButtons = page.locator('[data-file]');
    const names = await sourceButtons.evaluateAll(buttons => buttons.map(button => button.dataset.file));
    for (const name of names) {
      await page.locator(`[data-file="${name}"]`).click();
      const actual = await page.locator('.line-text').allTextContents();
      const source = (await readFile(path.join(root, 'projects', project.folder, name), 'utf8')).trimEnd();
      // Empty source lines carry a single space for the visual line height.
      assert.equal(actual.map(line => line === ' ' ? '' : line).join('\n'), source);
      const response = await page.request.get(`${base}/projects/${project.folder}/${encodeURIComponent(name)}`);
      assert.equal(response.status(), 200);
    }
    await page.locator(`[data-file="${project.entry}"]`).click();
    await page.getByRole('button', { name: 'Copy', exact: true }).click();
    // The Windows clipboard normalizes LF to CRLF without changing the code.
    assert.equal((await page.evaluate(() => navigator.clipboard.readText())).replaceAll('\r\n', '\n'), await readFile(path.join(root, 'projects', project.folder, project.entry), 'utf8'));
    await page.getByRole('button', { name: 'Wrap', exact: true }).click();
    await expect(page.locator('.code-scroller')).toHaveClass(/wrapped/);
    await page.getByRole('button', { name: 'Wrap', exact: true }).click();
    passed(`Lab ${project.number}: all ${names.length} files match disk; copy and wrap work`);

    await page.getByRole('tab', { name: 'Output', exact: true }).click();
    const records = JSON.parse(await readFile(path.join(root, 'assets', 'captured-output.json'), 'utf8')).records[project.id];
    for (let i = 0; i < records.length; i++) {
      await page.locator(`[data-output="${i}"]`).click();
      await expect(page.locator('.actual-output')).toHaveText(records[i].output);
    }
    passed(`Lab ${project.number}: every output view matches recorded execution`);
    await page.getByRole('tab', { name: 'Screenshots', exact: true }).click();
    await expect(page.locator('.screenshot-card')).toHaveCount(project.captures.length);
    for (const name of project.captures) {
      const response = await page.request.get(`${base}/projects/${project.folder}/${name}`);
      assert.equal(response.status(), 200);
      assert.ok((await response.body()).byteLength > 1000);
    }
    await page.locator('[data-screenshot]').first().click();
    await expect(page.locator('#image-dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#image-dialog')).not.toBeVisible();
    passed(`Lab ${project.number}: screenshots load, zoom, and close with Escape`);
    await page.getByRole('tab', { name: 'Lab guide', exact: true }).click();
    await expect(page.locator('.task-item')).toHaveCount(project.tasks.length);
    assert.equal((await page.request.get(`${base}/tasks/${encodeURIComponent(project.pdf)}`)).status(), 200);
    // Arrow key movement implements the tab pattern and activates the next view.
    await page.getByRole('tab', { name: 'Lab guide', exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: /Source code/ })).toHaveAttribute('aria-selected', 'true');
    passed(`Lab ${project.number}: assignment guide and keyboard tab navigation work`);
  }

  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  passed('Theme selection survives reload');
  await page.goBack();
  await expect(page.locator('main')).not.toBeEmpty();
  passed('Browser history remains functional');
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(base + '/#home');
    await expect(page.locator('.project-card')).toHaveCount(6);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Home overflows at ${width}px`);
    for (const project of projects) {
      await page.goto(`${base}/#project/${project.id}`);
      for (const tab of ['Source code', 'Output', 'Screenshots', 'Lab guide']) {
        await page.getByRole('tab', { name: tab, exact: tab !== 'Source code' }).click();
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${project.id}/${tab} overflows at ${width}px`);
      }
    }
    passed(`Home and every project view fit ${width}px screens`);
  }
  await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
  await expect(page.locator('.project-card')).toHaveCount(6);
  await page.locator('.project-card').first().click();
  await expect(page.locator('.line-text')).not.toHaveCount(0);
  passed('Portfolio also works when index.html is opened directly');
  assert.deepEqual(errors, [], 'Browser errors or failed resources');
  console.log(`\n${checks} browser checks passed. No page errors or failed resources.`);
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
