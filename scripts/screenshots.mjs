import { chromium } from '@playwright/test';
import { readFile, mkdir } from 'node:fs/promises';
import { once } from 'node:events';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSiteServer } from './serve.mjs';
import { projects } from './catalog.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(await readFile(path.join(root, 'assets', 'captured-output.json'), 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const server = createSiteServer();
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 });
  const styles = `
    @font-face{font-family:Space;src:url('${base}/assets/fonts/space-grotesk-500.ttf')}
    *{box-sizing:border-box}body{margin:0;padding:34px;background:#f7f6f2;color:#232722;font-family:Space,Arial,sans-serif}
    .capture{width:1100px;border:1px solid #d9ded4;border-radius:12px;overflow:hidden;background:#fff}
    .capture-head{padding:25px 30px;border-bottom:1px solid #d9ded4;display:flex;justify-content:space-between;align-items:center;gap:20px}
    .eyebrow{font-size:10px;color:#73756d;letter-spacing:2px;margin:0 0 10px}h1{font-size:28px;margin:0;letter-spacing:-.8px;font-weight:500}
    .badge{font:10px Consolas,monospace;background:#edf1e5;border:1px solid #d2dbc5;color:#557143;padding:8px 10px;border-radius:5px;white-space:nowrap}
    .capture-body{padding:26px;background:#f3f4ee}.terminal{border:1px solid #414d3d;border-radius:7px;overflow:hidden;background:#1e2721;color:#d5e3cc;min-width:0}
    .terminal-top{padding:13px 17px;background:#2b342c;border-bottom:1px solid #424f3e;display:flex;justify-content:space-between;font:10px Consolas,monospace;color:#a4b49a}
    .dots{display:flex;gap:6px}.dots i{width:7px;height:7px;border-radius:50%;background:#df8d79}.dots i:nth-child(2){background:#d3b768}.dots i:nth-child(3){background:#96b97d}
    pre{font:12px/1.9 Consolas,monospace;white-space:pre-wrap;overflow-wrap:anywhere;margin:0;padding:24px}.command{color:#b6d294;border-bottom:1px solid #394636;padding-bottom:16px;margin-bottom:18px;white-space:pre-wrap}
    .code-row{display:flex;white-space:pre-wrap;overflow-wrap:anywhere}.number{width:40px;color:#7b8c71;flex-shrink:0;user-select:none}.text{min-width:0}
    .side-by-side{display:grid;grid-template-columns:1.2fr 1fr;gap:18px}.capture-foot{display:flex;justify-content:space-between;padding:16px 28px;font:9px Consolas,monospace;letter-spacing:.4px;color:#73756d}
  `;
  const terminal = (title, body) => `<div class="terminal"><div class="terminal-top"><div class="dots"><i></i><i></i><i></i></div><span>${escape(title)}</span><span>NODE.JS LAB</span></div>${body}</div>`;
  const sourceMarkup = source => `<pre>${source.trimEnd().split('\n').map((line, i) => `<span class="code-row"><span class="number">${String(i + 1).padStart(2, '0')}</span><span class="text">${escape(line) || ' '}</span></span>`).join('')}</pre>`;
  async function shot(project, title, badge, body, filename) {
    await page.setContent(`<html lang="en"><head><meta charset="utf-8"><style>${styles}</style></head><body><section class="capture"><header class="capture-head"><div><div class="eyebrow">AYUSH RAM TRIPATHI / LAB ${project.number}</div><h1>${escape(title)}</h1></div><span class="badge">${badge}</span></header><div class="capture-body">${body}</div><footer class="capture-foot"><span>${escape(project.folder)} / ${escape(data.nodeVersion)}</span><span>CAPTURED ${escape(data.capturedAt)}</span></footer></section></body></html>`);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.capture').screenshot({ path: path.join(root, 'projects', project.folder, filename) });
  }
  let count = 0;
  for (const project of projects) {
    const location = path.join(root, 'projects', project.folder);
    const source = await readFile(path.join(location, project.entry), 'utf8');
    await shot(project, project.entry, 'SOURCE SNAPSHOT', terminal(project.entry, sourceMarkup(source)), 'code.png');
    count++;
    for (const output of data.records[project.id]) {
      if (!output.image) continue;
      let body;
      const outputTerminal = terminal('Recorded execution', `<pre><div class="command">$ ${escape(output.command)}</div>${escape(output.output)}</pre>`);
      if (output.source) {
        const callbackSource = await readFile(path.join(location, output.source), 'utf8');
        body = `<div class="side-by-side">${terminal(output.source, sourceMarkup(callbackSource))}${outputTerminal}</div>`;
      } else if (output.image === 'read-comparison.png') {
        const [asyncOutput, syncOutput] = output.output.split('\n\n$ node read-sync.js\n');
        body = `<div class="side-by-side">${terminal('Asynchronous read', `<pre>${escape(asyncOutput)}</pre>`)}${terminal('Synchronous read', `<pre>$ node read-sync.js\n${escape(syncOutput)}</pre>`)}</div>`;
      } else body = outputTerminal;
      await shot(project, output.title, 'REAL PROGRAM EXECUTION', body, output.image);
      count++;
    }
    console.log(`Captured Lab ${project.number} code and output screenshots.`);
  }
  // Preserve screenshots of the actual finished website as review artifacts.
  await mkdir(path.join(root, 'docs'), { recursive: true });
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.goto(base);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(root, 'docs', 'website-desktop.png'), fullPage: true });
  await page.goto(base + '/#project/advanced-search');
  await page.screenshot({ path: path.join(root, 'docs', 'website-project.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/#home');
  await page.screenshot({ path: path.join(root, 'docs', 'website-mobile.png'), fullPage: true });
  console.log(`Saved ${count} project screenshots and 3 website previews.`);
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
