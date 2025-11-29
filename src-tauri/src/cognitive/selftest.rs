use crate::cognitive::security::*;
/**
 * TITANE∞ v17 - Cognitive Self-Test
 *
 * Tests automatisés pour validation cognitive system
 */
use crate::cognitive::CognitiveState;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CognitiveSelfTestResult {
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
 * Lance une batterie de tests cognitifs
 */
pub fn cognitive_selftest() -> CognitiveSelfTestResult {
    let tests = vec![
        test_default_state_valid(),
        test_nan_detection(),
        test_bounds_detection(),
        test_sanitization(),
        test_transition_validation(),
        test_hash_integrity(),
        test_auto_repair(),
    ];

    let passed_count = tests.iter().filter(|t| t.passed).count();
    let pass_rate = passed_count as f32 / tests.len() as f32;

    CognitiveSelfTestResult {
        tests,
        pass_rate,
        timestamp: crate::core::utils::now_ms(),
    }
}

// ────────────────────────────────────────────────────────────────
// Individual Tests
// ────────────────────────────────────────────────────────────────

fn test_default_state_valid() -> TestResult {
    let state = CognitiveState::new();
    let validation = cognitive_validate(&state);

    TestResult {
        name: "Default State Validation".to_string(),
        passed: validation.valid,
        details: if validation.valid {
            "Default state is valid".to_string()
        } else {
            format!("Errors: {}", validation.errors.join("; "))
        },
    }
}

fn test_nan_detection() -> TestResult {
    let mut state = CognitiveState::new();
    state.mental.charge.current = f32::NAN;

    let validation = cognitive_validate(&state);

    TestResult {
        name: "NaN Detection".to_string(),
        passed: !validation.valid && validation.errors.iter().any(|e| e.contains("NaN")),
        details: if !validation.valid {
            "NaN correctly detected".to_string()
        } else {
            "Failed to detect NaN".to_string()
        },
    }
}

fn test_bounds_detection() -> TestResult {
    let mut state = CognitiveState::new();
    state.heart.alignment = 1.5; // Out of bounds

    let validation = cognitive_validate(&state);

    TestResult {
        name: "Bounds Detection".to_string(),
        passed: !validation.valid
            && validation
                .errors
                .iter()
                .any(|e| e.contains("out of bounds")),
        details: if !validation.valid {
            "Out of bounds correctly detected".to_string()
        } else {
            "Failed to detect out of bounds".to_string()
        },
    }
}

fn test_sanitization() -> TestResult {
    let mut state = CognitiveState::new();
    state.mental.charge.current = f32::NAN;
    state.heart.alignment = 2.0;

    cognitive_sanitize(&mut state);

    let validation = cognitive_validate(&state);

    TestResult {
        name: "Sanitization".to_string(),
        passed: validation.valid,
        details: if validation.valid {
            "Sanitization successful".to_string()
        } else {
            format!("Sanitization failed: {}", validation.errors.join("; "))
        },
    }
}

fn test_transition_validation() -> TestResult {
    let prev = CognitiveState::new();
    let mut next = prev.clone();
    next.mental.charge.current = 0.9; // Large jump
    next.timestamp = prev.timestamp + 1000;

    let result = cognitive_transition_validate(&prev, &next);

    TestResult {
        name: "Transition Validation".to_string(),
        passed: result.is_err(),
        details: if result.is_err() {
            "Invalid transition correctly rejected".to_string()
        } else {
            "Failed to reject invalid transition".to_string()
        },
    }
}

fn test_hash_integrity() -> TestResult {
    let state = CognitiveState::new();
    let hash1 = cognitive_compute_hash(&state);
    let hash2 = cognitive_compute_hash(&state);

    let mut state2 = state.clone();
    state2.mental.charge.current = 0.9;
    let hash3 = cognitive_compute_hash(&state2);

    let same_hash = hash1 == hash2;
    let different_hash = hash1 != hash3;

    TestResult {
        name: "Hash Integrity".to_string(),
        passed: same_hash && different_hash,
        details: if same_hash && different_hash {
            "Hash consistency validated".to_string()
        } else {
            "Hash integrity test failed".to_string()
        },
    }
}

fn test_auto_repair() -> TestResult {
    let prev = CognitiveState::new();
    let mut current = prev.clone();
    current.mental.charge.current = f32::NAN;

    let result = cognitive_auto_repair(&prev, &mut current);

    let passed = result.is_ok() && !current.mental.charge.current.is_nan();

    TestResult {
        name: "Auto-Repair".to_string(),
        passed,
        details: if passed {
            "Auto-repair successful".to_string()
        } else {
            format!("Auto-repair failed: {:?}", result)
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cognitive_selftest() {
        let result = cognitive_selftest();

        // Au moins 5 tests sur 7 devraient passer
        assert!(result.pass_rate >= 0.7);
        assert_eq!(result.tests.len(), 7);
    }
}
