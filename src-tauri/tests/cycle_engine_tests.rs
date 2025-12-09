// ═══════════════════════════════════════════════════════════════
//   CYCLE ENGINE TESTS — Comprehensive Test Suite
//   SUPER PROMPT #16
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod cycle_engine_tests {
    use titane_infinity::cycle_engine::*;
    use tokio::time::Duration;

    // ═══════════════════════════════════════════════════════════
    //   CYCLE DEFINITIONS TESTS
    // ═══════════════════════════════════════════════════════════

    #[test]
    fn test_daily_phase_from_hour() {
        assert_eq!(
            cycles::DailyPhase::from_hour(6),
            cycles::DailyPhase::Dawn
        );
        assert_eq!(
            cycles::DailyPhase::from_hour(9),
            cycles::DailyPhase::Morning
        );
        assert_eq!(
            cycles::DailyPhase::from_hour(13),
            cycles::DailyPhase::Noon
        );
        assert_eq!(
            cycles::DailyPhase::from_hour(16),
            cycles::DailyPhase::Afternoon
        );
        assert_eq!(
            cycles::DailyPhase::from_hour(19),
            cycles::DailyPhase::Dusk
        );
        assert_eq!(
            cycles::DailyPhase::from_hour(22),
            cycles::DailyPhase::Night
        );
    }

    #[test]
    fn test_cognitive_mode_mapping() {
        assert_eq!(
            cycles::DailyPhase::Dawn.cognitive_mode(),
            cycles::CognitiveMode::Creative
        );
        assert_eq!(
            cycles::DailyPhase::Morning.cognitive_mode(),
            cycles::CognitiveMode::Analytical
        );
        assert_eq!(
            cycles::DailyPhase::Noon.cognitive_mode(),
            cycles::CognitiveMode::Peak
        );
        assert_eq!(
            cycles::DailyPhase::Night.cognitive_mode(),
            cycles::CognitiveMode::Consolidation
        );
    }

    #[test]
    fn test_cycle_state_current() {
        let state = cycles::CycleState::current();
        assert!(state.timestamp > 0);
        assert!(matches!(
            state.daily_phase,
            cycles::DailyPhase::Dawn
                | cycles::DailyPhase::Morning
                | cycles::DailyPhase::Noon
                | cycles::DailyPhase::Afternoon
                | cycles::DailyPhase::Dusk
                | cycles::DailyPhase::Night
        ));
    }

    // ═══════════════════════════════════════════════════════════
    //   COGNITIVE RHYTHM TESTS
    // ═══════════════════════════════════════════════════════════

    #[test]
    fn test_cognitive_rhythm_params() {
        let state = cycles::CycleState::current();
        let params = cognitive_rhythm::CognitiveRhythmParams::from_cycle_state(&state);

        assert!(params.omega_depth >= 0.0 && params.omega_depth <= 1.0);
        assert!(
            params.analysis_intensity >= 0.0 && params.analysis_intensity <= 1.0
        );
        assert!(
            params.speed_vs_quality >= 0.0 && params.speed_vs_quality <= 1.0
        );
        assert!(
            params.memory_consolidation >= 0.0
                && params.memory_consolidation <= 1.0
        );
        assert!(
            params.creative_temperature >= 0.0
                && params.creative_temperature <= 1.0
        );
    }

    #[test]
    fn test_omega_engine_weights() {
        let state = cycles::CycleState::current();
        let params = cognitive_rhythm::CognitiveRhythmParams::from_cycle_state(&state);
        let weights = params.omega_engine_weights();

        assert_eq!(weights.len(), 10); // 10 OMEGA engines
        for weight in weights {
            assert!(weight >= 0.0 && weight <= 1.5);
        }
    }

    // ═══════════════════════════════════════════════════════════
    //   LOAD REGULATOR TESTS
    // ═══════════════════════════════════════════════════════════

    #[test]
    fn test_load_regulator_normal_load() {
        let mut regulator = load_regulator::LoadRegulator::new();
        let state = cycles::CycleState::current();
        let rhythm = cognitive_rhythm::CognitiveRhythmParams::from_cycle_state(&state);

        let params = regulator.adjust(&state, &rhythm, 0.5, 0.5);

        assert!(params.omega_intensity >= 0.0 && params.omega_intensity <= 1.0);
        assert!(
            params.self_healing_frequency >= 0.0
                && params.self_healing_frequency <= 1.0
        );
        assert!(params.vector_search_k > 0);
    }

    #[test]
    fn test_load_regulator_high_cpu() {
        let mut regulator = load_regulator::LoadRegulator::new();
        let state = cycles::CycleState::current();
        let rhythm = cognitive_rhythm::CognitiveRhythmParams::from_cycle_state(&state);

        let params = regulator.adjust(&state, &rhythm, 0.95, 0.5);

        // Should reduce intensity under high CPU
        assert!(params.omega_intensity < rhythm.omega_depth);
    }

    #[test]
    fn test_load_regulator_high_memory() {
        let mut regulator = load_regulator::LoadRegulator::new();
        let state = cycles::CycleState::current();
        let rhythm = cognitive_rhythm::CognitiveRhythmParams::from_cycle_state(&state);

        let params = regulator.adjust(&state, &rhythm, 0.5, 0.9);

        // Should force GC under high memory
        assert_eq!(params.memory_gc_frequency, 1.0);
    }

    // ═══════════════════════════════════════════════════════════
    //   CONTINUITY ENGINE TESTS
    // ═══════════════════════════════════════════════════════════

    #[test]
    fn test_continuity_engine_record_event() {
        let mut engine = continuity::ContinuityEngine::new();

        engine.record_event(9, 1, "test_task".to_string());

        assert_eq!(engine.patterns().hour_of_day.get(&9), Some(&1));
        assert_eq!(engine.patterns().day_of_week.get(&1), Some(&1));
    }

    #[test]
    fn test_continuity_engine_preferences() {
        let mut engine = continuity::ContinuityEngine::new();

        engine.set_preference("theme".to_string(), "dark".to_string());
        assert_eq!(engine.get_preference("theme"), Some(&"dark".to_string()));
    }

    // ═══════════════════════════════════════════════════════════
    //   PREDICTIVE MODEL TESTS
    // ═══════════════════════════════════════════════════════════

    #[test]
    fn test_predictive_next_phase() {
        let model = predictive::PredictiveTemporalModel::new();
        let state = cycles::CycleState::current();

        let predictions = model.predict_next_cycle_change(&state);

        assert!(!predictions.is_empty());
        assert!(predictions[0].confidence > 0.0);
    }

    #[test]
    fn test_predictive_suggest_optimal_time() {
        let model = predictive::PredictiveTemporalModel::new();

        assert_eq!(
            model.suggest_optimal_time("creative"),
            Some(cycles::DailyPhase::Dawn)
        );
        assert_eq!(
            model.suggest_optimal_time("analytical"),
            Some(cycles::DailyPhase::Morning)
        );
        assert_eq!(
            model.suggest_optimal_time("consolidation"),
            Some(cycles::DailyPhase::Night)
        );
    }

    // ═══════════════════════════════════════════════════════════
    //   MAIN CYCLE ENGINE TESTS
    // ═══════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_cycle_engine_initialization() {
        let engine = CycleEngine::default();
        assert!(!engine.is_running().await);
    }

    #[tokio::test]
    async fn test_cycle_engine_start_stop() {
        let engine = CycleEngine::new(CycleEngineConfig {
            enabled: true,
            tick_interval_seconds: 1,
            ..Default::default()
        });

        assert!(!engine.is_running().await);

        engine.start().await.expect("Failed to start engine");
        assert!(engine.is_running().await);

        tokio::time::sleep(Duration::from_secs(2)).await;

        engine.stop().await.expect("Failed to stop engine");
        assert!(!engine.is_running().await);
    }

    #[tokio::test]
    async fn test_cycle_engine_current_state() {
        let engine = CycleEngine::default();
        let state = engine.current_state().await;

        assert!(state.timestamp > 0);
    }

    #[tokio::test]
    async fn test_cycle_engine_current_rhythm() {
        let engine = CycleEngine::default();
        let rhythm = engine.current_rhythm().await;

        assert!(rhythm.omega_depth >= 0.0 && rhythm.omega_depth <= 1.0);
    }

    #[tokio::test]
    async fn test_cycle_engine_predictions() {
        let engine = CycleEngine::default();
        let predictions = engine.get_predictions().await;

        assert!(!predictions.is_empty());
    }

    #[tokio::test]
    async fn test_cycle_engine_diagnostics() {
        let engine = CycleEngine::default();
        let diagnostics = engine.diagnostics().await;

        assert!(!diagnostics.enabled); // Not started
        assert_eq!(diagnostics.uptime_seconds, 0);
    }

    #[tokio::test]
    async fn test_cycle_engine_diagnostics_running() {
        let engine = CycleEngine::new(CycleEngineConfig {
            enabled: true,
            tick_interval_seconds: 1,
            ..Default::default()
        });

        engine.start().await.expect("Failed to start");
        tokio::time::sleep(Duration::from_secs(2)).await;

        let diagnostics = engine.diagnostics().await;
        assert!(diagnostics.enabled);
        assert!(diagnostics.uptime_seconds > 0);

        engine.stop().await.expect("Failed to stop");
    }

    // ═══════════════════════════════════════════════════════════
    //   INTEGRATION TESTS
    // ═══════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_kernel_integration() {
        use std::sync::Arc;
        let engine = Arc::new(CycleEngine::default());
        let bridge = kernel_integration::KernelCycleBridge::new(engine);

        let adjustments = bridge.get_scheduler_adjustments().await;
        assert!(adjustments.priority_multiplier > 0.0);
        assert!(adjustments.max_concurrent_tasks > 0);

        let limits = bridge.get_resource_limits().await;
        assert!(limits.max_cpu_usage > 0.0 && limits.max_cpu_usage <= 1.0);
        assert!(limits.max_memory_mb > 0);
    }

    #[tokio::test]
    async fn test_omega_integration() {
        use std::sync::Arc;
        let engine = Arc::new(CycleEngine::default());
        let bridge = omega_integration::OmegaCycleBridge::new(engine);

        let adjustments = bridge.get_omega_adjustments().await;
        assert!(
            adjustments.depth_multiplier >= 0.0
                && adjustments.depth_multiplier <= 1.0
        );
        assert_eq!(adjustments.engine_weights.len(), 10);
        assert!(adjustments.context_window_size > 0);

        let router = bridge.get_router_adjustments().await;
        assert!(
            router.creativity_weight >= 0.0 && router.creativity_weight <= 1.0
        );
    }

    #[tokio::test]
    async fn test_memory_integration() {
        use std::sync::Arc;
        let engine = Arc::new(CycleEngine::default());
        let bridge = memory_integration::MemoryCycleBridge::new(engine);

        let adjustments = bridge.get_memory_adjustments().await;
        assert!(
            adjustments.consolidation_intensity >= 0.0
                && adjustments.consolidation_intensity <= 1.0
        );
        assert!(adjustments.stm_to_ltm_threshold > 0);
        assert!(adjustments.vector_search_depth > 0);
    }

    // ═══════════════════════════════════════════════════════════
    //   STABILITY & LONG-TERM TESTS
    // ═══════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_cycle_engine_stability() {
        let engine = CycleEngine::new(CycleEngineConfig {
            enabled: true,
            tick_interval_seconds: 1,
            ..Default::default()
        });

        engine.start().await.expect("Failed to start");

        // Run for 5 seconds
        for _ in 0..5 {
            tokio::time::sleep(Duration::from_secs(1)).await;
            assert!(engine.is_running().await);
            let diagnostics = engine.diagnostics().await;
            assert!(diagnostics.alignment_score >= 0.0);
        }

        engine.stop().await.expect("Failed to stop");
    }
}
