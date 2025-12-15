// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   AUTH OS — API KEYS MANAGER
// ═══════════════════════════════════════════════════════════════

use crate::auth::{ApiKeysInput, ApiKeysOutput, AuthResult, Keystore};
use log::info;

pub struct ApiKeyManager;

impl ApiKeyManager {
    /// Sauvegarder API keys
    pub fn save_keys(input: ApiKeysInput) -> AuthResult<()> {
        let mut keystore = Keystore::load()?;

        // Mettre à jour seulement les clés fournies (non-None)
        if let Some(openai) = input.openai {
            keystore.api_keys.openai = Some(openai);
        }
        if let Some(anthropic) = input.anthropic {
            keystore.api_keys.anthropic = Some(anthropic);
        }
        if let Some(gemini) = input.gemini {
            keystore.api_keys.gemini = Some(gemini);
        }

        keystore.save()?;
        info!("✓ API Keys sauvegardées");
        Ok(())
    }

    /// Récupérer API keys (masquées)
    pub fn get_keys() -> AuthResult<ApiKeysOutput> {
        let keystore = Keystore::load()?;

        Ok(ApiKeysOutput {
            openai: keystore.api_keys.openai.as_ref().map(|k| Self::mask_key(k)),
            anthropic: keystore
                .api_keys
                .anthropic
                .as_ref()
                .map(|k| Self::mask_key(k)),
            gemini: keystore.api_keys.gemini.as_ref().map(|k| Self::mask_key(k)),
        })
    }

    /// Masquer API key (afficher seulement derniers 4 chars)
    /// Exemple: "sk-1234abcd5678efgh" → "••••efgh"
    fn mask_key(key: &str) -> String {
        if key.len() <= 4 {
            return "••••".to_string();
        }
        let last_four = &key[key.len() - 4..];
        format!("••••{}", last_four)
    }

    /// Récupérer API key complète (non masquée) pour usage interne
    /// ⚠️ ATTENTION: Utiliser seulement pour appels API, ne jamais logger
    pub fn get_raw_key(provider: &str) -> AuthResult<Option<String>> {
        let keystore = Keystore::load()?;

        let key = match provider {
            "openai" => keystore.api_keys.openai.clone(),
            "anthropic" => keystore.api_keys.anthropic.clone(),
            "gemini" => keystore.api_keys.gemini.clone(),
            _ => None,
        };

        Ok(key)
    }

    /// Supprimer une API key
    pub fn delete_key(provider: &str) -> AuthResult<()> {
        let mut keystore = Keystore::load()?;

        match provider {
            "openai" => keystore.api_keys.openai = None,
            "anthropic" => keystore.api_keys.anthropic = None,
            "gemini" => keystore.api_keys.gemini = None,
            _ => {}
        }

        keystore.save()?;
        info!("✓ API Key {} supprimée", provider);
        Ok(())
    }
}
