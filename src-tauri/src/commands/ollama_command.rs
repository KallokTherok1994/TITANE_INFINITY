/**
 * TITANE∞ — Unified Ollama Provider Command
 * Centralized Tauri command for all Ollama interactions
 * Replaces scattered direct HTTP calls throughout codebase
 */

use serde::{Deserialize, Serialize};
use std::time::Duration;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct OllamaRequest {
    pub model: String,
    pub prompt: String,
    pub timeout_secs: u64,
    #[serde(default)]
    pub temperature: Option<f32>,
    #[serde(default)]
    pub system_prompt: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct OllamaResponse {
    pub content: String,
    pub latency_ms: u64,
    pub model: String,
    pub error: Option<String>,
}

/// ✅ CRITICAL FIX #1: Unified Ollama command (replaces scattered HTTP calls)
/// All frontend/backend Ollama requests MUST go through this command
#[tauri::command]
pub async fn ollama_generate(req: OllamaRequest) -> Result<OllamaResponse, String> {
    let start = std::time::Instant::now();
    let url = "http://127.0.0.1:11434/api/generate";
    
    log::info!(
        "[OLLAMA_CMD] Request: model={}, prompt_len={}, timeout={}s",
        req.model,
        req.prompt.len(),
        req.timeout_secs
    );

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(req.timeout_secs))
        .build()
        .map_err(|e| {
            let err_msg = format!("HTTP client error: {}", e);
            log::error!("[OLLAMA_CMD] {}", err_msg);
            err_msg
        })?;

    let mut body = serde_json::json!({
        "model": req.model,
        "prompt": req.prompt,
        "stream": false,
    });

    // Add system prompt if provided
    if let Some(sys) = &req.system_prompt {
        body["system"] = serde_json::json!(sys);
    }

    // Add temperature if provided
    if let Some(temp) = req.temperature {
        body["options"] = serde_json::json!({
            "temperature": temp,
        });
    }

    match client.post(url).json(&body).send().await {
        Ok(resp) => {
            let status = resp.status();
            
            if !status.is_success() {
                let err_msg = format!(
                    "Ollama returned HTTP {}: {}",
                    status,
                    resp.text().await.unwrap_or_else(|_| "unknown error".to_string())
                );
                log::error!("[OLLAMA_CMD] {}", err_msg);
                
                // Check if service is offline
                if status.is_server_error() {
                    return Err(format!("Ollama service offline ({})", status));
                }
                return Err(err_msg);
            }

            match resp.json::<serde_json::Value>().await {
                Ok(data) => {
                    let content = data
                        .get("response")
                        .and_then(|v| v.as_str())
                        .unwrap_or("No response content")
                        .to_string();

                    let latency_ms = start.elapsed().as_millis() as u64;
                    
                    log::info!(
                        "[OLLAMA_CMD] Success: {} chars, {} ms",
                        content.len(),
                        latency_ms
                    );

                    Ok(OllamaResponse {
                        content,
                        latency_ms,
                        model: req.model,
                        error: None,
                    })
                }
                Err(e) => {
                    let err_msg = format!("Parse error: {}", e);
                    log::error!("[OLLAMA_CMD] {}", err_msg);
                    Err(err_msg)
                }
            }
        }
        Err(e) => {
            let latency_ms = start.elapsed().as_millis() as u64;
            let err_msg = format!("Ollama offline or timeout ({}ms): {}", latency_ms, e);
            log::warn!("[OLLAMA_CMD] {}", err_msg);
            Err(err_msg)
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
