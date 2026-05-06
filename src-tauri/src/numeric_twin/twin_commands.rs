// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ vΩ∞ — NUMERIC TWIN COMMANDS
//   Commandes Tauri pour le Numeric Twin Engine
// ═══════════════════════════════════════════════════════════════════════════

use crate::core::state::SingularityState;
use crate::digital_twin_v14_1::memory_bridge::MemoryBridge as TwinMemoryBridge;
use log::{info, warn};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::State;
use tokio::sync::{Mutex, RwLock};

use super::{
    EvolutionType, NumericTwinEngine, ObservationType, TwinConfig, TwinEvolutionRequest,
    TwinEvolutionResult, TwinObservation, TwinState,
};

// ═══════════════════════════════════════════════════════════════════════════
// ÉTAT GLOBAL
// ═══════════════════════════════════════════════════════════════════════════

/// État global du Numeric Twin Engine
pub struct NumericTwinState(pub Mutex<NumericTwinEngine>);

impl NumericTwinState {
    pub fn new() -> Self {
        Self(Mutex::new(NumericTwinEngine::new(TwinConfig::default())))
    }
}

impl Default for NumericTwinState {
    fn default() -> Self {
        Self::new()
    }
}

const OWNER_TWIN_THEMES: &[&str] = &[
    "presence",
    "authenticite",
    "retour-au-vivant",
    "deuxieme-vitesse",
    "clarte",
    "oeuvre-vivante",
];

#[derive(Debug, Clone)]
struct TwinMemorySnapshot {
    fusion_score: f32,
    trend: String,
    phase: String,
    sync_score: f32,
}

fn capture_twin_memory_snapshot(engine: &NumericTwinEngine) -> TwinMemorySnapshot {
    TwinMemorySnapshot {
        fusion_score: engine.fusion_index.global_score,
        trend: format!("{:?}", engine.fusion_index.trend),
        phase: format!("{:?}", engine.evolution_profile.current_phase),
        sync_score: engine.evolution_profile.sync_score,
    }
}

async fn persist_twin_memory(
    singularity: &State<'_, Arc<RwLock<SingularityState>>>,
    scope: &str,
    snapshot: TwinMemorySnapshot,
    details: serde_json::Value,
) {
    let bridge = TwinMemoryBridge::default();

    let mut singularity_state = singularity.write().await;
    match bridge.store_numeric_twin_state(
        &mut singularity_state.memory,
        scope,
        snapshot.fusion_score,
        &snapshot.trend,
        &snapshot.phase,
        snapshot.sync_score,
        OWNER_TWIN_THEMES,
        details,
    ) {
        Ok(memory_id) => info!("[NumericTwin] Memory bridge snapshot stored: {}", memory_id),
        Err(error) => warn!("[NumericTwin] Memory bridge snapshot skipped: {}", error),
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPES DE RÉPONSE
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TwinStateResponse {
    pub identity_core: TwinIdentityCoreResponse,
    pub value_map: TwinValueMapResponse,
    pub cognitive_patterns: TwinCognitivePatternsResponse,
    pub therapeutic_model: TwinTherapeuticModelResponse,
    pub creative_signature: TwinCreativeSignatureResponse,
    pub evolution_profile: TwinEvolutionProfileResponse,
    pub fusion_index: FusionIndexResponse,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TwinIdentityCoreResponse {
    pub version: String,
    pub name: String,
    pub signature: String,
    pub core_values: Vec<CoreValueResponse>,
    pub human_style: HumanStyleResponse,
    pub fusion_index: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CoreValueResponse {
    pub name: String,
    pub description: String,
    pub stability: f32,
    pub weight: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HumanStyleResponse {
    pub sincerity: f32,
    pub gentle_intensity: f32,
    pub accessible_depth: f32,
    pub calm_precision: f32,
    pub organic_fluidity: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TwinValueMapResponse {
    pub observed_values: Vec<ObservedValueResponse>,
    pub confirmed_values: Vec<String>,
    pub alignment_score: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ObservedValueResponse {
    pub name: String,
    pub frequency: f32,
    pub confidence: f32,
    pub observations_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TwinCognitivePatternsResponse {
    pub reasoning_patterns: Vec<ReasoningPatternResponse>,
    pub structuring_style: StructuringStyleResponse,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReasoningPatternResponse {
    pub name: String,
    pub description: String,
    pub frequency: f32,
    pub effectiveness: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StructuringStyleResponse {
    pub simple_to_complex: f32,
    pub structure_level: f32,
    pub hierarchy_preference: f32,
    pub visual_preference: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TwinTherapeuticModelResponse {
    pub deep_listening: f32,
    pub rhythm_respect: f32,
    pub relational_clarity: f32,
    pub support_precision: f32,
    pub non_directive_guidance: f32,
    pub holistic_integration: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TwinCreativeSignatureResponse {
    pub operational_intuition: f32,
    pub artistic_sense: f32,
    pub symbolic_sense: f32,
    pub structural_creativity: f32,
    pub methodological_innovation: f32,
    pub embodied_narration: f32,
    pub frameworks_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TwinEvolutionProfileResponse {
    pub current_phase: String,
    pub milestones_count: usize,
    pub growth_trends: GrowthTrendsResponse,
    pub adjustment_suggestions: Vec<AdjustmentSuggestionResponse>,
    pub sync_score: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GrowthTrendsResponse {
    pub cognitive_growth: f32,
    pub emotional_growth: f32,
    pub spiritual_growth: f32,
    pub entrepreneurial_growth: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdjustmentSuggestionResponse {
    pub domain: String,
    pub suggestion: String,
    pub priority: f32,
    pub validated_by_kevin: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FusionIndexResponse {
    pub global_score: f32,
    pub value_alignment: f32,
    pub cognitive_alignment: f32,
    pub style_alignment: f32,
    pub therapeutic_alignment: f32,
    pub creative_alignment: f32,
    pub evolution_alignment: f32,
    pub trend: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TwinObservationRequest {
    pub observation_type: String,
    pub content: String,
    pub context: Option<String>,
    pub confidence: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TwinEvolutionRequestPayload {
    pub evolution_type: String,
    pub target: String,
    pub delta: Option<f32>,
    pub is_deep_change: bool,
    pub validated_by_kevin: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TwinSyncValidationRequest {
    pub sync_id: String,
    pub validated: bool,
}

fn validate_observation_request(observation: &TwinObservationRequest) -> Result<(), String> {
    if observation.content.trim().is_empty() {
        return Err("observation content cannot be empty".to_string());
    }
    if observation.content.chars().count() > 10_000 {
        return Err("observation content is too large (max 10000 chars)".to_string());
    }
    if !observation.confidence.is_finite() || !(0.0..=1.0).contains(&observation.confidence) {
        return Err("observation confidence must be between 0.0 and 1.0".to_string());
    }
    Ok(())
}

fn validate_evolution_request(evolution: &TwinEvolutionRequestPayload) -> Result<(), String> {
    if evolution.target.trim().is_empty() {
        return Err("evolution target cannot be empty".to_string());
    }
    if let Some(delta) = evolution.delta {
        if !delta.is_finite() || !(-1.0..=1.0).contains(&delta) {
            return Err("evolution delta must be between -1.0 and 1.0".to_string());
        }
    }
    Ok(())
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMANDES TAURI
// ═══════════════════════════════════════════════════════════════════════════

/// Obtient l'état complet du Twin
#[tauri::command]
pub async fn twin_get_state(
    state: State<'_, NumericTwinState>,
) -> Result<TwinStateResponse, String> {
    info!("[NumericTwin] twin_get_state called");

    let engine = state.0.lock().await;
    let twin_state = engine.get_state();

    Ok(convert_to_response(&twin_state))
}

/// Obtient uniquement le FusionIndex
#[tauri::command]
pub async fn twin_get_fusion_index(
    state: State<'_, NumericTwinState>,
) -> Result<FusionIndexResponse, String> {
    info!("[NumericTwin] twin_get_fusion_index called");

    let engine = state.0.lock().await;

    Ok(FusionIndexResponse {
        global_score: engine.fusion_index.global_score,
        value_alignment: engine.fusion_index.components.value_alignment,
        cognitive_alignment: engine.fusion_index.components.cognitive_alignment,
        style_alignment: engine.fusion_index.components.style_alignment,
        therapeutic_alignment: engine.fusion_index.components.therapeutic_alignment,
        creative_alignment: engine.fusion_index.components.creative_alignment,
        evolution_alignment: engine.fusion_index.components.evolution_alignment,
        trend: format!("{:?}", engine.fusion_index.trend),
    })
}

/// Soumet une observation au Twin
#[tauri::command]
pub async fn twin_submit_observation(
    state: State<'_, NumericTwinState>,
    singularity: State<'_, Arc<RwLock<SingularityState>>>,
    observation: TwinObservationRequest,
) -> Result<String, String> {
    info!(
        "[NumericTwin] twin_submit_observation called: {:?}",
        observation.observation_type
    );

    let observation_type_name = observation.observation_type.clone();
    let observation_content = observation.content.clone();
    let observation_context = observation.context.clone();
    let observation_confidence = observation.confidence;

    validate_observation_request(&observation)?;

    let mut engine = state.0.lock().await;

    let obs_type = match observation.observation_type.as_str() {
        "value" => ObservationType::Value,
        "cognitive" => ObservationType::Cognitive,
        "style" => ObservationType::Style,
        "emotional" => ObservationType::Emotional,
        _ => {
            return Err(format!(
                "Unknown observation type: {}",
                observation.observation_type
            ))
        }
    };

    let twin_observation = TwinObservation {
        observation_type: obs_type,
        content: observation.content,
        context: observation.context,
        confidence: observation.confidence,
    };

    match engine.submit_observation(twin_observation) {
        Ok(packet) => {
            let packet_id = packet.id.clone();
            let snapshot = capture_twin_memory_snapshot(&engine);
            info!("[NumericTwin] Observation submitted: {}", packet_id);
            drop(engine);
            persist_twin_memory(
                &singularity,
                "observation",
                snapshot,
                serde_json::json!({
                    "packetId": packet_id,
                    "observationType": observation_type_name,
                    "content": observation_content,
                    "context": observation_context,
                    "confidence": observation_confidence,
                }),
            )
            .await;
            Ok(packet.id)
        }
        Err(e) => {
            warn!("[NumericTwin] Observation failed: {}", e);
            Err(e.to_string())
        }
    }
}

/// Applique une évolution au Twin
#[tauri::command]
pub async fn twin_apply_evolution(
    state: State<'_, NumericTwinState>,
    singularity: State<'_, Arc<RwLock<SingularityState>>>,
    evolution: TwinEvolutionRequestPayload,
) -> Result<TwinEvolutionResult, String> {
    info!(
        "[NumericTwin] twin_apply_evolution called: {:?}",
        evolution.evolution_type
    );

    let evolution_type_name = evolution.evolution_type.clone();
    let evolution_target = evolution.target.clone();
    let evolution_delta = evolution.delta;
    let evolution_is_deep_change = evolution.is_deep_change;
    let evolution_validated_by_kevin = evolution.validated_by_kevin;

    validate_evolution_request(&evolution)?;

    let mut engine = state.0.lock().await;

    let evo_type = match evolution.evolution_type.as_str() {
        "trait_adjustment" => EvolutionType::TraitAdjustment,
        "value_reinforcement" => EvolutionType::ValueReinforcement,
        "pattern_integration" => EvolutionType::PatternIntegration,
        "phase_transition" => EvolutionType::PhaseTransition,
        _ => {
            return Err(format!(
                "Unknown evolution type: {}",
                evolution.evolution_type
            ))
        }
    };

    let request = TwinEvolutionRequest {
        evolution_type: evo_type,
        target: evolution.target,
        delta: evolution.delta,
        is_deep_change: evolution.is_deep_change,
        validated_by_kevin: evolution.validated_by_kevin,
    };

    match engine.apply_evolution(request) {
        Ok(result) => {
            let evolution_id = result.evolution_id.clone();
            let snapshot = capture_twin_memory_snapshot(&engine);
            info!("[NumericTwin] Evolution applied: {}", evolution_id);
            drop(engine);
            persist_twin_memory(
                &singularity,
                "evolution",
                snapshot,
                serde_json::json!({
                    "evolutionId": evolution_id,
                    "evolutionType": evolution_type_name,
                    "target": evolution_target,
                    "delta": evolution_delta,
                    "isDeepChange": evolution_is_deep_change,
                    "validatedByKevin": evolution_validated_by_kevin,
                    "resultingPhase": format!("{:?}", result.new_phase),
                }),
            )
            .await;
            Ok(result)
        }
        Err(e) => {
            warn!("[NumericTwin] Evolution failed: {}", e);
            Err(e.to_string())
        }
    }
}

/// Valide une synchronisation
#[tauri::command]
pub async fn twin_validate_sync(
    state: State<'_, NumericTwinState>,
    singularity: State<'_, Arc<RwLock<SingularityState>>>,
    validation: TwinSyncValidationRequest,
) -> Result<bool, String> {
    info!(
        "[NumericTwin] twin_validate_sync called: {}",
        validation.sync_id
    );

    let mut engine = state.0.lock().await;

    match engine.validate_sync(&validation.sync_id, validation.validated) {
        Ok(()) => {
            let snapshot = capture_twin_memory_snapshot(&engine);
            info!("[NumericTwin] Sync validated: {}", validation.sync_id);
            drop(engine);
            persist_twin_memory(
                &singularity,
                "sync_validation",
                snapshot,
                serde_json::json!({
                    "syncId": validation.sync_id,
                    "validated": validation.validated,
                }),
            )
            .await;
            Ok(true)
        }
        Err(e) => {
            warn!("[NumericTwin] Sync validation failed: {}", e);
            Err(e.to_string())
        }
    }
}

/// Obtient le profil d'évolution
#[tauri::command]
pub async fn twin_get_evolution_profile(
    state: State<'_, NumericTwinState>,
) -> Result<TwinEvolutionProfileResponse, String> {
    info!("[NumericTwin] twin_get_evolution_profile called");

    let engine = state.0.lock().await;
    let profile = &engine.evolution_profile;

    Ok(TwinEvolutionProfileResponse {
        current_phase: format!("{:?}", profile.current_phase),
        milestones_count: profile.evolution_history.len(),
        growth_trends: GrowthTrendsResponse {
            cognitive_growth: profile.growth_trends.cognitive_growth,
            emotional_growth: profile.growth_trends.emotional_growth,
            spiritual_growth: profile.growth_trends.spiritual_growth,
            entrepreneurial_growth: profile.growth_trends.entrepreneurial_growth,
        },
        adjustment_suggestions: profile
            .adjustment_suggestions
            .iter()
            .map(|s| AdjustmentSuggestionResponse {
                domain: s.domain.clone(),
                suggestion: s.suggestion.clone(),
                priority: s.priority,
                validated_by_kevin: s.validated_by_kevin,
            })
            .collect(),
        sync_score: profile.sync_score,
    })
}

/// Obtient l'identité du Twin
#[tauri::command]
pub async fn twin_get_identity(
    state: State<'_, NumericTwinState>,
) -> Result<TwinIdentityCoreResponse, String> {
    info!("[NumericTwin] twin_get_identity called");

    let engine = state.0.lock().await;
    let identity = &engine.identity_core;

    Ok(TwinIdentityCoreResponse {
        version: identity.version.clone(),
        name: identity.name.clone(),
        signature: identity.signature.clone(),
        core_values: identity
            .core_values
            .iter()
            .map(|v| CoreValueResponse {
                name: v.name.clone(),
                description: v.description.clone(),
                stability: v.stability,
                weight: v.weight,
            })
            .collect(),
        human_style: HumanStyleResponse {
            sincerity: identity.human_style.sincerity,
            gentle_intensity: identity.human_style.gentle_intensity,
            accessible_depth: identity.human_style.accessible_depth,
            calm_precision: identity.human_style.calm_precision,
            organic_fluidity: identity.human_style.organic_fluidity,
        },
        fusion_index: identity.fusion_index,
    })
}

/// Force le recalcul du FusionIndex
#[tauri::command]
pub async fn twin_recalculate_fusion(
    state: State<'_, NumericTwinState>,
    singularity: State<'_, Arc<RwLock<SingularityState>>>,
) -> Result<f32, String> {
    info!("[NumericTwin] twin_recalculate_fusion called");

    let mut engine = state.0.lock().await;
    engine.calculate_fusion_index();

    let fusion_score = engine.fusion_index.global_score;
    let snapshot = capture_twin_memory_snapshot(&engine);
    drop(engine);
    persist_twin_memory(
        &singularity,
        "fusion_recalculation",
        snapshot,
        serde_json::json!({
            "reason": "manual_recalculate",
            "fusionScore": fusion_score,
        }),
    )
    .await;

    Ok(fusion_score)
}

// ═══════════════════════════════════════════════════════════════════════════
// FONCTIONS DE CONVERSION
// ═══════════════════════════════════════════════════════════════════════════

pub(crate) fn convert_to_response(state: &TwinState) -> TwinStateResponse {
    TwinStateResponse {
        identity_core: TwinIdentityCoreResponse {
            version: state.identity_core.version.clone(),
            name: state.identity_core.name.clone(),
            signature: state.identity_core.signature.clone(),
            core_values: state
                .identity_core
                .core_values
                .iter()
                .map(|v| CoreValueResponse {
                    name: v.name.clone(),
                    description: v.description.clone(),
                    stability: v.stability,
                    weight: v.weight,
                })
                .collect(),
            human_style: HumanStyleResponse {
                sincerity: state.identity_core.human_style.sincerity,
                gentle_intensity: state.identity_core.human_style.gentle_intensity,
                accessible_depth: state.identity_core.human_style.accessible_depth,
                calm_precision: state.identity_core.human_style.calm_precision,
                organic_fluidity: state.identity_core.human_style.organic_fluidity,
            },
            fusion_index: state.identity_core.fusion_index,
        },
        value_map: TwinValueMapResponse {
            observed_values: state
                .value_map
                .observed_values
                .values()
                .map(|v| ObservedValueResponse {
                    name: v.name.clone(),
                    frequency: v.frequency,
                    confidence: v.confidence,
                    observations_count: v.observations_count,
                })
                .collect(),
            confirmed_values: state.value_map.confirmed_values.clone(),
            alignment_score: state.value_map.alignment_score,
        },
        cognitive_patterns: TwinCognitivePatternsResponse {
            reasoning_patterns: state
                .cognitive_patterns
                .reasoning_patterns
                .iter()
                .map(|p| ReasoningPatternResponse {
                    name: p.name.clone(),
                    description: p.description.clone(),
                    frequency: p.frequency,
                    effectiveness: p.effectiveness,
                })
                .collect(),
            structuring_style: StructuringStyleResponse {
                simple_to_complex: state.cognitive_patterns.structuring_style.simple_to_complex,
                structure_level: state.cognitive_patterns.structuring_style.structure_level,
                hierarchy_preference: state
                    .cognitive_patterns
                    .structuring_style
                    .hierarchy_preference,
                visual_preference: state.cognitive_patterns.structuring_style.visual_preference,
            },
        },
        therapeutic_model: TwinTherapeuticModelResponse {
            deep_listening: state.therapeutic_model.accompaniment_posture.deep_listening,
            rhythm_respect: state.therapeutic_model.accompaniment_posture.rhythm_respect,
            relational_clarity: state
                .therapeutic_model
                .accompaniment_posture
                .relational_clarity,
            support_precision: state
                .therapeutic_model
                .accompaniment_posture
                .support_precision,
            non_directive_guidance: state
                .therapeutic_model
                .guide_qualities
                .non_directive_guidance,
            holistic_integration: state
                .therapeutic_model
                .transformational_approach
                .holistic_integration,
        },
        creative_signature: TwinCreativeSignatureResponse {
            operational_intuition: state.creative_signature.operational_intuition,
            artistic_sense: state.creative_signature.artistic_sense,
            symbolic_sense: state.creative_signature.symbolic_sense,
            structural_creativity: state.creative_signature.structural_creativity,
            methodological_innovation: state.creative_signature.methodological_innovation,
            embodied_narration: state.creative_signature.embodied_narration,
            frameworks_count: state.creative_signature.created_frameworks.len(),
        },
        evolution_profile: TwinEvolutionProfileResponse {
            current_phase: format!("{:?}", state.evolution_profile.current_phase),
            milestones_count: state.evolution_profile.evolution_history.len(),
            growth_trends: GrowthTrendsResponse {
                cognitive_growth: state.evolution_profile.growth_trends.cognitive_growth,
                emotional_growth: state.evolution_profile.growth_trends.emotional_growth,
                spiritual_growth: state.evolution_profile.growth_trends.spiritual_growth,
                entrepreneurial_growth: state
                    .evolution_profile
                    .growth_trends
                    .entrepreneurial_growth,
            },
            adjustment_suggestions: state
                .evolution_profile
                .adjustment_suggestions
                .iter()
                .map(|s| AdjustmentSuggestionResponse {
                    domain: s.domain.clone(),
                    suggestion: s.suggestion.clone(),
                    priority: s.priority,
                    validated_by_kevin: s.validated_by_kevin,
                })
                .collect(),
            sync_score: state.evolution_profile.sync_score,
        },
        fusion_index: FusionIndexResponse {
            global_score: state.fusion_index.global_score,
            value_alignment: state.fusion_index.components.value_alignment,
            cognitive_alignment: state.fusion_index.components.cognitive_alignment,
            style_alignment: state.fusion_index.components.style_alignment,
            therapeutic_alignment: state.fusion_index.components.therapeutic_alignment,
            creative_alignment: state.fusion_index.components.creative_alignment,
            evolution_alignment: state.fusion_index.components.evolution_alignment,
            trend: format!("{:?}", state.fusion_index.trend),
        },
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// LISTE DES COMMANDES À ENREGISTRER
// ═══════════════════════════════════════════════════════════════════════════

/// Liste toutes les commandes du Numeric Twin
pub fn get_twin_commands() -> Vec<&'static str> {
    vec![
        "twin_get_state",
        "twin_get_fusion_index",
        "twin_submit_observation",
        "twin_apply_evolution",
        "twin_validate_sync",
        "twin_get_evolution_profile",
        "twin_get_identity",
        "twin_recalculate_fusion",
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn validate_observation_request_rejects_empty_content_and_out_of_range_confidence() {
        let empty = TwinObservationRequest {
            observation_type: "value".to_string(),
            content: "   ".to_string(),
            context: None,
            confidence: 0.7,
        };
        assert!(validate_observation_request(&empty).is_err());

        let invalid_confidence = TwinObservationRequest {
            observation_type: "value".to_string(),
            content: "alignement".to_string(),
            context: None,
            confidence: 1.5,
        };
        assert!(validate_observation_request(&invalid_confidence).is_err());
    }

    #[test]
    fn validate_evolution_request_rejects_empty_target_and_invalid_delta() {
        let empty_target = TwinEvolutionRequestPayload {
            evolution_type: "trait_adjustment".to_string(),
            target: "".to_string(),
            delta: Some(0.2),
            is_deep_change: false,
            validated_by_kevin: false,
        };
        assert!(validate_evolution_request(&empty_target).is_err());

        let invalid_delta = TwinEvolutionRequestPayload {
            evolution_type: "trait_adjustment".to_string(),
            target: "sincerity".to_string(),
            delta: Some(3.0),
            is_deep_change: false,
            validated_by_kevin: false,
        };
        assert!(validate_evolution_request(&invalid_delta).is_err());
    }
}
