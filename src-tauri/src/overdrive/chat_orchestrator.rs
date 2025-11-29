// ═══════════════════════════════════════════════════════════════════════════
// TITANE∞ v14 — OVERDRIVE CHAT ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════
// Orchestrateur IA hybride : Gemini (cloud) + Ollama (local) + fallback
// ═══════════════════════════════════════════════════════════════════════════

use crate::core::tapi_error::TAPIError;
use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::State;
use tokio::sync::RwLock;

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURES
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub id: String,
    pub role: String, // user|assistant|system
    pub content: String,
    pub timestamp: u64,
    pub provider: String, // gemini|ollama|local
    pub model: String,
    pub tokens: Option<u32>,
    pub multimodal: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatRequest {
    pub message: String,
    pub conversation_id: Option<String>,
    pub provider: String, // auto|gemini|ollama|local
    pub model: Option<String>,
    pub streaming: bool,
    pub images: Option<Vec<String>>, // base64
    pub system_prompt: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatResponse {
    pub message: ChatMessage,
    pub success: bool,
    pub error: Option<String>,
    pub latency_ms: u64,
}

#[derive(Debug, Clone, Serialize)]
pub struct ChatStreamResult {
    pub conversation_id: String,
    pub message_id: String,
    pub content: String,
    pub provider: String,
    pub model: String,
    pub latency_ms: u64,
    pub chunk_count: u32,
    pub tokens: Option<u32>,
    pub prompt_tokens: Option<u32>,
    pub total_duration: Option<u64>,
    pub load_duration: Option<u64>,
}

#[derive(Debug, Clone, Serialize)]
struct StreamEventPayload {
    conversation_id: String,
    message_id: String,
    ordinal: u32,
    content: String,
    done: bool,
}

#[derive(Debug, Clone, Deserialize)]
struct OllamaStreamChunk {
    response: Option<String>,
    done: Option<bool>,
    error: Option<String>,
    total_duration: Option<u64>,
    load_duration: Option<u64>,
    prompt_eval_count: Option<u32>,
    eval_count: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderStatus {
    pub provider: String,
    pub available: bool,
    pub latency_ms: u64,
    pub models: Vec<String>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversationMemory {
    pub conversation_id: String,
    pub messages: Vec<ChatMessage>,
    pub context_tokens: u32,
    pub created_at: u64,
    pub last_updated: u64,
}

pub struct ChatOrchestratorState {
    conversations: Arc<RwLock<Vec<ConversationMemory>>>,
    provider_status: Arc<RwLock<Vec<ProviderStatus>>>,
    provider_last_check: Arc<RwLock<std::collections::HashMap<String, u64>>>,
    provider_failure_count: Arc<RwLock<std::collections::HashMap<String, u32>>>,
    pub gemini_api_key: Arc<RwLock<Option<String>>>,
    #[allow(dead_code)]
    default_provider: Arc<RwLock<String>>,
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIALISATION
// ─────────────────────────────────────────────────────────────────────────────

pub fn init() -> ChatOrchestratorState {
    ChatOrchestratorState {
        conversations: Arc::new(RwLock::new(Vec::new())),
        provider_status: Arc::new(RwLock::new(Vec::new())),
        provider_last_check: Arc::new(RwLock::new(std::collections::HashMap::new())),
        provider_failure_count: Arc::new(RwLock::new(std::collections::HashMap::new())),
        gemini_api_key: Arc::new(RwLock::new(None)),
        default_provider: Arc::new(RwLock::new("auto".to_string())),
    }
}

pub async fn initialize_providers_async(state: &ChatOrchestratorState) {
    initialize_providers(state).await;
}

async fn initialize_providers(state: &ChatOrchestratorState) {
    let mut status_list = state.provider_status.write().await;

    // Gemini
    status_list.push(ProviderStatus {
        provider: "gemini".to_string(),
        available: false, // À vérifier avec API key
        latency_ms: 0,
        models: vec!["gemini-2.0-flash-exp".to_string()],
        error: None,
    });

    // Ollama
    status_list.push(ProviderStatus {
        provider: "ollama".to_string(),
        available: false, // À vérifier avec http://localhost:11434
        latency_ms: 0,
        models: vec!["llama3.1".to_string(), "qwen2.5".to_string()],
        error: None,
    });

    // Local fallback
    status_list.push(ProviderStatus {
        provider: "local".to_string(),
        available: true,
        latency_ms: 0,
        models: vec!["echo".to_string()],
        error: None,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER HEARTBEAT & STATUS
// ─────────────────────────────────────────────────────────────────────────────

/// Vérifie rapidement si un provider est disponible (cache 30s)
async fn is_provider_available(provider: &str, state: &ChatOrchestratorState) -> bool {
    const CACHE_DURATION_MS: u64 = 30000; // 30s
    const MAX_FAILURES: u32 = 3;

    let now = get_timestamp();

    // Vérifier cache
    {
        let last_check = state.provider_last_check.read().await;
        if let Some(&last_time) = last_check.get(provider) {
            if now - last_time < CACHE_DURATION_MS {
                // Cache valide, vérifier les échecs
                let failures = state.provider_failure_count.read().await;
                let count = failures.get(provider).unwrap_or(&0);
                return *count < MAX_FAILURES;
            }
        }
    }

    // Cache expiré ou première vérification, faire un heartbeat
    let is_available = match provider {
        "gemini" => {
            let api_key = state.gemini_api_key.read().await;
            api_key.is_some() // Simplifié: si clé présente, considérer disponible
        }
        "ollama" => {
            // Ping rapide http://localhost:11434/api/tags
            match reqwest::Client::builder()
                .timeout(std::time::Duration::from_millis(500))
                .build()
            {
                Ok(client) => {
                    matches!(
                        client.get("http://localhost:11434/api/tags").send().await,
                        Ok(resp) if resp.status().is_success()
                    )
                }
                Err(_) => false,
            }
        }
        "local" => true, // Toujours disponible
        _ => false,
    };

    // Mettre à jour cache
    {
        let mut last_check = state.provider_last_check.write().await;
        last_check.insert(provider.to_string(), now);
    }

    is_available
}

/// Incrémente le compteur d'échecs d'un provider
async fn increment_provider_failures(provider: &str, state: &ChatOrchestratorState) {
    let mut failures = state.provider_failure_count.write().await;
    let count = failures.entry(provider.to_string()).or_insert(0);
    *count += 1;

    if *count >= 3 {
        println!(
            "[CHAT] ⚠️ Provider {} temporairement désactivé (3 échecs)",
            provider
        );
    }
}

/// Reset le compteur d'échecs d'un provider
async fn reset_provider_failures(provider: &str, state: &ChatOrchestratorState) {
    let mut failures = state.provider_failure_count.write().await;
    failures.insert(provider.to_string(), 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// ORCHESTRATION PRINCIPALE
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn chat_send_message(
    mut request: ChatRequest,
    state: State<'_, ChatOrchestratorState>,
) -> Result<ChatResponse, String> {
    let start = crate::core::utils::now_ms();

    // Validation input
    if request.message.trim().is_empty() {
        return Err(TAPIError::validation("Message cannot be empty").into());
    }

    if request.message.len() > 10000 {
        return Err(TAPIError::validation("Message too long (max 10000 chars)").into());
    }

    // Liste des providers à essayer (ordre de priorité)
    let providers_to_try: Vec<String> = if request.provider == "auto" {
        vec![
            "gemini".to_string(),
            "ollama".to_string(),
            "local".to_string(),
        ]
    } else {
        let mut providers = vec![request.provider.clone()];
        if request.provider != "local" {
            providers.push("local".to_string()); // Toujours fallback sur local
        }
        providers
    };

    let mut last_error: Option<TAPIError> = None;

    // Boucle de fallback (au lieu de récursion)
    for provider in providers_to_try {
        // Vérifier disponibilité via heartbeat (avec cache)
        if !is_provider_available(&provider, &state).await {
            println!("[CHAT] ⏭️ Provider {} non disponible (skip)", provider);
            last_error = Some(TAPIError::provider_unavailable(&provider));
            continue;
        }

        println!("[CHAT] 🔄 Tentative avec provider: {}", provider);

        // Cloner request pour chaque tentative
        request.provider = provider.clone();

        // Router vers le bon provider
        let result = match provider.as_str() {
            "gemini" => send_to_gemini(&request, &state).await,
            "ollama" => send_to_ollama(&request, &state).await,
            "local" => send_to_local(&request, &state).await,
            _ => {
                last_error = Some(TAPIError::provider_unavailable(&provider));
                continue;
            }
        };

        match result {
            Ok(message) => {
                let latency_ms = crate::core::utils::elapsed_ms(start);

                // Reset compteur échecs sur succès
                reset_provider_failures(&provider, &state).await;

                // Stocker dans la conversation
                if let Some(conv_id) = &request.conversation_id {
                    store_message(&state, conv_id, &message).await;
                }

                return Ok(ChatResponse {
                    message,
                    success: true,
                    error: None,
                    latency_ms,
                });
            }
            Err(e) => {
                last_error = Some(e.clone());
                println!("[CHAT] ❌ Échec {} - {}", provider, e);

                // Incrémenter échecs
                increment_provider_failures(&provider, &state).await;

                // Continue vers le prochain provider
            }
        }
    }

    // Tous les providers ont échoué
    let final_error = last_error
        .unwrap_or_else(|| TAPIError::internal("All providers failed without specific error"));

    Err(final_error.into())
}

// Fonction utilitaire pour sélectionner le meilleur provider (unused actuellement)
#[allow(dead_code)]
async fn select_best_provider(state: &ChatOrchestratorState) -> String {
    let status_list = state.provider_status.read().await;

    // Cascade: Gemini → Ollama → Local
    for status in status_list.iter() {
        if status.available && status.latency_ms < 5000 {
            return status.provider.clone();
        }
    }

    "local".to_string()
}

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDERS IMPLEMENTATION
// ─────────────────────────────────────────────────────────────────────────────

async fn send_to_gemini(
    request: &ChatRequest,
    state: &ChatOrchestratorState,
) -> Result<ChatMessage, TAPIError> {
    let api_key = state.gemini_api_key.read().await;
    let key = api_key
        .as_ref()
        .ok_or_else(|| TAPIError::config("Gemini API key not configured"))?;

    let model = request.model.as_deref().unwrap_or("gemini-2.0-flash-exp");
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent",
        model
    );

    println!("[CHAT] 🌐 Gemini API call: {} (timeout 60s)", model);

    // Build request body
    let body = serde_json::json!({
        "contents": [{
            "role": "user",
            "parts": [{ "text": request.message }]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 2048,
        }
    });

    // HTTP client with timeout
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(60))
        .build()
        .map_err(|e| TAPIError::network(format!("HTTP client error: {}", e)))?;

    // POST request with retry (3 attempts)
    let mut last_error = None;
    for attempt in 1..=3 {
        match client
            .post(&url)
            .header("x-goog-api-key", key.as_str())
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
        {
            Ok(response) => {
                if !response.status().is_success() {
                    let status = response.status();
                    let error_text = response
                        .text()
                        .await
                        .unwrap_or_else(|_| "Unknown error".to_string());
                    let err_msg = format!("Gemini API error {}: {}", status, error_text);

                    if attempt < 3 {
                        println!(
                            "[CHAT] ⚠️ Attempt {}/3 failed: {}, retrying...",
                            attempt, err_msg
                        );
                        tokio::time::sleep(tokio::time::Duration::from_secs(attempt as u64)).await;
                        last_error = Some(err_msg);
                        continue;
                    }
                    return Err(TAPIError::network(err_msg));
                }

                let response_json: serde_json::Value = response.json().await.map_err(|e| {
                    TAPIError::parse(format!("Failed to parse Gemini response: {}", e))
                })?;

                // Safe JSON navigation avec messages d'erreur détaillés
                let content = response_json
                    .get("candidates")
                    .and_then(|c| c.get(0))
                    .and_then(|c0| c0.get("content"))
                    .and_then(|content| content.get("parts"))
                    .and_then(|parts| parts.get(0))
                    .and_then(|part| part.get("text"))
                    .and_then(|t| t.as_str())
                    .ok_or_else(|| {
                        let json_str = serde_json::to_string_pretty(&response_json)
                            .unwrap_or_else(|_| "<unparseable>".to_string());
                        TAPIError::parse(format!(
                            "Gemini response missing expected fields. Response: {}",
                            json_str
                        ))
                    })?
                    .to_string();

                let tokens = response_json
                    .get("usageMetadata")
                    .and_then(|meta| meta.get("totalTokenCount"))
                    .and_then(|t| t.as_u64())
                    .map(|t| t as u32);

                println!(
                    "[CHAT] ✅ Gemini success: {} chars, {} tokens",
                    content.len(),
                    tokens.unwrap_or(0)
                );

                return Ok(ChatMessage {
                    id: uuid::Uuid::new_v4().to_string(),
                    role: "assistant".to_string(),
                    content,
                    timestamp: get_timestamp(),
                    provider: "gemini".to_string(),
                    model: model.to_string(),
                    tokens,
                    multimodal: request.images.is_some(),
                });
            }
            Err(e) => {
                let err_msg = format!("Gemini HTTP error: {}", e);
                if attempt < 3 {
                    println!(
                        "[CHAT] ⚠️ Attempt {}/3 failed: {}, retrying...",
                        attempt, err_msg
                    );
                    tokio::time::sleep(tokio::time::Duration::from_secs(attempt as u64)).await;
                    last_error = Some(err_msg);
                    continue;
                }
                last_error = Some(err_msg);
            }
        }
    }

    Err(TAPIError::network(last_error.unwrap_or_else(|| {
        "Gemini failed after 3 attempts".to_string()
    })))
}

async fn send_to_ollama(
    request: &ChatRequest,
    _state: &ChatOrchestratorState,
) -> Result<ChatMessage, TAPIError> {
    let model = request.model.as_deref().unwrap_or("llama2:latest");
    let url = "http://localhost:11434/api/generate";

    println!("[CHAT] 🦙 Ollama API call: {} (timeout 45s)", model);

    // Build request body
    let body = serde_json::json!({
        "model": model,
        "prompt": request.message,
        "stream": false,
        "options": {
            "temperature": 0.7,
            "num_predict": 2048,
        }
    });

    // HTTP client with timeout
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(45))
        .build()
        .map_err(|e| TAPIError::network(format!("HTTP client error: {}", e)))?;

    // POST request (no retry for Ollama local - fast fail)
    let response = client
        .post(url)
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| {
            let msg = format!(
                "Ollama connection error: {} (is Ollama running? Try: ollama serve)",
                e
            );
            println!("[CHAT] ❌ {}", msg);
            TAPIError::provider_unavailable("ollama")
        })?;

    if !response.status().is_success() {
        let status = response.status();
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        return Err(TAPIError::network(format!(
            "Ollama API error {}: {}",
            status, error_text
        )));
    }

    let response_json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| TAPIError::parse(format!("Failed to parse Ollama response: {}", e)))?;

    let content = response_json["response"]
        .as_str()
        .unwrap_or("No response from Ollama")
        .to_string();

    let tokens = response_json["eval_count"].as_u64().map(|t| t as u32);

    println!(
        "[CHAT] ✅ Ollama success: {} chars, {} tokens",
        content.len(),
        tokens.unwrap_or(0)
    );

    Ok(ChatMessage {
        id: uuid::Uuid::new_v4().to_string(),
        role: "assistant".to_string(),
        content,
        timestamp: get_timestamp(),
        provider: "ollama".to_string(),
        model: model.to_string(),
        tokens,
        multimodal: false,
    })
}

async fn send_to_local(
    request: &ChatRequest,
    _state: &ChatOrchestratorState,
) -> Result<ChatMessage, TAPIError> {
    // Fallback ultra-simple : echo
    println!("[CHAT] 🔄 Local fallback (offline mode)");

    Ok(ChatMessage {
        id: uuid::Uuid::new_v4().to_string(),
        role: "assistant".to_string(),
        content: format!("Echo: {}", request.message),
        timestamp: get_timestamp(),
        provider: "local".to_string(),
        model: "echo".to_string(),
        tokens: None,
        multimodal: false,
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// GESTION CONVERSATIONS
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn chat_create_conversation(
    state: State<'_, ChatOrchestratorState>,
) -> Result<String, TAPIError> {
    let conversation_id = uuid::Uuid::new_v4().to_string();

    let conversation = ConversationMemory {
        conversation_id: conversation_id.clone(),
        messages: Vec::new(),
        context_tokens: 0,
        created_at: get_timestamp(),
        last_updated: get_timestamp(),
    };

    let mut conversations = state.conversations.write().await;
    conversations.push(conversation);

    println!("[CHAT] Conversation créée: {}", conversation_id);
    Ok(conversation_id)
}

#[tauri::command]
pub async fn chat_get_conversation(
    conversation_id: String,
    state: State<'_, ChatOrchestratorState>,
) -> Result<ConversationMemory, String> {
    let conversations = state.conversations.read().await;
    conversations
        .iter()
        .find(|c| c.conversation_id == conversation_id)
        .cloned()
        .ok_or_else(|| "Conversation introuvable".to_string())
}

#[tauri::command]
pub async fn chat_delete_conversation(
    conversation_id: String,
    state: State<'_, ChatOrchestratorState>,
) -> Result<String, String> {
    let mut conversations = state.conversations.write().await;
    conversations.retain(|c| c.conversation_id != conversation_id);
    Ok("Conversation supprimée".to_string())
}

async fn store_message(
    state: &ChatOrchestratorState,
    conversation_id: &str,
    message: &ChatMessage,
) {
    let mut conversations = state.conversations.write().await;
    if let Some(conv) = conversations
        .iter_mut()
        .find(|c| c.conversation_id == conversation_id)
    {
        conv.messages.push(message.clone());
        conv.last_updated = get_timestamp();
        conv.context_tokens += message.tokens.unwrap_or(0);
        return;
    }

    let mut conversation = ConversationMemory {
        conversation_id: conversation_id.to_string(),
        messages: Vec::new(),
        context_tokens: 0,
        created_at: get_timestamp(),
        last_updated: get_timestamp(),
    };

    conversation.messages.push(message.clone());
    conversation.context_tokens = message.tokens.unwrap_or(0);
    conversations.push(conversation);
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn chat_set_gemini_key(
    api_key: String,
    state: State<'_, ChatOrchestratorState>,
) -> Result<String, String> {
    let mut key = state.gemini_api_key.write().await;
    *key = Some(api_key);

    // Vérifier disponibilité
    update_provider_status(&state, "gemini", true, 0, None).await;

    Ok("API key configurée".to_string())
}

#[tauri::command]
pub async fn chat_get_providers_status(
    state: State<'_, ChatOrchestratorState>,
) -> Result<Vec<ProviderStatus>, String> {
    let status_list = state.provider_status.read().await;
    Ok(status_list.clone())
}

#[tauri::command]
pub async fn chat_check_providers(
    state: State<'_, ChatOrchestratorState>,
) -> Result<Vec<ProviderStatus>, TAPIError> {
    // TODO: Ping tous les providers
    // - Gemini: HEAD request avec API key
    // - Ollama: GET http://localhost:11434/api/tags
    // - Local: toujours disponible

    let status_list = state.provider_status.read().await;
    Ok(status_list.clone())
}

async fn update_provider_status(
    state: &ChatOrchestratorState,
    provider: &str,
    available: bool,
    latency_ms: u64,
    error: Option<String>,
) {
    let mut status_list = state.provider_status.write().await;
    if let Some(status) = status_list.iter_mut().find(|s| s.provider == provider) {
        status.available = available;
        status.latency_ms = latency_ms;
        status.error = error;
    }
}

// ───────────────────────────────────────────────────────────────────────────
// STREAMING (pour token-par-token)
// ───────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn ai_chat_stream(
    message: String,
    model: Option<String>,
    _temperature: Option<f32>,
    _max_tokens: Option<u32>,
    system_prompt: Option<String>,
    state: State<'_, ChatOrchestratorState>,
) -> Result<String, String> {
    let request = ChatRequest {
        message,
        conversation_id: None,
        provider: "auto".to_string(),
        model,
        streaming: false, // TODO: Implémenter vrai streaming
        images: None,
        system_prompt,
    };

    let response = chat_send_message(request, state).await?;
    Ok(response.message.content)
}

#[tauri::command]
pub async fn ai_chat_send(
    message: String,
    model: Option<String>,
    _temperature: Option<f32>,
    _max_tokens: Option<u32>,
    system_prompt: Option<String>,
    state: State<'_, ChatOrchestratorState>,
) -> Result<String, String> {
    let request = ChatRequest {
        message,
        conversation_id: None,
        provider: "auto".to_string(),
        model,
        streaming: false,
        images: None,
        system_prompt,
    };

    let response = chat_send_message(request, state).await?;
    Ok(response.message.content)
}

#[tauri::command]
pub async fn chat_stream_message(
    mut request: ChatRequest,
    state: State<'_, ChatOrchestratorState>,
    app: tauri::AppHandle,
) -> Result<ChatStreamResult, String> {
    use tauri::Emitter;

    println!("[CHAT_STREAM] ✅ Streaming enabled (Tauri v2 Emitter trait)");
    println!(
        "[CHAT_STREAM] Provider: {}, Model: {:?}",
        request.provider, request.model
    );

    let conversation_id = request
        .conversation_id
        .clone()
        .unwrap_or_else(|| uuid::Uuid::new_v4().to_string());

    if request.conversation_id.is_none() {
        request.conversation_id = Some(conversation_id.clone());
    }

    let user_message = ChatMessage {
        id: uuid::Uuid::new_v4().to_string(),
        role: "user".to_string(),
        content: request.message.clone(),
        timestamp: get_timestamp(),
        provider: request.provider.clone(),
        model: request
            .model
            .clone()
            .unwrap_or_else(|| "auto".to_string()),
        tokens: None,
        multimodal: request.images.is_some(),
    };

    store_message(state.inner(), &conversation_id, &user_message).await;

    let should_use_ollama = match request.provider.as_str() {
        "ollama" | "local" => true,
        "auto" => is_provider_available("ollama", state.inner()).await,
        _ => false,
    };

    if should_use_ollama {
        let mut streaming_request = request.clone();
        streaming_request.provider = "ollama".to_string();
        streaming_request.streaming = true;

        let message_id = uuid::Uuid::new_v4().to_string();

        return stream_with_ollama(
            streaming_request,
            state.inner(),
            &app,
            conversation_id,
            message_id,
        )
        .await;
    }

    let start = crate::core::utils::now_ms();
    let mut accumulated_content = String::new();
    let chunk_size = 50; // Characters per chunk for simulation

    let mut streaming_request = request.clone();
    streaming_request.streaming = false;

    let response = chat_send_message(streaming_request, state).await?;
    let full_content = response.message.content;
    let message_id = response.message.id.clone();
    let total_chunks = (full_content.len() + chunk_size - 1) / chunk_size;
    let mut ordinal: u32 = 0;

    println!(
        "[CHAT_STREAM] Simulating {} chunks for {} chars",
        total_chunks,
        full_content.len()
    );

    for chunk_text in full_content.chars().collect::<Vec<char>>().chunks(chunk_size) {
        let chunk: String = chunk_text.iter().collect();
        accumulated_content.push_str(&chunk);

        let stream_event = StreamEventPayload {
            conversation_id: conversation_id.clone(),
            message_id: message_id.clone(),
            ordinal,
            content: chunk.clone(),
            done: false,
        };

        app.emit("chat:stream:chunk", &stream_event)
            .map_err(|e| format!("Failed to emit chunk: {}", e))?;

        tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;
        ordinal += 1;
    }

    let latency_ms = crate::core::utils::elapsed_ms(start);

    let completion_metadata = serde_json::json!({
        "content": full_content.clone(),
        "provider": response.message.provider,
        "model": response.message.model,
        "latency_ms": latency_ms,
        "tokens": response.message.tokens,
        "chunk_count": ordinal,
        "conversation_id": conversation_id.clone(),
        "message_id": message_id.clone(),
        "prompt_tokens": serde_json::Value::Null,
        "total_duration": serde_json::Value::Null,
        "load_duration": serde_json::Value::Null,
    });

    let done_event = StreamEventPayload {
        conversation_id: conversation_id.clone(),
        message_id: message_id.clone(),
        ordinal,
        content: completion_metadata.to_string(),
        done: true,
    };

    app.emit("chat:stream:done", &done_event)
        .map_err(|e| format!("Failed to emit stream done: {}", e))?;

    app.emit("chat:stream:complete", completion_metadata)
        .map_err(|e| format!("Failed to emit completion: {}", e))?;

    println!(
        "[CHAT_STREAM] ✅ Streaming completed: {} chars in {}ms",
        full_content.len(),
        latency_ms
    );

    Ok(ChatStreamResult {
        conversation_id,
        message_id,
        content: full_content,
        provider: response.message.provider,
        model: response.message.model,
        latency_ms,
        chunk_count: ordinal,
        tokens: response.message.tokens,
        prompt_tokens: None,
        total_duration: None,
        load_duration: None,
    })
}

async fn stream_with_ollama(
    request: ChatRequest,
    state: &ChatOrchestratorState,
    app: &tauri::AppHandle,
    conversation_id: String,
    message_id: String,
) -> Result<ChatStreamResult, String> {
    use tauri::Emitter;

    println!(
        "[CHAT_STREAM] 🦙 Ollama streaming active (model: {:?})",
        request.model
    );

    let model = request
        .model
        .clone()
        .unwrap_or_else(|| "llama2:latest".to_string());
    let url = "http://localhost:11434/api/generate";

    let body = serde_json::json!({
        "model": model,
        "prompt": request.message,
        "stream": true,
        "options": {
            "temperature": 0.7,
            "num_predict": 2048,
        }
    });

    let client = match reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(45))
        .build()
    {
        Ok(client) => client,
        Err(e) => {
            increment_provider_failures("ollama", state).await;
            return Err(format!("Ollama streaming client error: {}", e));
        }
    };

    let response = match client
        .post(url)
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
    {
        Ok(response) => response,
        Err(e) => {
            increment_provider_failures("ollama", state).await;
            return Err(format!(
                "Ollama streaming request error: {} (is Ollama running?)",
                e
            ));
        }
    };

    if !response.status().is_success() {
        let status = response.status();
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        increment_provider_failures("ollama", state).await;
        return Err(format!("Ollama streaming error {}: {}", status, error_text));
    }

    let start = crate::core::utils::now_ms();
    let mut stream = response.bytes_stream();

    let mut buffer = String::new();
    let mut accumulated = String::new();
    let mut ordinal: u32 = 0;
    let mut tokens: Option<u32> = None;
    let mut prompt_tokens: Option<u32> = None;
    let mut done_chunk: Option<OllamaStreamChunk> = None;

    while let Some(chunk_result) = stream.next().await {
        let chunk_bytes = match chunk_result {
            Ok(bytes) => bytes,
            Err(e) => {
                increment_provider_failures("ollama", state).await;
                return Err(format!("Ollama streaming read error: {}", e));
            }
        };

        let chunk_str = String::from_utf8_lossy(&chunk_bytes);
        buffer.push_str(&chunk_str);

        loop {
            if let Some(pos) = buffer.find('\n') {
                let line: String = buffer.drain(..=pos).collect();
                let trimmed = line.trim();
                if trimmed.is_empty() {
                    continue;
                }

                match handle_ollama_line(
                    trimmed,
                    app,
                    &conversation_id,
                    &message_id,
                    &mut ordinal,
                    &mut accumulated,
                    &mut tokens,
                    &mut prompt_tokens,
                ) {
                    Ok(Some(final_chunk)) => {
                        done_chunk = Some(final_chunk);
                        break;
                    }
                    Ok(None) => continue,
                    Err(err) => {
                        increment_provider_failures("ollama", state).await;
                        return Err(err);
                    }
                }
            } else {
                break;
            }
        }

        if done_chunk.is_some() {
            break;
        }
    }

    if done_chunk.is_none() && !buffer.trim().is_empty() {
        match handle_ollama_line(
            buffer.trim(),
            app,
            &conversation_id,
            &message_id,
            &mut ordinal,
            &mut accumulated,
            &mut tokens,
            &mut prompt_tokens,
        ) {
            Ok(Some(final_chunk)) => {
                done_chunk = Some(final_chunk);
            }
            Ok(None) => {}
            Err(err) => {
                increment_provider_failures("ollama", state).await;
                return Err(err);
            }
        }
    }

    let done_info = match done_chunk {
        Some(info) => info,
        None => {
            increment_provider_failures("ollama", state).await;
            return Err("Ollama streaming ended without completion signal".to_string());
        }
    };

    if tokens.is_none() {
        tokens = done_info.eval_count;
    }
    if prompt_tokens.is_none() {
        prompt_tokens = done_info.prompt_eval_count;
    }

    let total_duration = done_info.total_duration;
    let load_duration = done_info.load_duration;

    let latency_ms = crate::core::utils::elapsed_ms(start);

    let completion_metadata = serde_json::json!({
        "content": accumulated.clone(),
        "provider": "ollama",
        "model": model.clone(),
        "latency_ms": latency_ms,
        "tokens": tokens,
        "prompt_tokens": prompt_tokens,
        "chunk_count": ordinal,
        "conversation_id": conversation_id.clone(),
        "message_id": message_id.clone(),
        "total_duration": total_duration,
        "load_duration": load_duration,
    });

    let done_event = StreamEventPayload {
        conversation_id: conversation_id.clone(),
        message_id: message_id.clone(),
        ordinal,
        content: completion_metadata.to_string(),
        done: true,
    };

    app.emit("chat:stream:done", &done_event)
        .map_err(|e| format!("Failed to emit stream done: {}", e))?;

    app.emit("chat:stream:complete", completion_metadata)
        .map_err(|e| format!("Failed to emit completion: {}", e))?;

    reset_provider_failures("ollama", state).await;

    let assistant_message = ChatMessage {
        id: message_id.clone(),
        role: "assistant".to_string(),
        content: accumulated.clone(),
        timestamp: get_timestamp(),
        provider: "ollama".to_string(),
        model: model.clone(),
        tokens,
        multimodal: false,
    };

    store_message(state, &conversation_id, &assistant_message).await;

    println!(
        "[CHAT_STREAM] ✅ Ollama streaming completed: {} chars in {}ms (chunks: {})",
        accumulated.len(),
        latency_ms,
        ordinal
    );

    Ok(ChatStreamResult {
        conversation_id,
        message_id,
        content: accumulated,
        provider: "ollama".to_string(),
        model,
        latency_ms,
        chunk_count: ordinal,
        tokens,
        prompt_tokens,
        total_duration,
        load_duration,
    })
}

fn handle_ollama_line(
    line: &str,
    app: &tauri::AppHandle,
    conversation_id: &str,
    message_id: &str,
    ordinal: &mut u32,
    accumulated: &mut String,
    tokens: &mut Option<u32>,
    prompt_tokens: &mut Option<u32>,
) -> Result<Option<OllamaStreamChunk>, String> {
    use tauri::Emitter;

    if line.trim().is_empty() {
        return Ok(None);
    }

    let chunk: OllamaStreamChunk = serde_json::from_str(line)
        .map_err(|e| format!("Failed to parse Ollama stream chunk: {}", e))?;

    if let Some(error) = chunk.error.clone() {
        return Err(error);
    }

    if let Some(part) = chunk.response.as_ref() {
        if !part.is_empty() {
            accumulated.push_str(part);
            let payload = StreamEventPayload {
                conversation_id: conversation_id.to_string(),
                message_id: message_id.to_string(),
                ordinal: *ordinal,
                content: part.clone(),
                done: false,
            };
            app.emit("chat:stream:chunk", &payload)
                .map_err(|e| format!("Failed to emit chunk: {}", e))?;
            *ordinal += 1;
        }
    }

    if chunk.done.unwrap_or(false) {
        if let Some(eval) = chunk.eval_count {
            *tokens = Some(eval);
        }
        if let Some(prompt_eval) = chunk.prompt_eval_count {
            *prompt_tokens = Some(prompt_eval);
        }
        return Ok(Some(chunk));
    }

    Ok(None)
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────

fn get_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_else(|_| std::time::Duration::from_secs(0))
        .as_secs()
}
