// ═══════════════════════════════════════════════════════════════════════════
// TITANE∞ v16 — OVERDRIVE CHAT ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════
// Orchestrateur IA hybride : Gemini (cloud) + Ollama (local) + fallback
// ═══════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tauri::State;
use async_recursion::async_recursion;

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
    conversations: Arc<Mutex<Vec<ConversationMemory>>>,
    provider_status: Arc<Mutex<Vec<ProviderStatus>>>,
    gemini_api_key: Arc<Mutex<Option<String>>>,
    default_provider: Arc<Mutex<String>>,
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIALISATION
// ─────────────────────────────────────────────────────────────────────────────

pub fn init() -> ChatOrchestratorState {
    let state = ChatOrchestratorState {
        conversations: Arc::new(Mutex::new(Vec::new())),
        provider_status: Arc::new(Mutex::new(Vec::new())),
        gemini_api_key: Arc::new(Mutex::new(None)),
        default_provider: Arc::new(Mutex::new("auto".to_string())),
    };

    // Initialiser statuts providers
    initialize_providers(&state);

    state
}

fn initialize_providers(state: &ChatOrchestratorState) {
    let mut status_list = state.provider_status.lock().unwrap();

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
// ORCHESTRATION PRINCIPALE
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
#[async_recursion]
pub async fn chat_send_message(
    request: ChatRequest,
    state: State<'_, ChatOrchestratorState>,
) -> Result<ChatResponse, String> {
    let start = std::time::Instant::now();

    // Déterminer le provider optimal
    let provider = if request.provider == "auto" {
        select_best_provider(&state).await
    } else {
        request.provider.clone()
    };

    println!("[CHAT] Requête vers {} : '{}'", provider, request.message);

    // Router vers le bon provider
    let result = match provider.as_str() {
        "gemini" => send_to_gemini(&request, &state).await,
        "ollama" => send_to_ollama(&request, &state).await,
        "local" => send_to_local(&request, &state).await,
        _ => Err("Provider inconnu".to_string()),
    };

    let latency_ms = start.elapsed().as_millis() as u64;

    match result {
        Ok(message) => {
            // Stocker dans la conversation
            if let Some(conv_id) = &request.conversation_id {
                store_message(&state, conv_id, &message);
            }

            Ok(ChatResponse {
                message,
                success: true,
                error: None,
                latency_ms,
            })
        }
        Err(e) => {
            // Fallback automatique si échec
            if provider != "local" {
                println!("[CHAT] Échec {} - Fallback vers local", provider);
                return chat_send_message(
                    ChatRequest {
                        provider: "local".to_string(),
                        ..request
                    },
                    state,
                )
                .await;
            }

            Err(format!("Tous les providers ont échoué: {}", e))
        }
    }
}

async fn select_best_provider(state: &ChatOrchestratorState) -> String {
    let status_list = state.provider_status.lock().unwrap();

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
) -> Result<ChatMessage, String> {
    let api_key = state.gemini_api_key.lock().unwrap();
    if api_key.is_none() {
        return Err("Gemini API key non configurée".to_string());
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
) -> Result<ChatMessage, String> {
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
) -> Result<ChatMessage, String> {
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
pub fn chat_create_conversation(state: State<ChatOrchestratorState>) -> Result<String, String> {
    let conversation_id = uuid::Uuid::new_v4().to_string();

    let conversation = ConversationMemory {
        conversation_id: conversation_id.clone(),
        messages: Vec::new(),
        context_tokens: 0,
        created_at: get_timestamp(),
        last_updated: get_timestamp(),
    };

    let mut conversations = state.conversations.lock().unwrap();
    conversations.push(conversation);

    println!("[CHAT] Conversation créée: {}", conversation_id);
    Ok(conversation_id)
}

#[tauri::command]
pub fn chat_get_conversation(
    conversation_id: String,
    state: State<ChatOrchestratorState>,
) -> Result<ConversationMemory, String> {
    let conversations = state.conversations.lock().unwrap();
    conversations
        .iter()
        .find(|c| c.conversation_id == conversation_id)
        .cloned()
        .ok_or_else(|| "Conversation introuvable".to_string())
}

#[tauri::command]
pub fn chat_delete_conversation(
    conversation_id: String,
    state: State<ChatOrchestratorState>,
) -> Result<String, String> {
    let mut conversations = state.conversations.lock().unwrap();
    conversations.retain(|c| c.conversation_id != conversation_id);
    Ok("Conversation supprimée".to_string())
}

fn store_message(state: &ChatOrchestratorState, conversation_id: &str, message: &ChatMessage) {
    let mut conversations = state.conversations.lock().unwrap();
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
pub fn chat_set_gemini_key(
    api_key: String,
    state: State<ChatOrchestratorState>,
) -> Result<String, String> {
    let mut key = state.gemini_api_key.lock().unwrap();
    *key = Some(api_key);

    // Vérifier disponibilité
    update_provider_status(&state, "gemini", true, 0, None);

    Ok("API key configurée".to_string())
}

#[tauri::command]
pub fn chat_get_providers_status(
    state: State<ChatOrchestratorState>,
) -> Result<Vec<ProviderStatus>, String> {
    let status_list = state.provider_status.lock().unwrap();
    Ok(status_list.clone())
}

#[tauri::command]
pub fn chat_check_providers(state: State<ChatOrchestratorState>) -> Result<Vec<ProviderStatus>, String> {
    // TODO: Ping tous les providers
    // - Gemini: HEAD request avec API key
    // - Ollama: GET http://localhost:11434/api/tags
    // - Local: toujours disponible

    let status_list = state.provider_status.lock().unwrap();
    Ok(status_list.clone())
}

fn update_provider_status(
    state: &ChatOrchestratorState,
    provider: &str,
    available: bool,
    latency_ms: u64,
    error: Option<String>,
) {
    let mut status_list = state.provider_status.lock().unwrap();
    if let Some(status) = status_list.iter_mut().find(|s| s.provider == provider) {
        status.available = available;
        status.latency_ms = latency_ms;
        status.error = error;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// STREAMING (pour token-par-token)
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn chat_stream_message(
    request: ChatRequest,
    state: State<'_, ChatOrchestratorState>,
) -> Result<String, String> {
    // TODO: Implémenter streaming avec Server-Sent Events (SSE)
    // Ou WebSocket pour envoyer tokens progressivement

    println!("[CHAT] Mode streaming activé");
    Ok("Streaming non implémenté".to_string())
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────

fn get_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs()
}
