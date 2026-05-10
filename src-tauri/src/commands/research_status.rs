// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — RESEARCH STATUS COMMAND (v63 — read-only, no network)
//   Safe read-only status — zero external network calls
//   Ring 1 boundary — returns governed configuration state only
//   Used by: E2E IPC probe bridge (TITANE_E2E_PROBE flag only)
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

/// Read-only research engine status — safe for E2E probing.
/// Never triggers network requests. Returns governed configuration state.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResearchStatusResponse {
    /// Whether the research engine is available
    pub available: bool,
    /// Engine mode: governed | disabled | local_only | not_configured
    pub mode: String,
    /// Whether external network is allowed by governance policy
    pub network_allowed: bool,
    /// Whether a research provider is configured
    pub provider_configured: bool,
    /// Contract marker: always true — this command is read-only
    pub safe_read_only: bool,
    /// Optional human-readable reason for current mode
    pub reason: Option<String>,
    /// Contract version
    pub contract_version: String,
}

/// Returns the current research engine status.
/// This command is read-only and does NOT start any network call,
/// fetch any URL, or require real API keys.
#[tauri::command]
pub async fn research_get_status() -> Result<ResearchStatusResponse, String> {
    // Read-only: always returns governed status without any I/O.
    // network_allowed: false — web_research with WebLive mode requires explicit
    // governance policy. This command never enables or triggers it.
    Ok(ResearchStatusResponse {
        available: true,
        mode: "governed".to_string(),
        network_allowed: false,
        provider_configured: false,
        safe_read_only: true,
        reason: Some(
            "Research engine is available. Network access requires explicit governance policy. \
             Use web_research command with governed mode for actual queries."
                .to_string(),
        ),
        contract_version: "v63".to_string(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_research_get_status_is_readonly() {
        let result = research_get_status().await;
        assert!(result.is_ok());
        let status = result.unwrap();
        assert!(status.safe_read_only, "research_get_status must be safe_read_only=true");
        assert!(!status.network_allowed, "research_get_status must not allow network");
        assert_eq!(status.mode, "governed");
        assert_eq!(status.contract_version, "v63");
    }

    #[tokio::test]
    async fn test_research_get_status_no_network() {
        // Must complete without any network I/O
        let result = research_get_status().await;
        assert!(result.is_ok());
        let status = result.unwrap();
        assert!(!status.network_allowed);
    }
}
