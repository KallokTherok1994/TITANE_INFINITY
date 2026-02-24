// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — FETCH SERVICE (Ring 3)
//   P2.0 QUALIFIED — Single governed network gate for WebResearch
//   ALL web requests from WebResearch MUST go through here.
//   reqwest is FORBIDDEN everywhere else in the WebResearch path.
// ═══════════════════════════════════════════════════════════════

use crate::services::network_policy::{check_domain, extract_domain, AppliedPolicy, PolicyError};
use crate::types::research::NetworkEvent;
use reqwest::Client;
use std::time::{Duration, Instant};

/// Error types for FetchService
#[derive(Debug)]
pub enum FetchError {
    PolicyViolation(PolicyError),
    BudgetExceeded(String),
    SchemeNotAllowed(String),
    NetworkError(String),
    Timeout(String),
}

impl std::fmt::Display for FetchError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            FetchError::PolicyViolation(e) => write!(f, "PolicyViolation: {}", e),
            FetchError::BudgetExceeded(s) => write!(f, "BudgetExceeded: {}", s),
            FetchError::SchemeNotAllowed(s) => write!(f, "SchemeNotAllowed: {}", s),
            FetchError::NetworkError(s) => write!(f, "NetworkError: {}", s),
            FetchError::Timeout(s) => write!(f, "Timeout: {}", s),
        }
    }
}

impl From<PolicyError> for FetchError {
    fn from(e: PolicyError) -> Self {
        FetchError::PolicyViolation(e)
    }
}

/// Result of a single governed fetch
pub struct FetchResult {
    /// HTTP status code
    pub status: u16,
    /// Response body bytes (up to budget limit)
    pub body: Vec<u8>,
    /// Structured event suitable for trace
    pub event: NetworkEvent,
}

/// Stateful session tracking budgets across multiple calls
pub struct FetchService {
    client: Client,
    requests_used: u32,
    bytes_used: u64,
}

impl FetchService {
    /// Build a new FetchService with a reqwest client configured
    /// according to the applied policy (timeout, no redirects overrun).
    pub fn new(policy: &AppliedPolicy) -> Self {
        let timeout = Duration::from_millis(policy.timeout_ms);
        let client = Client::builder()
            .timeout(timeout)
            .redirect(reqwest::redirect::Policy::limited(5))
            .build()
            .unwrap_or_else(|_| Client::new());

        FetchService {
            client,
            requests_used: 0,
            bytes_used: 0,
        }
    }

    /// Perform a single governed HTTP GET request.
    ///
    /// Enforces:
    /// - Scheme: http / https only
    /// - Domain policy (allowlist / denylist)
    /// - max_requests budget
    /// - max_bytes_total budget (truncates body at limit)
    ///
    /// Returns a `FetchResult` with the network event appended.
    pub async fn fetch(
        &mut self,
        url: &str,
        policy: &AppliedPolicy,
    ) -> Result<FetchResult, FetchError> {
        // 1. Scheme guard
        if !url.starts_with("http://") && !url.starts_with("https://") {
            return Err(FetchError::SchemeNotAllowed(format!(
                "URL '{}' uses a non-http(s) scheme",
                url
            )));
        }

        // 2. Domain policy
        check_domain(url, policy)?;

        // 3. Request budget
        if self.requests_used >= policy.max_requests {
            return Err(FetchError::BudgetExceeded(format!(
                "max_requests budget ({}) already exhausted",
                policy.max_requests
            )));
        }

        // 4. Byte budget pre-check
        if self.bytes_used >= policy.max_bytes_total {
            return Err(FetchError::BudgetExceeded(format!(
                "max_bytes_total budget ({} bytes) already exhausted",
                policy.max_bytes_total
            )));
        }

        // 5. Extract domain for event
        let domain = extract_domain(url).unwrap_or_else(|| url.to_string());

        // 6. Perform request
        let start = Instant::now();
        self.requests_used += 1;

        let response = self
            .client
            .get(url)
            .send()
            .await
            .map_err(|e| FetchError::NetworkError(e.to_string()))?;

        let status = response.status().as_u16();

        // 7. Read body with byte budget enforcement
        let remaining_budget = policy.max_bytes_total.saturating_sub(self.bytes_used);
        let body = read_body_capped(response, remaining_budget).await?;
        let bytes = body.len() as u64;
        self.bytes_used += bytes;

        let duration_ms = start.elapsed().as_millis() as u64;

        let event = NetworkEvent {
            domain,
            url: url.to_string(),
            status,
            bytes,
            duration_ms,
            cache_hit: false,
        };

        Ok(FetchResult {
            status,
            body,
            event,
        })
    }

    /// How many requests have been consumed in this session
    pub fn requests_used(&self) -> u32 {
        self.requests_used
    }

    /// How many bytes have been consumed in this session
    pub fn bytes_used(&self) -> u64 {
        self.bytes_used
    }
}

/// Read response body up to `cap` bytes.
/// If the body exceeds the cap, it is truncated and a
/// `BudgetExceeded` error is returned.
async fn read_body_capped(response: reqwest::Response, cap: u64) -> Result<Vec<u8>, FetchError> {
    use futures_util::StreamExt;

    let mut body: Vec<u8> = Vec::new();
    let mut stream = response.bytes_stream();

    while let Some(chunk_result) = stream.next().await {
        let chunk = chunk_result.map_err(|e| FetchError::NetworkError(e.to_string()))?;
        let remaining = cap.saturating_sub(body.len() as u64);
        if remaining == 0 {
            return Err(FetchError::BudgetExceeded(format!(
                "Response body exceeds max_bytes_total cap of {} bytes",
                cap
            )));
        }
        let take = (chunk.len() as u64).min(remaining) as usize;
        body.extend_from_slice(&chunk[..take]);
        if take < chunk.len() {
            return Err(FetchError::BudgetExceeded(format!(
                "Response body truncated at {} bytes (cap reached)",
                cap
            )));
        }
    }

    Ok(body)
}
