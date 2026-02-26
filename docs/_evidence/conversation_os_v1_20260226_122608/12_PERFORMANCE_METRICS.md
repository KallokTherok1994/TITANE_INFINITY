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
- Exécution runtime x3 désormais stabilisée (logs addendum PASS), mais les métriques de latence demandées n'ont pas encore été instrumentées/capturées explicitement.

## Preuves runtime x3 disponibles
- `reports/conversation_os_v1_next_run_runtime_x3_bg_20260226T124119Z.log`
- `reports/conversation_os_v1_next_run_runtime_x3_addendum_bg_20260226T124237Z.log`

