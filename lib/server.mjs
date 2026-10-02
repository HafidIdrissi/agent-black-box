import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const ASSETS = new Map([
  ['/web/', ['../web/index.html', 'text/html; charset=utf-8']],
  ['/web/index.html', ['../web/index.html', 'text/html; charset=utf-8']],
  ['/web/app.mjs', ['../web/app.mjs', 'text/javascript; charset=utf-8']],
  ['/web/demo.mjs', ['../web/demo.mjs', 'text/javascript; charset=utf-8']],
  ['/web/style.css', ['../web/style.css', 'text/css; charset=utf-8']],
  ['/lib/core.mjs', ['./core.mjs', 'text/javascript; charset=utf-8']],
  ['/lib/report.mjs', ['./report.mjs', 'text/javascript; charset=utf-8']]
]);

export async function startServer({ port = 8787 } = {}) {
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Port must be an integer from 0 to 65535.');
  let boundPort;
  const server = createServer(async (req, res) => {
    const actualPort = boundPort;
    const allowedHosts = new Set(['127.0.0.1:' + actualPort, 'localhost:' + actualPort]);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'none'; img-src 'self' data:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
    if (!allowedHosts.has(req.headers.host)) {
      res.writeHead(403).end('Unrecognized host.');
      return;
    }
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.setHeader('Allow', 'GET, HEAD');
      res.writeHead(405).end('Read-only static server.');
      return;
    }
    let pathname;
    try {
      if (!req.url.startsWith('/') || req.url.startsWith('//')) throw new Error();
      pathname = new URL(req.url, 'http://127.0.0.1').pathname;
    } catch {
      res.writeHead(400).end('Invalid request.');
      return;
    }
    if (pathname === '/') {
      res.writeHead(302, { Location: '/web/' }).end();
      return;
    }
    const asset = ASSETS.get(pathname);
    if (!asset) {
      res.writeHead(404).end('Not found.');
      return;
    }
    try {
      const body = await readFile(new URL(asset[0], import.meta.url));
      res.setHeader('Content-Type', asset[1]);
      res.setHeader('Content-Length', body.length);
      res.writeHead(200).end(req.method === 'HEAD' ? undefined : body);
    } catch {
      res.writeHead(500).end('An application asset could not be read.');
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      server.removeListener('error', reject);
      boundPort = server.address().port;
      resolve();
    });
  });
  return { server, url: 'http://127.0.0.1:' + server.address().port + '/web/' };
}
