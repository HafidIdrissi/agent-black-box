import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const repo = process.env.GITHUB_REPOSITORY, sha = process.env.GITHUB_SHA, tag = 'v0.1.0';
assert.equal(repo, 'HafidIdrissi/agent-black-box', 'This one-time publisher is scoped to the project repository.');
assert.equal(process.env.GITHUB_REF, 'refs/heads/main', 'Publish only from main.');
assert.match(sha || '', /^[a-f0-9]{40}$/);
assert.ok(process.env.GH_TOKEN, 'The workflow token is required.');
async function api(path, options = {}) {
  const response = await fetch('https://api.github.com/repos/' + repo + '/' + path, {
    ...options,
    headers: {
      Authorization: 'Bearer ' + process.env.GH_TOKEN,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  if (response.status === 404 && options.allowMissing) return null;
  if (!response.ok) throw new Error('GitHub request failed: ' + response.status + ' ' + path);
  return response.status === 204 ? null : response.json();
}
const existing = await api('releases/tags/' + tag, { allowMissing: true });
if (existing && !existing.draft) {
  console.log('Published v0.1.0 already exists; leaving its tag and assets unchanged.');
} else {
  const manifest = JSON.parse(await readFile('launch-assets/capture-manifest.json', 'utf8'));
  assert.equal(manifest.sourceCommit, sha, 'Captured media must match the release source.');
  execFileSync('sha256sum', ['--check', 'SHA256SUMS.txt'], { cwd: 'launch-assets', stdio: 'inherit' });
  let ci;
  for (let attempt = 0; attempt < 60; attempt++) {
    const runs = await api('actions/workflows/ci.yml/runs?head_sha=' + sha + '&event=push&per_page=10');
    ci = runs.workflow_runs?.find(run => run.head_sha === sha && run.head_branch === 'main');
    if (ci?.status === 'completed') break;
    await delay(10_000);
  }
  assert.equal(ci?.conclusion, 'success', 'The CI matrix for this exact commit must pass before release.');
  const jobs = await api('actions/runs/' + ci.id + '/jobs?per_page=100');
  const tests = jobs.jobs.filter(job => job.name.startsWith('test ('));
  assert.equal(tests.length, 6, 'Expected all six OS/Node configurations.');
  assert.ok(tests.every(job => job.conclusion === 'success'), 'Every CI configuration must pass.');
  const priorTag = await api('git/ref/tags/' + tag, { allowMissing: true });
  if (priorTag) assert.equal(priorTag.object.sha, sha, 'Never move an existing release tag.');
  const notes = await readFile('docs/releases/v0.1.0.md', 'utf8');
  const body = notes + '\n\nVerified CI: ' + ci.html_url + '\nSource commit: ' + sha + '\n';
  let release = existing;
  if (release) {
    assert.ok(release.draft);
    release = await api('releases/' + release.id, { method: 'PATCH', body: JSON.stringify({ target_commitish: sha, body }) });
  } else {
    release = await api('releases', { method: 'POST', body: JSON.stringify({
      tag_name: tag, target_commitish: sha, name: 'Agent Black Box v0.1.0 — inspect failed agent runs locally',
      body, draft: true, prerelease: false,
    }) });
  }
  const names = [
    'agent-black-box-0.1.0.zip', 'agent-black-box-demo.gif', 'agent-black-box-demo.mp4',
    'agent-black-box-preview.png', 'sample-report.html', 'sample-session.json',
    'capture-manifest.json', 'SHA256SUMS.txt',
  ];
  const beforeUpload = await api('releases/' + release.id);
  assert.ok(beforeUpload.draft, 'Only draft release assets may be replaced.');
  execFileSync('gh', ['release', 'upload', tag, ...names.map(name => 'launch-assets/' + name), '--repo', repo, '--clobber'], { stdio: 'inherit' });
  const ready = await api('releases/' + release.id);
  assert.ok(ready.draft);
  for (const name of names) assert.ok(ready.assets.some(asset => asset.name === name && asset.size > 0), 'Missing release asset: ' + name);
  const published = await api('releases/' + release.id, { method: 'PATCH', body: JSON.stringify({ draft: false, make_latest: 'true' }) });
  console.log('Published ' + published.html_url);
}
