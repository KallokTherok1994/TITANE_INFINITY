# 12_PERFORMANCE_METRICS.md

Date (UTC): 2026-02-26

## Métriques disponibles
- Suite frontend `pnpm test`:
	- Durée totale observée: `142.87s`
	- Fichiers tests: `203 passed` / `7 skipped`
	- Tests: `3216 passed` / `68 skipped`

## Métriques requises par prompt (état)
- Offline latency: **BLOCKED** (non mesurée dans ce run)
- Online latency: **BLOCKED**
- DB write latency: **BLOCKED**
- Snapshot latency: **BLOCKED**
- Search latency: **BLOCKED**
- Breaker trigger timing: **BLOCKED**

## Cause du blocage
- Exécution runtime x3 non stabilisée dans ce run à cause de contention `cargo`/verrou build.

