# Auther Frontend SDK

The official browser SDKs for [Auther](https://auther.ziloris.com) — drop-in
authentication for any website or JS framework app. Built by Ziloris.

> Server-side SDKs (Node, and Python/Go later) live in a separate polyglot repo:
> [ziloris-project/auther-backend-sdk](https://github.com/ziloris-project/auther-backend-sdk).

## Packages

| Package | Description | npm |
|---|---|---|
| [`@auther-sdk/frontend`](./frontend) | Framework-agnostic browser SDK — one `init()` renders login/signup and manages the session | [![npm](https://img.shields.io/npm/v/@auther-sdk/frontend?style=flat&color=blue)](https://www.npmjs.com/package/@auther-sdk/frontend) |
| [`@auther-sdk/react`](./react) | React bindings — `AutherProvider` + `useAuther` with proactive token refresh | [![npm](https://img.shields.io/npm/v/@auther-sdk/react?style=flat&color=blue)](https://www.npmjs.com/package/@auther-sdk/react) |

## Quick start

```bash
pnpm add @auther-sdk/react       # React apps
# or
pnpm add @auther-sdk/frontend    # any website
```

```tsx
import { AutherProvider, useAuther } from '@auther-sdk/react';

<AutherProvider config={{ projectId: 'proj_live_xxxxxxxxxxxx' }}>
    <App />
</AutherProvider>;
```

Full guide at [auther.ziloris.com/docs](https://auther.ziloris.com/docs).

## Development

```bash
pnpm install           # install the workspace
pnpm build             # build every package
pnpm typecheck         # typecheck every package
pnpm dev               # watch-mode build for every package
```

## Releasing

Releases are automated with [Changesets](https://github.com/changesets/changesets)
and published to npm from CI — **never from a developer machine**.

1. In your feature PR, run `pnpm changeset`, pick the affected packages and the
   semver bump, and commit the generated `.changeset/*.md` alongside your code.
2. When the PR merges to `main`, the release workflow opens a **Version Packages**
   PR that bumps versions and updates each package's `CHANGELOG.md`.
3. Merging the Version Packages PR publishes the affected packages to npm with
   [sigstore provenance](https://docs.npmjs.com/generating-provenance-statements).

A push with no pending changeset publishes nothing — that's the guardrail against
accidental releases.

## License

[Apache-2.0](./LICENSE) © Ziloris
