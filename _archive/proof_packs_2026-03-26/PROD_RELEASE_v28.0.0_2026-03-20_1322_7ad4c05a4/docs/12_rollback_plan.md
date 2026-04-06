# Rollback Plan

status: READY

steps:
1. Revert chunking change in `vite.config.ts`.
2. Rebuild production artifacts with token-gated command.
3. Republish `deployment/latest` metadata from rollback artifacts.
4. Re-run smoke to confirm previous behavior baseline.

commands:
- `git checkout -- vite.config.ts`
- `GO_FOR_PROD_BUILD__TITANE_INFINITY=GO_FOR_PROD_BUILD__TITANE_INFINITY GO_FOR_PROD_DEPLOY__TITANE_INFINITY=GO_FOR_PROD_DEPLOY__TITANE_INFINITY corepack pnpm run build:production`
