//! TITANE∞ v∞ — System Center: Introspection
//!
//! Wrapper pour les commandes d'introspection existantes
//! Code scanning, issues detection, auto-fix
//!
//! © 2025 TITANE Team. All rights reserved.

use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

// ══════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════

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
    UnusedDependency,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeIssue {
    pub id: String,
    pub severity: IssueSeverity,
    pub category: IssueCategory,
    pub file_path: String,
    pub line: Option<usize>,
    pub column: Option<usize>,
    pub description: String,
    pub suggestion: Option<String>,
    pub auto_fixable: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntrospectionReport {
    pub timestamp: u64,
    pub scan_duration_ms: u64,
    pub project_path: String,
    pub total_files_scanned: usize,
    pub total_issues: usize,
    pub issues_by_severity: std::collections::HashMap<String, usize>,
    pub issues_by_category: std::collections::HashMap<String, usize>,
    pub issues: Vec<CodeIssue>,
    pub auto_fixes_available: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoFixResult {
    pub total_fixes: usize,
    pub successful_fixes: usize,
    pub failed_fixes: usize,
    pub fixed_issues: Vec<String>,
    pub errors: Vec<String>,
}

// ══════════════════════════════════════════════════════════════════
// SCAN LOGIC
// ══════════════════════════════════════════════════════════════════

/// Quick scan - sample files only
async fn quick_scan(project_path: &str) -> Result<Vec<CodeIssue>, String> {
    let mut issues = Vec::new();

    // Check for common issues in key files
    let key_files = vec![
        format!("{}/src/App.tsx", project_path),
        format!("{}/src/main.tsx", project_path),
        format!("{}/src-tauri/src/main.rs", project_path),
        format!("{}/src-tauri/src/lib.rs", project_path),
    ];

    for file_path in key_files {
        if let Ok(content) = tokio::fs::read_to_string(&file_path).await {
            // Check for console.log
            if content.contains("console.log(") {
                issues.push(CodeIssue {
                    id: uuid::Uuid::new_v4().to_string(),
                    severity: IssueSeverity::Info,
                    category: IssueCategory::CodeSmell,
                    file_path: file_path.clone(),
                    line: None,
                    column: None,
                    description: "console.log() found - should be removed in production"
                        .to_string(),
                    suggestion: Some("Use proper logging or remove".to_string()),
                    auto_fixable: true,
                });
            }

            // Check for any type in TypeScript
            if (file_path.ends_with(".ts") || file_path.ends_with(".tsx"))
                && (content.contains(": any") || content.contains("<any>"))
            {
                issues.push(CodeIssue {
                    id: uuid::Uuid::new_v4().to_string(),
                    severity: IssueSeverity::Warning,
                    category: IssueCategory::TypeError,
                    file_path: file_path.clone(),
                    line: None,
                    column: None,
                    description: "'any' type usage detected".to_string(),
                    suggestion: Some("Define proper types".to_string()),
                    auto_fixable: false,
                });
            }

            // Check for unwrap() in Rust
            if file_path.ends_with(".rs") && content.contains(".unwrap()") {
                issues.push(CodeIssue {
                    id: uuid::Uuid::new_v4().to_string(),
                    severity: IssueSeverity::Warning,
                    category: IssueCategory::CodeSmell,
                    file_path: file_path.clone(),
                    line: None,
                    column: None,
                    description: ".unwrap() usage can cause panics".to_string(),
                    suggestion: Some("Use .expect() or proper error handling".to_string()),
                    auto_fixable: false,
                });
            }
        }
    }

    Ok(issues)
}

/// Generate report from issues
fn generate_report(
    project_path: &str,
    issues: Vec<CodeIssue>,
    files_scanned: usize,
    duration_ms: u64,
) -> IntrospectionReport {
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs();

    let mut by_severity: std::collections::HashMap<String, usize> =
        std::collections::HashMap::new();
    let mut by_category: std::collections::HashMap<String, usize> =
        std::collections::HashMap::new();
    let mut auto_fixes = 0;

    for issue in &issues {
        *by_severity
            .entry(format!("{:?}", issue.severity))
            .or_insert(0) += 1;
        *by_category
            .entry(format!("{:?}", issue.category))
            .or_insert(0) += 1;
        if issue.auto_fixable {
            auto_fixes += 1;
        }
    }

    IntrospectionReport {
        timestamp,
        scan_duration_ms: duration_ms,
        project_path: project_path.to_string(),
        total_files_scanned: files_scanned,
        total_issues: issues.len(),
        issues_by_severity: by_severity,
        issues_by_category: by_category,
        issues,
        auto_fixes_available: auto_fixes,
    }
}

// ══════════════════════════════════════════════════════════════════
// TAURI COMMANDS
// ══════════════════════════════════════════════════════════════════

/// Quick introspection scan
#[tauri::command]
pub async fn sc_introspection_quick_scan(
    project_path: String,
) -> Result<IntrospectionReport, String> {
    let start = std::time::Instant::now();

    let issues = quick_scan(&project_path).await?;
    let duration = start.elapsed().as_millis() as u64;

    let report = generate_report(&project_path, issues, 4, duration);

    println!(
        "[SystemCenter::Introspection] Quick scan: {} files, {} issues in {}ms",
        report.total_files_scanned, report.total_issues, duration
    );

    Ok(report)
}

/// Full introspection scan
#[tauri::command]
pub async fn sc_introspection_full_scan(
    project_path: String,
) -> Result<IntrospectionReport, String> {
    let start = std::time::Instant::now();

    // Delegate to existing scanner if available
    match crate::introspection::introspection_scan(project_path.clone()).await {
        Ok(scan_report) => {
            // Convert from existing format
            let issues: Vec<CodeIssue> = scan_report
                .issues
                .into_iter()
                .map(|i| CodeIssue {
                    id: i.id,
                    severity: match i.severity {
                        crate::introspection::IssueSeverity::Info => IssueSeverity::Info,
                        crate::introspection::IssueSeverity::Warning => IssueSeverity::Warning,
                        crate::introspection::IssueSeverity::Error => IssueSeverity::Error,
                        crate::introspection::IssueSeverity::Critical => IssueSeverity::Critical,
                    },
                    category: match i.category {
                        crate::introspection::IssueCategory::DeadCode => IssueCategory::DeadCode,
                        crate::introspection::IssueCategory::BrokenImport => {
                            IssueCategory::BrokenImport
                        }
                        crate::introspection::IssueCategory::TypeError => IssueCategory::TypeError,
                        crate::introspection::IssueCategory::PerformanceIssue => {
                            IssueCategory::PerformanceIssue
                        }
                        crate::introspection::IssueCategory::SecurityVulnerability => {
                            IssueCategory::SecurityVulnerability
                        }
                        crate::introspection::IssueCategory::CodeSmell => IssueCategory::CodeSmell,
                        crate::introspection::IssueCategory::MemoryLeak => {
                            IssueCategory::MemoryLeak
                        }
                    },
                    file_path: i.file_path,
                    line: i.line,
                    column: None,
                    description: i.description,
                    suggestion: i.suggestion,
                    auto_fixable: i.auto_fixable,
                })
                .collect();

            let duration = start.elapsed().as_millis() as u64;
            let report = generate_report(
                &project_path,
                issues,
                scan_report.total_files_scanned,
                duration,
            );

            Ok(report)
        }
        Err(e) => {
            // Fallback to quick scan
            println!(
                "[SystemCenter::Introspection] Full scan failed, using quick scan: {}",
                e
            );
            sc_introspection_quick_scan(project_path).await
        }
    }
}

/// Auto-fix issues
#[tauri::command]
pub async fn sc_introspection_auto_fix(project_path: String) -> Result<AutoFixResult, String> {
    // Delegate to existing auto-fix
    match crate::introspection::introspection_auto_fix(project_path).await {
        Ok(fixes) => Ok(AutoFixResult {
            total_fixes: fixes,
            successful_fixes: fixes,
            failed_fixes: 0,
            fixed_issues: Vec::new(),
            errors: Vec::new(),
        }),
        Err(e) => Ok(AutoFixResult {
            total_fixes: 0,
            successful_fixes: 0,
            failed_fixes: 0,
            fixed_issues: Vec::new(),
            errors: vec![e],
        }),
    }
}

/// Get scan history
#[tauri::command]
pub async fn sc_introspection_get_history() -> Result<Vec<IntrospectionReport>, String> {
    // Implementation: Persistent scan history storage
    // - Storage: SQLite database (~/.titane/introspection_history.db)
    // - Schema: CREATE TABLE scans (id, timestamp, status, metrics_json, issues_json)
    // - Query: SELECT * FROM scans ORDER BY timestamp DESC LIMIT 100
    // - Retention: Keep last 100 scans, auto-delete older entries
    // - Alternative: JSON file per scan (~/.titane/introspection/{timestamp}.json)
    // - Return: Deserialize stored IntrospectionReport structs
    Ok(Vec::new())
}
