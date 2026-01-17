// ═══════════════════════════════════════════════════════════════════════════
// TITANE∞ v26.3.0 — GLM-4.6V-FLASH COMMANDS
// Tauri commands for GLM-4.6V-Flash local AI provider
// Local-first: vLLM server + OpenAI-compatible API + Vision support
// ═══════════════════════════════════════════════════════════════════════════

use crate::overdrive::chat_orchestrator::{ChatOrchestratorState, ChatRequest};
use crate::security::permission_guard::PERMISSION_GUARD;
use crate::security::permissions::Role;
use serde::{Deserialize, Serialize};
use tauri::State;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GLM46VGenerateRequest {
    pub message: String,
    pub history: Vec<GLM46VHistoryMessage>,
    pub config: Option<GLM46VConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GLM46VHistoryMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GLM46VConfig {
    pub model: Option<String>,
    pub temperature: Option<f32>,
    pub max_tokens: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GLM46VGenerateResponse {
    pub ok: bool,
    pub data: Option<GLM46VGenerateData>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GLM46VGenerateData {
    pub content: String,
    pub model: Option<String>,
    pub tokens: Option<u32>,
    pub finish_reason: Option<String>,
}

// ─────────────────────────────────────────────────────────────────────────────
// GLM-4.6V COMMAND
// ─────────────────────────────────────────────────────────────────────────────

/// Générer une réponse avec GLM-4.6V-Flash (local + multimodal)
#[tauri::command]
pub async fn chat_generate_glm46v(
    request: GLM46VGenerateRequest,
    state: State<'_, ChatOrchestratorState>,
) -> Result<GLM46VGenerateResponse, String> {
    // Permission check - AI generation requires user role
    PERMISSION_GUARD
        .require("ai_generate", Role::User, "chat_generate_glm46v")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    // Validation
    if request.message.trim().is_empty() {
        return Ok(GLM46VGenerateResponse {
            ok: false,
            data: None,
            error: Some("Message vide".to_string()),
        });
    }

    // Check if GLM-4.6V is available (vLLM server running)
    // Note: We don't check API keys since GLM-4.6V is local
    // The provider will handle server availability

    // Convert to ChatRequest for orchestrator
    let chat_request = ChatRequest {
        message: request.message.clone(),
        conversation_id: None,
        provider: "glm46v".to_string(),
        model: request.config.as_ref().and_then(|c| c.model.clone()).unwrap_or_else(|| "THUDM/glm-4v-9b".to_string()),
        streaming: false,
        images: None, // GLM-4.6V handles images via multimodal content
        system_prompt: None,
    };

    // Call GLM-4.6V provider via orchestrator
    match crate::overdrive::chat_orchestrator::send_to_glm46v_internal(&chat_request, &state).await
    {
        Ok(message) => Ok(GLM46VGenerateResponse {
            ok: true,
            data: Some(GLM46VGenerateData {
                content: message.content,
                model: Some(message.model),
                tokens: message.tokens,
                finish_reason: Some("completed".to_string()), // GLM-4.6V doesn't specify finish reasons
            }),
            error: None,
        }),
        Err(e) => Ok(GLM46VGenerateResponse {
            ok: false,
            data: None,
            error: Some(format!("Erreur GLM-4.6V: {}", e)),
        }),
    }
}

/// Vérifier l'état de santé de GLM-4.6V (vLLM server)
#[tauri::command]
pub async fn check_glm46v_health(
    state: State<'_, ChatOrchestratorState>,
) -> Result<GLM46VHealthResponse, String> {
    // Permission check
    PERMISSION_GUARD
        .require("system_read", Role::User, "check_glm46v_health")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    // Check GLM-4.6V health via orchestrator
    match crate::overdrive::chat_orchestrator::check_glm46v_health_internal(&state).await {
        Ok(health) => Ok(GLM46VHealthResponse {
            healthy: health.healthy,
            model_loaded: health.model_loaded,
            server_running: health.server_running,
            message: health.message,
        }),
        Err(e) => Ok(GLM46VHealthResponse {
            healthy: false,
            model_loaded: false,
            server_running: false,
            message: format!("Erreur health check: {}", e),
        }),
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GLM46VHealthResponse {
    pub healthy: bool,
    pub model_loaded: bool,
    pub server_running: bool,
    pub message: String,
}

/// Démarrer le serveur vLLM pour GLM-4.6V (commande système)
#[tauri::command]
pub async fn start_glm46v_server(
    _state: State<'_, ChatOrchestratorState>,
) -> Result<GLM46VServerResponse, String> {
    // Permission check - System operations require elevated permissions
    PERMISSION_GUARD
        .require("system_execute", Role::Admin, "start_glm46v_server")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    // This would typically spawn a vLLM process
    // For now, return instruction to user
    Ok(GLM46VServerResponse {
        started: false,
        message: "Serveur GLM-4.6V doit être démarré manuellement avec vLLM. Utilisez: python -m vllm.entrypoints.openai.api_server --model THUDM/glm-4v-9b --host 127.0.0.1 --port 8000 --trust-remote-code".to_string(),
        process_id: None,
    })
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GLM46VServerResponse {
    pub started: bool,
    pub message: String,
    pub process_id: Option<u32>,
}

/// Arrêter le serveur vLLM pour GLM-4.6V
#[tauri::command]
pub async fn stop_glm46v_server(
    _state: State<'_, ChatOrchestratorState>,
) -> Result<GLM46VServerStopResponse, String> {
    // Permission check
    PERMISSION_GUARD
        .require("system_execute", Role::Admin, "stop_glm46v_server")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    // This would typically kill the vLLM process
    Ok(GLM46VServerStopResponse {
        stopped: false,
        message: "Arrêt manuel requis. Tuez le processus vLLM en cours.".to_string(),
    })
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GLM46VServerStopResponse {
    pub stopped: bool,
    pub message: String,
}
