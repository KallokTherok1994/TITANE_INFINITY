// TITANE_INFINITY v∞ — Proprietary License
// © 2025-2026 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   OAUTH STATE MANAGER — In-memory PKCE state with 5-min TTL
//   Thread-safe via parking_lot::Mutex
// ═══════════════════════════════════════════════════════════════

use crate::auth::oauth::{OAuthError, PkceChallenge};
use parking_lot::Mutex;
use std::time::{Duration, Instant};

const STATE_TTL_SECS: u64 = 300; // 5 minutes

#[derive(Debug)]
struct PendingSession {
    state_token: String,
    pkce: PkceChallenge,
    created_at: Instant,
}

impl PendingSession {
    fn is_expired(&self) -> bool {
        self.created_at.elapsed() > Duration::from_secs(STATE_TTL_SECS)
    }
}

static PENDING: Mutex<Option<PendingSession>> = Mutex::new(None);

/// Thread-safe manager for the in-flight OAuth PKCE session.
pub struct OAuthStateManager;

impl OAuthStateManager {
    /// Start a new OAuth session: generate PKCE + random state token.
    /// Replaces any existing pending session.
    pub fn start() -> (String, PkceChallenge) {
        use rand::Rng;
        let state_token: String = rand::thread_rng()
            .sample_iter(&rand::distributions::Alphanumeric)
            .take(32)
            .map(char::from)
            .collect();
        let pkce = PkceChallenge::generate();

        let mut guard = PENDING.lock();
        *guard = Some(PendingSession {
            state_token: state_token.clone(),
            pkce: pkce.clone(),
            created_at: Instant::now(),
        });

        (state_token, pkce)
    }

    /// Validate a callback state token and return the PKCE verifier if valid.
    /// Consumes the session (one-time use).
    pub fn consume(state: &str) -> Result<String, OAuthError> {
        let mut guard = PENDING.lock();
        match guard.take() {
            None => Err(OAuthError::NoActiveSession),
            Some(session) if session.is_expired() => Err(OAuthError::StateExpired),
            Some(session) if session.state_token != state => Err(OAuthError::StateMismatch),
            Some(session) => Ok(session.pkce.verifier),
        }
    }

    /// Clear any pending session (e.g., on logout).
    pub fn clear() {
        *PENDING.lock() = None;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn state_manager_start_returns_non_empty() {
        let (state, pkce) = OAuthStateManager::start();
        assert!(!state.is_empty());
        assert!(!pkce.verifier.is_empty());
    }

    #[test]
    fn state_manager_consume_valid_state() {
        let (state, _) = OAuthStateManager::start();
        let result = OAuthStateManager::consume(&state);
        assert!(result.is_ok(), "valid state should succeed");
    }

    #[test]
    fn state_manager_consume_wrong_state() {
        OAuthStateManager::start();
        let result = OAuthStateManager::consume("wrong_state_token");
        assert!(result.is_err());
    }

    #[test]
    fn state_manager_consume_is_one_time() {
        let (state, _) = OAuthStateManager::start();
        let _ = OAuthStateManager::consume(&state);
        let result = OAuthStateManager::consume(&state);
        assert!(
            result.is_err(),
            "second consume of same state should fail"
        );
    }
}
