# MAI v8.0 - Guide Technique Complet

## 📋 Table des matières

1. [Architecture détaillée](#architecture-détaillée)
2. [Formules mathématiques](#formules-mathématiques)
3. [API Reference](#api-reference)
4. [Patterns de code](#patterns-de-code)
5. [Troubleshooting](#troubleshooting)

## Architecture détaillée

### Composants principaux

#### 1. AdaptiveEngineModule (mod.rs)
```rust
pub struct AdaptiveEngineModule {
    pub initialized: bool,
    pub last_update: u64,
    pub adaptability: f32,      // Capacité d'adaptation [0.0, 1.0]
    pub predicted_load: f32,    // Charge prédite [0.0, 1.0]
    pub stability: f32,         // Stabilité système [0.0, 100.0]
    pub trend: f32,             // Tendance [-1.0, +1.0]
    state: AdaptiveState,       // État interne de régulation
    start_time: u64,            // Timestamp de démarrage
}
```

**Responsabilités** :
- Orchestration du cycle analyse → régulation
- Gestion du verrouillage des modules
- Mise à jour des métriques publiques
- Reporting de santé

#### 2. AdaptiveReport (analysis.rs)
```rust
pub struct AdaptiveReport {
    pub load: f32,           // Charge moyenne système
    pub pressure: f32,       // Variance des états
    pub harmony: f32,        // Cohésion inter-modules
    pub integrity: f32,      // Sécurité globale
    pub anomaly_risk: f32,   // Risque d'anomalie
    pub trend: f32,          // Tendance évolutive
}
```

**Responsabilités** :
- Snapshot multi-dimensionnel de l'état système
- Entrée pour le moteur de régulation
- Base pour les décisions adaptatives

#### 3. AdaptiveState (regulation.rs)
```rust
pub struct AdaptiveState {
    pub stability: f32,       // Stabilité [0.0, 100.0]
    pub adaptability: f32,    // Adaptabilité [0.0, 1.0]
    pub predicted_load: f32,  // Charge prédite [0.0, 1.0]
    pub trend: f32,           // Tendance [-1.0, +1.0]
    pub last_update: u64,     // Dernier timestamp
}
```

**Responsabilités** :
- État interne mutable du système
- Historique implicite via lissage exponentiel
- Prédiction des comportements futurs

## Formules mathématiques

### Analyse

#### Load (Charge moyenne)
```
load = Σ(health_score_i × weight_i) / Σ(weight_i)

où:
- health_score_i = score de santé du module i [0.0, 1.0]
- weight_i = poids du module i
  
Poids par défaut:
- helios:   1.0 (ressources)
- nexus:    1.0 (orchestration)
- harmonia: 1.0 (équilibre)
- sentinel: 1.5 (sécurité critique)
- watchdog: 1.0 (surveillance)
- memory:   1.2 (données critiques)
```

#### Pressure (Pression)
```
mean = Σ(health_score_i) / n
variance = Σ((health_score_i - mean)²) / n
pressure = √variance   (écart-type normalisé)

Plage: [0.0, 1.0]
- Faible pressure → états homogènes
- Haute pressure → états hétérogènes
```

#### Harmony (Harmonie)
```
mean = Σ(health_score_i) / n
deviation = Σ|health_score_i - mean| / n
harmony = 1.0 - deviation

Plage: [0.0, 1.0]
- harmony proche de 1.0 → modules synchronisés
- harmony proche de 0.0 → modules désynchronisés
```

#### Integrity (Intégrité)
```
integrity = sentinel_score × 0.7 + watchdog_score × 0.3

Pondération:
- Sentinel: 70% (sécurité active)
- Watchdog: 30% (surveillance passive)
```

#### Anomaly Risk (Risque d'anomalie)
```
anomaly_risk = Σ(risk_factor_i × weight_i)

risk_factor par status:
- Healthy:  0.0
- Degraded: 0.3 × weight
- Critical: 0.7 × weight
- Offline:  1.0 × weight

Normalisation: division par somme des poids
```

#### Trend (Tendance)
```
trend = (harmony - pressure + integrity - anomaly_risk) / 4.0

Plage: [-1.0, +1.0]
- trend > 0  → amélioration
- trend ≈ 0  → stabilité
- trend < 0  → dégradation
```

### Régulation

#### Stability (Stabilité)
```
stability = (100.0 - pressure × 100.0) × (1.0 + harmony) / 2.0
          = (100 - 100×pressure) × (1 + harmony) / 2

Plage: [0.0, 100.0]

Cas limites:
- pressure=0.0, harmony=1.0 → stability = 100%
- pressure=1.0, harmony=0.0 → stability = 0%
```

#### Adaptability (Lissage exponentiel)
```
new_adaptability = harmony
smoothed = old_adaptability × (1 - α) + new_adaptability × α

où α = 0.3 (facteur de lissage)

Effet: Moyenne mobile pondérée exponentiellement
```

#### Predicted Load (Lissage avec amortissement)
```
new_load = report.load
smoothed = old_load × 0.7 + new_load × 0.3
damped = dampen_oscillations(smoothed, 0.05)

dampen_oscillations(value, threshold):
    if |value| < threshold:
        return value × 0.5
    else:
        return value
```

#### Trend (Moyenne mobile amortie)
```
new_trend = report.trend
smoothed = old_trend × 0.8 + new_trend × 0.2
damped = dampen_oscillations(smoothed, 0.05)
constrained = clamp(damped, -1.0, 1.0)
```

### Contraintes numériques

```rust
fn clamp(value: f32, min: f32, max: f32) -> f32 {
    if value.is_nan() {
        return 0.0;  // Protection NaN
    }
    value.max(min).min(max)
}
```

## API Reference

### AdaptiveEngineModule

#### `init() -> TitaneResult<Self>`
```rust
pub fn init() -> TitaneResult<Self>
```
Initialise le module MAI avec valeurs par défaut.

**Returns** : `TitaneResult<AdaptiveEngineModule>`  
**Errors** : Aucune erreur normale

#### `start(&mut self) -> TitaneResult<()>`
```rust
pub fn start(&mut self) -> TitaneResult<()>
```
Démarre le module (appelle tick initial).

**Returns** : `Ok(())` si succès  
**Errors** : Propagation des erreurs de `tick()`

#### `tick(&mut self) -> TitaneResult<()>`
```rust
pub fn tick(&mut self) -> TitaneResult<()>
```
Tick simple (sans analyse). Met à jour timestamp uniquement.

**Returns** : `Ok(())`  
**Usage** : Pour maintenir l'état sans analyse complète

#### `tick_with_modules() -> TitaneResult<()>`
```rust
pub fn tick_with_modules(
    &mut self,
    helios: &Arc<Mutex<HeliosModule>>,
    nexus: &Arc<Mutex<NexusModule>>,
    harmonia: &Arc<Mutex<HarmoniaModule>>,
    sentinel: &Arc<Mutex<SentinelModule>>,
    watchdog: &Arc<Mutex<WatchdogModule>>,
    memory: &Arc<Mutex<MemoryModule>>,
) -> TitaneResult<()>
```
Tick complet avec analyse et régulation.

**Arguments** :
- `helios` : Module de gestion des ressources
- `nexus` : Module d'orchestration
- `harmonia` : Module d'équilibre
- `sentinel` : Module de sécurité
- `watchdog` : Module de surveillance
- `memory` : Module de stockage chiffré

**Returns** : `Ok(())` si succès  
**Errors** :
- Erreur de verrouillage mutex
- Erreur d'analyse
- Erreur de régulation

**Flow** :
1. Lock tous les modules
2. Collecte des états de santé
3. Appel `analysis::analyze()`
4. Appel `regulation::regulate()`
5. Mise à jour des champs publics
6. Log des métriques

#### `health(&self) -> ModuleHealth`
```rust
pub fn health(&self) -> ModuleHealth
```
Retourne l'état de santé actuel du module.

**Returns** : `ModuleHealth` avec status, uptime, message

**Status logic** :
```rust
if !initialized { Offline }
else if stability < 30.0 { Critical }
else if stability < 60.0 { Degraded }
else { Healthy }
```

### analysis module

#### `analyze() -> TitaneResult<AdaptiveReport>`
```rust
pub fn analyze(
    helios_health: &ModuleHealth,
    nexus_health: &ModuleHealth,
    harmonia_health: &ModuleHealth,
    sentinel_health: &ModuleHealth,
    watchdog_health: &ModuleHealth,
    memory_state: &MemoryModule,
) -> TitaneResult<AdaptiveReport>
```
Génère un rapport d'analyse complet.

**Returns** : `AdaptiveReport` avec 6 métriques  
**Errors** : Aucune erreur normale (valeurs par défaut sûres)

### regulation module

#### `regulate() -> TitaneResult<()>`
```rust
pub fn regulate(
    state: &mut AdaptiveState,
    report: &AdaptiveReport,
) -> TitaneResult<()>
```
Met à jour l'état adaptatif basé sur le rapport d'analyse.

**Arguments** :
- `state` : État mutable à mettre à jour
- `report` : Rapport d'analyse source

**Returns** : `Ok(())`  
**Side effects** : Modifie `state` in-place

## Patterns de code

### Pattern 1 : Verrouillage sécurisé
```rust
let module_health = match module.lock() {
    Ok(m) => m.health(),
    Err(e) => return Err(format!("[{}] Erreur lock: {}", MODULE_NAME, e)),
};
```
**Avantages** :
- Gestion explicite des erreurs de lock
- Message d'erreur contextuel
- Pas de panic

### Pattern 2 : Lissage exponentiel
```rust
fn smooth_transition(old: f32, new: f32, factor: f32) -> f32 {
    old * (1.0 - factor) + new * factor
}
// Usage
self.adaptability = smooth_transition(self.adaptability, harmony, 0.3);
```
**Avantages** :
- Transitions fluides
- Configurable via `factor`
- Stable numériquement

### Pattern 3 : Protection NaN
```rust
fn apply_constraints(value: f32, min: f32, max: f32) -> f32 {
    if value.is_nan() {
        return 0.0;
    }
    value.max(min).min(max)
}
```
**Avantages** :
- Robustesse contre erreurs numériques
- Valeurs toujours valides
- Pas de propagation de NaN

### Pattern 4 : Logging structuré
```rust
log::debug!(
    "🧠 [{}] MAI: stability={:.2}, adaptability={:.2}, load={:.2}, trend={:.2}",
    MODULE_NAME,
    self.stability,
    self.adaptability,
    self.predicted_load,
    self.trend
);
```
**Avantages** :
- Format cohérent
- Précision contrôlée (2 décimales)
- Facile à parser

## Troubleshooting

### Problème : Stability toujours à 0%

**Symptômes** :
```
stability=0.00, adaptability=0.00, load=0.00, trend=0.00
```

**Causes possibles** :
1. Modules pas encore initialisés
2. Erreur de verrouillage silencieuse
3. HealthStatus tous Offline

**Solutions** :
1. Vérifier logs d'initialisation : `grep "Initializing" logs.txt`
2. Vérifier erreurs de lock : `grep "Erreur lock" logs.txt`
3. Vérifier status modules : Appeler `health()` individuellement

### Problème : Oscillations rapides

**Symptômes** :
```
stability=45.20
stability=78.30  (+33.1)
stability=42.10  (-36.2)
stability=81.50  (+39.4)
```

**Causes** :
- Facteur de lissage trop élevé
- Damping insuffisant

**Solutions** :
```rust
// Réduire facteur de lissage
smooth_transition(old, new, 0.1);  // Au lieu de 0.3

// Augmenter damping
dampen_oscillations(value, 0.1);   // Au lieu de 0.05
```

### Problème : Trend bloqué

**Symptômes** :
```
trend=0.00 pendant 10+ ticks
```

**Causes** :
- Tous les modules au même score
- Calcul de trend incorrectement arrondi

**Solutions** :
1. Vérifier diversité des scores : `calculate_harmony()`
2. Utiliser plus de précision : `{:.3}` au lieu de `{:.2}`

### Problème : Memory Leaks

**Symptômes** :
- RAM augmente continuellement
- Performance dégradée

**Causes** :
- Mutex jamais unlocked (deadlock)
- Allocation dans boucle sans free

**Vérification** :
```rust
// Toujours utiliser scope guard
{
    let module = module.lock()?;
    // ...
} // Automatique unlock ici
```

### Problème : NaN dans les métriques

**Symptômes** :
```
stability=NaN, load=NaN
```

**Causes** :
- Division par zéro
- Opération sur NaN existant

**Protection** :
```rust
// Déjà implémenté dans apply_constraints
if value.is_nan() {
    return 0.0;
}
```

### Debugging avancé

#### Activer logs verbose
```bash
RUST_LOG=debug cargo run
```

#### Tracer les locks
```rust
log::trace!("🔒 Locking {}", module_name);
let module = module.lock()?;
log::trace!("✅ Locked {}", module_name);
```

#### Valider les métriques
```rust
assert!(load >= 0.0 && load <= 1.0, "Invalid load: {}", load);
assert!(pressure >= 0.0 && pressure <= 1.0, "Invalid pressure: {}", pressure);
assert!(stability >= 0.0 && stability <= 100.0, "Invalid stability: {}", stability);
```

## Performance Optimization

### Réduire les locks

**Avant** :
```rust
let h1 = helios.lock()?.health();
drop(helios);
let h2 = nexus.lock()?.health();
drop(nexus);
```

**Après** :
```rust
let (h1, h2) = {
    (helios.lock()?.health(), nexus.lock()?.health())
};
```

### Cache les calculs coûteux

```rust
// Calculer une seule fois
let scores: Vec<f32> = modules.iter().map(|m| health_to_score(&m.health())).collect();
let mean = scores.iter().sum::<f32>() / scores.len() as f32;

// Réutiliser dans multiple calculs
let pressure = calculate_pressure_from_scores(&scores, mean);
let harmony = calculate_harmony_from_scores(&scores, mean);
```

### Éviter les allocations

```rust
// Mauvais : allocation à chaque tick
let mut history = Vec::new();
history.push(load);

// Bon : réutiliser buffer
struct State {
    history: Vec<f32>,
}
impl State {
    fn update(&mut self, load: f32) {
        if self.history.len() >= MAX {
            self.history.remove(0);
        }
        self.history.push(load);
    }
}
```

---

**Version** : MAI v8.0  
**Dernière mise à jour** : 2024-11-17
