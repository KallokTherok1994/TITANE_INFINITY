# 🏗️ TITANE∞ Backend — Architecture Détaillée

**Diagrammes, flux de données, patterns de conception.**

Temps de lecture : 30 minutes.
Prérequis : Avoir lu [overview.md](./overview.md).

> **Note spéciale v13.0.0** : Ce document inclut maintenant l'architecture complète du **Memory Core Multi-niveaux** avec Compression Cognitive, Noise Adaptive, Versioning & Migrations — le cerveau externe fiable de TITANE∞.

---

## 📐 Diagramme Global

```
┌──────────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                               │
│                     React 18 + TypeScript + Zustand                  │
│                                                                      │
│  Pages:  Dashboard, Chat, Memory, Settings, DevTools                │
│  Hooks:  useTitane(), useMemory(), useHelios()                      │
│  API:    invoke() wrapper avec typage TypeScript                    │
└────────────────────────────────┬─────────────────────────────────────┘
                                 │
                                 │ IPC (JSON over WebSocket-like)
                                 │
┌────────────────────────────────▼─────────────────────────────────────┐
│                          TAURI API LAYER                             │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  API Modules (6 fichiers, 30+ commands)                      │  │
│  │                                                               │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │  │
│  │  │ helios_api   │  │ memory_api   │  │ engine_api   │      │  │
│  │  │              │  │              │  │              │      │  │
│  │  │ 2 commands   │  │ 5 commands   │  │ 3 commands   │      │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │  │
│  │                                                               │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │  │
│  │  │ system_api   │  │ persona_api  │  │ legacy (13)  │      │  │
│  │  │ 4 commands   │  │ 6 commands   │  │ DEPRECATED   │      │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │  │
│  │                                                               │  │
│  │  Validation → Routing → Error Handling → JSON Response       │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬─────────────────────────────────────┘
                                 │
                                 │ Function Calls
                                 │
┌────────────────────────────────▼─────────────────────────────────────┐
│                     APPLICATION STATE (TitaneApp)                    │
│                                                                      │
│  Arc<RwLock<CoreModules>>    Arc<RwLock<EngineModules>>            │
│  ┌───────────────────────┐   ┌───────────────────────┐             │
│  │  Helios               │   │  AutoEvolution        │             │
│  │  Nexus                │   │  Diagnostics          │             │
│  │  Harmonia             │   │  Repair               │             │
│  │  Sentinel             │   │  HealthCheck          │             │
│  │  Memory               │   │                       │             │
│  └───────────────────────┘   └───────────────────────┘             │
│                                                                      │
│  Shared State avec thread-safe access (RwLock)                      │
└────────────────────────────────┬─────────────────────────────────────┘
                                 │
                                 │ Delegate to
                                 │
┌────────────────────────────────▼─────────────────────────────────────┐
│                        BUSINESS LOGIC LAYER                          │
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │   CORE           │  │   ENGINE         │  │   SERVICES       │ │
│  │                  │  │                  │  │                  │ │
│  │  Helios.rs       │  │  auto_evolution  │  │  system_service  │ │
│  │  Nexus.rs        │  │  diagnostics     │  │  io_service      │ │
│  │  Harmonia.rs     │  │  repair          │  │  storage_service │ │
│  │  Sentinel.rs     │  │  health_check    │  │                  │ │
│  │  Memory.rs       │  │                  │  │                  │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                      │
│  + Security Layer (v17.3.0)                                         │
│  ┌──────────────────┐  ┌──────────────────┐                        │
│  │  ShellGuard      │  │  StorageGuard    │                        │
│  │  Whitelist cmds  │  │  Path validation │                        │
│  └──────────────────┘  └──────────────────┘                        │
└────────────────────────────────┬─────────────────────────────────────┘
                                 │
                                 │ System Calls
                                 │
┌────────────────────────────────▼─────────────────────────────────────┐
│                          SYSTEM LAYER                                │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  OS (sysinfo)│  │  Filesystem  │  │  Shell Cmds  │             │
│  │  CPU/RAM/Disk│  │  JSON files  │  │  (guarded)   │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flux de Données : Cas d'Usage Réels

### 1. GET System Health (Lecture Simple)

```
Frontend                API Layer           Core            Services
   │                       │                  │                 │
   │ invoke('get_        │                  │                 │
   │ helios_state')       │                  │                 │
   ├─────────────────────>│                  │                 │
   │                       │                  │                 │
   │                       │ app.helios      │                 │
   │                       │ .collect()       │                 │
   │                       ├─────────────────>│                 │
   │                       │                  │                 │
   │                       │                  │ system.metrics()│
   │                       │                  ├────────────────>│
   │                       │                  │                 │
   │                       │                  │<────────────────┤
   │                       │                  │ SystemMetrics   │
   │                       │                  │                 │
   │                       │<─────────────────┤                 │
   │                       │ HeliosState      │                 │
   │                       │                  │                 │
   │<─────────────────────┤                  │                 │
   │ JSON { cpu, ram }    │                  │                 │
   │                       │                  │                 │
   │ render()             │                  │                 │
   └──                    └──                └──               └──
```

**Durée** : ~10-50ms
**Thread** : Non-bloquant (async)
**Erreurs possibles** : `SystemError::MetricsUnavailable`

---

### 2. POST Write Memory Snapshot (Écriture)

```
Frontend                API Layer           Core            Storage
   │                       │                  │                 │
   │ invoke('write_      │                  │                 │
   │ snapshot', {         │                  │                 │
   │   data, metadata })  │                  │                 │
   ├─────────────────────>│                  │                 │
   │                       │                  │                 │
   │                       │ Validate input  │                 │
   │                       │ (size, format)   │                 │
   │                       │                  │                 │
   │                       │ app.memory      │                 │
   │                       │ .write_snapshot()│                 │
   │                       ├─────────────────>│                 │
   │                       │                  │                 │
   │                       │                  │ Serialize JSON │
   │                       │                  │ Add metadata   │
   │                       │                  │                 │
   │                       │                  │ storage.save() │
   │                       │                  ├────────────────>│
   │                       │                  │                 │
   │                       │                  │ (StorageGuard  │
   │                       │                  │  validation)    │
   │                       │                  │                 │
   │                       │                  │<────────────────┤
   │                       │                  │ OK / Error      │
   │                       │                  │                 │
   │                       │<─────────────────┤                 │
   │                       │ snapshot_id      │                 │
   │                       │                  │                 │
   │<─────────────────────┤                  │                 │
   │ { success, id }      │                  │                 │
   └──                    └──                └──               └──
```

**Durée** : ~50-200ms (selon taille snapshot)
**Thread** : Async (tokio::spawn si lourd)
**Erreurs possibles** :
- `MemoryError::SnapshotTooLarge`
- `StorageError::WriteFailed`
- `SecurityViolation::PathTraversal` (v17.3.0)

---

### 3. Engine Self-Heal Cycle (Complexe)

```
Frontend                API Layer           Engine          Core/Services
   │                       │                  │                 │
   │ invoke('run_        │                  │                 │
   │ evolution')          │                  │                 │
   ├─────────────────────>│                  │                 │
   │                       │                  │                 │
   │                       │ app.engine      │                 │
   │                       │ .run_evolution() │                 │
   │                       ├─────────────────>│                 │
   │                       │                  │                 │
   │                       │                  │ 1. Diagnostics │
   │                       │                  ├────────────────>│
   │                       │                  │ scan_system()   │
   │                       │                  │                 │
   │                       │                  │<────────────────┤
   │                       │                  │ DiagResult      │
   │                       │                  │                 │
   │                       │                  │ 2. Analyze     │
   │                       │                  │ problems()      │
   │                       │                  │                 │
   │                       │                  │ 3. Repair      │
   │                       │                  ├────────────────>│
   │                       │                  │ auto_fix()      │
   │                       │                  │                 │
   │                       │                  │<────────────────┤
   │                       │                  │ RepairResult    │
   │                       │                  │                 │
   │                       │                  │ 4. Log to      │
   │                       │                  │    Sentinel     │
   │                       │                  ├────────────────>│
   │                       │                  │                 │
   │                       │<─────────────────┤                 │
   │                       │ EvolutionState   │                 │
   │                       │                  │                 │
   │<─────────────────────┤                  │                 │
   │ { status, actions,   │                  │                 │
   │   duration }          │                  │                 │
   └──                    └──                └──               └──
```

**Durée** : ~2-10 secondes
**Thread** : Async background (tokio::spawn)
**Erreurs possibles** :
- `EngineError::DiagnosticsFailed`
- `EngineError::RepairFailed`
- `EngineError::Timeout`

---

## 🧩 Patterns de Conception

### 1. Result-Based Error Handling

**Problème** : Gérer les erreurs de manière uniforme.

**Solution** : `AppResult<T>` partout.

```rust
pub type AppResult<T> = Result<T, AppError>;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("System error: {0}")]
    System(String),

    #[error("Memory error: {0}")]
    Memory(String),

    #[error("Engine error: {0}")]
    Engine(String),

    #[error("IO error: {0}")]
    Io(String),

    #[error("Security violation: {0}")]
    Security(String),
}
```

**Usage** :
```rust
#[tauri::command]
pub async fn get_helios_state(app: State<'_, TitaneApp>) -> AppResult<HeliosState> {
    let helios = app.helios.read().await;
    helios.collect().await  // Retourne AppResult<HeliosState>
}
```

**Avantages** :
- Erreurs typées et structurées
- Propagation propre avec `?`
- Logging automatique possible
- JSON sérializable pour le frontend

---

### 2. Arc + RwLock pour État Partagé

**Problème** : Plusieurs threads accèdent aux noyaux.

**Solution** : `Arc<RwLock<T>>`.

```rust
pub struct TitaneApp {
    pub helios: Arc<RwLock<HeliosCore>>,
    pub memory: Arc<RwLock<MemoryCore>>,
    // ...
}
```

**Lecture** (non-bloquant, plusieurs lecteurs) :
```rust
let helios = app.helios.read().await;
let state = helios.collect().await?;
```

**Écriture** (exclusif, un seul écrivain) :
```rust
let mut memory = app.memory.write().await;
memory.write_snapshot(snapshot).await?;
```

**Avantages** :
- Thread-safe
- Performance (RwLock > Mutex si lecture >> écriture)
- Async-friendly (tokio::sync::RwLock)

---

### 3. Guard Pattern (Sécurité v17.3.0)

**Problème** : Validation répétitive des inputs dangereux.

**Solution** : Guards centralisés.

```rust
// Avant (🔴 DANGEREUX)
Command::new("espeak")
    .arg(&user_text)  // Injection possible
    .output()

// Après (✅ SÉCURISÉ)
shell_guard.execute_tts_espeak(&user_text, speed, pitch)?
```

**Implementation** :
```rust
pub struct ShellGuard {
    policy: SecurityPolicy,
}

impl ShellGuard {
    pub fn execute_verified(&self, cmd: &str, args: &[&str])
        -> Result<String, String>
    {
        // 1. Whitelist check
        self.validate_command(cmd)?;

        // 2. Args validation
        Self::validate_args(args)?;

        // 3. Execute safely
        Command::new(cmd).args(args).output()
    }
}
```

**Avantages** :
- Centralisation validation
- Réutilisable
- Testable isolément
- Fail-safe par défaut

---

### 4. Service Layer (Abstraction)

**Problème** : Code métier couplé à l'OS.

**Solution** : Services abstraits.

```rust
// Service abstrait
pub trait MetricsProvider {
    fn cpu_usage(&self) -> f64;
    fn ram_usage(&self) -> u64;
}

// Implementation sysinfo
pub struct SystemService {
    system: System,
}

impl MetricsProvider for SystemService {
    fn cpu_usage(&self) -> f64 {
        self.system.global_cpu_info().cpu_usage()
    }
}
```

**Avantages** :
- Mockable pour tests
- Portable (swap implementation)
- Découplage

---

## 📁 Architecture des Modules

### Module : Core

```
core/
  ├── mod.rs           → Exports publics
  ├── helios.rs        → Monitoring système
  │   ├── HeliosCore
  │   ├── collect()
  │   └── get_vitals()
  │
  ├── nexus.rs         → Cohérence
  │   ├── Nexus
  │   ├── prioritize()
  │   └── check_coherence()
  │
  ├── harmonia.rs      → Charge CPU/RAM
  │   ├── Harmonia
  │   ├── adjust_mode()
  │   └── get_load()
  │
  ├── sentinel.rs      → Sécurité
  │   ├── Sentinel
  │   ├── log()
  │   ├── sanitize_text()
  │   └── detect_anomaly()
  │
  └── memory.rs        → Persistence
      ├── MemoryCore
      ├── write_snapshot()
      ├── read_snapshot()
      └── rotate_logs()
```

**Relations** :
- Helios → SystemService (dépendance)
- Memory → StorageService (dépendance)
- Sentinel → utilisé par tous (logging)

---

### Module : Engine

```
engine/
  ├── mod.rs
  ├── auto_evolution.rs → Amélioration continue
  │   ├── AutoEvolution
  │   ├── run_cycle()
  │   └── apply_improvements()
  │
  ├── diagnostics.rs    → Scan problèmes
  │   ├── Diagnostics
  │   ├── scan_system()
  │   └── categorize_issues()
  │
  ├── repair.rs         → Réparations
  │   ├── Repair
  │   ├── auto_fix()
  │   └── manual_fix()
  │
  └── health_check.rs   → Vérifications
      ├── HealthCheck
      ├── quick_check()
      └── full_check()
```

**Relations** :
- Engine dépend de **tous les Core modules**
- Utilise Services (System, IO, Storage)
- Logs via Sentinel

---

### Module : API

```
api/
  ├── mod.rs            → Exports + routing
  ├── helios_api.rs     → 2 commands
  │   ├── get_helios_state()
  │   └── get_system_health()
  │
  ├── memory_api.rs     → 5 commands
  │   ├── write_snapshot()
  │   ├── read_snapshot()
  │   ├── write_log()
  │   ├── read_logs()
  │   └── add_timeline_event()
  │
  ├── engine_api.rs     → 3 commands
  │   ├── run_evolution()
  │   ├── get_evolution_state()
  │   └── quick_health_check()
  │
  ├── system_api.rs     → 4 commands
  ├── persona_api.rs    → 6 commands (v24)
  └── legacy_commands.rs → 13 DEPRECATED
```

**Conventions** :
- Tous les fichiers exportent `#[tauri::command]`
- Signature : `async fn nom(app: State<TitaneApp>, params) -> AppResult<T>`
- Validation inputs AVANT appel métier
- Erreurs propagées avec `?`

---

## 🔐 Sécurité : Defense in Depth (v17.3.0)

```
┌─────────────────────────────────────────────────────┐
│  Frontend (React)                                   │
│  └─ Input validation côté client (première ligne)  │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  API Layer (Tauri Commands)                         │
│  └─ Validation inputs (types, ranges, format)      │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  Business Logic (Core/Engine)                       │
│  └─ Business rules validation                       │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  Security Guards (ShellGuard, StorageGuard)         │
│  └─ Whitelist, sanitization, path validation       │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  System Layer (OS)                                  │
│  └─ Minimal privileges, sandboxed paths            │
└─────────────────────────────────────────────────────┘
```

**Principe** : Fail-safe à chaque couche.

---

## 🧪 Testing Strategy

### Unitaires (par module)
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_helios_collect() {
        // Test sync
    }

    #[tokio::test]
    async fn test_memory_write() {
        // Test async
    }
}
```

### Intégration (multi-modules)
```rust
#[tokio::test]
async fn test_full_evolution_cycle() {
    let app = setup_test_app().await;
    let result = app.engine.run_evolution().await;
    assert!(result.is_ok());
}
```

### Sécurité (guards)
```bash
cargo test --test security_tests
```

---

## 📊 Performance Targets

| Opération | Cible | Max Acceptable |
|-----------|-------|----------------|
| `get_helios_state` | 10ms | 100ms |
| `write_snapshot` | 50ms | 500ms |
| `run_evolution` | 2s | 10s |
| `quick_health_check` | 100ms | 1s |
| `full_health_check` | 5s | 30s |

---

## 🚀 Évolution Future

### Phase P1 (Semaine 3-4)
- Observabilité améliorée (Sentinel SecurityEvent buffer)
- DevTools security panel
- Rate limiting

### Phase P2 (Semaine 5+)
- Scheduler centralisé (Harmonia-driven)
- Adaptativité (modes Eco/Safe automatiques)
- Benchmarks + profiling

### Phase P3 (Long terme)
- Multi-instance support
- Plugin system
- Distributed state (?)

---

## 🧠 MEMORY CORE — Architecture Multi-Niveaux (v13.0.0+)

### Vue d'Ensemble : Le Cerveau Externe Fiable

Le **Memory Core** est le système de mémoire persistante de TITANE∞, conçu pour :

- **Accompagner Kevin sur des années** (journal de vie, décisions, projets, mission)
- **Compression Cognitive** (garder l'essentiel, jeter le bruit)
- **Noise Adaptive** (filtrage intelligent des signaux)
- **Auto-vérifiable & Auto-réparable** (SelfHeal, migrations de schéma)
- **Évolutif** (versions v7 → v8 → v9..., migration automatique)

**Philosophie** : Clarté, cycles, rituel, divergence → connexion → structuration.

---

## 📊 1. CARTOGRAPHIE DU MEMORY CORE ACTUEL

### 1.1. Tableau Synthétique des Composants Existants

| Name | Type Rust | Fichier(s) / Clé(s) | Usage | APIs Tauri | Risques Actuels |
|------|-----------|---------------------|-------|------------|----------------|
| **MemoryModule** | `MemoryModule` | `plugin_system/cores/memory.rs` | Court terme (snapshots) | `write_snapshot`, `read_snapshot`, `write_log`, `read_logs`, `add_timeline_event`, `get_memory_state` | Circular buffer = perte anciennes données, pas de compression |
| **Snapshot** | `Snapshot` | `types/memory.rs` | Court terme (état système) | Via MemoryModule | Croissance illimitée si trop fréquents |
| **LogEntry** | `LogEntry` | `types/memory.rs` | Court terme (logs) | Via MemoryModule | Buffer 1000 logs = volatilité |
| **TimelineEvent** | `TimelineEvent` | `types/memory.rs` | Moyen terme (événements) | Via MemoryModule | Buffer 500 events = perte historique |
| **MemorySync** | `MemorySync` | `exp_fusion_v15/memory_sync.rs` | Long terme (projets XP) | Aucune (interne) | JSON non compressé, pas de versioning |
| **MemoryEngine** | `MemoryEngineState` | `overdrive/memory_engine.rs` | Moyen terme (conversations) | `memory_store`, `memory_query`, `memory_stats` | Embeddings en RAM, pas de persistence garantie |
| **MemoryStorage** | `MemoryStorage` | `memory/storage.rs` | Long terme (conversations chiffrées) | `save_conversation`, `load_conversation` | Encryption OK, mais pas de compression cognitive |
| **Conversation** | `Conversation` | `memory/model.rs` | Moyen terme (chat history) | Via MemoryStorage | Pas de résumé automatique |
| **MemoryCompressor** | `MemoryCompressor` | `compression/compressor.rs` | N/A (prototype) | Aucune | Non intégré, logique basique |
| **CognitiveState** | `CognitiveState` | `cognitive/state.rs` | Court terme (état cognitif actuel) | Indirectement | Pas persisté, perdu au restart |
| **EmotionalState** | `EmotionalState` | `emotion/mod.rs` | Court terme (émotion vocale) | Via persona/emotion | Pas d'historique |

### 1.2. Points d'Entrée Tauri Existants

#### Memory Core API (6 commands)
```rust
get_memory_state() -> MemoryState
write_snapshot(snapshot: Snapshot) -> ()
read_snapshot() -> Option<Snapshot>
write_log(log: LogEntry) -> ()
read_logs(count: usize) -> Vec<LogEntry>
add_timeline_event(event: TimelineEvent) -> ()
```

#### Overdrive Memory Engine (7 commands)
```rust
memory_store(content, metadata) -> String  // Store entry
memory_query(query: MemoryQuery) -> Vec<MemoryResult>
memory_store_conversation(id, messages) -> usize
memory_get_stats() -> MemoryStats
memory_prune(min_importance, min_access) -> usize
memory_delete(entry_id) -> String
memory_rebuild_index() -> String
```

### 1.3. Risques Identifiés

| Risque | Sévérité | Description |
|--------|----------|-------------|
| **Perte de données** | 🔴 Critique | Buffers circulaires (logs 1000, events 500, snapshots 50) = données anciennes perdues |
| **Explosion taille** | 🟡 Moyen | Conversations non compressées, logs verbeux, pas de rotation |
| **Incohérences** | 🟡 Moyen | Pas de validation schéma, pas de migrations automatiques |
| **Corruption** | 🟡 Moyen | Pas de checksums, SelfHeal basique |
| **Fragmentation** | 🟢 Faible | Multiples systèmes mémoire (MemoryModule, MemorySync, MemoryEngine) = duplication |

---

## 🎯 2. MODÈLE CIBLE : MEMORY CORE MULTI-COUCHES

### 2.1. Architecture Tri-Niveaux

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MEMORY CORE ARCHITECTURE                         │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  COURT TERME — Working Set (RAM + disk hot cache)            │ │
│  │                                                               │ │
│  │  • CognitiveSession (session actuelle)                       │ │
│  │  • EmotionSnapshot (état émotionnel en cours)                │ │
│  │  • UIContext (projet sélectionné, mode de travail)           │ │
│  │  • RecentLogs (buffer 100 derniers logs)                     │ │
│  │                                                               │ │
│  │  Fréquence: Lecture/écriture constante (< 1s)                │ │
│  │  Taille: < 5 MB                                              │ │
│  │  Persistence: Sauvegarde toutes les 10s + shutdown           │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  MOYEN TERME — Timeline & Journaux (disk indexed)            │ │
│  │                                                               │ │
│  │  • SessionRecord (sessions passées avec résumés)             │ │
│  │  • DecisionRecord (protocole D.I.S.C.E.R.N.E.R)              │ │
│  │  • EnergyCheckpoint (cycles énergétiques, rituels)           │ │
│  │  • SystemEventRecord (SelfHeal, erreurs, bascules)           │ │
│  │                                                               │ │
│  │  Fréquence: Écriture périodique (1-5 min), lecture rare      │ │
│  │  Taille: 10-100 MB (rotation mensuelle)                      │ │
│  │  Compression: Automatique après 7 jours                      │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  LONG TERME — Knowledge & Life Architecture (disk archived)  │ │
│  │                                                               │ │
│  │  • ProjectArchive (projets majeurs, outcomes)                │ │
│  │  • LifeArchitecture (priorités ÊTRE-FAIRE-AVOIR)             │ │
│  │  • RitualTemplates (protocoles alignement, stress)           │ │
│  │  • DecisionPatterns (templates décisionnels)                 │ │
│  │  • MentalModels (vision Kevin, saisons de vie)               │ │
│  │                                                               │ │
│  │  Fréquence: Écriture rare (semaines), lecture occasionnelle  │ │
│  │  Taille: 50-500 MB (jamais supprimé)                         │ │
│  │  Versioning: Schema v1, v2, v3... avec migrations            │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  🔄 Compression Cognitive (7j → 30j → 1an)                          │
│  🛡️ SelfHeal (validation, checksums, backup auto)                  │
│  📊 DevTools (Memory Explorer, migrations UI)                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2. Types Rust Cibles

#### 2.2.1. Court Terme — Working Set

```rust
// src-tauri/src/memory_core/working_set.rs

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkingSet {
    pub schema_version: u32,  // Pour migrations futures
    pub last_update: i64,

    // Session cognitive actuelle
    pub cognitive_session: CognitiveSession,

    // État émotionnel actuel
    pub emotion_snapshot: EmotionSnapshot,

    // Contexte UI
    pub ui_context: UIContext,

    // Buffer logs récents (100 derniers)
    pub recent_logs: VecDeque<LogEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CognitiveSession {
    pub id: String,
    pub started_at: i64,
    pub mode: WorkMode,  // DeepFocus | Exploration | Flow | Rest
    pub current_project: Option<String>,
    pub active_tasks: Vec<String>,
    pub cognitive_load: f32,  // 0.0-1.0
    pub interruption_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmotionSnapshot {
    pub valence: f32,      // -1.0 (négatif) → 1.0 (positif)
    pub intensity: f32,    // 0.0 (calme) → 1.0 (intense)
    pub energy_level: f32, // 0.0 (épuisé) → 1.0 (énergisé)
    pub clarity: f32,      // 0.0 (confus) → 1.0 (clair)
    pub timestamp: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UIContext {
    pub active_view: String,  // "dashboard" | "chat" | "memory" | "devtools"
    pub selected_project: Option<String>,
    pub filters: HashMap<String, String>,
}
```

#### 2.2.2. Moyen Terme — Timeline & Journaux

```rust
// src-tauri/src/memory_core/timeline.rs

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionRecord {
    pub id: String,
    pub started_at: i64,
    pub ended_at: i64,
    pub duration_secs: u64,

    // Résumé compressé
    pub summary: String,
    pub highlights: Vec<String>,  // Max 5 points clés

    // Métriques
    pub cognitive_load_avg: f32,
    pub emotion_valence_avg: f32,
    pub interruptions: u32,
    pub tasks_completed: u32,

    // Compression cognitive
    pub importance_score: f32,  // 0.0-1.0 (pour pruning futur)
    pub compressed: bool,       // true si déjà compressé
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DecisionRecord {
    pub id: String,
    pub timestamp: i64,
    pub decision: String,

    // Protocole D.I.S.C.E.R.N.E.R (ou autre)
    pub criteria: Vec<DecisionCriterion>,
    pub outcome: Option<String>,
    pub learned: Option<String>,

    // Liens
    pub project_id: Option<String>,
    pub session_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DecisionCriterion {
    pub name: String,       // "Impact long terme", "Alignement valeurs"
    pub weight: f32,        // 0.0-1.0
    pub score: f32,         // 0.0-1.0
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnergyCheckpoint {
    pub id: String,
    pub timestamp: i64,
    pub energy_level: f32,
    pub clarity_level: f32,
    pub ritual_completed: Option<String>,  // "Morning ritual", "Deep work"
    pub notes: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemEventRecord {
    pub id: String,
    pub timestamp: i64,
    pub event_type: SystemEventType,
    pub severity: EventSeverity,
    pub description: String,
    pub action_taken: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SystemEventType {
    SelfHealRepair,
    ModuleCrash,
    StateTransition,
    ConfigChange,
    DataMigration,
}
```

#### 2.2.3. Long Terme — Knowledge & Life Architecture

```rust
// src-tauri/src/memory_core/knowledge.rs

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KnowledgeArchive {
    pub schema_version: u32,
    pub created_at: i64,
    pub last_updated: i64,

    // Projets majeurs
    pub projects: Vec<ProjectArchive>,

    // Architecture de vie
    pub life_architecture: LifeArchitecture,

    // Modèles mentaux
    pub mental_models: Vec<MentalModel>,

    // Templates rituels & décisions
    pub ritual_templates: Vec<RitualTemplate>,
    pub decision_patterns: Vec<DecisionPattern>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectArchive {
    pub id: String,
    pub name: String,
    pub started_at: i64,
    pub completed_at: Option<i64>,
    pub status: ProjectStatus,  // Active | Paused | Completed | Archived

    // Résumé
    pub vision: String,
    pub key_outcomes: Vec<String>,
    pub key_learnings: Vec<String>,

    // Liens
    pub related_decisions: Vec<String>,
    pub sessions_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LifeArchitecture {
    // Quadrants Kevin (Mission, Relations, Santé, Ressources)
    pub quadrants: HashMap<String, QuadrantState>,

    // Priorités ÊTRE-FAIRE-AVOIR
    pub priorities: Priorities,

    // Saisons de vie
    pub current_season: LifeSeason,
    pub season_history: Vec<LifeSeasonRecord>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuadrantState {
    pub name: String,
    pub score: f32,          // 0.0-1.0
    pub focus_areas: Vec<String>,
    pub last_reviewed: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Priorities {
    pub etre: Vec<String>,   // Qui je veux être
    pub faire: Vec<String>,  // Ce que je veux accomplir
    pub avoir: Vec<String>,  // Ce que je veux acquérir
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RitualTemplate {
    pub id: String,
    pub name: String,
    pub description: String,
    pub frequency: RitualFrequency,
    pub steps: Vec<String>,
    pub expected_duration_mins: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RitualFrequency {
    Daily,
    Weekly,
    Monthly,
    AsNeeded,
}
```

### 2.3. Layout de Fichiers Proposé

```
~/.titane_infinity/
├── memory/
│   ├── working/
│   │   ├── working_set.json             # Working set actuel
│   │   └── working_set.json.backup      # Backup automatique
│   │
│   ├── timeline/
│   │   ├── sessions/
│   │   │   ├── 2025-11/
│   │   │   │   ├── sessions_2025-11-01.json.gz
│   │   │   │   ├── sessions_2025-11-02.json.gz
│   │   │   │   └── ...
│   │   │   └── 2025-10/
│   │   │       └── sessions_2025-10.json.gz.compressed
│   │   │
│   │   ├── decisions/
│   │   │   └── decisions_2025.json
│   │   │
│   │   ├── energy/
│   │   │   └── energy_checkpoints_2025.json
│   │   │
│   │   └── system_events/
│   │       └── events_2025-11.json
│   │
│   ├── knowledge/
│   │   ├── knowledge_v2.json            # Version actuelle du schéma
│   │   ├── knowledge_v1.json.archived   # Ancienne version (après migration)
│   │   └── migrations/
│   │       └── migration_v1_to_v2.log
│   │
│   ├── backups/
│   │   ├── auto_backup_2025-11-22_10-30.tar.gz
│   │   └── ...
│   │
│   └── .metadata
│       ├── schema_versions.json         # Registre des versions
│       ├── checksums.json               # Intégrité
│       └── compression_stats.json       # Métriques compression
```

---

## 🗜️ 3. COMPRESSION COGNITIVE

### 3.1. Principes de Compression

**Garder** (Signal):
- ✅ Décisions importantes
- ✅ Enseignements clés
- ✅ Liens avec valeurs/mission
- ✅ Signaux forts (bascules, ruptures, débuts/fins de cycle)
- ✅ Moments de clarté profonde
- ✅ Changements d'état significatifs

**Jeter/Compacter** (Bruit):
- ❌ Logs opérationnels répétitifs
- ❌ Détails techniques éphémères
- ❌ Répétitions sans valeur ajoutée
- ❌ Métriques brutes (garder seulement aggregates)
- ❌ Conversations triviales

### 3.2. Algorithmes de Compression

```rust
// src-tauri/src/memory_core/compression.rs

pub struct CognitiveCompressor {
    emotion_engine: Arc<EmotionEngine>,
    cognitive_engine: Arc<CognitiveEngine>,
}

impl CognitiveCompressor {
    /// Compresse une session terminée
    pub fn compress_session(&self, record: SessionRecord) -> CompressedSessionRecord {
        let importance = self.calculate_importance(&record);

        if importance < 0.3 {
            // Session peu importante → compression agressive
            return CompressedSessionRecord {
                id: record.id,
                date: record.started_at,
                summary: format!("Session {} min", record.duration_secs / 60),
                importance,
                compressed: true,
            };
        }

        // Session importante → garder détails
        CompressedSessionRecord {
            id: record.id,
            date: record.started_at,
            summary: record.summary,
            highlights: record.highlights,
            metrics: Some(SessionMetrics {
                cognitive_load: record.cognitive_load_avg,
                emotion_valence: record.emotion_valence_avg,
            }),
            importance,
            compressed: true,
        }
    }

    /// Calcule l'importance d'une session
    fn calculate_importance(&self, record: &SessionRecord) -> f32 {
        let mut score = 0.0;

        // Durée (sessions longues = plus importantes)
        let duration_hours = record.duration_secs as f32 / 3600.0;
        score += (duration_hours / 4.0).min(0.2);

        // Charge cognitive élevée = travail intense
        if record.cognitive_load_avg > 0.7 {
            score += 0.15;
        }

        // Tâches complétées
        score += (record.tasks_completed as f32 / 10.0).min(0.15);

        // État émotionnel extrême (positif ou négatif)
        let emotion_intensity = record.emotion_valence_avg.abs();
        score += emotion_intensity * 0.2;

        // Peu d'interruptions = flow
        if record.interruptions < 3 {
            score += 0.15;
        }

        // Highlights présents
        if !record.highlights.is_empty() {
            score += 0.15;
        }

        score.clamp(0.0, 1.0)
    }

    /// Compresse une timeline de sessions en milestones
    pub fn compress_timeline(&self, records: Vec<SessionRecord>) -> Vec<Milestone> {
        let mut milestones = Vec::new();

        // Grouper par semaine
        let grouped = self.group_by_week(&records);

        for (week, sessions) in grouped {
            let important_sessions: Vec<_> = sessions.iter()
                .filter(|s| self.calculate_importance(s) > 0.5)
                .collect();

            if !important_sessions.is_empty() {
                milestones.push(Milestone {
                    week,
                    session_count: sessions.len(),
                    key_sessions: important_sessions.iter().map(|s| s.id.clone()).collect(),
                    summary: self.generate_week_summary(important_sessions),
                });
            }
        }

        milestones
    }

    /// Compresse les décisions en résumé
    pub fn compress_decisions(&self, records: Vec<DecisionRecord>) -> DecisionSummary {
        DecisionSummary {
            total_decisions: records.len(),
            by_category: self.categorize_decisions(&records),
            key_learnings: self.extract_key_learnings(&records),
            patterns: self.identify_decision_patterns(&records),
        }
    }
}
```

### 3.3. Heuristiques de Signaux

**Signaux Émotionnels** (via Emotion Engine):
- Intensité émotionnelle > 0.7 → Moment important
- Changement de valence > 0.5 → Bascule émotionnelle
- Clarté > 0.8 → Moment de lucidité

**Signaux Cognitifs** (via Cognitive Engine):
- Charge cognitive 0.6-0.8 → Flow state
- Charge > 0.9 → Surcharge (critique)
- Cohérence 3-centres > 0.7 → Alignement

**Signaux Projet/Mission**:
- Tâche liée à projet majeur → Important
- Décision avec > 5 critères → Structurée, à garder
- Rituel complété → Engagement, à tracker

---

## 🔇 4. NOISE ADAPTIVE — Filtrage du Bruit

### 4.1. Modèle de Bruit

```rust
// src-tauri/src/memory_core/noise_filter.rs

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum NoiseLevel {
    Low,       // Environnement calme
    Medium,    // Usage normal
    High,      // Beaucoup d'activité
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum SignalImportance {
    Low,       // Info de debug, métriques détaillées
    Medium,    // Warnings, events normaux
    High,      // Erreurs, changements d'état
    Critical,  // Crashes, corruptions, alertes sécurité
}

pub struct NoiseFilter {
    current_mode: WorkMode,
    emotion_state: EmotionSnapshot,
    user_preferences: NoisePreferences,
}

impl NoiseFilter {
    /// Filtre les événements selon le contexte
    pub fn filter_events(&self, events: Vec<Event>) -> Vec<Event> {
        let threshold = self.get_importance_threshold();

        events.into_iter()
            .filter(|e| e.importance >= threshold)
            .collect()
    }

    /// Détermine le seuil d'importance selon le mode
    fn get_importance_threshold(&self) -> SignalImportance {
        match self.current_mode {
            WorkMode::DeepFocus => {
                // Mode focus → seulement Critical
                SignalImportance::Critical
            }
            WorkMode::Flow => {
                // Flow → High et Critical
                SignalImportance::High
            }
            WorkMode::Exploration => {
                // Exploration → Medium et au-dessus
                SignalImportance::Medium
            }
            WorkMode::Rest => {
                // Repos → Rien sauf Critical
                SignalImportance::Critical
            }
        }
    }

    /// Ajuste selon l'état émotionnel
    pub fn adjust_for_emotion(&self, base_threshold: SignalImportance) -> SignalImportance {
        // Si intensité émotionnelle élevée → réduire le bruit
        if self.emotion_state.intensity > 0.7 {
            match base_threshold {
                SignalImportance::Low => SignalImportance::Medium,
                SignalImportance::Medium => SignalImportance::High,
                other => other,
            }
        } else {
            base_threshold
        }
    }

    /// Filtre les notifications
    pub fn filter_notifications(&self, notifs: Vec<Notification>) -> Vec<Notification> {
        notifs.into_iter()
            .filter(|n| self.should_show_notification(n))
            .collect()
    }

    fn should_show_notification(&self, notif: &Notification) -> bool {
        // Toujours montrer les critiques
        if notif.importance == SignalImportance::Critical {
            return true;
        }

        // En DeepFocus, bloquer tout sauf Critical
        if self.current_mode == WorkMode::DeepFocus {
            return false;
        }

        // Sinon, appliquer seuil normal
        notif.importance >= self.get_importance_threshold()
    }
}
```

### 4.2. Intégration DevTools & Frontend

```rust
// DevTools: moins de spam
pub fn filter_devtools_logs(logs: Vec<LogEntry>, mode: WorkMode) -> Vec<LogEntry> {
    match mode {
        WorkMode::DeepFocus => {
            // Seulement errors
            logs.into_iter().filter(|l| matches!(l.level, LogLevel::Error)).collect()
        }
        WorkMode::Exploration => {
            // Tout montrer
            logs
        }
        _ => {
            // Warnings et errors
            logs.into_iter()
                .filter(|l| matches!(l.level, LogLevel::Warning | LogLevel::Error))
                .collect()
        }
    }
}
```

---

## 🔄 5. VERSIONING & MIGRATIONS DE SCHÉMA

### 5.1. Système de Versioning

```rust
// src-tauri/src/memory_core/versioning.rs

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchemaMetadata {
    pub schema_version: u32,
    pub created_at: i64,
    pub last_migration: Option<i64>,
    pub cores_involved: Vec<String>,  // ["helios", "nexus", "memory"]
}

// Chaque fichier de mémoire long terme inclut SchemaMetadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VersionedKnowledgeArchive {
    pub metadata: SchemaMetadata,
    pub data: KnowledgeArchive,
}

pub struct MigrationRegistry {
    migrations: HashMap<(u32, u32), Box<dyn Migration>>,  // (from, to) -> migration
}

pub trait Migration: Send + Sync {
    fn name(&self) -> &str;
    fn from_version(&self) -> u32;
    fn to_version(&self) -> u32;
    fn migrate(&self, data: serde_json::Value) -> Result<serde_json::Value, MigrationError>;
}
```

### 5.2. Exemple de Migration

```rust
// Migration v1 → v2: Ajout du champ "priorities" dans LifeArchitecture

pub struct MigrationV1ToV2;

impl Migration for MigrationV1ToV2 {
    fn name(&self) -> &str {
        "Add priorities field to LifeArchitecture"
    }

    fn from_version(&self) -> u32 { 1 }
    fn to_version(&self) -> u32 { 2 }

    fn migrate(&self, mut data: serde_json::Value) -> Result<serde_json::Value, MigrationError> {
        // Ajouter le champ "priorities" avec valeurs par défaut
        if let Some(life_arch) = data.get_mut("life_architecture") {
            life_arch["priorities"] = json!({
                "etre": [],
                "faire": [],
                "avoir": []
            });
        }

        // Mettre à jour schema_version
        data["metadata"]["schema_version"] = json!(2);
        data["metadata"]["last_migration"] = json!(Utc::now().timestamp());

        Ok(data)
    }
}
```

### 5.3. Migration Engine

```rust
pub struct MemoryMigrationEngine {
    registry: MigrationRegistry,
}

impl MemoryMigrationEngine {
    pub fn migrate_all(&self) -> MigrationReport {
        let mut report = MigrationReport::default();

        // Scanner tous les fichiers knowledge
        let knowledge_files = self.scan_knowledge_files();

        for file in knowledge_files {
            match self.migrate_file(&file) {
                Ok(result) => {
                    report.success.push(result);
                }
                Err(e) => {
                    report.failures.push((file, e));
                }
            }
        }

        report
    }

    fn migrate_file(&self, file: &Path) -> Result<MigrationResult, MigrationError> {
        // Lire le fichier
        let content = fs::read_to_string(file)?;
        let data: serde_json::Value = serde_json::from_str(&content)?;

        // Extraire version actuelle
        let current_version = data["metadata"]["schema_version"]
            .as_u64()
            .ok_or(MigrationError::InvalidSchema)? as u32;

        // Trouver le chemin de migration
        let target_version = CURRENT_SCHEMA_VERSION;
        let path = self.find_migration_path(current_version, target_version)?;

        // Appliquer les migrations
        let mut migrated_data = data;
        for (from, to) in path {
            let migration = self.registry.get(&(from, to))
                .ok_or(MigrationError::MigrationNotFound(from, to))?;

            migrated_data = migration.migrate(migrated_data)?;
        }

        // Sauvegarder (avec backup de l'original)
        self.backup_original(file)?;
        fs::write(file, serde_json::to_string_pretty(&migrated_data)?)?;

        Ok(MigrationResult {
            file: file.to_path_buf(),
            from_version: current_version,
            to_version: target_version,
            applied_migrations: path.len(),
        })
    }

    /// Dry run: teste la migration sans écrire
    pub fn dry_run(&self, file: &Path) -> Result<DryRunReport, MigrationError> {
        // Même logique que migrate_file, mais sans fs::write
        todo!()
    }
}
```

---

## 🛡️ 6. INTÉGRATION SELFHEAL & DEVTOOLS

### 6.1. SelfHeal Memory Checks

```rust
// src-tauri/src/selfheal/memory_checks.rs

pub struct MemorySelfHeal {
    memory_core: Arc<MemoryCore>,
}

impl MemorySelfHeal {
    /// Check régulier de l'intégrité mémoire
    pub async fn run_memory_check(&self) -> MemorySelfHealReport {
        let mut report = MemorySelfHealReport::default();

        // 1. Vérifier fichiers manquants
        report.issues.extend(self.check_missing_files().await);

        // 2. Vérifier JSON invalides
        report.issues.extend(self.check_invalid_json().await);

        // 3. Vérifier schémas obsolètes
        report.issues.extend(self.check_obsolete_schemas().await);

        // 4. Vérifier incohérences (index → fichiers)
        report.issues.extend(self.check_inconsistencies().await);

        // 5. Vérifier checksums
        report.issues.extend(self.check_checksums().await);

        // 6. Appliquer auto-réparations
        for issue in &report.issues {
            if issue.auto_repair_available {
                match self.repair_issue(issue).await {
                    Ok(action) => report.actions.push(action),
                    Err(e) => report.failures.push((issue.clone(), e)),
                }
            }
        }

        report.timestamp = Utc::now().timestamp();
        report
    }

    async fn check_missing_files(&self) -> Vec<MemoryIssue> {
        let mut issues = Vec::new();

        // Vérifier que working_set.json existe
        if !self.working_set_exists() {
            issues.push(MemoryIssue {
                severity: IssueSeverity::Critical,
                kind: IssueKind::MissingFile,
                file: "memory/working/working_set.json".into(),
                details: "Working set file missing".into(),
                auto_repair_available: true,
            });
        }

        // Vérifier knowledge.json
        if !self.knowledge_exists() {
            issues.push(MemoryIssue {
                severity: IssueSeverity::High,
                kind: IssueKind::MissingFile,
                file: "memory/knowledge/knowledge_v2.json".into(),
                details: "Knowledge archive missing".into(),
                auto_repair_available: true,
            });
        }

        issues
    }

    async fn check_obsolete_schemas(&self) -> Vec<MemoryIssue> {
        let mut issues = Vec::new();

        // Scanner fichiers knowledge
        let files = self.scan_knowledge_files();

        for file in files {
            if let Ok(version) = self.get_schema_version(&file) {
                if version < CURRENT_SCHEMA_VERSION {
                    issues.push(MemoryIssue {
                        severity: IssueSeverity::Medium,
                        kind: IssueKind::ObsoleteSchema,
                        file: file.display().to_string(),
                        details: format!("Schema v{}, current v{}", version, CURRENT_SCHEMA_VERSION),
                        auto_repair_available: true,  // Déclencher migration
                    });
                }
            }
        }

        issues
    }

    async fn repair_issue(&self, issue: &MemoryIssue) -> Result<RepairAction, RepairError> {
        match issue.kind {
            IssueKind::MissingFile => {
                // Créer fichier avec valeurs par défaut
                self.create_default_file(&issue.file).await?;
                Ok(RepairAction::FileCreated(issue.file.clone()))
            }
            IssueKind::InvalidJson => {
                // Restaurer depuis backup
                self.restore_from_backup(&issue.file).await?;
                Ok(RepairAction::RestoredFromBackup(issue.file.clone()))
            }
            IssueKind::ObsoleteSchema => {
                // Déclencher migration
                self.migrate_file(&issue.file).await?;
                Ok(RepairAction::SchemaMigrated(issue.file.clone()))
            }
            IssueKind::Inconsistency => {
                // Marquer en quarantaine
                self.quarantine_file(&issue.file).await?;
                Ok(RepairAction::Quarantined(issue.file.clone()))
            }
            _ => Err(RepairError::NoRepairAvailable),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryIssue {
    pub severity: IssueSeverity,
    pub kind: IssueKind,
    pub file: String,
    pub details: String,
    pub auto_repair_available: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum IssueKind {
    MissingFile,
    InvalidJson,
    ObsoleteSchema,
    Inconsistency,
    CorruptedChecksum,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemorySelfHealReport {
    pub timestamp: i64,
    pub issues: Vec<MemoryIssue>,
    pub actions: Vec<RepairAction>,
    pub failures: Vec<(MemoryIssue, RepairError)>,
}
```

### 6.2. DevTools: Memory Explorer 2.0

```rust
// src-tauri/src/api/devtools_memory_api.rs

#[tauri::command]
pub async fn list_memory_files(
    memory: tauri::State<'_, MemoryCore>
) -> AppResult<MemoryFileTree> {
    memory.list_all_files().await
}

#[tauri::command]
pub async fn get_memory_file(
    path: String,
    mask_sensitive: bool,
    memory: tauri::State<'_, MemoryCore>
) -> AppResult<MemoryFileContent> {
    let content = memory.read_file(&path).await?;

    if mask_sensitive {
        Ok(MemoryFileContent {
            path,
            content: mask_sensitive_data(content),
            size_bytes: content.len(),
        })
    } else {
        Ok(MemoryFileContent {
            path,
            content,
            size_bytes: content.len(),
        })
    }
}

#[tauri::command]
pub async fn validate_memory_file(
    path: String,
    memory: tauri::State<'_, MemoryCore>
) -> AppResult<ValidationReport> {
    memory.validate_file(&path).await
}

#[tauri::command]
pub async fn run_memory_migration(
    path: Option<String>,
    dry_run: bool,
    memory: tauri::State<'_, MemoryCore>
) -> AppResult<MigrationReport> {
    if dry_run {
        memory.migration_engine.dry_run_all().await
    } else {
        memory.migration_engine.migrate_all().await
    }
}

#[tauri::command]
pub async fn get_memory_growth_stats(
    memory: tauri::State<'_, MemoryCore>
) -> AppResult<MemoryGrowthStats> {
    Ok(MemoryGrowthStats {
        total_size_mb: memory.calculate_total_size().await?,
        by_type: memory.calculate_size_by_type().await?,
        growth_trend: memory.calculate_growth_trend().await?,
    })
}
```

**Vues DevTools**:
- 🗂️ **Arborescence** : `working/`, `timeline/`, `knowledge/`
- 👁️ **Prévisualisation** : JSON avec syntax highlighting (masquage données sensibles)
- 📊 **Graphes de croissance** : Taille par type, nombre de records, tendances
- 🔄 **Migrations** : Voir schémas, dry-run, appliquer avec confirmation
- ✅ **Validation** : Checksums, intégrité, schémas

---

## 📡 7. API TAURI EXPOSÉE

### 7.1. Working Set API (Court Terme)

```rust
#[tauri::command]
pub async fn get_working_set(
    memory: tauri::State<'_, MemoryCore>
) -> AppResult<WorkingSet> {
    memory.get_working_set().await
}

#[tauri::command]
pub async fn save_working_set(
    working_set: WorkingSet,
    memory: tauri::State<'_, MemoryCore>
) -> AppResult<()> {
    memory.save_working_set(working_set).await
}

#[tauri::command]
pub async fn update_cognitive_session(
    session: CognitiveSession,
    memory: tauri::State<'_, MemoryCore>
) -> AppResult<()> {
    memory.update_cognitive_session(session).await
}

#[tauri::command]
pub async fn update_emotion_snapshot(
    snapshot: EmotionSnapshot,
    memory: tauri::State<'_, MemoryCore>
) -> AppResult<()> {
    memory.update_emotion_snapshot(snapshot).await
}
```

### 7.2. Timeline API (Moyen Terme)

```rust
#[tauri::command]
pub async fn get_timeline(
    range: Option<TimeRange>,
    filter: Option<TimelineFilter>,
    memory: tauri::State<'_, MemoryCore>
) -> AppResult<Vec<SessionRecord>> {
    memory.get_timeline(range, filter).await
}

#[tauri::command]
pub async fn add_session_record(
    record: SessionRecord,
    memory: tauri::State<'_, MemoryCore>
) -> AppResult<()> {
    memory.add_session_record(record).await
}

#[tauri::command]
pub async fn get_decision_history(
    filter: Option<DecisionFilter>,
    memory: tauri::State<'_, MemoryCore>
) -> AppResult<Vec<DecisionRecord>> {
    memory.get_decision_history(filter).await
}

#[tauri::command]
pub async fn add_decision(
    decision: DecisionRecord,
    memory: tauri::State<'_, MemoryCore>
) -> AppResult<()> {
    memory.add_decision(decision).await
}

#[tauri::command]
pub async fn get_energy_checkpoints(
    days: u32,
    memory: tauri::State<'_, MemoryCore>
) -> AppResult<Vec<EnergyCheckpoint>> {
    memory.get_energy_checkpoints(days).await
}

#[tauri::command]
pub async fn add_energy_checkpoint(
    checkpoint: EnergyCheckpoint,
    memory: tauri::State<'_, MemoryCore>
) -> AppResult<()> {
    memory.add_energy_checkpoint(checkpoint).await
}
```

### 7.3. Knowledge API (Long Terme)

```rust
#[tauri::command]
pub async fn get_knowledge_snapshot(
    section: Option<String>,
    memory: tauri::State<'_, MemoryCore>
) -> AppResult<KnowledgeArchive> {
    memory.get_knowledge(section).await
}

#[tauri::command]
pub async fn update_life_architecture(
    life_arch: LifeArchitecture,
    memory: tauri::State<'_, MemoryCore>
) -> AppResult<()> {
    memory.update_life_architecture(life_arch).await
}

#[tauri::command]
pub async fn add_project_archive(
    project: ProjectArchive,
    memory: tauri::State<'_, MemoryCore>
) -> AppResult<()> {
    memory.add_project(project).await
}

#[tauri::command]
pub async fn get_ritual_templates(
    memory: tauri::State<'_, MemoryCore>
) -> AppResult<Vec<RitualTemplate>> {
    memory.get_ritual_templates().await
}
```

### 7.4. Maintenance API

```rust
#[tauri::command]
pub async fn run_memory_self_check(
    memory: tauri::State<'_, MemoryCore>
) -> AppResult<MemorySelfHealReport> {
    memory.self_heal.run_memory_check().await
}

#[tauri::command]
pub async fn get_compressed_history(
    memory: tauri::State<'_, MemoryCore>
) -> AppResult<CompressedHistory> {
    memory.compressor.get_compressed_history().await
}

#[tauri::command]
pub async fn trigger_compression(
    days: u32,
    memory: tauri::State<'_, MemoryCore>
) -> AppResult<CompressionReport> {
    memory.compressor.compress_old_data(days).await
}
```

### 7.5. Garanties de Performance

| API | Latence Cible | Notes |
|-----|---------------|-------|
| `get_working_set` | < 50ms | En RAM, chargé au démarrage |
| `save_working_set` | < 100ms | Async write, pas de blocage |
| `get_timeline` | < 200ms | Indexé, pagination |
| `get_knowledge_snapshot` | < 300ms | Lazy load, cache |
| `run_memory_self_check` | < 2s | Async, non-bloquant |
| `trigger_compression` | Background | Job async, progression via events |

---

## 🗺️ 8. PLAN DE REFACTOR & TESTS

### 8.1. Plan de Refactor en 6 Étapes

#### Étape 1: Types & Structures (1 semaine)

**Tâches**:
- Créer `src-tauri/src/memory_core/` avec sous-modules
- Implémenter types: `WorkingSet`, `SessionRecord`, `DecisionRecord`, etc.
- Tests unitaires: sérialisation/desérialisation

**Livrable**: Types complets avec tests passants

#### Étape 2: Memory Core Engine (1 semaine)

**Tâches**:
- Créer `MemoryCore` principal avec tri-niveaux
- Implémenter chargement/sauvegarde Working Set
- Implémenter Timeline persistence (JSON + compression)
- Tests: CRUD operations, circular buffers

**Livrable**: Memory Core fonctionnel (sans compression avancée)

#### Étape 3: Compression Cognitive (1 semaine)

**Tâches**:
- Implémenter `CognitiveCompressor`
- Intégrer Emotion Engine pour signaux
- Algorithmes: `compress_session`, `compress_timeline`
- Tests: vérifier que signaux importants sont gardés

**Livrable**: Compression automatique après 7j

#### Étape 4: Noise Adaptive (3 jours)

**Tâches**:
- Implémenter `NoiseFilter`
- Intégrer avec WorkMode
- Filtrage DevTools, notifications, logs
- Tests: vérifier seuils par mode

**Livrable**: Filtrage adaptatif actif

#### Étape 5: Versioning & Migrations (1 semaine)

**Tâches**:
- Implémenter `MemoryMigrationEngine`
- Créer migrations v1→v2 (exemples)
- Dry-run support
- Tests: migration complète, rollback

**Livrable**: Système de migration opérationnel

#### Étape 6: SelfHeal & DevTools (1 semaine)

**Tâches**:
- Intégrer `MemorySelfHeal`
- Créer API DevTools (13 commands)
- Vue Memory Explorer (React)
- Tests: auto-repair, visualisation

**Livrable**: DevTools Memory complet

#### Étape 7: Migration Données Existantes (3 jours)

**Tâches**:
- Script de migration ancien → nouveau format
- Backups automatiques
- Validation post-migration
- Tests: migration sur données réelles (anonymisées)

**Livrable**: Migration complète, données préservées

### 8.2. Tests Unitaires

```rust
// tests/memory_core/working_set_tests.rs

#[tokio::test]
async fn test_working_set_save_load() {
    let memory = create_test_memory_core();

    let working_set = WorkingSet {
        schema_version: 1,
        last_update: Utc::now().timestamp(),
        cognitive_session: CognitiveSession::default(),
        emotion_snapshot: EmotionSnapshot::default(),
        ui_context: UIContext::default(),
        recent_logs: VecDeque::new(),
    };

    memory.save_working_set(working_set.clone()).await.unwrap();
    let loaded = memory.get_working_set().await.unwrap();

    assert_eq!(loaded.schema_version, working_set.schema_version);
}

#[test]
fn test_compression_importance_calculation() {
    let compressor = CognitiveCompressor::new();

    // Session importante (longue, beaucoup de tâches)
    let important_session = SessionRecord {
        duration_secs: 3600 * 3,  // 3h
        tasks_completed: 8,
        cognitive_load_avg: 0.75,
        emotion_valence_avg: 0.6,
        interruptions: 2,
        highlights: vec!["Décision majeure".into()],
        ..Default::default()
    };

    let importance = compressor.calculate_importance(&important_session);
    assert!(importance > 0.7, "Expected high importance, got {}", importance);

    // Session peu importante
    let trivial_session = SessionRecord {
        duration_secs: 600,  // 10min
        tasks_completed: 0,
        cognitive_load_avg: 0.3,
        emotion_valence_avg: 0.0,
        interruptions: 5,
        highlights: vec![],
        ..Default::default()
    };

    let importance = compressor.calculate_importance(&trivial_session);
    assert!(importance < 0.3, "Expected low importance, got {}", importance);
}

#[test]
fn test_migration_v1_to_v2() {
    let migration = MigrationV1ToV2;

    let v1_data = json!({
        "metadata": {
            "schema_version": 1,
            "created_at": 1700000000
        },
        "life_architecture": {
            "quadrants": {}
        }
    });

    let v2_data = migration.migrate(v1_data).unwrap();

    assert_eq!(v2_data["metadata"]["schema_version"], 2);
    assert!(v2_data["life_architecture"]["priorities"].is_object());
}
```

### 8.3. Tests d'Intégration

```rust
// tests/integration/memory_stress_test.rs

#[tokio::test]
async fn test_one_month_simulation() {
    let memory = create_test_memory_core();

    // Simuler 30 jours d'utilisation
    for day in 0..30 {
        // 3-5 sessions par jour
        for _ in 0..(3 + day % 3) {
            let session = create_random_session();
            memory.add_session_record(session).await.unwrap();
        }

        // 1-2 décisions par jour
        if day % 2 == 0 {
            let decision = create_random_decision();
            memory.add_decision(decision).await.unwrap();
        }

        // Energy checkpoint chaque jour
        let checkpoint = create_random_checkpoint();
        memory.add_energy_checkpoint(checkpoint).await.unwrap();
    }

    // Vérifications
    let timeline = memory.get_timeline(None, None).await.unwrap();
    assert!(timeline.len() >= 90);  // Au moins 3 sessions/jour

    let decisions = memory.get_decision_history(None).await.unwrap();
    assert!(decisions.len() >= 15);

    // Vérifier compression automatique
    let compressed = memory.get_compressed_history().await.unwrap();
    assert!(compressed.compression_ratio > 0.5);
}

#[tokio::test]
async fn test_crash_recovery() {
    let memory = create_test_memory_core();

    // Simuler session active
    let mut working_set = memory.get_working_set().await.unwrap();
    working_set.cognitive_session.active_tasks = vec!["Task 1".into(), "Task 2".into()];
    memory.save_working_set(working_set.clone()).await.unwrap();

    // Simuler crash (drop memory)
    drop(memory);

    // Restart
    let memory = create_test_memory_core();
    let recovered = memory.get_working_set().await.unwrap();

    assert_eq!(recovered.cognitive_session.active_tasks.len(), 2);
}

#[tokio::test]
async fn test_selfheal_corrupted_file() {
    let memory = create_test_memory_core();

    // Corrompre volontairement un fichier
    let working_set_path = memory.get_working_set_path();
    fs::write(working_set_path, "{ invalid json }").unwrap();

    // Run SelfHeal
    let report = memory.self_heal.run_memory_check().await.unwrap();

    // Vérifier qu'il a détecté le problème
    assert!(report.issues.iter().any(|i| matches!(i.kind, IssueKind::InvalidJson)));

    // Vérifier qu'il a réparé
    assert!(report.actions.iter().any(|a| matches!(a, RepairAction::RestoredFromBackup(_))));

    // Vérifier que le fichier est maintenant valide
    let working_set = memory.get_working_set().await.unwrap();
    assert!(working_set.schema_version > 0);
}
```

### 8.4. Lien avec la Philosophie de Kevin

**Clarté** :
- Compression Cognitive = **tri du signal/bruit** (gardant ce qui compte vraiment)
- Noise Adaptive = **moins de distractions**, plus de focus
- Timeline compressée = **vue d'ensemble claire** sur les cycles

**Cycles & Rituels** :
- `EnergyCheckpoint` = tracking des cycles énergétiques de Kevin
- `RitualTemplate` = rituals structurés (matin, deep work, etc.)
- Saisons de vie = reflet des phases longues

**Divergence → Connexion → Structuration** :
- Timeline = **divergence** (exploration, beaucoup d'événements)
- Compression = **connexion** (liens entre sessions, patterns)
- Knowledge Archive = **structuration** (synthèse en projets, modèles mentaux)

**Décisions Structurées** :
- `DecisionRecord` avec critères = protocole D.I.S.C.E.R.N.E.R
- Apprentissage des patterns de décision
- Templates décisionnels = réutilisables

**Mémoire Fiable** :
- Versioning = **aucune perte de données sur années**
- SelfHeal = **auto-réparation**, pas de stress
- Backup automatique = **tranquillité d'esprit**

---

## 📚 Références

- [overview.md](./overview.md) — Introduction
- [api-tauri.md](./api-tauri.md) — API complète
- [contribution-guide.md](./contribution-guide.md) — Ajouter du code
- [performance.md](./performance.md) — Optimisations async

---

**TITANE∞** — *"L'architecture claire est la première ligne de défense contre la complexité."*
