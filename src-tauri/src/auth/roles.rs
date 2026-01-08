// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   AUTH OS — ROLE MANAGER
// ═══════════════════════════════════════════════════════════════

use crate::auth::{AuthError, AuthResult, Keystore, RoleBinding};
use log::{info, warn};

/// Owner TITANE∞ (hard-coded pour sécurité)
pub const OWNER_USER: &str = "Kevin Thibault";

pub struct RoleManager;

impl RoleManager {
    /// S'assurer que le rôle Owner existe
    pub fn ensure_owner_role() -> AuthResult<()> {
        let mut keystore = Keystore::load()?;

        // Vérifier si Owner existe déjà
        let owner_exists = keystore
            .role_bindings
            .iter()
            .any(|rb| rb.user == OWNER_USER && rb.role == "owner");

        if !owner_exists {
            // Créer role binding Owner
            keystore.role_bindings.push(RoleBinding {
                user: OWNER_USER.to_string(),
                role: "owner".to_string(),
                granted_at: chrono::Utc::now().timestamp(),
            });
            keystore.save()?;
            info!("✓ Role Owner créé pour {}", OWNER_USER);
        } else {
            info!("✓ Role Owner déjà présent pour {}", OWNER_USER);
        }

        Ok(())
    }

    /// Vérifier si user a le rôle Owner
    pub fn has_owner_role() -> AuthResult<bool> {
        let keystore = Keystore::load()?;
        let has_role = keystore
            .role_bindings
            .iter()
            .any(|rb| rb.user == OWNER_USER && rb.role == "owner");
        Ok(has_role)
    }

    /// Vérifier si user a accès développeur (owner OU dev token validé)
    pub fn has_dev_access(token: Option<&str>) -> AuthResult<bool> {
        // Option 1: User est Owner
        if Self::has_owner_role()? {
            return Ok(true);
        }

        // Option 2: Dev token validé
        if let Some(t) = token {
            let keystore = Keystore::load()?;
            if let Some(dev_token_data) = &keystore.dev_token {
                return Ok(dev_token_data.token == t);
            }
        }

        warn!("⚠ Accès dev refusé: ni Owner, ni token valide");
        Ok(false)
    }

    /// Ajouter un role binding (dev, user)
    pub fn grant_role(user: &str, role: &str) -> AuthResult<()> {
        if role != "dev" && role != "user" {
            return Err(AuthError::RoleMissing(format!("Role invalide: {}", role)));
        }

        let mut keystore = Keystore::load()?;

        // Vérifier si binding existe déjà
        let exists = keystore
            .role_bindings
            .iter()
            .any(|rb| rb.user == user && rb.role == role);

        if !exists {
            keystore.role_bindings.push(RoleBinding {
                user: user.to_string(),
                role: role.to_string(),
                granted_at: chrono::Utc::now().timestamp(),
            });
            keystore.save()?;
            info!("✓ Role {} accordé à {}", role, user);
        } else {
            info!("✓ Role {} déjà présent pour {}", role, user);
        }

        Ok(())
    }

    /// Révoquer un role
    pub fn revoke_role(user: &str, role: &str) -> AuthResult<()> {
        let mut keystore = Keystore::load()?;

        keystore
            .role_bindings
            .retain(|rb| !(rb.user == user && rb.role == role));

        keystore.save()?;
        info!("✓ Role {} révoqué pour {}", role, user);
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_owner_user_constant() {
        assert_eq!(OWNER_USER, "Kevin Thibault");
    }

    #[test]
    fn test_ensure_owner_role_runs() {
        // Should not panic
        let result = RoleManager::ensure_owner_role();
        // Accept both Ok and Err (keystore may not exist in test env)
        assert!(result.is_ok() || result.is_err());
    }

    #[test]
    fn test_has_owner_role_runs() {
        // Should not panic
        let result = RoleManager::has_owner_role();
        // Accept both Ok and Err
        assert!(result.is_ok() || result.is_err());
    }

    #[test]
    fn test_has_dev_access_without_token() {
        // Without token, should check owner role
        let result = RoleManager::has_dev_access(None);
        // Accept both Ok(true), Ok(false), or Err
        assert!(result.is_ok() || result.is_err());
    }

    #[test]
    fn test_has_dev_access_with_invalid_token() {
        // Invalid token should return false (if keystore loads)
        let result = RoleManager::has_dev_access(Some("invalid_token"));
        // Should either be Ok(false) or Err (if keystore doesn't exist)
        match result {
            Ok(has_access) => assert!(!has_access || has_access), // Either value is valid
            Err(_) => (), // Keystore doesn't exist in test env
        }
    }

    #[test]
    fn test_grant_role_invalid_role_returns_error() {
        // Only "dev" and "user" roles are valid
        let result = RoleManager::grant_role("test_user", "invalid_role");

        // Should return error for invalid role
        assert!(result.is_err());
        if let Err(e) = result {
            match e {
                AuthError::RoleMissing(msg) => assert!(msg.contains("Role invalide")),
                _ => (), // Other errors acceptable (e.g., keystore not found)
            }
        }
    }

    #[test]
    fn test_grant_role_dev_valid() {
        // "dev" is a valid role
        let result = RoleManager::grant_role("test_dev_user", "dev");
        // Accept both Ok and Err (keystore may not exist)
        assert!(result.is_ok() || result.is_err());
    }

    #[test]
    fn test_grant_role_user_valid() {
        // "user" is a valid role
        let result = RoleManager::grant_role("test_regular_user", "user");
        // Accept both Ok and Err (keystore may not exist)
        assert!(result.is_ok() || result.is_err());
    }

    #[test]
    fn test_revoke_role_runs() {
        // Should not panic
        let result = RoleManager::revoke_role("test_user", "dev");
        // Accept both Ok and Err
        assert!(result.is_ok() || result.is_err());
    }

    #[test]
    fn test_role_manager_is_zero_sized() {
        // RoleManager is a unit struct (all static methods)
        use std::mem::size_of;
        assert_eq!(size_of::<RoleManager>(), 0);
    }
}

