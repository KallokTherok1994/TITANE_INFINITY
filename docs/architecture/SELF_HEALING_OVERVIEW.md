# TITANE∞ Self-Healing Engine - Overview

**Super Prompt #4 Implementation**
**Version:** v20Ω
**Date:** 2025-12-08

---

## Executive Summary

Le Self-Healing Engine de TITANE∞ est un **système immunitaire cognitif** qui détecte, diagnostique et répare automatiquement les anomalies du système. Il fonctionne en temps réel, apprend de ses interventions, et peut prédire les problèmes avant qu'ils ne deviennent critiques.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    OMEGA Pipeline Integration                    │
│                  (self_healing_hook.rs)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   DETECT     │→ │   DIAGNOSE   │→ │    REPAIR    │          │
│  │              │  │              │  │              │          │
│  │ • Metrics    │  │ • Anomaly    │  │ • Execute    │          │
│  │ • Health     │  │   Detection  │  │   Actions    │          │
│  │ • Errors     │  │ • Prediction │  │ • History    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                 │                 │                   │
│         └─────────────────┴─────────────────┘                   │
│                           │                                     │
│                    ┌──────▼──────┐                              │
│                    │    LEARN    │                              │
│                    │             │                              │
│                    │ • Stats     │                              │
│                    │ • Patterns  │                              │
│                    │ • Optimize  │                              │
│                    └─────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Anomaly Detector (`anomaly_detector.rs`)

Détecte les anomalies en analysant les métriques système:

- **CPU Load** > 80% → Warning, > 95% → Critical
- **Memory Usage** > 85% → Warning, > 95% → Critical
- **Error Rate** > 5% → Warning, > 10% → Critical
- **OMEGA Latency** > 200ms → Warning, > 400ms → Critical
- **Cache Hit Rate** < 50% → Warning, < 30% → Critical

**Score d'anomalie:** 0.0 (sain) → 1.0 (critique)

### 2. Predictor (`predictor.rs`)

Prédit les anomalies futures basé sur les tendances:

```rust
pub struct AnomalyPrediction {
    pub probability: f32,           // 0.0-1.0
    pub time_to_critical_secs: Option<u64>,
    pub confidence: f32,
    pub trend: TrendDirection,
    pub at_risk_components: Vec<AtRiskComponent>,
}

pub enum TrendDirection {
    Improving,           // Score décroissant
    Stable,              // Score stable (±5%)
    Degrading,           // Score croissant lentement
    CriticalDegradation, // Score croissant rapidement
}
```

### 3. Repair Actions (`repair_actions.rs`)

16 actions de réparation disponibles:

| Action | Priorité | Risque | Catégorie |
|--------|----------|--------|-----------|
| `ForceGC` | 3 | 1 | Memory |
| `ClearMemoryCache` | 4 | 2 | Memory |
| `TrimMemory` | 2 | 1 | Memory |
| `RebalanceEngines` | 5 | 3 | Engines |
| `RestartEngine(id)` | 7 | 5 | Engines |
| `RestartOmega` | 9 | 7 | Engines |
| `ResetConversationContext` | 6 | 4 | Context |
| `RebuildIndexes` | 4 | 2 | Storage |
| `ReduceParallelism` | 5 | 3 | Performance |
| `EnableDegradedMode` | 8 | 5 | System |
| `EnableDetailedLogging` | 1 | 0 | Logging |
| `EnableSafeMode` | 10 | 6 | System |
| `DisableSafeMode` | 1 | 2 | System |
| `EnableCircuitBreaker` | 9 | 5 | System |
| `DisableCircuitBreaker` | 2 | 3 | System |
| `IsolateEngine(id)` | 8 | 4 | Engines |
| `RestoreEngine(id)` | 3 | 2 | Engines |
| `ReduceTokenLimit(n)` | 6 | 3 | Performance |
| `RestoreTokenLimit` | 2 | 1 | Performance |
| `PurgeFailedProviders` | 5 | 3 | Providers |

### 4. Healing Executor (`healing_executor.rs`)

Exécute les actions avec historique et apprentissage:

```rust
pub struct HealingExecutor {
    state: Arc<RwLock<HealingState>>,
    history: Arc<RwLock<VecDeque<HealingHistoryEntry>>>,
    learning: Arc<RwLock<LearningStats>>,
}

pub struct HealingState {
    pub safe_mode_active: bool,
    pub circuit_breaker_active: bool,
    pub degraded_mode_active: bool,
    pub isolated_engines: Vec<String>,
    pub current_token_limit: Option<u32>,
    pub detailed_logging: bool,
}
```

### 5. OMEGA Integration (`self_healing_hook.rs`)

Hook intégré au pipeline OMEGA:

```rust
impl SelfHealingHook {
    /// Appelé au début de chaque requête
    pub async fn on_request_start(&self, ctx: &RequestContext);

    /// Appelé à la fin de chaque requête
    pub async fn on_request_complete(&self, ctx: &RequestContext, latency_ms: u64);

    /// Appelé en cas d'erreur
    pub async fn on_error(&self, ctx: &RequestContext, error: &str);

    /// Tick périodique (chaque 5 secondes)
    pub async fn on_tick(&self) -> Option<HealingReport>;

    /// Force une évaluation immédiate
    pub async fn force_evaluation(&self) -> HealingReport;
}
```

---

## Flow de Healing

```
1. COLLECT METRICS
   │
   ▼
2. DETECT ANOMALY (score 0.0-1.0)
   │
   ├─ score < 0.3 → NORMAL (no action)
   │
   ├─ score 0.3-0.6 → WARNING
   │     └─ Actions légères (ForceGC, TrimMemory, EnableDetailedLogging)
   │
   ├─ score 0.6-0.8 → ELEVATED
   │     └─ Actions modérées (ClearCache, ReduceParallelism, IsolateEngine)
   │
   └─ score > 0.8 → CRITICAL
         └─ Actions d'urgence (EnableSafeMode, CircuitBreaker, RestartEngine)
   │
   ▼
3. EXECUTE ACTIONS
   │
   ▼
4. RECORD HISTORY
   │
   ▼
5. UPDATE LEARNING STATS
   │
   ▼
6. PREDICT FUTURE ANOMALIES
```

---

## Safe Mode

Le Safe Mode est le niveau de protection maximal:

```rust
pub struct SafeModeConfig {
    pub essential_only: bool,              // Fonctionnalités essentielles uniquement
    pub disable_non_critical_engines: bool, // Désactive moteurs non-critiques
    pub reduced_token_limit: u32,          // Limite tokens réduite (1000)
    pub disable_cache: bool,               // Désactive le cache
    pub verbose_logging: bool,             // Logs détaillés
}
```

**Activation automatique si:**
- Anomaly score > 0.8
- Plusieurs erreurs critiques consécutives
- Circuit breaker déjà actif et problème persiste

---

## Frontend Dashboard

Composant React: `src/ui/pages/SelfHealingDashboard.tsx`

**Panneaux:**
1. **Santé Système** - Score circulaire + métriques (CPU, RAM, Latence, Erreurs, Cache)
2. **Prédiction** - Probabilité d'anomalie + tendance + temps estimé avant critique
3. **État du Healing** - Safe Mode, Circuit Breaker, Mode Dégradé, Logs Détaillés
4. **Actions en Attente** - Actions nécessitant confirmation manuelle
5. **Historique** - Timeline des actions exécutées

**Tauri Commands:**
```typescript
invoke<SystemHealth>('get_self_healing_health');
invoke<HealingState>('get_self_healing_state');
invoke<AnomalyPrediction>('get_self_healing_prediction');
invoke<HealingReport>('force_self_healing_evaluation');
invoke('toggle_safe_mode', { enable: boolean });
invoke('confirm_self_healing_action', { action: string });
invoke('reject_self_healing_action', { action: string });
```

---

## Learning System

Le système apprend de ses interventions:

```rust
pub struct LearningStats {
    /// Taux de succès par action (succès, total)
    pub action_success_rates: HashMap<String, (u32, u32)>,

    /// Efficacité moyenne (amélioration du score d'anomalie)
    pub action_effectiveness: HashMap<String, f32>,

    /// Actions les plus efficaces
    pub top_effective_actions: Vec<String>,
}
```

**Métriques d'apprentissage:**
- **Success Rate** = succès / total pour chaque action
- **Effectiveness** = (anomaly_before - anomaly_after) moyenne mobile

---

## Files Structure

```
src-tauri/src/
├── system/
│   ├── mod.rs                  # Module exports
│   ├── anomaly_detector.rs     # Détection d'anomalies
│   ├── predictor.rs            # Prédiction (NEW)
│   ├── repair_actions.rs       # Actions de réparation (EXTENDED)
│   ├── healing_executor.rs     # Exécuteur avec historique (NEW)
│   ├── system_health.rs        # Métriques de santé
│   ├── health_scheduler.rs     # Planification
│   └── diagnostics.rs          # Diagnostics
│
└── omega/
    ├── mod.rs                  # Module exports
    └── self_healing_hook.rs    # Intégration OMEGA (NEW)

src/ui/pages/
├── SelfHealingDashboard.tsx    # Dashboard React (NEW)
└── styles/
    └── SelfHealingDashboard.css # Styles (NEW)
```

---

## Configuration

```rust
pub struct SelfHealingHookConfig {
    pub enabled: bool,                    // Activer le hook
    pub evaluation_interval_secs: u64,    // Intervalle d'évaluation (5s)
    pub history_size: usize,              // Taille historique (100)
    pub auto_healing_enabled: bool,       // Healing automatique
    pub require_confirmation_above_risk: u8, // Confirmation si risque > N
}
```

---

## Testing

```bash
# Tests Rust
cd src-tauri
cargo test system::
cargo test omega::self_healing_hook::

# Vérification compilation
cargo check
cargo clippy
```

---

## Metrics & Observability

Le Self-Healing Engine expose des métriques pour le monitoring:

- `selfhealing_anomaly_score` - Score d'anomalie courant
- `selfhealing_actions_total` - Nombre total d'actions exécutées
- `selfhealing_actions_success` - Nombre d'actions réussies
- `selfhealing_safe_mode_active` - Safe Mode actif (0/1)
- `selfhealing_circuit_breaker_active` - Circuit Breaker actif (0/1)
- `selfhealing_prediction_probability` - Probabilité d'anomalie prédite

---

## Best Practices

1. **Ne pas désactiver le Self-Healing en production**
2. **Monitorer les métriques d'apprentissage** pour identifier les actions inefficaces
3. **Configurer les seuils** selon le profil de charge du système
4. **Reviewer régulièrement l'historique** pour détecter les patterns récurrents
5. **Tester le Safe Mode** avant déploiement production

---

## Related Documentation

- [DEVTOOLS_OVERVIEW.md](../DEVTOOLS_OVERVIEW.md) - Vue d'ensemble DevTools
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Architecture globale TITANE∞
- [OBSERVABILITY_AUDIT_v19.3.md](../OBSERVABILITY_AUDIT_v19.3.md) - Audit observabilité

---

*Documentation générée pour TITANE∞ v20Ω - Super Prompt #4*
