// ═══════════════════════════════════════════════════════════════════════════
// TITANE∞ v26.3 — COPILOT COMMANDS
// Tauri commands for GitHub Copilot provider integration
// ═══════════════════════════════════════════════════════════════════════════

use titane_infinity::api_hub::copilot::{CopilotClient, CopilotRequest, Message, TestResult};
use crate::security::permission_guard::PERMISSION_GUARD;
use crate::security::permissions::Role;
use crate::security::secrets_engine::{SecureSecretsEngine, KEY_COPILOT};
use log::{debug, error, info};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::State;
use tokio::sync::RwLock;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CopilotGenerateRequest {
    pub message: String,
    pub history: Vec<CopilotHistoryMessage>,
    pub config: Option<CopilotGenerateConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CopilotHistoryMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CopilotGenerateConfig {
    pub model: Option<String>,
    pub temperature: Option<f32>,
    pub max_tokens: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CopilotGenerateResponse {
    pub ok: bool,
    pub data: Option<CopilotGenerateData>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CopilotGenerateData {
    pub content: String,
    pub model: Option<String>,
    pub tokens: Option<u32>,
    pub finish_reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CopilotKeyStatus {
    pub configured: bool,
    pub status: String,
    pub message: Option<String>,
}

// ─────────────────────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────────────────────

pub struct CopilotState {
    pub api_key: Arc<RwLock<Option<String>>>,
    pub secrets_engine: Arc<SecureSecretsEngine>,
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMANDS
// ─────────────────────────────────────────────────────────────────────────────

/// Générer une réponse avec GitHub Copilot
#[tauri::command]
pub async fn chat_generate_copilot(
    request: CopilotGenerateRequest,
    state: State<'_, CopilotState>,
) -> Result<CopilotGenerateResponse, String> {
    // Permission check
    PERMISSION_GUARD
        .require("ai_generate", Role::User, "chat_generate_copilot")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    debug!("chat_generate_copilot: message={}", request.message);

    // Validation
    if request.message.trim().is_empty() {
        return Ok(CopilotGenerateResponse {
            ok: false,
            data: None,
            error: Some("Message vide".to_string()),
        });
    }

    // Check if Copilot key is configured
    let api_key = state.api_key.read().await;
    if api_key.is_none() {
        return Ok(CopilotGenerateResponse {
            ok: false,
            data: None,
            error: Some("Clé API Copilot non configurée. Allez dans Gouvernance → Secrets pour configurer votre token GitHub.".to_string()),
        });
    }

    // Safe: we checked is_none() above, but using ok_or is more explicit and maintainable
    let key = api_key.clone()
        .ok_or_else(|| "Clé API Copilot non configurée".to_string())
        .map_err(|e| format!("{}", e))?;
    drop(api_key);

    // Create Copilot client
    let client = match CopilotClient::new(key) {
        Ok(c) => c,
        Err(e) => {
            error!("Failed to create Copilot client: {}", e);
            return Ok(CopilotGenerateResponse {
                ok: false,
                data: None,
                error: Some(format!("Erreur client Copilot: {}", e)),
            });
        }
    };

    // Build messages from history + current message
    let mut messages: Vec<Message> = request
        .history
        .iter()
        .map(|h| Message {
            role: h.role.clone(),
            content: h.content.clone(),
        })
        .collect();

    messages.push(Message {
        role: "user".to_string(),
        content: request.message.clone(),
    });

    // Build Copilot request
    let model = request
        .config
        .as_ref()
        .and_then(|c| c.model.clone())
        .unwrap_or_else(|| "gpt-4".to_string());

    let copilot_request = CopilotRequest {
        model: model.clone(),
        messages,
        temperature: request.config.as_ref().and_then(|c| c.temperature),
        max_tokens: request.config.as_ref().and_then(|c| c.max_tokens),
        stream: false,
    };

    // Send request
    match client.send_chat(copilot_request).await {
        Ok(response) => {
            info!("Copilot response OK: model={}", response.model);

            if response.choices.is_empty() {
                return Ok(CopilotGenerateResponse {
                    ok: false,
                    data: None,
                    error: Some("Aucune réponse Copilot".to_string()),
                });
            }

            let choice = &response.choices[0];
            let content = choice.message.content.clone();
            let tokens = response.usage.as_ref().map(|u| u.total_tokens);

            Ok(CopilotGenerateResponse {
                ok: true,
                data: Some(CopilotGenerateData {
                    content,
                    model: Some(response.model),
                    tokens,
                    finish_reason: choice.finish_reason.clone(),
                }),
                error: None,
            })
        }
        Err(e) => {
            error!("Copilot request failed: {}", e);
            Ok(CopilotGenerateResponse {
                ok: false,
                data: None,
                error: Some(e),
            })
        }
    }
}

/// Configurer la clé API Copilot (GitHub token)
#[tauri::command]
pub async fn chat_set_copilot_key(
    api_key: String,
    state: State<'_, CopilotState>,
) -> Result<CopilotKeyStatus, String> {
    // Permission check
    PERMISSION_GUARD
        .require("ai_configure", Role::User, "chat_set_copilot_key")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    debug!("chat_set_copilot_key: key length={}", api_key.len());

    // Validation
    if api_key.trim().is_empty() {
        return Ok(CopilotKeyStatus {
            configured: false,
            status: "error".to_string(),
            message: Some("Clé vide".to_string()),
        });
    }

    if api_key.len() < 16 {
        return Ok(CopilotKeyStatus {
            configured: false,
            status: "error".to_string(),
            message: Some("Clé trop courte (min 16 caractères)".to_string()),
        });
    }

    // Validate GitHub token format (basic check)
    if !api_key.starts_with("ghp_")
        && !api_key.starts_with("github_pat_")
        && !api_key.starts_with("gho_")
    {
        return Ok(CopilotKeyStatus {
            configured: false,
            status: "warning".to_string(),
            message: Some(
                "Format de token GitHub inhabituel (attendu: ghp_xxx ou github_pat_xxx)"
                    .to_string(),
            ),
        });
    }

    // Store in memory
    let mut key_lock = state.api_key.write().await;
    *key_lock = Some(api_key.clone());
    drop(key_lock);

    // Persist to encrypted storage
    if let Err(e) = state.secrets_engine.set_secret(KEY_COPILOT, api_key.clone()) {
        error!("Failed to persist Copilot key: {:?}", e);
        return Ok(CopilotKeyStatus {
            configured: false,
            status: "error".to_string(),
            message: Some(format!("Échec de sauvegarde: {:?}", e)),
        });
    }

    info!("Copilot key configured successfully");

    Ok(CopilotKeyStatus {
        configured: true,
        status: "ok".to_string(),
        message: Some("Clé Copilot configurée avec succès".to_string()),
    })
}

/// Récupérer le statut de la clé Copilot
#[tauri::command]
pub async fn get_copilot_key_status(
    state: State<'_, CopilotState>,
) -> Result<CopilotKeyStatus, String> {
    // Permission check
    PERMISSION_GUARD
        .require("ai_read", Role::User, "get_copilot_key_status")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    let api_key = state.api_key.read().await;
    let configured = api_key.is_some();
    drop(api_key);

    Ok(CopilotKeyStatus {
        configured,
        status: if configured {
            "ok".to_string()
        } else {
            "not_configured".to_string()
        },
        message: if configured {
            Some("Copilot configuré".to_string())
        } else {
            Some("Copilot non configuré".to_string())
        },
    })
}

/// Tester la connexion Copilot
#[tauri::command]
pub async fn test_copilot_connection(state: State<'_, CopilotState>) -> Result<TestResult, String> {
    // Permission check
    PERMISSION_GUARD
        .require("ai_test", Role::User, "test_copilot_connection")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    debug!("test_copilot_connection");

    // Check if key is configured
    let api_key = state.api_key.read().await;
    if api_key.is_none() {
        return Ok(TestResult {
            success: false,
            message: "❌ Clé API Copilot non configurée".to_string(),
            latency_ms: None,
            available_models: None,
        });
    }

    // Safe: we checked is_none() above, but using match is more explicit
    let key = match api_key.clone() {
        Some(k) => k,
        None => return Ok(TestResult {
            success: false,
            message: "❌ Clé API Copilot non configurée".to_string(),
            latency_ms: None,
            available_models: None,
        }),
    };
    drop(api_key);

    // Create client and test
    let client = match CopilotClient::new(key) {
        Ok(c) => c,
        Err(e) => {
            error!("Failed to create Copilot client for test: {}", e);
            return Ok(TestResult {
                success: false,
                message: format!("❌ Erreur client: {}", e),
                latency_ms: None,
                available_models: None,
            });
        }
    };

    match client.test_connection().await {
        Ok(result) => {
            info!("Copilot test connection result: success={}", result.success);
            Ok(result)
        }
        Err(e) => {
            error!("Copilot test connection failed: {}", e);
            Ok(TestResult {
                success: false,
                message: format!("❌ {}", e),
                latency_ms: None,
                available_models: None,
            })
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_copilot_request_serialization() {
        let req = CopilotGenerateRequest {
            message: "test".to_string(),
            history: vec![],
            config: Some(CopilotGenerateConfig {
                model: Some("gpt-4".to_string()),
                temperature: Some(0.7),
                max_tokens: Some(1000),
            }),
        };

        let json = serde_json::to_string(&req).unwrap();
        assert!(json.contains("test"));
    }

    #[test]
    fn test_copilot_key_status() {
        let status = CopilotKeyStatus {
            configured: true,
            status: "ok".to_string(),
            message: Some("Test".to_string()),
        };

        assert!(status.configured);
        assert_eq!(status.status, "ok");
    }
}
