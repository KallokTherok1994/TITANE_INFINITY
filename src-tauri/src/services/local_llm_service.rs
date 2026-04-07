// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — LOCAL LLM SERVICE (Ring 3)
//   P10.0 — Hook interface (BLOCKED: no native LLM infra)
//   Strategy: NONE (extractive fallback always used)
//   Feature flag: ENABLE_LOCAL_LLM=false (env var, default OFF)
//   Security: zero network, zero disk writes, no external provider
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────

/// Compile-time default — always false until real provider ships
pub const ENABLE_LOCAL_LLM: bool = false;

/// Strategy name for this Ring
pub const LOCAL_LLM_MODE: &str = "NONE";

/// Phase version
pub const P10_VERSION: &str = "P10.0";

// ─────────────────────────────────────────────────────────────────
// TRAIT
// ─────────────────────────────────────────────────────────────────

/// Hook interface for a local (on-device) LLM provider.
///
/// All implementations are evidence-bound: `generate_evidence_bound`
/// receives the query AND the supporting passages — no generation
/// is permitted beyond what is grounded in the supplied passages.
///
/// P10.0 only ships `NullLlmProvider`; real providers are gated
/// behind `ENABLE_LOCAL_LLM=true` (env) AND `is_available() == true`.
pub trait LocalLlmProvider: Send + Sync {
    /// Human-readable mode identifier (e.g. `"NONE"`, `"LLAMA3"`)
    fn mode(&self) -> &'static str;

    /// Whether this provider can actually serve requests right now
    fn is_available(&self) -> bool;

    /// Attempt evidence-bound generation.
    ///
    /// - Returns `None` when the provider is unavailable or blocked.
    /// - The implementation MUST NOT introduce content not present in
    ///   `passages` (no hallucination).
    fn generate_evidence_bound(&self, query: &str, passages: &[&str]) -> Option<String>;
}

// ─────────────────────────────────────────────────────────────────
// NULL PROVIDER (P10.0 — always used)
// ─────────────────────────────────────────────────────────────────

/// No-op provider. Always returns `None`; never performs any I/O.
pub struct NullLlmProvider;

impl LocalLlmProvider for NullLlmProvider {
    fn mode(&self) -> &'static str {
        "NONE"
    }

    fn is_available(&self) -> bool {
        false
    }

    fn generate_evidence_bound(&self, _query: &str, _passages: &[&str]) -> Option<String> {
        None
    }
}

// ─────────────────────────────────────────────────────────────────
// FACTORY
// ─────────────────────────────────────────────────────────────────

/// Return the active provider.
///
/// P10.0: always `NullLlmProvider`.
/// Future phases will match on an env/config selector here.
pub fn get_provider() -> Box<dyn LocalLlmProvider> {
    Box::new(NullLlmProvider)
}

// ─────────────────────────────────────────────────────────────────
// FEATURE FLAG
// ─────────────────────────────────────────────────────────────────

/// Whether the local LLM hook is active for this run.
///
/// Rules (both conditions must hold):
/// 1. Env var `ENABLE_LOCAL_LLM` is set to exactly `"true"`
/// 2. The selected provider reports `is_available() == true`
///
/// In P10.0 this always returns `false` because `NullLlmProvider`
/// is never available, regardless of the env var.
pub fn is_enabled() -> bool {
    let flag_set = std::env::var("ENABLE_LOCAL_LLM").as_deref() == Ok("true");
    if !flag_set {
        return false;
    }
    get_provider().is_available()
}

// ─────────────────────────────────────────────────────────────────
// UNIT TESTS
// ─────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_null_provider_not_available() {
        let provider = NullLlmProvider;
        assert!(
            !provider.is_available(),
            "NullLlmProvider must always report unavailable"
        );
        assert_eq!(provider.mode(), "NONE");
    }

    #[test]
    fn test_null_provider_returns_none() {
        let provider = NullLlmProvider;
        let result = provider.generate_evidence_bound(
            "what is TITANE?",
            &["TITANE is a research engine", "It runs locally"],
        );
        assert!(
            result.is_none(),
            "NullLlmProvider must return None — no generation"
        );
    }

    #[test]
    fn test_is_enabled_default_false() {
        // Even if caller somehow sets the var, NullLlmProvider is not available.
        // We test the default (env var absent) path here.
        let result = is_enabled();
        assert!(
            !result,
            "is_enabled() must return false in P10.0 (NullLlmProvider)"
        );
    }

    #[test]
    fn test_get_provider_returns_null() {
        let p = get_provider();
        assert_eq!(p.mode(), "NONE");
        assert!(!p.is_available());
    }

    #[test]
    fn test_constants() {
        // Default-off behavior is proven via is_available() test above.
        assert_eq!(LOCAL_LLM_MODE, "NONE");
        assert_eq!(P10_VERSION, "P10.0");
    }
}
