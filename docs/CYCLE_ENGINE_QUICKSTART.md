# 🚀 Cycle Engine — Quick Start Guide

**TITANE∞ v2.0 — Temporal Intelligence in 5 Minutes**

---

## 📦 Installation

Le Cycle Engine est **déjà intégré** dans TITANE∞. Aucune installation supplémentaire nécessaire.

---

## ⚡ Quick Start (Rust)

### 1. Import

```rust
use titane_infinity::cycle_engine::{CycleEngine, CycleEngineConfig};
use std::sync::Arc;
```

### 2. Initialisation Basique

```rust
// Configuration par défaut
let engine = CycleEngine::default();

// Démarrer
engine.start().await?;

// C'est tout ! Le Cycle Engine tourne maintenant 🎉
```

### 3. Configuration Personnalisée

```rust
let config = CycleEngineConfig {
    enabled: true,
    tick_interval_seconds: 60,  // Mise à jour chaque minute
    daily_cycle_enabled: true,
    weekly_cycle_enabled: true,
    monthly_cycle_enabled: true,
    seasonal_cycle_enabled: true,
    adaptive_load_enabled: true,
    predictive_enabled: true,
};

let engine = CycleEngine::new(config);
engine.start().await?;
```

---

## 📊 Utilisation de Base

### Obtenir l'État Actuel

```rust
// État cycle complet
let state = engine.current_state().await;
println!("Phase du jour: {:?}", state.daily_phase);
println!("Mode cognitif: {:?}", state.cognitive_mode);
println!("Jour: {:?}", state.weekly_phase);
println!("Saison: {:?}", state.seasonal_phase);

// Exemple output:
// Phase du jour: Noon
// Mode cognitif: Peak
// Jour: Wednesday
// Saison: Winter
```

### Obtenir le Rythme Cognitif

```rust
let rhythm = engine.current_rhythm().await;
println!("OMEGA depth: {}", rhythm.omega_depth);
println!("Analysis: {}", rhythm.analysis_intensity);
println!("Consolidation: {}", rhythm.memory_consolidation);

// Exemple output (mode Peak à Midi):
// OMEGA depth: 1.0
// Analysis: 1.0
// Consolidation: 0.5
```

### Obtenir les Paramètres de Charge

```rust
let load = engine.current_load_params().await;
println!("OMEGA intensity: {}", load.omega_intensity);
println!("Self-healing freq: {}", load.self_healing_frequency);
println!("Vector search k: {}", load.vector_search_k);
```

---

## 🔗 Intégrations

### Bridge Kernel OS

```rust
use titane_infinity::cycle_engine::KernelCycleBridge;

let kernel_bridge = KernelCycleBridge::new(Arc::new(engine));

// Ajustements scheduler
let scheduler = kernel_bridge.get_scheduler_adjustments().await;
println!("Priority multiplier: {}", scheduler.priority_multiplier);
println!("Max concurrent: {}", scheduler.max_concurrent_tasks);

// Limites ressources
let limits = kernel_bridge.get_resource_limits().await;
println!("Max CPU: {}%", limits.max_cpu_usage * 100.0);
println!("Max Memory: {} MB", limits.max_memory_mb);
```

### Bridge OMEGA Pipeline

```rust
use titane_infinity::cycle_engine::OmegaCycleBridge;

let omega_bridge = OmegaCycleBridge::new(Arc::new(engine));

// Ajustements OMEGA
let omega = omega_bridge.get_omega_adjustments().await;
println!("Depth: {}", omega.depth_multiplier);
println!("Reflection: {}", omega.reflection_enabled);
println!("Parallel: {}", omega.parallel_execution);
println!("Context window: {}", omega.context_window_size);

// Router
let router = omega_bridge.get_router_adjustments().await;
println!("Creativity: {}", router.creativity_weight);
```

### Bridge Memory OS

```rust
use titane_infinity::cycle_engine::MemoryCycleBridge;

let memory_bridge = MemoryCycleBridge::new(Arc::new(engine));

// Ajustements mémoire
let memory = memory_bridge.get_memory_adjustments().await;
println!("Consolidation: {}", memory.consolidation_intensity);
println!("STM→LTM threshold: {}", memory.stm_to_ltm_threshold);
println!("Purge STM: {}", memory.purge_stm);

// Moment optimal consolidation ?
if memory_bridge.is_consolidation_time().await {
    println!("🌙 C'est le moment idéal pour consolider la mémoire");
}
```

---

## 🔮 Prédictions

```rust
let predictions = engine.get_predictions().await;

for pred in predictions {
    let time_in_hours = (pred.predicted_time - chrono::Local::now().timestamp()) / 3600;
    println!("Dans {}h: {}", time_in_hours, pred.suggested_action);
    println!("  Confiance: {}%", pred.confidence * 100.0);
}

// Exemple output:
// Dans 3h: Prepare for Dusk mode
//   Confiance: 95%
// Dans 5h: Start memory consolidation
//   Confiance: 95%
```

---

## 📈 Diagnostics

```rust
let diag = engine.diagnostics().await;

println!("=== CYCLE ENGINE DIAGNOSTICS ===");
println!("Status: {}", if diag.enabled { "🟢 Running" } else { "🔴 Stopped" });
println!("Uptime: {}s", diag.uptime_seconds);
println!("Current phase: {:?}", diag.current_cycle.daily_phase);
println!("OMEGA intensity: {:.2}", diag.omega_intensity);
println!("Self-healing: {:.2}", diag.self_healing_frequency);
println!("Memory consolidation: {}", 
    if diag.memory_consolidation_active { "🟢 Active" } else { "⚪ Inactive" }
);
println!("Alignment score: {:.2}", diag.alignment_score);
```

---

## 🎯 Cas d'Usage Pratiques

### 1. Ajuster Traitement selon l'Heure

```rust
let rhythm = engine.current_rhythm().await;

if rhythm.omega_depth > 0.8 {
    // Mode haute performance (Matin/Midi)
    println!("⚡ Activating deep analysis");
    // Activer réflexion approfondie
} else {
    // Mode économie (Nuit/Aube)
    println!("💤 Light processing mode");
    // Traitement léger
}
```

### 2. Self-Healing Nocturne

```rust
let state = engine.current_state().await;

if matches!(state.daily_phase, cycles::DailyPhase::Night) {
    println!("🌙 Night mode: Intensive self-healing");
    // Lancer self-healing intensif
    // GC mémoire
    // Consolidation LTM
}
```

### 3. Optimisation Ressources

```rust
let load = engine.current_load_params().await;

// Ajuster profondeur recherche vectorielle
let search_results = vector_search(query, load.vector_search_k).await?;

// Ajuster fréquence GC
if load.memory_gc_frequency > 0.7 {
    run_gc().await?;
}
```

### 4. Suggestion Moment Optimal

```rust
use titane_infinity::cycle_engine::PredictiveTemporalModel;

let model = PredictiveTemporalModel::new();

let optimal_time = model.suggest_optimal_time("creative");
println!("Meilleur moment pour tâche créative: {:?}", optimal_time);
// Output: Some(Dawn)
```

---

## ⚙️ Configuration Avancée

### Désactiver Cycles Spécifiques

```rust
let config = CycleEngineConfig {
    enabled: true,
    tick_interval_seconds: 60,
    daily_cycle_enabled: true,
    weekly_cycle_enabled: false,    // Désactiver cycle hebdo
    monthly_cycle_enabled: false,   // Désactiver cycle mensuel
    seasonal_cycle_enabled: true,
    adaptive_load_enabled: true,
    predictive_enabled: true,
};
```

### Tick Plus Réactif

```rust
let config = CycleEngineConfig {
    tick_interval_seconds: 30,  // Mise à jour toutes les 30s
    ..Default::default()
};
```

### Mode Minimal (Économie Ressources)

```rust
let config = CycleEngineConfig {
    enabled: true,
    tick_interval_seconds: 120,  // 2 minutes
    daily_cycle_enabled: true,
    weekly_cycle_enabled: false,
    monthly_cycle_enabled: false,
    seasonal_cycle_enabled: false,
    adaptive_load_enabled: false,  // Pas de régulation adaptative
    predictive_enabled: false,     // Pas de prédictions
};
```

---

## 🛑 Arrêt

```rust
// Arrêt gracieux
engine.stop().await?;
```

---

## 📊 Monitoring en Temps Réel

```rust
use tokio::time::{interval, Duration};

// Loop monitoring
let mut monitor = interval(Duration::from_secs(60));

loop {
    monitor.tick().await;
    
    let state = engine.current_state().await;
    let rhythm = engine.current_rhythm().await;
    let diag = engine.diagnostics().await;
    
    println!("🌍 Phase: {:?} | Mode: {:?} | OMEGA: {:.2} | Alignment: {:.2}",
        state.daily_phase,
        state.cognitive_mode,
        rhythm.omega_depth,
        diag.alignment_score
    );
}
```

---

## 🔍 Debug & Troubleshooting

### Vérifier État

```rust
if !engine.is_running().await {
    println!("⚠️ Cycle Engine not running!");
    engine.start().await?;
}
```

### Logs

Le Cycle Engine émet des logs automatiquement :

```
🌍 Cycle Phase Change: Morning → Noon
⚡ Cycle Engine: Mode=Peak, Omega=1.00, SelfHealing=0.50, Alignment=0.95
🔮 Predictions: 3 upcoming events
```

### Config Actuelle

```rust
let config = engine.config().await;
println!("Config: {:#?}", config);
```

---

## 📚 Ressources

### Documentation Complète
- **`docs/TITANE_INFINITY_CYCLE_ENGINE.md`** — Documentation exhaustive
- **`docs/CYCLE_ENGINE_SCHEMA.md`** — Schémas architecturaux
- **`CYCLE_ENGINE_CHANGELOG.md`** — Changelog détaillé

### Tests
```bash
cd src-tauri
cargo test --test cycle_engine_tests
```

---

## 💡 Tips & Best Practices

### ✅ DO

- ✅ Démarrer le Cycle Engine au startup de l'app
- ✅ Utiliser les bridges pour intégrations
- ✅ Consulter diagnostics régulièrement
- ✅ Respecter les suggestions de cycle (ex: self-healing nocturne)
- ✅ Ajuster configuration selon usage

### ❌ DON'T

- ❌ Ne pas start/stop en boucle rapide
- ❌ Ne pas ignorer les prédictions
- ❌ Ne pas forcer haute performance hors peak
- ❌ Ne pas désactiver tous les cycles (min: daily)

---

## 🎉 Résumé

Avec le Cycle Engine, vous obtenez :

✅ **Adaptation automatique** selon l'heure/jour/saison  
✅ **Optimisations intelligentes** de performance  
✅ **Prédictions** temporelles  
✅ **Régulation** de charge  
✅ **Alignement système** continu  
✅ **Mémoire temporelle** des patterns  

**3 lignes pour démarrer :**

```rust
let engine = CycleEngine::default();
engine.start().await?;
// 🎉 TITANE∞ est maintenant temporellement vivant !
```

---

*Quick Start Guide — TITANE∞ Cycle Engine v2.0*  
*Pour plus d'infos : `docs/TITANE_INFINITY_CYCLE_ENGINE.md`*
