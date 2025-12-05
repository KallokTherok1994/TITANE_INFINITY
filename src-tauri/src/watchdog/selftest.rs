/**
 * TITANE∞ v17 - Watchdog Self-Test
 *
 * Tests automatisés pour validation watchdog system
 */
use crate::cognitive::CognitiveState;
use crate::singularity::SingularityState;
use crate::watchdog::scanner::AnomalyType;
use crate::watchdog::{AlertLevel, WatchdogFixer, WatchdogScanner};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WatchdogSelfTestResult {
    pub tests: Vec<TestResult>,
    pub pass_rate: f32,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestResult {
    pub name: String,
    pub passed: bool,
    pub details: String,
}

/**
 * Lance une batterie de tests watchdog
 */
pub fn watchdog_selftest() -> WatchdogSelfTestResult {
    let tests = vec![
        test_scan_clean_state(),
        test_scan_detect_nan(),
        test_scan_detect_overload(),
        test_fix_sanitization(),
        test_fix_rollback(),
    ];

    let passed_count = tests.iter().filter(|t| t.passed).count();
    let pass_rate = passed_count as f32 / tests.len() as f32;

    WatchdogSelfTestResult {
        tests,
        pass_rate,
        timestamp: crate::core::utils::now_ms(),
    }
}

// ────────────────────────────────────────────────────────────────
// Individual Tests
// ────────────────────────────────────────────────────────────────

fn test_scan_clean_state() -> TestResult {
    let mut scanner = WatchdogScanner::new();
    let cognitive = CognitiveState::new();
    let singularity = SingularityState::new();

    let result = scanner.scan(&cognitive, &singularity);

    // Clean ou seulement warnings/info
    let passed = result.clean
        || result
            .anomalies
            .iter()
            .all(|a| matches!(a.severity, AlertLevel::Info | AlertLevel::Warn));

    TestResult {
        name: "Scan Clean State".to_string(),
        passed,
        details: if passed {
            format!(
                "Clean scan: {} anomalies (all minor)",
                result.anomalies.len()
            )
        } else {
            format!("Unexpected anomalies detected: {}", result.anomalies.len())
        },
    }
}

fn test_scan_detect_nan() -> TestResult {
    let mut scanner = WatchdogScanner::new();
    let mut cognitive = CognitiveState::new();
    cognitive.mental.charge.current = f32::NAN;
    let singularity = SingularityState::new();

    let result = scanner.scan(&cognitive, &singularity);

    let detected = result
        .anomalies
        .iter()
        .any(|a| matches!(a.anomaly_type, AnomalyType::NaNDetected { .. }));

    TestResult {
        name: "Scan Detect NaN".to_string(),
        passed: detected,
        details: if detected {
            "NaN correctly detected by scanner".to_string()
        } else {
            "Failed to detect NaN".to_string()
        },
    }
}

fn test_scan_detect_overload() -> TestResult {
    let mut scanner = WatchdogScanner::new();
    let mut cognitive = CognitiveState::new();
    cognitive.mental.charge.current = 1.0;
    cognitive.mental.charge.capacity = 0.8;
    let singularity = SingularityState::new();

    let result = scanner.scan(&cognitive, &singularity);

    let detected = result
        .anomalies
        .iter()
        .any(|a| matches!(a.anomaly_type, AnomalyType::CognitiveOverload { .. }));

    TestResult {
        name: "Scan Detect Overload".to_string(),
        passed: detected,
        details: if detected {
            "Overload correctly detected".to_string()
        } else {
            "Failed to detect overload".to_string()
        },
    }
}

fn test_fix_sanitization() -> TestResult {
    let mut fixer = WatchdogFixer::new();
    let mut state = CognitiveState::new();

    // Sauvegarder état valide d'abord
    let _ = fixer.fix(&mut state, &[]);

    // Créer anomalies mineures
    state.mental.charge.current = 1.5;

    let anomalies = vec![crate::watchdog::scanner::Anomaly {
        anomaly_type: AnomalyType::OutOfBounds {
            field: "mental.charge.current".to_string(),
            value: 1.5,
            min: 0.0,
            max: 1.0,
        },
        severity: AlertLevel::Warn,
        detected_at: crate::core::utils::now_ms(),
        context: "test".to_string(),
    }];

    let result = fixer.fix(&mut state, &anomalies);

    TestResult {
        name: "Fix Sanitization".to_string(),
        passed: result.success && state.mental.charge.current <= 1.0,
        details: if result.success {
            "Sanitization fix successful".to_string()
        } else {
            "Sanitization fix failed".to_string()
        },
    }
}

fn test_fix_rollback() -> TestResult {
    let mut fixer = WatchdogFixer::new();
    let mut state = CognitiveState::new();

    // Sauvegarder état valide
    let _ = fixer.fix(&mut state, &[]);

    // Corrompre avec NaN
    state.mental.charge.current = f32::NAN;

    let anomalies = vec![crate::watchdog::scanner::Anomaly {
        anomaly_type: AnomalyType::NaNDetected {
            fields: vec!["mental.charge.current".to_string()],
        },
        severity: AlertLevel::Critical,
        detected_at: crate::core::utils::now_ms(),
        context: "test".to_string(),
    }];

    let result = fixer.fix(&mut state, &anomalies);

    TestResult {
        name: "Fix Rollback".to_string(),
        passed: result.success && !state.mental.charge.current.is_nan(),
        details: if result.success {
            "Rollback fix successful".to_string()
        } else {
            "Rollback fix failed".to_string()
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_watchdog_selftest() {
        let result = watchdog_selftest();

        // Au moins 4 tests sur 5 devraient passer
        assert!(result.pass_rate >= 0.8);
        assert_eq!(result.tests.len(), 5);
    }
}
