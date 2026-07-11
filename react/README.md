# @auther-sdk/react

[![npm](https://img.shields.io/npm/v/@auther-sdk/react?style=flat&color=blue)](https://www.npmjs.com/package/@auther-sdk/react)

React bindings for [Auther](https://auther.ziloris.com) — a drop-in `AutherProvider` with
built-in session management and proactive token refresh, plus a `useAuther` hook. Wraps
[`@auther-sdk/frontend`](https://www.npmjs.com/package/@auther-sdk/frontend).

## Install

```bash
npm install @auther-sdk/react
```

## Usage

```tsx
import { AutherProvider, useAuther } from '@auther-sdk/react';

function App() {
    return (
        <AutherProvider config={{ projectId: 'proj_live_xxxxxxxxxxxx' }}>
            <Dashboard />
        </AutherProvider>
    );
}

function Dashboard() {
    const { user, isLoading } = useAuther();
    if (isLoading) return <p>Loading…</p>;
    return <p>Signed in as {user?.email}</p>;
}
```

Full guide at [auther.ziloris.com/docs](https://auther.ziloris.com/docs).

## License

[Apache-2.0](./LICENSE) © Ziloris
