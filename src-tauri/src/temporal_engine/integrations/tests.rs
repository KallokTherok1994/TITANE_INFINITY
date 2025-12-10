//! ═══════════════════════════════════════════════════════════════════════════════
//! TEMPORAL ENGINE INTEGRATIONS — Tests
//! ═══════════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use crate::temporal_engine::integrations::*;
    use crate::temporal_engine::time_model::{Moment, Season, TimeOfDay};
    use crate::temporal_engine::{PlanningHorizon, TemporalContext};
    use crate::temporal_engine::integrations::memory_integration::ConsolidationPriority;
    use crate::temporal_engine::integrations::agi_integration::AlignmentPriority;

    fn create_test_context(hour: u8, day_of_week: u8, season: Season) -> TemporalContext {
        TemporalContext {
            now: Moment {
                timestamp_ms: 0,
                hour,
                minute: 0,
                second: 0,
                day_of_week,
                day: 15,
                month: 6,
                year: 2024,
                day_of_year: 166,
                week_of_year: 24,
                is_weekend: day_of_week >= 6,
                season,
                time_of_day: TimeOfDay::from_hour(hour),
            },
            session_start: 0,
            session_duration_ms: 0,
            day_progress: hour as f32 / 24.0,
            week_progress: day_of_week as f32 / 7.0,
            month_progress: 0.5,
            year_progress: 0.5,
            cognitive_energy_estimate: 0.8,
            optimal_for: vec![],
        }
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // KERNEL INTEGRATION TESTS
    // ═════════════════════════════════════════════════════════════════════════════

    #[test]
    fn test_kernel_peak_hours_adjustments() {
        let context = create_test_context(10, 3, Season::Summer);
        let adjustments = TemporalKernelBridge::get_scheduler_adjustments(&context);

        assert!(
            adjustments.priority_multiplier > 1.0,
            "Peak hours should boost priority"
        );
        assert!(
            adjustments.max_concurrent_jobs >= 7,
            "Peak hours should allow more jobs"
        );
    }

    #[test]
    fn test_kernel_night_adjustments() {
        let context = create_test_context(2, 3, Season::Summer);
        let adjustments = TemporalKernelBridge::get_scheduler_adjustments(&context);

        assert!(
            adjustments.priority_multiplier < 1.0,
            "Night should reduce priority"
        );
        assert!(
            adjustments.max_concurrent_jobs <= 4,
            "Night should limit jobs"
        );
    }

    #[test]
    fn test_kernel_resource_limits_peak() {
        let context = create_test_context(10, 3, Season::Summer);
        let limits = TemporalKernelBridge::get_resource_limits(&context);

        assert!(
            limits.max_cpu_percent > 70,
            "Peak hours should allow high CPU"
        );
        assert!(
            limits.max_memory_mb > 5000,
            "Peak hours should allow high memory"
        );
    }

    #[test]
    fn test_kernel_maintenance_window() {
        let context_night = create_test_context(3, 3, Season::Summer);
        let maintenance = TemporalKernelBridge::should_perform_maintenance(&context_night);

        assert!(
            maintenance.should_perform,
            "Night should recommend maintenance"
        );
        assert_eq!(
            maintenance.urgency,
            crate::temporal_engine::integrations::kernel_integration::MaintenanceUrgency::High
        );

        let context_day = create_test_context(14, 3, Season::Summer);
        let maintenance_day = TemporalKernelBridge::should_perform_maintenance(&context_day);

        assert!(
            !maintenance_day.should_perform,
            "Day should not recommend maintenance"
        );
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // OMEGA INTEGRATION TESTS
    // ═════════════════════════════════════════════════════════════════════════════

    #[test]
    fn test_omega_depth_multiplier_peak() {
        let context = create_test_context(10, 3, Season::Summer);
        let adjustments = TemporalOmegaBridge::get_omega_adjustments(&context);

        assert_eq!(
            adjustments.depth_multiplier, 1.0,
            "Peak hours should have max depth"
        );
        assert!(
            adjustments.reflection_intensity > 0.7,
            "Peak should enable reflection"
        );
    }

    #[test]
    fn test_omega_depth_multiplier_night() {
        let context = create_test_context(2, 3, Season::Summer);
        let adjustments = TemporalOmegaBridge::get_omega_adjustments(&context);

        assert!(
            adjustments.depth_multiplier < 0.5,
            "Night should reduce depth"
        );
    }

    #[test]
    fn test_omega_routing_strategy() {
        let context_peak = create_test_context(10, 3, Season::Summer);
        let strategy = TemporalOmegaBridge::suggest_routing_strategy(&context_peak, 0.9);

        assert_eq!(
            strategy,
            RoutingStrategy::DeepAnalysis,
            "Peak + complex = deep analysis"
        );

        let context_midday = create_test_context(12, 3, Season::Summer);
        let strategy_fast = TemporalOmegaBridge::suggest_routing_strategy(&context_midday, 0.3);

        assert_eq!(
            strategy_fast,
            RoutingStrategy::FastTrack,
            "Midday + simple = fast track"
        );
    }

    #[test]
    fn test_omega_engine_weights() {
        let context = create_test_context(10, 3, Season::Summer);
        let adjustments = TemporalOmegaBridge::get_omega_adjustments(&context);

        assert_eq!(
            adjustments.engine_weights.len(),
            10,
            "Should have 10 engine weights"
        );
        assert!(
            adjustments.engine_weights[0] > 0.0,
            "All weights should be positive"
        );
    }

    #[test]
    fn test_omega_active_engines_peak() {
        let context = create_test_context(10, 3, Season::Summer);
        let engines = TemporalOmegaBridge::suggest_active_engines(&context);

        assert_eq!(engines.len(), 10, "Peak hours should activate all engines");
    }

    #[test]
    fn test_omega_active_engines_night() {
        let context = create_test_context(2, 3, Season::Summer);
        let engines = TemporalOmegaBridge::suggest_active_engines(&context);

        assert!(engines.len() < 5, "Night should use minimal engines");
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // MEMORY INTEGRATION TESTS
    // ═════════════════════════════════════════════════════════════════════════════

    #[test]
    fn test_memory_consolidation_intensity() {
        let context_night = create_test_context(3, 3, Season::Summer);
        let adjustments = TemporalMemoryBridge::get_memory_adjustments(&context_night);

        assert!(
            adjustments.consolidation_intensity > 0.8,
            "Night should have high consolidation"
        );

        let context_day = create_test_context(14, 3, Season::Summer);
        let adjustments_day = TemporalMemoryBridge::get_memory_adjustments(&context_day);

        assert!(
            adjustments_day.consolidation_intensity < 0.6,
            "Day should have lower consolidation"
        );
    }

    #[test]
    fn test_memory_stm_ltm_threshold() {
        let context = create_test_context(3, 3, Season::Summer);
        let adjustments = TemporalMemoryBridge::get_memory_adjustments(&context);

        assert!(
            adjustments.stm_to_ltm_threshold < 0.5,
            "Night should promote easily"
        );
    }

    #[test]
    fn test_memory_consolidation_recommendation() {
        let context_night = create_test_context(3, 3, Season::Summer);
        let rec = TemporalMemoryBridge::should_perform_consolidation(&context_night);

        assert!(rec.should_run, "Night should recommend consolidation");
        assert_eq!(rec.priority, ConsolidationPriority::Critical);
        assert!(!rec.operations.is_empty(), "Should have operations");

        let context_day = create_test_context(14, 3, Season::Summer);
        let rec_day = TemporalMemoryBridge::should_perform_consolidation(&context_day);

        assert!(
            !rec_day.should_run,
            "Day should not recommend consolidation"
        );
    }

    #[test]
    fn test_memory_preload_patterns() {
        let context = create_test_context(9, 2, Season::Summer);
        let patterns = TemporalMemoryBridge::suggest_preload_patterns(&context);

        assert!(
            !patterns.is_empty(),
            "Workday morning should suggest preloading"
        );
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // AGI INTEGRATION TESTS
    // ═════════════════════════════════════════════════════════════════════════════

    #[test]
    fn test_agi_meta_learning_intensity() {
        let context_night = create_test_context(3, 3, Season::Summer);
        let adjustments = TemporalAgiBridge::get_agi_adjustments(&context_night);

        assert_eq!(
            adjustments.meta_learning_intensity, 1.0,
            "Night should max meta-learning"
        );

        let context_midday = create_test_context(12, 3, Season::Summer);
        let adjustments_day = TemporalAgiBridge::get_agi_adjustments(&context_midday);

        assert!(
            adjustments_day.meta_learning_intensity < 0.5,
            "Midday should reduce meta-learning"
        );
    }

    #[test]
    fn test_agi_exploration_ratio() {
        let context_peak = create_test_context(10, 3, Season::Summer);
        let adjustments = TemporalAgiBridge::get_agi_adjustments(&context_peak);

        assert_eq!(
            adjustments.exploration_vs_exploitation, 0.3,
            "Peak should exploit"
        );

        let context_night = create_test_context(3, 3, Season::Summer);
        let adjustments_night = TemporalAgiBridge::get_agi_adjustments(&context_night);

        assert_eq!(
            adjustments_night.exploration_vs_exploitation, 0.7,
            "Night should explore"
        );
    }

    #[test]
    fn test_agi_seasonal_adaptation() {
        let context_spring = create_test_context(14, 3, Season::Spring);
        let adjustments = TemporalAgiBridge::get_agi_adjustments(&context_spring);

        assert_eq!(
            adjustments.heuristic_adaptation_rate, 0.8,
            "Spring should adapt fast"
        );

        let context_winter = create_test_context(14, 3, Season::Winter);
        let adjustments_winter = TemporalAgiBridge::get_agi_adjustments(&context_winter);

        assert_eq!(
            adjustments_winter.heuristic_adaptation_rate, 0.3,
            "Winter should be conservative"
        );
    }

    #[test]
    fn test_agi_alignment_recommendation() {
        let context_night = create_test_context(3, 3, Season::Summer);
        let rec = TemporalAgiBridge::should_perform_alignment(&context_night);

        assert!(rec.should_run, "Night should recommend alignment");
        assert_eq!(rec.priority, AlignmentPriority::Critical);

        let context_day = create_test_context(14, 3, Season::Summer);
        let rec_day = TemporalAgiBridge::should_perform_alignment(&context_day);

        assert!(!rec_day.should_run, "Day should not recommend alignment");
    }

    #[test]
    fn test_agi_goal_focus() {
        let goals_today = TemporalAgiBridge::suggest_goal_focus(&PlanningHorizon::Today);
        assert!(!goals_today.is_empty(), "Should suggest goals for today");

        let goals_long = TemporalAgiBridge::suggest_goal_focus(&PlanningHorizon::LongTerm);
        assert!(!goals_long.is_empty(), "Should suggest long-term goals");
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // CONVERSATION INTEGRATION TESTS
    // ═════════════════════════════════════════════════════════════════════════════

    #[test]
    fn test_conversation_tone_morning() {
        let context = create_test_context(8, 2, Season::Summer);
        let adjustments = TemporalConversationBridge::get_conversation_adjustments(&context);

        assert_eq!(adjustments.tone, ConversationTone::Energizing);
    }

    #[test]
    fn test_conversation_tone_night() {
        let context = create_test_context(23, 2, Season::Summer);
        let adjustments = TemporalConversationBridge::get_conversation_adjustments(&context);

        assert_eq!(adjustments.tone, ConversationTone::Gentle);
    }

    #[test]
    fn test_conversation_verbosity() {
        let context_peak = create_test_context(10, 2, Season::Summer);
        let adj_peak = TemporalConversationBridge::get_conversation_adjustments(&context_peak);

        let context_midday = create_test_context(12, 2, Season::Summer);
        let adj_midday = TemporalConversationBridge::get_conversation_adjustments(&context_midday);

        assert!(
            adj_midday.verbosity < adj_peak.verbosity,
            "Midday should be more concise"
        );
    }

    #[test]
    fn test_conversation_formality_weekend() {
        let context_weekday = create_test_context(14, 3, Season::Summer);
        let adj_weekday =
            TemporalConversationBridge::get_conversation_adjustments(&context_weekday);

        let context_weekend = create_test_context(14, 6, Season::Summer);
        let adj_weekend =
            TemporalConversationBridge::get_conversation_adjustments(&context_weekend);

        assert!(
            adj_weekend.formality < adj_weekday.formality,
            "Weekend should be less formal"
        );
    }

    #[test]
    fn test_conversation_strategies() {
        let context_morning = create_test_context(8, 2, Season::Summer);
        let strategies =
            TemporalConversationBridge::suggest_conversation_strategies(&context_morning);

        assert!(!strategies.is_empty(), "Morning should have strategies");
    }

    #[test]
    fn test_conversation_temporal_narrative() {
        let context = create_test_context(8, 1, Season::Spring);
        let narrative = TemporalConversationBridge::maintain_temporal_narrative(&context);

        assert!(
            !narrative.current_thread.is_empty(),
            "Should have narrative thread"
        );
        assert!(
            !narrative.temporal_markers.is_empty(),
            "Should have temporal markers"
        );
        assert!(narrative.maintain_continuity, "Should maintain continuity");
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // INTEGRATION CONFIG TESTS
    // ═════════════════════════════════════════════════════════════════════════════

    #[test]
    fn test_integration_config_default() {
        let config = IntegrationConfig::default();

        assert!(config.kernel_sync_enabled);
        assert!(config.omega_adaptation_enabled);
        assert!(config.memory_consolidation_enabled);
        assert!(config.agi_meta_learning_enabled);
        assert!(config.conversation_context_enabled);
    }
}
