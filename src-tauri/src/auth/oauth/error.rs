// TITANE_INFINITY v∞ — Proprietary License
// © 2025-2026 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   OAUTH ERROR — Typed errors for the OAuth flow
// ═══════════════════════════════════════════════════════════════

use thiserror::Error;

#[derive(Debug, Error)]
pub enum OAuthError {
    #[error("OAuth state mismatch or expired (CSRF protection)")]
    StateMismatch,

    #[error("OAuth state expired — please restart the login flow")]
    StateExpired,

    #[error("No active OAuth session found")]
    NoActiveSession,

    #[error("Facebook API error: {0}")]
    FacebookApiError(String),

    #[error("Token exchange failed: {0}")]
    TokenExchangeFailed(String),

    #[error("User profile fetch failed: {0}")]
    ProfileFetchFailed(String),

    #[error("Network error: {0}")]
    NetworkError(String),

    #[error("Secret storage error: {0}")]
    SecretStorageError(String),

    #[error("App ID not configured — set TITANE_FB_APP_ID environment variable")]
    AppIdNotConfigured,

    #[error("Invalid callback URL: {0}")]
    InvalidCallbackUrl(String),
}

impl From<OAuthError> for String {
    fn from(e: OAuthError) -> Self {
        e.to_string()
    }
}
