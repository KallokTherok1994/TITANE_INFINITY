# 19_ROLLBACK

## This Session (registry/doc only)
```bash
git restore -- registry/ui-events.jsonl registry/proofpack-index.jsonl CHANGELOG.md
```

## Full TWINS Fusion Rollback (prior session)
```bash
git restore -- src/pages/TitanePage.tsx src/App.tsx scripts/autoheal/autoheal_rules.jsonl
```

## Combined Full Rollback (this + prior)
```bash
git restore -- registry/ui-events.jsonl registry/proofpack-index.jsonl CHANGELOG.md src/pages/TitanePage.tsx src/App.tsx scripts/autoheal/autoheal_rules.jsonl
```

## Estimated Rollback Time: < 1 minute
## Risk: LOW (registry append + 2 source files)
