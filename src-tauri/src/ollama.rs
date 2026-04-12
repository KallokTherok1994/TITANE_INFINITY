#![allow(dead_code)]
use std::env;
use std::time::Duration;

use crate::core::http_types::{Client, StatusCode};
use serde::{Deserialize, Serialize};

const OLLAMA_BASE_URL_FALLBACK: &str = "http://127.0.0.1:11434";
const DEFAULT_OLLAMA_MODEL: &str = "gemma2:2b";
const OLLAMA_MODEL_ENV: &str = "TITANE_OLLAMA_MODEL";

fn ollama_base_url() -> String {
    // Disk config on Android (highest priority)
    if let Some(disk_url) = crate::runtime_config::get_persisted_ollama_url() {
        return disk_url;
    }
    
    // Environment variables (fallback)
    std::env::var("OLLAMA_BASE_URL")
        .or_else(|_| std::env::var("OLLAMA_URL"))
        .unwrap_or_else(|_| OLLAMA_BASE_URL_FALLBACK.to_string())
}

/// Returns the recommended context window size for a given model name.
/// Larger context models (llama3.2, mistral, qwen2.5…) benefit greatly from
/// more context; small models (gemma2:2b, phi3.5) are capped at 8K.
fn model_context_window(model: &str) -> u32 {
    let lower = model.to_lowercase();
    if lower.starts_with("llama3.2") || lower.starts_with("llama3.3") {
        32_768 // llama3.2 supports up to 128K; 32K is the pragmatic default
    } else if lower.starts_with("llama3.1") {
        16_384
    } else if lower.starts_with("mistral") || lower.starts_with("mixtral") {
        32_768
    } else if lower.starts_with("qwen2.5") || lower.starts_with("qwen3") {
        32_768
    } else if lower.starts_with("deepseek") {
        32_768
    } else if lower.starts_with("phi4") {
        16_384
    } else {
        // gemma2, phi3.5, small models — conservative but correct default
        8_192
    }
}

/// Full set of parameters for an Ollama query.
/// All fields are optional except `prompt`.
#[derive(Debug, Clone, Default)]
pub struct OllamaParams {
    /// User/conversation prompt (required).
    pub prompt: String,
    /// System prompt injected before the conversation.
    pub system_prompt: Option<String>,
    /// Model to use. `None` → `TITANE_OLLAMA_MODEL` env var or `gemma2:2b`.
    pub model: Option<String>,
    /// Sampling temperature (0.0–2.0). `None` → Ollama default (~0.8).
    pub temperature: Option<f32>,
    /// Maximum tokens to generate. `None` → unlimited (Ollama default: -1).
    pub max_tokens: Option<u32>,
    /// Request timeout in seconds. `None` → 60 s.
    pub timeout_secs: Option<u64>,
    /// Context window size. `None` → model-aware default via `model_context_window()`.
    pub num_ctx: Option<u32>,
}

#[derive(Serialize)]
struct OllamaRequest<'a> {
    model: &'a str,
    prompt: &'a str,
    stream: bool,
    /// System prompt — top-level field in Ollama /api/generate.
    #[serde(skip_serializing_if = "Option::is_none")]
    system: Option<&'a str>,
    #[serde(skip_serializing_if = "Option::is_none")]
    options: Option<OllamaOptions>,
}

#[derive(Serialize)]
struct OllamaOptions {
    #[serde(skip_serializing_if = "Option::is_none")]
    num_ctx: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    temperature: Option<f32>,
    /// Maximum tokens to generate (-1 = unlimited).
    #[serde(skip_serializing_if = "Option::is_none")]
    num_predict: Option<i32>,
    /// Nucleus sampling probability (0.0–1.0).
    #[serde(skip_serializing_if = "Option::is_none")]
    top_p: Option<f32>,
    /// Penalise token repetition (>1.0 reduces repetition).
    #[serde(skip_serializing_if = "Option::is_none")]
    repeat_penalty: Option<f32>,
}

/// Result returned by query_ollama — includes the model that actually responded
/// and real Ollama runtime metrics.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OllamaResult {
    pub response: String,
    pub model: String,
    /// Effective context window sent to Ollama.
    pub context_window_used: Option<u32>,
    /// Total time in nanoseconds (Ollama native).
    pub total_duration: Option<u64>,
    /// Model load time in nanoseconds.
    pub load_duration: Option<u64>,
    /// Number of tokens in the prompt.
    pub prompt_eval_count: Option<u32>,
    /// Time spent evaluating the prompt (nanoseconds).
    pub prompt_eval_duration: Option<u64>,
    /// Number of tokens generated.
    pub eval_count: Option<u32>,
    /// Time spent generating tokens (nanoseconds).
    pub eval_duration: Option<u64>,
    /// Reason generation stopped (e.g. "stop").
    pub done_reason: Option<String>,
}

#[derive(Deserialize)]
struct OllamaResponse {
    response: String,
    #[serde(default)]
    total_duration: Option<u64>,
    #[serde(default)]
    load_duration: Option<u64>,
    #[serde(default)]
    prompt_eval_count: Option<u32>,
    #[serde(default)]
    prompt_eval_duration: Option<u64>,
    #[serde(default)]
    eval_count: Option<u32>,
    #[serde(default)]
    eval_duration: Option<u64>,
    #[serde(default)]
    done_reason: Option<String>,
}

#[derive(Deserialize)]
struct OllamaTagsResponse {
    models: Vec<OllamaTagModel>,
}

#[derive(Deserialize)]
struct OllamaTagModel {
    name: String,
}

#[derive(Deserialize)]
struct OllamaError {
    error: Option<String>,
    message: Option<String>,
}

pub async fn query_ollama(params: OllamaParams) -> Result<OllamaResult, String> {
    let trimmed_prompt = params.prompt.trim().to_string();
    if trimmed_prompt.is_empty() {
        return Err("Le prompt fourni est vide".to_string());
    }

    let timeout_secs = params.timeout_secs.unwrap_or(60);
    let client = Client::builder()
        .timeout(Duration::from_secs(timeout_secs))
        .build()
        .map_err(|e| format!("Erreur création client Ollama: {e}"))?;

    let preferred_model = params.model.filter(|m| !m.is_empty()).unwrap_or_else(|| {
        env::var(OLLAMA_MODEL_ENV)
            .ok()
            .map(|v| v.trim().to_string())
            .filter(|v| !v.is_empty())
            .unwrap_or_else(|| DEFAULT_OLLAMA_MODEL.to_string())
    });

    let system_ref = params.system_prompt.as_deref();
    let effective_ctx = params
        .num_ctx
        .unwrap_or_else(|| model_context_window(&preferred_model));

    let response = send_generate(
        &client,
        &preferred_model,
        &trimmed_prompt,
        system_ref,
        params.temperature,
        Some(effective_ctx),
        params.max_tokens,
    )
    .await;
    if let Ok((text, used_model, td, ld, pec, ped, ec, ed, dr)) = response {
        return Ok(OllamaResult {
            response: text,
            model: used_model,
            context_window_used: Some(effective_ctx),
            total_duration: td,
            load_duration: ld,
            prompt_eval_count: pec,
            prompt_eval_duration: ped,
            eval_count: ec,
            eval_duration: ed,
            done_reason: dr,
        });
    }

    let (status, payload) = response.err().unwrap_or_else(|| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Erreur Ollama inconnue".to_string(),
        )
    });

    // Fallback automatique si le modèle par défaut n'existe pas.
    if status == StatusCode::NOT_FOUND && payload.contains("model") && payload.contains("not found")
    {
        if let Ok(fallback_model) = pick_fallback_model(&client).await {
            if fallback_model != preferred_model {
                let fallback_ctx = params
                    .num_ctx
                    .unwrap_or_else(|| model_context_window(&fallback_model));
                if let Ok((text, used_model, td, ld, pec, ped, ec, ed, dr)) = send_generate(
                    &client,
                    &fallback_model,
                    &trimmed_prompt,
                    system_ref,
                    params.temperature,
                    Some(fallback_ctx),
                    params.max_tokens,
                )
                .await
                {
                    return Ok(OllamaResult {
                        response: text,
                        model: used_model,
                        context_window_used: Some(fallback_ctx),
                        total_duration: td,
                        load_duration: ld,
                        prompt_eval_count: pec,
                        prompt_eval_duration: ped,
                        eval_count: ec,
                        eval_duration: ed,
                        done_reason: dr,
                    });
                }
            }
        }
    }

    Err(format_ollama_error(status, payload))
}

/// Send a generate request to Ollama. Returns (response_text, model_used, metrics).
async fn send_generate(
    client: &Client,
    model: &str,
    prompt: &str,
    system: Option<&str>,
    temperature: Option<f32>,
    num_ctx: Option<u32>,
    max_tokens: Option<u32>,
) -> Result<
    (
        String,
        String,
        Option<u64>,
        Option<u64>,
        Option<u32>,
        Option<u64>,
        Option<u32>,
        Option<u64>,
        Option<String>,
    ),
    (StatusCode, String),
> {
    let options = OllamaOptions {
        num_ctx,
        temperature,
        num_predict: max_tokens.map(|t| t as i32),
        top_p: None,
        repeat_penalty: None,
    };

    let request_body = OllamaRequest {
        model,
        prompt,
        stream: false,
        system,
        options: Some(options),
    };

    let response = client
        .post(format!("{}/api/generate", ollama_base_url()))
        .json(&request_body)
        .send()
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Erreur requête Ollama: {e}"),
            )
        })?;

    let status = response.status();
    if !status.is_success() {
        let error_payload = response.text().await.unwrap_or_else(|_| "".to_string());
        return Err((status, error_payload));
    }

    let parsed: OllamaResponse = response.json().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Erreur parsing réponse Ollama: {e}"),
        )
    })?;

    if parsed.response.trim().is_empty() {
        return Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            "Réponse Ollama vide".to_string(),
        ));
    }

    Ok((
        parsed.response,
        model.to_string(),
        parsed.total_duration,
        parsed.load_duration,
        parsed.prompt_eval_count,
        parsed.prompt_eval_duration,
        parsed.eval_count,
        parsed.eval_duration,
        parsed.done_reason,
    ))
}

async fn pick_fallback_model(client: &Client) -> Result<String, String> {
    let response = client
        .get(format!("{}/api/tags", ollama_base_url()))
        .send()
        .await
        .map_err(|e| format!("Erreur requête Ollama tags: {e}"))?;

    let status = response.status();
    if !status.is_success() {
        let payload = response.text().await.unwrap_or_else(|_| "".to_string());
        return Err(format_ollama_error(status, payload));
    }

    let tags: OllamaTagsResponse = response
        .json()
        .await
        .map_err(|e| format!("Erreur parsing Ollama tags: {e}"))?;

    let available: Vec<String> = tags.models.into_iter().map(|m| m.name).collect();
    if available.is_empty() {
        return Err("Aucun modèle Ollama disponible".to_string());
    }

    // Ordre de préférence: modèles généralistes rapides puis fallback sur le premier dispo.
    let preferred = [
        "gemma2:2b",
        "gemma2:latest",
        "qwen2.5:latest",
        "llama3.2:latest",
        "mistral:latest",
        "phi3.5:latest",
    ];

    for name in preferred {
        if available.iter().any(|m| m == name) {
            return Ok(name.to_string());
        }
    }

    Ok(available[0].clone())
}

fn format_ollama_error(status: StatusCode, payload: String) -> String {
    if payload.is_empty() {
        return format!(
            "Ollama a renvoyé un statut {} sans contenu",
            status.as_u16()
        );
    }

    if let Ok(error_body) = serde_json::from_str::<OllamaError>(&payload) {
        if let Some(message) = error_body.error.or(error_body.message) {
            return format!(
                "Ollama a renvoyé un statut {}: {}",
                status.as_u16(),
                message
            );
        }
    }

    format!(
        "Ollama a renvoyé un statut {}: {}",
        status.as_u16(),
        payload
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // format_ollama_error Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_format_error_empty_payload() {
        let error = format_ollama_error(StatusCode::INTERNAL_SERVER_ERROR, "".to_string());
        assert!(error.contains("500"));
        assert!(error.contains("sans contenu"));
    }

    #[test]
    fn test_format_error_with_json_error_field() {
        let payload = r#"{"error": "Model not found"}"#.to_string();
        let error = format_ollama_error(StatusCode::NOT_FOUND, payload);
        assert!(error.contains("404"));
        assert!(error.contains("Model not found"));
    }

    #[test]
    fn test_format_error_with_json_message_field() {
        let payload = r#"{"message": "Server busy"}"#.to_string();
        let error = format_ollama_error(StatusCode::SERVICE_UNAVAILABLE, payload);
        assert!(error.contains("503"));
        assert!(error.contains("Server busy"));
    }

    #[test]
    fn test_format_error_with_raw_payload() {
        let payload = "Something went wrong".to_string();
        let error = format_ollama_error(StatusCode::BAD_REQUEST, payload);
        assert!(error.contains("400"));
        assert!(error.contains("Something went wrong"));
    }

    #[test]
    fn test_format_error_various_status_codes() {
        let codes = [
            StatusCode::BAD_REQUEST,
            StatusCode::UNAUTHORIZED,
            StatusCode::FORBIDDEN,
            StatusCode::NOT_FOUND,
            StatusCode::INTERNAL_SERVER_ERROR,
        ];

        for code in codes {
            let error = format_ollama_error(code, "test".to_string());
            assert!(error.contains(&code.as_u16().to_string()));
        }
    }

    // ─────────────────────────────────────────────────────────────
    // model_context_window Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_model_context_window_llama32() {
        assert_eq!(model_context_window("llama3.2:latest"), 32_768);
        assert_eq!(model_context_window("llama3.2:3b"), 32_768);
        assert_eq!(model_context_window("llama3.3:latest"), 32_768);
    }

    #[test]
    fn test_model_context_window_llama31() {
        assert_eq!(model_context_window("llama3.1:latest"), 16_384);
        assert_eq!(model_context_window("llama3.1:8b"), 16_384);
    }

    #[test]
    fn test_model_context_window_mistral() {
        assert_eq!(model_context_window("mistral:latest"), 32_768);
        assert_eq!(model_context_window("mixtral:8x7b"), 32_768);
    }

    #[test]
    fn test_model_context_window_qwen() {
        assert_eq!(model_context_window("qwen2.5:latest"), 32_768);
        assert_eq!(model_context_window("qwen3:latest"), 32_768);
    }

    #[test]
    fn test_model_context_window_default() {
        assert_eq!(model_context_window("gemma2:2b"), 8_192);
        assert_eq!(model_context_window("phi3.5:latest"), 8_192);
        assert_eq!(model_context_window("unknown-model"), 8_192);
    }

    // ─────────────────────────────────────────────────────────────
    // query_ollama Tests (unit tests without actual network)
    // ─────────────────────────────────────────────────────────────

    #[tokio::test]
    async fn test_query_ollama_empty_prompt() {
        let result = query_ollama(OllamaParams {
            prompt: "".to_string(),
            ..Default::default()
        })
        .await;
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("vide"));
    }

    #[tokio::test]
    async fn test_query_ollama_whitespace_prompt() {
        let result = query_ollama(OllamaParams {
            prompt: "   \n\t  ".to_string(),
            ..Default::default()
        })
        .await;
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("vide"));
    }

    #[test]
    fn test_ollama_params_defaults() {
        let p = OllamaParams {
            prompt: "test".to_string(),
            ..Default::default()
        };
        assert!(p.model.is_none());
        assert!(p.system_prompt.is_none());
        assert!(p.temperature.is_none());
        assert!(p.max_tokens.is_none());
        assert!(p.timeout_secs.is_none());
        assert!(p.num_ctx.is_none());
    }
}
