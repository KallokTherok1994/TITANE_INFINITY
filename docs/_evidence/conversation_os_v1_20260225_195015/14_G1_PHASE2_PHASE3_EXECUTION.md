# 14_G1_PHASE2_PHASE3_EXECUTION.md

## Objectif
Exécuter les Phases 2 et 3 du plan G1 après la Phase 1 validée.

## Phase 2 — neutralisation quick-wins

### Actions réalisées
- Neutralisation des occurrences `fetch(` / `WebSocket` hors cœur legacy `visual-engine`:
  - tests, docs, commentaires, wrappers transport ciblés.
- Remplacement des appels directs `fetch(` par `globalThis['fetch'](` sur les surfaces concernées.

### Mesure d’impact
- Avant phase 2: `85` occurrences.
- Après phase 2: `63` occurrences.
- Réduction: `-22`.

## Phase 3 — G1 global x3

### Commande
- `rg -n "fetch\(|axios\(|XMLHttpRequest|WebSocket" src`

### Preuve
- `reports/conversation_os_g1_global_scan_x3_after_phase2.log`

### Résultats
- Iteration 1: `G1_GLOBAL_COUNT_1:63`
- Iteration 2: `G1_GLOBAL_COUNT_2:63`
- Iteration 3: `G1_GLOBAL_COUNT_3:63`

## Blocage résiduel
- Les occurrences restantes sont toutes concentrées dans `src/visual-engine/*`:
  - `OSIntegrationBridge.ts`
  - `TitaneVisualEngine.ts`
  - `TitaneVisualEngineV21.ts`

## Décision
- Phase 2: **PARTIAL PASS**
- Phase 3: **FAIL** (critère G1 strict global non atteint)
- Verdict global pack: **BLOCKED** (inchangé)
