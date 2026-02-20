/**
 * TITANE∞ v27 — Diagnostic Commands
 * Online capabilities verification + Internet connectivity check
 */

use serde::{Deserialize, Serialize};
use tauri::State;
use crate::overdrive::chat_orchestrator::ChatOrchestratorState;

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

    // Check HTTP connectivity to major services
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(3))
        .build();

    if let Ok(client) = client {
        for (name, url) in &[
            ("Google", "https://www.google.com"),
            ("Cloudflare", "https://www.cloudflare.com"),
            ("GitHub", "https://www.github.com"),
        ] {
            let start = std::time::Instant::now();
            match client.head(*url).send().await {
                Ok(resp) if resp.status().is_success() => {
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
    }

    let online = dns_resolvable && api_endpoints.iter().any(|e| e.reachable);

    InternetConnectivity {
        online,
        dns_resolvable,
        api_reachable: api_endpoints,
    }
}

async fn check_openai_connectivity() -> ProviderOnlineStatus {
    let start = std::time::Instant::now();
    match reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(3))
        .build()
    {
        Ok(client) => match client.head("https://api.openai.com").send().await {
            Ok(resp) if resp.status().is_success() => {
                let latency = start.elapsed().as_millis() as u64;
                log::info!("[Diagnostics] OpenAI reachable ({} ms)", latency);
                ProviderOnlineStatus {
                    name: "OpenAI".to_string(),
                    configured: true,
                    can_reach: true,
                    error: None,
                }
            }
            Ok(resp) => {
                let error = format!("HTTP {}", resp.status());
                log::warn!("[Diagnostics] OpenAI returned: {}", error);
                ProviderOnlineStatus {
                    name: "OpenAI".to_string(),
                    configured: true,
                    can_reach: false,
                    error: Some(error),
                }
            }
            Err(e) => {
                let error = format!("Request failed: {}", e);
                log::warn!("[Diagnostics] OpenAI error: {}", error);
                ProviderOnlineStatus {
                    name: "OpenAI".to_string(),
                    configured: true,
                    can_reach: false,
                    error: Some(error),
                }
            }
        },
        Err(e) => {
            let error = format!("Client error: {}", e);
            ProviderOnlineStatus {
                name: "OpenAI".to_string(),
                configured: true,
                can_reach: false,
                error: Some(error),
            }
        }
    }
}

async fn check_gemini_connectivity() -> ProviderOnlineStatus {
    let start = std::time::Instant::now();
    match reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(3))
        .build()
    {
        Ok(client) => match client.head("https://ai.google.dev").send().await {
            Ok(resp) if resp.status().is_success() => {
                let latency = start.elapsed().as_millis() as u64;
                log::info!("[Diagnostics] Gemini reachable ({} ms)", latency);
                ProviderOnlineStatus {
                    name: "Gemini".to_string(),
                    configured: true,
                    can_reach: true,
                    error: None,
                }
            }
            Ok(resp) => {
                let error = format!("HTTP {}", resp.status());
                ProviderOnlineStatus {
                    name: "Gemini".to_string(),
                    configured: true,
                    can_reach: false,
                    error: Some(error),
                }
            }
            Err(e) => {
                let error = format!("Request failed: {}", e);
                ProviderOnlineStatus {
                    name: "Gemini".to_string(),
                    configured: true,
                    can_reach: false,
                    error: Some(error),
                }
            }
        },
        Err(e) => {
            let error = format!("Client error: {}", e);
            ProviderOnlineStatus {
                name: "Gemini".to_string(),
                configured: true,
                can_reach: false,
                error: Some(error),
            }
        }
    }
}

async fn check_anthropic_connectivity() -> ProviderOnlineStatus {
    let start = std::time::Instant::now();
    match reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(3))
        .build()
    {
        Ok(client) => match client.head("https://api.anthropic.com").send().await {
            Ok(resp) if resp.status().is_success() => {
                let latency = start.elapsed().as_millis() as u64;
                log::info!("[Diagnostics] Anthropic reachable ({} ms)", latency);
                ProviderOnlineStatus {
                    name: "Anthropic".to_string(),
                    configured: true,
                    can_reach: true,
                    error: None,
                }
            }
            Ok(resp) => {
                let error = format!("HTTP {}", resp.status());
                ProviderOnlineStatus {
                    name: "Anthropic".to_string(),
                    configured: true,
                    can_reach: false,
                    error: Some(error),
                }
            }
            Err(e) => {
                let error = format!("Request failed: {}", e);
                ProviderOnlineStatus {
                    name: "Anthropic".to_string(),
                    configured: true,
                    can_reach: false,
                    error: Some(error),
                }
            }
        },
        Err(e) => {
            let error = format!("Client error: {}", e);
            ProviderOnlineStatus {
                name: "Anthropic".to_string(),
                configured: true,
                can_reach: false,
                error: Some(error),
            }
        }
    }
}

async fn check_ollama_connectivity() -> ProviderOnlineStatus {
    let start = std::time::Instant::now();
    match reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(3))
        .build()
    {
        Ok(client) => match client.get("http://localhost:11434/api/tags").send().await {
            Ok(resp) if resp.status().is_success() => {
                let latency = start.elapsed().as_millis() as u64;
                log::info!("[Diagnostics] Ollama reachable ({} ms)", latency);
                ProviderOnlineStatus {
                    name: "Ollama (Local)".to_string(),
                    configured: true,
                    can_reach: true,
                    error: None,
                }
            }
            Ok(resp) => {
                let error = format!("HTTP {}", resp.status());
                ProviderOnlineStatus {
                    name: "Ollama (Local)".to_string(),
                    configured: true,
                    can_reach: false,
                    error: Some(error),
                }
            }
            Err(e) => {
                let error = format!("Cannot reach localhost:11434 (not running?): {}", e);
                log::debug!("[Diagnostics] Ollama unreachable: {}", error);
                ProviderOnlineStatus {
                    name: "Ollama (Local)".to_string(),
                    configured: true,
                    can_reach: false,
                    error: Some(error),
                }
            }
        },
        Err(e) => {
            let error = format!("Client error: {}", e);
            ProviderOnlineStatus {
                name: "Ollama (Local)".to_string(),
                configured: true,
                can_reach: false,
                error: Some(error),
            }
        }
    }
}
