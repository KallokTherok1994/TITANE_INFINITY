// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — MEMORY COMPRESSOR v∞
//   Compression LZ4 + Compression Cognitive IA
//   Réduction taille avec préservation sémantique
// ═══════════════════════════════════════════════════════════════

use super::{MemoryEvolutionError, MemoryItem, MemoryLevel};
use log::info;
use serde::{Deserialize, Serialize};

/// Bloc mémoire compressé
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompressedMemoryBlock {
    pub id: String,
    pub compression_type: CompressionType,
    pub original_size: usize,
    pub compressed_size: usize,
    pub preserve_ratio: f32,
    pub source_items: Vec<String>,
    pub compressed_data: Option<Vec<u8>>,
    pub cognitive_summary: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CompressionType {
    /// Compression LZ4 binaire
    Lz4,
    /// Compression cognitive (résumé IA)
    Cognitive,
    /// Hybride (LZ4 + cognitive)
    Hybrid,
    /// Aucune compression
    None,
}

/// Résultat de compression
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompressionResult {
    pub blocks: Vec<CompressedMemoryBlock>,
    pub total_original_size: usize,
    pub total_compressed_size: usize,
    pub overall_ratio: f32,
    pub items_processed: usize,
    pub compression_stats: CompressionStats,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompressionStats {
    pub lz4_blocks: usize,
    pub cognitive_blocks: usize,
    pub hybrid_blocks: usize,
    pub avg_preserve_ratio: f32,
    pub space_saved_bytes: usize,
}

/// Memory Compressor Engine
pub struct MemoryCompressor {
    config: CompressorConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompressorConfig {
    /// Seuil de taille pour compression (bytes)
    pub compression_threshold: usize,
    /// Ratio de préservation minimum
    pub min_preserve_ratio: f32,
    /// Méthode de compression préférée
    pub preferred_method: CompressionType,
    /// Activer compression cognitive
    pub cognitive_enabled: bool,
    /// Niveau de compression LZ4 (1-12)
    pub lz4_level: i32,
}

impl Default for CompressorConfig {
    fn default() -> Self {
        Self {
            compression_threshold: 1024, // 1KB
            min_preserve_ratio: 0.85,
            preferred_method: CompressionType::Hybrid,
            cognitive_enabled: true,
            lz4_level: 6,
        }
    }
}

impl MemoryCompressor {
    pub fn new(config: CompressorConfig) -> Self {
        Self { config }
    }

    /// Compresse un ensemble d'items mémoire
    pub fn compress(&self, items: &[MemoryItem]) -> Result<CompressionResult, MemoryEvolutionError> {
        info!("[MemoryCompressor] Compressing {} items", items.len());

        let mut blocks = Vec::new();
        let mut total_original = 0usize;
        let mut total_compressed = 0usize;
        let mut lz4_count = 0usize;
        let mut cognitive_count = 0usize;
        let mut hybrid_count = 0usize;

        // Grouper les items par niveau pour compression optimale
        let mut by_level: std::collections::HashMap<MemoryLevel, Vec<&MemoryItem>> = std::collections::HashMap::new();
        for item in items {
            by_level.entry(item.level).or_default().push(item);
        }

        for (level, level_items) in by_level {
            // Déterminer la méthode de compression
            let method = self.select_compression_method(&level_items);

            let block = match method {
                CompressionType::Lz4 => {
                    lz4_count += 1;
                    self.compress_lz4(&level_items)?
                }
                CompressionType::Cognitive => {
                    cognitive_count += 1;
                    self.compress_cognitive(&level_items)?
                }
                CompressionType::Hybrid => {
                    hybrid_count += 1;
                    self.compress_hybrid(&level_items)?
                }
                CompressionType::None => {
                    self.create_uncompressed_block(&level_items)
                }
            };

            total_original += block.original_size;
            total_compressed += block.compressed_size;
            blocks.push(block);
        }

        let overall_ratio = if total_original > 0 {
            total_compressed as f32 / total_original as f32
        } else {
            1.0
        };

        let avg_preserve = if !blocks.is_empty() {
            blocks.iter().map(|b| b.preserve_ratio).sum::<f32>() / blocks.len() as f32
        } else {
            1.0
        };

        info!(
            "[MemoryCompressor] Compressed {} -> {} bytes (ratio: {:.2})",
            total_original, total_compressed, overall_ratio
        );

        Ok(CompressionResult {
            blocks,
            total_original_size: total_original,
            total_compressed_size: total_compressed,
            overall_ratio,
            items_processed: items.len(),
            compression_stats: CompressionStats {
                lz4_blocks: lz4_count,
                cognitive_blocks: cognitive_count,
                hybrid_blocks: hybrid_count,
                avg_preserve_ratio: avg_preserve,
                space_saved_bytes: total_original.saturating_sub(total_compressed),
            },
        })
    }

    /// Sélectionne la méthode de compression optimale
    fn select_compression_method(&self, items: &[&MemoryItem]) -> CompressionType {
        if items.is_empty() {
            return CompressionType::None;
        }

        let total_size: usize = items.iter().map(|i| i.content.len()).sum();

        if total_size < self.config.compression_threshold {
            return CompressionType::None;
        }

        // LT et ELT -> cognitive préféré
        let has_lt = items.iter().any(|i|
            i.level == MemoryLevel::LT || i.level == MemoryLevel::ELT
        );

        if has_lt && self.config.cognitive_enabled {
            CompressionType::Hybrid
        } else if self.config.cognitive_enabled && items.len() > 5 {
            CompressionType::Cognitive
        } else {
            CompressionType::Lz4
        }
    }

    /// Compression LZ4 (simulée avec encodage simple)
    fn compress_lz4(&self, items: &[&MemoryItem]) -> Result<CompressedMemoryBlock, MemoryEvolutionError> {
        let content = self.serialize_items(items);
        let original_size = content.len();

        // Compression simple (simulation - en production utiliser lz4_flex)
        let compressed = content.as_bytes().to_vec();
        let compressed_size = compressed.len();

        Ok(CompressedMemoryBlock {
            id: uuid::Uuid::new_v4().to_string(),
            compression_type: CompressionType::Lz4,
            original_size,
            compressed_size,
            preserve_ratio: 1.0, // LZ4 est sans perte
            source_items: items.iter().map(|i| i.id.clone()).collect(),
            compressed_data: Some(compressed),
            cognitive_summary: None,
            created_at: chrono::Utc::now().to_rfc3339(),
        })
    }

    /// Compression cognitive (résumé IA)
    fn compress_cognitive(&self, items: &[&MemoryItem]) -> Result<CompressedMemoryBlock, MemoryEvolutionError> {
        let original_size: usize = items.iter().map(|i| i.content.len()).sum();

        // Générer un résumé cognitif
        let summary = self.generate_cognitive_summary(items);
        let compressed_size = summary.len();

        // Calculer le ratio de préservation (estimation)
        let key_concepts = self.count_preserved_concepts(items, &summary);
        let total_concepts = self.count_total_concepts(items);
        let preserve_ratio = if total_concepts > 0 {
            (key_concepts as f32 / total_concepts as f32).min(1.0)
        } else {
            0.9 // Default assumption
        };

        Ok(CompressedMemoryBlock {
            id: uuid::Uuid::new_v4().to_string(),
            compression_type: CompressionType::Cognitive,
            original_size,
            compressed_size,
            preserve_ratio,
            source_items: items.iter().map(|i| i.id.clone()).collect(),
            compressed_data: None,
            cognitive_summary: Some(summary),
            created_at: chrono::Utc::now().to_rfc3339(),
        })
    }

    /// Compression hybride (LZ4 + cognitive)
    fn compress_hybrid(&self, items: &[&MemoryItem]) -> Result<CompressedMemoryBlock, MemoryEvolutionError> {
        let original_size: usize = items.iter().map(|i| i.content.len()).sum();

        // Générer résumé cognitif
        let summary = self.generate_cognitive_summary(items);

        // Compression simple (simulation - en production utiliser lz4_flex)
        let compressed = summary.as_bytes().to_vec();
        let compressed_size = compressed.len();

        // Calculer preserve ratio
        let key_concepts = self.count_preserved_concepts(items, &summary);
        let total_concepts = self.count_total_concepts(items);
        let preserve_ratio = if total_concepts > 0 {
            (key_concepts as f32 / total_concepts as f32).min(1.0)
        } else {
            0.9
        };

        Ok(CompressedMemoryBlock {
            id: uuid::Uuid::new_v4().to_string(),
            compression_type: CompressionType::Hybrid,
            original_size,
            compressed_size,
            preserve_ratio,
            source_items: items.iter().map(|i| i.id.clone()).collect(),
            compressed_data: Some(compressed),
            cognitive_summary: Some(summary),
            created_at: chrono::Utc::now().to_rfc3339(),
        })
    }

    /// Crée un bloc non compressé
    fn create_uncompressed_block(&self, items: &[&MemoryItem]) -> CompressedMemoryBlock {
        let content = self.serialize_items(items);
        let size = content.len();

        CompressedMemoryBlock {
            id: uuid::Uuid::new_v4().to_string(),
            compression_type: CompressionType::None,
            original_size: size,
            compressed_size: size,
            preserve_ratio: 1.0,
            source_items: items.iter().map(|i| i.id.clone()).collect(),
            compressed_data: Some(content.into_bytes()),
            cognitive_summary: None,
            created_at: chrono::Utc::now().to_rfc3339(),
        }
    }

    /// Sérialise les items en JSON
    fn serialize_items(&self, items: &[&MemoryItem]) -> String {
        serde_json::to_string(&items).unwrap_or_default()
    }

    /// Génère un résumé cognitif
    fn generate_cognitive_summary(&self, items: &[&MemoryItem]) -> String {
        // En production, cela utiliserait Ollama
        // Ici, on génère un résumé structuré

        let topics: Vec<_> = items.iter()
            .filter_map(|i| i.topic.clone())
            .collect::<std::collections::HashSet<_>>()
            .into_iter()
            .collect();

        let avg_confidence = items.iter().map(|i| i.confidence).sum::<f32>() / items.len() as f32;

        let key_words = self.extract_key_words(items);

        format!(
            "## Résumé Cognitif TITANE∞\n\n\
            **Items consolidés:** {}\n\
            **Topics:** {}\n\
            **Confiance moyenne:** {:.2}\n\
            **Concepts clés:** {}\n\n\
            Cette compression cognitive préserve l'essence sémantique \
            tout en réduisant l'empreinte mémoire.",
            items.len(),
            topics.join(", "),
            avg_confidence,
            key_words.join(", ")
        )
    }

    /// Extrait les mots-clés principaux
    fn extract_key_words(&self, items: &[&MemoryItem]) -> Vec<String> {
        let mut word_count: std::collections::HashMap<String, usize> = std::collections::HashMap::new();

        for item in items {
            for word in item.content.split_whitespace() {
                let clean = word.to_lowercase()
                    .trim_matches(|c: char| !c.is_alphanumeric())
                    .to_string();
                if clean.len() > 4 {
                    *word_count.entry(clean).or_insert(0) += 1;
                }
            }
        }

        let mut sorted: Vec<_> = word_count.into_iter().collect();
        sorted.sort_by(|a, b| b.1.cmp(&a.1));

        sorted.into_iter().take(10).map(|(w, _)| w).collect()
    }

    /// Compte les concepts préservés dans le résumé
    fn count_preserved_concepts(&self, items: &[&MemoryItem], summary: &str) -> usize {
        let summary_lower = summary.to_lowercase();
        let key_words = self.extract_key_words(items);

        key_words.iter()
            .filter(|w| summary_lower.contains(&w.to_lowercase()))
            .count()
    }

    /// Compte le nombre total de concepts
    fn count_total_concepts(&self, items: &[&MemoryItem]) -> usize {
        self.extract_key_words(items).len()
    }

    /// Décompresse un bloc LZ4 (simulé)
    pub fn decompress_lz4(&self, block: &CompressedMemoryBlock) -> Result<Vec<MemoryItem>, MemoryEvolutionError> {
        if let Some(data) = &block.compressed_data {
            // Décompression simple (simulation - en production utiliser lz4_flex)
            let decompressed = data.clone();

            let json = String::from_utf8(decompressed)
                .map_err(|e| MemoryEvolutionError::CompressionError(e.to_string()))?;

            let items: Vec<MemoryItem> = serde_json::from_str(&json)?;
            Ok(items)
        } else {
            Err(MemoryEvolutionError::CompressionError("No compressed data".to_string()))
        }
    }

    /// Estime l'économie d'espace pour un ensemble d'items
    pub fn estimate_savings(&self, items: &[MemoryItem]) -> CompressionEstimate {
        let total_size: usize = items.iter().map(|i| i.content.len()).sum();

        // Estimation LZ4: ~50-70% de l'original
        let lz4_estimate = (total_size as f32 * 0.6) as usize;

        // Estimation cognitive: ~20-30% de l'original
        let cognitive_estimate = (total_size as f32 * 0.25) as usize;

        // Hybride: ~15-25%
        let hybrid_estimate = (total_size as f32 * 0.2) as usize;

        CompressionEstimate {
            original_size: total_size,
            lz4_estimated: lz4_estimate,
            cognitive_estimated: cognitive_estimate,
            hybrid_estimated: hybrid_estimate,
            recommended_method: if items.len() > 5 && self.config.cognitive_enabled {
                CompressionType::Hybrid
            } else {
                CompressionType::Lz4
            },
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompressionEstimate {
    pub original_size: usize,
    pub lz4_estimated: usize,
    pub cognitive_estimated: usize,
    pub hybrid_estimated: usize,
    pub recommended_method: CompressionType,
}

impl Default for MemoryCompressor {
    fn default() -> Self {
        Self::new(CompressorConfig::default())
    }
}
