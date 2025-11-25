// ═══════════════════════════════════════════════════════════════════════════
// TITANE∞ v14 — OVERDRIVE CHAT ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════
// Orchestrateur IA hybride : Gemini (cloud) + Ollama (local) + fallback
// ═══════════════════════════════════════════════════════════════════════════

use crate::core::tapi_error::{TAPIError, TAPIErrorKind};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;
use tauri::State;

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURES
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub id: String,
    pub role: String,           // user|assistant|system
    pub content: String,
    pub timestamp: u64,
    pub provider: String,       // gemini|ollama|local
    pub model: String,
    pub tokens: Option<u32>,
    pub multimodal: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatRequest {
    pub message: String,
    pub conversation_id: Option<String>,
    pub provider: String,       // auto|gemini|ollama|local
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
    gemini_api_key: Arc<RwLock<Option<String>>>,
    default_provider: Arc<RwLock<String>>,
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIALISATION
// ─────────────────────────────────────────────────────────────────────────────

pub fn init() -> ChatOrchestratorState {
    let state = ChatOrchestratorState {
        conversations: Arc::new(RwLock::new(Vec::new())),
        provider_status: Arc::new(RwLock::new(Vec::new())),
        provider_last_check: Arc::new(RwLock::new(std::collections::HashMap::new())),
        provider_failure_count: Arc::new(RwLock::new(std::collections::HashMap::new())),
        gemini_api_key: Arc::new(RwLock::new(None)),
        default_provider: Arc::new(RwLock::new("auto".to_string())),
    };

    // Initialiser statuts providers (bloquer pour init synchrone)
    let rt = tokio::runtime::Runtime::new()
        .expect("[CHAT_ORCHESTRATOR] FATAL: Failed to create tokio runtime");
    rt.block_on(async {
        initialize_providers(&state).await;
    });

    state
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
async fn is_provider_available(
    provider: &str,
    state: &ChatOrchestratorState,
) -> bool {
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
        },
        "ollama" => {
            // TODO: Ping rapide http://localhost:11434/api/tags
            true // Temporaire: assume disponible
        },
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
        println!("[CHAT] ⚠️ Provider {} temporairement désactivé (3 échecs)", provider);
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
        vec!["gemini".to_string(), "ollama".to_string(), "local".to_string()]
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
    let final_error = last_error.unwrap_or_else(|| {
        TAPIError::internal("All providers failed without specific error")
    });

    Err(final_error.into())
}

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
    if api_key.is_none() {
        return Err(TAPIError::config("Gemini API key not configured"));
    }

    // TODO: Implémenter appel API Gemini
    // POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent
    // Headers: x-goog-api-key: <API_KEY>
    // Body: { contents: [{ role: "user", parts: [{ text: "..." }] }] }

    println!("[CHAT] Appel Gemini API...");

    Ok(ChatMessage {
        id: uuid::Uuid::new_v4().to_string(),
        role: "assistant".to_string(),
        content: "Réponse simulée de Gemini".to_string(),
        timestamp: get_timestamp(),
        provider: "gemini".to_string(),
        model: "gemini-2.0-flash-exp".to_string(),
        tokens: Some(50),
        multimodal: request.images.is_some(),
    })
}

async fn send_to_ollama(
    request: &ChatRequest,
    state: &ChatOrchestratorState,
) -> Result<ChatMessage, TAPIError> {
    // TODO: Implémenter appel Ollama
    // POST http://localhost:11434/api/generate
    // Body: { model: "llama3.1", prompt: "...", stream: false }

    println!("[CHAT] Appel Ollama local...");

    Ok(ChatMessage {
        id: uuid::Uuid::new_v4().to_string(),
        role: "assistant".to_string(),
        content: "Réponse simulée d'Ollama".to_string(),
        timestamp: get_timestamp(),
        provider: "ollama".to_string(),
        model: request.model.clone().unwrap_or("llama3.1".to_string()),
        tokens: Some(40),
        multimodal: false,
    })
}

async fn send_to_local(
    request: &ChatRequest,
    _state: &ChatOrchestratorState,
) -> Result<ChatMessage, TAPIError> {
    // Fallback ultra-simple : echo
    println!("[CHAT] Fallback local");

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
pub async fn chat_create_conversation(state: State<'_, ChatOrchestratorState>) -> Result<String, TAPIError> {
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

async fn store_message(state: &ChatOrchestratorState, conversation_id: &str, message: &ChatMessage) {
    let mut conversations = state.conversations.write().await;
    if let Some(conv) = conversations
        .iter_mut()
        .find(|c| c.conversation_id == conversation_id)
    {
        conv.messages.push(message.clone());
        conv.last_updated = get_timestamp();
        conv.context_tokens += message.tokens.unwrap_or(0);
    }
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
pub async fn chat_check_providers(state: State<'_, ChatOrchestratorState>) -> Result<Vec<ProviderStatus>, TAPIError> {
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
    temperature: Option<f32>,
    max_tokens: Option<u32>,
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
    temperature: Option<f32>,
    max_tokens: Option<u32>,
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
    request: ChatRequest,
    state: State<'_, ChatOrchestratorState>,
    window: tauri::Window,
) -> Result<String, String> {
    println!("[CHAT_STREAM] Starting streaming request");
    let start = crate::core::utils::now_ms();

    // Validation
    if request.message.trim().is_empty() {
        return Err(TAPIError::validation("Message cannot be empty").into());
    }

    // Pour le moment, on récupère la réponse complète puis on la stream
    // TODO: Implémenter vrai streaming depuis les providers
    let response = chat_send_message(request.clone(), state).await?;

    let content = response.message.content;
    let words = content.split_whitespace().collect::<Vec<&str>>();

    // Streamer les mots un par un
    for (i, word) in words.iter().enumerate() {
        let chunk = if i < words.len() - 1 {
            format!("{} ", word)
        } else {
            word.to_string()
        };

        // Émettre événement Tauri
        let _ = window.emit("chat_stream_chunk", chunk);

        // Délai simulé
        tokio::time::sleep(tokio::time::Duration::from_millis(30)).await;
    }

    // Événement final
    let latency_ms = crate::core::utils::elapsed_ms(start);
    let _ = window.emit("chat_stream_complete", serde_json::json!({
        "content": content,
        "latency_ms": latency_ms,
        "provider": response.message.provider,
    }));

    Ok(content)
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
