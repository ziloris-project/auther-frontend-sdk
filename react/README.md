# @auther-sdk/react

[![npm](https://img.shields.io/npm/v/@auther-sdk/react?style=flat&color=blue)](https://www.npmjs.com/package/@auther-sdk/react)

React bindings for [Auther](https://auther.ziloris.com): a drop-in `AutherProvider` with
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
        // endpoint is optional and defaults to the Auther production API
        <AutherProvider clientId="req_live_xxxxxxxxxxxx">
            <Dashboard />
        </AutherProvider>
    );
}

function Dashboard() {
    const { user, ready, login, logout } = useAuther();

    // `ready` is false until the session is restored from the refresh
    // cookie. Gate on it to avoid a logged-out flash on reload.
    if (!ready) return <p>Loading...</p>;
    if (!user)  return <button onClick={login}>Sign in</button>;

    return (
        <>
            <p>Signed in as {user.email}</p>
            <button onClick={logout}>Sign out</button>
        </>
    );
}
```

Full guide at [auther.ziloris.com/docs](https://auther.ziloris.com/docs).

## License

[Apache-2.0](./LICENSE), Copyright Ziloris.
