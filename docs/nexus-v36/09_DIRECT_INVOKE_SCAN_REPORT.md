# GATE 9 — DIRECT INVOKE SCAN REPORT

**Project:** TITANE_INFINITY  
**Date:** 2026-05-28  
**HEAD:** 6c6aa6e01  
**Source:** guard-runtime-adapter-scan.mjs (Gate 5 output)

---

## Scan Summary

Gate 5 runtime adapter scan found **9 direct `invoke()` occurrences** in `src/`.

All 9 are INACTIVE (commented-out code or JSDoc documentation).  
No active runtime direct-invoke calls detected.

---

## Finding Details

### Finding 1–2: Commented-Out Code

| File | Type | Status |
|------|------|--------|
| `src/components/ChatErrorBoundary` | Commented-out invoke | INACTIVE — in comment block |
| `src/components/ErrorBoundary` | Commented-out invoke | INACTIVE — in comment block |

These two occurrences are in React error boundary components.  
The `invoke()` calls were commented out as part of a previous refactor.  
**Action required in P2:** Clean up comments or wrap in adapter.

### Finding 3–9: JSDoc Documentation

| File | Count | Type |
|------|-------|------|
| `src/services/api/index.ts` | 5 | JSDoc `@example` blocks showing old API usage |
| `src/evolutionEngine/index.ts` | 2 | JSDoc `@example` blocks |

These are documentation-only references. The `invoke()` strings appear inside `/** */` JSDoc blocks as usage examples, not as actual runtime calls.  
**Action required in P2 (optional):** Update examples to use `titaneRuntime.call()` pattern.

---

## Active Invoke Pattern Count: 0

No active (non-commented, non-JSDoc) `invoke()` calls found in scan.

---

## Pilot Candidate Identification

From the taxonomy (`09_TAURI_HTTP_FALLBACK_TAXONOMY.md`), the adapter pilot selection should target commands that:
1. Are currently used in active (non-commented) service code
2. Have `MOCK_EMPTY` or `MOCK_DEFAULT` fallback available (low risk)
3. Are in a single service file (easy rollback)

Candidates identified for pilot:
- `agenda_load_events` — read-only, MOCK_EMPTY available
- `persistent_memory_get_stats` — read-only, MOCK_ZERO available
- `orchestrator_get_state` — read-only, MOCK_DEFAULT available

See `09_RUNTIME_ADAPTER_PILOT_SELECTION.md` for full pilot plan.

---

## Scan Command

```powershell
node scripts/titane-dev/guard-runtime-adapter-scan.mjs
```

Output (Gate 5):
```
RUNTIME_ADAPTER_SCAN=PASS
DIRECT_INVOKE_REFS=9 (all inactive: 2 commented, 7 JSDoc)
ACTIVE_DIRECT_INVOKE=0
```

---

## Verdict

```
TOTAL_INVOKE_REFS=9
ACTIVE_INVOKE_REFS=0
COMMENTED_INVOKE=2
JSDOC_INVOKE=7
PILOT_CANDIDATES=3
DIRECT_INVOKE_SCAN=COMPLETE
```
