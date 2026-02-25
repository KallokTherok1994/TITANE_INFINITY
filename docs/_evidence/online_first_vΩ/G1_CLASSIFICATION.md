# G1 CLASSIFICATION — ONLINE-FIRST vΩ

## Gate G1 — Classification complète des références OFFLINE/REMOTE/network

| File | Line | Snippet | Classe | Risque | Action proposée |
|------|------|---------|--------|--------|----------------|
| `src/types/providerMeta.ts` | 3 | `Mode = 'LOCAL' \| 'REMOTE' \| 'OFFLINE'` | RUNTIME_BACKEND | P1 | Ajouter guards d'invariant |
| `src/types/providerMeta.ts` | 31 | `network_used_attempt: boolean` | RUNTIME_BACKEND | P1 | Couvert par Truth Contract |
| `src/types/providerMeta.ts` | 43 | `network_used: boolean` | RUNTIME_BACKEND | P1 | Couvert par Truth Contract |
| `src/services/conversationEngine.ts` | 291 | `mode: 'REMOTE' as Mode` | RUNTIME_BACKEND | **P0** | **BUG: mode=REMOTE avec network_used=false → corriger en LOCAL** |
| `src/services/conversationEngine.ts` | 297 | `network_used: false` | RUNTIME_BACKEND | **P0** | Confirmé violation NO_LYING |
| `src/services/conversationEngine.ts` | 307 | `mode: 'REMOTE' as Mode` (decision) | RUNTIME_BACKEND | **P0** | **BUG: OnlineDecision.mode=REMOTE mais networkUsed=false** |
| `src/hooks/useConversationEngine.ts` | 312 | `else if (mode === 'REMOTE')` | RUNTIME_FRONTEND | P1 | Ajouter guard NO_LYING_VIOLATION_FRONTEND |
| `src/config/offline-first.ts` | 2 | `OFFLINE FIRST CONFIG` | CONFIG | P2 | Doc-only (config offline-first valide) |
| `src/services/ai/providers/titaneLocal.ts` | 255 | `local_only: boolean` | RUNTIME_BACKEND | P2 | OK: local_only correct pour provider local |
| `src/services/ai/providers/titaneLocal.ts` | 365 | `local_only: true` | RUNTIME_BACKEND | P2 | OK: correct |
| `src/utils/cloudAPIConfirmation.ts` | 14 | `import offline-first` | RUNTIME_FRONTEND | P2 | OK: import config |
| `src/utils/tauriProtector.ts` | 567 | `Backend offline - using local AI fallback` | RUNTIME_FRONTEND | P2 | OK: fallback explicite |
| `src/services/ai/orchestrator.ts` | 340 | `status: 'offline'` | RUNTIME_BACKEND | P2 | OK: marquage provisoire valid |
| `src/services/adminEngine/stateAggregator.ts` | 352 | `offline: 'OFFLINE'` | RUNTIME_BACKEND | P2 | OK: status d'agrégation |
| `src/__tests__/omega-provider-tests.test.ts` | 503-572 | `COMPLETE OFFLINE MODE` | TEST | P2 | OK: tests existants valides |
| `scripts/` | various | diagnostic/canary scripts | SCRIPT/CI | P2 | OK: monitoring scripts |

## P0 Violations identifiées (à corriger)

### V1 — conversationEngine.ts:291 — mode=REMOTE avec network_used=false
**Fichier**: `src/services/conversationEngine.ts`
**Lignes**: 291, 297
**Problème**: Quand `externalAllowed=false`, le meta retourne `mode: 'REMOTE'` mais `network_used: false`.
**Invariant violé**: `mode==='REMOTE' => network_used===true`
**Correction**: Utiliser `mode: 'LOCAL'` dans ce cas (provider est `local_only`, aucun réseau utilisé).

### V2 — conversationEngine.ts:307 — OnlineDecision.mode=REMOTE avec networkUsed=false
**Fichier**: `src/services/conversationEngine.ts`
**Ligne**: 307
**Problème**: `decision.mode: 'REMOTE'` mais `decision.networkUsed: false`
**Correction**: Utiliser `mode: 'LOCAL'`

## Gate G1: PASS
Classification complète. 2 violations P0 identifiées, actions minimales définies.
