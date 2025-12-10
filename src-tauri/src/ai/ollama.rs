// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v∞.LOCAL — OLLAMA INTEGRATION
//   Handlers Rust/Tauri pour l'intégration du modèle local LLama 3.1
//   Architecture v∞: Super Prompt #12 - Local Model Integration
// ═══════════════════════════════════════════════════════════════════════════

use super::{AIError, AIProvider, AIRequest, AIResponse, AIResult};
use crate::security::shell_guard::ShellGuard;
use reqwest;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::Duration;
use tauri::{command, Emitter, Window};

const OLLAMA_BASE_URL: &str = "http://localhost:11434";
const DEFAULT_MODEL: &str = "titane-local";
const TIMEOUT_SECONDS: u64 = 60;

// ═══════════════════════════════════════════════════════════════════════════
//   TYPES & STRUCTURES
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Serialize, Deserialize)]
pub struct LocalAIRequest {
    pub prompt: String,
    pub model: Option<String>,
    pub stream: Option<bool>,
    pub context: Option<Vec<String>>,
    pub system: Option<String>,
    pub temperature: Option<f32>,
    pub max_tokens: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LocalAIResponse {
    pub content: String,
    pub model: String,
    pub done: bool,
    pub context: Option<Vec<i64>>,
    pub total_duration: Option<u64>,
    pub eval_count: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
struct OllamaGenerateRequest {
    model: String,
    prompt: String,
    stream: bool,
    system: Option<String>,
    options: Option<HashMap<String, serde_json::Value>>,
}

#[derive(Debug, Serialize, Deserialize)]
struct OllamaGenerateResponse {
    model: String,
    response: String,
    done: bool,
    context: Option<Vec<i64>>,
    total_duration: Option<u64>,
    eval_count: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
struct OllamaModel {
    name: String,
    modified_at: String,
    size: u64,
    digest: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct OllamaModelsResponse {
    models: Vec<OllamaModel>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaStatus {
    pub available: bool,
    pub version: Option<String>,
    pub models: Vec<String>,
}

// ═══════════════════════════════════════════════════════════════════════════
//   HANDLER 1: AI_GENERATE_LOCAL
//   Génération synchrone avec le modèle local
// ═══════════════════════════════════════════════════════════════════════════

#[command]
pub async fn ai_generate_local(request: LocalAIRequest) -> Result<LocalAIResponse, String> {
    // 🔒 SECURITY v19.3: Rate Limiting Check
    let user_id = "local_ai_user".to_string(); // TODO: Get from session
    if let Err(e) = crate::security::rate_limit::GLOBAL_RATE_LIMITER
        .check(&user_id)
        .await
    {
        // Log security event
        let event = crate::security::AuditEvent::new(
            crate::security::AuditEventType::RateLimitExceeded,
            user_id.clone(),
            serde_json::json!({ "model": request.model, "prompt_length": request.prompt.len() }),
            crate::security::AuditSeverity::Warning.into(),
        );
        let _ = crate::security::audit::GLOBAL_AUDIT_LOGGER.log(event).await;
        return Err(format!("Rate limit exceeded: {}", e));
    }

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(TIMEOUT_SECONDS))
        .build()
        .map_err(|e| format!("Client error: {}", e))?;

    let model = request.model.unwrap_or_else(|| DEFAULT_MODEL.to_string());

    // Construire les options
    let mut options = HashMap::new();
    if let Some(temp) = request.temperature {
        options.insert("temperature".to_string(), serde_json::json!(temp));
    }
    if let Some(max_tokens) = request.max_tokens {
        options.insert("num_predict".to_string(), serde_json::json!(max_tokens));
    }

    let ollama_request = OllamaGenerateRequest {
        model: model.clone(),
        prompt: request.prompt,
        stream: false,
        system: request.system,
        options: if options.is_empty() {
            None
        } else {
            Some(options)
        },
    };

    // Appel HTTP
    let response = client
        .post(format!("{}/api/generate", OLLAMA_BASE_URL))
        .json(&ollama_request)
        .send()
        .await
        .map_err(|e| format!("Ollama HTTP error: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Ollama error: HTTP {}", response.status()));
    }

    let ollama_response: OllamaGenerateResponse = response
        .json()
        .await
        .map_err(|e| format!("Ollama JSON parse error: {}", e))?;

    Ok(LocalAIResponse {
        content: ollama_response.response,
        model: ollama_response.model,
        done: ollama_response.done,
        context: ollama_response.context,
        total_duration: ollama_response.total_duration,
        eval_count: ollama_response.eval_count,
    })
}

// ═══════════════════════════════════════════════════════════════════════════
//   HANDLER 2: AI_GENERATE_LOCAL_STREAM
//   Génération en streaming progressif
// ═══════════════════════════════════════════════════════════════════════════

#[command]
pub async fn ai_generate_local_stream(
    window: Window,
    request: LocalAIRequest,
) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(TIMEOUT_SECONDS))
        .build()
        .map_err(|e| format!("Client error: {}", e))?;

    let model = request.model.unwrap_or_else(|| DEFAULT_MODEL.to_string());

    // Construire les options
    let mut options = HashMap::new();
    if let Some(temp) = request.temperature {
        options.insert("temperature".to_string(), serde_json::json!(temp));
    }
    if let Some(max_tokens) = request.max_tokens {
        options.insert("num_predict".to_string(), serde_json::json!(max_tokens));
    }

    let ollama_request = OllamaGenerateRequest {
        model: model.clone(),
        prompt: request.prompt,
        stream: true, // Enable streaming
        system: request.system,
        options: if options.is_empty() {
            None
        } else {
            Some(options)
        },
    };

    // Appel HTTP avec streaming
    let response = client
        .post(format!("{}/api/generate", OLLAMA_BASE_URL))
        .json(&ollama_request)
        .send()
        .await
        .map_err(|e| format!("Ollama HTTP error: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Ollama error: HTTP {}", response.status()));
    }

    // Lire le stream ligne par ligne
    use futures_util::StreamExt;
    let mut stream = response.bytes_stream();
    let mut buffer = String::new();

    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| format!("Stream error: {}", e))?;
        buffer.push_str(&String::from_utf8_lossy(&chunk));

        // Traiter les lignes complètes
        while let Some(newline_pos) = buffer.find('\n') {
            let line = buffer[..newline_pos].to_string();
            buffer = buffer[newline_pos + 1..].to_string();

            if line.is_empty() {
                continue;
            }

            // Parser la ligne JSON
            if let Ok(chunk_response) = serde_json::from_str::<OllamaGenerateResponse>(&line) {
                // Émettre l'événement vers le frontend
                let _ = window.emit(
                    "ai-stream-chunk",
                    serde_json::json!({
                        "content": chunk_response.response,
                        "done": chunk_response.done,
                        "model": chunk_response.model,
                    }),
                );

                if chunk_response.done {
                    break;
                }
            }
        }
    }

    Ok("Stream completed".to_string())
}

// ═══════════════════════════════════════════════════════════════════════════
//   HANDLER 3: AI_SCAN_LOCAL_MODELS
//   Liste tous les modèles installés dans Ollama
// ═══════════════════════════════════════════════════════════════════════════

#[command]
pub async fn ai_scan_local_models() -> Result<Vec<String>, String> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(5))
        .build()
        .map_err(|e| format!("Client error: {}", e))?;

    let response = client
        .get(format!("{}/api/tags", OLLAMA_BASE_URL))
        .send()
        .await
        .map_err(|e| format!("Ollama HTTP error: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Ollama error: HTTP {}", response.status()));
    }

    let models_response: OllamaModelsResponse = response
        .json()
        .await
        .map_err(|e| format!("Ollama JSON parse error: {}", e))?;

    Ok(models_response.models.into_iter().map(|m| m.name).collect())
}

// ═══════════════════════════════════════════════════════════════════════════
//   HANDLER 4: AI_SET_LOCAL_MODEL
//   Définit le modèle local par défaut (validation)
// ═══════════════════════════════════════════════════════════════════════════

#[command]
pub async fn ai_set_local_model(model_name: String) -> Result<String, String> {
    // Vérifier que le modèle existe
    let available_models = ai_scan_local_models().await?;

    if !available_models.contains(&model_name) {
        return Err(format!(
            "Model '{}' not found. Available models: {:?}",
            model_name, available_models
        ));
    }

    // Tester le modèle avec une requête simple
    let test_request = LocalAIRequest {
        prompt: "Test".to_string(),
        model: Some(model_name.clone()),
        stream: Some(false),
        context: None,
        system: None,
        temperature: None,
        max_tokens: Some(10),
    };

    let test_response = ai_generate_local(test_request).await?;

    if !test_response.done {
        return Err(format!("Model '{}' failed test", model_name));
    }

    Ok(format!(
        "Model '{}' set as default and validated",
        model_name
    ))
}

// ═══════════════════════════════════════════════════════════════════════════
//   HANDLER 5: AI_CHECK_OLLAMA_STATUS
//   Vérifie si Ollama est disponible + version + modèles
// ═══════════════════════════════════════════════════════════════════════════

#[command]
pub async fn ai_check_ollama_status() -> Result<OllamaStatus, String> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(2))
        .build()
        .map_err(|e| format!("Client error: {}", e))?;

    // Test de disponibilité
    let response = client
        .get(format!("{}/api/tags", OLLAMA_BASE_URL))
        .send()
        .await;

    match response {
        Ok(resp) if resp.status().is_success() => {
            // Récupérer la liste des modèles
            let models_response: OllamaModelsResponse = resp
                .json()
                .await
                .map_err(|e| format!("Ollama JSON parse error: {}", e))?;

            let model_names: Vec<String> =
                models_response.models.into_iter().map(|m| m.name).collect();

            Ok(OllamaStatus {
                available: true,
                version: Some("unknown".to_string()), // Ollama n'expose pas facilement la version
                models: model_names,
            })
        }
        Ok(resp) => Err(format!("Ollama error: HTTP {}", resp.status())),
        Err(_) => {
            // Ollama non disponible
            Ok(OllamaStatus {
                available: false,
                version: None,
                models: vec![],
            })
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//   LEGACY CLIENT (Compatibility v15)
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
//   LEGACY CLIENT (Compatibility v15)
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Serialize)]
struct OllamaRequest {
    model: String,
    prompt: String,
    stream: bool,
    options: OllamaOptions,
}

#[derive(Debug, Serialize)]
struct OllamaOptions {
    temperature: f32,
    num_predict: usize,
}

#[derive(Debug, Deserialize)]
struct OllamaResponse {
    response: String,
    #[allow(dead_code)]
    done: bool,
}

pub struct OllamaClient {
    model: String,
    client: reqwest::Client,
    shell_guard: ShellGuard,
}

impl OllamaClient {
    pub fn new(model: Option<String>) -> Self {
        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(TIMEOUT_SECONDS))
            .build()
            .unwrap_or_else(|_| reqwest::Client::new());

        Self {
            model: model.unwrap_or_else(|| DEFAULT_MODEL.to_string()),
            client,
            shell_guard: ShellGuard::new(),
        }
    }

    pub fn is_installed(&self) -> bool {
        // ✅ SECURED: Use ShellGuard (ollama needs to be whitelisted)
        self.shell_guard
            .execute_verified("ollama", &["list"])
            .is_ok()
    }

    pub async fn is_available(&self) -> bool {
        if !self.is_installed() {
            return false;
        }

        // Check if Ollama daemon is running
        self.client
            .get("http://localhost:11434/api/tags")
            .timeout(Duration::from_secs(2))
            .send()
            .await
            .is_ok()
    }

    pub async fn query(&self, request: &AIRequest) -> AIResult<AIResponse> {
        if !self.is_available().await {
            return Err(AIError::NetworkError(
                "Ollama daemon not running".to_string(),
            ));
        }

        let ollama_request = OllamaRequest {
            model: self.model.clone(),
            prompt: request.prompt.clone(),
            stream: false,
            options: OllamaOptions {
                temperature: request.temperature,
                num_predict: request.max_tokens,
            },
        };

        let response = self
            .client
            .post(format!("{}/api/generate", OLLAMA_BASE_URL))
            .json(&ollama_request)
            .send()
            .await
            .map_err(|e| AIError::NetworkError(e.to_string()))?;

        if !response.status().is_success() {
            return Err(AIError::APIError(format!(
                "Ollama API error: {}",
                response.status()
            )));
        }

        let ollama_response: OllamaResponse = response
            .json()
            .await
            .map_err(|e| AIError::InvalidResponse(e.to_string()))?;

        let tokens = ollama_response.response.split_whitespace().count();

        Ok(AIResponse {
            content: ollama_response.response,
            provider: AIProvider::Ollama,
            timestamp: chrono::Utc::now().timestamp(),
            tokens,
        })
    }

    pub async fn query_stream(&self, request: &AIRequest) -> AIResult<AIResponse> {
        // For now, fallback to non-streaming
        // TODO: Implement true streaming
        self.query(request).await
    }

    pub fn get_available_models(&self) -> Vec<String> {
        // ✅ SECURED: Use ShellGuard
        self.shell_guard
            .execute_verified("ollama", &["list"])
            .ok()
            .map(|output| {
                output
                    .lines()
                    .skip(1) // Skip header
                    .filter_map(|line| line.split_whitespace().next())
                    .map(String::from)
                    .collect()
            })
            .unwrap_or_default()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ollama_installed() {
        let client = OllamaClient::new(None);
        // Should not panic
        let _ = client.is_installed();
    }

    #[tokio::test]
    async fn test_ollama_availability() {
        let client = OllamaClient::new(None);
        let _ = client.is_available().await;
    }
}
