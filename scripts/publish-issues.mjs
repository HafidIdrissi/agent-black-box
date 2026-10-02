#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
const args = process.argv.slice(2), repoIndex = args.indexOf('--repo');
const repository = repoIndex >= 0 ? args[repoIndex + 1] : '', apply = args.includes('--apply');
const validArgs = args.filter((_, i) => i !== repoIndex && i !== repoIndex + 1);
if (!/^[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9_.-]+$/.test(repository) || ['.', '..'].includes(repository.split('/')[1]) || validArgs.some(a => a !== '--apply')) {
  console.error('Usage: node scripts/publish-issues.mjs --repo OWNER/REPO [--apply]');
  process.exit(1);
}
const issues = JSON.parse(await readFile(new URL('../docs/backlog.json', import.meta.url), 'utf8'));
function gh(parts, input) {
  const result = execFileSync('gh', parts, {
    encoding: 'utf8', input: input === undefined ? undefined : JSON.stringify(input),
    stdio: ['pipe', 'pipe', 'pipe'], maxBuffer: 16 * 1024 * 1024,
  });
  return result.trim() ? JSON.parse(result) : null;
}
function labelsFor(issue) {
  const labels = ['help wanted', 'enhancement', 'area:' + issue.area, 'level:' + issue.difficulty];
  if (issue.difficulty === 'beginner' && !issue.dependencies.length) labels.push('good first issue');
  if (issue.dependencies.length) labels.push('status:blocked');
  if (issue.title.startsWith('[Investigation]') || issue.difficulty === 'advanced') labels.push('design discussion');
  return labels;
}
function bodyFor(issue) {
  const dependencies = issue.dependencies.map(id =>
    '- [' + id + '](https://github.com/' + repository + '/issues?q=' + encodeURIComponent('in:title ' + id) + ')'
  ).join('\n') || 'None. Check for an active discussion or PR before starting.';
  return '<!-- agent-black-box:' + issue.id + ' -->\n\n' +
    '## User benefit\n\n' + issue.summary + '\n\n' +
    '## Scope\n\n' + issue.area + ' · ' + issue.difficulty + '\n\n' +
    'This is a contribution proposal, not a claim of a confirmed existing bug. ' +
    'Discuss design and compatibility changes before implementation.\n\n' +
    '## Starting points\n\n' + issue.files.map(path => '- ' + path).join('\n') +
    '\n\nSome paths are proposed new files. Use the current code and guidance as the baseline.\n\n' +
    '## Acceptance criteria\n\n' + issue.acceptance.map(a => '- [ ] ' + a).join('\n') +
    '\n\n## Validation\n\n' + issue.validation + '\n\n' +
    'Run npm run check and npm test for code changes. State what was actually checked.\n\n' +
    '## Prerequisites\n\n' + dependencies + '\n\n' +
    '## Contributing\n\nComment with your approach to avoid duplicated work. ' +
    'Use synthetic fixtures; never attach private agent sessions or credentials. ' +
    'See [CONTRIBUTING.md](https://github.com/' + repository + '/blob/main/CONTRIBUTING.md).';
}
if (!apply) {
  console.log(JSON.stringify({
    repository, mode: 'dry-run', issueCount: issues.length,
    beginnerTasks: issues.filter(i => i.difficulty === 'beginner').length,
    issues: issues.map(i => ({ title: '[' + i.id + '] ' + i.title, labels: labelsFor(i), body: bodyFor(i) })),
  }, null, 2));
  process.exit(0);
}
// --apply authorizes publication to the exact selected repository.
// gh owns authentication. Never copy tokens into this repository.
try {
  const repo = gh(['api', 'repos/' + repository]);
  if (!repo.permissions?.push && !repo.permissions?.maintain && !repo.permissions?.admin) throw new Error('Repository write permission is required.');
  if (!repo.has_issues) throw new Error('Enable GitHub Issues for this repository first.');
  const pages = gh(['api', 'repos/' + repository + '/issues?state=all&per_page=100', '--paginate', '--slurp']);
  const existing = new Set(pages.flat().filter(i => !i.pull_request).flatMap(i => {
    const marker = /<!-- agent-black-box:(ABB-\d{3}) -->/.exec(i.body || '');
    const title = /^\[(ABB-\d{3})\]/.exec(i.title || '');
    return [marker?.[1], title?.[1]].filter(Boolean);
  }));
  const labelPages = gh(['api', 'repos/' + repository + '/labels?per_page=100', '--paginate', '--slurp']);
  const existingLabels = new Set(labelPages.flat().map(l => l.name));
  for (const label of new Set(issues.flatMap(labelsFor))) {
    if (existingLabels.has(label)) continue;
    gh(['api', '--method', 'POST', 'repos/' + repository + '/labels', '--input', '-'], {
      name: label, color: label === 'good first issue' ? '7057ff' : label === 'status:blocked' ? 'd4c5f9' : '0e8a16',
      description: label === 'good first issue' ? 'Small scoped task with no listed prerequisite.' : 'Contributor backlog: ' + label,
    });
    await delay(1200);
  }
  let created = 0, skipped = 0;
  for (const issue of issues) {
    if (existing.has(issue.id)) { skipped++; continue; }
    const result = gh(['api', '--method', 'POST', 'repos/' + repository + '/issues', '--input', '-'], {
      title: '[' + issue.id + '] ' + issue.title,
      body: bodyFor(issue).replace('/blob/main/CONTRIBUTING.md', '/blob/' + encodeURIComponent(repo.default_branch) + '/CONTRIBUTING.md'),
      labels: labelsFor(issue),
    });
    existing.add(issue.id); created++; console.log(issue.id + ': ' + result.html_url);
    await delay(1200);
  }
  console.log('Created ' + created + ' issues; skipped ' + skipped + ' existing IDs.');
} catch (error) {
  console.error(error.message?.startsWith('Repository') || error.message?.startsWith('Enable') ?
    error.message : 'GitHub operation failed. Check gh authentication, access, and rate limits. Inspect the tracker, then re-run to resume.');
  process.exitCode = 1;
}
