/**
 * TITANE∞ Remote Gateway — Vite build config
 * Outputs a standalone SPA to dist/remote/ served by the Axum static server.
 * No Tauri APIs — uses remoteTransport.ts (fetch-based IPC).
 *
 * Build: pnpm run build:remote
 * Output: dist/remote/index.html + assets/
 */

import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, 'src/remote'),
  base: './',
  define: {
    'import.meta.env.VITE_REMOTE_MODE': JSON.stringify('true'),
  },
  build: {
    outDir: resolve(__dirname, 'dist/remote'),
    emptyOutDir: true,
    minify: 'esbuild',
    rollupOptions: {
      input: resolve(__dirname, 'src/remote/index.html'),
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@app': resolve(__dirname, 'src/app'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@features': resolve(__dirname, 'src/features'),
      '@components': resolve(__dirname, 'src/components'),
      '@ui': resolve(__dirname, 'src/ui'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@services': resolve(__dirname, 'src/services'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@themes': resolve(__dirname, 'src/themes'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@data': resolve(__dirname, 'data'),
      '@config': resolve(__dirname, 'config'),
    },
  },
});
