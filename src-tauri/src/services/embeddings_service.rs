// ═══════════════════════════════════════════════════════════════
// TITANE∞ — Conversation OS v1 — EmbeddingsService (Ring 3)
// Governed Ollama embeddings via NetworkGatewayService.
// ═══════════════════════════════════════════════════════════════

use crate::services::network_gateway::{NetworkGatewayConfig, NetworkGatewayService};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmbeddingVector {
    pub model: String,
    pub dimensions: usize,
    pub values: Vec<f32>,
}

pub struct EmbeddingsService {
    gateway: NetworkGatewayService,
}

impl EmbeddingsService {
    pub fn new(gateway: NetworkGatewayService) -> Self {
        Self { gateway }
    }

    pub fn default_local_ollama() -> Self {
        let gateway = NetworkGatewayService::new(NetworkGatewayConfig {
            domain_allowlist: vec!["localhost".to_string(), "127.0.0.1".to_string()],
            timeout_ms: 20_000,
            max_requests: 30,
            max_bytes_total: 10 * 1024 * 1024,
            ..NetworkGatewayConfig::default()
        });

        Self::new(gateway)
    }

    pub async fn create_embedding(
        &self,
        input: &str,
        model: Option<&str>,
    ) -> Result<EmbeddingVector, String> {
        let selected_model = model.unwrap_or("nomic-embed-text").to_string();
        let payload = serde_json::json!({
            "model": selected_model,
            "prompt": input,
        });

        let json = self
            .gateway
            .post_json(
                "http://localhost:11434/api/embeddings",
                &payload,
                vec![("Content-Type".to_string(), "application/json".to_string())],
            )
            .await
            .map_err(|err| err.to_string())?;

        let values = json
            .get("embedding")
            .and_then(|value| value.as_array())
            .ok_or_else(|| "Invalid Ollama embeddings response: missing embedding".to_string())?
            .iter()
            .map(|value| value.as_f64().unwrap_or(0.0) as f32)
            .collect::<Vec<f32>>();

        Ok(EmbeddingVector {
            model: payload
                .get("model")
                .and_then(|value| value.as_str())
                .unwrap_or("nomic-embed-text")
                .to_string(),
            dimensions: values.len(),
            values,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_local_ollama_config() {
        let _service = EmbeddingsService::default_local_ollama();
    }
}
