# Integration Discovery Classification

## Observation
- Integration tests exist under `tests/integration/**`.
- `vitest.integration.config.ts` originally had `include: []` and `exclude: ['tests/**/*']`, causing "No test files found".

## Classification
- CASE 1: tests exist but Vitest config doesn't match (discovery blocked).

## Attempt 1 Result
- After enabling `include` + removing `tests/**/*` from exclude, tests are discovered.
- Current failure is **coverage thresholds** (70% global) with broad suite executed.
