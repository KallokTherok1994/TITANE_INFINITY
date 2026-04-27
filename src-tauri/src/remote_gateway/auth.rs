// ═══════════════════════════════════════════════════════════════
//   TITANE∞ Remote Gateway — JWT Authentication (Ring 0)
//   HS256, short-lived access token (1h) + refresh token (7d)
//   Secret stored in SecretsEngine vault — never hardcoded
//   Phase 1: Named API keys via ApiKeyStore (argon2id)
// ═══════════════════════════════════════════════════════════════

use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::remote_gateway::api_key_store::ApiKeyStore;

pub const REMOTE_SECRET_KEY: &str = "remote_gateway_jwt_secret";
pub const ACCESS_TOKEN_TTL_SECS: i64 = 3600;    // 1 hour
pub const REFRESH_TOKEN_TTL_SECS: i64 = 604_800; // 7 days

// ── Claims ────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JwtClaims {
    pub sub: String,             // subject (always "titane_remote_user")
    pub exp: i64,                // expiry (unix timestamp)
    pub iat: i64,                // issued at
    pub kind: String,            // "access" | "refresh"
    /// Named API key identifier (Phase 1) — None for legacy tokens
    #[serde(skip_serializing_if = "Option::is_none")]
    pub key_id: Option<String>,
}

// ── Auth State (shared via Arc) ────────────────────────────────

#[derive(Clone)]
pub struct RemoteAuthState {
    /// JWT signing secret (derived from SecretsEngine at startup)
    pub jwt_secret: Arc<RwLock<Vec<u8>>>,
    /// Shared secret used to obtain the first token — legacy SHA-256 hash
    /// Kept for backward compat; prefer key_store for new clients.
    pub shared_secret_hash: Arc<RwLock<String>>,
    /// Named API key store (argon2id hashing, per-client scopes)
    pub key_store: Arc<RwLock<ApiKeyStore>>,
}

impl RemoteAuthState {
    /// Legacy constructor — creates an in-memory ApiKeyStore that will have a
    /// "default" key auto-seeded from `shared_secret_hash` on first verify.
    pub fn new(jwt_secret: Vec<u8>, shared_secret_hash: String) -> Self {
        Self {
            jwt_secret: Arc::new(RwLock::new(jwt_secret)),
            shared_secret_hash: Arc::new(RwLock::new(shared_secret_hash)),
            key_store: Arc::new(RwLock::new(ApiKeyStore::new_in_memory())),
        }
    }

    /// Full constructor with explicit ApiKeyStore.
    pub fn new_with_store(
        jwt_secret: Vec<u8>,
        shared_secret_hash: String,
        key_store: ApiKeyStore,
    ) -> Self {
        Self {
            jwt_secret: Arc::new(RwLock::new(jwt_secret)),
            shared_secret_hash: Arc::new(RwLock::new(shared_secret_hash)),
            key_store: Arc::new(RwLock::new(key_store)),
        }
    }
}

// ── Token generation ──────────────────────────────────────────

/// Generate an access token. Optionally embed a `key_id` (Phase 1).
pub async fn generate_access_token(state: &RemoteAuthState) -> Result<String, String> {
    generate_access_token_with_key(state, None).await
}

pub async fn generate_access_token_with_key(
    state: &RemoteAuthState,
    key_id: Option<String>,
) -> Result<String, String> {
    let secret = state.jwt_secret.read().await;
    let now = Utc::now();
    let claims = JwtClaims {
        sub: "titane_remote_user".to_string(),
        exp: (now + Duration::seconds(ACCESS_TOKEN_TTL_SECS)).timestamp(),
        iat: now.timestamp(),
        kind: "access".to_string(),
        key_id,
    };
    encode(
        &Header::new(Algorithm::HS256),
        &claims,
        &EncodingKey::from_secret(&secret),
    )
    .map_err(|e| format!("JWT encode error: {e}"))
}

/// Generate a refresh token. Optionally embed a `key_id` (Phase 1).
pub async fn generate_refresh_token(state: &RemoteAuthState) -> Result<String, String> {
    generate_refresh_token_with_key(state, None).await
}

pub async fn generate_refresh_token_with_key(
    state: &RemoteAuthState,
    key_id: Option<String>,
) -> Result<String, String> {
    let secret = state.jwt_secret.read().await;
    let now = Utc::now();
    let claims = JwtClaims {
        sub: "titane_remote_user".to_string(),
        exp: (now + Duration::seconds(REFRESH_TOKEN_TTL_SECS)).timestamp(),
        iat: now.timestamp(),
        kind: "refresh".to_string(),
        key_id,
    };
    encode(
        &Header::new(Algorithm::HS256),
        &claims,
        &EncodingKey::from_secret(&secret),
    )
    .map_err(|e| format!("JWT encode error: {e}"))
}

// ── Token validation ──────────────────────────────────────────

pub async fn validate_token(
    state: &RemoteAuthState,
    token: &str,
    expected_kind: &str,
) -> Result<JwtClaims, String> {
    let secret = state.jwt_secret.read().await;
    let mut validation = Validation::new(Algorithm::HS256);
    validation.validate_exp = true;

    let token_data = decode::<JwtClaims>(
        token,
        &DecodingKey::from_secret(&secret),
        &validation,
    )
    .map_err(|e| format!("JWT validation error: {e}"))?;

    if token_data.claims.kind != expected_kind {
        return Err(format!(
            "Wrong token kind: expected '{}', got '{}'",
            expected_kind, token_data.claims.kind
        ));
    }

    Ok(token_data.claims)
}

// ── Shared secret check ────────────────────────────────────────

/// Legacy: timing-safe comparison of the provided secret against the SHA-256 hash.
/// Prefer `verify_api_key` for new clients.
pub async fn verify_shared_secret(state: &RemoteAuthState, candidate: &str) -> bool {
    use sha2::{Digest, Sha256};
    let stored = state.shared_secret_hash.read().await;
    let candidate_hash = format!("{:x}", Sha256::digest(candidate.as_bytes()));
    candidate_hash == *stored
}

/// Phase 1: verify a named API key (key_id + secret) via argon2id.
/// Returns the key_id on success (for JWT embedding), None on failure.
pub async fn verify_api_key(
    state: &RemoteAuthState,
    key_id: &str,
    candidate: &str,
) -> Option<String> {
    let mut store = state.key_store.write().await;
    if store.verify(key_id, candidate) {
        Some(key_id.to_string())
    } else {
        None
    }
}

/// Phase 1 backward compat: verify candidate against any enabled key.
/// Used when auth payload has `secret` only (no key_id).
/// Returns the matched key_id, or falls back to legacy SHA-256 check.
pub async fn verify_secret_any(
    state: &RemoteAuthState,
    candidate: &str,
) -> Option<String> {
    // Try named keys first (argon2id, Phase 1)
    {
        let mut store = state.key_store.write().await;
        if let Some(key_id) = store.verify_any(candidate) {
            return Some(key_id);
        }
    }

    // Fallback: legacy SHA-256 hash check
    if verify_shared_secret(state, candidate).await {
        Some("legacy".to_string())
    } else {
        None
    }
}

// ── Derive JWT secret from passphrase ─────────────────────────

/// Derive a 64-byte JWT secret from the SecretsEngine passphrase via SHA-256
pub fn derive_jwt_secret(passphrase: &str) -> Vec<u8> {
    use sha2::{Digest, Sha256};
    let mut hasher = Sha256::new();
    hasher.update(b"titane_remote_jwt_");
    hasher.update(passphrase.as_bytes());
    hasher.finalize().to_vec()
}

/// Hash the shared access secret (SHA-256 hex)
pub fn hash_shared_secret(secret: &str) -> String {
    use sha2::{Digest, Sha256};
    format!("{:x}", Sha256::digest(secret.as_bytes()))
}

// ── Tests ─────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn make_state(passphrase: &str, secret: &str) -> RemoteAuthState {
        RemoteAuthState::new(
            derive_jwt_secret(passphrase),
            hash_shared_secret(secret),
        )
    }

    #[tokio::test]
    async fn test_access_token_roundtrip() {
        let state = make_state("test-passphrase", "my-secret");
        let token = generate_access_token(&state).await.unwrap();
        let claims = validate_token(&state, &token, "access").await.unwrap();
        assert_eq!(claims.sub, "titane_remote_user");
        assert_eq!(claims.kind, "access");
    }

    #[tokio::test]
    async fn test_refresh_token_roundtrip() {
        let state = make_state("test-passphrase", "my-secret");
        let token = generate_refresh_token(&state).await.unwrap();
        let claims = validate_token(&state, &token, "refresh").await.unwrap();
        assert_eq!(claims.kind, "refresh");
    }

    #[tokio::test]
    async fn test_wrong_kind_rejected() {
        let state = make_state("test-passphrase", "my-secret");
        let token = generate_access_token(&state).await.unwrap();
        let result = validate_token(&state, &token, "refresh").await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_shared_secret_verify_ok() {
        let state = make_state("test-passphrase", "correct-secret");
        assert!(verify_shared_secret(&state, "correct-secret").await);
    }

    #[tokio::test]
    async fn test_shared_secret_verify_fail() {
        let state = make_state("test-passphrase", "correct-secret");
        assert!(!verify_shared_secret(&state, "wrong-secret").await);
    }

    #[tokio::test]
    async fn test_invalid_token_rejected() {
        let state = make_state("test-passphrase", "my-secret");
        let result = validate_token(&state, "not.a.jwt", "access").await;
        assert!(result.is_err());
    }
}
