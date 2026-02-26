# 13_G1_PHASE1_INVENTORY.md

## Scope
Phase 1 du plan `12_G1_REMEDIATION_PLAN.md`: inventaire exhaustif + classification des primitives réseau frontend.

## Commande de base
- `rg -n "fetch\(|axios\(|XMLHttpRequest|WebSocket" src`

## Artifacts produits
- Brut: `reports/conversation_os_g1_phase1_raw_20260226T010320Z.log`
- Résumé: `reports/conversation_os_g1_phase1_summary_20260226T010320Z.md`
- Classification exhaustive (ligne par ligne): `reports/conversation_os_g1_phase1_classification_20260226T010330Z.csv`

## Règles de classification
- `IN_SCOPE_CONVOS_V1`: uniquement les 4 fichiers canoniques du flux `conversation_generate`:
  - `src/services/tauriBridge.ts`
  - `src/services/api/chat.ts`
  - `src/services/ai/providers/tauriChat.ts`
  - `src/services/tauri/chatEngine.commands.ts`
- `TEST_ONLY`: chemins de tests/mocks/playwright/vitest ou suffixes `*.test.*` / `*.spec.*`.
- `LEGACY_HORS_SCOPE`: tout le reste dans `src/**`.

## Résultats
- Total matches: **85**
- IN_SCOPE_CONVOS_V1: **0**
- TEST_ONLY: **7**
- LEGACY_HORS_SCOPE: **78**

## Lecture
- Le sous-scope Conversation OS v1 reste propre sur G1 (aucune primitive réseau directe détectée).
- Le blocage G1 global est confirmé et quantifié (78 occurrences runtime hors scope).

## Top legacy files (fréquence)
- `src/visual-engine/TitaneVisualEngineV21.ts` → 25
- `src/visual-engine/TitaneVisualEngine.ts` → 25
- `src/visual-engine/OSIntegrationBridge.ts` → 13
- `src/services/tts/parlerTTSBridge.ts` → 3
- `src/lib/ipc.ts` → 3
- `src/services/ai/providers/glm46v.ts` → 2
- `src/core/http/httpClient.ts` → 2

## Décision Phase 1
- **PASS (inventaire + classification exhaustive effectués)**
- Prochaine étape obligatoire: Phase 2 neutralisation contrôlée des surfaces `LEGACY_HORS_SCOPE`.
