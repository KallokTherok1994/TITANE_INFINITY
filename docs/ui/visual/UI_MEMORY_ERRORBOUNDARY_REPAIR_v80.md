# UI MEMORY ErrorBoundary Repair v80

Date: 2026-05-11
Mode: DURABLE

## Scope
- Route: /memory
- File: e2e/production/ui-production-full-visual-capture.spec.ts

## Symptom
- Previous v80 debug run could classify /memory as BROKEN due to heuristic error detection.

## Root Cause
- ErrorBoundary detection relied on broad text heuristics and could produce false positives.

## Fix Applied
- Detection logic now checks visible `[data-testid="titane-error-boundary"]` instead of generic text fragments.
- Route diagnostics were enriched (console/page errors + blocker reason) to keep classification explicit.

## Verification
- `pnpm exec playwright test e2e/production/ui-production-full-visual-capture.spec.ts --project chromium --workers=1` -> PASS
- v80 artifact shows /memory as VISUAL_ACTIVE.
- `pnpm run verify:ui-visual-capture` on v80 artifact -> PASS (0 broken routes).

## Rollback
- `git restore -- e2e/production/ui-production-full-visual-capture.spec.ts`
