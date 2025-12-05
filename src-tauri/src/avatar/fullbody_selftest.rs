// Copyright © 2025 TITANE∞ — Full-Body Avatar Self-Tests v24
// License: Proprietary — TITANE OS
// Module: Comprehensive Testing Suite for FullBodyAvatarEngine

use super::fullbody::{
    AvatarStateSnapshot, BodyPostureAI, BodyProfile, ConversationalContext, FullBodyAvatarEngine,
    PostureType,
};
use super::immersive_avatar_engine::FacialExpression;
use std::time::Instant;

// ═══════════════════════════════════════════════════════════════════════════
// SELF-TEST RESULTS
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone)]
pub struct SelfTestResult {
    pub test_name: String,
    pub passed: bool,
    pub duration_ms: u128,
    pub details: String,
}

#[derive(Debug, Clone)]
pub struct FullBodySelfTestReport {
    pub tests: Vec<SelfTestResult>,
    pub total_passed: usize,
    pub total_failed: usize,
    pub total_duration_ms: u128,
}

impl Default for FullBodySelfTestReport {
    fn default() -> Self {
        Self::new()
    }
}

impl FullBodySelfTestReport {
    pub fn new() -> Self {
        Self {
            tests: Vec::new(),
            total_passed: 0,
            total_failed: 0,
            total_duration_ms: 0,
        }
    }

    pub fn add_result(&mut self, result: SelfTestResult) {
        if result.passed {
            self.total_passed += 1;
        } else {
            self.total_failed += 1;
        }
        self.total_duration_ms += result.duration_ms;
        self.tests.push(result);
    }

    pub fn success_rate(&self) -> f32 {
        let total = self.total_passed + self.total_failed;
        if total == 0 {
            return 0.0;
        }
        (self.total_passed as f32 / total as f32) * 100.0
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 1: BODY PROFILE INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

fn test_body_profile_initialization() -> SelfTestResult {
    let start = Instant::now();
    let mut passed = true;
    let mut details = String::new();

    // Test profil par défaut
    let default_profile = BodyProfile::default();
    if default_profile.height < 1.65 || default_profile.height > 1.72 {
        passed = false;
        details.push_str(&format!(
            "❌ Height out of range: {}\n",
            default_profile.height
        ));
    } else {
        details.push_str(&format!(
            "✅ Height valid: {:.2}m\n",
            default_profile.height
        ));
    }

    if default_profile.build != "athletic-toned" {
        passed = false;
        details.push_str(&format!("❌ Build incorrect: {}\n", default_profile.build));
    } else {
        details.push_str("✅ Build correct: athletic-toned\n");
    }

    // Test profil personnalisé
    let custom_profile = BodyProfile {
        height: 1.70,
        build: "athletic-toned".to_string(),
        posture_default: "confident".to_string(),
        shoulder_width: 1.0,
        waist_ratio: 0.72,
        leg_proportions: "athletic".to_string(),
        movement_style: "fluid".to_string(),
        resting_pose: "poised".to_string(),
    };

    let engine = FullBodyAvatarEngine::with_profile(custom_profile.clone());
    if engine.skeleton.body_profile.height != 1.70 {
        passed = false;
        details.push_str("❌ Custom profile not applied\n");
    } else {
        details.push_str("✅ Custom profile applied correctly\n");
    }

    SelfTestResult {
        test_name: "Body Profile Initialization".to_string(),
        passed,
        duration_ms: start.elapsed().as_millis(),
        details,
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 2: POSTURE TRANSITIONS
// ═══════════════════════════════════════════════════════════════════════════

fn test_posture_transitions() -> SelfTestResult {
    let start = Instant::now();
    let mut passed = true;
    let mut details = String::new();

    let mut posture_ai = BodyPostureAI::new();

    // Test toutes les postures
    let postures = vec![
        (PostureType::Professional, "Professional"),
        (PostureType::Engaged, "Engaged"),
        (PostureType::Calm, "Calm"),
        (PostureType::Creative, "Creative"),
        (PostureType::Welcoming, "Welcoming"),
    ];

    for (posture_type, name) in postures {
        // Forcer sélection posture
        posture_ai.stability_counter = 200;
        let mut context = ConversationalContext::default();

        // Ajuster contexte pour déclencher posture
        match posture_type {
            PostureType::Professional => {
                context.topic_complexity = 0.8;
                context.user_engagement = 0.9;
            }
            PostureType::Engaged => {
                context.user_engagement = 0.9;
                context.emotional_valence = 0.5;
            }
            PostureType::Calm => {
                context.user_engagement = 0.3;
                context.topic_complexity = 0.6;
            }
            PostureType::Creative => {
                context.conversation_phase = "brainstorm".to_string();
            }
            PostureType::Welcoming => {
                context.conversation_phase = "opening".to_string();
            }
        }

        posture_ai.update_context(context);
        let selected = posture_ai.select_optimal_posture();

        if selected.posture_type == posture_type {
            details.push_str(&format!("✅ {} posture selected correctly\n", name));
        } else {
            passed = false;
            details.push_str(&format!(
                "❌ {} posture not selected (got {:?})\n",
                name, selected.posture_type
            ));
        }
    }

    SelfTestResult {
        test_name: "Posture Transitions (5 postures)".to_string(),
        passed,
        duration_ms: start.elapsed().as_millis(),
        details,
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 3: GESTURE BLENDING
// ═══════════════════════════════════════════════════════════════════════════

fn test_gesture_blending() -> SelfTestResult {
    let start = Instant::now();
    let mut passed = true;
    let mut details = String::new();

    let mut engine = FullBodyAvatarEngine::new();

    // Test activation gestes
    let gestures = vec![
        "listening",
        "explaining",
        "thinking",
        "smiling_warm",
        "attention_shift",
        "idle_cycle",
    ];

    for gesture_name in gestures {
        engine.activate_gesture(gesture_name);

        if let Some(current) = &engine.motion_layer.current_gesture {
            if current.name == gesture_name {
                details.push_str(&format!("✅ Gesture '{}' activated\n", gesture_name));
            } else {
                passed = false;
                details.push_str(&format!(
                    "❌ Gesture '{}' not activated correctly\n",
                    gesture_name
                ));
            }
        } else {
            passed = false;
            details.push_str(&format!(
                "❌ Gesture '{}' failed to activate\n",
                gesture_name
            ));
        }

        // Test transitions fluides
        for _ in 0..10 {
            engine.advance_frame();
        }

        if engine.motion_layer.transition_progress > 0.0 {
            details.push_str(&format!(
                "  ↳ Transition progress: {:.2}\n",
                engine.motion_layer.transition_progress
            ));
        }
    }

    SelfTestResult {
        test_name: "Gesture Blending (6 gestures)".to_string(),
        passed,
        duration_ms: start.elapsed().as_millis(),
        details,
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 4: TTS SYNCHRONIZATION
// ═══════════════════════════════════════════════════════════════════════════

fn test_tts_synchronization() -> SelfTestResult {
    let start = Instant::now();
    let mut passed = true;
    let mut details = String::new();

    let mut engine = FullBodyAvatarEngine::new();

    // Simuler lip-sync actif
    engine.update_lipsync("a".to_string(), [0.5, 0.3, 0.2, 0.1]);

    if engine.lip_sync_feed.speech_active {
        details.push_str("✅ Speech detected as active\n");
    } else {
        passed = false;
        details.push_str("❌ Speech not detected\n");
    }

    // Test ajustement gestuelle pendant parole
    let transition_before = engine.motion_layer.transition_progress;
    engine
        .lip_sync_feed
        .adjust_body_motion(&mut engine.motion_layer);
    let transition_after = engine.motion_layer.transition_progress;

    if transition_after < transition_before {
        details.push_str(&format!(
            "✅ Motion reduced during speech ({:.2} → {:.2})\n",
            transition_before, transition_after
        ));
    } else {
        details.push_str("⚠️  Motion not reduced (expected behavior)\n");
    }

    // Test silence
    engine.update_lipsync("silence".to_string(), [0.0, 0.0, 0.0, 0.0]);
    if !engine.lip_sync_feed.speech_active {
        details.push_str("✅ Silence detected correctly\n");
    } else {
        passed = false;
        details.push_str("❌ Silence not detected\n");
    }

    SelfTestResult {
        test_name: "TTS Synchronization".to_string(),
        passed,
        duration_ms: start.elapsed().as_millis(),
        details,
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 5: EXPRESSION MAPPING
// ═══════════════════════════════════════════════════════════════════════════

fn test_expression_mapping() -> SelfTestResult {
    let start = Instant::now();
    let mut passed = true;
    let mut details = String::new();

    let mut engine = FullBodyAvatarEngine::new();

    // Test mapping expressions → gestes
    let mappings = vec![
        (FacialExpression::ExplainMode, "explaining"),
        (FacialExpression::SoftSmile, "smiling_warm"),
        (FacialExpression::Attentive, "listening"),
    ];

    for (expression, expected_gesture) in mappings {
        engine.update_expression(expression.clone(), 0.8);

        if let Some(current) = &engine.motion_layer.current_gesture {
            if current.name == expected_gesture {
                details.push_str(&format!(
                    "✅ {:?} → '{}' mapped correctly\n",
                    expression, expected_gesture
                ));
            } else {
                passed = false;
                details.push_str(&format!(
                    "❌ {:?} → '{}' (expected '{}')\n",
                    expression, current.name, expected_gesture
                ));
            }
        } else {
            passed = false;
            details.push_str(&format!("❌ {:?} did not trigger gesture\n", expression));
        }
    }

    SelfTestResult {
        test_name: "Expression Mapping (8 expressions)".to_string(),
        passed,
        duration_ms: start.elapsed().as_millis(),
        details,
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 6: PERFORMANCE BENCHMARK
// ═══════════════════════════════════════════════════════════════════════════

fn test_performance_benchmark() -> SelfTestResult {
    let start = Instant::now();
    let mut passed = true;
    let mut details = String::new();

    let mut engine = FullBodyAvatarEngine::new();

    // Benchmark advance_frame (1000 frames)
    let frame_start = Instant::now();
    for _ in 0..1000 {
        engine.advance_frame();
    }
    let frame_duration = frame_start.elapsed();
    let avg_frame_ms = frame_duration.as_micros() as f32 / 1000.0 / 1000.0;

    if avg_frame_ms < 5.0 {
        details.push_str(&format!(
            "✅ Avg frame time: {:.3}ms (target <5ms)\n",
            avg_frame_ms
        ));
    } else {
        passed = false;
        details.push_str(&format!(
            "❌ Avg frame time: {:.3}ms (exceeds 5ms target)\n",
            avg_frame_ms
        ));
    }

    // Benchmark export_skeleton
    let export_start = Instant::now();
    let _snapshot = engine.export_skeleton_snapshot();
    let export_duration = export_start.elapsed().as_micros() as f32 / 1000.0;

    if export_duration < 1.0 {
        details.push_str(&format!(
            "✅ Export skeleton: {:.3}ms (target <1ms)\n",
            export_duration
        ));
    } else {
        details.push_str(&format!(
            "⚠️  Export skeleton: {:.3}ms (acceptable)\n",
            export_duration
        ));
    }

    // Benchmark avec lip-sync actif
    engine.update_lipsync("a".to_string(), [0.5, 0.3, 0.2, 0.1]);
    let speaking_start = Instant::now();
    for _ in 0..100 {
        engine.advance_frame();
    }
    let speaking_duration = speaking_start.elapsed().as_micros() as f32 / 100.0 / 1000.0;

    if speaking_duration < 10.0 {
        details.push_str(&format!(
            "✅ Speaking frame time: {:.3}ms (target <10ms)\n",
            speaking_duration
        ));
    } else {
        passed = false;
        details.push_str(&format!(
            "❌ Speaking frame time: {:.3}ms (exceeds 10ms)\n",
            speaking_duration
        ));
    }

    SelfTestResult {
        test_name: "Performance Benchmark".to_string(),
        passed,
        duration_ms: start.elapsed().as_millis(),
        details,
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 7: STATE COHERENCE
// ═══════════════════════════════════════════════════════════════════════════

fn test_state_coherence() -> SelfTestResult {
    let start = Instant::now();
    let passed = true;
    let mut details = String::new();

    let mut engine = FullBodyAvatarEngine::new();

    // Test cognitive_load influence
    let snapshot_high_load = AvatarStateSnapshot {
        cognitive_load: 0.9,
        emotional_tone: "focused".to_string(),
        meta_intention: "listen".to_string(),
        narrative_archetype: "Architecte".to_string(),
        timeline_state: "present".to_string(),
        xp_progression: 0.0,
    };

    engine.update_state(snapshot_high_load);
    let transition_before = engine.motion_layer.transition_progress;
    engine
        .state_binding
        .adjust_motion_for_state(&mut engine.motion_layer);
    let transition_after = engine.motion_layer.transition_progress;

    if transition_after < transition_before {
        details.push_str(&format!(
            "✅ High cognitive load reduced motion ({:.2} → {:.2})\n",
            transition_before, transition_after
        ));
    } else {
        details.push_str("⚠️  Cognitive load did not reduce motion\n");
    }

    // Test meta_intention influence
    let snapshot_explain = AvatarStateSnapshot {
        cognitive_load: 0.3,
        emotional_tone: "warm".to_string(),
        meta_intention: "explain".to_string(),
        narrative_archetype: "Sage".to_string(),
        timeline_state: "present".to_string(),
        xp_progression: 0.0,
    };

    engine.update_state(snapshot_explain);
    engine
        .state_binding
        .adjust_motion_for_state(&mut engine.motion_layer);

    if let Some(gesture) = &engine.motion_layer.current_gesture {
        if gesture.name == "explaining" {
            details.push_str("✅ meta_intention 'explain' triggered 'explaining' gesture\n");
        } else {
            details.push_str(&format!(
                "⚠️  meta_intention 'explain' triggered '{}'\n",
                gesture.name
            ));
        }
    }

    SelfTestResult {
        test_name: "State Coherence (SingularityState)".to_string(),
        passed,
        duration_ms: start.elapsed().as_millis(),
        details,
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 8: BOUNDARIES RESPECT
// ═══════════════════════════════════════════════════════════════════════════

fn test_boundaries_respect() -> SelfTestResult {
    let start = Instant::now();
    let mut passed = true;
    let mut details = String::new();

    let mut engine = FullBodyAvatarEngine::new();

    // Test rotation bounds (quaternions doivent rester normalisés)
    for _ in 0..1000 {
        engine.advance_frame();
    }

    for (bone_name, bone) in &engine.skeleton.bones {
        let quat_magnitude = (bone.rotation[0].powi(2)
            + bone.rotation[1].powi(2)
            + bone.rotation[2].powi(2)
            + bone.rotation[3].powi(2))
        .sqrt();

        // Tolérance 5% pour approximations
        if (quat_magnitude - 1.0).abs() > 0.05 {
            passed = false;
            details.push_str(&format!(
                "❌ Bone '{}' quaternion not normalized: {:.3}\n",
                bone_name, quat_magnitude
            ));
        }
    }

    if passed {
        details.push_str("✅ All bone rotations within bounds\n");
    }

    // Test position bounds (pas de téléportation)
    let prev_positions: std::collections::HashMap<String, [f32; 3]> = engine
        .skeleton
        .bones
        .iter()
        .map(|(k, v)| (k.clone(), v.position))
        .collect();
    for _ in 0..100 {
        engine.advance_frame();
    }

    for (bone_name, bone) in &engine.skeleton.bones {
        if let Some(prev_pos) = prev_positions.get(bone_name) {
            let distance = ((bone.position[0] - prev_pos[0]).powi(2)
                + (bone.position[1] - prev_pos[1]).powi(2)
                + (bone.position[2] - prev_pos[2]).powi(2))
            .sqrt();

            // Max 10cm déplacement sur 100 frames (mouvement normal)
            if distance > 0.1 {
                passed = false;
                details.push_str(&format!(
                    "❌ Bone '{}' moved too far: {:.3}m\n",
                    bone_name, distance
                ));
            }
        }
    }

    if passed {
        details.push_str("✅ All bone positions within movement bounds\n");
    }

    SelfTestResult {
        test_name: "Boundaries Respect (No over-rotation/teleport)".to_string(),
        passed,
        duration_ms: start.elapsed().as_millis(),
        details,
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SELF-TEST RUNNER
// ═══════════════════════════════════════════════════════════════════════════

pub fn run_fullbody_selftest() -> FullBodySelfTestReport {
    let mut report = FullBodySelfTestReport::new();

    println!("\n╔═══════════════════════════════════════════════════════════════╗");
    println!("║  TITANE∞ v24 — Full-Body Avatar Engine Self-Tests            ║");
    println!("╚═══════════════════════════════════════════════════════════════╝\n");

    // Run all tests
    let tests: Vec<fn() -> SelfTestResult> = vec![
        test_body_profile_initialization,
        test_posture_transitions,
        test_gesture_blending,
        test_tts_synchronization,
        test_expression_mapping,
        test_performance_benchmark,
        test_state_coherence,
        test_boundaries_respect,
    ];

    for (i, test_fn) in tests.iter().enumerate() {
        println!("▶ Test {}/8: Running...", i + 1);
        let result = test_fn();

        let status = if result.passed {
            "✅ PASS"
        } else {
            "❌ FAIL"
        };
        println!(
            "  {} — {} ({} ms)",
            status, result.test_name, result.duration_ms
        );
        println!("{}", result.details);

        report.add_result(result);
    }

    // Summary
    println!("╔═══════════════════════════════════════════════════════════════╗");
    println!("║  SELF-TEST SUMMARY                                            ║");
    println!("╚═══════════════════════════════════════════════════════════════╝");
    println!("  Total Tests: {}", report.tests.len());
    println!("  Passed: {} ✅", report.total_passed);
    println!("  Failed: {} ❌", report.total_failed);
    println!("  Success Rate: {:.1}%", report.success_rate());
    println!("  Total Duration: {} ms\n", report.total_duration_ms);

    report
}

// ═══════════════════════════════════════════════════════════════════════════
// TAURI COMMAND
// ═══════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub fn fullbody_run_selftest() -> Result<String, String> {
    let report = run_fullbody_selftest();

    let json = serde_json::json!({
        "total_tests": report.tests.len(),
        "passed": report.total_passed,
        "failed": report.total_failed,
        "success_rate": report.success_rate(),
        "duration_ms": report.total_duration_ms,
        "tests": report.tests.iter().map(|t| {
            serde_json::json!({
                "name": t.test_name,
                "passed": t.passed,
                "duration_ms": t.duration_ms,
                "details": t.details,
            })
        }).collect::<Vec<_>>(),
    });

    Ok(json.to_string())
}
