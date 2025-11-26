/**
 * TITANE∞ v17 - Cognitive Commands
 *
 * Commandes Tauri pour système cognitif
 */
use crate::cognitive::selftest::{cognitive_selftest, CognitiveSelfTestResult};
use crate::cognitive::CognitiveState;
use crate::cognitive::security::*;

#[tauri::command]
pub async fn cognitive_run_selftest() -> Result<CognitiveSelfTestResult, String> {
    Ok(cognitive_selftest())
}

#[tauri::command]
pub async fn cognitive_validate_state(state: CognitiveState) -> Result<CognitiveValidationResult, String> {
    Ok(cognitive_validate(&state))
}

#[tauri::command]
pub async fn cognitive_compute_hash_cmd(state: CognitiveState) -> Result<String, String> {
    Ok(cognitive_compute_hash(&state))
}
