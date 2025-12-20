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
    AdjustThreshold {
        module: String,
        parameter: String,
        value: f64,
    },
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
        self.issues
            .iter()
            .any(|i| i.severity == IssueSeverity::Critical)
    }

    /// Get prioritized recommendations
    pub fn prioritized_recommendations(&self) -> Vec<Recommendation> {
        let mut recs = self.recommendations.clone();
        recs.sort_by(|a, b| b.priority.cmp(&a.priority));
        recs
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // IssueSeverity Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_issue_severity_variants() {
        let severities = vec![
            IssueSeverity::Low,
            IssueSeverity::Medium,
            IssueSeverity::High,
            IssueSeverity::Critical,
        ];
        assert_eq!(severities.len(), 4);
    }

    #[test]
    fn test_issue_severity_equality() {
        assert_eq!(IssueSeverity::Low, IssueSeverity::Low);
        assert_ne!(IssueSeverity::Low, IssueSeverity::Critical);
    }

    #[test]
    fn test_issue_severity_ordering() {
        assert!(IssueSeverity::Low < IssueSeverity::Medium);
        assert!(IssueSeverity::Medium < IssueSeverity::High);
        assert!(IssueSeverity::High < IssueSeverity::Critical);
    }

    #[test]
    fn test_issue_severity_copy() {
        let sev = IssueSeverity::High;
        let copied: IssueSeverity = sev;
        assert_eq!(sev, copied);
    }

    #[test]
    fn test_issue_severity_debug() {
        let sev = IssueSeverity::Critical;
        let debug_str = format!("{:?}", sev);
        assert!(debug_str.contains("Critical"));
    }

    #[test]
    fn test_issue_severity_serialization() {
        let sev = IssueSeverity::Medium;
        let json = serde_json::to_string(&sev)
            .expect("IssueSeverity should serialize to JSON");
        let restored: IssueSeverity = serde_json::from_str(&json)
            .expect("IssueSeverity should deserialize from JSON");
        assert_eq!(restored, IssueSeverity::Medium);
    }

    // ─────────────────────────────────────────────────────────────
    // IssueCategory Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_issue_category_variants() {
        let categories = vec![
            IssueCategory::Performance,
            IssueCategory::Stability,
            IssueCategory::Resource,
            IssueCategory::Logic,
        ];
        assert_eq!(categories.len(), 4);
    }

    #[test]
    fn test_issue_category_clone() {
        let cat = IssueCategory::Stability;
        let cloned = cat.clone();
        assert!(matches!(cloned, IssueCategory::Stability));
    }

    #[test]
    fn test_issue_category_debug() {
        let cat = IssueCategory::Logic;
        let debug_str = format!("{:?}", cat);
        assert!(debug_str.contains("Logic"));
    }

    #[test]
    fn test_issue_category_serialization() {
        let cat = IssueCategory::Resource;
        let json = serde_json::to_string(&cat)
            .expect("IssueCategory should serialize to JSON");
        let restored: IssueCategory = serde_json::from_str(&json)
            .expect("IssueCategory should deserialize from JSON");
        assert!(matches!(restored, IssueCategory::Resource));
    }

    // ─────────────────────────────────────────────────────────────
    // Issue Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_issue_creation() {
        let issue = Issue {
            id: "issue-001".to_string(),
            severity: IssueSeverity::High,
            category: IssueCategory::Performance,
            description: "High CPU usage".to_string(),
            affected_module: "helios".to_string(),
        };
        assert_eq!(issue.id, "issue-001");
        assert_eq!(issue.severity, IssueSeverity::High);
    }

    #[test]
    fn test_issue_clone() {
        let issue = Issue {
            id: "id".to_string(),
            severity: IssueSeverity::Critical,
            category: IssueCategory::Stability,
            description: "desc".to_string(),
            affected_module: "mod".to_string(),
        };
        let cloned = issue.clone();
        assert_eq!(cloned.id, "id");
        assert_eq!(cloned.severity, IssueSeverity::Critical);
    }

    #[test]
    fn test_issue_debug() {
        let issue = Issue {
            id: "x".to_string(),
            severity: IssueSeverity::Low,
            category: IssueCategory::Logic,
            description: "".to_string(),
            affected_module: "".to_string(),
        };
        let debug_str = format!("{:?}", issue);
        assert!(debug_str.contains("Issue"));
    }

    #[test]
    fn test_issue_serialization() {
        let issue = Issue {
            id: "test-issue".to_string(),
            severity: IssueSeverity::Medium,
            category: IssueCategory::Resource,
            description: "Memory leak".to_string(),
            affected_module: "memory".to_string(),
        };
        let json = serde_json::to_string(&issue)
            .expect("Issue should serialize to JSON");
        let restored: Issue = serde_json::from_str(&json)
            .expect("Issue should deserialize from JSON");
        assert_eq!(restored.id, "test-issue");
        assert_eq!(restored.description, "Memory leak");
    }

    // ─────────────────────────────────────────────────────────────
    // RepairAction Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_repair_action_variants() {
        let actions = vec![
            RepairAction::RestartModule("test".to_string()),
            RepairAction::AdjustThreshold {
                module: "mod".to_string(),
                parameter: "param".to_string(),
                value: 1.0,
            },
            RepairAction::ClearCache("cache".to_string()),
            RepairAction::Rebalance,
            RepairAction::Log("log".to_string()),
        ];
        assert_eq!(actions.len(), 5);
    }

    #[test]
    fn test_repair_action_restart_module() {
        let action = RepairAction::RestartModule("helios".to_string());
        if let RepairAction::RestartModule(module) = action {
            assert_eq!(module, "helios");
        } else {
            panic!("Expected RestartModule variant");
        }
    }

    #[test]
    fn test_repair_action_adjust_threshold() {
        let action = RepairAction::AdjustThreshold {
            module: "cpu".to_string(),
            parameter: "threshold".to_string(),
            value: 0.85,
        };
        if let RepairAction::AdjustThreshold {
            module,
            parameter,
            value,
        } = action
        {
            assert_eq!(module, "cpu");
            assert_eq!(parameter, "threshold");
            assert_eq!(value, 0.85);
        } else {
            panic!("Expected AdjustThreshold variant");
        }
    }

    #[test]
    fn test_repair_action_clone() {
        let action = RepairAction::ClearCache("data".to_string());
        let cloned = action.clone();
        assert!(matches!(cloned, RepairAction::ClearCache(_)));
    }

    #[test]
    fn test_repair_action_debug() {
        let action = RepairAction::Rebalance;
        let debug_str = format!("{:?}", action);
        assert!(debug_str.contains("Rebalance"));
    }

    #[test]
    fn test_repair_action_serialization() {
        let action = RepairAction::Log("test message".to_string());
        let json = serde_json::to_string(&action)
            .expect("RepairAction should serialize to JSON");
        let restored: RepairAction = serde_json::from_str(&json)
            .expect("RepairAction should deserialize from JSON");
        assert!(matches!(restored, RepairAction::Log(_)));
    }

    // ─────────────────────────────────────────────────────────────
    // Recommendation Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_recommendation_creation() {
        let rec = Recommendation {
            id: "rec-001".to_string(),
            action: RepairAction::Rebalance,
            priority: 10,
            estimated_impact: 0.8,
        };
        assert_eq!(rec.id, "rec-001");
        assert_eq!(rec.priority, 10);
    }

    #[test]
    fn test_recommendation_clone() {
        let rec = Recommendation {
            id: "id".to_string(),
            action: RepairAction::Rebalance,
            priority: 5,
            estimated_impact: 0.5,
        };
        let cloned = rec.clone();
        assert_eq!(cloned.priority, 5);
        assert_eq!(cloned.estimated_impact, 0.5);
    }

    #[test]
    fn test_recommendation_debug() {
        let rec = Recommendation {
            id: "x".to_string(),
            action: RepairAction::Rebalance,
            priority: 0,
            estimated_impact: 0.0,
        };
        let debug_str = format!("{:?}", rec);
        assert!(debug_str.contains("Recommendation"));
    }

    #[test]
    fn test_recommendation_serialization() {
        let rec = Recommendation {
            id: "rec-test".to_string(),
            action: RepairAction::ClearCache("mem".to_string()),
            priority: 8,
            estimated_impact: 0.75,
        };
        let json = serde_json::to_string(&rec)
            .expect("Recommendation should serialize to JSON");
        let restored: Recommendation = serde_json::from_str(&json)
            .expect("Recommendation should deserialize from JSON");
        assert_eq!(restored.id, "rec-test");
        assert_eq!(restored.priority, 8);
    }

    // ─────────────────────────────────────────────────────────────
    // RepairResult Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_repair_result_creation() {
        let result = RepairResult {
            success: true,
            action: "restart".to_string(),
            message: "Module restarted".to_string(),
            timestamp: 1234567890,
        };
        assert!(result.success);
        assert_eq!(result.action, "restart");
    }

    #[test]
    fn test_repair_result_failure() {
        let result = RepairResult {
            success: false,
            action: "clear_cache".to_string(),
            message: "Cache clear failed".to_string(),
            timestamp: 100,
        };
        assert!(!result.success);
    }

    #[test]
    fn test_repair_result_clone() {
        let result = RepairResult {
            success: true,
            action: "act".to_string(),
            message: "msg".to_string(),
            timestamp: 0,
        };
        let cloned = result.clone();
        assert!(cloned.success);
    }

    #[test]
    fn test_repair_result_debug() {
        let result = RepairResult {
            success: false,
            action: "".to_string(),
            message: "".to_string(),
            timestamp: 0,
        };
        let debug_str = format!("{:?}", result);
        assert!(debug_str.contains("RepairResult"));
    }

    #[test]
    fn test_repair_result_serialization() {
        let result = RepairResult {
            success: true,
            action: "rebalance".to_string(),
            message: "Success".to_string(),
            timestamp: 999999,
        };
        let json = serde_json::to_string(&result)
            .expect("RepairResult should serialize to JSON");
        let restored: RepairResult = serde_json::from_str(&json)
            .expect("RepairResult should deserialize from JSON");
        assert!(restored.success);
        assert_eq!(restored.action, "rebalance");
    }

    // ─────────────────────────────────────────────────────────────
    // EvolutionHistory Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_evolution_history_creation() {
        let history = EvolutionHistory {
            timestamp: 1234567890,
            report_id: "report-001".to_string(),
            repairs_applied: 5,
            outcome: "success".to_string(),
        };
        assert_eq!(history.repairs_applied, 5);
        assert_eq!(history.outcome, "success");
    }

    #[test]
    fn test_evolution_history_clone() {
        let history = EvolutionHistory {
            timestamp: 100,
            report_id: "id".to_string(),
            repairs_applied: 3,
            outcome: "partial".to_string(),
        };
        let cloned = history.clone();
        assert_eq!(cloned.repairs_applied, 3);
    }

    #[test]
    fn test_evolution_history_debug() {
        let history = EvolutionHistory {
            timestamp: 0,
            report_id: "".to_string(),
            repairs_applied: 0,
            outcome: "".to_string(),
        };
        let debug_str = format!("{:?}", history);
        assert!(debug_str.contains("EvolutionHistory"));
    }

    #[test]
    fn test_evolution_history_serialization() {
        let history = EvolutionHistory {
            timestamp: 12345,
            report_id: "rep-123".to_string(),
            repairs_applied: 10,
            outcome: "all fixed".to_string(),
        };
        let json = serde_json::to_string(&history)
            .expect("EvolutionHistory should serialize to JSON");
        let restored: EvolutionHistory = serde_json::from_str(&json)
            .expect("EvolutionHistory should deserialize from JSON");
        assert_eq!(restored.report_id, "rep-123");
        assert_eq!(restored.repairs_applied, 10);
    }

    // ─────────────────────────────────────────────────────────────
    // EvolutionState Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_evolution_state_default() {
        let state = EvolutionState::default();

        assert!(state.active);
        assert_eq!(state.reports_generated, 0);
        assert_eq!(state.repairs_applied, 0);
        assert_eq!(state.success_rate, 0.0);
        assert!(state.last_diagnosis.is_none());
        assert!(state.history.is_empty());
    }

    #[test]
    fn test_evolution_state_with_data() {
        let state = EvolutionState {
            active: false,
            reports_generated: 50,
            repairs_applied: 30,
            success_rate: 0.85,
            last_diagnosis: Some(1234567890),
            history: vec![],
        };

        assert!(!state.active);
        assert_eq!(state.reports_generated, 50);
        assert_eq!(state.success_rate, 0.85);
    }

    #[test]
    fn test_evolution_state_clone() {
        let state = EvolutionState::default();
        let cloned = state.clone();
        assert!(cloned.active);
    }

    #[test]
    fn test_evolution_state_debug() {
        let state = EvolutionState::default();
        let debug_str = format!("{:?}", state);
        assert!(debug_str.contains("EvolutionState"));
    }

    #[test]
    fn test_evolution_state_serialization() {
        let state = EvolutionState {
            active: true,
            reports_generated: 10,
            repairs_applied: 5,
            ..Default::default()
        };
        let json = serde_json::to_string(&state)
            .expect("EvolutionState should serialize to JSON");
        let restored: EvolutionState = serde_json::from_str(&json)
            .expect("EvolutionState should deserialize from JSON");
        assert!(restored.active);
        assert_eq!(restored.reports_generated, 10);
    }

    #[test]
    fn test_evolution_state_with_history() {
        let state = EvolutionState {
            history: vec![
                EvolutionHistory {
                    timestamp: 100,
                    report_id: "r1".to_string(),
                    repairs_applied: 2,
                    outcome: "ok".to_string(),
                },
                EvolutionHistory {
                    timestamp: 200,
                    report_id: "r2".to_string(),
                    repairs_applied: 3,
                    outcome: "partial".to_string(),
                },
            ],
            ..Default::default()
        };
        assert_eq!(state.history.len(), 2);
    }

    // ─────────────────────────────────────────────────────────────
    // EvolutionReport Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_evolution_report_creation() {
        let report = EvolutionReport {
            id: "report-001".to_string(),
            timestamp: 1234567890,
            issues: vec![],
            recommendations: vec![],
            health_score: 95.0,
        };
        assert_eq!(report.id, "report-001");
        assert_eq!(report.health_score, 95.0);
    }

    #[test]
    fn test_evolution_report_clone() {
        let report = EvolutionReport {
            id: "id".to_string(),
            timestamp: 0,
            issues: vec![],
            recommendations: vec![],
            health_score: 80.0,
        };
        let cloned = report.clone();
        assert_eq!(cloned.health_score, 80.0);
    }

    #[test]
    fn test_evolution_report_debug() {
        let report = EvolutionReport {
            id: "x".to_string(),
            timestamp: 0,
            issues: vec![],
            recommendations: vec![],
            health_score: 0.0,
        };
        let debug_str = format!("{:?}", report);
        assert!(debug_str.contains("EvolutionReport"));
    }

    #[test]
    fn test_evolution_report_serialization() {
        let report = EvolutionReport {
            id: "rep-test".to_string(),
            timestamp: 999999,
            issues: vec![],
            recommendations: vec![],
            health_score: 75.5,
        };
        let json = serde_json::to_string(&report)
            .expect("EvolutionReport should serialize to JSON");
        let restored: EvolutionReport = serde_json::from_str(&json)
            .expect("EvolutionReport should deserialize from JSON");
        assert_eq!(restored.id, "rep-test");
        assert_eq!(restored.health_score, 75.5);
    }

    // ─────────────────────────────────────────────────────────────
    // has_critical_issues Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_has_critical_issues_none() {
        let report = EvolutionReport {
            id: "r".to_string(),
            timestamp: 0,
            issues: vec![
                Issue {
                    id: "1".to_string(),
                    severity: IssueSeverity::Low,
                    category: IssueCategory::Performance,
                    description: "".to_string(),
                    affected_module: "".to_string(),
                },
                Issue {
                    id: "2".to_string(),
                    severity: IssueSeverity::Medium,
                    category: IssueCategory::Logic,
                    description: "".to_string(),
                    affected_module: "".to_string(),
                },
            ],
            recommendations: vec![],
            health_score: 90.0,
        };
        assert!(!report.has_critical_issues());
    }

    #[test]
    fn test_has_critical_issues_with_critical() {
        let report = EvolutionReport {
            id: "r".to_string(),
            timestamp: 0,
            issues: vec![
                Issue {
                    id: "1".to_string(),
                    severity: IssueSeverity::Low,
                    category: IssueCategory::Performance,
                    description: "".to_string(),
                    affected_module: "".to_string(),
                },
                Issue {
                    id: "2".to_string(),
                    severity: IssueSeverity::Critical,
                    category: IssueCategory::Stability,
                    description: "".to_string(),
                    affected_module: "".to_string(),
                },
            ],
            recommendations: vec![],
            health_score: 50.0,
        };
        assert!(report.has_critical_issues());
    }

    #[test]
    fn test_has_critical_issues_empty() {
        let report = EvolutionReport {
            id: "r".to_string(),
            timestamp: 0,
            issues: vec![],
            recommendations: vec![],
            health_score: 100.0,
        };
        assert!(!report.has_critical_issues());
    }

    // ─────────────────────────────────────────────────────────────
    // prioritized_recommendations Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_prioritized_recommendations_empty() {
        let report = EvolutionReport {
            id: "r".to_string(),
            timestamp: 0,
            issues: vec![],
            recommendations: vec![],
            health_score: 100.0,
        };
        let recs = report.prioritized_recommendations();
        assert!(recs.is_empty());
    }

    #[test]
    fn test_prioritized_recommendations_sorted() {
        let report = EvolutionReport {
            id: "r".to_string(),
            timestamp: 0,
            issues: vec![],
            recommendations: vec![
                Recommendation {
                    id: "low".to_string(),
                    action: RepairAction::Rebalance,
                    priority: 1,
                    estimated_impact: 0.1,
                },
                Recommendation {
                    id: "high".to_string(),
                    action: RepairAction::Rebalance,
                    priority: 10,
                    estimated_impact: 0.9,
                },
                Recommendation {
                    id: "medium".to_string(),
                    action: RepairAction::Rebalance,
                    priority: 5,
                    estimated_impact: 0.5,
                },
            ],
            health_score: 70.0,
        };

        let recs = report.prioritized_recommendations();
        assert_eq!(recs.len(), 3);
        assert_eq!(recs[0].id, "high");
        assert_eq!(recs[1].id, "medium");
        assert_eq!(recs[2].id, "low");
    }

    #[test]
    fn test_prioritized_recommendations_same_priority() {
        let report = EvolutionReport {
            id: "r".to_string(),
            timestamp: 0,
            issues: vec![],
            recommendations: vec![
                Recommendation {
                    id: "a".to_string(),
                    action: RepairAction::Rebalance,
                    priority: 5,
                    estimated_impact: 0.5,
                },
                Recommendation {
                    id: "b".to_string(),
                    action: RepairAction::Rebalance,
                    priority: 5,
                    estimated_impact: 0.5,
                },
            ],
            health_score: 80.0,
        };

        let recs = report.prioritized_recommendations();
        assert_eq!(recs.len(), 2);
        // Both have same priority, order preserved
    }

    #[test]
    fn test_prioritized_recommendations_does_not_modify_original() {
        let report = EvolutionReport {
            id: "r".to_string(),
            timestamp: 0,
            issues: vec![],
            recommendations: vec![
                Recommendation {
                    id: "second".to_string(),
                    action: RepairAction::Rebalance,
                    priority: 1,
                    estimated_impact: 0.1,
                },
                Recommendation {
                    id: "first".to_string(),
                    action: RepairAction::Rebalance,
                    priority: 10,
                    estimated_impact: 0.9,
                },
            ],
            health_score: 70.0,
        };

        let _ = report.prioritized_recommendations();
        // Original should still have "second" first
        assert_eq!(report.recommendations[0].id, "second");
    }
}
