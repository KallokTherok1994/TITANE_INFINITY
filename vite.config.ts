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

  // 🚀 OPTIMIZATION v24.7.7: Persistent cache for faster dev startup
  cacheDir: '.vite-cache',

  optimizeDeps: {
    // En mode dev browser, on peut inclure @tauri-apps/api
    // En mode Tauri, il sera automatiquement géré
    include: ['react', 'react-dom', 'react/jsx-runtime'],
    // Exclure modules Node.js purs incompatibles browser
    exclude: ['better-sqlite3', 'sqlite3', 'bindings'],
    // 🚀 OPTIMIZATION v24.7.7: Don't force re-optimize if cache is valid
    force: false,
    esbuildOptions: {
      target: 'esnext',
      // ✨ v21.5 Sprint 1: Drop logs/debugger in production optimized deps
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
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
      // ✅ FIX: Removed Tauri API aliases - Let Vite resolve them naturally
      // Tauri v2 provides these modules correctly without manual aliasing
      // Polyfills for Node.js modules in browser
      events: 'eventemitter3',
    },
  },

  build: {
    // 🚀 OPTIMIZATION v24.7.6: Enable advanced compression & tree-shaking
    reportCompressedSize: true,
    cssMinify: 'lightningcss', // Faster CSS minification

    // 🚀 OPTIMIZATION v24.7.7: Parallel minification with esbuild (faster than terser)
    minify: 'esbuild',

    rollupOptions: {
      // ✅ FIX: Ne PAS externaliser @tauri-apps/api/* en mode Tauri!
      // Tauri v2 fournit ces modules directement, ils doivent être bundlés
      // Seuls les vrais modules Node.js backend doivent être external
      external: [
        'better-sqlite3',
        'sqlite3',
        'bindings',
        'file-uri-to-path',
        // ❌ REMOVED: @tauri-apps/api/* - Let Vite bundle them normally for Tauri
      ],
      // 🚀 OPTIMIZATION: Tree-shaking des modules inutilisés
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
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
            // 🚀 OPTIMIZATION: Sentry séparé (lazy-loadable en production)
            if (id.includes('@sentry')) {
              return 'monitoring';
            }
            // Chart.js séparé (gros et optionnel)
            if (id.includes('chart.js') || id.includes('chartjs')) {
              return 'charts';
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
    // 🚀 OPTIMIZATION v24.7.7: Faster minification with esbuild (removed terser)
    // minify: 'esbuild' configured above - terser options removed for speed

    // Réduit à 800KB pour forcer plus de découpage
    chunkSizeWarningLimit: 800,
    // Optimisations supplémentaires
    target: 'esnext',
    cssCodeSplit: true,
    sourcemap: false,
  },

  // ✨ v21.5 Sprint 1: Global esbuild transform (source code)
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    legalComments: 'none', // Remove comments in production
  },

  // 🚀 OPTIMIZATION v24.7.7: CSS source maps for debugging
  css: {
    devSourcemap: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔒 TAURI-ONLY
  // ═══════════════════════════════════════════════════════════════════════════
  clearScreen: false,
  envPrefix: ['VITE_', 'TAURI_'],
});
