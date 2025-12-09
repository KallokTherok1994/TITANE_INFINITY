//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — API ROUTER
//! Super Prompt #17 — Routage intelligent vers le meilleur provider
//! Intégration Temporelle — Temporal Intelligence v2
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::sync::Arc;
use super::{
    Provider, Modality, APIRequest,
    provider_registry::{ProviderRegistry, ProviderCapability, ScoreWeights},
    temporal_adapter::TemporalApiAdapter,
};

/// Stratégie de choix de modèle
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ModelChoiceStrategy {
    /// Priorité vitesse
    Speed,
    /// Priorité qualité
    Quality,
    /// Équilibré
    Balanced,
    /// Vision dominante (meilleur pour images)
    VisionDominant,
    /// Sécurité maximale
    Secure,
    /// Coût minimal
    CostEfficient,
    /// Raisonnement profond
    DeepReasoning,
    /// Long contexte
    LongContext,
}

/// Décision de routage
#[derive(Clone, Debug)]
pub struct RouteDecision {
    pub provider: Provider,
    pub model: Option<String>,
    pub reason: String,
    pub confidence: f32,
    pub alternatives: Vec<(Provider, f32)>,
}

/// Routeur API avec intelligence temporelle
pub struct APIRouter {
    default_strategy: ModelChoiceStrategy,
    temporal_adapter: Option<Arc<TemporalApiAdapter>>,
}

impl APIRouter {
    pub fn new() -> Self {
        Self {
            default_strategy: ModelChoiceStrategy::Balanced,
            temporal_adapter: None,
        }
    }

    pub fn with_temporal_adapter(mut self, adapter: Arc<TemporalApiAdapter>) -> Self {
        self.temporal_adapter = Some(adapter);
        self
    }

    pub fn with_default_strategy(mut self, strategy: ModelChoiceStrategy) -> Self {
        self.default_strategy = strategy;
        self
    }

    /// Route une requête vers le meilleur provider avec adaptation temporelle
    pub async fn route(&self, request: &APIRequest, registry: &ProviderRegistry) -> RouteDecision {
        // Obtenir ajustements temporels si disponibles
        let temporal_adjustments = if let Some(adapter) = &self.temporal_adapter {
            Some(adapter.get_api_adjustments().await)
        } else {
            None
        };

        // Si un provider préféré est spécifié et disponible, l'utiliser
        if let Some(preferred) = request.preferred_provider {
            if let Some(profile) = registry.get_profile(preferred) {
                if profile.available && profile.supports_modality(request.modality) {
                    return RouteDecision {
                        provider: preferred,
                        model: profile.default_model().map(|m| m.id.clone()),
                        reason: "User preferred provider".to_string(),
                        confidence: 1.0,
                        alternatives: vec![],
                    };
                }
            }
        }

        // Sinon, utiliser la stratégie avec ajustements temporels
        let mut strategy = request.strategy;

        // Adapter stratégie selon temporalité
        if let Some(adj) = &temporal_adjustments {
            strategy = self.adapt_strategy_to_temporal(strategy, adj);
        }

        let weights = self.strategy_to_weights(strategy);

        // Filtrer les providers qui supportent la modalité
        let candidates = registry.providers_for_modality(request.modality);

        if candidates.is_empty() {
            // Fallback vers OpenAI
            return RouteDecision {
                provider: Provider::OpenAI,
                model: None,
                reason: "No provider available for modality, fallback to OpenAI".to_string(),
                confidence: 0.3,
                alternatives: vec![],
            };
        }

        // Scorer les candidats avec bonus temporels
        let mut scored: Vec<(Provider, f32, String)> = candidates.iter()
            .map(|p| {
                let mut score = self.score_provider(p, request, &weights);

                // Appliquer bonus temporel si adapter disponible
                if let Some(adj) = &temporal_adjustments {
                    if adj.prefer_quality && p.provider == Provider::Anthropic {
                        score += 1.0; // Claude meilleur pour qualité
                    }
                    if adj.cost_sensitivity > 0.6 && p.provider == Provider::Gemini {
                        score += 0.8; // Gemini meilleur rapport qualité/prix
                    }
                }

                let reason = self.explain_score(p, request, &weights);
                (p.provider, score, reason)
            })
            .collect();

        // Trier par score décroissant
        scored.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

        let (best_provider, best_score, reason) = scored.first()
            .cloned()
            .unwrap_or((Provider::OpenAI, 0.5, "Fallback".to_string()));

        let alternatives: Vec<(Provider, f32)> = scored.iter()
            .skip(1)
            .take(2)
            .map(|(p, s, _)| (*p, *s))
            .collect();

        // Déterminer le modèle optimal
        let model = self.select_model(best_provider, request, registry);

        RouteDecision {
            provider: best_provider,
            model,
            reason,
            confidence: best_score / 10.0,
            alternatives,
        }
    }

    /// Adapter stratégie selon contexte temporel
    fn adapt_strategy_to_temporal(
        &self,
        strategy: ModelChoiceStrategy,
        adjustments: &super::temporal_adapter::ApiTemporalAdjustments,
    ) -> ModelChoiceStrategy {
        // Heures de pointe: privilégier qualité
        if adjustments.prefer_quality {
            match strategy {
                ModelChoiceStrategy::CostEfficient => ModelChoiceStrategy::Balanced,
                ModelChoiceStrategy::Speed => ModelChoiceStrategy::Quality,
                _ => strategy,
            }
        }
        // Nuit: privilégier coût
        else if adjustments.cost_sensitivity > 0.7 {
            match strategy {
                ModelChoiceStrategy::Quality => ModelChoiceStrategy::Balanced,
                ModelChoiceStrategy::Speed => ModelChoiceStrategy::CostEfficient,
                _ => strategy,
            }
        }
        // Sinon garder stratégie originale
        else {
            strategy
        }
    }

    /// Convertit une stratégie en poids
    fn strategy_to_weights(&self, strategy: ModelChoiceStrategy) -> ScoreWeights {
        match strategy {
            ModelChoiceStrategy::Speed => ScoreWeights {
                cost: 0.1,
                speed: 0.6,
                quality: 0.2,
                safety: 0.1,
            },
            ModelChoiceStrategy::Quality => ScoreWeights {
                cost: 0.1,
                speed: 0.1,
                quality: 0.6,
                safety: 0.2,
            },
            ModelChoiceStrategy::Balanced => ScoreWeights {
                cost: 0.25,
                speed: 0.25,
                quality: 0.25,
                safety: 0.25,
            },
            ModelChoiceStrategy::VisionDominant => ScoreWeights {
                cost: 0.1,
                speed: 0.2,
                quality: 0.5,
                safety: 0.2,
            },
            ModelChoiceStrategy::Secure => ScoreWeights {
                cost: 0.05,
                speed: 0.1,
                quality: 0.25,
                safety: 0.6,
            },
            ModelChoiceStrategy::CostEfficient => ScoreWeights {
                cost: 0.6,
                speed: 0.2,
                quality: 0.15,
                safety: 0.05,
            },
            ModelChoiceStrategy::DeepReasoning => ScoreWeights {
                cost: 0.05,
                speed: 0.05,
                quality: 0.7,
                safety: 0.2,
            },
            ModelChoiceStrategy::LongContext => ScoreWeights {
                cost: 0.2,
                speed: 0.1,
                quality: 0.4,
                safety: 0.3,
            },
        }
    }

    /// Score un provider pour une requête
    fn score_provider(
        &self,
        profile: &super::provider_registry::ProviderProfile,
        request: &APIRequest,
        weights: &ScoreWeights,
    ) -> f32 {
        let mut score = profile.composite_score(weights);

        // Bonus selon la modalité
        match request.modality {
            Modality::Vision => {
                if profile.provider == Provider::Gemini {
                    score += 1.5; // Gemini excelle en vision
                }
            }
            Modality::Audio => {
                if profile.provider == Provider::OpenAI {
                    score += 1.0; // OpenAI Whisper
                } else if profile.provider == Provider::Gemini {
                    score += 0.8; // Gemini audio aussi bon
                }
            }
            Modality::Embeddings => {
                if profile.provider == Provider::OpenAI {
                    score += 2.0; // OpenAI embeddings sont les meilleurs
                }
            }
            Modality::Text => {
                if profile.provider == Provider::Anthropic {
                    score += 0.5; // Claude excellent en texte
                }
            }
            Modality::MultiModal => {
                if profile.provider == Provider::Gemini {
                    score += 2.0; // Gemini natif multimodal
                }
            }
            Modality::ImageGeneration => {
                if profile.provider == Provider::OpenAI {
                    score += 3.0; // DALL-E
                }
            }
        }

        // Bonus selon les capacités requises
        if request.strategy == ModelChoiceStrategy::DeepReasoning {
            if profile.has_capability(ProviderCapability::Reasoning) {
                score += 1.5;
            }
        }

        if request.strategy == ModelChoiceStrategy::LongContext {
            if profile.has_capability(ProviderCapability::LongContext) {
                score += 2.0;
                if profile.provider == Provider::Gemini {
                    score += 1.0; // 2M tokens!
                }
            }
        }

        // Pénalité si taux d'erreur élevé
        score -= profile.error_rate * 5.0;

        // Pénalité si latence historique élevée
        if let Some(latency) = profile.last_latency_ms {
            if latency > 5000 {
                score -= 1.0;
            }
        }

        score.max(0.0)
    }

    /// Explique le score
    fn explain_score(
        &self,
        profile: &super::provider_registry::ProviderProfile,
        request: &APIRequest,
        _weights: &ScoreWeights,
    ) -> String {
        let mut reasons = Vec::new();

        match (request.modality, profile.provider) {
            (Modality::Vision, Provider::Gemini) => reasons.push("Best vision capabilities"),
            (Modality::Vision, Provider::OpenAI) => reasons.push("Good vision with GPT-4o"),
            (Modality::Audio, Provider::OpenAI) => reasons.push("Whisper transcription"),
            (Modality::Audio, Provider::Gemini) => reasons.push("Native audio support"),
            (Modality::Embeddings, Provider::OpenAI) => reasons.push("Best embedding model"),
            (Modality::Text, Provider::Anthropic) => reasons.push("Excellent text analysis"),
            (Modality::MultiModal, Provider::Gemini) => reasons.push("Native multimodal"),
            (Modality::ImageGeneration, Provider::OpenAI) => reasons.push("DALL-E 3"),
            _ => reasons.push("General capability"),
        }

        match request.strategy {
            ModelChoiceStrategy::Secure if profile.provider == Provider::Anthropic => {
                reasons.push("Highest safety rating");
            }
            ModelChoiceStrategy::CostEfficient if profile.provider == Provider::Gemini => {
                reasons.push("Most cost-effective");
            }
            ModelChoiceStrategy::DeepReasoning if profile.provider == Provider::Anthropic => {
                reasons.push("Deep reasoning with Claude");
            }
            ModelChoiceStrategy::LongContext if profile.provider == Provider::Gemini => {
                reasons.push("2M token context");
            }
            _ => {}
        }

        reasons.join(", ")
    }

    /// Sélectionne le modèle optimal
    fn select_model(
        &self,
        provider: Provider,
        request: &APIRequest,
        registry: &ProviderRegistry,
    ) -> Option<String> {
        let profile = registry.get_profile(provider)?;

        // Sélection selon la stratégie
        match request.strategy {
            ModelChoiceStrategy::Speed => {
                // Modèle le plus rapide (généralement le moins cher)
                match provider {
                    Provider::OpenAI => Some("gpt-4o-mini".to_string()),
                    Provider::Gemini => Some("gemini-2.0-flash".to_string()),
                    Provider::Anthropic => Some("claude-3-5-haiku-20241022".to_string()),
                    Provider::Local => None,
                }
            }
            ModelChoiceStrategy::Quality | ModelChoiceStrategy::DeepReasoning => {
                // Meilleur modèle
                match provider {
                    Provider::OpenAI => Some("o1".to_string()),
                    Provider::Gemini => Some("gemini-1.5-pro".to_string()),
                    Provider::Anthropic => Some("claude-opus-4-20250514".to_string()),
                    Provider::Local => None,
                }
            }
            ModelChoiceStrategy::CostEfficient => {
                match provider {
                    Provider::OpenAI => Some("gpt-4o-mini".to_string()),
                    Provider::Gemini => Some("gemini-2.0-flash".to_string()),
                    Provider::Anthropic => Some("claude-3-5-haiku-20241022".to_string()),
                    Provider::Local => None,
                }
            }
            ModelChoiceStrategy::LongContext => {
                match provider {
                    Provider::OpenAI => Some("gpt-4o".to_string()),
                    Provider::Gemini => Some("gemini-1.5-pro".to_string()), // 2M tokens
                    Provider::Anthropic => Some("claude-sonnet-4-20250514".to_string()),
                    Provider::Local => None,
                }
            }
            _ => profile.default_model().map(|m| m.id.clone()),
        }
    }
}

impl Default for APIRouter {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::api_hub::provider_registry::ProviderProfile;
    use crate::api_hub::RequestContent;

    #[tokio::test]
    async fn test_router_basic() {
        let router = APIRouter::new();
        let mut registry = ProviderRegistry::new();
        registry.register_provider(Provider::OpenAI, ProviderProfile::openai_default());
        registry.register_provider(Provider::Gemini, ProviderProfile::gemini_default());
        registry.register_provider(Provider::Anthropic, ProviderProfile::anthropic_default());

        let request = APIRequest {
            id: "test".to_string(),
            modality: Modality::Text,
            content: RequestContent::Text("Hello".to_string()),
            preferred_provider: None,
            strategy: ModelChoiceStrategy::Balanced,
            max_tokens: None,
            temperature: None,
            timeout_ms: None,
            metadata: std::collections::HashMap::new(),
        };

        let decision = router.route(&request, &registry).await;
        assert!(decision.confidence > 0.0);
    }

    #[tokio::test]
    async fn test_vision_routing() {
        let router = APIRouter::new();
        let mut registry = ProviderRegistry::new();
        registry.register_provider(Provider::OpenAI, ProviderProfile::openai_default());
        registry.register_provider(Provider::Gemini, ProviderProfile::gemini_default());

        let request = APIRequest {
            id: "test".to_string(),
            modality: Modality::Vision,
            content: RequestContent::TextWithImages {
                text: "Describe".to_string(),
                images: vec![vec![0u8; 100]],
            },
            preferred_provider: None,
            strategy: ModelChoiceStrategy::VisionDominant,
            max_tokens: None,
            temperature: None,
            timeout_ms: None,
            metadata: std::collections::HashMap::new(),
        };

        let decision = router.route(&request, &registry).await;
        // Gemini should be preferred for vision
        assert_eq!(decision.provider, Provider::Gemini);
    }

    #[tokio::test]
    async fn test_preferred_provider() {
        let router = APIRouter::new();
        let mut registry = ProviderRegistry::new();
        registry.register_provider(Provider::OpenAI, ProviderProfile::openai_default());
        registry.register_provider(Provider::Anthropic, ProviderProfile::anthropic_default());

        let request = APIRequest {
            id: "test".to_string(),
            modality: Modality::Text,
            content: RequestContent::Text("Hello".to_string()),
            preferred_provider: Some(Provider::Anthropic),
            strategy: ModelChoiceStrategy::Balanced,
            max_tokens: None,
            temperature: None,
            timeout_ms: None,
            metadata: std::collections::HashMap::new(),
        };

        let decision = router.route(&request, &registry).await;
        assert_eq!(decision.provider, Provider::Anthropic);
        assert_eq!(decision.reason, "User preferred provider");
    }
}
