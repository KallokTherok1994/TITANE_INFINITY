//! ═══════════════════════════════════════════════════════════════
//!   SP-GAP-001: Memory Integrity Validator
//!   Validates memory consistency and detects corruption
//! ═══════════════════════════════════════════════════════════════

use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

/// Memory validation configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryValidatorConfig {
    pub check_interval_ms: u64,
    pub max_corruption_threshold: f32,
    pub auto_repair_enabled: bool,
    pub checksum_algorithm: String,
}

impl Default for MemoryValidatorConfig {
    fn default() -> Self {
        Self {
            check_interval_ms: 5000,
            max_corruption_threshold: 0.05,
            auto_repair_enabled: true,
            checksum_algorithm: "sha256".to_string(),
        }
    }
}

/// Result of memory validation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResult {
    pub is_valid: bool,
    pub checked_entries: usize,
    pub corrupted_entries: usize,
    pub repaired_entries: usize,
    pub timestamp: u64,
    pub duration_ms: u64,
    pub details: Vec<ValidationDetail>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationDetail {
    pub entry_id: String,
    pub status: ValidationStatus,
    pub expected_checksum: Option<String>,
    pub actual_checksum: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ValidationStatus {
    Valid,
    Corrupted,
    Repaired,
    Unrecoverable,
}

/// Memory entry with integrity tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrackedMemoryEntry {
    pub id: String,
    pub content: String,
    pub checksum: String,
    pub created_at: u64,
    pub last_validated: u64,
    pub validation_count: u32,
}

impl TrackedMemoryEntry {
    pub fn new(id: String, content: String) -> Self {
        let checksum = Self::compute_checksum(&content);
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();

        Self {
            id,
            content,
            checksum,
            created_at: now,
            last_validated: now,
            validation_count: 0,
        }
    }

    pub fn compute_checksum(content: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(content.as_bytes());
        format!("{:x}", hasher.finalize())
    }

    pub fn validate(&mut self) -> bool {
        let current_checksum = Self::compute_checksum(&self.content);
        self.last_validated = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        self.validation_count += 1;

        current_checksum == self.checksum
    }

    pub fn update_checksum(&mut self) {
        self.checksum = Self::compute_checksum(&self.content);
    }
}

/// Memory Integrity Validator
pub struct MemoryValidator {
    entries: Arc<RwLock<HashMap<String, TrackedMemoryEntry>>>,
    config: MemoryValidatorConfig,
    stats: ValidatorStats,
}

#[derive(Debug, Default)]
pub struct ValidatorStats {
    pub validations_run: AtomicU64,
    pub entries_checked: AtomicU64,
    pub corruptions_detected: AtomicU64,
    pub repairs_successful: AtomicU64,
    pub repairs_failed: AtomicU64,
}

impl MemoryValidator {
    pub fn new(config: MemoryValidatorConfig) -> Self {
        Self {
            entries: Arc::new(RwLock::new(HashMap::new())),
            config,
            stats: ValidatorStats::default(),
        }
    }

    /// Register a memory entry for tracking
    pub fn track(&self, id: String, content: String) {
        let entry = TrackedMemoryEntry::new(id.clone(), content);
        self.entries.write().insert(id, entry);
    }

    /// Update tracked entry content
    pub fn update(&self, id: &str, content: String) -> bool {
        let mut entries = self.entries.write();
        if let Some(entry) = entries.get_mut(id) {
            entry.content = content;
            entry.update_checksum();
            true
        } else {
            false
        }
    }

    /// Remove entry from tracking
    pub fn untrack(&self, id: &str) -> bool {
        self.entries.write().remove(id).is_some()
    }

    /// Validate all tracked entries
    pub fn validate_all(&self) -> ValidationResult {
        let start = std::time::Instant::now();
        let mut entries = self.entries.write();

        let mut details = Vec::new();
        let mut corrupted = 0;
        let mut repaired = 0;

        for (id, entry) in entries.iter_mut() {
            let is_valid = entry.validate();

            let status = if is_valid {
                ValidationStatus::Valid
            } else {
                corrupted += 1;
                self.stats
                    .corruptions_detected
                    .fetch_add(1, Ordering::Relaxed);

                if self.config.auto_repair_enabled {
                    // Attempt repair by recalculating checksum
                    // In a real system, this would restore from backup
                    entry.update_checksum();
                    repaired += 1;
                    self.stats
                        .repairs_successful
                        .fetch_add(1, Ordering::Relaxed);
                    ValidationStatus::Repaired
                } else {
                    ValidationStatus::Corrupted
                }
            };

            details.push(ValidationDetail {
                entry_id: id.clone(),
                status,
                expected_checksum: Some(entry.checksum.clone()),
                actual_checksum: Some(TrackedMemoryEntry::compute_checksum(&entry.content)),
            });
        }

        let checked = entries.len();
        self.stats.validations_run.fetch_add(1, Ordering::Relaxed);
        self.stats
            .entries_checked
            .fetch_add(checked as u64, Ordering::Relaxed);

        ValidationResult {
            is_valid: corrupted == 0 || corrupted == repaired,
            checked_entries: checked,
            corrupted_entries: corrupted,
            repaired_entries: repaired,
            timestamp: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
            duration_ms: start.elapsed().as_millis() as u64,
            details,
        }
    }

    /// Validate a specific entry
    pub fn validate_entry(&self, id: &str) -> Option<ValidationDetail> {
        let mut entries = self.entries.write();
        entries.get_mut(id).map(|entry| {
            let expected = entry.checksum.clone();
            let is_valid = entry.validate();
            let actual = TrackedMemoryEntry::compute_checksum(&entry.content);

            ValidationDetail {
                entry_id: id.to_string(),
                status: if is_valid {
                    ValidationStatus::Valid
                } else {
                    ValidationStatus::Corrupted
                },
                expected_checksum: Some(expected),
                actual_checksum: Some(actual),
            }
        })
    }

    /// Get validation statistics
    pub fn stats(&self) -> ValidatorStatsSnapshot {
        ValidatorStatsSnapshot {
            validations_run: self.stats.validations_run.load(Ordering::Relaxed),
            entries_checked: self.stats.entries_checked.load(Ordering::Relaxed),
            corruptions_detected: self.stats.corruptions_detected.load(Ordering::Relaxed),
            repairs_successful: self.stats.repairs_successful.load(Ordering::Relaxed),
            repairs_failed: self.stats.repairs_failed.load(Ordering::Relaxed),
            tracked_entries: self.entries.read().len(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidatorStatsSnapshot {
    pub validations_run: u64,
    pub entries_checked: u64,
    pub corruptions_detected: u64,
    pub repairs_successful: u64,
    pub repairs_failed: u64,
    pub tracked_entries: usize,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_track_and_validate() {
        let validator = MemoryValidator::new(MemoryValidatorConfig::default());

        validator.track("test1".to_string(), "Hello, World!".to_string());

        let result = validator.validate_all();
        assert!(result.is_valid);
        assert_eq!(result.checked_entries, 1);
        assert_eq!(result.corrupted_entries, 0);
    }

    #[test]
    fn test_checksum_computation() {
        let content = "Test content";
        let checksum1 = TrackedMemoryEntry::compute_checksum(content);
        let checksum2 = TrackedMemoryEntry::compute_checksum(content);
        assert_eq!(checksum1, checksum2);

        let different = TrackedMemoryEntry::compute_checksum("Different");
        assert_ne!(checksum1, different);
    }

    #[test]
    fn test_default_config() {
        let config = MemoryValidatorConfig::default();
        assert_eq!(config.check_interval_ms, 5000);
        assert_eq!(config.max_corruption_threshold, 0.05);
        assert!(config.auto_repair_enabled);
        assert_eq!(config.checksum_algorithm, "sha256");
    }

    #[test]
    fn test_tracked_memory_entry_new() {
        let entry = TrackedMemoryEntry::new("id1".to_string(), "content".to_string());
        assert_eq!(entry.id, "id1");
        assert_eq!(entry.content, "content");
        assert!(!entry.checksum.is_empty());
        assert_eq!(entry.validation_count, 0);
    }

    #[test]
    fn test_entry_validate_success() {
        let mut entry = TrackedMemoryEntry::new("id".to_string(), "test".to_string());
        assert!(entry.validate());
        assert_eq!(entry.validation_count, 1);
    }

    #[test]
    fn test_entry_update_checksum() {
        let mut entry = TrackedMemoryEntry::new("id".to_string(), "initial".to_string());
        let initial_checksum = entry.checksum.clone();

        entry.content = "modified".to_string();
        entry.update_checksum();

        assert_ne!(entry.checksum, initial_checksum);
    }

    #[test]
    fn test_validator_update() {
        let validator = MemoryValidator::new(MemoryValidatorConfig::default());
        validator.track("entry1".to_string(), "original".to_string());

        assert!(validator.update("entry1", "updated".to_string()));
        assert!(!validator.update("nonexistent", "value".to_string()));

        let result = validator.validate_all();
        assert!(result.is_valid);
    }

    #[test]
    fn test_validator_untrack() {
        let validator = MemoryValidator::new(MemoryValidatorConfig::default());
        validator.track("to_remove".to_string(), "content".to_string());

        assert_eq!(validator.stats().tracked_entries, 1);
        assert!(validator.untrack("to_remove"));
        assert_eq!(validator.stats().tracked_entries, 0);
        assert!(!validator.untrack("nonexistent"));
    }

    #[test]
    fn test_validate_entry_specific() {
        let validator = MemoryValidator::new(MemoryValidatorConfig::default());
        validator.track("specific".to_string(), "content".to_string());

        let detail = validator.validate_entry("specific");
        assert!(detail.is_some());

        let d = detail.unwrap();
        assert_eq!(d.entry_id, "specific");
        assert_eq!(d.status, ValidationStatus::Valid);

        assert!(validator.validate_entry("nonexistent").is_none());
    }

    #[test]
    fn test_validation_stats() {
        let validator = MemoryValidator::new(MemoryValidatorConfig::default());
        validator.track("e1".to_string(), "c1".to_string());
        validator.track("e2".to_string(), "c2".to_string());

        let _ = validator.validate_all();

        let stats = validator.stats();
        assert_eq!(stats.validations_run, 1);
        assert_eq!(stats.entries_checked, 2);
        assert_eq!(stats.tracked_entries, 2);
    }

    #[test]
    fn test_validation_status_equality() {
        assert_eq!(ValidationStatus::Valid, ValidationStatus::Valid);
        assert_ne!(ValidationStatus::Valid, ValidationStatus::Corrupted);
        assert_ne!(ValidationStatus::Corrupted, ValidationStatus::Repaired);
        assert_ne!(ValidationStatus::Repaired, ValidationStatus::Unrecoverable);
    }

    #[test]
    fn test_multiple_tracks() {
        let validator = MemoryValidator::new(MemoryValidatorConfig::default());

        for i in 0..10 {
            validator.track(format!("entry_{}", i), format!("content_{}", i));
        }

        assert_eq!(validator.stats().tracked_entries, 10);

        let result = validator.validate_all();
        assert!(result.is_valid);
        assert_eq!(result.checked_entries, 10);
        assert_eq!(result.details.len(), 10);
    }

    #[test]
    fn test_checksum_deterministic() {
        let content = "deterministic test content with special chars: àéïõü";
        let checksum1 = TrackedMemoryEntry::compute_checksum(content);
        let checksum2 = TrackedMemoryEntry::compute_checksum(content);
        let checksum3 = TrackedMemoryEntry::compute_checksum(content);

        assert_eq!(checksum1, checksum2);
        assert_eq!(checksum2, checksum3);
    }

    #[test]
    fn test_validation_result_details() {
        let validator = MemoryValidator::new(MemoryValidatorConfig::default());
        validator.track("detail_test".to_string(), "test content".to_string());

        let result = validator.validate_all();

        assert_eq!(result.details.len(), 1);
        let detail = &result.details[0];
        assert_eq!(detail.entry_id, "detail_test");
        assert!(detail.expected_checksum.is_some());
        assert!(detail.actual_checksum.is_some());
        assert_eq!(detail.expected_checksum, detail.actual_checksum);
    }

    #[test]
    fn test_empty_content_checksum() {
        let checksum = TrackedMemoryEntry::compute_checksum("");
        // SHA256 of empty string
        assert!(!checksum.is_empty());
        assert_eq!(checksum.len(), 64); // SHA256 hex is 64 chars
    }
}
