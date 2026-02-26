/**
 * TITANE∞ v27 — Diagnostic Commands
 * Online capabilities verification + Internet connectivity check
 */

use serde::{Deserialize, Serialize};
use tauri::State;
use crate::overdrive::chat_orchestrator::ChatOrchestratorState;
use crate::services::network_gateway::{NetworkGatewayConfig, NetworkGatewayService};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InternetConnectivity {
    pub online: bool,
    pub dns_resolvable: bool,
    pub api_reachable: Vec<ApiEndpointStatus>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiEndpointStatus {
    pub name: String,
    pub endpoint: String,
    pub reachable: bool,
    pub latency_ms: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OnlineCapabilities {
    pub internet: InternetConnectivity,
    pub providers: Vec<ProviderOnlineStatus>,
    pub timestamp: String,
    pub summary: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderOnlineStatus {
    pub name: String,
    pub configured: bool,
    pub can_reach: bool,
    pub error: Option<String>,
}

fn diagnostics_gateway() -> NetworkGatewayService {
    NetworkGatewayService::new(NetworkGatewayConfig {
        timeout_ms: 3_000,
        max_requests: 16,
        max_bytes_total: 32 * 1024,
        domain_allowlist: vec![
            "www.google.com".to_string(),
            "www.cloudflare.com".to_string(),
            "www.github.com".to_string(),
            "api.openai.com".to_string(),
            "ai.google.dev".to_string(),
            "api.anthropic.com".to_string(),
            "localhost".to_string(),
            "127.0.0.1".to_string(),
        ],
        domain_denylist: vec![],
    })
}

async fn check_provider_connectivity(name: &str, url: &str) -> ProviderOnlineStatus {
    let start = std::time::Instant::now();
    let gateway = diagnostics_gateway();

    match gateway.head_status(url).await {
        Ok(status) if (200..400).contains(&status) => {
            let latency = start.elapsed().as_millis() as u64;
            log::info!("[Diagnostics] {} reachable ({} ms)", name, latency);
            ProviderOnlineStatus {
                name: name.to_string(),
                configured: true,
                can_reach: true,
                error: None,
            }
        }
        Ok(status) => ProviderOnlineStatus {
            name: name.to_string(),
            configured: true,
            can_reach: false,
            error: Some(format!("HTTP {}", status)),
        },
        Err(e) => ProviderOnlineStatus {
            name: name.to_string(),
            configured: true,
            can_reach: false,
            error: Some(format!("Request failed: {}", e)),
        },
    }
}

/// Check all online capabilities: Internet + Providers
#[tauri::command]
pub async fn check_online_capabilities(
    state: State<'_, ChatOrchestratorState>,
) -> Result<OnlineCapabilities, String> {
    log::info!("[Diagnostics] Starting online capabilities check...");

    // Check Internet connectivity
    let internet = check_internet_connectivity().await;
    log::info!("[Diagnostics] Internet check: online={}", internet.online);

    // Check each provider
    let mut providers = Vec::new();

    // OpenAI
    let openai_configured = state.openai_api_key.read().await.is_some();
    let openai_status = if openai_configured {
        check_openai_connectivity().await
    } else {
        ProviderOnlineStatus {
            name: "OpenAI".to_string(),
            configured: false,
            can_reach: false,
            error: Some("API key not configured".to_string()),
        }
    };
    providers.push(openai_status);

    // Gemini
    let gemini_configured = state.gemini_api_key.read().await.is_some();
    let gemini_status = if gemini_configured {
        check_gemini_connectivity().await
    } else {
        ProviderOnlineStatus {
            name: "Gemini".to_string(),
            configured: false,
            can_reach: false,
            error: Some("API key not configured".to_string()),
        }
    };
    providers.push(gemini_status);

    // Anthropic
    let anthropic_configured = state.anthropic_api_key.read().await.is_some();
    let anthropic_status = if anthropic_configured {
        check_anthropic_connectivity().await
    } else {
        ProviderOnlineStatus {
            name: "Anthropic".to_string(),
            configured: false,
            can_reach: false,
            error: Some("API key not configured".to_string()),
        }
    };
    providers.push(anthropic_status);

    // Ollama
    let ollama_status = check_ollama_connectivity().await;
    providers.push(ollama_status);

    // Generate summary
    let available_providers = providers.iter().filter(|p| p.can_reach).count();
    let summary = format!(
        "{}/{} providers online (Internet: {})",
        available_providers,
        providers.len(),
        if internet.online { "✅" } else { "❌" }
    );

    let result = OnlineCapabilities {
        internet,
        providers,
        timestamp: chrono::Utc::now().to_rfc3339(),
        summary,
    };

    log::info!("[Diagnostics] Summary: {}", result.summary);
    Ok(result)
}

/// Check basic internet connectivity
async fn check_internet_connectivity() -> InternetConnectivity {
    let mut api_endpoints = Vec::new();

    // Check DNS resolution
    let dns_resolvable = tokio::task::block_in_place(|| {
        tokio::runtime::Handle::current().block_on(async {
            match std::net::ToSocketAddrs::to_socket_addrs("google.com:443") {
                Ok(_) => true,
                Err(_) => false,
            }
        })
    });

    // Check HTTP connectivity to major services via governed gateway
    let gateway = diagnostics_gateway();
    for (name, url) in &[
        ("Google", "https://www.google.com"),
        ("Cloudflare", "https://www.cloudflare.com"),
        ("GitHub", "https://www.github.com"),
    ] {
        let start = std::time::Instant::now();
        match gateway.head_status(*url).await {
            Ok(status) if (200..400).contains(&status) => {
                let latency = start.elapsed().as_millis() as u64;
                log::debug!("[Diagnostics] {} reachable ({} ms)", name, latency);
                api_endpoints.push(ApiEndpointStatus {
                    name: name.to_string(),
                    endpoint: url.to_string(),
                    reachable: true,
                    latency_ms: Some(latency),
                });
            }
            _ => {
                log::debug!("[Diagnostics] {} unreachable", name);
                api_endpoints.push(ApiEndpointStatus {
                    name: name.to_string(),
                    endpoint: url.to_string(),
                    reachable: false,
                    latency_ms: None,
                });
            }
        }
    }

    let online = dns_resolvable && api_endpoints.iter().any(|e| e.reachable);

    InternetConnectivity {
        online,
        dns_resolvable,
        api_reachable: api_endpoints,
    }
}

async fn check_openai_connectivity() -> ProviderOnlineStatus {
    check_provider_connectivity("OpenAI", "https://api.openai.com").await
}

async fn check_gemini_connectivity() -> ProviderOnlineStatus {
    check_provider_connectivity("Gemini", "https://ai.google.dev").await
}

async fn check_anthropic_connectivity() -> ProviderOnlineStatus {
    check_provider_connectivity("Anthropic", "https://api.anthropic.com").await
}

async fn check_ollama_connectivity() -> ProviderOnlineStatus {
    let mut status = check_provider_connectivity("Ollama (Local)", "http://localhost:11434/api/tags").await;
    if !status.can_reach {
        status.error = status
            .error
            .map(|e| format!("Cannot reach localhost:11434 (not running?): {}", e));
    }
    status
}
