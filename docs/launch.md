# Agent Black Box launch kit

These are prepared posts, not a record of published announcements. Attach the [demo](https://github.com/HafidIdrissi/agent-black-box/releases/tag/v0.1.0) where supported, check each community's submission rules, and stay available for replies.

## Show HN

**Title:** Show HN: Agent Black Box — inspect AI coding-agent logs locally

**URL:** https://github.com/HafidIdrissi/agent-black-box

**First comment:**

I built Agent Black Box to make recorded agent failures easier to inspect. Import a Claude Code JSONL log or a normalized v1 JSON session, inspect tool calls and results, filter errors, and export a standalone HTML report.

The synthetic demo has the same test command fail three times with a permission error. The viewer connects each result to its call and highlights repeated tool/argument combinations. Repetition is a signal to investigate.

It runs locally with Node.js 22+, with no runtime dependencies, API key, or model call. Imported logs stay in browser memory. Masking is best effort, so reports still need review before sharing.

This is an early MVP: no live capture, replay, cost calculation, or universal format support. What recorded agent failure is hardest for you to understand? I would also welcome first-run feedback and help with the eight starter tasks linked in the README.

## X

I built Agent Black Box: inspect AI coding-agent logs locally, find tool errors and repeated attempts, and export a report. No API key. Try the synthetic demo and tell me what is hard to understand.

https://github.com/HafidIdrissi/agent-black-box

## LinkedIn — English

When an AI coding agent keeps retrying a command, what happened between the call and its result?

I built Agent Black Box, an open-source local debugger for recorded coding-agent sessions. The synthetic demo shows one test command failing three times with the same permission error. Inspect the timeline, filter failures, and export a standalone HTML report.

The MVP imports Claude Code JSONL and normalized v1 JSON. It runs with Node.js 22+, without an API key or runtime dependencies, and does not upload imported logs. Automatic masking is best effort; review reports before sharing.

I am looking for feedback on the first-run experience and contributions to eight starter tasks covering fixtures, interface, accessibility, reports, CLI, integrations, portability, and translation.

Try it: https://github.com/HafidIdrissi/agent-black-box

## LinkedIn — Français

Quand un agent IA répète une commande en échec, comment comprendre ce qui s'est passé ?

J'ai créé Agent Black Box, un outil open source pour inspecter localement les journaux d'agents de programmation. La démo utilise des données fictives : une commande de test échoue trois fois avec la même erreur de permission. On peut examiner la chronologie, filtrer les erreurs et exporter un rapport HTML autonome.

Cette première version importe les journaux Claude Code JSONL et un format JSON normalisé. Elle fonctionne avec Node.js 22+, sans clé API ni dépendance d'exécution. Les journaux importés ne sont pas envoyés à un serveur. Le masquage automatique reste imparfait : il faut relire les rapports avant de les partager.

Je cherche des retours sur la prise en main et des contributions à huit tâches ciblées. Les questions en français sont les bienvenues.

Pour essayer et contribuer : https://github.com/HafidIdrissi/agent-black-box

## First seven days

Days are relative to the first public announcement. This is a maintainer checklist; it does not create automated outreach or promise a response time.

| Day | Action | Evidence |
| --- | --- | --- |
| 1 | Verify release/demo links, then share one demonstration in a relevant community. | Post URL and first-run feedback. |
| 2 | Answer questions and reproduce onboarding problems with synthetic input. | Reproduction and correction or documented limitation. |
| 3 | Recheck the eight starter tasks and clarify approaches with interested contributors. | Current discussions and ownership. |
| 4 | Review incoming PRs; aim for a helpful response within 24–48 hours when available. | Response times and concrete feedback. |
| 5 | Share one verified improvement or technical lesson with another relevant community. | Post URL and specific feedback. |
| 6 | Help finish contributions and refresh the starter shortlist. | Merged PRs and remaining obstacles. |
| 7 | Thank contributors according to their preferences and report progress. | Shipped changes and next priorities. |

## Contributor milestones

Aim for **3**, then **10**, then **20** distinct external accounts with a substantive merged PR. These are targets, not current results or promises.

For a stated reporting period, count unique merged-PR author logins. Exclude the owner `HafidIdrissi`, other declared maintainers and their known aliases, and bot accounts. Count a repeat author once. Documentation, tests, accessibility and code all qualify. Record the PR links and exclusions with each count. Accounts are a practical proxy for people.

Also track voluntary successful first-run reports, onboarding failures, time to a helpful first human response, and returning contributors. Stars, forks, opened issues and unmerged PRs are separate measures. No application telemetry or private session logs are needed. GitHub Trending is not guaranteed.
