//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — MULTIMODAL ROUTER
//! Super Prompt #17 — Routage et fusion multimodale inter-providers
//! ═══════════════════════════════════════════════════════════════════════════════

use super::{
    router::ModelChoiceStrategy, APIHubError, APIRequest, Modality, Provider, RequestContent,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Requête multimodale complexe
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MultimodalRequest {
    pub id: String,
    pub text: Option<String>,
    pub images: Vec<Vec<u8>>,
    pub audio: Option<Vec<u8>>,
    pub video_frames: Vec<Vec<u8>>,
    pub strategy: MultimodalStrategy,
    pub pipeline: Option<MultimodalPipeline>,
    pub max_tokens: Option<u32>,
    pub timeout_ms: Option<u64>,
}

/// Stratégie multimodale
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum MultimodalStrategy {
    /// Un seul provider pour tout
    SingleProvider,
    /// Meilleur provider par modalité, puis fusion
    BestPerModality,
    /// Pipeline séquentiel défini
    Pipeline,
    /// Consensus: plusieurs providers, fusion des résultats
    Consensus,
}

/// Pipeline multimodal prédéfini
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MultimodalPipeline {
    pub stages: Vec<PipelineStage>,
}

/// Étape du pipeline
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PipelineStage {
    pub name: String,
    pub provider: Provider,
    pub modality: Modality,
    pub input_from: Option<String>, // Nom de l'étape précédente
    pub output_key: String,
}

/// Réponse multimodale
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MultimodalResponse {
    pub id: String,
    pub text_response: Option<String>,
    pub embeddings: Option<Vec<Vec<f32>>>,
    pub providers_used: Vec<Provider>,
    pub stage_results: HashMap<String, StageResult>,
    pub total_tokens: u32,
    pub total_cost_usd: f64,
    pub latency_ms: u64,
}

/// Résultat d'une étape
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct StageResult {
    pub provider: Provider,
    pub modality: Modality,
    pub content: String,
    pub tokens: u32,
    pub latency_ms: u64,
}

/// Routeur multimodal
pub struct MultimodalRouter {
    default_strategy: MultimodalStrategy,
}

impl MultimodalRouter {
    pub fn new() -> Self {
        Self {
            default_strategy: MultimodalStrategy::BestPerModality,
        }
    }

    /// Route et exécute une requête multimodale
    pub async fn route_and_execute(
        &self,
        request: MultimodalRequest,
        hub: &super::APIHub,
    ) -> Result<MultimodalResponse, APIHubError> {
        let start = std::time::Instant::now();

        match request.strategy {
            MultimodalStrategy::SingleProvider => self.execute_single_provider(request, hub).await,
            MultimodalStrategy::BestPerModality => {
                self.execute_best_per_modality(request, hub).await
            }
            MultimodalStrategy::Pipeline => self.execute_pipeline(request, hub).await,
            MultimodalStrategy::Consensus => self.execute_consensus(request, hub).await,
        }
    }

    /// Exécution avec un seul provider
    async fn execute_single_provider(
        &self,
        request: MultimodalRequest,
        hub: &super::APIHub,
    ) -> Result<MultimodalResponse, APIHubError> {
        let start = std::time::Instant::now();

        // Gemini est le meilleur pour le multimodal natif
        let api_request = APIRequest {
            id: request.id.clone(),
            modality: Modality::MultiModal,
            content: RequestContent::MultiModal {
                text: request.text,
                images: request.images,
                audio: request.audio,
            },
            preferred_provider: Some(Provider::Gemini),
            strategy: ModelChoiceStrategy::Quality,
            max_tokens: request.max_tokens,
            temperature: Some(0.7),
            timeout_ms: request.timeout_ms,
            metadata: HashMap::new(),
        };

        let response = hub.execute(api_request).await?;

        let text_content = match response.content {
            super::ResponseContent::Text(t) => Some(t),
            _ => None,
        };

        Ok(MultimodalResponse {
            id: request.id,
            text_response: text_content,
            embeddings: None,
            providers_used: vec![response.provider_used],
            stage_results: HashMap::new(),
            total_tokens: response.usage.total_tokens,
            total_cost_usd: response.usage.estimated_cost_usd,
            latency_ms: start.elapsed().as_millis() as u64,
        })
    }

    /// Exécution avec le meilleur provider par modalité
    async fn execute_best_per_modality(
        &self,
        request: MultimodalRequest,
        hub: &super::APIHub,
    ) -> Result<MultimodalResponse, APIHubError> {
        let start = std::time::Instant::now();
        let mut stage_results = HashMap::new();
        let mut providers_used = Vec::new();
        let mut total_tokens = 0u32;
        let mut total_cost = 0.0f64;
        let mut combined_analysis = Vec::new();

        // 1. Analyser les images avec Gemini (meilleur pour vision)
        if !request.images.is_empty() {
            let vision_request = APIRequest {
                id: format!("{}_vision", request.id),
                modality: Modality::Vision,
                content: RequestContent::TextWithImages {
                    text: request
                        .text
                        .clone()
                        .unwrap_or_else(|| "Analyze these images in detail.".to_string()),
                    images: request.images.clone(),
                },
                preferred_provider: Some(Provider::Gemini),
                strategy: ModelChoiceStrategy::VisionDominant,
                max_tokens: request.max_tokens,
                temperature: Some(0.5),
                timeout_ms: request.timeout_ms,
                metadata: HashMap::new(),
            };

            let vision_response = hub.execute(vision_request).await?;

            if let super::ResponseContent::Text(t) = &vision_response.content {
                combined_analysis.push(format!("Image Analysis:\n{}", t));
                stage_results.insert(
                    "vision".to_string(),
                    StageResult {
                        provider: Provider::Gemini,
                        modality: Modality::Vision,
                        content: t.clone(),
                        tokens: vision_response.usage.total_tokens,
                        latency_ms: vision_response.latency_ms,
                    },
                );
            }

            providers_used.push(vision_response.provider_used);
            total_tokens += vision_response.usage.total_tokens;
            total_cost += vision_response.usage.estimated_cost_usd;
        }

        // 2. Transcrire l'audio avec OpenAI Whisper
        if let Some(audio) = &request.audio {
            let audio_request = APIRequest {
                id: format!("{}_audio", request.id),
                modality: Modality::Audio,
                content: RequestContent::Audio(audio.clone()),
                preferred_provider: Some(Provider::OpenAI),
                strategy: ModelChoiceStrategy::Quality,
                max_tokens: None,
                temperature: None,
                timeout_ms: request.timeout_ms,
                metadata: HashMap::new(),
            };

            let audio_response = hub.execute(audio_request).await?;

            if let super::ResponseContent::AudioTranscription(t) = &audio_response.content {
                combined_analysis.push(format!("Audio Transcription:\n{}", t));
                stage_results.insert(
                    "audio".to_string(),
                    StageResult {
                        provider: Provider::OpenAI,
                        modality: Modality::Audio,
                        content: t.clone(),
                        tokens: audio_response.usage.total_tokens,
                        latency_ms: audio_response.latency_ms,
                    },
                );
            }

            providers_used.push(audio_response.provider_used);
            total_tokens += audio_response.usage.total_tokens;
            total_cost += audio_response.usage.estimated_cost_usd;
        }

        // 3. Synthèse finale avec Claude (meilleur pour analyse profonde)
        let synthesis_prompt = if combined_analysis.is_empty() {
            request.text.clone().unwrap_or_default()
        } else {
            format!(
                "Based on the following multimodal analysis, provide a comprehensive synthesis:\n\n{}\n\nOriginal query: {}",
                combined_analysis.join("\n\n---\n\n"),
                request.text.clone().unwrap_or_default()
            )
        };

        let synthesis_request = APIRequest {
            id: format!("{}_synthesis", request.id),
            modality: Modality::Text,
            content: RequestContent::Text(synthesis_prompt),
            preferred_provider: Some(Provider::Anthropic),
            strategy: ModelChoiceStrategy::Quality,
            max_tokens: request.max_tokens,
            temperature: Some(0.7),
            timeout_ms: request.timeout_ms,
            metadata: HashMap::new(),
        };

        let synthesis_response = hub.execute(synthesis_request).await?;

        let final_text = match &synthesis_response.content {
            super::ResponseContent::Text(t) => Some(t.clone()),
            _ => None,
        };

        stage_results.insert(
            "synthesis".to_string(),
            StageResult {
                provider: Provider::Anthropic,
                modality: Modality::Text,
                content: final_text.clone().unwrap_or_default(),
                tokens: synthesis_response.usage.total_tokens,
                latency_ms: synthesis_response.latency_ms,
            },
        );

        providers_used.push(synthesis_response.provider_used);
        total_tokens += synthesis_response.usage.total_tokens;
        total_cost += synthesis_response.usage.estimated_cost_usd;

        Ok(MultimodalResponse {
            id: request.id,
            text_response: final_text,
            embeddings: None,
            providers_used,
            stage_results,
            total_tokens,
            total_cost_usd: total_cost,
            latency_ms: start.elapsed().as_millis() as u64,
        })
    }

    /// Exécution d'un pipeline personnalisé
    async fn execute_pipeline(
        &self,
        request: MultimodalRequest,
        hub: &super::APIHub,
    ) -> Result<MultimodalResponse, APIHubError> {
        let start = std::time::Instant::now();

        let pipeline = request.pipeline.ok_or_else(|| {
            APIHubError::ConfigurationError(
                "Pipeline strategy requires a pipeline definition".to_string(),
            )
        })?;

        let mut stage_results: HashMap<String, StageResult> = HashMap::new();
        let mut providers_used = Vec::new();
        let mut total_tokens = 0u32;
        let mut total_cost = 0.0f64;
        let mut last_output: Option<String> = request.text.clone();

        for stage in &pipeline.stages {
            // Récupérer l'input de l'étape précédente si spécifié
            let input = if let Some(ref input_key) = stage.input_from {
                stage_results
                    .get(input_key)
                    .map(|r| r.content.clone())
                    .or(last_output.clone())
            } else {
                last_output.clone()
            };

            let content = match stage.modality {
                Modality::Text => RequestContent::Text(input.unwrap_or_default()),
                Modality::Vision => RequestContent::TextWithImages {
                    text: input.unwrap_or_default(),
                    images: request.images.clone(),
                },
                Modality::Audio => {
                    if let Some(ref audio) = request.audio {
                        RequestContent::Audio(audio.clone())
                    } else {
                        continue; // Skip if no audio
                    }
                }
                _ => RequestContent::Text(input.unwrap_or_default()),
            };

            let api_request = APIRequest {
                id: format!("{}_{}", request.id, stage.name),
                modality: stage.modality,
                content,
                preferred_provider: Some(stage.provider),
                strategy: ModelChoiceStrategy::Quality,
                max_tokens: request.max_tokens,
                temperature: Some(0.7),
                timeout_ms: request.timeout_ms,
                metadata: HashMap::new(),
            };

            let response = hub.execute(api_request).await?;

            let output = match &response.content {
                super::ResponseContent::Text(t) => t.clone(),
                super::ResponseContent::AudioTranscription(t) => t.clone(),
                _ => String::new(),
            };

            stage_results.insert(
                stage.output_key.clone(),
                StageResult {
                    provider: stage.provider,
                    modality: stage.modality,
                    content: output.clone(),
                    tokens: response.usage.total_tokens,
                    latency_ms: response.latency_ms,
                },
            );

            last_output = Some(output);
            providers_used.push(response.provider_used);
            total_tokens += response.usage.total_tokens;
            total_cost += response.usage.estimated_cost_usd;
        }

        Ok(MultimodalResponse {
            id: request.id,
            text_response: last_output,
            embeddings: None,
            providers_used,
            stage_results,
            total_tokens,
            total_cost_usd: total_cost,
            latency_ms: start.elapsed().as_millis() as u64,
        })
    }

    /// Exécution avec consensus multi-providers
    async fn execute_consensus(
        &self,
        request: MultimodalRequest,
        hub: &super::APIHub,
    ) -> Result<MultimodalResponse, APIHubError> {
        let start = std::time::Instant::now();
        let mut stage_results = HashMap::new();
        let mut providers_used = Vec::new();
        let mut total_tokens = 0u32;
        let mut total_cost = 0.0f64;
        let mut responses = Vec::new();

        let content = RequestContent::MultiModal {
            text: request.text.clone(),
            images: request.images.clone(),
            audio: request.audio.clone(),
        };

        // Exécuter sur plusieurs providers en parallèle
        let providers_to_try = vec![Provider::OpenAI, Provider::Gemini, Provider::Anthropic];

        for provider in providers_to_try {
            let api_request = APIRequest {
                id: format!("{}_{:?}", request.id, provider),
                modality: if !request.images.is_empty() {
                    Modality::Vision
                } else {
                    Modality::Text
                },
                content: if !request.images.is_empty() {
                    RequestContent::TextWithImages {
                        text: request.text.clone().unwrap_or_default(),
                        images: request.images.clone(),
                    }
                } else {
                    RequestContent::Text(request.text.clone().unwrap_or_default())
                },
                preferred_provider: Some(provider),
                strategy: ModelChoiceStrategy::Quality,
                max_tokens: request.max_tokens,
                temperature: Some(0.7),
                timeout_ms: request.timeout_ms,
                metadata: HashMap::new(),
            };

            if let Ok(response) = hub.execute(api_request).await {
                if let super::ResponseContent::Text(t) = &response.content {
                    responses.push((provider, t.clone()));
                    stage_results.insert(
                        format!("{:?}_response", provider),
                        StageResult {
                            provider,
                            modality: Modality::Text,
                            content: t.clone(),
                            tokens: response.usage.total_tokens,
                            latency_ms: response.latency_ms,
                        },
                    );

                    providers_used.push(provider);
                    total_tokens += response.usage.total_tokens;
                    total_cost += response.usage.estimated_cost_usd;
                }
            }
        }

        // Fusionner les réponses avec Claude
        let fusion_prompt = format!(
            "You have received multiple AI responses to the same query. \
            Synthesize them into a single, comprehensive answer that captures \
            the best insights from each:\n\n{}",
            responses
                .iter()
                .map(|(p, r)| format!("=== {:?} ===\n{}", p, r))
                .collect::<Vec<_>>()
                .join("\n\n")
        );

        let fusion_request = APIRequest {
            id: format!("{}_fusion", request.id),
            modality: Modality::Text,
            content: RequestContent::Text(fusion_prompt),
            preferred_provider: Some(Provider::Anthropic),
            strategy: ModelChoiceStrategy::Quality,
            max_tokens: request.max_tokens,
            temperature: Some(0.5),
            timeout_ms: request.timeout_ms,
            metadata: HashMap::new(),
        };

        let fusion_response = hub.execute(fusion_request).await?;

        let final_text = match &fusion_response.content {
            super::ResponseContent::Text(t) => Some(t.clone()),
            _ => None,
        };

        providers_used.push(Provider::Anthropic);
        total_tokens += fusion_response.usage.total_tokens;
        total_cost += fusion_response.usage.estimated_cost_usd;

        Ok(MultimodalResponse {
            id: request.id,
            text_response: final_text,
            embeddings: None,
            providers_used,
            stage_results,
            total_tokens,
            total_cost_usd: total_cost,
            latency_ms: start.elapsed().as_millis() as u64,
        })
    }
}

impl Default for MultimodalRouter {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_multimodal_request_creation() {
        let request = MultimodalRequest {
            id: "test".to_string(),
            text: Some("Analyze".to_string()),
            images: vec![],
            audio: None,
            video_frames: vec![],
            strategy: MultimodalStrategy::BestPerModality,
            pipeline: None,
            max_tokens: Some(1000),
            timeout_ms: Some(30000),
        };

        assert_eq!(request.strategy, MultimodalStrategy::BestPerModality);
    }

    #[test]
    fn test_pipeline_creation() {
        let pipeline = MultimodalPipeline {
            stages: vec![
                PipelineStage {
                    name: "vision".to_string(),
                    provider: Provider::Gemini,
                    modality: Modality::Vision,
                    input_from: None,
                    output_key: "vision_result".to_string(),
                },
                PipelineStage {
                    name: "synthesis".to_string(),
                    provider: Provider::Anthropic,
                    modality: Modality::Text,
                    input_from: Some("vision_result".to_string()),
                    output_key: "final".to_string(),
                },
            ],
        };

        assert_eq!(pipeline.stages.len(), 2);
    }
}
