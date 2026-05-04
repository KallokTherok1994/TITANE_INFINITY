// TITANE_INFINITY v∞ — Proprietary License
// © 2025-2026 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   TITANE∞ AUTH OAUTH — Facebook PKCE Flow
//   OWASP-compliant: no client_secret in binary (PKCE only)
//   Deep-link callback: titane://auth/callback
// ═══════════════════════════════════════════════════════════════

pub mod error;
pub mod facebook_provider;
pub mod oauth_state;
pub mod pkce;

pub use error::OAuthError;
pub use facebook_provider::{FacebookProvider, OAuthProfile};
pub use oauth_state::OAuthStateManager;
pub use pkce::PkceChallenge;
