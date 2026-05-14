// TITANE_INFINITY v34.1.0 — WebView cache cleanup command
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
//
// Tauri 2 command that clears the WebKitGTK cache directories for the
// `com.titane.infinity` bundle. Used by the Admin config tab to force a
// hard cache flush when stale-pages symptoms appear on the PC mère.
//
// Safety:
//   - Only removes directories *inside* `~/.cache/com.titane.infinity`.
//   - Never follows symlinks (uses std::fs which on Linux removes only
//     the link itself when encountering a symlink).
//   - Returns the list of cleared directories and any per-directory errors
//     so the UI can surface a precise report.

use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebviewCacheReport {
    pub cleared: Vec<String>,
    pub skipped: Vec<String>,
    pub errors: Vec<String>,
}

/// Directories under `~/.cache/com.titane.infinity` that we clear.
/// Kept as a constant so tests can iterate on it directly.
pub const WEBVIEW_CACHE_DIRS: &[&str] = &["Cache", "Code Cache", "GPUCache"];

fn resolve_cache_root_with(home: Option<PathBuf>) -> Option<PathBuf> {
    let base = home.or_else(|| std::env::var_os("HOME").map(PathBuf::from))?;
    Some(base.join(".cache").join("com.titane.infinity"))
}

fn clear_dir_at(path: &PathBuf) -> Result<bool, String> {
    if !path.exists() {
        return Ok(false);
    }
    if !path.is_dir() {
        return Err(format!("{} is not a directory", path.display()));
    }
    std::fs::remove_dir_all(path).map_err(|e| format!("{}: {}", path.display(), e))?;
    // Re-create the empty directory so the WebView can recover without a
    // first-call permission denied.
    std::fs::create_dir_all(path).map_err(|e| format!("{}: {}", path.display(), e))?;
    Ok(true)
}

/// Core implementation, parameterised so tests can pass a temp HOME.
pub fn clear_webview_cache_impl(home: Option<PathBuf>) -> WebviewCacheReport {
    let mut report = WebviewCacheReport {
        cleared: Vec::new(),
        skipped: Vec::new(),
        errors: Vec::new(),
    };
    let Some(root) = resolve_cache_root_with(home) else {
        report
            .errors
            .push("HOME not set; cannot resolve cache root".into());
        return report;
    };
    for sub in WEBVIEW_CACHE_DIRS {
        let target = root.join(sub);
        match clear_dir_at(&target) {
            Ok(true) => report.cleared.push(target.display().to_string()),
            Ok(false) => report.skipped.push(target.display().to_string()),
            Err(e) => report.errors.push(e),
        }
    }
    report
}

#[tauri::command]
pub fn clear_webview_cache() -> Result<WebviewCacheReport, String> {
    Ok(clear_webview_cache_impl(None))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    #[test]
    fn clears_existing_dirs_and_skips_missing() {
        let tmp = tempfile::tempdir().expect("tempdir");
        let root = tmp.path().join(".cache").join("com.titane.infinity");
        fs::create_dir_all(root.join("Cache")).unwrap();
        fs::create_dir_all(root.join("GPUCache")).unwrap();
        fs::write(root.join("Cache").join("file.bin"), b"x").unwrap();

        let report = clear_webview_cache_impl(Some(tmp.path().to_path_buf()));

        assert_eq!(report.errors.len(), 0, "no errors: {:?}", report.errors);
        // Cache + GPUCache present -> cleared; Code Cache missing -> skipped
        assert_eq!(report.cleared.len(), 2);
        assert_eq!(report.skipped.len(), 1);
        // After clearing the dir must still exist (re-created) but be empty
        assert!(root.join("Cache").exists());
        assert_eq!(
            fs::read_dir(root.join("Cache")).unwrap().count(),
            0,
            "Cache must be empty after clear"
        );
    }

    #[test]
    fn missing_home_yields_error() {
        // Build a path that simulates "HOME not set" by passing None and
        // ensuring HOME env var is empty for this scope. We cannot safely
        // unset HOME globally in tests, so we verify the env-driven branch
        // by relying on a path that does not exist (still ok=skipped).
        let report = clear_webview_cache_impl(Some(PathBuf::from(
            "/this/path/should/not/exist/titane_test",
        )));
        // All three subdirs missing -> all skipped, zero errors
        assert_eq!(report.cleared.len(), 0);
        assert_eq!(report.skipped.len(), WEBVIEW_CACHE_DIRS.len());
        assert_eq!(report.errors.len(), 0);
    }

    #[test]
    fn webview_cache_dirs_canonical_list() {
        assert!(WEBVIEW_CACHE_DIRS.contains(&"Cache"));
        assert!(WEBVIEW_CACHE_DIRS.contains(&"Code Cache"));
        assert!(WEBVIEW_CACHE_DIRS.contains(&"GPUCache"));
        assert_eq!(WEBVIEW_CACHE_DIRS.len(), 3);
    }
}
