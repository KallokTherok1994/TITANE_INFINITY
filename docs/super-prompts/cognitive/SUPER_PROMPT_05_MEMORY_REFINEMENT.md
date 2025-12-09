# 🔥 SUPER PROMPT #5 — TITANE∞ MEMORY SYSTEM REFINEMENT

**Raffinement du système de mémoire (episodic, semantic, working)**

---

## 📋 Métadonnées

- **Priorité** : 🟡 P2
- **Complexité** : ⭐⭐⭐
- **Durée estimée** : 1-2h
- **Dépendances** : Super Prompt #4
- **Output** : Memory system optimisé + Persistance + Tests
- **Outils** : GitHub Copilot Chat + VS Code

---

## 🎯 Objectif

Raffiner le **système de mémoire** pour qu'il soit efficace, persistant et rapide.

---

## 🚀 Super Prompt

````markdown
@workspace

Tu es expert Memory Systems sur **TITANE_INFINITY**.

Ton rôle : **raffiner le système de mémoire** (episodic, semantic, working).

---

## 1. DIAGNOSTIC

Génère : `docs/cognitive/MEMORY_SYSTEM_DIAGNOSTIC.md`

Analyse :
- Types de mémoire implémentés
- Backend de stockage (SQLite, fichiers, RAM)
- Performance (lecture/écriture)
- Stratégies d'éviction

---

## 2. ARCHITECTURE MÉMOIRE

```rust
pub trait MemoryStore: Send + Sync {
    async fn store(&self, key: &str, value: &MemoryEntry) -> Result<()>;
    async fn retrieve(&self, key: &str) -> Result<Option<MemoryEntry>>;
    async fn search(&self, query: &MemoryQuery) -> Result<Vec<MemoryEntry>>;
    async fn delete(&self, key: &str) -> Result<()>;
}

pub struct MemoryEntry {
    pub id: String,
    pub content: String,
    pub memory_type: MemoryType,
    pub timestamp: DateTime<Utc>,
    pub metadata: HashMap<String, String>,
    pub embeddings: Option<Vec<f32>>,
}

pub enum MemoryType {
    Episodic,   // Événements spécifiques
    Semantic,   // Connaissances générales
    Working,    // Mémoire de travail temporaire
}
```

---

## 3. OPTIMISATIONS

### 3.1. Index pour recherche rapide

```rust
use tantivy::{Index, Document};

pub struct IndexedMemoryStore {
    index: Index,
    // ...
}

impl IndexedMemoryStore {
    pub async fn search_full_text(&self, query: &str) -> Result<Vec<MemoryEntry>> {
        // Full-text search avec Tantivy
    }
}
```

### 3.2. Embeddings pour similarité sémantique

```rust
pub async fn find_similar(
    &self,
    query_embedding: &[f32],
    limit: usize,
) -> Result<Vec<(MemoryEntry, f32)>> {
    // Cosine similarity search
}
```

### 3.3. LRU pour working memory

```rust
use lru::LruCache;

pub struct WorkingMemory {
    cache: Arc<Mutex<LruCache<String, MemoryEntry>>>,
    max_size: usize,
}
```

---

## 4. PERSISTANCE

```rust
use rusqlite::{Connection, params};

pub struct SqliteMemoryStore {
    conn: Arc<Mutex<Connection>>,
}

impl SqliteMemoryStore {
    pub async fn init(&self) -> Result<()> {
        self.conn.lock().await.execute(
            "CREATE TABLE IF NOT EXISTS memories (
                id TEXT PRIMARY KEY,
                content TEXT NOT NULL,
                memory_type TEXT NOT NULL,
                timestamp INTEGER NOT NULL,
                metadata TEXT
            )",
            [],
        )?;
        Ok(())
    }
}
```

---

## 5. ÉVICTION AUTOMATIQUE

```rust
pub struct MemoryEvictionPolicy {
    pub max_age_days: u64,
    pub max_entries: usize,
    pub priority_threshold: f32,
}

impl MemoryEvictionPolicy {
    pub async fn apply(&self, store: &dyn MemoryStore) -> Result<usize> {
        // Supprimer les entrées anciennes, peu importantes
        let cutoff = Utc::now() - Duration::days(self.max_age_days as i64);

        // Logic d'éviction basée sur : âge, fréquence d'accès, importance
    }
}
```

---

## 6. OUTPUT ATTENDU

1. `docs/cognitive/MEMORY_SYSTEM_DIAGNOSTIC.md`
2. Trait `MemoryStore` unifié
3. Implémentations : SQLite, RAM, LRU
4. Index full-text (Tantivy)
5. Système d'éviction
6. Tests (CRUD, search, eviction)
7. Benchmarks (read/write latency)

Commence par diagnostic puis architecture.
````

---

## ✅ Checklist

- [ ] Diagnostic mémoire complet
- [ ] Trait `MemoryStore` implémenté
- [ ] Persistance SQLite fonctionnelle
- [ ] Index full-text (optionnel mais recommandé)
- [ ] Éviction automatique
- [ ] Tests CRUD complets
- [ ] Benchmarks < 10ms lecture

---

**Version** : 1.0.0
**Dernière mise à jour** : 2025-12-09
