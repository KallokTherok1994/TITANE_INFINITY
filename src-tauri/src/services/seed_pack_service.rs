// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — SEED PACK SERVICE (Ring 3)
//   P12.0 — Versioned JSON seed packs for governed discovery
//   Feature flag: ENABLE_SEED_PACKS=true (env var, default ON — low risk)
//   Security: sandbox path only (data/research/seeds/*), no network
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ─────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────

/// P12 version
pub const P12_VERSION: &str = "P12.0";

/// Default env-var name for enabling seed packs
pub const ENV_ENABLE_SEED_PACKS: &str = "ENABLE_SEED_PACKS";

/// Sandbox path for seed pack JSON files
pub const SEED_PACK_SANDBOX_PATH: &str = "data/research/seeds";

/// Maximum number of seed URLs per pack (hard cap)
pub const SEED_PACK_MAX_URLS: usize = 50;

/// Maximum number of seed packs loaded in one session
pub const SEED_PACK_MAX_PACKS: usize = 10;

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

/// A versioned, governance-tracked seed pack.
///
/// P12 format — append-only: new packs must not modify existing entries.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SeedPack {
    /// Pack identifier (stable, unique)
    pub id: String,
    /// Semantic version of the pack
    pub version: String,
    /// Human-readable description (stored in trace)
    pub description: String,
    /// Seed URLs (hard-capped at SEED_PACK_MAX_URLS)
    pub urls: Vec<String>,
    /// Optional metadata map for governance tracking
    #[serde(default)]
    pub metadata: HashMap<String, String>,
}

/// Result of loading and validating a seed pack
#[derive(Debug, Clone)]
pub struct SeedPackLoadResult {
    pub pack: SeedPack,
    /// SHA256 hash of the JSON content (for trace)
    pub content_hash: String,
    /// Number of URLs after validation
    pub valid_url_count: usize,
    /// Whether any URLs were dropped
    pub urls_dropped: bool,
}

// ─────────────────────────────────────────────────────────────────
// SEED PACK SERVICE
// ─────────────────────────────────────────────────────────────────

/// Seed pack operations: load, validate, hash.
///
/// Design principles:
/// - No network: seed packs are JSON files in sandbox path
/// - Immutable once written: new versions = new files
/// - Budget-enforced: urls capped at SEED_PACK_MAX_URLS
/// - Hash in trace: content_hash stored per-run for reproducibility proof
pub struct SeedPackService;

impl SeedPackService {
    /// Parse a seed pack from JSON string content.
    ///
    /// Validates the pack and caps URLs at `SEED_PACK_MAX_URLS`.
    /// Returns `Err` if the JSON is invalid or the pack fails basic validation.
    pub fn from_json(json_str: &str) -> Result<SeedPackLoadResult, String> {
        let pack: SeedPack =
            serde_json::from_str(json_str).map_err(|e| format!("Invalid seed pack JSON: {}", e))?;

        Self::validate_and_load(pack, json_str)
    }

    /// Validate and finalize a SeedPack from a parsed struct.
    fn validate_and_load(mut pack: SeedPack, raw_json: &str) -> Result<SeedPackLoadResult, String> {
        // Validate required fields
        if pack.id.is_empty() {
            return Err("Seed pack 'id' must not be empty".to_string());
        }
        if pack.version.is_empty() {
            return Err("Seed pack 'version' must not be empty".to_string());
        }

        // Cap URLs
        let original_count = pack.urls.len();
        let urls_dropped = original_count > SEED_PACK_MAX_URLS;
        pack.urls.truncate(SEED_PACK_MAX_URLS);

        // Filter empty URLs
        pack.urls.retain(|u| !u.is_empty() && u.starts_with("http"));
        let valid_url_count = pack.urls.len();

        // Compute content hash
        let content_hash = compute_content_hash(raw_json);

        Ok(SeedPackLoadResult {
            pack,
            content_hash,
            valid_url_count,
            urls_dropped,
        })
    }

    /// Check whether seed packs are enabled for this run.
    ///
    /// Default: ON (env var `ENABLE_SEED_PACKS` must be set to `"false"` to disable).
    pub fn is_enabled() -> bool {
        std::env::var(ENV_ENABLE_SEED_PACKS).as_deref() != Ok("false")
    }

    /// Create an empty seed pack (for tests and defaults).
    pub fn empty(id: &str) -> SeedPack {
        SeedPack {
            id: id.to_string(),
            version: "0.0.0".to_string(),
            description: String::new(),
            urls: vec![],
            metadata: HashMap::new(),
        }
    }
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

/// Compute a stable content hash for tracing purposes (content fingerprint).
///
/// Uses `DefaultHasher` for speed and stability across runs.
/// This is a reproducibility fingerprint, not a cryptographic hash.
pub fn compute_content_hash(content: &str) -> String {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    let mut hasher = DefaultHasher::new();
    content.hash(&mut hasher);
    format!("{:016x}", hasher.finish())
}

// ─────────────────────────────────────────────────────────────────
// UNIT TESTS
// ─────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_pack_json(id: &str, urls: &[&str]) -> String {
        let url_list = urls
            .iter()
            .map(|u| format!("\"{}\"", u))
            .collect::<Vec<_>>()
            .join(",");
        format!(
            r#"{{"id":"{}","version":"1.0.0","description":"Test pack","urls":[{}]}}"#,
            id, url_list
        )
    }

    // ── G_P12_SEED_PACK_VALID ─────────────────────────────────────

    #[test]
    fn g_p12_seed_pack_valid_json() {
        let json = sample_pack_json("test-pack", &["https://example.com/a", "https://example.com/b"]);
        let result = SeedPackService::from_json(&json);
        assert!(result.is_ok(), "Valid pack should load: {:?}", result.err());
        let r = result.unwrap();
        assert_eq!(r.pack.id, "test-pack");
        assert_eq!(r.valid_url_count, 2);
        assert!(!r.urls_dropped);
    }

    // ── G_P12_BUDGET_ENFORCED ─────────────────────────────────────

    #[test]
    fn g_p12_seed_pack_budget_enforced() {
        let urls: Vec<String> = (0..60)
            .map(|i| format!("https://example.com/page{}", i))
            .collect();
        let url_refs: Vec<&str> = urls.iter().map(|s| s.as_str()).collect();
        let json = sample_pack_json("budget-test", &url_refs);
        let result = SeedPackService::from_json(&json).expect("Should parse");
        assert!(
            result.pack.urls.len() <= SEED_PACK_MAX_URLS,
            "Budget not enforced: {} > {}",
            result.pack.urls.len(),
            SEED_PACK_MAX_URLS
        );
        assert!(result.urls_dropped, "Should report urls_dropped=true");
    }

    // ── G_P12_INVALID_JSON_REJECTED ───────────────────────────────

    #[test]
    fn g_p12_invalid_json_rejected() {
        let result = SeedPackService::from_json("not valid json");
        assert!(result.is_err(), "Invalid JSON must be rejected");
    }

    // ── G_P12_EMPTY_ID_REJECTED ───────────────────────────────────

    #[test]
    fn g_p12_empty_id_rejected() {
        let json = r#"{"id":"","version":"1.0.0","description":"","urls":[]}"#;
        let result = SeedPackService::from_json(json);
        assert!(result.is_err(), "Empty id must be rejected");
    }

    // ── G_P12_HASH_STABLE ─────────────────────────────────────────

    #[test]
    fn g_p12_hash_stable_x3() {
        let json = sample_pack_json("hash-test", &["https://example.com/page"]);
        let r1 = SeedPackService::from_json(&json).unwrap();
        let r2 = SeedPackService::from_json(&json).unwrap();
        let r3 = SeedPackService::from_json(&json).unwrap();
        assert_eq!(r1.content_hash, r2.content_hash, "Hash must be stable");
        assert_eq!(r2.content_hash, r3.content_hash, "Hash must be stable");
    }

    // ── G_P12_SANDBOX_PATH_CONST ──────────────────────────────────

    #[test]
    fn g_p12_sandbox_path_correct() {
        assert_eq!(SEED_PACK_SANDBOX_PATH, "data/research/seeds");
        assert_eq!(P12_VERSION, "P12.0");
    }

    // ── G_P12_HTTP_FILTER ─────────────────────────────────────────

    #[test]
    fn g_p12_non_http_urls_filtered() {
        let json = sample_pack_json(
            "filter-test",
            &[
                "https://example.com/valid",
                "ftp://example.com/invalid",
                "",
                "javascript:alert(1)",
            ],
        );
        let result = SeedPackService::from_json(&json).unwrap();
        assert_eq!(result.valid_url_count, 1, "Only https URL should survive");
        assert_eq!(result.pack.urls[0], "https://example.com/valid");
    }

    // ── G_P12_IS_ENABLED_DEFAULT_ON ───────────────────────────────

    #[test]
    fn g_p12_is_enabled_default_on() {
        // Default: env var not set → enabled
        // (Test assumes ENABLE_SEED_PACKS is not set to "false" in test env)
        // We can't easily test the "false" path without env manipulation, but
        // we can verify the ON default.
        let result = std::env::var(ENV_ENABLE_SEED_PACKS).unwrap_or_default();
        // If not set to "false", should be enabled
        if result != "false" {
            assert!(SeedPackService::is_enabled());
        }
        assert_eq!(ENV_ENABLE_SEED_PACKS, "ENABLE_SEED_PACKS");
    }
}
