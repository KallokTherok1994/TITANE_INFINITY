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
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔒 TAURI NATIVE ONLY - NO HTTP SERVER
  // ═══════════════════════════════════════════════════════════════════════════
  // Server configuration REMOVED - Tauri loads from file:// protocol only
  // All assets served via Tauri's asset protocol, no localhost ports
  // To run: pnpm run build && tauri dev (builds static files first)

  clearScreen: false,
  envPrefix: ['VITE_', 'TAURI_'],
});
