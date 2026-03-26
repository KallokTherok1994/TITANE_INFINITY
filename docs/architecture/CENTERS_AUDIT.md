# CENTERS_AUDIT
**TITANE∞ — Cartographie des surfaces concurrentes**
**Date**: 2026-03-26
**Phase**: PHASE 2 — SURFACES CONCURRENTES
**Verdict**: QUALIFIED

---

## Méthodologie

Audit des centres de premier rang visibles: features/, pages/, services/ racine (doublons), modules concurrents.
Classification: `KEEP_CORE` | `ALIAS_COMPAT` | `LABS` | `HIDE_DEV` | `DELETE_CANDIDATE`

---

## Centres de premier rang — Chat

| Surface | Rôle réel | Statut actuel | Décision | Preuve | Risque | Rollback |
|---------|-----------|---------------|----------|--------|--------|----------|
| `src/features/chat/` | Chat UI principal (composants, hooks, export) | Actif | **KEEP_CORE** | Importé dans ChatPage.tsx | P0 | Aucun move |
| `src/features/conversation/` | Couche de compatibilité sur features/chat (ChatMessage, ChatContextPanel, ChatProviderSelector, TypingIndicator) | Actif | **ALIAS_COMPAT** | ProviderStatusPanel.tsx re-exporte depuis features/chat. Migration P2 différée — nécessite mise à jour imports entrants (ChatPage, ConversationSection, Chat) + tsc + vitest gate. | P1 | Ne pas supprimer avant migration P2 complète |
| `src/pages/ChatPage.tsx` | Page route /chat (route canonique) | Actif | **KEEP_CORE** | Exportée dans pages/index.ts, route principale | P0 | Aucun move |
| `src/pages/TitanePage.tsx` | Page principale /titane (hub) | Actif | **KEEP_CORE** | Route par défaut selon App.tsx | P0 | Aucun move |
| `src/components/ChatWindow.tsx` | Composant chat legacy ? | Actif (à vérifier usage) | **ALIAS_COMPAT** | Présent à la racine components/ — peut être absorbé dans features/chat | P1 | Ne pas supprimer avant grep imports |

---

## Centres de premier rang — Mémoire

| Surface | Rôle réel | Statut actuel | Décision | Preuve | Risque | Rollback |
|---------|-----------|---------------|----------|--------|--------|----------|
| `src/features/memory/` | Memory UI viewer (MemorySearchPanel, MemoryTreeViewer) | Actif | **KEEP_CORE** | Pages Memory.tsx, route /memory | P1 | Aucun move |
| `src/services/unified/` | UnifiedMemory service canonical (SQLite, vector, embedding) | Actif | **KEEP_CORE** | Importé par chatMemorySingleDoor.ts | P0 | Aucun move |
| `src/services/chat/chatMemorySingleDoor.ts` | Porte unique mémoire chat | Actif | **KEEP_CORE** | Importé directement par conversationEngine.ts | P0 | Aucun move |
| `src/services/chatMemory.ts` | Mémoire chat v1 (legacy ?) | Actif (à vérifier) | **ALIAS_COMPAT** | Présent mais rôle vs chatMemorySingleDoor non clarifié | P1 | Phase 5 tranche |
| `src/services/chatMemoryCompactor.ts` | Compacteur mémoire | Actif | **KEEP_CORE** | Compaction utile au Memory OS | P1 | Phase 5 tranche |
| `src/services/memory/` (8 fichiers) | Memory intelligence + bridge + utils | Actif (dont 1 NEW non committé) | **KEEP_CORE** (à confirmer Phase 5) | MemoryIntelligenceEngine.ts non committé — scope à clarifier | P1 | Phase 5 tranche |
| `src/pages/Memory.tsx` | Page /memory | Actif | **KEEP_CORE** | Route /memory dans App.tsx | P1 | Aucun move |

---

## Centres de premier rang — Settings / Admin

| Surface | Rôle réel | Statut actuel | Décision | Preuve | Risque | Rollback |
|---------|-----------|---------------|----------|--------|--------|----------|
| `src/features/design-center/` | Thèmes, apparence, design system | Actif | **KEEP_CORE** | Route /design-center | P2 | Aucun move |
| `src/features/system-center/` | Diagnostics, DevTools, HyperVision, NodeCluster | Actif | **KEEP_CORE** | Route /system-center (absorbe diagnostics, devtools, cluster) | P1 | Aucun move |
| `src/features/admin/` | Admin UI | Actif | **KEEP_CORE** | Route /admin | P2 | Aucun move |
| `src/features/governance-center/` | Governance, permissions, policies, security log | Actif | **KEEP_CORE** | Route /governance-center | P1 | Aucun move |
| `src/pages/Settings.tsx` | Page /settings | Actif | **ALIAS_COMPAT** | /settings redirige vers /design-center (à vérifier) | P2 | Ne pas supprimer |
| `src/pages/SecureSettings.tsx` | Page settings sécurisées | Actif | **KEEP_CORE** | Route /secure | P2 | Aucun move |
| `src/pages/ConfigurationHub.tsx` | Hub configuration | Actif (statut à vérifier) | **ALIAS_COMPAT** | Doublon potentiel avec system-center | P2 | Phase 3 tranche |

---

## Centres de premier rang — Dev / Diagnostics

| Surface | Rôle réel | Statut actuel | Décision | Preuve | Risque | Rollback |
|---------|-----------|---------------|----------|--------|--------|----------|
| `src/features/developer-mode/` | Developer mode page | Actif | **HIDE_DEV** | Route /dev — visible uniquement en dev mode | P2 | Aucun move |
| `src/features/qa-monitoring/` | QA monitoring | Actif | **HIDE_DEV** | Usage interne QA | P2 | Aucun move |
| `src/features/production-health/` | Production health panel | Actif | **HIDE_DEV** | Monitoring production | P2 | Aucun move |
| `src/pages/DevPage.tsx` | /dev | Actif | **HIDE_DEV** | Route /dev | P2 | Aucun move |
| `src/pages/TotalDevPage.tsx` | /total-dev | Actif | **HIDE_DEV** | Route /total-dev — dev only | P2 | Aucun move |
| `src/pages/DevTools.tsx` | DevTools page legacy | Actif | **ALIAS_COMPAT** | system-center/DevTools absorbe probablement ce rôle | P2 | Audit import avant touch |
| `src/dev/` | Dev utilities racine | Actif | **HIDE_DEV** | Non exposé en production | P2 | Aucun move |

---

## Centres de premier rang — Singularity (doublons)

| Surface | Rôle réel | Statut actuel | Décision | Preuve | Risque | Rollback |
|---------|-----------|---------------|----------|--------|--------|----------|
| `src/services/singularityBridge.ts` | Singularity bridge v1 | **SEUL IMPORTÉ** | **KEEP_CORE** | Importé dans useSingularityStore.ts (seul point d'entrée prouvé) | P1 | Aucun move |
| `src/services/singularityBridgeVInfinity.ts` | Singularity bridge v∞ | **AUCUN IMPORT PROUVÉ** | **ALIAS_COMPAT → LABS** | `grep` ne trouve aucun import actif | P1 | Ne pas supprimer sans audit complet |
| `src/services/singularityConnections.ts` | Connexions singularity | **AUCUN IMPORT PROUVÉ** | **ALIAS_COMPAT → LABS** | `grep` ne trouve aucun import actif | P1 | Ne pas supprimer sans audit complet |

**Note**: singularityBridgeVInfinity.ts et singularityConnections.ts semblent orphelins. Vérification complémentaire requise (grep étendu) avant tout DELETE.

---

## Centres de premier rang — Labs / Expérimental

| Surface | Rôle réel | Statut actuel | Décision | Preuve | Risque | Rollback |
|---------|-----------|---------------|----------|--------|--------|----------|
| `src/features/vision/` | Vision ML (détection, métriques) | Actif | **LABS** | Pas de proof runtime, dépend de modules ML optionnels | P1 | Ne pas supprimer |
| `src/features/audio-center/` | Audio center | Actif | **LABS** (si non prouvé runtime principal) | Fonctionnalité audio optionnelle | P1 | Phase 4 tranche |
| `src/features/transformation/` | Transformation roadmap | Actif | **LABS** | Module expérimental | P2 | Aucun move |
| `src/pages/CameraPage.tsx` | /camera | Actif | **LABS** | Lié à vision ML | P1 | Aucun move |
| `src/quantum/` | Quantum center | Actif | **LABS** | Non prouvé runtime | P2 | Aucun move |
| `src/particles/` | Quantum particles | Actif (UI) | **LABS** | Visuel non-core | P2 | Aucun move |

---

## Archive / Legacy

| Surface | Rôle réel | Statut actuel | Décision | Preuve | Risque | Rollback |
|---------|-----------|---------------|----------|--------|--------|----------|
| `src/_deprecated/` | Code déprécié | Existant | **DELETE_CANDIDATE** | Dossier _deprecated = non utilisé par définition | P2 | Audit imports avant suppression |

---

## Cibles prioritaires de premier rang (actions immédiates possibles)

1. **singularityBridgeVInfinity.ts + singularityConnections.ts**: aucun import prouvé → LABS candidats à l'isolement (Phase 6)
2. **features/conversation/ vs features/chat/**: doublon partiel → audit overlap (Phase 3/6)
3. **src/_deprecated/**: archive → DELETE_CANDIDATE (avec preuve préalable d'inutilité)
4. **ChatWindow.tsx racine components/**: à vérifier si absorbé par features/chat

---

## Résumé décisions

| Décision | Count | Exemples |
|----------|-------|---------|
| KEEP_CORE | 16 | chat, memory/unified, OMEGA, conversationEngine, governance, system-center |
| ALIAS_COMPAT | 8 | features/conversation, singularityBridgeV∞, singularityConnections, Settings.tsx, ConfigurationHub |
| LABS | 6 | vision, audio-center, transformation, quantum, particles, camera |
| HIDE_DEV | 6 | developer-mode, qa-monitoring, DevPage, TotalDevPage, dev/ |
| DELETE_CANDIDATE | 1 | src/_deprecated/ (preuve d'inutilité requise) |

---

## Verdict

```
PHASE 2: QUALIFIED
- Centres visibles: cartographiés
- Alias/doublons principaux: nommés
- Cibles de premier rang proposées: singularityBridgeV∞, features/conversation overlap, _deprecated
- Prochaine action: PHASE 3 — APP.TSX SHELL MINCE
```
