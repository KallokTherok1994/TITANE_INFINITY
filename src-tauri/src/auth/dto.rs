// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   AUTH OS — DTO (Data Transfer Objects)
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

/// Statut global de l'authentification
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthStatusDto {
    /// Mode développeur actif?
    pub dev_mode_active: bool,
    /// Dev token présent dans le keystore?
    pub dev_token_present: bool,
    /// User a le rôle Owner?
    pub has_owner_role: bool,
    /// Au moins une API key configurée?
    pub api_keys_configured: bool,
    /// OpenAI API key configurée?
    pub openai_configured: bool,
    /// Anthropic API key configurée?
    pub anthropic_configured: bool,
    /// Gemini API key configurée?
    pub gemini_configured: bool,
}

/// Input pour sauvegarder API keys
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiKeysInput {
    pub openai: Option<String>,
    pub anthropic: Option<String>,
    pub gemini: Option<String>,
}

/// Output pour récupérer API keys (masquées)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiKeysOutput {
    pub openai: Option<String>,    // Masqué: ••••a1b2
    pub anthropic: Option<String>, // Masqué: ••••c3d4
    pub gemini: Option<String>,    // Masqué: ••••e5f6
}

/// Role binding (user → role)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoleBinding {
    pub user: String,    // "Kevin Thibault"
    pub role: String,    // "owner" | "dev" | "user"
    pub granted_at: i64, // Unix timestamp
}

/// Dev Token complet
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DevTokenData {
    pub token: String,          // TITANE-DEV-KEY-<hex64>
    pub created_at: i64,        // Unix timestamp
    pub last_used: Option<i64>, // Unix timestamp
}
