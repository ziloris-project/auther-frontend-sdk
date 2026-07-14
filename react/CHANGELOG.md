# @auther-sdk/react

## 1.1.0

### Minor Changes

- f952ef6: Security: the access token is now held in memory only and is never written to localStorage. The session is restored on page load from the httpOnly, JS-unreadable refresh cookie via /auth/refresh (which now returns the user). This closes the gap with the documented "token not in localStorage" posture.

  React: the provider awaits the initial restore before setting `ready` (no logged-out flash on reload) and no longer runs a second, competing refresh timer. `endpoint` is now optional, and `getToken` is properly typed.

### Patch Changes

- Updated dependencies [dee5b02]
- Updated dependencies [877d556]
- Updated dependencies [6a7aa01]
- Updated dependencies [c943e27]
- Updated dependencies [f952ef6]
  - @auther-sdk/frontend@1.1.0
