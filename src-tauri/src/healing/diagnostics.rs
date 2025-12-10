//! ═══════════════════════════════════════════════════════════════
//!   SP-GAP-004: System Diagnostics Engine
//!   Comprehensive diagnostics for all system components
//! ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};

/// Diagnostic severity levels
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub enum DiagnosticSeverity {
    Info,
    Warning,
    Error,
    Critical,
}

/// A single diagnostic finding
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiagnosticFinding {
    pub code: String,
    pub severity: DiagnosticSeverity,
    pub component: String,
    pub message: String,
    pub details: Option<String>,
    pub suggestion: Option<String>,
    pub timestamp: u64,
}

/// Diagnostic report for a component
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentDiagnostic {
    pub component_name: String,
    pub status: ComponentStatus,
    pub findings: Vec<DiagnosticFinding>,
    pub metrics: HashMap<String, f64>,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ComponentStatus {
    Operational,
    Degraded,
    Failed,
    Unknown,
}

/// Full system diagnostic report
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemDiagnosticReport {
    pub overall_status: ComponentStatus,
    pub components: Vec<ComponentDiagnostic>,
    pub critical_findings: Vec<DiagnosticFinding>,
    pub summary: DiagnosticSummary,
    pub timestamp: u64,
    pub duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiagnosticSummary {
    pub total_components: usize,
    pub operational_count: usize,
    pub degraded_count: usize,
    pub failed_count: usize,
    pub total_findings: usize,
    pub critical_count: usize,
    pub error_count: usize,
    pub warning_count: usize,
}

/// Diagnostic engine for system health analysis
pub struct DiagnosticsEngine {
    component_checkers: Vec<Box<dyn ComponentChecker + Send + Sync>>,
}

/// Trait for component-specific diagnostic checks
pub trait ComponentChecker {
    fn component_name(&self) -> &str;
    fn run_diagnostics(&self) -> ComponentDiagnostic;
}

impl DiagnosticsEngine {
    pub fn new() -> Self {
        Self {
            component_checkers: Vec::new(),
        }
    }

    /// Register a component checker
    pub fn register_checker(&mut self, checker: Box<dyn ComponentChecker + Send + Sync>) {
        self.component_checkers.push(checker);
    }

    /// Run full system diagnostics
    pub fn run_full_diagnostics(&self) -> SystemDiagnosticReport {
        let start = std::time::Instant::now();
        let mut components = Vec::new();
        let mut critical_findings = Vec::new();

        for checker in &self.component_checkers {
            let diagnostic = checker.run_diagnostics();

            // Collect critical findings
            for finding in &diagnostic.findings {
                if finding.severity == DiagnosticSeverity::Critical {
                    critical_findings.push(finding.clone());
                }
            }

            components.push(diagnostic);
        }

        // Calculate summary
        let mut operational = 0;
        let mut degraded = 0;
        let mut failed = 0;
        let mut total_findings = 0;
        let mut critical = 0;
        let mut errors = 0;
        let mut warnings = 0;

        for component in &components {
            match component.status {
                ComponentStatus::Operational => operational += 1,
                ComponentStatus::Degraded => degraded += 1,
                ComponentStatus::Failed => failed += 1,
                ComponentStatus::Unknown => {}
            }

            for finding in &component.findings {
                total_findings += 1;
                match finding.severity {
                    DiagnosticSeverity::Critical => critical += 1,
                    DiagnosticSeverity::Error => errors += 1,
                    DiagnosticSeverity::Warning => warnings += 1,
                    _ => {}
                }
            }
        }

        let overall_status = if failed > 0 {
            ComponentStatus::Failed
        } else if degraded > 0 {
            ComponentStatus::Degraded
        } else {
            ComponentStatus::Operational
        };

        SystemDiagnosticReport {
            overall_status,
            components,
            critical_findings,
            summary: DiagnosticSummary {
                total_components: self.component_checkers.len(),
                operational_count: operational,
                degraded_count: degraded,
                failed_count: failed,
                total_findings,
                critical_count: critical,
                error_count: errors,
                warning_count: warnings,
            },
            timestamp: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
            duration_ms: start.elapsed().as_millis() as u64,
        }
    }

    /// Run diagnostics for a specific component
    pub fn run_component_diagnostics(&self, component_name: &str) -> Option<ComponentDiagnostic> {
        self.component_checkers
            .iter()
            .find(|c| c.component_name() == component_name)
            .map(|c| c.run_diagnostics())
    }
}

impl Default for DiagnosticsEngine {
    fn default() -> Self {
        Self::new()
    }
}

/// Built-in memory diagnostic checker
pub struct MemoryDiagnosticChecker;

impl ComponentChecker for MemoryDiagnosticChecker {
    fn component_name(&self) -> &str {
        "memory"
    }

    fn run_diagnostics(&self) -> ComponentDiagnostic {
        let mut findings = Vec::new();
        let mut metrics = HashMap::new();

        // Simulated memory diagnostics
        let heap_usage = 0.45; // 45% heap usage
        let gc_pressure = 0.1; // Low GC pressure

        metrics.insert("heap_usage_percent".to_string(), heap_usage * 100.0);
        metrics.insert("gc_pressure".to_string(), gc_pressure);

        if heap_usage > 0.8 {
            findings.push(DiagnosticFinding {
                code: "MEM001".to_string(),
                severity: DiagnosticSeverity::Warning,
                component: "memory".to_string(),
                message: "High heap usage detected".to_string(),
                details: Some(format!("Current heap usage: {:.1}%", heap_usage * 100.0)),
                suggestion: Some(
                    "Consider increasing memory limits or optimizing allocations".to_string(),
                ),
                timestamp: SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_secs(),
            });
        }

        let status = if heap_usage > 0.9 {
            ComponentStatus::Degraded
        } else {
            ComponentStatus::Operational
        };

        ComponentDiagnostic {
            component_name: "memory".to_string(),
            status,
            findings,
            metrics,
            timestamp: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
        }
    }
}

/// Built-in CPU diagnostic checker
pub struct CpuDiagnosticChecker;

impl ComponentChecker for CpuDiagnosticChecker {
    fn component_name(&self) -> &str {
        "cpu"
    }

    fn run_diagnostics(&self) -> ComponentDiagnostic {
        let mut metrics = HashMap::new();

        // Simulated CPU diagnostics
        let cpu_usage = 0.25;
        let thread_count = 8.0;

        metrics.insert("cpu_usage_percent".to_string(), cpu_usage * 100.0);
        metrics.insert("thread_count".to_string(), thread_count);

        ComponentDiagnostic {
            component_name: "cpu".to_string(),
            status: ComponentStatus::Operational,
            findings: Vec::new(),
            metrics,
            timestamp: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_diagnostics_engine() {
        let mut engine = DiagnosticsEngine::new();
        engine.register_checker(Box::new(MemoryDiagnosticChecker));
        engine.register_checker(Box::new(CpuDiagnosticChecker));

        let report = engine.run_full_diagnostics();
        assert_eq!(report.summary.total_components, 2);
        assert_eq!(report.overall_status, ComponentStatus::Operational);
    }

    #[test]
    fn test_diagnostics_engine_default() {
        let engine = DiagnosticsEngine::default();
        let report = engine.run_full_diagnostics();
        assert_eq!(report.summary.total_components, 0);
        assert_eq!(report.overall_status, ComponentStatus::Operational);
    }

    #[test]
    fn test_memory_diagnostic_checker() {
        let checker = MemoryDiagnosticChecker;
        assert_eq!(checker.component_name(), "memory");

        let diagnostic = checker.run_diagnostics();
        assert_eq!(diagnostic.component_name, "memory");
        assert_eq!(diagnostic.status, ComponentStatus::Operational);
        assert!(diagnostic.metrics.contains_key("heap_usage_percent"));
        assert!(diagnostic.metrics.contains_key("gc_pressure"));
    }

    #[test]
    fn test_cpu_diagnostic_checker() {
        let checker = CpuDiagnosticChecker;
        assert_eq!(checker.component_name(), "cpu");

        let diagnostic = checker.run_diagnostics();
        assert_eq!(diagnostic.component_name, "cpu");
        assert_eq!(diagnostic.status, ComponentStatus::Operational);
        assert!(diagnostic.metrics.contains_key("cpu_usage_percent"));
        assert!(diagnostic.metrics.contains_key("thread_count"));
    }

    #[test]
    fn test_component_diagnostics_lookup() {
        let mut engine = DiagnosticsEngine::new();
        engine.register_checker(Box::new(MemoryDiagnosticChecker));
        engine.register_checker(Box::new(CpuDiagnosticChecker));

        let memory_diag = engine.run_component_diagnostics("memory");
        assert!(memory_diag.is_some());
        assert_eq!(memory_diag.unwrap().component_name, "memory");

        let cpu_diag = engine.run_component_diagnostics("cpu");
        assert!(cpu_diag.is_some());

        let nonexistent = engine.run_component_diagnostics("network");
        assert!(nonexistent.is_none());
    }

    #[test]
    fn test_diagnostic_severity_ordering() {
        assert!(DiagnosticSeverity::Info < DiagnosticSeverity::Warning);
        assert!(DiagnosticSeverity::Warning < DiagnosticSeverity::Error);
        assert!(DiagnosticSeverity::Error < DiagnosticSeverity::Critical);
    }

    #[test]
    fn test_diagnostic_finding_creation() {
        let finding = DiagnosticFinding {
            code: "TEST001".to_string(),
            severity: DiagnosticSeverity::Warning,
            component: "test".to_string(),
            message: "Test warning".to_string(),
            details: Some("Details here".to_string()),
            suggestion: Some("Fix it".to_string()),
            timestamp: 12345,
        };

        assert_eq!(finding.code, "TEST001");
        assert_eq!(finding.severity, DiagnosticSeverity::Warning);
        assert!(finding.details.is_some());
        assert!(finding.suggestion.is_some());
    }

    #[test]
    fn test_diagnostic_summary_counts() {
        let summary = DiagnosticSummary {
            total_components: 5,
            operational_count: 3,
            degraded_count: 1,
            failed_count: 1,
            total_findings: 10,
            critical_count: 2,
            error_count: 3,
            warning_count: 5,
        };

        assert_eq!(summary.total_components, 5);
        assert_eq!(summary.operational_count + summary.degraded_count + summary.failed_count, 5);
        assert_eq!(summary.critical_count + summary.error_count + summary.warning_count, 10);
    }

    #[test]
    fn test_component_status_equality() {
        assert_eq!(ComponentStatus::Operational, ComponentStatus::Operational);
        assert_ne!(ComponentStatus::Operational, ComponentStatus::Degraded);
        assert_ne!(ComponentStatus::Degraded, ComponentStatus::Failed);
        assert_ne!(ComponentStatus::Failed, ComponentStatus::Unknown);
    }

    /// Custom test checker for failed status
    struct FailingChecker;

    impl ComponentChecker for FailingChecker {
        fn component_name(&self) -> &str {
            "failing"
        }

        fn run_diagnostics(&self) -> ComponentDiagnostic {
            ComponentDiagnostic {
                component_name: "failing".to_string(),
                status: ComponentStatus::Failed,
                findings: vec![DiagnosticFinding {
                    code: "FAIL001".to_string(),
                    severity: DiagnosticSeverity::Critical,
                    component: "failing".to_string(),
                    message: "Component has failed".to_string(),
                    details: None,
                    suggestion: None,
                    timestamp: 0,
                }],
                metrics: HashMap::new(),
                timestamp: 0,
            }
        }
    }

    #[test]
    fn test_overall_status_failed() {
        let mut engine = DiagnosticsEngine::new();
        engine.register_checker(Box::new(MemoryDiagnosticChecker));
        engine.register_checker(Box::new(FailingChecker));

        let report = engine.run_full_diagnostics();
        assert_eq!(report.overall_status, ComponentStatus::Failed);
        assert_eq!(report.summary.failed_count, 1);
        assert!(!report.critical_findings.is_empty());
    }

    /// Custom test checker for degraded status
    struct DegradedChecker;

    impl ComponentChecker for DegradedChecker {
        fn component_name(&self) -> &str {
            "degraded"
        }

        fn run_diagnostics(&self) -> ComponentDiagnostic {
            ComponentDiagnostic {
                component_name: "degraded".to_string(),
                status: ComponentStatus::Degraded,
                findings: vec![],
                metrics: HashMap::new(),
                timestamp: 0,
            }
        }
    }

    #[test]
    fn test_overall_status_degraded() {
        let mut engine = DiagnosticsEngine::new();
        engine.register_checker(Box::new(MemoryDiagnosticChecker));
        engine.register_checker(Box::new(DegradedChecker));

        let report = engine.run_full_diagnostics();
        assert_eq!(report.overall_status, ComponentStatus::Degraded);
        assert_eq!(report.summary.degraded_count, 1);
    }

    #[test]
    fn test_report_duration() {
        let mut engine = DiagnosticsEngine::new();
        engine.register_checker(Box::new(MemoryDiagnosticChecker));

        let report = engine.run_full_diagnostics();
        // Duration should be non-negative
        assert!(report.duration_ms < 10000); // Shouldn't take more than 10 seconds
        assert!(report.timestamp > 0);
    }
}
