import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSession } from '../lib/core.mjs';
import { renderReport, escapeHTML } from '../lib/report.mjs';

test('report treats hostile logs as text and blocks active content', () => {
  const session = parseSession(JSON.stringify({
    schemaVersion: 1,
    events: [{ id: 'a', type: 'message', content: '<script>alert(1)</script><img src=x onerror=alert(2)>', status: 'unknown' }]
  }));
  const html = renderReport(session);
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<img src=x'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes("default-src 'none'"));
  assert.ok(!html.includes('<script '));
});
test('report redacts secrets and does not mutate caller data', () => {
  const session = parseSession(JSON.stringify({
    schemaVersion: 1,
    events: [{ id: 'a', type: 'tool_call', tool: 'request', input: { api_key: 'very-secret-fixture-value' }, status: 'unknown' }]
  }));
  const before = JSON.stringify(session);
  assert.ok(!renderReport(session).includes('very-secret-fixture-value'));
  assert.equal(JSON.stringify(session), before);
});
test('escapes all HTML delimiter characters', () => {
  assert.equal(escapeHTML('<>&"\''), '&lt;&gt;&amp;&quot;&#39;');
});
