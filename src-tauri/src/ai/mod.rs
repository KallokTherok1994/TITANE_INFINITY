// TITANE∞ v20.1 - AI Module with Security Hardening + Performance Cache
// Multi-provider AI system with automatic fallback (Gemini → Ollama) + security validation
// Architecture v20.1: Clean, documented, production-ready, security hardened, cache-optimized

pub mod cache;    // NEW v20.1: LRU cache for AI responses and provider status
pub mod gemini;
pub mod ollama;
pub mod router;
pub mod security; // Security hardening module

use serde::{Deserialize, Serialize};

/// AI Request structure v15
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIRequest {
    pub prompt: String,
    pub temperature: f32,
    pub max_tokens: usize,
    pub stream: bool,
}

/// AI Response structure v15
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIResponse {
    pub content: String,
    pub provider: AIProvider,
    pub timestamp: i64,
    pub tokens: usize,
}

/// AI Provider enum v15
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AIProvider {
    Gemini,  // Google Gemini API
    Ollama,  // Local Ollama (localhost:11434)
    Offline, // Fallback mode (basic responses)
}

/// AI Error types v15
#[derive(Debug)]
pub enum AIError {
    NetworkError(String),
    APIError(String),
    TimeoutError,
    InvalidResponse(String),
    NoProviderAvailable,
}

impl std::fmt::Display for AIError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AIError::NetworkError(e) => write!(f, "Network error: {}", e),
            AIError::APIError(e) => write!(f, "API error: {}", e),
            AIError::TimeoutError => write!(f, "Request timeout"),
            AIError::InvalidResponse(e) => write!(f, "Invalid response: {}", e),
            AIError::NoProviderAvailable => write!(f, "No AI provider available"),
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
