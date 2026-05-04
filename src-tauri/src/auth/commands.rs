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

// ═══════════════════════════════════════════════════════════════
// OAUTH — Facebook PKCE Flow (OWASP-compliant, no client_secret)
// ═══════════════════════════════════════════════════════════════

use crate::auth::oauth::{FacebookProvider, OAuthProfile};

/// Initiate Facebook OAuth PKCE flow.
/// Returns { auth_url, state } — frontend must open auth_url in system browser.
#[tauri::command]
pub async fn oauth_facebook_initiate() -> Result<serde_json::Value, String> {
    info!("🔐 OAUTH → oauth_facebook_initiate");
    FacebookProvider::build_auth_url()
        .map(|(auth_url, state)| {
            serde_json::json!({ "auth_url": auth_url, "state": state })
        })
        .map_err(|e| {
            error!("❌ OAUTH → initiate failed: {}", e);
            e.to_string()
        })
}

/// Handle Facebook OAuth callback (called after deep-link titane://auth/callback).
/// `url` is the full callback URL including code and state params.
#[tauri::command]
pub async fn oauth_facebook_callback(url: String) -> Result<OAuthProfile, String> {
    info!("🔐 OAUTH → oauth_facebook_callback");
    let (code, state) = crate::auth::oauth::facebook_provider::parse_callback_url(&url)
        .map_err(|e| e.to_string())?;
    FacebookProvider::handle_callback(&code, &state)
        .await
        .map_err(|e| {
            error!("❌ OAUTH → callback failed: {}", e);
            e.to_string()
        })
}

/// Get cached Facebook profile (returns null if not logged in).
#[tauri::command]
pub async fn oauth_facebook_get_profile() -> Result<Option<OAuthProfile>, String> {
    info!("🔐 OAUTH → oauth_facebook_get_profile");
    Ok(FacebookProvider::get_cached_profile())
}

/// Logout from Facebook — clears all credentials.
#[tauri::command]
pub async fn oauth_facebook_logout() -> Result<bool, String> {
    info!("🔐 OAUTH → oauth_facebook_logout");
    FacebookProvider::logout();
    Ok(true)
}
