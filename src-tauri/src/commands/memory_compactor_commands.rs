/**
 * TITANE∞ v14.0 — Memory Compactor Commands
 * ══════════════════════════════════════════
 *
 * Commandes Tauri pour compacter et valider la mémoire
 */
use crate::memory_compactor::{MemoryCompactor, CompactorConfig, CompactionResult};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Serialize)]
pub struct CompactionStats {
    pub files_processed: usize,
    pub total_entries_before: usize,
    pub total_entries_after: usize,
    pub duplicates_removed: usize,
    pub total_size_before_bytes: usize,
    pub total_size_after_bytes: usize,
    pub average_compression_ratio: f64,
}

/// Compacte un fichier mémoire spécifique
#[tauri::command]
pub fn compact_memory_file(path: String) -> Result<String, String> {
    let compactor = MemoryCompactor::new();

    let result = compactor.compact_file(&path)?;

    Ok(format!(
        "Compacted {} -> {} entries ({:.2}% compression)",
        result.original_entries,
        result.compacted_entries,
        result.compression_ratio
    ))
}

/// Compacte tous les fichiers d'un répertoire mémoire
#[tauri::command]
pub fn compact_memory_directory(dir: String) -> Result<CompactionStats, String> {
    let compactor = MemoryCompactor::new();

    let results = compactor.compact_directory(&dir)?;

    let stats = CompactionStats {
        files_processed: results.len(),
        total_entries_before: results.iter().map(|r| r.original_entries).sum(),
        total_entries_after: results.iter().map(|r| r.compacted_entries).sum(),
        duplicates_removed: results.iter().map(|r| r.duplicates_removed).sum(),
        total_size_before_bytes: results.iter().map(|r| r.original_size_bytes).sum(),
        total_size_after_bytes: results.iter().map(|r| r.compacted_size_bytes).sum(),
        average_compression_ratio: if results.is_empty() {
            0.0
        } else {
            results.iter().map(|r| r.compression_ratio).sum::<f64>() / results.len() as f64
        },
    };

    Ok(stats)
}

/// Valide l'intégrité d'un fichier mémoire
#[tauri::command]
pub fn validate_memory_file(path: String) -> Result<String, String> {
    let compactor = MemoryCompactor::new();

    compactor.validate_file(&path)?;

    Ok(format!("Memory file is valid: {}", path))
}

/// Compacte les répertoires standards de TITANE∞
#[tauri::command]
pub fn auto_compact_memory() -> Result<CompactionStats, String> {
    let compactor = MemoryCompactor::new();

    // Répertoires à compacter
    let dirs = vec!["memory", ".titane"];
    let mut all_results = Vec::new();

    for dir in dirs {
        if let Ok(results) = compactor.compact_directory(dir) {
            all_results.extend(results);
        }
    }

    let stats = CompactionStats {
        files_processed: all_results.len(),
        total_entries_before: all_results.iter().map(|r| r.original_entries).sum(),
        total_entries_after: all_results.iter().map(|r| r.compacted_entries).sum(),
        duplicates_removed: all_results.iter().map(|r| r.duplicates_removed).sum(),
        total_size_before_bytes: all_results.iter().map(|r| r.original_size_bytes).sum(),
        total_size_after_bytes: all_results.iter().map(|r| r.compacted_size_bytes).sum(),
        average_compression_ratio: if all_results.is_empty() {
            0.0
        } else {
            all_results.iter().map(|r| r.compression_ratio).sum::<f64>() / all_results.len() as f64
        },
    };

    log::info!("Auto-compact completed: {} files processed", stats.files_processed);

    Ok(stats)
}
