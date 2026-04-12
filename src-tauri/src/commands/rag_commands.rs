// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — RAG EMBEDDINGS COMMANDS (Ollama /api/embeddings)
//   IPC contract: { ok, content, error }
//   One Door: UI → IPC → Rust → Ollama → return
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::time::Duration;

const OLLAMA_EMBED_URL_FALLBACK: &str = "http://127.0.0.1:11434";
const DEFAULT_EMBED_MODEL: &str = "nomic-embed-text";
const EMBED_TIMEOUT_SECS: u64 = 30;

// ─────────────────────────────────────────────────────────────────
// Response types (IPC canonical contract: ok / content / error)
// ─────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize)]
pub struct EmbeddingResponse {
    pub ok: bool,
    pub content: Option<EmbeddingContent>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct EmbeddingContent {
    pub embedding: Vec<f32>,
}

#[derive(Debug, Serialize)]
pub struct EmbeddingsResponse {
    pub ok: bool,
    pub content: Option<EmbeddingsContent>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct EmbeddingsContent {
    pub embeddings: Vec<Vec<f32>>,
}

// ─────────────────────────────────────────────────────────────────
// Internal Ollama /api/embeddings request/response shapes
// ─────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize)]
struct OllamaEmbedRequest<'a> {
    model: &'a str,
    prompt: &'a str,
}

#[derive(Debug, Deserialize)]
struct OllamaEmbedResponse {
    embedding: Vec<f32>,
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

fn embed_base_url() -> String {
    // Disk config (Android) > env var > default
    if let Some(disk_url) = crate::runtime_config::get_persisted_ollama_url() {
        return disk_url;
    }
    std::env::var("OLLAMA_BASE_URL")
        .or_else(|_| std::env::var("OLLAMA_URL"))
        .unwrap_or_else(|_| OLLAMA_EMBED_URL_FALLBACK.to_string())
}

fn embed_model() -> String {
    // Runtime config > env var > default nomic-embed-text
    if let Some(m) = crate::runtime_config::get_persisted_ollama_model() {
        // Only use persisted model for embeddings if it looks like an embedding model
        // Otherwise fall back to the dedicated embedding model
        let lower = m.to_lowercase();
        if lower.contains("embed") || lower.contains("nomic") {
            return m;
        }
    }
    std::env::var("TITANE_EMBED_MODEL")
        .or_else(|_| std::env::var("OLLAMA_EMBED_MODEL"))
        .unwrap_or_else(|_| DEFAULT_EMBED_MODEL.to_string())
}

async fn call_ollama_embed(text: &str) -> Result<Vec<f32>, String> {
    let base_url = embed_base_url();
    let model = embed_model();
    let endpoint = format!("{}/api/embeddings", base_url);

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(EMBED_TIMEOUT_SECS))
        .build()
        .map_err(|e| format!("Failed to build HTTP client: {e}"))?;

    let body = OllamaEmbedRequest {
        model: &model,
        prompt: text,
    };

    let response = client
        .post(&endpoint)
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Ollama embeddings request failed: {e}"))?;

    if !response.status().is_success() {
        let status = response.status();
        let err_text = response.text().await.unwrap_or_default();
        return Err(format!(
            "Ollama embeddings HTTP {status}: {err_text}"
        ));
    }

    let parsed: OllamaEmbedResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse Ollama embeddings response: {e}"))?;

    if parsed.embedding.is_empty() {
        return Err("Ollama returned empty embedding vector".to_string());
    }

    Ok(parsed.embedding)
}

// ─────────────────────────────────────────────────────────────────
// Tauri commands
// ─────────────────────────────────────────────────────────────────

/// Generate a single embedding for the given text via Ollama.
///
/// Returns `{ ok: true, content: { embedding: number[] }, error: null }` on success.
/// Returns `{ ok: false, content: null, error: "..." }` on failure.
#[tauri::command]
pub async fn rag_generate_embedding(text: String) -> Result<EmbeddingResponse, String> {
    match call_ollama_embed(&text).await {
        Ok(embedding) => Ok(EmbeddingResponse {
            ok: true,
            content: Some(EmbeddingContent { embedding }),
            error: None,
        }),
        Err(e) => Ok(EmbeddingResponse {
            ok: false,
            content: None,
            error: Some(e),
        }),
    }
}

/// Generate embeddings for multiple texts via Ollama (batch).
///
/// Returns `{ ok: true, content: { embeddings: number[][] }, error: null }` on success.
/// Returns `{ ok: false, content: null, error: "..." }` on failure.
#[tauri::command]
pub async fn rag_generate_embeddings(texts: Vec<String>) -> Result<EmbeddingsResponse, String> {
    if texts.is_empty() {
        return Ok(EmbeddingsResponse {
            ok: true,
            content: Some(EmbeddingsContent {
                embeddings: vec![],
            }),
            error: None,
        });
    }

    let mut embeddings: Vec<Vec<f32>> = Vec::with_capacity(texts.len());
    for text in &texts {
        match call_ollama_embed(text).await {
            Ok(emb) => embeddings.push(emb),
            Err(e) => {
                return Ok(EmbeddingsResponse {
                    ok: false,
                    content: None,
                    error: Some(format!("Embedding failed for text: {e}")),
                });
            }
        }
    }

    Ok(EmbeddingsResponse {
        ok: true,
        content: Some(EmbeddingsContent { embeddings }),
        error: None,
    })
}
