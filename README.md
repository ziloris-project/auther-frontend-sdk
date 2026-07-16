# Auther Frontend SDK

The official browser SDKs for [Auther](https://auther.ziloris.com): drop-in
authentication for any website or JS framework app. Built by Ziloris.

> Server-side SDKs (Node, and Python/Go later) live in a separate polyglot repo:
> [ziloris-project/auther-backend-sdk](https://github.com/ziloris-project/auther-backend-sdk).

## Packages

| Package | Description | npm |
|---|---|---|
| [`@auther-sdk/frontend`](./frontend) | Framework-agnostic browser SDK. One `init()` renders login/signup and manages the session. | [![npm](https://img.shields.io/npm/v/@auther-sdk/frontend?style=flat&color=blue)](https://www.npmjs.com/package/@auther-sdk/frontend) |
| [`@auther-sdk/react`](./react) | React bindings: `AutherProvider` and `useAuther` with proactive token refresh. | [![npm](https://img.shields.io/npm/v/@auther-sdk/react?style=flat&color=blue)](https://www.npmjs.com/package/@auther-sdk/react) |

## Quick start

```bash
pnpm add @auther-sdk/react       # React apps
# or
pnpm add @auther-sdk/frontend    # any website
```

```tsx
import { AutherProvider, useAuther } from '@auther-sdk/react';

<AutherProvider clientId="req_live_xxxxxxxxxxxx">
    <App />
</AutherProvider>;
```

Tokens are held in memory (never localStorage); the session is restored from an
HTTP-only refresh cookie, so gate on `ready` from `useAuther()`.

Full guide at [auther.ziloris.com/docs](https://auther.ziloris.com/docs).

## Development

```bash
pnpm install           # install the workspace
pnpm build             # build every package
pnpm typecheck         # typecheck every package
pnpm dev               # watch-mode build for every package
```

## Releasing

Automated with [Changesets](https://github.com/changesets/changesets) and published from
CI. Add a changeset to your PR, merge it, then merge the "Version Packages" PR that opens.
See [RELEASING.md](./RELEASING.md).

## License

[Apache-2.0](./LICENSE), Copyright Ziloris.
