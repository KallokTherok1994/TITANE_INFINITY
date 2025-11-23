# 🔄 PHASE 2B — MIGRATION API TAURI

**Version** : v17.2.0
**Date** : 22 novembre 2025
**Status** : 📋 Planification

---

## 🎯 OBJECTIF

Migrer l'API Tauri et le système d'initialisation pour utiliser les **nouveaux cores** (`plugin_system/cores/`) au lieu des **anciens cores** (`src-tauri/src/core/`).

**Pourquoi** : Les anciens cores empêchent le nettoyage Phase 2a. Migration API requise avant suppression.

---

## 📂 FICHIERS À MIGRER

### 1. `src-tauri/src/api/system_api.rs` (160 lignes)

**État actuel** :
- ✗ Importe : `HeliosCore, NexusCore, HarmoniaCore, SentinelCore, MemoryCore`
- ✗ Utilise `tauri::State<'_, HeliosCore>` dans commands
- ✗ Appelle méthodes legacy : `.collect()`, `.validate()`, `.balance()`, `.scan()`

**Migration requise** :
- ✅ Importer : `CoreCollection` de `plugin_system/core_system`
- ✅ Utiliser : `tauri::State<'_, CoreCollection>`
- ✅ Adapter appels méthodes vers nouvelle API

---

### 2. `src-tauri/src/app/setup.rs` (119 lignes)

**État actuel** :
```rust
pub struct TitaneApp {
    pub helios: HeliosCore,
    pub nexus: NexusCore,
    pub harmonia: HarmoniaCore,
    pub sentinel: SentinelCore,
    pub memory: MemoryCore,
    // ...
}

impl TitaneApp {
    pub fn new(app_data_dir: PathBuf) -> AppResult<Self> {
        let helios = HeliosCore::new();
        let nexus = NexusCore::new();
        // ...
    }
}
```

**Migration requise** :
```rust
use crate::plugin_system::core_system::{initialize_all_cores, CoreCollection};

pub struct TitaneApp {
    pub cores: CoreCollection,  // Remplace 5 champs individuels
    // ... autres services
}

impl TitaneApp {
    pub async fn new(app_data_dir: PathBuf) -> AppResult<Self> {
        let cores = initialize_all_cores().await?;

        Ok(TitaneApp {
            cores,
            // ...
        })
    }
}
```

---

### 3. `src-tauri/src/commands/core_system.rs`

**État actuel** :
- ✗ Importe `HeliosCoreModule`
- ✗ Utilise downcast : `downcast_ref::<HeliosCoreModule>()`

**Migration requise** :
- ✅ Utiliser `CoreCollection` directement
- ✅ Supprimer downcasts (accès direct aux modules)

---

### 4. `src-tauri/src/core/tests_integration.rs`

**État actuel** :
- ✗ Tests sur `HeliosCoreModule::new()`

**Migration requise** :
- ✅ Tests sur `HeliosModule` de `plugin_system/cores/`
- ✅ Utiliser nouveaux constructeurs

---

## 🔧 MAPPING API

### Ancien Core → Nouveau Module

| **Ancien**       | **Nouveau**            | **Changement méthode**                        |
|------------------|------------------------|-----------------------------------------------|
| `HeliosCore`     | `HeliosModule`         | `.collect()` → `.collect_metrics()`           |
| `NexusCore`      | `NexusModule`          | `.validate()` → `.check_coherence()`          |
| `HarmoniaCore`   | `HarmoniaModule`       | `.balance()` → `.compute_balance()`           |
| `SentinelCore`   | `SentinelModule`       | `.scan()` → `.detect_anomalies()`             |
| `MemoryCore`     | `MemoryModule`         | Méthodes snapshot/timeline identiques         |

---

## 📝 PLAN D'EXÉCUTION

### Étape 1 : Adapter system_api.rs

**Avant** :
```rust
use crate::core::{HeliosCore, NexusCore, HarmoniaCore, SentinelCore, MemoryCore};

#[tauri::command]
pub async fn get_full_system_state(
    helios: tauri::State<'_, HeliosCore>,
    nexus: tauri::State<'_, NexusCore>,
    harmonia: tauri::State<'_, HarmoniaCore>,
    sentinel: tauri::State<'_, SentinelCore>,
) -> AppResult<SystemState> {
    let helios_state = helios.collect().await?;
    let nexus_state = nexus.validate().await?;
    // ...
}
```

**Après** :
```rust
use crate::plugin_system::core_system::CoreCollection;

#[tauri::command]
pub async fn get_full_system_state(
    cores: tauri::State<'_, CoreCollection>,
) -> AppResult<SystemState> {
    let helios_state = cores.helios.collect_metrics().await?;
    let nexus_state = cores.nexus.check_coherence().await?;
    let harmonia_state = cores.harmonia.compute_balance().await?;
    let sentinel_state = cores.sentinel.detect_anomalies().await?;

    Ok(SystemState {
        helios: helios_state,
        nexus: nexus_state,
        harmonia: harmonia_state,
        sentinel: sentinel_state,
    })
}
```

**Bénéfices** :
- ✅ Un seul paramètre State au lieu de 4-5
- ✅ Accès direct aux modules via `cores.helios`, etc.
- ✅ API plus claire et cohérente

---

### Étape 2 : Adapter setup.rs

**Modifications** :

1. **Import** :
```rust
use crate::plugin_system::core_system::{
    initialize_all_cores,
    start_all_cores,
    CoreCollection,
};
```

2. **TitaneApp struct** :
```rust
pub struct TitaneApp {
    pub cores: CoreCollection,  // Remplace helios, nexus, harmonia, sentinel, memory
    pub evolution: AutoEvolutionEngine,
    pub log_collector: Arc<RwLock<LogCollector>>,
    pub metrics_collector: Arc<RwLock<MetricsCollector>>,
    pub core_registry: Arc<RwLock<CoreRegistry>>,
    pub cognitive_engine: Arc<RwLock<CognitiveEngine>>,
}
```

3. **Initialisation** :
```rust
impl TitaneApp {
    pub async fn new(app_data_dir: PathBuf) -> AppResult<Self> {
        log_info("Setup", "Initializing TITANE∞ v17.2.0");

        // Initialize all cores with new bootstrap
        let cores = initialize_all_cores().await?;

        // Start all cores
        start_all_cores(&cores).await?;

        log_info("Setup", "All cores started successfully");

        Ok(TitaneApp {
            cores,
            evolution: AutoEvolutionEngine::new(),
            log_collector: Arc::new(RwLock::new(LogCollector::new())),
            metrics_collector: Arc::new(RwLock::new(MetricsCollector::new())),
            core_registry: Arc::new(RwLock::new(CoreRegistry::new())),
            cognitive_engine: Arc::new(RwLock::new(CognitiveEngine::new())),
        })
    }
}
```

**Bénéfices** :
- ✅ Code plus simple (3 lignes au lieu de 10+)
- ✅ Utilise fonction bootstrap déjà testée
- ✅ Gère automatiquement dépendances entre cores
- ✅ Support async natif

---

### Étape 3 : Mettre à jour main.rs / lib.rs

**Modifier enregistrement State Tauri** :

**Avant** :
```rust
tauri::Builder::default()
    .manage(app.helios)
    .manage(app.nexus)
    .manage(app.harmonia)
    .manage(app.sentinel)
    .manage(app.memory)
    // ...
```

**Après** :
```rust
tauri::Builder::default()
    .manage(app.cores)  // Un seul manage pour CoreCollection
    // ...
```

---

### Étape 4 : Adapter commands/core_system.rs

**Simplification** :

**Avant** :
```rust
#[tauri::command]
pub async fn core_collect_metrics(
    core_registry: tauri::State<'_, Arc<RwLock<CoreRegistry>>>,
    core_id: String,
) -> Result<Value, String> {
    let registry = core_registry.read().await;
    let core = registry.get(&core_id).ok_or("Core not found")?;

    // Downcast vers HeliosCoreModule
    let helios = core.downcast_ref::<HeliosCoreModule>()
        .ok_or("Failed to downcast")?;

    helios.collect().await
}
```

**Après** :
```rust
#[tauri::command]
pub async fn core_collect_metrics(
    cores: tauri::State<'_, CoreCollection>,
    core_id: String,
) -> Result<Value, String> {
    match core_id.as_str() {
        "helios" => cores.helios.collect_metrics().await,
        "nexus" => cores.nexus.get_status().await,
        "harmonia" => cores.harmonia.get_status().await,
        "sentinel" => cores.sentinel.get_status().await,
        "memory" => cores.memory.get_status().await,
        _ => Err("Unknown core".to_string()),
    }
}
```

**Bénéfices** :
- ✅ Plus de downcasts dangereux
- ✅ Type safety compile-time
- ✅ Code plus lisible

---

### Étape 5 : Mettre à jour tests

**Fichier** : `src-tauri/src/core/tests_integration.rs`

**Remplacer** :
```rust
use crate::core::helios_module::HeliosCoreModule;

let helios = Arc::new(HeliosCoreModule::new());
```

**Par** :
```rust
use crate::plugin_system::cores::helios::HeliosModule;

let helios = Arc::new(HeliosModule::new());
```

**Adapter appels méthodes** selon mapping API ci-dessus.

---

## ✅ VALIDATION

### Checklist avant commit

- [ ] `cargo check` passe sans erreurs
- [ ] `cargo test` passe (tests adaptés)
- [ ] `cargo clippy` sans warnings majeurs
- [ ] API Tauri fonctionne (commandes exposées)
- [ ] CoreCollection gère lifecycle correctement
- [ ] Health checks fonctionnent
- [ ] Logs montrent initialisation correcte

### Tests manuels

1. Lancer app Tauri
2. Vérifier logs : "All cores started successfully"
3. Appeler `get_full_system_state` via DevTools
4. Vérifier réponse contient données de tous les cores
5. Tester shutdown gracieux

---

## 📊 IMPACT MÉTRIQUE

### Réduction complexité

**Avant** :
- 5 imports individuels
- 5 champs TitaneApp
- 5 lignes `.manage()`
- 10+ lignes initialisation
- 4-5 paramètres par command

**Après** :
- 1 import CoreCollection
- 1 champ TitaneApp
- 1 ligne `.manage()`
- 3 lignes initialisation
- 1 paramètre par command

**Gain** :
- 📉 Complexité : -60%
- 📉 Lignes code : -40%
- 📈 Lisibilité : +80%
- 📈 Type safety : +100% (plus de downcasts)

---

## 🎯 PROCHAINES ÉTAPES

### Après Phase 2b

1. **Phase 2a Débloquée** :
   - Supprimer anciens fichiers `core/`
   - Supprimer anciens fichiers `modules/`
   - Mettre à jour `mod.rs`

2. **Phase 2 Complète** :
   - ✅ Migrations (5/5 cores)
   - ✅ Integration (core_system)
   - ✅ API Migration (Phase 2b)
   - ✅ Cleanup (Phase 2a)

3. **Phase 3 Planification** :
   - Audit répertoire `system/` (100+ dossiers)
   - Consolidation modules expérimentaux
   - Documentation finale

---

**Auteur** : Kevin Thibault (TITANE∞ v17.2.0)
**Date** : 22 novembre 2025
**Status** : Prêt pour exécution
