import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@ui': resolve(__dirname, './src/ui'),
      '@layout': resolve(__dirname, './src/layout'),
      '@pages': resolve(__dirname, './src/pages'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@design-system': resolve(__dirname, './src/design-system'),
    },
  },

  build: {
    outDir: './dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    target: 'esnext',
    rollupOptions: {
      external: ['@tauri-apps/api/core', '@tauri-apps/api/tauri'],
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
    host: 'localhost',
  },

  clearScreen: false,
  envPrefix: ['VITE_', 'TAURI_'],
});
