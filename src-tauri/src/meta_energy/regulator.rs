//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — ENERGY REGULATOR
//! Super Prompt #20 — Régulation homéostatique de l'énergie
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use std::collections::VecDeque;
use super::energy_model::{EnergyDimension, EnergyState};

/// Mode de régulation
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum RegulationMode {
    /// Mode normal - équilibre standard
    Normal,
    /// Mode conservation - économie d'énergie
    Conservation,
    /// Mode performance - utilisation maximale
    Performance,
    /// Mode récupération - focus sur la restauration
    Recovery,
    /// Mode urgence - préservation critique
    Emergency,
}

impl Default for RegulationMode {
    fn default() -> Self {
        Self::Normal
    }
}

/// Action de régulation
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RegulationAction {
    pub id: String,
    pub timestamp: u64,
    pub action_type: RegulationActionType,
    pub target_dimension: Option<EnergyDimension>,
    pub magnitude: f32,
    pub reason: String,
    pub applied: bool,
}

/// Type d'action de régulation
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum RegulationActionType {
    /// Booster une dimension
    Boost,
    /// Réduire la consommation
    Throttle,
    /// Redistribuer entre dimensions
    Redistribute,
    /// Déclencher une récupération
    TriggerRecovery,
    /// Alerter sur un niveau critique
    Alert,
    /// Bloquer les opérations coûteuses
    BlockExpensive,
    /// Réinitialiser un circuit
    Reset,
}

/// Seuils de régulation
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RegulationThresholds {
    pub critical_low: f32,
    pub low: f32,
    pub optimal_min: f32,
    pub optimal_max: f32,
    pub high: f32,
    pub critical_high: f32,
}

impl Default for RegulationThresholds {
    fn default() -> Self {
        Self {
            critical_low: 0.1,
            low: 0.25,
            optimal_min: 0.4,
            optimal_max: 0.8,
            high: 0.9,
            critical_high: 0.95,
        }
    }
}

/// Régulateur d'énergie
pub struct EnergyRegulator {
    mode: RwLock<RegulationMode>,
    thresholds: RegulationThresholds,
    actions_history: RwLock<VecDeque<RegulationAction>>,
    max_history: usize,
    stats: RwLock<RegulatorStats>,
}

impl EnergyRegulator {
    pub fn new() -> Self {
        Self {
            mode: RwLock::new(RegulationMode::Normal),
            thresholds: RegulationThresholds::default(),
            actions_history: RwLock::new(VecDeque::new()),
            max_history: 500,
            stats: RwLock::new(RegulatorStats::default()),
        }
    }

    pub fn with_thresholds(thresholds: RegulationThresholds) -> Self {
        Self {
            mode: RwLock::new(RegulationMode::Normal),
            thresholds,
            actions_history: RwLock::new(VecDeque::new()),
            max_history: 500,
            stats: RwLock::new(RegulatorStats::default()),
        }
    }

    /// Régule l'état énergétique
    pub async fn regulate(&self, state: &EnergyState) -> Vec<RegulationAction> {
        let mode = *self.mode.read().await;
        let mut actions = Vec::new();

        // Analyser chaque dimension
        for (dimension, level) in &state.dimensions {
            let level_actions = self.regulate_dimension(*dimension, level.current, mode).await;
            actions.extend(level_actions);
        }

        // Vérifier l'énergie globale
        let global_actions = self.regulate_global(state.global_energy, mode).await;
        actions.extend(global_actions);

        // Enregistrer les actions
        let mut history = self.actions_history.write().await;
        for action in &actions {
            history.push_back(action.clone());
            while history.len() > self.max_history {
                history.pop_front();
            }
        }

        // Mettre à jour les stats
        let mut stats = self.stats.write().await;
        stats.total_regulations += actions.len() as u64;

        actions
    }

    /// Régule une dimension spécifique
    async fn regulate_dimension(
        &self,
        dimension: EnergyDimension,
        level: f32,
        mode: RegulationMode,
    ) -> Vec<RegulationAction> {
        let mut actions = Vec::new();

        // Ajuster les seuils selon le mode
        let (low_threshold, high_threshold) = match mode {
            RegulationMode::Conservation => (self.thresholds.low + 0.1, self.thresholds.high - 0.1),
            RegulationMode::Performance => (self.thresholds.critical_low, self.thresholds.critical_high),
            RegulationMode::Recovery => (self.thresholds.optimal_min, self.thresholds.optimal_max),
            RegulationMode::Emergency => (self.thresholds.critical_low, self.thresholds.low),
            RegulationMode::Normal => (self.thresholds.low, self.thresholds.high),
        };

        if level < self.thresholds.critical_low {
            actions.push(RegulationAction {
                id: uuid::Uuid::new_v4().to_string(),
                timestamp: Self::now(),
                action_type: RegulationActionType::Alert,
                target_dimension: Some(dimension),
                magnitude: 1.0,
                reason: format!("{:?} at critical level ({:.2})", dimension, level),
                applied: false,
            });

            actions.push(RegulationAction {
                id: uuid::Uuid::new_v4().to_string(),
                timestamp: Self::now(),
                action_type: RegulationActionType::TriggerRecovery,
                target_dimension: Some(dimension),
                magnitude: 0.8,
                reason: format!("Emergency recovery for {:?}", dimension),
                applied: false,
            });
        } else if level < low_threshold {
            actions.push(RegulationAction {
                id: uuid::Uuid::new_v4().to_string(),
                timestamp: Self::now(),
                action_type: RegulationActionType::Throttle,
                target_dimension: Some(dimension),
                magnitude: 0.5,
                reason: format!("{:?} below optimal ({:.2})", dimension, level),
                applied: false,
            });
        } else if level > high_threshold {
            // Niveau trop élevé - possibilité de redistribuer
            actions.push(RegulationAction {
                id: uuid::Uuid::new_v4().to_string(),
                timestamp: Self::now(),
                action_type: RegulationActionType::Redistribute,
                target_dimension: Some(dimension),
                magnitude: level - self.thresholds.optimal_max,
                reason: format!("{:?} excess energy ({:.2})", dimension, level),
                applied: false,
            });
        }

        actions
    }

    /// Régulation globale
    async fn regulate_global(&self, global_energy: f32, mode: RegulationMode) -> Vec<RegulationAction> {
        let mut actions = Vec::new();

        match mode {
            RegulationMode::Emergency => {
                if global_energy < 0.2 {
                    actions.push(RegulationAction {
                        id: uuid::Uuid::new_v4().to_string(),
                        timestamp: Self::now(),
                        action_type: RegulationActionType::BlockExpensive,
                        target_dimension: None,
                        magnitude: 1.0,
                        reason: "Global energy critical - blocking expensive operations".to_string(),
                        applied: false,
                    });
                }
            }
            RegulationMode::Conservation => {
                if global_energy < 0.4 {
                    actions.push(RegulationAction {
                        id: uuid::Uuid::new_v4().to_string(),
                        timestamp: Self::now(),
                        action_type: RegulationActionType::Throttle,
                        target_dimension: None,
                        magnitude: 0.3,
                        reason: "Conservation mode - reducing consumption".to_string(),
                        applied: false,
                    });
                }
            }
            _ => {
                if global_energy < self.thresholds.critical_low {
                    actions.push(RegulationAction {
                        id: uuid::Uuid::new_v4().to_string(),
                        timestamp: Self::now(),
                        action_type: RegulationActionType::Alert,
                        target_dimension: None,
                        magnitude: 1.0,
                        reason: format!("Global energy critical: {:.2}", global_energy),
                        applied: false,
                    });
                }
            }
        }

        actions
    }

    /// Change le mode de régulation
    pub async fn set_mode(&self, mode: RegulationMode) {
        *self.mode.write().await = mode;

        let mut stats = self.stats.write().await;
        stats.mode_changes += 1;
    }

    /// Obtient le mode actuel
    pub async fn get_mode(&self) -> RegulationMode {
        *self.mode.read().await
    }

    /// Détermine automatiquement le mode optimal
    pub async fn auto_mode(&self, state: &EnergyState) -> RegulationMode {
        let global = state.global_energy;
        let avg_fatigue = state.fatigue_level;

        if global < 0.15 || avg_fatigue > 0.9 {
            RegulationMode::Emergency
        } else if global < 0.3 || avg_fatigue > 0.7 {
            RegulationMode::Recovery
        } else if global < 0.5 {
            RegulationMode::Conservation
        } else if global > 0.8 && avg_fatigue < 0.3 {
            RegulationMode::Performance
        } else {
            RegulationMode::Normal
        }
    }

    /// Applique le mode automatique
    pub async fn apply_auto_mode(&self, state: &EnergyState) {
        let mode = self.auto_mode(state).await;
        self.set_mode(mode).await;
    }

    /// Historique des actions récentes
    pub async fn recent_actions(&self, count: usize) -> Vec<RegulationAction> {
        let history = self.actions_history.read().await;
        history.iter().rev().take(count).cloned().collect()
    }

    /// Statistiques du régulateur
    pub async fn stats(&self) -> RegulatorStats {
        self.stats.read().await.clone()
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for EnergyRegulator {
    fn default() -> Self {
        Self::new()
    }
}

/// Statistiques du régulateur
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct RegulatorStats {
    pub total_regulations: u64,
    pub mode_changes: u64,
    pub alerts_raised: u64,
    pub recoveries_triggered: u64,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_regulator() {
        let regulator = EnergyRegulator::new();
        assert_eq!(regulator.get_mode().await, RegulationMode::Normal);
    }

    #[tokio::test]
    async fn test_mode_change() {
        let regulator = EnergyRegulator::new();
        regulator.set_mode(RegulationMode::Conservation).await;
        assert_eq!(regulator.get_mode().await, RegulationMode::Conservation);
    }
}
