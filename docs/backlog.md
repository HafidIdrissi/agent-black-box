# Contributor backlog

120 scoped proposals. ABB identifiers are stable proposal IDs, not GitHub issue numbers. Full descriptions, criteria, entry files, validation plans, and dependencies are in [backlog.json](backlog.json).

Paths to future files are proposed entry points. A proposal with dependencies is blocked until its prerequisites land. Design investigations need discussion before implementation.

| Proposal | Area | Level | Prerequisites |
| --- | --- | --- | --- |
| ABB-001: Document minimal normalized v1 trace examples | imports | beginner | None |
| ABB-002: Add multilingual and escaped-newline import fixtures | imports | beginner | None |
| ABB-003: Test interleaved tool calls with reverse-order results | imports | beginner | None |
| ABB-004: Test interrupted sessions and orphan results | imports | beginner | None |
| ABB-005: Document and test supported JSONL framing variations | imports | beginner | None |
| ABB-006: Document the implemented Claude Code field mapping | imports | beginner | None |
| ABB-007: Cover blank input and metadata-only sessions | imports | beginner | None |
| ABB-008: Index fixtures and their golden normalized outputs | imports | beginner | None |
| ABB-009: [Investigation] Specify a verified Codex log adapter | adapters | intermediate | None |
| ABB-010: Implement the approved Codex session adapter | adapters | intermediate | ABB-009 |
| ABB-011: [Investigation] Define an offline OTLP JSON mapping | adapters | advanced | None |
| ABB-012: Implement the approved offline OTLP JSON adapter | adapters | advanced | ABB-011 |
| ABB-013: [Investigation] Specify an OpenHands event adapter | adapters | intermediate | None |
| ABB-014: Implement the approved OpenHands event adapter | adapters | intermediate | ABB-013 |
| ABB-015: [Investigation] Define reproducible LangGraph capture | adapters | intermediate | None |
| ABB-016: Implement the approved LangGraph capture adapter | adapters | advanced | ABB-015 |
| ABB-017: Publish JSON Schema for normalized trace version 1 | schema | intermediate | None |
| ABB-018: [Investigation] Define schema compatibility rules | schema | intermediate | None |
| ABB-019: Implement the approved schema compatibility policy | schema | intermediate | ABB-017, ABB-018 |
| ABB-020: Preserve event identity and source provenance | schema | advanced | None |
| ABB-021: Preserve high-resolution time and clock domains | schema | advanced | ABB-018 |
| ABB-022: [Investigation] Specify nested and delegated runs | schema | advanced | None |
| ABB-023: Implement the approved nested-run model | schema | advanced | ABB-022 |
| ABB-024: Preserve attachment descriptors in content | schema | intermediate | ABB-018 |
| ABB-025: Expose structured import warnings with stable codes | imports | intermediate | None |
| ABB-026: Add an incremental JSONL import API | imports | advanced | None |
| ABB-027: Support cooperative cancellation of streaming imports | imports | intermediate | ABB-026 |
| ABB-028: Add opt-in duplicate-record handling | imports | intermediate | None |
| ABB-029: Merge explicitly ordered segments from one session | imports | advanced | ABB-028 |
| ABB-030: Explain adapter detection and reject ambiguity | imports | intermediate | None |
| ABB-031: Add bounded windows to repeated-call diagnostics | diagnostics | intermediate | None |
| ABB-032: Detect repeated multi-tool cycles with evidence | diagnostics | advanced | None |
| ABB-033: Group explicit repeated failures across arguments | diagnostics | intermediate | None |
| ABB-034: Annotate observed recovery after failed attempts | diagnostics | intermediate | None |
| ABB-035: Report calls with no recorded result | diagnostics | intermediate | None |
| ABB-036: Build a labelled diagnostic evaluation corpus | diagnostics | intermediate | ABB-040 |
| ABB-037: Introduce a pure diagnostic-rule interface | diagnostics | advanced | ABB-040 |
| ABB-038: Extract a minimal evidence slice for a finding | diagnostics | intermediate | ABB-020, ABB-040 |
| ABB-039: Support scoped diagnostic suppressions with reasons | diagnostics | intermediate | ABB-037 |
| ABB-040: Attach structured evidence references to findings | diagnostics | intermediate | ABB-020 |
| ABB-041: Replace loaded sessions through drag-and-drop | viewer | beginner | None |
| ABB-042: Import a session from pasted transcript text | viewer | intermediate | None |
| ABB-043: Toggle absolute and elapsed event timestamps | viewer | beginner | None |
| ABB-044: Add removable active filter chips | viewer | beginner | None |
| ABB-045: Add discoverable viewer keyboard shortcuts | viewer | intermediate | None |
| ABB-046: Search within selected tool results | viewer | intermediate | None |
| ABB-047: Bookmark events during an investigation | viewer | intermediate | None |
| ABB-048: Run browser imports in a cancellable worker | viewer | advanced | None |
| ABB-049: Add line navigation to tool results | viewer | intermediate | None |
| ABB-050: Add a wrap-lines preference for tool details | viewer | beginner | None |
| ABB-051: Add a grouped-by-tool exploration view | viewer | intermediate | None |
| ABB-052: Filter events by elapsed time range | viewer | intermediate | None |
| ABB-053: Introduce a high-contrast viewer theme | accessibility | beginner | None |
| ABB-054: Add adjustable reading text size | accessibility | beginner | None |
| ABB-055: Debounce accessible filter-result announcements | accessibility | intermediate | None |
| ABB-056: Navigate timeline events efficiently by keyboard | accessibility | intermediate | None |
| ABB-057: Document a screen-reader review walkthrough | accessibility | beginner | None |
| ABB-058: Test the keyboard-only review workflow | accessibility | intermediate | None |
| ABB-059: Provide a single-column reading preference | accessibility | beginner | None |
| ABB-060: Add an accessible structured JSON inspector | accessibility | advanced | None |
| ABB-061: Introduce a deterministic comparison model | comparison | intermediate | None |
| ABB-062: Load two sessions into a comparison workspace | comparison | intermediate | None |
| ABB-063: Show signed comparison summary metrics | comparison | intermediate | ABB-061, ABB-062 |
| ABB-064: Align tool-call sequences across sessions | comparison | advanced | ABB-061 |
| ABB-065: Render an aligned comparison timeline | comparison | advanced | ABB-062, ABB-064 |
| ABB-066: Show differences between aligned tool results | comparison | advanced | ABB-064, ABB-065 |
| ABB-067: Compare observed session time spans | comparison | intermediate | ABB-061, ABB-062 |
| ABB-068: Compare per-tool call frequencies | comparison | intermediate | ABB-061, ABB-062 |
| ABB-069: Filter comparison rows by difference type | comparison | intermediate | ABB-065, ABB-066 |
| ABB-070: Swap baseline and candidate sessions | comparison | beginner | ABB-062, ABB-063, ABB-065 |
| ABB-071: Export an offline HTML comparison report | comparison | advanced | ABB-063, ABB-065, ABB-066 |
| ABB-072: Export versioned comparison JSON | comparison | intermediate | ABB-061, ABB-064 |
| ABB-073: Chart event density in HTML reports | reports | intermediate | None |
| ABB-074: Visualize report tool-call frequencies | reports | intermediate | None |
| ABB-075: Chart reported failures by tool name | reports | intermediate | None |
| ABB-076: Visualize repeated-call positions in reports | reports | intermediate | None |
| ABB-077: Expand long-report print regression coverage | reports | beginner | None |
| ABB-078: Add stable report navigation anchors | reports | beginner | None |
| ABB-079: Export report charts as standalone SVG | reports | intermediate | ABB-073, ABB-074, ABB-075 |
| ABB-080: Visualize gaps between timestamped events | reports | intermediate | None |
| ABB-081: Analyze multiple explicitly named session files | cli | intermediate | None |
| ABB-082: Handle closed output pipes without stack traces | cli | beginner | None |
| ABB-083: Expose machine-readable version information | cli | beginner | None |
| ABB-084: Provide Bash and Zsh command completions | cli | intermediate | None |
| ABB-085: Add opt-in exit gates for diagnostic codes | cli | intermediate | ABB-040 |
| ABB-086: Write reports atomically without replacing files | cli | intermediate | None |
| ABB-087: Add an explicit --force report-replacement option | cli | intermediate | ABB-086 |
| ABB-088: Support --output - for explicit stdout routing | cli | beginner | None |
| ABB-089: Add quiet mode for scheduled commands | cli | beginner | None |
| ABB-090: Allow the local server to select an available port | cli | intermediate | None |
| ABB-091: Bound shutdown with stale client connections | cli | intermediate | None |
| ABB-092: Add reviewed golden snapshots for CLI reports | cli | intermediate | None |
| ABB-093: Provide a GitHub composite Action for analysis | integrations | advanced | None |
| ABB-094: Add an opt-in aggregate GitHub Actions summary | integrations | intermediate | ABB-093, ABB-040 |
| ABB-095: Provide an opt-in local pre-commit integration | integrations | intermediate | None |
| ABB-096: Provide VS Code tasks for selected sessions | integrations | beginner | None |
| ABB-097: Add a runnable npm-script integration example | integrations | beginner | None |
| ABB-098: Document tested Bash and PowerShell recipes | integrations | beginner | None |
| ABB-099: Provide a minimal container for offline analysis | integrations | intermediate | None |
| ABB-100: Add a minimal development-container configuration | integrations | intermediate | None |
| ABB-101: Generate a dependency-aware ready-task index | maintainer-tooling | beginner | None |
| ABB-102: Check local documentation links and anchors | maintainer-tooling | intermediate | None |
| ABB-103: Add a read-only release preflight command | maintainer-tooling | intermediate | None |
| ABB-104: Smoke-test the installed npm tarball | maintainer-tooling | advanced | None |
| ABB-105: Generate and verify release-artifact checksums | maintainer-tooling | intermediate | None |
| ABB-106: Check executable shebangs and line endings | maintainer-tooling | beginner | None |
| ABB-107: Check consistency of documented Node support | maintainer-tooling | beginner | None |
| ABB-108: Record privacy provenance for shared fixtures | maintainer-tooling | beginner | None |
| ABB-109: Add seeded secret-canary report invariants | privacy | advanced | None |
| ABB-110: Verify standalone reports make no network requests | privacy | advanced | None |
| ABB-111: Add an HTML-injection report regression corpus | privacy | intermediate | ABB-110 |
| ABB-112: Check CLI failures for session-content leaks | privacy | intermediate | None |
| ABB-113: Check fixture contact details and token canaries | privacy | beginner | None |
| ABB-114: Verify restrictive saved-report permissions | privacy | intermediate | ABB-086 |
| ABB-115: Provide a synthetic security-report reproducer | privacy | beginner | None |
| ABB-116: Create a runnable first-contribution lab | documentation | beginner | None |
| ABB-117: Maintain an English–French terminology glossary | documentation | beginner | None |
| ABB-118: Execute designated documentation examples in CI | documentation | intermediate | None |
| ABB-119: Document cross-platform release verification | documentation | beginner | ABB-105 |
| ABB-120: Report external contributions from exported PR data | community | intermediate | None |

See [CONTRIBUTING.md](../CONTRIBUTING.md) and [publishing.md](publishing.md).
