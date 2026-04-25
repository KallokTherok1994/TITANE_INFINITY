// ═══════════════════════════════════════════════════════════════
// TITANE∞ — HTTP COMMANDS (Proxy sécurisé)
// Toutes les requêtes HTTP passent par Tauri IPC
// ═══════════════════════════════════════════════════════════════

use crate::security::permission_guard::PERMISSION_GUARD;
use crate::security::permissions::Role;
use crate::services::network_gateway::build_client;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::Duration;

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

    // Build request via Network Gateway (One Door Rule 5)
    let client = build_client(timeout)
        .map_err(|e| format!("Client build error: {}", e))?;

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
