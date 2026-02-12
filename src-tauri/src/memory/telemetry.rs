use crate::types::{DiskMode, MemoryDirectoryReport, MemoryFileReport};
use serde_json::Value;
use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

/// Resolve the base directory storing persisted memory JSON files.
pub fn resolve_memory_dir() -> PathBuf {
    let custom_dir = resolve_env_dir("TITANE_MEMORY_DIR");
    let is_e2e = is_truthy_env("TITANE_E2E");

    if is_e2e {
        if let Some(custom) = custom_dir {
            if is_disallowed_e2e_dir(&custom) {
                return e2e_guard_dir();
            }
            return custom;
        }
        return e2e_guard_dir();
    }

    if let Some(custom) = custom_dir {
        return custom;
    }

    // Default behavior historically used CWD, but packaged artifacts (e.g. AppImage)
    // can run from a read-only mount. In that case, fall back to a writable per-user
    // data directory.
    resolve_default_memory_dir()
}

fn resolve_default_memory_dir() -> PathBuf {
    let cwd_candidate = candidate_cwd_memory_dir();
    if let Some(candidate) = cwd_candidate {
        if fs::create_dir_all(&candidate).is_ok() {
            return candidate;
        }
    }

    // Writability-first fallback: ~/.local/share/titane-infinity/memory (Linux),
    // %LOCALAPPDATA%\titane-infinity\memory (Windows), etc.
    fallback_memory_dir()
}

fn candidate_cwd_memory_dir() -> Option<PathBuf> {
    env::current_dir().ok().map(|cwd| cwd.join("memory"))
}

fn fallback_memory_dir() -> PathBuf {
    let base = dirs::data_local_dir().unwrap_or_else(env::temp_dir);
    base.join("titane-infinity").join("memory")
}

fn resolve_env_dir(var_name: &str) -> Option<PathBuf> {
    env::var(var_name)
        .ok()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
        .map(PathBuf::from)
}

fn is_truthy_env(var_name: &str) -> bool {
    match env::var(var_name) {
        Ok(value) => {
            let normalized = value.trim().to_lowercase();
            matches!(normalized.as_str(), "1" | "true" | "yes" | "on")
        }
        Err(_) => false,
    }
}

fn e2e_guard_dir() -> PathBuf {
    env::temp_dir()
        .join("titane-infinity")
        .join("memory-e2e")
}

fn is_disallowed_e2e_dir(path: &Path) -> bool {
    let cwd_candidate = candidate_cwd_memory_dir();
    let fallback = fallback_memory_dir();
    let matches_cwd = cwd_candidate
        .as_ref()
        .map(|candidate| candidate == path)
        .unwrap_or(false);

    matches_cwd || fallback == path
}

/// Scan the memory directory and return lightweight telemetry for observability.
pub fn scan_memory_directory() -> MemoryDirectoryReport {
    let base_path = resolve_memory_dir();
    let mut report = MemoryDirectoryReport {
        base_path: base_path.to_string_lossy().to_string(),
        missing: !base_path.exists(),
        total_size_bytes: 0,
        files: Vec::new(),
    };

    if report.missing {
        return report;
    }

    let entries = match fs::read_dir(&base_path) {
        Ok(read_dir) => read_dir,
        Err(_) => {
            report.missing = true;
            return report;
        }
    };

    for entry in entries.flatten() {
        let path = entry.path();
        if !path.is_file() {
            continue;
        }

        let metadata = match entry.metadata() {
            Ok(meta) => meta,
            Err(_) => continue,
        };

        let size_bytes = metadata.len();
        report.total_size_bytes += size_bytes;

        let modified_ts = metadata
            .modified()
            .ok()
            .and_then(system_time_to_millis)
            .unwrap_or(0);

        let version = extract_version(&path);

        report.files.push(MemoryFileReport {
            name: path
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or_default()
                .to_string(),
            size_bytes,
            modified_ts,
            version,
        });
    }

    report
}

/// Heuristic disk-mode detection to surface read/write capability to the UI.
pub fn detect_disk_mode(report: &MemoryDirectoryReport) -> DiskMode {
    if report.missing {
        return DiskMode::Disabled;
    }

    if report.files.is_empty() {
        return DiskMode::ReadOnly;
    }

    DiskMode::ReadWrite
}

fn extract_version(path: &Path) -> Option<String> {
    if path.extension().and_then(|ext| ext.to_str()) != Some("json") {
        return None;
    }

    let content = fs::read_to_string(path).ok()?;
    let value: Value = serde_json::from_str(&content).ok()?;
    scan_version(&value)
}

fn scan_version(value: &Value) -> Option<String> {
    if let Some(version) = value.get("version").and_then(|v| v.as_str()) {
        return Some(version.to_string());
    }

    if let Some(obj) = value.as_object() {
        for nested in obj.values() {
            if let Some(found) = scan_version(nested) {
                return Some(found);
            }
        }
    }

    None
}

fn system_time_to_millis(time: SystemTime) -> Option<i64> {
    time.duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .ok()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Mutex;

    static ENV_LOCK: Mutex<()> = Mutex::new(());

    #[test]
    fn test_resolve_memory_dir_default() {
        let _env_guard = ENV_LOCK
            .lock()
            .expect("ENV_LOCK mutex should not be poisoned");
        // Clear env var to test default behavior
        std::env::remove_var("TITANE_MEMORY_DIR");
        std::env::remove_var("TITANE_E2E");

        let dir = resolve_memory_dir();
        assert!(dir.to_string_lossy().contains("memory"));
    }

    #[test]
    fn test_resolve_memory_dir_custom() {
        let _env_guard = ENV_LOCK
            .lock()
            .expect("ENV_LOCK mutex should not be poisoned");
        std::env::set_var("TITANE_MEMORY_DIR", "/custom/memory/path");
        std::env::remove_var("TITANE_E2E");
        let dir = resolve_memory_dir();
        assert_eq!(dir.to_string_lossy(), "/custom/memory/path");

        // Clean up
        std::env::remove_var("TITANE_MEMORY_DIR");
    }

    #[test]
    fn test_resolve_memory_dir_empty_env() {
        let _env_guard = ENV_LOCK
            .lock()
            .expect("ENV_LOCK mutex should not be poisoned");
        std::env::set_var("TITANE_MEMORY_DIR", "   ");
        std::env::remove_var("TITANE_E2E");
        let dir = resolve_memory_dir();
        // Should fall back to default
        assert!(dir.to_string_lossy().contains("memory"));

        // Clean up
        std::env::remove_var("TITANE_MEMORY_DIR");
    }

    #[test]
    fn test_resolve_memory_dir_e2e_default() {
        let _env_guard = ENV_LOCK
            .lock()
            .expect("ENV_LOCK mutex should not be poisoned");
        std::env::remove_var("TITANE_MEMORY_DIR");
        std::env::set_var("TITANE_E2E", "1");

        let dir = resolve_memory_dir();
        assert!(dir.to_string_lossy().ends_with("memory-e2e"));

        std::env::remove_var("TITANE_E2E");
    }

    #[test]
    fn test_resolve_memory_dir_e2e_custom_override() {
        let _env_guard = ENV_LOCK
            .lock()
            .expect("ENV_LOCK mutex should not be poisoned");
        let custom_dir = env::temp_dir().join("titane_e2e_custom");
        std::env::set_var("TITANE_MEMORY_DIR", custom_dir.to_string_lossy().to_string());
        std::env::set_var("TITANE_E2E", "true");

        let dir = resolve_memory_dir();
        assert_eq!(dir, custom_dir);

        std::env::remove_var("TITANE_MEMORY_DIR");
        std::env::remove_var("TITANE_E2E");
    }

    #[test]
    fn test_resolve_memory_dir_e2e_blocks_default_dir() {
        let _env_guard = ENV_LOCK
            .lock()
            .expect("ENV_LOCK mutex should not be poisoned");
        let default_dir = fallback_memory_dir();
        std::env::set_var("TITANE_MEMORY_DIR", default_dir.to_string_lossy().to_string());
        std::env::set_var("TITANE_E2E", "yes");

        let dir = resolve_memory_dir();
        assert!(dir.to_string_lossy().ends_with("memory-e2e"));

        std::env::remove_var("TITANE_MEMORY_DIR");
        std::env::remove_var("TITANE_E2E");
    }

    #[test]
    fn test_scan_memory_directory_missing() {
        let _env_guard = ENV_LOCK
            .lock()
            .expect("ENV_LOCK mutex should not be poisoned");
        std::env::set_var("TITANE_MEMORY_DIR", "/nonexistent/path/that/does/not/exist");
        let report = scan_memory_directory();

        assert!(report.missing);
        assert_eq!(report.total_size_bytes, 0);
        assert!(report.files.is_empty());

        // Clean up
        std::env::remove_var("TITANE_MEMORY_DIR");
    }

    #[test]
    fn test_detect_disk_mode_disabled() {
        let report = MemoryDirectoryReport {
            base_path: "/nonexistent".to_string(),
            missing: true,
            total_size_bytes: 0,
            files: vec![],
        };

        let mode = detect_disk_mode(&report);
        assert!(matches!(mode, DiskMode::Disabled));
    }

    #[test]
    fn test_detect_disk_mode_readonly() {
        let report = MemoryDirectoryReport {
            base_path: "/some/path".to_string(),
            missing: false,
            total_size_bytes: 0,
            files: vec![],
        };

        let mode = detect_disk_mode(&report);
        assert!(matches!(mode, DiskMode::ReadOnly));
    }

    #[test]
    fn test_detect_disk_mode_readwrite() {
        let report = MemoryDirectoryReport {
            base_path: "/some/path".to_string(),
            missing: false,
            total_size_bytes: 1000,
            files: vec![MemoryFileReport {
                name: "test.json".to_string(),
                size_bytes: 1000,
                modified_ts: 12345,
                version: Some("1.0".to_string()),
            }],
        };

        let mode = detect_disk_mode(&report);
        assert!(matches!(mode, DiskMode::ReadWrite));
    }

    #[test]
    fn test_memory_file_report_creation() {
        let report = MemoryFileReport {
            name: "memory.json".to_string(),
            size_bytes: 2048,
            modified_ts: 1234567890000,
            version: Some("2.0".to_string()),
        };

        assert_eq!(report.name, "memory.json");
        assert_eq!(report.size_bytes, 2048);
        assert!(report.version.is_some());
    }

    #[test]
    fn test_memory_file_report_no_version() {
        let report = MemoryFileReport {
            name: "data.bin".to_string(),
            size_bytes: 512,
            modified_ts: 999,
            version: None,
        };

        assert!(report.version.is_none());
    }

    #[test]
    fn test_memory_directory_report_creation() {
        let report = MemoryDirectoryReport {
            base_path: "/path/to/memory".to_string(),
            missing: false,
            total_size_bytes: 4096,
            files: vec![],
        };

        assert_eq!(report.base_path, "/path/to/memory");
        assert!(!report.missing);
        assert_eq!(report.total_size_bytes, 4096);
    }

    #[test]
    fn test_memory_directory_report_with_files() {
        let file1 = MemoryFileReport {
            name: "file1.json".to_string(),
            size_bytes: 100,
            modified_ts: 1000,
            version: None,
        };

        let file2 = MemoryFileReport {
            name: "file2.json".to_string(),
            size_bytes: 200,
            modified_ts: 2000,
            version: Some("1.0".to_string()),
        };

        let report = MemoryDirectoryReport {
            base_path: "/memory".to_string(),
            missing: false,
            total_size_bytes: 300,
            files: vec![file1, file2],
        };

        assert_eq!(report.files.len(), 2);
        assert_eq!(report.total_size_bytes, 300);
    }

    #[test]
    fn test_system_time_to_millis() {
        let now = SystemTime::now();
        let millis = system_time_to_millis(now);

        assert!(millis.is_some());
        assert!(millis.expect("conversion should return millis for now") > 0);
    }

    #[test]
    fn test_system_time_to_millis_epoch() {
        let epoch = UNIX_EPOCH;
        let millis = system_time_to_millis(epoch);

        assert!(millis.is_some());
        assert_eq!(millis.expect("epoch conversion should be zero millis"), 0);
    }

    #[test]
    fn test_extract_version_non_json() {
        let path = Path::new("/some/file.txt");
        let result = extract_version(path);
        assert!(result.is_none());
    }

    #[test]
    fn test_scan_version_with_version() {
        let json_value: Value = serde_json::json!({
            "version": "3.0.0",
            "data": {}
        });

        let version = scan_version(&json_value);
        assert_eq!(version, Some("3.0.0".to_string()));
    }

    #[test]
    fn test_scan_version_without_version() {
        let json_value: Value = serde_json::json!({
            "data": {},
            "count": 42
        });

        let version = scan_version(&json_value);
        assert!(version.is_none());
    }

    #[test]
    fn test_scan_version_nested() {
        let json_value: Value = serde_json::json!({
            "outer": {
                "inner": {
                    "version": "nested-version"
                }
            }
        });

        let version = scan_version(&json_value);
        assert_eq!(version, Some("nested-version".to_string()));
    }

    #[test]
    fn test_scan_version_non_string() {
        let json_value: Value = serde_json::json!({
            "version": 123
        });

        let version = scan_version(&json_value);
        // version is not a string, so should be None
        assert!(version.is_none());
    }
}
