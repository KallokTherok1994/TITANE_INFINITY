// ═══════════════════════════════════════════════════════════════════════════
// TITANE∞ v21 — CHAT GENERATE COMMANDS
// Tauri commands for AI provider-specific generation
// Phase 1: Standardisation API — Réactivation Gemini + OpenAI + Claude
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
pub struct GenerateRequest {
    pub message: String,
    pub history: Vec<HistoryMessage>,
    pub config: Option<GenerateConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenerateConfig {
    pub model: Option<String>,
    pub temperature: Option<f32>,
    pub max_tokens: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenerateResponse {
    pub ok: bool,
    pub data: Option<GenerateData>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenerateData {
    pub content: String,
    pub model: Option<String>,
    pub tokens: Option<u32>,
    pub finish_reason: Option<String>,
}

// ─────────────────────────────────────────────────────────────────────────────
// GEMINI COMMAND
// ─────────────────────────────────────────────────────────────────────────────

/// Générer une réponse avec Gemini
#[tauri::command]
pub async fn chat_generate_gemini(
    request: GenerateRequest,
    state: State<'_, ChatOrchestratorState>,
) -> Result<GenerateResponse, String> {
    // Permission check
    PERMISSION_GUARD
        .require("ai_generate", Role::User, "chat_generate_gemini")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    // Validation
    if request.message.trim().is_empty() {
        return Ok(GenerateResponse {
            ok: false,
            data: None,
            error: Some("Message vide".to_string()),
        });
    }

    // Check if Gemini key is configured
    let has_key = state.gemini_api_key.read().await.is_some();
    if !has_key {
        return Ok(GenerateResponse {
            ok: false,
            data: None,
            error: Some("Clé API Gemini non configurée".to_string()),
        });
    }

    // Convert to ChatRequest for orchestrator
    let chat_request = ChatRequest {
        message: request.message.clone(),
        conversation_id: None,
        provider: "gemini".to_string(),
        model: request.config.as_ref().and_then(|c| c.model.clone()),
        streaming: false,
        images: None,
        system_prompt: None,
    };

    // Call internal send_to_gemini via orchestrator
    match crate::overdrive::chat_orchestrator::send_to_gemini_internal(&chat_request, &state).await
    {
        Ok(message) => Ok(GenerateResponse {
            ok: true,
            data: Some(GenerateData {
                content: message.content,
                model: Some(message.model),
                tokens: message.tokens,
                finish_reason: None,
            }),
            error: None,
        }),
        Err(e) => Ok(GenerateResponse {
            ok: false,
            data: None,
            error: Some(format!("Erreur Gemini: {}", e)),
        }),
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// OPENAI COMMAND
// ─────────────────────────────────────────────────────────────────────────────

/// Générer une réponse avec OpenAI GPT
#[tauri::command]
pub async fn chat_generate_openai(
    request: GenerateRequest,
    state: State<'_, ChatOrchestratorState>,
) -> Result<GenerateResponse, String> {
    // Permission check
    PERMISSION_GUARD
        .require("ai_generate", Role::User, "chat_generate_openai")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    // Validation
    if request.message.trim().is_empty() {
        return Ok(GenerateResponse {
            ok: false,
            data: None,
            error: Some("Message vide".to_string()),
        });
    }

    // Check if OpenAI key is configured
    let has_key = state.openai_api_key.read().await.is_some();
    if !has_key {
        return Ok(GenerateResponse {
            ok: false,
            data: None,
            error: Some("Clé API OpenAI non configurée".to_string()),
        });
    }

    // Convert to ChatRequest
    let chat_request = ChatRequest {
        message: request.message.clone(),
        conversation_id: None,
        provider: "openai".to_string(),
        model: request.config.as_ref().and_then(|c| c.model.clone()),
        streaming: false,
        images: None,
        system_prompt: None,
    };

    // Call internal send_to_openai via orchestrator
    match crate::overdrive::chat_orchestrator::send_to_openai_internal(&chat_request, &state).await
    {
        Ok(message) => Ok(GenerateResponse {
            ok: true,
            data: Some(GenerateData {
                content: message.content,
                model: Some(message.model),
                tokens: message.tokens,
                finish_reason: None,
            }),
            error: None,
        }),
        Err(e) => Ok(GenerateResponse {
            ok: false,
            data: None,
            error: Some(format!("Erreur OpenAI: {}", e)),
        }),
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// CLAUDE/ANTHROPIC COMMAND
// ─────────────────────────────────────────────────────────────────────────────

/// Générer une réponse avec Claude (Anthropic)
#[tauri::command]
pub async fn chat_generate_claude(
    request: GenerateRequest,
    state: State<'_, ChatOrchestratorState>,
) -> Result<GenerateResponse, String> {
    // Permission check
    PERMISSION_GUARD
        .require("ai_generate", Role::User, "chat_generate_claude")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    // Validation
    if request.message.trim().is_empty() {
        return Ok(GenerateResponse {
            ok: false,
            data: None,
            error: Some("Message vide".to_string()),
        });
    }

    // Check if Anthropic key is configured
    let has_key = state.anthropic_api_key.read().await.is_some();
    if !has_key {
        return Ok(GenerateResponse {
            ok: false,
            data: None,
            error: Some("Clé API Anthropic non configurée".to_string()),
        });
    }

    // Convert to ChatRequest
    let chat_request = ChatRequest {
        message: request.message.clone(),
        conversation_id: None,
        provider: "anthropic".to_string(),
        model: request.config.as_ref().and_then(|c| c.model.clone()),
        streaming: false,
        images: None,
        system_prompt: None,
    };

    // Call internal send_to_anthropic via orchestrator
    match crate::overdrive::chat_orchestrator::send_to_anthropic_internal(&chat_request, &state)
        .await
    {
        Ok(message) => Ok(GenerateResponse {
            ok: true,
            data: Some(GenerateData {
                content: message.content,
                model: Some(message.model),
                tokens: message.tokens,
                finish_reason: None,
            }),
            error: None,
        }),
        Err(e) => Ok(GenerateResponse {
            ok: false,
            data: None,
            error: Some(format!("Erreur Claude: {}", e)),
        }),
    }
}
