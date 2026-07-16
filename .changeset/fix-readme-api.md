---
"@auther-sdk/frontend": patch
---

Docs: the package READMEs documented an API that never existed (a `config={{ projectId }}` prop and an `isLoading` flag). Corrected to the real surface: `clientId` with an optional `endpoint`, `ready` from `useAuther()`, the default `auther` singleton import, and a note that the token is held in memory and the session restores from the refresh cookie.
