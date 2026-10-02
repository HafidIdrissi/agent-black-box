import { readFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
async function walk(dir) {
  const entries = await readdir(new URL(dir, new URL('../', import.meta.url)), { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const path = dir + entry.name;
    if (entry.isDirectory()) await walk(path + '/');
    else if (entry.name.endsWith('.mjs')) {
      const result = spawnSync(process.execPath, ['--check', root + path], { encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
    }
  }
}
await walk('');
const issues = JSON.parse(await readFile(new URL('../docs/backlog.json', import.meta.url), 'utf8'));
assert.equal(issues.length, 120, 'The contributor backlog contains 120 scoped proposals.');
const ids = new Set(issues.map(issue => issue.id));
assert.equal(ids.size, issues.length, 'Issue IDs must be unique.');
assert.equal(new Set(issues.map(issue => issue.title.toLowerCase())).size, issues.length, 'Issue titles must be unique.');
for (const issue of issues) {
  for (const key of ['id', 'title', 'area', 'difficulty', 'summary', 'validation']) {
    assert.ok(typeof issue[key] === 'string' && issue[key].length > 0, issue.id + ': missing ' + key);
  }
  assert.ok(['beginner', 'intermediate', 'advanced'].includes(issue.difficulty));
  assert.ok(issue.acceptance.length >= 3, issue.id + ': needs concrete acceptance criteria');
  assert.ok(issue.files.length > 0);
  for (const dependency of issue.dependencies) assert.ok(ids.has(dependency), issue.id + ': invalid dependency');
}
const visited = new Set(), active = new Set(), byId = new Map(issues.map(i => [i.id, i]));
function visit(id) {
  assert.ok(!active.has(id), 'Dependency cycle: ' + id);
  if (visited.has(id)) return;
  active.add(id);
  for (const dependency of byId.get(id).dependencies) visit(dependency);
  active.delete(id); visited.add(id);
}
for (const id of ids) visit(id);
assert.ok(issues.filter(i => i.difficulty === 'beginner').length >= 24);
console.log('Syntax and contributor backlog checks passed.');
