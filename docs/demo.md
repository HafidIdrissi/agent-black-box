# A failed agent run in 30 seconds

[Watch the MP4](https://github.com/HafidIdrissi/agent-black-box/releases/download/v0.1.0/agent-black-box-demo.mp4) · [View the GIF](https://github.com/HafidIdrissi/agent-black-box/releases/download/v0.1.0/agent-black-box-demo.gif)

This is a captioned walkthrough made from six real Chromium screenshots, each shown for five seconds. It uses the invented session in [examples/permission-loop.jsonl](../examples/permission-loop.jsonl). No model was run to make the demonstration.

| Time | On screen | What to notice |
| --- | --- | --- |
| 0–5 s | Local viewer, before import | No account, API key, or uploaded session is required. |
| 5–10 s | Import the synthetic JSONL file | Eight events, three tool calls, three failed calls, nine seconds. |
| 10–15 s | Repeated-call signal | The same Bash command and arguments appear three times. Repetition is a clue to investigate. |
| 15–20 s | Search permission errors and open a result | The recorded output says the test runner is not executable. |
| 20–25 s | Export a standalone HTML report | The report contains the actual imported evidence and three identical calls. Review masking before sharing real reports. |
| 25–30 s | Return to the viewer | Try the demo, then choose a starter task from the contribution guide. |

## Reproduce the interaction

1. Run `npm start` with Node.js 22+.
2. Open http://127.0.0.1:8787/web/ and import `examples/permission-loop.jsonl`.
3. Inspect **Repeated calls** in the Signals panel.
4. Search for `Permission denied` and expand the first tool result.
5. Choose **Export report** and open the downloaded HTML file.

The **Errors** metric counts three failed calls; **Errors only** displays both the failed calls and their results, so it shows six events. The session has three matching commands, not three proven independent root causes.

## How the media is built

The launch workflow installs a pinned Playwright version in an isolated temporary directory, starts the real local server, checks the visible results, and exports both JSON and HTML through the actual UI. FFmpeg assembles six captured views into a 30-second GIF and MP4, adding captions below the UI. This tooling is optional and does not add application runtime dependencies.

See [capture-demo.mjs](../scripts/capture-demo.mjs) and [launch.yml](../.github/workflows/launch.yml). The workflow checks media duration and writes a manifest with the source commit and asset hashes. Only synthetic data is used.
