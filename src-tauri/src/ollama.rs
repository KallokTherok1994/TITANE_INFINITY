#![allow(dead_code)]
use std::time::Duration;

use reqwest::{Client, StatusCode};
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
struct OllamaRequest<'a> {
    model: &'a str,
    prompt: &'a str,
    stream: bool,
}

#[derive(Deserialize)]
struct OllamaResponse {
    response: String,
}

#[derive(Deserialize)]
struct OllamaError {
    error: Option<String>,
    message: Option<String>,
}

pub async fn query_ollama(prompt: String) -> Result<String, String> {
    let trimmed_prompt = prompt.trim();
    if trimmed_prompt.is_empty() {
        return Err("Le prompt fourni est vide".to_string());
    }

    let client = Client::builder()
        .timeout(Duration::from_secs(60))
        .build()
        .map_err(|e| format!("Erreur création client Ollama: {e}"))?;

    let request_body = OllamaRequest {
        model: "titane-local",
        prompt: trimmed_prompt,
        stream: false,
    };

    let response = client
        .post("http://localhost:11434/api/generate")
        .json(&request_body)
        .send()
        .await
        .map_err(|e| format!("Erreur requête Ollama: {e}"))?;

    let status = response.status();
    if !status.is_success() {
        let error_payload = response.text().await.unwrap_or_else(|_| "".to_string());

        return Err(format_ollama_error(status, error_payload));
    }

    let parsed: OllamaResponse = response
        .json()
        .await
        .map_err(|e| format!("Erreur parsing réponse Ollama: {e}"))?;

    if parsed.response.trim().is_empty() {
        return Err("Réponse Ollama vide".to_string());
    }

    Ok(parsed.response)
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
