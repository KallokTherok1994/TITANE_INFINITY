use crate::ollama::{query_ollama, OllamaParams};
/**
 * TITANE∞ — Unified Ollama Provider Command
 * Centralized Tauri command for all Ollama interactions
 * Replaces scattered direct HTTP calls throughout codebase
 */
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct OllamaRequest {
    pub model: String,
    pub prompt: String,
    pub timeout_secs: u64,
    #[serde(default)]
    pub temperature: Option<f32>,
    #[serde(default)]
    pub system_prompt: Option<String>,
    /// Maximum tokens to generate. Forwarded to Ollama `num_predict`.
    #[serde(default)]
    pub max_tokens: Option<u32>,
    /// Context window size override. `None` → model-aware default via `model_context_window()`.
    #[serde(default)]
    pub num_ctx: Option<u32>,
}

#[derive(Debug, Clone, Serialize)]
pub struct OllamaResponse {
    pub ok: bool,
    pub content: String,
    pub latency_ms: u64,
    pub model: String,
    pub error: Option<String>,
    // Real Ollama runtime metrics (nanoseconds)
    pub total_duration: Option<u64>,
    pub load_duration: Option<u64>,
    pub prompt_eval_count: Option<u32>,
    pub prompt_eval_duration: Option<u64>,
    pub eval_count: Option<u32>,
    pub eval_duration: Option<u64>,
    pub done_reason: Option<String>,
}

/// ✅ LOCK FIX: Unified Ollama command — delegates to query_ollama()
/// Returns actual model used (handles fallback transparently).
#[tauri::command]
pub async fn ollama_generate(req: OllamaRequest) -> Result<OllamaResponse, String> {
    let start = std::time::Instant::now();

    log::info!(
        "[OLLAMA_CMD] Request: model={}, prompt_len={}, timeout={}s",
        req.model,
        req.prompt.len(),
        req.timeout_secs
    );

    let params = OllamaParams {
        prompt: req.prompt,
        model: Some(req.model),
        system_prompt: req.system_prompt,
        temperature: req.temperature,
        max_tokens: req.max_tokens,
        timeout_secs: Some(req.timeout_secs),
        num_ctx: req.num_ctx, // None → model_context_window() picks the right default
    };

    match query_ollama(params).await {
        Ok(result) => {
            let latency_ms = start.elapsed().as_millis() as u64;

            log::info!(
                "[OLLAMA_CMD] Success: {} chars, {} ms, model={}, eval={}, total={}ns",
                result.response.len(),
                latency_ms,
                result.model,
                result.eval_count.unwrap_or(0),
                result.total_duration.unwrap_or(0)
            );

            Ok(OllamaResponse {
                ok: true,
                content: result.response,
                latency_ms,
                model: result.model,
                error: None,
                total_duration: result.total_duration,
                load_duration: result.load_duration,
                prompt_eval_count: result.prompt_eval_count,
                prompt_eval_duration: result.prompt_eval_duration,
                eval_count: result.eval_count,
                eval_duration: result.eval_duration,
                done_reason: result.done_reason,
            })
        }
        Err(e) => {
            let latency_ms = start.elapsed().as_millis() as u64;
            log::error!("[OLLAMA_CMD] Failed: {} ({}ms)", e, latency_ms);
            Err(e)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_ollama_request_structure() {
        let req = OllamaRequest {
            model: "gemma2:2b".to_string(),
            prompt: "Test prompt".to_string(),
            timeout_secs: 30,
            temperature: Some(0.7),
            system_prompt: Some("Test system".to_string()),
        };

        assert_eq!(req.model, "gemma2:2b");
        assert_eq!(req.prompt, "Test prompt");
        assert_eq!(req.timeout_secs, 30);
        assert_eq!(req.temperature, Some(0.7));
    }

    // Integration test would require Ollama running
    // #[tokio::test]
    // async fn test_ollama_generate_live() {
    //     let req = OllamaRequest { ... };
    //     let result = ollama_generate(req).await;
    //     assert!(result.is_ok());
    // }
}
