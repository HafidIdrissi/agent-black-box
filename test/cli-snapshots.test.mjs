import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../bin/agent-black-box.mjs', import.meta.url));
const fixture = fileURLToPath(new URL('./snapshots/synthetic-session.jsonl', import.meta.url));
const jsonSnapshot = fileURLToPath(new URL('./snapshots/synthetic-session.json', import.meta.url));
const htmlSnapshot = fileURLToPath(new URL('./snapshots/synthetic-session.html', import.meta.url));
const failureSnapshot = fileURLToPath(new URL('./snapshots/synthetic-session.failure.json', import.meta.url));

function runCli(args) {
  return spawnSync(process.execPath, [cli, ...args], {
    encoding: 'utf8',
  });
}

test('CLI JSON output matches the committed snapshot', () => {
  const result = runCli(['analyze', fixture]);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, '');

  const expected = readFileSync(jsonSnapshot, 'utf8');
  assert.equal(result.stdout, expected);
});

test('CLI HTML output matches the committed snapshot', () => {
  const result = runCli(['analyze', fixture, '--format', 'html']);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, '');

  const expected = readFileSync(htmlSnapshot, 'utf8');
  assert.equal(result.stdout, expected);
});

test('CLI reports unsupported formats deterministically', () => {
  const result = runCli(['analyze', fixture, '--format', 'pdf']);
  const expected = JSON.parse(readFileSync(failureSnapshot, 'utf8'));

  assert.equal(result.status, expected.status);
  assert.equal(result.stdout, expected.stdout);
  assert.equal(result.stderr, expected.stderr);
});