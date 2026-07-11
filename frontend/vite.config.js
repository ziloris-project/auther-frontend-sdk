
import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [dts({ rollupTypes: true })],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'Auther',
            fileName: (format) => `auther.${format}.js`
        },
        rollupOptions: {
            output: {
                extend:  true,    // UMD — extend the global object (window.Auther)
                exports: 'named', // suppress mixed default/named export warning
            }
        }
    }
});
