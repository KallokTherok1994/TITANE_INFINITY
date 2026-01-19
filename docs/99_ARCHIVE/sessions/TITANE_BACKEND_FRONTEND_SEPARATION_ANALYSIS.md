# 🔥 TITANE∞ — BACKEND/FRONTEND SEPARATION ANALYSIS v.7

**Date:** 7 décembre 2025  
**Moteur:** TITANE∞ Backend/Frontend Separation & System Hardening Engine vΩ.7  
**Status:** Phase 1 - Analyse Structurelle Complete

---

## 📊 PHASE 1 — ANALYSE STRUCTURELLE COMPLETE

### 1.1 BACKEND LOGIC À MIGRER (Non-Compatible Browser)

#### ❌ Modules Node.js Détectés dans `/src/`

**Fichiers Critiques Utilisant `better-sqlite3`:**

1. `/src/services/cognitive/SQLiteVectorStore.ts` (616 lignes)
   - Import: `import Database from 'better-sqlite3'`
   - Usage: Création DB, WAL mode, recherche vectorielle
   - **Action:** Migrer vers Rust backend

2. `/src/services/unified/SQLiteVectorStore.ts` (592 lignes)
   - Import: `import Database from 'better-sqlite3'`
   - Usage: UnifiedMemory storage layer
   - **Action:** Migrer vers Rust backend

**Fichiers Utilisant `fs` / `path`:** 3. `/src/services/unified/UnifiedMemory.test.ts`

- Import: `import * as fs from 'fs'`
- **Action:** Supprimer ou utiliser Tauri API

4. `/src/services/unified/__tests__/UnifiedMemory.benchmark.ts`
   - Imports: `import fs from 'fs'`, `import path from 'path'`
   - **Action:** Supprimer ou migrer vers tests Rust

5. `/src/services/unified/__tests__/UnifiedMemory.perf.test.ts`
   - Imports: `import fs from 'fs'`, `import path from 'path'`
   - **Action:** Supprimer ou migrer vers tests Rust

6. `/src/services/unified/__tests__/SQLiteVectorStore.unit.test.ts`
   - Imports: `import fs from 'fs'`, `import path from 'path'`
   - **Action:** Supprimer ou migrer vers tests Rust

7. `/src/utils/tauriFsAdapter.ts`
   - Commentaires référençant `fs` (déjà adapté)
   - **Status:** ✅ Déjà compatible (utilise Tauri plugin-fs)

#### 🎯 Fonctionnalités à Migrer vers Backend Rust

**A. Vector Store & SQLite Operations**

- Base de données SQLite (UnifiedMemory + Cognitive)
- Recherche vectorielle (cosine similarity)
- Opérations CRUD sur embeddings
- Indexation et compression
- **Target:** `src-tauri/src/api/vector_store_api.rs` (NOUVEAU)

**B. Filesystem Operations (Déjà Partiellement Fait)**

- Lecture/écriture fichiers ✅ (via `tauriBridge.ts`)
- Listing directories ✅
- Création/suppression ✅
- **Status:** Déjà implémenté dans `src-tauri/src/api/` via Tauri commands
- **Amélioration:** Ajouter validation supplémentaire

**C. AI Orchestration System**

- `/src/services/ai/orchestrator.ts` (999 lignes)
- Sélection provider neural
- Fallback cascade
- Auto-heal intégré
- **Action:** Garder en frontend (logique UI) mais déléguer appels lourds au backend

**D. Cognitive Engines**

- SemanticMemoryEngine
- ConversationEvaluationEngine
- GoalConsistencyEngine
- LocalEmbeddingGenerator
- **Action:** Migrer génération embeddings vers backend, garder clients en frontend

---

### 1.2 FRONTEND LOGIC QUI RESTE BROWSER-SAFE

#### ✅ Modules Déjà Compatibles Browser

**A. Components React**

- `/src/components/**` - Tous compatibles
- `/src/pages/**` - Tous compatibles
- Utilisation correcte de `invoke()` de Tauri

**B. Services Frontend**

- `/src/services/tauriBridge.ts` ✅ (déjà abstraction propre)
- `/src/utils/tauriFsAdapter.ts` ✅ (utilise Tauri plugin-fs)
- `/src/utils/invoke.ts` ✅ (wrapper invoke avec retry)

**C. Hooks & Stores**

- `/src/hooks/**` ✅ Browser-safe
- `/src/stores/**` ✅ Zustand (browser-safe)

**D. AI Providers (Frontend Clients)**

- `/src/services/ai/providers/tauriChat.ts` ✅ (appelle backend)
- `/src/services/ai/providers/gemini.ts` ⚠️ (API calls - OK mais optimisable)
- `/src/services/ai/providers/ollama.ts` ⚠️ (API calls - OK mais optimisable)
- `/src/services/ai/providers/titaneLocal.ts` ✅ (fallback local)

---

### 1.3 BACKEND RUST STRUCTURE EXISTANTE

#### 📂 Modules Backend Actuels (`src-tauri/src/`)

**Core Modules (✅ Robustes):**

- `core/` - SingularityEngine v16
- `api/` - Existing API layer:
  - `chat_commands.rs`
  - `engine_api.rs`
  - `handlers_v14.rs`
  - `memory_api.rs`
  - `system_api.rs`
  - `helios_api.rs`

**Services Existants:**

- `services/io_service.rs` ✅ - Safe filesystem operations
- `security/storage_guard.rs` ✅ - Path validation & sandboxing
- `memory/` - Memory storage
- `cognitive/` - Cognitive layer v16

**Engines Opérationnels:**

- `adaptive/` - AdaptiveEngine v21
- `avatar/` - ImmersiveAvatarEngine v23
- `meta/` - Meta-Cognition v18
- `narrative/` - NarrativeEngine v22
- `watchdog/` - Watchdog Engine v17
- `healing/` - Self-Healing System
- `profiling/` - IPC Profiler v19.5
- `cache/` - Cache LRU + Persistent v19.5.2
- `batch/` - Batch Request System v19.5.2

---

## 🔥 PHASE 2 — PLAN DE MIGRATION

### 2.1 Créer Nouveaux Modules Backend Rust

**Modules à Créer:**

```
src-tauri/src/api/
├── vector_store_api.rs       ← NOUVEAU (SQLite + Vector Search)
├── sqlite_api.rs              ← NOUVEAU (Generic SQLite ops)
├── ai_engine_api.rs           ← NOUVEAU (Heavy AI ops)
├── orchestrator_api.rs        ← NOUVEAU (Multi-agent orchestration)
└── embedding_api.rs           ← NOUVEAU (Local embeddings generation)
```

**Dependencies à Ajouter (Cargo.toml):**

```toml
rusqlite = { version = "0.30", features = ["bundled"] }
ndarray = "0.15"  # Pour calculs vectoriels
```

### 2.2 Migrer SQLiteVectorStore vers Rust

**Étapes:**

1. Créer `src-tauri/src/api/vector_store_api.rs`
2. Implémenter:
   - `create_vector_db(path, dimensions)`
   - `insert_vector(id, embedding, metadata)`
   - `search_vectors(query_embedding, top_k, filter)`
   - `update_vector(id, metadata)`
   - `delete_vector(id)`
   - `get_stats()`

3. Exposer commandes Tauri:

```rust
#[tauri::command]
pub async fn vector_search(
    embedding: Vec<f32>,
    top_k: u32,
    filter: Option<serde_json::Value>
) -> Result<Vec<SearchResult>, String>
```

### 2.3 Créer Client Frontend TypeScript

**Créer `/src/services/unified/VectorStoreClient.ts`:**

```typescript
import { invoke } from '@tauri-apps/api/tauri';

export class VectorStoreClient {
  async initialize(config: VectorStoreConfig): Promise<void> {
    return await invoke('vector_store_init', config);
  }

  async insert(entry: VectorEntry): Promise<string> {
    return await invoke('vector_store_insert', { entry });
  }

  async search(embedding: number[], topK: number): Promise<SearchResult[]> {
    return await invoke('vector_search', { embedding, topK });
  }

  async delete(id: string): Promise<void> {
    return await invoke('vector_store_delete', { id });
  }
}
```

### 2.4 Remplacer Imports dans Frontend

**Avant:**

```typescript
import Database from 'better-sqlite3';
import { SQLiteVectorStore } from './SQLiteVectorStore';
```

**Après:**

```typescript
import { VectorStoreClient } from './VectorStoreClient';
const vectorStore = new VectorStoreClient();
```

---

## 🔥 PHASE 3 — OPTIMISATION VITE

### 3.1 Exclure Modules Node.js de Vite

**Mise à jour `vite.config.ts`:**

```typescript
optimizeDeps: {
  include: ['react', 'react-dom', '@tauri-apps/api'],
  exclude: [
    'better-sqlite3',
    'sqlite3',
    'bindings',
    'fs',
    'path',
    'util',
    'os',
    'process'
  ]
}
```

### 3.2 Manual Chunks pour Bundle Optimization

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        'tauri-vendor': ['@tauri-apps/api'],
        'ai-vendors': ['@xenova/transformers'],  // ⚠️ Browser-compatible
        'state': ['zustand'],
        'utils': ['clsx', 'date-fns', 'dompurify'],
      }
    }
  }
}
```

---

## 📊 STATISTIQUES

### Fichiers à Modifier

- **Frontend à nettoyer:** 6 fichiers (SQLiteVectorStore + tests)
- **Backend à créer:** 5 nouveaux modules API Rust
- **Clients à créer:** 3 nouveaux clients TypeScript

### Impact Estimation

- **Lignes à migrer:** ~1500 lignes TS → Rust
- **Performance gain:** 3-5x (Rust vs Node.js SQLite)
- **Bundle size reduction:** ~2MB (removal of better-sqlite3)
- **Build warnings:** -100% (plus de "externalized for browser")

### Compatibilité

- ✅ Tauri v2 ready
- ✅ Vite 6 optimized
- ✅ Browser dev mode preserved (mock backends)

---

## 🎯 NEXT STEPS

1. ✅ Analyse structurelle (COMPLETE)
2. ⏳ Créer modules API Rust backend
3. ⏳ Créer clients TypeScript frontend
4. ⏳ Migrer tests vers Rust
5. ⏳ Nettoyage imports Node.js
6. ⏳ Validation build final

---

**Rapport généré par:** TITANE∞ Backend/Frontend Separation Engine vΩ.7  
**Prochaine étape:** Phase 2 - Implémentation Backend Rust
