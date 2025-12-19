# SELF_HEALING_ENGINE — Module Backend + Frontend

**Module Path (Backend):** `src-tauri/src/system/self_heal.rs` (190 lignes)  
**Module Path (Frontend):** `src/services/selfHealing/` (5,343 lignes)  
**Version:** v20Ω  
**Type:** Infrastructure Critique (Auto-Healing + Observability)

---

## 📋 MODULE OVERVIEW

### Responsibilities

Le Self-Healing Engine est le système d'auto-réparation autonome de TITANE∞, capable de détecter, diagnostiquer et corriger automatiquement les anomalies système sans intervention humaine.

**Backend (Rust):**
- Détection anomalies système (CPU, mémoire, latences)
- Sélection actions de réparation automatiques
- Exécution sécurisée des corrections
- Historique healing avec learning statistiques

**Frontend (TypeScript):**
- Observation globale erreurs (JS, React, Tauri, Network, Performance)
- Analyse et classification diagnostiques
- Génération playbooks de réparation personnalisés
- Exécution sécurisée avec rollback
- Synchronisation état Singularity

### Key Features

- **5-Layer Architecture (Frontend):** Observer → Analyzer → Playbook → Executor → Sync
- **Auto-Healing Automatique:** Détection et correction sans intervention (taux succès ~80%)
- **Safe Mode & Circuit Breaker:** Protection contre réparations en cascade
- **Learning Statistiques:** Amélioration continue via historique actions (500 entrées max)
- **Playbook Registry:** 15+ scénarios de réparation pré-configurés
- **Degraded Mode:** Fonctionnement minimal en cas d'anomalie critique

### Integration Points

- **OMEGA Pipeline:** Healing hooks Stage 5 (AI generation errors)
- **ConversationEngine:** Error recovery Stage 7 (conversation failures)
- **UnifiedMemory:** Memory corruption detection + rebuild
- **Singularity:** State synchronization after healing
- **SystemHealth:** Anomaly detection triggers + health monitoring

---

## 🏗️ ARCHITECTURE

### Self-Healing Flow (Frontend 5 Layers)

```
┌─────────────────────────────────────────────────────────────┐
│                    ERROR SOURCES                            │
│  (JS Runtime, React, Tauri Commands, Network, Performance)  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: OBSERVER (selfHealingObserver.ts, 800L)           │
│  - Capture globale erreurs (window.onerror, unhandled)      │
│  - Déduplication (5s window)                                │
│  - Classification AnomalyType (14 types)                    │
│  - Rate limiting (100 events/min)                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: ANALYZER (selfHealingAnalyzer.ts, 733L)           │
│  - Diagnostic causes probables                              │
│  - Pattern detection (300s window, min 3 occurrences)       │
│  - Urgence + Impact calculation                             │
│  - Suggestion actions (14 action types)                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: PLAYBOOK ENGINE (selfHealingPlaybookEngine.ts,    │
│           861L)                                              │
│  - Sélection playbook optimal (15+ playbooks)               │
│  - Génération plan d'exécution                              │
│  - Validation pré-conditions                                │
│  - Estimation temps + risque                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 4: EXECUTOR (selfHealingExecutor.ts, 725L)           │
│  - Exécution séquentielle/parallèle                         │
│  - Timeout protection (30s default)                         │
│  - Rollback automatique si échec                            │
│  - Progress tracking                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 5: SYNC LAYER (selfHealingSyncLayer.ts, 422L)        │
│  - Synchronisation Singularity                              │
│  - Notification système guéri                               │
│  - Persistence événements                                   │
└─────────────────────────────────────────────────────────────┘
```

### Backend Healing Flow (Rust)

```
┌───────────────────────────────────────┐
│  SystemHealth::tick()                 │
│  - Collect metrics (CPU, RAM, disk)   │
│  - Scan anomalies (6 types)           │
│  - Anomaly threshold check (0.6)      │
└───────────────────────────────────────┘
                ↓
┌───────────────────────────────────────┐
│  SelfHealEngine::determine_actions()  │
│  - Anomaly score > 0.8 → RestartOmega │
│  - Memory > 85% → TrimMemory + ForceGC│
│  - Error rate > 8% → ResetContext     │
└───────────────────────────────────────┘
                ↓
┌───────────────────────────────────────┐
│  HealingExecutor::execute()           │
│  - Safe Mode activation (essential)   │
│  - Circuit Breaker (retry limit)      │
│  - Learning stats update              │
│  - Historique (500 max entries)       │
└───────────────────────────────────────┘
                ↓
┌───────────────────────────────────────┐
│  SystemHealth::auto_heal()            │
│  - Apply repairs (HighCPU, HighMemory)│
│  - Success rate update (EMA α=0.1)    │
│  - Global health recompute            │
└───────────────────────────────────────┘
```

---

## 🔧 API REFERENCE

### Backend (Rust) — SelfHealEngine

#### Data Structures

```rust
pub struct SelfHealConfig {
    pub anomaly_threshold: f32,         // 0.6 default
    pub memory_critical_threshold: f32, // 0.85 default
    pub error_rate_threshold: f32,      // 0.08 default
    pub max_engine_latency_ms: u64,     // 150ms default
    pub min_integrity: f32,             // 0.9 default
    pub aggressive_mode: bool,          // false default
}

pub struct SelfHealEngine {
    config: SelfHealConfig,
    actions_count: AtomicU32,
}

pub enum RepairAction {
    RestartOmega,
    ClearMemoryCache,
    RebalanceEngines,
    TrimMemory,
    ForceGC,
    ResetConversationContext,
    EnableDegradedMode,
}

pub struct HealingHistoryEntry {
    pub action: RepairAction,
    pub result: RepairResult,
    pub anomaly_before: f32,
    pub anomaly_after: Option<f32>,
    pub timestamp: u64,
    pub context: Option<String>,
}

pub struct LearningStats {
    pub action_success_rates: HashMap<String, (u32, u32)>, // (succès, total)
    pub action_effectiveness: HashMap<String, f32>,        // Amélioration score
    pub top_effective_actions: Vec<String>,
}
```

#### Methods

```rust
// Constructeurs
pub fn new() -> Self
pub fn with_config(config: SelfHealConfig) -> Self

// Actions de réparation
pub async fn determine_actions(&self, health: &SystemHealth) -> Vec<RepairAction>
// Détermine les actions nécessaires basé sur anomalies détectées
// Exemple: anomaly_score > 0.8 → [RestartOmega, ClearMemoryCache]
//          memory_usage > 0.85 → [TrimMemory, ForceGC]
//          error_rate > 0.08 → [ResetConversationContext]

// Exécution
pub async fn execute_actions(&mut self, actions: Vec<RepairAction>) -> HealingReport
// Execute les actions de réparation dans l'ordre
// Returns: HealingReport (anomalies, attempts, success, success_rate)

// Statistiques
pub fn get_learning_stats(&self) -> LearningStats
// Retourne les statistiques d'apprentissage
// action_success_rates: taux de succès par type d'action
// action_effectiveness: amélioration moyenne du score d'anomalie
```

### Frontend (TypeScript) — SelfHealingEngineOrchestrator

#### Configuration

```typescript
interface SelfHealingEngineConfig {
  enabled: boolean;
  autoHeal: boolean;
  autoHealSeverity: ('info' | 'low' | 'medium' | 'high' | 'critical')[];
  requireConfirmationForCritical: boolean;
  dryRunMode: boolean;
  logLevel: 'silent' | 'error' | 'warn' | 'info' | 'debug';
}
```

#### Layer 1: Observer

```typescript
class SelfHealingObserver {
  // Capture
  startObserving(): void
  // Active: window.onerror, unhandledrejection, Tauri event listeners
  
  stopObserving(): void
  // Désactive tous les listeners
  
  subscribe(callback: ErrorCallback): () => void
  // S'abonne aux événements d'erreur capturés
  // Returns: fonction de désinscription
  
  getState(): ObserverState
  // Retourne: isActive, totalCaptured, totalDeduplicated, lastError, errorsPerMinute
}

interface ObservedError {
  id: string;
  timestamp: number;
  type: AnomalyType; // 14 types: js_runtime_error, tauri_command_fail, etc.
  source: HealingSource; // 'js' | 'react' | 'tauri' | 'rust' | 'network' | 'performance'
  severity: HealingSeverity;
  message: string;
  context: ErrorContext; // stack, line, column, invokeCommand, etc.
  fingerprint: string; // Hash pour déduplication
  count: number; // Nombre d'occurrences dédupliquées
}
```

#### Layer 2: Analyzer

```typescript
class SelfHealingAnalyzer {
  analyze(event: HealingEvent, context: AnalysisContext): Promise<HealingDiagnosis>
  // Analyse l'événement et génère un diagnostic
  // Returns: nature, causes probables, urgence, impact, actions suggérées
  
  detectPatterns(events: HealingEvent[]): PatternRecord[]
  // Détecte patterns récurrents (window 300s, min 3 occurrences)
  // Returns: patterns avec frequency, severity, recommended actions
  
  computeModuleHealth(moduleId: string): ModuleHealthScore
  // Calcule score de santé d'un module (0-100)
  // Returns: score, errorCount, lastError, healAttempts, trend
}

interface HealingDiagnosis {
  id: string;
  eventId: string;
  timestamp: number;
  nature: string;              // "Erreur React: composant non initialisé"
  probableCauses: string[];    // ["Props invalides", "État corrompu"]
  urgency: number;             // 1-10 (severity mapping)
  impact: number;              // 1-10 (module criticality)
  confidence: number;          // 0.0-1.0
  suggestedActions: HealingActionType[];
  metadata: Record<string, unknown>;
}
```

#### Layer 3: Playbook Engine

```typescript
class SelfHealingPlaybookEngine {
  selectPlaybook(diagnosis: HealingDiagnosis): PlaybookMatch | null
  // Sélectionne le playbook optimal pour le diagnostic
  // Matching: targetCategory, targetSeverity, conditions
  // Returns: playbook, score, matchedConditions, missingConditions
  
  generatePlan(diagnosis: HealingDiagnosis, playbook: HealingPlaybook): ExecutionPlan
  // Génère un plan d'exécution à partir du playbook
  // - Résolution dépendances actions
  // - Estimation durée (ACTION_DURATION_ESTIMATES)
  // - Calcul risque (safe/moderate/risky)
  // - Requires confirmation check
  
  getAvailablePlaybooks(): HealingPlaybook[]
  // Retourne tous les playbooks disponibles (15+)
  // Categories: react-error-recovery, tauri-command-recovery, network-reconnect, etc.
}

interface ExecutionPlan {
  id: string;
  playbookId: string;
  playbookName: string;
  diagnosisId: string;
  timestamp: number;
  estimatedDuration: number;      // ms
  riskLevel: 'safe' | 'moderate' | 'risky';
  actions: PlannedAction[];       // Séquence ordonnée
  rollbackActions: PlannedAction[]; // Plan de rollback
  requiresConfirmation: boolean;
  metadata: Record<string, unknown>;
}
```

#### Layer 4: Executor

```typescript
class SelfHealingExecutor {
  async executePlan(plan: ExecutionPlan, options?: ExecutionOptions): Promise<PlanExecutionResult>
  // Exécute le plan d'action complet
  // - Vérification pré-conditions
  // - Exécution séquentielle/parallèle (canParallelize)
  // - Timeout protection (30s default)
  // - Rollback automatique si échec
  // - Progress callbacks
  
  async executeAction(action: PlannedAction): Promise<ActionResult>
  // Exécute une action unique
  // Returns: success, duration, error, data
  
  async rollback(plan: ExecutionPlan, lastSuccessful: number): Promise<void>
  // Annule les actions exécutées jusqu'à lastSuccessful
  
  getExecutionHistory(): Array<{ plan: ExecutionPlan; result: PlanExecutionResult }>
  // Retourne l'historique des exécutions (dernières 100)
}

interface PlanExecutionResult {
  planId: string;
  success: boolean;
  totalDuration: number;
  actionsExecuted: number;
  actionsSuccessful: number;
  actionsFailed: number;
  rolledBack: boolean;
  results: ActionResult[];
  error?: string;
}
```

#### Layer 5: Sync Layer

```typescript
class SelfHealingSyncLayer {
  async syncToSingularity(event: HealingEvent): Promise<void>
  // Synchronise l'événement de healing avec SingularityState
  // Updates: last_healing_event, healing_success_rate, system_stability
  
  async notifyHealingComplete(result: PlanExecutionResult): Promise<void>
  // Notifie le système que le healing est terminé
  // Triggers: singularity update, metrics recording, UI notification
  
  async persistEvent(event: HealingEvent | HealingDiagnosis): Promise<void>
  // Persiste l'événement dans le storage local
  // Storage: IndexedDB healing_events (max 1000 entrées, 30 jours)
}
```

---

## 🧩 SUB-MODULES

### Backend (src-tauri/src/system/)

1. **anomaly_detector.rs** (225 lignes)
   - `AnomalyDetector::compute_score(health)` → Calcul score anomalie 0.0-1.0
   - Seuils: error_rate (0.03/0.1), latency (200ms/500ms), memory (0.7/0.9)
   - AnomalyLevel: Normal (<0.3), Warning (0.3-0.6), Critical (>0.6)

2. **healing_executor.rs** (542 lignes)
   - `HealingExecutor::execute(actions)` → Exécution actions avec historique
   - Safe Mode: essential_only, disable_non_critical_engines, reduced_token_limit
   - Circuit Breaker: retry limit, exponential backoff
   - Learning Stats: success_rates, effectiveness par action

3. **repair_actions.rs** (estimé 300 lignes)
   - RepairAction enum (14 types)
   - RepairResult struct (success, duration, message)
   - Action implementations (RestartOmega, ClearMemoryCache, etc.)

4. **predictor.rs** (estimé 200 lignes)
   - `AnomalyPredictor::predict(health_history)` → Prédiction anomalie future
   - Trend analysis (Improving, Stable, Degrading, CriticalDegradation)
   - Time to critical estimation

### Frontend (src/services/selfHealing/)

1. **selfHealingObserver.ts** (800 lignes) — Layer 1
2. **selfHealingAnalyzer.ts** (733 lignes) — Layer 2
3. **selfHealingPlaybookEngine.ts** (861 lignes) — Layer 3
4. **selfHealingExecutor.ts** (725 lignes) — Layer 4
5. **selfHealingSyncLayer.ts** (422 lignes) — Layer 5
6. **selfHealing.config.ts** (estimé 400 lignes) — Types partagés
7. **index.ts** (556 lignes) — Orchestrateur principal

---

## 💾 DATA STRUCTURES

### Healing Event (Frontend)

```typescript
interface HealingEvent {
  id: string;
  timestamp: number;
  category: ModuleCategory; // 'react' | 'tauri' | 'ia' | 'memory' | 'network' | 'tts' | 'io' | 'performance'
  severity: HealingSeverity; // 'info' | 'low' | 'medium' | 'high' | 'critical'
  source: string;            // Module/component source
  message: string;
  stack?: string;
  context: Record<string, unknown>;
  fingerprint: string;       // Hash pour déduplication
  occurrences: number;
  firstSeen: number;
  lastSeen: number;
}
```

### Healing Playbook (Frontend)

```typescript
interface HealingPlaybook {
  id: string;
  name: string;
  description: string;
  targetCategory: ModuleCategory[];
  targetSeverity: HealingSeverity[];
  conditions: PlaybookCondition[];  // Matching rules
  actions: HealingAction[];         // Séquence de réparation
  maxRetries: number;
  cooldownMs: number;
  requiresConfirmation: boolean;
  safetyLevel: 'safe' | 'moderate' | 'risky';
  reversible: boolean;
  enabled: boolean;
}
```

### Healing Action Types (14 types)

```typescript
type HealingActionType =
  | 'restart_module'      // Redémarrer un module
  | 'clear_cache'         // Vider le cache
  | 'regenerate_config'   // Régénérer configuration
  | 'repair_json'         // Réparer JSON corrompu
  | 'rebuild_memory'      // Reconstruire mémoire
  | 'fallback_provider'   // Basculer provider
  | 'reset_state'         // Réinitialiser état
  | 'restart_worker'      // Redémarrer worker
  | 'patch_component'     // Patcher composant
  | 'restart_process'     // Redémarrer processus
  | 'sync_state'          // Synchroniser état
  | 'mini_audit'          // Audit léger
  | 'isolate_module'      // Isoler module
  | 'noop';               // No operation
```

### System Snapshot (Frontend)

```typescript
interface SystemSnapshot {
  timestamp: number;
  cpuUsage?: number;
  memoryUsage?: number;
  activeModules: string[];
  pendingOperations: number;
  lastSuccessfulHeal?: number;
}
```

---

## 🧪 TESTING

### Backend Tests (Rust)

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_self_heal_high_memory() {
        let mut engine = SelfHealEngine::new();
        let mut health = SystemHealth::new();
        health.memory_usage = 0.9; // 90% - critique
        
        let actions = engine.determine_actions(&health).await;
        assert!(actions.contains(&RepairAction::TrimMemory));
        assert!(actions.contains(&RepairAction::ForceGC));
    }

    #[tokio::test]
    async fn test_anomaly_detection() {
        let detector = AnomalyDetector::new();
        let mut health = SystemHealth::new();
        health.error_rate = 0.12; // 12% - critique
        
        let score = detector.compute_score(&health);
        assert!(score > 0.6); // Critical threshold
    }

    #[tokio::test]
    async fn test_learning_stats() {
        let mut executor = HealingExecutor::new();
        
        // Simulate successful healing
        let action = RepairAction::ClearMemoryCache;
        executor.record_success(&action, 0.8, 0.3); // Before: 0.8, After: 0.3
        
        let stats = executor.get_learning_stats();
        assert!(stats.action_effectiveness["ClearMemoryCache"] > 0.4);
    }

    #[tokio::test]
    async fn test_safe_mode_activation() {
        let mut executor = HealingExecutor::new();
        let health = SystemHealth::new();
        health.anomaly_score = 0.95; // Très critique
        
        executor.activate_safe_mode();
        assert!(executor.state.safe_mode_active);
        assert!(executor.state.degraded_mode_active);
    }
}
```

### Frontend Tests (TypeScript/Vitest)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { SelfHealingObserver, SelfHealingAnalyzer, SelfHealingPlaybookEngine } from '@/services/selfHealing';

describe('SelfHealingObserver', () => {
  it('should capture JS runtime errors', async () => {
    const observer = SelfHealingObserver.getInstance();
    const events: HealingEvent[] = [];
    observer.subscribe((event) => events.push(event));
    
    observer.startObserving();
    
    // Trigger error
    window.dispatchEvent(new ErrorEvent('error', {
      message: 'Test error',
      filename: 'test.ts',
      lineno: 42,
    }));
    
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('js_runtime_error');
  });

  it('should deduplicate identical errors within window', () => {
    const observer = SelfHealingObserver.getInstance();
    
    // Trigger same error 3 times
    for (let i = 0; i < 3; i++) {
      observer.captureError({
        message: 'Same error',
        type: 'js_runtime_error',
        source: 'js',
      });
    }
    
    const state = observer.getState();
    expect(state.totalDeduplicated).toBe(2); // 3 - 1 = 2 déduplications
  });
});

describe('SelfHealingAnalyzer', () => {
  it('should generate correct diagnosis for React error', async () => {
    const analyzer = SelfHealingAnalyzer.getInstance();
    
    const event: HealingEvent = {
      id: 'evt-1',
      timestamp: Date.now(),
      category: 'react',
      severity: 'high',
      source: 'ChatEngine',
      message: 'Cannot read property of undefined',
      context: {},
      fingerprint: 'hash123',
      occurrences: 1,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
    };
    
    const diagnosis = await analyzer.analyze(event, {
      recentEvents: [],
      systemState: { timestamp: Date.now(), activeModules: [], pendingOperations: 0 },
      patterns: [],
      moduleHealth: new Map(),
    });
    
    expect(diagnosis.nature).toContain('React');
    expect(diagnosis.suggestedActions).toContain('reset_state');
  });

  it('should detect recurring patterns', () => {
    const analyzer = SelfHealingAnalyzer.getInstance();
    
    const events: HealingEvent[] = Array(5).fill(null).map((_, i) => ({
      id: `evt-${i}`,
      timestamp: Date.now() - (i * 10000),
      category: 'network',
      severity: 'medium',
      source: 'GeminiClient',
      message: 'Timeout',
      context: {},
      fingerprint: 'timeout-hash',
      occurrences: 1,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
    }));
    
    const patterns = analyzer.detectPatterns(events);
    expect(patterns).toHaveLength(1);
    expect(patterns[0].frequency).toBeGreaterThanOrEqual(3);
  });
});

describe('SelfHealingPlaybookEngine', () => {
  it('should select correct playbook for Tauri error', () => {
    const engine = SelfHealingPlaybookEngine.getInstance();
    
    const diagnosis: HealingDiagnosis = {
      id: 'diag-1',
      eventId: 'evt-1',
      timestamp: Date.now(),
      nature: 'Commande Tauri échouée',
      probableCauses: ['Backend Rust panic'],
      urgency: 7,
      impact: 8,
      confidence: 0.85,
      suggestedActions: ['restart_module', 'sync_state'],
      metadata: {},
    };
    
    const match = engine.selectPlaybook(diagnosis);
    expect(match).not.toBeNull();
    expect(match!.playbook.id).toBe('tauri-command-recovery');
    expect(match!.score).toBeGreaterThan(0.7);
  });

  it('should generate execution plan with dependencies', () => {
    const engine = SelfHealingPlaybookEngine.getInstance();
    const playbook = engine.getAvailablePlaybooks()[0];
    
    const diagnosis: HealingDiagnosis = { /* ... */ };
    const plan = engine.generatePlan(diagnosis, playbook);
    
    expect(plan.actions.length).toBeGreaterThan(0);
    expect(plan.estimatedDuration).toBeGreaterThan(0);
    expect(['safe', 'moderate', 'risky']).toContain(plan.riskLevel);
  });
});
```

---

## ⚡ PERFORMANCE

### Backend Latencies

| Opération | Latence Typique | Latence Max |
|-----------|-----------------|-------------|
| `determine_actions()` | ~1-2ms | 5ms |
| `execute_action(TrimMemory)` | ~50-100ms | 200ms |
| `execute_action(RestartOmega)` | ~500-1000ms | 2000ms |
| `compute_anomaly_score()` | <1ms | 2ms |
| `learning_stats_update()` | <1ms | 1ms |

### Frontend Latencies

| Layer | Opération | Latence Typique | Latence Max |
|-------|-----------|-----------------|-------------|
| Observer | `captureError()` | <1ms | 2ms |
| Observer | `deduplication check` | <1ms | 1ms |
| Analyzer | `analyze()` | ~5-10ms | 20ms |
| Analyzer | `detectPatterns()` | ~10-20ms | 50ms |
| Playbook | `selectPlaybook()` | ~2-5ms | 10ms |
| Playbook | `generatePlan()` | ~5-10ms | 15ms |
| Executor | `executePlan()` (total) | ~500-5000ms | 30000ms |
| Executor | `executeAction()` (single) | ~100-2000ms | 5000ms |
| Sync | `syncToSingularity()` | ~10-20ms | 50ms |

### Resource Usage

| Métrique | Valeur | Notes |
|----------|--------|-------|
| **Memory Overhead (Backend)** | ~5-10 MB | Historique healing (500 entrées) |
| **Memory Overhead (Frontend)** | ~15-25 MB | Error buffer, playbooks, stats |
| **CPU Impact (Observer)** | <1% | Capture passive, rate-limited |
| **CPU Impact (Healing)** | 2-5% | Pendant exécution actions |
| **Storage (IndexedDB)** | ~2-5 MB | Healing events (max 1000, 30 jours) |
| **Network Overhead** | 0 | Aucune requête externe |

### Scalability

- **Error Buffer Limit:** 1000 événements uniques (déduplication active)
- **Rate Limiting:** 100 événements/min max (protection spam)
- **Playbook Registry:** 15+ playbooks (extensible sans impact)
- **Historique Backend:** 500 entrées max (FIFO rotation)
- **Historique Frontend:** 100 plans d'exécution (FIFO rotation)
- **Pattern Detection:** 300s rolling window (auto-cleanup)

---

## 🔗 INTEGRATIONS

### OMEGA Pipeline Integration

```rust
// src-tauri/src/omega/self_healing_hook.rs
pub async fn omega_error_hook(error: &OmegaError) -> Result<(), HealingError> {
    let event = HealingEvent {
        category: ModuleCategory::IA,
        severity: map_omega_error_severity(error),
        source: "OMEGA Pipeline".to_string(),
        message: error.to_string(),
        context: error.context.clone(),
    };
    
    // Trigger self-healing
    let diagnosis = analyzer.analyze(event).await?;
    let playbook = playbook_engine.select_playbook(&diagnosis)?;
    let plan = playbook_engine.generate_plan(&diagnosis, &playbook)?;
    
    executor.execute_plan(plan).await?;
    Ok(())
}
```

### ConversationEngine Integration

```rust
// src-tauri/src/conversation_engine/mod.rs
impl ConversationEngine {
    async fn handle_stage_error(&mut self, stage: u8, error: StageError) -> Result<(), EngineError> {
        // Log error
        self.log_error(stage, &error);
        
        // Trigger self-healing if critical
        if error.is_critical() {
            let healing_result = self_heal_engine
                .heal_conversation_error(stage, error)
                .await?;
            
            if healing_result.success {
                // Retry stage
                return self.retry_stage(stage);
            }
        }
        
        Err(error.into())
    }
}
```

### UnifiedMemory Integration (Corruption Detection)

```typescript
// src/services/memory/memoryEngineService.ts
async function storeMemory(entry: MemoryEntry): Promise<void> {
  try {
    await tauriInvoke('memory_store', { entry });
  } catch (error) {
    // Memory corruption detected
    const healingEvent: HealingEvent = {
      id: generateId(),
      timestamp: Date.now(),
      category: 'memory',
      severity: 'high',
      source: 'UnifiedMemory',
      message: `Memory store failed: ${error.message}`,
      context: { entry, error },
      fingerprint: hashError(error),
      occurrences: 1,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
    };
    
    selfHealingObserver.captureError(healingEvent);
    
    // Automatic healing will trigger:
    // 1. Analyzer: diagnose corruption cause
    // 2. Playbook: select "memory-rebuild" playbook
    // 3. Executor: execute [rebuild_memory, sync_state]
  }
}
```

### Singularity Synchronization

```typescript
// src/services/selfHealing/selfHealingSyncLayer.ts
async syncToSingularity(event: HealingEvent): Promise<void> {
  await tauriInvoke('singularity_update', {
    last_healing_event: {
      timestamp: event.timestamp,
      severity: event.severity,
      category: event.category,
    },
  });
  
  // Update system stability score
  const stability = calculateStability(event);
  await tauriInvoke('singularity_set_stability', { stability });
}
```

---

## 📚 USE CASES

### Use Case 1: React Component Crash (Auto-Recovery)

**Scenario:** Un composant React crash à cause d'une propriété undefined

```typescript
// 1. Error thrown in React component
function ChatMessage({ message }) {
  return <div>{message.content.toUpperCase()}</div>; // message.content is undefined
}

// 2. Observer captures error
// selfHealingObserver détecte via React Error Boundary
// ObservedError: {
//   type: 'react_error_boundary',
//   message: "Cannot read property 'toUpperCase' of undefined",
//   context: { componentStack: '...' }
// }

// 3. Analyzer generates diagnosis
// HealingDiagnosis: {
//   nature: 'Erreur React: accès propriété undefined',
//   probableCauses: ['Props invalides', 'État corrompu'],
//   suggestedActions: ['reset_state', 'patch_component']
// }

// 4. Playbook Engine selects "react-error-recovery"
// ExecutionPlan: {
//   actions: [
//     { type: 'reset_state', targetModule: 'react' },
//     { type: 'clear_cache', targetModule: 'react' }
//   ]
// }

// 5. Executor applies fixes
// - Reset component state to default
// - Clear React render cache
// - Re-render component

// 6. Result: Component recovers without page reload
```

### Use Case 2: Tauri Command Failure (Backend Panic Recovery)

**Scenario:** Une commande Tauri échoue à cause d'un panic Rust backend

```rust
// 1. Backend panic occurs
#[tauri::command]
async fn memory_recall(query: String) -> Result<Vec<Memory>, String> {
    let memories = memory_engine.search(&query).unwrap(); // Panic if None
    Ok(memories)
}

// 2. Frontend captures Tauri error
// selfHealingObserver détecte invoke failure
// ObservedError: {
//   type: 'tauri_command_fail',
//   message: 'Command "memory_recall" failed',
//   context: { invokeCommand: 'memory_recall', invokePayload: { query: '...' } }
// }

// 3. Analyzer: "Backend Rust panic probable"
// HealingDiagnosis: {
//   probableCauses: ['Unwrap sur None', 'Backend module failing'],
//   suggestedActions: ['restart_module', 'sync_state']
// }

// 4. Playbook: "tauri-command-recovery"
// ExecutionPlan: {
//   actions: [
//     { type: 'sync_state', targetModule: 'singularity' },
//     { type: 'restart_module', targetModule: 'memory' }
//   ]
// }

// 5. Backend healing triggered
let actions = self_heal_engine.determine_actions(&health).await;
// actions = [RestartModule(Memory)]

// 6. Result: Memory module restarted, command retry succeeds
```

### Use Case 3: Memory Corruption (Rebuild + Sync)

**Scenario:** Données mémoire corrompues détectées lors d'un rappel

```typescript
// 1. Memory corruption detected
async function recallMemories(query: string): Promise<Memory[]> {
  const memories = await tauriInvoke('memory_recall', { query });
  
  // Validation échoue: JSON malformé
  if (!validateMemories(memories)) {
    throw new MemoryCorruptionError('Invalid memory format');
  }
}

// 2. Observer captures corruption
// ObservedError: {
//   type: 'memory_corruption',
//   severity: 'high',
//   message: 'Invalid memory format detected'
// }

// 3. Analyzer: "Données persistantes corrompues"
// HealingDiagnosis: {
//   probableCauses: ['JSON malformé', 'Écriture partielle'],
//   suggestedActions: ['rebuild_memory', 'repair_json', 'sync_state']
// }

// 4. Playbook: "memory-corruption-recovery"
// ExecutionPlan: {
//   actions: [
//     { type: 'rebuild_memory', targetModule: 'memory', parameters: { backup: true } },
//     { type: 'sync_state', targetModule: 'singularity' }
//   ],
//   rollbackActions: [
//     { type: 'restore_backup', targetModule: 'memory' }
//   ]
// }

// 5. Execution with rollback protection
const result = await executor.executePlan(plan);
// - Backup current memory state
// - Rebuild memory from valid entries
// - If fails: restore from backup
// - Sync Singularity state

// 6. Result: Memory rebuilt, corrupted entries discarded
```

### Use Case 4: High Memory Usage (Proactive Healing)

**Scenario:** Backend détecte utilisation mémoire élevée avant crash

```rust
// 1. SystemHealth tick détecte anomalie
let mut health = SystemHealth::new();
health.collect_metrics()?; // memory_usage = 0.88 (88%)

let anomalies = health.scan_anomalies(&state);
// anomalies = [Anomaly { type: HighMemory, severity: 0.2, auto_healable: true }]

// 2. SelfHealEngine détermine actions
let actions = self_heal_engine.determine_actions(&health).await;
// actions = [TrimMemory, ForceGC] (pas encore critique pour RestartOmega)

// 3. Exécution healing
let report = self_heal_engine.execute_actions(actions).await;
// - TrimMemory: clear unused caches (~200ms)
// - ForceGC: force garbage collection (~50ms)

// 4. Vérification amélioration
health.collect_metrics()?; // memory_usage = 0.72 (72%) ✓

// 5. Learning stats update
// action_success_rates["TrimMemory"] = (successes + 1, total + 1)
// action_effectiveness["TrimMemory"] = 0.16 (amélioration 88% → 72%)

// 6. Result: Memory stabilized, crash avoided
```

---

## 🛡️ ERROR HANDLING

### Backend Error Handling

```rust
// Safe Mode activation on critical anomaly
impl HealingExecutor {
    pub async fn execute_with_protection(
        &mut self,
        actions: Vec<RepairAction>
    ) -> Result<HealingReport, HealingError> {
        // Check if system is too unstable for healing
        if self.state.circuit_breaker_active {
            return Err(HealingError::CircuitBreakerOpen);
        }
        
        // Activate Safe Mode if needed
        if actions.iter().any(|a| a.is_risky()) {
            self.activate_safe_mode();
        }
        
        let mut report = HealingReport::default();
        
        for action in actions {
            match self.execute_action(action).await {
                Ok(result) => {
                    report.repairs_successful += 1;
                    self.record_success(&action, result);
                }
                Err(e) => {
                    report.repairs_failed += 1;
                    self.record_failure(&action, e);
                    
                    // Circuit breaker: stop after 3 consecutive failures
                    if self.consecutive_failures >= 3 {
                        self.state.circuit_breaker_active = true;
                        return Err(HealingError::TooManyFailures);
                    }
                }
            }
        }
        
        Ok(report)
    }
}
```

### Frontend Error Handling (Rollback)

```typescript
class SelfHealingExecutor {
  async executePlan(plan: ExecutionPlan): Promise<PlanExecutionResult> {
    const results: ActionResult[] = [];
    let lastSuccessful = -1;
    
    try {
      for (let i = 0; i < plan.actions.length; i++) {
        const action = plan.actions[i];
        
        // Skip if dependencies not met
        if (!this.checkDependencies(action, results)) {
          results.push({ success: false, error: 'Dependencies not met' });
          continue;
        }
        
        // Execute with timeout
        const result = await this.executeActionWithTimeout(action, action.timeout);
        results.push(result);
        
        if (result.success) {
          lastSuccessful = i;
        } else if (action.onFailure === 'abort') {
          throw new Error(`Critical action failed: ${action.id}`);
        }
      }
      
      return { success: true, results, rolledBack: false };
      
    } catch (error) {
      // Rollback on failure
      if (plan.rollbackActions.length > 0 && lastSuccessful >= 0) {
        await this.rollback(plan, lastSuccessful);
        return { success: false, results, rolledBack: true, error: error.message };
      }
      
      return { success: false, results, rolledBack: false, error: error.message };
    }
  }
  
  async rollback(plan: ExecutionPlan, lastSuccessful: number): Promise<void> {
    // Execute rollback actions in reverse order
    for (let i = lastSuccessful; i >= 0; i--) {
      const rollbackAction = plan.rollbackActions[i];
      if (rollbackAction) {
        await this.executeAction(rollbackAction);
      }
    }
  }
}
```

### Error Recovery Strategies

| Error Type | Strategy | Fallback |
|------------|----------|----------|
| **React Error Boundary** | Reset component state → Clear cache | Full page reload |
| **Tauri Command Fail** | Sync state → Restart module | Retry with exponential backoff |
| **Backend Panic** | Isolate module → Restart process | Safe Mode activation |
| **Memory Corruption** | Rebuild memory → Restore backup | Clear all memory (last resort) |
| **Network Failure** | Fallback provider → Retry | Offline mode |
| **Pipeline Stuck** | Restart worker → Clear queue | Abort pipeline |

---

## ⚙️ CONFIGURATION

### Backend Configuration

```rust
// src-tauri/src/system/mod.rs
pub fn configure_self_healing() -> SelfHealConfig {
    SelfHealConfig {
        anomaly_threshold: 0.6,         // Score déclenchant actions (0.6 = Warning)
        memory_critical_threshold: 0.85, // 85% RAM usage
        error_rate_threshold: 0.08,     // 8% taux d'erreur
        max_engine_latency_ms: 150,     // 150ms latence max moteurs
        min_integrity: 0.9,             // 90% intégrité minimale
        aggressive_mode: false,         // Mode agressif désactivé (production)
    }
}

// Safe Mode configuration
pub fn safe_mode_config() -> SafeModeConfig {
    SafeModeConfig {
        essential_only: true,                    // Fonctionnalités essentielles uniquement
        disable_non_critical_engines: true,      // Désactiver moteurs non-critiques
        reduced_token_limit: 1000,               // Limite tokens réduite
        disable_cache: false,                    // Garder cache (performance)
        verbose_logging: true,                   // Logs détaillés actifs
    }
}
```

### Frontend Configuration

```typescript
// src/services/selfHealing/index.ts
const DEFAULT_ENGINE_CONFIG: SelfHealingEngineConfig = {
  enabled: true,
  autoHeal: true,                                      // Auto-healing actif
  autoHealSeverity: ['medium', 'high', 'critical'],    // Sévérités auto-heal
  requireConfirmationForCritical: true,                // Confirmation pour critical
  dryRunMode: false,                                   // Mode dry-run désactivé
  logLevel: 'info',                                    // Niveau logs
};

// Observer configuration
const OBSERVER_CONFIG: ObserverConfig = {
  enabled: true,
  captureGlobalErrors: true,
  captureUnhandledRejections: true,
  captureReactErrors: true,
  captureTauriErrors: true,
  captureNetworkErrors: true,
  capturePerformanceIssues: true,
  deduplicationWindowMs: 5000,       // 5s window pour déduplication
  maxEventsPerMinute: 100,           // Rate limiting 100 evt/min
  ignorePatterns: [
    /ResizeObserver loop/i,          // Ignorer erreurs bénignes
    /Loading chunk \d+ failed/i,
  ],
};

// Playbook Engine configuration
const PLAYBOOK_CONFIG: PlaybookEngineConfig = {
  enabled: true,
  maxActionsPerPlaybook: 10,
  defaultTimeout: 30000,             // 30s timeout par action
  requireConfirmationFor: ['critical'],
  allowRiskyActions: false,          // Interdire actions risquées (production)
  autoRollbackOnFailure: true,       // Rollback automatique si échec
};
```

---

## 🚀 FUTURE ENHANCEMENTS

### Phase 7 - Predictive Healing (Planned)

```rust
// Prédiction anomalie avant qu'elle se produise
pub struct AnomalyPredictor {
    history: VecDeque<HealthSnapshot>,
    model: TrendModel,
}

impl AnomalyPredictor {
    pub fn predict_anomaly(&self) -> Option<AnomalyPrediction> {
        let trend = self.analyze_trend();
        
        if trend == TrendDirection::CriticalDegradation {
            Some(AnomalyPrediction {
                probability: 0.85,
                time_to_critical_secs: Some(120), // 2 minutes avant crash
                confidence: 0.9,
                recommended_actions: vec![RepairAction::TrimMemory],
            })
        } else {
            None
        }
    }
}
```

### Phase 8 - ML-Based Action Selection

```typescript
// Machine learning pour sélection optimale d'actions
class MLPlaybookSelector {
  private model: TensorFlowModel;
  
  async selectOptimalPlaybook(diagnosis: HealingDiagnosis): Promise<HealingPlaybook> {
    // Features: error frequency, severity, module health, time of day
    const features = this.extractFeatures(diagnosis);
    
    // Predict success probability for each playbook
    const predictions = await this.model.predict(features);
    
    // Select playbook with highest success probability
    return this.playbooks[predictions.argMax()];
  }
}
```

### Phase 9 - Distributed Healing (Multi-Instance)

```rust
// Coordination healing entre plusieurs instances TITANE
pub struct DistributedHealingCoordinator {
    instances: Vec<InstanceInfo>,
    consensus: ConsensusEngine,
}

impl DistributedHealingCoordinator {
    pub async fn coordinate_healing(&self, anomaly: Anomaly) -> HealingStrategy {
        // Collect health from all instances
        let cluster_health = self.gather_cluster_health().await;
        
        // Decide if local healing or cluster-wide restart needed
        if cluster_health.all_failing() {
            HealingStrategy::ClusterRestart
        } else {
            HealingStrategy::LocalHealing
        }
    }
}
```

---

## 📖 RELATED DOCUMENTATION

**Architecture:**
- [SYSTEM_HEALTH_ENGINE.md](SYSTEM_HEALTH_ENGINE.md) — Monitoring + anomaly detection
- [SINGULARITY.md](SINGULARITY.md) — Meta-cognitive state synchronization
- [OMEGA_PIPELINE.md](OMEGA_PIPELINE.md) — AI generation error hooks

**Guides:**
- [docs/architecture/SELF_HEALING_OVERVIEW.md](../../architecture/SELF_HEALING_OVERVIEW.md) — Self-Healing overview
- [docs/guides/development/DEBUGGING.md](../../04_guides/development/DEBUGGING.md) — Debugging strategies

**Integration:**
- [CONVERSATION_ENGINE.md](CONVERSATION_ENGINE.md) — Stage error recovery
- [UNIFIED_MEMORY.md](UNIFIED_MEMORY.md) — Memory corruption detection

---

**Documentation générée:** 15 décembre 2025  
**Version module:** v20Ω  
**Lignes analysées:** Backend 2,208L + Frontend 5,343L = 7,551 lignes  
**Auteur:** TITANE∞ Documentation Evolution Engine vΩ
