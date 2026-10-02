#!/usr/bin/env node
import { readFile, stat, writeFile } from 'node:fs/promises';
import { parseSession, redactSession, analyzeSession } from '../lib/core.mjs';
import { renderReport } from '../lib/report.mjs';
import { startServer } from '../lib/server.mjs';

const MAX_BYTES = 10 * 1024 * 1024;
const HELP = [
  'Agent Black Box 0.1.0 — local agent-session debugger',
  '',
  'Usage:',
  '  node bin/agent-black-box.mjs serve [--port 8787]',
  '  node bin/agent-black-box.mjs analyze <session.jsonl|session.json|-> [--format json|html] [--output file]',
  '  node bin/agent-black-box.mjs --help',
  '',
  'Requires Node.js 22+. No account, API key, or dependencies.',
  'Reports are masked on a best-effort basis. Review before sharing.',
  'Output files are created exclusively; existing files are never overwritten.',
  'The server binds only to 127.0.0.1 and serves application assets.'
].join('\n');

function options(args, accepted) {
  const result = {};
  for (let i = 0; i < args.length; i += 2) {
    const name = args[i], value = args[i + 1];
    if (!accepted.includes(name) || value === undefined || value.startsWith('--') || name in result) {
      throw new Error('Invalid or repeated option. Run with --help for usage.');
    }
    result[name] = value;
  }
  return result;
}
async function readInput(file) {
  if (file !== '-') {
    const info = await stat(file);
    if (!info.isFile()) throw new Error('Input must be a regular file.');
    if (info.size > MAX_BYTES) throw new Error('Input exceeds the 10 MiB limit.');
    return readFile(file, 'utf8');
  }
  const chunks = [];
  let bytes = 0;
  for await (const chunk of process.stdin) {
    bytes += chunk.length;
    if (bytes > MAX_BYTES) throw new Error('Input exceeds the 10 MiB limit.');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}
async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === '--help' || command === '-h') {
    process.stdout.write(HELP + '\n');
    return;
  }
  if (command === '--version') {
    process.stdout.write('0.1.0\n');
    return;
  }
  if (command === 'serve') {
    const opts = options(args, ['--port']);
    const value = opts['--port'] ?? '8787';
    if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 65535) throw new Error('Port must be an integer from 1 to 65535.');
    const { server, url } = await startServer({ port: Number(value) });
    process.stdout.write('Agent Black Box: ' + url + '\nFiles stay in your browser. Press Ctrl+C to stop.\n');
    for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close());
    return;
  }
  if (command !== 'analyze' || !args[0] || (args[0].startsWith('--'))) throw new Error('Expected serve or analyze <file>. Run with --help.');
  const [file, ...rest] = args;
  const opts = options(rest, ['--format', '--output']);
  const format = opts['--format'] ?? 'json';
  if (!['json', 'html'].includes(format)) throw new Error('Format must be json or html.');
  const session = redactSession(parseSession(await readInput(file)));
  const report = format === 'html' ? renderReport(session) :
    JSON.stringify({ ...session, analysis: analyzeSession(session) }, null, 2) + '\n';
  if (opts['--output']) {
    await writeFile(opts['--output'], report, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
    process.stderr.write('Report saved. Review it before sharing.\n');
  } else {
    process.stdout.write(report);
  }
}
main().catch(error => {
  const known = { EEXIST: 'Output already exists; choose a new filename.', ENOENT: 'Input or output directory was not found.', EACCES: 'Permission denied.', EADDRINUSE: 'Port already in use; choose another --port.' };
  process.stderr.write('Agent Black Box: ' + (known[error.code] || (error.code ? 'File or server operation failed.' : error.message)) + '\n');
  process.exitCode = 1;
});
