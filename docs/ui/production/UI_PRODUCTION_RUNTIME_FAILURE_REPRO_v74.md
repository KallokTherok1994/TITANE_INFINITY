# UI_PRODUCTION_RUNTIME_FAILURE_REPRO_v74

Date: 2026-05-11
Mode: DURABLE

## Commands Executed
1. pnpm run verify:ui-surface-registry
2. pnpm run build
3. pnpm exec playwright test e2e/production/ui-production-route-proof.spec.ts --project chromium --workers=1
4. pnpm run verify:ui-production-route-proof
5. pnpm vitest run tests/contract/tauri-ipc-contract.test.ts
6. Artifact summary script over artifacts/ui-production/v73-production-route-proof.jsonl

## Results
- route proof (Playwright): PASS (spec executes and emits artifact records)
- route proof verifier: FAIL
  - missing truth badge/disclosure on priority routes:
    - /titane
    - /time
    - /admin
    - /dev
    - /fusion
    - /twins
    - /optimization
    - /total-dev
- IPC contract: PASS (42/42)
- verify:ui-surface-registry: PASS
- build: PASS

## Artifact Metrics (v73 proof file)
- total records: 35
- missing truth badge count: 35
- status distribution:
  - PROD_ROUTE_DEGRADED_WITH_UI_PROOF: 29
  - PROD_ROUTE_LEGACY_REDIRECT_CONFIRMED: 6
- broken count: 0 (no PROD_ROUTE_BROKEN entry observed)
- stale count: 0 (no PROD_STALE_BUNDLE entry observed in this artifact)
- unknown count: 0 (no UNKNOWN entry observed in this artifact)

## Root Cause Hypothesis
- The route-proof spec can navigate/observe route outcomes, but the verifier enforces priority truth badge/disclosure presence not satisfied by runtime DOM evidence.
- Likely mismatch family:
  - selector mismatch between verifier expectations and rendered components;
  - disclosure rendered via alternate component/testid not recognized by verifier;
  - runtime timing/hydration race where check occurs before badge/disclosure is attached.
- Secondary drift context: production bundle still contains legacy version strings in some assets, increasing risk of production-visible drift and disclosure inconsistency.
