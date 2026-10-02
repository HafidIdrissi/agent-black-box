# Your first contribution

## Eight places to start

These eight issues were open, unassigned, and without prerequisites at launch. **Open the issue before starting**: someone may have begun work since. Beginner means no prior project knowledge is required; some tasks need the tools or experience listed below.

| Issue | Area | Useful outcome | Helpful experience |
| --- | --- | --- | --- |
| [#2](https://github.com/HafidIdrissi/agent-black-box/issues/2) | Synthetic fixtures | Preserve multilingual text and escaped newlines. | JavaScript tests |
| [#44](https://github.com/HafidIdrissi/agent-black-box/issues/44) | Viewer | Show and remove active timeline filters. | HTML / JavaScript |
| [#57](https://github.com/HafidIdrissi/agent-black-box/issues/57) | Accessibility | Document an actual screen-reader walkthrough. | A screen reader and browser |
| [#78](https://github.com/HafidIdrissi/agent-black-box/issues/78) | Reports | Jump from report findings to event evidence. | HTML / JavaScript |
| [#83](https://github.com/HafidIdrissi/agent-black-box/issues/83) | CLI | Expose application and Node versions as JSON. | Node.js |
| [#96](https://github.com/HafidIdrissi/agent-black-box/issues/96) | Integrations | Add useful VS Code tasks. | VS Code |
| [#106](https://github.com/HafidIdrissi/agent-black-box/issues/106) | Portability | Check executable shebangs and LF endings. | Node.js / command-line tools |
| [#117](https://github.com/HafidIdrissi/agent-black-box/issues/117) | Translation | Keep English and French terminology consistent. | English / French |

[See currently open launch starters](https://github.com/HafidIdrissi/agent-black-box/issues?q=is%3Aissue%20is%3Aopen%20label%3A%22launch%3Astarter%22). Comment with your approach before working; there is no need to complete several issues to contribute.

## Make your first PR

1. Run npm start and load the synthetic demo.
2. Run npm run check and npm test to establish a clean baseline.
3. Read one beginner proposal in the issue tracker or backlog index.
4. Inspect its entry files and reproduce the relevant behavior.
5. Comment with a short approach or a specific question.
6. Submit one focused change and explain how you checked it.

A useful PR may be a synthetic compatibility fixture, a clarified workflow, an accessibility improvement, or a behavior fix. It need not be large.

If an entry path does not exist yet, the issue is proposing a new file. Check dependencies before beginning. Proposal IDs such as ABB-001 are stable backlog identifiers, not GitHub issue numbers.

Never upload a personal agent session to demonstrate a problem. Build a small fake example with invented paths and content. Read SECURITY.md before sharing fixtures or reports.

English is the default for shared documentation, but questions in French are welcome. Maintainers can help clarify language; code and documentation should stay accurate.
