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
            return Err(AuthError::RoleMissing(format!(
                "Role invalide: {}",
                role
            )));
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
