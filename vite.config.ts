/**
 * TITANE_INFINITY v16.2.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { visualizer } from 'rollup-plugin-visualizer';

// TITANE∞ v17.3.0 - Vite Configuration OPTIMIZED (CPU < 50%)
// Phase 5: Bundle analysis + code splitting
// https://vitejs.dev/config/
export default defineConfig({
  root: '.',
  publicDir: 'public',
  base: './',
  plugins: [
    react({
      // Optimisation React Fast Refresh
      babel: {
        compact: true,
        plugins: [],
      },
    }),
    tsconfigPaths(), // Auto-sync avec tsconfig.json paths
    visualizer({
      open: false,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // 🚀 OPTIMISATIONS CPU & WATCHERS
  // ═══════════════════════════════════════════════════════════════════════════
  optimizeDeps: {
    // En mode dev browser, on peut inclure @tauri-apps/api
    // En mode Tauri, il sera automatiquement géré
    include: ['react', 'react-dom', 'react/jsx-runtime'],
    // Exclure modules Node.js purs incompatibles browser
    exclude: ['better-sqlite3', 'sqlite3', 'bindings'],
    esbuildOptions: {
      target: 'esnext',
    },
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@app': resolve(__dirname, './src/app'),
      '@pages': resolve(__dirname, './src/pages'),
      '@features': resolve(__dirname, './src/features'),
      '@components': resolve(__dirname, './src/components'),
      '@ui': resolve(__dirname, './src/ui'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@services': resolve(__dirname, './src/services'),
      '@stores': resolve(__dirname, './src/stores'),
      '@themes': resolve(__dirname, './src/themes'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types'),
      '@assets': resolve(__dirname, './src/assets'),
      '@styles': resolve(__dirname, './src/styles'),
      // Fix Tauri v2 API imports resolution
      '@tauri-apps/api/core': resolve(
        __dirname,
        './node_modules/@tauri-apps/api/core.js'
      ),
      '@tauri-apps/api/event': resolve(
        __dirname,
        './node_modules/@tauri-apps/api/event.js'
      ),
      // Polyfills for Node.js modules in browser
      events: 'eventemitter3',
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React ecosystem
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Tauri desktop integration
          'tauri-vendor': ['@tauri-apps/api', '@tauri-apps/plugin-shell'],
          // Animation library (large)
          motion: ['framer-motion'],
          // Internationalization
          i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          // Schema validation
          validation: ['zod'],
          // State management
          state: ['zustand'],
          // Utilities
          utils: ['clsx', 'date-fns', 'dompurify'],
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    chunkSizeWarningLimit: 500,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🌐 NETWORK DEPLOYMENT - HOST MODE (OPTIMIZED FOR CPU)
  // ═══════════════════════════════════════════════════════════════════════════
  server: {
    host: 'localhost', // Only localhost (reduces network scanning CPU)
    port: 5173, // Default port
    strictPort: true, // Fail if port is in use
    cors: true, // Enable CORS for API calls
    hmr: {
      host: 'localhost', // HMR local only
      overlay: true, // Show errors in overlay
    },
    watch: {
      // Optimisation watchers pour réduire CPU
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/target/**',
        '**/.git/**',
        '**/src-tauri/target/**',
        '**/*.md',
        '**/coverage/**',
        '**/docs/**',
      ],
      usePolling: false, // Disable polling (use native FS events)
    },
  },

  preview: {
    host: 'localhost', // Preview server local only
    port: 4173, // Preview port
    strictPort: true,
    cors: true,
  },

  clearScreen: false,
  envPrefix: ['VITE_', 'TAURI_'],
});
