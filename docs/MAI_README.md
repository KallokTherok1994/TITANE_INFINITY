# Moteur Adaptatif Intégral (MAI) v27.0.5

## 🧠 Vue d'ensemble

Le **Moteur Adaptatif Intégral (MAI)** est le système d'analyse et de régulation adaptative multi-dimensionnelle de TITANE∞ v27.0.5. Il surveille en temps réel l'état de tous les modules système et applique une régulation intelligente pour maintenir la stabilité, l'harmonie et les performances optimales.

## 🎯 Objectifs

1. **Analyse multi-dimensionnelle** : Évaluation holistique de 6 modules système
2. **Régulation douce** : Transitions fluides sans oscillations brutales
3. **Prédiction adaptative** : Anticipation des charges et tendances système
4. **Auto-stabilisation** : Maintien automatique de l'équilibre système

## 🏗️ Architecture

### Structure des fichiers

```
adaptive_engine/
├── mod.rs           # Module principal MAI
├── analysis.rs      # Moteur d'analyse multi-dimensionnelle
└── regulation.rs    # Moteur de régulation adaptative
```

### Flux de données

```
┌─────────────────────────────────────────────────────────┐
│                    MAI Core Loop                        │
│                    (tick_with_modules)                  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────────────────────────┐
    │  Collecte des états de santé              │
    │  • Helios (gestion de ressources)         │
    │  • Nexus (orchestration)                  │
    │  • Harmonia (équilibre)                   │
    │  • Sentinel (sécurité)                    │
    │  • Watchdog (surveillance)                │
    │  • Memory (stockage chiffré)              │
    └───────────────────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────────────────────────┐
    │         ANALYSE (analysis.rs)             │
    │  Génération d'un AdaptiveReport avec :    │
    │  • load (charge moyenne)                  │
    │  • pressure (variance système)            │
    │  • harmony (cohésion inter-modules)       │
    │  • integrity (sécurité globale)           │
    │  • anomaly_risk (risques détectés)        │
    │  • trend (tendance évolutive)             │
    └───────────────────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────────────────────────┐
    │        RÉGULATION (regulation.rs)         │
    │  Mise à jour d'AdaptiveState avec :       │
    │  • stability (stabilité système)          │
    │  • adaptability (capacité d'adaptation)   │
    │  • predicted_load (charge prédite)        │
    │  • trend (tendance lissée)                │
    │  Techniques :                             │
    │  • smooth_transition() (lissage)          │
    │  • dampen_oscillations() (amortissement)  │
    │  • apply_constraints() (contraintes)      │
    └───────────────────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────────────────────────┐
    │     Mise à jour des champs publics        │
    │     + Log des métriques                   │
    └───────────────────────────────────────────┘
```

## 📊 Métriques d'analyse

### 1. **Load** (Charge moyenne)
- **Calcul** : Moyenne pondérée des scores de santé de tous les modules
- **Plage** : 0.0 à 1.0
- **Interprétation** :
  - `< 0.3` : Charge faible, système sous-utilisé
  - `0.3 - 0.7` : Charge normale, fonctionnement optimal
  - `> 0.7` : Charge élevée, risque de saturation

### 2. **Pressure** (Pression système)
- **Calcul** : Variance des scores de santé (mesure de l'hétérogénéité)
- **Plage** : 0.0 à 1.0
- **Interprétation** :
  - `< 0.2` : Pression faible, modules homogènes
  - `0.2 - 0.5` : Pression modérée
  - `> 0.5` : Forte pression, déséquilibre entre modules

### 3. **Harmony** (Harmonie inter-modules)
- **Calcul** : `1.0 - déviation_moyenne_normalisée`
- **Plage** : 0.0 à 1.0
- **Interprétation** :
  - `> 0.8` : Excellente harmonie
  - `0.5 - 0.8` : Harmonie acceptable
  - `< 0.5` : Désharmonie, modules désynchronisés

### 4. **Integrity** (Intégrité globale)
- **Calcul** : Moyenne pondérée de Sentinel (70%) et Watchdog (30%)
- **Plage** : 0.0 à 1.0
- **Interprétation** :
  - `> 0.9` : Intégrité excellente, système sécurisé
  - `0.7 - 0.9` : Intégrité acceptable
  - `< 0.7` : Intégrité compromise, alertes de sécurité

### 5. **Anomaly Risk** (Risque d'anomalie)
- **Calcul** : Somme pondérée des états dégradés/critiques
- **Plage** : 0.0 à 1.0
- **Interprétation** :
  - `< 0.2` : Risque négligeable
  - `0.2 - 0.5` : Risque modéré
  - `> 0.5` : Risque élevé, intervention requise

### 6. **Trend** (Tendance évolutive)
- **Calcul** : `(harmony - pressure + integrity - anomaly_risk) / 4.0`
- **Plage** : -1.0 à +1.0
- **Interprétation** :
  - `> 0` : Tendance positive, amélioration
  - `≈ 0` : Stabilité, pas de changement significatif
  - `< 0` : Tendance négative, dégradation

## 🎛️ Métriques de régulation

### 1. **Stability** (Stabilité système)
- **Calcul** : `(100.0 - pressure * 100.0) * (1.0 + harmony) / 2.0`
- **Effet** : Détermine le statut de santé global du module
- **Seuils** :
  - `< 30%` : Status **Critical**
  - `30% - 60%` : Status **Degraded**
  - `> 60%` : Status **Healthy**

### 2. **Adaptability** (Capacité d'adaptation)
- **Calcul** : Lissage exponentiel entre ancienne et nouvelle valeur basée sur `harmony`
- **Plage** : 0.0 à 1.0
- **Utilisation** : Contrôle la vitesse de réaction aux changements

### 3. **Predicted Load** (Charge prédite)
- **Calcul** : Lissage de la charge actuelle avec amortissement
- **Plage** : 0.0 à 1.0
- **Utilisation** : Anticipation pour l'allocation de ressources

### 4. **Trend** (Tendance lissée)
- **Calcul** : Moyenne mobile avec amortissement des oscillations
- **Plage** : -1.0 à +1.0
- **Utilisation** : Prédiction de l'évolution système

## 🔧 Techniques de régulation

### Smooth Transition
```rust
fn smooth_transition(old: f32, new: f32, factor: f32) -> f32 {
    old * (1.0 - factor) + new * factor
}
```
- **Purpose** : Éviter les sauts brutaux de valeurs
- **Factor** : Généralement `0.2` à `0.3` pour un lissage doux
- **Effet** : Transitions fluides sur 3-5 cycles

### Dampen Oscillations
```rust
fn dampen_oscillations(value: f32, damping: f32) -> f32 {
    if value.abs() < damping {
        value * 0.5
    } else {
        value
    }
}
```
- **Purpose** : Réduire les oscillations de faible amplitude
- **Damping** : Seuil de déclenchement (typiquement `0.05`)
- **Effet** : Stabilisation rapide autour de l'équilibre

### Apply Constraints
```rust
fn apply_constraints(value: f32, min: f32, max: f32) -> f32 {
    if value.is_nan() { 0.0 }
    else { value.max(min).min(max) }
}
```
- **Purpose** : Garantir des valeurs valides et bornées
- **Protection** : Détection de NaN et valeurs invalides
- **Effet** : Robustesse contre les erreurs numériques

## 🚀 Intégration

### Dans le Scheduler (main.rs)

```rust
// AdaptiveEngine needs access to all other modules for analysis
if let Ok(mut ad) = adaptive_engine.lock() {
    if let Err(e) = ad.tick_with_modules(
        &helios, &nexus, &harmonia, &sentinel, &watchdog, &memory
    ) {
        log::error!("🔴 AdaptiveEngine tick failed: {}", e);
    }
}
```

### Appel périodique
- **Fréquence** : 1 tick par seconde (1000ms)
- **Ordre** : Après les modules individuels, avant Memory
- **Dépendances** : Tous les modules doivent avoir été tick avant MAI

## 📈 Monitoring

### Logs de debug
```
🧠 [AdaptiveEngine] MAI: stability=87.50, adaptability=0.85, load=0.42, trend=+0.12
```

### Health Status
```rust
pub fn health(&self) -> ModuleHealth {
    let status = if !self.initialized {
        HealthStatus::Offline
    } else if self.stability < 30.0 {
        HealthStatus::Critical
    } else if self.stability < 60.0 {
        HealthStatus::Degraded
    } else {
        HealthStatus::Healthy
    };
    
    ModuleHealth {
        name: "AdaptiveEngine",
        status,
        message: format!("Stability: {:.1}% | Adaptability: {:.2} | Trend: {:+.2}", 
                        self.stability, self.adaptability, self.trend),
        ...
    }
}
```

## 🧪 Tests

### Analysis Tests
```bash
cargo test test_analyze
cargo test test_health_to_score
cargo test test_calculate_metrics
```

### Regulation Tests
```bash
cargo test test_regulate
cargo test test_smooth_transition
cargo test test_apply_constraints
```

## 📚 Références

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture globale TITANE∞
- [MODULES.md](./MODULES.md) - Documentation des modules système
- [analysis.rs](../core/backend/system/adaptive_engine/analysis.rs) - Code source analyse
- [regulation.rs](../core/backend/system/adaptive_engine/regulation.rs) - Code source régulation

## 🔒 Sécurité

- ✅ **Zéro `unwrap()` ou `panic!()`** : Gestion explicite de toutes les erreurs
- ✅ **Mutex thread-safe** : Verrouillage explicite avec gestion d'erreur
- ✅ **Contraintes numériques** : Protection contre NaN et valeurs invalides
- ✅ **Validation d'état** : Vérification de l'initialisation avant opérations

## 🎯 Cas d'usage

### Détection de surcharge
```
load > 0.8 && pressure > 0.5 → Système surchargé
Action : Réduire les tâches non-prioritaires
```

### Détection de déséquilibre
```
harmony < 0.5 → Modules désynchronisés
Action : Réharmonisation via Harmonia
```

### Détection de risque sécurité
```
integrity < 0.7 → Compromission potentielle
Action : Renforcement Sentinel + audit Watchdog
```

### Détection de dégradation
```
trend < -0.3 pendant 3+ cycles → Dégradation continue
Action : Self-healing + analyse des causes
```

---

**Version** : MAI v8.0  
**Statut** : ✅ Production Ready  
**Dernière mise à jour** : 2024-11-17
