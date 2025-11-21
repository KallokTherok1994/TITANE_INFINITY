import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../core/frontend'),
      '@core': path.resolve(__dirname, '../../core/frontend/core'),
      '@hooks': path.resolve(__dirname, '../../core/frontend/hooks'),
      '@contexts': path.resolve(__dirname, '../../core/frontend/contexts'),
      '@services': path.resolve(__dirname, '../../core/frontend/services'),
      '@ui': path.resolve(__dirname, '../../core/frontend/ui'),
      '@devtools': path.resolve(__dirname, '../../core/frontend/devtools'),
    },
  },

  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          tauri: ['@tauri-apps/api'],
        },
      },
    },
  },

  server: {
    port: 5173,
    strictPort: true,
    host: 'localhost',
  },

  clearScreen: false,
  envPrefix: ['VITE_', 'TAURI_'],
});
