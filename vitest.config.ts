/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
// This file is only consumed by Vitest; keep test-time aliasing deterministic.
const isVitest = true;

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
  {
    find: '@tauri-apps/api/event',
    replacement: resolve(__dirname, './tests/mocks/tauriEvent.ts'),
  },
];

const vitestAliasEntries = isVitest
  ? [
      {
        find: '@hooks/useChatCore',
        replacement: resolve(__dirname, './src/hooks/__mocks__/useChatCore.mock.ts'),
      },
      {
        find: '@hooks/useChatMemory',
        replacement: resolve(__dirname, './src/hooks/__mocks__/useChatMemory.mock.ts'),
      },
      {
        find: '@/services/tts/hybridTTS',
        replacement: resolve(__dirname, './src/services/tts/__mocks__/hybridTTS.mock.ts'),
      },
      {
        find: /\/src\/hooks\/useChatCore(\.ts)?(\?.*)?$/,
        replacement: resolve(__dirname, './src/hooks/__mocks__/useChatCore.mock.ts'),
      },
      {
        find: /\/src\/hooks\/useChatMemory(\.ts)?(\?.*)?$/,
        replacement: resolve(__dirname, './src/hooks/__mocks__/useChatMemory.mock.ts'),
      },
      {
        find: /\/src\/services\/tts\/hybridTTS(\.ts)?(\?.*)?$/,
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
  // 🧪 VITEST CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════
  test: {
    name: 'core',
    globals: true,
    environment: 'happy-dom',
    // Memory stability: avoid forking many workers; run files sequentially.
    pool: 'forks',
    maxWorkers: 1,
    fileParallelism: false,
    setupFiles: [
      './src/setupTests.ts',
      './src/test/setup.ts',
      './src/test-utils/setup.ts',
    ],
    testTimeout: 45000,
    hookTimeout: 20000,
    teardownTimeout: 10000,
    // maxThreads removed - not supported in Vitest 4.x, use pool options instead
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'tests/unit/**/*.{test,spec}.{ts,tsx}',
      'tests/integration/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: [
      'node_modules',
      'dist',
      'src-tauri',

      // E2E Vitest suite is run explicitly via `pnpm run test:e2e:vitest`.
      'src/tests/e2e/**',

      // Browser/Perf suite is run explicitly via `pnpm run test:browser`.
      'src/tests/browser/**',
      '**/*.perf.test.{ts,tsx}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
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
      logLevel: 'silent', // Ajustement pour éviter les erreurs
    },
  },

  resolve: {
    // IMPORTANT: les alias les plus spécifiques doivent venir en premier.
    // Sinon, les alias génériques (ex: '@' ou '@hooks') capturent tout et les mocks ne s'appliquent jamais.
    alias: [...vitestAliasEntries, ...baseAliasEntries],
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
