// ═══════════════════════════════════════════════════════════════
// TITANE∞ — HTTP COMMANDS (Proxy sécurisé)
// Toutes les requêtes HTTP passent par Tauri IPC
// ═══════════════════════════════════════════════════════════════

use crate::security::permission_guard::PERMISSION_GUARD;
use crate::security::permissions::Role;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::Duration;
use titane_infinity::gateway::network;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HttpRequestParams {
    pub url: String,
    pub method: Option<String>,
    pub headers: Option<HashMap<String, String>>,
    pub body: Option<String>,
    pub timeout: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HttpResponse {
    pub ok: bool,
    pub status: u16,
    pub status_text: String,
    pub body: String,
    pub headers: HashMap<String, String>,
}

/// Liste blanche des domaines autorisés
const ALLOWED_DOMAINS: &[&str] = &[
    "localhost",
    "127.0.0.1",
    "generativelanguage.googleapis.com",
];

fn is_url_allowed(url: &str) -> bool {
    let parsed = match url::Url::parse(url) {
        Ok(u) => u,
        Err(_) => return false,
    };

    let host = match parsed.host_str() {
        Some(h) => h.to_lowercase(),
        None => return false,
    };

    if host == "localhost" || host == "127.0.0.1" {
        return true;
    }

    ALLOWED_DOMAINS
        .iter()
        .any(|domain| host == *domain || host.ends_with(&format!(".{}", domain)))
}

/// Proxy HTTP sécurisé via Tauri IPC
#[tauri::command]
pub async fn http_request(params: HttpRequestParams) -> Result<HttpResponse, String> {
    // Permission check
    PERMISSION_GUARD
        .require("system_read", Role::User, "http_request")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    // Validation URL
    if !is_url_allowed(&params.url) {
        return Err(format!(
            "Domaine non autorisé: {}. Domaines autorisés: {:?}",
            params.url, ALLOWED_DOMAINS
        ));
    }

    let method = params.method.unwrap_or_else(|| "GET".to_string());
    let timeout_ms = params.timeout.unwrap_or(30000);
    let timeout = Duration::from_millis(timeout_ms);

    // Build request — governed via One Door Network Gateway (Rule 5)
    let client = network::build_http_client(timeout)?;

    let mut req_builder = match method.to_uppercase().as_str() {
        "GET" => client.get(&params.url),
        "POST" => client.post(&params.url),
        "PUT" => client.put(&params.url),
        "DELETE" => client.delete(&params.url),
        "PATCH" => client.patch(&params.url),
        "HEAD" => client.head(&params.url),
        _ => return Err(format!("Méthode HTTP non supportée: {}", method)),
    };

    // Add headers
    if let Some(headers) = &params.headers {
        for (key, value) in headers {
            req_builder = req_builder.header(key.as_str(), value.as_str());
        }
    }

    // Add body
    if let Some(body) = &params.body {
        req_builder = req_builder.body(body.clone());
    }

    // Execute request
    let response = req_builder
        .send()
        .await
        .map_err(|e| format!("HTTP request failed: {}", e))?;

    let status = response.status().as_u16();
    let status_text = response
        .status()
        .canonical_reason()
        .unwrap_or("Unknown")
        .to_string();
    let ok = response.status().is_success();

    // Extract headers
    let mut response_headers = HashMap::new();
    for (key, value) in response.headers() {
        if let Ok(v) = value.to_str() {
            response_headers.insert(key.to_string(), v.to_string());
        }
    }

    // Read body
    let body = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response body: {}", e))?;

    Ok(HttpResponse {
        ok,
        status,
        status_text,
        body,
        headers: response_headers,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    // ── is_url_allowed — OWASP A01 allowlist ──────────────────────────────────

    #[test]
    fn test_allowlist_localhost_allowed() {
        assert!(is_url_allowed("http://localhost:11434/api/tags"));
        assert!(is_url_allowed("http://localhost:8080/api/health"));
        assert!(is_url_allowed("https://localhost/"));
    }

    #[test]
    fn test_allowlist_loopback_allowed() {
        assert!(is_url_allowed("http://127.0.0.1:11434/api/version"));
        assert!(is_url_allowed("http://127.0.0.1:1420/"));
    }

    #[test]
    fn test_allowlist_gemini_api_allowed() {
        assert!(is_url_allowed(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
        ));
    }

    #[test]
    fn test_allowlist_unauthorized_domain_blocked() {
        // OWASP A01 — all unknown domains must be blocked.
        assert!(!is_url_allowed("https://evil.attacker.com/steal"));
        assert!(!is_url_allowed("http://github.com/user/repo"));
        assert!(!is_url_allowed("https://api.openai.com/v1/chat"));
        assert!(!is_url_allowed("http://169.254.169.254/metadata")); // AWS metadata SSRF
    }

    #[test]
    fn test_allowlist_invalid_url_blocked() {
        assert!(!is_url_allowed("not-a-url"));
        assert!(!is_url_allowed(""));
        assert!(!is_url_allowed("://missing-scheme"));
    }

    #[test]
    fn test_allowlist_subdomain_of_allowed_blocked_unless_parent() {
        // Sub-domains of non-allowlisted roots must be blocked.
        assert!(!is_url_allowed("https://evil.localhost.attacker.com/"));
        // Sub-domain of googleapis.com is allowed (endsWith logic).
        assert!(is_url_allowed(
            "https://generativelanguage.googleapis.com/v1beta/"
        ));
    }

    // ── HttpResponse struct contract (Rule 6) ─────────────────────────────────

    #[test]
    fn test_http_response_ok_contract() {
        let resp = HttpResponse {
            ok: true,
            status: 200,
            status_text: "OK".to_string(),
            body: r#"{"models":["gemma2:2b"]}"#.to_string(),
            headers: HashMap::new(),
        };
        assert!(resp.ok);
        assert_eq!(resp.status, 200);
        assert!(resp.body.contains("gemma2:2b"));
    }

    #[test]
    fn test_http_response_error_contract() {
        let resp = HttpResponse {
            ok: false,
            status: 404,
            status_text: "Not Found".to_string(),
            body: r#"{"error":"not found"}"#.to_string(),
            headers: HashMap::new(),
        };
        assert!(!resp.ok);
        assert_eq!(resp.status, 404);
    }

    #[test]
    fn test_http_request_params_defaults() {
        let params = HttpRequestParams {
            url: "http://127.0.0.1:11434/api/tags".to_string(),
            method: None,
            headers: None,
            body: None,
            timeout: None,
        };
        assert_eq!(params.url, "http://127.0.0.1:11434/api/tags");
        assert!(params.method.is_none());
        assert!(params.timeout.is_none());
    }
}
