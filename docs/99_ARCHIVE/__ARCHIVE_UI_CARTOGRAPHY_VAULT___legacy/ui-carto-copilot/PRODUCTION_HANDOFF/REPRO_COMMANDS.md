# REPRO_COMMANDS

Date (UTC): 2026-02-08

## Read-only checks
- cat docs/ui-carto-copilot/DELTA_GATE_SUMMARY.md
- cat docs/ui-carto-copilot/DELTA_REPORT.md
- cat docs/ui-carto-copilot/DELTA_ISSUES.md
- cat docs/ui-carto-copilot/VERDICT.md
- cat docs/ui-carto-copilot/VERIFICATION/DOC_DELTA_CLOSURE_PROOF.md

## Delta outputs (read-only)
- ls -la docs/ui-carto-copilot/VERIFICATION/DELTA_*.md

## Optional verification (if scripts exist)
- pnpm run lint
- pnpm run typecheck
- pnpm test
- pnpm run test
- pnpm run test:e2e
