# Verification

Verified on 2026-10-02 after GitHub publication.

- [GitHub Actions run 37050007990](https://github.com/HafidIdrissi/agent-black-box/actions/runs/37050007990) passed on code commit `6c0892dac20db37b4ed8fb7c1656b89e37c777e6`.
- `npm run check` and all 31 `npm test` tests passed in each of six configurations: Node 22 and 24 on Linux, Windows, and macOS.
- Coverage includes parsing, tool-result correlation, input limits, secret masking, bounded redaction scanning, inert HTML reports, CLI output handling, publisher dry-run output, and the local HTTP server's asset and Host restrictions.
- All 120 contribution proposals were published as [GitHub issues](https://github.com/HafidIdrissi/agent-black-box/issues). A readback confirmed unique proposal IDs, open status, markers, and the expected beginner/dependency labels. There are 35 beginner proposals; 33 have no prerequisites and carry `good first issue`. The 32 proposals with prerequisites carry `status:blocked`.
- The issue dependency graph has no cycles and all references resolve.
- A visual check in a real browser has not been performed in this environment. Try the demo and file import in a current browser before making a release announcement.

Reproduce with Node 22+: `npm run check` followed by `npm test`. Start the viewer with `npm start`.
