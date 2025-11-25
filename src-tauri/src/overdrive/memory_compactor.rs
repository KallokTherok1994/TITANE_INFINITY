// ═══════════════════════════════════════════════════════════════════════════
// TITANE∞ v14 — MEMORY COMPACTOR
// ═══════════════════════════════════════════════════════════════════════════
// Système de compaction, truncation, merge et cleanup mémoire
// Prévention corruption JSON, versioning, garbage collection
// ═══════════════════════════════════════════════════════════════════════════

use crate::core::tapi_error::{TAPIError, TAPIErrorKind};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::{Arc, Mutex};

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURES
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompactionConfig {
    pub max_entries: usize,           // Limite avant compaction
    pub min_importance: f32,          // Importance minimale (0.0-1.0)
    pub max_age_days: u64,            // Âge maximum en jours
    pub preserve_recent_count: usize, // Garder N entrées récentes
    pub merge_similar_threshold: f32, // Seuil similarité pour merge
}

impl Default for CompactionConfig {
    fn default() -> Self {
        Self {
            max_entries: 10000,
            min_importance: 0.3,
            max_age_days: 90,
            preserve_recent_count: 100,
            merge_similar_threshold: 0.95,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompactionReport {
    pub total_before: usize,
    pub total_after: usize,
    pub removed: usize,
    pub merged: usize,
    pub preserved: usize,
    pub space_saved_mb: f32,
    pub duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemorySchema {
    pub version: String,
    pub created_at: u64,
    pub last_compaction: u64,
    pub checksum: String,
}

pub struct MemoryCompactor {
    config: Arc<Mutex<CompactionConfig>>,
    schema: Arc<Mutex<MemorySchema>>,
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIALISATION
// ─────────────────────────────────────────────────────────────────────────────

impl MemoryCompactor {
    pub fn new() -> Self {
        let schema = MemorySchema {
            version: "14.0.0".to_string(),
            created_at: now_timestamp(),
            last_compaction: 0,
            checksum: String::new(),
        };

        Self {
            config: Arc::new(Mutex::new(CompactionConfig::default())),
            schema: Arc::new(Mutex::new(schema)),
        }
    }

    pub fn with_config(config: CompactionConfig) -> Self {
        let schema = MemorySchema {
            version: "14.0.0".to_string(),
            created_at: now_timestamp(),
            last_compaction: 0,
            checksum: String::new(),
        };

        Self {
            config: Arc::new(Mutex::new(config)),
            schema: Arc::new(Mutex::new(schema)),
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPACTION
// ─────────────────────────────────────────────────────────────────────────────

impl MemoryCompactor {
    /// Compacte les entrées mémoire selon la configuration
    pub fn compact<T>(&self, entries: &mut Vec<T>) -> Result<CompactionReport, TAPIError>
    where
        T: CompactableEntry + Clone,
    {
        let start = std::time::Instant::now();
        let total_before = entries.len();

        let config = self
            .config
            .lock()
            .map_err(|_| TAPIError::internal("Config lock poisoned", "memory_compactor"))?;

        println!("[COMPACTOR] Début compaction: {} entrées", total_before);

        // 1. Filtrer par importance
        let mut filtered = self.filter_by_importance(entries, config.min_importance);

        // 2. Filtrer par âge
        filtered = self.filter_by_age(&filtered, config.max_age_days);

        // 3. Préserver entrées récentes
        let preserved = self.preserve_recent(entries, config.preserve_recent_count);

        // 4. Merger entrées similaires
        let merged_count = self.merge_similar(&mut filtered, config.merge_similar_threshold)?;

        // 5. Limiter au max_entries
        if filtered.len() > config.max_entries {
            filtered.truncate(config.max_entries);
        }

        // 6. Combiner preserved + filtered
        let mut result = preserved;
        result.extend(filtered);
        result.sort_by(|a, b| b.get_timestamp().cmp(&a.get_timestamp()));

        let total_after = result.len();
        let removed = total_before.saturating_sub(total_after);
        let duration_ms = start.elapsed().as_millis() as u64;

        *entries = result;

        // Mettre à jour schema
        let mut schema = self
            .schema
            .lock()
            .map_err(|_| TAPIError::internal("Schema lock poisoned", "memory_compactor"))?;
        schema.last_compaction = now_timestamp();
        schema.checksum = calculate_checksum(entries);

        let report = CompactionReport {
            total_before,
            total_after,
            removed,
            merged: merged_count,
            preserved: config.preserve_recent_count,
            space_saved_mb: (removed as f32 * 0.001), // Estimation
            duration_ms,
        };

        println!(
            "[COMPACTOR] Terminé: {} → {} entrées (-{}), {}ms",
            total_before, total_after, removed, duration_ms
        );

        Ok(report)
    }

    fn filter_by_importance<T>(&self, entries: &[T], min_importance: f32) -> Vec<T>
    where
        T: CompactableEntry + Clone,
    {
        entries
            .iter()
            .filter(|e| e.get_importance() >= min_importance)
            .cloned()
            .collect()
    }

    fn filter_by_age<T>(&self, entries: &[T], max_age_days: u64) -> Vec<T>
    where
        T: CompactableEntry + Clone,
    {
        let now = now_timestamp();
        let max_age_secs = max_age_days * 86400;

        entries
            .iter()
            .filter(|e| {
                let age = now.saturating_sub(e.get_timestamp());
                age <= max_age_secs
            })
            .cloned()
            .collect()
    }

    fn preserve_recent<T>(&self, entries: &[T], count: usize) -> Vec<T>
    where
        T: CompactableEntry + Clone,
    {
        let mut sorted = entries.to_vec();
        sorted.sort_by(|a, b| b.get_timestamp().cmp(&a.get_timestamp()));
        sorted.truncate(count);
        sorted
    }

    fn merge_similar<T>(&self, entries: &mut Vec<T>, threshold: f32) -> Result<usize, TAPIError>
    where
        T: CompactableEntry + Clone,
    {
        // TODO: Implémenter merge basé sur embeddings similarity
        // Pour l'instant, retourne 0 (pas de merge)
        let _threshold = threshold;
        Ok(0)
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// GARBAGE COLLECTION
// ─────────────────────────────────────────────────────────────────────────────

impl MemoryCompactor {
    /// Nettoie les fichiers résiduels et corruptions
    pub fn garbage_collect(&self, memory_dir: &PathBuf) -> Result<usize, TAPIError> {
        println!("[COMPACTOR] Garbage collection: {:?}", memory_dir);

        if !memory_dir.exists() {
            return Ok(0);
        }

        let mut cleaned = 0;

        // Rechercher fichiers temporaires (.tmp, .bak, .lock)
        let temp_patterns = vec![".tmp", ".bak", ".lock", ".corrupt"];

        for entry in std::fs::read_dir(memory_dir).map_err(|e| {
            TAPIError::storage(format!("Cannot read memory dir: {}", e), "garbage_collect")
        })? {
            let entry = entry.map_err(|e| {
                TAPIError::storage(format!("Entry error: {}", e), "garbage_collect")
            })?;
            let path = entry.path();

            if let Some(filename) = path.file_name().and_then(|n| n.to_str()) {
                for pattern in &temp_patterns {
                    if filename.ends_with(pattern) {
                        match std::fs::remove_file(&path) {
                            Ok(_) => {
                                println!("[COMPACTOR] Supprimé: {:?}", path);
                                cleaned += 1;
                            }
                            Err(e) => {
                                eprintln!("[COMPACTOR] Échec suppression {:?}: {}", path, e);
                            }
                        }
                        break;
                    }
                }
            }
        }

        println!("[COMPACTOR] GC terminé: {} fichiers nettoyés", cleaned);
        Ok(cleaned)
    }

    /// Vérifie l'intégrité du fichier JSON
    pub fn verify_integrity(&self, data: &str) -> Result<bool, TAPIError> {
        // Vérifier JSON valide
        serde_json::from_str::<serde_json::Value>(data)
            .map_err(|e| TAPIError::parse(format!("JSON invalide: {}", e), "verify_integrity"))?;

        // Vérifier checksum si disponible
        let schema = self
            .schema
            .lock()
            .map_err(|_| TAPIError::internal("Schema lock poisoned", "verify_integrity"))?;

        if !schema.checksum.is_empty() {
            let current_checksum = calculate_checksum_str(data);
            if current_checksum != schema.checksum {
                return Ok(false);
            }
        }

        Ok(true)
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// TRAIT
// ─────────────────────────────────────────────────────────────────────────────

pub trait CompactableEntry {
    fn get_timestamp(&self) -> u64;
    fn get_importance(&self) -> f32;
    fn get_embedding(&self) -> Option<&Vec<f32>>;
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────

fn now_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

fn calculate_checksum<T: Serialize>(data: &[T]) -> String {
    use sha2::{Digest, Sha256};

    let json = serde_json::to_string(data).unwrap_or_default();
    let mut hasher = Sha256::new();
    hasher.update(json.as_bytes());
    format!("{:x}", hasher.finalize())
}

fn calculate_checksum_str(data: &str) -> String {
    use sha2::{Digest, Sha256};

    let mut hasher = Sha256::new();
    hasher.update(data.as_bytes());
    format!("{:x}", hasher.finalize())
}

// ─────────────────────────────────────────────────────────────────────────────
// TAURI COMMANDS
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn memory_compactor_run(
    config: Option<CompactionConfig>,
) -> Result<CompactionReport, TAPIError> {
    let compactor = if let Some(cfg) = config {
        MemoryCompactor::with_config(cfg)
    } else {
        MemoryCompactor::new()
    };

    // TODO: Charger entries depuis memory_engine ou system::memory
    let mut entries: Vec<DummyEntry> = vec![];

    compactor.compact(&mut entries)
}

#[tauri::command]
pub fn memory_compactor_gc(memory_path: String) -> Result<usize, TAPIError> {
    let compactor = MemoryCompactor::new();
    let path = PathBuf::from(memory_path);
    compactor.garbage_collect(&path)
}

// Dummy entry pour compilation
#[derive(Clone, Serialize, Deserialize)]
struct DummyEntry {
    timestamp: u64,
    importance: f32,
}

impl CompactableEntry for DummyEntry {
    fn get_timestamp(&self) -> u64 {
        self.timestamp
    }

    fn get_importance(&self) -> f32 {
        self.importance
    }

    fn get_embedding(&self) -> Option<&Vec<f32>> {
        None
    }
}
