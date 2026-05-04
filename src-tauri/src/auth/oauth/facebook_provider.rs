// TITANE_INFINITY v∞ — Proprietary License
// © 2025-2026 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   FACEBOOK OAUTH PROVIDER — PKCE Flow
//   OWASP A02: no client_secret stored in binary
//   App ID sourced from TITANE_FB_APP_ID env var at runtime
//   Redirect URI: titane://auth/callback
// ═══════════════════════════════════════════════════════════════

use crate::auth::oauth::{OAuthError, OAuthStateManager};
use log::{info, warn};
use reqwest::Client;
use serde::{Deserialize, Serialize};

const FB_AUTH_URL: &str = "https://www.facebook.com/v21.0/dialog/oauth";
const FB_TOKEN_URL: &str = "https://graph.facebook.com/v21.0/oauth/access_token";
const FB_GRAPH_ME_URL: &str = "https://graph.facebook.com/v21.0/me";
const FB_REDIRECT_URI: &str = "titane://auth/callback";
const FB_SCOPES: &str = "public_profile,email";
const FB_APP_ID_ENV: &str = "TITANE_FB_APP_ID";

/// Public profile returned after successful Facebook login.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OAuthProfile {
    pub provider: String,
    pub user_id: String,
    pub name: String,
    pub email: Option<String>,
    pub picture_url: Option<String>,
    pub access_token_stored: bool,
}

#[derive(Debug, Deserialize)]
struct FbTokenResponse {
    access_token: String,
    #[allow(dead_code)]
    token_type: Option<String>,
    #[allow(dead_code)]
    expires_in: Option<u64>,
}

#[derive(Debug, Deserialize)]
struct FbMeResponse {
    id: String,
    name: Option<String>,
    email: Option<String>,
    picture: Option<FbPicture>,
}

#[derive(Debug, Deserialize)]
struct FbPicture {
    data: Option<FbPictureData>,
}

#[derive(Debug, Deserialize)]
struct FbPictureData {
    url: Option<String>,
}

pub struct FacebookProvider;

impl FacebookProvider {
    /// Read App ID from env — never hard-coded.
    fn get_app_id() -> Result<String, OAuthError> {
        std::env::var(FB_APP_ID_ENV).map_err(|_| OAuthError::AppIdNotConfigured)
    }

    /// Build the Facebook authorization URL with PKCE challenge.
    /// Returns (auth_url, state_token) — frontend opens auth_url in system browser.
    pub fn build_auth_url() -> Result<(String, String), OAuthError> {
        let app_id = Self::get_app_id()?;
        let (state, pkce) = OAuthStateManager::start();

        let url = format!(
            "{}?client_id={}&redirect_uri={}&scope={}&state={}&code_challenge={}&code_challenge_method=S256&response_type=code",
            FB_AUTH_URL,
            urlencoding::encode(&app_id),
            urlencoding::encode(FB_REDIRECT_URI),
            urlencoding::encode(FB_SCOPES),
            urlencoding::encode(&state),
            urlencoding::encode(&pkce.challenge),
        );

        info!("[FacebookOAuth] Auth URL built for state={}", &state[..8]);
        Ok((url, state))
    }

    /// Exchange authorization code for access token, then fetch user profile.
    /// `state` is validated against the stored session (CSRF protection).
    pub async fn handle_callback(
        code: &str,
        state: &str,
    ) -> Result<OAuthProfile, OAuthError> {
        // Validate CSRF state and consume PKCE verifier
        let verifier = OAuthStateManager::consume(state)?;
        info!("[FacebookOAuth] PKCE state validated, exchanging code...");

        let app_id = Self::get_app_id()?;
        let client = Client::new();

        // Exchange code + PKCE verifier for access_token
        let params = [
            ("client_id", app_id.as_str()),
            ("redirect_uri", FB_REDIRECT_URI),
            ("code", code),
            ("code_verifier", verifier.as_str()),
        ];

        let token_resp = client
            .get(FB_TOKEN_URL)
            .query(&params)
            .send()
            .await
            .map_err(|e| OAuthError::NetworkError(e.to_string()))?;

        if !token_resp.status().is_success() {
            let body = token_resp.text().await.unwrap_or_default();
            warn!("[FacebookOAuth] Token exchange failed: {}", body);
            return Err(OAuthError::TokenExchangeFailed(body));
        }

        let token_data: FbTokenResponse = token_resp
            .json()
            .await
            .map_err(|e| OAuthError::TokenExchangeFailed(e.to_string()))?;

        info!("[FacebookOAuth] Access token obtained, fetching profile...");

        // Fetch user profile from Graph API
        let me_resp = client
            .get(FB_GRAPH_ME_URL)
            .query(&[
                ("access_token", token_data.access_token.as_str()),
                ("fields", "id,name,email,picture.type(normal)"),
            ])
            .send()
            .await
            .map_err(|e| OAuthError::NetworkError(e.to_string()))?;

        if !me_resp.status().is_success() {
            let body = me_resp.text().await.unwrap_or_default();
            return Err(OAuthError::ProfileFetchFailed(body));
        }

        let me: FbMeResponse = me_resp
            .json()
            .await
            .map_err(|e| OAuthError::ProfileFetchFailed(e.to_string()))?;

        // Store access token encrypted via SecretsEngine
        let stored = Self::store_token(&token_data.access_token, &me.id);

        let picture_url = me
            .picture
            .as_ref()
            .and_then(|p| p.data.as_ref())
            .and_then(|d| d.url.clone());

        info!(
            "[FacebookOAuth] Login successful: user_id={} name={:?}",
            me.id, me.name
        );

        Ok(OAuthProfile {
            provider: "facebook".to_string(),
            user_id: me.id,
            name: me.name.unwrap_or_else(|| "Facebook User".to_string()),
            email: me.email,
            picture_url,
            access_token_stored: stored,
        })
    }

    /// Read cached profile from SecretsEngine (if token still present).
    pub fn get_cached_profile() -> Option<OAuthProfile> {
        use crate::security::secrets_engine::SecureSecretsEngine;

        let engine = SecureSecretsEngine::new(None).ok()?;
        let token = engine.get_secret("facebook_access_token").ok()??;
        let user_id = engine
            .get_secret("facebook_user_id")
            .ok()
            .flatten()
            .unwrap_or_default();
        let name = engine
            .get_secret("facebook_user_name")
            .ok()
            .flatten()
            .unwrap_or_else(|| "Facebook User".to_string());

        if token.is_empty() {
            return None;
        }

        Some(OAuthProfile {
            provider: "facebook".to_string(),
            user_id,
            name,
            email: engine.get_secret("facebook_user_email").ok().flatten(),
            picture_url: engine.get_secret("facebook_user_picture").ok().flatten(),
            access_token_stored: true,
        })
    }

    /// Clear Facebook credentials from SecretsEngine.
    pub fn logout() {
        use crate::security::secrets_engine::SecureSecretsEngine;

        if let Ok(engine) = SecureSecretsEngine::new(None) {
            for key in &[
                "facebook_access_token",
                "facebook_user_id",
                "facebook_user_name",
                "facebook_user_email",
                "facebook_user_picture",
            ] {
                let _ = engine.clear_secret(key);
            }
        }
        OAuthStateManager::clear();
        info!("[FacebookOAuth] Logged out — credentials cleared");
    }

    /// Store access_token + user_id encrypted in SecretsEngine.
    fn store_token(token: &str, user_id: &str) -> bool {
        use crate::security::secrets_engine::SecureSecretsEngine;

        let Ok(engine) = SecureSecretsEngine::new(None) else { return false; };
        let ok1 = engine.set_secret("facebook_access_token", token.to_string()).is_ok();
        let ok2 = engine.set_secret("facebook_user_id", user_id.to_string()).is_ok();
        ok1 && ok2
    }
}

/// Parse callback URL from deep-link: titane://auth/callback?code=...&state=...
pub fn parse_callback_url(url: &str) -> Result<(String, String), OAuthError> {
    let parsed = url::Url::parse(url)
        .map_err(|e| OAuthError::InvalidCallbackUrl(e.to_string()))?;

    let mut code = None;
    let mut state = None;

    for (k, v) in parsed.query_pairs() {
        match k.as_ref() {
            "code" => code = Some(v.into_owned()),
            "state" => state = Some(v.into_owned()),
            _ => {}
        }
    }

    match (code, state) {
        (Some(c), Some(s)) => Ok((c, s)),
        _ => Err(OAuthError::InvalidCallbackUrl(
            "Missing code or state parameter".to_string(),
        )),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_callback_url_valid() {
        let url = "titane://auth/callback?code=ABC123&state=xyz789";
        let (code, state) = parse_callback_url(url).unwrap();
        assert_eq!(code, "ABC123");
        assert_eq!(state, "xyz789");
    }

    #[test]
    fn parse_callback_url_missing_code() {
        let url = "titane://auth/callback?state=xyz789";
        assert!(parse_callback_url(url).is_err());
    }

    #[test]
    fn parse_callback_url_invalid() {
        assert!(parse_callback_url("not_a_url").is_err());
    }

    #[test]
    fn build_auth_url_without_app_id_env_fails() {
        // Ensure env is not set for this test
        std::env::remove_var("TITANE_FB_APP_ID");
        let result = FacebookProvider::build_auth_url();
        assert!(result.is_err());
        matches!(result.unwrap_err(), OAuthError::AppIdNotConfigured);
    }

    #[test]
    fn build_auth_url_with_app_id_env_succeeds() {
        std::env::set_var("TITANE_FB_APP_ID", "test_app_id_12345");
        let result = FacebookProvider::build_auth_url();
        assert!(result.is_ok());
        let (url, state) = result.unwrap();
        assert!(url.contains("test_app_id_12345"), "url must include app_id");
        assert!(url.contains("titane%3A%2F%2F"), "url must include redirect");
        assert!(url.contains("code_challenge_method=S256"), "must use S256");
        assert!(!state.is_empty());
        std::env::remove_var("TITANE_FB_APP_ID");
    }
}
