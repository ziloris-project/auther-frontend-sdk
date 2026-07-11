# @auther-sdk/frontend

[![npm](https://img.shields.io/npm/v/@auther-sdk/frontend?style=flat&color=blue)](https://www.npmjs.com/package/@auther-sdk/frontend)

Framework-agnostic browser SDK for [Auther](https://auther.ziloris.com) — drop-in
authentication for any website. One `init()` call renders the login/signup UI and keeps
the user's session alive with proactive token refresh.

## Install

```bash
npm install @auther-sdk/frontend
```

## Usage

```ts
import { Auther } from '@auther-sdk/frontend';

const auther = new Auther();

auther.init({
    projectId: 'proj_live_xxxxxxxxxxxx',
    onAuth: (user) => {
        console.log('signed in as', user);
    },
});
```

Full guide at [auther.ziloris.com/docs](https://auther.ziloris.com/docs).

## License

[Apache-2.0](./LICENSE) © Ziloris
