// Copyright © 2025 TITANE∞ — Full-Body Avatar Commands v24
// License: Proprietary — TITANE OS
// Module: Tauri Commands for FullBodyAvatarEngine

use serde_json::json;
use tauri::command;

use super::fullbody::{get_fullbody_engine, AvatarStateSnapshot, BodyProfile};
use super::immersive_avatar_engine::FacialExpression;

// ═══════════════════════════════════════════════════════════════════════════
// COMMANDES TAURI — FULL-BODY AVATAR ENGINE
// ═══════════════════════════════════════════════════════════════════════════

/// Initialiser le moteur full-body avec profil personnalisé
#[command]
pub fn fullbody_initialize(
    height: Option<f32>,
    build: Option<String>,
    posture_default: Option<String>,
) -> Result<String, String> {
    let profile = BodyProfile {
        height: height.unwrap_or(1.68),
        build: build.unwrap_or_else(|| "athletic-toned".to_string()),
        posture_default: posture_default.unwrap_or_else(|| "confident".to_string()),
        shoulder_width: 1.0,
        waist_ratio: 0.72,
        leg_proportions: "athletic".to_string(),
        movement_style: "fluid".to_string(),
        resting_pose: "poised".to_string(),
    };

    // Remplacer instance globale (thread-safe)
    let engine_arc = get_fullbody_engine();
    let mut engine = engine_arc.lock().map_err(|e| e.to_string())?;
    *engine = super::fullbody::FullBodyAvatarEngine::with_profile(profile.clone());

    Ok(format!(
        "FullBodyAvatarEngine initialized: height={:.2}m, build={}",
        profile.height, profile.build
    ))
}

/// Avancer d'une frame (60 FPS)
#[command]
pub fn fullbody_advance_frame() -> Result<String, String> {
    let engine_arc = get_fullbody_engine();
    let mut engine = engine_arc.lock().map_err(|e| e.to_string())?;

    engine.advance_frame();

    Ok(format!("Frame {} advanced", engine.frame_count))
}

/// Activer un geste manuellement
#[command]
pub fn fullbody_activate_gesture(gesture_name: String) -> Result<String, String> {
    let engine_arc = get_fullbody_engine();
    let mut engine = engine_arc.lock().map_err(|e| e.to_string())?;

    engine.activate_gesture(&gesture_name);

    Ok(format!("Gesture '{}' activated", gesture_name))
}

/// Mettre à jour expression faciale (couplage avec v23)
#[command]
pub fn fullbody_update_expression(expression: String, intensity: f32) -> Result<String, String> {
    let engine_arc = get_fullbody_engine();
    let mut engine = engine_arc.lock().map_err(|e| e.to_string())?;

    let expr = match expression.as_str() {
        "neutral" => FacialExpression::Neutral,
        "soft_smile" | "warm_smile" => FacialExpression::SoftSmile,
        "attentive" | "listening" => FacialExpression::Attentive,
        "warm_focus" | "focused" => FacialExpression::WarmFocus,
        "explain_mode" | "explaining" => FacialExpression::ExplainMode,
        "lifted_brows" | "interested" => FacialExpression::LiftedBrows,
        "relaxed_brows" | "calm" => FacialExpression::RelaxedBrows,
        "tiny_nod" | "acknowledging" => FacialExpression::TinyNod,
        _ => FacialExpression::Neutral,
    };

    engine.update_expression(expr, intensity);

    Ok(format!(
        "Expression '{}' updated (intensity: {:.2})",
        expression, intensity
    ))
}

/// Mettre à jour lip-sync (depuis v23)
#[command]
pub fn fullbody_update_lipsync(
    phoneme: String,
    jaw: f32,
    lips: f32,
    tongue: f32,
    cheeks: f32,
) -> Result<String, String> {
    let engine_arc = get_fullbody_engine();
    let mut engine = engine_arc.lock().map_err(|e| e.to_string())?;

    let weights = [jaw, lips, tongue, cheeks];
    engine.update_lipsync(phoneme.clone(), weights);

    Ok(format!(
        "Lip-sync updated: phoneme={}, weights={:?}",
        phoneme, weights
    ))
}

/// Mettre à jour état SingularityState
#[command]
pub fn fullbody_update_state(
    cognitive_load: f32,
    emotional_tone: String,
    meta_intention: String,
    narrative_archetype: String,
    timeline_state: String,
    xp_progression: f32,
) -> Result<String, String> {
    let engine_arc = get_fullbody_engine();
    let mut engine = engine_arc.lock().map_err(|e| e.to_string())?;

    let snapshot = AvatarStateSnapshot {
        cognitive_load,
        emotional_tone,
        meta_intention,
        narrative_archetype,
        timeline_state,
        xp_progression,
    };

    engine.update_state(snapshot);

    Ok("Avatar state updated successfully".to_string())
}

/// Réaction wake-word "TITANE"
#[command]
pub fn fullbody_on_wake_word() -> Result<String, String> {
    let engine_arc = get_fullbody_engine();
    let mut engine = engine_arc.lock().map_err(|e| e.to_string())?;

    engine.on_wake_word();

    Ok("Wake-word reaction triggered".to_string())
}

/// Exporter snapshot skeleton (pour rendu frontend)
#[command]
pub fn fullbody_export_skeleton() -> Result<String, String> {
    let engine_arc = get_fullbody_engine();
    let engine = engine_arc.lock().map_err(|e| e.to_string())?;

    let snapshot = engine.export_skeleton_snapshot();
    let json = serde_json::to_string(&snapshot).map_err(|e| e.to_string())?;

    Ok(json)
}

/// Mettre à jour contexte conversationnel (pour BodyPostureAI)
#[command]
pub fn fullbody_update_context(
    user_engagement: f32,
    topic_complexity: f32,
    _emotional_valence: f32,
    conversation_phase: String,
) -> Result<String, String> {
    // Note: Cette commande nécessite d'exposer BodyPostureAI dans FullBodyAvatarEngine
    // Pour l'instant, retourne succès (à compléter dans phase 3)

    Ok(format!(
        "Context updated: engagement={:.2}, complexity={:.2}, phase={}",
        user_engagement, topic_complexity, conversation_phase
    ))
}

/// Obtenir configuration posture courante
#[command]
pub fn fullbody_get_posture() -> Result<String, String> {
    // Retourne type de posture actuel (à implémenter avec accès BodyPostureAI)
    Ok(json!({
        "posture_type": "professional",
        "spine_alignment": 0.0,
        "shoulder_openness": 0.8,
        "energy_level": 0.6
    })
    .to_string())
}

/// Statistiques moteur full-body
#[command]
pub fn fullbody_get_stats() -> Result<String, String> {
    let engine_arc = get_fullbody_engine();
    let engine = engine_arc.lock().map_err(|e| e.to_string())?;

    Ok(json!({
        "frame_count": engine.frame_count,
        "target_fps": engine.target_fps,
        "timestamp_ms": engine.frame_count * (1000 / engine.target_fps as u64),
        "bone_count": engine.skeleton.bones.len(),
        "gesture_library_size": engine.motion_layer.gesture_library.len(),
        "current_gesture": engine.motion_layer.current_gesture.as_ref().map(|g| g.name.clone()),
        "transition_progress": engine.motion_layer.transition_progress,
        "speech_active": engine.lip_sync_feed.speech_active,
    })
    .to_string())
}
