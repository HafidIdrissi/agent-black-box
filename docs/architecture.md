# Architecture

The application is intentionally small and dependency-free.

| Module | Responsibility |
| --- | --- |
| lib/core.mjs | Parsing, normalization, correlation, analysis, and best-effort redaction |
| lib/report.mjs | Escaped, script-free standalone HTML |
| lib/server.mjs | Loopback-only HTTP server; fixed application asset list |
| bin/agent-black-box.mjs | CLI argument handling, bounded input, output files, server lifecycle |
| web/app.mjs | In-memory viewer state, safe DOM rendering, filters, import/export |
| web/demo.mjs | Invented normalized demonstration data |
| test/ | Node built-in tests |
| docs/backlog.json | Canonical contributor proposals with stable ABB identifiers |

## Data flow

Browser: selected file → bounded parser → redaction → in-memory session → analysis → safe DOM/report.

CLI: file or stdin → bounded parser → redaction → analysis → stdout or a new report file.

The browser does not send session data to the local server. The server serves application assets only. No model call is needed to inspect a recorded session.

## Compatibility

The core is shared between Node and the browser. Do not add DOM APIs or Node-only imports to it. Keep warnings useful without echoing arbitrary raw log lines.

Normalized events deliberately do not preserve all producer metadata. Future schema changes need migration and privacy decisions, not simply copying every property into exports.

## What this is not yet

No live capture, remote collector, automatic remediation, recorded-tool replay, session comparison, or universal agent adapter exists in this version. These are separate design decisions.
