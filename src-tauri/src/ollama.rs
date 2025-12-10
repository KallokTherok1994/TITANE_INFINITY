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
