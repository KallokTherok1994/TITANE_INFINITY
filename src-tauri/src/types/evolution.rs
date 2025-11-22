// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — TYPES: EVOLUTION
//   Auto-Evolution Engine Types
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

/// Evolution report from diagnosis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvolutionReport {
    pub id: String,
    pub timestamp: i64,
    pub issues: Vec<Issue>,
    pub recommendations: Vec<Recommendation>,
    pub health_score: f64,
}

/// System issue detected
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Issue {
    pub id: String,
    pub severity: IssueSeverity,
    pub category: IssueCategory,
    pub description: String,
    pub affected_module: String,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum IssueSeverity {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum IssueCategory {
    Performance,
    Stability,
    Resource,
    Logic,
}

/// Recommendation for repair
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Recommendation {
    pub id: String,
    pub action: RepairAction,
    pub priority: u8,
    pub estimated_impact: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RepairAction {
    RestartModule(String),
    AdjustThreshold { module: String, parameter: String, value: f64 },
    ClearCache(String),
    Rebalance,
    Log(String),
}

/// Repair execution result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RepairResult {
    pub success: bool,
    pub action: String,
    pub message: String,
    pub timestamp: i64,
}

/// Evolution engine state
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvolutionState {
    pub active: bool,
    pub reports_generated: u32,
    pub repairs_applied: u32,
    pub success_rate: f64,
    pub last_diagnosis: Option<i64>,
    pub history: Vec<EvolutionHistory>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvolutionHistory {
    pub timestamp: i64,
    pub report_id: String,
    pub repairs_applied: usize,
    pub outcome: String,
}

impl Default for EvolutionState {
    fn default() -> Self {
        Self {
            active: true,
            reports_generated: 0,
            repairs_applied: 0,
            success_rate: 0.0,
            last_diagnosis: None,
            history: Vec::new(),
        }
    }
}

impl EvolutionReport {
    /// Check if report has critical issues
    pub fn has_critical_issues(&self) -> bool {
        self.issues.iter().any(|i| i.severity == IssueSeverity::Critical)
    }
    
    /// Get prioritized recommendations
    pub fn prioritized_recommendations(&self) -> Vec<Recommendation> {
        let mut recs = self.recommendations.clone();
        recs.sort_by(|a, b| b.priority.cmp(&a.priority));
        recs
    }
}
