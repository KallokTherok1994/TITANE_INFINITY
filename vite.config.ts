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
        plugins: []
      }
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
    }
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
      '@tauri-apps/api/core': resolve(__dirname, './node_modules/@tauri-apps/api/core.js'),
      '@tauri-apps/api/event': resolve(__dirname, './node_modules/@tauri-apps/api/event.js'),
      // Polyfills for Node.js modules in browser
      'events': 'eventemitter3',
    },
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    target: 'esnext',
    chunkSizeWarningLimit: 1000, // Increased for large dashboards
    cssCodeSplit: true, // ✨ P2-5: Split CSS per chunk
    cssMinify: true, // ✨ P2-5: Minify CSS
    reportCompressedSize: false, // ✨ P2-5: Faster build (skip gzip calc)
    terserOptions: {
      compress: {
        drop_console: true, // ✨ P2-5: Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        safari10: true,
      },
    },
    rollupOptions: {
      // Supprimer warning eval() pour onnxruntime-web (WebAssembly loader)
      onwarn(warning, warn) {
        // Ignorer warning eval() de onnxruntime-web (nécessaire pour WASM)
        if (
          warning.code === 'EVAL' &&
          warning.id?.includes('onnxruntime-web')
        ) {
          return;
        }
        warn(warning);
      },
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: (id) => {
          // Vendor libs (React ecosystem)
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/react-router-dom')) {
            return 'vendor-router';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          if (id.includes('node_modules/@tauri-apps')) {
            return 'vendor-tauri';
          }

          // Sentry & Monitoring (Phase 1)
          if (id.includes('node_modules/@sentry/') || id.includes('node_modules/web-vitals')) {
            return 'vendor-monitoring';
          }

          // UI Libraries (Heavy)
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
            return 'vendor-charts';
          }
          if (id.includes('node_modules/@radix-ui/') || id.includes('node_modules/class-variance-authority')) {
            return 'vendor-ui-primitives';
          }

          // State Management
          if (id.includes('node_modules/zustand') || id.includes('node_modules/immer')) {
            return 'vendor-state';
          }

          // AI/ML Libraries (Heavy)
          if (id.includes('node_modules/onnxruntime-') || id.includes('node_modules/@tensorflow/') || id.includes('node_modules/@huggingface/')) {
            return 'vendor-ai-ml';
          }

          // Core IA agents (Heavy computational logic)
          if (id.includes('src/core/ai/agents/')) {
            return 'agents-core';
          }

          // ✨ P2-5: Engine pages (lazy loaded separately)
          if (id.includes('src/pages/Helios') || id.includes('src/pages/Nexus') ||
              id.includes('src/pages/Harmonia') || id.includes('src/pages/Sentinel')) {
            return 'pages-engines-monitoring';
          }
          if (id.includes('src/pages/Watchdog') || id.includes('src/pages/SelfHeal') ||
              id.includes('src/pages/AdaptiveEngine') || id.includes('src/pages/Memory')) {
            return 'pages-engines-system';
          }

          // ✨ P2-5: Feature centers (lazy loaded separately)
          if (id.includes('src/features/system-center') || id.includes('src/features/design-center')) {
            return 'features-centers-1';
          }
          if (id.includes('src/features/governance-center') || id.includes('src/features/audio-center')) {
            return 'features-centers-2';
          }
          if (id.includes('src/features/one-core') || id.includes('src/features/qa-monitoring')) {
            return 'features-centers-3';
          }

          // ✨ P2-5: Presence & Psyche engines (heavy computation)
          if (id.includes('src/engines/presence/') || id.includes('src/engines/psyche/')) {
            return 'engines-presence-psyche';
          }
          if (id.includes('src/engines/')) {
            return 'engines-misc';
          }

          // Phases V-Ω dashboards (Lazy loaded)
          if (id.includes('src/ui/pages/NodeClusterDashboard') ||
              id.includes('src/ui/pages/KnowledgeFusionPage') ||
              id.includes('src/ui/pages/HyperVisionDashboard')) {
            return 'dashboards-vomega-1';
          }
          if (id.includes('src/ui/pages/QuantumEngineDashboard') ||
              id.includes('src/ui/pages/EvolutionMonitor') ||
              id.includes('src/ui/pages/CreationStudio')) {
            return 'dashboards-vomega-2';
          }

          // Services (Business logic)
          if (id.includes('src/services/')) {
            return 'services';
          }

          // UI components (split by type)
          if (id.includes('src/components/chat/') || id.includes('src/components/AIChatBubble')) {
            return 'ui-chat';
          }
          if (id.includes('src/ui/') || id.includes('src/components/')) {
            return 'ui-components';
          }

          // Other node_modules (remaining small libs)
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
        },
      },
      // Externaliser les modules Node.js purs (incompatibles browser) + Tauri v2 plugins (chargés dynamiquement)
      external: [
        'better-sqlite3',
        'sqlite3',
        'bindings',
        'file-uri-to-path',
        'fs',
        'path',
        'util',
        'crypto',
        'stream',
        'os',
        '@tauri-apps/plugin-fs',
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🌐 NETWORK DEPLOYMENT - HOST MODE (OPTIMIZED FOR CPU)
  // ═══════════════════════════════════════════════════════════════════════════
  server: {
    host: 'localhost',         // Only localhost (reduces network scanning CPU)
    port: 5173,                // Default port
    strictPort: true,          // Fail if port is in use
    cors: true,                // Enable CORS for API calls
    hmr: {
      host: 'localhost',       // HMR local only
      overlay: true,           // Show errors in overlay
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
      usePolling: false,       // Disable polling (use native FS events)
    },
  },

  preview: {
    host: 'localhost',         // Preview server local only
    port: 4173,                // Preview port
    strictPort: true,
    cors: true,
  },

  clearScreen: false,
  envPrefix: ['VITE_', 'TAURI_'],
});
