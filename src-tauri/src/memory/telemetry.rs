use crate::types::{DiskMode, MemoryDirectoryReport, MemoryFileReport};
use serde_json::Value;
use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

/// Resolve the base directory storing persisted memory JSON files.
pub fn resolve_memory_dir() -> PathBuf {
    if let Ok(custom) = env::var("TITANE_MEMORY_DIR") {
        if !custom.trim().is_empty() {
            return PathBuf::from(custom.trim());
        }
    }

    match env::current_dir() {
        Ok(cwd) => cwd.join("memory"),
        Err(_) => PathBuf::from("memory"),
    }
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
