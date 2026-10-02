import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSession, analyzeSession, redactSession, redactText, stableStringify, MAX_BYTES, MAX_EVENTS } from '../lib/core.mjs';
const jsonl = (...records) => records.map(record => JSON.stringify(record)).join('\n');
const call = (id, input = { command: 'cat missing.txt' }, timestamp = '2026-10-02T10:00:00Z') => ({
  type: 'assistant', timestamp, message: { content: [{ type: 'tool_use', id, name: 'Bash', input }] },
});
const result = (id, isError = false, timestamp = '2026-10-02T10:00:01Z') => ({
  type: 'user', timestamp, message: { content: [{ type: 'tool_result', tool_use_id: id, is_error: isError, content: 'output' }] },
});
const normalized = events => JSON.stringify({ schemaVersion: 1, events });
test('correlates results by ID when calls complete out of order', () => {
  const session = parseSession(jsonl(call('a'), call('b'), result('b', true), result('a')));
  assert.equal(session.source, 'claude-code');
  assert.equal(session.events[0].status, 'ok'); assert.equal(session.events[1].status, 'error');
  assert.equal(session.events[2].tool, 'Bash'); assert.equal(session.events[1].durationMs, 1000);
  assert.equal(analyzeSession(session).errors, 1);
});
test('supports a result recorded before its call', () => {
  const session = parseSession(jsonl(result('a', true), call('a')));
  assert.equal(session.events[1].status, 'error'); assert.equal(session.events[0].tool, 'Bash');
});
test('orphan and ambiguous results leave unrelated calls unchanged', () => {
  const orphan = parseSession(jsonl(call('a'), result('other', true)));
  assert.equal(orphan.events[0].status, 'unknown'); assert.equal(analyzeSession(orphan).errors, 1);
  assert.match(orphan.warnings[0], /matching call/);
  const duplicate = parseSession(jsonl(call('a'), call('a'), result('a', true)));
  assert.equal(duplicate.events[0].status, 'unknown'); assert.equal(duplicate.events[1].status, 'unknown');
  assert.match(duplicate.warnings.join(' '), /ambiguous/);
});
test('keeps error status if the same call has a later successful result', () => {
  const session = parseSession(jsonl(call('a'), result('a', true), result('a')));
  assert.equal(session.events[0].status, 'error'); assert.equal(analyzeSession(session).errors, 1);
});
test('normalization drops source credentials and unknown metadata', () => {
  const input = { schemaVersion: 1, credentials: { token: 'never-retain-this' },
    events: [{ id: 'one', type: 'message', content: 'hello', metadata: { token: 'also-drop' } }] };
  const session = parseSession(JSON.stringify(input));
  assert.equal(session.source, 'normalized'); assert.equal(session.events[0].content, 'hello');
  assert.equal(session.events[0].timestamp, null);
  assert.equal(JSON.stringify(session).includes('never-retain'), false); assert.equal(JSON.stringify(session).includes('also-drop'), false);
});
test('rejects invalid schemas, duplicate IDs, event types, duration and tools', () => {
  assert.throws(() => parseSession('{"schemaVersion":2,"events":[]}'), /schemaVersion/);
  assert.throws(() => parseSession(normalized([{ id: 'same', type: 'message' }, { id: 'same', type: 'message' }])), /duplicate event id/);
  assert.throws(() => parseSession(normalized([{ type: 'danger' }])), /event type/);
  assert.throws(() => parseSession(normalized([{ type: 'message', durationMs: -1 }])), /durationMs/);
  assert.throws(() => parseSession(normalized([{ type: 'tool_call' }])), /tool name/);
});
test('parse errors identify physical lines without echoing secrets', () => {
  assert.throws(() => parseSession('\n\n{"token":"do-not-echo",broken}\n'),
    error => /Line 3: invalid JSON/.test(error.message) && !error.message.includes('do-not-echo'));
});
test('omits known metadata and non-text payloads', () => {
  const session = parseSession(jsonl(
    { type: 'file-history-snapshot', credentials: 'drop-me' }, { type: 'future-record', token: 'drop-this-too' }, call('a'),
    { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 'a',
      content: [{ type: 'text', text: 'visible' }, { type: 'image', source: { data: 'image-private' } }] }] } }));
  assert.equal(session.events.length, 2); assert.match(session.events[1].content, /visible/);
  assert.match(session.events[1].content, /Non-text/); assert.equal(JSON.stringify(session).includes('image-private'), false);
  assert.equal(session.warnings.length, 2);
});
test('repeat groups canonicalize object keys but retain array order', () => {
  const session = parseSession(jsonl(call('a', { a: 1, b: 2 }), call('b', { b: 2, a: 1 }), call('c', { a: 1, b: 2 }),
    call('d', { a: [1, 2] }), call('e', { a: [2, 1] })));
  const stats = analyzeSession(session);
  assert.equal(stats.toolCalls, 5); assert.equal(stats.repeatedCalls.length, 1); assert.equal(stats.repeatedCalls[0].count, 3);
  assert.deepEqual(stats.repeatedCalls[0].eventIds, ['event-1', 'event-2', 'event-3']); assert.equal(stats.tools[0].calls, 5);
});
test('missing and backward timestamps never invent negative duration', () => {
  const noTime = parseSession(normalized([{ type: 'message', content: 'x' }]));
  assert.equal(analyzeSession(noTime).durationMs, null);
  const backwards = parseSession(jsonl(call('a'), result('a', false, '2026-10-02T09:00:00Z')));
  assert.equal(backwards.events[0].durationMs, undefined); assert.match(backwards.warnings.join(' '), /precedes/);
  const invalid = parseSession(normalized([{ type: 'message', timestamp: 'secret-not-a-date' }]));
  assert.equal(invalid.events[0].timestamp, null); assert.equal(invalid.warnings[0].includes('secret-not-a-date'), false);
});
test('enforces UTF-8 byte, event, and nesting limits', () => {
  assert.throws(() => parseSession('x'.repeat(MAX_BYTES + 1)), /10 MiB/);
  assert.throws(() => parseSession('é'.repeat(MAX_BYTES / 2 + 1)), /10 MiB/);
  assert.throws(() => parseSession(normalized(Array.from({ length: MAX_EVENTS + 1 }, () => ({ type: 'message' })))), /20,000/);
  let nested = null; for (let i = 0; i < 66; i++) nested = { child: nested };
  assert.throws(() => parseSession(normalized([{ type: 'tool_call', tool: 'Bash', input: nested }])), /nesting|levels/);
});
test('caps warning output and physical line count', () => {
  const session = parseSession(jsonl(...Array.from({ length: 250 }, () => ({ type: 'future' }))));
  assert.equal(session.warnings.length, 200); assert.equal(session.warnings[199], 'Additional warnings omitted.');
  assert.throws(() => parseSession('{}\n'.repeat(100_001)), /100,000 lines/);
});
test('redacts nested sensitive fields without mutating input', () => {
  const source = parseSession(jsonl(call('a', { env: { OPENAI_API_KEY: 'private-value', access_token: 'another-secret', MAX_TOKENS: 100 },
    authorization: 'Bearer private', command: 'curl https://user:password@example.test?token=secret' })));
  const clean = redactSession(source);
  assert.equal(source.events[0].input.env.OPENAI_API_KEY, 'private-value');
  assert.equal(clean.events[0].input.env.OPENAI_API_KEY, '[REDACTED]');
  assert.equal(clean.events[0].input.env.access_token, '[REDACTED]'); assert.equal(clean.events[0].input.env.MAX_TOKENS, 100);
  assert.equal(clean.events[0].input.authorization, '[REDACTED]');
  assert.equal(clean.events[0].input.command.includes('user:password'), false);
  assert.equal(clean.events[0].input.command.includes('token=secret'), false);
  clean.events[0].input.env.MAX_TOKENS = 5; assert.equal(source.events[0].input.env.MAX_TOKENS, 100);
});
test('masks token patterns, auth headers, assignments, and private keys idempotently', () => {
  const secrets = ['sk-' + 'a'.repeat(24), 'ghp_' + 'b'.repeat(36), 'AKIA' + 'C'.repeat(16),
    'eyJ' + 'a'.repeat(12) + '.' + 'b'.repeat(12) + '.' + 'c'.repeat(12),
    '-----BEGIN PRIVATE KEY-----\nsensitive-content\n-----END PRIVATE KEY-----'];
  for (const secret of secrets) assert.equal(redactText(secret), '[REDACTED]');
  const output = redactText('API_KEY="custom-secret"\nAuthorization: Bearer arbitrarysecret\nCookie: sid=sessionsecret');
  assert.equal(output.includes('custom-secret'), false); assert.equal(output.includes('arbitrarysecret'), false);
  assert.equal(output.includes('sessionsecret'), false); assert.equal(redactText(output), output);
});
test('HTML and commands remain inert text', () => {
  const payload = '<img src=x onerror=alert(1)><script>throw 1</script>';
  const session = parseSession(normalized([{ type: 'message', content: payload }]));
  assert.equal(session.events[0].content, payload); assert.equal(globalThis.__agentBlackBoxExecuted, undefined);
});
test('stable JSON rejects cycles and safely preserves special keys', () => {
  const value = JSON.parse('{"__proto__":{"polluted":true},"z":1,"a":2}');
  assert.equal(stableStringify(value), '{"__proto__":{"polluted":true},"a":2,"z":1}'); assert.equal({}.polluted, undefined);
  const circular = {}; circular.self = circular; assert.throws(() => stableStringify(circular), /Circular/);
});
test('supports BOM and empty normalized sessions', () => {
  const session = parseSession('\uFEFF' + normalized([]));
  assert.equal(session.events.length, 0); assert.match(session.warnings[0], /no supported events/);
  assert.throws(() => parseSession(' \n '), /empty/); assert.throws(() => parseSession(12), /string/);
  assert.throws(() => parseSession('{}', { format: 'unknown' }), /format/);
});
test('accepted depth-boundary data can also be analyzed and redacted', () => {
  let input = null; for (let i = 0; i < 64; i++) input = { child: input };
  const session = parseSession(normalized([{ type: 'tool_call', tool: 'Bash', input }]));
  assert.equal(analyzeSession(session).toolCalls, 1); assert.equal(redactSession(session).events.length, 1);
});

test('masked inputs cannot create false repeated-call groups', () => {
  const session = parseSession(jsonl(call('a', { token: 'one' }), call('b', { token: 'two' }), call('c', { token: 'three' })));
  const stats = analyzeSession(redactSession(session));
  assert.equal(stats.toolCalls, 3);
  assert.equal(stats.repeatedCalls.length, 0);
  assert.equal(stats.skippedMaskedCalls, 3);
});
test('token-shaped IDs retain distinct correlations after masking and reimport', () => {
  const first = 'sk-' + 'a'.repeat(24), second = 'sk-' + 'b'.repeat(24);
  const session = parseSession(normalized([
    { id: first, toolCallId: first, type: 'tool_call', tool: 'Bash', input: {} },
    { id: second, toolCallId: second, type: 'tool_call', tool: 'Bash', input: {} },
    { id: 'result-a', type: 'tool_result', toolCallId: first, status: 'error' },
    { id: 'result-b', type: 'tool_result', toolCallId: second, status: 'ok' },
  ]));
  const text = JSON.stringify(redactSession(session));
  assert.equal(text.includes(first), false); assert.equal(text.includes(second), false);
  const imported = parseSession(text);
  assert.equal(imported.events[0].status, 'error'); assert.equal(imported.events[1].status, 'ok');
  assert.equal(imported.events[2].toolCallId, imported.events[0].toolCallId);
  assert.equal(imported.events[3].toolCallId, imported.events[1].toolCallId);
});
test('masks token-shaped object keys without dropping colliding entries', () => {
  const first = 'sk-' + 'a'.repeat(24), second = 'sk-' + 'b'.repeat(24);
  const session = parseSession(jsonl(call('a', { [first]: 'first', [second]: 'second', '[REDACTED_KEY_1]': 'keep' })));
  const clean = redactSession(session), text = JSON.stringify(clean);
  assert.equal(text.includes(first), false); assert.equal(text.includes(second), false);
  assert.equal(Object.keys(clean.events[0].input).length, 3);
  assert.equal(Object.values(clean.events[0].input).includes('keep'), true);
});

test('hyphenated text avoids quadratic redaction scanning while flags stay masked', () => {
  const benign = 'a-'.repeat(40_000) + 'z';
  const started = Date.now();
  assert.equal(redactText(benign), benign);
  assert.ok(Date.now() - started < 5000, 'Hyphenated text should not trigger quadratic scanning');
  assert.equal(redactText('--token=secret --api-key=another'), '--token="[REDACTED]" --api-key="[REDACTED]"');
});
