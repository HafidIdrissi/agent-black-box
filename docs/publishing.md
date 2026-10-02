# Publish the prepared project

Actual publication requires a repository and write access. The source and 120 issue proposals are ready independently of GitHub.

## Create and push a public repository

Install Git and GitHub CLI, then authenticate using gh auth login. Never paste tokens into source or chat. From the project directory, after reviewing the files:

```sh
git init -b main
git add .
git commit -m "Initial Agent Black Box MVP"
gh repo create agent-black-box --public --source=. --remote=origin --push
```

If the repository already exists, use its exact URL rather than creating another.

## Verify

```sh
npm run check
npm test
npm start
```

Try the demo and a synthetic import. Inspect CI after pushing. The package is not published to npm.

## Preview and publish issues

Replace OWNER with your GitHub login:

```sh
node scripts/publish-issues.mjs --repo OWNER/agent-black-box > issue-preview.json
node scripts/publish-issues.mjs --repo OWNER/agent-black-box --apply
```

Without --apply, the script prints a preview and makes no GitHub calls. With --apply, it verifies the exact repository, creates missing labels, then creates 120 issues with criteria and prerequisites. Dependent tasks are labeled blocked; only beginner tasks without prerequisites receive good first issue.

Writes are spaced to reduce rate-limit pressure. Reruns skip proposal IDs already found in open or closed issues. On a failed operation, inspect the tracker before rerunning. Existing titles and markers permit resuming without intentional duplicates; do not run two publishers concurrently.

The script never assigns people, requests reviews, or sends invitations. Follow the community plan and keep a manageable active shortlist. More issues do not guarantee more contributors.
