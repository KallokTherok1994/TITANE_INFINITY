// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   AUTH OS — DEV TOKEN MANAGER
// ═══════════════════════════════════════════════════════════════

use crate::auth::{AuthResult, DevTokenData, Keystore};
use log::{info, warn};
use rand::Rng;

pub struct DevTokenManager;

impl DevTokenManager {
    /// Générer un nouveau dev token
    /// Format: TITANE-DEV-KEY-<64 hex chars>
    pub fn generate() -> String {
        let mut rng = rand::thread_rng();
        let random_bytes: Vec<u8> = (0..32).map(|_| rng.gen()).collect();
        let hex_str = random_bytes
            .iter()
            .map(|b| format!("{:02x}", b))
            .collect::<String>();
        format!("TITANE-DEV-KEY-{}", hex_str)
    }

    /// Obtenir ou créer dev token
    pub fn get_or_create() -> AuthResult<String> {
        let mut keystore = Keystore::load()?;

        // Si token existe déjà, le retourner
        if let Some(token_data) = &keystore.dev_token {
            info!("✓ Dev Token existant récupéré");
            return Ok(token_data.token.clone());
        }

        // Sinon, créer nouveau token
        let token = Self::generate();
        let now = chrono::Utc::now().timestamp();

        keystore.dev_token = Some(DevTokenData {
            token: token.clone(),
            created_at: now,
            last_used: None,
        });

        keystore.save()?;
        info!("✓ Nouveau Dev Token généré et sauvegardé");
        Ok(token)
    }

    /// Valider dev token
    pub fn validate(input: &str) -> AuthResult<bool> {
        let keystore = Keystore::load()?;

        match &keystore.dev_token {
            Some(token_data) => {
                let is_valid = token_data.token == input;

                if is_valid {
                    // Mettre à jour last_used
                    let mut keystore = keystore;
                    if let Some(ref mut token) = keystore.dev_token {
                        token.last_used = Some(chrono::Utc::now().timestamp());
                    }
                    keystore.save()?;
                    info!("✓ Dev Token validé avec succès");
                } else {
                    warn!("⚠ Dev Token invalide");
                }

                Ok(is_valid)
            }
            None => {
                warn!("⚠ Aucun Dev Token configuré");
                Ok(false)
            }
        }
    }

    /// Révoquer dev token (supprimer du keystore)
    pub fn revoke() -> AuthResult<()> {
        let mut keystore = Keystore::load()?;
        keystore.dev_token = None;
        keystore.save()?;
        info!("✓ Dev Token révoqué");
        Ok(())
    }

    /// Vérifier si dev token existe
    pub fn exists() -> AuthResult<bool> {
        let keystore = Keystore::load()?;
        Ok(keystore.dev_token.is_some())
    }
}
