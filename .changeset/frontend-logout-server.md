---
"@auther-sdk/frontend": patch
---

logout() now revokes the session on the server, not just locally. It sends a best-effort POST to /auth/logout (with keepalive so it survives the post-logout redirect) to invalidate the httpOnly refresh cookie, so a cleared session can no longer be resumed.
