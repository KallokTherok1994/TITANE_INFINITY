#![allow(dead_code)]
// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                    INTERRUPTIBILITY ANALYZER v13                             ║
// ║                  Analyse la cause des interruptions                          ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

use super::InterruptionCause;
use std::time::{Duration, Instant};

/// Analyseur d'interruptions
pub struct InterruptionAnalyzer {
    /// Historique des interruptions
    history: Vec<InterruptionEvent>,
    /// Seuils de détection
    thresholds: AnalysisThresholds,
}

/// Événement d'interruption
#[derive(Debug, Clone)]
struct InterruptionEvent {
    /// Timestamp
    timestamp: Instant,
    /// Cause détectée
    cause: InterruptionCause,
    /// Temps depuis le début de la réponse IA (ms)
    response_time: Duration,
    /// Longueur de la réponse avant interruption (mots)
    response_length: usize,
    /// Contexte émotionnel
    emotional_context: EmotionalContext,
}

#[derive(Debug, Clone)]
struct EmotionalContext {
    /// Intensité émotionnelle (0.0 - 1.0)
    intensity: f32,
    /// Valence (négative/neutre/positive)
    valence: f32,
}

#[derive(Debug, Clone)]
struct AnalysisThresholds {
    /// Interruption rapide = impatience (ms)
    quick_interrupt_ms: u64,
    /// Interruption très rapide = confusion (ms)
    very_quick_interrupt_ms: u64,
    /// Intensité émotionnelle élevée
    high_emotion_threshold: f32,
}

impl Default for AnalysisThresholds {
    fn default() -> Self {
        Self {
            quick_interrupt_ms: 2000,
            very_quick_interrupt_ms: 500,
            high_emotion_threshold: 0.7,
        }
    }
}

impl InterruptionAnalyzer {
    /// Crée un nouvel analyseur
    pub fn new() -> Self {
        Self {
            history: Vec::new(),
            thresholds: AnalysisThresholds::default(),
        }
    }

    /// Analyse une interruption et détermine sa cause
    pub fn analyze_interruption(
        &mut self,
        response_time: Duration,
        response_length: usize,
        user_input: &str,
        emotion_intensity: f32,
        emotion_valence: f32,
    ) -> InterruptionCause {
        let emotional_context = EmotionalContext {
            intensity: emotion_intensity,
            valence: emotion_valence,
        };

        // Détection basée sur le timing
        let timing_cause = self.analyze_timing(response_time);

        // Détection basée sur le contenu
        let content_cause = self.analyze_content(user_input);

        // Détection basée sur l'émotion
        let emotion_cause = self.analyze_emotion(&emotional_context);

        // Fusion des analyses avec priorité
        let cause = self.determine_primary_cause(
            timing_cause,
            content_cause,
            emotion_cause,
            &emotional_context,
        );

        // Enregistrer l'événement
        self.history.push(InterruptionEvent {
            timestamp: Instant::now(),
            cause: cause.clone(),
            response_time,
            response_length,
            emotional_context,
        });

        // Nettoyer l'historique ancien (> 1 heure)
        self.cleanup_old_history();

        cause
    }

    /// Analyse basée sur le timing
    fn analyze_timing(&self, response_time: Duration) -> Option<InterruptionCause> {
        let ms = response_time.as_millis() as u64;

        if ms < self.thresholds.very_quick_interrupt_ms {
            Some(InterruptionCause::Confusion)
        } else if ms < self.thresholds.quick_interrupt_ms {
            Some(InterruptionCause::Impatience)
        } else {
            None
        }
    }

    /// Analyse basée sur le contenu de l'interruption
    fn analyze_content(&self, user_input: &str) -> Option<InterruptionCause> {
        let input_lower = user_input.to_lowercase();

        // Mots-clés de correction
        if input_lower.contains("non") || input_lower.contains("faux") || 
           input_lower.contains("erreur") || input_lower.contains("pas ça") {
            return Some(InterruptionCause::Correction);
        }

        // Mots-clés de confusion
        if input_lower.contains("quoi") || input_lower.contains("comprends pas") ||
           input_lower.contains("comment") || input_lower.contains("explique") {
            return Some(InterruptionCause::Confusion);
        }

        // Changement de sujet abrupt
        if input_lower.starts_with("plutôt") || input_lower.starts_with("en fait") ||
           input_lower.starts_with("sinon") || input_lower.starts_with("d'ailleurs") {
            return Some(InterruptionCause::TopicChange);
        }

        // Clarification
        if input_lower.starts_with("c'est-à-dire") || input_lower.contains("préciser") ||
           input_lower.contains("ajouter que") {
            return Some(InterruptionCause::Clarification);
        }

        None
    }

    /// Analyse basée sur l'émotion
    fn analyze_emotion(&self, emotion: &EmotionalContext) -> Option<InterruptionCause> {
        if emotion.intensity > self.thresholds.high_emotion_threshold {
            Some(InterruptionCause::EmotionalReaction)
        } else {
            None
        }
    }

    /// Détermine la cause primaire parmi les analyses
    fn determine_primary_cause(
        &self,
        timing: Option<InterruptionCause>,
        content: Option<InterruptionCause>,
        emotion: Option<InterruptionCause>,
        emotional_context: &EmotionalContext,
    ) -> InterruptionCause {
        // Priorité : émotion forte > contenu explicite > timing
        if let Some(cause) = emotion {
            if emotional_context.intensity > 0.8 {
                return cause;
            }
        }

        if let Some(cause) = content {
            return cause;
        }

        if let Some(cause) = timing {
            return cause;
        }

        // Si détection naturelle du flow (interruption calme, normale)
        if emotional_context.intensity < 0.3 {
            InterruptionCause::NaturalFlow
        } else {
            InterruptionCause::Unknown
        }
    }

    /// Calcule le taux d'interruption récent
    pub fn calculate_interruption_rate(&self, window: Duration) -> f32 {
        let now = Instant::now();
        let recent = self.history.iter()
            .filter(|e| now.duration_since(e.timestamp) < window)
            .count();

        // Normaliser sur une échelle 0.0-1.0
        (recent as f32 / 10.0).min(1.0)
    }

    /// Obtient les statistiques d'interruption
    pub fn get_stats(&self) -> InterruptionStats {
        let total = self.history.len();
        if total == 0 {
            return InterruptionStats::default();
        }

        let confusion_count = self.history.iter().filter(|e| matches!(e.cause, InterruptionCause::Confusion)).count();
        let correction_count = self.history.iter().filter(|e| matches!(e.cause, InterruptionCause::Correction)).count();
        let impatience_count = self.history.iter().filter(|e| matches!(e.cause, InterruptionCause::Impatience)).count();

        let avg_response_time = self.history.iter()
            .map(|e| e.response_time.as_millis())
            .sum::<u128>() / total as u128;

        InterruptionStats {
            total_interruptions: total,
            confusion_rate: confusion_count as f32 / total as f32,
            correction_rate: correction_count as f32 / total as f32,
            impatience_rate: impatience_count as f32 / total as f32,
            avg_response_time_ms: avg_response_time as u64,
        }
    }

    /// Nettoie l'historique ancien
    fn cleanup_old_history(&mut self) {
        let cutoff = Instant::now() - Duration::from_secs(3600); // 1 heure
        self.history.retain(|e| e.timestamp > cutoff);
    }
}

/// Statistiques d'interruption
#[derive(Debug, Clone, Default)]
pub struct InterruptionStats {
    pub total_interruptions: usize,
    pub confusion_rate: f32,
    pub correction_rate: f32,
    pub impatience_rate: f32,
    pub avg_response_time_ms: u64,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_timing_analysis() {
        let analyzer = InterruptionAnalyzer::new();
        
        // Très rapide = confusion
        let cause = analyzer.analyze_timing(Duration::from_millis(300));
        assert!(matches!(cause, Some(InterruptionCause::Confusion)));

        // Rapide = impatience
        let cause = analyzer.analyze_timing(Duration::from_millis(1500));
        assert!(matches!(cause, Some(InterruptionCause::Impatience)));
    }

    #[test]
    fn test_content_analysis() {
        let analyzer = InterruptionAnalyzer::new();

        let cause = analyzer.analyze_content("Non, c'est faux");
        assert!(matches!(cause, Some(InterruptionCause::Correction)));

        let cause = analyzer.analyze_content("Je comprends pas");
        assert!(matches!(cause, Some(InterruptionCause::Confusion)));
    }

    #[test]
    fn test_interruption_rate() {
        let mut analyzer = InterruptionAnalyzer::new();
        
        // Simuler 3 interruptions
        for _ in 0..3 {
            analyzer.analyze_interruption(
                Duration::from_millis(1000),
                50,
                "test",
                0.5,
                0.0,
            );
        }

        let rate = analyzer.calculate_interruption_rate(Duration::from_secs(60));
        assert!(rate > 0.0 && rate <= 1.0);
    }
}
