# UI_DESKTOP_FUNCTIONAL_REPAIRS_v56

**Date**: 2026-05-10

---

## Repairs Applied in v55 + v56

### R1 — v55: ErrorBoundary.tsx testid (committed `298b1b542`)

- **File**: `src/components/ErrorBoundary.tsx`
- **Change**: Added `data-testid="titane-error-boundary"` to default fallback `<div>`
- **Reason**: E2E tests need a precise, collision-free selector to detect real ErrorBoundary states

### R2 — v55: Memory.tsx hidden marker (committed `298b1b542`)

- **File**: `src/pages/Memory.tsx`
- **Change**: Added `<span data-testid="memory-runtime-status" style={{ display: 'none' }}>memory-live</span>`
- **Reason**: Provide a stable proof marker for Memory page successful render

### R3 — v55: Functional-core test precision (committed `298b1b542`)

- **File**: `e2e/desktop/ui-desktop-functional-core.wdio.test.js`
- **Change**: Memory "no error boundary" test now uses h2 title + testid detection
- **Reason**: Body string match caused false positive (`ErrorBoundary` appears in documentation text)

### R4 — v55: classifySurface() precision (committed `298b1b542`)

- **File**: `e2e/desktop/helpers/uiDesktopFunctionalFlows.js`
- **Change**: `classifySurface()` uses `innerText` + full phrase "Une erreur inattendue" instead of `innerHTML.includes('ErrorBoundary')`
- **Reason**: Same false-positive risk eliminated from flow helper

### R5 — v56 Startup: Advanced spec precision

- **File**: `e2e/desktop/ui-desktop-functional-advanced.wdio.test.js`
- **Change**: Line 50 — replaced `bodyHTML.includes('ErrorBoundary')` with h2+testid pattern
- **Reason**: Last remaining broad string match pattern eliminated

## Result After Repairs

All 5 functional specs PASS. Memory = FUNCTIONAL_READ_ONLY_PROVEN. Zero false positives.
