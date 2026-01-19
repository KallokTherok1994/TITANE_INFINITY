import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'node:url';
import autoprefixer from 'autoprefixer';

const ROOT_DIR = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    // Suppression de rollup-plugin-postcss pour éviter les erreurs de type
  ],
  root: ROOT_DIR,
  publicDir: 'public',

  // Configuration pour les dépendances et modules
  optimizeDeps: {
    // Force re-optimization si nécessaire (via env var)
    force: process.env.VITE_FORCE_OPTIMIZE === '1',

    // Inclure les dépendances problématiques
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tauri-apps/api/core',
      '@tauri-apps/plugin-shell',
      'framer-motion',
      'lucide-react',
    ],

    // Exclure les modules qui causent des problèmes
    exclude: [
      'events', // Mock events module, don't pre-bundle
      // Modules qui doivent être chargés directement
    ],

    // Configuration pour éviter les scans de dépendances sur certains patterns
    entries: [
      'src/main.tsx',
      '!src/engines/**/*',
      '!src/ui/motion/**/*',
      '!src/**/*.lazy.*',
    ],
  },

  // Handle onnxruntime-web eval usage (security warning suppression) - merged into main build config below

  // Configuration ESM
  esbuild: {
    target: 'esnext',
    format: 'esm',
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    legalComments: 'none',
  },

  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    open: false,
    cors: true,
    hmr: {
      port: 5173,
      overlay: false, // Désactive l'overlay HMR pour éviter les erreurs bloquantes
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
      onwarn(warning, warn) {
        // Suppress eval warnings for onnxruntime-web (necessary for WebAssembly)
        if (warning.code === 'EVAL' && warning.id?.includes('onnxruntime-web')) {
          return;
        }
        // Suppress mixed import warnings (modules imported both statically and dynamically)
        // These are expected for performance optimization (immediate + lazy loading)
        if (warning.message?.includes('dynamically imported by') &&
            warning.message?.includes('but also statically imported by')) {
          return;
        }
        // Suppress chunk warnings for modules that are both static and dynamic imported
        if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.message?.includes('aiHealthMonitor')) {
          return;
        }
        warn(warning);
      },
      output: {
        // Enhanced chunking configuration to fix dynamic import issues
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // UI libraries
          'ui-vendor': ['framer-motion', 'lucide-react'],

          // Tauri APIs
          'tauri-vendor': ['@tauri-apps/api', '@tauri-apps/plugin-dialog', '@tauri-apps/plugin-fs'],

          // AI/ML libraries (problematic eval usage)
          'ai-vendor': ['@xenova/transformers'],

          // Chart libraries
          'chart-vendor': ['chart.js', 'react-chartjs-2', 'recharts'],

          // Utils and other libraries
          'utils-vendor': ['date-fns', 'clsx', 'zustand', 'i18next'],

          // Keep AI services in separate chunks to avoid circular deps
          'ai-services': [
            './src/services/ai/orchestrator',
            './src/services/ai/metricsEngine',
            './src/services/ai/autoHealEngine',
            './src/services/ai/healthMonitor',
          ],
        },
      },
    },
  },
  css: {
    devSourcemap: false,
  },
  clearScreen: false,
  envPrefix: ['VITE_', 'TAURI_'],
});
