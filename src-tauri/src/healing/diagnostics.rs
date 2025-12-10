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
}
