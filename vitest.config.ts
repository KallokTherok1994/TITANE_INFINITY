/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { availableParallelism, cpus } from 'os';

const detectedCpuCount =
  typeof availableParallelism === 'function' ? availableParallelism() : cpus().length;
const maxThreadBudget = Math.min(4, Math.max(1, Math.floor(detectedCpuCount / 2)));
const isVitest = process.env.VITEST === 'true';

const baseAliasEntries = [
  { find: '@', replacement: resolve(__dirname, './src') },
  { find: '@app', replacement: resolve(__dirname, './src/app') },
  { find: '@pages', replacement: resolve(__dirname, './src/pages') },
  { find: '@features', replacement: resolve(__dirname, './src/features') },
  { find: '@components', replacement: resolve(__dirname, './src/components') },
  { find: '@ui', replacement: resolve(__dirname, './src/ui') },
  { find: '@hooks', replacement: resolve(__dirname, './src/hooks') },
  { find: '@services', replacement: resolve(__dirname, './src/services') },
  { find: '@stores', replacement: resolve(__dirname, './src/stores') },
  { find: '@themes', replacement: resolve(__dirname, './src/themes') },
  { find: '@utils', replacement: resolve(__dirname, './src/utils') },
  { find: '@types', replacement: resolve(__dirname, './src/types') },
  { find: '@assets', replacement: resolve(__dirname, './src/assets') },
  { find: '@styles', replacement: resolve(__dirname, './src/styles') },
  {
    find: '@tauri-apps/api/tauri',
    replacement: resolve(__dirname, './tests/mocks/tauri.ts'),
  },
  {
    find: '@tauri-apps/api/core',
    replacement: resolve(__dirname, './tests/mocks/tauriCore.ts'),
  },
];

const vitestAliasEntries = isVitest
  ? [
      {
        find: /\/src\/hooks\/useChatCore$/,
        replacement: resolve(__dirname, './src/hooks/__mocks__/useChatCore.mock.ts'),
      },
      {
        find: /\/src\/hooks\/useChatMemory$/,
        replacement: resolve(__dirname, './src/hooks/__mocks__/useChatMemory.mock.ts'),
      },
      {
        find: /\/src\/services\/tts\/hybridTTS$/,
        replacement: resolve(__dirname, './src/services/tts/__mocks__/hybridTTS.mock.ts'),
      },
    ]
  : [];

// TITANE∞ v17.3.0 - Vite + Vitest Configuration
export const sharedTestConfig = defineConfig({
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
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧪 VITEST CONFIGURATION v26.4.0
  // ✅ Updated for Vitest 4.x - poolOptions moved to top-level
  // ═══════════════════════════════════════════════════════════════════════════
  test: {
    name: 'core',
    globals: true,
    environment: 'happy-dom',
    setupFiles: [
      './src/setupTests.ts',
      './src/test/setup.ts',
      './src/test-utils/setup.ts',
    ],
    // ✅ v26.4.0: Timeouts optimized for stability
    testTimeout: 30000,
    hookTimeout: 15000,
    teardownTimeout: 5000,
    // ✅ v26.4.0: Vitest 4.x - pool options are now top-level
    pool: 'vmThreads',
    // Single thread for stability - prevents heap accumulation
    singleThread: true,
    // Memory isolation between test files
    isolate: true,
    // ✅ v26.4.0: Clear mocks automatically
    clearMocks: true,
    restoreMocks: true,
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'tests/unit/**/*.{test,spec}.{ts,tsx}',
      'tests/integration/**/*.{test,spec}.{ts,tsx}',
      'tests/contract/**/*.{test,spec}.{ts,tsx}',
      'tests/phase3/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: ['node_modules', 'dist', 'src-tauri'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      reportsDirectory: 'coverage/unit',
      exclude: [
        'node_modules/',
        '**/*.css',
        '**/*.svg',
        'src/assets/**',
        'src/styles/**',
        'src/test/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🚀 OPTIMISATIONS CPU & WATCHERS
  // ═══════════════════════════════════════════════════════════════════════════
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime'],
    esbuildOptions: {
      target: 'esnext',
    },
  },

  resolve: {
    alias: [...baseAliasEntries, ...vitestAliasEntries],
  },

  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: 'lightningcss',
    rollupOptions: {
      output: {
        manualChunks: id => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            return 'vendor';
          }
        },
      },
    },
  },

  server: {
    port: 1420,
    strictPort: true,
    host: '127.0.0.1',
    hmr: {
      protocol: 'ws',
      host: '127.0.0.1',
      port: 1421,
    },
    watch: {
      ignored: ['**/src-tauri/**', '**/target/**'],
    },
  },
});

export default sharedTestConfig;
