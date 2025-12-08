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
      // Externaliser les modules Node.js qui ne doivent pas être bundlés pour le browser
      external: ['better-sqlite3', 'sqlite3', 'bindings', 'file-uri-to-path'],
      onwarn(warning, warn) {
        // Ignorer le warning d'eval pour onnxruntime-web (nécessaire pour WASM)
        if (warning.code === 'EVAL' && warning.id?.includes('onnxruntime-web')) {
          return;
        }
        warn(warning);
      },
      output: {
        manualChunks: id => {
          // Vendors
          if (id.includes('node_modules')) {
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router')
            ) {
              return 'react-vendor';
            }
            if (id.includes('@tauri-apps')) {
              return 'tauri-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'motion';
            }
            if (id.includes('i18n')) {
              return 'i18n';
            }
            if (id.includes('zod')) {
              return 'validation';
            }
            if (id.includes('zustand')) {
              return 'state';
            }
            if (id.includes('recharts')) {
              return 'charts';
            }
            if (id.includes('markdown') || id.includes('remark')) {
              return 'markdown';
            }
            if (id.includes('@xenova/transformers')) {
              return 'ai-transformers';
            }
            if (id.includes('onnxruntime-web')) {
              return 'ai-onnx';
            }
            // Web vitals
            if (id.includes('web-vitals')) {
              return 'web-vitals';
            }
            // Autres vendors groupés
            return 'vendor-utils';
          }

          // Application code splitting
          if (id.includes('/src/')) {
            // Pages principales
            if (id.includes('/pages/Chat') || id.includes('/features/chat')) {
              return 'page-chat';
            }
            if (id.includes('/pages/Agenda') || id.includes('/features/agenda')) {
              return 'page-agenda';
            }
            if (id.includes('/pages/Camera') || id.includes('/features/camera')) {
              return 'page-camera';
            }

            // Centers (gros modules)
            if (id.includes('/pages/centers/') || id.includes('/features/centers/')) {
              if (id.includes('Identity')) return 'center-identity';
              if (id.includes('Reality')) return 'center-reality';
              if (id.includes('Quantum')) return 'center-quantum';
              if (id.includes('Hyper')) return 'center-hyper';
              if (id.includes('Memory')) return 'center-memory';
              if (id.includes('Temporal')) return 'center-temporal';
              if (id.includes('Orchestration')) return 'center-orchestration';
              return 'centers-common';
            }

            // Services (engines)
            if (id.includes('/services/')) {
              if (id.includes('cognitive')) return 'service-cognitive';
              if (id.includes('audio') || id.includes('voice')) return 'service-audio';
              if (id.includes('memory')) return 'service-memory';
              if (id.includes('fusion')) return 'service-fusion';
              return 'services-common';
            }

            // Components UI
            if (id.includes('/components/') || id.includes('/ui/')) {
              return 'ui-components';
            }
          }
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
    // Réduit à 800KB pour forcer plus de découpage
    chunkSizeWarningLimit: 800,
    // Optimisations supplémentaires
    target: 'esnext',
    cssCodeSplit: true,
    sourcemap: false,
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
