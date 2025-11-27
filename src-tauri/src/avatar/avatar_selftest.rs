// ═══════════════════════════════════════════════════════════════════════════════
//   TITANE∞ v23 — AVATAR SELF-TEST
//   10 tests complets pour ImmersiveAvatarEngine
// ═══════════════════════════════════════════════════════════════════════════════

use super::immersive_avatar_engine::{
    ImmersiveAvatarEngine, ImmersiveVoiceProfile, ProsodyControl, 
    LipSyncModel, ExpressionModel, FacialExpression, FrenchPhoneme,
};
use std::time::Instant;

/// Exécute tous les self-tests de l'Avatar Engine v23
#[tauri::command]
pub async fn avatar_run_selftest() -> Result<String, String> {
    log::info!("🧪 [AvatarSelfTest] Starting comprehensive self-test suite...");
    
    let start = Instant::now();
    let mut results = Vec::new();
    let mut passed = 0;
    let mut failed = 0;

    // Test 1: Voice Profile Defaults
    match test_voice_profile_defaults() {
        Ok(msg) => {
            results.push(format!("✅ Test 1: {}", msg));
            passed += 1;
        }
        Err(e) => {
            results.push(format!("❌ Test 1: {}", e));
            failed += 1;
        }
    }

    // Test 2: Adjust for Narrative (Architecte)
    match test_adjust_for_narrative() {
        Ok(msg) => {
            results.push(format!("✅ Test 2: {}", msg));
            passed += 1;
        }
        Err(e) => {
            results.push(format!("❌ Test 2: {}", e));
            failed += 1;
        }
    }

    // Test 3: Adjust for Cognitive Load
    match test_adjust_for_cognitive_load() {
        Ok(msg) => {
            results.push(format!("✅ Test 3: {}", msg));
            passed += 1;
        }
        Err(e) => {
            results.push(format!("❌ Test 3: {}", e));
            failed += 1;
        }
    }

    // Test 4: SSML Generation
    match test_ssml_generation() {
        Ok(msg) => {
            results.push(format!("✅ Test 4: {}", msg));
            passed += 1;
        }
        Err(e) => {
            results.push(format!("❌ Test 4: {}", e));
            failed += 1;
        }
    }

    // Test 5: Text Segmentation
    match test_text_segmentation() {
        Ok(msg) => {
            results.push(format!("✅ Test 5: {}", msg));
            passed += 1;
        }
        Err(e) => {
            results.push(format!("❌ Test 5: {}", e));
            failed += 1;
        }
    }

    // Test 6: Phoneme to Morph Mapping
    match test_phoneme_to_morph() {
        Ok(msg) => {
            results.push(format!("✅ Test 6: {}", msg));
            passed += 1;
        }
        Err(e) => {
            results.push(format!("❌ Test 6: {}", e));
            failed += 1;
        }
    }

    // Test 7: Lip-Sync Frame Progression
    match test_lip_sync_progression() {
        Ok(msg) => {
            results.push(format!("✅ Test 7: {}", msg));
            passed += 1;
        }
        Err(e) => {
            results.push(format!("❌ Test 7: {}", e));
            failed += 1;
        }
    }

    // Test 8: Expression Selection from State
    match test_expression_selection() {
        Ok(msg) => {
            results.push(format!("✅ Test 8: {}", msg));
            passed += 1;
        }
        Err(e) => {
            results.push(format!("❌ Test 8: {}", e));
            failed += 1;
        }
    }

    // Test 9: Wake-Word Reaction
    match test_wake_word_reaction() {
        Ok(msg) => {
            results.push(format!("✅ Test 9: {}", msg));
            passed += 1;
        }
        Err(e) => {
            results.push(format!("❌ Test 9: {}", e));
            failed += 1;
        }
    }

    // Test 10: Performance Benchmark
    match test_performance_benchmark() {
        Ok(msg) => {
            results.push(format!("✅ Test 10: {}", msg));
            passed += 1;
        }
        Err(e) => {
            results.push(format!("❌ Test 10: {}", e));
            failed += 1;
        }
    }

    let duration = start.elapsed();
    
    let summary = format!(
        "\n╔══════════════════════════════════════════════════════════════╗\n\
         ║     TITANE∞ v23 — AVATAR ENGINE SELF-TEST REPORT            ║\n\
         ╚══════════════════════════════════════════════════════════════╝\n\n\
         Tests Passed: {}/{}\n\
         Tests Failed: {}\n\
         Duration: {:.2}ms\n\n\
         {}\n",
        passed, passed + failed, failed, duration.as_millis(),
        results.join("\n")
    );

    if failed > 0 {
        log::error!("{}", summary);
        Err(summary)
    } else {
        log::info!("{}", summary);
        Ok(summary)
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 1: Voice Profile Defaults
// ═══════════════════════════════════════════════════════════════════════════════

fn test_voice_profile_defaults() -> Result<String, String> {
    let profile = ImmersiveVoiceProfile::default();

    // Vérifier valeurs Adina
    if profile.voice_id != "FvmvwvObRqIHojkEGh5N" {
        return Err(format!("Voice ID incorrect: {}", profile.voice_id));
    }
    if (profile.stability - 0.45).abs() > 0.01 {
        return Err(format!("Stability incorrect: {}", profile.stability));
    }
    if (profile.clarity - 0.78).abs() > 0.01 {
        return Err(format!("Clarity incorrect: {}", profile.clarity));
    }
    if (profile.speech_rate - 0.88).abs() > 0.01 {
        return Err(format!("Speech rate incorrect: {}", profile.speech_rate));
    }

    Ok("Voice Profile defaults correct (Adina optimized)".to_string())
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 2: Adjust for Narrative (Architecte archetype)
// ═══════════════════════════════════════════════════════════════════════════════

fn test_adjust_for_narrative() -> Result<String, String> {
    let mut profile = ImmersiveVoiceProfile::default();
    let baseline_stability = profile.stability;
    let baseline_rate = profile.speech_rate;

    profile.adjust_for_narrative("Architecte", "calm");

    // Architecte → +stability, -speech_rate
    if profile.stability <= baseline_stability {
        return Err(format!("Architecte should increase stability: {} ≤ {}", profile.stability, baseline_stability));
    }
    if profile.speech_rate >= baseline_rate {
        return Err(format!("Architecte should decrease speech_rate: {} ≥ {}", profile.speech_rate, baseline_rate));
    }

    Ok(format!("Narrative adjustment correct (Architecte: stability={:.2}, rate={:.2})", 
               profile.stability, profile.speech_rate))
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 3: Adjust for Cognitive Load
// ═══════════════════════════════════════════════════════════════════════════════

fn test_adjust_for_cognitive_load() -> Result<String, String> {
    let mut profile = ImmersiveVoiceProfile::default();
    let baseline_stability = profile.stability;

    // Low cognitive stability → increase stability, slower
    profile.adjust_for_cognitive_load(0.3, 0.5);

    if profile.stability <= baseline_stability {
        return Err(format!("Low cognitive_stability should increase voice stability: {} ≤ {}", 
                          profile.stability, baseline_stability));
    }

    Ok(format!("Cognitive load adjustment correct (low stability → voice_stability={:.2})", 
               profile.stability))
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 4: SSML Generation
// ═══════════════════════════════════════════════════════════════════════════════

fn test_ssml_generation() -> Result<String, String> {
    let prosody = ProsodyControl::default();
    let input = "Bonjour, je suis TITANE. Comment puis-je t'aider ?";
    let output = prosody.prepare_text(input);

    // Vérifier pauses SSML
    if !output.contains("<break time=\"120ms\"/>") {
        return Err("Missing comma pause (120ms)".to_string());
    }
    if !output.contains("<break time=\"180ms\"/>") {
        return Err("Missing period pause (180ms)".to_string());
    }

    Ok(format!("SSML generation correct ({} breaks inserted)", 
               output.matches("<break").count()))
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 5: Text Segmentation
// ═══════════════════════════════════════════════════════════════════════════════

fn test_text_segmentation() -> Result<String, String> {
    let prosody = ProsodyControl::default();
    let long_text = "Voici une phrase très longue qui contient plus de quinze mots \
                     et devrait être segmentée pour optimiser la synthèse vocale.";
    
    let segments = prosody.segment_text(long_text);

    if segments.len() < 2 {
        return Err(format!("Text should be segmented (got {} segments)", segments.len()));
    }

    // Vérifier que chaque segment ≤15 mots
    for (i, segment) in segments.iter().enumerate() {
        let word_count = segment.split_whitespace().count();
        if word_count > 15 {
            return Err(format!("Segment {} has {} words (max 15)", i, word_count));
        }
    }

    Ok(format!("Text segmentation correct ({} segments, max 15 words each)", segments.len()))
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 6: Phoneme to Morph Mapping
// ═══════════════════════════════════════════════════════════════════════════════

fn test_phoneme_to_morph() -> Result<String, String> {
    use super::immersive_avatar_engine::MorphTarget;

    // Test phonème A (jaw open)
    let morph_a = MorphTarget::from_phoneme(FrenchPhoneme::A, 80);
    if morph_a.jaw_open < 0.5 {
        return Err(format!("Phoneme A should have high jaw_open: {}", morph_a.jaw_open));
    }

    // Test phonème I (lip spread)
    let morph_i = MorphTarget::from_phoneme(FrenchPhoneme::I, 80);
    if morph_i.lip_spread < 0.7 {
        return Err(format!("Phoneme I should have high lip_spread: {}", morph_i.lip_spread));
    }

    // Test phonème OU (lip rounding)
    let morph_ou = MorphTarget::from_phoneme(FrenchPhoneme::OU, 80);
    if morph_ou.lip_rounding < 0.7 {
        return Err(format!("Phoneme OU should have high lip_rounding: {}", morph_ou.lip_rounding));
    }

    Ok("Phoneme → Morph mapping correct (A, I, OU validated)".to_string())
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 7: Lip-Sync Frame Progression
// ═══════════════════════════════════════════════════════════════════════════════

fn test_lip_sync_progression() -> Result<String, String> {
    let mut lip_sync = LipSyncModel::default();
    lip_sync.generate_from_text("Bonjour");

    let initial_frame = lip_sync.current_frame;
    lip_sync.advance_frame();
    let next_frame = lip_sync.current_frame;

    if next_frame != initial_frame + 1 {
        return Err(format!("Frame progression incorrect: {} → {}", initial_frame, next_frame));
    }

    // Vérifier morph target disponible
    if lip_sync.get_current_morph().is_none() && !lip_sync.morph_targets.is_empty() {
        return Err("Morph target should be available".to_string());
    }

    Ok(format!("Lip-sync progression correct ({} frames generated)", 
               lip_sync.morph_targets.len()))
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 8: Expression Selection from State
// ═══════════════════════════════════════════════════════════════════════════════

fn test_expression_selection() -> Result<String, String> {
    let mut expression = ExpressionModel::default();

    // Test 1: Low cognitive stability → RelaxedBrows
    expression.update_from_state(0.3, 50, "Architecte", false);
    if expression.current_expression != FacialExpression::RelaxedBrows {
        return Err(format!("Low cognitive_stability should trigger RelaxedBrows: {:?}", 
                          expression.current_expression));
    }

    // Test 2: High cognitive stability → WarmFocus
    expression.update_from_state(0.90, 55, "Architecte", false);
    if expression.current_expression != FacialExpression::WarmFocus {
        return Err(format!("High cognitive_stability should trigger WarmFocus: {:?}", 
                          expression.current_expression));
    }

    // Test 3: XP milestone (level % 10 == 0) → SoftSmile
    expression.update_from_state(0.75, 60, "Architecte", false);
    if expression.current_expression != FacialExpression::SoftSmile {
        return Err(format!("XP milestone should trigger SoftSmile: {:?}", 
                          expression.current_expression));
    }

    Ok("Expression selection correct (RelaxedBrows, WarmFocus, SoftSmile validated)".to_string())
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 9: Wake-Word Reaction
// ═══════════════════════════════════════════════════════════════════════════════

fn test_wake_word_reaction() -> Result<String, String> {
    let mut engine = ImmersiveAvatarEngine::default();
    
    engine.on_wake_word_detected();

    // Vérifier expression LiftedBrows
    if engine.expression.current_expression != FacialExpression::LiftedBrows {
        return Err(format!("Wake-word should trigger LiftedBrows: {:?}", 
                          engine.expression.current_expression));
    }

    // Vérifier intensité élevée
    if engine.expression.intensity < 0.8 {
        return Err(format!("Wake-word intensity should be high: {}", 
                          engine.expression.intensity));
    }

    // Vérifier flag
    if !engine.wake_word_active {
        return Err("wake_word_active flag should be true".to_string());
    }

    Ok("Wake-word reaction correct (LiftedBrows, intensity=0.85, flag active)".to_string())
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 10: Performance Benchmark
// ═══════════════════════════════════════════════════════════════════════════════

fn test_performance_benchmark() -> Result<String, String> {
    let mut engine = ImmersiveAvatarEngine::default();

    // Benchmark prepare_for_speech
    let start = Instant::now();
    let _prepared = engine.prepare_for_speech(
        "Bonjour, je suis TITANE et je peux t'aider avec de nombreuses tâches.",
        "Tisseur",
        "warm",
        0.75,
        0.40,
    );
    let prepare_duration = start.elapsed();

    if prepare_duration.as_millis() > 50 {
        return Err(format!("prepare_for_speech too slow: {}ms (target: ≤50ms)", 
                          prepare_duration.as_millis()));
    }

    // Benchmark morph generation
    let start = Instant::now();
    engine.lip_sync.generate_from_text("Test");
    let morph_duration = start.elapsed();

    if morph_duration.as_millis() > 10 {
        return Err(format!("Morph generation too slow: {}ms (target: ≤10ms)", 
                          morph_duration.as_millis()));
    }

    // Benchmark expression update
    let start = Instant::now();
    engine.expression.update_from_state(0.8, 50, "Architecte", true);
    let expression_duration = start.elapsed();

    if expression_duration.as_millis() > 20 {
        return Err(format!("Expression update too slow: {}ms (target: ≤20ms)", 
                          expression_duration.as_millis()));
    }

    Ok(format!("Performance benchmarks passed (prepare={}ms, morph={}ms, expression={}ms)", 
               prepare_duration.as_millis(), 
               morph_duration.as_millis(),
               expression_duration.as_millis()))
}
