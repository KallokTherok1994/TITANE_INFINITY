//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — META-ENERGY ENGINE vΩ
//! Super Prompt #20 — Homéostasie et gestion de l'énergie cognitive
//! ═══════════════════════════════════════════════════════════════════════════════
//!
//! Ce module gère l'homéostasie cognitive de TITANE∞:
//! - Modèle énergétique multi-dimensionnel
//! - Coûts cognitifs des opérations
//! - Régulation automatique
//! - Fatigue et récupération
//! - Distribution de charge
//! - Stabilisation long terme

pub mod energy_model;
pub mod cost_model;
pub mod regulator;
pub mod fatigue;
pub mod recovery;
pub mod load_balancer;
pub mod distributor;
pub mod stabilization;
pub mod predictive;
pub mod diagnostics;
pub mod config;
pub mod integration_bridges;

#[cfg(test)]
mod integration_tests;

pub use energy_model::{EnergyModel, EnergyState, EnergyDimension, EnergyLevel, EnergyTrend};
pub use cost_model::{CostModel, OperationCost, CostEstimate};
pub use regulator::{EnergyRegulator, RegulationAction, RegulationMode};
pub use fatigue::{FatigueTracker, FatigueLevel, FatigueSource, FatigueState};
pub use recovery::{RecoveryManager, RecoveryStrategy, RecoveryPlan};
pub use load_balancer::{LoadBalancer, LoadDistribution, LoadMetrics};
pub use distributor::{TaskDistributor, CognitiveTask, TaskPriority, AgentCapacity, DistributionDecision};
pub use stabilization::{StabilizationLayer, StabilizationMode, StabilityMetrics, StabilizationDecision};
pub use predictive::{EnergyPredictor, EnergyForecast};
pub use diagnostics::{EnergyDiagnostics, EnergyEventType};
pub use config::MetaEnergyConfig;
pub use integration_bridges::{TemporalEnergyBridge, CycleEnergyBridge, KernelEnergyBridge, OmegaEnergyBridge};

use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Version du Meta-Energy Engine
pub const META_ENERGY_VERSION: &str = "vΩ.1.0";

/// État global du système énergétique
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MetaEnergyState {
    pub global_energy: f32,
    pub energy_by_dimension: std::collections::HashMap<String, f32>,
    pub fatigue_level: f32,
    pub recovery_rate: f32,
    pub regulation_mode: RegulationMode,
    pub last_update: u64,
}

impl Default for MetaEnergyState {
    fn default() -> Self {
        Self {
            global_energy: 1.0,
            energy_by_dimension: std::collections::HashMap::new(),
            fatigue_level: 0.0,
            recovery_rate: 0.01,
            regulation_mode: RegulationMode::Normal,
            last_update: Self::now(),
        }
    }
}

impl MetaEnergyState {
    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

/// Moteur de méta-énergie
pub struct MetaEnergyEngine {
    config: MetaEnergyConfig,
    state: Arc<RwLock<MetaEnergyState>>,
    energy_model: EnergyModel,
    cost_model: CostModel,
    regulator: EnergyRegulator,
    fatigue_tracker: FatigueTracker,
    recovery_manager: RecoveryManager,
    load_balancer: LoadBalancer,
    predictor: EnergyPredictor,
    diagnostics: EnergyDiagnostics,
}

impl MetaEnergyEngine {
    /// Crée un nouveau moteur
    pub fn new(config: MetaEnergyConfig) -> Self {
        Self {
            config,
            state: Arc::new(RwLock::new(MetaEnergyState::default())),
            energy_model: EnergyModel::new(),
            cost_model: CostModel::new(),
            regulator: EnergyRegulator::new(),
            fatigue_tracker: FatigueTracker::new(),
            recovery_manager: RecoveryManager::new(),
            load_balancer: LoadBalancer::new(),
            predictor: EnergyPredictor::new(),
            diagnostics: EnergyDiagnostics::new(),
        }
    }

    /// Initialise le moteur
    pub async fn initialize(&mut self) -> Result<(), MetaEnergyError> {
        // Initialiser les dimensions énergétiques
        self.energy_model.initialize().await;

        // Calibrer le modèle de coûts
        self.cost_model.calibrate().await;

        self.diagnostics.emit(EnergyEventType::TickCompleted, "Meta-Energy Engine initialized").await;

        Ok(())
    }

    /// Tick principal (appelé régulièrement)
    pub async fn tick(&mut self) -> Result<TickResult, MetaEnergyError> {
        let start = std::time::Instant::now();

        // 1. Mettre à jour l'état énergétique
        let energy_state = self.energy_model.get_state().await;

        // 2. Enregistrer pour le prédicteur
        self.predictor.record_state(&energy_state).await;

        // 3. Tracker la fatigue
        let fatigue_state = self.fatigue_tracker.get_state().await;

        // 4. Mettre à jour la récupération si active
        self.recovery_manager.tick(1000).await;

        // 5. Réguler si nécessaire
        let regulations = if self.config.auto_regulation {
            self.regulator.regulate(&energy_state).await
        } else {
            Vec::new()
        };

        // 6. Équilibrer la charge
        if self.config.load_balancing_enabled {
            self.load_balancer.tick().await;
        }

        // 7. Détecter les anomalies
        if self.config.predictive_enabled {
            let anomalies = self.diagnostics.detect_anomalies(&energy_state).await;
            for anomaly in anomalies {
                self.diagnostics.emit_warning(&anomaly.description).await;
            }
        }

        // 8. Mettre à jour l'état global
        let mut state = self.state.write().await;
        state.global_energy = energy_state.global_energy;
        state.energy_by_dimension = energy_state.dimensions.iter()
            .map(|(k, v)| (format!("{:?}", k), v.current))
            .collect();
        state.fatigue_level = fatigue_state.global_level;
        state.regulation_mode = self.regulator.get_mode().await;
        state.last_update = MetaEnergyState::now();

        // 9. Diagnostics
        self.diagnostics.emit(EnergyEventType::TickCompleted, "Tick completed").await;
        self.diagnostics.record_state(&energy_state).await;

        Ok(TickResult {
            global_energy: energy_state.global_energy,
            fatigue_level: fatigue_state.global_level,
            regulation_actions: regulations,
            tick_duration_ms: start.elapsed().as_millis() as u64,
        })
    }

    /// Demande de l'énergie pour une opération
    pub async fn request_energy(&self, operation: &str, amount: f32) -> Result<EnergyGrant, MetaEnergyError> {
        let state = self.state.read().await;

        // Vérifier la disponibilité
        if state.global_energy < amount {
            return Err(MetaEnergyError::InsufficientEnergy {
                requested: amount,
                available: state.global_energy,
            });
        }

        // Vérifier les seuils de fatigue
        if state.fatigue_level > self.config.fatigue_warning_threshold {
            // Avertir mais permettre l'opération
            self.diagnostics.emit_warning(&format!(
                "High fatigue ({:.1}%) for operation: {}",
                state.fatigue_level * 100.0,
                operation
            )).await;
        }

        drop(state);

        // Calculer le coût réel
        let cost = self.cost_model.estimate(operation).await;

        // Consommer l'énergie globale
        self.energy_model.consume_global(cost.total_cost).await;

        // Tracker la fatigue générée
        self.fatigue_tracker.record(
            FatigueSource::CognitiveLoad,
            cost.fatigue_impact,
            None,
        ).await;

        Ok(EnergyGrant {
            operation: operation.to_string(),
            granted_energy: cost.total_cost,
            fatigue_impact: cost.fatigue_impact,
            timestamp: MetaEnergyState::now(),
        })
    }

    /// Recharge de l'énergie
    pub async fn recharge_energy(&self, amount: f32) {
        self.energy_model.restore(amount).await;

        let mut state = self.state.write().await;
        state.global_energy = (state.global_energy + amount).min(1.0);
    }

    /// Force un mode de régulation
    pub async fn set_regulation_mode(&self, mode: RegulationMode) {
        self.regulator.set_mode(mode).await;

        let mut state = self.state.write().await;
        state.regulation_mode = mode;

        self.diagnostics.emit_full(
            EnergyEventType::ModeChanged,
            &format!("Regulation mode changed to {:?}", mode),
            diagnostics::DiagnosticSeverity::Info,
            None,
            None,
        ).await;
    }

    /// Démarre une récupération
    pub async fn start_recovery(&self, strategy: RecoveryStrategy) -> Result<String, MetaEnergyError> {
        let fatigue_level = self.fatigue_tracker.global_level().await;
        let plan = self.recovery_manager.create_plan(strategy, None);

        self.recovery_manager.start(plan.clone()).await
            .map_err(|e| MetaEnergyError::RecoveryFailed(e.to_string()))?;

        self.diagnostics.emit_full(
            EnergyEventType::RecoveryStarted,
            &format!("Recovery started: {:?} (fatigue: {:.1}%)", strategy, fatigue_level * 100.0),
            diagnostics::DiagnosticSeverity::Info,
            None,
            Some(fatigue_level),
        ).await;

        Ok(plan.id)
    }

    /// Obtient une prédiction énergétique
    pub async fn predict(&self, horizon_ms: u64) -> EnergyForecast {
        let energy_state = self.energy_model.get_state().await;
        self.predictor.forecast(&energy_state, horizon_ms).await
    }

    /// Récupère l'état
    pub async fn get_state(&self) -> MetaEnergyState {
        self.state.read().await.clone()
    }

    /// Vérifie la santé du système
    pub async fn health_check(&self) -> EnergyHealth {
        let state = self.state.read().await;

        let status = if state.global_energy > 0.7 && state.fatigue_level < 0.3 {
            HealthStatus::Optimal
        } else if state.global_energy > 0.4 && state.fatigue_level < 0.6 {
            HealthStatus::Normal
        } else if state.global_energy > 0.2 && state.fatigue_level < 0.8 {
            HealthStatus::Degraded
        } else {
            HealthStatus::Critical
        };

        EnergyHealth {
            status,
            global_energy: state.global_energy,
            fatigue_level: state.fatigue_level,
            recovery_rate: state.recovery_rate,
            recommendations: self.generate_recommendations(&state),
        }
    }

    /// Génère un rapport de diagnostic
    pub async fn diagnostic_report(&self) -> diagnostics::EnergyDiagnosticReport {
        let energy_state = self.energy_model.get_state().await;
        self.diagnostics.generate_report(&energy_state).await
    }

    fn generate_recommendations(&self, state: &MetaEnergyState) -> Vec<String> {
        let mut recommendations = Vec::new();

        if state.global_energy < 0.3 {
            recommendations.push("Low energy: Consider reducing workload".to_string());
        }

        if state.fatigue_level > 0.7 {
            recommendations.push("High fatigue: Recovery break recommended".to_string());
        }

        if state.recovery_rate < 0.005 {
            recommendations.push("Slow recovery: System may be overloaded".to_string());
        }

        if recommendations.is_empty() {
            recommendations.push("System operating normally".to_string());
        }

        recommendations
    }
}

impl Default for MetaEnergyEngine {
    fn default() -> Self {
        Self::new(MetaEnergyConfig::default())
    }
}

/// Résultat d'un tick
#[derive(Clone, Debug)]
pub struct TickResult {
    pub global_energy: f32,
    pub fatigue_level: f32,
    pub regulation_actions: Vec<RegulationAction>,
    pub tick_duration_ms: u64,
}

/// Accord d'énergie
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EnergyGrant {
    pub operation: String,
    pub granted_energy: f32,
    pub fatigue_impact: f32,
    pub timestamp: u64,
}

/// Santé énergétique
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EnergyHealth {
    pub status: HealthStatus,
    pub global_energy: f32,
    pub fatigue_level: f32,
    pub recovery_rate: f32,
    pub recommendations: Vec<String>,
}

/// Statut de santé
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum HealthStatus {
    Optimal,
    Normal,
    Degraded,
    Critical,
}

/// Erreur du moteur énergétique
#[derive(Debug, Clone)]
pub enum MetaEnergyError {
    InitializationFailed(String),
    InsufficientEnergy { requested: f32, available: f32 },
    FatigueThresholdExceeded,
    RegulationFailed(String),
    LoadBalancingFailed(String),
    RecoveryFailed(String),
}

impl std::fmt::Display for MetaEnergyError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::InitializationFailed(msg) => write!(f, "Initialization failed: {}", msg),
            Self::InsufficientEnergy { requested, available } => {
                write!(f, "Insufficient energy: requested {}, available {}", requested, available)
            }
            Self::FatigueThresholdExceeded => write!(f, "Fatigue threshold exceeded"),
            Self::RegulationFailed(msg) => write!(f, "Regulation failed: {}", msg),
            Self::LoadBalancingFailed(msg) => write!(f, "Load balancing failed: {}", msg),
            Self::RecoveryFailed(msg) => write!(f, "Recovery failed: {}", msg),
        }
    }
}

impl std::error::Error for MetaEnergyError {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_meta_energy_creation() {
        let engine = MetaEnergyEngine::default();
        assert_eq!(engine.config.name, "default");
    }

    #[tokio::test]
    async fn test_meta_energy_state() {
        let engine = MetaEnergyEngine::default();
        let state = engine.get_state().await;
        assert_eq!(state.global_energy, 1.0);
    }

    #[tokio::test]
    async fn test_health_check() {
        let engine = MetaEnergyEngine::default();
        let health = engine.health_check().await;
        assert_eq!(health.status, HealthStatus::Optimal);
    }
}
