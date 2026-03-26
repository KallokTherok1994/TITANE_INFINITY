# 10_ROLLBACK
- Timestamp UTC: 2026-03-04T23:42:00Z

## Rollback ciblé E2E ULTRA (non destructif)
```bash
git restore -- e2e/desktop/ui-driver.wdio.js \
	e2e/desktop/ui-ultra-smoke.e2e.js \
	e2e/desktop/ui-ultra-full.e2e.js \
	scripts/autoheal/autoheal_rules.jsonl

git clean -fd -- e2e/desktop/page-objects \
	docs/tests/UI_COVERAGE_MAP.md \
	proof_packs/UI_E2E_ULTRA_2026-03-04_1809_2555e61a8
```

## Rollback docs/reports global (si nécessaire)
```bash
git restore -- docs reports proof_packs
```
