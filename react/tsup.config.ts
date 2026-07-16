import { defineConfig } from 'tsup';

export default defineConfig({
    entry:   ['src/index.ts'],
    format:  ['cjs', 'esm'],
    dts:     true,
    clean:   true,
    external: ['react'],

    // Re-add the 'use client' directive that the bundler strips.
    //
    // src/AutherProvider.tsx declares it, but esbuild drops directives while
    // bundling, so every published build has shipped without it. This package
    // is client-only by definition — it exports a context Provider and a hook
    // built on createContext/useState/useEffect — and without the directive a
    // React Server Components consumer treats it as server code. Importing
    // AutherProvider into a Next App Router layout (a server component by
    // default, which is exactly where a provider goes) then fails the build
    // with "(0 , g.createContext) is not a function".
    //
    // Consumers have been working around this by re-exporting the package
    // through their own 'use client' file. They should not have to.
    banner: { js: '"use client";' },
});
