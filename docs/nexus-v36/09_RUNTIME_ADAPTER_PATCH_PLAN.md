# GATE 9 — RUNTIME ADAPTER PATCH PLAN

**Project:** TITANE_INFINITY  
**Date:** 2026-05-28  
**Phase:** P1 SPEC — no patches applied until APPROVE_P2_GATE_10

---

## Patch Plan Overview

Runtime Adapter patches are v37 work. They do NOT ship in NEXUS v36.  
This document records the planned patches so Gate 10+ can reference them.

---

## Adapter Infrastructure Patches (v37, post-Gate 10)

| Patch ID | File | Type | Risk | Gate |
|----------|------|------|------|------|
| P37-01 | `src/lib/titaneRuntime.ts` | NEW | LOW | Gate 12 |
| P37-02 | `src/lib/adapters/TauriAdapter.ts` | NEW | LOW | Gate 12 |
| P37-03 | `src/lib/adapters/HttpAdapter.ts` | NEW | LOW | Gate 12 |
| P37-04 | `src/lib/adapters/FallbackAdapter.ts` | NEW | LOW | Gate 12 |
| P37-05 | `src/lib/adapters/index.ts` | NEW | LOW | Gate 12 |
| P37-06 | `src/pages/Memory.tsx` | MODIFY | LOW | Gate 12 (pilot wrap) |
| P37-07 | `src/pages/OrchestrationMetaCenter.tsx` | MODIFY | LOW | Gate 12 (pilot wrap) |
| P37-08 | `src/pages/SingularityMonitor.tsx` | MODIFY | LOW | Gate 12 (pilot wrap) |
| P37-09 | `tests/unit/adapters/` | NEW | LOW | Gate 12 (test coverage) |

---

## What Is Applied in NEXUS v36 (Gates 10–11)

NEXUS v36 does NOT include Runtime Adapter wrapping.  
v36 gates (10–11) apply only the NexusShell/CommandPalette/TruthBadge patches from `08_NEXUS_PATCH_PLAN.md`.

Runtime Adapter (v37) begins at Gate 12 (LOCKED_P2) — requires separate decision after Gate 11 completes.

---

## P37-01 — titaneRuntime.ts

```typescript
// Planned interface (spec only — not implemented yet)
export interface TitaneRuntime {
  call<T = unknown>(command: string, args?: Record<string, unknown>): Promise<T>;
  readonly mode: 'tauri' | 'http' | 'fallback';
  isAvailable(): boolean;
}

export function createRuntime(): TitaneRuntime {
  if (window.__TAURI__) return new TauriAdapter();
  if (import.meta.env.VITE_HTTP_FALLBACK === 'true') return new HttpAdapter();
  return new FallbackAdapter();
}

export const titaneRuntime: TitaneRuntime = createRuntime();
```

**Risk:** LOW — new file, no existing code modified.  
**Required before:** P37-02, P37-03, P37-04 all created first.

---

## P37-06 — Memory.tsx Pilot Wrap (example)

Before:
```typescript
import { invoke } from '@tauri-apps/api/core';
const stats = await invoke('persistent_memory_get_stats');
```

After:
```typescript
import { titaneRuntime } from '@/lib/titaneRuntime';
const stats = await titaneRuntime.call('persistent_memory_get_stats');
```

**Risk:** LOW — same command name, same result shape, adapter handles Tauri call.  
**Rollback:** `git restore -- src/pages/Memory.tsx`  
**Certifier required:** Yes, before and after.

---

## Pre-Patch Requirements for v37

Before Gate 12:
- [ ] `APPROVE_P2_GATE_10` already received (Gates 10–11 complete)
- [ ] Gate 11 verdict: PASS
- [ ] guard-runtime-adapter-scan.mjs confirms pilot files still match scan
- [ ] No new direct invoke() calls introduced in Gates 10–11

---

## Verdict

```
ADAPTER_PATCHES_PLANNED=9
ADAPTER_PATCHES_APPLIED=0
V36_ADAPTER_PATCHES=0 (runtime adapter is v37)
V37_ADAPTER_PATCHES=9
RUNTIME_ADAPTER_PATCH_PLAN=COMPLETE
```
