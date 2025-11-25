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
        let mut state = BodyState::default();

        state.energy_level = 0.1;
        assert!(state.is_depleted());

        state.energy_level = 0.8;
        assert!(!state.is_depleted());
    }

    #[test]
    fn test_body_state_tension() {
        let mut state = BodyState::default();

        state.physical_tension = 0.8;
        assert!(state.is_tense());

        state.physical_tension = 0.3;
        assert!(!state.is_tense());
    }

    #[test]
    fn test_body_vitality_score() {
        let mut state = BodyState::default();

        // Haute énergie, faible stress
        state.energy_level = 0.9;
        state.rhythm_quality = 0.9;
        state.physical_tension = 0.1;
        state.voice_fatigue = 0.1;
        state.environment_stress = 0.1;

        let score = state.vitality_score();
        assert!(score > 0.7);

        // Faible énergie, stress élevé
        state.energy_level = 0.2;
        state.rhythm_quality = 0.2;
        state.physical_tension = 0.9;
        state.voice_fatigue = 0.9;
        state.environment_stress = 0.9;

        let score = state.vitality_score();
        assert!(score < 0.3);
    }

    #[test]
    fn test_body_needs_break() {
        let mut state = BodyState::default();

        // Cas 1: Énergie déplétée
        state.energy_level = 0.1;
        assert!(state.needs_physical_break());

        // Cas 2: Tension élevée
        state = BodyState::default();
        state.physical_tension = 0.8;
        assert!(state.needs_physical_break());

        // Cas 3: Fatigue vocale
        state = BodyState::default();
        state.voice_fatigue = 0.7;
        assert!(state.needs_physical_break());

        // Cas 4: Tout va bien
        state = BodyState::default();
        assert!(!state.needs_physical_break());
    }

    #[test]
    fn test_physiological_signals_stress_detection() {
        let mut signals = PhysiologicalSignals::default();

        // Parole rapide
        signals.speech_rate = 250.0;
        let markers = signals.detect_stress_markers();
        assert!(markers.contains(&StressMarker::RapidSpeech));

        // Tension pitch
        signals = PhysiologicalSignals::default();
        signals.pitch_stability = 0.3;
        let markers = signals.detect_stress_markers();
        assert!(markers.contains(&StressMarker::PitchTension));

        // Pauses irrégulières
        signals = PhysiologicalSignals::default();
        signals.pause_pattern = PausePattern::Irregular;
        let markers = signals.detect_stress_markers();
        assert!(markers.contains(&StressMarker::IrregularPauses));

        // Énergie faible
        signals = PhysiologicalSignals::default();
        signals.energy_mean = 0.2;
        let markers = signals.detect_stress_markers();
        assert!(markers.contains(&StressMarker::LowEnergy));
    }

    #[test]
    fn test_physiological_stress_score() {
        let mut signals = PhysiologicalSignals::default();

        // Stress élevé
        signals.speech_rate = 250.0;
        signals.pitch_stability = 0.2;
        signals.pause_pattern = PausePattern::Irregular;
        signals.energy_mean = 0.2;

        let score = signals.stress_score();
        assert!(score > 0.6);

        // Calme
        signals = PhysiologicalSignals::default();
        signals.speech_rate = 150.0;
        signals.pitch_stability = 0.9;
        signals.pause_pattern = PausePattern::Regular;

        let score = signals.stress_score();
        assert!(score < 0.3);
    }
}
