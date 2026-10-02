# Verification

Verified on 2026-10-02 after GitHub publication.

- [GitHub Actions run 37054960187](https://github.com/HafidIdrissi/agent-black-box/actions/runs/37054960187) passed on release commit `e66453740e81080aa8a49ce312a9dde4e409a5b4`.
- `npm run check` and all 31 `npm test` tests passed in each of six configurations: Node 22 and 24 on Linux, Windows, and macOS.
- Coverage includes parsing, tool-result correlation, input limits, secret masking, bounded redaction scanning, inert HTML reports, CLI output handling, publisher dry-run output, and the local HTTP server's asset and Host restrictions.
- All 120 contribution proposals were published as [GitHub issues](https://github.com/HafidIdrissi/agent-black-box/issues). A readback confirmed unique proposal IDs, open status, markers, and the expected beginner/dependency labels. There are 35 beginner proposals; 33 have no prerequisites and carry `good first issue`. The 32 proposals with prerequisites carry `status:blocked`.
- The issue dependency graph has no cycles and all references resolve.
- [Launch workflow 37054960191](https://github.com/HafidIdrissi/agent-black-box/actions/runs/37054960191) passed the real Chromium walkthrough: file import, 8/3/3 counters, repeated-call signal, search, expanded error details, JSON and HTML downloads, error filter, reset, and no external HTTP requests from the viewer.
- The captured desktop overview was visually reviewed. This does not replace a full mobile, cross-browser or assistive-technology review.
- The generated GIF and MP4 each passed a 30-second duration check. Release asset hashes were checked before publishing [v0.1.0](https://github.com/HafidIdrissi/agent-black-box/releases/tag/v0.1.0); its tag resolves to the same source commit.
- Eight open starter issues were read back with the `launch:starter` label: #2, #44, #57, #78, #83, #96, #106 and #117.

Reproduce with Node 22+: `npm run check` followed by `npm test`. Start the viewer with `npm start`.
