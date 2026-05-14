# Runtime Browser Fallback Normalization — 2026-05-14

Verdict: PASS

Scope:
- `src/features/system-center/hooks/useSystemDiagnostics.ts`
- `src/pages/ConfigurationHub.tsx`
- `src/modules/optimization/WebAssemblyCompute.ts`

Symptoms closed:
- `/dev?tab=diagnostics` logged `Format de diagnostic inattendu` on browser fallback.
- `admin-config` / `page-configuration-hub` logged `Runtime config invalide`, then `Snapshot chat_engine manquant`, then `IPC response missing ok field` under partial browser payloads.
- `/optimization` and `dev-operations` surfaced `WebAssemblyCompute Initialization failed` as `console.error` despite expected JS fallback.

Applied fix:
- Normalize `tauriProtector` diagnostics fallback into a visible `Degraded` diagnostics payload.
- Keep `ConfigurationHub` operational with `runtime: null`, missing/partial `chat_engine`, direct payloads, and browser fallback shapes for chat-engine bootstrap calls.
- Reclassify WASM compilation failure as an expected warning while preserving JS execution fallback.

Executable proof:
- `pnpm vitest run src/features/system-center/hooks/__tests__/useSystemDiagnostics.test.ts src/pages/__tests__/ConfigurationHub.runtimeConfig.test.ts src/__tests__/pages/ConfigurationHub.test.tsx src/modules/optimization/__tests__/WebAssemblyCompute.test.ts` → `Test Files 4 passed`, `Tests 13 passed`.
- `pnpm exec playwright test e2e/critical/ui-prod-capture-v34_0_6.spec.ts --grep 'capture admin-config|capture dev-diagnostics|capture dev-operations|capture optimization' --reporter=line` → `4 passed (19.0s)`.
- `pnpm verify:registry` → `registry-integrity: PASS`, `registry-quality: PASS`.
- `bash scripts/autoheal/detect_recurrence.sh` → `PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX`, `PASS: G_AH_RECURRENCE_GUARD_PASS`.
- `bash scripts/verify_instructions.sh` → `SUMMARY: PASS=52 FAIL=0`.

Rollback:
- `git restore -- src/features/system-center/hooks/useSystemDiagnostics.ts src/features/system-center/hooks/__tests__/useSystemDiagnostics.test.ts src/pages/ConfigurationHub.tsx src/pages/__tests__/ConfigurationHub.runtimeConfig.test.ts src/__tests__/pages/ConfigurationHub.test.tsx src/modules/optimization/WebAssemblyCompute.ts src/modules/optimization/__tests__/WebAssemblyCompute.test.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/runtime-browser-fallback-normalization-2026-05-14.md proof_packs/RUNTIME_BROWSER_FALLBACK_NORMALIZATION_2026-05-14_v35_1_5`