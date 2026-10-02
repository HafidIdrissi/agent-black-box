# Agent Black Box

[![CI](https://github.com/HafidIdrissi/agent-black-box/actions/workflows/ci.yml/badge.svg)](https://github.com/HafidIdrissi/agent-black-box/actions/workflows/ci.yml)

**Understand why your coding agent kept retrying — without uploading its logs.**

Import a Claude Code JSONL session, connect failed tool results to their calls, and inspect repeated attempts. Run the included synthetic failure in under a minute.

v0.1.0 · Early MVP · MIT · Node.js 22+ · No runtime dependencies · No API key

[Release and downloads](https://github.com/HafidIdrissi/agent-black-box/releases/tag/v0.1.0) · [Français](docs/README.fr.md) · [Contribute](CONTRIBUTING.md) · [Find a first issue](https://github.com/HafidIdrissi/agent-black-box/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) · [Architecture](docs/architecture.md) · [120 contribution proposals](docs/backlog.md)

[![A 30-second walkthrough: import a synthetic agent log, inspect three repeated failures, and export the report](https://github.com/HafidIdrissi/agent-black-box/releases/download/v0.1.0/agent-black-box-demo.gif)](https://github.com/HafidIdrissi/agent-black-box/releases/download/v0.1.0/agent-black-box-demo.mp4)

**Watch:** [30-second video](https://github.com/HafidIdrissi/agent-black-box/releases/download/v0.1.0/agent-black-box-demo.mp4) · [Accessible transcript](docs/demo.md). Captured from the real application with a synthetic session; six views held for five seconds each.

## Try it in one minute

Clone the project and start the local viewer:

```sh
git clone https://github.com/HafidIdrissi/agent-black-box.git
cd agent-black-box
npm start
```

Open **http://127.0.0.1:8787/web/** and select **Explore a failed run**. The synthetic session shows a test command failing three times with the same permission error.

No install or build step is required. The demo uses invented data. Imported files are read in browser memory; the application does not upload them or call a model.

## What works today

- Import Claude Code JSONL records containing messages, tool calls, and tool results.
- Import the version 1 normalized JSON format.
- Link tool results to their originating calls.
- Inspect a searchable timeline with tool and error filters.
- Flag three or more calls with the same tool and arguments. Calls containing masked arguments are excluded to avoid merging different secrets into a false repetition.
- Apply best-effort masking before display and export.
- Download normalized JSON and a script-free HTML report.
- Analyze files or stdin from the command line.

A repeated call is an investigation signal. It does not by itself prove that an agent is stuck. Logs describe recorded activity; Agent Black Box does not replay commands or execute tool calls.

## Command line

```sh
node bin/agent-black-box.mjs analyze examples/permission-loop.jsonl
node bin/agent-black-box.mjs analyze examples/permission-loop.jsonl --format html --output demo-report.html
node bin/agent-black-box.mjs analyze - < examples/permission-loop.jsonl
node bin/agent-black-box.mjs serve --port 8788
node bin/agent-black-box.mjs --help
```

Output files are created exclusively so existing reports are not silently overwritten. JSON output can be imported into the viewer again. This repository is not published to npm; use the checked-out source.

## Privacy and limits

Masking is heuristic, not a guarantee of anonymization. Review every report before sharing it. Free-form logs may include code, names, paths, business information, credentials, and personal data that the masker cannot recognize.

- Input limit: 10 MiB and 20,000 normalized events.
- No telemetry, accounts, external fonts, CDN assets, or cloud storage.
- Browser state is in memory and is cleared when the page reloads or the session is reset.
- The local HTTP server binds to 127.0.0.1 and exposes a fixed list of application assets.
- Claude Code log formats can change. Unknown records are surfaced as import warnings where possible.
- This MVP does not capture live sessions, run agents, compare sessions, calculate model costs, or support every agent format.

See [SECURITY.md](SECURITY.md) before sharing logs.

## Contribute

Choose one of **[eight launch starter issues](docs/first-contribution.md#eight-places-to-start)** across fixtures, UI, accessibility, reports, CLI, integrations, portability, and translation. Then read [CONTRIBUTING.md](CONTRIBUTING.md). Choose one scoped issue, describe your approach, and submit a small pull request with evidence that it works.

```sh
npm run check
npm test
```

The backlog contains **120 proposals**, including beginner tasks and larger investigations. The [starter guide](docs/first-contribution.md) explains where to begin. Dependencies are explicit, and future-file paths are suggestions, not existing features.

Code, documentation, accessibility reviews, sanitized fixtures, reproducible bug reports, and thoughtful reviews are welcome. Please do not submit real session secrets, placeholder PRs, or cosmetic changes solely to increase contribution counts.

## Roadmap

1. Improve import fidelity with versioned, synthetic fixtures.
2. Make failure evidence easier to inspect.
3. Design useful session comparisons.
4. Add additional adapters only after documenting their formats.
5. Improve distribution and integrations without adding mandatory cloud services.

The repository's issue tracker is the working roadmap. A listed proposal is not a promise that it will ship.

## Follow the launch

[Release notes](docs/releases/v0.1.0.md) · [Launch posts and first-week plan](docs/launch.md) · [Verified behavior](docs/verification.md)

## License

[MIT](LICENSE).
