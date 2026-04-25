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

    let client = crate::gateway::network::build_http_client(Duration::from_secs(EMBED_TIMEOUT_SECS))?;

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
        return Err(format!("Ollama embeddings HTTP {status}: {err_text}"));
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
            content: Some(EmbeddingsContent { embeddings: vec![] }),
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

// ─────────────────────────────────────────────────────────────────
// Unit tests
// ─────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    /// Verify that EmbeddingResponse serializes to the canonical IPC format
    /// { ok, content, error }.
    #[test]
    fn test_embedding_response_serialization() {
        let resp = EmbeddingResponse {
            ok: true,
            content: Some(EmbeddingContent {
                embedding: vec![0.1, 0.2, 0.3],
            }),
            error: None,
        };

        let json = serde_json::to_value(&resp).expect("serialization must succeed");

        assert_eq!(json["ok"], true);
        assert!(json["content"].is_object());
        assert!(json["content"]["embedding"].is_array());
        assert_eq!(json["content"]["embedding"][0], 0.1_f32);
        assert!(json["error"].is_null());
    }

    /// Verify that EmbeddingsResponse (batch) serializes correctly.
    #[test]
    fn test_embeddings_batch_response_serialization() {
        let resp = EmbeddingsResponse {
            ok: true,
            content: Some(EmbeddingsContent {
                embeddings: vec![vec![0.1, 0.2], vec![0.3, 0.4]],
            }),
            error: None,
        };

        let json = serde_json::to_value(&resp).expect("serialization must succeed");

        assert_eq!(json["ok"], true);
        assert!(json["error"].is_null());
        let embeddings = json["content"]["embeddings"].as_array().unwrap();
        assert_eq!(embeddings.len(), 2);
        assert_eq!(embeddings[0][0], 0.1_f32);
        assert_eq!(embeddings[1][0], 0.3_f32);
    }

    /// When Ollama is unavailable, the command must return
    /// { ok: false, content: null, error: "..." } — never a random fallback.
    #[tokio::test]
    async fn test_embedding_with_unavailable_ollama() {
        // Point to a port that nothing is listening on.
        // NOTE: env vars are process-global; restore after test to prevent
        // contaminating parallel test workers (e.g. test_collect_runtime_config_defaults).
        std::env::set_var("OLLAMA_BASE_URL", "http://127.0.0.1:19999");

        let result = rag_generate_embedding("test text".to_string()).await;

        // Restore env immediately after the async call to minimise contamination window.
        std::env::remove_var("OLLAMA_BASE_URL");

        // The command itself must not return an Err — it wraps errors in the ok:false contract
        let resp = result.expect("command must not return Err");

        assert!(!resp.ok, "ok must be false when Ollama is unavailable");
        assert!(resp.content.is_none(), "content must be null on failure");
        assert!(
            resp.error.is_some(),
            "error message must be present on failure"
        );
        assert!(
            !resp.error.as_deref().unwrap_or("").is_empty(),
            "error message must not be empty"
        );
    }

    /// Verify the canonical IPC contract structure: { ok, content, error }.
    #[test]
    fn test_canonical_ipc_contract_structure() {
        // Success response
        let success = EmbeddingResponse {
            ok: true,
            content: Some(EmbeddingContent {
                embedding: vec![1.0],
            }),
            error: None,
        };
        let json = serde_json::to_value(&success).unwrap();
        assert!(json.get("ok").is_some(), "ok field required");
        assert!(json.get("content").is_some(), "content field required");
        assert!(json.get("error").is_some(), "error field required");

        // Failure response
        let failure = EmbeddingResponse {
            ok: false,
            content: None,
            error: Some("Ollama unavailable".to_string()),
        };
        let json = serde_json::to_value(&failure).unwrap();
        assert_eq!(json["ok"], false);
        assert!(json["content"].is_null());
        assert_eq!(json["error"], "Ollama unavailable");
    }
}
