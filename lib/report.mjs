import { analyzeSession, redactSession } from './core.mjs';

export function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

export function renderReport(input) {
  const session = redactSession(input);
  const summary = analyzeSession(session);
  const text = value => escapeHTML(typeof value === 'string' ? value : JSON.stringify(value ?? null, null, 2));
  const rows = session.events.map(event => {
    const details = event.type === 'tool_call' ? event.input : event.content;
    return '<article><div class="meta">' + text(event.timestamp || 'Time unavailable') + ' · ' +
      text(event.type) + ' · ' + text(event.status) + '</div><h3>' +
      text(event.tool || 'Message') + '</h3><pre>' + text(details) + '</pre></article>';
  }).join('\n');
  const findings = summary.repeatedCalls.map(item => '<li>' + text(item.tool) + ': ' +
    item.count + ' identical calls (a signal to investigate, not proof of a failure).</li>').join('');
  const warnings = (session.warnings || []).map(w => '<li>' + text(w) + '</li>').join('');
  return '<!doctype html>\n<html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; base-uri \'none\'; form-action \'none\'">' +
    '<title>Agent Black Box — session report</title><style>' +
    ':root{color-scheme:light;font:16px/1.6 system-ui,sans-serif;color:#17212e;background:#f4f5f7}' +
    'body{max-width:960px;margin:0 auto;padding:40px 24px}h1{font-size:2.4rem;line-height:1.15}h2{margin-top:2rem}' +
    'header{border-top:5px solid #e99919}article{background:#fff;border:1px solid #d2d8df;padding:16px;margin:12px 0;break-inside:avoid}' +
    'pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:.85rem}.meta{font-size:.8rem;color:#455467}' +
    '.stats{display:flex;gap:24px;flex-wrap:wrap}.stats strong{font-size:1.7rem;display:block}' +
    '@media print{body{padding:0;background:white}article{border-color:#999}}' +
    '</style></head><body><header><p>AGENT BLACK BOX / LOCAL SESSION REPORT</p><h1>See what happened.</h1>' +
    '<p>Source: ' + text(session.source) + ' · Schema: ' + text(session.schemaVersion) + '</p></header>' +
    '<div class="stats"><p><strong>' + summary.totalEvents + '</strong>events</p><p><strong>' +
    summary.toolCalls + '</strong>tool calls</p><p><strong>' + summary.errors +
    '</strong>errors</p></div><p>Best-effort masking was applied. Review all content before sharing; logs can still contain sensitive information.</p>' +
    (findings ? '<h2>Repeated calls</h2><ul>' + findings + '</ul>' : '') +
    (summary.skippedMaskedCalls ? '<p>' + summary.skippedMaskedCalls + ' calls excluded from repetition checks because their fields were masked.</p>' : '') +
    (warnings ? '<h2>Import notes</h2><ul>' + warnings + '</ul>' : '') +
    '<h2>Timeline</h2>' + (rows || '<p>No events.</p>') +
    '<footer><p>Generated locally with Agent Black Box. No scripts, external assets, or tool execution.</p></footer></body></html>\n';
}
