# Contributing to Agent Black Box

Thanks for taking the time to improve the project. Contributions should make a real user task easier or improve reliability.

## Pick a task

Browse the issue tracker or [backlog index](docs/backlog.md). Each proposal includes scope, acceptance criteria, entry files, and a validation plan.

- **Beginner:** a small, guided task with a narrow change.
- **Intermediate:** requires understanding several components.
- **Advanced:** a design or compatibility change; discuss the approach before coding.
- **Dependencies:** complete or resolve the listed proposal first.

Before starting, comment on the issue with your intended approach. Maintainers can clarify scope and avoid duplicated work. Do not wait for a formal assignment to ask questions, reproduce behavior, or improve your understanding.

## Set up

Install Node.js 22 or newer. Fork and clone the repository. No npm dependencies are needed.

```sh
npm start
npm run check
npm test
```

Use Explore a failed run in the browser or import examples/permission-loop.jsonl. Do not develop against private production logs.

## Make a pull request

1. Create a branch for one coherent change.
2. Keep the public API and privacy defaults compatible unless the issue calls for a reviewed change.
3. Add meaningful regression coverage when changing parsing, correlation, redaction, export, or server boundaries.
4. Run the checks above.
5. Explain the user-visible improvement, link the issue, and include validation evidence. Use synthetic screenshots or fixtures.
6. Describe limitations and tradeoffs. Do not claim checks you did not run.

Small documentation fixes do not require tests that simply restate the edited text. UI changes need keyboard and narrow-screen checks.

## Coding expectations

- Dependency-free ES modules unless a discussed need justifies a dependency.
- Treat all imported session fields as untrusted.
- Use textContent for logs in the viewer and escaping in static reports.
- Keep parsing and analysis deterministic and usable without the DOM or Node imports.
- Never execute a recorded command, read a recorded file path, or call a URL from a log.
- Default to local processing. New outbound network behavior needs explicit product discussion.
- Do not add secrets, real personal data, generated bulk changes, or unrelated cleanup.

## Reviews and recognition

Maintainers should explain requested changes and review small first contributions promptly when available; there is no guaranteed response time. Helpful reviews, documentation, and reproducible reports matter alongside merged code.

AI-assisted contributions are welcome when you understand the change, verify it, and can address review feedback. Follow the [code of conduct](CODE_OF_CONDUCT.md).
