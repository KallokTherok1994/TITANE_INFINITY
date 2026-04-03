
#![allow(dead_code)]
use std::env;
use std::time::Duration;

use crate::core::http_types::{Client, StatusCode};
use serde::{Deserialize, Serialize};

const OLLAMA_BASE_URL_FALLBACK: &str = "http://127.0.0.1:11434";
const DEFAULT_OLLAMA_MODEL: &str = "gemma2:2b";
const OLLAMA_MODEL_ENV: &str = "TITANE_OLLAMA_MODEL";

fn ollama_base_url() -> String {
    std::env::var("OLLAMA_BASE_URL")
        .or_else(|_| std::env::var("OLLAMA_URL"))
        .unwrap_or_else(|_| OLLAMA_BASE_URL_FALLBACK.to_string())
}

#[derive(Serialize)]
struct OllamaRequest<'a> {
    model: &'a str,
    prompt: &'a str,
    stream: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    options: Option<OllamaOptions>,
}

#[derive(Serialize)]
struct OllamaOptions {
    #[serde(skip_serializing_if = "Option::is_none")]
    num_ctx: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    temperature: Option<f32>,
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

pub async fn query_ollama(prompt: String) -> Result<OllamaResult, String> {
    let trimmed_prompt = prompt.trim();
    if trimmed_prompt.is_empty() {
        return Err("Le prompt fourni est vide".to_string());
    }

    let client = Client::builder()
        .timeout(Duration::from_secs(60))
        .build()
        .map_err(|e| format!("Erreur création client Ollama: {e}"))?;

    let preferred_model = env::var(OLLAMA_MODEL_ENV)
        .ok()
        .map(|v| v.trim().to_string())
        .filter(|v| !v.is_empty())
        .unwrap_or_else(|| DEFAULT_OLLAMA_MODEL.to_string());

    let response = send_generate(&client, &preferred_model, trimmed_prompt).await;
    if let Ok((text, used_model, td, ld, pec, ped, ec, ed, dr)) = response {
        return Ok(OllamaResult {
            response: text,
            model: used_model,
            context_window_used: Some(8192),
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
    if status == StatusCode::NOT_FOUND && payload.contains("model") && payload.contains("not found") {
        if let Ok(fallback_model) = pick_fallback_model(&client).await {
            if fallback_model != preferred_model {
                if let Ok((text, used_model, td, ld, pec, ped, ec, ed, dr)) = send_generate(&client, &fallback_model, trimmed_prompt).await {
                    return Ok(OllamaResult {
                        response: text,
                        model: used_model,
                        context_window_used: Some(8192),
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
async fn send_generate(client: &Client, model: &str, prompt: &str) -> Result<(String, String, Option<u64>, Option<u64>, Option<u32>, Option<u64>, Option<u32>, Option<u64>, Option<String>), (StatusCode, String)> {
    let options = OllamaOptions {
        num_ctx: Some(8192),  // Effective context window for gemma2:2b
        temperature: None,
    };

    let request_body = OllamaRequest {
        model,
        prompt,
        stream: false,
        options: Some(options),
    };

    let response = client
        .post(format!("{}/api/generate", ollama_base_url()))
        .json(&request_body)
        .send()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Erreur requête Ollama: {e}")))?;

    let status = response.status();
    if !status.is_success() {
        let error_payload = response.text().await.unwrap_or_else(|_| "".to_string());
        return Err((status, error_payload));
    }

    let parsed: OllamaResponse = response
        .json()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Erreur parsing réponse Ollama: {e}")))?;

    if parsed.response.trim().is_empty() {
        return Err((StatusCode::INTERNAL_SERVER_ERROR, "Réponse Ollama vide".to_string()));
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
    // query_ollama Tests (unit tests without actual network)
    // ─────────────────────────────────────────────────────────────

    #[tokio::test]
    async fn test_query_ollama_empty_prompt() {
        let result = query_ollama("".to_string()).await;
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("vide"));
    }

    #[tokio::test]
    async fn test_query_ollama_whitespace_prompt() {
        let result = query_ollama("   \n\t  ".to_string()).await;
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("vide"));
    }
}
