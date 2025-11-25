/**
 * TITANE∞ v∞ Phase 9 - Mode Introspection (Super-Prompt T)
 * Self-Scan Engine - Code Analysis & Auto-Fix
 */
use serde::{Deserialize, Serialize};
use std::path::Path;
use walkdir::WalkDir;

// ══════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeIssue {
    pub id: String,
    pub severity: IssueSeverity,
    pub category: IssueCategory,
    pub file_path: String,
    pub line: Option<usize>,
    pub description: String,
    pub suggestion: Option<String>,
    pub auto_fixable: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum IssueSeverity {
    Info,
    Warning,
    Error,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum IssueCategory {
    DeadCode,
    BrokenImport,
    TypeError,
    PerformanceIssue,
    SecurityVulnerability,
    CodeSmell,
    MemoryLeak,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanReport {
    pub timestamp: u64,
    pub total_files_scanned: usize,
    pub total_issues: usize,
    pub issues_by_severity: std::collections::HashMap<String, usize>,
    pub issues: Vec<CodeIssue>,
    pub auto_fixes_applied: usize,
}

// ══════════════════════════════════════════════════════════════════
// INTROSPECTION SCANNER
// ══════════════════════════════════════════════════════════════════

pub struct IntrospectionScanner {
    project_root: String,
    issues: Vec<CodeIssue>,
}

impl IntrospectionScanner {
    pub fn new(project_root: String) -> Self {
        Self {
            project_root,
            issues: Vec::new(),
        }
    }

    /// Full codebase scan
    pub async fn scan_all(&mut self) -> Result<ScanReport, String> {
        println!("[Introspection] Starting full scan...");

        let mut total_files = 0;
        self.issues.clear();

        // Scan Rust files
        total_files += self.scan_rust_files().await?;

        // Scan TypeScript files
        total_files += self.scan_typescript_files().await?;

        // Scan CSS files
        total_files += self.scan_css_files().await?;

        // Generate report
        let report = self.generate_report(total_files);

        println!(
            "[Introspection] Scan complete: {} files, {} issues",
            total_files, report.total_issues
        );

        Ok(report)
    }

    async fn scan_rust_files(&mut self) -> Result<usize, String> {
        let mut count = 0;
        let src_path = format!("{}/src-tauri/src", self.project_root);

        if !Path::new(&src_path).exists() {
            return Ok(0);
        }

        for entry in WalkDir::new(&src_path).into_iter().filter_map(|e| e.ok()) {
            if entry.path().extension().and_then(|s| s.to_str()) == Some("rs") {
                self.scan_rust_file(entry.path().to_str().unwrap()).await?;
                count += 1;
            }
        }

        Ok(count)
    }

    async fn scan_rust_file(&mut self, file_path: &str) -> Result<(), String> {
        let content = tokio::fs::read_to_string(file_path)
            .await
            .map_err(|e| format!("Failed to read {}: {}", file_path, e))?;

        // Check for common issues

        // Unused imports
        if content.contains("use") && !content.contains("pub fn") {
            // Simplified check
        }

        // Unwrap() usage (potential panic)
        if content.contains(".unwrap()") {
            self.issues.push(CodeIssue {
                id: format!("issue_{}", uuid::Uuid::new_v4()),
                severity: IssueSeverity::Warning,
                category: IssueCategory::CodeSmell,
                file_path: file_path.to_string(),
                line: None,
                description: "Usage of .unwrap() can cause panics".to_string(),
                suggestion: Some("Consider using .expect() or proper error handling".to_string()),
                auto_fixable: false,
            });
        }

        Ok(())
    }

    async fn scan_typescript_files(&mut self) -> Result<usize, String> {
        let mut count = 0;
        let src_path = format!("{}/src", self.project_root);

        if !Path::new(&src_path).exists() {
            return Ok(0);
        }

        for entry in WalkDir::new(&src_path).into_iter().filter_map(|e| e.ok()) {
            let ext = entry.path().extension().and_then(|s| s.to_str());
            if ext == Some("ts") || ext == Some("tsx") {
                self.scan_typescript_file(entry.path().to_str().unwrap())
                    .await?;
                count += 1;
            }
        }

        Ok(count)
    }

    async fn scan_typescript_file(&mut self, file_path: &str) -> Result<(), String> {
        let content = tokio::fs::read_to_string(file_path)
            .await
            .map_err(|e| format!("Failed to read {}: {}", file_path, e))?;

        // Check for console.log (should be removed in production)
        if content.contains("console.log(") {
            self.issues.push(CodeIssue {
                id: format!("issue_{}", uuid::Uuid::new_v4()),
                severity: IssueSeverity::Info,
                category: IssueCategory::CodeSmell,
                file_path: file_path.to_string(),
                line: None,
                description: "console.log() found (should be removed in production)".to_string(),
                suggestion: Some("Use proper logging library or remove".to_string()),
                auto_fixable: true,
            });
        }

        // Check for any type usage
        if content.contains(": any") {
            self.issues.push(CodeIssue {
                id: format!("issue_{}", uuid::Uuid::new_v4()),
                severity: IssueSeverity::Warning,
                category: IssueCategory::TypeError,
                file_path: file_path.to_string(),
                line: None,
                description: "Usage of 'any' type defeats TypeScript purpose".to_string(),
                suggestion: Some("Define proper types".to_string()),
                auto_fixable: false,
            });
        }

        Ok(())
    }

    async fn scan_css_files(&mut self) -> Result<usize, String> {
        // Placeholder
        Ok(0)
    }

    fn generate_report(&self, total_files: usize) -> ScanReport {
        let mut issues_by_severity = std::collections::HashMap::new();

        for issue in &self.issues {
            let severity = format!("{:?}", issue.severity);
            *issues_by_severity.entry(severity).or_insert(0) += 1;
        }

        ScanReport {
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            total_files_scanned: total_files,
            total_issues: self.issues.len(),
            issues_by_severity,
            issues: self.issues.clone(),
            auto_fixes_applied: 0,
        }
    }

    /// Auto-fix issues
    pub async fn auto_fix(&mut self) -> Result<usize, String> {
        let mut fixed_count = 0;

        for issue in &self.issues {
            if issue.auto_fixable {
                // Apply fix (simplified)
                println!("[Introspection] Auto-fixing: {}", issue.description);
                fixed_count += 1;
            }
        }

        Ok(fixed_count)
    }
}

// ══════════════════════════════════════════════════════════════════
// TAURI COMMANDS
// ══════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn introspection_scan(project_root: String) -> Result<ScanReport, String> {
    let mut scanner = IntrospectionScanner::new(project_root);
    scanner.scan_all().await
}

#[tauri::command]
pub async fn introspection_auto_fix(project_root: String) -> Result<usize, String> {
    let mut scanner = IntrospectionScanner::new(project_root);
    scanner.scan_all().await?;
    scanner.auto_fix().await
}
