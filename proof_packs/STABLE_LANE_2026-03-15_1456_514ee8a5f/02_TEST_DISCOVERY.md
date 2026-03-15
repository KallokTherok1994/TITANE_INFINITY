# 02_TEST_DISCOVERY.md — STABLE_LANE_2026-03-15_1456

## Vitest Configs

| Config | Purpose | Hang? |
|--------|---------|-------|
| vitest.config.ts | Main full suite | YES (before fix) |
| vitest.unit.config.ts | Unit subset | NO |
| vitest.integration.config.ts | Integration | NO |
| vitest.browser.config.ts | Browser tests | NOT TESTED |

## Test Scripts (package.json)

| Script | Command | Notes |
|--------|---------|-------|
| `pnpm test` | vitest run | Main suite — FIXED |
| `test:rust` | cargo test --lib | Rust unit tests |
| `test:architecture` | vitest run src/__tests__/architecture | Architecture compliance |
| `test:e2e:vitest` | TITANE_E2E_TAURI=1 vitest | Requires Tauri runtime |
| `run:x3:tests` | bash scripts/lib/run_x3_profile.sh tests | x3 runner |

## Main Config Include/Exclude (post-fix)

```
include: src/**/*.{test,spec}.{ts,tsx}, tests/contract/**, tests/unit/**, tests/integration/**
exclude (relevant): 
  - src/tests/e2e/** (unless RUN_E2E_TESTS=1)
  - src/__tests__/e2e-automated-validation.test.tsx (unless RUN_E2E_TESTS=1) ← NEW
  - src/__tests__/e2e/ChatWorkflow.e2e.test.tsx (unless RUN_E2E_TESTS=1) ← NEW
  - src/services/unified/__tests__/SQLiteVectorStore.unit.test.ts
  - tests/contract/tauri.contract.test.ts
  - **/*.perf.test.{ts,tsx}
```

## Result After Fix

- Test Files: 215 passed
- Tests: 3218 passed × 3 consecutive runs
