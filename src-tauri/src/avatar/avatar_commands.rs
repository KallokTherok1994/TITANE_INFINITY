// ═══════════════════════════════════════════════════════════════════════════════
//   TITANE∞ v23 — AVATAR COMMANDS (Tauri API)
//   Exposition des fonctionnalités avatar au frontend
// ═══════════════════════════════════════════════════════════════════════════════

use super::immersive_avatar_engine::{AvatarEngineGlobal, FacialExpression};
use tauri::State;

/// Prépare texte pour synthèse vocale immersive
#[tauri::command]
pub async fn avatar_prepare_speech(
    text: String,
    archetype: String,
    mood: String,
    cognitive_stability: f32,
    cpu_load: f32,
    engine: State<'_, AvatarEngineGlobal>,
) -> Result<String, String> {
    log::info!(
        "[AvatarEngine] Preparing speech (archetype: {}, mood: {})",
        archetype,
        mood
    );

    let mut avatar = engine.0.lock().map_err(|e| format!("Lock error: {}", e))?;

    let prepared =
        avatar.prepare_for_speech(&text, &archetype, &mood, cognitive_stability, cpu_load);

    Ok(prepared)
}

/// Termine synthèse vocale
#[tauri::command]
pub async fn avatar_finish_speech(engine: State<'_, AvatarEngineGlobal>) -> Result<(), String> {
    log::info!("[AvatarEngine] Finishing speech");

    let mut avatar = engine.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    avatar.finish_speech();

    Ok(())
}

/// Active mode immersion
#[tauri::command]
pub async fn avatar_enable_immersion(engine: State<'_, AvatarEngineGlobal>) -> Result<(), String> {
    log::info!("[AvatarEngine] Enabling immersion mode");

    let mut avatar = engine.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    avatar.enable_immersion();

    Ok(())
}

/// Réaction au wake-word "TITANE"
#[tauri::command]
pub async fn avatar_on_wake_word(engine: State<'_, AvatarEngineGlobal>) -> Result<(), String> {
    log::info!("[AvatarEngine] Wake-word detected");

    let mut avatar = engine.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    avatar.on_wake_word_detected();

    Ok(())
}

/// Récupère morph target actuel (lip-sync)
#[tauri::command]
pub async fn avatar_get_current_morph(
    engine: State<'_, AvatarEngineGlobal>,
) -> Result<serde_json::Value, String> {
    let avatar = engine.0.lock().map_err(|e| format!("Lock error: {}", e))?;

    match avatar.lip_sync.get_current_morph() {
        Some(morph) => Ok(serde_json::json!({
            "jaw_open": morph.jaw_open,
            "lip_rounding": morph.lip_rounding,
            "tongue_position": morph.tongue_position,
            "lip_spread": morph.lip_spread,
            "duration_ms": morph.duration_ms,
        })),
        None => Ok(serde_json::json!({
            "jaw_open": 0.1,
            "lip_rounding": 0.2,
            "tongue_position": 0.4,
            "lip_spread": 0.3,
            "duration_ms": 0,
        })),
    }
}

/// Avance frame lip-sync
#[tauri::command]
pub async fn avatar_advance_lip_sync(engine: State<'_, AvatarEngineGlobal>) -> Result<(), String> {
    let mut avatar = engine.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    avatar.lip_sync.advance_frame();

    Ok(())
}

/// Récupère expression faciale actuelle
#[tauri::command]
pub async fn avatar_get_expression(
    engine: State<'_, AvatarEngineGlobal>,
) -> Result<String, String> {
    let avatar = engine.0.lock().map_err(|e| format!("Lock error: {}", e))?;

    let expression = match avatar.expression.current_expression {
        FacialExpression::Neutral => "neutral",
        FacialExpression::SoftSmile => "soft_smile",
        FacialExpression::Attentive => "attentive",
        FacialExpression::WarmFocus => "warm_focus",
        FacialExpression::ExplainMode => "explain_mode",
        FacialExpression::LiftedBrows => "lifted_brows",
        FacialExpression::RelaxedBrows => "relaxed_brows",
        FacialExpression::TinyNod => "tiny_nod",
    };

    Ok(expression.to_string())
}

/// Récupère état complet de l'avatar
#[tauri::command]
pub async fn avatar_get_state(
    engine: State<'_, AvatarEngineGlobal>,
) -> Result<serde_json::Value, String> {
    let avatar = engine.0.lock().map_err(|e| format!("Lock error: {}", e))?;

    Ok(serde_json::json!({
        "is_speaking": avatar.is_speaking,
        "immersion_mode": avatar.immersion_mode,
        "wake_word_active": avatar.wake_word_active,
        "voice_profile": {
            "voice_id": avatar.voice_profile.voice_id,
            "stability": avatar.voice_profile.stability,
            "clarity": avatar.voice_profile.clarity,
            "speech_rate": avatar.voice_profile.speech_rate,
        },
        "expression": {
            "current": format!("{:?}", avatar.expression.current_expression),
            "intensity": avatar.expression.intensity,
        },
        "lip_sync": {
            "active": avatar.lip_sync.active,
            "quality": avatar.lip_sync.quality,
            "frame": avatar.lip_sync.current_frame,
            "total_frames": avatar.lip_sync.morph_targets.len(),
        },
    }))
}

/// Prépare une animation avatar synchronisée à partir des visèmes TTS
#[tauri::command]
#[allow(non_snake_case)]
pub async fn avatar_prepare_animation(
    mut visemes: Vec<serde_json::Value>,
    duration: u32,
    expressionIntensity: f32,
) -> Result<serde_json::Value, String> {
    let fps: u32 = 30;

    if duration == 0 {
        return Ok(serde_json::json!({
            "keyframes": [],
            "duration": duration,
            "fps": fps,
            "synchronized_with_audio": true
        }));
    }

    visemes.sort_by_key(|v| v.get("start").and_then(|n| n.as_u64()).unwrap_or(0));

    let expression = if expressionIntensity >= 0.66 {
        "explain_mode"
    } else if expressionIntensity >= 0.33 {
        "soft_smile"
    } else {
        "neutral"
    };

    let frame_ms = (1000.0f32 / fps as f32).round().max(1.0) as u32;
    let total_frames = (duration + frame_ms - 1) / frame_ms;

    let mut keyframes = Vec::with_capacity(total_frames as usize);
    for i in 0..total_frames {
        let t = i * frame_ms;

        let mouth_shape = visemes
            .iter()
            .find_map(|v| {
                let start = v.get("start")?.as_u64()? as u32;
                let dur = v.get("duration")?.as_u64()? as u32;
                if t >= start && t < start.saturating_add(dur) {
                    Some(
                        v.get("shape")
                            .and_then(|s| s.as_str())
                            .unwrap_or("M")
                            .to_string(),
                    )
                } else {
                    None
                }
            })
            .unwrap_or_else(|| "M".to_string());

        let blink = (t / 1000) % 4 == 0 && (t % 1000) < frame_ms;

        keyframes.push(serde_json::json!({
            "time": t,
            "mouth_shape": mouth_shape,
            "expression": expression,
            "head_rotation": {"x": 0.0, "y": 0.0, "z": 0.0},
            "blink": blink,
        }));
    }

    Ok(serde_json::json!({
        "keyframes": keyframes,
        "duration": duration,
        "fps": fps,
        "synchronized_with_audio": true
    }))
}
