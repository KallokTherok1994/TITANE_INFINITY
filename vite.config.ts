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
import { visualizer } from 'rollup-plugin-visualizer';
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
export default defineConfig(({ command }) => ({
  root: ROOT_DIR,
  publicDir: resolve(ROOT_DIR, 'public'),
  // ✅ FIX: Enforce relative base in production build (Tauri file:// compatibility)
  // - Dev: '/' for absolute paths
  // - Build: './' for relative paths (required for AppImage/DEB bundling)
  base: command === 'build' ? './' : '/',

  // ✅ v27: Exclure les fichiers shell et scripts du traitement Vite
  assetsInclude: ['**/*.sh', '**/*.bash', '**/*.zsh'],

  // 🔧 Server configuration with proper headers + Network + Ollama Proxy
  server: {
    host: '0.0.0.0', // Listen on all network interfaces for WiFi access
    port: 4000,
    strictPort: false,
    cors: true,
    open: false, // Don't auto-open browser
    headers: {
      // Vite gère automatiquement Content-Type selon l'extension (.tsx → application/javascript)
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
    },
    // ✅ v27: Ignore shell scripts from HMR watching
    watch: {
      ignored: [
        '**/*.sh',
        '**/*.bash',
        '**/*.zsh',
        '**/scripts/**/*.sh',
        '**/runtime/**',
        '**/logs/**',
        '**/deployment/**',
      ],
    },
    proxy: {
      // ✅ v27: Proxy Ollama API to avoid CORS issues
      '/api': {
        target: 'http://127.0.0.1:11434',
        changeOrigin: true,
        // Direct /api/* pass-through to Ollama (it already exposes /api/...)
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.error('🔴 Ollama proxy error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🔵 Proxying:', req.method, req.url, '→', proxyReq.path);
          });
        },
      },
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
    // 🚀 v34.0.0: Bundle analyzer for dependency visualization
    visualizer({
      open: false,
      filename: 'dist/stats.html',
      template: 'sunburst',
      gzipSize: true,
      brotliSize: true,
    }),
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

    // ✨ v27.1: CONSOLE OPTIMIZATION - Strip console calls in production
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.* calls
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ['console.log', 'console.debug', 'console.info'],
      },
      format: {
        comments: false, // Remove comments
      },
    },

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
          // ═════════════════════════════════════════════════════════════════════
          // 🔧 P1_BUILD_CHUNKS_FIX: Deterministic non-overlapping chunk rules
          // ORDER: Most specific → Most general (prevents ambiguity)
          // STRATEGY: Merge circular dependency groups into unified buckets
          // ═════════════════════════════════════════════════════════════════════

          // ────────────────────────────────────────────────────────────────────
          // 1️⃣ VENDOR ONNX CLUSTER (onnxruntime ↔ vendor-utils)
          // ────────────────────────────────────────────────────────────────────
          if (id.includes('node_modules')) {
            // Must check onnxruntime BEFORE generic vendor-utils
            if (id.includes('onnxruntime-web')) {
              return 'vendor-onnx';
            }
          }

          // ────────────────────────────────────────────────────────────────────
          // 2️⃣ UI CORE CLUSTER (ui-layout ↔ ui-common ↔ ui-primitives)
          // ────────────────────────────────────────────────────────────────────
          if (id.includes('/src/')) {
            // Check UI cluster BEFORE other components
            if (
              id.includes('/components/layout/') ||
              id.includes('/ui/') ||
              (id.includes('/components/') &&
                !id.includes('/chat/') &&
                !id.includes('/audio/') &&
                !id.includes('/monitoring/') &&
                !id.includes('/voice/') &&
                !id.includes('/experience/') &&
                !id.includes('/evolution/') &&
                !id.includes('/aura/') &&
                !id.includes('/performance/') &&
                !id.includes('/admin/') &&
                !id.includes('/dev/') &&
                !id.includes('/fusion/') &&
                !id.includes('/QuantumCenter/') &&
                !id.includes('/HyperCenter/') &&
                !id.includes('/RealityCenter/') &&
                !id.includes('/IdentityCenter/') &&
                !id.includes('/MemoryEvolution/') &&
                !id.includes('/optimization/') &&
                !id.includes('/branding/'))
            ) {
              return 'ui-core';
            }
          }

          // ────────────────────────────────────────────────────────────────────
          // 3️⃣ SERVICES CORE CLUSTER (service-ai ↔ service-memory ↔ service-audio
          //                           ↔ services-common ↔ service-cognitive
          //                           ↔ devtools-sudo)
          // ────────────────────────────────────────────────────────────────────
          if (id.includes('/src/')) {
            if (id.includes('/services/') || id.includes('/modules/devSudo/')) {
              // ALL service modules + devtools-sudo → ONE CHUNK
              return 'services-core';
            }
          }

          // ────────────────────────────────────────────────────────────────────
          // 4️⃣ VENDOR CHUNKS (non-circular, order matters)
          // ────────────────────────────────────────────────────────────────────
          if (id.includes('node_modules')) {
            // 🔧 P1_BUILD_CHUNKS_FIX: React cluster BEFORE generic vendor
            // Check React FIRST to prevent falling into 'vendor' generic bucket
            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/react-router') ||
              id.includes('/scheduler/')
            ) {
              return 'react-vendor';
            }
            if (id.includes('@tauri-apps')) {
              return 'tauri-vendor';
            }
            if (id.includes('/three/') || id.includes('three')) {
              return 'three-vendor';
            }
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
              return 'react-vendor';
            }
            if (id.includes('recharts')) {
              return 'charts';
            }
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
            if (id.includes('web-vitals')) {
              return 'web-vitals';
            }
            if (id.includes('chart.js') || id.includes('chartjs')) {
              return 'charts';
            }
            if (
              id.includes('plotly') ||
              id.includes('echarts') ||
              id.includes('highcharts')
            ) {
              return 'charts-heavy';
            }
            if (id.includes('moment') || id.includes('dayjs')) {
              return 'datelib';
            }
            // Generic vendor fallback (includes former vendor-utils)
            return 'vendor';
          }

          // ────────────────────────────────────────────────────────────────────
          // 5️⃣ APPLICATION CODE (non-service, non-ui-core)
          // ────────────────────────────────────────────────────────────────────
          if (id.includes('/src/')) {
            // DevTools tabs (already checked devSudo above in services-core)
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

            // Domain-specific UI components (NOT in ui-core cluster)
            if (id.includes('/components/')) {
              if (id.includes('/chat/')) return 'ui-chat';
              if (id.includes('/audio/')) return 'ui-audio';
              if (id.includes('/monitoring/')) return 'ui-monitoring';
              if (id.includes('/voice/')) return 'ui-voice';
              if (id.includes('/experience/')) return 'ui-experience';
              if (id.includes('/evolution/')) return 'ui-evolution';
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
              // Fallback for unmatched components → ui-core already handled above
            }
          }

          // ────────────────────────────────────────────────────────────────────
          // 6️⃣ FALLBACK: undefined (default Vite chunk)
          // ────────────────────────────────────────────────────────────────────
          return undefined;
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

  // ✨ v27.1 Sprint: Global esbuild transform (source code + production optimization)
  esbuild: {
    // 🎯 Drop console and debugger in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    legalComments: 'none', // Remove comments in production
    // 🎯 Production minification settings
    minifyIdentifiers: process.env.NODE_ENV === 'production',
    minifySyntax: process.env.NODE_ENV === 'production',
    minifyWhitespace: process.env.NODE_ENV === 'production',
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
}));
