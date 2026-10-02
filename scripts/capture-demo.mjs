import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { startServer } from '../lib/server.mjs';

const entry = process.env.ABB_PLAYWRIGHT_ENTRY;
assert.ok(entry, 'Set ABB_PLAYWRIGHT_ENTRY to the installed playwright/index.mjs path.');
const { chromium } = await import(pathToFileURL(resolve(entry)).href);
const output = resolve('launch-assets');
await mkdir(output, { recursive: true });
const { server, url } = await startServer({ port: 0 });
let browser;
const errors = [], externalRequests = [], shots = [];
async function checkText(page, selector, expected) {
  await page.waitForFunction(({ selector, expected }) =>
    document.querySelector(selector)?.textContent.trim() === expected, { selector, expected });
}
async function shot(page, caption) {
  const n = String(shots.length + 1).padStart(2, '0');
  const png = resolve(output, 'shot-' + n + '.png');
  await page.screenshot({ path: png, animations: 'disabled' });
  const captionFile = resolve(output, 'caption-' + n + '.txt');
  await writeFile(captionFile, caption + '\nSynthetic session · real application views · agent-black-box', 'utf8');
  const frame = resolve(output, 'frame-' + n + '.png');
  const filter = "pad=1280:960:0:0:color=0x111510,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:textfile=" +
    captionFile + ":expansion=none:fontcolor=0xf1f1e7:fontsize=23:x=28:y=872:line_spacing=12";
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', png, '-vf', filter, '-frames:v', '1', frame]);
  shots.push({ frame: 'frame-' + n + '.png', seconds: 5, caption });
  return png;
}
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 840 }, deviceScaleFactor: 1, acceptDownloads: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => {
    const target = request.url();
    if (target.startsWith('http') && new URL(target).origin !== new URL(url).origin) externalRequests.push(target);
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.locator('#demo-button').waitFor();
  await shot(page, '1 / Start locally. No account or API key.');
  await page.locator('#file-input').setInputFiles(resolve('examples/permission-loop.jsonl'));
  await page.locator('#workspace').waitFor({ state: 'visible' });
  for (const [selector, expected] of Object.entries({
    '#session-name': 'permission-loop.jsonl', '#metric-events': '8', '#metric-calls': '3',
    '#metric-errors': '3', '#metric-duration': '9.0 s', '#event-count': '8 / 8 events',
  })) await checkText(page, selector, expected);
  assert.equal(await page.locator('#warnings-section').isVisible(), false);
  await page.locator('#workspace').evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
  const overview = await shot(page, '2 / Import a recorded run: 8 events, 3 calls, 3 failures.');
  await copyFile(overview, resolve(output, 'agent-black-box-preview.png'));
  await checkText(page, '#repeated-calls .repeat-card p', '3 matching calls in this session');
  await page.locator('#search').fill('npm test');
  await checkText(page, '#event-count', '3 / 3 events');
  await page.locator('#workspace').evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await shot(page, '3 / Investigate the repeated command: npm test ran 3 times.');
  await page.locator('#search').fill('Permission denied');
  await checkText(page, '#event-count', '3 / 3 events');
  const first = page.locator('#timeline > details[data-type="tool_result"]').first();
  await first.locator('summary').click();
  await first.locator('.event-body pre').waitFor();
  assert.match(await first.locator('.event-body pre').textContent(), /test runner is not executable/i);
  await page.locator('#workspace').evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await shot(page, '4 / Read the error: the test runner is not executable.');
  const htmlDownload = page.waitForEvent('download');
  await page.locator('#export-html').click();
  const html = await htmlDownload;
  assert.equal(html.suggestedFilename(), 'permission-loop-redacted.html');
  const reportPath = resolve(output, 'sample-report.html');
  await html.saveAs(reportPath);
  const report = await readFile(reportPath, 'utf8');
  assert.equal((report.match(/<article>/g) || []).length, 8);
  assert.match(report, /3 identical calls/);
  assert.match(report, /test runner is not executable/i);
  assert.doesNotMatch(report, /<script/i);
  const reportPage = await context.newPage();
  await reportPage.goto(pathToFileURL(reportPath).href);
  await shot(reportPage, '5 / Export the evidence as a standalone HTML report.');
  await reportPage.close();
  const jsonDownload = page.waitForEvent('download');
  await page.locator('#export-json').click();
  const json = await jsonDownload;
  const jsonPath = resolve(output, 'sample-session.json');
  await json.saveAs(jsonPath);
  const normalized = JSON.parse(await readFile(jsonPath, 'utf8'));
  assert.equal(normalized.schemaVersion, 1);
  assert.equal(normalized.events.length, 8);
  await page.locator('#search').fill('');
  await page.locator('#error-filter').check();
  await checkText(page, '#event-count', '6 / 6 events');
  await page.locator('#error-filter').uncheck();
  await page.locator('#workspace').evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await shot(page, '6 / Try the demo, then choose one of eight starter issues.');
  await page.locator('#clear-button').click();
  assert.equal(await page.locator('#workspace').isVisible(), false);
  assert.equal(await page.locator('#timeline > details').count(), 0);
  assert.deepEqual(errors, [], 'Browser must have no uncaught JavaScript errors.');
  assert.deepEqual(externalRequests, [], 'The viewer must not make external HTTP requests.');
  await context.close();
} finally {
  await browser?.close();
  await new Promise(resolveClose => { server.close(resolveClose); server.closeAllConnections(); });
}
await writeFile(resolve(output, 'frames.txt'), shots.map(s => "file '" + s.frame + "'\nduration 5").join('\n') + "\nfile '" + shots.at(-1).frame + "'\n");
const mp4 = resolve(output, 'agent-black-box-demo.mp4');
const gif = resolve(output, 'agent-black-box-demo.gif');
execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', resolve(output, 'frames.txt'),
  '-t', '30', '-r', '10', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4]);
execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', mp4,
  '-filter_complex', 'fps=2,scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3',
  '-loop', '0', gif]);
for (const file of [mp4, gif]) {
  const duration = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file], { encoding: 'utf8' }).trim());
  assert.ok(duration >= 29.9 && duration <= 30.1, 'Expected 30 seconds: ' + file + ' was ' + duration);
}
const names = ['agent-black-box-demo.gif', 'agent-black-box-demo.mp4', 'agent-black-box-preview.png', 'sample-report.html', 'sample-session.json'];
const assets = [];
for (const name of names) {
  const bytes = await readFile(resolve(output, name));
  assets.push({ name, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
}
await writeFile(resolve(output, 'capture-manifest.json'), JSON.stringify({
  sourceCommit: process.env.GITHUB_SHA || 'local checkout',
  method: 'Six screenshots of the real Chromium application, captioned and held for five seconds each.',
  fixture: 'examples/permission-loop.jsonl', durationSeconds: 30,
  browserChecks: 'import, counts, repeats, search, details, JSON and HTML download, error filter, reset, no external requests',
  assets, shots,
}, null, 2) + '\n');
console.log('Browser walkthrough passed. Both demo formats are 30 seconds.');
// Public synthetic screenshot for review through environments without a browser attachment tool.
if (process.env.ABB_CAPTURE_PREVIEW_LOG === '1') {
  console.log('ABB_PREVIEW_PNG:' + (await readFile(resolve(output, 'agent-black-box-preview.png'))).toString('base64'));
}
