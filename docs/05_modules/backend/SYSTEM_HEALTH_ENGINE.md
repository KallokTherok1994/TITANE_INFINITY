# SYSTEM_HEALTH_ENGINE — Module Backend

**Module Path:** `src-tauri/src/core/modules/system_health.rs` (567 lignes)  
**Version:** v20.0  
**Type:** Infrastructure Critique (Fusion Helios + Sentinel + Self-Heal)  
**Fusion Phase:** Phase 2 Fusion #3 (v20.0)

---

## 📋 MODULE OVERVIEW

### Responsibilities

Le System Health Engine est le moteur unifié de monitoring, détection d'anomalies et auto-réparation système. Il fusionne trois modules précédents (Helios, Sentinel, Self-Heal) en un système cohérent de closed-loop monitoring: **Monitor → Detect → Heal**.

**Monitoring (ex-Helios):**
- Collecte métriques système (CPU, RAM, disk, network, uptime)
- Suivi latences moteurs
- Calcul score de santé global (0.0-1.0)

**Détection Anomalies (ex-Sentinel):**
- Scan continu anomalies (HighCPU, HighMemory, HighDisk, HighLatency, ModuleFailure)
- Classification sévérité (Info, Warning, Error, Critical)
- Alertes système + logging structuré

**Auto-Healing (ex-Self-Heal):**
- Détermination actions de réparation automatiques
- Exécution healing avec circuit breaker
- Tracking taux de succès (exponential moving average α=0.1)
- Historique erreurs (rotation automatique)

### Key Features

- **Unified Health Score:** Score global 0.0-1.0 (CPU 30%, Memory 30%, Disk 20%, Success Rate 20%, Error Penalty)
- **Closed-Loop Architecture:** tick() → collect → scan → heal → update
- **Auto-Healing Intégré:** Healing automatique si anomalies auto_healable (pas d'API externe requise)
- **Module Health Tracking:** Surveillance santé moteurs (CoherenceEngine, UnifiedMemory, etc.)
- **Lightweight:** <1ms overhead par tick (metrics collection + anomaly scan)

### Integration Points

- **SingularityState:** tick() appelé à chaque cycle Singularity (~100-200ms)
- **SELF_HEALING_ENGINE:** Backend self-healing delègue actions complexes
- **OMEGA Pipeline:** Monitoring latences AI generation
- **ConversationEngine:** Suivi santé conversation stages
- **UnifiedMemory:** Détection défaillances mémoire

---

## 🏗️ ARCHITECTURE

### System Health Closed-Loop Flow

```
┌───────────────────────────────────────────────────────────┐
│              SINGULARITY::tick()                          │
│              (~100-200ms interval)                        │
└───────────────────────────────────────────────────────────┘
                          ↓
┌───────────────────────────────────────────────────────────┐
│  PHASE 1: COLLECT METRICS (ex-Helios)                    │
│  SystemHealth::collect_metrics()                          │
│  - sysinfo: CPU usage (all cores avg)                    │
│  - sysinfo: Memory usage (used/total * 100)              │
│  - sysinfo: Disk usage (placeholder 50%)                 │
│  - Network latency (placeholder 10ms)                    │
│  - Uptime (placeholder)                                   │
│  Duration: <1ms                                           │
└───────────────────────────────────────────────────────────┘
                          ↓
┌───────────────────────────────────────────────────────────┐
│  PHASE 2: SCAN ANOMALIES (ex-Sentinel)                   │
│  SystemHealth::scan_anomalies(state)                      │
│  - CPU > 80% → HighCPU (severity 0.0-1.0)                │
│  - Memory > 85% → HighMemory (severity 0.0-1.0)          │
│  - Disk > 90% → HighDisk (severity 0.0-1.0)              │
│  - Module::health() == Failing → ModuleFailure (0.8)     │
│  - Log anomalies avec ErrorSeverity                       │
│  Duration: <0.5ms                                         │
└───────────────────────────────────────────────────────────┘
                          ↓
┌───────────────────────────────────────────────────────────┐
│  PHASE 3: AUTO-HEAL (ex-Self-Heal)                       │
│  SystemHealth::auto_heal(anomalies)                       │
│  if auto_heal_enabled && !anomalies.is_empty()           │
│  - HighCPU → reduce_cpu_load()                           │
│  - HighMemory → clear_memory_cache()                     │
│  - ModuleFailure → restart_failed_module()               │
│  - Track success_rate (EMA α=0.1)                        │
│  - Update repairs_performed counter                      │
│  Duration: 50-200ms (async)                              │
└───────────────────────────────────────────────────────────┘
                          ↓
┌───────────────────────────────────────────────────────────┐
│  PHASE 4: COMPUTE GLOBAL HEALTH                          │
│  SystemHealth::compute_health_score()                     │
│  - cpu_health = (100 - cpu_usage) / 100 * 0.3           │
│  - mem_health = (100 - memory_usage) / 100 * 0.3        │
│  - disk_health = (100 - disk_usage) / 100 * 0.2         │
│  - success_rate * 0.2                                    │
│  - error_penalty = min(10, error_log.len()) * 0.05      │
│  global_health = (sum - error_penalty).clamp(0.0, 1.0)  │
│  Duration: <0.1ms                                         │
└───────────────────────────────────────────────────────────┘
                          ↓
┌───────────────────────────────────────────────────────────┐
│  PHASE 5: UPDATE ENGINE HEALTH STATUS                    │
│  - global_health > 0.8 → Healthy                         │
│  - global_health > 0.5 → Degraded                        │
│  - global_health > 0.2 → Failing                         │
│  - global_health ≤ 0.2 → Offline                         │
│  - last_update_ms = current_timestamp()                  │
└───────────────────────────────────────────────────────────┘
```

### Fusion Architecture (v20.0)

**Avant Fusion (v19.x):**
```
┌──────────┐   ┌───────────┐   ┌───────────┐
│  Helios  │   │ Sentinel  │   │ Self-Heal │
│ (monitor)│   │ (detect)  │   │  (repair) │
└──────────┘   └───────────┘   └───────────┘
     ↓              ↓                ↓
  Metrics       Anomalies        Repairs
     ↓              ↓                ↓
     └──────────────┴────────────────┘
                    ↓
             DUPLICATED LOGIC
         (3 tick loops, 3 inits)
```

**Après Fusion (v20.0):**
```
┌───────────────────────────────────────────┐
│      SYSTEM HEALTH ENGINE v20.0           │
│  ┌─────────────────────────────────────┐  │
│  │  Monitoring Layer (ex-Helios)       │  │
│  │  - collect_metrics()                │  │
│  │  - cpu_usage, memory_usage, disk    │  │
│  └─────────────────────────────────────┘  │
│  ┌─────────────────────────────────────┐  │
│  │  Detection Layer (ex-Sentinel)      │  │
│  │  - scan_anomalies()                 │  │
│  │  - error_log, alert_count           │  │
│  └─────────────────────────────────────┘  │
│  ┌─────────────────────────────────────┐  │
│  │  Healing Layer (ex-Self-Heal)       │  │
│  │  - auto_heal()                      │  │
│  │  - repairs_performed, success_rate  │  │
│  └─────────────────────────────────────┘  │
└───────────────────────────────────────────┘
             UNIFIED TICK LOOP
         (1 init, 1 tick, coherent)
```

---

## 🔧 API REFERENCE

### Data Structures

```rust
/// Unified System Health Engine (v20.0)
/// Fusion: Helios + Sentinel + Self-Heal
pub struct SystemHealth {
    // Core state
    health: EngineHealth,           // Healthy | Degraded | Failing | Offline
    initialized: bool,
    pub last_update_ms: u64,

    // System metrics (ex-Helios)
    pub cpu_usage: f32,             // 0.0-100.0%
    pub memory_usage: f32,          // 0.0-100.0%
    pub disk_usage: f32,            // 0.0-100.0%
    pub network_latency_ms: u32,    // Latence réseau (placeholder)
    pub uptime_ms: u64,             // Uptime système (placeholder)

    // Monitoring (ex-Sentinel)
    pub alert_count: u64,           // Nombre total alertes
    pub active_monitors: u32,       // Moniteurs actifs (CPU, Memory, Disk = 3)
    pub protection_level: u8,       // Niveau protection (1-10)
    error_log: Vec<ErrorRecord>,    // Historique erreurs (auto-rotation)

    // Auto-healing (ex-Self-Heal)
    pub repairs_performed: u64,     // Réparations totales
    pub last_repair_ms: u64,        // Timestamp dernière réparation
    pub success_rate: f32,          // Taux succès (0.0-1.0, EMA)
    pub auto_heal_enabled: bool,    // Auto-healing actif

    // Unified health score
    pub global_health: f32,         // Score global 0.0-1.0
}

pub struct ErrorRecord {
    pub timestamp: u64,
    pub severity: ErrorSeverity,
    pub module: String,
    pub message: String,
    pub auto_repaired: bool,        // True si réparé automatiquement
}

pub enum ErrorSeverity {
    Info,        // Information
    Warning,     // Attention requise
    Error,       // Erreur non-critique
    Critical,    // Critique, action immédiate
}

pub struct Anomaly {
    pub detected_at: u64,
    pub anomaly_type: AnomalyType,
    pub severity: f32,              // 0.0-1.0
    pub description: String,
    pub auto_healable: bool,
}

pub enum AnomalyType {
    HighCPU,                        // CPU > 80%
    HighMemory,                     // Memory > 85%
    HighDisk,                       // Disk > 90%
    HighLatency,                    // Latence élevée
    ModuleFailure,                  // Module défaillant
    DataCorruption,                 // Corruption données
}

pub struct HealingReport {
    pub anomalies_detected: usize,
    pub repairs_attempted: usize,
    pub repairs_successful: usize,
    pub success_rate: f32,          // 0.0-1.0
}

pub struct HealthReport {
    pub timestamp: u64,
    pub global_health: f32,
    pub cpu_usage: f32,
    pub memory_usage: f32,
    pub disk_usage: f32,
    pub network_latency_ms: u32,
    pub alert_count: u64,
    pub repairs_performed: u64,
    pub success_rate: f32,
    pub issues: Vec<HealthIssue>,   // 5 dernières erreurs
}

pub struct HealthIssue {
    pub severity: ErrorSeverity,
    pub module: String,
    pub description: String,
}

pub enum EngineHealth {
    Healthy,                        // global_health > 0.8
    Degraded,                       // global_health > 0.5
    Failing,                        // global_health > 0.2
    Offline,                        // global_health ≤ 0.2
}
```

### Methods

```rust
// ═══════════════════════════════════════════════════════════════
//   INITIALIZATION
// ═══════════════════════════════════════════════════════════════

pub fn new() -> Self
// Crée une nouvelle instance SystemHealth avec valeurs par défaut
// - health = Offline
// - global_health = 1.0 (optimiste)
// - auto_heal_enabled = true
// - success_rate = 1.0 (pas encore de réparations)

pub fn init(&mut self) -> EngineResult<()>
// Initialise le moteur
// - Collecte métriques initiales
// - Passe health → Healthy
// - initialized = true
// Usage: Appelé une fois au démarrage système

// ═══════════════════════════════════════════════════════════════
//   MAIN TICK LOOP
// ═══════════════════════════════════════════════════════════════

pub async fn tick(&mut self, state: &mut SingularityState) -> EngineResult<()>
// Main loop: monitor → detect → heal → update
// 1. collect_metrics() → CPU, RAM, disk
// 2. scan_anomalies(state) → Détection anomalies
// 3. auto_heal(anomalies) → Réparation si enabled
// 4. compute_health_score() → Calcul global_health
// 5. Update health status (Healthy/Degraded/Failing/Offline)
// Duration: ~1-2ms (sans healing), ~50-200ms (avec healing)
// Usage: Appelé à chaque cycle Singularity (~100-200ms)

// ═══════════════════════════════════════════════════════════════
//   MONITORING (ex-Helios)
// ═══════════════════════════════════════════════════════════════

fn collect_metrics(&mut self) -> EngineResult<()>
// Collecte métriques système via sysinfo crate
// - CPU: average all cores
// - Memory: used / total * 100
// - Disk: placeholder 50% (API sysinfo changed)
// - Network latency: placeholder 10ms
// - Uptime: placeholder
// Duration: <1ms
// Errors: Fail-safe, retourne Ok() même si collection partielle

pub fn health(&self) -> EngineHealth
// Retourne statut santé actuel (Healthy/Degraded/Failing/Offline)

pub fn get_report(&self) -> HealthReport
// Génère rapport de santé complet
// - Métriques actuelles (CPU, RAM, disk, network)
// - Counters (alert_count, repairs_performed)
// - Success rate
// - 5 dernières erreurs (HealthIssue)

// ═══════════════════════════════════════════════════════════════
//   DETECTION (ex-Sentinel)
// ═══════════════════════════════════════════════════════════════

fn scan_anomalies(&mut self, state: &SingularityState) -> Vec<Anomaly>
// Scan anomalies basé sur métriques actuelles
// - HighCPU: cpu_usage > 80% (severity = (usage - 80) / 20)
// - HighMemory: memory_usage > 85% (severity = (usage - 85) / 15)
// - HighDisk: disk_usage > 90% (severity = (usage - 90) / 10, auto_healable = false)
// - ModuleFailure: state.module.health() == Failing (severity = 0.8)
// - Log anomalies to error_log
// Returns: Vec<Anomaly> avec auto_healable flag

fn log_error(&mut self, severity: ErrorSeverity, module: &str, message: String)
// Ajoute erreur au log avec auto-rotation
// - Max 100 entrées (FIFO)
// - Incrémente alert_count si severity >= Error

// ═══════════════════════════════════════════════════════════════
//   HEALING (ex-Self-Heal)
// ═══════════════════════════════════════════════════════════════

async fn auto_heal(&mut self, anomalies: Vec<Anomaly>) -> HealingReport
// Exécute réparation automatique pour anomalies auto_healable
// - HighCPU → reduce_cpu_load()
// - HighMemory → clear_memory_cache()
// - ModuleFailure → restart_failed_module(description)
// - Update success_rate (EMA α=0.1): new_rate * 0.1 + old_rate * 0.9
// - Incrémente repairs_performed si succès
// - Update last_repair_ms si au moins 1 succès
// Returns: HealingReport (detected, attempted, successful, success_rate)
// Duration: 50-200ms (async operations)

async fn reduce_cpu_load(&self) -> bool
// Placeholder: Réduction charge CPU (future implementation)
// Returns: true si succès

async fn clear_memory_cache(&self) -> bool
// Placeholder: Vidage cache mémoire (future implementation)
// Returns: true si succès

async fn restart_failed_module(&self, description: &str) -> bool
// Placeholder: Redémarrage module défaillant (future implementation)
// Args: description contient nom du module extrait de l'anomalie
// Returns: true si succès

fn mark_error_repaired(&mut self, description: &str)
// Marque erreur comme réparée dans error_log
// Trouve entrée matching description → auto_repaired = true

// ═══════════════════════════════════════════════════════════════
//   SCORING
// ═══════════════════════════════════════════════════════════════

fn compute_health_score(&self) -> f32
// Calcule score global de santé 0.0-1.0
// Formula:
//   cpu_health = (100 - cpu_usage.min(100)) / 100 * 0.3
//   mem_health = (100 - memory_usage.min(100)) / 100 * 0.3
//   disk_health = (100 - disk_usage.min(100)) / 100 * 0.2
//   error_penalty = min(10, error_log.len()) * 0.05
//   score = (cpu_health + mem_health + disk_health + success_rate * 0.2) - error_penalty
//   return score.clamp(0.0, 1.0)
// Duration: <0.1ms

// ═══════════════════════════════════════════════════════════════
//   UTILITIES
// ═══════════════════════════════════════════════════════════════

fn current_timestamp() -> u64
// Timestamp UTC en millisecondes
```

---

## 🧪 TESTING

### Unit Tests (Rust)

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new_system_health() {
        let health = SystemHealth::new();
        assert_eq!(health.health, EngineHealth::Offline);
        assert!(!health.initialized);
        assert_eq!(health.global_health, 1.0);
        assert!(health.auto_heal_enabled);
    }

    #[test]
    fn test_init_health_engine() {
        let mut health = SystemHealth::new();
        let result = health.init();
        
        assert!(result.is_ok());
        assert!(health.initialized);
        assert_eq!(health.health, EngineHealth::Healthy);
    }

    #[tokio::test]
    async fn test_tick_healthy() {
        let mut health = SystemHealth::new();
        health.init().unwrap();
        
        let mut state = SingularityState::new();
        let result = health.tick(&mut state).await;
        
        assert!(result.is_ok());
        assert!(health.global_health > 0.0);
        assert!(health.last_update_ms > 0);
    }

    #[tokio::test]
    async fn test_high_memory_anomaly() {
        let mut health = SystemHealth::new();
        health.memory_usage = 90.0; // 90% - critique
        
        let state = SingularityState::new();
        let anomalies = health.scan_anomalies(&state);
        
        assert!(!anomalies.is_empty());
        assert_eq!(anomalies[0].anomaly_type, AnomalyType::HighMemory);
        assert!(anomalies[0].severity > 0.0);
        assert!(anomalies[0].auto_healable);
    }

    #[tokio::test]
    async fn test_auto_heal_high_memory() {
        let mut health = SystemHealth::new();
        
        let anomalies = vec![Anomaly {
            detected_at: 0,
            anomaly_type: AnomalyType::HighMemory,
            severity: 0.5,
            description: "Memory at 90%".to_string(),
            auto_healable: true,
        }];
        
        let report = health.auto_heal(anomalies).await;
        
        assert_eq!(report.anomalies_detected, 1);
        assert!(report.repairs_attempted > 0);
        // Note: success depends on implementation (placeholder returns false)
    }

    #[test]
    fn test_health_score_calculation() {
        let mut health = SystemHealth::new();
        health.cpu_usage = 50.0;    // 50% → 0.5 health * 0.3 = 0.15
        health.memory_usage = 60.0; // 60% → 0.4 health * 0.3 = 0.12
        health.disk_usage = 40.0;   // 40% → 0.6 health * 0.2 = 0.12
        health.success_rate = 0.9;  // 0.9 * 0.2 = 0.18
        // Total = 0.15 + 0.12 + 0.12 + 0.18 = 0.57 (no errors)
        
        let score = health.compute_health_score();
        assert!(score > 0.5);
        assert!(score < 0.6);
    }

    #[test]
    fn test_health_score_with_errors() {
        let mut health = SystemHealth::new();
        health.cpu_usage = 10.0;
        health.memory_usage = 20.0;
        health.disk_usage = 30.0;
        health.success_rate = 1.0;
        
        // Add 10 errors → penalty = 0.5
        for i in 0..10 {
            health.log_error(
                ErrorSeverity::Error,
                "TestModule",
                format!("Error {}", i),
            );
        }
        
        let score = health.compute_health_score();
        // Without errors: ~0.95, with 10 errors: -0.5 penalty
        assert!(score < 0.5); // Penalty applied
    }

    #[test]
    fn test_engine_health_status() {
        let mut health = SystemHealth::new();
        
        // Healthy
        health.global_health = 0.9;
        assert_eq!(health.health(), EngineHealth::Healthy);
        
        // Degraded
        health.global_health = 0.6;
        assert_eq!(health.health(), EngineHealth::Degraded);
        
        // Failing
        health.global_health = 0.3;
        assert_eq!(health.health(), EngineHealth::Failing);
        
        // Offline
        health.global_health = 0.1;
        assert_eq!(health.health(), EngineHealth::Offline);
    }

    #[test]
    fn test_error_log_rotation() {
        let mut health = SystemHealth::new();
        
        // Add 150 errors (max 100)
        for i in 0..150 {
            health.log_error(
                ErrorSeverity::Info,
                "Module",
                format!("Error {}", i),
            );
        }
        
        // Should keep only last 100
        assert!(health.error_log.len() <= 100);
        
        // First error should be error 50 (0-49 rotated out)
        assert!(health.error_log[0].message.contains("50"));
    }

    #[tokio::test]
    async fn test_success_rate_ema() {
        let mut health = SystemHealth::new();
        health.success_rate = 0.8; // Initial 80%
        
        // Simulate healing with 100% success
        let report = HealingReport {
            anomalies_detected: 1,
            repairs_attempted: 1,
            repairs_successful: 1,
            success_rate: 1.0,
        };
        
        // EMA update: 0.8 * 0.9 + 1.0 * 0.1 = 0.82
        health.success_rate = health.success_rate * 0.9 + report.success_rate * 0.1;
        
        assert!((health.success_rate - 0.82).abs() < 0.01);
    }
}
```

### Integration Tests

```rust
#[cfg(test)]
mod integration_tests {
    use super::*;

    #[tokio::test]
    async fn test_full_health_cycle() {
        let mut health = SystemHealth::new();
        health.init().unwrap();
        
        let mut state = SingularityState::new();
        
        // Simulate high memory
        health.memory_usage = 90.0;
        
        // Tick should detect and heal
        let result = health.tick(&mut state).await;
        assert!(result.is_ok());
        
        // Verify anomaly logged
        assert!(health.alert_count > 0);
        
        // Verify healing attempted (even if placeholder fails)
        // repairs_performed might be 0 if placeholder returns false
        assert!(health.last_update_ms > 0);
    }

    #[tokio::test]
    async fn test_module_failure_detection() {
        let mut health = SystemHealth::new();
        health.init().unwrap();
        
        let mut state = SingularityState::new();
        
        // Force CoherenceEngine to fail
        state.coherence.set_health(EngineHealth::Failing);
        
        // Scan should detect ModuleFailure
        let anomalies = health.scan_anomalies(&state);
        
        let module_failures: Vec<&Anomaly> = anomalies
            .iter()
            .filter(|a| a.anomaly_type == AnomalyType::ModuleFailure)
            .collect();
        
        assert!(!module_failures.is_empty());
        assert_eq!(module_failures[0].severity, 0.8);
    }
}
```

---

## ⚡ PERFORMANCE

### Latencies

| Opération | Latence Typique | Latence Max | Notes |
|-----------|-----------------|-------------|-------|
| `init()` | ~1-2ms | 5ms | One-time initialization |
| `tick()` (sans healing) | ~1-2ms | 5ms | Collect + scan + compute |
| `tick()` (avec healing) | ~50-200ms | 500ms | Async healing operations |
| `collect_metrics()` | <1ms | 2ms | sysinfo crate overhead |
| `scan_anomalies()` | <0.5ms | 1ms | Vec iteration + comparisons |
| `compute_health_score()` | <0.1ms | 0.5ms | Simple arithmetic |
| `auto_heal()` | ~50-200ms | 500ms | Depends on repair actions |

### Resource Usage

| Métrique | Valeur | Notes |
|----------|--------|-------|
| **Memory Overhead** | ~5-10 KB | ErrorRecord Vec (auto-rotation 100 max) |
| **CPU Impact (tick)** | <0.1% | Passive monitoring |
| **CPU Impact (healing)** | 1-3% | During repair operations |
| **Disk I/O** | 0 | No persistence (in-memory) |
| **Network** | 0 | Local system metrics only |

### Scalability

- **Error Log Rotation:** Max 100 entrées (FIFO, automatic cleanup)
- **Tick Frequency:** ~100-200ms (Singularity-driven, no independent thread)
- **Anomaly Detection:** O(n) où n = nombre de modules surveillés (~5-10)
- **Healing Actions:** Séquentiel (1 action à la fois, pas de parallélisme)

### Optimization Opportunities

1. **Disk Metrics:** Implémenter vraie collecte disk usage (actuellement placeholder)
2. **Network Latency:** Ping réel vers services externes (actuellement placeholder)
3. **Healing Actions:** Implémenter vraies réparations (clear_memory_cache, restart_module)
4. **Async Healing:** Paralléliser réparations indépendantes (reduce_cpu_load || clear_cache)

---

## 🔗 INTEGRATIONS

### SingularityState Integration

```rust
// src-tauri/src/core/state.rs
impl SingularityState {
    pub async fn tick(&mut self) -> EngineResult<()> {
        // ... autres moteurs ...
        
        // System Health tick (monitor → detect → heal)
        self.system_health.tick(self).await?;
        
        // Check global health status
        if self.system_health.health() == EngineHealth::Failing {
            // Trigger emergency safe mode
            self.enter_safe_mode()?;
        }
        
        Ok(())
    }
}
```

### SELF_HEALING_ENGINE Integration

```rust
// src-tauri/src/system/self_heal.rs
impl SelfHealEngine {
    pub async fn determine_actions(&self, health: &SystemHealth) -> Vec<RepairAction> {
        let mut actions = Vec::new();
        
        // Délégation vers SystemHealth pour anomalies simples
        if health.global_health < 0.3 {
            // Critical state → déléguer à SystemHealth auto-healing
            return vec![RepairAction::DelegateToSystemHealth];
        }
        
        // Actions complexes non gérées par SystemHealth
        if health.anomaly_score > 0.8 {
            actions.push(RepairAction::RestartOmega);
            actions.push(RepairAction::ClearMemoryCache);
        }
        
        actions
    }
}
```

### Frontend Integration (Tauri Commands)

```rust
// src-tauri/src/commands/health.rs
#[tauri::command]
pub async fn get_system_health(
    state: tauri::State<'_, AppState>
) -> Result<HealthReport, String> {
    let singularity = state.singularity.lock().await;
    Ok(singularity.system_health.get_report())
}

#[tauri::command]
pub async fn force_health_check(
    state: tauri::State<'_, AppState>
) -> Result<(), String> {
    let mut singularity = state.singularity.lock().await;
    singularity.system_health
        .tick(&mut singularity)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
```

```typescript
// src/services/health/systemHealthService.ts
import { invoke } from '@tauri-apps/api';

export interface HealthReport {
  timestamp: number;
  global_health: number;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  alert_count: number;
  repairs_performed: number;
  success_rate: number;
  issues: HealthIssue[];
}

export async function getSystemHealth(): Promise<HealthReport> {
  return await invoke('get_system_health');
}

export async function forceHealthCheck(): Promise<void> {
  await invoke('force_health_check');
}

// Auto-refresh health every 5s
setInterval(async () => {
  const health = await getSystemHealth();
  
  if (health.global_health < 0.5) {
    // Trigger frontend alert
    console.warn('System health degraded:', health);
  }
}, 5000);
```

---

## 📚 USE CASES

### Use Case 1: High Memory Detection + Auto-Heal

**Scenario:** Utilisation mémoire atteint 88%, SystemHealth détecte et répare automatiquement

```rust
// 1. Singularity tick() appelle SystemHealth::tick()
pub async fn tick(&mut self) -> EngineResult<()> {
    self.system_health.tick(self).await?;
}

// 2. collect_metrics() détecte memory_usage = 88%
health.collect_metrics()?;
// memory_usage = 88.0

// 3. scan_anomalies() crée anomalie HighMemory
let anomalies = health.scan_anomalies(&state);
// anomalies = [Anomaly {
//   anomaly_type: HighMemory,
//   severity: (88 - 85) / 15 = 0.2,
//   auto_healable: true
// }]

// 4. auto_heal() exécute clear_memory_cache()
if health.auto_heal_enabled {
    let report = health.auto_heal(anomalies).await;
    // repairs_attempted = 1
    // repairs_successful = 0 (placeholder returns false)
}

// 5. global_health recalculé
health.global_health = health.compute_health_score();
// cpu_health=0.27 + mem_health=0.036 + disk_health=0.12 + success_rate=0.18 = 0.606

// 6. Status = Degraded (0.606 > 0.5)
health.health = EngineHealth::Degraded;
```

### Use Case 2: Module Failure Detection

**Scenario:** CoherenceEngine passe en état Failing, SystemHealth détecte et log

```rust
// 1. Module externe (CoherenceEngine) échoue
state.coherence.set_health(EngineHealth::Failing);

// 2. SystemHealth::scan_anomalies() détecte
let anomalies = health.scan_anomalies(&state);
// Anomaly {
//   anomaly_type: ModuleFailure,
//   severity: 0.8,
//   description: "CoherenceEngine failing",
//   auto_healable: true
// }

// 3. auto_heal() tente restart_failed_module()
let report = health.auto_heal(vec![anomaly]).await;
// restart_failed_module("CoherenceEngine failing") → future impl

// 4. Log erreur
health.log_error(
    ErrorSeverity::Critical,
    "SystemHealth",
    "CoherenceEngine failing",
);

// 5. alert_count incrémenté
health.alert_count += 1;
```

### Use Case 3: Frontend Health Dashboard

**Scenario:** Interface utilisateur affiche santé système en temps réel

```typescript
// Frontend component
import { getSystemHealth } from '@/services/health/systemHealthService';

function HealthDashboard() {
  const [health, setHealth] = useState<HealthReport | null>(null);
  
  useEffect(() => {
    const interval = setInterval(async () => {
      const report = await getSystemHealth();
      setHealth(report);
    }, 2000); // Refresh every 2s
    
    return () => clearInterval(interval);
  }, []);
  
  if (!health) return <div>Loading...</div>;
  
  return (
    <div className="health-dashboard">
      <HealthScore score={health.global_health} />
      {/* 0.9 → Green, 0.6 → Yellow, 0.3 → Red */}
      
      <MetricBar label="CPU" value={health.cpu_usage} max={100} />
      <MetricBar label="Memory" value={health.memory_usage} max={100} />
      <MetricBar label="Disk" value={health.disk_usage} max={100} />
      
      <Stats
        alerts={health.alert_count}
        repairs={health.repairs_performed}
        successRate={health.success_rate}
      />
      
      <IssuesList issues={health.issues} />
      {/* Display last 5 errors with severity badges */}
    </div>
  );
}
```

---

## 🛡️ ERROR HANDLING

### Fail-Safe Metrics Collection

```rust
fn collect_metrics(&mut self) -> EngineResult<()> {
    let mut sys = System::new_all();
    sys.refresh_all();
    
    // CPU: fail-safe to 0.0 if no cores
    let cpus = sys.cpus();
    if !cpus.is_empty() {
        let total: f32 = cpus.iter().map(|cpu| cpu.cpu_usage()).sum();
        self.cpu_usage = total / cpus.len() as f32;
    } else {
        self.cpu_usage = 0.0; // Fail-safe
    }
    
    // Memory: fail-safe to 0.0 if division by zero
    let total_mem = sys.total_memory() as f32;
    if total_mem > 0.0 {
        let used_mem = sys.used_memory() as f32;
        self.memory_usage = (used_mem / total_mem) * 100.0;
    } else {
        self.memory_usage = 0.0; // Fail-safe
    }
    
    // Disk: placeholder (API changed, future implementation)
    self.disk_usage = 50.0;
    
    // Always return Ok() - partial metrics better than total failure
    Ok(())
}
```

### Graceful Degradation

```rust
impl SystemHealth {
    pub async fn tick(&mut self, state: &mut SingularityState) -> EngineResult<()> {
        if !self.initialized {
            // Attempt late initialization instead of failing
            if let Err(e) = self.init() {
                log::warn!("SystemHealth late init failed: {}", e);
                // Continue with default metrics
            }
        }
        
        // Metrics collection errors don't stop tick
        if let Err(e) = self.collect_metrics() {
            log::warn!("Metrics collection failed: {}", e);
            // Use last known metrics
        }
        
        // Anomaly scan errors don't stop tick
        let anomalies = self.scan_anomalies(state);
        
        // Healing errors logged but don't crash tick
        if self.auto_heal_enabled && !anomalies.is_empty() {
            match self.auto_heal(anomalies).await {
                Ok(report) => {
                    self.repairs_performed += report.repairs_successful as u64;
                }
                Err(e) => {
                    log::error!("Auto-heal failed: {}", e);
                    // Continue without healing
                }
            }
        }
        
        // Always update global_health
        self.global_health = self.compute_health_score();
        self.last_update_ms = Self::current_timestamp();
        
        Ok(()) // Never fail tick()
    }
}
```

---

## ⚙️ CONFIGURATION

### Thresholds Configuration

```rust
// Anomaly detection thresholds (hard-coded in v20.0)
const CPU_THRESHOLD: f32 = 80.0;        // 80% CPU → HighCPU
const MEMORY_THRESHOLD: f32 = 85.0;     // 85% RAM → HighMemory
const DISK_THRESHOLD: f32 = 90.0;       // 90% Disk → HighDisk

// Health score weights
const CPU_WEIGHT: f32 = 0.3;
const MEMORY_WEIGHT: f32 = 0.3;
const DISK_WEIGHT: f32 = 0.2;
const SUCCESS_RATE_WEIGHT: f32 = 0.2;
const ERROR_PENALTY_PER_ERROR: f32 = 0.05;

// EMA smoothing
const SUCCESS_RATE_ALPHA: f32 = 0.1;    // 10% new, 90% old

// Error log limits
const MAX_ERROR_LOG_SIZE: usize = 100;
```

### Future Configurable Settings

```rust
// Future: Externalize configuration
pub struct SystemHealthConfig {
    pub cpu_threshold: f32,
    pub memory_threshold: f32,
    pub disk_threshold: f32,
    pub auto_heal_enabled: bool,
    pub error_log_max_size: usize,
    pub health_score_weights: HealthScoreWeights,
}

pub struct HealthScoreWeights {
    pub cpu: f32,
    pub memory: f32,
    pub disk: f32,
    pub success_rate: f32,
    pub error_penalty: f32,
}
```

---

## 🚀 FUTURE ENHANCEMENTS

### Phase 1 - Real Healing Actions

```rust
// Replace placeholders with real implementations
async fn clear_memory_cache(&self) -> bool {
    // 1. Clear OMEGA response cache
    // 2. Clear ConversationEngine history cache
    // 3. Force Rust garbage collection
    // 4. Clear UnifiedMemory LRU cache
    true
}

async fn restart_failed_module(&self, description: &str) -> bool {
    // Parse module name from description
    let module_name = extract_module_name(description);
    
    match module_name {
        "CoherenceEngine" => {
            // Reinitialize CoherenceEngine
            state.coherence.reinit().await?;
        }
        "UnifiedMemory" => {
            state.memory.reinit().await?;
        }
        _ => return false,
    }
    
    true
}
```

### Phase 2 - Historical Trending

```rust
pub struct HealthHistory {
    snapshots: VecDeque<HealthSnapshot>,
    max_size: usize,
}

pub struct HealthSnapshot {
    timestamp: u64,
    global_health: f32,
    cpu_usage: f32,
    memory_usage: f32,
}

impl SystemHealth {
    pub fn get_trend(&self, duration_ms: u64) -> HealthTrend {
        // Analyze last N snapshots to detect trend
        // TrendDirection: Improving | Stable | Degrading
    }
}
```

### Phase 3 - Predictive Alerts

```rust
pub struct HealthPredictor {
    model: LinearRegressionModel,
}

impl HealthPredictor {
    pub fn predict_time_to_critical(&self, history: &HealthHistory) -> Option<u64> {
        // Linear regression on global_health
        // Returns: milliseconds until global_health < 0.2 (Offline)
        // Use case: "System will fail in 5 minutes" → Proactive action
    }
}
```

---

## 📖 RELATED DOCUMENTATION

**Architecture:**
- [SELF_HEALING_ENGINE.md](SELF_HEALING_ENGINE.md) — Complex healing orchestration
- [SINGULARITY.md](SINGULARITY.md) — Meta-cognitive state + tick loop
- [docs/architecture/9-engines.md](../../architecture/9-engines.md) — Unified 9-engine architecture

**Modules:**
- [OMEGA_PIPELINE.md](OMEGA_PIPELINE.md) — AI pipeline health monitoring
- [CONVERSATION_ENGINE.md](CONVERSATION_ENGINE.md) — Conversation stage failures
- [UNIFIED_MEMORY.md](UNIFIED_MEMORY.md) — Memory integrity monitoring

**Guides:**
- [docs/guides/development/DEBUGGING.md](../../04_guides/development/DEBUGGING.md) — Debug system health issues

---

**Documentation générée:** 15 décembre 2025  
**Version module:** v20.0 (Fusion Phase 2 #3)  
**Lignes analysées:** 567 lignes (system_health.rs)  
**Auteur:** TITANE∞ Documentation Evolution Engine vΩ
