import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

// TITANE∞ v24 - Vite Configuration OPTIMIZED (CPU < 50%)
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

  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      overlay: false, // Désactive l'overlay d'erreur (CPU)
    },
    host: 'localhost',
    watch: {
      // Watchers optimisés — exclusions agressives
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/target/**',
        '**/.tauri/**',
        '**/backups/**',
        '**/.git/**',
        '**/*.log',
      ],
      usePolling: false, // Évite le polling (CPU)
    },
    fs: {
      strict: true,
      allow: ['.'],
      deny: [
        '/home/titane_os/Bureau/RECUP/**',
        '/home/titane_os/Documents/TITANE-DOC/OLD/**',
        '/home/titane_os/Documents/TITANE_NEWGEN_V20nov/**',
        '**/node_modules/**',
        '**/target/**',
      ],
    },
  },

  clearScreen: false,
  envPrefix: ['VITE_', 'TAURI_'],
});
