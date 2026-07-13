---
"@auther-sdk/frontend": patch
---

Removed informational console.log calls from the published bundle. Two of them logged the full authenticated user object (which includes the access token) to the browser console; the rest were startup and UI noise. Genuine error logging is unchanged.
