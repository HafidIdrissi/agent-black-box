import test from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from '../lib/server.mjs';

test('local server serves only assets and rejects writes and foreign hosts', async t => {
  const { server, url } = await startServer({ port: 0 });
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  assert.equal(server.address().address, '127.0.0.1');
  const index = await fetch(url);
  assert.equal(index.status, 200);
  assert.match(await index.text(), /Agent Black Box/);
  assert.match(index.headers.get('content-security-policy'), /connect-src 'none'/);
  for (const path of ['/package.json', '/.git/config', '/examples/permission-loop.jsonl', '/%2e%2e/package.json']) {
    const response = await fetch(new URL(path, url));
    assert.equal(response.status, 404, path);
  }
  const write = await fetch(url, { method: 'POST', body: 'not accepted' });
  assert.equal(write.status, 405);
  const foreign = await fetch(url, { headers: { Host: 'attacker.example' } });
  assert.equal(foreign.status, 403);
  const module = await fetch(new URL('/lib/core.mjs', url));
  assert.equal(module.status, 200);
  assert.match(module.headers.get('content-type'), /javascript/);
  const head = await fetch(url, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
});
