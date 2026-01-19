// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   TITANE∞ AUTH OS — Système d'Authentification Centralisé
//   Version: 1.0
//   Owner: Kevin Thibault
// ═══════════════════════════════════════════════════════════════

pub mod api_keys;
pub mod commands;
pub mod dev_token;
pub mod dto;
pub mod error;
pub mod keystore;
pub mod roles;

// Re-exports publics
pub use api_keys::ApiKeyManager;
pub use dev_token::DevTokenManager;
pub use dto::*;
pub use error::{AuthError, AuthResult};
pub use keystore::Keystore;
pub use roles::RoleManager;

use log::{info, warn};

/// Initialiser Auth OS au démarrage de TITANE∞
pub fn init_auth() -> AuthResult<()> {
    info!("🔐 AUTH OS — Initialisation...");

    // Charger ou créer keystore
    let keystore = Keystore::load()?;
    info!(
        "✓ Keystore chargé: {} secrets configurés",
        keystore.count_secrets()
    );

    // Vérifier owner role (Kevin Thibault)
    RoleManager::ensure_owner_role()?;
    info!("✓ Owner role vérifié: Kevin Thibault");

    // Vérifier dev token (créer si absent)
    let dev_token_present = keystore.dev_token.is_some();
    if dev_token_present {
        info!("✓ Dev Token présent");
    } else {
        warn!("⚠ Dev Token absent — Génération requise");
    }

    info!("🔐 AUTH OS — Initialisé avec succès");
    Ok(())
}

/// Obtenir le statut global de l'authentification
pub fn get_auth_status() -> AuthResult<AuthStatusDto> {
    let keystore = Keystore::load()?;

    Ok(AuthStatusDto {
        dev_mode_active: keystore.dev_token.is_some(),
        dev_token_present: keystore.dev_token.is_some(),
        has_owner_role: RoleManager::has_owner_role()?,
        api_keys_configured: keystore.api_keys.is_any_configured(),
        openai_configured: keystore.api_keys.openai.is_some(),
        anthropic_configured: keystore.api_keys.anthropic.is_some(),
        gemini_configured: keystore.api_keys.gemini.is_some(),
    })
}
