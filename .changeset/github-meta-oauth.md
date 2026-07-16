---
"@auther-sdk/frontend": minor
---

GitHub and Meta sign-in now work. Clicking GitHub previously showed an "OAuth is not fully configured" alert, and Meta was never rendered at all. Both now open the backend redirect flow in a popup and post the session back to your origin, which the SDK validates before accepting.
