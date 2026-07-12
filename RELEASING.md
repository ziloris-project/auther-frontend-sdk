# Releasing

How `@auther-sdk/frontend` and `@auther-sdk/react` get published to npm.

## TL;DR

1. In your feature PR, run `pnpm changeset`, pick the packages and the semver bump, commit the generated `.changeset/*.md`.
2. Merge the PR to `main`.
3. A bot opens a "Version Packages" PR that applies the bumps and writes changelogs.
4. Merge that PR. CI publishes to npm automatically.

No one runs `npm publish` by hand. There are no npm tokens anywhere.

## How authentication works

Publishing uses npm **OIDC Trusted Publishing**. GitHub Actions proves the workflow's identity to npm with a short-lived OpenID Connect token, and npm checks it against the Trusted Publisher registered for each package. Because there is no long-lived token, there is nothing to leak or rotate.

Configured once per package on npmjs.com (Settings, Trusted Publisher):

| Package | Org | Repo | Workflow |
|---|---|---|---|
| @auther-sdk/frontend | ziloris-project | auther-frontend-sdk | release.yml |
| @auther-sdk/react | ziloris-project | auther-frontend-sdk | release.yml |

Requirements the workflow already satisfies: `id-token: write` permission, npm 11.5.1 or newer, Node 22.14 or newer, and `registry-url` set to the npm registry.

## The full cycle, step by step

1. **Author a change.** Edit code in `frontend/` or `react/`.
2. **Record intent.** Run `pnpm changeset`. Choose the affected packages and whether the change is patch, minor, or major. Write a one line summary. This creates a file under `.changeset/`. Commit it with your code.
3. **Open and merge the PR.** The changeset file shows up in the diff, so the reviewer sees the intended version bump and changelog line.
4. **Version Packages PR.** On merge to `main`, `release.yml` runs. Seeing pending changesets, it opens (or updates) a PR titled "chore(release): version packages". That PR bumps the versions in `package.json`, updates each `CHANGELOG.md`, and deletes the consumed changeset files. `react`'s `workspace:^` dependency on `frontend` is rewritten to the real published version at this stage.
5. **Publish.** Merge the Version Packages PR. `release.yml` runs again, finds no pending changesets, and runs `pnpm changeset publish`, which publishes only the packages whose version is not yet on npm. Each artifact is signed with sigstore provenance, so npmjs.com shows a verified badge linking it to the exact workflow run.

A push to `main` with no pending changeset publishes nothing. That is the guardrail against accidental releases.

## Versioning notes

`frontend` and `react` are **linked** in the changeset config: when one is released they move to the same version line, since `react` wraps `frontend`. A package with no changeset is not bumped and not published.

## Triggering a release manually

The workflow also accepts a manual run (Actions tab, "Release", Run workflow), useful if a scheduled push did not fire. It behaves the same: version if changesets are pending, otherwise publish anything unpublished.

## Troubleshooting

- **Nothing published after merging.** Check that a `.changeset/*.md` existed in the feature PR. No changeset means no release.
- **Publish fails with a 404 or auth error.** The Trusted Publisher for that package is missing or points at the wrong repo or workflow filename. It must be repo `auther-frontend-sdk`, workflow `release.yml`.
- **`tsc` cannot find `@auther-sdk/frontend` in CI.** The typecheck reads frontend from source via `react/tsconfig.typecheck.json`. Do not point react's typecheck back at the built dist.
