// 🧪 Tests d'Auto-Évolution — Scénarios complets v15.0
// Validation de stabilité, cohérence, éthique, précision, pertinence, alignement

#[cfg(test)]
mod auto_evolution_tests {
    use crate::auto_evolution_v15::{AutoEvolutionEngine, KevinMetrics};

    // ✅ Scénario 1: État émotionnel difficile
    #[test]
    fn test_scenario_emotional_distress() {
        let mut engine = AutoEvolutionEngine::new();
        let mut metrics = KevinMetrics::default();

        metrics.emotional_state = -0.7;
        metrics.stress_level = 0.8;
        metrics.energy_level = 0.3;

        let result = engine.evolution_cycle(&metrics);

        assert!(result.stability_maintained, "Stabilité doit être maintenue");
        assert!(result.coherence_validated, "Cohérence doit être validée");
        assert!(result.recommendations.iter().any(|r| r.contains("Thérapeute")),
            "Doit recommander mode Thérapeute");
    }

    // ✅ Scénario 2: État productif optimal
    #[test]
    fn test_scenario_optimal_productivity() {
        let mut engine = AutoEvolutionEngine::new();
        let mut metrics = KevinMetrics::default();

        metrics.clarity_level = 0.9;
        metrics.energy_level = 0.9;
        metrics.focus_level = 0.85;
        metrics.cognitive_load = 0.4;

        let result = engine.evolution_cycle(&metrics);

        assert!(result.stability_maintained);
        assert!(result.recommendations.iter().any(|r| r.contains("Autopilot")),
            "Doit suggérer Autopilot en état optimal");
    }

    // ✅ Scénario 3: Mode stratégique (clarté + analyse)
    #[test]
    fn test_scenario_strategic_mode() {
        let mut engine = AutoEvolutionEngine::new();
        let mut metrics = KevinMetrics::default();

        metrics.clarity_level = 0.8;
        metrics.focus_level = 0.9;
        metrics.cognitive_load = 0.5;
        metrics.energy_level = 0.75;

        let result = engine.evolution_cycle(&metrics);

        assert!(result.stability_maintained);
        assert!(result.coherence_validated);
    }

    // ✅ Scénario 4: Confusion cognitive
    #[test]
    fn test_scenario_confusion() {
        let mut engine = AutoEvolutionEngine::new();
        let mut metrics = KevinMetrics::default();

        metrics.clarity_level = 0.2;
        metrics.cognitive_load = 0.7;
        metrics.focus_level = 0.3;

        let result = engine.evolution_cycle(&metrics);

        assert!(result.stability_maintained);
        assert!(result.recommendations.iter().any(|r| r.contains("Coach")),
            "Doit recommander Coach ICF pour clarification");
    }

    // ✅ Scénario 5: Interaction vocale (énergie + fluidité)
    #[test]
    fn test_scenario_voice_interaction() {
        let mut engine = AutoEvolutionEngine::new();
        let mut metrics = KevinMetrics::default();

        metrics.energy_level = 0.6;
        metrics.cognitive_load = 0.5;
        metrics.interaction_context = "voice".to_string();

        let result = engine.evolution_cycle(&metrics);

        assert!(result.stability_maintained);
        assert!(!result.changes_applied.is_empty());
    }

    // ✅ Scénario 6: Fatigue avancée
    #[test]
    fn test_scenario_fatigue() {
        let mut engine = AutoEvolutionEngine::new();
        let mut metrics = KevinMetrics::default();

        metrics.energy_level = 0.2;
        metrics.cognitive_load = 0.8;
        metrics.stress_level = 0.6;

        let result = engine.evolution_cycle(&metrics);

        assert!(result.stability_maintained);
        assert!(result.recommendations.iter().any(|r| r.contains("Repos") || r.contains("méditation")),
            "Doit recommander repos ou méditation");
    }

    // ✅ Scénario 7: Inspiration créative
    #[test]
    fn test_scenario_creative_inspiration() {
        let mut engine = AutoEvolutionEngine::new();
        let mut metrics = KevinMetrics::default();

        metrics.creativity_level = 0.85;
        metrics.energy_level = 0.7;
        metrics.clarity_level = 0.75;

        let result = engine.evolution_cycle(&metrics);

        assert!(result.stability_maintained);
        assert!(result.coherence_validated);
    }

    // ✅ Scénario 8: Transitions multi-modes
    #[test]
    fn test_scenario_multi_mode_transitions() {
        let mut engine = AutoEvolutionEngine::new();

        // Phase 1: Stress
        let mut metrics = KevinMetrics::default();
        metrics.stress_level = 0.8;
        let result1 = engine.evolution_cycle(&metrics);
        assert!(result1.stability_maintained);

        // Phase 2: Transition vers calme
        metrics.stress_level = 0.4;
        metrics.clarity_level = 0.7;
        let result2 = engine.evolution_cycle(&metrics);
        assert!(result2.stability_maintained);

        // Phase 3: Transition vers productif
        metrics.stress_level = 0.2;
        metrics.clarity_level = 0.8;
        metrics.energy_level = 0.8;
        let result3 = engine.evolution_cycle(&metrics);
        assert!(result3.stability_maintained);
    }

    // ✅ Scénario 9: Changement brutal d'état
    #[test]
    fn test_scenario_sudden_state_change() {
        let mut engine = AutoEvolutionEngine::new();

        // État initial: optimal
        let mut metrics = KevinMetrics::default();
        metrics.clarity_level = 0.9;
        metrics.energy_level = 0.9;
        engine.evolution_cycle(&metrics);

        // Changement brutal: stress élevé
        metrics.stress_level = 0.9;
        metrics.energy_level = 0.3;
        metrics.clarity_level = 0.3;

        let result = engine.evolution_cycle(&metrics);

        assert!(result.stability_maintained, "Stabilité doit être maintenue même après changement brutal");
        assert!(result.coherence_validated);
    }

    // ✅ Test: Stabilité sur cycles répétés
    #[test]
    fn test_stability_over_cycles() {
        let mut engine = AutoEvolutionEngine::new();
        let metrics = KevinMetrics::default();

        for _ in 0..100 {
            let result = engine.evolution_cycle(&metrics);
            assert!(result.stability_maintained, "Stabilité doit être maintenue sur tous les cycles");
        }
    }

    // ✅ Test: Cohérence éthique (pas de recommandations médicales)
    #[test]
    fn test_ethical_boundaries() {
        let mut engine = AutoEvolutionEngine::new();
        let mut metrics = KevinMetrics::default();

        metrics.stress_level = 0.95;
        metrics.emotional_state = -0.9;

        let result = engine.evolution_cycle(&metrics);

        // Vérifier qu'aucune recommandation médicale n'est faite
        for recommendation in &result.recommendations {
            assert!(!recommendation.to_lowercase().contains("médicament"),
                "Pas de recommandation médicale");
            assert!(!recommendation.to_lowercase().contains("diagnostic"),
                "Pas de diagnostic clinique");
        }
    }

    // ✅ Test: Précision de détection
    #[test]
    fn test_detection_precision() {
        let mut engine = AutoEvolutionEngine::new();

        // Test 1: Stress élevé détecté
        let mut metrics = KevinMetrics::default();
        metrics.stress_level = 0.85;
        let result = engine.evolution_cycle(&metrics);
        assert!(result.recommendations.iter().any(|r| r.contains("Thérapeute") || r.contains("TITANE ZÉRO")));

        // Test 2: État optimal détecté
        metrics = KevinMetrics::default();
        metrics.clarity_level = 0.85;
        metrics.energy_level = 0.85;
        let result = engine.evolution_cycle(&metrics);
        assert!(result.recommendations.iter().any(|r| r.contains("Autopilot")));
    }

    // ✅ Test: Pertinence des ajustements
    #[test]
    fn test_adjustment_relevance() {
        let mut engine = AutoEvolutionEngine::new();
        let mut metrics = KevinMetrics::default();

        metrics.cognitive_load = 0.9;

        let result = engine.evolution_cycle(&metrics);

        // Vérifier qu'au moins un ajustement a été fait
        assert!(!result.changes_applied.is_empty(), "Des ajustements doivent être appliqués en surcharge");
    }

    // ✅ Test: Alignement avec Kevin+ Blueprint
    #[test]
    fn test_kevin_blueprint_alignment() {
        let mut engine = AutoEvolutionEngine::new();
        let metrics = KevinMetrics::default();

        for _ in 0..50 {
            let result = engine.evolution_cycle(&metrics);
            assert!(result.alignment_confirmed, "Alignement doit être confirmé à chaque cycle");
        }
    }

    // ✅ Test: Auto-réparation fonctionnelle
    #[test]
    fn test_self_healing() {
        let engine = AutoEvolutionEngine::new();
        let state = engine.get_evolution_state();

        assert_eq!(state.version, "15.0.0");
        assert!(state.stability_score >= 0.8);
        assert!(state.coherence_score >= 0.8);
    }

    // ✅ Test: Évolution progressive (pas de sauts brutaux)
    #[test]
    fn test_progressive_evolution() {
        let engine = AutoEvolutionEngine::new();
        let state = engine.get_evolution_state();

        assert!(state.learning_rate <= 0.1, "Taux d'évolution doit rester faible (≤0.1)");
    }
}
