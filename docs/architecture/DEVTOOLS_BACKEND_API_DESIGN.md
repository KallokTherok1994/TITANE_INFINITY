# Design Complet: DevTools Backend API

**Version**: v13.0.0
**Date**: 22 novembre 2025
**Objectif**: API backend complète pour DevTools UI avec télémétrie, logs, métriques, streaming temps réel

---

## ÉTAPE 1: CARTOGRAPHIE DEVTOOLS EXISTANT

### 1.1 Structure API Actuelle

**Fichiers existants** (`src-tauri/src/api/`):
- `chat.rs`: Gestion conversations
- `system.rs`: Commandes système
- `health.rs`: Health checks
- `evolution.rs`: Auto-évolution
- `analytics.rs`: Métriques
- `config.rs`: Configuration

### 1.2 Commandes Tauri Actuelles

```rust
// Existant identifié
- send_message
- get_system_health
- run_evolution
- get_detailed_health_report (ajouté récemment)
- get_analytics
- update_config
```

### 1.3 Lacunes Identifiées

**Manquant pour DevTools complet**:
- ❌ Logs centralisés avec correlation IDs
- ❌ Streams temps réel par core (Helios, Nexus, etc.)
- ❌ Métriques granulaires (CPU/RAM/Disk par module)
- ❌ Explorer mémoire hiérarchique
- ❌ Visualisation événements SelfHeal
- ❌ Inspection état cognitif temps réel
- ❌ Profiling performances
- ❌ Discovery API cores disponibles

---

## ÉTAPE 2: SPÉCIFICATION API COMPLÈTE

### 2.1 Architecture Globale

```
┌─────────────────────────────────────────────┐
│          DevTools UI (React/TS)             │
├─────────────────────────────────────────────┤
│   Tauri IPC Layer (invoke + listen)         │
├─────────────────────────────────────────────┤
│        Backend API Router                   │
│  ┌─────────┬─────────┬──────────┬────────┐ │
│  │ Telemetry│  Logs  │ Metrics  │ Streams│ │
│  └─────────┴─────────┴──────────┴────────┘ │
├─────────────────────────────────────────────┤
│            Core Systems                     │
│  Helios │ Nexus │ Harmonia │ Sentinel ...   │
└─────────────────────────────────────────────┘
```

### 2.2 Catégories API

1. **Core Discovery**: Liste cores, état, capabilities
2. **Telemetry**: Événements, traces, spans
3. **Logging**: Logs structurés, filtrage, recherche
4. **Metrics**: Compteurs, gauges, histogrammes
5. **Streaming**: Flux temps réel par core
6. **Memory Explorer**: Navigation hiérarchie mémoire
7. **SelfHeal**: Incidents, réparations, historique
8. **Cognitive**: État cognitif, émotions, sessions
9. **Performance**: Profiling, bottlenecks, traces
10. **Configuration**: Settings runtime, profiles

---

## ÉTAPE 3: LOGS & CORRELATION

### 3.1 Système de Logs Structuré

```rust
// src-tauri/src/devtools/logging.rs

use serde::{Serialize, Deserialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    /// ID unique du log
    pub id: String,

    /// Timestamp précis
    pub timestamp: SystemTime,

    /// Niveau de log
    pub level: LogLevel,

    /// Core émetteur
    pub source_core: String,

    /// Message
    pub message: String,

    /// Contexte additionnel
    pub context: serde_json::Value,

    /// Correlation ID (groupe logs liés)
    pub correlation_id: Option<String>,

    /// Session ID utilisateur
    pub session_id: Option<String>,

    /// Span ID (tracing distribué)
    pub span_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LogLevel {
    Trace,
    Debug,
    Info,
    Warn,
    Error,
    Fatal,
}

pub struct LogCollector {
    entries: Arc<Mutex<VecDeque<LogEntry>>>,
    max_size: usize, // 10,000 logs en mémoire
    correlation_index: Arc<Mutex<HashMap<String, Vec<String>>>>, // correlation_id -> log_ids
}

impl LogCollector {
    pub fn new(max_size: usize) -> Self {
        Self {
            entries: Arc::new(Mutex::new(VecDeque::with_capacity(max_size))),
            max_size,
            correlation_index: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Ajoute log avec auto-génération IDs
    pub async fn log(
        &self,
        level: LogLevel,
        source_core: String,
        message: String,
        context: serde_json::Value,
    ) -> String {
        let log_id = Uuid::new_v4().to_string();

        // Récupérer correlation_id depuis contexte actuel (thread-local)
        let correlation_id = CURRENT_CORRELATION_ID.with(|id| id.borrow().clone());
        let session_id = CURRENT_SESSION_ID.with(|id| id.borrow().clone());

        let entry = LogEntry {
            id: log_id.clone(),
            timestamp: SystemTime::now(),
            level,
            source_core,
            message,
            context,
            correlation_id: correlation_id.clone(),
            session_id,
            span_id: None, // TODO: distributed tracing
        };

        // Ajouter à collection
        let mut entries = self.entries.lock().await;
        if entries.len() >= self.max_size {
            entries.pop_front();
        }
        entries.push_back(entry);

        // Indexer par correlation_id
        if let Some(corr_id) = correlation_id {
            let mut index = self.correlation_index.lock().await;
            index.entry(corr_id)
                .or_insert_with(Vec::new)
                .push(log_id.clone());
        }

        log_id
    }

    /// Récupère logs par correlation_id
    pub async fn get_correlated_logs(&self, correlation_id: &str) -> Vec<LogEntry> {
        let index = self.correlation_index.lock().await;
        let log_ids = match index.get(correlation_id) {
            Some(ids) => ids.clone(),
            None => return vec![],
        };

        let entries = self.entries.lock().await;
        entries.iter()
            .filter(|e| log_ids.contains(&e.id))
            .cloned()
            .collect()
    }

    /// Filtre logs
    pub async fn filter_logs(
        &self,
        filters: LogFilters,
    ) -> Vec<LogEntry> {
        let entries = self.entries.lock().await;

        entries.iter()
            .filter(|e| {
                // Niveau
                if let Some(ref levels) = filters.levels {
                    if !levels.contains(&e.level) {
                        return false;
                    }
                }

                // Core source
                if let Some(ref cores) = filters.source_cores {
                    if !cores.contains(&e.source_core) {
                        return false;
                    }
                }

                // Plage temporelle
                if let Some(start) = filters.time_start {
                    if e.timestamp < start {
                        return false;
                    }
                }
                if let Some(end) = filters.time_end {
                    if e.timestamp > end {
                        return false;
                    }
                }

                // Recherche texte
                if let Some(ref query) = filters.text_search {
                    if !e.message.contains(query) {
                        return false;
                    }
                }

                true
            })
            .cloned()
            .collect()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogFilters {
    pub levels: Option<Vec<LogLevel>>,
    pub source_cores: Option<Vec<String>>,
    pub time_start: Option<SystemTime>,
    pub time_end: Option<SystemTime>,
    pub text_search: Option<String>,
    pub correlation_id: Option<String>,
    pub session_id: Option<String>,
}

// Thread-local correlation context
thread_local! {
    static CURRENT_CORRELATION_ID: RefCell<Option<String>> = RefCell::new(None);
    static CURRENT_SESSION_ID: RefCell<Option<String>> = RefCell::new(None);
}

/// Macro pour logger facilement
#[macro_export]
macro_rules! log_info {
    ($collector:expr, $core:expr, $msg:expr, $ctx:expr) => {
        $collector.log(LogLevel::Info, $core.into(), $msg.into(), $ctx).await
    };
}
```

### 3.2 Commandes Tauri Logs

```rust
// src-tauri/src/commands/devtools_logs.rs

#[tauri::command]
pub async fn get_logs(
    filters: LogFilters,
    state: State<'_, Arc<LogCollector>>,
) -> Result<Vec<LogEntry>, String> {
    state.filter_logs(filters).await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_correlated_logs(
    correlation_id: String,
    state: State<'_, Arc<LogCollector>>,
) -> Result<Vec<LogEntry>, String> {
    Ok(state.get_correlated_logs(&correlation_id).await)
}

#[tauri::command]
pub async fn search_logs(
    query: String,
    state: State<'_, Arc<LogCollector>>,
) -> Result<Vec<LogEntry>, String> {
    let filters = LogFilters {
        text_search: Some(query),
        ..Default::default()
    };

    state.filter_logs(filters).await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn export_logs(
    filters: LogFilters,
    format: ExportFormat,
    state: State<'_, Arc<LogCollector>>,
) -> Result<String, String> {
    let logs = state.filter_logs(filters).await
        .map_err(|e| e.to_string())?;

    match format {
        ExportFormat::Json => {
            serde_json::to_string_pretty(&logs)
                .map_err(|e| e.to_string())
        },
        ExportFormat::Csv => {
            // TODO: CSV export
            Err("CSV export not implemented".into())
        },
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ExportFormat {
    Json,
    Csv,
}
```

---

## ÉTAPE 4: MÉTRIQUES & DASHBOARDS PAR CORE

### 4.1 Système de Métriques

```rust
// src-tauri/src/devtools/metrics.rs

use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MetricType {
    Counter,
    Gauge,
    Histogram,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Metric {
    pub name: String,
    pub metric_type: MetricType,
    pub value: f64,
    pub labels: HashMap<String, String>,
    pub timestamp: SystemTime,
}

pub struct MetricsCollector {
    metrics: Arc<RwLock<HashMap<String, MetricSeries>>>,
}

#[derive(Debug, Clone)]
pub struct MetricSeries {
    pub name: String,
    pub metric_type: MetricType,
    pub values: VecDeque<MetricPoint>,
    pub max_points: usize, // 1000 points par série
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricPoint {
    pub value: f64,
    pub timestamp: SystemTime,
    pub labels: HashMap<String, String>,
}

impl MetricsCollector {
    /// Incrémente compteur
    pub async fn increment_counter(
        &self,
        name: &str,
        labels: HashMap<String, String>,
    ) {
        let mut metrics = self.metrics.write().await;
        let series = metrics.entry(name.to_string())
            .or_insert_with(|| MetricSeries {
                name: name.to_string(),
                metric_type: MetricType::Counter,
                values: VecDeque::new(),
                max_points: 1000,
            });

        let last_value = series.values.back()
            .map(|p| p.value)
            .unwrap_or(0.0);

        series.values.push_back(MetricPoint {
            value: last_value + 1.0,
            timestamp: SystemTime::now(),
            labels,
        });

        if series.values.len() > series.max_points {
            series.values.pop_front();
        }
    }

    /// Met à jour gauge
    pub async fn set_gauge(
        &self,
        name: &str,
        value: f64,
        labels: HashMap<String, String>,
    ) {
        let mut metrics = self.metrics.write().await;
        let series = metrics.entry(name.to_string())
            .or_insert_with(|| MetricSeries {
                name: name.to_string(),
                metric_type: MetricType::Gauge,
                values: VecDeque::new(),
                max_points: 1000,
            });

        series.values.push_back(MetricPoint {
            value,
            timestamp: SystemTime::now(),
            labels,
        });

        if series.values.len() > series.max_points {
            series.values.pop_front();
        }
    }

    /// Enregistre durée (histogram)
    pub async fn record_duration(
        &self,
        name: &str,
        duration: Duration,
        labels: HashMap<String, String>,
    ) {
        let value = duration.as_secs_f64();

        let mut metrics = self.metrics.write().await;
        let series = metrics.entry(name.to_string())
            .or_insert_with(|| MetricSeries {
                name: name.to_string(),
                metric_type: MetricType::Histogram,
                values: VecDeque::new(),
                max_points: 1000,
            });

        series.values.push_back(MetricPoint {
            value,
            timestamp: SystemTime::now(),
            labels,
        });

        if series.values.len() > series.max_points {
            series.values.pop_front();
        }
    }

    /// Récupère série complète
    pub async fn get_metric_series(
        &self,
        name: &str,
    ) -> Option<MetricSeries> {
        let metrics = self.metrics.read().await;
        metrics.get(name).cloned()
    }

    /// Liste toutes les métriques
    pub async fn list_metrics(&self) -> Vec<String> {
        let metrics = self.metrics.read().await;
        metrics.keys().cloned().collect()
    }
}
```

### 4.2 Métriques Standard par Core

```rust
// src-tauri/src/devtools/core_metrics.rs

/// Métriques Helios Core
pub struct HeliosMetrics {
    pub cpu_usage_percent: Gauge,
    pub ram_usage_mb: Gauge,
    pub ram_usage_percent: Gauge,
    pub disk_usage_gb: Gauge,
    pub disk_usage_percent: Gauge,
    pub uptime_seconds: Gauge,
}

/// Métriques Nexus Engine
pub struct NexusMetrics {
    pub module_status_changes: Counter,
    pub coherence_score: Gauge,
    pub validation_failures: Counter,
    pub active_modules: Gauge,
}

/// Métriques Harmonia Core
pub struct HarmoniaMetrics {
    pub balance_actions_total: Counter,
    pub balance_score: Gauge,
    pub resource_reallocations: Counter,
}

/// Métriques Sentinel
pub struct SentinelMetrics {
    pub security_scans_total: Counter,
    pub anomalies_detected: Counter,
    pub threats_blocked: Counter,
    pub security_level: Gauge,
}

/// Métriques Memory Core
pub struct MemoryMetrics {
    pub entries_total: Gauge,
    pub entries_by_level: HashMap<String, Gauge>, // ShortTerm, MediumTerm, etc.
    pub compression_ratio: Gauge,
    pub access_latency_ms: Histogram,
}

/// Métriques SelfHeal
pub struct SelfHealMetrics {
    pub incidents_total: Counter,
    pub incidents_by_type: HashMap<String, Counter>,
    pub repairs_successful: Counter,
    pub repairs_failed: Counter,
    pub mean_time_to_repair: Histogram,
}

/// Métriques Cognitive Engine
pub struct CognitiveMetrics {
    pub mental_charge: Gauge,
    pub heart_alignment: Gauge,
    pub body_energy: Gauge,
    pub coherence_score: Gauge,
    pub sessions_active: Gauge,
    pub interruptions_total: Counter,
}

/// Métriques Emotion Engine
pub struct EmotionMetrics {
    pub detections_total: Counter,
    pub emotions_by_type: HashMap<String, Counter>,
    pub average_valence: Gauge,
    pub average_intensity: Gauge,
    pub emotional_shifts: Counter,
}
```

### 4.3 Commandes Tauri Metrics

```rust
#[tauri::command]
pub async fn get_metric(
    name: String,
    state: State<'_, Arc<MetricsCollector>>,
) -> Result<MetricSeries, String> {
    state.get_metric_series(&name).await
        .ok_or_else(|| "Metric not found".into())
}

#[tauri::command]
pub async fn list_all_metrics(
    state: State<'_, Arc<MetricsCollector>>,
) -> Result<Vec<String>, String> {
    Ok(state.list_metrics().await)
}

#[tauri::command]
pub async fn get_core_metrics(
    core_name: String,
    state: State<'_, Arc<MetricsCollector>>,
) -> Result<Vec<MetricSeries>, String> {
    let all_metrics = state.list_metrics().await;

    let core_metrics: Vec<String> = all_metrics.into_iter()
        .filter(|name| name.starts_with(&format!("{}.", core_name)))
        .collect();

    let mut series = Vec::new();
    for metric_name in core_metrics {
        if let Some(s) = state.get_metric_series(&metric_name).await {
            series.push(s);
        }
    }

    Ok(series)
}

#[tauri::command]
pub async fn get_dashboard_metrics(
    state: State<'_, Arc<MetricsCollector>>,
) -> Result<DashboardMetrics, String> {
    Ok(DashboardMetrics {
        helios: get_helios_dashboard(&state).await?,
        nexus: get_nexus_dashboard(&state).await?,
        harmonia: get_harmonia_dashboard(&state).await?,
        sentinel: get_sentinel_dashboard(&state).await?,
        memory: get_memory_dashboard(&state).await?,
        selfheal: get_selfheal_dashboard(&state).await?,
        cognitive: get_cognitive_dashboard(&state).await?,
    })
}

#[derive(Serialize)]
pub struct DashboardMetrics {
    pub helios: HeliosDashboard,
    pub nexus: NexusDashboard,
    pub harmonia: HarmoniaDashboard,
    pub sentinel: SentinelDashboard,
    pub memory: MemoryDashboard,
    pub selfheal: SelfHealDashboard,
    pub cognitive: CognitiveDashboard,
}
```

---

## ÉTAPE 5: MEMORY EXPLORER & SECURITY

### 5.1 Exploration Hiérarchie Mémoire

```rust
// src-tauri/src/commands/devtools_memory.rs

#[tauri::command]
pub async fn get_memory_tree(
    state: State<'_, Arc<Mutex<MemoryCore>>>,
) -> Result<MemoryTree, String> {
    let memory = state.lock().await;

    let entries = memory.get_all_entries().await
        .map_err(|e| e.to_string())?;

    // Construire arbre par niveau
    let mut tree = MemoryTree {
        short_term: vec![],
        medium_term: vec![],
        long_term: vec![],
        meta_summary: vec![],
    };

    for entry in entries {
        let node = MemoryNode {
            id: entry.id.clone(),
            content_preview: truncate(&entry.content, 100),
            importance: entry.importance,
            access_count: entry.access_count,
            linked_count: entry.linked_entries.len(),
            timestamp: entry.created_at,
        };

        match entry.level {
            MemoryLevel::ShortTerm => tree.short_term.push(node),
            MemoryLevel::MediumTerm => tree.medium_term.push(node),
            MemoryLevel::LongTerm => tree.long_term.push(node),
            MemoryLevel::MetaSummary => tree.meta_summary.push(node),
        }
    }

    Ok(tree)
}

#[tauri::command]
pub async fn get_memory_entry_details(
    entry_id: String,
    state: State<'_, Arc<Mutex<MemoryCore>>>,
) -> Result<MemoryEntryDetails, String> {
    let memory = state.lock().await;

    let entry = memory.get_entry(&entry_id).await
        .map_err(|e| e.to_string())?;

    // Récupérer entrées liées
    let mut linked_entries = Vec::new();
    for linked_id in &entry.linked_entries {
        if let Ok(linked) = memory.get_entry(linked_id).await {
            linked_entries.push(MemoryNode {
                id: linked.id.clone(),
                content_preview: truncate(&linked.content, 50),
                importance: linked.importance,
                access_count: linked.access_count,
                linked_count: linked.linked_entries.len(),
                timestamp: linked.created_at,
            });
        }
    }

    Ok(MemoryEntryDetails {
        id: entry.id,
        content: entry.content,
        level: entry.level,
        importance: entry.importance,
        access_count: entry.access_count,
        linked_entries,
        created_at: entry.created_at,
        last_accessed: entry.last_accessed,
    })
}

#[tauri::command]
pub async fn search_memory(
    query: String,
    state: State<'_, Arc<Mutex<MemoryCore>>>,
) -> Result<Vec<MemoryNode>, String> {
    let memory = state.lock().await;

    let entries = memory.search(&query).await
        .map_err(|e| e.to_string())?;

    Ok(entries.into_iter()
        .map(|e| MemoryNode {
            id: e.id.clone(),
            content_preview: truncate(&e.content, 100),
            importance: e.importance,
            access_count: e.access_count,
            linked_count: e.linked_entries.len(),
            timestamp: e.created_at,
        })
        .collect())
}

#[derive(Serialize)]
pub struct MemoryTree {
    pub short_term: Vec<MemoryNode>,
    pub medium_term: Vec<MemoryNode>,
    pub long_term: Vec<MemoryNode>,
    pub meta_summary: Vec<MemoryNode>,
}

#[derive(Serialize)]
pub struct MemoryNode {
    pub id: String,
    pub content_preview: String,
    pub importance: f32,
    pub access_count: u32,
    pub linked_count: usize,
    pub timestamp: SystemTime,
}
```

### 5.2 Sécurité DevTools

```rust
// src-tauri/src/devtools/security.rs

pub struct DevToolsSecurityGuard {
    enabled: bool,
    require_auth: bool,
    allowed_operations: HashSet<DevToolsOperation>,
}

#[derive(Debug, Clone, Hash, Eq, PartialEq)]
pub enum DevToolsOperation {
    ReadLogs,
    ReadMetrics,
    ReadMemory,
    WriteMemory,
    ExecuteCommands,
    ModifyConfig,
    TriggerSelfHeal,
    ExportData,
}

impl DevToolsSecurityGuard {
    /// Vérifie autorisation opération
    pub fn authorize(&self, operation: DevToolsOperation) -> Result<(), SecurityError> {
        if !self.enabled {
            return Err(SecurityError::DevToolsDisabled);
        }

        if self.require_auth {
            // TODO: vérifier token JWT ou session
        }

        if !self.allowed_operations.contains(&operation) {
            return Err(SecurityError::OperationNotAllowed { operation });
        }

        Ok(())
    }
}

// Wrapper commandes sécurisées
#[tauri::command]
pub async fn secure_get_logs(
    filters: LogFilters,
    state: State<'_, Arc<LogCollector>>,
    guard: State<'_, Arc<DevToolsSecurityGuard>>,
) -> Result<Vec<LogEntry>, String> {
    guard.authorize(DevToolsOperation::ReadLogs)
        .map_err(|e| e.to_string())?;

    state.filter_logs(filters).await
        .map_err(|e| e.to_string())
}
```

---

## ÉTAPE 6: SELFHEAL INTEGRATION

### 5.1 Visualisation Incidents

```rust
#[tauri::command]
pub async fn get_selfheal_incidents(
    filters: IncidentFilters,
    state: State<'_, Arc<Mutex<SelfHealCore>>>,
) -> Result<Vec<SystemIncident>, String> {
    let selfheal = state.lock().await;

    let incidents = selfheal.get_incidents_history().await
        .map_err(|e| e.to_string())?;

    let filtered: Vec<SystemIncident> = incidents.into_iter()
        .filter(|i| {
            if let Some(ref types) = filters.issue_types {
                if !types.contains(&i.issue_type) {
                    return false;
                }
            }

            if let Some(ref status) = filters.status {
                if &i.status != status {
                    return false;
                }
            }

            if let Some(start) = filters.time_start {
                if i.detected_at < start {
                    return false;
                }
            }

            true
        })
        .collect();

    Ok(filtered)
}

#[tauri::command]
pub async fn get_selfheal_stats(
    state: State<'_, Arc<Mutex<SelfHealCore>>>,
) -> Result<SelfHealStats, String> {
    let selfheal = state.lock().await;

    let stats = selfheal.get_recovery_stats().await
        .map_err(|e| e.to_string())?;

    Ok(SelfHealStats {
        total_incidents: stats.total_incidents,
        successful_repairs: stats.successful_repairs,
        failed_repairs: stats.failed_repairs,
        mean_time_to_repair: stats.mean_time_to_repair,
        incidents_by_type: stats.incidents_by_type,
        repair_success_rate: stats.repair_success_rate(),
    })
}

#[tauri::command]
pub async fn trigger_manual_repair(
    incident_id: String,
    state: State<'_, Arc<Mutex<SelfHealCore>>>,
) -> Result<RepairResult, String> {
    let mut selfheal = state.lock().await;

    selfheal.repair_incident(&incident_id).await
        .map_err(|e| e.to_string())
}
```

---

## ÉTAPE 7: EXTENSIBILITÉ & CORE DISCOVERY

### 7.1 API Core Discovery

```rust
// src-tauri/src/devtools/discovery.rs

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoreDescriptor {
    pub name: String,
    pub version: String,
    pub status: CoreStatus,
    pub capabilities: Vec<String>,
    pub metrics_available: Vec<String>,
    pub commands_exposed: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CoreStatus {
    Active,
    Inactive,
    Initializing,
    Error { message: String },
}

pub struct CoreRegistry {
    cores: Arc<RwLock<HashMap<String, CoreDescriptor>>>,
}

impl CoreRegistry {
    pub fn new() -> Self {
        Self {
            cores: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Enregistre un core
    pub async fn register_core(&self, descriptor: CoreDescriptor) {
        let mut cores = self.cores.write().await;
        cores.insert(descriptor.name.clone(), descriptor);
    }

    /// Liste tous les cores
    pub async fn list_cores(&self) -> Vec<CoreDescriptor> {
        let cores = self.cores.read().await;
        cores.values().cloned().collect()
    }

    /// Récupère core par nom
    pub async fn get_core(&self, name: &str) -> Option<CoreDescriptor> {
        let cores = self.cores.read().await;
        cores.get(name).cloned()
    }
}

#[tauri::command]
pub async fn discover_cores(
    state: State<'_, Arc<CoreRegistry>>,
) -> Result<Vec<CoreDescriptor>, String> {
    Ok(state.list_cores().await)
}

#[tauri::command]
pub async fn get_core_info(
    core_name: String,
    state: State<'_, Arc<CoreRegistry>>,
) -> Result<CoreDescriptor, String> {
    state.get_core(&core_name).await
        .ok_or_else(|| format!("Core '{}' not found", core_name))
}
```

### 7.2 Extensibilité DevTools UI

```typescript
// Interface TypeScript pour extensions DevTools

interface DevToolsExtension {
    id: string;
    name: string;
    version: string;

    // Lifecycle hooks
    onActivate(): Promise<void>;
    onDeactivate(): Promise<void>;

    // Panels
    panels: DevToolsPanel[];

    // Commandes custom
    commands?: DevToolsCommand[];
}

interface DevToolsPanel {
    id: string;
    title: string;
    icon: string;

    // Composant React à afficher
    component: React.ComponentType<any>;

    // Sources de données
    dataSource?: {
        metrics?: string[];
        logs?: LogFilters;
        streams?: string[];
    };
}

interface DevToolsCommand {
    id: string;
    label: string;
    execute(): Promise<void>;
}

// Exemple extension cognitive
const cognitiveExtension: DevToolsExtension = {
    id: "cognitive-devtools",
    name: "Cognitive Inspector",
    version: "1.0.0",

    async onActivate() {
        console.log("Cognitive DevTools activated");
    },

    async onDeactivate() {
        console.log("Cognitive DevTools deactivated");
    },

    panels: [
        {
            id: "cognitive-state",
            title: "État Cognitif",
            icon: "brain",
            component: CognitiveStatePanel,
            dataSource: {
                metrics: ["cognitive.mental_charge", "cognitive.heart_alignment"],
                streams: ["cognitive-state-update"],
            },
        },
        {
            id: "emotion-timeline",
            title: "Timeline Émotions",
            icon: "heart",
            component: EmotionTimelinePanel,
            dataSource: {
                streams: ["emotion-update"],
            },
        },
    ],
};
```

---

## ÉTAPE 8: TEST & DX STRATEGIES

### 8.1 Tests API

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_log_correlation() {
        let collector = LogCollector::new(1000);

        let correlation_id = Uuid::new_v4().to_string();

        // Simuler série de logs corrélés
        CURRENT_CORRELATION_ID.with(|id| {
            *id.borrow_mut() = Some(correlation_id.clone());
        });

        collector.log(
            LogLevel::Info,
            "test_core".into(),
            "Log 1".into(),
            json!({}),
        ).await;

        collector.log(
            LogLevel::Info,
            "test_core".into(),
            "Log 2".into(),
            json!({}),
        ).await;

        // Récupérer logs corrélés
        let correlated = collector.get_correlated_logs(&correlation_id).await;
        assert_eq!(correlated.len(), 2);
    }

    #[tokio::test]
    async fn test_metrics_gauge() {
        let collector = MetricsCollector::new();

        collector.set_gauge(
            "test.cpu_usage",
            75.5,
            HashMap::from([("host".into(), "localhost".into())]),
        ).await;

        let series = collector.get_metric_series("test.cpu_usage").await.unwrap();
        assert_eq!(series.values.len(), 1);
        assert_eq!(series.values[0].value, 75.5);
    }

    #[tokio::test]
    async fn test_memory_tree_construction() {
        let memory = MemoryCore::new();

        // Ajouter entrées de chaque niveau
        memory.store(create_test_entry(MemoryLevel::ShortTerm)).await.unwrap();
        memory.store(create_test_entry(MemoryLevel::MediumTerm)).await.unwrap();
        memory.store(create_test_entry(MemoryLevel::LongTerm)).await.unwrap();

        let tree = build_memory_tree(&memory).await.unwrap();

        assert_eq!(tree.short_term.len(), 1);
        assert_eq!(tree.medium_term.len(), 1);
        assert_eq!(tree.long_term.len(), 1);
    }

    #[tokio::test]
    async fn test_core_discovery() {
        let registry = CoreRegistry::new();

        registry.register_core(CoreDescriptor {
            name: "helios".into(),
            version: "1.0.0".into(),
            status: CoreStatus::Active,
            capabilities: vec!["monitoring".into()],
            metrics_available: vec!["cpu_usage".into()],
            commands_exposed: vec!["get_system_health".into()],
        }).await;

        let cores = registry.list_cores().await;
        assert_eq!(cores.len(), 1);
        assert_eq!(cores[0].name, "helios");
    }
}
```

### 8.2 Developer Experience (DX)

#### Documentation Auto-Générée

```rust
// Macro pour auto-documenter commandes
#[devtools_command(
    category = "Metrics",
    description = "Récupère série temporelle métrique",
    example = r#"await invoke('get_metric', { name: 'helios.cpu_usage' })"#
)]
#[tauri::command]
pub async fn get_metric(name: String) -> Result<MetricSeries, String> {
    // ...
}

// Génère automatiquement:
// - Docs API markdown
// - Types TypeScript
// - Tests Postman collection
```

#### Playground Interactif

```typescript
// DevTools UI avec playground intégré

interface ApiPlayground {
    command: string;
    params: Record<string, any>;
    response: any;
    error: any;
}

function DevToolsPlayground() {
    const [playground, setPlayground] = useState<ApiPlayground>({
        command: "get_system_health",
        params: {},
        response: null,
        error: null,
    });

    const executeCommand = async () => {
        try {
            const result = await invoke(playground.command, playground.params);
            setPlayground({ ...playground, response: result, error: null });
        } catch (e) {
            setPlayground({ ...playground, error: e, response: null });
        }
    };

    return (
        <div>
            <select onChange={e => setPlayground({ ...playground, command: e.target.value })}>
                <option>get_system_health</option>
                <option>get_logs</option>
                <option>get_metric</option>
                {/* ... */}
            </select>

            <JsonEditor value={playground.params} onChange={setPlayground.params} />

            <button onClick={executeCommand}>Execute</button>

            <JsonView data={playground.response || playground.error} />
        </div>
    );
}
```

---

## RÉSUMÉ TECHNIQUE

### API Complète (40+ commandes)

**Logs**: `get_logs`, `get_correlated_logs`, `search_logs`, `export_logs`
**Metrics**: `get_metric`, `list_all_metrics`, `get_core_metrics`, `get_dashboard_metrics`
**Memory**: `get_memory_tree`, `get_memory_entry_details`, `search_memory`
**SelfHeal**: `get_selfheal_incidents`, `get_selfheal_stats`, `trigger_manual_repair`
**Discovery**: `discover_cores`, `get_core_info`
**Cognitive**: `get_cognitive_state`, `get_emotion_state`, `get_interruptibility_score`

### Streams Temps Réel (10+ événements)

- `cognitive-state-update`
- `emotion-update`
- `logs-stream`
- `metrics-stream`
- `selfheal-incident`
- `memory-change`
- `core-status-change`

### Types TypeScript Auto-Générés

Tous les types Rust (LogEntry, Metric, CoreDescriptor, etc.) exportés vers TypeScript via `ts-rs` ou génération custom.

### Sécurité

- DevToolsSecurityGuard avec autorisation par opération
- Possibilité auth JWT/session
- Logs d'accès audit trail

### Extensibilité

- CoreRegistry pour discovery dynamique
- Interface DevToolsExtension pour plugins UI
- API ouverte pour ajout cores custom

---

**FIN DU DOCUMENT** - API DevTools Backend v13+ complète
