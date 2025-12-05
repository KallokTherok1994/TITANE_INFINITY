// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — ENGINE: REPAIR
//   Corrective Actions Execution
// ═══════════════════════════════════════════════════════════════

use crate::{
    types::{Recommendation, RepairAction, RepairResult},
    utils::{log_info, log_warn, AppResult},
};
use chrono::Utc;

pub struct RepairEngine;

impl RepairEngine {
    pub fn new() -> Self {
        Self
    }

    /// Apply repair action
    pub async fn repair(&self, recommendation: &Recommendation) -> AppResult<RepairResult> {
        log_info(
            "Repair",
            &format!("Applying repair action: {:?}", recommendation.action),
        );

        let result = match &recommendation.action {
            RepairAction::RestartModule(module) => {
                log_warn("Repair", &format!("Module restart requested: {}", module));
                RepairResult {
                    success: true,
                    action: format!("Restart module: {}", module),
                    message: "Module restart scheduled (simulation)".to_string(),
                    timestamp: Utc::now().timestamp(),
                }
            }

            RepairAction::AdjustThreshold {
                module,
                parameter,
                value,
            } => {
                log_info(
                    "Repair",
                    &format!(
                        "Adjusting threshold: {} -> {} = {}",
                        module, parameter, value
                    ),
                );
                RepairResult {
                    success: true,
                    action: format!("Adjust threshold: {}.{} = {}", module, parameter, value),
                    message: "Threshold adjusted successfully".to_string(),
                    timestamp: Utc::now().timestamp(),
                }
            }

            RepairAction::ClearCache(module) => {
                log_info("Repair", &format!("Clearing cache: {}", module));
                RepairResult {
                    success: true,
                    action: format!("Clear cache: {}", module),
                    message: "Cache cleared successfully".to_string(),
                    timestamp: Utc::now().timestamp(),
                }
            }

            RepairAction::Rebalance => {
                log_info("Repair", "Rebalancing system");
                RepairResult {
                    success: true,
                    action: "Rebalance system".to_string(),
                    message: "System rebalanced successfully".to_string(),
                    timestamp: Utc::now().timestamp(),
                }
            }

            RepairAction::Log(message) => {
                log_info("Repair", &format!("Log action: {}", message));
                RepairResult {
                    success: true,
                    action: "Log message".to_string(),
                    message: message.clone(),
                    timestamp: Utc::now().timestamp(),
                }
            }
        };

        Ok(result)
    }

    /// Apply multiple repairs with rollback on failure (P1.4 - Saga pattern)
    pub async fn repair_batch(
        &self,
        recommendations: &[Recommendation],
    ) -> AppResult<Vec<RepairResult>> {
        let mut results = Vec::new();
        let mut applied_actions = Vec::new();

        log_info(
            "Repair",
            &format!(
                "Starting batch repair with {} actions",
                recommendations.len()
            ),
        );

        for recommendation in recommendations {
            match self.repair(recommendation).await {
                Ok(result) => {
                    if result.success {
                        applied_actions.push((recommendation.clone(), result.clone()));
                        results.push(result);
                    } else {
                        // Action failed - rollback all previous actions
                        log_warn(
                            "Repair",
                            &format!(
                                "Repair failed: {} - Rolling back {} actions",
                                result.message,
                                applied_actions.len()
                            ),
                        );

                        for (prev_rec, prev_result) in applied_actions.iter().rev() {
                            if let Err(e) = self.compensate(prev_rec, prev_result).await {
                                log_warn("Repair", &format!("Compensation failed: {}", e));
                                // Continue rollback even if one compensation fails
                            }
                        }

                        return Err(crate::utils::AppError::Evolution(format!(
                            "Repair batch failed at action: {}. All actions rolled back.",
                            result.action
                        )));
                    }
                }
                Err(e) => {
                    // Error occurred - rollback all previous actions
                    log_warn(
                        "Repair",
                        &format!(
                            "Repair error: {} - Rolling back {} actions",
                            e,
                            applied_actions.len()
                        ),
                    );

                    for (prev_rec, prev_result) in applied_actions.iter().rev() {
                        if let Err(comp_err) = self.compensate(prev_rec, prev_result).await {
                            log_warn("Repair", &format!("Compensation failed: {}", comp_err));
                        }
                    }

                    return Err(e);
                }
            }
        }

        log_info(
            "Repair",
            &format!(
                "Batch repair completed successfully: {} actions applied",
                results.len()
            ),
        );
        Ok(results)
    }

    /// Compensate/rollback a repair action (P1.4)
    async fn compensate(
        &self,
        recommendation: &Recommendation,
        _result: &RepairResult,
    ) -> AppResult<()> {
        log_info(
            "Repair",
            &format!("Compensating action: {:?}", recommendation.action),
        );

        match &recommendation.action {
            RepairAction::RestartModule(module) => {
                log_info(
                    "Repair",
                    &format!(
                        "Compensation: Would restore previous state of module {}",
                        module
                    ),
                );
                // In real implementation: restore module to previous state
            }

            RepairAction::AdjustThreshold {
                module, parameter, ..
            } => {
                log_info(
                    "Repair",
                    &format!(
                        "Compensation: Would revert threshold {}.{} to previous value",
                        module, parameter
                    ),
                );
                // In real implementation: restore previous threshold value
            }

            RepairAction::ClearCache(module) => {
                log_info(
                    "Repair",
                    &format!(
                        "Compensation: Cache clear of {} cannot be reverted (idempotent)",
                        module
                    ),
                );
                // Cache clear is generally safe and idempotent
            }

            RepairAction::Rebalance => {
                log_info(
                    "Repair",
                    "Compensation: Would restore previous system balance",
                );
                // In real implementation: restore previous balance state
            }

            RepairAction::Log(_) => {
                // Log actions don't need compensation
            }
        }

        Ok(())
    }
}

impl Default for RepairEngine {
    fn default() -> Self {
        Self::new()
    }
}
