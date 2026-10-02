import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.txt': 'text/plain', '.md': 'text/plain', '.ttf': 'font/ttf', '.woff2': 'font/woff2' };
export function createSiteServer() {
  return http.createServer(async (req, res) => {
    try {
      if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end(); }
      const requested = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (requested.split('/').some(part => part.startsWith('.') || part === 'node_modules') || requested.includes('\\')) {
        res.writeHead(403); return res.end('Forbidden');
      }
      const filename = path.resolve(root, '.' + (requested === '/' ? '/index.html' : requested));
      if (!filename.startsWith(root + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
      if (!(await stat(filename)).isFile()) { res.writeHead(404); return res.end('Not found'); }
      const content = await readFile(filename);
      res.writeHead(200, { 'Content-Type': `${mime[path.extname(filename)] || 'application/octet-stream'}${['.html', '.js', '.css', '.json', '.txt', '.md'].includes(path.extname(filename)) ? '; charset=utf-8' : ''}`, 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : content);
    } catch (error) {
      res.writeHead(error instanceof URIError ? 400 : 404);
      res.end(error instanceof URIError ? 'Invalid URL' : 'Not found');
    }
  });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4173);
  createSiteServer().listen(port, '127.0.0.1', () => console.log(`Node.js Lab → http://localhost:${port}`));
}
