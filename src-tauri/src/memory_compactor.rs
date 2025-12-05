/**
 * TITANE∞ v14.0 — Memory Compactor Module
 * ═════════════════════════════════════════
 *
 * Compression cognitive: tri, nettoyage, optimisation mémoire
 * Intégré dans Auto-Verify pour maintenance automatique
 */
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::Path;

/// Configuration du compacteur
#[derive(Debug, Clone)]
pub struct CompactorConfig {
    /// Taille maximale d'un fichier mémoire (en bytes)
    pub max_file_size: usize,
    /// Nombre maximum d'entrées par fichier
    pub max_entries: usize,
    /// Activer la compression (suppression doublons)
    pub enable_deduplication: bool,
    /// Activer le tri chronologique
    pub enable_sorting: bool,
}

impl Default for CompactorConfig {
    fn default() -> Self {
        Self {
            max_file_size: 10 * 1024 * 1024, // 10 MB
            max_entries: 10_000,
            enable_deduplication: true,
            enable_sorting: true,
        }
    }
}

/// Entrée de mémoire générique
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct MemoryEntry {
    pub id: String,
    pub timestamp: i64,
    pub content: String,
    #[serde(default)]
    pub metadata: HashMap<String, String>,
}

/// Résultat du compactage
#[derive(Debug)]
pub struct CompactionResult {
    pub original_entries: usize,
    pub compacted_entries: usize,
    pub duplicates_removed: usize,
    pub original_size_bytes: usize,
    pub compacted_size_bytes: usize,
    pub compression_ratio: f64,
}

/// Compacteur de mémoire
pub struct MemoryCompactor {
    config: CompactorConfig,
}

impl MemoryCompactor {
    /// Crée un nouveau compacteur avec config par défaut
    pub fn new() -> Self {
        Self {
            config: CompactorConfig::default(),
        }
    }

    /// Crée un nouveau compacteur avec config custom
    pub fn with_config(config: CompactorConfig) -> Self {
        Self { config }
    }

    /// Compacte un fichier JSON de mémoire
    pub fn compact_file<P: AsRef<Path>>(&self, path: P) -> Result<CompactionResult, String> {
        let path = path.as_ref();

        // Lecture du fichier
        let content =
            fs::read_to_string(path).map_err(|e| format!("Failed to read file: {}", e))?;

        let original_size = content.len();

        // Parse JSON
        let entries: Vec<MemoryEntry> =
            serde_json::from_str(&content).map_err(|e| format!("Failed to parse JSON: {}", e))?;

        let original_count = entries.len();

        // Compactage
        let mut compacted = entries;

        // 1. Déduplication
        let duplicates_removed = if self.config.enable_deduplication {
            let before = compacted.len();
            compacted = self.deduplicate(compacted);
            before - compacted.len()
        } else {
            0
        };

        // 2. Tri chronologique
        if self.config.enable_sorting {
            compacted.sort_by_key(|e| e.timestamp);
        }

        // 3. Limitation du nombre d'entrées
        if compacted.len() > self.config.max_entries {
            compacted.truncate(self.config.max_entries);
        }

        let compacted_count = compacted.len();

        // Sérialisation
        let compacted_json = serde_json::to_string_pretty(&compacted)
            .map_err(|e| format!("Failed to serialize JSON: {}", e))?;

        let compacted_size = compacted_json.len();

        // Vérification de la taille
        if compacted_size > self.config.max_file_size {
            return Err(format!(
                "Compacted file size ({} bytes) exceeds maximum ({} bytes)",
                compacted_size, self.config.max_file_size
            ));
        }

        // Écriture du fichier compacté
        fs::write(path, compacted_json).map_err(|e| format!("Failed to write file: {}", e))?;

        // Calcul des métriques
        let compression_ratio = if original_size > 0 {
            (original_size - compacted_size) as f64 / original_size as f64 * 100.0
        } else {
            0.0
        };

        Ok(CompactionResult {
            original_entries: original_count,
            compacted_entries: compacted_count,
            duplicates_removed,
            original_size_bytes: original_size,
            compacted_size_bytes: compacted_size,
            compression_ratio,
        })
    }

    /// Supprime les doublons (basé sur id + timestamp)
    fn deduplicate(&self, entries: Vec<MemoryEntry>) -> Vec<MemoryEntry> {
        let mut seen = HashMap::new();
        let mut unique = Vec::new();

        for entry in entries {
            let key = format!("{}_{}", entry.id, entry.timestamp);
            if let std::collections::hash_map::Entry::Vacant(e) = seen.entry(key) {
                e.insert(true);
                unique.push(entry);
            }
        }

        unique
    }

    /// Compacte tous les fichiers d'un répertoire
    pub fn compact_directory<P: AsRef<Path>>(
        &self,
        dir: P,
    ) -> Result<Vec<CompactionResult>, String> {
        let dir = dir.as_ref();

        if !dir.is_dir() {
            return Err(format!("{:?} is not a directory", dir));
        }

        let mut results = Vec::new();

        for entry in fs::read_dir(dir).map_err(|e| format!("Failed to read directory: {}", e))? {
            let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
            let path = entry.path();

            if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("json") {
                match self.compact_file(&path) {
                    Ok(result) => {
                        log::info!(
                            "Compacted {:?}: {} -> {} entries",
                            path,
                            result.original_entries,
                            result.compacted_entries
                        );
                        results.push(result);
                    }
                    Err(e) => {
                        log::warn!("Failed to compact {:?}: {}", path, e);
                    }
                }
            }
        }

        Ok(results)
    }

    /// Valide l'intégrité d'un fichier mémoire
    pub fn validate_file<P: AsRef<Path>>(&self, path: P) -> Result<bool, String> {
        let path = path.as_ref();

        // Vérification existence
        if !path.exists() {
            return Err(format!("File does not exist: {:?}", path));
        }

        // Vérification taille
        let metadata = fs::metadata(path).map_err(|e| format!("Failed to read metadata: {}", e))?;

        if metadata.len() as usize > self.config.max_file_size {
            return Err(format!("File too large: {} bytes", metadata.len()));
        }

        // Vérification JSON
        let content =
            fs::read_to_string(path).map_err(|e| format!("Failed to read file: {}", e))?;

        let entries: Vec<MemoryEntry> =
            serde_json::from_str(&content).map_err(|e| format!("Invalid JSON: {}", e))?;

        // Vérification nombre d'entrées
        if entries.len() > self.config.max_entries {
            return Err(format!("Too many entries: {}", entries.len()));
        }

        Ok(true)
    }
}

impl Default for MemoryCompactor {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_deduplication() {
        let compactor = MemoryCompactor::new();

        let entries = vec![
            MemoryEntry {
                id: "1".to_string(),
                timestamp: 1000,
                content: "test".to_string(),
                metadata: HashMap::new(),
            },
            MemoryEntry {
                id: "1".to_string(),
                timestamp: 1000,
                content: "test".to_string(),
                metadata: HashMap::new(),
            },
            MemoryEntry {
                id: "2".to_string(),
                timestamp: 2000,
                content: "test2".to_string(),
                metadata: HashMap::new(),
            },
        ];

        let unique = compactor.deduplicate(entries);
        assert_eq!(unique.len(), 2);
    }
}
