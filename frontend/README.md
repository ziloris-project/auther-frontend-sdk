# @auther-sdk/frontend

[![npm](https://img.shields.io/npm/v/@auther-sdk/frontend?style=flat&color=blue)](https://www.npmjs.com/package/@auther-sdk/frontend)

Framework-agnostic browser SDK for [Auther](https://auther.ziloris.com): drop-in
authentication for any website. One `init()` call renders the login/signup UI and keeps
the user's session alive with proactive token refresh.

## Install

```bash
npm install @auther-sdk/frontend
```

## Usage

```ts
import auther from '@auther-sdk/frontend';

auther.init({
    clientId: 'req_live_xxxxxxxxxxxx',
    // endpoint is optional and defaults to the Auther production API
    onAuth: (user) => {
        // Fires with the current user (or null) once the session resolves,
        // and on every later login, logout, and refresh.
        console.log('signed in as', user);
    },
});

// Open the modal
auther.login();

// Get a token for your own API (refreshes first if it is near expiry)
const token = await auther.getFreshToken();
```

The access token is kept in memory only, never in localStorage. On page load the
session is restored from the HTTP-only refresh cookie, so `auther.getUser()` is
`null` until that resolves. Use `onAuth` / `onAuthStateChange` rather than reading
`getUser()` once at startup.

Full guide at [auther.ziloris.com/docs](https://auther.ziloris.com/docs).

## License

[Apache-2.0](./LICENSE), Copyright Ziloris.
