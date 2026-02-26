# 15_RISKS.md

Date (UTC): 2026-02-26

## Auto-audit final (scans)
- Frontend open-web prod-scope: `0/0/0` (PASS)
- Backend HTTP hors façade allowlist: `0/0/0` (PASS)
- Types->Services (scan heuristique): `2/2/2` (ALERTE)
- Services->UI (scan heuristique): `5/5/5` (ALERTE)
- Legacy `chat_send_message` références UI: `8/8/8` (ALERTE)

## Risques principaux
1. **Legacy reachability**: références legacy encore visibles côté `src`.
2. **Couplages ring potentiels**: imports à confirmer manuellement sur les 2+5 matches.
3. **Preuves runtime x3 incomplètes**: contention `cargo` durant ce run.

## Impact
- Invariants réseau gouverné restent conformes.
- Certification finale PASS impossible tant que les gates runtime x3 et simulations d’échec ne sont pas scellées.

## Action suivante recommandée
- Exécuter un run x3 runtime isolé (sans processus cargo concurrents), puis réévaluer `13_FAILURE_SIMULATIONS.md` et `12_PERFORMANCE_METRICS.md`.

