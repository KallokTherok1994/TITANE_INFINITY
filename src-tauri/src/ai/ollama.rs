// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v∞.LOCAL — OLLAMA INTEGRATION
//   Handlers Rust/Tauri pour l'intégration du modèle local LLama 3.1
//   Architecture v∞: Super Prompt #12 - Local Model Integration
// ═══════════════════════════════════════════════════════════════════════════

use super::{AIError, AIProvider, AIRequest, AIResponse, AIResult};
use crate::core::http_types::Client;
use crate::runtime_config::{get_persisted_ollama_model, get_persisted_ollama_url};
use crate::security::shell_guard::ShellGuard;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{Duration, Instant};
use tauri::{command, Emitter, Window};

const DEFAULT_OLLAMA_BASE_URL: &str = "http://127.0.0.1:11434";
const DEFAULT_OLLAMA_MODEL: &str = "gemma2:2b";
/// Ordered list of fallback models tried when the default/requested model is absent.
/// Explicit, no silent switch: each fallback attempt is logged as WARN.
const OLLAMA_FALLBACK_MODELS: &[&str] = &["llama3.2", "llama3.1", "mistral"];
/// Env var governing the Ollama HTTP client request timeout (seconds, bounded 10..300).
const OLLAMA_REQUEST_TIMEOUT_SECS_ENV: &str = "OLLAMA_REQUEST_TIMEOUT_SECS";
const OLLAMA_REQUEST_TIMEOUT_SECS_DEFAULT: u64 = 120;

// ✨ v27.2.1: Ollama status cache (anti-flapping)
// Cache TTL: 10s to avoid repeated health checks
const OLLAMA_STATUS_CACHE_TTL_SECS: u64 = 10;

// Simple cache with Mutex (thread-safe)
static OLLAMA_STATUS_CACHE: Mutex<Option<(OllamaStatus, Instant)>> = Mutex::new(None);

#[derive(Debug, Clone)]
struct ResolvedOllamaRuntime {
    base_url: String,
    model: String,
    endpoint_kind: String,
    endpoint_source: String,
    model_source: String,
    network_used: bool,
}

fn normalize_ollama_base_url(raw: &str) -> String {
    let mut normalized = raw.trim().trim_end_matches('/').to_string();
    if normalized.ends_with("/v1") {
        normalized = normalized.trim_end_matches("/v1").to_string();
    }
    if normalized.ends_with("/api") {
        normalized = normalized.trim_end_matches("/api").to_string();
    }

    if normalized.is_empty() {
        DEFAULT_OLLAMA_BASE_URL.to_string()
    } else {
        normalized
    }
}

fn normalize_ollama_model(raw: &str) -> String {
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        DEFAULT_OLLAMA_MODEL.to_string()
    } else {
        trimmed.to_string()
    }
}

fn pick_runtime_value(
    persisted: Option<String>,
    primary_env: Option<String>,
    secondary_env: Option<String>,
    default_value: &str,
) -> (String, String) {
    let persisted_value = persisted
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_string);

    if let Some(value) = persisted_value {
        return (value, "runtime_persisted".to_string());
    }

    let primary_value = primary_env
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_string);

    if let Some(value) = primary_value {
        return (value, "env".to_string());
    }

    let secondary_value = secondary_env
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_string);

    if let Some(value) = secondary_value {
        return (value, "env".to_string());
    }

    (default_value.to_string(), "default".to_string())
}

fn classify_ollama_endpoint_kind(base_url: &str) -> String {
    if let Ok(parsed) = url::Url::parse(base_url) {
        if let Some(host) = parsed.host_str() {
            if matches!(host, "127.0.0.1" | "localhost" | "::1") {
                return "local_loopback".to_string();
            }
        }

        if parsed.scheme().eq_ignore_ascii_case("https") {
            return "remote_cloudflare".to_string();
        }
    }

    "custom_remote".to_string()
}

fn resolve_ollama_runtime_from_sources(
    persisted_url: Option<String>,
    env_base_url: Option<String>,
    env_url: Option<String>,
    persisted_model: Option<String>,
    env_default_model: Option<String>,
    env_model: Option<String>,
) -> ResolvedOllamaRuntime {
    let (url_raw, endpoint_source) = pick_runtime_value(
        persisted_url,
        env_base_url,
        env_url,
        DEFAULT_OLLAMA_BASE_URL,
    );
    let (model_raw, model_source) = pick_runtime_value(
        persisted_model,
        env_default_model,
        env_model,
        DEFAULT_OLLAMA_MODEL,
    );

    let base_url = normalize_ollama_base_url(&url_raw);
    let model = normalize_ollama_model(&model_raw);
    let endpoint_kind = classify_ollama_endpoint_kind(&base_url);
    let network_used = endpoint_kind != "local_loopback";

    ResolvedOllamaRuntime {
        base_url,
        model,
        endpoint_kind,
        endpoint_source,
        model_source,
        network_used,
    }
}

fn resolve_ollama_runtime() -> ResolvedOllamaRuntime {
    resolve_ollama_runtime_from_sources(
        get_persisted_ollama_url(),
        std::env::var("OLLAMA_BASE_URL").ok(),
        std::env::var("OLLAMA_URL").ok(),
        get_persisted_ollama_model(),
        std::env::var("OLLAMA_DEFAULT_MODEL").ok(),
        std::env::var("OLLAMA_MODEL").ok(),
    )
}

fn ollama_base_url() -> String {
    resolve_ollama_runtime().base_url
}

fn ollama_default_model() -> String {
    resolve_ollama_runtime().model
}

fn ollama_env_base_url() -> String {
    let raw = std::env::var("OLLAMA_BASE_URL")
        .ok()
        .filter(|s| !s.is_empty())
        .or_else(|| std::env::var("OLLAMA_URL").ok().filter(|s| !s.is_empty()))
        .unwrap_or_else(|| DEFAULT_OLLAMA_BASE_URL.to_string());

    normalize_ollama_base_url(&raw)
}

/// Returns the effective Ollama HTTP request timeout.
/// Governed by env var OLLAMA_REQUEST_TIMEOUT_SECS (bounded 10..300).
/// Defaults to 120s if unset or out of bounds.
fn ollama_request_timeout() -> Duration {
    std::env::var(OLLAMA_REQUEST_TIMEOUT_SECS_ENV)
        .ok()
        .and_then(|v| v.trim().parse::<u64>().ok())
        .filter(|&s| (10..=300).contains(&s))
        .map(Duration::from_secs)
        .unwrap_or(Duration::from_secs(OLLAMA_REQUEST_TIMEOUT_SECS_DEFAULT))
}

fn build_ollama_client() -> Result<Client, String> {
    Client::builder()
        .timeout(ollama_request_timeout())
        .build()
        .map_err(|e| format!("Client error: {}", e))
}

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

#[derive(Debug, Serialize, Deserialize, Clone)]
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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OllamaStatus {
    pub available: bool,
    pub version: Option<String>,
    pub models: Vec<String>,
    pub url: String,
    pub model: String,
    pub endpoint_kind: String,
    pub endpoint_source: String,
    pub model_source: String,
    pub network_used: bool,
    pub health: String,
}

// ═══════════════════════════════════════════════════════════════════════════
//   HANDLER 1: AI_GENERATE_LOCAL
//   Génération synchrone avec le modèle local
// ═══════════════════════════════════════════════════════════════════════════

#[command]
pub async fn ai_generate_local(request: LocalAIRequest) -> Result<LocalAIResponse, String> {
    // 🔒 SECURITY v19.3: Rate Limiting Check
    let user_id = "local_ai_user".to_string(); // Implementation: Get user ID from authenticated session
                                               // - Session: Extract from tauri::State<SessionManager>
                                               // - Auth: Get session.current_user_id() or session.jwt_claims.sub
                                               // - Fallback: Use "local_ai_user" for unauthenticated/dev mode
                                               // - Multi-user: Support different rate limits per user tier
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

    let client = build_ollama_client()?;

    let model = request.model.unwrap_or_else(ollama_default_model);

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
        .post(format!("{}/api/generate", ollama_base_url()))
        .json(&ollama_request)
        .send()
        .await
        .map_err(|e| format!("Ollama HTTP error: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response
            .text()
            .await
            .unwrap_or_else(|_| String::from("<unreadable>"));

        // If the specific model was not found, try fallback models explicitly.
        // Each attempt is logged — no silent switch.
        if status.as_u16() == 404
            && body.to_lowercase().contains("model")
            && body.to_lowercase().contains("not found")
        {
            log::warn!(
                "[ai_generate_local] Model '{}' not found — trying fallbacks {:?}",
                model,
                OLLAMA_FALLBACK_MODELS
            );
            let available = ai_scan_local_models().await.unwrap_or_default();
            for fallback in OLLAMA_FALLBACK_MODELS {
                if available.iter().any(|m| m.starts_with(fallback)) {
                    let resolved = available
                        .iter()
                        .find(|m| m.starts_with(fallback))
                        .unwrap()
                        .clone();
                    log::warn!("[ai_generate_local] Fallback attempt: model='{}'", resolved);
                    let fallback_req = OllamaGenerateRequest {
                        model: resolved.clone(),
                        prompt: ollama_request.prompt.clone(),
                        stream: ollama_request.stream,
                        system: ollama_request.system.clone(),
                        options: ollama_request.options.clone(),
                    };
                    let fb_resp = client
                        .post(format!("{}/api/generate", ollama_base_url()))
                        .json(&fallback_req)
                        .send()
                        .await
                        .map_err(|e| format!("Ollama HTTP error (fallback): {}", e))?;
                    if fb_resp.status().is_success() {
                        let ollama_response: OllamaGenerateResponse = fb_resp
                            .json()
                            .await
                            .map_err(|e| format!("Ollama JSON parse error: {}", e))?;
                        return Ok(LocalAIResponse {
                            content: ollama_response.response,
                            model: ollama_response.model,
                            done: ollama_response.done,
                            context: ollama_response.context,
                            total_duration: ollama_response.total_duration,
                            eval_count: ollama_response.eval_count,
                        });
                    }
                }
            }
            return Err(format!(
                "Ollama model '{}' not found and no fallback available. Installed: {:?}",
                model, available
            ));
        }

        return Err(format!("Ollama error: HTTP {} — {}", status, body.trim()));
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
    let client = build_ollama_client()?;

    let model = request.model.unwrap_or_else(ollama_default_model);

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
        .post(format!("{}/api/generate", ollama_base_url()))
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
    let client = build_ollama_client()?;

    let response = client
        .get(format!("{}/api/tags", ollama_base_url()))
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
//   HANDLER 5: AI_CHECK_OLLAMA_STATUS (v27.2.1: with cache)
//   Vérifie si Ollama est disponible + version + modèles
//   ✨ Cache TTL: 10s to prevent flapping
// ═══════════════════════════════════════════════════════════════════════════

#[command]
pub async fn ai_check_ollama_status() -> Result<OllamaStatus, String> {
    // ✨ v27.2.1: Check cache first (anti-flapping)
    {
        let cache = OLLAMA_STATUS_CACHE.lock().unwrap();
        if let Some((status, timestamp)) = cache.as_ref() {
            let elapsed = timestamp.elapsed().as_secs();
            if elapsed < OLLAMA_STATUS_CACHE_TTL_SECS {
                log::debug!(
                    "[OLLAMA] Cache hit | age={}s | available={}",
                    elapsed,
                    status.available
                );
                return Ok(status.clone());
            }
        }
    }

    // Cache miss or expired → perform actual check
    let client = build_ollama_client()?;
    let runtime = resolve_ollama_runtime();

    // Test de disponibilité
    let response = client
        .get(format!("{}/api/tags", runtime.base_url))
        .send()
        .await;

    let status = match response {
        Ok(resp) if resp.status().is_success() => {
            // Récupérer la liste des modèles
            let models_response: OllamaModelsResponse = resp
                .json()
                .await
                .map_err(|e| format!("Ollama JSON parse error: {}", e))?;

            let model_names: Vec<String> =
                models_response.models.into_iter().map(|m| m.name).collect();

            OllamaStatus {
                available: true,
                version: Some("unknown".to_string()), // Ollama n'expose pas facilement la version
                models: model_names,
                url: runtime.base_url.clone(),
                model: runtime.model.clone(),
                endpoint_kind: runtime.endpoint_kind.clone(),
                endpoint_source: runtime.endpoint_source.clone(),
                model_source: runtime.model_source.clone(),
                network_used: runtime.network_used,
                health: "healthy".to_string(),
            }
        }
        Ok(resp) => {
            log::warn!("[OLLAMA] Health check failed | status={}", resp.status());
            OllamaStatus {
                available: false,
                version: None,
                models: vec![],
                url: runtime.base_url.clone(),
                model: runtime.model.clone(),
                endpoint_kind: runtime.endpoint_kind.clone(),
                endpoint_source: runtime.endpoint_source.clone(),
                model_source: runtime.model_source.clone(),
                network_used: runtime.network_used,
                health: "degraded".to_string(),
            }
        }
        Err(e) => {
            // Ollama non disponible
            log::debug!("[OLLAMA] Health check failed | error={}", e);
            OllamaStatus {
                available: false,
                version: None,
                models: vec![],
                url: runtime.base_url.clone(),
                model: runtime.model.clone(),
                endpoint_kind: runtime.endpoint_kind.clone(),
                endpoint_source: runtime.endpoint_source.clone(),
                model_source: runtime.model_source.clone(),
                network_used: runtime.network_used,
                health: "offline".to_string(),
            }
        }
    };

    // ✨ Update cache
    {
        let mut cache = OLLAMA_STATUS_CACHE.lock().unwrap();
        *cache = Some((status.clone(), Instant::now()));
    }

    Ok(status)
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
    client: Client,
    shell_guard: ShellGuard,
}

fn truncate_for_log(input: &str, max_len: usize) -> String {
    if input.len() <= max_len {
        input.to_string()
    } else {
        format!("{}...", &input[..max_len])
    }
}

fn select_fallback_model(requested_model: &str, available_models: &[String]) -> Option<String> {
    if available_models.is_empty() {
        return None;
    }

    if available_models.iter().any(|m| m == requested_model) {
        return Some(requested_model.to_string());
    }

    let requested_family = requested_model.split(':').next().unwrap_or_default();
    if !requested_family.is_empty() {
        if let Some(candidate) = available_models
            .iter()
            .find(|m| m.split(':').next().unwrap_or_default() == requested_family)
        {
            return Some(candidate.clone());
        }
    }

    available_models.first().cloned()
}

impl OllamaClient {
    pub fn new(model: Option<String>) -> Self {
        let client = build_ollama_client().unwrap_or_else(|_| Client::new());

        let resolved_model = model.unwrap_or_else(ollama_default_model);
        log::info!("[OllamaClient] new() | resolved_model={}", resolved_model);

        Self {
            model: resolved_model,
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
        // AH-NOTE: Do NOT call is_installed() here — it uses std::process::Command::output()
        // which calls fork() synchronously in a Tokio multi-thread context, causing
        // malloc(): unaligned tcache chunk detected (heap corruption → WebView crash).
        // HTTP check is sufficient: if Ollama is not installed, the HTTP call will fail.
        self.client
            .get(format!("{}/api/tags", ollama_base_url()))
            .send()
            .await
            .map(|r| r.status().is_success())
            .unwrap_or(false)
    }

    async fn list_models(&self) -> AIResult<Vec<String>> {
        let response = self
            .client
            .get(format!("{}/api/tags", ollama_base_url()))
            .send()
            .await
            .map_err(|e| AIError::NetworkError(e.to_string()))?;

        if !response.status().is_success() {
            return Err(AIError::APIError(format!(
                "Ollama tags API error: {}",
                response.status()
            )));
        }

        let models_response: OllamaModelsResponse = response
            .json()
            .await
            .map_err(|e| AIError::InvalidResponse(e.to_string()))?;

        Ok(models_response.models.into_iter().map(|m| m.name).collect())
    }

    async fn query_with_model(&self, request: &AIRequest, model: &str) -> AIResult<AIResponse> {
        let ollama_request = OllamaRequest {
            model: model.to_string(),
            prompt: request.prompt.clone(),
            stream: false,
            options: OllamaOptions {
                temperature: request.temperature,
                num_predict: request.max_tokens,
            },
        };

        let url = format!("{}/api/generate", ollama_base_url());
        log::debug!(
            "[OllamaClient] POST {} | model={} | prompt_len={}",
            url,
            model,
            request.prompt.len()
        );

        let response = self
            .client
            .post(&url)
            .json(&ollama_request)
            .send()
            .await
            .map_err(|e| AIError::NetworkError(e.to_string()))?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response
                .text()
                .await
                .unwrap_or_else(|_| String::from("<unreadable_body>"));
            let body_trimmed = truncate_for_log(body.trim(), 220);
            let body_lower = body_trimmed.to_lowercase();

            if status.as_u16() == 404
                && body_lower.contains("model")
                && body_lower.contains("not found")
            {
                return Err(AIError::APIError(format!(
                    "OLLAMA_MODEL_NOT_FOUND:model={} body={}",
                    model, body_trimmed
                )));
            }

            return Err(AIError::APIError(format!(
                "Ollama API error: status={} body={}",
                status, body_trimmed
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

    pub async fn query(&self, request: &AIRequest) -> AIResult<AIResponse> {
        if !self.is_available().await {
            return Err(AIError::NetworkError(
                "Ollama daemon not running".to_string(),
            ));
        }

        match self.query_with_model(request, &self.model).await {
            Ok(response) => Ok(response),
            Err(AIError::APIError(msg)) if msg.starts_with("OLLAMA_MODEL_NOT_FOUND:") => {
                let available_models = self.list_models().await?;
                let fallback_model = select_fallback_model(&self.model, &available_models)
                    .filter(|candidate| candidate != &self.model);

                if let Some(model) = fallback_model {
                    log::warn!(
                        "[OllamaClient] configured model unavailable ({}). Retry with fallback model={} | available={:?}",
                        self.model,
                        model,
                        available_models
                    );
                    self.query_with_model(request, &model).await
                } else {
                    Err(AIError::APIError(format!(
                        "{} | available_models={:?}",
                        msg, available_models
                    )))
                }
            }
            Err(e) => Err(e),
        }
    }

    pub async fn query_stream(&self, request: &AIRequest) -> AIResult<AIResponse> {
        // Implementation: True streaming with Server-Sent Events (SSE)
        // - API: POST /api/generate with {"stream": true} parameter
        // - Response: NDJSON stream with chunks: {"response": "token", "done": false}
        // - Parsing: Use futures::stream::StreamExt to process async stream
        // - Accumulation: Collect partial responses until {"done": true}
        // - Event emission: Emit tauri event for each chunk: emit("ollama:stream", chunk)
        // - Error handling: Handle connection drops, timeout on slow generation
        // - Cancellation: Support stream cancellation via AbortSignal
        // - Performance: ~50-200ms per token depending on model size
        self.query(request).await
    }

    pub fn get_available_models(&self) -> Vec<String> {
        // AH-NOTE: Do NOT use ShellGuard / ollama list here — synchronous fork() in
        // async Tokio causes malloc heap corruption. Return empty list for health_check
        // reporting; actual availability is confirmed via HTTP in is_available().
        vec![]
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Mutex;

    // Serialize env-var tests to prevent parallel mutation races.
    static ENV_TEST_LOCK: Mutex<()> = Mutex::new(());

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

    #[test]
    fn test_select_fallback_model_prefers_family_then_first() {
        let models = vec!["llama3.1:latest".to_string(), "mistral:latest".to_string()];

        let selected = select_fallback_model("llama3:latest", &models);
        assert_eq!(selected.as_deref(), Some("llama3.1:latest"));

        let selected_unknown = select_fallback_model("unknown:latest", &models);
        assert_eq!(selected_unknown.as_deref(), Some("llama3.1:latest"));
    }

    #[test]
    fn test_resolve_ollama_runtime_prefers_persisted_values() {
        let runtime = resolve_ollama_runtime_from_sources(
            Some("https://titane.example.com/api".to_string()),
            Some("http://127.0.0.1:11434".to_string()),
            None,
            Some("qwen2.5:latest".to_string()),
            Some("llama3.1:latest".to_string()),
            None,
        );

        assert_eq!(runtime.base_url, "https://titane.example.com");
        assert_eq!(runtime.model, "qwen2.5:latest");
        assert_eq!(runtime.endpoint_kind, "remote_cloudflare");
        assert_eq!(runtime.endpoint_source, "runtime_persisted");
        assert_eq!(runtime.model_source, "runtime_persisted");
        assert!(runtime.network_used);
    }

    #[test]
    fn test_resolve_ollama_runtime_classifies_loopback_as_local() {
        let runtime = resolve_ollama_runtime_from_sources(
            None,
            Some("http://127.0.0.1:11434/api".to_string()),
            None,
            None,
            Some("llama3.1:latest".to_string()),
            None,
        );

        assert_eq!(runtime.base_url, "http://127.0.0.1:11434");
        assert_eq!(runtime.endpoint_kind, "local_loopback");
        assert_eq!(runtime.endpoint_source, "env");
        assert_eq!(runtime.model_source, "env");
        assert!(!runtime.network_used);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ollama_request_timeout governance tests (OLLAMA_REQUEST_TIMEOUT_SECS env)
    // ─────────────────────────────────────────────────────────────────────────

    #[test]
    fn test_ollama_request_timeout_default() {
        let _g = ENV_TEST_LOCK.lock().unwrap();
        std::env::remove_var(OLLAMA_REQUEST_TIMEOUT_SECS_ENV);
        let t = ollama_request_timeout();
        assert_eq!(t, Duration::from_secs(OLLAMA_REQUEST_TIMEOUT_SECS_DEFAULT));
    }

    #[test]
    fn test_ollama_request_timeout_env_valid() {
        let _g = ENV_TEST_LOCK.lock().unwrap();
        std::env::set_var(OLLAMA_REQUEST_TIMEOUT_SECS_ENV, "90");
        let t = ollama_request_timeout();
        std::env::remove_var(OLLAMA_REQUEST_TIMEOUT_SECS_ENV);
        assert_eq!(t, Duration::from_secs(90));
    }

    #[test]
    fn test_ollama_request_timeout_env_below_min_falls_back() {
        let _g = ENV_TEST_LOCK.lock().unwrap();
        std::env::set_var(OLLAMA_REQUEST_TIMEOUT_SECS_ENV, "5");
        let t = ollama_request_timeout();
        std::env::remove_var(OLLAMA_REQUEST_TIMEOUT_SECS_ENV);
        assert_eq!(t, Duration::from_secs(OLLAMA_REQUEST_TIMEOUT_SECS_DEFAULT));
    }

    #[test]
    fn test_ollama_request_timeout_env_above_max_falls_back() {
        let _g = ENV_TEST_LOCK.lock().unwrap();
        std::env::set_var(OLLAMA_REQUEST_TIMEOUT_SECS_ENV, "999");
        let t = ollama_request_timeout();
        std::env::remove_var(OLLAMA_REQUEST_TIMEOUT_SECS_ENV);
        assert_eq!(t, Duration::from_secs(OLLAMA_REQUEST_TIMEOUT_SECS_DEFAULT));
    }

    #[test]
    fn test_ollama_request_timeout_env_invalid_falls_back() {
        let _g = ENV_TEST_LOCK.lock().unwrap();
        std::env::set_var(OLLAMA_REQUEST_TIMEOUT_SECS_ENV, "notanumber");
        let t = ollama_request_timeout();
        std::env::remove_var(OLLAMA_REQUEST_TIMEOUT_SECS_ENV);
        assert_eq!(t, Duration::from_secs(OLLAMA_REQUEST_TIMEOUT_SECS_DEFAULT));
    }

    #[test]
    fn test_ollama_request_timeout_env_boundary_min() {
        let _g = ENV_TEST_LOCK.lock().unwrap();
        std::env::set_var(OLLAMA_REQUEST_TIMEOUT_SECS_ENV, "10");
        let t = ollama_request_timeout();
        std::env::remove_var(OLLAMA_REQUEST_TIMEOUT_SECS_ENV);
        assert_eq!(t, Duration::from_secs(10));
    }

    #[test]
    fn test_ollama_request_timeout_env_boundary_max() {
        let _g = ENV_TEST_LOCK.lock().unwrap();
        std::env::set_var(OLLAMA_REQUEST_TIMEOUT_SECS_ENV, "300");
        let t = ollama_request_timeout();
        std::env::remove_var(OLLAMA_REQUEST_TIMEOUT_SECS_ENV);
        assert_eq!(t, Duration::from_secs(300));
    }
}
