# @auther-sdk/frontend

## 1.1.0

### Minor Changes

- f952ef6: Security: the access token is now held in memory only and is never written to localStorage. The session is restored on page load from the httpOnly, JS-unreadable refresh cookie via /auth/refresh (which now returns the user). This closes the gap with the documented "token not in localStorage" posture.

  React: the provider awaits the initial restore before setting `ready` (no logged-out flash on reload) and no longer runs a second, competing refresh timer. `endpoint` is now optional, and `getToken` is properly typed.

### Patch Changes

- dee5b02: The default backend URL is now a single DEFAULT_ENDPOINT constant instead of being hardcoded in two places, and its casing is normalized to match the other SDKs. No change to the resolved host.
- 877d556: logout() now revokes the session on the server, not just locally. It sends a best-effort POST to /auth/logout (with keepalive so it survives the post-logout redirect) to invalidate the httpOnly refresh cookie, so a cleared session can no longer be resumed.
- 6a7aa01: The OAuth popup message handler now verifies event.origin against the configured backend before accepting a payload. Previously any window could postMessage a forged auth payload into the opener and hijack the session.
- c943e27: Removed informational console.log calls from the published bundle. Two of them logged the full authenticated user object (which includes the access token) to the browser console; the rest were startup and UI noise. Genuine error logging is unchanged.
