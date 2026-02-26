# 09_PERF_METRICS.md

Date (UTC): 2026-02-26

## Métriques légères observées

## Search latency
- Mode credentials manquants: retour immédiat (classification locale `CREDENTIALS_MISSING`, sans I/O externe).
- Mode 429 simulé test-only: retour immédiat `RATE_LIMIT` (sans appel réel).

## Snapshot latency
- Snapshot créé dans le même cycle de persistance `conversation_generate`.
- Mesure indirecte: tests unitaires ciblés passent sans timeout (x3).

## DB write latency (events/snapshots/failures)
- Chemin validé via tests ciblés de persistance:
	- insertion `events`
	- insertion `sources`
	- insertion `snapshots`
	- insertion `failures`
- Exécutions répétées x3 sans erreur (`EXIT=0`).

## Artefacts
- `reports/pack5_gate_core_x3_20260226T140209Z.log`
- `reports/pack5_failure_matrix_x3_20260226T140428Z.log`

## Gate
- `G_PACK5_PERF_RECORDED`: **PASS**.
