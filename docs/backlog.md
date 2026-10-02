# Contributor backlog

[120 published GitHub issues](https://github.com/HafidIdrissi/agent-black-box/issues), each scoped as a contribution proposal. ABB identifiers are stable proposal IDs, not GitHub issue numbers. Full descriptions, criteria, entry files, validation plans, and dependencies are in [backlog.json](backlog.json).

Paths to future files are proposed entry points. A proposal with dependencies is blocked until its prerequisites land. Design investigations need discussion before implementation.

| Proposal | Area | Level | Prerequisites |
| --- | --- | --- | --- |
| [ABB-001](https://github.com/HafidIdrissi/agent-black-box/issues/1): Document minimal normalized v1 trace examples | imports | beginner | None |
| [ABB-002](https://github.com/HafidIdrissi/agent-black-box/issues/2): Add multilingual and escaped-newline import fixtures | imports | beginner | None |
| [ABB-003](https://github.com/HafidIdrissi/agent-black-box/issues/3): Test interleaved tool calls with reverse-order results | imports | beginner | None |
| [ABB-004](https://github.com/HafidIdrissi/agent-black-box/issues/4): Test interrupted sessions and orphan results | imports | beginner | None |
| [ABB-005](https://github.com/HafidIdrissi/agent-black-box/issues/5): Document and test supported JSONL framing variations | imports | beginner | None |
| [ABB-006](https://github.com/HafidIdrissi/agent-black-box/issues/6): Document the implemented Claude Code field mapping | imports | beginner | None |
| [ABB-007](https://github.com/HafidIdrissi/agent-black-box/issues/7): Cover blank input and metadata-only sessions | imports | beginner | None |
| [ABB-008](https://github.com/HafidIdrissi/agent-black-box/issues/8): Index fixtures and their golden normalized outputs | imports | beginner | None |
| [ABB-009](https://github.com/HafidIdrissi/agent-black-box/issues/9): [Investigation] Specify a verified Codex log adapter | adapters | intermediate | None |
| [ABB-010](https://github.com/HafidIdrissi/agent-black-box/issues/10): Implement the approved Codex session adapter | adapters | intermediate | ABB-009 |
| [ABB-011](https://github.com/HafidIdrissi/agent-black-box/issues/11): [Investigation] Define an offline OTLP JSON mapping | adapters | advanced | None |
| [ABB-012](https://github.com/HafidIdrissi/agent-black-box/issues/12): Implement the approved offline OTLP JSON adapter | adapters | advanced | ABB-011 |
| [ABB-013](https://github.com/HafidIdrissi/agent-black-box/issues/13): [Investigation] Specify an OpenHands event adapter | adapters | intermediate | None |
| [ABB-014](https://github.com/HafidIdrissi/agent-black-box/issues/14): Implement the approved OpenHands event adapter | adapters | intermediate | ABB-013 |
| [ABB-015](https://github.com/HafidIdrissi/agent-black-box/issues/15): [Investigation] Define reproducible LangGraph capture | adapters | intermediate | None |
| [ABB-016](https://github.com/HafidIdrissi/agent-black-box/issues/16): Implement the approved LangGraph capture adapter | adapters | advanced | ABB-015 |
| [ABB-017](https://github.com/HafidIdrissi/agent-black-box/issues/17): Publish JSON Schema for normalized trace version 1 | schema | intermediate | None |
| [ABB-018](https://github.com/HafidIdrissi/agent-black-box/issues/18): [Investigation] Define schema compatibility rules | schema | intermediate | None |
| [ABB-019](https://github.com/HafidIdrissi/agent-black-box/issues/19): Implement the approved schema compatibility policy | schema | intermediate | ABB-017, ABB-018 |
| [ABB-020](https://github.com/HafidIdrissi/agent-black-box/issues/20): Preserve event identity and source provenance | schema | advanced | None |
| [ABB-021](https://github.com/HafidIdrissi/agent-black-box/issues/21): Preserve high-resolution time and clock domains | schema | advanced | ABB-018 |
| [ABB-022](https://github.com/HafidIdrissi/agent-black-box/issues/22): [Investigation] Specify nested and delegated runs | schema | advanced | None |
| [ABB-023](https://github.com/HafidIdrissi/agent-black-box/issues/23): Implement the approved nested-run model | schema | advanced | ABB-022 |
| [ABB-024](https://github.com/HafidIdrissi/agent-black-box/issues/24): Preserve attachment descriptors in content | schema | intermediate | ABB-018 |
| [ABB-025](https://github.com/HafidIdrissi/agent-black-box/issues/25): Expose structured import warnings with stable codes | imports | intermediate | None |
| [ABB-026](https://github.com/HafidIdrissi/agent-black-box/issues/26): Add an incremental JSONL import API | imports | advanced | None |
| [ABB-027](https://github.com/HafidIdrissi/agent-black-box/issues/27): Support cooperative cancellation of streaming imports | imports | intermediate | ABB-026 |
| [ABB-028](https://github.com/HafidIdrissi/agent-black-box/issues/28): Add opt-in duplicate-record handling | imports | intermediate | None |
| [ABB-029](https://github.com/HafidIdrissi/agent-black-box/issues/29): Merge explicitly ordered segments from one session | imports | advanced | ABB-028 |
| [ABB-030](https://github.com/HafidIdrissi/agent-black-box/issues/30): Explain adapter detection and reject ambiguity | imports | intermediate | None |
| [ABB-031](https://github.com/HafidIdrissi/agent-black-box/issues/31): Add bounded windows to repeated-call diagnostics | diagnostics | intermediate | None |
| [ABB-032](https://github.com/HafidIdrissi/agent-black-box/issues/32): Detect repeated multi-tool cycles with evidence | diagnostics | advanced | None |
| [ABB-033](https://github.com/HafidIdrissi/agent-black-box/issues/33): Group explicit repeated failures across arguments | diagnostics | intermediate | None |
| [ABB-034](https://github.com/HafidIdrissi/agent-black-box/issues/34): Annotate observed recovery after failed attempts | diagnostics | intermediate | None |
| [ABB-035](https://github.com/HafidIdrissi/agent-black-box/issues/35): Report calls with no recorded result | diagnostics | intermediate | None |
| [ABB-036](https://github.com/HafidIdrissi/agent-black-box/issues/36): Build a labelled diagnostic evaluation corpus | diagnostics | intermediate | ABB-040 |
| [ABB-037](https://github.com/HafidIdrissi/agent-black-box/issues/37): Introduce a pure diagnostic-rule interface | diagnostics | advanced | ABB-040 |
| [ABB-038](https://github.com/HafidIdrissi/agent-black-box/issues/38): Extract a minimal evidence slice for a finding | diagnostics | intermediate | ABB-020, ABB-040 |
| [ABB-039](https://github.com/HafidIdrissi/agent-black-box/issues/39): Support scoped diagnostic suppressions with reasons | diagnostics | intermediate | ABB-037 |
| [ABB-040](https://github.com/HafidIdrissi/agent-black-box/issues/40): Attach structured evidence references to findings | diagnostics | intermediate | ABB-020 |
| [ABB-041](https://github.com/HafidIdrissi/agent-black-box/issues/41): Replace loaded sessions through drag-and-drop | viewer | beginner | None |
| [ABB-042](https://github.com/HafidIdrissi/agent-black-box/issues/42): Import a session from pasted transcript text | viewer | intermediate | None |
| [ABB-043](https://github.com/HafidIdrissi/agent-black-box/issues/43): Toggle absolute and elapsed event timestamps | viewer | beginner | None |
| [ABB-044](https://github.com/HafidIdrissi/agent-black-box/issues/44): Add removable active filter chips | viewer | beginner | None |
| [ABB-045](https://github.com/HafidIdrissi/agent-black-box/issues/45): Add discoverable viewer keyboard shortcuts | viewer | intermediate | None |
| [ABB-046](https://github.com/HafidIdrissi/agent-black-box/issues/46): Search within selected tool results | viewer | intermediate | None |
| [ABB-047](https://github.com/HafidIdrissi/agent-black-box/issues/47): Bookmark events during an investigation | viewer | intermediate | None |
| [ABB-048](https://github.com/HafidIdrissi/agent-black-box/issues/48): Run browser imports in a cancellable worker | viewer | advanced | None |
| [ABB-049](https://github.com/HafidIdrissi/agent-black-box/issues/49): Add line navigation to tool results | viewer | intermediate | None |
| [ABB-050](https://github.com/HafidIdrissi/agent-black-box/issues/50): Add a wrap-lines preference for tool details | viewer | beginner | None |
| [ABB-051](https://github.com/HafidIdrissi/agent-black-box/issues/51): Add a grouped-by-tool exploration view | viewer | intermediate | None |
| [ABB-052](https://github.com/HafidIdrissi/agent-black-box/issues/52): Filter events by elapsed time range | viewer | intermediate | None |
| [ABB-053](https://github.com/HafidIdrissi/agent-black-box/issues/53): Introduce a high-contrast viewer theme | accessibility | beginner | None |
| [ABB-054](https://github.com/HafidIdrissi/agent-black-box/issues/54): Add adjustable reading text size | accessibility | beginner | None |
| [ABB-055](https://github.com/HafidIdrissi/agent-black-box/issues/55): Debounce accessible filter-result announcements | accessibility | intermediate | None |
| [ABB-056](https://github.com/HafidIdrissi/agent-black-box/issues/56): Navigate timeline events efficiently by keyboard | accessibility | intermediate | None |
| [ABB-057](https://github.com/HafidIdrissi/agent-black-box/issues/57): Document a screen-reader review walkthrough | accessibility | beginner | None |
| [ABB-058](https://github.com/HafidIdrissi/agent-black-box/issues/58): Test the keyboard-only review workflow | accessibility | intermediate | None |
| [ABB-059](https://github.com/HafidIdrissi/agent-black-box/issues/59): Provide a single-column reading preference | accessibility | beginner | None |
| [ABB-060](https://github.com/HafidIdrissi/agent-black-box/issues/60): Add an accessible structured JSON inspector | accessibility | advanced | None |
| [ABB-061](https://github.com/HafidIdrissi/agent-black-box/issues/61): Introduce a deterministic comparison model | comparison | intermediate | None |
| [ABB-062](https://github.com/HafidIdrissi/agent-black-box/issues/62): Load two sessions into a comparison workspace | comparison | intermediate | None |
| [ABB-063](https://github.com/HafidIdrissi/agent-black-box/issues/63): Show signed comparison summary metrics | comparison | intermediate | ABB-061, ABB-062 |
| [ABB-064](https://github.com/HafidIdrissi/agent-black-box/issues/64): Align tool-call sequences across sessions | comparison | advanced | ABB-061 |
| [ABB-065](https://github.com/HafidIdrissi/agent-black-box/issues/65): Render an aligned comparison timeline | comparison | advanced | ABB-062, ABB-064 |
| [ABB-066](https://github.com/HafidIdrissi/agent-black-box/issues/66): Show differences between aligned tool results | comparison | advanced | ABB-064, ABB-065 |
| [ABB-067](https://github.com/HafidIdrissi/agent-black-box/issues/67): Compare observed session time spans | comparison | intermediate | ABB-061, ABB-062 |
| [ABB-068](https://github.com/HafidIdrissi/agent-black-box/issues/68): Compare per-tool call frequencies | comparison | intermediate | ABB-061, ABB-062 |
| [ABB-069](https://github.com/HafidIdrissi/agent-black-box/issues/69): Filter comparison rows by difference type | comparison | intermediate | ABB-065, ABB-066 |
| [ABB-070](https://github.com/HafidIdrissi/agent-black-box/issues/70): Swap baseline and candidate sessions | comparison | beginner | ABB-062, ABB-063, ABB-065 |
| [ABB-071](https://github.com/HafidIdrissi/agent-black-box/issues/71): Export an offline HTML comparison report | comparison | advanced | ABB-063, ABB-065, ABB-066 |
| [ABB-072](https://github.com/HafidIdrissi/agent-black-box/issues/72): Export versioned comparison JSON | comparison | intermediate | ABB-061, ABB-064 |
| [ABB-073](https://github.com/HafidIdrissi/agent-black-box/issues/73): Chart event density in HTML reports | reports | intermediate | None |
| [ABB-074](https://github.com/HafidIdrissi/agent-black-box/issues/74): Visualize report tool-call frequencies | reports | intermediate | None |
| [ABB-075](https://github.com/HafidIdrissi/agent-black-box/issues/75): Chart reported failures by tool name | reports | intermediate | None |
| [ABB-076](https://github.com/HafidIdrissi/agent-black-box/issues/76): Visualize repeated-call positions in reports | reports | intermediate | None |
| [ABB-077](https://github.com/HafidIdrissi/agent-black-box/issues/77): Expand long-report print regression coverage | reports | beginner | None |
| [ABB-078](https://github.com/HafidIdrissi/agent-black-box/issues/78): Add stable report navigation anchors | reports | beginner | None |
| [ABB-079](https://github.com/HafidIdrissi/agent-black-box/issues/79): Export report charts as standalone SVG | reports | intermediate | ABB-073, ABB-074, ABB-075 |
| [ABB-080](https://github.com/HafidIdrissi/agent-black-box/issues/80): Visualize gaps between timestamped events | reports | intermediate | None |
| [ABB-081](https://github.com/HafidIdrissi/agent-black-box/issues/81): Analyze multiple explicitly named session files | cli | intermediate | None |
| [ABB-082](https://github.com/HafidIdrissi/agent-black-box/issues/82): Handle closed output pipes without stack traces | cli | beginner | None |
| [ABB-083](https://github.com/HafidIdrissi/agent-black-box/issues/83): Expose machine-readable version information | cli | beginner | None |
| [ABB-084](https://github.com/HafidIdrissi/agent-black-box/issues/84): Provide Bash and Zsh command completions | cli | intermediate | None |
| [ABB-085](https://github.com/HafidIdrissi/agent-black-box/issues/85): Add opt-in exit gates for diagnostic codes | cli | intermediate | ABB-040 |
| [ABB-086](https://github.com/HafidIdrissi/agent-black-box/issues/86): Write reports atomically without replacing files | cli | intermediate | None |
| [ABB-087](https://github.com/HafidIdrissi/agent-black-box/issues/87): Add an explicit --force report-replacement option | cli | intermediate | ABB-086 |
| [ABB-088](https://github.com/HafidIdrissi/agent-black-box/issues/88): Support --output - for explicit stdout routing | cli | beginner | None |
| [ABB-089](https://github.com/HafidIdrissi/agent-black-box/issues/89): Add quiet mode for scheduled commands | cli | beginner | None |
| [ABB-090](https://github.com/HafidIdrissi/agent-black-box/issues/90): Allow the local server to select an available port | cli | intermediate | None |
| [ABB-091](https://github.com/HafidIdrissi/agent-black-box/issues/91): Bound shutdown with stale client connections | cli | intermediate | None |
| [ABB-092](https://github.com/HafidIdrissi/agent-black-box/issues/92): Add reviewed golden snapshots for CLI reports | cli | intermediate | None |
| [ABB-093](https://github.com/HafidIdrissi/agent-black-box/issues/93): Provide a GitHub composite Action for analysis | integrations | advanced | None |
| [ABB-094](https://github.com/HafidIdrissi/agent-black-box/issues/94): Add an opt-in aggregate GitHub Actions summary | integrations | intermediate | ABB-093, ABB-040 |
| [ABB-095](https://github.com/HafidIdrissi/agent-black-box/issues/95): Provide an opt-in local pre-commit integration | integrations | intermediate | None |
| [ABB-096](https://github.com/HafidIdrissi/agent-black-box/issues/96): Provide VS Code tasks for selected sessions | integrations | beginner | None |
| [ABB-097](https://github.com/HafidIdrissi/agent-black-box/issues/97): Add a runnable npm-script integration example | integrations | beginner | None |
| [ABB-098](https://github.com/HafidIdrissi/agent-black-box/issues/98): Document tested Bash and PowerShell recipes | integrations | beginner | None |
| [ABB-099](https://github.com/HafidIdrissi/agent-black-box/issues/99): Provide a minimal container for offline analysis | integrations | intermediate | None |
| [ABB-100](https://github.com/HafidIdrissi/agent-black-box/issues/100): Add a minimal development-container configuration | integrations | intermediate | None |
| [ABB-101](https://github.com/HafidIdrissi/agent-black-box/issues/101): Generate a dependency-aware ready-task index | maintainer-tooling | beginner | None |
| [ABB-102](https://github.com/HafidIdrissi/agent-black-box/issues/102): Check local documentation links and anchors | maintainer-tooling | intermediate | None |
| [ABB-103](https://github.com/HafidIdrissi/agent-black-box/issues/103): Add a read-only release preflight command | maintainer-tooling | intermediate | None |
| [ABB-104](https://github.com/HafidIdrissi/agent-black-box/issues/104): Smoke-test the installed npm tarball | maintainer-tooling | advanced | None |
| [ABB-105](https://github.com/HafidIdrissi/agent-black-box/issues/105): Generate and verify release-artifact checksums | maintainer-tooling | intermediate | None |
| [ABB-106](https://github.com/HafidIdrissi/agent-black-box/issues/106): Check executable shebangs and line endings | maintainer-tooling | beginner | None |
| [ABB-107](https://github.com/HafidIdrissi/agent-black-box/issues/107): Check consistency of documented Node support | maintainer-tooling | beginner | None |
| [ABB-108](https://github.com/HafidIdrissi/agent-black-box/issues/108): Record privacy provenance for shared fixtures | maintainer-tooling | beginner | None |
| [ABB-109](https://github.com/HafidIdrissi/agent-black-box/issues/109): Add seeded secret-canary report invariants | privacy | advanced | None |
| [ABB-110](https://github.com/HafidIdrissi/agent-black-box/issues/110): Verify standalone reports make no network requests | privacy | advanced | None |
| [ABB-111](https://github.com/HafidIdrissi/agent-black-box/issues/111): Add an HTML-injection report regression corpus | privacy | intermediate | ABB-110 |
| [ABB-112](https://github.com/HafidIdrissi/agent-black-box/issues/112): Check CLI failures for session-content leaks | privacy | intermediate | None |
| [ABB-113](https://github.com/HafidIdrissi/agent-black-box/issues/113): Check fixture contact details and token canaries | privacy | beginner | None |
| [ABB-114](https://github.com/HafidIdrissi/agent-black-box/issues/114): Verify restrictive saved-report permissions | privacy | intermediate | ABB-086 |
| [ABB-115](https://github.com/HafidIdrissi/agent-black-box/issues/115): Provide a synthetic security-report reproducer | privacy | beginner | None |
| [ABB-116](https://github.com/HafidIdrissi/agent-black-box/issues/116): Create a runnable first-contribution lab | documentation | beginner | None |
| [ABB-117](https://github.com/HafidIdrissi/agent-black-box/issues/117): Maintain an English–French terminology glossary | documentation | beginner | None |
| [ABB-118](https://github.com/HafidIdrissi/agent-black-box/issues/118): Execute designated documentation examples in CI | documentation | intermediate | None |
| [ABB-119](https://github.com/HafidIdrissi/agent-black-box/issues/119): Document cross-platform release verification | documentation | beginner | ABB-105 |
| [ABB-120](https://github.com/HafidIdrissi/agent-black-box/issues/120): Report external contributions from exported PR data | community | intermediate | None |

See [CONTRIBUTING.md](../CONTRIBUTING.md) and [publishing.md](publishing.md).
