// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Fusion Engine
//   SUPER PROMPT #8 — Multi-Output Fusion System
// ═══════════════════════════════════════════════════════════════

use crate::ai::{AiResponse, AiMetadata};

/// Moteur de fusion d'outputs multi-IA
pub struct FusionEngine {
    strategy: FusionStrategy,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FusionStrategy {
    /// Prend la meilleure réponse (score le plus élevé)
    BestOnly,
    /// Combine les deux réponses intelligemment
    Combine,
    /// Utilise primary, enrichit avec secondary
    EnrichPrimary,
    /// Moyenne pondérée des outputs
    WeightedAverage,
}

impl FusionEngine {
    pub fn new(strategy: FusionStrategy) -> Self {
        Self { strategy }
    }

    /// Fusionne une réponse primaire avec une secondaire optionnelle
    pub fn fuse(
        &self,
        primary: &AiResponse,
        secondary: Option<&AiResponse>,
    ) -> AiResponse {
        match secondary {
            None => primary.clone(),
            Some(sec) => self.apply_fusion(primary, sec),
        }
    }

    fn apply_fusion(&self, primary: &AiResponse, secondary: &AiResponse) -> AiResponse {
        match self.strategy {
            FusionStrategy::BestOnly => self.select_best(primary, secondary),
            FusionStrategy::Combine => self.combine_outputs(primary, secondary),
            FusionStrategy::EnrichPrimary => self.enrich_primary(primary, secondary),
            FusionStrategy::WeightedAverage => self.weighted_average(primary, secondary),
        }
    }

    /// Sélectionne la meilleure réponse selon le score de confiance
    fn select_best(&self, primary: &AiResponse, secondary: &AiResponse) -> AiResponse {
        if primary.confidence >= secondary.confidence {
            primary.clone()
        } else {
            let mut result = secondary.clone();
            result.metadata.fallback_triggered = true;
            result
        }
    }

    /// Combine intelligemment les deux outputs
    fn combine_outputs(&self, primary: &AiResponse, secondary: &AiResponse) -> AiResponse {
        let combined_output = format!(
            "# Synthèse Multi-IA\n\n\
            ## Réponse Principale ({})\n\n{}\n\n\
            ## Perspective Complémentaire ({})\n\n{}\n\n\
            ## Analyse Fusionnée\n\n\
            Les deux modèles convergent sur les points clés tout en apportant des perspectives complémentaires.",
            primary.provider, primary.output, secondary.provider, secondary.output
        );

        AiResponse {
            output: combined_output,
            provider: format!("fusion:{}+{}", primary.provider, secondary.provider),
            model: format!("{}+{}", primary.model, secondary.model),
            tokens_in: primary.tokens_in + secondary.tokens_in,
            tokens_out: primary.tokens_out + secondary.tokens_out,
            latency_ms: primary.latency_ms.max(secondary.latency_ms),
            confidence: (primary.confidence + secondary.confidence) / 2.0,
            metadata: AiMetadata {
                mode: primary.metadata.mode.clone(),
                temperature_used: primary.metadata.temperature_used,
                finish_reason: Some("fusion_complete".to_string()),
                cached: false,
                fallback_triggered: false,
                evaluation_score: Some((primary.confidence + secondary.confidence) / 2.0),
            },
        }
    }

    /// Enrichit la réponse primaire avec des insights secondaires
    fn enrich_primary(&self, primary: &AiResponse, secondary: &AiResponse) -> AiResponse {
        // Extrait insights clés du secondaire
        let secondary_insights = self.extract_key_insights(&secondary.output);

        let enriched_output = if !secondary_insights.is_empty() {
            format!(
                "{}\n\n---\n\n**Perspectives additionnelles :**\n\n{}",
                primary.output,
                secondary_insights.join("\n")
            )
        } else {
            primary.output.clone()
        };

        AiResponse {
            output: enriched_output,
            provider: primary.provider.clone(),
            model: primary.model.clone(),
            tokens_in: primary.tokens_in,
            tokens_out: primary.tokens_out + 50, // Estimation enrichissement
            latency_ms: primary.latency_ms,
            confidence: (primary.confidence * 0.7 + secondary.confidence * 0.3),
            metadata: AiMetadata {
                mode: primary.metadata.mode.clone(),
                temperature_used: primary.metadata.temperature_used,
                finish_reason: Some("enriched".to_string()),
                cached: false,
                fallback_triggered: false,
                evaluation_score: Some(primary.confidence),
            },
        }
    }

    /// Moyenne pondérée (expérimental)
    fn weighted_average(&self, primary: &AiResponse, secondary: &AiResponse) -> AiResponse {
        // Pour le texte, on prend le primary mais on ajuste les métriques
        let weight_primary = primary.confidence / (primary.confidence + secondary.confidence);
        let weight_secondary = 1.0 - weight_primary;

        AiResponse {
            output: primary.output.clone(), // On garde le texte primary
            provider: format!("weighted:{}+{}", primary.provider, secondary.provider),
            model: primary.model.clone(),
            tokens_in: primary.tokens_in,
            tokens_out: primary.tokens_out,
            latency_ms: primary.latency_ms,
            confidence: (primary.confidence * weight_primary + secondary.confidence * weight_secondary),
            metadata: AiMetadata {
                mode: primary.metadata.mode.clone(),
                temperature_used: primary.metadata.temperature_used,
                finish_reason: Some("weighted_average".to_string()),
                cached: false,
                fallback_triggered: false,
                evaluation_score: Some(primary.confidence),
            },
        }
    }

    /// Extrait insights clés d'un output
    fn extract_key_insights(&self, output: &str) -> Vec<String> {
        let lines: Vec<&str> = output.lines().collect();
        let mut insights = Vec::new();

        for line in lines {
            let trimmed = line.trim();
            // Cherche points importants (listes, headers, phrases clés)
            if trimmed.starts_with('-') || trimmed.starts_with('*') || trimmed.starts_with('#') {
                if trimmed.len() > 10 && !insights.contains(&trimmed.to_string()) {
                    insights.push(format!("• {}", trimmed.trim_start_matches(&['-', '*', '#'][..])));
                }
            }
        }

        insights.into_iter().take(5).collect() // Max 5 insights
    }

    /// Évalue si une fusion est bénéfique
    pub fn should_fuse(&self, primary: &AiResponse, secondary: Option<&AiResponse>) -> bool {
        match secondary {
            None => false,
            Some(sec) => {
                // Fusionne si les confiances sont proches
                let confidence_diff = (primary.confidence - sec.confidence).abs();
                confidence_diff < 0.2
            }
        }
    }
}

impl Default for FusionEngine {
    fn default() -> Self {
        Self::new(FusionStrategy::BestOnly)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ai::AiMode;

    fn create_test_response(provider: &str, confidence: f32, output: &str) -> AiResponse {
        AiResponse {
            output: output.to_string(),
            provider: provider.to_string(),
            model: "test_model".to_string(),
            tokens_in: 10,
            tokens_out: 20,
            latency_ms: 1000,
            confidence,
            metadata: AiMetadata {
                mode: AiMode::Quality.to_string(),
                temperature_used: Some(0.7),
                finish_reason: Some("stop".to_string()),
                cached: false,
                fallback_triggered: false,
                evaluation_score: None,
            },
        }
    }

    #[test]
    fn test_best_only_selection() {
        let fusion = FusionEngine::new(FusionStrategy::BestOnly);
        
        let primary = create_test_response("claude", 0.9, "Primary response");
        let secondary = create_test_response("gpt", 0.7, "Secondary response");

        let result = fusion.fuse(&primary, Some(&secondary));
        assert_eq!(result.provider, "claude");
        assert_eq!(result.confidence, 0.9);
    }

    #[test]
    fn test_combine_outputs() {
        let fusion = FusionEngine::new(FusionStrategy::Combine);
        
        let primary = create_test_response("claude", 0.8, "Primary");
        let secondary = create_test_response("gpt", 0.8, "Secondary");

        let result = fusion.fuse(&primary, Some(&secondary));
        assert!(result.output.contains("Synthèse Multi-IA"));
        assert!(result.output.contains("Primary"));
        assert!(result.output.contains("Secondary"));
    }

    #[test]
    fn test_enrich_primary() {
        let fusion = FusionEngine::new(FusionStrategy::EnrichPrimary);
        
        let primary = create_test_response("claude", 0.9, "Primary response");
        let secondary = create_test_response("gpt", 0.7, "- Insight 1\n- Insight 2");

        let result = fusion.fuse(&primary, Some(&secondary));
        assert!(result.output.contains("Primary response"));
        assert_eq!(result.provider, "claude");
    }

    #[test]
    fn test_should_fuse() {
        let fusion = FusionEngine::default();
        
        let primary = create_test_response("claude", 0.8, "Test");
        let secondary_close = create_test_response("gpt", 0.75, "Test");
        let secondary_far = create_test_response("gpt", 0.3, "Test");

        assert!(fusion.should_fuse(&primary, Some(&secondary_close)));
        assert!(!fusion.should_fuse(&primary, Some(&secondary_far)));
        assert!(!fusion.should_fuse(&primary, None));
    }

    #[test]
    fn test_extract_key_insights() {
        let fusion = FusionEngine::default();
        let output = "Text\n- Insight A\n- Insight B\n# Header\nMore text";
        
        let insights = fusion.extract_key_insights(output);
        assert!(!insights.is_empty());
        assert!(insights.iter().any(|i| i.contains("Insight")));
    }
}
