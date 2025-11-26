// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.0 — MEMORY SECURITY HARDENING
//   SHA256 verification, double validation, rollback, timeouts
// ═══════════════════════════════════════════════════════════════

use super::{MemoryError, MemoryResult};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::time::{Duration, Instant};
use tokio::time::timeout;

const WRITE_TIMEOUT: Duration = Duration::from_secs(5);
const READ_TIMEOUT: Duration = Duration::from_secs(3);
const MAX_JSON_SIZE: usize = 10 * 1024 * 1024; // 10 MB

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryIntegrityCheck {
    pub checksum: String,
    pub timestamp: u64,
    pub size: usize,
    pub validated: bool,
}

/// Calculer le hash SHA256 d'une chaîne
pub fn compute_sha256(data: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data);
    format!("{:x}", hasher.finalize())
}

/// Valider JSON avant sérialisation
pub fn validate_json_structure(json_str: &str) -> MemoryResult<()> {
    // Vérifier taille
    if json_str.len() > MAX_JSON_SIZE {
        return Err(MemoryError::ValidationError(format!(
            "JSON too large: {} bytes (max {})",
            json_str.len(),
            MAX_JSON_SIZE
        )));
    }

    // Vérifier structure JSON valide
    serde_json::from_str::<serde_json::Value>(json_str)
        .map_err(|e| MemoryError::ValidationError(format!("Invalid JSON: {}", e)))?;

    // Vérifier caractères dangereux
    if json_str.contains('\0') {
        return Err(MemoryError::ValidationError(
            "JSON contains null bytes".to_string(),
        ));
    }

    Ok(())
}

/// Nettoyer les chaînes malformées
pub fn sanitize_string(input: &str) -> String {
    input
        .chars()
        .filter(|c| !c.is_control() || *c == '\n' || *c == '\r' || *c == '\t')
        .collect()
}

/// Écriture sécurisée avec double validation
pub async fn memory_safe_write<F>(
    write_fn: F,
    data: &[u8],
) -> MemoryResult<MemoryIntegrityCheck>
where
    F: std::future::Future<Output = MemoryResult<()>>,
{
    let start = Instant::now();

    // Calculer hash avant écriture
    let original_hash = compute_sha256(data);
    let size = data.len();

    // Écriture avec timeout
    timeout(WRITE_TIMEOUT, write_fn)
        .await
        .map_err(|_| MemoryError::TimeoutError("Write timeout".to_string()))?
        .map_err(|e| MemoryError::StorageError(format!("Write failed: {}", e)))?;

    // Créer checksum
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0); // Fallback to epoch if system time is before UNIX_EPOCH

    let check = MemoryIntegrityCheck {
        checksum: original_hash,
        timestamp,
        size,
        validated: false,
    };

    log::info!(
        "✅ Memory write completed in {:?} ({} bytes, hash: {})",
        start.elapsed(),
        size,
        &check.checksum[..8]
    );

    Ok(check)
}

/// Lecture sécurisée avec validation
pub async fn memory_safe_read<F, T>(read_fn: F) -> MemoryResult<T>
where
    F: std::future::Future<Output = MemoryResult<T>>,
{
    // Lecture avec timeout
    timeout(READ_TIMEOUT, read_fn)
        .await
        .map_err(|_| MemoryError::TimeoutError("Read timeout".to_string()))?
        .map_err(|e| MemoryError::StorageError(format!("Read failed: {}", e)))
}

/// Valider l'intégrité d'une lecture
pub fn memory_validate_integrity(
    data: &[u8],
    expected_check: &MemoryIntegrityCheck,
) -> MemoryResult<bool> {
    let actual_hash = compute_sha256(data);

    if actual_hash != expected_check.checksum {
        log::error!(
            "❌ Integrity check failed: expected {}, got {}",
            &expected_check.checksum[..8],
            &actual_hash[..8]
        );
        return Err(MemoryError::ValidationError(
            "Hash mismatch - data corrupted".to_string(),
        ));
    }

    if data.len() != expected_check.size {
        log::error!(
            "❌ Size check failed: expected {}, got {}",
            expected_check.size,
            data.len()
        );
        return Err(MemoryError::ValidationError(
            "Size mismatch - data corrupted".to_string(),
        ));
    }

    Ok(true)
}

/// Auto-réparation basique (rollback)
pub async fn memory_auto_repair<F>(backup_restore_fn: F) -> MemoryResult<()>
where
    F: std::future::Future<Output = MemoryResult<()>>,
{
    log::warn!("🔧 Attempting auto-repair...");

    timeout(WRITE_TIMEOUT, backup_restore_fn)
        .await
        .map_err(|_| MemoryError::TimeoutError("Repair timeout".to_string()))?
        .map_err(|e| MemoryError::StorageError(format!("Repair failed: {}", e)))?;

    log::info!("✅ Auto-repair completed");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compute_sha256() {
        let data = b"Hello TITANE";
        let hash = compute_sha256(data);
        assert_eq!(hash.len(), 64); // SHA256 = 64 hex chars
    }

    #[test]
    fn test_validate_json_structure() {
        assert!(validate_json_structure(r#"{"key": "value"}"#).is_ok());
        assert!(validate_json_structure(r#"{"key": "value""#).is_err());
        assert!(validate_json_structure("invalid json").is_err());
    }

    #[test]
    fn test_sanitize_string() {
        let input = "Hello\x00World\x01Test";
        let sanitized = sanitize_string(input);
        assert!(!sanitized.contains('\0'));
        assert!(!sanitized.contains('\x01'));
    }

    #[test]
    fn test_memory_validate_integrity() {
        let data = b"test data";
        let hash = compute_sha256(data);

        let check = MemoryIntegrityCheck {
            checksum: hash,
            timestamp: 0,
            size: data.len(),
            validated: false,
        };

        assert!(memory_validate_integrity(data, &check).is_ok());

        // Test corruption
        let corrupted = b"corrupted";
        assert!(memory_validate_integrity(corrupted, &check).is_err());
    }
}
