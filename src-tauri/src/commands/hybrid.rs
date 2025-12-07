// TITANE∞ v∞.26.0 — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ HYBRID ENGINE BACKEND COMMANDS
//   Rust Tauri handlers for dev operations
// ═══════════════════════════════════════════════════════════════════════════

#[allow(dead_code)]
use std::process::{Command as ProcessCommand, Stdio};
use std::io::{BufRead, BufReader};
use std::fs;
use std::path::Path;
use serde::{Deserialize, Serialize};
use tauri::command;

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandResult {
    pub output: String,
    pub exit_code: i32,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileInspection {
    pub path: String,
    pub exists: bool,
    pub size: Option<u64>,
    pub content: Option<String>,
    pub lines: Option<usize>,
    pub analysis: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeDiagnostic {
    pub target: String,
    pub health: String, // "healthy" | "warning" | "error"
    pub issues: Vec<String>,
    pub suggestions: Vec<String>,
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMANDS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Execute a shell command in the system
 * Used for: cargo, npm, git, etc.
 */
#[command]
pub async fn dev_run_command(command: String) -> Result<CommandResult, String> {
    log::info!("🔧 [Hybrid] Running command: {}", command);

    let parts: Vec<&str> = command.split_whitespace().collect();
    if parts.is_empty() {
        return Err("Empty command".to_string());
    }

    let program = parts[0];
    let args = &parts[1..];

    match ProcessCommand::new(program)
        .args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
    {
        Ok(mut child) => {
            let status = child.wait().map_err(|e| e.to_string())?;

            let stdout = if let Some(stdout) = child.stdout.take() {
                let reader = BufReader::new(stdout);
                reader.lines()
                    .collect::<Result<Vec<_>, _>>()
                    .unwrap_or_default()
                    .join("\n")
            } else {
                String::new()
            };

            let stderr = if let Some(stderr) = child.stderr.take() {
                let reader = BufReader::new(stderr);
                reader.lines()
                    .collect::<Result<Vec<_>, _>>()
                    .unwrap_or_default()
                    .join("\n")
            } else {
                String::new()
            };

            let exit_code = status.code().unwrap_or(-1);
            let error = if !stderr.is_empty() { Some(stderr) } else { None };

            Ok(CommandResult {
                output: stdout,
                exit_code,
                error,
            })
        }
        Err(e) => Err(format!("Failed to spawn command: {}", e)),
    }
}

/**
 * Inspect a file or module
 * Returns file metadata + content analysis
 */
#[command]
pub async fn dev_inspect_file(path: String) -> Result<FileInspection, String> {
    log::info!("🔍 [Hybrid] Inspecting file: {}", path);

    let file_path = Path::new(&path);
    let exists = file_path.exists();

    if !exists {
        return Ok(FileInspection {
            path: path.clone(),
            exists: false,
            size: None,
            content: None,
            lines: None,
            analysis: Some(format!("File not found: {}", path)),
        });
    }

    let metadata = fs::metadata(&path).map_err(|e| e.to_string())?;
    let size = metadata.len();

    // Read content (limit to 100KB for safety)
    let content = if size < 100_000 {
        fs::read_to_string(&path).ok()
    } else {
        Some(format!("[File too large: {} bytes]", size))
    };

    let lines = content.as_ref().map(|c| c.lines().count());

    // Basic analysis
    let analysis = content.as_ref().map(|c| {
        let mut issues = Vec::new();

        if c.contains("TODO") {
            issues.push("Contains TODO comments".to_string());
        }
        if c.contains("FIXME") {
            issues.push("Contains FIXME comments".to_string());
        }
        if c.contains("console.log") || c.contains("println!") {
            issues.push("Contains debug statements".to_string());
        }
        if c.contains("any") && path.ends_with(".ts") {
            issues.push("TypeScript: Contains 'any' types".to_string());
        }

        if issues.is_empty() {
            "✅ No obvious issues detected".to_string()
        } else {
            format!("⚠️ Issues found:\n{}", issues.join("\n"))
        }
    });

    Ok(FileInspection {
        path: path.clone(),
        exists: true,
        size: Some(size),
        content,
        lines,
        analysis,
    })
}

/**
 * Apply a code patch to a file
 * Used by auto-healing system
 */
#[command]
pub async fn dev_apply_patch(
    file: String,
    line_start: usize,
    line_end: usize,
    new_code: String,
) -> Result<CommandResult, String> {
    log::info!("🩹 [Hybrid] Applying patch to {}: lines {}-{}", file, line_start, line_end);

    let path = Path::new(&file);
    if !path.exists() {
        return Err(format!("File not found: {}", file));
    }

    // Read current content
    let content = fs::read_to_string(&file).map_err(|e| e.to_string())?;
    let mut lines: Vec<String> = content.lines().map(|s| s.to_string()).collect();

    // Validate line range
    if line_start == 0 || line_end > lines.len() || line_start > line_end {
        return Err(format!(
            "Invalid line range: {}-{} (file has {} lines)",
            line_start,
            line_end,
            lines.len()
        ));
    }

    // Apply patch (1-indexed → 0-indexed)
    let new_lines: Vec<String> = new_code.lines().map(|s| s.to_string()).collect();
    lines.splice((line_start - 1)..line_end, new_lines);

    // Write back
    let new_content = lines.join("\n");
    fs::write(&file, new_content).map_err(|e| e.to_string())?;

    Ok(CommandResult {
        output: format!("✅ Patch applied to {} (lines {}-{})", file, line_start, line_end),
        exit_code: 0,
        error: None,
    })
}

/**
 * Get system/app logs with optional filter
 */
#[command]
pub async fn dev_get_logs(filter: Option<String>) -> Result<CommandResult, String> {
    log::info!("📋 [Hybrid] Getting logs (filter: {:?})", filter);

    // For now, return a mock response
    // TODO: Implement real log collection from TITANE∞ Memory Engine
    let logs = vec![
        "[INFO] TITANE∞ System initialized",
        "[DEBUG] Chat orchestrator ready",
        "[INFO] Hybrid Engine activated",
        "[DEBUG] Dev console listening",
    ];

    let output = if let Some(f) = filter {
        logs.into_iter()
            .filter(|line| line.contains(&f))
            .collect::<Vec<_>>()
            .join("\n")
    } else {
        logs.join("\n")
    };

    Ok(CommandResult {
        output,
        exit_code: 0,
        error: None,
    })
}

/**
 * Run code diagnostics on a target
 * Returns health status + issues + suggestions
 */
#[command]
pub async fn hybrid_analyze_code(target: String) -> Result<Vec<CodeDiagnostic>, String> {
    log::info!("🩺 [Hybrid] Analyzing code: {}", target);

    // For now, return mock diagnostics
    // TODO: Implement real analysis (TypeScript compiler, Rust clippy, etc.)
    let diagnostics = vec![
        CodeDiagnostic {
            target: target.clone(),
            health: "healthy".to_string(),
            issues: vec![],
            suggestions: vec![
                "Consider adding more tests".to_string(),
                "Documentation could be improved".to_string(),
            ],
        },
    ];

    Ok(diagnostics)
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_dev_run_command() {
        let result = dev_run_command("echo hello".to_string()).await;
        assert!(result.is_ok());
        let cmd_result = result.unwrap();
        assert_eq!(cmd_result.exit_code, 0);
        assert!(cmd_result.output.contains("hello"));
    }

    #[tokio::test]
    async fn test_dev_inspect_file_not_found() {
        let result = dev_inspect_file("/nonexistent/file.txt".to_string()).await;
        assert!(result.is_ok());
        let inspection = result.unwrap();
        assert!(!inspection.exists);
    }
}
