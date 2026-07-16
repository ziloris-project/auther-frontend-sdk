# @auther-sdk/react

## 1.2.1

### Patch Changes

- bcf6437: Fix `AutherProvider` failing to build in React Server Components apps. The `'use client'` directive was declared in the source but stripped by the bundler, so every published build shipped without it. Importing `AutherProvider` into a Next App Router layout — a server component by default, and exactly where a provider goes — failed the build with `(0 , g.createContext) is not a function`. Consumers had to work around it by re-exporting the package through their own `'use client'` file. That workaround is no longer needed (and is harmless to keep).
  - @auther-sdk/frontend@1.2.1

## 1.2.0

### Patch Changes

- Updated dependencies [46231a7]
- Updated dependencies [28ae3d1]
- Updated dependencies [ba3ca92]
  - @auther-sdk/frontend@1.2.0

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
