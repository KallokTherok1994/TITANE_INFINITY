# Design Architecture: Extensions Backend Modulaires

**Version**: v13.0.0
**Date**: 22 novembre 2025
**Objectif**: Architecture modulaire pour évolution long terme (v7→v8→v9→v10+) via plugins backend

---

## ÉTAPE 1: CARTOGRAPHIE ARCHITECTURE ACTUELLE

### 1.1 Structure Cores Existante

**Cores permanents** (src-tauri/src/):
- `core/helios.rs` - Monitoring système
- `core/nexus.rs` - Coherence engine
- `core/harmonia.rs` - Balancing
- `core/sentinel.rs` - Security
- `core/memory.rs` - Stockage hiérarchique
- `core/engine.rs` - Auto-évolution

**Modules fonctionnels**:
- `interruptibility/` - Gestion interruptions
- `emotion/` - Détection émotions
- `system/evolutive_twin/` - P85 co-évolution
- `noise_adaptive/` - Adaptation audio
- `compression/` - Compression cognitive
- `selfheal/` - Auto-réparation

### 1.2 Problèmes Actuels

**❌ Couplage fort**: Cores dépendent directement les uns des autres
**❌ Ajout difficile**: Nouveau core = modifications multiples fichiers
**❌ Pas d'isolation**: Crash d'un core peut affecter les autres
**❌ Configuration rigide**: Impossible d'activer/désactiver cores runtime
**❌ Tests complexes**: Difficile de tester cores isolément

### 1.3 Objectifs Architecture v7+

**✅ Plugin-based**: Ajout cores sans modifier existant
**✅ Hot-reload**: Charger/décharger cores runtime
**✅ Isolation**: Sandboxing cores optionnel
**✅ Configuration**: Profils (minimal, standard, extended, lab)
**✅ Observabilité**: Chaque core auto-documenté + metrics
**✅ Versionning**: Compatibilité multi-versions

---

## ÉTAPE 2: TRAIT COREMODULE

### 2.1 Interface Unifiée

```rust
// src-tauri/src/plugin_system/core_module.rs

use async_trait::async_trait;
use serde::{Serialize, Deserialize};

#[async_trait]
pub trait CoreModule: Send + Sync {
    /// Nom unique du core
    fn name(&self) -> &str;

    /// Version semver
    fn version(&self) -> &str;

    /// Description courte
    fn description(&self) -> &str;

    /// Dépendances vers autres cores
    fn dependencies(&self) -> Vec<CoreDependency>;

    /// Capabilities exposées
    fn capabilities(&self) -> Vec<String>;

    /// Initialisation async
    async fn initialize(&mut self, context: &CoreContext) -> CoreResult<()>;

    /// Arrêt propre
    async fn shutdown(&mut self) -> CoreResult<()>;

    /// Health check
    async fn health_check(&self) -> CoreHealth;

    /// Configuration hot-reload
    async fn reconfigure(&mut self, config: serde_json::Value) -> CoreResult<()>;

    /// Métriques exposées
    fn metrics(&self) -> Vec<CoreMetric>;

    /// Commandes Tauri exposées (optionnel)
    fn tauri_commands(&self) -> Vec<TauriCommand> {
        vec![]
    }

    /// Event handlers (optionnel)
    fn event_handlers(&self) -> Vec<EventHandler> {
        vec![]
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoreDependency {
    pub name: String,
    pub version_req: String, // "^1.0.0"
    pub optional: bool,
}

#[derive(Debug, Clone)]
pub struct CoreContext {
    pub app_handle: tauri::AppHandle,
    pub core_registry: Arc<CoreRegistry>,
    pub event_bus: Arc<EventBus>,
    pub config: serde_json::Value,
}

#[derive(Debug, Clone, Serialize)]
pub struct CoreHealth {
    pub status: HealthStatus,
    pub message: Option<String>,
    pub details: serde_json::Value,
}

#[derive(Debug, Clone, Serialize)]
pub enum HealthStatus {
    Healthy,
    Degraded,
    Unhealthy,
}

pub type CoreResult<T> = Result<T, CoreError>;

#[derive(Debug, thiserror::Error)]
pub enum CoreError {
    #[error("Initialization failed: {0}")]
    InitializationFailed(String),

    #[error("Dependency not found: {0}")]
    DependencyNotFound(String),

    #[error("Configuration error: {0}")]
    ConfigError(String),

    #[error("Runtime error: {0}")]
    RuntimeError(String),
}
```

### 2.2 Exemple: Helios Core Refactoré

```rust
// src-tauri/src/core/helios_module.rs

pub struct HeliosCoreModule {
    monitoring_data: Arc<RwLock<SystemMonitoringData>>,
    config: HeliosConfig,
    status: HealthStatus,
}

#[async_trait]
impl CoreModule for HeliosCoreModule {
    fn name(&self) -> &str {
        "helios"
    }

    fn version(&self) -> &str {
        "1.0.0"
    }

    fn description(&self) -> &str {
        "System monitoring core (CPU, RAM, Disk)"
    }

    fn dependencies(&self) -> Vec<CoreDependency> {
        vec![] // Pas de dépendances
    }

    fn capabilities(&self) -> Vec<String> {
        vec![
            "system.monitoring".into(),
            "metrics.cpu".into(),
            "metrics.memory".into(),
            "metrics.disk".into(),
        ]
    }

    async fn initialize(&mut self, context: &CoreContext) -> CoreResult<()> {
        // Lire config depuis context
        self.config = serde_json::from_value(context.config.clone())
            .map_err(|e| CoreError::ConfigError(e.to_string()))?;

        // Démarrer monitoring loop
        self.start_monitoring_loop(context.app_handle.clone()).await?;

        self.status = HealthStatus::Healthy;
        Ok(())
    }

    async fn shutdown(&mut self) -> CoreResult<()> {
        self.status = HealthStatus::Unhealthy;
        // Cleanup resources
        Ok(())
    }

    async fn health_check(&self) -> CoreHealth {
        let data = self.monitoring_data.read().await;

        CoreHealth {
            status: self.status.clone(),
            message: Some("Monitoring active".into()),
            details: json!({
                "cpu_usage": data.cpu_usage,
                "ram_usage": data.ram_usage,
            }),
        }
    }

    async fn reconfigure(&mut self, config: serde_json::Value) -> CoreResult<()> {
        self.config = serde_json::from_value(config)
            .map_err(|e| CoreError::ConfigError(e.to_string()))?;
        Ok(())
    }

    fn metrics(&self) -> Vec<CoreMetric> {
        vec![
            CoreMetric::gauge("helios.cpu_usage"),
            CoreMetric::gauge("helios.ram_usage"),
            CoreMetric::gauge("helios.disk_usage"),
        ]
    }

    fn tauri_commands(&self) -> Vec<TauriCommand> {
        vec![
            TauriCommand {
                name: "get_system_health".into(),
                handler: Box::new(|args| {
                    Box::pin(async move {
                        // Implementation
                    })
                }),
            }
        ]
    }
}
```

---

## ÉTAPE 3: COREREGISTRY & ORCHESTRATOR

### 3.1 Registry Dynamique

```rust
// src-tauri/src/plugin_system/registry.rs

pub struct CoreRegistry {
    cores: Arc<RwLock<HashMap<String, Box<dyn CoreModule>>>>,
    dependency_graph: Arc<RwLock<DependencyGraph>>,
    event_bus: Arc<EventBus>,
}

impl CoreRegistry {
    pub fn new(event_bus: Arc<EventBus>) -> Self {
        Self {
            cores: Arc::new(RwLock::new(HashMap::new())),
            dependency_graph: Arc::new(RwLock::new(DependencyGraph::new())),
            event_bus,
        }
    }

    /// Enregistre un core (vérification dépendances)
    pub async fn register_core(
        &self,
        core: Box<dyn CoreModule>,
    ) -> CoreResult<()> {
        let name = core.name().to_string();
        let deps = core.dependencies();

        // Vérifier dépendances disponibles
        for dep in &deps {
            if !dep.optional {
                self.check_dependency_available(&dep).await?;
            }
        }

        // Ajouter au graphe de dépendances
        {
            let mut graph = self.dependency_graph.write().await;
            graph.add_node(&name, deps);
        }

        // Stocker core
        {
            let mut cores = self.cores.write().await;
            cores.insert(name.clone(), core);
        }

        // Émettre événement
        self.event_bus.emit(CoreEvent::Registered { name }).await;

        Ok(())
    }

    /// Désenregistre un core (vérification dépendants)
    pub async fn unregister_core(&self, name: &str) -> CoreResult<()> {
        // Vérifier qu'aucun autre core ne dépend de celui-ci
        {
            let graph = self.dependency_graph.read().await;
            let dependents = graph.find_dependents(name);

            if !dependents.is_empty() {
                return Err(CoreError::RuntimeError(
                    format!("Cannot unregister '{}': required by {:?}", name, dependents)
                ));
            }
        }

        // Shutdown core
        {
            let mut cores = self.cores.write().await;
            if let Some(mut core) = cores.remove(name) {
                core.shutdown().await?;
            }
        }

        // Retirer du graphe
        {
            let mut graph = self.dependency_graph.write().await;
            graph.remove_node(name);
        }

        self.event_bus.emit(CoreEvent::Unregistered { name: name.to_string() }).await;

        Ok(())
    }

    /// Récupère core par nom
    pub async fn get_core(&self, name: &str) -> Option<Arc<dyn CoreModule>> {
        let cores = self.cores.read().await;
        cores.get(name).map(|c| Arc::from(c.as_ref()))
    }

    /// Liste tous les cores
    pub async fn list_cores(&self) -> Vec<CoreInfo> {
        let cores = self.cores.read().await;

        cores.values().map(|core| CoreInfo {
            name: core.name().to_string(),
            version: core.version().to_string(),
            description: core.description().to_string(),
            capabilities: core.capabilities(),
        }).collect()
    }

    /// Résolution ordre initialisation (topological sort)
    pub async fn get_initialization_order(&self) -> CoreResult<Vec<String>> {
        let graph = self.dependency_graph.read().await;
        graph.topological_sort()
            .map_err(|e| CoreError::RuntimeError(format!("Circular dependency: {}", e)))
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct CoreInfo {
    pub name: String,
    pub version: String,
    pub description: String,
    pub capabilities: Vec<String>,
}
```

### 3.2 Orchestrator Lifecycle

```rust
// src-tauri/src/plugin_system/orchestrator.rs

pub struct CoreOrchestrator {
    registry: Arc<CoreRegistry>,
    event_bus: Arc<EventBus>,
    app_handle: tauri::AppHandle,
}

impl CoreOrchestrator {
    /// Initialise tous les cores dans l'ordre des dépendances
    pub async fn initialize_all(&self) -> CoreResult<()> {
        let order = self.registry.get_initialization_order().await?;

        for core_name in order {
            if let Some(mut core) = self.registry.get_core(&core_name).await {
                let context = CoreContext {
                    app_handle: self.app_handle.clone(),
                    core_registry: self.registry.clone(),
                    event_bus: self.event_bus.clone(),
                    config: self.load_core_config(&core_name).await?,
                };

                core.initialize(&context).await
                    .map_err(|e| {
                        CoreError::InitializationFailed(
                            format!("Core '{}': {}", core_name, e)
                        )
                    })?;

                self.event_bus.emit(CoreEvent::Initialized {
                    name: core_name.clone(),
                }).await;
            }
        }

        Ok(())
    }

    /// Shutdown tous les cores (ordre inverse)
    pub async fn shutdown_all(&self) -> CoreResult<()> {
        let mut order = self.registry.get_initialization_order().await?;
        order.reverse(); // Shutdown dans l'ordre inverse

        for core_name in order {
            if let Some(mut core) = self.registry.get_core(&core_name).await {
                core.shutdown().await?;

                self.event_bus.emit(CoreEvent::Shutdown {
                    name: core_name.clone(),
                }).await;
            }
        }

        Ok(())
    }

    /// Health check de tous les cores
    pub async fn health_check_all(&self) -> HashMap<String, CoreHealth> {
        let cores = self.registry.list_cores().await;
        let mut results = HashMap::new();

        for core_info in cores {
            if let Some(core) = self.registry.get_core(&core_info.name).await {
                let health = core.health_check().await;
                results.insert(core_info.name, health);
            }
        }

        results
    }

    /// Hot-reload configuration d'un core
    pub async fn reload_core_config(&self, core_name: &str) -> CoreResult<()> {
        let config = self.load_core_config(core_name).await?;

        if let Some(mut core) = self.registry.get_core(core_name).await {
            core.reconfigure(config).await?;

            self.event_bus.emit(CoreEvent::Reconfigured {
                name: core_name.to_string(),
            }).await;
        }

        Ok(())
    }
}
```

---

## ÉTAPE 4: CONFIGURATION & PROFILS

### 4.1 Profils Système

```rust
// src-tauri/src/plugin_system/profiles.rs

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemProfile {
    pub name: String,
    pub description: String,
    pub enabled_cores: Vec<CoreConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoreConfig {
    pub name: String,
    pub enabled: bool,
    pub config: serde_json::Value,
    pub priority: u8, // 0-255, pour ordonnancement
}

/// Profil minimal: cores essentiels uniquement
pub fn minimal_profile() -> SystemProfile {
    SystemProfile {
        name: "minimal".into(),
        description: "Cores essentiels uniquement".into(),
        enabled_cores: vec![
            CoreConfig {
                name: "helios".into(),
                enabled: true,
                config: json!({
                    "poll_interval_ms": 2000,
                }),
                priority: 255,
            },
            CoreConfig {
                name: "nexus".into(),
                enabled: true,
                config: json!({}),
                priority: 200,
            },
        ],
    }
}

/// Profil standard: production normale
pub fn standard_profile() -> SystemProfile {
    SystemProfile {
        name: "standard".into(),
        description: "Configuration production standard".into(),
        enabled_cores: vec![
            CoreConfig { name: "helios".into(), enabled: true, config: json!({}), priority: 255 },
            CoreConfig { name: "nexus".into(), enabled: true, config: json!({}), priority: 200 },
            CoreConfig { name: "harmonia".into(), enabled: true, config: json!({}), priority: 180 },
            CoreConfig { name: "sentinel".into(), enabled: true, config: json!({}), priority: 170 },
            CoreConfig { name: "memory".into(), enabled: true, config: json!({}), priority: 160 },
            CoreConfig { name: "selfheal".into(), enabled: true, config: json!({}), priority: 150 },
            CoreConfig { name: "emotion".into(), enabled: true, config: json!({}), priority: 100 },
            CoreConfig { name: "interruptibility".into(), enabled: true, config: json!({}), priority: 90 },
        ],
    }
}

/// Profil extended: toutes fonctionnalités
pub fn extended_profile() -> SystemProfile {
    let mut profile = standard_profile();
    profile.name = "extended".into();
    profile.description = "Toutes fonctionnalités actives".into();

    profile.enabled_cores.extend(vec![
        CoreConfig { name: "cognitive_engine".into(), enabled: true, config: json!({}), priority: 80 },
        CoreConfig { name: "compression".into(), enabled: true, config: json!({}), priority: 70 },
        CoreConfig { name: "noise_adaptive".into(), enabled: true, config: json!({}), priority: 60 },
        CoreConfig { name: "evolutive_twin".into(), enabled: true, config: json!({}), priority: 50 },
    ]);

    profile
}

/// Profil lab: features expérimentales
pub fn lab_profile() -> SystemProfile {
    let mut profile = extended_profile();
    profile.name = "lab".into();
    profile.description = "Expérimental: IA v8, quantum, etc.".into();

    profile.enabled_cores.extend(vec![
        CoreConfig { name: "ia_v8".into(), enabled: true, config: json!({}), priority: 40 },
        CoreConfig { name: "quantum_optimization".into(), enabled: true, config: json!({}), priority: 30 },
        CoreConfig { name: "dream_analyzer".into(), enabled: true, config: json!({}), priority: 20 },
    ]);

    profile
}

pub struct ProfileManager {
    profiles: HashMap<String, SystemProfile>,
    active_profile: String,
}

impl ProfileManager {
    pub fn new() -> Self {
        let mut profiles = HashMap::new();
        profiles.insert("minimal".into(), minimal_profile());
        profiles.insert("standard".into(), standard_profile());
        profiles.insert("extended".into(), extended_profile());
        profiles.insert("lab".into(), lab_profile());

        Self {
            profiles,
            active_profile: "standard".into(),
        }
    }

    /// Charge un profil (nécessite restart cores)
    pub async fn load_profile(
        &mut self,
        profile_name: &str,
        orchestrator: &CoreOrchestrator,
    ) -> CoreResult<()> {
        let profile = self.profiles.get(profile_name)
            .ok_or_else(|| CoreError::ConfigError(format!("Profile '{}' not found", profile_name)))?;

        // Shutdown tous les cores actuels
        orchestrator.shutdown_all().await?;

        // Enregistrer nouveaux cores du profil
        for core_config in &profile.enabled_cores {
            if core_config.enabled {
                let core = self.instantiate_core(&core_config.name)?;
                orchestrator.registry.register_core(core).await?;
            }
        }

        // Initialiser
        orchestrator.initialize_all().await?;

        self.active_profile = profile_name.to_string();
        Ok(())
    }

    /// Factory pour créer instances cores
    fn instantiate_core(&self, name: &str) -> CoreResult<Box<dyn CoreModule>> {
        match name {
            "helios" => Ok(Box::new(HeliosCoreModule::new())),
            "nexus" => Ok(Box::new(NexusCoreModule::new())),
            "harmonia" => Ok(Box::new(HarmoniaCoreModule::new())),
            // ... autres cores
            _ => Err(CoreError::RuntimeError(format!("Unknown core: {}", name))),
        }
    }
}
```

### 4.2 Commandes Tauri Profils

```rust
#[tauri::command]
pub async fn list_profiles(
    state: State<'_, Arc<Mutex<ProfileManager>>>,
) -> Result<Vec<String>, String> {
    let manager = state.lock().await;
    Ok(manager.profiles.keys().cloned().collect())
}

#[tauri::command]
pub async fn get_active_profile(
    state: State<'_, Arc<Mutex<ProfileManager>>>,
) -> Result<String, String> {
    let manager = state.lock().await;
    Ok(manager.active_profile.clone())
}

#[tauri::command]
pub async fn switch_profile(
    profile_name: String,
    manager: State<'_, Arc<Mutex<ProfileManager>>>,
    orchestrator: State<'_, Arc<CoreOrchestrator>>,
) -> Result<(), String> {
    let mut manager = manager.lock().await;
    manager.load_profile(&profile_name, &orchestrator).await
        .map_err(|e| e.to_string())
}
```

---

## ÉTAPE 5: INVARIANTS (OBSERVABILITÉ, SELFHEAL, SÉCURITÉ)

### 5.1 Observabilité Automatique

```rust
// Chaque core doit exposer métriques standard
pub struct CoreObservability {
    core_name: String,
    metrics_collector: Arc<MetricsCollector>,
    log_collector: Arc<LogCollector>,
}

impl CoreObservability {
    /// Auto-enregistre métriques standard
    pub async fn setup_standard_metrics(&self) {
        // Métriques communes à tous les cores
        self.metrics_collector.increment_counter(
            &format!("{}.initialized", self.core_name),
            HashMap::new(),
        ).await;

        // Heartbeat automatique
        let core_name = self.core_name.clone();
        let collector = self.metrics_collector.clone();
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_secs(5));
            loop {
                interval.tick().await;
                collector.set_gauge(
                    &format!("{}.heartbeat", core_name),
                    1.0,
                    HashMap::from([("timestamp".into(), format!("{:?}", SystemTime::now()))]),
                ).await;
            }
        });
    }

    /// Log automatique lifecycle
    pub async fn log_lifecycle(&self, event: &str) {
        self.log_collector.log(
            LogLevel::Info,
            self.core_name.clone(),
            format!("Lifecycle event: {}", event),
            json!({ "event": event }),
        ).await;
    }
}
```

### 5.2 SelfHeal Automatique

```rust
// Wrapper auto-heal pour chaque core
pub struct SelfHealingCore<T: CoreModule> {
    inner: T,
    health_monitor: Arc<HealthMonitor>,
    restart_policy: RestartPolicy,
}

impl<T: CoreModule> SelfHealingCore<T> {
    pub fn new(inner: T, restart_policy: RestartPolicy) -> Self {
        Self {
            inner,
            health_monitor: Arc::new(HealthMonitor::new()),
            restart_policy,
        }
    }

    /// Monitore santé et auto-restart si nécessaire
    pub async fn monitor_loop(&mut self, context: CoreContext) {
        let mut interval = tokio::time::interval(Duration::from_secs(10));

        loop {
            interval.tick().await;

            let health = self.inner.health_check().await;

            match health.status {
                HealthStatus::Unhealthy => {
                    if self.restart_policy.should_restart() {
                        log::warn!("Core '{}' unhealthy, restarting...", self.inner.name());

                        self.inner.shutdown().await.ok();
                        self.inner.initialize(&context).await.ok();
                    }
                },
                HealthStatus::Degraded => {
                    log::warn!("Core '{}' degraded: {:?}", self.inner.name(), health.message);
                },
                HealthStatus::Healthy => {},
            }
        }
    }
}

#[derive(Clone)]
pub struct RestartPolicy {
    max_restarts: u32,
    restart_window: Duration,
    backoff_multiplier: f32,
}
```

### 5.3 Sécurité & Isolation

```rust
// Sandbox optionnel pour cores expérimentaux
pub struct SandboxedCore<T: CoreModule> {
    inner: T,
    permissions: CorePermissions,
}

#[derive(Debug, Clone)]
pub struct CorePermissions {
    pub can_access_filesystem: bool,
    pub can_access_network: bool,
    pub can_spawn_processes: bool,
    pub allowed_syscalls: Vec<String>,
    pub max_memory_mb: u64,
    pub max_cpu_percent: u8,
}

impl<T: CoreModule> SandboxedCore<T> {
    /// Vérifie permissions avant exécution
    pub fn check_permission(&self, permission: &str) -> CoreResult<()> {
        match permission {
            "filesystem" if !self.permissions.can_access_filesystem => {
                Err(CoreError::RuntimeError("Filesystem access denied".into()))
            },
            "network" if !self.permissions.can_access_network => {
                Err(CoreError::RuntimeError("Network access denied".into()))
            },
            _ => Ok(()),
        }
    }
}
```

---

## ÉTAPE 6: CAS D'USAGE - AJOUT IA_V8 CORE

### 6.1 Implémentation Nouveau Core

```rust
// src-tauri/src/experimental/ia_v8_core.rs

pub struct IAv8Core {
    model: Option<LanguageModel>,
    config: IAv8Config,
    status: HealthStatus,
}

#[async_trait]
impl CoreModule for IAv8Core {
    fn name(&self) -> &str {
        "ia_v8"
    }

    fn version(&self) -> &str {
        "0.1.0-alpha"
    }

    fn description(&self) -> &str {
        "Next-gen IA engine avec reasoning avancé"
    }

    fn dependencies(&self) -> Vec<CoreDependency> {
        vec![
            CoreDependency {
                name: "memory".into(),
                version_req: "^1.0.0".into(),
                optional: false,
            },
            CoreDependency {
                name: "cognitive_engine".into(),
                version_req: "^1.0.0".into(),
                optional: true,
            },
        ]
    }

    fn capabilities(&self) -> Vec<String> {
        vec![
            "inference.reasoning".into(),
            "inference.creative".into(),
            "contextual_learning".into(),
        ]
    }

    async fn initialize(&mut self, context: &CoreContext) -> CoreResult<()> {
        self.config = serde_json::from_value(context.config.clone())
            .map_err(|e| CoreError::ConfigError(e.to_string()))?;

        // Charger modèle IA
        self.model = Some(self.load_model().await?);

        self.status = HealthStatus::Healthy;
        Ok(())
    }

    async fn shutdown(&mut self) -> CoreResult<()> {
        self.model = None;
        self.status = HealthStatus::Unhealthy;
        Ok(())
    }

    async fn health_check(&self) -> CoreHealth {
        CoreHealth {
            status: self.status.clone(),
            message: Some(if self.model.is_some() {
                "Model loaded".into()
            } else {
                "Model not loaded".into()
            }),
            details: json!({
                "model_loaded": self.model.is_some(),
            }),
        }
    }

    async fn reconfigure(&mut self, config: serde_json::Value) -> CoreResult<()> {
        self.config = serde_json::from_value(config)
            .map_err(|e| CoreError::ConfigError(e.to_string()))?;

        // Recharger modèle si nécessaire
        if self.config.model_changed {
            self.model = Some(self.load_model().await?);
        }

        Ok(())
    }

    fn metrics(&self) -> Vec<CoreMetric> {
        vec![
            CoreMetric::counter("ia_v8.inferences_total"),
            CoreMetric::histogram("ia_v8.inference_latency_ms"),
            CoreMetric::gauge("ia_v8.model_loaded"),
        ]
    }

    fn tauri_commands(&self) -> Vec<TauriCommand> {
        vec![
            TauriCommand {
                name: "ia_v8_inference".into(),
                handler: Box::new(|args| {
                    Box::pin(async move {
                        // Implementation
                    })
                }),
            }
        ]
    }
}

impl IAv8Core {
    async fn load_model(&self) -> CoreResult<LanguageModel> {
        // Charger modèle depuis config
        todo!()
    }
}
```

### 6.2 Enregistrement

```rust
// src-tauri/src/main.rs

#[tokio::main]
async fn main() {
    let event_bus = Arc::new(EventBus::new());
    let registry = Arc::new(CoreRegistry::new(event_bus.clone()));
    let orchestrator = Arc::new(CoreOrchestrator::new(
        registry.clone(),
        event_bus.clone(),
        app_handle.clone(),
    ));

    // Enregistrer cores standards
    registry.register_core(Box::new(HeliosCoreModule::new())).await.unwrap();
    registry.register_core(Box::new(NexusCoreModule::new())).await.unwrap();
    // ...

    // Enregistrer core expérimental (profil lab uniquement)
    if profile == "lab" {
        registry.register_core(Box::new(IAv8Core::new())).await.unwrap();
    }

    // Initialiser tout
    orchestrator.initialize_all().await.unwrap();
}
```

---

## ÉTAPE 7: ROADMAP REFACTOR

### 7.1 Phase V1 (v13.1 - Fondations)

**Objectif**: Infrastructure plugin system sans casser l'existant

**Tâches**:
1. ✅ Créer trait `CoreModule`
2. ✅ Créer `CoreRegistry` + `CoreOrchestrator`
3. ✅ Créer `ProfileManager` avec 4 profils
4. ✅ Wrapper observabilité + SelfHeal automatiques
5. ✅ Tests unitaires infrastructure

**Délai**: 2 semaines

### 7.2 Phase V2 (v13.2 - Migration Cores)

**Objectif**: Migrer cores existants vers trait `CoreModule`

**Tâches**:
1. Migrer Helios → `HeliosCoreModule`
2. Migrer Nexus → `NexusCoreModule`
3. Migrer Harmonia → `HarmoniaCoreModule`
4. Migrer Sentinel → `SentinelCoreModule`
5. Migrer Memory → `MemoryCoreModule`
6. Migrer SelfHeal → `SelfHealCoreModule`
7. Tests régression complets

**Délai**: 3 semaines

### 7.3 Phase V3 (v14.0 - Nouveaux Cores)

**Objectif**: Ajouter nouveaux cores modulaires

**Tâches**:
1. `CognitiveEngineCoreModule` complet (trois centres)
2. `EmotionEngineCoreModule` standalone
3. `InterruptibilityCoreModule` standalone
4. `CompressionCoreModule`
5. `NoiseAdaptiveCoreModule`
6. `EvolutiveTwinCoreModule`
7. Tests intégration tous cores

**Délai**: 4 semaines

### 7.4 Phase V4 (v15.0+ - Extensibilité)

**Objectif**: Ouverture écosystème plugins

**Tâches**:
1. Plugin API publique
2. Documentation plugin development
3. Marketplace plugins (future)
4. Hot-reload runtime
5. Sandboxing sécurisé
6. Cores communautaires

**Délai**: Ongoing

---

## RÉSUMÉ ARCHITECTURAL

### Composants Clés

**CoreModule trait**: Interface unifiée tous cores
**CoreRegistry**: Gestion dépendances + discovery
**CoreOrchestrator**: Lifecycle management
**ProfileManager**: Configurations profiles (minimal/standard/extended/lab)
**Observabilité auto**: Métriques + logs automatiques
**SelfHealing auto**: Auto-restart cores unhealthy
**Sandbox**: Isolation cores expérimentaux

### Avantages

✅ **Modularité**: Ajout/suppression cores sans rebuild
✅ **Testabilité**: Chaque core testable isolément
✅ **Configurabilité**: Profils système flexibles
✅ **Observabilité**: Métriques + logs auto par core
✅ **Résilience**: Auto-heal + restart policies
✅ **Sécurité**: Permissions + sandboxing optionnel
✅ **Évolutivité**: Ajout IA v8, v9, v10+ simplifié

### Migration Path

**v13.0**: Architecture actuelle (couplée)
**v13.1**: Infrastructure plugin (coexiste)
**v13.2**: Migration cores standards
**v14.0**: Nouveaux cores modulaires
**v15.0+**: Écosystème plugins ouvert

---

**FIN DU DOCUMENT** - Architecture Extensions Backend v13+ complète
