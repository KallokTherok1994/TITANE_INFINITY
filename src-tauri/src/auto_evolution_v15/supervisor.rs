// 🎯 Evolution Supervisor — Orchestrateur central de l'auto-évolution
// Utilise toutes les méthodes des sous-modules pour assurer la cohérence globale

use super::{AutoEvolutionEngine, KevinMetrics};
use super::pattern_learning::PatternType;

/// Superviseur d'évolution qui orchestre tous les composants
pub struct EvolutionSupervisor {
    engine: AutoEvolutionEngine,
    #[allow(dead_code)] // Timestamp pour audit futur
    last_check_timestamp: i64,
    evolution_cycles: u64,
}

impl EvolutionSupervisor {
    pub fn new() -> Self {
        Self {
            engine: AutoEvolutionEngine::new(),
            last_check_timestamp: chrono::Utc::now().timestamp(),
            evolution_cycles: 0,
        }
    }

    /// Cycle d'évolution complet avec toutes les vérifications
    pub fn run_evolution_cycle(&mut self, metrics: &KevinMetrics) -> String {
        self.evolution_cycles += 1;

        // 1. Obtenir l'état actuel
        let current_state = self.engine.get_evolution_state();
        
        // 2. Analyser les patterns via pattern_learning
        let patterns = self.engine.pattern_learner.get_all_patterns();
        let pattern_count = patterns.len();

        // 3. Vérifier les cycles via context_learning
        let cycles = self.engine.context_analyzer.detect_cycles();
        let has_cycles = !cycles.is_empty();

        // 4. Prédire l'état futur
        let future_prediction = self.engine.context_analyzer.predict_future_state();

        // 5. Vérifier la santé du système via selfheal
        let system_health = self.engine.self_healer.check_system_health();

        // 6. Obtenir l'historique de récupération
        let healing_history = self.engine.self_healer.get_healing_history();

        // 7. Statistiques mémoire
        let memory_stats = self.engine.memory_expander.get_memory_stats();

        // 8. Profil de style actuel
        let style_profile = self.engine.style_refiner.get_current_profile();

        // 9. Précision et pertinence logique
        let precision = self.engine.logic_calibrator.get_precision();
        let pertinence = self.engine.logic_calibrator.get_pertinence();

        // 10. Paramètres de mode
        let mode_params = self.engine.mode_adapter.get_mode_parameters("autonomous");

        // 11. Rapport de cohérence
        let consistency_report = self.engine.consistency_manager.generate_report();

        // 12. Profil émotionnel
        let emotional_profile = self.engine.emotional_tuner.get_current_profile();

        // 13. Profil comportemental
        let behavior_profile = self.engine.behavior_tuner.get_current_profile();

        // 14. Prédictions d'anticipation
        let anticipation_confidence = self.engine.anticipation_engine.prediction_confidence(metrics);

        // 15. Besoin anticipé
        let next_need = self.engine.anticipation_engine.anticipate_next_need(metrics)
            .unwrap_or("Aucun".to_string());

        // 16. Historique de contexte récent
        let recent_history = self.engine.context_analyzer.get_recent_history(5);

        // Construire le rapport complet
        format!(
            "🎯 Evolution Cycle #{}\n\
             État: v{} | Cycles: {} | Stabilité: {:.2}\n\
             Patterns détectés: {} | Cycles répétitifs: {}\n\
             Santé système: {:.2} | Guérisons: {}\n\
             Mémoire: {} entrées ({:.1}% utilisée)\n\
             Style: {:?} | Précision: {:.2} | Pertinence: {:.2}\n\
             Mode params: intensity={:.2} | Cohérence: {}\n\
             Émotionnel: {} | Comportemental: {:?}\n\
             Anticipation: {:.0}% | Besoin prédit: {}\n\
             Prédiction future: {}\n\
             Historique: {} snapshots récents",
            self.evolution_cycles,
            current_state.version,
            current_state.cycle_count,
            current_state.stability_score,
            pattern_count,
            if has_cycles { cycles.join(", ") } else { "Aucun".to_string() },
            system_health.overall_health,
            healing_history.len(),
            memory_stats.0,
            memory_stats.1 * 100.0,
            style_profile.tone,
            precision,
            pertinence,
            mode_params.map(|p| p.intensity).unwrap_or(0.0),
            if consistency_report.is_stable && consistency_report.is_coherent { "✓" } else { "✗" },
            emotional_profile.map(|p| p.dominant_emotion.clone()).unwrap_or("Neutre".to_string()),
            behavior_profile.response_pattern,
            anticipation_confidence * 100.0,
            next_need,
            future_prediction.clone().unwrap_or("Stable".to_string()),
            recent_history.len()
        )
    }

    /// Réinitialisation sécurisée du système
    pub fn perform_safe_reset(&mut self) -> String {
        let state_before = self.engine.get_evolution_state();
        
        self.engine.safe_reset();
        self.evolution_cycles = 0;
        
        let state_after = self.engine.get_evolution_state();
        
        format!(
            "🔄 Réinitialisation sécurisée effectuée\n\
             Avant: Cycles={} | Stabilité={:.2}\n\
             Après: Cycles={} | Stabilité={:.2}\n\
             ✅ Système réinitialisé avec succès",
            state_before.cycle_count,
            state_before.stability_score,
            state_after.cycle_count,
            state_after.stability_score
        )
    }

    /// Urgence : guérison d'urgence du système
    pub fn emergency_intervention(&mut self) -> String {
        self.engine.self_healer.emergency_heal()
    }

    /// Détecter et auto-corriger les incohérences
    pub fn auto_correct_system(&mut self) -> Vec<String> {
        self.engine.consistency_manager.auto_correct()
    }

    /// Stocker une information importante en mémoire
    pub fn store_memory(&mut self, key: String, value: String) {
        use super::memory_expansion::MemoryCategory;
        self.engine.memory_expander.store(key, value, MemoryCategory::Context, 0.7);
    }

    /// Rappeler une information de la mémoire
    pub fn recall_memory(&mut self, key: &str) -> Option<String> {
        self.engine.memory_expander.recall(key)
    }

    /// Enregistrer une prédiction pour améliorer l'anticipation
    pub fn record_prediction(&mut self, prediction: String) {
        self.engine.anticipation_engine.record_prediction(prediction);
    }

    /// Obtenir l'historique des prédictions
    pub fn get_prediction_history(&self) -> Vec<String> {
        self.engine.anticipation_engine.get_prediction_history()
    }

    /// Ajuster la sensibilité émotionnelle
    pub fn adjust_emotional_sensitivity(&mut self, target: f32) {
        self.engine.emotional_tuner.adjust_sensitivity(target);
    }

    /// Obtenir les recommandations émotionnelles
    pub fn get_emotional_recommendations(&self, metrics: &KevinMetrics) -> Vec<String> {
        self.engine.emotional_tuner.get_recommendations(metrics)
    }

    /// Vérifier si le système doit être proactif
    pub fn should_be_proactive(&self, metrics: &KevinMetrics) -> bool {
        self.engine.behavior_tuner.should_be_proactive(metrics)
    }

    /// Auto-détection du mode optimal
    pub fn auto_detect_optimal_mode(&self, metrics: &KevinMetrics) -> String {
        self.engine.anticipation_engine.auto_detect_mode(metrics)
    }

    /// Obtenir un pattern spécifique
    pub fn get_pattern(&self, pattern_type: PatternType) -> Option<String> {
        self.engine.pattern_learner.get_pattern(&pattern_type)
            .map(|p| format!("Pattern: {:?} (confidence: {:.2}, freq: {})", p.pattern_type, p.confidence, p.frequency))
    }

    /// Obtenir toutes les incohérences détectées
    pub fn detect_all_inconsistencies(&self) -> Vec<String> {
        self.engine.consistency_manager.detect_inconsistencies()
    }

    /// Statistiques complètes du superviseur
    pub fn get_stats(&self) -> String {
        let state = self.engine.get_evolution_state();
        format!(
            "📊 Superviseur Evolution v{}\n\
             Cycles totaux: {}\n\
             Cycles moteur: {}\n\
             Stabilité: {:.2} | Cohérence: {:.2} | Alignement: {:.2}",
            state.version,
            self.evolution_cycles,
            state.cycle_count,
            state.stability_score,
            state.coherence_score,
            state.alignment_score
        )
    }
}

impl Default for EvolutionSupervisor {
    fn default() -> Self {
        Self::new()
    }
}
