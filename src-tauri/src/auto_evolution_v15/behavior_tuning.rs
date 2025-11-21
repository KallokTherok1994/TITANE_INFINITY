// 🎭 Behavior Tuning — Calibration comportementale
// Ajustement des patterns de réponse, rythmes d'intervention, proactivité

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehaviorProfile {
    pub response_pattern: ResponsePattern,
    pub intervention_timing: InterventionTiming,
    pub proactivity_level: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ResponsePattern {
    Reactive,     // Réactif (répond aux demandes)
    Proactive,    // Proactif (anticipe et propose)
    Balanced,     // Équilibré (mélange)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InterventionTiming {
    Immediate,   // Immédiat (répond vite)
    Measured,    // Mesuré (prend le temps)
    Adaptive,    // Adaptatif (selon contexte)
}

impl Default for BehaviorProfile {
    fn default() -> Self {
        Self {
            response_pattern: ResponsePattern::Balanced,
            intervention_timing: InterventionTiming::Adaptive,
            proactivity_level: 0.5,
        }
    }
}

pub struct BehaviorTuner {
    current_profile: BehaviorProfile,
}

impl BehaviorTuner {
    pub fn new() -> Self {
        Self {
            current_profile: BehaviorProfile::default(),
        }
    }

    /// Ajuster le comportement selon l'état de Kevin
    pub fn tune_behavior(&mut self, metrics: &super::KevinMetrics) -> Option<String> {
        let mut changes = Vec::new();

        // Ajuster pattern de réponse
        let new_pattern = if metrics.clarity_level > 0.7 && metrics.energy_level > 0.7 {
            ResponsePattern::Proactive
        } else if metrics.stress_level > 0.6 || metrics.cognitive_load > 0.7 {
            ResponsePattern::Reactive
        } else {
            ResponsePattern::Balanced
        };

        if format!("{:?}", self.current_profile.response_pattern) != format!("{:?}", new_pattern) {
            self.current_profile.response_pattern = new_pattern.clone();
            changes.push(format!("Pattern → {:?}", new_pattern));
        }

        // Ajuster timing d'intervention
        let new_timing = if metrics.stress_level > 0.6 {
            InterventionTiming::Measured // Laisser respirer
        } else if metrics.energy_level > 0.8 {
            InterventionTiming::Immediate // Réactivité élevée
        } else {
            InterventionTiming::Adaptive
        };

        if format!("{:?}", self.current_profile.intervention_timing) != format!("{:?}", new_timing) {
            self.current_profile.intervention_timing = new_timing.clone();
            changes.push(format!("Timing → {:?}", new_timing));
        }

        // Ajuster niveau de proactivité
        let new_proactivity = if metrics.clarity_level > 0.7 && metrics.energy_level > 0.7 {
            0.9 // Haute proactivité
        } else if metrics.cognitive_load > 0.7 || metrics.stress_level > 0.6 {
            0.2 // Faible proactivité
        } else {
            0.5
        };

        if (self.current_profile.proactivity_level - new_proactivity).abs() > 0.2 {
            self.current_profile.proactivity_level = new_proactivity;
            changes.push(format!("Proactivité → {:.1}", new_proactivity));
        }

        if !changes.is_empty() {
            Some(changes.join(", "))
        } else {
            None
        }
    }

    /// Obtenir le profil comportemental actuel
    pub fn get_current_profile(&self) -> &BehaviorProfile {
        &self.current_profile
    }

    /// Déterminer si le système doit être proactif maintenant
    pub fn should_be_proactive(&self, metrics: &super::KevinMetrics) -> bool {
        metrics.clarity_level > 0.7
            && metrics.energy_level > 0.7
            && self.current_profile.proactivity_level > 0.6
    }
}

impl Default for BehaviorTuner {
    fn default() -> Self {
        Self::new()
    }
}
