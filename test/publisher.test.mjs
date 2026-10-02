import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const publisher = fileURLToPath(new URL('../scripts/publish-issues.mjs', import.meta.url));

test('issue publisher previews all 120 tasks without gh or network access', () => {
  const run = spawnSync(process.execPath, [publisher, '--repo', 'example-owner/agent-black-box'], {
    encoding: 'utf8', env: { PATH: '' }, maxBuffer: 2 * 1024 * 1024,
  });
  assert.equal(run.status, 0, run.stderr);
  const preview = JSON.parse(run.stdout);
  assert.equal(preview.mode, 'dry-run');
  assert.equal(preview.issueCount, 120);
  assert.equal(preview.issues.length, 120);
  assert.equal(new Set(preview.issues.map(i => i.title)).size, 120);
  for (const issue of preview.issues) {
    assert.match(issue.body, /Acceptance criteria/);
    if (issue.labels.includes('status:blocked')) assert.ok(!issue.labels.includes('good first issue'));
  }
});
test('publisher rejects absent, malformed, or traversing repository arguments', () => {
  for (const args of [[], ['--repo', '../elsewhere'], ['--repo', 'owner/..'], ['--repo', 'owner/repo', '--unknown']]) {
    const run = spawnSync(process.execPath, [publisher, ...args], { encoding: 'utf8' });
    assert.equal(run.status, 1, JSON.stringify(args));
    assert.match(run.stderr, /Usage/);
  }
});
