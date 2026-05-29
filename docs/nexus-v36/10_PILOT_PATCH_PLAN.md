# GATE 10 — PILOT PATCH PLAN

**Date:** 2026-05-28  
**HEAD:** 6c6aa6e01  
**Selected pilot:** PILOT-01 — `persistent_memory_get_stats`

---

## 1. Selected Pilot

`persistent_memory_get_stats` wrapped via new `titaneRuntime` abstraction layer.

---

## 2. Current Behavior

`persistent_memory_get_stats` is called via `secureInvoke` in:
- `src/cognitive/memory/memoryEngine.ts` (via engine's service layer)
- Various hooks via `secureInvoke` from `@/lib/security`

There is NO unified adapter interface. The adapter hierarchy is:
```
call site → secureInvoke (security.ts) → tauriClient.ts → invoke()
```

`tauriClient.ts` is documented as the sole authorized `invoke()` file.  
However, there is no intermediate `TitaneRuntime` typed interface for testability.

---

## 3. Intended Behavior After Patch

Add a new typed abstraction layer:
```
titaneRuntime.call('persistent_memory_get_stats') 
    → TauriRuntimeAdapter.call()
    → secureInvoke('persistent_memory_get_stats')
    → tauriClient.ts → invoke()

OR in tests/browser:
    → FallbackRuntimeAdapter.call()
    → returns configured mock
```

The `titaneRuntime` export is the pilot proof-of-concept. It does NOT replace existing call sites in this gate — that is v37 work.

---

## 4. Exact Files to Touch

```
CREATE: src/lib/adapters/titaneRuntime.ts
CREATE: tests/unit/adapters/titaneRuntime.test.ts
```

**FORBIDDEN (do not touch):**
- `src/lib/security.ts`
- `src/lib/tauriClient.ts`
- `src/cognitive/memory/memoryEngine.ts`
- Any existing page or component
- `package.json`, `pnpm-lock.yaml`
- `src-tauri/`

---

## 5. Forbidden Files

All files not in the "Exact Files to Touch" list above are forbidden in Gate 10.

---

## 6. Expected Tests

`tests/unit/adapters/titaneRuntime.test.ts` with 3 test cases:
1. Mode is 'fallback' in non-Tauri env
2. FallbackAdapter returns mock for `persistent_memory_get_stats`
3. FallbackAdapter throws BLOCKED_ENV for unconfigured commands

---

## 7. Rollback Command

```powershell
Remove-Item -Recurse -Force "C:\Dev\TITANE_INFINITY\src\lib\adapters\"
Remove-Item -Force "C:\Dev\TITANE_INFINITY\tests\unit\adapters\titaneRuntime.test.ts"
```

---

## 8. Proof Commands

```powershell
# TypeScript check
corepack pnpm run check

# ESLint
corepack pnpm run lint

# Targeted unit test
cross-env TZ=UTC NODE_OPTIONS="--max-old-space-size=8192 --require ./tests/polyfills/resizable-arraybuffer.cjs" corepack pnpm exec vitest run tests/unit/adapters/titaneRuntime.test.ts
```

---

## 9. Stop Lines

- STOP if any existing file is touched
- STOP if `src-tauri/` is touched
- STOP if `tsc --noEmit` fails
- STOP if ESLint fails with errors (warnings acceptable)
- STOP if targeted test fails
- STOP if any guard fails after patch

---

## Pre-Patch Declaration

This plan is written before any patch is applied.  
The patch is authorized to proceed under Gate 10 scope.
