//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ vΩ — META-ENERGY INTEGRATION BRIDGES
//! Super Prompt #20 — Ponts vers Temporal, Cycle, Kernel, OMEGA
//! ═══════════════════════════════════════════════════════════════════════════════

use super::{
    EnergyModel, EnergyState, CostModel, EnergyRegulator, FatigueTracker,
    RecoveryManager, StabilizationLayer, TaskDistributor,
};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Pont vers Temporal Engine
pub struct TemporalEnergyBridge {
    energy_model: Arc<RwLock<EnergyModel>>,
    recovery_manager: Arc<RwLock<RecoveryManager>>,
}

impl TemporalEnergyBridge {
    pub fn new(
        energy_model: Arc<RwLock<EnergyModel>>,
        recovery_manager: Arc<RwLock<RecoveryManager>>,
    ) -> Self {
        Self {
            energy_model,
            recovery_manager,
        }
    }

    /// Ajuster récupération selon temporalité
    pub async fn adjust_recovery_for_time(&self, hour: u32, is_weekend: bool) {
        let mut recovery = self.recovery_manager.write().await;

        // Nuit (2-6h): récupération accélérée
        let multiplier = if hour >= 2 && hour < 6 {
            2.0
        }
        // Journée normale
        else if hour >= 9 && hour < 18 {
            1.0
        }
        // Soirée: récupération légère
        else if hour >= 18 && hour < 23 {
            1.3
        }
        // Weekend: +20% récupération
        else {
            1.0
        };

        let final_multiplier = if is_weekend {
            multiplier * 1.2
        } else {
            multiplier
        };

        recovery.set_recovery_multiplier(final_multiplier);
    }

    /// Prédire énergie disponible selon moment
    pub async fn predict_energy_availability(&self, hour: u32) -> f32 {
        let energy = self.energy_model.read().await;
        let base_energy = energy.get_current_energy();

        // Peak hours (10-11h): énergie haute attendue
        if hour >= 10 && hour < 12 {
            base_energy * 1.2
        }
        // Après-midi (14-16h): énergie modérée
        else if hour >= 14 && hour < 16 {
            base_energy * 1.1
        }
        // Fatigue fin journée (17-19h)
        else if hour >= 17 && hour < 20 {
            base_energy * 0.8
        }
        // Nuit (23-6h): repos
        else if hour >= 23 || hour < 6 {
            base_energy * 0.5
        } else {
            base_energy
        }
    }
}

/// Pont vers Cycle Engine
pub struct CycleEnergyBridge {
    energy_model: Arc<RwLock<EnergyModel>>,
    fatigue_tracker: Arc<RwLock<FatigueTracker>>,
    stabilization: Arc<RwLock<StabilizationLayer>>,
}

impl CycleEnergyBridge {
    pub fn new(
        energy_model: Arc<RwLock<EnergyModel>>,
        fatigue_tracker: Arc<RwLock<FatigueTracker>>,
        stabilization: Arc<RwLock<StabilizationLayer>>,
    ) -> Self {
        Self {
            energy_model,
            fatigue_tracker,
            stabilization,
        }
    }

    /// Synchroniser avec cycle quotidien
    pub async fn sync_daily_cycle(&self, cycle_phase: &str) {
        match cycle_phase {
            "morning" => {
                // Début journée: reset partiel fatigue
                let mut fatigue = self.fatigue_tracker.write().await;
                fatigue.apply_daily_reset(0.3);
            }
            "afternoon" => {
                // Après-midi: stabilisation
                let mut stabilization = self.stabilization.write().await;
                stabilization.set_mode(super::StabilizationMode::Normal).await;
            }
            "evening" => {
                // Soir: mode conservateur
                let mut stabilization = self.stabilization.write().await;
                stabilization.set_mode(super::StabilizationMode::Conservative).await;
            }
            "night" => {
                // Nuit: récupération maximale
                let mut energy = self.energy_model.write().await;
                energy.boost_recovery_rate(2.0);
            }
            _ => {}
        }
    }

    /// Synchroniser avec cycle hebdomadaire
    pub async fn sync_weekly_cycle(&self, day_of_week: u32) {
        // Weekend (samedi=6, dimanche=0)
        if day_of_week == 0 || day_of_week == 6 {
            let mut stabilization = self.stabilization.write().await;
            stabilization.set_mode(super::StabilizationMode::Conservative).await;
        }
    }
}

/// Pont vers Kernel OS
pub struct KernelEnergyBridge {
    regulator: Arc<RwLock<EnergyRegulator>>,
    distributor: Arc<RwLock<TaskDistributor>>,
}

impl KernelEnergyBridge {
    pub fn new(
        regulator: Arc<RwLock<EnergyRegulator>>,
        distributor: Arc<RwLock<TaskDistributor>>,
    ) -> Self {
        Self {
            regulator,
            distributor,
        }
    }

    /// Obtenir throttling recommandé pour scheduler
    pub async fn get_scheduler_throttle(&self) -> f32 {
        let regulator = self.regulator.read().await;
        
        match regulator.get_current_mode() {
            super::RegulationMode::Normal => 1.0,
            super::RegulationMode::Conservative => 0.7,
            super::RegulationMode::Restricted => 0.5,
            super::RegulationMode::Emergency => 0.3,
            _ => 1.0,
        }
    }

    /// Notifier kernel de surcharge
    pub async fn should_kernel_reduce_load(&self) -> bool {
        let regulator = self.regulator.read().await;
        
        matches!(
            regulator.get_current_mode(),
            super::RegulationMode::Restricted | super::RegulationMode::Emergency
        )
    }
}

/// Pont vers OMEGA Pipeline
pub struct OmegaEnergyBridge {
    cost_model: Arc<CostModel>,
    energy_model: Arc<RwLock<EnergyModel>>,
}

impl OmegaEnergyBridge {
    pub fn new(
        cost_model: Arc<CostModel>,
        energy_model: Arc<RwLock<EnergyModel>>,
    ) -> Self {
        Self {
            cost_model,
            energy_model,
        }
    }

    /// Déterminer profondeur OMEGA selon énergie
    pub async fn recommend_depth(&self, max_depth: u32) -> u32 {
        let energy = self.energy_model.read().await;
        let current_energy = energy.get_current_energy();

        if current_energy > 0.8 {
            max_depth // Pleine profondeur
        } else if current_energy > 0.6 {
            (max_depth * 3 / 4).max(1) // 75%
        } else if current_energy > 0.4 {
            (max_depth / 2).max(1) // 50%
        } else if current_energy > 0.2 {
            (max_depth / 3).max(1) // 33%
        } else {
            1 // Minimal
        }
    }

    /// Vérifier si OMEGA peut s'exécuter
    pub async fn can_execute_omega(&self, depth: u32) -> bool {
        let energy = self.energy_model.read().await;
        let cost = self.cost_model.estimate_omega_cost(depth);
        
        energy.can_afford_cost(cost)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::meta_energy::config::MetaEnergyConfig;

    #[tokio::test]
    async fn test_temporal_bridge_recovery_adjustment() {
        let energy_model = Arc::new(RwLock::new(EnergyModel::new()));
        let recovery_manager = Arc::new(RwLock::new(RecoveryManager::new()));
        
        let bridge = TemporalEnergyBridge::new(energy_model, recovery_manager.clone());

        // Test night recovery
        bridge.adjust_recovery_for_time(3, false).await;
        
        let recovery = recovery_manager.read().await;
        // Multiplier should be higher at night
        assert!(recovery.get_recovery_multiplier() >= 1.5);
    }

    #[tokio::test]
    async fn test_temporal_bridge_energy_prediction() {
        let energy_model = Arc::new(RwLock::new(EnergyModel::new()));
        let recovery_manager = Arc::new(RwLock::new(RecoveryManager::new()));
        
        let bridge = TemporalEnergyBridge::new(energy_model.clone(), recovery_manager);

        // Peak hour prediction
        let peak_energy = bridge.predict_energy_availability(11).await;
        
        // Night prediction
        let night_energy = bridge.predict_energy_availability(3).await;

        // Peak should be higher than night
        assert!(peak_energy > night_energy);
    }

    #[tokio::test]
    async fn test_kernel_bridge_throttle() {
        let regulator = Arc::new(RwLock::new(EnergyRegulator::new()));
        let distributor = Arc::new(RwLock::new(TaskDistributor::new()));
        
        let bridge = KernelEnergyBridge::new(regulator, distributor);

        let throttle = bridge.get_scheduler_throttle().await;
        
        // Default should be no throttling
        assert_eq!(throttle, 1.0);
    }

    #[tokio::test]
    async fn test_omega_bridge_depth_recommendation() {
        let cost_model = Arc::new(CostModel::new());
        let energy_model = Arc::new(RwLock::new(EnergyModel::new()));
        
        let bridge = OmegaEnergyBridge::new(cost_model, energy_model);

        let recommended = bridge.recommend_depth(10).await;
        
        // Should recommend based on current energy
        assert!(recommended > 0 && recommended <= 10);
    }
}
