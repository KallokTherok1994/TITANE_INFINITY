//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — ANTHROPIC PROVIDER
//! Super Prompt #17 — Intégration Anthropic Claude (Analyse, Safety, Reasoning)
//! ═══════════════════════════════════════════════════════════════════════════════

use super::{
    harmonizer::HarmonizedResponse, APIHubError, APIRequest, Modality, Provider, RequestContent,
    ResponseContent, UsageStats,
};
use serde::Serialize;

/// Provider Anthropic (Claude)
pub struct AnthropicProvider {
    api_key: String,
    base_url: String,
    default_model: String,
}

impl AnthropicProvider {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            base_url: "https://api.anthropic.com/v1".to_string(),
            default_model: "claude-sonnet-4-20250514".to_string(),
        }
    }

    pub fn with_model(mut self, model: String) -> Self {
        self.default_model = model;
        self
    }

    /// Exécute une requête Anthropic
    pub async fn execute(&self, request: &APIRequest) -> Result<HarmonizedResponse, APIHubError> {
        match request.modality {
            Modality::Text => self.messages(request).await,
            Modality::Vision => self.vision_messages(request).await,
            Modality::MultiModal => self.multimodal_messages(request).await,
            Modality::Audio => Err(APIHubError::UnexpectedResponse(
                "Anthropic does not support audio".to_string(),
            )),
            Modality::Embeddings => Err(APIHubError::UnexpectedResponse(
                "Anthropic does not support embeddings".to_string(),
            )),
            Modality::ImageGeneration => Err(APIHubError::UnexpectedResponse(
                "Anthropic does not support image generation".to_string(),
            )),
        }
    }

    /// Messages API standard
    async fn messages(&self, request: &APIRequest) -> Result<HarmonizedResponse, APIHubError> {
        let text = match &request.content {
            RequestContent::Text(t) => t.clone(),
            _ => {
                return Err(APIHubError::UnexpectedResponse(
                    "Expected text content".to_string(),
                ))
            }
        };

        let body = MessagesRequest {
            model: self.default_model.clone(),
            max_tokens: request.max_tokens.unwrap_or(4096),
            messages: vec![Message {
                role: "user".to_string(),
                content: MessageContent::Text(text),
            }],
            system: None,
            temperature: request.temperature,
            top_p: None,
            stop_sequences: None,
        };

        let response = self.mock_messages_response(&body).await?;

        Ok(HarmonizedResponse {
            id: request.id.clone(),
            provider: Provider::Anthropic,
            content: ResponseContent::Text(response.text),
            usage: UsageStats {
                prompt_tokens: response.input_tokens,
                completion_tokens: response.output_tokens,
                total_tokens: response.input_tokens + response.output_tokens,
                estimated_cost_usd: self
                    .estimate_cost(response.input_tokens, response.output_tokens),
            },
            metadata: std::collections::HashMap::new(),
        })
    }

    /// Messages avec vision
    async fn vision_messages(
        &self,
        request: &APIRequest,
    ) -> Result<HarmonizedResponse, APIHubError> {
        let (text, images) = match &request.content {
            RequestContent::TextWithImages { text, images } => (text.clone(), images.clone()),
            _ => {
                return Err(APIHubError::UnexpectedResponse(
                    "Expected text with images".to_string(),
                ))
            }
        };

        let mut content_blocks: Vec<ContentBlock> = Vec::new();

        // Ajouter les images d'abord
        for image in &images {
            content_blocks.push(ContentBlock::Image {
                source: ImageSource {
                    source_type: "base64".to_string(),
                    media_type: "image/jpeg".to_string(),
                    data: base64_encode(image),
                },
            });
        }

        // Puis le texte
        content_blocks.push(ContentBlock::Text { text });

        let body = MessagesRequest {
            model: self.default_model.clone(),
            max_tokens: request.max_tokens.unwrap_or(4096),
            messages: vec![Message {
                role: "user".to_string(),
                content: MessageContent::Blocks(content_blocks),
            }],
            system: None,
            temperature: request.temperature,
            top_p: None,
            stop_sequences: None,
        };

        let response = self.mock_vision_response(&body).await?;

        Ok(HarmonizedResponse {
            id: request.id.clone(),
            provider: Provider::Anthropic,
            content: ResponseContent::Text(response.text),
            usage: UsageStats {
                prompt_tokens: response.input_tokens,
                completion_tokens: response.output_tokens,
                total_tokens: response.input_tokens + response.output_tokens,
                estimated_cost_usd: self
                    .estimate_cost(response.input_tokens, response.output_tokens),
            },
            metadata: std::collections::HashMap::new(),
        })
    }

    /// Messages multimodaux
    async fn multimodal_messages(
        &self,
        request: &APIRequest,
    ) -> Result<HarmonizedResponse, APIHubError> {
        let (text, images, _audio) = match &request.content {
            RequestContent::MultiModal {
                text,
                images,
                audio,
            } => (text.clone(), images.clone(), audio.clone()),
            _ => {
                return Err(APIHubError::UnexpectedResponse(
                    "Expected multimodal content".to_string(),
                ))
            }
        };

        // Claude ne supporte pas l'audio, on ignore
        let mut content_blocks: Vec<ContentBlock> = Vec::new();

        for image in &images {
            content_blocks.push(ContentBlock::Image {
                source: ImageSource {
                    source_type: "base64".to_string(),
                    media_type: "image/jpeg".to_string(),
                    data: base64_encode(image),
                },
            });
        }

        if let Some(t) = text {
            content_blocks.push(ContentBlock::Text { text: t });
        }

        let body = MessagesRequest {
            model: self.default_model.clone(),
            max_tokens: request.max_tokens.unwrap_or(4096),
            messages: vec![Message {
                role: "user".to_string(),
                content: MessageContent::Blocks(content_blocks),
            }],
            system: None,
            temperature: request.temperature,
            top_p: None,
            stop_sequences: None,
        };

        let response = self.mock_messages_response(&body).await?;

        Ok(HarmonizedResponse {
            id: request.id.clone(),
            provider: Provider::Anthropic,
            content: ResponseContent::Text(response.text),
            usage: UsageStats {
                prompt_tokens: response.input_tokens,
                completion_tokens: response.output_tokens,
                total_tokens: response.input_tokens + response.output_tokens,
                estimated_cost_usd: self
                    .estimate_cost(response.input_tokens, response.output_tokens),
            },
            metadata: std::collections::HashMap::new(),
        })
    }

    /// Analyse profonde (utilise Claude Opus)
    pub async fn deep_analysis(&self, prompt: &str, context: &str) -> Result<String, APIHubError> {
        let system_prompt = format!(
            "You are an expert analyst. Analyze the following with extreme depth and precision.\n\nContext:\n{}",
            context
        );

        let body = MessagesRequest {
            model: "claude-opus-4-20250514".to_string(), // Use Opus for deep analysis
            max_tokens: 8192,
            messages: vec![Message {
                role: "user".to_string(),
                content: MessageContent::Text(prompt.to_string()),
            }],
            system: Some(system_prompt),
            temperature: Some(0.3),
            top_p: None,
            stop_sequences: None,
        };

        let response = self.mock_deep_analysis_response(&body).await?;
        Ok(response.text)
    }

    /// Synthèse sécurisée (avec filtrage)
    pub async fn safe_synthesis(&self, content: &str) -> Result<String, APIHubError> {
        let body = MessagesRequest {
            model: self.default_model.clone(),
            max_tokens: 4096,
            messages: vec![
                Message {
                    role: "user".to_string(),
                    content: MessageContent::Text(format!(
                        "Please provide a safe, helpful, and accurate synthesis of the following:\n\n{}",
                        content
                    )),
                }
            ],
            system: Some("You are a helpful assistant. Ensure all responses are safe, accurate, and beneficial.".to_string()),
            temperature: Some(0.5),
            top_p: None,
            stop_sequences: None,
        };

        let response = self.mock_messages_response(&body).await?;
        Ok(response.text)
    }

    /// Estime le coût
    fn estimate_cost(&self, input_tokens: u32, output_tokens: u32) -> f64 {
        // Claude Sonnet 4 pricing
        let input_cost = 0.003 * (input_tokens as f64 / 1000.0);
        let output_cost = 0.015 * (output_tokens as f64 / 1000.0);
        input_cost + output_cost
    }

    // ════════════════════════════════════════════════════════════════════════
    // MOCK IMPLEMENTATIONS
    // ════════════════════════════════════════════════════════════════════════

    async fn mock_messages_response(
        &self,
        _body: &MessagesRequest,
    ) -> Result<MockAnthropicResponse, APIHubError> {
        Ok(MockAnthropicResponse {
            text: "This is a mock response from Anthropic Claude, providing thoughtful and safe analysis.".to_string(),
            input_tokens: 50,
            output_tokens: 30,
        })
    }

    async fn mock_vision_response(
        &self,
        _body: &MessagesRequest,
    ) -> Result<MockAnthropicResponse, APIHubError> {
        Ok(MockAnthropicResponse {
            text: "I can see the image you've shared. This is a detailed mock vision analysis from Claude.".to_string(),
            input_tokens: 1000,
            output_tokens: 100,
        })
    }

    async fn mock_deep_analysis_response(
        &self,
        _body: &MessagesRequest,
    ) -> Result<MockAnthropicResponse, APIHubError> {
        Ok(MockAnthropicResponse {
            text: "Here is a comprehensive deep analysis with multiple perspectives, considerations, and recommendations...".to_string(),
            input_tokens: 500,
            output_tokens: 2000,
        })
    }
}

// ════════════════════════════════════════════════════════════════════════════
// REQUEST/RESPONSE STRUCTURES
// ════════════════════════════════════════════════════════════════════════════

#[derive(Serialize)]
struct MessagesRequest {
    model: String,
    max_tokens: u32,
    messages: Vec<Message>,
    #[serde(skip_serializing_if = "Option::is_none")]
    system: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    temperature: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    top_p: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    stop_sequences: Option<Vec<String>>,
}

#[derive(Serialize)]
struct Message {
    role: String,
    content: MessageContent,
}

#[derive(Serialize)]
#[serde(untagged)]
enum MessageContent {
    Text(String),
    Blocks(Vec<ContentBlock>),
}

#[derive(Serialize)]
#[serde(tag = "type")]
enum ContentBlock {
    #[serde(rename = "text")]
    Text { text: String },
    #[serde(rename = "image")]
    Image { source: ImageSource },
}

#[derive(Serialize)]
struct ImageSource {
    #[serde(rename = "type")]
    source_type: String,
    media_type: String,
    data: String,
}

struct MockAnthropicResponse {
    text: String,
    input_tokens: u32,
    output_tokens: u32,
}

fn base64_encode(data: &[u8]) -> String {
    use base64::{engine::general_purpose::STANDARD, Engine as _};
    STANDARD.encode(data)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_anthropic_provider_creation() {
        let provider = AnthropicProvider::new("test_key".to_string());
        assert_eq!(provider.default_model, "claude-sonnet-4-20250514");
    }

    #[tokio::test]
    async fn test_mock_messages() {
        let provider = AnthropicProvider::new("test_key".to_string());
        let request = APIRequest {
            id: "test".to_string(),
            modality: Modality::Text,
            content: RequestContent::Text("Hello Claude".to_string()),
            preferred_provider: None,
            strategy: super::super::router::ModelChoiceStrategy::Quality,
            max_tokens: None,
            temperature: None,
            timeout_ms: None,
            metadata: std::collections::HashMap::new(),
        };

        let response = provider.execute(&request).await.unwrap();
        match response.content {
            ResponseContent::Text(text) => {
                assert!(!text.is_empty());
            }
            _ => panic!("Expected text"),
        }
    }

    #[test]
    fn test_cost_estimation() {
        let provider = AnthropicProvider::new("test_key".to_string());
        let cost = provider.estimate_cost(1000, 500);
        assert!(cost > 0.0);
    }

    #[tokio::test]
    async fn test_deep_analysis() {
        let provider = AnthropicProvider::new("test_key".to_string());
        let result = provider.deep_analysis("Analyze this", "Some context").await;
        assert!(result.is_ok());
    }
}
