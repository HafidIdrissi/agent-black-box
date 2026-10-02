/**
 * Agent Black Box core. No I/O, dependencies, evaluation, or network requests.
 * Input is untrusted. Redaction is best effort; review exports before sharing.
 */
export const MAX_BYTES = 10 * 1024 * 1024;
export const MAX_EVENTS = 20_000;
const MAX_DEPTH = 64;
const MAX_LINES = 100_000;
const MASK = '[REDACTED]';
const TYPES = new Set(['tool_call', 'tool_result', 'message']);
const STATUSES = new Set(['ok', 'error', 'unknown']);
const METADATA = new Set([
  'system', 'progress', 'queue-operation', 'file-history-snapshot', 'summary',
  'custom-title', 'tag', 'agent-name', 'agent-color', 'pr-link', 'last-prompt',
  'attribution-snapshot',
]);
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

function warn(warnings, message) {
  if (warnings.length < 199) warnings.push(message);
  else if (warnings.length === 199) warnings.push('Additional warnings omitted.');
}
function fail(where, message) { throw new Error(where + ': ' + message); }
function copyJson(value, depth = 0, ancestors = new Set(), maxDepth = MAX_DEPTH) {
  if (depth > maxDepth) throw new Error('JSON nesting exceeds supported levels.');
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'object') throw new Error('Expected a JSON-compatible value.');
  if (ancestors.has(value)) throw new Error('Circular values are not supported.');
  ancestors.add(value);
  let result;
  if (Array.isArray(value)) result = value.map(item => copyJson(item, depth + 1, ancestors, maxDepth));
  else result = Object.fromEntries(Object.keys(value).sort().map(key => [key, copyJson(value[key], depth + 1, ancestors, maxDepth)]));
  ancestors.delete(value);
  return result;
}
/** Stable object-key ordering; array ordering is significant. */
export function stableStringify(value) { return JSON.stringify(copyJson(value)); }
function contentText(value, where) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  try { return stableStringify(value); }
  catch { fail(where, 'content must be JSON-compatible with at most 64 levels.'); }
}
function timestamp(value, warnings, where) {
  if (value === undefined || value === null || value === '') return null;
  const valid = (typeof value === 'number' && Number.isFinite(value)) ||
    (typeof value === 'string' && /^\d{4}-\d\d-\d\dT/.test(value));
  const date = valid ? new Date(value) : new Date(NaN);
  if (!Number.isFinite(date.getTime())) {
    warn(warnings, where + ': invalid timestamp omitted.'); return null;
  }
  return date.toISOString();
}
function optionalId(value, where, field) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') fail(where, field + ' must be a string.');
  return value;
}
function parseJson(text, where) {
  try { return JSON.parse(text); }
  catch { fail(where, 'invalid JSON. Check commas, quotes, and one record per line for JSONL.'); }
}
function utf8Size(text) {
  let bytes = 0;
  for (const character of text) {
    const point = character.codePointAt(0);
    bytes += point <= 0x7f ? 1 : point <= 0x7ff ? 2 : point <= 0xffff ? 3 : 4;
    if (bytes > MAX_BYTES) break;
  }
  return bytes;
}
function normalize(input) {
  if (!isObject(input) || input.schemaVersion !== 1 || !Array.isArray(input.events)) {
    fail('Session', 'expected an object with schemaVersion: 1 and an events array.');
  }
  if (input.events.length > MAX_EVENTS) fail('Session', 'maximum 20,000 events exceeded.');
  const warnings = [], ids = new Set();
  const events = input.events.map((item, index) => {
    const where = 'Event ' + (index + 1);
    if (!isObject(item) || !TYPES.has(item.type)) fail(where, 'unsupported or missing event type.');
    const id = optionalId(item.id, where, 'id') || 'event-' + (index + 1);
    if (ids.has(id)) fail(where, 'duplicate event id.');
    ids.add(id);
    if (item.status !== undefined && !STATUSES.has(item.status)) fail(where, 'unsupported status.');
    if (item.type === 'tool_call' && (typeof item.tool !== 'string' || !item.tool.trim())) {
      fail(where, 'tool_call requires a nonempty tool name.');
    }
    let inputValue = null;
    try { inputValue = copyJson(item.input === undefined ? null : item.input); }
    catch { fail(where, 'input must be JSON-compatible with at most 64 levels.'); }
    const event = {
      id, timestamp: timestamp(item.timestamp, warnings, where), type: item.type,
      tool: typeof item.tool === 'string' ? item.tool : null,
      toolCallId: optionalId(item.toolCallId, where, 'toolCallId') || (item.type === 'tool_call' ? id : null),
      content: contentText(item.content, where), input: inputValue, status: item.status || 'unknown',
    };
    if (item.durationMs !== undefined) {
      if (typeof item.durationMs !== 'number' || !Number.isFinite(item.durationMs) || item.durationMs < 0) {
        fail(where, 'durationMs must be a nonnegative finite number.');
      }
      event.durationMs = item.durationMs;
    }
    return event;
  });
  return linkResults({ schemaVersion: 1, source: 'normalized', events, warnings });
}
function claude(text) {
  const warnings = [], events = [];
  function add(event, where) {
    if (events.length >= MAX_EVENTS) fail(where, 'maximum 20,000 events exceeded.');
    events.push({
      id: 'event-' + (events.length + 1), timestamp: null, type: 'message',
      tool: null, toolCallId: null, content: '', input: null, status: 'unknown', ...event,
    });
  }
  const lines = text.split(/\r?\n/);
  if (lines.length > MAX_LINES) fail('Session', 'maximum 100,000 lines exceeded.');
  for (let index = 0; index < lines.length; index++) {
    if (!lines[index].trim()) continue;
    const where = 'Line ' + (index + 1), record = parseJson(lines[index], where);
    if (!isObject(record)) fail(where, 'expected a JSON object.');
    if (METADATA.has(record.type)) continue;
    if (record.type !== 'assistant' && record.type !== 'user') {
      warn(warnings, where + ': unsupported record type omitted.'); continue;
    }
    if (!isObject(record.message)) fail(where, 'expected a message object.');
    const time = timestamp(record.timestamp, warnings, where), blocks = record.message.content;
    if (typeof blocks === 'string') { add({ timestamp: time, content: blocks, status: 'ok' }, where); continue; }
    if (!Array.isArray(blocks)) fail(where, 'message.content must be text or an array.');
    for (const block of blocks) {
      if (!isObject(block)) fail(where, 'message content blocks must be objects.');
      if (block.type === 'text') {
        if (typeof block.text !== 'string') fail(where, 'text block requires text.');
        add({ timestamp: time, content: block.text, status: 'ok' }, where);
      } else if (block.type === 'tool_use') {
        if (typeof block.name !== 'string' || !block.name.trim()) fail(where, 'tool_use requires a tool name.');
        const callId = optionalId(block.id, where, 'tool_use.id');
        if (!callId) fail(where, 'tool_use requires an id.');
        let inputValue;
        try { inputValue = copyJson(block.input === undefined ? null : block.input); }
        catch { fail(where, 'tool input exceeds supported JSON nesting.'); }
        add({ timestamp: time, type: 'tool_call', tool: block.name, toolCallId: callId, input: inputValue }, where);
      } else if (block.type === 'tool_result') {
        const callId = optionalId(block.tool_use_id, where, 'tool_use_id');
        if (!callId) fail(where, 'tool_result requires tool_use_id.');
        if (block.is_error !== undefined && typeof block.is_error !== 'boolean') fail(where, 'tool_result.is_error must be boolean.');
        let content = '';
        if (Array.isArray(block.content)) {
          content = block.content.map(part => {
            if (isObject(part) && part.type === 'text' && typeof part.text === 'string') return part.text;
            warn(warnings, where + ': non-text tool result content omitted.');
            return '[Non-text content omitted]';
          }).join('\n');
        } else content = contentText(block.content, where);
        add({ timestamp: time, type: 'tool_result', toolCallId: callId, content, status: block.is_error === true ? 'error' : 'ok' }, where);
      } else warn(warnings, where + ': unsupported content block omitted.');
    }
  }
  return linkResults({ schemaVersion: 1, source: 'claude-code', events, warnings });
}
function linkResults(session) {
  const calls = new Map();
  for (const event of session.events) {
    if (event.type !== 'tool_call') continue;
    if (calls.has(event.toolCallId)) {
      calls.set(event.toolCallId, null);
      warn(session.warnings, 'Duplicate tool call identifier; ambiguous results remain unlinked.');
    } else calls.set(event.toolCallId, event);
  }
  for (const event of session.events) {
    if (event.type !== 'tool_result') continue;
    const call = calls.get(event.toolCallId);
    if (!call) { warn(session.warnings, 'Tool result has no unique matching call.'); continue; }
    event.tool = call.tool;
    if (event.status === 'error' || (event.status === 'ok' && call.status !== 'error')) call.status = event.status;
    if (call.timestamp && event.timestamp) {
      const elapsed = Date.parse(event.timestamp) - Date.parse(call.timestamp);
      if (elapsed >= 0) { event.durationMs = elapsed; call.durationMs = Math.max(call.durationMs || 0, elapsed); }
      else warn(session.warnings, 'Tool result timestamp precedes its call; duration omitted.');
    }
  }
  if (!session.events.length) warn(session.warnings, 'Session contains no supported events.');
  return session;
}
/** Parse normalized JSON or Claude Code JSONL without retaining source metadata. */
export function parseSession(text, { format = 'auto' } = {}) {
  if (typeof text !== 'string') throw new TypeError('Session input must be a string.');
  if (!['auto', 'normalized', 'claude-code'].includes(format)) throw new Error('Unsupported format.');
  if (text.length > MAX_BYTES || utf8Size(text) > MAX_BYTES) throw new Error('Session exceeds the 10 MiB UTF-8 limit.');
  const clean = text.replace(/^\uFEFF/, '');
  if (!clean.trim()) throw new Error('Session is empty.');
  if (format === 'normalized') return normalize(parseJson(clean, 'Session'));
  if (format === 'auto') {
    let whole;
    try { whole = JSON.parse(clean); } catch { /* JSONL is parsed with line context below. */ }
    if (isObject(whole) && (own(whole, 'schemaVersion') || own(whole, 'events'))) return normalize(whole);
  }
  return claude(clean);
}
/** Errors count failed calls once, plus failed results lacking a unique call. */
export function analyzeSession(session) {
  if (!isObject(session) || !Array.isArray(session.events)) throw new TypeError('Expected a parsed session.');
  const byTool = new Map(), groups = new Map(), countsById = new Map();
  let toolCalls = 0, errors = 0, skippedMaskedCalls = 0, first = Infinity, last = -Infinity;
  for (const event of session.events) {
    if (event.timestamp) {
      const time = Date.parse(event.timestamp);
      if (Number.isFinite(time)) { first = Math.min(first, time); last = Math.max(last, time); }
    }
    if (event.type !== 'tool_call') continue;
    toolCalls++;
    countsById.set(event.toolCallId, (countsById.get(event.toolCallId) || 0) + 1);
    const stats = byTool.get(event.tool) || { name: event.tool, calls: 0, errors: 0 };
    stats.calls++;
    if (event.status === 'error') { stats.errors++; errors++; }
    byTool.set(event.tool, stats);
    const canonicalInput = stableStringify(event.input);
    if (/\[REDACTED(?:\]|_KEY_)/.test(canonicalInput) || String(event.tool).includes(MASK)) { skippedMaskedCalls++; continue; }
    const key = JSON.stringify(event.tool) + ':' + canonicalInput;
    const group = groups.get(key) || { tool: event.tool, count: 0, eventIds: [] };
    group.count++; group.eventIds.push(event.id); groups.set(key, group);
  }
  for (const event of session.events) {
    if (event.type === 'tool_result' && event.status === 'error' && countsById.get(event.toolCallId) !== 1) errors++;
  }
  return {
    totalEvents: session.events.length, toolCalls, errors, skippedMaskedCalls,
    tools: [...byTool.values()].sort((a, b) => b.calls - a.calls || a.name.localeCompare(b.name)),
    repeatedCalls: [...groups.values()].filter(group => group.count >= 3).sort((a, b) => b.count - a.count),
    durationMs: Number.isFinite(first) && Number.isFinite(last) ? last - first : null,
  };
}
function sensitiveKey(key) {
  const compact = key.toLowerCase().replace(/[^a-z0-9]/g, '');
  return /(?:password|passwd|secret|apikey|authorization|privatekey|accesstoken|refreshtoken|idtoken|sessiontoken)$/.test(compact) ||
    ['token', 'cookie', 'setcookie', 'credential', 'credentials'].includes(compact);
}
/** Pattern-based protection only: arbitrary personal data and novel secrets may remain. */
export function redactText(text) {
  if (typeof text !== 'string') throw new TypeError('Expected text.');
  return text
    .replace(/-----BEGIN (?:[A-Z ]*PRIVATE KEY)-----[\s\S]*?-----END (?:[A-Z ]*PRIVATE KEY)-----/g, MASK)
    .replace(/\b(?:sk-(?:proj-|ant-)?[A-Za-z0-9_-]{12,}|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|(?:AKIA|ASIA)[A-Z0-9]{16})\b/g, MASK)
    .replace(/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g, MASK)
    .replace(/(\b(?:authorization|proxy-authorization)\s*["']?\s*[:=]\s*["']?)(?:bearer|basic)\s+[^\s"'<>]+/gi, '$1' + MASK)
    .replace(/(\b(?:bearer|basic)\s+)[A-Za-z0-9+/_=.-]{8,}/gi, '$1' + MASK)
    .replace(/((?<![a-z0-9+.-])[a-z][a-z0-9+.-]*:\/\/)[^\s/@:]+:[^\s/@]+@/gi, '$1' + MASK + '@')
    .replace(/([?&](?:api[_-]?key|access[_-]?token|refresh[_-]?token|token|secret|password)=)[^&#\s"']+/gi, '$1' + MASK)
    .replace(/((?<![a-z0-9_-])(?:--?)?(?:[a-z0-9]+[_-])*(?:api[_-]?key|password|passwd|secret|access[_-]?token|refresh[_-]?token|client[_-]?secret|authorization|token)\b["']?\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^\s,;}]+)/gi, '$1"' + MASK + '"')
    .replace(/(\b(?:cookie|set-cookie)\s*:\s*)[^\r\n]+/gi, '$1' + MASK);
}
/** Returns a deep copy, redacting nested sensitive fields and common text patterns. */
export function redactSession(session) {
  const cloned = copyJson(session, 0, new Set(), MAX_DEPTH + 4);
  function walk(value) {
    if (typeof value === 'string') return redactText(value);
    if (Array.isArray(value)) return value.map(walk);
    if (isObject(value)) {
      const used = new Set();
      const entries = Object.entries(value).map(([key, item], index) => {
        let safeKey = key;
        if (redactText(key) !== key) {
          let suffix = index + 1;
          do { safeKey = '[REDACTED_KEY_' + suffix++ + ']'; } while (own(value, safeKey) || used.has(safeKey));
        }
        used.add(safeKey);
        return [safeKey, sensitiveKey(key) ? MASK : walk(item)];
      });
      return Object.fromEntries(entries);
    }
    return value;
  }
  const output = walk(cloned);
  if (Array.isArray(session.events) && Array.isArray(output.events)) {
    const invocationIds = new Map();
    output.events.forEach((event, index) => {
      event.id = 'event-' + (index + 1);
      const original = session.events[index].toolCallId;
      if (original == null) { event.toolCallId = null; return; }
      if (!invocationIds.has(original)) invocationIds.set(original, 'call-' + (invocationIds.size + 1));
      event.toolCallId = invocationIds.get(original);
    });
  }
  return output;
}
