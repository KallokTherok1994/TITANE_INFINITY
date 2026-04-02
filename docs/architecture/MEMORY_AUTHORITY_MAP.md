# MEMORY_AUTHORITY_MAP
**TITANE∞ — Cartographie de l'autorité mémoire canonique**
**Date**: 2026-03-26
**Phase**: PHASE 5 — MÉMOIRE CANONIQUE UNIQUE
**Verdict**: QUALIFIED

---

## Chaîne mémoire canonique (prouvée par imports)

```
ConversationEngine.ts
  │
  ├─→ chatMemorySingleDoor.ts        [CONTEXT FORMATTER — lecture seule pour inject prompt]
  │     └─→ localStorage (chat context, twins fusion, time context)
  │         → formatContextEnvelopeForSystemPrompt() → system prompt LLM
  │
  └─→ "backend memory lane" (commentaire ligne 525)
        └─→ IPC Tauri → src-tauri/src/memory_os + unified_memory_v2  [CANONICAL BACKEND]
```

```
useChatMemory.ts hook
  │
  └─→ chatMemoryCompactor.ts         [CHAT HISTORY — localStorage per-mode]
        └─→ localStorage (messages par mode OMEGA)
```

```
src/services/unified/UnifiedMemory.ts  [CANONICAL FRONTEND LAYER]
  │
  ├─→ SQLiteVectorStore.ts              [SQLite + better-sqlite3 — RISK: voir Phase 4]
  │     └─→ Database (better-sqlite3 / Node.js natif)
  │
  ├─→ LocalEmbeddingGenerator.ts        [LABS — @xenova/transformers WASM]
  │     └─→ @xenova/transformers
  │
  └─→ VectorStoreClient.ts              [client interface]
```

---

## Chemins mémoire — Classification complète

### 1. KEEP_CORE — Autorité canonique frontend

| Fichier | Rôle | Scope | Statut |
|---------|------|-------|--------|
| `services/chat/chatMemorySingleDoor.ts` | Context envelope → prompt LLM | Chat pipeline | **CANONICAL** — importé par conversationEngine |
| `services/chatMemoryCompactor.ts` | Chat history localStorage per-mode | UI/hooks | **CANONICAL** — importé par useChatMemory + useConversationEngine |
| `services/unified/UnifiedMemory.ts` | Stockage persistant STM/MTM/LTM + vector | Memory OS | **CANONICAL** — unified memory service |
| `services/unified/VectorStoreClient.ts` | Client interface vector store | Memory OS | **CANONICAL** |
| `services/unified/index.ts` | Export public de unified/ | Memory OS | **CANONICAL** |

### 2. KEEP_CORE (Rust) — Backend autoritaire

| Module Rust | Rôle | Statut |
|-------------|------|--------|
| `src-tauri/src/memory_os/` | Memory OS Rust | **CANONICAL BACKEND** |
| `src-tauri/src/unified_memory_v2/` | Unified memory v2 | **CANONICAL BACKEND** |
| `src-tauri/src/neural_memory/` | Neural memory layer | **CANONICAL BACKEND** |
| `src-tauri/src/memory/` | Memory core Rust | **CANONICAL BACKEND** |

### 3. KEEP_CORE — Labs avec dépendance connue

| Fichier | Rôle | Note |
|---------|------|------|
| `services/unified/LocalEmbeddingGenerator.ts` | Embeddings locaux @xenova | Utilisé par UnifiedMemory — heavy WASM |
| `services/unified/SQLiteVectorStore.ts` | SQLite vector store | RISK P1: `fs` Node.js natif — voir Phase 4 |

### 4. ALIAS_COMPAT / LEGACY — À clarifier

| Fichier | Rôle déclaré | Problème | Décision |
|---------|-------------|---------|----------|
| `services/chatMemory.ts` | Chat memory v1 ? | Rôle vs `chatMemoryCompactor.ts` peu clair — types `AIMessage` only | **ALIAS_COMPAT** — auditer usages avant touch |
| `services/memory/UnifiedMemoryService.ts` | File-based memory (STM/MTM/LTM via JSON files) | **Utilise `import fs from 'fs/promises'`** — Node.js natif, non compatible WebView Tauri. Classe séparée de `services/unified/UnifiedMemory.ts` | **LEGACY / RISK P1** — chemin dev/test seulement ? |
| `services/memory/MemoryBridge.ts` | Bridge mémoire | Rôle vs autres bridges non clair | **ALIAS_COMPAT** — audit requis |

### 5. NEW / UNTRACKED — Status à définir

| Fichier | Imports | Décision provisoire |
|---------|---------|---------------------|
| `services/memory/MemoryIntelligenceEngine.ts` | `getUnifiedMemory` depuis `./UnifiedMemoryService` + `awardExperience` | **LABS** — nouveau module non committé, dépend de `UnifiedMemoryService` (legacy). Risque TS2532 préexistant. |

### 6. UI Layer — Keep as-is

| Fichier | Rôle | Statut |
|---------|------|--------|
| `features/memory/MemorySearchPanel.tsx` | Recherche mémoire UI | **KEEP** — UI only, pas logique métier |
| `features/memory/MemoryTreeViewer.tsx` | Arbre mémoire hiérarchique | **KEEP** — UI only |
| `features/memory/memoryTreeData.ts` | Data pour l'arbre | **KEEP** |

---

## Contradiction principale identifiée

**Deux implémentations de `UnifiedMemory` en parallèle**:

| Implémentation | Localisation | Technologie | Usage prouvé |
|---------------|-------------|-------------|--------------|
| **Canonical** | `services/unified/UnifiedMemory.ts` | SQLite + vector + HNSW | Importé par unified/index.ts, utilisé via VectorStoreClient |
| **Legacy/Parallel** | `services/memory/UnifiedMemoryService.ts` | `fs/promises` JSON files | Importé par `MemoryIntelligenceEngine.ts` (nouveau, non committé) |

**Verdict**: `services/unified/UnifiedMemory.ts` = autorité canonique. `services/memory/UnifiedMemoryService.ts` = implémentation parallèle file-based non prouvée en production Tauri.

---

## Autorité mémoire canonique retenue

```
BACKEND (Rust, autoritaire):
  src-tauri/src/unified_memory_v2/  ← Stockage final

FRONTEND (TypeScript, canonical):
  services/unified/UnifiedMemory.ts ← Couche JS
    └─→ VectorStoreClient → SQLiteVectorStore

CONTEXT INJECTION (canonical):
  services/chat/chatMemorySingleDoor.ts ← Porte unique vers le prompt LLM

CHAT HISTORY (canonical):
  services/chatMemoryCompactor.ts ← Historique localStorage per-mode
```

---

## Voie publique recommandée (save → recall → inject)

```
[SAVE]   useConversationEngine → chatMemoryCompactor.addMessageToMode()
[STORE]  UnifiedMemory.add() → SQLiteVectorStore → Rust IPC
[RECALL] UnifiedMemory.search() → VectorStoreClient
[INJECT] chatMemorySingleDoor.formatContextEnvelopeForSystemPrompt() → conversationEngine
[CONSUME] aiOrchestrator → provider → LLM
```

---

## Actions recommandées (sans mutation Phase 5)

1. **`services/memory/UnifiedMemoryService.ts`**: marquer explicitement comme LEGACY dans le fichier. Vérifier si `fs/promises` est compatible avec le runtime (via `@tauri-apps/plugin-fs` ou Node.js test runner seulement).

2. **`MemoryIntelligenceEngine.ts`**: décider si ce nouveau module doit importer depuis `services/unified/` (canonical) plutôt que `services/memory/UnifiedMemoryService` (legacy). Corriger avant commit.

3. **`services/chatMemory.ts`**: vérifier s'il est vraiment distinct de `chatMemoryCompactor.ts` ou si c'est un doublon partiel.

---

## Verdict

```
PHASE 5: QUALIFIED
- Autorité mémoire canonique nommée: services/unified/UnifiedMemory.ts (frontend) + src-tauri/unified_memory_v2 (backend)
- Chemins concurrents documentés: services/memory/UnifiedMemoryService.ts (file-based legacy)
- Voie publique recommandée: chatMemoryCompactor → UnifiedMemory → chatMemorySingleDoor → prompt
- Risque P1 flagué: MemoryIntelligenceEngine.ts (non committé) importe depuis legacy service
- Prochaine action: PHASE 6 — CORE / LABS / OPS
```
