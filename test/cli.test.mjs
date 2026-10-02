import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../bin/agent-black-box.mjs', import.meta.url));
const fixture = fileURLToPath(new URL('../examples/permission-loop.jsonl', import.meta.url));
test('CLI analyzes an actual JSONL fixture and accepts normalized output again', () => {
  const text = execFileSync(process.execPath, [cli, 'analyze', fixture], { encoding: 'utf8' });
  const report = JSON.parse(text);
  assert.ok(report.analysis.toolCalls >= 3);
  assert.ok(report.analysis.repeatedCalls.length >= 1);
  const stdin = spawnSync(process.execPath, [cli, 'analyze', '-'], { input: text, encoding: 'utf8' });
  assert.equal(stdin.status, 0, stdin.stderr);
  assert.equal(JSON.parse(stdin.stdout).events.length, report.events.length);
});
test('CLI rejects invalid input and unknown options', () => {
  for (const args of [['analyze', fixture, '--format', 'pdf'], ['serve', '--port', '1e3'], ['analyze', fixture, '--unknown', 'yes']]) {
    const result = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
    assert.equal(result.status, 1);
  }
  const malformed = spawnSync(process.execPath, [cli, 'analyze', '-'], { input: '{invalid', encoding: 'utf8' });
  assert.equal(malformed.status, 1);
});
test('CLI writes HTML exclusively without overwriting existing files', t => {
  const dir = mkdtempSync(join(tmpdir(), 'abb-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const output = join(dir, 'report.html');
  execFileSync(process.execPath, [cli, 'analyze', fixture, '--format', 'html', '--output', output]);
  assert.match(readFileSync(output, 'utf8'), /<!doctype html>/);
  writeFileSync(output, 'keep me');
  const result = spawnSync(process.execPath, [cli, 'analyze', fixture, '--output', output], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.equal(readFileSync(output, 'utf8'), 'keep me');
});
