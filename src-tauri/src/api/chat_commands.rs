// ╔══════════════════════════════════════════════════════════════╗
// ║  TITANE∞ - Chat IA Commands                                 ║
// ╚══════════════════════════════════════════════════════════════╝

use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub role: String,
    pub content: String,
    pub timestamp: i64,
}

pub struct ChatState {
    pub history: Arc<Mutex<Vec<Message>>>,
    pub api_key: Arc<Mutex<Option<String>>>,
    pub client: Client,
}

impl ChatState {
    pub fn new() -> Self {
        Self {
            history: Arc::new(Mutex::new(Vec::new())),
            api_key: Arc::new(Mutex::new(None)),
            client: Client::builder()
                .timeout(std::time::Duration::from_secs(30))
                .build()
                .unwrap_or_else(|_| Client::new()),
        }
    }
}

/// **DEPRECATED**: Use `conversation_generate` from OMEGA Pipeline v2 instead.
/// This legacy command will be removed in v25.0.0
///
/// Migration guide:
/// ```rust
/// // OLD (deprecated)
/// chat_send_message(message, state)
///
/// // NEW (OMEGA v2)
/// conversation_generate(message, conversation_id, mode, provider, system_prompt)
/// ```
#[tauri::command]
#[deprecated(
    since = "24.2.0",
    note = "Use conversation_generate from OMEGA Pipeline v2 instead"
)]
pub async fn chat_send_message(
    _message: String,
    _state: tauri::State<'_, ChatState>,
) -> Result<String, String> {
    log::warn!("[BLOCKED] chat_send_message is disabled. Use conversation_generate.");
    Err("chat_send_message is disabled; migrate to conversation_generate".to_string())
}

#[tauri::command]
pub async fn chat_get_history(state: tauri::State<'_, ChatState>) -> Result<Vec<Message>, String> {
    let history = state.history.lock().await;
    Ok(history.clone())
}

#[tauri::command]
pub async fn chat_clear_history(state: tauri::State<'_, ChatState>) -> Result<(), String> {
    let mut history = state.history.lock().await;
    history.clear();
    Ok(())
}

#[tauri::command]
pub async fn chat_set_api_key(
    api_key: String,
    state: tauri::State<'_, ChatState>,
) -> Result<(), String> {
    let mut key = state.api_key.lock().await;
    *key = Some(api_key);
    Ok(())
}

#[tauri::command]
pub async fn chat_check_config(state: tauri::State<'_, ChatState>) -> Result<bool, String> {
    let key = state.api_key.lock().await;
    Ok(key.is_some())
}
