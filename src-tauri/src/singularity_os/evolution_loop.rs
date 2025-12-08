// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Evolution Loop v∞
//   SUPER PROMPT #7 — Boucle d'évolution méta-cognitive
// ═══════════════════════════════════════════════════════════════

use crate::singularity_os::state::{SingularityState, CognitiveMode};
use crate::singularity_os::coherence_supervisor::CoherenceReport;
use serde::{Deserialize, Serialize};

/// Evolution Loop — Boucle d'évolution et d'auto-ajustement
/// 
/// Responsabilités:
/// - Évaluer et ajuster mode cognitif global
/// - Corriger dérives détectées
/// - Ajuster tonalité affective
/// - Augmenter cohérence conversationnelle
/// - Évolution douce basée sur métriques
pub struct EvolutionLoop;

/// Résultat d'évolution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvolutionResult {
    /// Ancien mode cognitif
    pub previous_mode: CognitiveMode,
    
    /// Nouveau mode cognitif
    pub new_mode: CognitiveMode,
    
    /// Changement de mode effectué
    pub mode_changed: bool,
    
    /// Ancien niveau de cohérence
    pub previous_coherence: f32,
    
    /// Nouveau niveau de cohérence
    pub new_coherence: f32,
    
    /// Ancienne tonalité affective
    pub previous_tone: f32,
    
    /// Nouvelle tonalité affective
    pub new_tone: f32,
    
    /// Liste des ajustements effectués
    pub adjustments: Vec<String>,
    
    /// Recommandations pour évolution future
    pub recommendations: Vec<String>,
}

/// Configuration d'évolution
#[derive(Debug, Clone)]
pub struct EvolutionConfig {
    /// Seuil de cohérence minimum (déclenche correction)
    pub min_coherence_threshold: f32,
    
    /// Ampleur maximale d'ajustement tonal (par tick)
    pub max_tone_adjustment: f32,
    
    /// Fréquence de changement de mode (évite oscillations)
    pub mode_change_cooldown: u64,
    
    /// Activer évolution automatique
    pub auto_evolve: bool,
}

impl Default for EvolutionConfig {
    fn default() -> Self {
        Self {
            min_coherence_threshold: 0.6,
            max_tone_adjustment: 0.1,
            mode_change_cooldown: 10, // 10 interactions minimum entre changements
            auto_evolve: true,
        }
    }
}

impl EvolutionLoop {
    /// Évaluer et évoluer l'état global
    /// 
    /// Pipeline:
    /// 1. Évaluer métriques actuelles
    /// 2. Détecter dérives ou problèmes
    /// 3. Proposer ajustements
    /// 4. Appliquer corrections douces
    /// 5. Mettre à jour état
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
        
        // 1. Ajustement de cohérence
        if let Some(report) = coherence_report {
            if report.overall_score < config.min_coherence_threshold {
                // Diminuer légèrement la cohérence pour refléter problèmes
                let new_coherence = (state.coherence_level * 0.9 + report.overall_score * 0.1)
                    .clamp(0.0, 1.0);
                state.update_coherence(new_coherence);
                adjustments.push(format!(
                    "Cohérence ajustée: {:.2} → {:.2}",
                    previous_coherence,
                    new_coherence
                ));
                
                recommendations.push("Améliorer structure et logique des réponses".to_string());
            } else {
                // Augmenter légèrement la cohérence (renforcement positif)
                let new_coherence = (state.coherence_level * 0.95 + 1.0 * 0.05)
                    .clamp(0.0, 1.0);
                state.update_coherence(new_coherence);
            }
        }
        
        // 2. Ajustement tonal
        let tone_adjustment = Self::evaluate_tone_adjustment(state, coherence_report);
        if tone_adjustment.abs() > 0.01 {
            let new_tone = (state.affective_tone + tone_adjustment.clamp(
                -config.max_tone_adjustment,
                config.max_tone_adjustment
            )).clamp(-1.0, 1.0);
            
            state.update_affective_tone(new_tone);
            adjustments.push(format!(
                "Tonalité ajustée: {:.2} → {:.2}",
                previous_tone,
                new_tone
            ));
        }
        
        // 3. Évaluation changement de mode
        let mode_changed = if config.auto_evolve {
            let new_mode = Self::evaluate_mode_change(state, coherence_report);
            if new_mode != state.global_mode {
                state.adjust_mode(new_mode);
                adjustments.push(format!(
                    "Mode changé: {} → {}",
                    previous_mode,
                    new_mode
                ));
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
        
        // 4. Recommandations générales
        if state.total_interactions > 100 && state.coherence_level < 0.7 {
            recommendations.push("Considérer réinitialisation de session (cohérence faible)".to_string());
        }
        
        if state.long_context.len() > 80 {
            recommendations.push("Contexte proche de saturation, considérer consolidation".to_string());
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
    
    /// Évaluer ajustement tonal nécessaire
    fn evaluate_tone_adjustment(
        state: &SingularityState,
        coherence_report: Option<&CoherenceReport>,
    ) -> f32 {
        if let Some(report) = coherence_report {
            // Si dérive tonale détectée, corriger vers neutre (0.0)
            if report.tonal_score < 0.7 {
                return -state.affective_tone * 0.2; // 20% correction vers 0.0
            }
            
            // Si tonalité très négative, ajuster vers neutralité
            if state.affective_tone < -0.5 {
                return 0.05; // Légère correction positive
            }
            
            // Si tonalité très positive, ajuster vers neutralité
            if state.affective_tone > 0.5 {
                return -0.05; // Légère correction négative
            }
        }
        
        0.0
    }
    
    /// Évaluer changement de mode cognitif
    /// 
    /// Logique:
    /// - Cohérence faible (<0.6) → Mode Analyst (analyse)
    /// - Interactions longues (>50) → Mode Architect (vision long terme)
    /// - Cohérence élevée (>0.85) → Mode Expert (confiance)
    /// - Tonalité négative → Mode Coach (accompagnement)
    /// - Par défaut → Mode Coach
    fn evaluate_mode_change(
        state: &SingularityState,
        coherence_report: Option<&CoherenceReport>,
    ) -> CognitiveMode {
        // Règle 1: Cohérence faible → Analyst
        if let Some(report) = coherence_report {
            if report.overall_score < 0.6 {
                return CognitiveMode::Analyst;
            }
        }
        
        // Règle 2: Cohérence basse dans état → Analyst
        if state.coherence_level < 0.6 {
            return CognitiveMode::Analyst;
        }
        
        // Règle 3: Session longue → Architect (vision globale)
        if state.total_interactions > 50 {
            return CognitiveMode::Architect;
        }
        
        // Règle 4: Cohérence élevée → Expert
        if state.coherence_level > 0.85 {
            return CognitiveMode::Expert;
        }
        
        // Règle 5: Tonalité négative → Coach (support)
        if state.affective_tone < -0.3 {
            return CognitiveMode::Coach;
        }
        
        // Règle 6: Tonalité très positive → Observer (écoute)
        if state.affective_tone > 0.5 {
            return CognitiveMode::Observer;
        }
        
        // Par défaut: maintenir mode actuel ou Coach
        if matches!(state.global_mode, CognitiveMode::Coach) {
            CognitiveMode::Coach
        } else {
            state.global_mode
        }
    }
    
    /// Évaluer si réinitialisation recommandée
    pub fn should_reset(state: &SingularityState) -> bool {
        // Critère 1: Cohérence critique (<0.3)
        if state.coherence_level < 0.3 {
            return true;
        }
        
        // Critère 2: Session très longue (>200 interactions) avec cohérence faible
        if state.total_interactions > 200 && state.coherence_level < 0.5 {
            return true;
        }
        
        // Critère 3: Contexte saturé (>95 items)
        if state.long_context.len() > 95 {
            return true;
        }
        
        false
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::singularity_os::coherence_supervisor::CoherenceReport;

    #[test]
    fn test_evolve_without_report() {
        let mut state = SingularityState::new();
        let config = EvolutionConfig::default();
        
        let result = EvolutionLoop::evolve(&mut state, None, &config);
        
        assert_eq!(result.previous_mode, CognitiveMode::Coach);
        // Should maintain or evolve based on state only
    }

    #[test]
    fn test_evolve_with_low_coherence() {
        let mut state = SingularityState::new();
        state.update_coherence(0.4);
        
        let report = CoherenceReport {
            overall_score: 0.4,
            logical_score: 0.5,
            tonal_score: 0.5,
            structural_score: 0.3,
            issues: vec![],
            recommendations: vec![],
            is_valid: false,
        };
        
        let config = EvolutionConfig::default();
        let result = EvolutionLoop::evolve(&mut state, Some(&report), &config);
        
        assert!(result.new_coherence < result.previous_coherence || result.new_coherence == 0.0);
    }

    #[test]
    fn test_evaluate_tone_adjustment_negative() {
        let mut state = SingularityState::new();
        state.update_affective_tone(-0.8);
        
        let adjustment = EvolutionLoop::evaluate_tone_adjustment(&state, None);
        assert!(adjustment > 0.0); // Should correct towards neutral
    }

    #[test]
    fn test_evaluate_tone_adjustment_positive() {
        let mut state = SingularityState::new();
        state.update_affective_tone(0.8);
        
        let adjustment = EvolutionLoop::evaluate_tone_adjustment(&state, None);
        assert!(adjustment < 0.0); // Should correct towards neutral
    }

    #[test]
    fn test_evaluate_mode_change_low_coherence() {
        let mut state = SingularityState::new();
        state.update_coherence(0.5);
        
        let mode = EvolutionLoop::evaluate_mode_change(&state, None);
        assert_eq!(mode, CognitiveMode::Analyst);
    }

    #[test]
    fn test_evaluate_mode_change_long_session() {
        let mut state = SingularityState::new();
        for _ in 0..60 {
            state.increment_interactions();
        }
        
        let mode = EvolutionLoop::evaluate_mode_change(&state, None);
        assert_eq!(mode, CognitiveMode::Architect);
    }

    #[test]
    fn test_evaluate_mode_change_high_coherence() {
        let mut state = SingularityState::new();
        state.update_coherence(0.9);
        
        let mode = EvolutionLoop::evaluate_mode_change(&state, None);
        assert_eq!(mode, CognitiveMode::Expert);
    }

    #[test]
    fn test_should_reset_critical_coherence() {
        let mut state = SingularityState::new();
        state.update_coherence(0.2);
        
        assert!(EvolutionLoop::should_reset(&state));
    }

    #[test]
    fn test_should_reset_long_session() {
        let mut state = SingularityState::new();
        state.update_coherence(0.4);
        for _ in 0..250 {
            state.increment_interactions();
        }
        
        assert!(EvolutionLoop::should_reset(&state));
    }

    #[test]
    fn test_should_not_reset_healthy() {
        let state = SingularityState::new();
        
        assert!(!EvolutionLoop::should_reset(&state));
    }
}
