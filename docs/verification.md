# Verification of the prepared source

Prepared on 2026-10-02 before GitHub publication.

- 25 core and report tests passed in a JavaScript V8 isolate using an equivalent assertion harness. This includes parsing, result correlation, bounds, secret masking, inert HTML, false-repeat prevention, and safe identifier/key remapping, and bounded scanning of long hyphenated text.
- JavaScript syntax was checked for the 13 .mjs files after removing module imports and wrapping top-level await for the available runtime. This is not a substitute for Node's native module loading.
- All 120 proposal IDs/titles are unique, every issue has three criteria, and dependency references exist with no cycles. There are 35 beginner proposals.
- Node subprocess, HTTP, publisher-preview tests, the actual OS matrix, and a visual browser run were not executable in the preparation environment.

Run npm run check and npm test on Node 22+ after extracting the project. CI covers Node 22/24 on Linux, Windows, and macOS once the repository is pushed. Try both demo and file import in a current browser before announcing the release.
