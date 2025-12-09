//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — ENERGY MODEL
//! Super Prompt #20 — Modèle énergétique multi-dimensionnel
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use std::collections::HashMap;

/// Dimension énergétique
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum EnergyDimension {
    /// Énergie cognitive (raisonnement, analyse)
    Cognitive,
    /// Énergie créative (génération, innovation)
    Creative,
    /// Énergie sociale (communication, collaboration)
    Social,
    /// Énergie exécutive (prise de décision, coordination)
    Executive,
    /// Énergie mémoire (stockage, récupération)
    Memory,
    /// Énergie sensorielle (perception, traitement)
    Sensory,
    /// Énergie physique (calcul, I/O)
    Physical,
}

impl EnergyDimension {
    /// Toutes les dimensions
    pub fn all() -> Vec<Self> {
        vec![
            Self::Cognitive,
            Self::Creative,
            Self::Social,
            Self::Executive,
            Self::Memory,
            Self::Sensory,
            Self::Physical,
        ]
    }

    /// Poids par défaut de la dimension
    pub fn default_weight(&self) -> f32 {
        match self {
            Self::Cognitive => 0.25,
            Self::Creative => 0.15,
            Self::Social => 0.10,
            Self::Executive => 0.15,
            Self::Memory => 0.15,
            Self::Sensory => 0.10,
            Self::Physical => 0.10,
        }
    }

    /// Taux de récupération par défaut
    pub fn default_recovery_rate(&self) -> f32 {
        match self {
            Self::Cognitive => 0.008,
            Self::Creative => 0.012,
            Self::Social => 0.015,
            Self::Executive => 0.010,
            Self::Memory => 0.005,
            Self::Sensory => 0.020,
            Self::Physical => 0.015,
        }
    }
}

/// Niveau d'énergie (enum)
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum EnergyLevelEnum {
    Depleted,
    Critical,
    Low,
    Normal,
    High,
    Optimal,
}

impl EnergyLevelEnum {
    pub fn from_value(value: f32) -> Self {
        match value {
            v if v <= 0.0 => Self::Depleted,
            v if v <= 0.2 => Self::Critical,
            v if v <= 0.4 => Self::Low,
            v if v <= 0.7 => Self::Normal,
            v if v <= 0.9 => Self::High,
            _ => Self::Optimal,
        }
    }

    pub fn to_value(&self) -> f32 {
        match self {
            Self::Depleted => 0.0,
            Self::Critical => 0.1,
            Self::Low => 0.3,
            Self::Normal => 0.55,
            Self::High => 0.8,
            Self::Optimal => 0.95,
        }
    }
}

/// Niveau d'énergie par dimension
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EnergyLevel {
    pub current: f32,
    pub baseline: f32,
    pub min: f32,
    pub max: f32,
}

impl Default for EnergyLevel {
    fn default() -> Self {
        Self {
            current: 1.0,
            baseline: 0.8,
            min: 0.0,
            max: 1.0,
        }
    }
}

/// État énergétique
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EnergyState {
    /// Niveau d'énergie global (0.0 - 1.0)
    pub global_energy: f32,
    /// Énergie par dimension
    pub dimensions: HashMap<EnergyDimension, EnergyLevel>,
    /// Niveau de fatigue (0.0 - 1.0)
    pub fatigue_level: f32,
    /// Tendance
    pub trend: EnergyTrend,
    /// Dernière mise à jour
    pub last_update: u64,
}

impl Default for EnergyState {
    fn default() -> Self {
        let mut dimensions = HashMap::new();
        for dim in EnergyDimension::all() {
            dimensions.insert(dim, EnergyLevel::default());
        }

        Self {
            global_energy: 1.0,
            dimensions,
            fatigue_level: 0.0,
            trend: EnergyTrend::Stable,
            last_update: Self::now(),
        }
    }
}

impl EnergyState {
    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }

    /// Obtient le niveau de la dimension
    pub fn dimension_level(&self, dimension: EnergyDimension) -> f32 {
        self.dimensions.get(&dimension)
            .map(|l| l.current)
            .unwrap_or(0.0)
    }
}

/// Tendance énergétique
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub enum EnergyTrend {
    RisingFast,
    Rising,
    #[default]
    Stable,
    Falling,
    FallingFast,
    Recovering,
}

/// Modèle énergétique
pub struct EnergyModel {
    state: RwLock<InternalState>,
    history: RwLock<Vec<EnergySnapshot>>,
}

struct InternalState {
    dimensions: HashMap<EnergyDimension, DimensionState>,
    global_level: f32,
    last_update: u64,
}

impl Default for InternalState {
    fn default() -> Self {
        let mut dimensions = HashMap::new();
        for dim in EnergyDimension::all() {
            dimensions.insert(dim, DimensionState {
                level: 1.0,
                weight: dim.default_weight(),
                recovery_rate: dim.default_recovery_rate(),
                consumption_rate: 0.0,
            });
        }

        Self {
            dimensions,
            global_level: 1.0,
            last_update: 0,
        }
    }
}

#[derive(Clone, Debug)]
struct DimensionState {
    level: f32,
    weight: f32,
    recovery_rate: f32,
    consumption_rate: f32,
}

#[derive(Clone, Debug)]
struct EnergySnapshot {
    timestamp: u64,
    global_level: f32,
    dimensions: HashMap<EnergyDimension, f32>,
}

impl EnergyModel {
    pub fn new() -> Self {
        Self {
            state: RwLock::new(InternalState::default()),
            history: RwLock::new(Vec::new()),
        }
    }

    /// Initialise les dimensions
    pub async fn initialize_dimensions(&self) {
        let mut state = self.state.write().await;

        for dim in EnergyDimension::all() {
            state.dimensions.insert(dim, DimensionState {
                level: 1.0,
                weight: dim.default_weight(),
                recovery_rate: dim.default_recovery_rate(),
                consumption_rate: 0.0,
            });
        }

        state.global_level = 1.0;
        state.last_update = Self::now();
    }

    /// Met à jour le modèle
    pub async fn update(&self) -> EnergyState {
        let mut state = self.state.write().await;
        let now = Self::now();
        let elapsed_ms = now.saturating_sub(state.last_update);

        // Appliquer la récupération naturelle
        for (_dim, dim_state) in state.dimensions.iter_mut() {
            let recovery = dim_state.recovery_rate * (elapsed_ms as f32 / 1000.0);
            dim_state.level = (dim_state.level + recovery).min(1.0);
        }

        // Calculer le niveau global
        let mut total_weighted = 0.0;
        let mut total_weight = 0.0;

        for (_, dim_state) in &state.dimensions {
            total_weighted += dim_state.level * dim_state.weight;
            total_weight += dim_state.weight;
        }

        state.global_level = if total_weight > 0.0 {
            total_weighted / total_weight
        } else {
            0.0
        };

        state.last_update = now;

        // Créer le snapshot
        let snapshot = EnergySnapshot {
            timestamp: now,
            global_level: state.global_level,
            dimensions: state.dimensions.iter()
                .map(|(k, v)| (*k, v.level))
                .collect(),
        };

        // Sauvegarder dans l'historique
        drop(state);
        let mut history = self.history.write().await;
        history.push(snapshot);
        if history.len() > 1000 {
            history.remove(0);
        }

        // Construire l'état de sortie
        self.get_state().await
    }

    /// Consomme de l'énergie d'une dimension
    pub async fn consume(&self, dimension: EnergyDimension, amount: f32) {
        let mut state = self.state.write().await;

        if let Some(dim_state) = state.dimensions.get_mut(&dimension) {
            dim_state.level = (dim_state.level - amount).max(0.0);
            dim_state.consumption_rate = amount;
        }

        // Recalculer global
        let mut total_weighted = 0.0;
        let mut total_weight = 0.0;

        for (_, dim_state) in &state.dimensions {
            total_weighted += dim_state.level * dim_state.weight;
            total_weight += dim_state.weight;
        }

        state.global_level = if total_weight > 0.0 {
            total_weighted / total_weight
        } else {
            0.0
        };
    }

    /// Recharge une dimension
    pub async fn recharge(&self, dimension: EnergyDimension, amount: f32) {
        let mut state = self.state.write().await;

        if let Some(dim_state) = state.dimensions.get_mut(&dimension) {
            dim_state.level = (dim_state.level + amount).min(1.0);
        }
    }

    /// Récupère l'état actuel
    pub async fn get_state(&self) -> EnergyState {
        let state = self.state.read().await;
        let history = self.history.read().await;

        let dimensions: HashMap<EnergyDimension, EnergyLevel> = state.dimensions.iter()
            .map(|(k, v)| (*k, EnergyLevel {
                current: v.level,
                baseline: 0.8,
                min: 0.0,
                max: 1.0,
            }))
            .collect();

        // Calculer la tendance
        let trend = self.calculate_trend(&history);

        EnergyState {
            global_energy: state.global_level,
            dimensions,
            fatigue_level: 0.0, // Will be updated by fatigue tracker
            trend,
            last_update: state.last_update,
        }
    }

    /// Initialise le modèle
    pub async fn initialize(&self) {
        self.initialize_dimensions().await;
    }

    /// Consomme de l'énergie globale
    pub async fn consume_global(&self, amount: f32) {
        let mut state = self.state.write().await;
        state.global_level = (state.global_level - amount).max(0.0);
    }

    /// Restaure de l'énergie globale
    pub async fn restore(&self, amount: f32) {
        let mut state = self.state.write().await;
        state.global_level = (state.global_level + amount).min(1.0);
    }

    /// Récupère le niveau d'une dimension
    pub async fn get_dimension_level(&self, dimension: EnergyDimension) -> f32 {
        let state = self.state.read().await;
        state.dimensions.get(&dimension).map(|d| d.level).unwrap_or(0.0)
    }

    fn calculate_trend(&self, history: &[EnergySnapshot]) -> EnergyTrend {
        if history.len() < 3 {
            return EnergyTrend::Stable;
        }

        let recent: Vec<f32> = history.iter()
            .rev()
            .take(10)
            .map(|s| s.global_level)
            .collect();

        if recent.len() < 2 {
            return EnergyTrend::Stable;
        }

        let avg_recent = recent.iter().sum::<f32>() / recent.len() as f32;
        let current = recent[0];
        let diff = current - avg_recent;

        match diff {
            d if d > 0.10 => EnergyTrend::RisingFast,
            d if d > 0.03 => EnergyTrend::Rising,
            d if d < -0.10 => EnergyTrend::FallingFast,
            d if d < -0.03 => EnergyTrend::Falling,
            d if d > 0.01 => EnergyTrend::Recovering,
            _ => EnergyTrend::Stable,
        }
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for EnergyModel {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_energy_model() {
        let model = EnergyModel::new();
        model.initialize().await;

        let state = model.get_state().await;
        assert_eq!(state.global_energy, 1.0);
    }

    #[tokio::test]
    async fn test_energy_consumption() {
        let model = EnergyModel::new();
        model.initialize().await;

        model.consume(EnergyDimension::Cognitive, 0.3).await;

        let level = model.get_dimension_level(EnergyDimension::Cognitive).await;
        assert!((level - 0.7).abs() < 0.01);
    }
}
