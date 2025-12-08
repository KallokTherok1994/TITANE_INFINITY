# TITANE∞ Backend Architecture v17.3.0

**Vision** : Plateforme cognitive locale auto-évolutive
**Status** : ✅ Production-Ready (avec roadmap P1-P3)
**Date** : 22 novembre 2025

---

## 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (React 18 + Tauri v2)            │
│                        Node 20+ / Vite 6                     │
└───────────────────────────┬─────────────────────────────────┘
                            │ tauri::invoke()
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      TAURI API LAYER                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Core Commands (17)         Legacy Bridge (13)      │   │
│  │  helios_api, memory_api,    DEPRECATED v17.3.0      │   │
│  │  engine_api, system_api     → Erreurs explicites    │   │
│  │  + Persona Engine (6)                               │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                     APPLICATION STATE                        │
│              TitaneApp (app/setup.rs)                        │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Core Modules:  Helios, Nexus, Harmonia,         │     │
│  │                 Sentinel, Memory                   │     │
│  │  Engine:        AutoEvolution                      │     │
│  │  Extensions:    PersonaEngine (v24)               │     │
│  └────────────────────────────────────────────────────┘     │
└──────────┬──────────────┬──────────────┬────────────────────┘
           │              │              │
┌──────────▼────┐  ┌─────▼──────┐  ┌───▼──────────┐
│  CORE (5)     │  │ ENGINE (4) │  │ SERVICES (3) │
│               │  │            │  │              │
│  • Helios    │  │ • AutoEvol │  │ • System     │
│  • Nexus     │  │ • Diagnost │  │ • IO         │
│  • Harmonia  │  │ • Repair   │  │ • Storage    │
│  • Sentinel  │  │ • HealthCk │  │              │
│  • Memory    │  │            │  │              │
└───────────────┘  └────────────┘  └──────────────┘
        │                 │                │
        └─────────────────┴────────────────┘
                          │
┌─────────────────────────▼─────────────────────────┐
│             UTILITIES & TYPES                     │
│  • utils/    → AppError, AppResult, logging       │
│  • types/    → Tous les modèles de données        │
│    └─ shared.rs ✨ Types unifiés (v17.3.0)       │
└───────────────────────────────────────────────────┘
```

---

## 📦 MODULES CORE

### **Helios** — System Monitoring
**Fichier** : `core/helios.rs`
**Responsabilité** : Métriques système temps réel

```rust
pub struct HeliosCore {
    system: SystemService,
}

impl HeliosCore {
    pub async fn collect(&self) -> AppResult<HeliosState>
}
```

**État retourné** :
- CPU usage (%)
- RAM usage (%, total GB, used GB)
- Disk usage (%, total GB, used GB)
- Uptime (secondes)
- Load average (1min, 5min, 15min)
- Timestamp

**Commande Tauri** : `get_helios_state()`

---

### **Nexus** — Module Coherence
**Fichier** : `core/nexus.rs`
**Responsabilité** : Enregistrement modules, cohérence globale

```rust
pub struct NexusCore {
    modules: Arc<RwLock<HashMap<String, ModuleStatus>>>,
}

impl NexusCore {
    pub fn register_module(&self, name: String) -> AppResult<()>
    pub fn update_module(&self, name: &str, health: HealthStatus, msg: String) -> AppResult<()>
    pub async fn validate(&self) -> AppResult<NexusState>
}
```

**État retourné** :
- Map de tous les modules (name → status)
- Score de cohérence (0-100)
- Connexions actives
- Health global

**Commande Tauri** : `get_nexus_state()`

---

### **Harmonia** — System Balancing
**Fichier** : `core/harmonia.rs`
**Responsabilité** : Détection de pression, stabilisation

```rust
pub struct HarmoniaCore {}

impl HarmoniaCore {
    pub async fn balance(&self, helios: &HeliosState) -> AppResult<HarmoniaState>
}
```

**État retourné** :
- Niveau de stabilisation (Optimal, Balanced, Stressed, Critical)
- Pression système (0-100)
- Prédiction de stabilité
- Recommandations d'ajustement

**Commande Tauri** : `get_harmonia_state()`

---

### **Sentinel** — Anomaly Detection
**Fichier** : `core/sentinel.rs`
**Responsabilité** : Scan d'anomalies, alertes, intégrité

```rust
pub struct SentinelCore {}

impl SentinelCore {
    pub async fn scan(&self, helios: &HeliosState) -> AppResult<SentinelState>
}
```

**État retourné** :
- Alertes actives (severity: Low/Medium/High/Critical)
- Score d'intégrité (0-100)
- Patterns détectés
- Timestamp dernier scan

**Commande Tauri** : `get_sentinel_state()`

---

### **Memory** — Unified Storage
**Fichier** : `core/memory.rs`
**Responsabilité** : Snapshots, logs, timeline, persistence

```rust
pub struct MemoryCore {
    storage: StorageService,
    state: Arc<RwLock<MemoryState>>,
}

impl MemoryCore {
    pub async fn write_snapshot(&self, snapshot: Snapshot) -> AppResult<()>
    pub async fn read_snapshot(&self) -> AppResult<Option<Snapshot>>
    pub async fn write_log(&self, log: LogEntry) -> AppResult<()>
    pub async fn read_logs(&self, count: usize) -> AppResult<Vec<LogEntry>>
    pub async fn add_event(&self, event: TimelineEvent) -> AppResult<()>
    pub async fn get_state(&self) -> AppResult<MemoryState>
}
```

**Commandes Tauri** :
- `get_memory_state()`
- `write_snapshot(Snapshot)`
- `read_snapshot()`
- `write_log(LogEntry)`
- `read_logs(count)`
- `add_timeline_event(TimelineEvent)`

---

## ⚙️ ENGINE AUTO-EVOLUTION

### Pipeline d'Évolution

```
1. collect()   → Récupère états (Helios, Nexus, Harmonia, Sentinel)
2. diagnose()  → Analyse et génère EvolutionReport (issues + recommendations)
3. decide()    → Priorise recommendations par severity
4. repair()    → Applique top 3 actions correctives
5. record()    → Sauvegarde résultats dans Memory + historique
```

### **AutoEvolutionEngine**
**Fichier** : `engine/auto_evolution.rs`

```rust
pub struct AutoEvolutionEngine {
    diagnostics: DiagnosticsEngine,
    repair: RepairEngine,
    health_check: HealthCheckEngine,
    state: Arc<RwLock<EvolutionState>>,
}

impl AutoEvolutionEngine {
    pub async fn evolve(
        &self,
        helios: &HeliosState,
        nexus: &NexusState,
        harmonia: &HarmoniaState,
        sentinel: &SentinelState,
    ) -> AppResult<EvolutionReport>

    pub async fn get_state(&self) -> AppResult<EvolutionState>

    pub async fn quick_health_check(...) -> AppResult<HealthStatus>
}
```

**Commandes Tauri** :
- `run_evolution()` → Lance cycle complet
- `get_evolution_state()` → État actuel + historique
- `quick_health_check()` → Healthy/Warning/Critical

### **DiagnosticsEngine**
**Fichier** : `engine/diagnostics.rs`

Génère des `Issue` avec severity (Low/Medium/High/Critical) et catégorie (System/Memory/Network/Performance/Security).

### **RepairEngine**
**Fichier** : `engine/repair.rs`

Actions disponibles :
- `RestartModule`
- `AdjustThreshold`
- `ClearCache`
- `Rebalance`
- `Log`

⚠️ **TODO P1.4** : Ajouter rollback/compensation (saga pattern)

### **HealthCheckEngine**
**Fichier** : `engine/health_check.rs`

Calcule score global (0-100) et status (Healthy > 80, Warning 40-80, Critical < 40).

---

## 🔧 SERVICES

### **SystemService**
**Fichier** : `services/system_service.rs`

Wrapper autour de `sysinfo` :
- `get_cpu_usage() -> AppResult<f64>`
- `get_ram_usage() -> AppResult<(f64, f64, f64)>`
- `get_disk_usage() -> AppResult<(f64, f64, f64)>`
- `get_uptime() -> AppResult<u64>`
- `get_load_average() -> AppResult<(f64, f64, f64)>`

### **IoService**
**Fichier** : `services/io_service.rs`

Lecture/écriture fichiers sécurisée avec validation de chemins.

⚠️ **TODO P2.1** : Migrer vers `tokio::fs` (async)

### **StorageService**
**Fichier** : `services/storage_service.rs`

Persistence JSON pour snapshots, logs, configuration.

---

## 📊 TYPES SYSTÈME

### **Types Unifiés v17.3.0** ✨

**Fichier** : `types/shared.rs`

```rust
/// Health status unifié (core + legacy)
pub enum HealthStatus {
    Healthy,
    #[serde(alias = "Warning")]
    Degraded,
    Critical,
    Offline,
}

/// Informations santé module complètes
pub struct ModuleHealthInfo {
    pub name: String,
    pub status: HealthStatus,
    pub uptime: u64,
    pub last_tick: u64,
    pub message: String,
}

/// Métriques système
pub struct SystemMetrics {
    pub cpu_usage: f32,
    pub memory_usage: f32,
    pub disk_usage: f32,
    pub uptime: u64,
}

/// Niveau de log
pub enum LogLevel {
    Info, Warning, Error, Debug
}
```

### **Migration depuis shared/types**

⚠️ `shared/types.rs` est **DEPRECATED** en v17.3.0

**Avant** :
```rust
use crate::shared::types::{HealthStatus, ModuleHealth};
```

**Après** :
```rust
use crate::types::shared::{HealthStatus, ModuleHealthInfo};
// ou
use crate::types::{HealthStatus, ModuleHealthInfo};
```

Voir guide complet : `types/TYPES_MIGRATION_GUIDE.md`

---

## 🌐 API TAURI

### Commandes Core (17 actives)

| Command | Module | Return | Description |
|---------|--------|--------|-------------|
| `get_helios_state` | Helios | `HeliosState` | Métriques système |
| `get_system_health` | Helios | `HealthStatus` | Status santé global |
| `get_memory_state` | Memory | `MemoryState` | État mémoire |
| `write_snapshot` | Memory | `()` | Sauvegarder snapshot |
| `read_snapshot` | Memory | `Option<Snapshot>` | Charger snapshot |
| `write_log` | Memory | `()` | Écrire log |
| `read_logs` | Memory | `Vec<LogEntry>` | Lire logs |
| `add_timeline_event` | Memory | `()` | Ajouter événement |
| `run_evolution` | Engine | `EvolutionReport` | Cycle auto-évolution |
| `get_evolution_state` | Engine | `EvolutionState` | État évolution |
| `quick_health_check` | Engine | `HealthStatus` | Check rapide |
| `get_full_system_state` | System | `SystemState` | État complet |
| `get_nexus_state` | System | `NexusState` | État Nexus |
| `get_harmonia_state` | System | `HarmoniaState` | État Harmonia |
| `get_sentinel_state` | System | `SentinelState` | État Sentinel |

### Persona Engine (6 commandes)

| Command | Description |
|---------|-------------|
| `persona_initialize` | Init persona engine |
| `persona_get_state` | État persona |
| `persona_update` | Update persona |
| `persona_react` | Réaction persona |
| `persona_reset` | Reset persona |
| `persona_get_multipliers` | Multiplicateurs |

### Legacy Commands (13 deprecated)

⚠️ **Toutes retournent des erreurs explicites en v17.3.0**

Voir `api/legacy_commands.rs` pour mappings vers nouvelles commandes.

---

## 🛡️ GESTION DES ERREURS

### AppError (Unifié)

**Fichier** : `utils/error.rs`

```rust
#[derive(Debug, thiserror::Error, Serialize, Deserialize)]
pub enum AppError {
    #[error("Internal error: {0}")]
    Internal(String),

    #[error("System error: {0}")]
    System(String),

    #[error("Memory error: {0}")]
    Memory(String),

    #[error("Evolution error: {0}")]
    Evolution(String),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("IO error: {0}")]
    Io(String),

    #[error("Network error: {0}")]
    Network(String),

    #[error("Parse error: {0}")]
    Parse(String),

    #[error("Not found: {0}")]
    NotFound(String),
}

pub type AppResult<T> = Result<T, AppError>;
```

**Conversions automatiques** :
- `From<std::io::Error>`
- `From<serde_json::Error>`

**Usage** :
```rust
pub async fn ma_fonction() -> AppResult<String> {
    let data = tokio::fs::read_to_string(path).await?;  // Auto-convert
    let parsed: Value = serde_json::from_str(&data)?;   // Auto-convert
    Ok(parsed.to_string())
}
```

---

## 🧪 TESTING

### Tests Unitaires

Présents dans chaque module avec `#[cfg(test)]`.

**Exemple** :
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_helios_collect() {
        let helios = HeliosCore::new();
        let state = helios.collect().await.unwrap();

        assert!(state.cpu_usage >= 0.0 && state.cpu_usage <= 100.0);
    }
}
```

### Tests d'Intégration (Recommandés)

```bash
# Lancer tous les tests
cargo test

# Tests spécifiques
cargo test --test integration_test

# Avec output
cargo test -- --nocapture
```

---

## 📈 PERFORMANCE

### Optimisations Appliquées

1. **Async Native**
   - tokio runtime avec "full" features
   - Tous les I/O en async (à finaliser P2.1)

2. **Smart Locking**
   - `tokio::sync::RwLock` au lieu de `std::sync::RwLock`
   - `Arc` pour partage thread-safe
   - Lock scope minimal

3. **Cargo Release Profile**
```toml
[profile.release]
panic = "abort"
codegen-units = 1
lto = true
opt-level = "z"
```

### Métriques (v17.3.0)

| Métrique | Valeur | Target v18.0 |
|----------|--------|--------------|
| Startup time | ~500ms | <300ms |
| Evolution cycle | ~100ms | <50ms |
| Memory footprint | ~50MB | <40MB |
| CPU idle | <5% | <3% |

---

## 🔐 SÉCURITÉ

### Mesures Implémentées

1. **Path Validation** : IoService canonicalise tous chemins
2. **JSON Only** : Pas d'exécution de code arbitraire
3. **App Data Dir** : Isolation filesystem via Tauri
4. **No Shell** : Aucune commande système directe
5. **Input Validation** : Types Rust stricts
6. **Buffer Limits** : Logs/snapshots avec taille max
7. **Error Messages** : Pas de stack traces sensibles au frontend

⚠️ **TODO P2.2** : Rate limiting sur API

---

## 🚀 ROADMAP

### v17.3.0 (Actuel)
- ✅ Types unifiés
- ✅ Legacy deprecated
- ✅ Unwrap cleanup partiel
- 🚧 P1.4-P1.5 en cours

### v17.4.0 (Décembre 2025)
- ✅ P1 complet (rollback, concurrency)
- ✅ P2.1-P2.4 (async IO, rate limiting, docs)
- ✅ Tests coverage > 50%

### v18.0.0 (Janvier 2026) — "Production Hardened"
- ✅ Suppression legacy commands
- ✅ P2 complet
- ✅ P3.1 (tracing)
- ✅ P3.5 (cleanup system/)
- ✅ Tests coverage > 60%
- ✅ CI/CD complet

---

## 📚 DOCUMENTATION

- **Architecture** : Ce fichier
- **Refactor Report** : `BACKEND_REFACTOR_REPORT_v17.3.0.md`
- **Types Migration** : `types/TYPES_MIGRATION_GUIDE.md`
- **API Reference** : `cargo doc --open`
- **Original** : `BACKEND_ARCHITECTURE.md` (v17.2.0 baseline)

---

## 🤝 CONTRIBUTION

Voir guidelines détaillées dans `BACKEND_REFACTOR_REPORT_v17.3.0.md` section "Guidelines de Contribution".

**Principes clés** :
- ✅ Toujours `AppResult<T>`
- ❌ Jamais `.unwrap()` ou `.expect()`
- ✅ Déléguer logique métier au core
- ✅ Logger avec contexte
- ✅ Tests unitaires requis
- ✅ Documentation inline

---

**Maintenu par** : Kevin Thibault
**Architecture par** : Claude Sonnet 4.5
**Dernière mise à jour** : 22 novembre 2025
