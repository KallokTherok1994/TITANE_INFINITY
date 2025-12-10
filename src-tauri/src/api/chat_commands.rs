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

#[tauri::command]
pub async fn chat_send_message(
    message: String,
    state: tauri::State<'_, ChatState>,
) -> Result<String, String> {
    if message.trim().is_empty() {
        return Err("Message vide".to_string());
    }

    // TODO: Implémenter appel API Gemini
    // Pour l'instant, retourne un message de test
    Ok(format!("Réponse de test à: {}", message))
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
