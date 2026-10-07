import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { writeFileSync } from 'node:fs';

const root = fileURLToPath(new URL('../', import.meta.url));
const cli = fileURLToPath(new URL('../bin/agent-black-box.mjs', import.meta.url));
const fixture = fileURLToPath(new URL('../test/snapshots/synthetic-session.jsonl', import.meta.url));

const jsonSnapshot = fileURLToPath(new URL('../test/snapshots/synthetic-session.json', import.meta.url));
const htmlSnapshot = fileURLToPath(new URL('../test/snapshots/synthetic-session.html', import.meta.url));
const failureSnapshot = fileURLToPath(new URL('../test/snapshots/synthetic-session.failure.json', import.meta.url));

function run(args) {
  return execFileSync(process.execPath, [cli, ...args], {
    cwd: root,
    encoding: 'utf8',
  });
}

writeFileSync(jsonSnapshot, run(['analyze', fixture]), 'utf8');
writeFileSync(htmlSnapshot, run(['analyze', fixture, '--format', 'html']), 'utf8');

const failureResult = (() => {
  try {
    run(['analyze', fixture, '--format', 'pdf']);
    throw new Error('Expected unsupported format command to fail.');
  } catch (error) {
    if (error.status !== 1) throw error;
    return {
      status: error.status,
      stdout: error.stdout || '',
      stderr: error.stderr || '',
    };
  }
})();

writeFileSync(failureSnapshot, JSON.stringify(failureResult, null, 2) + '\n', 'utf8');
console.log('CLI snapshots updated.');