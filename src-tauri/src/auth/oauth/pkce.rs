// TITANE_INFINITY v∞ — Proprietary License
// © 2025-2026 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   PKCE — OWASP-compliant code_verifier + code_challenge
//   RFC 7636: SHA-256 base64url, no padding
// ═══════════════════════════════════════════════════════════════

use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
use rand::RngCore;
use sha2::{Digest, Sha256};

/// PKCE code verifier (random 32-byte base64url) + computed challenge.
#[derive(Debug, Clone)]
pub struct PkceChallenge {
    pub verifier: String,
    pub challenge: String,
}

impl PkceChallenge {
    /// Generate a fresh PKCE pair (RFC 7636 §4.1–4.2).
    pub fn generate() -> Self {
        let mut bytes = [0u8; 32];
        rand::thread_rng().fill_bytes(&mut bytes);
        let verifier = URL_SAFE_NO_PAD.encode(bytes);

        let mut hasher = Sha256::new();
        hasher.update(verifier.as_bytes());
        let hash = hasher.finalize();
        let challenge = URL_SAFE_NO_PAD.encode(hash);

        Self { verifier, challenge }
    }

    /// Verify that a given code_verifier matches this challenge.
    pub fn verify(&self, verifier: &str) -> bool {
        let mut hasher = Sha256::new();
        hasher.update(verifier.as_bytes());
        let hash = hasher.finalize();
        URL_SAFE_NO_PAD.encode(hash) == self.challenge
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn pkce_generate_produces_non_empty_pair() {
        let pkce = PkceChallenge::generate();
        assert!(!pkce.verifier.is_empty(), "verifier should not be empty");
        assert!(!pkce.challenge.is_empty(), "challenge should not be empty");
        assert_ne!(
            pkce.verifier, pkce.challenge,
            "verifier and challenge must differ"
        );
    }

    #[test]
    fn pkce_verify_correct_verifier() {
        let pkce = PkceChallenge::generate();
        assert!(
            pkce.verify(&pkce.verifier.clone()),
            "correct verifier should pass"
        );
    }

    #[test]
    fn pkce_verify_wrong_verifier() {
        let pkce = PkceChallenge::generate();
        assert!(
            !pkce.verify("wrong_verifier"),
            "wrong verifier should fail"
        );
    }

    #[test]
    fn pkce_each_generation_is_unique() {
        let a = PkceChallenge::generate();
        let b = PkceChallenge::generate();
        assert_ne!(a.verifier, b.verifier, "each PKCE must be unique");
    }
}
