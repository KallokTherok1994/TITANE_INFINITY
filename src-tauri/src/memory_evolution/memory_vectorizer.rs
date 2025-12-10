// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — MEMORY VECTORIZER v∞
//   Embedding local via Ollama
//   Recherche contextuelle vectorielle
// ═══════════════════════════════════════════════════════════════

use super::{MemoryEvolutionError, MemoryItem};
use log::{info, warn};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Vecteur mémoire
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryVector {
    pub id: String,
    pub item_id: String,
    pub vector: Vec<f32>,
    pub dimension: usize,
    pub model: String,
    pub created_at: String,
}

/// Index vectoriel
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VectorIndex {
    pub id: String,
    pub vectors: HashMap<String, MemoryVector>,
    pub dimension: usize,
    pub model: String,
    pub total_items: usize,
    pub created_at: String,
    pub updated_at: String,
}

impl Default for VectorIndex {
    fn default() -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            vectors: HashMap::new(),
            dimension: 384, // Default embedding dimension
            model: "nomic-embed-text".to_string(),
            total_items: 0,
            created_at: chrono::Utc::now().to_rfc3339(),
            updated_at: chrono::Utc::now().to_rfc3339(),
        }
    }
}

/// Résultat de recherche vectorielle
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VectorSearchResult {
    pub item_id: String,
    pub similarity: f32,
    pub content_preview: String,
}

/// Memory Vectorizer Engine
pub struct MemoryVectorizer {
    config: VectorizerConfig,
    index: VectorIndex,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VectorizerConfig {
    /// Modèle d'embedding
    pub model: String,
    /// URL Ollama
    pub ollama_url: String,
    /// Dimension des vecteurs
    pub dimension: usize,
    /// Nombre de résultats max pour recherche
    pub max_search_results: usize,
    /// Seuil de similarité minimum
    pub min_similarity: f32,
}

impl Default for VectorizerConfig {
    fn default() -> Self {
        Self {
            model: "nomic-embed-text".to_string(),
            ollama_url: "http://localhost:11434".to_string(),
            dimension: 384,
            max_search_results: 10,
            min_similarity: 0.5,
        }
    }
}

impl MemoryVectorizer {
    pub fn new(config: VectorizerConfig) -> Self {
        Self {
            index: VectorIndex {
                dimension: config.dimension,
                model: config.model.clone(),
                ..Default::default()
            },
            config,
        }
    }

    /// Vectorise un item mémoire
    pub async fn vectorize_item(
        &mut self,
        item: &MemoryItem,
    ) -> Result<MemoryVector, MemoryEvolutionError> {
        info!("[MemoryVectorizer] Vectorizing item: {}", item.id);

        let vector = self.get_embedding(&item.content).await?;

        let memory_vector = MemoryVector {
            id: uuid::Uuid::new_v4().to_string(),
            item_id: item.id.clone(),
            vector: vector.clone(),
            dimension: vector.len(),
            model: self.config.model.clone(),
            created_at: chrono::Utc::now().to_rfc3339(),
        };

        // Ajouter à l'index
        self.index
            .vectors
            .insert(item.id.clone(), memory_vector.clone());
        self.index.total_items = self.index.vectors.len();
        self.index.updated_at = chrono::Utc::now().to_rfc3339();

        Ok(memory_vector)
    }

    /// Vectorise plusieurs items
    pub async fn vectorize_batch(
        &mut self,
        items: &[MemoryItem],
    ) -> Result<Vec<MemoryVector>, MemoryEvolutionError> {
        info!("[MemoryVectorizer] Batch vectorizing {} items", items.len());

        let mut vectors = Vec::new();

        for item in items {
            match self.vectorize_item(item).await {
                Ok(v) => vectors.push(v),
                Err(e) => warn!("[MemoryVectorizer] Failed to vectorize {}: {}", item.id, e),
            }
        }

        Ok(vectors)
    }

    /// Recherche par similarité
    pub fn search(&self, query_vector: &[f32], items: &[MemoryItem]) -> Vec<VectorSearchResult> {
        let mut results: Vec<_> = self
            .index
            .vectors
            .iter()
            .filter_map(|(item_id, mv)| {
                let similarity = self.cosine_similarity(query_vector, &mv.vector);
                if similarity >= self.config.min_similarity {
                    let item = items.iter().find(|i| i.id == *item_id)?;
                    Some(VectorSearchResult {
                        item_id: item_id.clone(),
                        similarity,
                        content_preview: item.content.chars().take(100).collect(),
                    })
                } else {
                    None
                }
            })
            .collect();

        results.sort_by(|a, b| {
            b.similarity
                .partial_cmp(&a.similarity)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        results.truncate(self.config.max_search_results);

        results
    }

    /// Recherche par texte (convertit d'abord en vecteur)
    pub async fn search_by_text(
        &self,
        query: &str,
        items: &[MemoryItem],
    ) -> Result<Vec<VectorSearchResult>, MemoryEvolutionError> {
        let query_vector = self.get_embedding(query).await?;
        Ok(self.search(&query_vector, items))
    }

    /// Trouve les items les plus similaires à un item donné
    pub fn find_similar(&self, item_id: &str, items: &[MemoryItem]) -> Vec<VectorSearchResult> {
        if let Some(source_vector) = self.index.vectors.get(item_id) {
            let mut results: Vec<_> = self
                .index
                .vectors
                .iter()
                .filter(|(id, _)| *id != item_id)
                .filter_map(|(id, mv)| {
                    let similarity = self.cosine_similarity(&source_vector.vector, &mv.vector);
                    if similarity >= self.config.min_similarity {
                        let item = items.iter().find(|i| i.id == *id)?;
                        Some(VectorSearchResult {
                            item_id: id.clone(),
                            similarity,
                            content_preview: item.content.chars().take(100).collect(),
                        })
                    } else {
                        None
                    }
                })
                .collect();

            results.sort_by(|a, b| {
                b.similarity
                    .partial_cmp(&a.similarity)
                    .unwrap_or(std::cmp::Ordering::Equal)
            });
            results.truncate(self.config.max_search_results);

            results
        } else {
            vec![]
        }
    }

    /// Obtient l'embedding via Ollama
    async fn get_embedding(&self, text: &str) -> Result<Vec<f32>, MemoryEvolutionError> {
        // En mode réel, appel à Ollama
        // Pour l'instant, génération d'un vecteur simulé basé sur le hash du texte

        #[cfg(feature = "ollama")]
        {
            let client = reqwest::Client::new();
            let response = client
                .post(format!("{}/api/embeddings", self.config.ollama_url))
                .json(&serde_json::json!({
                    "model": self.config.model,
                    "prompt": text
                }))
                .send()
                .await
                .map_err(|e| MemoryEvolutionError::VectorizationError(e.to_string()))?;

            let data: serde_json::Value = response
                .json()
                .await
                .map_err(|e| MemoryEvolutionError::VectorizationError(e.to_string()))?;

            if let Some(embedding) = data.get("embedding").and_then(|e| e.as_array()) {
                return Ok(embedding
                    .iter()
                    .filter_map(|v| v.as_f64().map(|f| f as f32))
                    .collect());
            }

            Err(MemoryEvolutionError::VectorizationError(
                "No embedding in response".to_string(),
            ))
        }

        #[cfg(not(feature = "ollama"))]
        {
            // Simulation pour dev/test
            Ok(self.generate_pseudo_embedding(text))
        }
    }

    /// Génère un embedding pseudo-aléatoire basé sur le contenu (pour tests)
    fn generate_pseudo_embedding(&self, text: &str) -> Vec<f32> {
        use std::hash::{Hash, Hasher};
        let mut hasher = std::collections::hash_map::DefaultHasher::new();
        text.hash(&mut hasher);
        let seed = hasher.finish();

        let mut rng = seed;
        let mut vector = Vec::with_capacity(self.config.dimension);

        for _ in 0..self.config.dimension {
            rng = rng.wrapping_mul(6364136223846793005).wrapping_add(1);
            let val = ((rng >> 33) as f32 / u32::MAX as f32) * 2.0 - 1.0;
            vector.push(val);
        }

        // Normaliser
        let norm: f32 = vector.iter().map(|x| x * x).sum::<f32>().sqrt();
        if norm > 0.0 {
            for v in &mut vector {
                *v /= norm;
            }
        }

        vector
    }

    /// Calcule la similarité cosinus entre deux vecteurs
    fn cosine_similarity(&self, a: &[f32], b: &[f32]) -> f32 {
        if a.len() != b.len() || a.is_empty() {
            return 0.0;
        }

        let dot: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
        let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
        let norm_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();

        if norm_a > 0.0 && norm_b > 0.0 {
            dot / (norm_a * norm_b)
        } else {
            0.0
        }
    }

    /// Retourne l'index vectoriel
    pub fn get_index(&self) -> &VectorIndex {
        &self.index
    }

    /// Charge un index depuis un fichier
    pub fn load_index(&mut self, path: &std::path::Path) -> Result<(), MemoryEvolutionError> {
        let content = std::fs::read_to_string(path)?;
        self.index = serde_json::from_str(&content)?;
        info!(
            "[MemoryVectorizer] Loaded index with {} vectors",
            self.index.total_items
        );
        Ok(())
    }

    /// Sauvegarde l'index dans un fichier
    pub fn save_index(&self, path: &std::path::Path) -> Result<(), MemoryEvolutionError> {
        let content = serde_json::to_string_pretty(&self.index)?;
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        std::fs::write(path, content)?;
        info!(
            "[MemoryVectorizer] Saved index with {} vectors",
            self.index.total_items
        );
        Ok(())
    }

    /// Calcule la distance moyenne entre clusters
    pub fn cluster_distance(&self, cluster_a_ids: &[String], cluster_b_ids: &[String]) -> f32 {
        let mut total_distance = 0.0;
        let mut count = 0;

        for a_id in cluster_a_ids {
            if let Some(a_vec) = self.index.vectors.get(a_id) {
                for b_id in cluster_b_ids {
                    if let Some(b_vec) = self.index.vectors.get(b_id) {
                        total_distance +=
                            1.0 - self.cosine_similarity(&a_vec.vector, &b_vec.vector);
                        count += 1;
                    }
                }
            }
        }

        if count > 0 {
            total_distance / count as f32
        } else {
            1.0
        }
    }
}

impl Default for MemoryVectorizer {
    fn default() -> Self {
        Self::new(VectorizerConfig::default())
    }
}
