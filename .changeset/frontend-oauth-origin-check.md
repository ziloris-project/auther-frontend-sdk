---
"@auther-sdk/frontend": patch
---

The OAuth popup message handler now verifies event.origin against the configured backend before accepting a payload. Previously any window could postMessage a forged auth payload into the opener and hijack the session.
