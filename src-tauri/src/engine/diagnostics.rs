// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — ENGINE: DIAGNOSTICS
//   System Analysis & Issue Detection
// ═══════════════════════════════════════════════════════════════

use crate::{
    types::{EvolutionReport, Issue, IssueSeverity, IssueCategory, Recommendation, RepairAction, 
            HeliosState, NexusState, HarmoniaState, SentinelState},
    utils::{AppResult, log_info},
};
use chrono::Utc;
use uuid::Uuid;

pub struct DiagnosticsEngine;

impl DiagnosticsEngine {
    pub fn new() -> Self {
        Self
    }
    
    /// Perform full system diagnosis
    pub async fn diagnose(
        &self,
        helios: &HeliosState,
        nexus: &NexusState,
        harmonia: &HarmoniaState,
        sentinel: &SentinelState,
    ) -> AppResult<EvolutionReport> {
        log_info("Diagnostics", "Performing system diagnosis");
        
        let mut issues = Vec::new();
        let mut recommendations = Vec::new();
        
        // Analyze Helios (System Resources)
        if helios.cpu_usage > 90.0 {
            issues.push(Issue {
                id: Uuid::new_v4().to_string(),
                severity: IssueSeverity::Critical,
                category: IssueCategory::Performance,
                description: format!("Critical CPU usage: {:.1}%", helios.cpu_usage),
                affected_module: "Helios".to_string(),
            });
            
            recommendations.push(Recommendation {
                id: Uuid::new_v4().to_string(),
                action: RepairAction::Log("CPU usage critical - consider reducing workload".to_string()),
                priority: 10,
                estimated_impact: 30.0,
            });
        } else if helios.cpu_usage > 75.0 {
            issues.push(Issue {
                id: Uuid::new_v4().to_string(),
                severity: IssueSeverity::Medium,
                category: IssueCategory::Performance,
                description: format!("High CPU usage: {:.1}%", helios.cpu_usage),
                affected_module: "Helios".to_string(),
            });
        }
        
        if helios.ram_usage > 90.0 {
            issues.push(Issue {
                id: Uuid::new_v4().to_string(),
                severity: IssueSeverity::Critical,
                category: IssueCategory::Resource,
                description: format!("Critical RAM usage: {:.1}%", helios.ram_usage),
                affected_module: "Helios".to_string(),
            });
            
            recommendations.push(Recommendation {
                id: Uuid::new_v4().to_string(),
                action: RepairAction::ClearCache("Memory".to_string()),
                priority: 9,
                estimated_impact: 25.0,
            });
        }
        
        // Analyze Nexus (Module Health)
        let failing_modules: Vec<_> = nexus.modules.values()
            .filter(|m| matches!(m.health, crate::types::ModuleHealth::Failing | crate::types::ModuleHealth::Offline))
            .collect();
        
        if !failing_modules.is_empty() {
            for module in failing_modules {
                issues.push(Issue {
                    id: Uuid::new_v4().to_string(),
                    severity: IssueSeverity::High,
                    category: IssueCategory::Stability,
                    description: format!("Module {} is failing", module.name),
                    affected_module: module.name.clone(),
                });
                
                recommendations.push(Recommendation {
                    id: Uuid::new_v4().to_string(),
                    action: RepairAction::RestartModule(module.name.clone()),
                    priority: 8,
                    estimated_impact: 40.0,
                });
            }
        }
        
        // Analyze Harmonia (Balance)
        if harmonia.balance_score < 50.0 {
            issues.push(Issue {
                id: Uuid::new_v4().to_string(),
                severity: IssueSeverity::Medium,
                category: IssueCategory::Performance,
                description: format!("Low balance score: {:.1}", harmonia.balance_score),
                affected_module: "Harmonia".to_string(),
            });
            
            recommendations.push(Recommendation {
                id: Uuid::new_v4().to_string(),
                action: RepairAction::Rebalance,
                priority: 7,
                estimated_impact: 20.0,
            });
        }
        
        // Analyze Sentinel (Integrity)
        if sentinel.integrity_score < 70.0 {
            issues.push(Issue {
                id: Uuid::new_v4().to_string(),
                severity: IssueSeverity::High,
                category: IssueCategory::Resource,
                description: format!("Low integrity score: {:.1}", sentinel.integrity_score),
                affected_module: "Sentinel".to_string(),
            });
        }
        
        // Calculate overall health score
        let health_score = (100.0 - helios.cpu_usage) * 0.25 +
            (100.0 - helios.ram_usage) * 0.25 +
            nexus.coherence_score * 0.25 +
            harmonia.balance_score * 0.15 +
            sentinel.integrity_score * 0.10;
        
        Ok(EvolutionReport {
            id: Uuid::new_v4().to_string(),
            timestamp: Utc::now().timestamp(),
            issues,
            recommendations,
            health_score,
        })
    }
}

impl Default for DiagnosticsEngine {
    fn default() -> Self {
        Self::new()
    }
}
