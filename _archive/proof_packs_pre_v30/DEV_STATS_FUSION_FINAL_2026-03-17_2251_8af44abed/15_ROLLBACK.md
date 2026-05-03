# ROLLBACK

## Rollback command
```bash
git restore -- src/App.tsx e2e/desktop/page-objects/uiPages.po.js e2e/critical/engine-navigation.spec.ts
```

## What gets restored
- `src/App.tsx`: STATS nav item re-added; dead Stats lazy import re-added
- `e2e/desktop/page-objects/uiPages.po.js`: uiPages.stats re-added to topLevelPageOrder
- `e2e/critical/engine-navigation.spec.ts`: nav-dev reverted to nav-stats; /dev URL reverted to /stats

## Risk: LOW
No new code added. Pure deletion + redirect fixes. Fully reversible.
