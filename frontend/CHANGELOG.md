# @auther-sdk/frontend

## 1.3.0

### Minor Changes

- d60e22d: Magic link sign-in. Enable it under Settings → Authentication in the dashboard and the modal offers "Email me a sign-in link" — the toggle had existed since the beginning and did nothing. Landing on a link is handled automatically: the SDK picks up `?auther_magic=` on `init()`, exchanges it for a session, and strips the token from the URL, so no `/magic-link` route is needed in your app. `ProjectConfig` gains `magicLinkEnabled`.

## 1.2.1

## 1.2.0

### Minor Changes

- 28ae3d1: GitHub and Meta sign-in now work. Clicking GitHub previously showed an "OAuth is not fully configured" alert, and Meta was never rendered at all. Both now open the backend redirect flow in a popup and post the session back to your origin, which the SDK validates before accepting.
- ba3ca92: The signup form's name field now works. It has always been rendered and the value was thrown away: the SDK never sent it, so every user's name was silently discarded at signup. `AuthUser` gains a `name` field (null for users who signed up before this, or who left it blank), and OAuth sign-ins pick the name up from the provider.

### Patch Changes

- 46231a7: Docs: the package READMEs documented an API that never existed (a `config={{ projectId }}` prop and an `isLoading` flag). Corrected to the real surface: `clientId` with an optional `endpoint`, `ready` from `useAuther()`, the default `auther` singleton import, and a note that the token is held in memory and the session restores from the refresh cookie.

## 1.1.0

### Minor Changes

- f952ef6: Security: the access token is now held in memory only and is never written to localStorage. The session is restored on page load from the httpOnly, JS-unreadable refresh cookie via /auth/refresh (which now returns the user). This closes the gap with the documented "token not in localStorage" posture.

  React: the provider awaits the initial restore before setting `ready` (no logged-out flash on reload) and no longer runs a second, competing refresh timer. `endpoint` is now optional, and `getToken` is properly typed.

### Patch Changes

- dee5b02: The default backend URL is now a single DEFAULT_ENDPOINT constant instead of being hardcoded in two places, and its casing is normalized to match the other SDKs. No change to the resolved host.
- 877d556: logout() now revokes the session on the server, not just locally. It sends a best-effort POST to /auth/logout (with keepalive so it survives the post-logout redirect) to invalidate the httpOnly refresh cookie, so a cleared session can no longer be resumed.
- 6a7aa01: The OAuth popup message handler now verifies event.origin against the configured backend before accepting a payload. Previously any window could postMessage a forged auth payload into the opener and hijack the session.
- c943e27: Removed informational console.log calls from the published bundle. Two of them logged the full authenticated user object (which includes the access token) to the browser console; the rest were startup and UI noise. Genuine error logging is unchanged.
