# Rollback Plan

If rollback is required, run:

1. git restore -- src/pages/DevPage.tsx src/pages/devPage.formatters.ts src/__tests__/devPage.formatters.test.ts
2. git restore -- e2e/production/ui-production-full-visual-capture.spec.ts scripts/verify/verify-ui-visual-capture.mjs
3. git restore -- e2e/desktop/ui-desktop-agent-overlay-contract.wdio.test.js e2e/desktop/ui-desktop-action-sync-matrix.wdio.test.js e2e/desktop/ui-desktop-installed-full-visual-capture.wdio.test.js
4. git restore -- docs/ui/visual/UI_DEV_ROOT_SELECTOR_REPAIR_v80.md docs/ui/visual/UI_MEMORY_ERRORBOUNDARY_REPAIR_v80.md docs/ui/visual/UI_DESKTOP_TEST_GAP_REPAIR_v80.md docs/ui/visual/UI_V78_LEFTOVER_FILE_CLASSIFICATION_v80.md
5. git restore -- proof_packs/UI_VISUAL_BROKEN_ROUTES_DESKTOP_GAPS_v80
6. rm -rf artifacts/ui-visual/screenshots/v80 artifacts/ui-visual/v80-production-visual-capture.jsonl artifacts/ui-visual/v80-desktop-test-gap-results.jsonl artifacts/ui-visual/v80-wdio-*.log
