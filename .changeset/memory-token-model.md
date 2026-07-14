---
"@auther-sdk/frontend": minor
"@auther-sdk/react": minor
---

Security: the access token is now held in memory only and is never written to localStorage. The session is restored on page load from the httpOnly, JS-unreadable refresh cookie via /auth/refresh (which now returns the user). This closes the gap with the documented "token not in localStorage" posture.

React: the provider awaits the initial restore before setting `ready` (no logged-out flash on reload) and no longer runs a second, competing refresh timer. `endpoint` is now optional, and `getToken` is properly typed.
