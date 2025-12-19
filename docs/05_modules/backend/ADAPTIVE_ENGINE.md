# 🧠 Adaptive Engine — Module Documentation

**Version:** v24.2.0  
**Module Path:** `src-tauri/src/adaptive/` (Backend Rust)  
**Type:** Backend (Primary)  
**Complexity:** ⭐⭐⭐⭐ (Advanced - Reinforcement learning + pattern recognition)

---

## 📋 MODULE OVERVIEW

### Purpose

Adaptive Engine est le système d'apprentissage et d'adaptation automatique de TITANE∞. Il observe les performances du système, détecte des patterns, ajuste les préférences et exécute des optimisations adaptatives basées sur l'historique.

### Responsibilities

**Backend (Rust):**
- Performance sample capture (CPU, latency, FPS, stability, etc.)
- Pattern detection (high CPU, high latency, low stability)
- Adaptive rule evaluation (condition → action mapping)
- Learning cycle (auto-adjust preferences based on patterns)
- Optimization action execution (reduce complexity, trigger sync, simplify UI, etc.)
- Preference profile management (AI style, system mode, optimization bias)

### Key Features

- **Reinforcement Learning**: Pattern-based preference adjustment
- **5 Default Rules**: LatencyAI high, Cognitive low, FPS low, Sync quality low, Hash integrity failed
- **8 Adaptive Actions**: ReduceAIComplexity, TriggerDeepSync, SimplifyUITransitions, ReanchorTimeline, SwitchToStableMode, OptimizeMemory, AdjustFPSTarget, RecalibrateEmbeddings
- **Learning State**: Total samples, patterns detected, optimization cycles, learning rate (0.1 default)
- **Auto-Learning**: Automatic preference adjustment (if enabled)
- **History Management**: Max 1000 samples (rolling window)

---

## 🏗️ ARCHITECTURE

### Adaptive Optimization Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                  ADAPTIVE OPTIMIZATION ENGINE                       │
│             (adaptive_engine.rs - 1,476 lines)                      │
│                                                                     │
│  Components:                                                        │
│  • performance_history: Vec<SystemPerformanceSample>               │
│  • optimization_rules: Vec<AdaptiveRule>                           │
│  • learning_state: LearningState                                   │
│  • preference_profile: PreferenceProfile                           │
│  • max_history_size: usize (1000)                                  │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    1. SAMPLE CAPTURE                                │
│                                                                     │
│  capture_sample(sample: SystemPerformanceSample)                   │
│  ├─> Add to performance_history                                    │
│  ├─> Increment total_samples                                       │
│  ├─> Trim history if > max_history_size                            │
│  └─> Log sample captured                                           │
│                                                                     │
│  SystemPerformanceSample:                                          │
│  • timestamp: String (ISO 8601)                                    │
│  • cpu_load: f32 (0.0-1.0)                                         │
│  • latency_ai: u128 (ms)                                           │
│  • fps: u32                                                        │
│  • cognitive_stability: f32 (0.0-1.0)                              │
│  • sync_quality: f32 (0.0-1.0)                                     │
│  • hash_integrity_ok: bool                                         │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    2. RULE EVALUATION                               │
│                                                                     │
│  evaluate_rules() → Vec<AdaptiveAction>                            │
│  ├─> Get latest sample                                             │
│  ├─> Sort rules by priority (DESC)                                 │
│  ├─> For each rule:                                                │
│  │   ├─> rule.evaluate(sample) → bool                              │
│  │   ├─> If true: add action to list, increment execution_count    │
│  │   └─> Log rule triggered                                        │
│  └─> Return Vec<AdaptiveAction>                                    │
│                                                                     │
│  5 Default Rules:                                                  │
│  1. LatencyAI > 5000ms → ReduceAIComplexity (priority 10)          │
│  2. CognitiveStability < 0.5 → TriggerDeepSync (priority 20)       │
│  3. FPS < 40 → SimplifyUITransitions (priority 5)                  │
│  4. SyncQuality < 0.7 → ReanchorTimeline (priority 15)             │
│  5. HashIntegrityFailed → SwitchToStableMode (priority 30)         │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    3. LEARNING CYCLE                                │
│                                                                     │
│  learn()                                                            │
│  ├─> Check history size (min 10 samples)                           │
│  ├─> Analyze last 100 samples (averages)                           │
│  ├─> Detect patterns:                                              │
│  │   • avg_cpu > 0.8 → "High CPU usage pattern"                    │
│  │   • avg_latency > 3000 → "High AI latency pattern"              │
│  │   • avg_stability < 0.7 → "Low cognitive stability pattern"     │
│  ├─> Update learning_state:                                        │
│  │   • patterns_detected: Vec<String>                              │
│  │   • optimization_cycles++                                       │
│  │   • last_learn_timestamp (ISO 8601)                             │
│  ├─> If auto_learn enabled:                                        │
│  │   └─> adjust_preferences_from_patterns()                        │
│  └─> Log learning cycle complete                                   │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    4. PREFERENCE ADJUSTMENT                         │
│                                                                     │
│  adjust_preferences_from_patterns()                                │
│  ├─> If "High CPU" detected:                                       │
│  │   └─> optimization_bias → LowPower                              │
│  ├─> If "High AI latency" detected:                                │
│  │   └─> ai_style → Fast                                           │
│  ├─> If "Low cognitive stability" detected:                        │
│  │   └─> system_mode → Conservative                                │
│  └─> Log preference adjustments                                    │
│                                                                     │
│  PreferenceProfile:                                                │
│  • ai_style: Concise | Balanced | Detailed | Fast                  │
│  • system_mode: Adaptive | Conservative | Aggressive               │
│  • optimization_bias: Balanced | Speed | Precision | LowPower      │
│  • auto_learn: bool                                                │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    5. SUMMARY GENERATION                            │
│                                                                     │
│  get_summary() → AdaptiveSummary                                   │
│  ├─> total_samples                                                 │
│  ├─> patterns_detected (last learning cycle)                       │
│  ├─> optimization_cycles                                           │
│  ├─> last_learn_timestamp                                          │
│  ├─> learning_rate (0.1)                                           │
│  ├─> preference_profile (current)                                  │
│  ├─> active_rules_count                                            │
│  └─> most_triggered_rule (rule with max execution_count)           │
└─────────────────────────────────────────────────────────────────────┘

LEARNING WORKFLOW:

1. Observe System (capture_sample) ───────> History (1000 samples max)
2. Evaluate Rules (every cycle) ──────────> Actions (if conditions met)
3. Learn Patterns (periodic, e.g., hourly) → Patterns (3+ types)
4. Adjust Preferences (if auto_learn) ────> Profile (optimized)
5. Re-evaluate Rules (next cycle) ────────> Loop
```

---

## 🔧 API REFERENCE

### AdaptiveOptimizationEngine

**Constructor:**
```rust
pub fn new() -> Self

// Creates engine with:
// • Empty performance_history
// • 5 default optimization_rules
// • Default learning_state
// • Default preference_profile
// • max_history_size: 1000
```

**Methods:**

```rust
// Load default adaptive rules
fn load_default_rules(&mut self)

// Capture performance sample
pub fn capture_sample(&mut self, sample: SystemPerformanceSample)

// Evaluate rules and return actions to execute
pub fn evaluate_rules(&mut self) -> Vec<AdaptiveAction>

// Internal learning (pattern detection + preference adjustment)
pub fn learn(&mut self)

// Adjust preferences based on detected patterns
fn adjust_preferences_from_patterns(&mut self)

// Generate adaptive summary
pub fn get_summary(&self) -> AdaptiveSummary
```

### Data Structures

**SystemPerformanceSample:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemPerformanceSample {
    pub timestamp: String,             // ISO 8601 (e.g., "2025-12-15T14:30:00Z")
    pub cpu_load: f32,                 // 0.0-1.0 (0% - 100%)
    pub latency_ai: u128,              // AI response latency (ms)
    pub fps: u32,                      // Frames per second
    pub cognitive_stability: f32,      // 0.0-1.0 (Singularity coherence)
    pub sync_quality: f32,             // 0.0-1.0 (Timeline sync)
    pub hash_integrity_ok: bool,       // Hash validation status
}
```

**AdaptiveRule:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdaptiveRule {
    pub id: String,
    pub name: String,
    pub condition: AdaptiveCondition,
    pub action: AdaptiveAction,
    pub enabled: bool,
    pub priority: u32,                 // Higher = executed first
    pub execution_count: u64,
}

impl AdaptiveRule {
    // Evaluate if condition matches sample
    pub fn evaluate(&self, sample: &SystemPerformanceSample) -> bool
}
```

**AdaptiveCondition:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AdaptiveCondition {
    LatencyAIAbove(u128),              // AI latency > threshold (ms)
    CognitiveStabilityBelow(f32),      // Cognitive stability < threshold
    FpsBelow(u32),                     // FPS < threshold
    SyncQualityBelow(f32),             // Sync quality < threshold
    HashIntegrityFailed,               // Hash validation failed
    CpuLoadAbove(f32),                 // CPU load > threshold
}
```

**AdaptiveAction:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AdaptiveAction {
    ReduceAIComplexity,                // Reduce AI model complexity
    TriggerDeepSync,                   // Force deep Singularity sync
    SimplifyUITransitions,             // Reduce animation complexity
    ReanchorTimeline,                  // Recalibrate temporal sync
    SwitchToStableMode,                // Activate conservative mode
    OptimizeMemory,                    // Trigger memory cleanup
    AdjustFPSTarget,                   // Lower FPS target
    RecalibrateEmbeddings,             // Rebuild vector embeddings
}
```

**PreferenceProfile:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PreferenceProfile {
    pub ai_style: AiPreference,
    pub system_mode: SystemBehaviorMode,
    pub optimization_bias: OptimizationBias,
    pub auto_learn: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AiPreference {
    Concise,      // Short responses, lower latency
    Balanced,     // Default (quality + speed)
    Detailed,     // Comprehensive responses, higher latency
    Fast,         // Minimal latency, simple responses
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SystemBehaviorMode {
    Adaptive,     // Auto-adjust based on patterns
    Conservative, // Prioritize stability
    Aggressive,   // Prioritize performance
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OptimizationBias {
    Balanced,     // Equal weight (quality + speed + power)
    Speed,        // Prioritize low latency
    Precision,    // Prioritize quality
    LowPower,     // Prioritize battery life
}
```

**LearningState:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LearningState {
    pub total_samples: usize,
    pub patterns_detected: Vec<String>,
    pub optimization_cycles: u32,
    pub last_learn_timestamp: String,
    pub learning_rate: f32,            // Default 0.1
}
```

**AdaptiveSummary:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdaptiveSummary {
    pub total_samples: usize,
    pub patterns_detected: Vec<String>,
    pub optimization_cycles: u32,
    pub last_learn_timestamp: String,
    pub learning_rate: f32,
    pub preference_profile: PreferenceProfile,
    pub active_rules_count: usize,
    pub most_triggered_rule: Option<String>,
}
```

---

## 🧩 SUB-MODULES

### Tauri Commands (adaptive_commands.rs)

**Global State:**
```rust
pub struct AdaptiveEngineGlobal(pub Mutex<AdaptiveOptimizationEngine>);
```

**Tauri Commands:**

```rust
#[tauri::command]
pub async fn adaptive_capture_sample(
    sample: SystemPerformanceSample,
    state: State<'_, AdaptiveEngineGlobal>,
) -> Result<(), String>

#[tauri::command]
pub async fn adaptive_evaluate(
    state: State<'_, AdaptiveEngineGlobal>,
) -> Result<Vec<AdaptiveAction>, String>

#[tauri::command]
pub async fn adaptive_learn(
    state: State<'_, AdaptiveEngineGlobal>,
) -> Result<(), String>

#[tauri::command]
pub async fn adaptive_get_summary(
    state: State<'_, AdaptiveEngineGlobal>,
) -> Result<AdaptiveSummary, String>

#[tauri::command]
pub async fn adaptive_update_preferences(
    profile: PreferenceProfile,
    state: State<'_, AdaptiveEngineGlobal>,
) -> Result<(), String>
```

---

## 📊 DEFAULT RULES

### Rule 1: High AI Latency

**Condition:** `latency_ai > 5000ms`

**Action:** `ReduceAIComplexity`

**Priority:** 10

**Description:** When AI response takes >5s, reduce model complexity (switch to faster provider, reduce context window, disable verbose mode)

### Rule 2: Low Cognitive Stability

**Condition:** `cognitive_stability < 0.5`

**Action:** `TriggerDeepSync`

**Priority:** 20

**Description:** When Singularity coherence drops below 50%, force deep sync to restore cognitive alignment

### Rule 3: Low FPS

**Condition:** `fps < 40`

**Action:** `SimplifyUITransitions`

**Priority:** 5

**Description:** When FPS drops below 40, reduce animation complexity (disable transitions, lower quality, skip frames)

### Rule 4: Low Sync Quality

**Condition:** `sync_quality < 0.7`

**Action:** `ReanchorTimeline`

**Priority:** 15

**Description:** When temporal sync quality drops below 70%, recalibrate timeline synchronization

### Rule 5: Hash Integrity Failed

**Condition:** `hash_integrity_ok == false`

**Action:** `SwitchToStableMode`

**Priority:** 30 (Highest)

**Description:** When hash validation fails, immediately switch to conservative stable mode for data integrity

---

## 🧪 TESTING

### Unit Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_adaptive_engine_new() {
        let engine = AdaptiveOptimizationEngine::new();
        assert_eq!(engine.optimization_rules.len(), 5);
        assert_eq!(engine.max_history_size, 1000);
        assert!(engine.preference_profile.auto_learn);
    }

    #[test]
    fn test_capture_sample() {
        let mut engine = AdaptiveOptimizationEngine::new();
        
        let sample = SystemPerformanceSample {
            timestamp: chrono::Utc::now().to_rfc3339(),
            cpu_load: 0.5,
            latency_ai: 1000,
            fps: 60,
            cognitive_stability: 0.9,
            sync_quality: 0.95,
            hash_integrity_ok: true,
        };
        
        engine.capture_sample(sample.clone());
        
        assert_eq!(engine.performance_history.len(), 1);
        assert_eq!(engine.learning_state.total_samples, 1);
    }

    #[test]
    fn test_rule_evaluation_latency_high() {
        let mut engine = AdaptiveOptimizationEngine::new();
        
        let sample = SystemPerformanceSample {
            timestamp: chrono::Utc::now().to_rfc3339(),
            cpu_load: 0.4,
            latency_ai: 6000, // > 5000 threshold
            fps: 60,
            cognitive_stability: 0.9,
            sync_quality: 0.95,
            hash_integrity_ok: true,
        };
        
        engine.capture_sample(sample);
        let actions = engine.evaluate_rules();
        
        assert!(actions.contains(&AdaptiveAction::ReduceAIComplexity));
    }

    #[test]
    fn test_learning_cycle() {
        let mut engine = AdaptiveOptimizationEngine::new();
        
        // Add 20 samples with high CPU
        for _ in 0..20 {
            let sample = SystemPerformanceSample {
                timestamp: chrono::Utc::now().to_rfc3339(),
                cpu_load: 0.85, // High CPU
                latency_ai: 1000,
                fps: 60,
                cognitive_stability: 0.9,
                sync_quality: 0.95,
                hash_integrity_ok: true,
            };
            engine.capture_sample(sample);
        }
        
        engine.learn();
        
        assert!(engine.learning_state.patterns_detected.iter()
            .any(|p| p.contains("High CPU")));
        assert_eq!(engine.learning_state.optimization_cycles, 1);
    }

    #[test]
    fn test_preference_adjustment() {
        let mut engine = AdaptiveOptimizationEngine::new();
        
        // Simulate high CPU pattern
        for _ in 0..100 {
            let sample = SystemPerformanceSample {
                timestamp: chrono::Utc::now().to_rfc3339(),
                cpu_load: 0.9,
                latency_ai: 1000,
                fps: 60,
                cognitive_stability: 0.9,
                sync_quality: 0.95,
                hash_integrity_ok: true,
            };
            engine.capture_sample(sample);
        }
        
        engine.learn();
        
        // Should adjust to LowPower bias
        assert!(matches!(
            engine.preference_profile.optimization_bias,
            OptimizationBias::LowPower
        ));
    }
}
```

---

## ⚡ PERFORMANCE

### Overhead

**Sample Capture:** <1ms (Vec push, increment counter)

**Rule Evaluation:** 1-3ms (5 rules, simple condition checks)

**Learning Cycle:** 5-15ms (pattern detection, preference adjustment)

**Total Impact:** Negligible (<0.1% CPU overhead)

### Memory Usage

**Per Sample:** ~100 bytes (struct with 7 fields)

**History (1000 samples):** ~100KB

**Engine Total:** ~150KB (history + rules + state)

---

## 🔗 INTEGRATIONS

### Performance Engine

**Integration Point:** Feed performance samples

```rust
// Performance Engine collects metrics
let sample = SystemPerformanceSample {
    timestamp: chrono::Utc::now().to_rfc3339(),
    cpu_load: metrics.system.cpu / 100.0,
    latency_ai: metrics.ai.latency as u128,
    fps: metrics.react.fps,
    cognitive_stability: singularity.coherence_score,
    sync_quality: singularity.sync_quality,
    hash_integrity_ok: true,
};

// Send to Adaptive Engine
adaptive_engine.capture_sample(sample).await?;
```

### Singularity

**Integration Point:** Cognitive stability + sync quality

```rust
// Singularity provides cognitive metrics
impl SingularityState {
    pub fn get_adaptive_metrics(&self) -> (f32, f32) {
        let stability = self.compute_coherence_score();
        let sync_quality = self.timeline_sync_quality();
        (stability, sync_quality)
    }
}
```

### Self-Healing Engine

**Integration Point:** Execute adaptive actions

```rust
// Adaptive Engine triggers action
let actions = adaptive_engine.evaluate_rules();

for action in actions {
    match action {
        AdaptiveAction::TriggerDeepSync => {
            self_healing.execute_repair("singularity_deep_sync").await?;
        }
        AdaptiveAction::SimplifyUITransitions => {
            self_healing.execute_repair("reduce_ui_complexity").await?;
        }
        // ... other actions
    }
}
```

---

## 📚 CODE EXAMPLES

### Example 1: Basic Usage

```rust
use crate::adaptive::{AdaptiveOptimizationEngine, SystemPerformanceSample};

#[tokio::main]
async fn main() {
    let mut engine = AdaptiveOptimizationEngine::new();
    
    // Capture samples periodically
    loop {
        let sample = SystemPerformanceSample {
            timestamp: chrono::Utc::now().to_rfc3339(),
            cpu_load: get_cpu_usage(),
            latency_ai: get_ai_latency(),
            fps: get_fps(),
            cognitive_stability: get_cognitive_stability(),
            sync_quality: get_sync_quality(),
            hash_integrity_ok: verify_hash_integrity(),
        };
        
        engine.capture_sample(sample);
        
        // Evaluate rules every cycle
        let actions = engine.evaluate_rules();
        
        for action in actions {
            println!("Executing adaptive action: {:?}", action);
            execute_action(action).await;
        }
        
        // Learn every hour
        if should_learn() {
            engine.learn();
            let summary = engine.get_summary();
            println!("Learning cycle: {} patterns detected", summary.patterns_detected.len());
        }
        
        tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
    }
}
```

### Example 2: Tauri Frontend Integration

```typescript
import { invoke } from '@tauri-apps/api/core';

// Capture performance sample from frontend
async function reportPerformance() {
  const sample = {
    timestamp: new Date().toISOString(),
    cpu_load: await getCPULoad(),
    latency_ai: aiLatencyMs,
    fps: currentFPS,
    cognitive_stability: singularityCoherence,
    sync_quality: timelineSyncQuality,
    hash_integrity_ok: true,
  };
  
  await invoke('adaptive_capture_sample', { sample });
}

// Trigger learning cycle
async function triggerLearning() {
  await invoke('adaptive_learn');
  
  const summary = await invoke('adaptive_get_summary');
  console.log('Adaptive summary:', summary);
  console.log('Patterns detected:', summary.patterns_detected);
}

// Get and apply adaptive actions
async function applyAdaptiveOptimizations() {
  const actions = await invoke('adaptive_evaluate');
  
  for (const action of actions) {
    switch (action) {
      case 'ReduceAIComplexity':
        await reduceAIComplexity();
        break;
      case 'SimplifyUITransitions':
        disableAnimations();
        break;
      // ... handle other actions
    }
  }
}
```

### Example 3: Custom Preferences

```rust
use crate::adaptive::{PreferenceProfile, AiPreference, SystemBehaviorMode, OptimizationBias};

// Create custom preference profile
let custom_profile = PreferenceProfile {
    ai_style: AiPreference::Fast,
    system_mode: SystemBehaviorMode::Aggressive,
    optimization_bias: OptimizationBias::Speed,
    auto_learn: true,
};

// Update engine preferences
engine.preference_profile = custom_profile;

// Or via Tauri command
await invoke('adaptive_update_preferences', {
  profile: {
    ai_style: 'Fast',
    system_mode: 'Aggressive',
    optimization_bias: 'Speed',
    auto_learn: true,
  }
});
```

---

## 🎯 CROSS-REFERENCES

### Related Modules

- [PERFORMANCE_ENGINE.md](PERFORMANCE_ENGINE.md) — Metrics collection
- [SELF_HEALING_ENGINE.md](SELF_HEALING_ENGINE.md) — Action execution
- [SINGULARITY.md](SINGULARITY.md) — Cognitive metrics source
- [SYSTEM_HEALTH_ENGINE.md](SYSTEM_HEALTH_ENGINE.md) — Health coordination

### Related Documentation

- [ARCHITECTURE_CURRENT_v24.md](../../00_meta/ARCHITECTURE_CURRENT_v24.md) — System architecture
- [TAURI_COMMANDS_REFERENCE.md](../../02_architecture_reality/TAURI_COMMANDS_REFERENCE.md) — Adaptive commands API

---

## 📌 NOTES

**Design Decisions:**

1. **Why Rust Backend?** — Low overhead, thread-safe, type-safe pattern matching
2. **Why Simple Rules?** — Easy to understand, debug, extend (vs complex ML models)
3. **Why Learning Rate 0.1?** — Gradual adaptation, avoid oscillation
4. **Why 1000 Sample History?** — Balance memory usage vs pattern detection accuracy

**Future Improvements:**

- **Neural Network Integration** — Replace simple averaging with LSTM/GRU for better prediction
- **Multi-Objective Optimization** — Pareto frontier (speed vs quality vs power)
- **User Feedback Loop** — Explicit user preferences override automatic learning
- **A/B Testing** — Test multiple optimization strategies, keep best
- **Cross-Session Learning** — Persist learned patterns across app restarts

**Known Limitations:**

- **Cold Start**: Requires 10+ samples for first learning cycle
- **Pattern Simplicity**: Only 3 basic patterns detected (CPU, latency, stability)
- **No Rollback**: Once preferences adjusted, no automatic revert if ineffective
- **No User Override**: Auto-learning can conflict with user preferences

---

**Documentation généré:** 15 décembre 2025  
**Version:** v1.0.0  
**Maintainer:** TITANE∞ Documentation Evolution Engine vΩ

---

_Adaptive Engine — Continuous learning_ 🧠✨
