// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Evolution Loop v∞
//   Boucle d'évolution méta-cognitive
// ═══════════════════════════════════════════════════════════════

use crate::singularity_cortex::coherence_supervisor::CoherenceReport;
use crate::singularity_cortex::state::{CognitiveMode, SingularityState};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvolutionResult {
    pub previous_mode: CognitiveMode,
    pub new_mode: CognitiveMode,
    pub mode_changed: bool,
    pub previous_coherence: f32,
    pub new_coherence: f32,
    pub previous_tone: f32,
    pub new_tone: f32,
    pub adjustments: Vec<String>,
    pub recommendations: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct EvolutionConfig {
    pub min_coherence_threshold: f32,
    pub max_tone_adjustment: f32,
    pub mode_change_cooldown: u64,
    pub auto_evolve: bool,
}

impl Default for EvolutionConfig {
    fn default() -> Self {
        Self {
            min_coherence_threshold: 0.6,
            max_tone_adjustment: 0.1,
            mode_change_cooldown: 10,
            auto_evolve: true,
        }
    }
}

pub struct EvolutionLoop;

impl EvolutionLoop {
    pub fn evolve(
        state: &mut SingularityState,
        coherence_report: Option<&CoherenceReport>,
        config: &EvolutionConfig,
    ) -> EvolutionResult {
        let previous_mode = state.global_mode;
        let previous_coherence = state.coherence_level;
        let previous_tone = state.affective_tone;

        let mut adjustments = Vec::new();
        let mut recommendations = Vec::new();

        if let Some(report) = coherence_report {
            if report.overall_score < config.min_coherence_threshold {
                let new_coherence =
                    (state.coherence_level * 0.9 + report.overall_score * 0.1).clamp(0.0, 1.0);
                state.update_coherence(new_coherence);
                adjustments.push(format!(
                    "Cohérence ajustée: {:.2} → {:.2}",
                    previous_coherence, new_coherence
                ));
                recommendations.push("Améliorer structure et logique des réponses".to_string());
            } else {
                let new_coherence = (state.coherence_level * 0.95 + 1.0 * 0.05).clamp(0.0, 1.0);
                state.update_coherence(new_coherence);
            }
        }

        let tone_adjustment = Self::evaluate_tone_adjustment(state, coherence_report);
        if tone_adjustment.abs() > 0.01 {
            let new_tone = (state.affective_tone
                + tone_adjustment.clamp(-config.max_tone_adjustment, config.max_tone_adjustment))
            .clamp(-1.0, 1.0);
            state.update_affective_tone(new_tone);
            adjustments.push(format!(
                "Tonalité ajustée: {:.2} → {:.2}",
                previous_tone, new_tone
            ));
        }

        let mode_changed = if config.auto_evolve {
            let new_mode = Self::evaluate_mode_change(state, coherence_report);
            if new_mode != state.global_mode {
                state.adjust_mode(new_mode);
                adjustments.push(format!("Mode changé: {} → {}", previous_mode, new_mode));
                recommendations.push(format!(
                    "Continuer en mode {} pour optimiser performance",
                    new_mode
                ));
                true
            } else {
                false
            }
        } else {
            false
        };

        if state.total_interactions > 100 && state.coherence_level < 0.7 {
            recommendations
                .push("Considérer réinitialisation de session (cohérence faible)".to_string());
        }

        if state.long_context.len() > 80 {
            recommendations
                .push("Contexte proche de saturation, considérer consolidation".to_string());
        }

        EvolutionResult {
            previous_mode,
            new_mode: state.global_mode,
            mode_changed,
            previous_coherence,
            new_coherence: state.coherence_level,
            previous_tone,
            new_tone: state.affective_tone,
            adjustments,
            recommendations,
        }
    }

    fn evaluate_tone_adjustment(
        state: &SingularityState,
        coherence_report: Option<&CoherenceReport>,
    ) -> f32 {
        if let Some(report) = coherence_report {
            if report.tonal_score < 0.7 {
                return -state.affective_tone * 0.2;
            }
            if state.affective_tone < -0.5 {
                return 0.05;
            }
            if state.affective_tone > 0.5 {
                return -0.05;
            }
        }
        0.0
    }

    fn evaluate_mode_change(
        state: &SingularityState,
        coherence_report: Option<&CoherenceReport>,
    ) -> CognitiveMode {
        if let Some(report) = coherence_report {
            if report.overall_score < 0.6 {
                return CognitiveMode::Analyst;
            }
        }

        if state.coherence_level < 0.6 {
            return CognitiveMode::Analyst;
        }

        if state.total_interactions > 50 {
            return CognitiveMode::Architect;
        }

        if state.coherence_level > 0.85 {
            return CognitiveMode::Expert;
        }

        if state.affective_tone < -0.3 {
            return CognitiveMode::Coach;
        }

        if state.affective_tone > 0.5 {
            return CognitiveMode::Observer;
        }

        if matches!(state.global_mode, CognitiveMode::Coach) {
            CognitiveMode::Coach
        } else {
            state.global_mode
        }
    }

    pub fn should_reset(state: &SingularityState) -> bool {
        if state.coherence_level < 0.3 {
            return true;
        }
        if state.total_interactions > 200 && state.coherence_level < 0.5 {
            return true;
        }
        if state.long_context.len() > 95 {
            return true;
        }
        false
    }
}
