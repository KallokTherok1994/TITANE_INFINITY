# X3 STABILITY REPORT
## Proof Pack: POST_SEAL_CORRECTION_2026-03-21_1228_9b50cc67e

---

## Critical Corrected Paths — 3 Runs Each

### Target files
1. `src/__tests__/memory-consumption-truth.test.ts` (6 tests — D-002 closure)
2. `src/__tests__/response-assembly-truth.test.ts` (9 tests — D-003 closure)
3. `src/__tests__/chatEngine.test.ts` (25 tests — baseline)

---

### Run 1
```
Test Files  3 passed (3)
Tests  40 passed (40)
Start at  08:39:02
Duration  2.12s
Exit code: 0
```

### Run 2
```
Test Files  3 passed (3)
Tests  40 passed (40)
Start at  08:39:05
Duration  2.12s
Exit code: 0
```

### Run 3
```
Test Files  3 passed (3)
Tests  40 passed (40)
Start at  08:39:08
Duration  2.11s
Exit code: 0
```

---

## X3 Summary

| Metric | Value |
|---|---|
| Total runs | 3 |
| Tests per run | 40 |
| Total test executions | 120 |
| Failures | 0 |
| Flaky tests | 0 |
| Duration variance | < 10ms across runs |
| **Stability verdict** | **STABLE** |

---

## Full Suite Regression Check (1 run)

```
Test Files  231 passed (231)
Tests:      3399 passed (3399)
Duration:   130.97s
Exit code:  0
```

**Baseline before session:** 3384 tests (from dep update commit `9b50cc67e`)
**Tests added this session:** 15 (6 memory-consumption + 9 response-assembly)
**Regressions introduced:** 0

---

## Rust Test Suite (1 run)

```
running 10 tests — ok. 10 passed; 0 failed; 0 ignored  (unified_memory)
running 3 tests  — ok. 3 passed; 0 failed; 0 ignored   (kernel_integration)
running 10 tests — ok. 10 passed; 0 failed; 0 ignored  (ipc_cache)
running 17 tests — ok. 3 passed; 0 failed; 14 ignored  (commands_v21_smoke — Tauri runtime required for ignored)
Exit code: 0
```

---

## Gate Results

| Gate | Result |
|---|---|
| `verify_instructions.sh` | PASS 20/0 |
| `detect_recurrence.sh` | PASS — 505 entries, G_AH_RECURRENCE_GUARD_PASS |
| `verify_global_system.sh` | PASS — Node/Rust/Tauri/deps all present |
| `verify_chat_online.sh` | FAIL — no API keys in env (NO_KEY_ENV — honest, not masked) |
| X3 critical paths | PASS 40/40 × 3 runs |
| Full vitest suite | PASS 3399/3399 |
| Rust suite | PASS 26/26 active |
