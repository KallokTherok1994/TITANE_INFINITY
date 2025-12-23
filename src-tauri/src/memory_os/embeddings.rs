// ═══════════════════════════════════════════════════════════════
//   EMBEDDINGS ENGINE — OpenAI / Gemini / Local
// ═══════════════════════════════════════════════════════════════

use crate::memory_os::types::{MemoryOSError, MemoryOSResult};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Embedding Source
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum EmbeddingSource {
    /// OpenAI text-embedding-3-small (1536 dim)
    OpenAI,

    /// Google Gemini embedding
    Gemini,

    /// Local model (e.g., all-MiniLM-L6-v2, 384 dim)
    Local,
}

/// Embedding Configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmbeddingConfig {
    pub source: EmbeddingSource,
    pub dimension: usize,
    pub api_key: Option<String>,
    pub model: String,
    pub batch_size: usize,
    pub cache_enabled: bool,
}

impl Default for EmbeddingConfig {
    fn default() -> Self {
        Self {
            source: EmbeddingSource::Local,
            dimension: 384, // all-MiniLM-L6-v2
            api_key: None,
            model: "all-MiniLM-L6-v2".to_string(),
            batch_size: 32,
            cache_enabled: true,
        }
    }
}

/// Embedding Engine
pub struct EmbeddingEngine {
    config: EmbeddingConfig,
    cache: Arc<RwLock<EmbeddingCache>>,
}

impl EmbeddingEngine {
    pub fn new(config: EmbeddingConfig) -> Self {
        Self {
            config,
            cache: Arc::new(RwLock::new(EmbeddingCache::new(1000))),
        }
    }

    /// Embed single text
    pub async fn embed(&self, text: &str) -> MemoryOSResult<Vec<f32>> {
        // Check cache
        if self.config.cache_enabled {
            let cache = self.cache.read().await;
            if let Some(embedding) = cache.get(text) {
                return Ok(embedding);
            }
        }

        // Generate embedding
        let embedding = match self.config.source {
            EmbeddingSource::OpenAI => self.embed_openai(text).await?,
            EmbeddingSource::Gemini => self.embed_gemini(text).await?,
            EmbeddingSource::Local => self.embed_local(text).await?,
        };

        // Cache result
        if self.config.cache_enabled {
            let mut cache = self.cache.write().await;
            cache.insert(text.to_string(), embedding.clone());
        }

        Ok(embedding)
    }

    /// Embed batch of texts
    pub async fn embed_batch(&self, texts: &[String]) -> MemoryOSResult<Vec<Vec<f32>>> {
        let mut results = Vec::with_capacity(texts.len());

        // Process in batches
        for chunk in texts.chunks(self.config.batch_size) {
            for text in chunk {
                let embedding = self.embed(text).await?;
                results.push(embedding);
            }
        }

        Ok(results)
    }

    /// OpenAI embedding
    async fn embed_openai(&self, text: &str) -> MemoryOSResult<Vec<f32>> {
        let api_key = self.config.api_key.as_ref().ok_or_else(|| {
            MemoryOSError::EmbeddingError("OpenAI API key not configured".to_string())
        })?;

        let client = reqwest::Client::new();

        #[derive(Serialize)]
        struct OpenAIRequest {
            input: String,
            model: String,
        }

        #[derive(Deserialize)]
        struct OpenAIResponse {
            data: Vec<OpenAIEmbedding>,
        }

        #[derive(Deserialize)]
        struct OpenAIEmbedding {
            embedding: Vec<f32>,
        }

        let response = client
            .post("https://api.openai.com/v1/embeddings")
            .header("Authorization", format!("Bearer {}", api_key))
            .json(&OpenAIRequest {
                input: text.to_string(),
                model: self.config.model.clone(),
            })
            .send()
            .await
            .map_err(|e| MemoryOSError::EmbeddingError(format!("OpenAI API error: {}", e)))?;

        let result: OpenAIResponse = response.json().await.map_err(|e| {
            MemoryOSError::EmbeddingError(format!("OpenAI response parse error: {}", e))
        })?;

        result
            .data
            .into_iter()
            .next()
            .map(|e| e.embedding)
            .ok_or_else(|| MemoryOSError::EmbeddingError("No embedding returned".to_string()))
    }

    /// Gemini embedding
    async fn embed_gemini(&self, text: &str) -> MemoryOSResult<Vec<f32>> {
        let api_key = self.config.api_key.as_ref().ok_or_else(|| {
            MemoryOSError::EmbeddingError("Gemini API key not configured".to_string())
        })?;

        let client = reqwest::Client::new();

        #[derive(Serialize)]
        struct GeminiRequest {
            content: GeminiContent,
        }

        #[derive(Serialize)]
        struct GeminiContent {
            parts: Vec<GeminiPart>,
        }

        #[derive(Serialize)]
        struct GeminiPart {
            text: String,
        }

        #[derive(Deserialize)]
        struct GeminiResponse {
            embedding: GeminiEmbedding,
        }

        #[derive(Deserialize)]
        struct GeminiEmbedding {
            values: Vec<f32>,
        }

        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/{}:embedContent?key={}",
            self.config.model, api_key
        );

        let response = client
            .post(&url)
            .json(&GeminiRequest {
                content: GeminiContent {
                    parts: vec![GeminiPart {
                        text: text.to_string(),
                    }],
                },
            })
            .send()
            .await
            .map_err(|e| MemoryOSError::EmbeddingError(format!("Gemini API error: {}", e)))?;

        let result: GeminiResponse = response.json().await.map_err(|e| {
            MemoryOSError::EmbeddingError(format!("Gemini response parse error: {}", e))
        })?;

        Ok(result.embedding.values)
    }

    /// Local embedding (stub - requires model integration)
    async fn embed_local(&self, text: &str) -> MemoryOSResult<Vec<f32>> {
        // Implementation: Local embedding model with ONNX Runtime
        // - Model: all-MiniLM-L6-v2.onnx (384-dim, ~90MB) or multilingual-e5-small (384-dim)
        // - Runtime: ort crate (ONNX Runtime bindings), load model once at startup
        // - Tokenization: Use tokenizers crate with model's tokenizer.json
        // - Inference: let session = SessionBuilder::new(&env)?.with_model_from_file("model.onnx")?;
        // - Processing: Tokenize → run session → extract embedding from output tensor
        // - Performance: ~5-10ms per text on CPU, ~1-2ms on GPU with CUDA provider
        // - Caching: Cache embeddings for repeated texts (LRU cache, 10k entries)
        // For now, return deterministic hash-based embedding

        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};

        let mut hasher = DefaultHasher::new();
        text.hash(&mut hasher);
        let hash = hasher.finish();

        // Generate pseudo-random embedding from hash
        let mut embedding = Vec::with_capacity(self.config.dimension);
        let mut seed = hash;

        for _ in 0..self.config.dimension {
            // Linear congruential generator
            seed = seed.wrapping_mul(1103515245).wrapping_add(12345);
            let val = (seed as f32 / u64::MAX as f32) * 2.0 - 1.0;
            embedding.push(val);
        }

        // Normalize
        let norm: f32 = embedding.iter().map(|x| x * x).sum::<f32>().sqrt();
        if norm > 0.0 {
            for val in &mut embedding {
                *val /= norm;
            }
        }

        Ok(embedding)
    }

    pub fn dimension(&self) -> usize {
        self.config.dimension
    }

    pub fn source(&self) -> EmbeddingSource {
        self.config.source
    }
}

/// Embedding Cache (LRU)
struct EmbeddingCache {
    cache: std::collections::HashMap<String, Vec<f32>>,
    max_size: usize,
}

impl EmbeddingCache {
    fn new(max_size: usize) -> Self {
        Self {
            cache: std::collections::HashMap::with_capacity(max_size),
            max_size,
        }
    }

    fn get(&self, key: &str) -> Option<Vec<f32>> {
        self.cache.get(key).cloned()
    }

    fn insert(&mut self, key: String, value: Vec<f32>) {
        if self.cache.len() >= self.max_size {
            // Simple eviction: remove first entry
            if let Some(first_key) = self.cache.keys().next().cloned() {
                self.cache.remove(&first_key);
            }
        }
        self.cache.insert(key, value);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_local_embedding() {
        let config = EmbeddingConfig::default();
        let engine = EmbeddingEngine::new(config);

        let text = "Hello world";
        let embedding = engine
            .embed(text)
            .await
            .expect("embedding engine should produce vector");

        assert_eq!(embedding.len(), 384);

        // Test determinism
        let embedding2 = engine
            .embed(text)
            .await
            .expect("embedding engine should produce deterministic vector");
        assert_eq!(embedding, embedding2);
    }

    #[tokio::test]
    async fn test_embedding_cache() {
        let config = EmbeddingConfig::default();
        let engine = EmbeddingEngine::new(config);

        let text = "Test text";

        // Cache should start empty
        let cache_len_before = engine.cache.read().await.cache.len();
        assert_eq!(cache_len_before, 0);

        // First call populates cache
        let embedding_1 = engine
            .embed(text)
            .await
            .expect("first embed should populate cache");
        let cache = engine.cache.read().await;
        assert!(cache.get(text).is_some());
        assert_eq!(cache.cache.len(), 1);
        drop(cache);

        // Second call should return the same embedding and not grow cache
        let embedding_2 = engine
            .embed(text)
            .await
            .expect("second embed should hit cache");
        assert_eq!(embedding_1, embedding_2);
        assert_eq!(engine.cache.read().await.cache.len(), 1);
    }
}
