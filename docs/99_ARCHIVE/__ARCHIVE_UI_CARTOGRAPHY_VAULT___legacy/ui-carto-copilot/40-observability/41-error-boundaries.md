# Error Boundaries

**Date:** 2026-02-07  
**Files:** `src/components/ErrorBoundary.tsx`, `src/components/AutoHealErrorBoundary.tsx`

## 3-Layer Architecture
1. **Global ErrorBoundary** - Wraps all routes, generic fallback
2. **AutoHealErrorBoundary** - Self-healing with retry, logs to Tauri via `log_error` IPC
3. **Feature-Specific** - ChatErrorBoundary, SystemCenterErrorBoundary

## Error Types Handled
- Chunk load errors (lazy loading failures)
- Network errors (IPC timeouts)
- Render errors (component crashes)
- IPC errors (backend failures)

## Coverage
✅ Global (App.tsx wraps Routes)  
✅ AppShell (AutoHealErrorBoundary)  
✅ Chat (ChatErrorBoundary in router.tsx)  
⚠️ Per-section boundaries missing (TitanePage tabs, DevPage sections)

## Accessibility
- ✅ `role="alert"` on error messages
- ✅ Auto-focus on retry button
- ✅ Keyboard navigation

**Proof:** See src/components/ErrorBoundary.tsx, src/components/AutoHealErrorBoundary.tsx
