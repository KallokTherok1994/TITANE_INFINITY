import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// TITANE∞ v17.0.0 - Vite Configuration (WebKit Fix + Tauri-Only 100%)
// https://vitejs.dev/config/
export default defineConfig({
  root: '.',
  publicDir: 'public',
  base: './',
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@ui': resolve(__dirname, './src/ui'),
      '@layout': resolve(__dirname, './src/layout'),
      '@pages': resolve(__dirname, './src/pages'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@design-system': resolve(__dirname, './src/design-system'),
    },
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    target: 'esnext',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      external: ['@tauri-apps/api/core', '@tauri-apps/api/tauri'],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },

  server: {
    port: 5173, // Absorbed by Tauri WebView, never directly exposed
    strictPort: true,
    hmr: false, // Disabled for Tauri-only mode
    host: 'localhost',
    fs: {
      deny: [
        '/home/titane_os/Bureau/RECUP/**',
        '/home/titane_os/Documents/TITANE-DOC/OLD/**',
        '/home/titane_os/Documents/TITANE_NEWGEN_V20nov/**',
      ],
    },
  },

  clearScreen: false,
  envPrefix: ['VITE_', 'TAURI_'],
});
