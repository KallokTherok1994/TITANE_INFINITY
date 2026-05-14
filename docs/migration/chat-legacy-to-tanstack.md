# Chat Legacy → TanStack Query Migration Map (v35.1.0)

**Date** : 2026-05-14
**Phase** : C.1 audit (Sprint C — consumer migration)
**Mode** : DURABLE | **Verdict** : PASS

---

## 1. Périmètre audité

| Surface | Lignes | Hook legacy ? | Décision |
|---|---|---|---|
| `src/components/sections/ConversationSection.tsx` | 3503 | **NON** — utilise `useConversationEngine` (canonique) | Wire additif `useChatProvidersHealthQuery` pour cache offline |
| `src/components/chat/MemoryDashboard.tsx` | 731 | NON — `usePersistentMemory` | Aucune migration nécessaire |
| `src/components/chat/ChatModeSelector.tsx` | 268 | NON — presentational | Aucune migration nécessaire |
| `src/components/ChatWindow.tsx` | 423 | OUI — `useChat` | **DEAD CODE** (aucun import page) → `@deprecated` |
| `src/hooks/useGlobalAIChat.ts` | 228 | OUI — `useChat` | **DEAD CODE** (aucun consumer) → `@deprecated` |
| `src/hooks/useVoiceEngine.ts` | n/a | OUI — `useChat` | Consommé par `ConversationSection`; conserver, migration reportée v36 |
| `src/hooks/useChat.ts` | 2408 | self | Conserver — wrappé par `useVoiceEngine` |
| `src/hooks/useChatCore.ts` | 309 | bloc interne | Conserver — utilisé par `useChat` + `useConversationEngine` chaîne |
| `src/hooks/useChatMemory.ts` | 205 | bloc interne | Conserver — utilisé par `useConversationEngine` |

## 2. Mapping legacy → TanStack v34.4.0

| Hook legacy | Équivalent TanStack | Statut wiring |
|---|---|---|
| `useChat().healthCheck()` | `useChatProvidersHealthQuery()` | À wirer additivement dans `ConversationSection` (Sprint C.2) |
| `useChat().send()` | `useChatSendMutation()` | Reporté v36 (refactor majeur — Rule 1) |
| `useChat().clearConversation()` | `useChatDeleteConversationMutation()` | Reporté v36 |
| `useChatMemory().getConversation()` | `useChatConversationQuery(id)` | Reporté v36 |
| `useChatCore().streamMessage()` | non couvert (mutation streaming hors scope v35) | n/a |

## 3. Stratégie d'intégration v35.1.0 (additive, Rule 1)

### Sprint C.2 — ConversationSection enrichissement
- Importer `useChatProvidersHealthQuery` en plus de `useConversationEngine`.
- Conserver `healthReport` du hook canonique comme source primaire.
- Utiliser le résultat TanStack comme **fallback cache offline** (persisté via `installQueryPersister`).
- Aucun retrait de comportement existant. Aucune rupture API.

### Sprint C.3 — Dépréciation code mort
- JSDoc `@deprecated` sur `ChatWindow.tsx` + `useGlobalAIChat.ts`.
- Annotation pointant vers `ConversationSection` + hooks TanStack.
- Conservation pendant 2 versions mineures avant retrait définitif (v35.3.0).

### Sprint C.4 — Tests
- Vitest : 3 cas additionnels pour la nouvelle wiring `useChatProvidersHealthQuery`.
- Tests existants `ConversationSection` non touchés.

### Sprint C.5 — Proof_pack + bump
- Bump patch 35.0.0 → 35.1.0 (mineur car capacité offline étendue).
- Tag custom `release/v35.1.0-consumer-migration-2026-05-14`.

## 4. Migrations reportées explicitement à v36

Raison : ConversationSection (3503 LOC) sans pattern dual-source incrémental disponible aujourd'hui. Migrer `send()` / `clearConversation()` / streaming en bloc viole Rule 1 (patch minimal). v36 EXPLORATION dédiera un spike (`explore/v36-chat-tanstack-mutation`) pour valider la stratégie de transition avant retour Durable.

## 5. Verdict audit

**PASS** — Surface chat canonique déjà alignée. Code legacy isolé en dead code identifié. Périmètre Sprint C réduit de 1× big-bang à 3× minimal patches.

— TITANE∞ v35.1.0 Sprint C.1
