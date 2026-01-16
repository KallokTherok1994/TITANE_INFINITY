import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  root: ROOT_DIR,
  publicDir: 'public',
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    open: false,
    cors: true,
    hmr: {
      port: 5173,
    },
    // SPA fallback for client-side routing
    middlewareMode: false,
    fs: {
      strict: true,
    },
  },
  resolve: {
    alias: {
      '@': resolve(ROOT_DIR, 'src'),
      '@components': resolve(ROOT_DIR, 'src/components'),
      '@hooks': resolve(ROOT_DIR, 'src/hooks'),
      '@services': resolve(ROOT_DIR, 'src/services'),
      '@utils': resolve(ROOT_DIR, 'src/utils'),
      '@types': resolve(ROOT_DIR, 'src/types'),
      '@assets': resolve(ROOT_DIR, 'src/assets'),
      '@styles': resolve(ROOT_DIR, 'src/styles'),
      '@config': resolve(ROOT_DIR, 'src/config'),
      '@constants': resolve(ROOT_DIR, 'src/constants'),
      '@stores': resolve(ROOT_DIR, 'src/stores'),
      '@pages': resolve(ROOT_DIR, 'src/pages'),
      '@layouts': resolve(ROOT_DIR, 'src/layouts'),
      '@lib': resolve(ROOT_DIR, 'src/lib'),
      '@test': resolve(ROOT_DIR, 'src/test'),
      '@mocks': resolve(ROOT_DIR, 'src/mocks'),
      '@themes': resolve(ROOT_DIR, 'src/themes'),
      '@features': resolve(ROOT_DIR, 'src/features'),
      '@cognitive': resolve(ROOT_DIR, 'src/cognitive'),
      '@a11y': resolve(ROOT_DIR, 'src/a11y'),
      '@apps': resolve(ROOT_DIR, 'src/apps'),
      // Mock Node.js modules for browser compatibility
      events: resolve(ROOT_DIR, 'src/mocks/events.ts'),
    },
  },
  define: {
    // Mock Node.js modules for browser compatibility in E2E tests
    'process.env': {},
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: ['events'], // Don't pre-bundle events module
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    minify: 'esbuild',
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1600,
    target: 'esnext',
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      external: process.env.NODE_ENV === 'production' ? ['events'] : [],
    },
  },
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    legalComments: 'none',
  },
  css: {
    devSourcemap: false,
  },
  clearScreen: false,
  envPrefix: ['VITE_', 'TAURI_'],
});
