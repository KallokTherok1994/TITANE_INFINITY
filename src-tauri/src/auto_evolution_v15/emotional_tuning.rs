// ❤️ Emotional Tuning — Calibration émotionnelle fine
// Sensibilité accrue, détection nuances, stabilité émotionnelle

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmotionalProfile {
    pub dominant_emotion: String,
    pub intensity: f32,
    pub stability: f32,
    pub nuances: Vec<String>,
}

pub struct EmotionalTuner {
    current_profile: Option<EmotionalProfile>,
    sensitivity: f32,
}

impl EmotionalTuner {
    pub fn new() -> Self {
        Self {
            current_profile: None,
            sensitivity: 0.8,
        }
    }

    /// Analyser l'état émotionnel de Kevin
    pub fn analyze_emotional_state(&mut self, metrics: &super::KevinMetrics) -> EmotionalProfile {
        let dominant_emotion = self.detect_dominant_emotion(metrics);
        let intensity = metrics.emotional_state.abs();
        let stability = 1.0 - (metrics.stress_level * 0.5);
        let nuances = self.detect_nuances(metrics);

        let profile = EmotionalProfile {
            dominant_emotion,
            intensity,
            stability,
            nuances,
        };

        self.current_profile = Some(profile.clone());
        profile
    }

    fn detect_dominant_emotion(&self, metrics: &super::KevinMetrics) -> String {
        if metrics.stress_level > 0.7 {
            return "Anxiété/Stress".to_string();
        }

        if metrics.emotional_state > 0.6 {
            return "Joie/Enthousiasme".to_string();
        }

        if metrics.emotional_state < -0.6 {
            return "Tristesse/Découragement".to_string();
        }

        if metrics.energy_level < 0.3 {
            return "Fatigue émotionnelle".to_string();
        }

        if metrics.clarity_level < 0.3 {
            return "Confusion/Doute".to_string();
        }

        "État neutre/Équilibré".to_string()
    }

    fn detect_nuances(&self, metrics: &super::KevinMetrics) -> Vec<String> {
        let mut nuances = Vec::new();

        if metrics.stress_level > 0.5 && metrics.stress_level <= 0.7 {
            nuances.push("Tension sous-jacente".to_string());
        }

        if metrics.emotional_state > 0.3 && metrics.emotional_state <= 0.6 {
            nuances.push("Optimisme modéré".to_string());
        }

        if metrics.energy_level > 0.7 && metrics.clarity_level > 0.7 {
            nuances.push("Confiance/Clarté".to_string());
        }

        if metrics.creativity_level > 0.6 {
            nuances.push("Inspiration créative".to_string());
        }

        if metrics.focus_level > 0.7 {
            nuances.push("Concentration intense".to_string());
        }

        if nuances.is_empty() {
            nuances.push("État émotionnel stable".to_string());
        }

        nuances
    }

    /// Ajuster la sensibilité émotionnelle du système
    pub fn adjust_sensitivity(&mut self, target: f32) {
        self.sensitivity = target.clamp(0.0, 1.0);
    }

    /// Obtenir le profil émotionnel actuel
    pub fn get_current_profile(&self) -> Option<&EmotionalProfile> {
        self.current_profile.as_ref()
    }

    /// Recommandations selon l'état émotionnel
    pub fn get_recommendations(&self, metrics: &super::KevinMetrics) -> Vec<String> {
        let mut recommendations = Vec::new();

        if metrics.stress_level > 0.7 {
            recommendations.push("🌿 Mode Thérapeute recommandé".to_string());
            recommendations.push("🧘 Méditation TITANE ZÉRO pour apaisement".to_string());
        }

        if metrics.emotional_state < -0.5 {
            recommendations.push("❤️ Support émotionnel doux (Thérapeute Humaniste)".to_string());
        }

        if metrics.energy_level < 0.3 {
            recommendations.push("😴 Repos immédiat conseillé".to_string());
        }

        if metrics.emotional_state > 0.6 && metrics.energy_level > 0.7 {
            recommendations.push("🚀 État optimal → Créativité ou action stratégique".to_string());
        }

        recommendations
    }
}

impl Default for EmotionalTuner {
    fn default() -> Self {
        Self::new()
    }
}
