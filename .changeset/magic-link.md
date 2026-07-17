---
"@auther-sdk/frontend": minor
---

Magic link sign-in. Enable it under Settings → Authentication in the dashboard and the modal offers "Email me a sign-in link" — the toggle had existed since the beginning and did nothing. Landing on a link is handled automatically: the SDK picks up `?auther_magic=` on `init()`, exchanges it for a session, and strips the token from the URL, so no `/magic-link` route is needed in your app. `ProjectConfig` gains `magicLinkEnabled`.
