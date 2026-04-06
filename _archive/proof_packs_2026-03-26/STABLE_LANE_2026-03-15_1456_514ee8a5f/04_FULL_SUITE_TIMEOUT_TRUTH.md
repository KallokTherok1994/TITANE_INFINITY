# 04_FULL_SUITE_TIMEOUT_TRUTH.md — STABLE_LANE_2026-03-15_1456

## Root Cause 1: e2e-automated-validation.test.tsx

| Attribute | Value |
|-----------|-------|
| File | `src/__tests__/e2e-automated-validation.test.tsx` |
| Size | 2205 lines, 91 test specs |
| Class | ENV_DEFECT + TEST_DEFECT |
| Why included | `src/**/*.{test,spec}.{ts,tsx}` — no RUN_E2E_TESTS guard |
| Symptom | `for (let i = 0; i < 200; i++)` loops + `setTimeout(..., 45000)` × 3 |
| Proof | `grep -n "setTimeout.*45000\|for.*200" src/__tests__/e2e-automated-validation.test.tsx` |
| Bisect result | Last stdout before timeout: `OMEGA Phase 7Ω - E2E: Error Recovery` |
| Fix | Added to exclude list guarded by `runE2ETests` flag |

## Root Cause 2: ChatWorkflow.e2e.test.tsx

| Attribute | Value |
|-----------|-------|
| File | `src/__tests__/e2e/ChatWorkflow.e2e.test.tsx` |
| Size | 245 lines, 8+ tests |
| Class | ENV_DEFECT |
| Why included | `src/**/*.{test,spec}.{ts,tsx}` picks up `src/__tests__/e2e/` |
| Symptom | Imports `TitanePage` → initializes 8+ cognitive engines → calls `exp_get_global_state` IPC → no mock handler → hangs waiting for IPC response |
| Proof | `[vitest] No mock handler for command "exp_get_global_state"` in stderr, then stuck stdout stream of engine initializations, exit code 124 (timeout) at 120s |
| Fix | Added to exclude list guarded by `runE2ETests` flag |

## Quarantine Classification

| File | Classification | Reason |
|------|---------------|--------|
| e2e-automated-validation.test.tsx | BLOCKED_ENV_DEPENDENT | Requires real Tauri backend + providers |
| ChatWorkflow.e2e.test.tsx | BLOCKED_ENV_DEPENDENT | Requires real Tauri IPC mock for all commands |

Both files remain in the codebase. Not silently removed. Documented explicitly.
Both accessible via: `RUN_E2E_TESTS=1 pnpm test`

## After Fix

Full suite: 3218/3218 PASS × 3 consecutive runs
