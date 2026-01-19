// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   SECURE COMMANDS — Super-Prompts H, I, J, K
//   Commandes Tauri avec permissions, validation et chiffrement
// ═══════════════════════════════════════════════════════════════

use crate::overdrive::chat_orchestrator::ChatOrchestratorState;
use crate::secure_engine::{purge_env_key, zeroize_string};
use crate::security::permission_guard::PERMISSION_GUARD;
use crate::security::permissions::Role;
use crate::security::sandbox::FileImportSandbox;
use crate::security::validation::PayloadValidator;
use serde::{Deserialize, Serialize};
use tauri::State;

use crate::security::secrets_engine::SecureSecretsEngine;
use log::{info, warn};

/// Response format uniforme
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecureResponse<T> {
    pub ok: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T> SecureResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            ok: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn error(message: String) -> Self {
        Self {
            ok: false,
            data: None,
            error: Some(message),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeminiKeyStatus {
    pub configured: bool,
    pub provider_enabled: bool,
    pub masked_key: Option<String>,
    pub env_present: bool,
    pub env_purged: bool,
    pub was_updated: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecureSecretRequest {
    pub key: String,
    pub value: String,
    #[serde(default)]
    pub purge_env: bool,
    #[serde(default)]
    pub env_variable: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecretOperationResult {
    pub key: String,
    pub stored: bool,
    pub env_purged: bool,
}

fn mask_secret_for_display(secret: &str) -> String {
    if secret.is_empty() {
        return String::new();
    }

    let mut visible: Vec<char> = secret.chars().rev().take(4).collect();
    visible.reverse();

    let total = secret.chars().count();
    let masked_len = total.saturating_sub(visible.len());

    let mut output = String::with_capacity(total);
    if masked_len > 0 {
        output.push_str(&"•".repeat(masked_len));
    }
    for ch in visible {
        output.push(ch);
    }

    output
}

fn build_gemini_status_sync(
    secrets: &SecureSecretsEngine,
    provider_enabled: bool,
    env_present: bool,
) -> GeminiKeyStatus {
    let configured = secrets.has_secret("gemini_api_key").unwrap_or(false);

    let masked_key = secrets
        .get_secret("gemini_api_key")
        .ok()
        .flatten()
        .map(|value| {
            let zero = zeroize_string(value);
            mask_secret_for_display(zero.as_str())
        });

    GeminiKeyStatus {
        configured,
        provider_enabled,
        masked_key,
        env_present,
        env_purged: configured && !env_present,
        was_updated: false,
    }
}

/// Enregistrer la clé Gemini de manière sécurisée depuis le frontend
#[tauri::command]
pub async fn chat_set_gemini_key(
    api_key: String,
    secrets: State<'_, SecureSecretsEngine>,
    orchestrator: State<'_, ChatOrchestratorState>,
) -> Result<SecureResponse<GeminiKeyStatus>, String> {
    PERMISSION_GUARD
        .require("secret_write", Role::Root, "chat_set_gemini_key")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    let trimmed = api_key.trim();
    if let Err(err) = PayloadValidator::validate_string(trimmed, "api_key", true) {
        return Ok(SecureResponse::error(format!("Invalid API key: {}", err)));
    }

    if trimmed.len() < 16 {
        return Ok(SecureResponse::error(
            "Gemini API key semble invalide (longueur insuffisante)".to_string(),
        ));
    }

    let zero = zeroize_string(trimmed.to_string());
    let new_value = zero.as_str().to_string();
    let previously_configured = secrets.has_secret("gemini_api_key").unwrap_or(false);

    secrets
        .set_secret("gemini_api_key", new_value.clone())
        .map_err(|e| format!("Failed to store Gemini key: {}", e))?;

    {
        let mut guard = orchestrator.gemini_api_key.write().await;
        *guard = Some(new_value.clone());
    }
    orchestrator.set_provider_availability("gemini", true).await;

    drop(zero); // zeroized buffer dropped here

    let env_present = std::env::var("GEMINI_API_KEY").is_ok();
    let env_purged = match purge_env_key("GEMINI_API_KEY").await {
        Ok(_) => {
            info!("[SecureCommands] Purged GEMINI_API_KEY from .env");
            true
        }
        Err(err) => {
            if env_present {
                warn!(
                    "[SecureCommands] Failed to purge GEMINI_API_KEY from .env: {}",
                    err
                );
            }
            false
        }
    };

    let mut status = build_gemini_status_sync(&secrets, true, env_present && !env_purged);
    status.env_present = env_present && !env_purged;
    status.env_purged = env_purged;
    status.was_updated = !previously_configured || env_purged;

    Ok(SecureResponse::success(status))
}

/// Obtenir l'état actuel de la clé Gemini (masquée)
#[tauri::command]
pub async fn get_gemini_key_status(
    secrets: State<'_, SecureSecretsEngine>,
    orchestrator: State<'_, ChatOrchestratorState>,
) -> Result<SecureResponse<GeminiKeyStatus>, String> {
    PERMISSION_GUARD
        .require("secret_status", Role::System, "get_gemini_key_status")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    let provider_enabled = orchestrator.gemini_api_key.read().await.is_some();
    let env_present = std::env::var("GEMINI_API_KEY").is_ok();
    let mut status = build_gemini_status_sync(&secrets, provider_enabled, env_present);
    status.was_updated = false;
    Ok(SecureResponse::success(status))
}

/// Configurer la clé API OpenAI
#[tauri::command]
pub async fn chat_set_openai_key(
    api_key: String,
    secrets: State<'_, SecureSecretsEngine>,
    orchestrator: State<'_, ChatOrchestratorState>,
) -> Result<SecureResponse<GeminiKeyStatus>, String> {
    PERMISSION_GUARD
        .require("secret_write", Role::Root, "chat_set_openai_key")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    let trimmed = api_key.trim();
    if let Err(err) = PayloadValidator::validate_string(trimmed, "api_key", true) {
        return Ok(SecureResponse::error(format!("Invalid API key: {}", err)));
    }

    if trimmed.len() < 16 {
        return Ok(SecureResponse::error(
            "OpenAI API key too short (min 16 chars)".to_string(),
        ));
    }

    let zero = zeroize_string(trimmed.to_string());
    let new_value = zero.as_str().to_string();

    let previously_configured = secrets.has_secret("openai_api_key").unwrap_or(false);

    secrets
        .set_secret("openai_api_key", new_value.clone())
        .map_err(|e| format!("Failed to store OpenAI key: {}", e))?;

    {
        let mut guard = orchestrator.openai_api_key.write().await;
        *guard = Some(new_value.clone());
    }
    orchestrator.set_provider_availability("openai", true).await;

    drop(zero);

    let env_present = std::env::var("OPENAI_API_KEY").is_ok();
    let env_purged = match purge_env_key("OPENAI_API_KEY").await {
        Ok(_) => {
            info!("[SecureCommands] Purged OPENAI_API_KEY from .env");
            true
        }
        Err(err) => {
            if env_present {
                warn!(
                    "[SecureCommands] Failed to purge OPENAI_API_KEY from .env: {}",
                    err
                );
            }
            false
        }
    };

    let masked_key = secrets
        .get_secret("openai_api_key")
        .ok()
        .flatten()
        .map(|k| mask_secret_for_display(&k));

    Ok(SecureResponse::success(GeminiKeyStatus {
        configured: true,
        provider_enabled: true,
        masked_key,
        env_present: env_present && !env_purged,
        env_purged,
        was_updated: !previously_configured || env_purged,
    }))
}

/// Obtenir l'état de la clé OpenAI
#[tauri::command]
pub async fn get_openai_key_status(
    secrets: State<'_, SecureSecretsEngine>,
    orchestrator: State<'_, ChatOrchestratorState>,
) -> Result<SecureResponse<GeminiKeyStatus>, String> {
    PERMISSION_GUARD
        .require("secret_status", Role::System, "get_openai_key_status")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    let provider_enabled = orchestrator.openai_api_key.read().await.is_some();
    let configured = secrets.has_secret("openai_api_key").unwrap_or(false);
    let masked_key = secrets
        .get_secret("openai_api_key")
        .ok()
        .flatten()
        .map(|k| mask_secret_for_display(&k));

    Ok(SecureResponse::success(GeminiKeyStatus {
        configured,
        provider_enabled,
        masked_key,
        env_present: std::env::var("OPENAI_API_KEY").is_ok(),
        env_purged: false,
        was_updated: false,
    }))
}

/// Configurer la clé API Anthropic
#[tauri::command]
pub async fn chat_set_anthropic_key(
    api_key: String,
    secrets: State<'_, SecureSecretsEngine>,
    orchestrator: State<'_, ChatOrchestratorState>,
) -> Result<SecureResponse<GeminiKeyStatus>, String> {
    PERMISSION_GUARD
        .require("secret_write", Role::Root, "chat_set_anthropic_key")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    let trimmed = api_key.trim();
    if let Err(err) = PayloadValidator::validate_string(trimmed, "api_key", true) {
        return Ok(SecureResponse::error(format!("Invalid API key: {}", err)));
    }

    if trimmed.len() < 16 {
        return Ok(SecureResponse::error(
            "Anthropic API key too short (min 16 chars)".to_string(),
        ));
    }

    let zero = zeroize_string(trimmed.to_string());
    let new_value = zero.as_str().to_string();

    let previously_configured = secrets.has_secret("anthropic_api_key").unwrap_or(false);

    secrets
        .set_secret("anthropic_api_key", new_value.clone())
        .map_err(|e| format!("Failed to store Anthropic key: {}", e))?;

    {
        let mut guard = orchestrator.anthropic_api_key.write().await;
        *guard = Some(new_value.clone());
    }
    orchestrator
        .set_provider_availability("anthropic", true)
        .await;

    drop(zero);

    let env_present = std::env::var("ANTHROPIC_API_KEY").is_ok();
    let env_purged = match purge_env_key("ANTHROPIC_API_KEY").await {
        Ok(_) => {
            info!("[SecureCommands] Purged ANTHROPIC_API_KEY from .env");
            true
        }
        Err(err) => {
            if env_present {
                warn!(
                    "[SecureCommands] Failed to purge ANTHROPIC_API_KEY from .env: {}",
                    err
                );
            }
            false
        }
    };

    let masked_key = secrets
        .get_secret("anthropic_api_key")
        .ok()
        .flatten()
        .map(|k| mask_secret_for_display(&k));

    Ok(SecureResponse::success(GeminiKeyStatus {
        configured: true,
        provider_enabled: true,
        masked_key,
        env_present: env_present && !env_purged,
        env_purged,
        was_updated: !previously_configured || env_purged,
    }))
}

/// Obtenir l'état de la clé Anthropic
#[tauri::command]
pub async fn get_anthropic_key_status(
    secrets: State<'_, SecureSecretsEngine>,
    orchestrator: State<'_, ChatOrchestratorState>,
) -> Result<SecureResponse<GeminiKeyStatus>, String> {
    PERMISSION_GUARD
        .require("secret_status", Role::System, "get_anthropic_key_status")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    let provider_enabled = orchestrator.anthropic_api_key.read().await.is_some();
    let configured = secrets.has_secret("anthropic_api_key").unwrap_or(false);
    let masked_key = secrets
        .get_secret("anthropic_api_key")
        .ok()
        .flatten()
        .map(|k| mask_secret_for_display(&k));

    Ok(SecureResponse::success(GeminiKeyStatus {
        configured,
        provider_enabled,
        masked_key,
        env_present: std::env::var("ANTHROPIC_API_KEY").is_ok(),
        env_purged: false,
        was_updated: false,
    }))
}

/// Stocker un secret arbitraire dans le SecureSecretsEngine
#[tauri::command]
pub async fn secure_store_secret(
    payload: SecureSecretRequest,
    secrets: State<'_, SecureSecretsEngine>,
) -> Result<SecureResponse<SecretOperationResult>, String> {
    PERMISSION_GUARD
        .require("secret_write", Role::Root, "secure_store_secret")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    let normalized_key = payload.key.trim();
    if let Err(err) = PayloadValidator::validate_string(normalized_key, "key", true) {
        return Ok(SecureResponse::error(format!(
            "Invalid secret key: {}",
            err
        )));
    }

    if !normalized_key
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || matches!(c, '_' | '-'))
    {
        return Ok(SecureResponse::error(
            "Secret key must be alphanumeric with optional '_' or '-'".to_string(),
        ));
    }

    let value_trimmed = payload.value.trim();
    if let Err(err) = PayloadValidator::validate_string(value_trimmed, "value", true) {
        return Ok(SecureResponse::error(format!(
            "Invalid secret value: {}",
            err
        )));
    }

    let zero_value = zeroize_string(value_trimmed.to_string());
    let stored_value = zero_value.as_str().to_string();
    secrets
        .set_secret(normalized_key, stored_value)
        .map_err(|e| format!("Failed to store secret: {}", e))?;
    drop(zero_value);

    let mut env_purged = false;
    if payload.purge_env {
        let target = payload
            .env_variable
            .as_deref()
            .map(str::to_string)
            .unwrap_or_else(|| normalized_key.to_ascii_uppercase());

        match purge_env_key(&target).await {
            Ok(_) => {
                info!(
                    "[SecureCommands] Purged {} from .env after secure_store_secret",
                    target
                );
                env_purged = true;
            }
            Err(err) => {
                warn!(
                    "[SecureCommands] Unable to purge {} from .env: {}",
                    target, err
                );
            }
        }
    }

    let result = SecretOperationResult {
        key: normalized_key.to_string(),
        stored: true,
        env_purged,
    };

    Ok(SecureResponse::success(result))
}

/// Import fichier sécurisé
#[tauri::command]
pub async fn secure_import_file(
    filename: String,
    data: Vec<u8>,
) -> Result<SecureResponse<String>, String> {
    // 1. Vérifier permission
    PERMISSION_GUARD
        .require("file_import", Role::User, "secure_import_file")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    // 2. Valider filename
    if let Err(e) = PayloadValidator::validate_string(&filename, "filename", true) {
        return Ok(SecureResponse::error(format!("Invalid filename: {}", e)));
    }

    // 3. Import dans sandbox
    let sandbox = FileImportSandbox::new();
    match sandbox.import_file(&filename, data).await {
        Ok(imported) => {
            log::info!("✅ File imported: {} → {}", filename, imported.safe_name);
            Ok(SecureResponse::success(imported.safe_name))
        }
        Err(e) => Ok(SecureResponse::error(format!("Import failed: {}", e))),
    }
}

/// Lire fichier depuis sandbox
#[tauri::command]
pub async fn secure_read_file(safe_name: String) -> Result<SecureResponse<Vec<u8>>, String> {
    // 1. Vérifier permission
    PERMISSION_GUARD
        .require("file_read", Role::User, "secure_read_file")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    // 2. Valider nom
    if let Err(e) = PayloadValidator::validate_path(&safe_name) {
        return Ok(SecureResponse::error(format!("Invalid filename: {}", e)));
    }

    // 3. Lire depuis sandbox
    let sandbox = FileImportSandbox::new();
    match sandbox.read_file(&safe_name).await {
        Ok(data) => Ok(SecureResponse::success(data)),
        Err(e) => Ok(SecureResponse::error(format!("Read failed: {}", e))),
    }
}

/// Lister fichiers sandbox
#[tauri::command]
pub async fn secure_list_files() -> Result<SecureResponse<Vec<String>>, String> {
    // 1. Vérifier permission
    PERMISSION_GUARD
        .require("file_read", Role::User, "secure_list_files")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    // 2. Lister
    let sandbox = FileImportSandbox::new();
    match sandbox.list_files().await {
        Ok(files) => Ok(SecureResponse::success(files)),
        Err(e) => Ok(SecureResponse::error(format!("List failed: {}", e))),
    }
}

/// Supprimer fichier sandbox
#[tauri::command]
pub async fn secure_delete_file(safe_name: String) -> Result<SecureResponse<()>, String> {
    // 1. Vérifier permission
    PERMISSION_GUARD
        .require("file_delete", Role::System, "secure_delete_file")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    // 2. Valider nom
    if let Err(e) = PayloadValidator::validate_path(&safe_name) {
        return Ok(SecureResponse::error(format!("Invalid filename: {}", e)));
    }

    // 3. Supprimer
    let sandbox = FileImportSandbox::new();
    match sandbox.delete_file(&safe_name).await {
        Ok(_) => Ok(SecureResponse::success(())),
        Err(e) => Ok(SecureResponse::error(format!("Delete failed: {}", e))),
    }
}

/// Obtenir audit log permissions
#[tauri::command]
pub async fn get_permission_audit() -> Result<SecureResponse<String>, String> {
    // 1. Vérifier permission (ROOT uniquement)
    PERMISSION_GUARD
        .require("permission_view", Role::Root, "get_permission_audit")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    // 2. Exporter audit
    match PERMISSION_GUARD.export_audit(Role::Root).await {
        Ok(json) => Ok(SecureResponse::success(json)),
        Err(e) => Ok(SecureResponse::error(format!("Export failed: {}", e))),
    }
}

/// Valider message chat (anti-XSS, taille)
#[tauri::command]
pub async fn validate_chat_message(message: String) -> Result<SecureResponse<String>, String> {
    // 1. Vérifier permission
    PERMISSION_GUARD
        .require("ia_generate", Role::User, "validate_chat_message")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    // 2. Valider taille
    if let Err(e) = PayloadValidator::validate_string(&message, "message", true) {
        return Ok(SecureResponse::error(format!("Invalid message: {}", e)));
    }

    // 3. Sanitize HTML
    let sanitized = PayloadValidator::sanitize_html(&message);

    Ok(SecureResponse::success(sanitized))
}

/// Vérifier intégrité système (pre-boot check)
#[tauri::command]
pub async fn check_system_integrity() -> Result<SecureResponse<String>, String> {
    // 1. Vérifier permission (audit même en mode mock)
    PERMISSION_GUARD
        .require("system_audit", Role::System, "check_system_integrity")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    #[cfg(feature = "mock")]
    {
        // En mode mock, renvoyer succès immédiat pour éviter faux positifs pendant le dev frontend
        log::info!("[Security] check_system_integrity (mock) → OK");
        Ok(SecureResponse::success(
            "Mock integrity: OK — validation bypassed in mock mode".to_string(),
        ))
    }

    #[cfg(not(feature = "mock"))]
    {
        use crate::security::pre_boot_validation::validate_pre_boot;

        // 2. Effectuer validation complète
        match validate_pre_boot().await {
            Ok(validation) => Ok(SecureResponse::success(validation.report())),
            Err(e) => Ok(SecureResponse::error(format!(
                "Integrity check failed: {}",
                e
            ))),
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::security::validation::PayloadValidator;

    #[test]
    fn test_sanitize_html() {
        // Test direct PayloadValidator instead of full command (avoids permission guard)
        let input = "Hello <script>alert('xss')</script> world";
        let sanitized = PayloadValidator::sanitize_html(input);
        assert!(!sanitized.contains("<script>"));
        assert!(sanitized.contains("Hello"));
    }

    #[test]
    fn test_mask_secret_for_display() {
        let masked = super::mask_secret_for_display("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
        assert!(masked.ends_with("WXYZ"));
        assert_eq!(masked.chars().filter(|c| *c == '•').count(), 22);

        let short = super::mask_secret_for_display("AB");
        assert_eq!(short, "AB");
    }
}
