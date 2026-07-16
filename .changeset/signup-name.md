---
"@auther-sdk/frontend": minor
---

The signup form's name field now works. It has always been rendered and the value was thrown away: the SDK never sent it, so every user's name was silently discarded at signup. `AuthUser` gains a `name` field (null for users who signed up before this, or who left it blank), and OAuth sign-ins pick the name up from the provider.
