# 10_DIFF_FILES.md — STABLE_LANE_2026-03-15_1456

## Only File Modified

`vitest.config.ts` — 5 lines added to exclude section

### Diff

```diff
       // Contract test with pre-existing violations (post-IPC remediation)
       'tests/contract/tauri.contract.test.ts',
+
+      // OMEGA E2E automated validation: requires real Tauri backend + provider retries.
+      // Root cause of full-suite hang: 91 tests × up to 45s timeouts + 200-iteration loops.
+      // Run explicitly via: RUN_E2E_TESTS=1 vitest run src/__tests__/e2e-automated-validation.test.tsx
+      ...(runE2ETests ? [] : ['src/__tests__/e2e-automated-validation.test.tsx']),
+
+      // ChatWorkflow.e2e.test.tsx: renders TitanePage which initializes 8+ cognitive engines
+      // and invokes Tauri commands (exp_get_global_state etc.) with no mock handlers.
+      // ENV_DEFECT: requires real Tauri runtime IPC — hangs indefinitely in jsdom.
+      // Run explicitly via: RUN_E2E_TESTS=1 vitest run src/__tests__/e2e/ChatWorkflow.e2e.test.tsx
+      ...(runE2ETests ? [] : ['src/__tests__/e2e/ChatWorkflow.e2e.test.tsx']),
     ],
```

### Why Minimal

- Only adds exclude entries (no deletions, no new includes)
- Both files preserved in repo with explicit docs
- Gated behind `runE2ETests` — accessible when needed
- Single rollback command: `git restore -- vitest.config.ts`
