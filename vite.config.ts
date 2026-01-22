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
import { fileURLToPath } from 'node:url';
import tsconfigPaths from 'vite-tsconfig-paths';
import viteCompression from 'vite-plugin-compression';
import { injectManifest } from 'workbox-build';
import type { Plugin, ResolvedConfig } from 'vite';

const ROOT_DIR = fileURLToPath(new URL('.', import.meta.url));

// P2-B: Workbox Service Worker plugin
function workboxPlugin(): Plugin {
  let resolvedConfig: ResolvedConfig | undefined;

  return {
    name: 'workbox-inject',
    apply: 'build',
    configResolved: config => {
      resolvedConfig = config;
    },
    closeBundle: async () => {
      try {
        if (!resolvedConfig) {
          throw new Error('Workbox inject: Vite config not resolved');
        }

        const outDirAbs = resolve(resolvedConfig.root, resolvedConfig.build.outDir);
        const swSrcAbs = resolve(resolvedConfig.publicDir, 'sw-source.js');
        const swDestAbs = resolve(outDirAbs, 'sw.js');

        const { count, size, warnings } = await injectManifest({
          swSrc: swSrcAbs,
          swDest: swDestAbs,
          globDirectory: outDirAbs,
          globPatterns: ['assets/**/*.{js,css,woff2}', 'index.html'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB max
        });

        console.log(
          `✅ Workbox: ${count} files precached (${(size / 1024).toFixed(2)} KB)`
        );
        if (warnings.length > 0) {
          console.warn('⚠️ Workbox warnings:', warnings);
        }
      } catch (error) {
        console.error('❌ Workbox inject failed:', error);
        throw error;
      }
    },
  };
}

// TITANE∞ v17.3.0 - Vite Configuration OPTIMIZED (CPU < 50%)
// Phase 5: Bundle analysis + code splitting
// P2-A: Brotli compression for -15% bundle size
// https://vitejs.dev/config/
export default defineConfig({
  root: ROOT_DIR,
  publicDir: resolve(ROOT_DIR, 'public'),
  base: './',

  // 🔧 Server configuration with proper headers
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: false,
    cors: true,
    headers: {
      // Vite gère automatiquement Content-Type selon l'extension (.tsx → application/javascript)
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
    },
  },

  plugins: [
    react({
      // Optimisation React Fast Refresh
      babel: {
        compact: true,
        plugins: [],
      },
    }),
    tsconfigPaths(), // Auto-sync avec tsconfig.json paths
    // visualizer({
    //   open: false,
    //   filename: 'dist/stats.html',
    //   template: 'sunburst',
    // }),
    // Ajout d'une alternative potentielle ici
    // Exemple : bundle-analyzer ou autre plugin compatible
    // P2-A: Brotli compression (-15% vs gzip)
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // 10 KB minimum
      algorithm: 'brotliCompress',
      ext: '.br',
      deleteOriginFile: false,
    }),
    // Gzip fallback for older browsers
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
      deleteOriginFile: false,
    }),
    // P2-B: Service Worker for -400ms repeat visit TTI
    workboxPlugin(),
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
  },

  resolve: {
    alias: {
      '@': resolve(ROOT_DIR, './src'),
      '@app': resolve(ROOT_DIR, './src/app'),
      '@pages': resolve(ROOT_DIR, './src/pages'),
      '@features': resolve(ROOT_DIR, './src/features'),
      '@components': resolve(ROOT_DIR, './src/components'),
      '@ui': resolve(ROOT_DIR, './src/ui'),
      '@hooks': resolve(ROOT_DIR, './src/hooks'),
      '@services': resolve(ROOT_DIR, './src/services'),
      '@stores': resolve(ROOT_DIR, './src/stores'),
      '@themes': resolve(ROOT_DIR, './src/themes'),
      '@utils': resolve(ROOT_DIR, './src/utils'),
      '@types': resolve(ROOT_DIR, './src/types'),
      '@assets': resolve(ROOT_DIR, './src/assets'),
      '@styles': resolve(ROOT_DIR, './src/styles'),
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

    // ✨ v26.1 CONSOLE MONITOR: Drop console calls in production

    rollupOptions: {
      // ✅ FIX: Ne PAS externaliser @tauri-apps/api/* en mode Tauri!
      // Tauri v2 fournit ces modules directement, ils doivent être bundés
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

      // Avoid noisy warnings from known-safe/3rd-party bundles.
      // - EMPTY_BUNDLE "monitoring": typically caused by forced chunk naming + tree-shaking.
      // - EVAL from onnxruntime-web: upstream bundle uses eval; we don't patch vendored code here.
      onwarn: (warning, warn) => {
        if (warning.code === 'EMPTY_BUNDLE' && warning.message.includes('"monitoring"')) {
          return;
        }

        const locFile = warning.loc?.file;
        const isOnnxRuntime =
          (typeof locFile === 'string' && locFile.includes('onnxruntime-web')) ||
          warning.message.includes('onnxruntime-web');
        if (warning.code === 'EVAL' && isOnnxRuntime) {
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
            // 🚀 Split: ONNX Runtime (very large)
            if (id.includes('onnxruntime-web')) {
              return 'onnxruntime';
            }
            // 🚀 Split: Three.js (large)
            if (id.includes('/three/') || id.includes('three')) {
              return 'three-vendor';
            }
            // 🚀 Split: TanStack Query (moderately large)
            if (id.includes('@tanstack/react-query')) {
              return 'react-query';
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
            // Optional / heavy UI libs
            if (id.includes('react-chrono')) {
              return 'chrono';
            }
            if (id.includes('react-d3-tree')) {
              return 'd3-tree';
            }
            if (id.includes('markdown') || id.includes('remark')) {
              return 'markdown';
            }
            if (id.includes('@xenova/transformers')) {
              return 'ai-transformers';
            }
            // Web vitals
            if (id.includes('web-vitals')) {
              return 'web-vitals';
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
            // v25.7.5 P1-B: Split DevTools tabs for lazy loading (-100 KB)
            if (id.includes('/pages/tabs/DevTools/SystemTab')) return 'devtools-system';
            if (id.includes('/pages/tabs/DevTools/LogsTab')) return 'devtools-logs';
            if (id.includes('/pages/tabs/DevTools/PerformanceTab'))
              return 'devtools-performance';
            if (id.includes('/pages/tabs/DevTools/DiagnosticTab'))
              return 'devtools-diagnostic';

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
            // ✨ P3: Split services more granularly
            if (id.includes('/services/')) {
              if (id.includes('cognitive')) return 'service-cognitive';
              if (id.includes('audio') || id.includes('voice')) return 'service-audio';
              if (id.includes('memory')) return 'service-memory';
              if (id.includes('fusion')) return 'service-fusion';
              if (id.includes('performanceEngine')) return 'service-performance';
              if (id.includes('orchestration')) return 'service-orchestration';
              if (id.includes('ai/')) return 'service-ai';
              if (id.includes('analytics')) return 'service-analytics';

              // Regroupement des dépendances circulaires dans un chunk unique
              if (
                id.includes('service-ai') ||
                id.includes('service-memory') ||
                id.includes('service-cognitive') ||
                id.includes('services-common') ||
                id.includes('service-audio')
              ) {
                return 'service-core';
              }

              return 'services-common';
            }

            // Components UI - Split by domain for better code splitting
            // FIX v24.2.1 + P3: Split ui-components (302KB) into smaller chunks
            if (id.includes('/components/')) {
              if (id.includes('/chat/')) return 'ui-chat';
              if (id.includes('/audio/')) return 'ui-audio';
              if (id.includes('/monitoring/')) return 'ui-monitoring';
              if (id.includes('/layout/')) return 'ui-layout';
              if (id.includes('/voice/')) return 'ui-voice';
              if (id.includes('/experience/')) return 'ui-experience';
              if (id.includes('/evolution/')) return 'ui-evolution';
              // ✨ P3: Further split ui-common into domain-specific chunks
              if (id.includes('/aura/')) return 'ui-aura';
              if (id.includes('/performance/')) return 'ui-performance';
              if (id.includes('/admin/')) return 'ui-admin';
              if (id.includes('/dev/')) return 'ui-dev';
              if (id.includes('/fusion/')) return 'ui-fusion';
              if (id.includes('/QuantumCenter/')) return 'ui-quantum';
              if (id.includes('/HyperCenter/')) return 'ui-hyper';
              if (id.includes('/RealityCenter/')) return 'ui-reality';
              if (id.includes('/IdentityCenter/')) return 'ui-identity';
              if (id.includes('/MemoryEvolution/')) return 'ui-memory-evolution';
              if (id.includes('/optimization/')) return 'ui-optimization';
              if (id.includes('/branding/')) return 'ui-branding';
              return 'ui-common';
            }
            if (id.includes('/ui/')) {
              return 'ui-primitives';
            }
          }
        },
      },
    },
    // 🚀 OPTIMIZATION v24.7.7: Faster minification with esbuild (removed terser)
    // minify: 'esbuild' configured above - terser options removed for speed

    // Réduit à 1600KB pour limiter le bruit de warning tout en gardant la pression sur le découpage
    chunkSizeWarningLimit: 1600,
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
