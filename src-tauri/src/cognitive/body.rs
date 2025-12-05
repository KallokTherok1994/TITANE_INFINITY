use serde::{Deserialize, Serialize};

/// État du centre corps (énergie/fatigue)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BodyState {
    pub energy_level: f32,       // 0.0 → 1.0
    pub physical_tension: f32,   // 0.0 → 1.0
    pub voice_fatigue: f32,      // 0.0 → 1.0 (détecté via audio)
    pub rhythm_quality: f32,     // 0.0 → 1.0 (respiration, débit)
    pub environment_stress: f32, // 0.0 → 1.0 (bruit, interruptions)
}

impl Default for BodyState {
    fn default() -> Self {
        Self {
            energy_level: 0.7,
            physical_tension: 0.3,
            voice_fatigue: 0.2,
            rhythm_quality: 0.7,
            environment_stress: 0.3,
        }
    }
}

impl BodyState {
    /// Vérifie si énergie critique
    pub fn is_depleted(&self) -> bool {
        self.energy_level < 0.2
    }

    /// Vérifie si tension élevée
    pub fn is_tense(&self) -> bool {
        self.physical_tension > 0.7
    }

    /// Vérifie si fatigue vocale
    pub fn has_voice_fatigue(&self) -> bool {
        self.voice_fatigue > 0.6
    }

    /// Vérifie si environnement stressant
    pub fn is_environment_stressful(&self) -> bool {
        self.environment_stress > 0.6
    }

    /// Score global de vitalité
    pub fn vitality_score(&self) -> f32 {
        let positive = self.energy_level + self.rhythm_quality;
        let negative = self.physical_tension + self.voice_fatigue + self.environment_stress;

        let score = (positive / 2.0) - (negative / 3.0) * 0.5;
        score.clamp(0.0, 1.0)
    }

    /// Besoin de pause physique
    pub fn needs_physical_break(&self) -> bool {
        self.is_depleted() || self.is_tense() || self.has_voice_fatigue()
    }
}

/// Indicateurs physiologiques (via audio)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhysiologicalSignals {
    pub speech_rate: f32,     // mots/min
    pub pitch_stability: f32, // variabilité pitch
    pub energy_mean: f32,     // volume moyen
    pub pause_pattern: PausePattern,
    pub stress_markers: Vec<StressMarker>,
}

impl Default for PhysiologicalSignals {
    fn default() -> Self {
        Self {
            speech_rate: 150.0, // Moyenne normale
            pitch_stability: 0.7,
            energy_mean: 0.5,
            pause_pattern: PausePattern::Regular,
            stress_markers: Vec::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum PausePattern {
    Regular,   // Pauses régulières, respiration normale
    Irregular, // Pauses chaotiques
    Rare,      // Peu de pauses (stress/précipitation)
    Excessive, // Trop de pauses (fatigue/hésitation)
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum StressMarker {
    RapidSpeech,     // Parole rapide (>200 mots/min)
    PitchTension,    // Tension dans la voix
    IrregularPauses, // Pauses irrégulières
    LowEnergy,       // Volume faible (fatigue)
    VoiceShaking,    // Tremblement vocal (stress/émotion)
}

impl PhysiologicalSignals {
    /// Détecte marqueurs de stress depuis signaux
    pub fn detect_stress_markers(&self) -> Vec<StressMarker> {
        let mut markers = Vec::new();

        if self.speech_rate > 200.0 {
            markers.push(StressMarker::RapidSpeech);
        }

        if self.pitch_stability < 0.4 {
            markers.push(StressMarker::PitchTension);
        }

        if self.pause_pattern == PausePattern::Irregular {
            markers.push(StressMarker::IrregularPauses);
        }

        if self.energy_mean < 0.3 {
            markers.push(StressMarker::LowEnergy);
        }

        markers
    }

    /// Score de stress global (0.0 = calme, 1.0 = très stressé)
    pub fn stress_score(&self) -> f32 {
        let marker_count = self.detect_stress_markers().len();
        let marker_score = (marker_count as f32 / 5.0).min(1.0);

        // Combiner avec autres facteurs
        let rate_factor = if self.speech_rate > 200.0 {
            (self.speech_rate - 200.0) / 100.0
        } else {
            0.0
        }
        .min(0.5);

        let stability_factor = (1.0 - self.pitch_stability) * 0.3;

        (marker_score + rate_factor + stability_factor).clamp(0.0, 1.0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_body_state_energy() {
        let state1 = BodyState {
            energy_level: 0.1,
            ..Default::default()
        };

        assert!(state1.is_depleted());

        let state2 = BodyState {
            energy_level: 0.8,
            ..Default::default()
        };
        assert!(!state2.is_depleted());
    }

    #[test]
    fn test_body_state_tension() {
        let state1 = BodyState {
            physical_tension: 0.8,
            ..Default::default()
        };

        assert!(state1.is_tense());

        let state2 = BodyState {
            physical_tension: 0.3,
            ..Default::default()
        };
        assert!(!state2.is_tense());
    }

    #[test]
    fn test_body_vitality_score() {
        // Haute énergie, faible stress
        let state1 = BodyState {
            energy_level: 0.9,
            rhythm_quality: 0.9,
            physical_tension: 0.1,
            voice_fatigue: 0.1,
            environment_stress: 0.1,
        };

        let score = state1.vitality_score();
        assert!(score > 0.7);

        // Faible énergie, stress élevé
        let state2 = BodyState {
            energy_level: 0.2,
            rhythm_quality: 0.2,
            physical_tension: 0.9,
            voice_fatigue: 0.9,
            environment_stress: 0.9,
        };

        let score = state2.vitality_score();
        assert!(score < 0.3);
    }

    #[test]
    fn test_body_needs_break() {
        // Cas 1: Énergie déplétée
        let state1 = BodyState {
            energy_level: 0.1,
            ..Default::default()
        };
        assert!(state1.needs_physical_break());

        // Cas 2: Tension élevée
        let state2 = BodyState {
            physical_tension: 0.8,
            ..Default::default()
        };
        assert!(state2.needs_physical_break());

        // Cas 3: Fatigue vocale
        let state3 = BodyState {
            voice_fatigue: 0.7,
            ..Default::default()
        };
        assert!(state3.needs_physical_break());

        // Cas 4: Tout va bien
        let state4 = BodyState::default();
        assert!(!state4.needs_physical_break());
    }

    #[test]
    fn test_physiological_signals_stress_detection() {
        // Parole rapide
        let signals1 = PhysiologicalSignals {
            speech_rate: 250.0,
            ..Default::default()
        };
        let markers = signals1.detect_stress_markers();
        assert!(markers.contains(&StressMarker::RapidSpeech));

        // Tension pitch
        let signals2 = PhysiologicalSignals {
            pitch_stability: 0.3,
            ..Default::default()
        };
        let markers = signals2.detect_stress_markers();
        assert!(markers.contains(&StressMarker::PitchTension));

        // Pauses irrégulières
        let signals3 = PhysiologicalSignals {
            pause_pattern: PausePattern::Irregular,
            ..Default::default()
        };
        let markers = signals3.detect_stress_markers();
        assert!(markers.contains(&StressMarker::IrregularPauses));

        // Énergie faible
        let signals4 = PhysiologicalSignals {
            energy_mean: 0.2,
            ..Default::default()
        };
        let markers = signals4.detect_stress_markers();
        assert!(markers.contains(&StressMarker::LowEnergy));
    }

    #[test]
    fn test_physiological_stress_score() {
        // Stress élevé
        let signals1 = PhysiologicalSignals {
            speech_rate: 250.0,
            pitch_stability: 0.2,
            pause_pattern: PausePattern::Irregular,
            energy_mean: 0.2,
            stress_markers: Vec::new(),
        };

        let score = signals1.stress_score();
        assert!(score > 0.6);

        // Calme
        let signals2 = PhysiologicalSignals {
            speech_rate: 150.0,
            pitch_stability: 0.9,
            pause_pattern: PausePattern::Regular,
            energy_mean: 0.5,
            stress_markers: Vec::new(),
        };

        let score = signals2.stress_score();
        assert!(score < 0.3);
    }
}
