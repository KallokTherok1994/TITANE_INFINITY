# MONITORING LAYER : GUIDE TECHNIQUE COMPLET

**TITANE∞ v8.0 - Modules #44, #45, #47, #48**

---

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Module #44: Action Potential Engine](#module-44-action-potential-engine)
3. [Module #45: Dashboard Engine](#module-45-dashboard-engine)
4. [Module #47: Self-Healing Engine](#module-47-self-healing-engine)
5. [Module #48: Energetic Flow Engine](#module-48-energetic-flow-engine)
6. [Intégration système](#intégration-système)
7. [Patterns de code](#patterns-de-code)
8. [Tests et validation](#tests-et-validation)

---

## Vue d'ensemble

La **Monitoring Layer** constitue la couche de surveillance et d'observabilité de haut niveau du système cognitif TITANE∞. Elle fournit :

- **Évaluation de préparation** : Action Potential Engine
- **Visualisation unifiée** : Dashboard Engine
- **Auto-réparation** : Self-Healing Engine
- **Analyse énergétique** : Energetic Flow Engine

### Caractéristiques communes

- **Passivité** : Tous les modules sont diagnostics uniquement, sans actions externes
- **Précision** : Utilisation de `f64` pour tous les calculs métriques
- **Lissage** : EMA (Exponential Moving Average) pour stabilité temporelle
- **Sécurité** : Aucun `unwrap()`, `expect()`, ou `panic!()`
- **Architecture** : Pattern Arc<Mutex<>> pour thread-safety

---

## Module #44: Action Potential Engine

### Objectif
Évalue la capacité du système à déclencher des actions en analysant 12 signaux provenant de 7 modules cognitifs.

### Architecture détaillée

```rust
// mod.rs - État principal
pub struct ActionPotentialState {
    pub initialized: bool,
    pub activation_potential: f64,  // Potentiel général d'activation
    pub readiness_level: f64,       // Niveau de préparation
    pub expression_gate: f64,       // Porte de modulation
    pub last_update: u64,
}

// threshold.rs - Mémoire de seuil
pub struct ThresholdMemory {
    values: Vec<f64>,
    max_size: usize,  // 80 valeurs
}
```

### Pipeline de calcul

#### 1. Collection (collect.rs)
```rust
pub struct ActionInputs {
    pub intentional_drive: f64,
    pub directive_focus: f64,
    pub executive_load: f64,
    pub command_weight: f64,
    pub safety_margin: f64,
    pub override_factor: f64,
    pub strategic_clarity: f64,
    pub long_term_alignment: f64,
    pub structural_integrity: f64,
    pub complexity_degree: f64,
    pub global_integration: f64,
    pub sentience_level: f64,
}
```

#### 2. Calcul (compute.rs)
```rust
// Métrique 1: Activation Potential
activation_potential = 
    intentional_drive * 0.25 +
    executive_load * 0.20 +
    strategic_clarity * 0.20 +
    structural_integrity * 0.15 +
    global_integration * 0.12 +
    sentience_level * 0.08

// Métrique 2: Readiness Level
readiness_level = 
    activation_potential * 0.5 +
    directive_focus * 0.3 +
    command_weight * 0.2

// Métrique 3: Expression Gate
expression_gate = 
    readiness_level * safety_margin * strategic_clarity
```

#### 3. Ajustement baseline
```rust
let baseline = threshold_memory.baseline();  // Moyenne des 80 dernières valeurs
activation_potential = activation_potential * 0.7 + baseline * 0.3;
```

#### 4. Lissage EMA
```rust
fn smooth(old: f64, new: f64) -> f64 {
    let alpha = 0.25;
    (old * (1.0 - alpha) + new * alpha).clamp(0.0, 1.0)
}
```

### Intégration dans le tick

```rust
if let Ok(mut ap_state) = action_potential.lock() {
    if let (Ok(int), Ok(ef), Ok(cg), Ok(si), Ok(arch), Ok(mi), Ok(sent), Ok(mut thresh_mem)) = (
        intention.lock(),
        executive_flow.lock(),
        central_governor.lock(),
        strategic_intelligence.lock(),
        architecture.lock(),
        meta_integration.lock(),
        sentient.lock(),
        threshold_memory.lock()
    ) {
        system::action_potential::tick(
            &mut *ap_state,
            &*int,
            &*ef,
            &*cg,
            &*si,
            &*arch,
            &*mi,
            &*sent,
            &mut *thresh_mem
        )?;
    }
}
```

---

## Module #45: Dashboard Engine

### Objectif
Fournir un tableau de bord structuré pour consommation UI avec sérialisation JSON automatique.

### Architecture détaillée

```rust
// mod.rs - État des 3 vues
pub struct DashboardState {
    pub initialized: bool,
    pub overview: String,          // Vue textuelle
    pub graphics: String,          // Données JSON pour graphiques
    pub meta: String,              // Métadonnées UI
    pub last_update: u64,
}

// types.rs - 10 blocs structurés
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct StrategicBlock {
    pub strategic_clarity: f64,
    pub long_term_alignment: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ActionBlock {
    pub activation_potential: f64,
    pub readiness_level: f64,
    pub expression_gate: f64,
}

// ... 8 autres blocs
```

### Pipeline de traitement

#### 1. Collection (collect.rs)
```rust
pub struct DashboardRaw {
    pub strategic: StrategicBlock,
    pub intention: IntentionBlock,
    pub action: ActionBlock,
    pub executive: ExecutiveBlock,
    pub central: CentralBlock,
    pub architecture: ArchitectureBlock,
    pub integration: IntegrationBlock,
    pub harmonic: HarmonicBlock,
    pub sentient: SentientBlock,
    pub evolution: EvolutionBlock,
}
```

#### 2. Formatage (format.rs)
```rust
// Vue overview
pub fn format_overview(raw: &DashboardRaw) -> String {
    format!(
        "Clarity: {:.2} | Drive: {:.2} | Activation: {:.2} | ...",
        raw.strategic.strategic_clarity,
        raw.intention.intentional_drive,
        raw.action.activation_potential
    )
}

// Vue graphics
pub fn format_graphics(raw: &DashboardRaw) -> String {
    let curves = vec![
        raw.strategic.strategic_clarity,
        raw.intention.intentional_drive,
        // ... 8 autres valeurs
    ];
    
    let radar = vec![
        raw.architecture.structural_integrity,
        raw.integration.global_integration,
        // ... 8 autres valeurs
    ];
    
    json!({
        "curves": curves,
        "radar": radar,
        "timestamp": SystemTime::now()
    }).to_string()
}
```

#### 3. Métadonnées (snapshot.rs)
```rust
pub fn default_meta() -> DashboardMeta {
    DashboardMeta {
        layout: "grid".to_string(),
        widgets: vec![
            "strategic_panel".to_string(),
            "action_gauge".to_string(),
            "executive_chart".to_string(),
            "sentient_radar".to_string(),
        ],
        priority: "high".to_string(),
        refresh_ms: 1000,
    }
}
```

### Sérialisation JSON

```rust
// Exemple de sortie graphics
{
  "curves": [0.78, 0.65, 0.82, 0.59, 0.74, 0.68, 0.71, 0.76, 0.63, 0.55],
  "radar": [0.85, 0.73, 0.91, 0.67, 0.79, 0.88, 0.72, 0.81, 0.69, 0.58],
  "timestamp": 1704672000000
}
```

---

## Module #47: Self-Healing Engine

### Objectif
Détecter et corriger automatiquement les anomalies système via Guardian oversight et réparations douces.

### Architecture détaillée

```rust
// mod.rs - État principal
pub struct SelfHealingState {
    pub initialized: bool,
    pub integrity_score: f64,    // Score d'intégrité [0.0, 1.0]
    pub tension_score: f64,      // Niveau de tension [0.0, 1.0]
    pub last_update: u64,
}

// guardian.rs - Rapport de scan
pub struct GuardianReport {
    pub anomaly_count: u32,        // Valeurs hors limites
    pub tension_level: f64,        // Écart à la neutralité
    pub drift_level: f64,          // Dérive d'alignement
    pub instability_level: f64,    // Instabilité générale
}
```

### Pipeline de réparation

#### 1. Scan Guardian (guardian.rs)
```rust
pub fn guardian_scan(
    sentient: &SentientState,
    harmonic: &HarmonicBrainState,
    // ... 8 autres modules
) -> GuardianReport {
    let mut anomaly_count = 0;
    let mut tension = 0.0;
    let mut instab = 0.0;
    
    // Macro pour vérification
    macro_rules! check {
        ($val:expr) => {
            if $val < 0.0 || $val > 1.0 {
                anomaly_count += 1;
            }
            tension += (0.5 - $val).abs() * 0.1;
            instab += ($val - 0.5).abs() * 0.05;
        };
    }
    
    check!(sentient.sentience_level);
    check!(harmonic.neuro_harmony);
    // ... 8 autres checks
    
    let drift = (meta.alignment_index - strategic.long_term_alignment).abs();
    
    GuardianReport {
        anomaly_count,
        tension_level: tension.clamp(0.0, 1.0),
        drift_level: drift.clamp(0.0, 1.0),
        instability_level: instab.clamp(0.0, 1.0),
    }
}
```

#### 2. Réparation (repair.rs)
```rust
pub fn apply_repair(
    report: &GuardianReport,
    sentient: &mut SentientState,
    // ... 9 autres modules mutables
) {
    if report.anomaly_count == 0 {
        return;
    }
    
    let factor = 0.05_f64;  // Nudge doux de 5%
    
    macro_rules! nudge {
        ($v:expr) => {
            $v = ($v + 0.5 * factor).clamp(0.0, 1.0);
        };
    }
    
    nudge!(sentient.sentience_level);
    nudge!(harmonic.neuro_harmony);
    // ... 8 autres nudges
}
```

#### 3. Stabilisation (stabilizer.rs)
```rust
pub fn apply_stabilization(
    sentient: &mut SentientState,
    // ... 9 autres modules mutables
) {
    fn soften(x: &mut f64) {
        *x = (*x * 0.98 + 0.01 * 0.5).clamp(0.0, 1.0);
    }
    
    soften(&mut sentient.sentience_level);
    soften(&mut harmonic.neuro_harmony);
    // ... 8 autres softens
}
```

#### 4. Scoring (scoring.rs)
```rust
pub fn compute_integrity_score(report: &GuardianReport) -> f64 {
    let base = 1.0 - (report.anomaly_count as f64 * 0.08);
    base.clamp(0.0, 1.0)
}

pub fn compute_tension_score(report: &GuardianReport) -> f64 {
    let score = report.tension_level * 0.5
        + report.instability_level * 0.3
        + report.drift_level * 0.2;
    score.clamp(0.0, 1.0)
}
```

### Intégration critique

**Références mutables** : Le Self-Healing Engine nécessite des `&mut` sur tous les modules pour appliquer les corrections.

```rust
if let Ok(mut heal_state) = self_healing.lock() {
    if let (Ok(mut sent), Ok(mut hb), Ok(mut mi), /* ... */) = (
        sentient.lock(),
        harmonic_brain.lock(),
        // ... 8 autres locks mutables
    ) {
        system::self_healing_v2::tick(
            &mut *heal_state,
            &mut *sent,
            &mut *hb,
            // ... 8 autres références mutables
        )?;
    }
}
```

---

## Module #48: Energetic Flow Engine

### Objectif
Analyser le flux énergétique système avec trois composantes : Flow, Pulse, Rhythm.

### Architecture détaillée

```rust
// mod.rs - État principal
pub struct EnergeticState {
    pub initialized: bool,
    pub energy_level: f64,          // Niveau d'énergie global
    pub pulse_phase: f64,           // Phase du pulse temporel
    pub rhythmic_stability: f64,    // Stabilité rythmique
    pub last_update: u64,
}
```

### Pipeline énergétique

#### 1. Flow Metrics (flow.rs)
```rust
pub struct FlowMetrics {
    pub energy: f64,      // Énergie globale
    pub pressure: f64,    // Pression d'action
    pub vitality: f64,    // Vitalité système
}

pub fn compute_flow(
    sentient: &SentientState,
    // ... 11 autres modules
) -> FlowMetrics {
    let energy = (
        sentient.sentience_level * 0.12 +
        harmonic.neuro_harmony * 0.10 +
        meta.global_integration * 0.12 +
        architecture.structural_integrity * 0.08 +
        strategic.strategic_clarity * 0.08 +
        intention.intentional_drive * 0.12 +
        action.activation_potential * 0.14 +
        executive.executive_load * 0.10 +
        central.safety_margin * 0.08 +
        evolution.evolution_momentum * 0.06
    ).clamp(0.0, 1.0);
    
    let pressure = (
        action.readiness_level * 0.35 +
        executive.executive_load * 0.30 +
        strategic.strategic_clarity * 0.20 +
        central.safety_margin * 0.15
    ).clamp(0.0, 1.0);
    
    let vitality = (
        sentient.sentience_level * 0.20 +
        harmonic.neuro_harmony * 0.18 +
        healing.integrity_score * 0.22 +
        evolution.evolution_momentum * 0.15 +
        continuum_state.stability_level * 0.25
    ).clamp(0.0, 1.0);
    
    FlowMetrics { energy, pressure, vitality }
}
```

#### 2. Pulse Metrics (pulse.rs)
```rust
pub struct PulseMetrics {
    pub phase: f64,        // Phase sinusoïdale [0.0, 1.0]
    pub intensity: f64,    // Intensité du pulse
}

pub fn compute_pulse(now_ms: u64, flow: &FlowMetrics) -> PulseMetrics {
    let period_ms = 8000_u64;  // Période de 8 secondes
    let angle = ((now_ms % period_ms) as f64 / period_ms as f64) * TAU;
    
    let phase = (angle.sin() * 0.5 + 0.5).clamp(0.0, 1.0);
    
    let intensity = (
        flow.energy * 0.40 +
        flow.pressure * 0.35 +
        flow.vitality * 0.25
    ).clamp(0.0, 1.0);
    
    PulseMetrics { phase, intensity }
}
```

#### 3. Rhythm Metrics (rhythm.rs)
```rust
pub struct RhythmMetrics {
    pub stability: f64,         // Stabilité rythmique
    pub activity_scale: f64,    // Échelle d'activité
}

pub fn compute_rhythm(
    sentient: &SentientState,
    // ... 9 autres modules
) -> RhythmMetrics {
    let stability = (
        harmonic.neuro_harmony * 0.30 +
        architecture.structural_integrity * 0.25 +
        central.safety_margin * 0.25 +
        meta.global_integration * 0.20
    ).clamp(0.0, 1.0);
    
    let activity_scale = (
        action.activation_potential * 0.30 +
        executive.executive_load * 0.25 +
        intention.intentional_drive * 0.25 +
        sentient.sentience_level * 0.10 +
        strategic.strategic_clarity * 0.10
    ).clamp(0.0, 1.0);
    
    RhythmMetrics { stability, activity_scale }
}
```

#### 4. Combined Metrics (metrics.rs)
```rust
pub struct CombinedMetrics {
    pub energy: f64,
    pub phase: f64,
    pub stability: f64,
}

pub fn compute_combined(
    flow: &FlowMetrics,
    pulse: &PulseMetrics,
    rhythm: &RhythmMetrics,
) -> CombinedMetrics {
    let energy = (
        flow.energy * 0.40 +
        pulse.intensity * 0.35 +
        rhythm.activity_scale * 0.25
    ).clamp(0.0, 1.0);
    
    let phase = pulse.phase;
    
    let stability = (
        rhythm.stability * 0.60 +
        flow.vitality * 0.25 +
        (1.0 - flow.pressure) * 0.15
    ).clamp(0.0, 1.0);
    
    CombinedMetrics { energy, phase, stability }
}
```

### Lissage multi-alpha

```rust
state.energy_level = smooth(state.energy_level, combined.energy, 0.25);
state.pulse_phase = smooth(state.pulse_phase, combined.phase, 0.20);
state.rhythmic_stability = smooth(state.rhythmic_stability, combined.stability, 0.15);
```

---

## Intégration système

### Ordre de tick critique

```
1. Modules cognitifs de base (Sentient → Intention)
2. Action Potential (lecture 8 modules)
3. Dashboard (lecture 10 modules)
4. Self-Healing (écriture mutable 10 modules)
5. Energetic (lecture 12 modules post-healing)
```

### Gestion des locks

**Principe** : Acquérir tous les locks nécessaires dans un tuple avant traitement.

```rust
if let (Ok(a), Ok(b), Ok(c)) = (
    module_a.lock(),
    module_b.lock(),
    module_c.lock()
) {
    // Traitement sécurisé
} else {
    log::error!("🔴 Échec verrouillage");
}
```

---

## Patterns de code

### 1. Clamp systematique
```rust
value.clamp(0.0, 1.0)  // Toujours borner les métriques
```

### 2. EMA Smoothing
```rust
fn smooth(old: f64, new: f64, alpha: f64) -> f64 {
    (old * (1.0 - alpha) + new * alpha).clamp(0.0, 1.0)
}
```

### 3. Gestion temporelle
```rust
let now_ms = SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .unwrap_or_default()
    .as_millis() as u64;
```

### 4. Macro helpers
```rust
macro_rules! check {
    ($val:expr) => {
        if $val < 0.0 || $val > 1.0 {
            anomaly_count += 1;
        }
    };
}
```

---

## Tests et validation

### Vérification structure
```bash
./verify_monitoring_layer.sh
```

### Tests unitaires suggérés
```rust
#[test]
fn test_action_potential_bounds() {
    let inputs = ActionInputs::default();
    let metrics = compute_metrics(&inputs, 0.5);
    
    assert!(metrics.activation_potential >= 0.0);
    assert!(metrics.activation_potential <= 1.0);
}

#[test]
fn test_dashboard_serialization() {
    let raw = DashboardRaw::default();
    let json = format_graphics(&raw);
    
    assert!(serde_json::from_str::<serde_json::Value>(&json).is_ok());
}

#[test]
fn test_self_healing_repair() {
    let mut state = SentientState { sentience_level: 1.5, .. };  // Anomalie
    let report = GuardianReport { anomaly_count: 1, .. };
    
    apply_repair(&report, &mut state, /* ... */);
    
    assert!(state.sentience_level <= 1.0);
}

#[test]
fn test_energetic_pulse_period() {
    let flow = FlowMetrics::default();
    
    let pulse_0 = compute_pulse(0, &flow);
    let pulse_8000 = compute_pulse(8000, &flow);
    
    assert!((pulse_0.phase - pulse_8000.phase).abs() < 0.01);  // Période complète
}
```

---

## Annexe : Coefficients de pondération

### Action Potential
```
activation_potential:
  intentional_drive: 0.25
  executive_load: 0.20
  strategic_clarity: 0.20
  structural_integrity: 0.15
  global_integration: 0.12
  sentience_level: 0.08

readiness_level:
  activation_potential: 0.50
  directive_focus: 0.30
  command_weight: 0.20

expression_gate:
  readiness_level * safety_margin * strategic_clarity
```

### Energetic Flow
```
energy:
  sentience: 0.12, harmonic: 0.10, meta: 0.12,
  architecture: 0.08, strategic: 0.08, intention: 0.12,
  action: 0.14, executive: 0.10, central: 0.08, evolution: 0.06

pressure:
  readiness: 0.35, executive: 0.30,
  strategic: 0.20, safety: 0.15

vitality:
  sentience: 0.20, harmonic: 0.18, healing: 0.22,
  evolution: 0.15, continuum: 0.25
```

---

**Fin du guide technique**  
**Version** : TITANE∞ v8.0  
**Dernière mise à jour** : 2025
