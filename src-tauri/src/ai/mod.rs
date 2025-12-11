// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Multi-IA Orchestrator vΩ.5
//   SUPER PROMPT #8 — AI Module Root
//   Enhanced with Claude, OpenAI, Local, TITANE Engine
// ═══════════════════════════════════════════════════════════════

// Legacy modules (v20.1)
pub mod cache;
pub mod gemini;
pub mod ollama;
pub mod router; // Legacy AIRouter (Gemini/Ollama)
pub mod security;

// NEW: Multi-IA Orchestrator modules (SUPER PROMPT #8)
pub mod api;
pub mod config_multi;
pub mod evaluator;
pub mod fusion;
pub mod orchestrator_multi;
pub mod providers;
pub mod router_intelligent; // NEW: Intelligent AI Router (Multi-provider)

use serde::{Deserialize, Serialize};

// ═══════════════════════════════════════════════════════════════
// TYPES FONDAMENTAUX (SUPER PROMPT #8)
// ═══════════════════════════════════════════════════════════════

/// Requête IA universelle (nouvelle version Multi-IA)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiRequest {
    pub prompt: String,
    pub mode: AiMode,
    pub user_id: String,
    pub session_id: String,
    pub max_tokens: Option<u32>,
    pub temperature: Option<f32>,
    pub context: Option<String>,
}

/// Mode de génération IA
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum AiMode {
    Fast,     // Vitesse maximale (Haiku, GPT-3.5, Local rapide)
    Quality,  // Qualité optimale (Sonnet, GPT-4.1)
    Deep,     // Réflexion profonde (Opus, GPT-4.1)
    Creative, // Créativité (température élevée)
    Analysis, // Analyse technique (température basse)
}

impl std::fmt::Display for AiMode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AiMode::Fast => write!(f, "fast"),
            AiMode::Quality => write!(f, "quality"),
            AiMode::Deep => write!(f, "deep"),
            AiMode::Creative => write!(f, "creative"),
            AiMode::Analysis => write!(f, "analysis"),
        }
    }
}

/// Réponse IA avec métadonnées complètes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiResponse {
    pub output: String,
    pub provider: String,
    pub model: String,
    pub tokens_in: u32,
    pub tokens_out: u32,
    pub latency_ms: u128,
    pub confidence: f32,
    pub metadata: AiMetadata,
}

/// Métadonnées de génération
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AiMetadata {
    pub mode: String,
    pub temperature_used: Option<f32>,
    pub finish_reason: Option<String>,
    pub cached: bool,
    pub fallback_triggered: bool,
    pub evaluation_score: Option<f32>,
}

// ═══════════════════════════════════════════════════════════════
// LEGACY TYPES (v20.1) - Rétro-compatibilité
// ═══════════════════════════════════════════════════════════════

/// AI Request structure v15 (legacy) - Extended v21 with provider_preference
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIRequest {
    pub prompt: String,
    pub temperature: f32,
    pub max_tokens: usize,
    pub stream: bool,
    /// v21: Provider preference for direct routing (Local → Ollama)
    pub provider_preference: Option<String>,
}

/// AI Response structure v15 (legacy)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIResponse {
    pub content: String,
    pub provider: AIProvider,
    pub timestamp: i64,
    pub tokens: usize,
}

/// AI Provider enum v15 (legacy)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AIProvider {
    Gemini,  // Google Gemini API
    Ollama,  // Local Ollama (localhost:11434)
    Offline, // Fallback mode (basic responses)
}

/// AI Error types (unified)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AIError {
    NetworkError(String),
    APIError(String),
    TimeoutError,
    InvalidResponse(String),
    NoProviderAvailable,
    // NEW: Multi-IA errors
    ProviderUnavailable {
        provider: String,
        reason: String,
    },
    RateLimitExceeded {
        provider: String,
        retry_after: Option<u64>,
    },
    AuthenticationFailed {
        provider: String,
    },
    ConfigurationError {
        message: String,
    },
    AllProvidersFailed {
        attempts: Vec<String>,
    },
    InvalidRequest {
        message: String,
    },
}

impl std::fmt::Display for AIError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AIError::NetworkError(e) => write!(f, "Network error: {}", e),
            AIError::APIError(e) => write!(f, "API error: {}", e),
            AIError::TimeoutError => write!(f, "Request timeout"),
            AIError::InvalidResponse(e) => write!(f, "Invalid response: {}", e),
            AIError::NoProviderAvailable => write!(f, "No AI provider available"),
            AIError::ProviderUnavailable { provider, reason } => {
                write!(f, "Provider {} unavailable: {}", provider, reason)
            }
            AIError::RateLimitExceeded {
                provider,
                retry_after,
            } => {
                write!(
                    f,
                    "Rate limit exceeded for {}: retry after {:?}s",
                    provider, retry_after
                )
            }
            AIError::AuthenticationFailed { provider } => {
                write!(f, "Authentication failed for {}", provider)
            }
            AIError::ConfigurationError { message } => {
                write!(f, "Configuration error: {}", message)
            }
            AIError::AllProvidersFailed { attempts } => {
                write!(f, "All providers failed. Tried: {:?}", attempts)
            }
            AIError::InvalidRequest { message } => write!(f, "Invalid request: {}", message),
        }
    }
}

impl std::error::Error for AIError {}

pub type AIResult<T> = Result<T, AIError>;

// ═══════════════════════════════════════════════════════════════
// ✅ v15 - File analysis (intelligent summary generation)
// ═══════════════════════════════════════════════════════════════

/// Analyze text file and generate intelligent summary
pub async fn analyze_file(text: &str) -> Result<String, String> {
    generate_local_summary(text)
}

/// Generate local intelligent summary (no AI needed)
fn generate_local_summary(text: &str) -> Result<String, String> {
    if text.is_empty() {
        return Ok("Fichier vide.".to_string());
    }

    let lines = text.lines().count();
    let words = text.split_whitespace().count();
    let chars = text.len();

    // Detect content type
    let content_type = detect_content_type(text);
    let summary = match content_type.as_str() {
        "code-rust" => {
            let functions = count_functions_rust(text);
            let structs = count_structs_rust(text);
            format!(
                "Code Rust: {} lignes, {} mots. Contient {} fonction(s) et {} struct(s).",
                lines, words, functions, structs
            )
        }
        "code-typescript" | "code-react" => {
            let components = count_components_tsx(text);
            let hooks = count_hooks(text);
            format!(
                "Code TypeScript/React: {} lignes, {} mots. Contient {} composant(s) et {} hook(s).",
                lines, words, components, hooks
            )
        }
        "markdown" => {
            let headers = count_headers_md(text);
            format!(
                "Document Markdown: {} lignes, {} mots, {} section(s).",
                lines, words, headers
            )
        }
        "json" => {
            format!("Fichier JSON: {} caractères. Structure de données.", chars)
        }
        _ => {
            let first_lines: Vec<&str> = text
                .lines()
                .filter(|line| !line.trim().is_empty())
                .take(3)
                .collect();
            format!(
                "Document texte: {} lignes, {} mots. Aperçu: {}",
                lines,
                words,
                first_lines.join(" ").chars().take(150).collect::<String>()
            )
        }
    };

    Ok(summary)
}

fn detect_content_type(text: &str) -> String {
    let lower = text.to_lowercase();

    if lower.contains("fn ") && lower.contains("impl ") {
        "code-rust".to_string()
    } else if lower.contains("interface ") || lower.contains("type ") {
        "code-typescript".to_string()
    } else if lower.contains("const ") && (lower.contains("=>") || lower.contains("jsx")) {
        "code-react".to_string()
    } else if text.starts_with('#') || text.contains("## ") {
        "markdown".to_string()
    } else if text.trim().starts_with('{') || text.trim().starts_with('[') {
        "json".to_string()
    } else {
        "text".to_string()
    }
}

fn count_functions_rust(text: &str) -> usize {
    text.lines()
        .filter(|line| {
            let trimmed = line.trim();
            trimmed.starts_with("fn ")
                || trimmed.starts_with("pub fn ")
                || trimmed.starts_with("async fn ")
        })
        .count()
}

fn count_structs_rust(text: &str) -> usize {
    text.lines()
        .filter(|line| {
            let trimmed = line.trim();
            trimmed.starts_with("struct ") || trimmed.starts_with("pub struct ")
        })
        .count()
}

fn count_components_tsx(text: &str) -> usize {
    text.lines()
        .filter(|line| {
            let trimmed = line.trim();
            (trimmed.starts_with("export const ") || trimmed.starts_with("const "))
                && trimmed.contains("=")
                && trimmed.contains("=>")
        })
        .count()
}

fn count_hooks(text: &str) -> usize {
    let hooks = ["useState", "useEffect", "useCallback", "useMemo", "useRef"];
    hooks.iter().map(|hook| text.matches(hook).count()).sum()
}

fn count_headers_md(text: &str) -> usize {
    text.lines()
        .filter(|line| line.trim().starts_with('#'))
        .count()
}
