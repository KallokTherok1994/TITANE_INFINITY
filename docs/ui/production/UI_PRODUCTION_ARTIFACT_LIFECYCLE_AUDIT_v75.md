# UI_PRODUCTION_ARTIFACT_LIFECYCLE_AUDIT_v75

Date: 2026-05-11

## Objective
Validate whether v74 proof execution mutated sealed v73 artifact, and enforce non-destructive lifecycle policy.

## Audit Findings
1. `artifacts/ui-production/v73-production-route-proof.jsonl` existed as sealed historical artifact.
2. Previous production-route proof path was hardcoded to v73 in:
   - `e2e/production/ui-production-route-proof.spec.ts`
   - `scripts/verify/verify-ui-production-route-proof.mjs`
3. Consequence: newer proof runs could overwrite sealed v73 artifact.

## v75 Lifecycle Repairs
- Introduced env-driven output path with dedicated default current target:
  - `DEFAULT_ARTIFACT_RELATIVE_PATH = 'artifacts/ui-production/current-production-route-proof.jsonl'`
  - Override variable: `TITANE_UI_PRODUCTION_ARTIFACT`
- Applied in both producer and verifier:
  - `e2e/production/ui-production-route-proof.spec.ts`
  - `scripts/verify/verify-ui-production-route-proof.mjs`

## Proof After Repair
- Dedicated v74 artifact generation and verification:
  - `TITANE_UI_PRODUCTION_ARTIFACT=artifacts/ui-production/v74-production-route-proof.jsonl pnpm exec playwright test e2e/production/ui-production-route-proof.spec.ts --project chromium --workers=1` => PASS
  - `TITANE_UI_PRODUCTION_ARTIFACT=artifacts/ui-production/v74-production-route-proof.jsonl pnpm run verify:ui-production-route-proof` => PASS
- Default current lifecycle generation and verification:
  - `pnpm exec playwright test e2e/production/ui-production-route-proof.spec.ts --project chromium --workers=1` => PASS
  - `pnpm run verify:ui-production-route-proof` => PASS

## Lifecycle Policy v75
- Sealed artifacts (e.g., v73) are immutable historical evidence.
- Active proof runs must target either:
  - `artifacts/ui-production/current-production-route-proof.jsonl` (default), or
  - explicit versioned artifact via `TITANE_UI_PRODUCTION_ARTIFACT`.

## Lifecycle Verdict
- `LIFECYCLE_FIXED_NO_OVERWRITE_ON_SEALED_PATH`
