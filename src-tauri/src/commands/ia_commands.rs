// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — IA Commands (Tauri)
//   Secure commands for AI key management and generation
// ═══════════════════════════════════════════════════════════════

use titane_infinity::ia::{IAEngine, UnifiedIAEngine, UnifiedIARequest, UnifiedMessage};
use titane_infinity::profiling::IPCProfiler;
use titane_infinity::security::secrets_engine::{SecureSecretsEngine, KEY_CLAUDE, KEY_GEMINI, KEY_OPENAI};
use log::{error, info};
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use std::sync::Arc;
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct SetAPIKeyRequest {
    pub service: String, // "openai" | "claude" | "gemini"
    pub key: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IAGenerateRequest {
    pub message: String,
    pub history: Vec<UnifiedMessage>,
    pub system_prompt: Option<String>,
    pub temperature: Option<f32>,
    pub max_tokens: Option<usize>,
    pub preferred_engine: Option<String>, // "openai" | "claude" | "gemini" | "local"
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CommandResult<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T> CommandResult<T> {
    pub fn ok(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn err(error: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(error),
        }
    }
}

/// Set API key for AI provider
#[tauri::command]
pub async fn set_api_key(
    secrets: State<'_, Arc<SecureSecretsEngine>>,
    request: SetAPIKeyRequest,
) -> Result<CommandResult<String>, String> {
    info!("[IACommands] Configuration clé {}", request.service);

    let result = match request.service.to_lowercase().as_str() {
        "openai" | "gpt" => secrets
            .set_openai_key(request.key)
            .map(|_| "Clé OpenAI configurée avec succès".to_string()),
        "claude" | "anthropic" => secrets
            .set_claude_key(request.key)
            .map(|_| "Clé Claude configurée avec succès".to_string()),
        "gemini" => secrets
            .set_secret(KEY_GEMINI, request.key)
            .map(|_| "Clé Gemini configurée avec succès".to_string()),
        _ => Err(titane_infinity::security::secrets_engine::SecretsError::InvalidKey(
            format!("Service inconnu: {}", request.service),
        )),
    };

    match result {
        Ok(msg) => {
            info!("[IACommands] ✅ {}", msg);
            Ok(CommandResult::ok(msg))
        }
        Err(e) => {
            error!("[IACommands] ❌ Échec configuration: {}", e);
            Ok(CommandResult::err(format!("{}", e)))
        }
    }
}

/// Delete API key
#[tauri::command]
pub async fn delete_api_key(
    secrets: State<'_, Arc<SecureSecretsEngine>>,
    service: String,
) -> Result<CommandResult<String>, String> {
    info!("[IACommands] Suppression clé {}", service);

    let key_name = match service.to_lowercase().as_str() {
        "openai" | "gpt" => KEY_OPENAI,
        "claude" | "anthropic" => KEY_CLAUDE,
        "gemini" => KEY_GEMINI,
        _ => {
            return Ok(CommandResult::err(format!(
                "Service inconnu: {}",
                service
            )))
        }
    };

    match secrets.clear_secret(key_name) {
        Ok(_) => {
            info!("[IACommands] ✅ Clé {} supprimée", service);
            Ok(CommandResult::ok(format!(
                "Clé {} supprimée avec succès",
                service
            )))
        }
        Err(e) => {
            error!("[IACommands] ❌ Échec suppression: {}", e);
            Ok(CommandResult::err(format!("{}", e)))
        }
    }
}

/// List available AI providers
#[tauri::command]
pub async fn list_ai_providers(
    secrets: State<'_, Arc<SecureSecretsEngine>>,
) -> Result<CommandResult<Vec<String>>, String> {
    match secrets.list_ai_providers() {
        Ok(providers) => {
            info!("[IACommands] {} providers disponibles", providers.len());
            Ok(CommandResult::ok(providers))
        }
        Err(e) => {
            error!("[IACommands] ❌ Échec listage: {}", e);
            Ok(CommandResult::err(format!("{}", e)))
        }
    }
}

/// Test API key validity
#[tauri::command]
pub async fn test_api_key(
    _secrets: State<'_, Arc<SecureSecretsEngine>>,
    unified_engine: State<'_, Arc<UnifiedIAEngine>>,
    service: String,
) -> Result<CommandResult<bool>, String> {
    info!("[IACommands] Test clé {}", service);

    let engine = match IAEngine::from_str(&service) {
        Ok(e) => e,
        Err(_) => {
            return Ok(CommandResult::err(format!(
                "Service inconnu: {}",
                service
            )))
        }
    };

    // Try a simple request
    let test_request = UnifiedIARequest {
        message: "Test de connexion. Réponds juste 'OK'.".to_string(),
        history: vec![],
        system_prompt: Some("Tu es un assistant de test. Réponds uniquement 'OK'.".to_string()),
        temperature: 0.0,
        max_tokens: Some(10),
        preferred_engine: Some(engine),
    };

    match unified_engine.generate(test_request).await {
        Ok(_) => {
            info!("[IACommands] ✅ Clé {} valide", service);
            Ok(CommandResult::ok(true))
        }
        Err(e) => {
            error!("[IACommands] ❌ Clé {} invalide: {}", service, e);
            Ok(CommandResult::ok(false))
        }
    }
}

/// Generate IA response
#[tauri::command]
pub async fn ia_generate(
    unified_engine: State<'_, Arc<UnifiedIAEngine>>,
    profiler: State<'_, Arc<IPCProfiler>>,
    request: IAGenerateRequest,
) -> Result<CommandResult<serde_json::Value>, String> {
    let _guard = profiler.start("ia_generate");
    
    info!("[IACommands] Génération IA...");

    let preferred = request
        .preferred_engine
        .and_then(|s| IAEngine::from_str(&s).ok());

    let unified_request = UnifiedIARequest {
        message: request.message,
        history: request.history,
        system_prompt: request.system_prompt,
        temperature: request.temperature.unwrap_or(0.7),
        max_tokens: request.max_tokens,
        preferred_engine: preferred,
    };

    match unified_engine.generate(unified_request).await {
        Ok(response) => {
            info!(
                "[IACommands] ✅ Réponse générée via {} ({} tokens, {} ms)",
                response.engine_used.display_name(),
                response.tokens_used,
                response.latency_ms
            );

            let json = serde_json::json!({
                "content": response.content,
                "engine": response.engine_used.as_str(),
                "model": response.model,
                "tokens": response.tokens_used,
                "latency_ms": response.latency_ms,
                "fallback_used": response.fallback_used,
            });

            Ok(CommandResult::ok(json))
        }
        Err(e) => {
            error!("[IACommands] ❌ Échec génération: {}", e);
            Ok(CommandResult::err(e))
        }
    }
}

/// Get available engines
#[tauri::command]
pub async fn get_available_engines(
    unified_engine: State<'_, Arc<UnifiedIAEngine>>,
) -> Result<CommandResult<Vec<String>>, String> {
    let engines = unified_engine.get_available_engines().await;
    let names: Vec<String> = engines.iter().map(|e| e.as_str().to_string()).collect();

    info!("[IACommands] {} moteurs disponibles", names.len());
    Ok(CommandResult::ok(names))
}
