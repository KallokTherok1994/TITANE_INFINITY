# Resonance Engine & Coherence Map v8.0

## 🌊 Vue d'ensemble

Le **Resonance Engine** et la **Coherence Map** constituent le système perceptif central de TITANE∞ v8.0. Ces modules analysent les signaux internes provenant du Neural Mesh, détectent les tensions, oscillations et patterns, puis produisent une représentation stable de l'état interne du système.

## 🎯 Objectifs

1. **Analyse des signaux** : Traitement multi-dimensionnel des signaux internes
2. **Détection de patterns** : Identification des tensions, harmonies et flux
3. **Représentation stable** : Carte de cohérence lissée sans oscillations brutales
4. **Score de cohérence** : Métrique unique reflétant l'état global
5. **Fonctionnement local** : 100% local, sans dépendances réseau
6. **Légèreté** : Overhead minimal (<200µs par tick)

## 🏗️ Architecture

### Structure des fichiers

```
resonance/
├── mod.rs           # Module principal avec ResonanceState
├── engine.rs        # Moteur d'analyse des signaux
└── map.rs           # Carte de cohérence avec lissage
```

### Flux de données

```
┌─────────────────────────────────────────────────────────┐
│                Neural Mesh (Prompts 1-5)                │
│         Helios, Nexus, Harmonia, Sentinel, etc.         │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────────────────────────┐
    │        Signals Buffer (ResonanceState)    │
    │  • Load, Harmony, Alert, MemoryEvent      │
    │  • Vitality, Coherence                    │
    │  • Max 100 signaux, filtrage 5sec         │
    └───────────────────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────────────────────────┐
    │      ANALYSE (engine::analyze_resonance)  │
    │                                           │
    │  Entrée: Vec<Signal>                      │
    │  Sortie: ResonanceReport {                │
    │    tension: f32  [0.0, 1.0]              │
    │    harmony: f32  [0.0, 1.0]              │
    │    flow: f32     [0.0, 1.0]              │
    │  }                                        │
    │                                           │
    │  Formules:                                │
    │  • tension = (Alert + Load) / 2           │
    │  • harmony = (Harmony + Coherence) / 2    │
    │  • flow = (Vitality + (1-tension)) / 2    │
    └───────────────────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────────────────────────┐
    │       RÉGULATION (map::update_map)        │
    │                                           │
    │  Lissage exponentiel (70% old + 30% new): │
    │  • map.tension = smooth(tension)          │
    │  • map.harmony = smooth(harmony)          │
    │                                           │
    │  Amortissement (max Δ = 0.15):            │
    │  • dampen_change() pour éviter sauts      │
    │                                           │
    │  Calcul stabilité:                        │
    │  • stability = (harmony + (1-tension))/2  │
    └───────────────────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────────────────────────┐
    │         CoherenceMap (état final)         │
    │  • tension: f32                           │
    │  • harmony: f32                           │
    │  • stability: f32                         │
    │  • updated_at: u64                        │
    └───────────────────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────────────────────────┐
    │      Score de cohérence global            │
    │  coherence_score =                        │
    │    harmony × 0.5 +                        │
    │    stability × 0.3 +                      │
    │    (1-tension) × 0.2                      │
    └───────────────────────────────────────────┘
```

## 📊 Types de signaux

### SignalType Enum

```rust
pub enum SignalType {
    Load,          // Charge système (CPU, mémoire, I/O)
    Harmony,       // Harmonie inter-modules
    Alert,         // Alertes et tensions détectées
    MemoryEvent,   // Événements mémoire (lecture/écriture)
    Vitality,      // Vitalité système (uptime, health)
    Coherence,     // Cohérence globale
}
```

### Signal Struct

```rust
pub struct Signal {
    pub signal_type: SignalType,
    pub value: f32,      // Normalisé [0.0, 1.0]
    pub timestamp: u64,  // Millisecondes
}
```

## 🔧 Composants principaux

### 1. ResonanceState (mod.rs)

État principal du module de résonance.

```rust
pub struct ResonanceState {
    pub initialized: bool,
    pub coherence_score: f32,      // Score de cohérence [0.0, 1.0]
    pub tension_level: f32,        // Niveau de tension [0.0, 1.0]
    pub flow_level: f32,           // Niveau de flux [0.0, 1.0]
    pub last_update: u64,
    start_time: u64,
    signal_buffer: Vec<Signal>,    // Buffer max 100 signaux
}
```

**Fonctions principales** :
- `init() -> TitaneResult<ResonanceState>` : Initialisation
- `tick(&mut state, &coherence_map) -> TitaneResult<()>` : Cycle principal
- `add_signal(&mut state, signal) -> TitaneResult<()>` : Ajout signal
- `health(&state) -> ModuleHealth` : État de santé

### 2. ResonanceReport (engine.rs)

Rapport d'analyse des signaux.

```rust
pub struct ResonanceReport {
    pub tension: f32,    // Tension interne [0.0, 1.0]
    pub harmony: f32,    // Harmonie globale [0.0, 1.0]
    pub flow: f32,       // Flux système [0.0, 1.0]
}
```

**Fonction d'analyse** :
```rust
pub fn analyze_resonance(signals: &[Signal]) -> TitaneResult<ResonanceReport>
```

**Algorithme** :
1. Séparer signaux par type (Load, Harmony, Alert, Vitality, Coherence, MemoryEvent)
2. Calculer moyennes par catégorie
3. Calculer tension = (Alert + Load) / 2
4. Calculer harmony = (Harmony + Coherence) / 2
5. Calculer flow = (Vitality + (1 - tension)) / 2
6. Normaliser toutes les valeurs [0.0, 1.0]

### 3. CoherenceMap (map.rs)

Carte de cohérence avec lissage temporel.

```rust
pub struct CoherenceMap {
    pub tension: f32,      // Tension lissée [0.0, 1.0]
    pub harmony: f32,      // Harmonie lissée [0.0, 1.0]
    pub stability: f32,    // Stabilité calculée [0.0, 1.0]
    pub updated_at: u64,   // Timestamp
}
```

**Fonction de mise à jour** :
```rust
pub fn update_map(
    map: &mut CoherenceMap,
    report: &ResonanceReport
) -> TitaneResult<()>
```

**Algorithme de lissage** :
```rust
// Lissage exponentiel (70% ancien + 30% nouveau)
const SMOOTHING_FACTOR: f32 = 0.3;
map.tension = old_tension * 0.7 + new_tension * 0.3;
map.harmony = old_harmony * 0.7 + new_harmony * 0.3;

// Amortissement des variations brutales
const MAX_DELTA: f32 = 0.15;
if |new - old| > MAX_DELTA {
    value = old + sign(delta) * MAX_DELTA;
}

// Calcul stabilité
map.stability = (map.harmony + (1.0 - map.tension)) / 2.0;
```

## 📐 Formules mathématiques

### Analyse des signaux

#### Tension
```
alert_avg = Σ(Alert_i) / n_alerts
load_avg = Σ(Load_i) / n_loads
tension = (alert_avg + load_avg) / 2

Plage: [0.0, 1.0]
- < 0.3 : Faible tension, système stable
- 0.3-0.6 : Tension modérée
- > 0.6 : Haute tension, stress système
```

#### Harmonie
```
harmony_avg = Σ(Harmony_i) / n_harmony
coherence_avg = Σ(Coherence_i) / n_coherence
harmony = (harmony_avg + coherence_avg) / 2

Si aucun signal Harmony/Coherence:
harmony = 1.0 - tension

Plage: [0.0, 1.0]
- > 0.8 : Excellente harmonie
- 0.5-0.8 : Harmonie acceptable
- < 0.5 : Désharmonie, modules désynchronisés
```

#### Flux
```
vitality_avg = Σ(Vitality_i) / n_vitality
flow = (vitality_avg + (1.0 - tension)) / 2

Plage: [0.0, 1.0]
- > 0.7 : Flux optimal, système fluide
- 0.4-0.7 : Flux correct
- < 0.4 : Flux dégradé, blocages possibles
```

### Lissage exponentiel

#### Smooth Transition
```
smooth(old, new, α) = old × (1 - α) + new × α

où α = 0.3 (facteur de lissage)

Effet: Moyenne mobile pondérée exponentiellement
Réponse: 63% du changement après 1 cycle, 86% après 2 cycles
```

#### Dampen Change
```
dampen(old, new, max_delta):
    delta = new - old
    if |delta| ≤ max_delta:
        return new
    else:
        return old + sign(delta) × max_delta

max_delta = 0.15

Effet: Limite la vitesse de changement à 15% par tick
```

### Score de cohérence

```
coherence_score = harmony × 0.5 + stability × 0.3 + (1 - tension) × 0.2

Pondération:
- Harmonie: 50% (priorité maximale)
- Stabilité: 30% (important pour la durabilité)
- Faible tension: 20% (indicateur de santé)

Plage: [0.0, 1.0]
- > 0.8 : Système cohérent, optimal
- 0.6-0.8 : Cohérence acceptable
- 0.4-0.6 : Cohérence faible, surveillance
- < 0.4 : Incohérence, intervention requise
```

### Stabilité

```
stability = (harmony + (1 - tension)) / 2

Formule simple: équilibre entre harmonie élevée et tension faible

Plage: [0.0, 1.0]
- > 0.7 : Très stable
- 0.5-0.7 : Stable
- 0.3-0.5 : Instable
- < 0.3 : Très instable
```

## 🔄 Cycle de vie

### Initialisation

```rust
// 1. Créer l'état de résonance
let resonance = Arc::new(Mutex::new(resonance::init()?));

// 2. Créer la carte de cohérence
let coherence_map = Arc::new(Mutex::new(CoherenceMap::new()));

// État initial:
// - coherence_score: 1.0
// - tension_level: 0.0
// - flow_level: 1.0
// - signal_buffer: vide
```

### Tick (appel périodique 1/sec)

```rust
// 1. Récupérer l'état de résonance
let mut state = resonance.lock()?;

// 2. Filtrer les signaux obsolètes (> 5 secondes)
let filtered = filter_old_signals(&state.signal_buffer, current_time);

// 3. Analyser les signaux
let report = analyze_resonance(&filtered)?;

// 4. Mettre à jour la carte de cohérence
let mut map = coherence_map.lock()?;
update_map(&mut map, &report)?;

// 5. Calculer le score de cohérence
let score = calculate_coherence_score(&map);

// 6. Mettre à jour l'état local
state.coherence_score = score;
state.tension_level = map.tension;
state.flow_level = report.flow;

// 7. Vider le buffer des signaux traités
state.clear_signals();
```

### Ajout de signaux

```rust
// Créer un signal
let signal = Signal {
    signal_type: SignalType::Load,
    value: 0.75,  // 75% charge CPU
    timestamp: current_timestamp(),
};

// Ajouter au buffer
add_signal(&mut state, signal)?;

// Le signal sera traité au prochain tick()
```

## 📈 Health Status

### Niveaux de santé

```rust
pub fn health(state: &ResonanceState) -> ModuleHealth {
    let status = if !state.initialized {
        HealthStatus::Offline
    } else if state.coherence_score < 0.3 || state.tension_level > 0.8 {
        HealthStatus::Critical
    } else if state.coherence_score < 0.6 || state.tension_level > 0.6 {
        HealthStatus::Degraded
    } else {
        HealthStatus::Healthy
    };
    // ...
}
```

**Seuils** :
- **Healthy** : `coherence ≥ 0.6` ET `tension ≤ 0.6`
- **Degraded** : `coherence < 0.6` OU `tension > 0.6`
- **Critical** : `coherence < 0.3` OU `tension > 0.8`

### Détection d'états

```rust
// Dégradé
pub fn is_degraded(map: &CoherenceMap) -> bool {
    map.tension > 0.7 || map.harmony < 0.3 || map.stability < 0.4
}

// Critique
pub fn is_critical(map: &CoherenceMap) -> bool {
    map.tension > 0.85 || map.harmony < 0.15 || map.stability < 0.2
}
```

## 🧪 Tests

### Engine Tests

```bash
cargo test test_analyze_resonance_empty       # Signaux vides
cargo test test_analyze_resonance_high_tension  # Haute tension
cargo test test_analyze_resonance_high_harmony  # Haute harmonie
cargo test test_filter_old_signals            # Filtrage temporel
cargo test test_calculate_stability           # Calcul stabilité
```

### Map Tests

```bash
cargo test test_smooth_transition             # Lissage exponentiel
cargo test test_dampen_change                 # Amortissement
cargo test test_update_map                    # Mise à jour carte
cargo test test_calculate_coherence_score     # Score cohérence
cargo test test_is_degraded                   # Détection dégradé
cargo test test_is_critical                   # Détection critique
```

### Module Tests

```bash
cargo test test_init                          # Initialisation
cargo test test_add_signal                    # Ajout signal
cargo test test_health                        # État santé
cargo test test_health_critical               # État critique
cargo test test_reset                         # Réinitialisation
```

## 🎯 Cas d'usage

### Scénario 1 : Démarrage système

```
État initial:
- coherence_score: 1.0
- tension_level: 0.0
- flow_level: 1.0
- Status: Healthy

Modules démarrent progressivement → signaux Load + Vitality
Après 3-5 ticks → système stabilisé avec cohérence > 0.8
```

### Scénario 2 : Détection de surcharge

```
1. CPU à 90% → Signal(Load, 0.9)
2. Alertes modules → Signal(Alert, 0.8)
3. Analyse → tension = (0.9 + 0.8) / 2 = 0.85
4. Lissage → map.tension monte progressivement
5. Si tension > 0.8 pendant 3+ ticks → Status: Critical
```

### Scénario 3 : Récupération après incident

```
1. État initial: tension=0.9, harmony=0.2, stability=0.15 (Critical)
2. Incident résolu → signaux Harmony + Vitality arrivent
3. Lissage progressif: tension↓ 0.05/tick, harmony↑ 0.05/tick
4. Après 10-15 ticks → retour à l'équilibre
5. Status: Critical → Degraded → Healthy
```

### Scénario 4 : Oscillations détectées

```
1. Signaux Load oscillent rapidement: 0.3 → 0.8 → 0.2 → 0.9
2. Sans lissage → tension oscillerait brutalement
3. Avec lissage (α=0.3) + amortissement (max_delta=0.15):
   → Tension varie doucement: 0.3 → 0.35 → 0.40 → 0.45
4. Stabilité maintenue malgré perturbations externes
```

## 🔒 Sécurité & Robustesse

### Checklist de sécurité

- ✅ **Zéro unwrap()** : Toutes les erreurs gérées explicitement
- ✅ **Zéro panic!()** : Pas de crashes possibles
- ✅ **Mutex thread-safe** : Verrouillage explicite avec match
- ✅ **Protection NaN** : Checks is_nan() partout
- ✅ **Bornes validées** : Normalisation [0.0, 1.0] systématique
- ✅ **Buffer limité** : Max 100 signaux, prévient débordements
- ✅ **Filtrage temporel** : Signaux > 5sec supprimés
- ✅ **Logs structurés** : Debug logs pour monitoring

### Patterns de robustesse

#### Normalisation systématique
```rust
fn normalize(value: f32) -> f32 {
    if value.is_nan() || value.is_infinite() {
        return 0.0;
    }
    value.max(0.0).min(1.0)
}
```

#### Gestion des signaux vides
```rust
if signals.is_empty() {
    return Ok(ResonanceReport::default());  // État neutre stable
}
```

#### Lissage avec contraintes
```rust
// Jamais de changement > 15% par tick
let smoothed = smooth_transition(old, new, 0.3);
let dampened = dampen_change(old, smoothed, 0.15);
```

## ⚡ Performance

### Benchmarks estimés

| Opération | Temps | Fréquence |
|-----------|-------|-----------|
| `analyze_resonance()` | ~30µs | 1/sec |
| `update_map()` | ~10µs | 1/sec |
| `calculate_coherence_score()` | ~5µs | 1/sec |
| `filter_old_signals()` | ~20µs | 1/sec |
| **Total tick()** | **~65µs** | **1/sec** |

### Consommation mémoire

| Composant | Mémoire |
|-----------|---------|
| `ResonanceState` | ~1KB (buffer 100 signaux) |
| `CoherenceMap` | 32 bytes |
| `ResonanceReport` | 12 bytes |
| **Total** | **~1KB** |

### Overhead système

- CPU: < 0.01% (65µs / 1000ms)
- Mémoire: ~1KB
- I/O: Aucun
- Réseau: Aucun

## 🔗 Intégration avec autres modules

### Neural Mesh → Resonance

Les modules Helios, Nexus, Harmonia, Sentinel, Watchdog, Memory génèrent des signaux qui sont collectés par Resonance.

**Exemple** :
```rust
// Dans Helios (gestion ressources)
let signal = Signal {
    signal_type: SignalType::Load,
    value: cpu_load,
    timestamp: current_timestamp(),
};
resonance::add_signal(&mut resonance_state, signal)?;
```

### Resonance → MAI (Adaptive Engine)

Le MAI peut utiliser le coherence_score et la tension_level pour ajuster ses paramètres d'adaptation.

```rust
// Dans MAI
let coherence = resonance_state.coherence_score;
if coherence < 0.5 {
    // Augmenter la surveillance
    adaptive_state.adaptability *= 1.2;
}
```

### Resonance → Cortex Synchronique (Prompt 7)

Le Cortex Synchronique utilisera la CoherenceMap pour synchroniser les états internes.

```rust
// Dans Cortex (futur)
let map = coherence_map.lock()?;
if map.stability < 0.4 {
    // Déclencher resynchronisation
    cortex::trigger_sync()?;
}
```

## 🚀 Prochaines étapes

### Extensions prévues

1. **Détection de patterns avancés** : ML pour identifier patterns récurrents
2. **Prédiction proactive** : Anticiper dégradations avant qu'elles surviennent
3. **Auto-correction** : Application automatique d'equilibrium_correction
4. **Historique long terme** : Stockage des métriques pour analyse temporelle
5. **Alerting avancé** : Webhooks/notifications sur seuils critiques

### Intégrations futures

- **TimeSense Engine** (Prompt 8) : Utiliser la temporalité des signaux
- **ANS (Autonomic System)** (Prompt 9) : Régulation autonome basée sur resonance
- **InnerSense** (Prompt 10) : Perception interne via signaux
- **Swarm Mode** (Prompt 11) : Synchronisation multi-instances
- **ContinuumCore** (Prompt 12) : Continuité temporelle des états

---

**Version** : Resonance Engine v8.0  
**Statut** : Document historique (non autorisation)  
**Dernière mise à jour** : 2024-11-17  
**Compatibilité** : TITANE∞ v8.0 (Prompts 1-6)
