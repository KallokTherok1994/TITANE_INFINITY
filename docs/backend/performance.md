# ⚡ TITANE∞ Performance Audit & Architecture

**Objectif**: Audit complet du backend, cartographie des tâches async, et architecture scheduler Harmonia-friendly.

---

## 📊 ÉTAPE 1 — Cartographie des Tâches Async/Périodiques

### Tâches Identifiées

| # | Tâche | Module | Type | Fréquence Actuelle | Durée | Ressources | Priorité | Risques |
|---|-------|--------|------|-------------------|-------|------------|----------|---------|
| 1 | **System Metrics Collection** | Helios | Périodique | 1000ms (1s) | 10-50ms | CPU: Low, RAM: Low | P0 | UI freeze si bloqué |
| 2 | **Nexus Graph Validation** | Nexus | Périodique | 2000ms (2s) | 20-100ms | CPU: Medium, RAM: Low | P1 | Corruption données |
| 3 | **Sentinel Security Scan** | Sentinel | Périodique | 5000ms (5s) | 50-200ms | CPU: Medium | P1 | Vulnérabilités |
| 4 | **Memory Snapshot Flush** | Memory | Périodique | 10000ms (10s) | 50-300ms | CPU: Low, IO: High | P1 | Perte données |
| 5 | **Evolution Diagnostics** | Engine | Périodique | 30000ms (30s) | 2-10s | CPU: High, RAM: Medium | P2 | Bloque UI si mal fait |
| 6 | **Harmonia Load Balance** | Harmonia | On-Demand | N/A | 20-150ms | CPU: Medium | P1 | Surcharge CPU |
| 7 | **AI Query (Ollama/Gemini)** | AI Router | On-Demand | N/A | 500ms-5s | CPU: High, Network | P0 | Timeout, freeze |
| 8 | **Voice Pipeline (Duplex)** | Audio | Streaming | 50ms chunks | 10-100ms | CPU: Medium, IO | P0 | Latence perceptible |
| 9 | **Wakeword Detection** | Wakeword | Streaming | 100ms chunks | 5-50ms | CPU: Medium | P1 | False positives |
| 10 | **TTS Synthesis** | TTS | On-Demand | N/A | 200ms-2s | CPU: Medium, Network | P0 | UI bloquée |
| 11 | **Project Autopilot** | Overdrive | Scheduled | Cron (3h AM) | 5-30 min | CPU: High, IO: High | P3 | Non critique |
| 12 | **Memory Embeddings** | Overdrive | On-Demand | N/A | 1-10s | CPU: High, Network | P2 | Latence recherche |

### Insights

**Tâches Critiques (P0)**:
- System Metrics (1s) → Dashboard UI
- AI Query → Bloque UX si synchrone
- Voice Pipeline → Real-time
- TTS → UX perceptible

**Tâches Lourdes**:
- Evolution Engine (2-10s, 30s interval)
- AI Query (500ms-5s)
- Project Autopilot (5-30 min, rare)
- Memory Embeddings (1-10s)

**Problèmes Actuels**:
- ❌ **Pas de scheduler central** → Timings hardcodés (`HELIOS_INTERVAL_MS`, etc.)
- ❌ **Pas de CPU/RAM adaptivity** → Continue en mode dégradé
- ❌ **Pas d'observabilité runtime** → Impossible de debug perf
- ❌ **tokio::spawn partout** → Pas de priorités, pas de limites

---

## 🏗️ ÉTAPE 2 — Architecture Async Actuelle

### Pattern Actuel (v17.3.0)

```rust
// Exemple: Helios (System Monitoring)
// ❌ PAS DE SCHEDULER — Appels manuels depuis frontend

// Dans helios.rs:
pub async fn collect(&self) -> AppResult<HeliosState> {
    // Sync, bloquant si system_service lent
    self.system.refresh();
    let cpu = self.system.get_cpu_usage()?;
    // ...
}

// Dans API:
#[tauri::command]
pub async fn get_helios_state(state: State<Arc<HeliosCore>>) -> Result<HeliosState, String> {
    state.collect().await
        .map_err(|e| e.to_string())
}
```

**Problèmes**:
1. **Frontend Poll-Driven**: Frontend doit appeler périodiquement (setInterval)
2. **Pas de Background Tasks**: Aucune tâche automatique côté backend
3. **Pas de Cancellation**: tokio::spawn sans handles
4. **Pas de Backpressure**: Si frontend spam commandes → surcharge

### Utilisation tokio::spawn Actuelle

**Fichiers avec tokio::spawn** (découverts via grep):
- `duplex/pipeline.rs` (2 spawns) → Audio input/output loops
- `duplex/audio_input.rs` (1 spawn) → Capture stream
- `duplex/audio_output.rs` (1 spawn) → Playback stream
- `wakeword/listener.rs` (1 spawn) → Detection loop

**Pattern actuel**:
```rust
tokio::spawn(async move {
    loop {
        // Travail périodique
        tokio::time::sleep(Duration::from_millis(100)).await;
    }
});
// ❌ Pas de JoinHandle stocké → Impossible d'arrêter proprement
```

### Communication Inter-Kernels

**Actuel**: Aucune communication async directe entre kernels.
- Helios → Passif (collecte seulement)
- Sentinel → Reçoit HeliosState en paramètre
- Harmonia → Reçoit HeliosState en paramètre
- Engine → Reçoit tous les états en paramètre

**Problème**: Couplage synchrone fort, pas de pub/sub, pas d'events.

---

## 🎯 ÉTAPE 3 — Architecture Scheduler Harmonia-Friendly

### Vision

**Harmonia = Orchestrateur Central**

```
┌──────────────────────────────────────────────────────────────────┐
│                     HARMONIA SCHEDULER                            │
│  - Job Registry (periodic, on-demand, scheduled)                  │
│  - Priority Queue (P0 → P3)                                       │
│  - CPU/RAM Adaptive Logic                                        │
│  - Observability (metrics, traces)                               │
└──────────────────────────────────────────────────────────────────┘
         │                  │                   │
         │                  │                   │
    ┌────▼─────┐      ┌────▼─────┐      ┌─────▼────┐
    │ Helios   │      │ Sentinel │      │ Engine   │
    │ (1s)     │      │ (5s)     │      │ (30s)    │
    └──────────┘      └──────────┘      └──────────┘
```

### Types Proposés

```rust
// types/scheduler.rs

use std::time::Duration;
use chrono::Utc;

#[derive(Debug, Clone)]
pub enum JobKind {
    Periodic { interval: Duration },
    OnDemand,
    Scheduled { cron: String }, // "0 3 * * *"
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum JobPriority {
    P0 = 0, // Critical (UI-blocking)
    P1 = 1, // Important (security, data integrity)
    P2 = 2, // Normal (background tasks)
    P3 = 3, // Low (maintenance)
}

#[derive(Debug, Clone)]
pub struct JobDescriptor {
    pub id: String,
    pub module: String,
    pub kind: JobKind,
    pub priority: JobPriority,
    pub timeout: Duration,
    pub cpu_budget: Option<f64>, // % CPU max
}

#[derive(Debug, Clone)]
pub struct ScheduledJob {
    pub descriptor: JobDescriptor,
    pub last_run: Option<i64>, // timestamp
    pub next_run: i64,
    pub runs_count: u64,
    pub avg_duration_ms: f64,
    pub failures: u32,
}

#[derive(Debug, Clone)]
pub struct RuntimeMetrics {
    pub active_jobs: usize,
    pub pending_jobs: usize,
    pub total_runs: u64,
    pub total_failures: u64,
    pub cpu_usage: f64,
    pub ram_usage: f64,
    pub scheduler_mode: SchedulerMode,
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum SchedulerMode {
    Normal,   // All jobs run normally
    Eco,      // Reduce frequencies, skip P3
    Safe,     // Only P0/P1, emergency mode
}
```

### Scheduler Pseudo-Code

```rust
// core/harmonia_scheduler.rs (NOUVEAU)

use std::sync::Arc;
use tokio::sync::RwLock;
use std::collections::HashMap;

pub struct HarmoniaScheduler {
    jobs: Arc<RwLock<HashMap<String, ScheduledJob>>>,
    mode: Arc<RwLock<SchedulerMode>>,
    metrics: Arc<RwLock<RuntimeMetrics>>,
    shutdown: Arc<tokio::sync::Notify>,
}

impl HarmoniaScheduler {
    pub fn new() -> Self {
        Self {
            jobs: Arc::new(RwLock::new(HashMap::new())),
            mode: Arc::new(RwLock::new(SchedulerMode::Normal)),
            metrics: Arc::new(RwLock::new(RuntimeMetrics::default())),
            shutdown: Arc::new(tokio::sync::Notify::new()),
        }
    }

    /// Register a periodic job
    pub async fn register_job(&self, descriptor: JobDescriptor) {
        let mut jobs = self.jobs.write().await;
        let next_run = Utc::now().timestamp();

        jobs.insert(descriptor.id.clone(), ScheduledJob {
            descriptor,
            last_run: None,
            next_run,
            runs_count: 0,
            avg_duration_ms: 0.0,
            failures: 0,
        });

        log::info!("[Scheduler] Registered job: {}", descriptor.id);
    }

    /// Main scheduler loop (tokio::spawn dans setup)
    pub async fn run(&self) {
        log::info!("[Scheduler] Starting main loop");

        loop {
            tokio::select! {
                _ = self.shutdown.notified() => {
                    log::info!("[Scheduler] Shutdown signal received");
                    break;
                }
                _ = tokio::time::sleep(Duration::from_millis(100)) => {
                    self.tick().await;
                }
            }
        }
    }

    async fn tick(&self) {
        let now = Utc::now().timestamp();
        let jobs = self.jobs.read().await.clone();
        let mode = *self.mode.read().await;

        // Filter jobs that need to run
        let mut ready_jobs: Vec<_> = jobs.values()
            .filter(|job| job.next_run <= now)
            .filter(|job| self.should_run(job, mode))
            .cloned()
            .collect();

        // Sort by priority (P0 first)
        ready_jobs.sort_by_key(|job| job.descriptor.priority);

        // Dispatch jobs
        for job in ready_jobs {
            self.dispatch_job(job).await;
        }
    }

    fn should_run(&self, job: &ScheduledJob, mode: SchedulerMode) -> bool {
        match mode {
            SchedulerMode::Normal => true,
            SchedulerMode::Eco => {
                // Skip P3, reduce frequency P2
                job.descriptor.priority <= JobPriority::P2
            }
            SchedulerMode::Safe => {
                // Only P0/P1
                job.descriptor.priority <= JobPriority::P1
            }
        }
    }

    async fn dispatch_job(&self, job: ScheduledJob) {
        let id = job.descriptor.id.clone();
        let timeout = job.descriptor.timeout;

        log::debug!("[Scheduler] Dispatching job: {}", id);

        // Spawn avec timeout
        let start = std::time::Instant::now();

        // TODO: Appeler le kernel correspondant
        // match job.descriptor.module.as_str() {
        //     "helios" => self.run_helios().await,
        //     "sentinel" => self.run_sentinel().await,
        //     ...
        // }

        let duration = start.elapsed();

        // Update job stats
        self.update_job_stats(&id, duration.as_millis() as f64).await;
    }

    async fn update_job_stats(&self, job_id: &str, duration_ms: f64) {
        let mut jobs = self.jobs.write().await;

        if let Some(job) = jobs.get_mut(job_id) {
            job.last_run = Some(Utc::now().timestamp());
            job.runs_count += 1;

            // Update average duration (rolling average)
            job.avg_duration_ms = (job.avg_duration_ms * (job.runs_count - 1) as f64 + duration_ms) / job.runs_count as f64;

            // Calculate next run
            if let JobKind::Periodic { interval } = job.descriptor.kind {
                job.next_run = Utc::now().timestamp() + interval.as_secs() as i64;
            }
        }
    }

    /// Get runtime metrics
    pub async fn get_metrics(&self) -> RuntimeMetrics {
        self.metrics.read().await.clone()
    }

    /// Change scheduler mode
    pub async fn set_mode(&self, mode: SchedulerMode) {
        let mut current_mode = self.mode.write().await;
        *current_mode = mode;
        log::info!("[Scheduler] Mode changed to {:?}", mode);
    }

    /// Graceful shutdown
    pub async fn shutdown(&self) {
        self.shutdown.notify_waiters();
    }
}
```

### Intégration dans `main.rs`

```rust
// Dans app::setup::TitaneApp

pub struct TitaneApp {
    pub helios: Arc<HeliosCore>,
    pub nexus: Arc<NexusCore>,
    pub harmonia: Arc<HarmoniaCore>,
    pub sentinel: Arc<SentinelCore>,
    pub memory: Arc<MemoryCore>,
    pub evolution: Arc<AutoEvolutionEngine>,
    pub scheduler: Arc<HarmoniaScheduler>, // ✨ NOUVEAU
}

impl TitaneApp {
    pub fn new(app_data_dir: PathBuf) -> AppResult<Self> {
        // ... existing initialization ...

        // Create scheduler
        let scheduler = Arc::new(HarmoniaScheduler::new());

        // Register periodic jobs
        let scheduler_clone = scheduler.clone();
        tokio::spawn(async move {
            // Register jobs
            scheduler_clone.register_job(JobDescriptor {
                id: "helios_collect".to_string(),
                module: "helios".to_string(),
                kind: JobKind::Periodic { interval: Duration::from_secs(1) },
                priority: JobPriority::P0,
                timeout: Duration::from_millis(500),
                cpu_budget: Some(5.0),
            }).await;

            scheduler_clone.register_job(JobDescriptor {
                id: "sentinel_scan".to_string(),
                module: "sentinel".to_string(),
                kind: JobKind::Periodic { interval: Duration::from_secs(5) },
                priority: JobPriority::P1,
                timeout: Duration::from_secs(1),
                cpu_budget: Some(10.0),
            }).await;

            scheduler_clone.register_job(JobDescriptor {
                id: "evolution_diagnose".to_string(),
                module: "engine".to_string(),
                kind: JobKind::Periodic { interval: Duration::from_secs(30) },
                priority: JobPriority::P2,
                timeout: Duration::from_secs(15),
                cpu_budget: Some(30.0),
            }).await;

            // Start scheduler loop
            scheduler_clone.run().await;
        });

        Ok(Self {
            helios,
            nexus,
            harmonia,
            sentinel,
            memory,
            evolution,
            scheduler,
        })
    }
}
```

---

## 🧠 ÉTAPE 4 — Stratégie CPU/RAM Adaptive

### Modes Scheduler

| Mode | Condition | Actions | Targets |
|------|-----------|---------|---------|
| **Normal** | CPU < 60%, RAM < 60% | Toutes tâches, fréquences normales | Fluidité optimale |
| **Eco** | CPU 60-80% OU RAM 60-80% | Skip P3, reduce P2 fréquences (×2), throttle AI queries | Stabilité |
| **Safe** | CPU > 80% OU RAM > 80% | Only P0/P1, pause Engine, cancel on-demand P2/P3 | Survie |

### Logic Adaptative

```rust
// Dans HarmoniaScheduler::tick()

async fn adapt_to_resources(&self, helios: &HeliosState) {
    let cpu = helios.cpu_usage;
    let ram = helios.ram_usage;

    let new_mode = if cpu > 80.0 || ram > 80.0 {
        SchedulerMode::Safe
    } else if cpu > 60.0 || ram > 60.0 {
        SchedulerMode::Eco
    } else {
        SchedulerMode::Normal
    };

    let current_mode = *self.mode.read().await;

    if new_mode != current_mode {
        log::warn!("[Scheduler] Resource pressure detected - switching to {:?} mode", new_mode);
        self.set_mode(new_mode).await;

        // Actions selon mode
        match new_mode {
            SchedulerMode::Eco => {
                // Reduce frequencies (×2)
                self.scale_intervals(2.0).await;
            }
            SchedulerMode::Safe => {
                // Emergency: cancel non-critical jobs
                self.cancel_low_priority_jobs().await;
            }
            _ => {}
        }
    }
}

async fn scale_intervals(&self, factor: f64) {
    let mut jobs = self.jobs.write().await;

    for job in jobs.values_mut() {
        if job.descriptor.priority >= JobPriority::P2 {
            if let JobKind::Periodic { interval } = job.descriptor.kind {
                let new_interval = interval.mul_f64(factor);
                job.descriptor.kind = JobKind::Periodic { interval: new_interval };
                log::info!("[Scheduler] Scaled job {} interval to {:?}", job.descriptor.id, new_interval);
            }
        }
    }
}

async fn cancel_low_priority_jobs(&self) {
    let mut jobs = self.jobs.write().await;

    // Remove P2/P3 from schedule temporarily
    jobs.retain(|_, job| job.descriptor.priority <= JobPriority::P1);

    log::warn!("[Scheduler] Cancelled all P2/P3 jobs (Safe mode)");
}
```

### Configuration Utilisateur

```rust
// Commande Tauri nouvelle

#[tauri::command]
pub async fn scheduler_set_mode(
    scheduler: State<'_, Arc<HarmoniaScheduler>>,
    mode: String, // "normal" | "eco" | "safe"
) -> Result<(), String> {
    let mode_enum = match mode.as_str() {
        "normal" => SchedulerMode::Normal,
        "eco" => SchedulerMode::Eco,
        "safe" => SchedulerMode::Safe,
        _ => return Err("Invalid mode".to_string()),
    };

    scheduler.set_mode(mode_enum).await;
    Ok(())
}
```

---

## 📈 ÉTAPE 5 — Observabilité Performances

### Métriques à Exposer

```rust
#[derive(Debug, Clone, Serialize)]
pub struct RuntimeMetrics {
    // Scheduler
    pub active_jobs: usize,
    pub pending_jobs: usize,
    pub total_runs: u64,
    pub total_failures: u64,
    pub scheduler_mode: String,

    // Resources
    pub cpu_usage: f64,
    pub ram_usage: f64,
    pub disk_usage: f64,

    // Performance
    pub avg_job_duration_ms: HashMap<String, f64>,
    pub p95_job_duration_ms: HashMap<String, f64>,
    pub slowest_job_last_hour: Option<JobRunRecord>,

    // Health
    pub jobs_in_timeout: Vec<String>,
    pub jobs_with_high_failure_rate: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct JobRunRecord {
    pub job_id: String,
    pub started_at: i64,
    pub duration_ms: f64,
    pub success: bool,
    pub error: Option<String>,
}
```

### Commande DevTools

```rust
#[tauri::command]
pub async fn get_runtime_metrics(
    scheduler: State<'_, Arc<HarmoniaScheduler>>,
    helios: State<'_, Arc<HeliosCore>>,
) -> Result<RuntimeMetrics, String> {
    let scheduler_metrics = scheduler.get_metrics().await;
    let helios_state = helios.collect().await
        .map_err(|e| e.to_string())?;

    Ok(RuntimeMetrics {
        active_jobs: scheduler_metrics.active_jobs,
        pending_jobs: scheduler_metrics.pending_jobs,
        total_runs: scheduler_metrics.total_runs,
        total_failures: scheduler_metrics.total_failures,
        scheduler_mode: format!("{:?}", scheduler_metrics.scheduler_mode),
        cpu_usage: helios_state.cpu_usage,
        ram_usage: helios_state.ram_usage,
        disk_usage: helios_state.disk_usage,
        // ... populate autres métriques
        avg_job_duration_ms: HashMap::new(), // TODO
        p95_job_duration_ms: HashMap::new(), // TODO
        slowest_job_last_hour: None, // TODO
        jobs_in_timeout: vec![],
        jobs_with_high_failure_rate: vec![],
    })
}
```

### Dashboard DevTools (Frontend)

```typescript
// Usage dans DevTools console
const metrics = await invoke<RuntimeMetrics>('get_runtime_metrics');

console.table({
  'Active Jobs': metrics.active_jobs,
  'Pending Jobs': metrics.pending_jobs,
  'Total Runs': metrics.total_runs,
  'Scheduler Mode': metrics.scheduler_mode,
  'CPU Usage': `${metrics.cpu_usage.toFixed(1)}%`,
  'RAM Usage': `${metrics.ram_usage.toFixed(1)}%`,
});

// Average job durations
console.table(metrics.avg_job_duration_ms);
```

---

## 🚀 ÉTAPE 6 — Plan de Refactor

### V1 — Fixes Urgents (1-2 jours)

**Objectif**: Stabiliser performance actuelle sans refactor scheduler.

- [ ] **Fix 1**: Ajouter timeouts explicites à toutes commandes Tauri
  ```rust
  tokio::time::timeout(Duration::from_secs(5), async_operation).await
  ```

- [ ] **Fix 2**: Ajouter cancellation aux tokio::spawn existants
  ```rust
  let handle = tokio::spawn(async move { ... });
  // Stocker handle dans AppState pour cleanup
  ```

- [ ] **Fix 3**: Limiter concurrence AI queries (semaphore)
  ```rust
  let semaphore = Arc::new(Semaphore::new(2)); // Max 2 concurrent
  ```

- [ ] **Fix 4**: Ajouter basic metrics logging
  ```rust
  log::info!("[Perf] {} completed in {}ms", operation, duration.as_millis());
  ```

### V2 — Harmonia Scheduler (3-5 jours)

**Objectif**: Implémenter scheduler central sans casser l'existant.

- [ ] **Step 1**: Créer `types/scheduler.rs` (JobDescriptor, ScheduledJob, RuntimeMetrics)
- [ ] **Step 2**: Créer `core/harmonia_scheduler.rs` (structure, registration, tick loop)
- [ ] **Step 3**: Intégrer dans `app/setup.rs` (spawn scheduler loop)
- [ ] **Step 4**: Migrer Helios vers scheduler (register_job, remove frontend polling)
- [ ] **Step 5**: Migrer Sentinel, Memory flush
- [ ] **Step 6**: Migrer Engine evolution
- [ ] **Step 7**: Ajouter commande `get_runtime_metrics`
- [ ] **Step 8**: Tests end-to-end

### V3 — CPU/RAM Adaptivity (2-3 jours)

**Objectif**: Modes Eco/Safe + logique adaptative.

- [ ] **Step 1**: Implémenter `adapt_to_resources` dans scheduler
- [ ] **Step 2**: Implémenter `scale_intervals` + `cancel_low_priority_jobs`
- [ ] **Step 3**: Ajouter commande `scheduler_set_mode` (manual override)
- [ ] **Step 4**: UI toggle dans DevTools (Normal/Eco/Safe)
- [ ] **Step 5**: Tests stress (simulate high CPU/RAM)

### Bonus — Observability (1-2 jours)

- [ ] Implémenter `JobRunRecord` history (circular buffer, 1000 derniers runs)
- [ ] Calculer P95 latencies
- [ ] Détecter jobs en timeout
- [ ] Alerting (log::warn si job failure rate > 10%)
- [ ] Export metrics JSON pour monitoring externe

---

## 📊 Performance Targets

| Métrique | Current | Target V2 | Target V3 |
|----------|---------|-----------|-----------|
| **CPU idle** | ~10-15% | <8% | <5% (Eco) |
| **RAM idle** | ~200 MB | <180 MB | <150 MB (Eco) |
| **UI freeze risk** | Medium | Low | Very Low |
| **AI query latency** | 500ms-5s | Same | Same (throttled) |
| **Evolution cycle** | 2-10s | Same | Skipped (Safe mode) |
| **Scheduler overhead** | N/A | <2% CPU | <1% CPU |
| **Job dispatch latency** | N/A | <5ms | <5ms |

---

## ⚠️ Risques & Mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Scheduler loop bloque tout | Low | Critical | tokio::select! avec timeout, panic handler |
| Migration casse API existante | Medium | High | Garder legacy commands pendant V2 |
| CPU/RAM mesures imprécises | Medium | Medium | Utiliser system-info crate vérifié |
| Race conditions multi-job | Medium | Medium | RwLock sur job registry, atomics pour stats |
| Timeout trop courts | Low | Medium | Configurable via constants, logs si timeout |

---

## 🎓 Ressources

- [Tokio Best Practices](https://tokio.rs/tokio/topics/bridging)
- [Architecture Overview](./overview.md)
- [API Reference](./api-tauri-summary.md)

---

**TITANE∞ v17.3.0** — *"Performance is not an afterthought, it's a feature."*
