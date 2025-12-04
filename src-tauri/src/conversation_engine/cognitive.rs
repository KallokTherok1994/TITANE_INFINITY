/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — COGNITIVE COMPRESSOR
 * Compression cognitive des échanges conversationnels
 * ═══════════════════════════════════════════════════════════════════
 */

use super::types::{Intention, EmotionState, MemoryEffect, MemoryLayers};
use super::pipeline::CognitiveSummary;

/// Compresseur cognitif
pub struct CognitiveCompressor {
    // Futurs algorithmes de compression peuvent être ajoutés ici
}

impl CognitiveCompressor {
    pub fn new() -> Self {
        Self {}
    }

    /// Compresser un échange en résumé cognitif
    pub fn compress(
        &self,
        user_message: &str,
        assistant_message: &str,
        intention: &Intention,
        emotion: &EmotionState,
    ) -> CognitiveSummary {
        let summary = self.generate_summary(user_message, assistant_message);
        let tags = self.extract_tags(user_message, assistant_message, intention);
        let memory_effect = self.determine_memory_effect(intention, emotion);
        let memory_layers = self.analyze_memory_layers(intention, emotion, user_message);
        let links = self.extract_links(user_message, assistant_message);
        let coherence_score = self.calculate_coherence(user_message, assistant_message);

        CognitiveSummary {
            summary,
            tags,
            memory_effect,
            memory_layers,
            links,
            coherence_score,
        }
    }

    /// Générer un résumé court
    fn generate_summary(&self, user: &str, assistant: &str) -> String {
        // Simplification: prendre premiers mots
        let user_short = user.chars().take(50).collect::<String>();
        let assistant_short = assistant.chars().take(50).collect::<String>();
        format!("Q: {}... R: {}...", user_short, assistant_short)
    }

    /// Extraire des tags cognitifs
    fn extract_tags(
        &self,
        user: &str,
        assistant: &str,
        intention: &Intention,
    ) -> Vec<String> {
        let mut tags = vec![format!("{:?}", intention)];

        let combined = format!("{} {}", user, assistant).to_lowercase();

        // Tags thématiques
        if combined.contains("projet") { tags.push("projet".to_string()); }
        if combined.contains("décision") { tags.push("décision".to_string()); }
        if combined.contains("problème") { tags.push("problème".to_string()); }
        if combined.contains("idée") { tags.push("idée".to_string()); }

        tags
    }

    /// Déterminer l'effet mémoire
    fn determine_memory_effect(
        &self,
        intention: &Intention,
        emotion: &EmotionState,
    ) -> MemoryEffect {
        match intention {
            Intention::Question if emotion.valence > 0.3 => MemoryEffect::New,
            Intention::Meta => MemoryEffect::Connect,
            Intention::Emotion if emotion.intensity > 0.7 => MemoryEffect::Evolve,
            _ => MemoryEffect::Recall,
        }
    }

    /// Analyser quelles couches de mémoire activer
    fn analyze_memory_layers(
        &self,
        intention: &Intention,
        emotion: &EmotionState,
        message: &str,
    ) -> MemoryLayers {
        let mut layers = MemoryLayers::default();

        // Toujours immédiate
        layers.immediate = true;

        // Épisodique si événement significatif
        layers.episodic = message.contains("décidé")
            || message.contains("choisir")
            || emotion.intensity > 0.7
            || emotion.valence.abs() > 0.7
            || (matches!(intention, Intention::Meta) && message.len() > 200);

        // Sémantique : concepts détectés
        if message.contains("SingularityState")
            || message.contains("Humain Total")
            || message.contains("charge mentale")
        {
            layers.semantic.push("concept_titane".to_string());
        }

        // Procédurale : patterns de préférence
        if message.contains("liste") || message.contains("puces") {
            layers.procedural.push("prefers_lists".to_string());
        }
        if message.contains("synthèse") || message.contains("résumé") {
            layers.procedural.push("prefers_summary".to_string());
        }

        // Réflexive si nécessite évaluation
        layers.reflective = matches!(intention, Intention::Meta) || emotion.valence < -0.5;

        layers
    }

    /// Extraire des liens contextuels
    fn extract_links(&self, user: &str, _assistant: &str) -> Vec<String> {
        let mut links = Vec::new();

        let lower = user.to_lowercase();
        if lower.contains("comme") || lower.contains("précédemment") {
            links.push("previous_context".to_string());
        }

        links
    }

    /// Calculer score de cohérence
    fn calculate_coherence(&self, user: &str, assistant: &str) -> f32 {
        // Simplification: basé sur longueur relative
        let user_len = user.len() as f32;
        let assistant_len = assistant.len() as f32;

        if user_len == 0.0 || assistant_len == 0.0 {
            return 0.5;
        }

        let ratio = (assistant_len / user_len).min(5.0) / 5.0;
        ratio.clamp(0.3, 1.0)
    }
}
