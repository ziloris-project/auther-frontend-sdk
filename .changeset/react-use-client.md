---
"@auther-sdk/react": patch
---

Fix `AutherProvider` failing to build in React Server Components apps. The `'use client'` directive was declared in the source but stripped by the bundler, so every published build shipped without it. Importing `AutherProvider` into a Next App Router layout — a server component by default, and exactly where a provider goes — failed the build with `(0 , g.createContext) is not a function`. Consumers had to work around it by re-exporting the package through their own `'use client'` file. That workaround is no longer needed (and is harmless to keep).
