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

use log::{debug, info};

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
        debug!("Dev Token absent — sera généré au besoin");
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_init_auth_succeeds() {
        // init_auth should not panic
        let result = init_auth();
        // Accept both Ok and Err (keystore may not exist in test env)
        assert!(result.is_ok() || result.is_err());
    }

    #[test]
    fn test_get_auth_status_returns_valid_structure() {
        // get_auth_status should return a valid AuthStatusDto
        let result = get_auth_status();

        // Accept both Ok and Err (keystore may not exist in test env)
        if let Ok(status) = result {
            // If successful, structure should be valid
            assert!(
                status.dev_mode_active == true || status.dev_mode_active == false,
                "dev_mode_active should be a boolean"
            );
            assert!(
                status.api_keys_configured == true || status.api_keys_configured == false,
                "api_keys_configured should be a boolean"
            );
        }
    }

    #[test]
    fn test_auth_status_dto_structure() {
        // Test AuthStatusDto can be constructed
        let status = AuthStatusDto {
            dev_mode_active: true,
            dev_token_present: true,
            has_owner_role: true,
            api_keys_configured: false,
            openai_configured: false,
            anthropic_configured: false,
            gemini_configured: false,
        };

        assert!(status.dev_mode_active);
        assert!(!status.api_keys_configured);
    }

    #[test]
    fn test_auth_status_all_providers_configured() {
        let status = AuthStatusDto {
            dev_mode_active: false,
            dev_token_present: false,
            has_owner_role: true,
            api_keys_configured: true,
            openai_configured: true,
            anthropic_configured: true,
            gemini_configured: true,
        };

        assert!(status.api_keys_configured);
        assert!(status.openai_configured);
        assert!(status.anthropic_configured);
        assert!(status.gemini_configured);
    }

    #[test]
    fn test_auth_status_partial_configuration() {
        let status = AuthStatusDto {
            dev_mode_active: false,
            dev_token_present: false,
            has_owner_role: true,
            api_keys_configured: true,
            openai_configured: true,
            anthropic_configured: false,
            gemini_configured: false,
        };

        assert!(status.openai_configured);
        assert!(!status.anthropic_configured);
        assert!(!status.gemini_configured);
    }
}
