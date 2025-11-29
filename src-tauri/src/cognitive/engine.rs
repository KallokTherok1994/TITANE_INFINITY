use crate::cognitive::{CognitiveMode, CognitiveState, PhysiologicalSignals};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Engine cognitive principal gérant les trois centres
pub struct CognitiveEngine {
    state: Arc<RwLock<CognitiveState>>,
}

impl CognitiveEngine {
    pub fn new() -> Self {
        Self {
            state: Arc::new(RwLock::new(CognitiveState::new())),
        }
    }

    /// Récupère l'état actuel (read-only)
    pub async fn get_state(&self) -> CognitiveState {
        self.state.read().await.clone()
    }

    /// Met à jour la charge mentale
    pub async fn update_mental_charge(&self, new_charge: f32) {
        let mut state = self.state.write().await;
        state.mental.charge.current = new_charge.clamp(0.0, 1.0);
        state.mental.charge.add_to_history(new_charge);

        // Vérifier besoin recovery
        if state.mental.charge.is_overloaded() {
            state.mental.charge.recovery_needed = true;
        }

        state.update_coherence();
    }

    /// Met à jour le mode cognitif
    pub async fn set_cognitive_mode(&self, mode: CognitiveMode) {
        let mut state = self.state.write().await;
        state.mental.mode = mode;
        state.update_coherence();
    }

    /// Met à jour l'alignement cœur
    pub async fn update_heart_alignment(&self, alignment: f32, motivation: f32) {
        let mut state = self.state.write().await;
        state.heart.alignment = alignment.clamp(0.0, 1.0);
        state.heart.motivation = motivation.clamp(0.0, 1.0);
        state.update_coherence();
    }

    /// Met à jour l'énergie corporelle
    pub async fn update_body_energy(&self, energy: f32) {
        let mut state = self.state.write().await;
        state.body.energy_level = energy.clamp(0.0, 1.0);
        state.update_coherence();
    }

    /// Met à jour signaux physiologiques depuis audio
    pub async fn update_physiological_signals(&self, signals: PhysiologicalSignals) {
        let mut state = self.state.write().await;

        // Extraire stress score
        let stress = signals.stress_score();
        state.body.environment_stress = stress;

        // Détecter fatigue vocale
        if signals
            .stress_markers
            .contains(&crate::cognitive::StressMarker::LowEnergy)
        {
            state.body.voice_fatigue = (state.body.voice_fatigue + 0.1).min(1.0);
        }

        // Rhythm quality depuis pause pattern
        state.body.rhythm_quality = match signals.pause_pattern {
            crate::cognitive::PausePattern::Regular => 0.9,
            crate::cognitive::PausePattern::Irregular => 0.4,
            crate::cognitive::PausePattern::Rare => 0.5,
            crate::cognitive::PausePattern::Excessive => 0.3,
        };

        state.update_coherence();
    }

    /// Met à jour état émotionnel (intégration avec EmotionEngine)
    pub async fn update_emotional_state(&self, valence: f32, intensity: f32) {
        let mut state = self.state.write().await;
        state.heart.emotional_valence = valence.clamp(-1.0, 1.0);
        state.heart.emotional_intensity = intensity.clamp(0.0, 1.0);
        state.update_coherence();
    }

    /// Calcule la fatigue mentale depuis historique
    pub async fn compute_mental_fatigue(&self) -> f32 {
        let state = self.state.read().await;

        if state.mental.charge.history.is_empty() {
            return 0.0;
        }

        // Fatigue = moyenne des charges élevées sur historique
        let high_charge_ratio = state
            .mental
            .charge
            .history
            .iter()
            .filter(|&&c| c > 0.7)
            .count() as f32
            / state.mental.charge.history.len() as f32;

        high_charge_ratio
    }

    /// Vérifie si intervention système nécessaire
    pub async fn needs_intervention(&self) -> bool {
        let state = self.state.read().await;
        state.is_critical()
    }

    /// Génère recommandations
    pub async fn get_recommendations(&self) -> Vec<crate::cognitive::SystemRecommendation> {
        let state = self.state.read().await;
        state.generate_recommendations()
    }

    /// Reset état (pour tests ou nouveau contexte)
    pub async fn reset(&self) {
        let mut state = self.state.write().await;
        *state = CognitiveState::new();
    }
}

impl Default for CognitiveEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_cognitive_engine_creation() {
        let engine = CognitiveEngine::new();
        let state = engine.get_state().await;

        assert!(state.mental.charge.current >= 0.0);
        assert!(state.heart.alignment >= 0.0);
        assert!(state.body.energy_level >= 0.0);
    }

    #[tokio::test]
    async fn test_update_mental_charge() {
        let engine = CognitiveEngine::new();

        engine.update_mental_charge(0.8).await;

        let state = engine.get_state().await;
        assert_eq!(state.mental.charge.current, 0.8);
        assert!(!state.mental.charge.history.is_empty());
    }

    #[tokio::test]
    async fn test_update_cognitive_mode() {
        let engine = CognitiveEngine::new();

        engine
            .set_cognitive_mode(CognitiveMode::Focus {
                depth: 0.9,
                interruption_cost: 0.8,
            })
            .await;

        let state = engine.get_state().await;
        assert!(matches!(state.mental.mode, CognitiveMode::Focus { .. }));
    }

    #[tokio::test]
    async fn test_update_heart_alignment() {
        let engine = CognitiveEngine::new();

        engine.update_heart_alignment(0.9, 0.8).await;

        let state = engine.get_state().await;
        assert_eq!(state.heart.alignment, 0.9);
        assert_eq!(state.heart.motivation, 0.8);
    }

    #[tokio::test]
    async fn test_update_body_energy() {
        let engine = CognitiveEngine::new();

        engine.update_body_energy(0.3).await;

        let state = engine.get_state().await;
        assert_eq!(state.body.energy_level, 0.3);
    }

    #[tokio::test]
    async fn test_compute_mental_fatigue() {
        let engine = CognitiveEngine::new();

        // Ajouter charges élevées
        for _ in 0..10 {
            engine.update_mental_charge(0.9).await;
        }

        let fatigue = engine.compute_mental_fatigue().await;
        assert!(fatigue > 0.5); // Beaucoup de charges élevées

        // Reset et ajouter charges faibles
        engine.reset().await;
        for _ in 0..10 {
            engine.update_mental_charge(0.3).await;
        }

        let fatigue = engine.compute_mental_fatigue().await;
        assert!(fatigue < 0.3); // Peu de charges élevées
    }

    #[tokio::test]
    async fn test_needs_intervention() {
        let engine = CognitiveEngine::new();

        // État normal
        assert!(!engine.needs_intervention().await);

        // Surcharge mentale
        engine.update_mental_charge(1.0).await;
        {
            let mut state = engine.state.write().await;
            state.mental.charge.capacity = 0.8;
        }

        assert!(engine.needs_intervention().await);
    }

    #[tokio::test]
    async fn test_get_recommendations() {
        let engine = CognitiveEngine::new();

        // État critique
        engine.update_mental_charge(1.0).await;
        {
            let mut state = engine.state.write().await;
            state.mental.charge.capacity = 0.8;
        }

        let recs = engine.get_recommendations().await;
        assert!(!recs.is_empty());
    }

    #[tokio::test]
    async fn test_update_physiological_signals() {
        let engine = CognitiveEngine::new();

        let signals = PhysiologicalSignals {
            speech_rate: 250.0, // Rapide
            pitch_stability: 0.3,
            energy_mean: 0.2,
            pause_pattern: crate::cognitive::PausePattern::Irregular,
            stress_markers: vec![],
        };

        engine.update_physiological_signals(signals).await;

        let state = engine.get_state().await;
        assert!(state.body.environment_stress > 0.5); // Stress détecté
    }

    #[tokio::test]
    async fn test_update_emotional_state() {
        let engine = CognitiveEngine::new();

        engine.update_emotional_state(-0.7, 0.8).await;

        let state = engine.get_state().await;
        assert_eq!(state.heart.emotional_valence, -0.7);
        assert_eq!(state.heart.emotional_intensity, 0.8);
    }

    #[tokio::test]
    async fn test_reset() {
        let engine = CognitiveEngine::new();

        // Modifier état
        engine.update_mental_charge(0.9).await;
        engine.update_heart_alignment(0.1, 0.2).await;

        // Reset
        engine.reset().await;

        let state = engine.get_state().await;
        // Devrait être proche des valeurs par défaut
        assert!(state.mental.charge.current < 0.5);
    }
}
