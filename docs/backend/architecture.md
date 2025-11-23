# 🏗️ TITANE∞ Backend — Architecture Détaillée

**Diagrammes, flux de données, patterns de conception.**

Temps de lecture : 20 minutes.
Prérequis : Avoir lu [overview.md](./overview.md).

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

## 📚 Références

- [overview.md](./overview.md) — Introduction
- [api-tauri.md](./api-tauri.md) — API complète
- [contribution-guide.md](./contribution-guide.md) — Ajouter du code
- [performance.md](./performance.md) — Optimisations async

---

**TITANE∞** — *"L'architecture claire est la première ligne de défense contre la complexité."*
