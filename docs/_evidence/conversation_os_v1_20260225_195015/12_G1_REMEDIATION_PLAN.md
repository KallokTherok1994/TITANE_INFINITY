# 12_G1_REMEDIATION_PLAN.md

## Objectif
Lever le blocage `G1 FRONTEND_NO_WEB` en mode strict global, sans casser le flux Conversation OS v1 qualifié.

## État de départ (2026-02-26)
- Global `src/**`: FAIL (surfaces legacy avec `fetch/WebSocket`).
- Périmètre Conversation OS v1 (client canonique `conversation_generate`): PASS audit ciblé.
- SearchGateway credentials: corrigé (`CREDENTIALS_MISSING` explicite).

## Ring / statut
- Ring principal: **Ring 4 (Modules/UI)**
- Ring secondaire: **Ring 3 (Services)**
- Statut: **EXPERIMENTAL** (plan), transition cible: **QUALIFIED**

## Stratégie minimale en 3 phases

### Phase 1 — Inventaire gouverné (append-only)
1. Produire un inventaire exhaustif des appels réseau frontend:
   - commande type: `rg -n "fetch\(|axios\(|XMLHttpRequest|WebSocket" src`
2. Classer chaque match en:
   - `IN_SCOPE_CONVOS_V1`
   - `LEGACY_HORS_SCOPE`
   - `TEST_ONLY`
3. Publier l’inventaire daté dans `reports/` + addendum pack.

Critère PASS phase 1:
- 100% des matches classés et tracés.

### Phase 2 — Neutralisation contrôlée des surfaces hors scope
1. Pour chaque entrée `LEGACY_HORS_SCOPE` active en runtime:
   - soit rerouter vers client IPC canonique,
   - soit désactiver derrière feature flag OFF par défaut,
   - soit déplacer hors runtime de production (test/dev only).
2. Interdiction d’ajouter de nouvelles surfaces réseau directes.

Critère PASS phase 2:
- zéro appel direct réseau dans `src/**` runtime actif.

### Phase 3 — Gate G1 global x3
1. Exécuter scan global G1 x3 avec logs horodatés dans `reports/`.
2. Exiger `EXIT:1` (aucun match) sur les 3 itérations.
3. Mettre à jour `07_GATES_STATUS.md`, `08_TEST_RUNS_X3.md`, `10_VERDICT.md`.

Critère PASS phase 3:
- G1 global strict = PASS x3.

## Commandes de preuve proposées
- `LOG=reports/conversation_os_g1_global_scan_x3.log`
- `for i in 1 2 3; do rg -n "fetch\(|axios\(|XMLHttpRequest|WebSocket" src >> "$LOG" 2>&1; echo "G1_GLOBAL_EXIT_$i:$?" >> "$LOG"; done`

## Risques
- Régression de fonctionnalités legacy dépendantes de transports réseau directs.
- Faux positifs dans des fichiers purement test/doc si le périmètre n’est pas filtré.

## Mitigation
- Valider les flux chat critiques via Playwright (`e2e/critical`) après chaque lot.
- Patchs atomiques et réversibles, avec rollback git explicite.
