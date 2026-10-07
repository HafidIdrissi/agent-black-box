import { parseSession, analyzeSession, redactSession, redactText } from '../lib/core.mjs';
import { renderReport } from '../lib/report.mjs';
import { DEMO_SESSION } from './demo.mjs';

const MAX_FILE_BYTES = 10 * 1024 * 1024, PAGE_SIZE = 100;
const TEXT_SIZE_KEY = 'abb-text-size';
const TEXT_SIZES = ['100%', '125%', '150%', '200%'];
const ui = Object.fromEntries([
  'demo-button', 'import-button', 'file-input', 'status', 'empty-state', 'workspace',
  'session-name', 'session-source', 'metric-events', 'metric-calls', 'metric-errors',
  'metric-duration', 'search', 'tool-filter', 'error-filter', 'active-filters', 'timeline', 'event-count',
  'no-results', 'load-more', 'repeated-calls', 'tool-activity', 'warnings-section',
  'warnings', 'export-json', 'export-html', 'clear-button',
].map(id => [id, document.getElementById(id)]));
let session = null, sessionName = '', visibleLimit = PAGE_SIZE, loadSequence = 0;
function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = String(text);
  return element;
}
function stringify(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  try { return JSON.stringify(value, null, 2); } catch { return String(value); }
}
function status(message, kind = 'info') { ui.status.textContent = message; ui.status.dataset.kind = kind; }
function applyTextSize(size) {
  const value = TEXT_SIZES.includes(size) ? size : '100%';

  document.documentElement.dataset.textSize = value.replace('%', '');

  document.querySelectorAll('.text-size-button').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.textSize === value));
  });
}

function loadTextSize() {
  let savedSize = null;

  try {
    savedSize = localStorage.getItem(TEXT_SIZE_KEY);
  } catch {
    savedSize = null;
  }

  applyTextSize(savedSize);
}

function saveTextSize(size) {
  const value = TEXT_SIZES.includes(size) ? size : '100%';

  try {
    localStorage.setItem(TEXT_SIZE_KEY, value);
  } catch {
    // Persistence is optional; keep the viewer usable.
  }

  applyTextSize(value);
}
function duration(value) {
  if (!Number.isFinite(value) || value < 0) return '—';
  if (value < 1000) return Math.round(value) + ' ms';
  if (value < 60000) return (value / 1000).toFixed(1) + ' s';
  return Math.floor(value / 60000) + 'm ' + Math.floor((value % 60000) / 1000) + 's';
}
function timestamp(value) {
  if (value === null || value === undefined || value === '') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
function shortTime(value) { const date = timestamp(value); return date ? date.toISOString().slice(11, 19) : 'no time'; }
function resetFilters() {
  ui.search.value = '';
  ui['tool-filter'].value = '';
  ui['error-filter'].checked = false;
  visibleLimit = PAGE_SIZE;
  renderActiveFilters();
}
function renderActiveFilters() {
  const chips = [];

  if (ui.search.value.trim()) {
    chips.push({ label: 'Search: ' + ui.search.value.trim(), filter: 'search' });
  }

  if (ui['tool-filter'].value) {
    chips.push({ label: 'Tool: ' + ui['tool-filter'].value, filter: 'tool' });
  }

  if (ui['error-filter'].checked) {
    chips.push({ label: 'Errors only', filter: 'error' });
  }

  const elements = chips.map(({ label, filter }) => {
    const chip = node('span', 'filter-chip');
    chip.append(node('span', '', label));

    const remove = node('button', 'filter-chip-remove', '×');
    remove.type = 'button';
    remove.setAttribute('aria-label', 'Remove ' + label + ' filter');

    remove.addEventListener('click', () => {
      if (filter === 'search') ui.search.value = '';
      if (filter === 'tool') ui['tool-filter'].value = '';
      if (filter === 'error') ui['error-filter'].checked = false;

      const focusTarget = {
        search: ui.search,
        tool: ui['tool-filter'],
        error: ui['error-filter'],
      }[filter];

      visibleLimit = PAGE_SIZE;
      renderActiveFilters();
      renderTimeline();
      focusTarget.focus();
    });

    chip.append(remove);
    return chip;
  });

  if (elements.length) {
    const clear = node('button', 'clear-filters', 'Clear filters');
    clear.type = 'button';
    clear.addEventListener('click', () => {
      resetFilters();
      renderTimeline();
      ui.search.focus();
    });
    elements.push(clear);
  }

  ui['active-filters'].replaceChildren(...elements);
}
function setSession(parsed, name) {
  if (!parsed || !Array.isArray(parsed.events)) throw new Error('The file did not contain a supported session.');
  const masked = redactSession(parsed), analysis = analyzeSession(masked);
  session = masked; sessionName = redactText(name); resetFilters();
  ui['session-name'].textContent = sessionName;
  ui['session-source'].textContent = 'Source: ' + String(session.source || 'normalized session') + ' · redaction enabled';
  ui['metric-events'].textContent = Number(analysis.totalEvents || 0).toLocaleString();
  ui['metric-calls'].textContent = Number(analysis.toolCalls || 0).toLocaleString();
  ui['metric-errors'].textContent = Number(analysis.errors || 0).toLocaleString();
  ui['metric-errors'].dataset.hasErrors = String(analysis.errors > 0);
  ui['metric-duration'].textContent = duration(analysis.durationMs);
  const tools = [...new Set(session.events.map(event => event.tool).filter(Boolean))].sort();
  ui['tool-filter'].replaceChildren(node('option', '', 'All tools')); ui['tool-filter'].firstChild.value = '';
  for (const tool of tools) { const option = node('option', '', tool); option.value = tool; ui['tool-filter'].append(option); }
  renderFindings(analysis); renderTimeline(); ui['empty-state'].hidden = true; ui.workspace.hidden = false;
  status('Loaded ' + session.events.length.toLocaleString() + ' events. Times are shown in UTC.');
}
function renderFindings(analysis) {
  const repeated = Array.isArray(analysis.repeatedCalls) ? analysis.repeatedCalls : [];
  const cards = repeated.slice(0, 8).map(item => {
    const card = node('div', 'repeat-card');
    card.append(node('strong', '', item.tool || 'Unnamed tool'), node('p', '', item.count + ' matching calls in this session')); return card;
  });
  if (!cards.length) cards.push(node('p', 'micro', 'No repeated calls detected.'));
  if (analysis.skippedMaskedCalls) cards.push(node('p', 'micro', analysis.skippedMaskedCalls + ' calls excluded from repeat checks because their fields were masked.'));
  if (repeated.length > 8) cards.push(node('p', 'micro', (repeated.length - 8) + ' more groups are included in the exported report.'));
  ui['repeated-calls'].replaceChildren(...cards);
  const rows = (analysis.tools || []).map(tool => {
    const row = node('div', 'tool-row');
    const counts = tool.calls + ' call' + (tool.calls === 1 ? '' : 's') + (tool.errors ? ' · ' + tool.errors + ' err' : '');
    row.append(node('span', '', tool.name), node('span', tool.errors ? 'tool-errors' : '', counts)); return row;
  });
  ui['tool-activity'].replaceChildren(...(rows.length ? rows : [node('p', 'micro', 'No tool calls recorded.')]));
  const warnings = Array.isArray(session.warnings) ? session.warnings : [];
  ui.warnings.replaceChildren(...warnings.map(w => node('li', '', stringify(w))));
  ui['warnings-section'].hidden = warnings.length === 0;
}
function detailBlock(label, value) {
  const fragment = document.createDocumentFragment();
  fragment.append(node('p', 'detail-label', label), node('pre', '', stringify(value))); return fragment;
}
function eventElement(event, index) {
  const details = node('details', 'event');
  details.dataset.type = event.type || 'message'; details.dataset.error = String(event.status === 'error');
  const summary = node('summary'), dot = node('span', 'event-dot'); dot.setAttribute('aria-hidden', 'true');
  const main = node('span', 'event-main'), label = node('span', 'event-label');
  const kind = { tool_call: 'TOOL CALL', tool_result: 'TOOL RESULT', message: 'MESSAGE' }[event.type] || 'EVENT';
  label.append(node('span', 'event-name', event.tool || (event.type === 'message' ? 'Message' : 'Tool event')), node('span', 'event-kind', kind));
  if (event.status === 'error') label.append(node('span', 'error-pill', 'ERROR'));
  const preview = ([event.input, event.content].map(stringify).find(value => value.trim()) || '').replace(/\s+/g, ' ').slice(0, 240);
  main.append(label, node('span', 'event-preview', preview || 'No content recorded'));
  const time = node('span', 'event-time', shortTime(event.timestamp)), date = timestamp(event.timestamp);
  time.title = date ? date.toISOString() + ' (UTC)' : 'No valid timestamp recorded';
  const chevron = node('span', 'event-chevron', '›'); chevron.setAttribute('aria-hidden', 'true');
  summary.append(dot, main, time, chevron); details.append(summary);
  let populated = false;
  details.addEventListener('toggle', () => {
    if (!details.open || populated) return;
    populated = true;
    const body = node('div', 'event-body');
    const metadata = [
      'Event: ' + (event.id || index + 1), 'Status: ' + (event.status || 'unknown'),
      date ? 'Time: ' + date.toISOString() : '', event.toolCallId ? 'Call: ' + event.toolCallId : '',
      Number.isFinite(event.durationMs) ? 'Duration: ' + duration(event.durationMs) : '',
    ].filter(Boolean).join('\n');
    body.append(node('p', 'event-meta', metadata));
    if (event.input != null) body.append(detailBlock('Input', event.input));
    if (event.content != null) body.append(detailBlock('Content', event.content));
    if (event.input == null && event.content == null) body.append(node('p', 'micro', 'This event has no input or content.'));
    details.append(body);
  });
  return details;
}
function renderTimeline() {
  if (!session) return;
  const query = ui.search.value.trim().toLowerCase(), tool = ui['tool-filter'].value, errorsOnly = ui['error-filter'].checked;
  const matches = session.events.filter(event => {
    if (tool && event.tool !== tool) return false;
    if (errorsOnly && event.status !== 'error') return false;
    if (!query) return true;
    return [event.id, event.type, event.tool, event.toolCallId, event.status, stringify(event.input), stringify(event.content)]
      .some(value => String(value ?? '').toLowerCase().includes(query));
  });
  const visible = matches.slice(0, visibleLimit), fragment = document.createDocumentFragment();
  visible.forEach((event, index) => fragment.append(eventElement(event, index))); ui.timeline.replaceChildren(fragment);
  ui['no-results'].hidden = matches.length !== 0;
  ui['event-count'].textContent = visible.length.toLocaleString() + ' / ' + matches.length.toLocaleString() + ' events';
  ui['load-more'].hidden = visible.length >= matches.length;
}
async function importFile(file) {
  if (!file) return;
  const sequence = ++loadSequence;
  if (file.size > MAX_FILE_BYTES) {
    status('This file exceeds the 10 MiB limit. Export or split a smaller session and try again.', 'error');
    ui['file-input'].value = ''; return;
  }
  status('Reading file locally…');
  try {
    const text = await file.text();
    if (sequence !== loadSequence) return;
    if (!text.trim()) throw new Error('The file is empty.');
    setSession(parseSession(text), file.name);
  } catch (error) {
    if (sequence !== loadSequence) return;
    status('Could not load this session: ' + (error instanceof Error ? error.message : 'Unknown import error'), 'error');
  } finally { if (sequence === loadSequence) ui['file-input'].value = ''; }
}
function download(contents, suffix, mime) {
  const filename = (sessionName.replace(/\.(jsonl?|ndjson)$/i, '').replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 80) || 'session');
  const url = URL.createObjectURL(new Blob([contents], { type: mime })), link = node('a');
  link.href = url; link.download = filename + '-redacted.' + suffix; link.hidden = true;
  document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
ui['demo-button'].addEventListener('click', () => {
  ++loadSequence;
  try { setSession(parseSession(JSON.stringify(DEMO_SESSION)), 'Permission loop · sample run'); ui.workspace.scrollIntoView({ block: 'start' }); }
  catch (error) { status('Could not load the demo: ' + error.message, 'error'); }
});
ui['import-button'].addEventListener('click', () => ui['file-input'].click());
ui['file-input'].addEventListener('change', () => importFile(ui['file-input'].files[0]));
document.querySelectorAll('.text-size-button').forEach(button => {
  button.addEventListener('click', () => {
    saveTextSize(button.dataset.textSize);
  });
});

loadTextSize();

for (const id of ['search', 'tool-filter', 'error-filter']) {
  ui[id].addEventListener(id === 'search' ? 'input' : 'change', () => {
    visibleLimit = PAGE_SIZE;
    renderActiveFilters();
    renderTimeline();
  });
}
ui['load-more'].addEventListener('click', () => { visibleLimit += PAGE_SIZE; renderTimeline(); });
ui['clear-button'].addEventListener('click', () => {
  ++loadSequence; session = null; sessionName = ''; resetFilters(); ui['file-input'].value = '';
  for (const id of ['timeline', 'repeated-calls', 'tool-activity', 'warnings']) ui[id].replaceChildren();
  ui.workspace.hidden = true; ui['empty-state'].hidden = false;
  status('Session cleared from the inspector. Open another file or explore the sample run.'); ui['import-button'].focus();
});
ui['export-json'].addEventListener('click', () => {
  if (!session) return;
  try { download(JSON.stringify(redactSession(session), null, 2) + '\n', 'json', 'application/json;charset=utf-8'); status('Redacted JSON downloaded. Review it before sharing.'); }
  catch (error) { status('Could not export JSON: ' + error.message, 'error'); }
});
ui['export-html'].addEventListener('click', () => {
  if (!session) return;
  try { download(renderReport(session), 'html', 'text/html;charset=utf-8'); status('Redacted HTML report downloaded. Review it before sharing.'); }
  catch (error) { status('Could not export the report: ' + error.message, 'error'); }
});
ui['empty-state'].addEventListener('dragover', event => { event.preventDefault(); ui['empty-state'].classList.add('is-dragging'); });
ui['empty-state'].addEventListener('dragleave', () => ui['empty-state'].classList.remove('is-dragging'));
ui['empty-state'].addEventListener('drop', event => {
  event.preventDefault(); ui['empty-state'].classList.remove('is-dragging');
  if (event.dataTransfer?.files.length) importFile(event.dataTransfer.files[0]);
});
