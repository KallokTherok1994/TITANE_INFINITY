// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   AUTH OS — TAURI COMMANDS
// ═══════════════════════════════════════════════════════════════

use crate::auth::{ApiKeyManager, ApiKeysInput, AuthStatusDto, DevTokenManager, RoleManager};
use log::{error, info};

/// Obtenir statut global de l'authentification
#[tauri::command]
pub async fn auth_get_status() -> Result<AuthStatusDto, String> {
    info!("🔐 AUTH OS → auth_get_status");
    crate::auth::get_auth_status().map_err(|e| {
        error!("❌ AUTH OS → auth_get_status failed: {}", e);
        e.to_string()
    })
}

/// Générer ou récupérer dev token
#[tauri::command]
pub async fn auth_generate_dev_token() -> Result<String, String> {
    info!("🔐 AUTH OS → auth_generate_dev_token");
    DevTokenManager::get_or_create().map_err(|e| {
        error!("❌ AUTH OS → auth_generate_dev_token failed: {}", e);
        e.to_string()
    })
}

/// Valider dev token
#[tauri::command]
pub async fn auth_validate_dev_token(token: String) -> Result<bool, String> {
    info!("🔐 AUTH OS → auth_validate_dev_token");
    DevTokenManager::validate(&token).map_err(|e| {
        error!("❌ AUTH OS → auth_validate_dev_token failed: {}", e);
        e.to_string()
    })
}

/// Révoquer dev token
#[tauri::command]
pub async fn auth_revoke_dev_token() -> Result<(), String> {
    info!("🔐 AUTH OS → auth_revoke_dev_token");
    DevTokenManager::revoke().map_err(|e| {
        error!("❌ AUTH OS → auth_revoke_dev_token failed: {}", e);
        e.to_string()
    })
}

/// Sauvegarder API keys
#[tauri::command]
pub async fn auth_save_api_keys(keys: ApiKeysInput) -> Result<(), String> {
    info!("🔐 AUTH OS → auth_save_api_keys");
    ApiKeyManager::save_keys(keys).map_err(|e| {
        error!("❌ AUTH OS → auth_save_api_keys failed: {}", e);
        e.to_string()
    })
}

/// Récupérer API keys (masquées)
#[tauri::command]
pub async fn auth_get_api_keys() -> Result<crate::auth::ApiKeysOutput, String> {
    info!("🔐 AUTH OS → auth_get_api_keys");
    ApiKeyManager::get_keys().map_err(|e| {
        error!("❌ AUTH OS → auth_get_api_keys failed: {}", e);
        e.to_string()
    })
}

/// Supprimer une API key
#[tauri::command]
pub async fn auth_delete_api_key(provider: String) -> Result<(), String> {
    info!("🔐 AUTH OS → auth_delete_api_key ({})", provider);
    ApiKeyManager::delete_key(&provider).map_err(|e| {
        error!("❌ AUTH OS → auth_delete_api_key failed: {}", e);
        e.to_string()
    })
}

/// Accorder un rôle (dev, user)
#[tauri::command]
pub async fn auth_grant_role(user: String, role: String) -> Result<(), String> {
    info!("🔐 AUTH OS → auth_grant_role ({} → {})", user, role);
    RoleManager::grant_role(&user, &role).map_err(|e| {
        error!("❌ AUTH OS → auth_grant_role failed: {}", e);
        e.to_string()
    })
}

/// Révoquer un rôle
#[tauri::command]
pub async fn auth_revoke_role(user: String, role: String) -> Result<(), String> {
    info!("🔐 AUTH OS → auth_revoke_role ({} → {})", user, role);
    RoleManager::revoke_role(&user, &role).map_err(|e| {
        error!("❌ AUTH OS → auth_revoke_role failed: {}", e);
        e.to_string()
    })
}
