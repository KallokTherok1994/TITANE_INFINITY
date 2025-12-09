//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ vΩ — META-ENERGY ENGINE INTEGRATION TESTS
//! Super Prompt #20 — Tests E2E homéostasie cognitive
//! ═══════════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod integration_tests {
    use crate::meta_energy::*;
    use std::sync::Arc;
    use tokio::sync::RwLock;

    /// Test flux complet: consommation → fatigue → récupération
    #[tokio::test]
    async fn test_complete_energy_cycle() {
        let energy_model = Arc::new(RwLock::new(EnergyModel::new()));
        let cost_model = Arc::new(CostModel::new());
        let fatigue_tracker = Arc::new(RwLock::new(FatigueTracker::new()));
        let recovery_manager = Arc::new(RwLock::new(RecoveryManager::new()));

        // 1. État initial
        {
            let energy = energy_model.read().await;
            assert!(energy.get_current_energy() > 0.9);
        }

        // 2. Consommation énergie
        {
            let mut energy = energy_model.write().await;
            energy.consume_energy(0.3);
        }

        // 3. Enregistrer fatigue
        {
            let mut fatigue = fatigue_tracker.write().await;
            fatigue.record_operation("reasoning", 0.3);
        }

        // 4. Vérifier énergie réduite
        {
            let energy = energy_model.read().await;
            assert!(energy.get_current_energy() < 0.75);
        }

        // 5. Récupération
        {
            let mut recovery = recovery_manager.write().await;
            let recovery_amount = recovery.calculate_recovery(10.0);
            
            let mut energy = energy_model.write().await;
            energy.recover_energy(recovery_amount);
        }

        // 6. Vérifier récupération partielle
        {
            let energy = energy_model.read().await;
            assert!(energy.get_current_energy() > 0.7);
        }
    }

    /// Test régulation automatique sous forte charge
    #[tokio::test]
    async fn test_automatic_regulation() {
        let energy_model = Arc::new(RwLock::new(EnergyModel::new()));
        let regulator = Arc::new(RwLock::new(EnergyRegulator::new()));

        // Consommer beaucoup d'énergie
        {
            let mut energy = energy_model.write().await;
            energy.consume_energy(0.7); // 70% consommé
        }

        // Vérifier mode régulation
        {
            let energy = energy_model.read().await;
            let mut regulator = regulator.write().await;
            
            regulator.update_from_energy_state(&energy.get_state()).await;
            
            let mode = regulator.get_current_mode();
            
            // Devrait passer en mode conservateur ou restrictif
            assert!(
                mode == RegulationMode::Conservative
                || mode == RegulationMode::Restricted
            );
        }
    }

    /// Test distribution de tâches
    #[tokio::test]
    async fn test_task_distribution() {
        let distributor = Arc::new(RwLock::new(TaskDistributor::new()));

        // Enregistrer agents
        {
            let mut dist = distributor.write().await;
            
            dist.register_agent(AgentCapacity {
                agent_id: "agent_1".to_string(),
                available_energy: 100.0,
                current_load: 20.0,
                max_load: 100.0,
                specialization: vec!["reasoning".to_string()],
                fatigue_level: 0.2,
            }).await;

            dist.register_agent(AgentCapacity {
                agent_id: "agent_2".to_string(),
                available_energy: 80.0,
                current_load: 50.0,
                max_load: 100.0,
                specialization: vec!["creative".to_string()],
                fatigue_level: 0.5,
            }).await;
        }

        // Soumettre tâche
        {
            let mut dist = distributor.write().await;
            
            dist.submit_task(CognitiveTask {
                id: "task_1".to_string(),
                task_type: "reasoning".to_string(),
                priority: TaskPriority::High,
                energy_cost: 15.0,
                agent_affinity: None,
                deadline_ms: None,
                can_defer: false,
                can_split: false,
            }).await;
        }

        // Distribuer
        let decisions = {
            let mut dist = distributor.write().await;
            dist.distribute().await
        };

        assert_eq!(decisions.len(), 1);
        assert_eq!(decisions[0].action, DistributionAction::Assign);
        // Agent 1 devrait être choisi (spécialisé + moins fatigué)
        assert_eq!(decisions[0].assigned_agent, Some("agent_1".to_string()));
    }

    /// Test stabilisation sous oscillations
    #[tokio::test]
    async fn test_stabilization_under_oscillation() {
        let stabilization = Arc::new(RwLock::new(StabilizationLayer::new()));

        // Créer oscillations
        for i in 0..20 {
            let energy = if i % 2 == 0 { 0.9 } else { 0.3 };
            
            let mut stab = stabilization.write().await;
            stab.record_signal(StabilizationSignal {
                timestamp: i * 1000,
                mode: StabilizationMode::Adaptive,
                energy_level: energy,
                fatigue_level: 0.5,
                load_level: 0.6,
            }).await;
        }

        // Évaluer stabilisation
        let decision = {
            let stab = stabilization.read().await;
            stab.evaluate().await
        };

        assert!(decision.is_some());
        
        if let Some(d) = decision {
            // Devrait détecter oscillations et proposer action
            assert_ne!(d.action, StabilizationAction::None);
            assert!(d.urgency > 0.3);
        }
    }

    /// Test pont temporal: récupération selon heure
    #[tokio::test]
    async fn test_temporal_bridge_recovery() {
        let energy_model = Arc::new(RwLock::new(EnergyModel::new()));
        let recovery_manager = Arc::new(RwLock::new(RecoveryManager::new()));
        
        let bridge = TemporalEnergyBridge::new(
            energy_model.clone(),
            recovery_manager.clone(),
        );

        // Ajuster pour nuit (récupération rapide)
        bridge.adjust_recovery_for_time(3, false).await;

        let night_multiplier = {
            let recovery = recovery_manager.read().await;
            recovery.get_recovery_multiplier()
        };

        // Ajuster pour peak hours (récupération normale)
        bridge.adjust_recovery_for_time(11, false).await;

        let peak_multiplier = {
            let recovery = recovery_manager.read().await;
            recovery.get_recovery_multiplier()
        };

        // Nuit devrait avoir meilleur multiplicateur
        assert!(night_multiplier > peak_multiplier);
    }

    /// Test pont cycle: synchronisation quotidienne
    #[tokio::test]
    async fn test_cycle_bridge_daily_sync() {
        let energy_model = Arc::new(RwLock::new(EnergyModel::new()));
        let fatigue_tracker = Arc::new(RwLock::new(FatigueTracker::new()));
        let stabilization = Arc::new(RwLock::new(StabilizationLayer::new()));

        let bridge = CycleEnergyBridge::new(
            energy_model,
            fatigue_tracker.clone(),
            stabilization.clone(),
        );

        // Accumuler fatigue
        {
            let mut fatigue = fatigue_tracker.write().await;
            fatigue.record_operation("heavy_task", 0.5);
        }

        let fatigue_before = {
            let fatigue = fatigue_tracker.read().await;
            fatigue.get_total_fatigue()
        };

        // Sync morning → devrait réduire fatigue
        bridge.sync_daily_cycle("morning").await;

        let fatigue_after = {
            let fatigue = fatigue_tracker.read().await;
            fatigue.get_total_fatigue()
        };

        assert!(fatigue_after < fatigue_before);
    }

    /// Test pont OMEGA: profondeur selon énergie
    #[tokio::test]
    async fn test_omega_bridge_depth_adjustment() {
        let cost_model = Arc::new(CostModel::new());
        let energy_model = Arc::new(RwLock::new(EnergyModel::new()));

        let bridge = OmegaEnergyBridge::new(
            cost_model,
            energy_model.clone(),
        );

        // Test avec haute énergie
        let depth_high = bridge.recommend_depth(10).await;

        // Réduire énergie
        {
            let mut energy = energy_model.write().await;
            energy.consume_energy(0.6); // 60% consommé
        }

        // Test avec basse énergie
        let depth_low = bridge.recommend_depth(10).await;

        // Basse énergie devrait réduire profondeur
        assert!(depth_low < depth_high);
    }

    /// Test pipeline complet: tâche → distribution → exécution → fatigue → récupération
    #[tokio::test]
    async fn test_complete_pipeline() {
        // Setup infrastructure
        let energy_model = Arc::new(RwLock::new(EnergyModel::new()));
        let cost_model = Arc::new(CostModel::new());
        let distributor = Arc::new(RwLock::new(TaskDistributor::new()));
        let fatigue_tracker = Arc::new(RwLock::new(FatigueTracker::new()));
        let recovery_manager = Arc::new(RwLock::new(RecoveryManager::new()));
        let stabilization = Arc::new(RwLock::new(StabilizationLayer::new()));

        // 1. Enregistrer agent
        {
            let mut dist = distributor.write().await;
            dist.register_agent(AgentCapacity {
                agent_id: "worker_1".to_string(),
                available_energy: 100.0,
                current_load: 0.0,
                max_load: 100.0,
                specialization: vec!["general".to_string()],
                fatigue_level: 0.0,
            }).await;
        }

        // 2. Soumettre tâche
        {
            let mut dist = distributor.write().await;
            dist.submit_task(CognitiveTask {
                id: "pipeline_task".to_string(),
                task_type: "general".to_string(),
                priority: TaskPriority::Normal,
                energy_cost: 25.0,
                agent_affinity: Some("worker_1".to_string()),
                deadline_ms: None,
                can_defer: false,
                can_split: false,
            }).await;
        }

        // 3. Distribuer tâche
        let decisions = {
            let mut dist = distributor.write().await;
            dist.distribute().await
        };

        assert_eq!(decisions.len(), 1);
        assert_eq!(decisions[0].action, DistributionAction::Assign);

        // 4. Simuler exécution (consommation énergie)
        {
            let mut energy = energy_model.write().await;
            energy.consume_energy(0.25);
        }

        // 5. Enregistrer fatigue
        {
            let mut fatigue = fatigue_tracker.write().await;
            fatigue.record_operation("pipeline_task", 0.25);
        }

        // 6. Enregistrer signal stabilisation
        {
            let mut stab = stabilization.write().await;
            stab.record_signal(StabilizationSignal {
                timestamp: 1000,
                mode: StabilizationMode::Normal,
                energy_level: 0.75,
                fatigue_level: 0.25,
                load_level: 0.25,
            }).await;
        }

        // 7. Récupération
        {
            let mut recovery = recovery_manager.write().await;
            let recovery_amount = recovery.calculate_recovery(5.0);
            
            let mut energy = energy_model.write().await;
            energy.recover_energy(recovery_amount);
        }

        // 8. Vérifier état final
        let final_energy = {
            let energy = energy_model.read().await;
            energy.get_current_energy()
        };

        let stability = {
            let stab = stabilization.read().await;
            stab.compute_stability().await
        };

        assert!(final_energy > 0.7);
        assert!(stability.is_stable());
    }
}
