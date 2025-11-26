/**
 * TITANE∞ v17 - Watchdog Commands
 *
 * Commandes Tauri pour watchdog system
 */
use crate::cognitive::CognitiveState;
use crate::singularity::SingularityState;
use crate::watchdog::{WatchdogScanner, WatchdogFixer};
use crate::watchdog::scanner::ScanResult;
use crate::watchdog::fixer::FixResult;
use crate::watchdog::selftest::{watchdog_selftest, WatchdogSelfTestResult};
use std::sync::Mutex;
use once_cell::sync::Lazy;

// Global scanner et fixer instances
static SCANNER: Lazy<Mutex<WatchdogScanner>> = Lazy::new(|| Mutex::new(WatchdogScanner::new()));
static FIXER: Lazy<Mutex<WatchdogFixer>> = Lazy::new(|| Mutex::new(WatchdogFixer::new()));

#[tauri::command]
pub async fn watchdog_run_selftest() -> Result<WatchdogSelfTestResult, String> {
    Ok(watchdog_selftest())
}

#[tauri::command]
pub async fn watchdog_scan(
    cognitive: CognitiveState,
    singularity: SingularityState,
) -> Result<ScanResult, String> {
    let mut scanner = SCANNER.lock().map_err(|e| e.to_string())?;
    Ok(scanner.scan(&cognitive, &singularity))
}

#[tauri::command]
pub async fn watchdog_fix(
    mut cognitive: CognitiveState,
    anomalies: Vec<crate::watchdog::scanner::Anomaly>,
) -> Result<(CognitiveState, FixResult), String> {
    let mut fixer = FIXER.lock().map_err(|e| e.to_string())?;
    let result = fixer.fix(&mut cognitive, &anomalies);
    Ok((cognitive, result))
}
