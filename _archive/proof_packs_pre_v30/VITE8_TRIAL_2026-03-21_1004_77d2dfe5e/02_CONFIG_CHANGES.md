# Config Changes

## vite.config.ts
**NO CHANGES NEEDED**

Vite 8 with rolldown 1.0.0-rc.10 accepted all existing configuration without modification:
- `rollupOptions.treeshake` with `moduleSideEffects`, `propertyReadSideEffects`, `tryCatchDeoptimization` — accepted
- `rollupOptions.output.manualChunks` — accepted  
- `rollupOptions.external` — accepted
- `rollupOptions.onwarn` — accepted
- `build.cssMinify: 'lightningcss'` — accepted
- `build.minify: 'esbuild'` — accepted
- `optimizeDeps` — accepted
- All plugins (workbox, compression, visualizer, tsconfigPaths) — accepted

## package.json diff
```diff
- "@vitejs/plugin-react": "^5.1.4",
+ "@vitejs/plugin-react": "^5.2.0",
- "vite": "^7.3.1",
+ "vite": "^8.0.1",
```
