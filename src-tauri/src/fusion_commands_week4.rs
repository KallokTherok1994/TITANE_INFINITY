// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ FUSION COMMANDS — Week 4 Implementation
//   Commands: fusion_update_state, fusion_auto_optimize
// ═══════════════════════════════════════════════════════════════════════════
//
// Week 4 Deliverables:
// 1. fusion_update_state - Update unified Singularity state safely
// 2. fusion_auto_optimize - Auto-optimization guidance for Fusion pipeline
//
// © 2026 Kevin Thibault / TITANE Team. Tous droits réservés.

use chrono::Utc;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & STRUCTURES
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateStateRequest {
    pub current_state: Value,
    pub intention: Option<Value>,
    pub activation: Option<Value>,
    pub style_config: Option<Value>,
    pub response_text: Option<String>,
    pub coherence_score: Option<f32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateStateResponse {
    pub success: bool,
    pub message: String,
    pub updated_state: Value,
    pub timestamp: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PipelineStatsPayload {
    pub step1_analyse_ms: f32,
    pub step2_activation_ms: f32,
    pub step3_styles_ms: f32,
    pub step4_generation_ms: f32,
    pub step5_tts_ms: f32,
    pub step6_lipsync_ms: f32,
    pub step7_animation_ms: f32,
    pub step8_state_ms: f32,
    pub step9_optimization_ms: f32,
    pub total_ms: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoOptimizeRequest {
    pub stats: PipelineStatsPayload,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoOptimizeResponse {
    pub success: bool,
    pub message: String,
    pub bottlenecks: Vec<String>,
    pub recommendations: Vec<String>,
    pub optimization_level: String,
    pub timestamp: i64,
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND 7: fusion_update_state
// ═══════════════════════════════════════════════════════════════════════════

/// Update unified Singularity state with latest cycle data
#[tauri::command]
pub fn fusion_update_state(request: UpdateStateRequest) -> Result<UpdateStateResponse, String> {
    fusion_update_state_internal(request)
}

fn fusion_update_state_internal(request: UpdateStateRequest) -> Result<UpdateStateResponse, String> {
    let mut state = request.current_state.clone();

    let state_object = state.as_object_mut().ok_or_else(|| {
        "Current state must be a JSON object".to_string()
    })?;

    let meta_entry = state_object
        .entry("meta")
        .or_insert_with(|| json!({}));

    if let Some(meta_obj) = meta_entry.as_object_mut() {
        meta_obj.insert("timestamp".to_string(), json!(Utc::now().timestamp_millis()));
        if let Some(score) = request.coherence_score {
            meta_obj.insert("coherence_score".to_string(), json!(score));
        }
        if let Some(response_text) = &request.response_text {
            meta_obj.insert("last_response".to_string(), json!(response_text));
        }
    }

    let mut cycle = serde_json::Map::new();
    if let Some(intention) = request.intention {
        cycle.insert("intention".to_string(), intention);
    }
    if let Some(activation) = request.activation {
        cycle.insert("activation".to_string(), activation);
    }
    if let Some(style_config) = request.style_config {
        cycle.insert("style_config".to_string(), style_config);
    }
    if let Some(response_text) = &request.response_text {
        cycle.insert("response_text".to_string(), json!(response_text));
    }

    if !cycle.is_empty() {
        state_object.insert("last_cycle".to_string(), Value::Object(cycle));
    }

    Ok(UpdateStateResponse {
        success: true,
        message: "State updated successfully".to_string(),
        updated_state: state,
        timestamp: Utc::now().timestamp_millis(),
    })
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND 8: fusion_auto_optimize
// ═══════════════════════════════════════════════════════════════════════════

/// Analyze pipeline stats and suggest optimizations
#[tauri::command]
pub fn fusion_auto_optimize(
    request: AutoOptimizeRequest,
) -> Result<AutoOptimizeResponse, String> {
    fusion_auto_optimize_internal(request)
}

fn fusion_auto_optimize_internal(
    request: AutoOptimizeRequest,
) -> Result<AutoOptimizeResponse, String> {
    let stats = request.stats;
    let mut bottlenecks = Vec::new();
    let mut recommendations = Vec::new();

    if stats.step4_generation_ms > 2000.0 {
        bottlenecks.push("IA generation too slow".to_string());
        recommendations.push("Enable response caching or reduce context window".to_string());
    }
    if stats.step5_tts_ms > 1000.0 {
        bottlenecks.push("TTS preparation slow".to_string());
        recommendations.push("Reuse cached voice buffers or lower bitrate".to_string());
    }
    if stats.step7_animation_ms > 500.0 {
        bottlenecks.push("Avatar animation slow".to_string());
        recommendations.push("Lower animation quality or precompute keyframes".to_string());
    }
    if stats.step1_analyse_ms > 200.0 {
        bottlenecks.push("Intention analysis slow".to_string());
        recommendations.push("Use lightweight classifier for routine queries".to_string());
    }

    let optimization_level = if stats.total_ms < 3000.0 {
        "optimal"
    } else if stats.total_ms < 5000.0 {
        "elevated"
    } else {
        "critical"
    };

    Ok(AutoOptimizeResponse {
        success: true,
        message: "Auto-optimization analysis complete".to_string(),
        bottlenecks,
        recommendations,
        optimization_level: optimization_level.to_string(),
        timestamp: Utc::now().timestamp_millis(),
    })
}

// ═══════════════════════════════════════════════════════════════════════════
// UNIT TESTS
// ═══════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_update_state_basic() {
        let request = UpdateStateRequest {
            current_state: json!({
                "meta": {
                    "timestamp": 0,
                    "coherence_score": 0.5
                }
            }),
            intention: Some(json!({"primary": "test"})),
            activation: None,
            style_config: None,
            response_text: Some("Hello".to_string()),
            coherence_score: Some(0.8),
        };

        let response = fusion_update_state_internal(request).unwrap();
        assert!(response.success);
        assert!(response.updated_state.get("meta").is_some());
        assert!(response.updated_state.get("last_cycle").is_some());
    }

    #[test]
    fn test_update_state_invalid_current() {
        let request = UpdateStateRequest {
            current_state: json!("invalid"),
            intention: None,
            activation: None,
            style_config: None,
            response_text: None,
            coherence_score: None,
        };

        let result = fusion_update_state_internal(request);
        assert!(result.is_err());
    }

    #[test]
    fn test_auto_optimize_basic() {
        let request = AutoOptimizeRequest {
            stats: PipelineStatsPayload {
                step1_analyse_ms: 50.0,
                step2_activation_ms: 30.0,
                step3_styles_ms: 40.0,
                step4_generation_ms: 3000.0,
                step5_tts_ms: 1200.0,
                step6_lipsync_ms: 200.0,
                step7_animation_ms: 600.0,
                step8_state_ms: 20.0,
                step9_optimization_ms: 10.0,
                total_ms: 5200.0,
            },
        };

        let response = fusion_auto_optimize_internal(request).unwrap();
        assert!(response.success);
        assert!(!response.bottlenecks.is_empty());
        assert_eq!(response.optimization_level, "critical");
    }
}
