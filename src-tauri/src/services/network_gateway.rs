// ═══════════════════════════════════════════════════════════════
// TITANE∞ — Conversation OS v1 — NetworkGatewayService (Ring 3)
// Governed network access with allowlist, budgets, timeouts.
//
// Rule 5 (One Door): this is the ONLY file allowed to use reqwest
// directly. All Tauri commands must import build_client() from here.
// ═══════════════════════════════════════════════════════════════

use crate::core::http_types::{Client, Policy};
use crate::services::network_policy::{check_domain, extract_domain, AppliedPolicy, PolicyError};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::time::Duration;
use tokio::sync::Mutex;

// ─────────────────────────────────────────────────────────────────
// One Door helpers — used by Tauri commands that need a plain
// reqwest::Client without the full NetworkGatewayService overhead.
// ─────────────────────────────────────────────────────────────────

const DEFAULT_USER_AGENT: &str = "TITANE-infinity/31";

/// Build a governed HTTP client with the given timeout.
///
/// This is the canonical entry point for constructing an HTTP client
/// in Tauri commands (One Door, Rule 5).  All commands MUST call this
/// instead of using `reqwest::Client::builder()` directly.
pub fn build_client(timeout: Duration) -> Result<Client, String> {
    Client::builder()
        .timeout(timeout)
        .user_agent(DEFAULT_USER_AGENT)
        .build()
        .map_err(|e| format!("[NetworkGateway] Failed to build HTTP client: {e}"))
}

/// Build a governed HTTP client with a custom user-agent string.
///
/// Used for scraping fallbacks that require a browser-like user-agent.
pub fn build_client_with_user_agent(timeout: Duration, user_agent: &str) -> Result<Client, String> {
    Client::builder()
        .timeout(timeout)
        .user_agent(user_agent)
        .build()
        .map_err(|e| format!("[NetworkGateway] Failed to build HTTP client: {e}"))
}

#[derive(Debug, Clone)]
pub struct NetworkGatewayConfig {
    pub timeout_ms: u64,
    pub max_requests: u32,
    pub max_bytes_total: u64,
    pub domain_allowlist: Vec<String>,
    pub domain_denylist: Vec<String>,
}

impl Default for NetworkGatewayConfig {
    fn default() -> Self {
        Self {
            timeout_ms: 15_000,
            max_requests: 20,
            max_bytes_total: 5 * 1024 * 1024,
            domain_allowlist: vec![],
            domain_denylist: vec![],
        }
    }
}

#[derive(Debug)]
pub enum NetworkGatewayError {
    PolicyViolation(PolicyError),
    RequestBudgetExceeded(String),
    ByteBudgetExceeded(String),
    NetworkError(String),
    SerializationError(String),
}

impl std::fmt::Display for NetworkGatewayError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            NetworkGatewayError::PolicyViolation(err) => write!(f, "PolicyViolation: {}", err),
            NetworkGatewayError::RequestBudgetExceeded(msg) => {
                write!(f, "RequestBudgetExceeded: {}", msg)
            }
            NetworkGatewayError::ByteBudgetExceeded(msg) => {
                write!(f, "ByteBudgetExceeded: {}", msg)
            }
            NetworkGatewayError::NetworkError(msg) => write!(f, "NetworkError: {}", msg),
            NetworkGatewayError::SerializationError(msg) => {
                write!(f, "SerializationError: {}", msg)
            }
        }
    }
}

impl From<PolicyError> for NetworkGatewayError {
    fn from(value: PolicyError) -> Self {
        Self::PolicyViolation(value)
    }
}

#[derive(Debug, Default)]
struct GatewayRuntime {
    requests_used: u32,
    bytes_used: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkMeta {
    pub url: String,
    pub domain: Option<String>,
    pub method: String,
    pub status_code: u16,
    pub latency_ms: u128,
    pub response_bytes: usize,
    pub requests_used: u32,
    pub bytes_used: u64,
    pub max_requests: u32,
    pub max_bytes_total: u64,
    pub budget_remaining_requests: u32,
    pub budget_remaining_bytes: u64,
}

pub struct NetworkGatewayService {
    client: Client,
    policy: AppliedPolicy,
    runtime: Mutex<GatewayRuntime>,
}

impl NetworkGatewayService {
    pub fn new(config: NetworkGatewayConfig) -> Self {
        let timeout = Duration::from_millis(config.timeout_ms);
        let client = Client::builder()
            .timeout(timeout)
            .redirect(Policy::limited(5))
            .build()
            .unwrap_or_else(|_| Client::new());

        let mut budgets = HashMap::new();
        budgets.insert("max_requests".to_string(), config.max_requests as f64);
        budgets.insert("max_bytes_total".to_string(), config.max_bytes_total as f64);
        budgets.insert("timeout_ms".to_string(), config.timeout_ms as f64);

        let policy = AppliedPolicy {
            policy_applied: true,
            max_requests: config.max_requests,
            max_bytes_total: config.max_bytes_total,
            timeout_ms: config.timeout_ms,
            domain_allowlist: config.domain_allowlist,
            domain_denylist: config.domain_denylist,
            budgets,
        };

        Self {
            client,
            policy,
            runtime: Mutex::new(GatewayRuntime::default()),
        }
    }

    pub fn policy(&self) -> &AppliedPolicy {
        &self.policy
    }

    async fn preflight(&self, url: &str) -> Result<(), NetworkGatewayError> {
        if !url.starts_with("http://") && !url.starts_with("https://") {
            return Err(NetworkGatewayError::PolicyViolation(PolicyError {
                code: "SCHEME_NOT_ALLOWED".to_string(),
                message: format!("URL '{}' must use http(s)", url),
            }));
        }

        check_domain(url, &self.policy)?;

        let runtime = self.runtime.lock().await;
        if runtime.requests_used >= self.policy.max_requests {
            return Err(NetworkGatewayError::RequestBudgetExceeded(format!(
                "max_requests reached: {}",
                self.policy.max_requests
            )));
        }

        if runtime.bytes_used >= self.policy.max_bytes_total {
            return Err(NetworkGatewayError::ByteBudgetExceeded(format!(
                "max_bytes_total reached: {}",
                self.policy.max_bytes_total
            )));
        }

        Ok(())
    }

    async fn postflight(&self, bytes: usize) -> Result<(), NetworkGatewayError> {
        let mut runtime = self.runtime.lock().await;
        runtime.requests_used = runtime.requests_used.saturating_add(1);
        runtime.bytes_used = runtime.bytes_used.saturating_add(bytes as u64);

        if runtime.bytes_used > self.policy.max_bytes_total {
            return Err(NetworkGatewayError::ByteBudgetExceeded(format!(
                "byte budget exceeded after request: used={} limit={}",
                runtime.bytes_used, self.policy.max_bytes_total
            )));
        }

        Ok(())
    }

    #[allow(clippy::too_many_arguments)]
    fn build_network_meta(
        &self,
        url: &str,
        method: &str,
        status_code: u16,
        latency_ms: u128,
        response_bytes: usize,
        requests_used: u32,
        bytes_used: u64,
    ) -> NetworkMeta {
        NetworkMeta {
            url: url.to_string(),
            domain: extract_domain(url),
            method: method.to_string(),
            status_code,
            latency_ms,
            response_bytes,
            requests_used,
            bytes_used,
            max_requests: self.policy.max_requests,
            max_bytes_total: self.policy.max_bytes_total,
            budget_remaining_requests: self.policy.max_requests.saturating_sub(requests_used),
            budget_remaining_bytes: self.policy.max_bytes_total.saturating_sub(bytes_used),
        }
    }

    async fn runtime_snapshot(&self) -> (u32, u64) {
        let runtime = self.runtime.lock().await;
        (runtime.requests_used, runtime.bytes_used)
    }

    pub async fn get_text(&self, url: &str) -> Result<String, NetworkGatewayError> {
        self.preflight(url).await?;
        let response = self
            .client
            .get(url)
            .send()
            .await
            .map_err(|err| NetworkGatewayError::NetworkError(err.to_string()))?;

        let body = response
            .bytes()
            .await
            .map_err(|err| NetworkGatewayError::NetworkError(err.to_string()))?;

        self.postflight(body.len()).await?;

        Ok(String::from_utf8_lossy(&body).to_string())
    }

    pub async fn head_status(&self, url: &str) -> Result<u16, NetworkGatewayError> {
        self.preflight(url).await?;

        let response = self
            .client
            .head(url)
            .send()
            .await
            .map_err(|err| NetworkGatewayError::NetworkError(err.to_string()))?;

        self.postflight(0).await?;

        Ok(response.status().as_u16())
    }

    pub async fn get_json(&self, url: &str) -> Result<Value, NetworkGatewayError> {
        let text = self.get_text(url).await?;
        serde_json::from_str(&text)
            .map_err(|err| NetworkGatewayError::SerializationError(err.to_string()))
    }

    pub async fn get_json_with_headers(
        &self,
        url: &str,
        headers: Vec<(String, String)>,
    ) -> Result<Value, NetworkGatewayError> {
        let (json, _) = self.get_json_with_headers_and_meta(url, headers).await?;
        Ok(json)
    }

    pub async fn get_json_with_headers_and_meta(
        &self,
        url: &str,
        headers: Vec<(String, String)>,
    ) -> Result<(Value, NetworkMeta), NetworkGatewayError> {
        self.preflight(url).await?;

        let started = std::time::Instant::now();

        let mut request = self.client.get(url);
        for (key, value) in headers {
            request = request.header(key, value);
        }

        let response = request
            .send()
            .await
            .map_err(|err| NetworkGatewayError::NetworkError(err.to_string()))?;

        let status_code = response.status().as_u16();

        let body = response
            .bytes()
            .await
            .map_err(|err| NetworkGatewayError::NetworkError(err.to_string()))?;

        self.postflight(body.len()).await?;

        let json = serde_json::from_slice(&body)
            .map_err(|err| NetworkGatewayError::SerializationError(err.to_string()))?;

        let (requests_used, bytes_used) = self.runtime_snapshot().await;
        let meta = self.build_network_meta(
            url,
            "GET",
            status_code,
            started.elapsed().as_millis(),
            body.len(),
            requests_used,
            bytes_used,
        );

        Ok((json, meta))
    }

    pub async fn post_json(
        &self,
        url: &str,
        payload: &Value,
        headers: Vec<(String, String)>,
    ) -> Result<Value, NetworkGatewayError> {
        let (json, _) = self.post_json_with_meta(url, payload, headers).await?;
        Ok(json)
    }

    pub async fn post_json_with_meta(
        &self,
        url: &str,
        payload: &Value,
        headers: Vec<(String, String)>,
    ) -> Result<(Value, NetworkMeta), NetworkGatewayError> {
        self.preflight(url).await?;

        let started = std::time::Instant::now();

        let mut request = self.client.post(url).json(payload);
        for (key, value) in headers {
            request = request.header(key, value);
        }

        let response = request
            .send()
            .await
            .map_err(|err| NetworkGatewayError::NetworkError(err.to_string()))?;

        let status_code = response.status().as_u16();

        let body = response
            .bytes()
            .await
            .map_err(|err| NetworkGatewayError::NetworkError(err.to_string()))?;

        self.postflight(body.len()).await?;

        let json = serde_json::from_slice(&body)
            .map_err(|err| NetworkGatewayError::SerializationError(err.to_string()))?;

        let (requests_used, bytes_used) = self.runtime_snapshot().await;
        let meta = self.build_network_meta(
            url,
            "POST",
            status_code,
            started.elapsed().as_millis(),
            body.len(),
            requests_used,
            bytes_used,
        );

        Ok((json, meta))
    }

    pub async fn telemetry(&self) -> HashMap<String, String> {
        let runtime = self.runtime.lock().await;
        let mut map = HashMap::new();
        map.insert(
            "requests_used".to_string(),
            runtime.requests_used.to_string(),
        );
        map.insert("bytes_used".to_string(), runtime.bytes_used.to_string());
        map.insert(
            "max_requests".to_string(),
            self.policy.max_requests.to_string(),
        );
        map.insert(
            "max_bytes_total".to_string(),
            self.policy.max_bytes_total.to_string(),
        );
        map
    }

    pub fn default_governed() -> Self {
        Self::new(NetworkGatewayConfig {
            domain_allowlist: vec![
                "localhost".to_string(),
                "127.0.0.1".to_string(),
                "api.search.brave.com".to_string(),
                "duckduckgo.com".to_string(),
                "html.duckduckgo.com".to_string(),
            ],
            domain_denylist: vec![],
            ..NetworkGatewayConfig::default()
        })
    }

    pub fn domain_of(url: &str) -> Option<String> {
        extract_domain(url)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_scheme_rejected() {
        let gateway = NetworkGatewayService::new(NetworkGatewayConfig::default());
        let result = gateway.get_text("file:///tmp/nope").await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_allowlist_blocks_unknown_domain() {
        let gateway = NetworkGatewayService::new(NetworkGatewayConfig {
            domain_allowlist: vec!["example.com".to_string()],
            ..NetworkGatewayConfig::default()
        });
        let result = gateway.get_text("https://not-example.com/").await;
        assert!(result.is_err());
    }

    #[test]
    fn test_domain_of() {
        assert_eq!(
            NetworkGatewayService::domain_of("https://api.search.brave.com/res/v1"),
            Some("api.search.brave.com".to_string())
        );
    }

    #[test]
    fn test_network_meta_contains_required_fields() {
        let gateway = NetworkGatewayService::new(NetworkGatewayConfig {
            max_requests: 20,
            max_bytes_total: 1024,
            ..NetworkGatewayConfig::default()
        });

        let meta = gateway.build_network_meta(
            "https://api.search.brave.com/res/v1/web/search?q=rust",
            "GET",
            200,
            42,
            128,
            3,
            512,
        );

        assert_eq!(
            meta.url,
            "https://api.search.brave.com/res/v1/web/search?q=rust"
        );
        assert_eq!(meta.domain.as_deref(), Some("api.search.brave.com"));
        assert_eq!(meta.method, "GET");
        assert_eq!(meta.status_code, 200);
        assert_eq!(meta.latency_ms, 42);
        assert_eq!(meta.response_bytes, 128);
        assert_eq!(meta.requests_used, 3);
        assert_eq!(meta.bytes_used, 512);
        assert_eq!(meta.max_requests, 20);
        assert_eq!(meta.max_bytes_total, 1024);
        assert_eq!(meta.budget_remaining_requests, 17);
        assert_eq!(meta.budget_remaining_bytes, 512);
    }

    #[test]
    fn test_build_client_succeeds() {
        let client = build_client(Duration::from_secs(10));
        assert!(
            client.is_ok(),
            "build_client must succeed in normal conditions"
        );
    }

    #[test]
    fn test_build_client_with_user_agent_succeeds() {
        let client = build_client_with_user_agent(
            Duration::from_secs(5),
            "Mozilla/5.0 (compatible; test/1.0)",
        );
        assert!(
            client.is_ok(),
            "build_client_with_user_agent must succeed in normal conditions"
        );
    }

    #[test]
    fn test_build_client_large_timeout() {
        let client = build_client(Duration::from_secs(300));
        assert!(client.is_ok(), "build_client must accept large timeout");
    }
}
