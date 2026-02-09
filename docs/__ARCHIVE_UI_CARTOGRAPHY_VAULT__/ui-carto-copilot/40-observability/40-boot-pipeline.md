# Boot Pipeline

**Date:** 2026-02-07  
**Files:** `src/main.tsx`, `src/App.tsx`, `src/tauri-init-fix.ts`

## Boot Sequence
1. HTML Load → index.html
2. Tauri Init → tauri-init-fix.ts ensures `window.__TAURI__` exists
3. React Bootstrap → main.tsx mounts App
4. Providers → ThemeProvider, AnimationProvider, TitanStateProvider, ToastProvider, BrowserRouter
5. Error Boundaries → AutoHealErrorBoundary, ErrorBoundary
6. Router → Default route `/` redirects to `/titane`
7. Lazy Load → Page components loaded on demand

## Critical Boot Risks
- **P0:** Tauri not initialized → Mitigated by tauri-init-fix.ts
- **P0:** Base path mismatch → Validated by vite-base-relative-gate.cjs
- **P1:** Chunk load failure → Caught by ErrorBoundary

## Validation
- ✅ `pnpm run gate:prod-boot` - Vite base path
- ✅ `pnpm run verify:tauri-only` - Tauri mode

**Proof:** See src/main.tsx lines 1-50, src/tauri-init-fix.ts
