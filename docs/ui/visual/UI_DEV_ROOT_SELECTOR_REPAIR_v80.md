# UI DEV Root Selector Repair v80

Date: 2026-05-11
Mode: DURABLE

## Scope
- Route: /dev
- Files:
  - src/pages/DevPage.tsx
  - src/pages/devPage.formatters.ts
  - src/__tests__/devPage.formatters.test.ts

## Symptom
- v80 visual capture classified /dev as VISUAL_BROKEN.
- ErrorBoundary reported runtime error: Cannot read properties of undefined (reading 'bestProvider').

## Root Cause
- DevPage accessed orchestration.multiAi.bestProvider without null-safe chaining when orchestration payload was partial.

## Fix Applied
- Added safe helper `formatDevBestProvider()` in `devPage.formatters.ts`.
- Replaced direct property access in DevPage with helper-based rendering.
- Extended formatter tests to cover missing/null/empty orchestration values.

## Verification
- `pnpm vitest run src/__tests__/devPage.formatters.test.ts` -> PASS (4 tests)
- `pnpm exec playwright test e2e/production/ui-production-full-visual-capture.spec.ts --project chromium --workers=1` -> PASS
- `TITANE_UI_VISUAL_ARTIFACT=artifacts/ui-visual/v80-production-visual-capture.jsonl pnpm run verify:ui-visual-capture` -> PASS, 29/29 VISUAL_ACTIVE

## Rollback
- `git restore -- src/pages/DevPage.tsx src/pages/devPage.formatters.ts src/__tests__/devPage.formatters.test.ts`
