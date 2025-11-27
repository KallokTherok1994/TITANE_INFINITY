// ═══════════════════════════════════════════════════════════════════════════════
//   TITANE∞ v20 — SINGULARITY SELF-TEST v∞
//   Tests complets de l'état global unifié
// ═══════════════════════════════════════════════════════════════════════════════

use crate::singularity::singularity_state_vinfinity::SingularityStateVInfinity;

/// Résultat d'un test de cohérence
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SelfTestResult {
    pub test_name: String,
    pub passed: bool,
    pub score: f32,
    pub details: String,
    pub recommendations: Vec<String>,
}

/// Rapport complet de self-test
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SelfTestReport {
    pub total_tests: usize,
    pub passed_tests: usize,
    pub failed_tests: usize,
    pub global_score: f32,
    pub results: Vec<SelfTestResult>,
    pub critical_issues: Vec<String>,
    pub timestamp: String,
}

/// Exécute le self-test complet de SingularityState v∞
///
/// # Tests effectués:
/// 1. Cohérence structurelle
/// 2. Cohérence inter-moteurs
/// 3. Cohérence temporelle
/// 4. Cohérence cognitive
/// 5. Cohérence mémoire
/// 6. Sandbox/Security
/// 7. Hash validation
/// 8. Deep Sync complet
/// 9. Méta-cognition active
/// 10. Intégrité totale
pub fn singularity_selftest(state: &SingularityStateVInfinity) -> SelfTestReport {
    let mut results = Vec::new();
    let mut critical_issues = Vec::new();

    // ═══════════════════════════════════════════════════════════════
    // TEST 1: COHÉRENCE STRUCTURELLE
    // ═══════════════════════════════════════════════════════════════
    let test1 = test_structural_coherence(state);
    if !test1.passed {
        critical_issues.push("Structural coherence failure".to_string());
    }
    results.push(test1);

    // ═══════════════════════════════════════════════════════════════
    // TEST 2: COHÉRENCE INTER-MOTEURS
    // ═══════════════════════════════════════════════════════════════
    let test2 = test_inter_engine_coherence(state);
    if !test2.passed {
        critical_issues.push("Inter-engine coherence failure".to_string());
    }
    results.push(test2);

    // ═══════════════════════════════════════════════════════════════
    // TEST 3: COHÉRENCE TEMPORELLE
    // ═══════════════════════════════════════════════════════════════
    let test3 = test_temporal_coherence(state);
    results.push(test3);

    // ═══════════════════════════════════════════════════════════════
    // TEST 4: COHÉRENCE COGNITIVE
    // ═══════════════════════════════════════════════════════════════
    let test4 = test_cognitive_coherence(state);
    if !test4.passed {
        critical_issues.push("Cognitive coherence failure".to_string());
    }
    results.push(test4);

    // ═══════════════════════════════════════════════════════════════
    // TEST 5: COHÉRENCE MÉMOIRE
    // ═══════════════════════════════════════════════════════════════
    let test5 = test_memory_coherence(state);
    results.push(test5);

    // ═══════════════════════════════════════════════════════════════
    // TEST 6: SANDBOX/SECURITY
    // ═══════════════════════════════════════════════════════════════
    let test6 = test_sandbox_security(state);
    if !test6.passed {
        critical_issues.push("Security violation detected".to_string());
    }
    results.push(test6);

    // ═══════════════════════════════════════════════════════════════
    // TEST 7: HASH VALIDATION
    // ═══════════════════════════════════════════════════════════════
    let test7 = test_hash_validation(state);
    if !test7.passed {
        critical_issues.push("Hash mismatch - integrity compromised".to_string());
    }
    results.push(test7);

    // ═══════════════════════════════════════════════════════════════
    // TEST 8: DEEP SYNC COMPLET
    // ═══════════════════════════════════════════════════════════════
    let test8 = test_deep_sync_complete(state);
    results.push(test8);

    // ═══════════════════════════════════════════════════════════════
    // TEST 9: MÉTA-COGNITION ACTIVE
    // ═══════════════════════════════════════════════════════════════
    let test9 = test_meta_cognition_active(state);
    results.push(test9);

    // ═══════════════════════════════════════════════════════════════
    // TEST 10: INTÉGRITÉ TOTALE
    // ═══════════════════════════════════════════════════════════════
    let test10 = test_total_integrity(state);
    if !test10.passed {
        critical_issues.push("Total integrity check failed".to_string());
    }
    results.push(test10);

    // ═══════════════════════════════════════════════════════════════
    // CALCUL SCORE GLOBAL
    // ═══════════════════════════════════════════════════════════════
    let total_tests = results.len();
    let passed_tests = results.iter().filter(|r| r.passed).count();
    let failed_tests = total_tests - passed_tests;
    let global_score = results.iter().map(|r| r.score).sum::<f32>() / total_tests as f32;

    SelfTestReport {
        total_tests,
        passed_tests,
        failed_tests,
        global_score,
        results,
        critical_issues,
        timestamp: chrono::Utc::now().to_rfc3339(),
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   TESTS INDIVIDUELS
// ═══════════════════════════════════════════════════════════════════════════════

fn test_structural_coherence(state: &SingularityStateVInfinity) -> SelfTestResult {
    let mut score = 100.0;
    let mut details = String::new();
    let mut recommendations = Vec::new();

    // Vérifier version
    if state.version.is_empty() {
        score -= 20.0;
        details.push_str("Version empty. ");
        recommendations.push("Set version field".to_string());
    }

    // Vérifier hash
    if state.global_hash.is_empty() {
        score -= 30.0;
        details.push_str("Hash empty. ");
        recommendations.push("Compute global hash".to_string());
    }

    // Vérifier timestamps
    if state.created_at.is_empty() || state.updated_at.is_empty() {
        score -= 10.0;
        details.push_str("Timestamps incomplete. ");
    }

    let passed = score >= 70.0;
    if passed {
        details.push_str("Structural integrity OK");
    }

    SelfTestResult {
        test_name: "Structural Coherence".to_string(),
        passed,
        score,
        details,
        recommendations,
    }
}

fn test_inter_engine_coherence(state: &SingularityStateVInfinity) -> SelfTestResult {
    let mut score = 100.0;
    let mut details = String::new();
    let mut recommendations = Vec::new();

    // Vérifier cohérence cognitive
    if state.cognitive.coherence < 0.5 {
        score -= 15.0;
        details.push_str("Low cognitive coherence. ");
        recommendations.push("Execute cognitive sync".to_string());
    }

    // Vérifier meta alignment
    if state.meta.alignment_score < 0.5 {
        score -= 15.0;
        details.push_str("Low meta alignment. ");
        recommendations.push("Execute meta sync".to_string());
    }

    // Vérifier deep sync level
    if state.deep_sync.sync_level < 0.7 {
        score -= 20.0;
        details.push_str("Deep sync incomplete. ");
        recommendations.push("Execute deep_sync()".to_string());
    }

    // Vérifier core coherence
    if state.core.coherence_absolute < 0.8 {
        score -= 15.0;
        details.push_str("Low core coherence. ");
        recommendations.push("Recalibrate core".to_string());
    }

    let passed = score >= 70.0;
    if passed {
        details.push_str("Inter-engine coherence OK");
    }

    SelfTestResult {
        test_name: "Inter-Engine Coherence".to_string(),
        passed,
        score,
        details,
        recommendations,
    }
}

fn test_temporal_coherence(state: &SingularityStateVInfinity) -> SelfTestResult {
    let mut score = 100.0;
    let mut details = String::new();
    let mut recommendations = Vec::new();

    // Vérifier timeline integrity
    if state.timeline.integrity_score < 0.7 {
        score -= 20.0;
        details.push_str("Timeline integrity low. ");
        recommendations.push("Verify timeline events".to_string());
    }

    // Vérifier timestamps cohérence
    if state.updated_at < state.created_at {
        score -= 50.0;
        details.push_str("Temporal paradox detected! ");
        recommendations.push("Fix timestamps".to_string());
    }

    let passed = score >= 70.0;
    if passed {
        details.push_str("Temporal coherence OK");
    }

    SelfTestResult {
        test_name: "Temporal Coherence".to_string(),
        passed,
        score,
        details,
        recommendations,
    }
}

fn test_cognitive_coherence(state: &SingularityStateVInfinity) -> SelfTestResult {
    let mut score = 100.0;
    let mut details = String::new();
    let mut recommendations = Vec::new();

    // Vérifier patterns detection
    if state.cognitive.patterns_detected == 0 {
        score -= 10.0;
        details.push_str("No patterns detected. ");
    }

    // Vérifier learning rate
    if state.cognitive.learning_rate < 0.1 {
        score -= 15.0;
        details.push_str("Low learning rate. ");
        recommendations.push("Increase learning exposure".to_string());
    }

    // Vérifier meta awareness
    if state.meta.self_awareness_level < 0.5 {
        score -= 20.0;
        details.push_str("Low self-awareness. ");
        recommendations.push("Execute meta-cognition cycle".to_string());
    }

    let passed = score >= 70.0;
    if passed {
        details.push_str("Cognitive coherence OK");
    }

    SelfTestResult {
        test_name: "Cognitive Coherence".to_string(),
        passed,
        score,
        details,
        recommendations,
    }
}

fn test_memory_coherence(state: &SingularityStateVInfinity) -> SelfTestResult {
    let mut score = 100.0;
    let mut details = String::new();
    let mut recommendations = Vec::new();

    // Vérifier memory health
    if state.memory.health < 0.7 {
        score -= 20.0;
        details.push_str("Memory health degraded. ");
        recommendations.push("Execute memory maintenance".to_string());
    }

    // Vérifier storage usage
    if state.memory.storage_used_mb > 1000.0 {
        score -= 10.0;
        details.push_str("High storage usage. ");
        recommendations.push("Consider pruning old entries".to_string());
    }

    let passed = score >= 70.0;
    if passed {
        details.push_str("Memory coherence OK");
    }

    SelfTestResult {
        test_name: "Memory Coherence".to_string(),
        passed,
        score,
        details,
        recommendations,
    }
}

fn test_sandbox_security(state: &SingularityStateVInfinity) -> SelfTestResult {
    let mut score = 100.0;
    let mut details = String::new();
    let mut recommendations = Vec::new();

    // Vérifier violations
    if state.sandbox.violations_detected > 0 {
        score -= 30.0;
        details.push_str(&format!("{} security violations. ", state.sandbox.violations_detected));
        recommendations.push("Investigate security breaches".to_string());
    }

    // Vérifier security level
    if state.sandbox.security_level != "HIGH" && state.sandbox.security_level != "MAXIMUM" {
        score -= 15.0;
        details.push_str("Security level not optimal. ");
        recommendations.push("Upgrade security level".to_string());
    }

    let passed = score >= 70.0;
    if passed {
        details.push_str("Sandbox/Security OK");
    }

    SelfTestResult {
        test_name: "Sandbox/Security".to_string(),
        passed,
        score,
        details,
        recommendations,
    }
}

fn test_hash_validation(state: &SingularityStateVInfinity) -> SelfTestResult {
    let computed_hash = state.compute_hash();
    let matches = computed_hash == state.global_hash;

    let score = if matches { 100.0 } else { 0.0 };
    let details = if matches {
        "Hash validation passed".to_string()
    } else {
        format!("Hash mismatch! Expected: {}, Got: {}",
            &state.global_hash[..16], &computed_hash[..16])
    };

    let mut recommendations = Vec::new();
    if !matches {
        recommendations.push("Recompute global hash immediately".to_string());
        recommendations.push("Investigate state tampering".to_string());
    }

    SelfTestResult {
        test_name: "Hash Validation".to_string(),
        passed: matches,
        score,
        details,
        recommendations,
    }
}

fn test_deep_sync_complete(state: &SingularityStateVInfinity) -> SelfTestResult {
    let mut score = 100.0;
    let mut details = String::new();
    let mut recommendations = Vec::new();

    // Vérifier modules synced
    if state.deep_sync.modules_synced < 20 {
        score -= 30.0;
        details.push_str(&format!("Only {} modules synced (expected 20). ",
            state.deep_sync.modules_synced));
        recommendations.push("Execute full deep_sync()".to_string());
    }

    // Vérifier conflicts
    if state.deep_sync.conflicts_resolved > 10 {
        score -= 15.0;
        details.push_str("High conflict count. ");
        recommendations.push("Investigate recurring conflicts".to_string());
    }

    let passed = score >= 70.0;
    if passed {
        details.push_str("Deep Sync complete");
    }

    SelfTestResult {
        test_name: "Deep Sync Complete".to_string(),
        passed,
        score,
        details,
        recommendations,
    }
}

fn test_meta_cognition_active(state: &SingularityStateVInfinity) -> SelfTestResult {
    let mut score = 100.0;
    let mut details = String::new();
    let mut recommendations = Vec::new();

    // Vérifier meta loops
    if state.meta.meta_loops_active == 0 {
        score -= 25.0;
        details.push_str("No meta loops active. ");
        recommendations.push("Activate meta-cognition".to_string());
    }

    // Vérifier alignment
    if state.meta.alignment_score < 0.6 {
        score -= 20.0;
        details.push_str("Low alignment score. ");
        recommendations.push("Execute meta evaluation".to_string());
    }

    let passed = score >= 70.0;
    if passed {
        details.push_str("Meta-cognition active");
    }

    SelfTestResult {
        test_name: "Meta-Cognition Active".to_string(),
        passed,
        score,
        details,
        recommendations,
    }
}

fn test_total_integrity(state: &SingularityStateVInfinity) -> SelfTestResult {
    let integrity_check = state.integrity_check();

    let score = if integrity_check.is_valid { 100.0 } else { 50.0 };
    let details = format!(
        "Valid: {}, Hash: {}, Corrupted: {:?}",
        integrity_check.is_valid,
        integrity_check.hash_matches,
        integrity_check.corrupted_modules
    );

    let mut recommendations = integrity_check.repair_suggestions.clone();
    if !integrity_check.is_valid {
        recommendations.push("Execute singularity_repair()".to_string());
    }

    SelfTestResult {
        test_name: "Total Integrity".to_string(),
        passed: integrity_check.is_valid,
        score,
        details,
        recommendations,
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   TAURI COMMAND
// ═══════════════════════════════════════════════════════════════════════════════

use crate::singularity::singularity_commands::SingularityStateGlobal;
use tauri::State;

/// Exécute le self-test complet v∞
#[tauri::command]
pub async fn singularity_selftest_full(
    state: State<'_, SingularityStateGlobal>
) -> Result<SelfTestReport, String> {
    log::info!("[Command] singularity_selftest_full");

    let state_lock = state.state.lock().await;
    let report = singularity_selftest(&state_lock);

    log::info!("[SelfTest] Score: {:.1}%, Passed: {}/{}",
        report.global_score, report.passed_tests, report.total_tests);

    if !report.critical_issues.is_empty() {
        log::warn!("[SelfTest] Critical issues: {:?}", report.critical_issues);
    }

    Ok(report)
}
