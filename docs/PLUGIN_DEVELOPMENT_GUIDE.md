# TITANE∞ v17.2.0 — Plugin Development Guide

**Guide complet pour créer des modules Core personnalisés dans le système modulaire**

## Table des matières

1. [Introduction au système modulaire](#introduction)
2. [Anatomie d'un Core Module](#anatomie)
3. [Guide pas-à-pas : Créer votre premier Core](#premier-core)
4. [Configuration et Lifecycle](#lifecycle)
5. [Dépendances entre Cores](#dépendances)
6. [Métriques et Observabilité](#métriques)
7. [Profils système et déploiement](#profils)
8. [Best Practices](#best-practices)
9. [Exemples avancés](#exemples)

---

## 1. Introduction au système modulaire

TITANE∞ v17.2.0 introduit une architecture modulaire complète permettant aux développeurs de créer des **Core Modules** personnalisés qui s'intègrent nativement dans l'écosystème.

### Concepts clés

- **CoreModule trait** : Interface unifiée pour tous les modules
- **CoreRegistry** : Gestionnaire de dépendances avec graphe topologique
- **CoreOrchestrator** : Chef d'orchestre gérant le cycle de vie
- **EventBus** : Communication asynchrone entre Cores
- **Profiles** : Configurations prédéfinies (minimal, standard, extended, lab)

### Architecture

```
┌─────────────────────────────────────────┐
│       CoreOrchestrator                  │
│  (Lifecycle management + Health)        │
└─────────────┬───────────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
┌───▼─────┐      ┌──────▼──────┐
│CoreReg. │◄─────┤  EventBus   │
│(Deps)   │      │ (Pub/Sub)   │
└───┬─────┘      └─────────────┘
    │
    │ Manages
    ▼
┌────────────────────────────────┐
│  Core Modules (Implementing    │
│  CoreModule trait)              │
│                                 │
│  - Helios                       │
│  - Nexus                        │
│  - Harmonia                     │
│  - Sentinel                     │
│  - Your Custom Core ✨          │
└─────────────────────────────────┘
```

---

## 2. Anatomie d'un Core Module

Chaque Core Module doit implémenter le trait `CoreModule` :

```rust
#[async_trait]
pub trait CoreModule: Send + Sync {
    /// Get the name of the module
    fn name(&self) -> &str;

    /// Get the version of the module
    fn version(&self) -> &str;

    /// List of dependencies (other modules required to run)
    fn dependencies(&self) -> Vec<String>;

    /// Initialize the module
    async fn initialize(&self, config: &CoreConfig) -> Result<(), CoreError>;

    /// Shutdown the module
    async fn shutdown(&self) -> Result<(), CoreError>;

    /// Check module health
    async fn health_check(&self) -> Result<CoreHealth, CoreError>;

    /// Get module metrics
    async fn metrics(&self) -> Result<HashMap<String, f64>, CoreError>;

    /// Reconfigure module at runtime
    async fn reconfigure(&self, config: &CoreConfig) -> Result<(), CoreError>;
}
```

### Structures essentielles

#### CoreConfig
```rust
pub struct CoreConfig {
    pub name: String,
    pub enabled: bool,
    pub priority: u8,           // 0-255 (higher = earlier init)
    pub settings: HashMap<String, String>,
}
```

#### CoreHealth
```rust
pub struct CoreHealth {
    pub is_healthy: bool,
    pub message: String,
    pub uptime_seconds: u64,
}
```

#### CoreError
```rust
pub enum CoreError {
    InitializationFailed(String),
    ShutdownFailed(String),
    HealthCheckFailed(String),
    DependencyNotFound(String),
    ConfigurationError(String),
}
```

---

## 3. Guide pas-à-pas : Créer votre premier Core

### Étape 1 : Définir la structure

Créez un fichier `src-tauri/src/core/my_custom_core.rs` :

```rust
use crate::plugin_system::{CoreModule, CoreConfig, CoreHealth, CoreError};
use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

pub struct MyCustomCore {
    name: String,
    version: String,
    state: Arc<RwLock<MyCustomState>>,
}

struct MyCustomState {
    is_initialized: bool,
    initialization_time: Option<std::time::Instant>,
    request_count: u64,
}

impl MyCustomCore {
    pub fn new() -> Self {
        Self {
            name: "MyCustomCore".to_string(),
            version: "1.0.0".to_string(),
            state: Arc::new(RwLock::new(MyCustomState {
                is_initialized: false,
                initialization_time: None,
                request_count: 0,
            })),
        }
    }
}
```

### Étape 2 : Implémenter CoreModule

```rust
#[async_trait]
impl CoreModule for MyCustomCore {
    fn name(&self) -> &str {
        &self.name
    }

    fn version(&self) -> &str {
        &self.version
    }

    fn dependencies(&self) -> Vec<String> {
        // Si votre Core dépend de Helios et Nexus
        vec!["Helios".to_string(), "Nexus".to_string()]
    }

    async fn initialize(&self, config: &CoreConfig) -> Result<(), CoreError> {
        println!("🚀 Initializing {}", self.name);

        let mut state = self.state.write().await;

        // Validation de configuration
        if !config.enabled {
            return Err(CoreError::ConfigurationError(
                "Core is disabled in config".to_string()
            ));
        }

        // Logique d'initialisation
        state.is_initialized = true;
        state.initialization_time = Some(std::time::Instant::now());

        println!("✅ {} initialized successfully", self.name);
        Ok(())
    }

    async fn shutdown(&self) -> Result<(), CoreError> {
        println!("🛑 Shutting down {}", self.name);

        let mut state = self.state.write().await;
        state.is_initialized = false;
        state.initialization_time = None;

        println!("✅ {} shutdown complete", self.name);
        Ok(())
    }

    async fn health_check(&self) -> Result<CoreHealth, CoreError> {
        let state = self.state.read().await;

        let uptime = state.initialization_time
            .map(|t| t.elapsed().as_secs())
            .unwrap_or(0);

        Ok(CoreHealth {
            is_healthy: state.is_initialized,
            message: if state.is_initialized {
                "All systems operational".to_string()
            } else {
                "Core not initialized".to_string()
            },
            uptime_seconds: uptime,
        })
    }

    async fn metrics(&self) -> Result<HashMap<String, f64>, CoreError> {
        let state = self.state.read().await;

        let mut metrics = HashMap::new();
        metrics.insert("request_count".to_string(), state.request_count as f64);
        metrics.insert("uptime_seconds".to_string(),
            state.initialization_time
                .map(|t| t.elapsed().as_secs() as f64)
                .unwrap_or(0.0)
        );

        Ok(metrics)
    }

    async fn reconfigure(&self, config: &CoreConfig) -> Result<(), CoreError> {
        println!("🔧 Reconfiguring {} with new settings", self.name);

        // Appliquer nouvelle configuration sans redémarrage complet
        if let Some(setting) = config.settings.get("custom_param") {
            println!("  Setting custom_param = {}", setting);
        }

        Ok(())
    }
}
```

### Étape 3 : Enregistrer dans le Registry

Dans `main.rs` ou dans le setup de l'application :

```rust
use crate::core::my_custom_core::MyCustomCore;
use crate::plugin_system::registry::CoreRegistry;

// Créer l'instance du Core
let my_core = Arc::new(MyCustomCore::new());

// Obtenir le registry
let registry = app.state::<Arc<RwLock<CoreRegistry>>>().clone();
let mut reg = registry.write().await;

// Enregistrer le Core
reg.register_core(my_core.clone())
    .map_err(|e| format!("Failed to register MyCustomCore: {}", e))?;

println!("✅ MyCustomCore registered successfully");
```

### Étape 4 : Initialiser via l'Orchestrator

```rust
use crate::plugin_system::orchestrator::CoreOrchestrator;

let orchestrator = CoreOrchestrator::new(registry);

// Initialiser tous les Cores dans l'ordre topologique
let report = orchestrator.initialize_all().await
    .map_err(|e| format!("Initialization failed: {}", e))?;

println!("📊 Initialization Report:");
println!("  Succeeded: {}", report.successful_modules.len());
println!("  Failed: {}", report.failed_modules.len());
```

---

## 4. Configuration et Lifecycle

### Cycle de vie complet

```
┌──────────┐
│ Register │  ──► Registry.register_core()
└────┬─────┘
     │
     ▼
┌──────────┐
│Initialize│  ──► Orchestrator.initialize_all()
└────┬─────┘      (ordre topologique)
     │
     ▼
┌──────────┐
│ Running  │  ──► health_check() périodique
│          │      metrics() collection
└────┬─────┘      EventBus communication
     │
     ▼
┌──────────┐
│Shutdown  │  ──► Orchestrator.shutdown_all()
└──────────┘      (ordre inverse)
```

### Configuration avancée

```rust
let config = CoreConfig {
    name: "MyCustomCore".to_string(),
    enabled: true,
    priority: 100,  // Init tôt (0=dernier, 255=premier)
    settings: HashMap::from([
        ("database_url".to_string(), "localhost:5432".to_string()),
        ("max_connections".to_string(), "50".to_string()),
        ("timeout_seconds".to_string(), "30".to_string()),
    ]),
};

my_core.initialize(&config).await?;
```

---

## 5. Dépendances entre Cores

### Déclarer des dépendances

```rust
fn dependencies(&self) -> Vec<String> {
    vec![
        "Helios".to_string(),    // Requis pour fonctionnement de base
        "Nexus".to_string(),     // Requis pour communication
        "Memory".to_string(),    // Optionnel mais recommandé
    ]
}
```

### Détection de cycles

Le `CoreRegistry` détecte automatiquement les dépendances circulaires :

```rust
// ❌ Ceci sera détecté et rejeté :
// CoreA dépend de CoreB
// CoreB dépend de CoreC
// CoreC dépend de CoreA  ← CYCLE !

let result = registry.register_core(core_with_circular_dep);
match result {
    Err(e) => println!("❌ Circular dependency detected: {}", e),
    Ok(_) => println!("✅ Dependency graph valid"),
}
```

### Tri topologique

L'orchestrator initialise les Cores dans l'ordre de dépendance :

```
Si : CoreA → CoreB → CoreC
Alors : Init(CoreC), Init(CoreB), Init(CoreA)

Shutdown inverse : Shutdown(CoreA), Shutdown(CoreB), Shutdown(CoreC)
```

---

## 6. Métriques et Observabilité

### Intégration avec MetricsCollector

```rust
use crate::devtools::metrics::MetricsCollector;

impl MyCustomCore {
    pub async fn process_request(&self) -> Result<(), String> {
        // Incrémenter compteur de requêtes
        let mut state = self.state.write().await;
        state.request_count += 1;

        // Collecter métrique dans MetricsCollector global
        let metrics = app.state::<Arc<RwLock<MetricsCollector>>>().clone();
        let mut mc = metrics.write().await;

        mc.record_counter("my_custom_core.requests", 1.0, &[]);

        // Mesurer latence
        let start = std::time::Instant::now();

        // ... traitement ...

        let duration = start.elapsed().as_secs_f64();
        mc.record_histogram("my_custom_core.latency", duration, &[]);

        Ok(())
    }
}
```

### Intégration avec LogCollector

```rust
use crate::devtools::logging::{LogCollector, LogLevel, LogEntry};

impl MyCustomCore {
    async fn log_event(&self, message: &str) {
        let logs = app.state::<Arc<RwLock<LogCollector>>>().clone();
        let mut lc = logs.write().await;

        lc.log(
            LogLevel::Info,
            "MyCustomCore",
            message,
            Some("correlation-id-123".to_string()),
        );
    }
}
```

---

## 7. Profils système et déploiement

### Profils prédéfinis

```rust
use crate::plugin_system::profiles::ProfileManager;

let profile_manager = ProfileManager::new();

// Profil MINIMAL (2 cores) - Pour environnements contraints
let minimal = profile_manager.get_profile("minimal");
// Cores: Helios, Nexus

// Profil STANDARD (8 cores) - Production recommandée
let standard = profile_manager.get_profile("standard");
// Cores: Helios, Nexus, Harmonia, Sentinel, Memory, Evolution, ANS, MAI

// Profil EXTENDED (12 cores) - Fonctionnalités avancées
let extended = profile_manager.get_profile("extended");
// Standard + Cortex, Resonance, Senses, Empathy

// Profil LAB (15 cores) - Recherche et développement
let lab = profile_manager.get_profile("lab");
// Extended + ExpFusion, MetaMode, DigitalTwin
```

### Créer un profil personnalisé

```rust
let custom_profile = SystemProfile {
    name: "custom-production".to_string(),
    description: "Profil personnalisé pour production".to_string(),
    cores: vec![
        CoreConfig {
            name: "Helios".to_string(),
            enabled: true,
            priority: 255,
            settings: HashMap::new(),
        },
        CoreConfig {
            name: "MyCustomCore".to_string(),
            enabled: true,
            priority: 200,
            settings: HashMap::from([
                ("mode".to_string(), "production".to_string()),
            ]),
        },
    ],
};

profile_manager.add_profile(custom_profile);
```

---

## 8. Best Practices

### ✅ DO

1. **Toujours gérer les erreurs** avec `CoreError` spécifiques
2. **Utiliser Arc<RwLock<T>>** pour état partagé thread-safe
3. **Implémenter health_check()** de manière significative
4. **Exposer métriques utiles** (latence, throughput, erreurs)
5. **Déclarer dépendances explicitement** dans `dependencies()`
6. **Logger les événements importants** avec LogCollector
7. **Tester en isolation** avant intégration
8. **Documenter la configuration** avec exemples

### ❌ DON'T

1. **Ne pas bloquer dans initialize()** - garder <5 secondes
2. **Ne pas oublier cleanup dans shutdown()** (connexions, fichiers)
3. **Ne pas ignorer les erreurs de dépendances**
4. **Ne pas modifier état global directement** - passer par EventBus
5. **Ne pas créer de dépendances circulaires**
6. **Ne pas hardcoder les valeurs** - utiliser CoreConfig
7. **Ne pas exposer de panics** - toujours Result<T, CoreError>

### Patterns recommandés

#### Builder pattern pour configuration
```rust
pub struct MyCustomCoreBuilder {
    name: String,
    database_url: Option<String>,
    max_retries: u32,
}

impl MyCustomCoreBuilder {
    pub fn new(name: &str) -> Self {
        Self {
            name: name.to_string(),
            database_url: None,
            max_retries: 3,
        }
    }

    pub fn database_url(mut self, url: &str) -> Self {
        self.database_url = Some(url.to_string());
        self
    }

    pub fn max_retries(mut self, retries: u32) -> Self {
        self.max_retries = retries;
        self
    }

    pub fn build(self) -> MyCustomCore {
        // ... construction ...
    }
}

// Usage
let core = MyCustomCoreBuilder::new("MyCore")
    .database_url("localhost:5432")
    .max_retries(5)
    .build();
```

#### Event-driven communication
```rust
use crate::plugin_system::event_bus::{EventBus, CoreEvent};

impl MyCustomCore {
    async fn notify_state_change(&self, event_bus: &EventBus) {
        event_bus.publish(CoreEvent::StateChanged {
            module_name: self.name.clone(),
            old_state: "idle".to_string(),
            new_state: "processing".to_string(),
        }).await;
    }
}
```

---

## 9. Exemples avancés

### Exemple 1 : Core avec communication inter-modules

```rust
pub struct DataProcessorCore {
    name: String,
    state: Arc<RwLock<ProcessorState>>,
    event_bus: Arc<EventBus>,
}

impl DataProcessorCore {
    async fn process_data(&self, data: Vec<u8>) -> Result<(), String> {
        // Publier événement de début
        self.event_bus.publish(CoreEvent::Custom {
            module_name: self.name.clone(),
            event_type: "processing_started".to_string(),
            data: format!("Processing {} bytes", data.len()),
        }).await;

        // Traitement
        let result = self.internal_process(&data).await?;

        // Publier événement de fin
        self.event_bus.publish(CoreEvent::Custom {
            module_name: self.name.clone(),
            event_type: "processing_completed".to_string(),
            data: format!("Produced {} results", result.len()),
        }).await;

        Ok(())
    }
}
```

### Exemple 2 : Core avec état persistant

```rust
use serde::{Serialize, Deserialize};
use std::fs;

#[derive(Serialize, Deserialize)]
struct PersistentState {
    version: String,
    last_run: String,
    counter: u64,
}

impl MyCustomCore {
    async fn save_state(&self) -> Result<(), CoreError> {
        let state = self.state.read().await;

        let persistent = PersistentState {
            version: self.version.clone(),
            last_run: chrono::Utc::now().to_rfc3339(),
            counter: state.request_count,
        };

        let json = serde_json::to_string_pretty(&persistent)
            .map_err(|e| CoreError::ConfigurationError(e.to_string()))?;

        fs::write("state.json", json)
            .map_err(|e| CoreError::ConfigurationError(e.to_string()))?;

        Ok(())
    }

    async fn load_state(&self) -> Result<(), CoreError> {
        if let Ok(json) = fs::read_to_string("state.json") {
            if let Ok(persistent) = serde_json::from_str::<PersistentState>(&json) {
                let mut state = self.state.write().await;
                state.request_count = persistent.counter;
            }
        }
        Ok(())
    }
}
```

### Exemple 3 : Core avec graceful degradation

```rust
impl MyCustomCore {
    async fn health_check(&self) -> Result<CoreHealth, CoreError> {
        let state = self.state.read().await;

        // Vérification multi-niveaux
        let database_ok = self.check_database_connection().await;
        let cache_ok = self.check_cache_connection().await;
        let api_ok = self.check_external_api().await;

        let health_score =
            (database_ok as u8) * 3 +  // Critical
            (cache_ok as u8) * 2 +      // Important
            (api_ok as u8) * 1;         // Nice to have

        let is_healthy = health_score >= 4;  // Minimum 4/6

        let message = format!(
            "DB:{} Cache:{} API:{} (Score:{}/6)",
            if database_ok { "✅" } else { "❌" },
            if cache_ok { "✅" } else { "❌" },
            if api_ok { "✅" } else { "❌" },
            health_score
        );

        Ok(CoreHealth {
            is_healthy,
            message,
            uptime_seconds: state.initialization_time
                .map(|t| t.elapsed().as_secs())
                .unwrap_or(0),
        })
    }
}
```

---

## Conclusion

Ce guide vous permet de :
- ✅ Créer des Core Modules personnalisés conformes à l'architecture TITANE∞
- ✅ Gérer les dépendances, le cycle de vie, et la configuration
- ✅ Intégrer l'observabilité (logs, métriques, health)
- ✅ Communiquer avec d'autres Cores via EventBus
- ✅ Déployer avec des profils système adaptés

### Ressources

- **Code source** : `src-tauri/src/plugin_system/`
- **Exemples** : Helios, Nexus, Harmonia, Sentinel
- **Design document** : `docs/architecture/MODULAR_EXTENSIONS_DESIGN.md`
- **API DevTools** : `docs/architecture/DEVTOOLS_BACKEND_API_DESIGN.md`

### Support

Pour toute question ou contribution, référez-vous à :
- Issues GitHub : `github.com/titane-infinity/titane/issues`
- Documentation technique : `docs/`
- Tests : `src-tauri/src/plugin_system/tests/`

---

**TITANE∞ v17.2.0** — Architecture modulaire pour l'évolutivité infinie 🚀
