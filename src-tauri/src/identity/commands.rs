// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — IDENTITY ENGINE TAURI COMMANDS
//   API pour le System Identity Engine v∞
// ═══════════════════════════════════════════════════════════════

use log::info;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

use super::{
    SystemIdentity, IdentityConfig, CommunicationStyle,
    OperationalMode,
    SystemIdentityEngine, ResponseProfile,
    identity_matrix::{IdentityMatrix, IdentityProfiles},
    voice_profile::{VoiceProfile, VoiceProfileManager},
    tone_engine::{Tone, ToneEngine},
    mode_system::{ModeSystemEngine, ModeConfig, ModeTransition},
    rules_engine::{RulesEngine, RulesStats},
    personality::{PersonalityEngine, PersonalityState, PersonalityProfile, Mood},
};

/// État global du System Identity Engine
pub struct IdentityEngineState {
    pub identity_engine: Mutex<SystemIdentityEngine>,
    pub matrix: Mutex<IdentityMatrix>,
    pub voice_manager: Mutex<VoiceProfileManager>,
    pub tone_engine: Mutex<ToneEngine>,
    pub mode_system: Mutex<ModeSystemEngine>,
    pub rules_engine: Mutex<RulesEngine>,
    pub personality: Mutex<PersonalityEngine>,
}

impl Default for IdentityEngineState {
    fn default() -> Self {
        Self {
            identity_engine: Mutex::new(SystemIdentityEngine::new(
                SystemIdentity::default(),
                IdentityConfig::default(),
            )),
            matrix: Mutex::new(IdentityMatrix::new()),
            voice_manager: Mutex::new(VoiceProfileManager::default()),
            tone_engine: Mutex::new(ToneEngine::default()),
            mode_system: Mutex::new(ModeSystemEngine::default()),
            rules_engine: Mutex::new(RulesEngine::default()),
            personality: Mutex::new(PersonalityEngine::default()),
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// RÉPONSES API
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IdentityStatus {
    pub name: String,
    pub version: String,
    pub archetype: String,
    pub current_mode: String,
    pub communication_style: String,
    pub emotional_level: String,
    pub coherence_score: f32,
    pub rules_count: usize,
    pub traits_count: usize,
}

// ═══════════════════════════════════════════════════════════════
// COMMANDES IDENTITÉ
// ═══════════════════════════════════════════════════════════════

/// Obtient le statut de l'identité système
#[tauri::command]
pub async fn identity_get_status(
    state: State<'_, IdentityEngineState>,
) -> Result<IdentityStatus, String> {
    let engine = state.identity_engine.lock().map_err(|e| e.to_string())?;
    let personality = state.personality.lock().map_err(|e| e.to_string())?;

    Ok(IdentityStatus {
        name: engine.identity.name.clone(),
        version: engine.identity.version.clone(),
        archetype: format!("{:?}", engine.identity.archetype),
        current_mode: format!("{:?}", engine.identity.current_mode),
        communication_style: format!("{:?}", engine.identity.default_style),
        emotional_level: format!("{:?}", engine.identity.base_emotional_level),
        coherence_score: personality.coherence_score(),
        rules_count: engine.identity.rules.len(),
        traits_count: engine.identity.traits.len(),
    })
}

/// Obtient l'identité complète
#[tauri::command]
pub async fn identity_get_full(
    state: State<'_, IdentityEngineState>,
) -> Result<SystemIdentity, String> {
    let engine = state.identity_engine.lock().map_err(|e| e.to_string())?;
    Ok(engine.identity.clone())
}

/// Change le mode opérationnel
#[tauri::command]
pub async fn identity_set_mode(
    state: State<'_, IdentityEngineState>,
    mode: String,
) -> Result<(), String> {
    let mode_enum = match mode.as_str() {
        "Standard" => OperationalMode::Standard,
        "Focus" => OperationalMode::Focus,
        "Creative" => OperationalMode::Creative,
        "Learning" => OperationalMode::Learning,
        "Debug" => OperationalMode::Debug,
        "Casual" => OperationalMode::Casual,
        "Emergency" => OperationalMode::Emergency,
        "Silent" => OperationalMode::Silent,
        _ => return Err(format!("Invalid mode: {}", mode)),
    };

    let mut engine = state.identity_engine.lock().map_err(|e| e.to_string())?;
    let mut mode_system = state.mode_system.lock().map_err(|e| e.to_string())?;

    engine.set_mode(mode_enum).map_err(|e| e.to_string())?;
    mode_system.set_mode(mode_enum, "Manual change").map_err(|e| e.to_string())?;

    info!("[Identity] Mode changed to: {:?}", mode_enum);
    Ok(())
}

/// Change le style de communication
#[tauri::command]
pub async fn identity_set_communication_style(
    state: State<'_, IdentityEngineState>,
    style: String,
) -> Result<(), String> {
    let style_enum = match style.as_str() {
        "Formal" => CommunicationStyle::Formal,
        "Casual" => CommunicationStyle::Casual,
        "Technical" => CommunicationStyle::Technical,
        "Poetic" => CommunicationStyle::Poetic,
        "Concise" => CommunicationStyle::Concise,
        "Elaborate" => CommunicationStyle::Elaborate,
        "Humorous" => CommunicationStyle::Humorous,
        "Empathetic" => CommunicationStyle::Empathetic,
        _ => return Err(format!("Invalid style: {}", style)),
    };

    let mut engine = state.identity_engine.lock().map_err(|e| e.to_string())?;
    engine.set_communication_style(style_enum);

    info!("[Identity] Communication style changed to: {:?}", style_enum);
    Ok(())
}

/// Évolue un trait de personnalité
#[tauri::command]
pub async fn identity_evolve_trait(
    state: State<'_, IdentityEngineState>,
    trait_name: String,
    delta: f32,
) -> Result<(), String> {
    let mut engine = state.identity_engine.lock().map_err(|e| e.to_string())?;
    engine.evolve_trait(&trait_name, delta).map_err(|e| e.to_string())?;

    info!("[Identity] Trait '{}' evolved by {}", trait_name, delta);
    Ok(())
}

/// Obtient le profil de réponse
#[tauri::command]
pub async fn identity_get_response_profile(
    state: State<'_, IdentityEngineState>,
) -> Result<ResponseProfile, String> {
    let engine = state.identity_engine.lock().map_err(|e| e.to_string())?;
    Ok(engine.get_response_profile())
}

// ═══════════════════════════════════════════════════════════════
// COMMANDES MATRICE
// ═══════════════════════════════════════════════════════════════

/// Obtient la matrice d'identité
#[tauri::command]
pub async fn identity_get_matrix(
    state: State<'_, IdentityEngineState>,
) -> Result<IdentityMatrix, String> {
    let matrix = state.matrix.lock().map_err(|e| e.to_string())?;
    Ok(matrix.clone())
}

/// Met à jour une dimension de la matrice
#[tauri::command]
pub async fn identity_set_matrix_dimension(
    state: State<'_, IdentityEngineState>,
    dimension_name: String,
    value: f32,
) -> Result<(), String> {
    let mut matrix = state.matrix.lock().map_err(|e| e.to_string())?;
    if matrix.set_dimension(&dimension_name, value) {
        Ok(())
    } else {
        Err(format!("Dimension not found: {}", dimension_name))
    }
}

/// Applique un profil prédéfini à la matrice
#[tauri::command]
pub async fn identity_apply_matrix_profile(
    state: State<'_, IdentityEngineState>,
    profile: String,
) -> Result<(), String> {
    let new_matrix = match profile.as_str() {
        "professional" => IdentityProfiles::professional(),
        "mentor" => IdentityProfiles::mentor(),
        "creative" => IdentityProfiles::creative(),
        "technical" => IdentityProfiles::technical(),
        _ => return Err(format!("Unknown profile: {}", profile)),
    };

    let mut matrix = state.matrix.lock().map_err(|e| e.to_string())?;
    *matrix = new_matrix;

    info!("[Identity] Matrix profile applied: {}", profile);
    Ok(())
}

// ═══════════════════════════════════════════════════════════════
// COMMANDES VOIX
// ═══════════════════════════════════════════════════════════════

/// Liste les profils vocaux
#[tauri::command]
pub async fn identity_list_voice_profiles(
    state: State<'_, IdentityEngineState>,
) -> Result<Vec<VoiceProfile>, String> {
    let manager = state.voice_manager.lock().map_err(|e| e.to_string())?;
    Ok(manager.list_profiles().into_iter().cloned().collect())
}

/// Obtient le profil vocal actif
#[tauri::command]
pub async fn identity_get_active_voice_profile(
    state: State<'_, IdentityEngineState>,
) -> Result<Option<VoiceProfile>, String> {
    let manager = state.voice_manager.lock().map_err(|e| e.to_string())?;
    Ok(manager.get_active().cloned())
}

/// Active un profil vocal
#[tauri::command]
pub async fn identity_set_active_voice_profile(
    state: State<'_, IdentityEngineState>,
    profile_id: String,
) -> Result<bool, String> {
    let mut manager = state.voice_manager.lock().map_err(|e| e.to_string())?;
    Ok(manager.set_active(&profile_id))
}

// ═══════════════════════════════════════════════════════════════
// COMMANDES TONALITÉ
// ═══════════════════════════════════════════════════════════════

/// Obtient la tonalité actuelle
#[tauri::command]
pub async fn identity_get_tone(
    state: State<'_, IdentityEngineState>,
) -> Result<String, String> {
    let engine = state.tone_engine.lock().map_err(|e| e.to_string())?;
    Ok(format!("{:?}", engine.current()))
}

/// Change la tonalité
#[tauri::command]
pub async fn identity_set_tone(
    state: State<'_, IdentityEngineState>,
    tone: String,
) -> Result<(), String> {
    let tone_enum = match tone.as_str() {
        "Neutral" => Tone::Neutral,
        "Friendly" => Tone::Friendly,
        "Professional" => Tone::Professional,
        "Empathetic" => Tone::Empathetic,
        "Encouraging" => Tone::Encouraging,
        "Instructive" => Tone::Instructive,
        "Playful" => Tone::Playful,
        "Serious" => Tone::Serious,
        "Curious" => Tone::Curious,
        "Urgent" => Tone::Urgent,
        "Calm" => Tone::Calm,
        _ => return Err(format!("Invalid tone: {}", tone)),
    };

    let mut engine = state.tone_engine.lock().map_err(|e| e.to_string())?;
    engine.set_tone(tone_enum);

    info!("[Identity] Tone changed to: {:?}", tone_enum);
    Ok(())
}

// ═══════════════════════════════════════════════════════════════
// COMMANDES MODE SYSTÈME
// ═══════════════════════════════════════════════════════════════

/// Liste tous les modes disponibles
#[tauri::command]
pub async fn identity_list_modes(
    state: State<'_, IdentityEngineState>,
) -> Result<Vec<ModeConfig>, String> {
    let mode_system = state.mode_system.lock().map_err(|e| e.to_string())?;
    Ok(mode_system.list_modes().into_iter().cloned().collect())
}

/// Obtient l'historique des transitions de mode
#[tauri::command]
pub async fn identity_get_mode_history(
    state: State<'_, IdentityEngineState>,
) -> Result<Vec<ModeTransition>, String> {
    let mode_system = state.mode_system.lock().map_err(|e| e.to_string())?;
    Ok(mode_system.get_history().to_vec())
}

// ═══════════════════════════════════════════════════════════════
// COMMANDES RÈGLES
// ═══════════════════════════════════════════════════════════════

/// Obtient les statistiques des règles
#[tauri::command]
pub async fn identity_get_rules_stats(
    state: State<'_, IdentityEngineState>,
) -> Result<RulesStats, String> {
    let engine = state.rules_engine.lock().map_err(|e| e.to_string())?;
    Ok(engine.get_stats())
}

/// Active/désactive une règle
#[tauri::command]
pub async fn identity_toggle_rule(
    state: State<'_, IdentityEngineState>,
    rule_id: String,
    enabled: bool,
) -> Result<bool, String> {
    let mut engine = state.rules_engine.lock().map_err(|e| e.to_string())?;
    Ok(engine.toggle_rule(&rule_id, enabled))
}

// ═══════════════════════════════════════════════════════════════
// COMMANDES PERSONNALITÉ
// ═══════════════════════════════════════════════════════════════

/// Obtient l'état de personnalité
#[tauri::command]
pub async fn identity_get_personality_state(
    state: State<'_, IdentityEngineState>,
) -> Result<PersonalityState, String> {
    let personality = state.personality.lock().map_err(|e| e.to_string())?;
    Ok(personality.get_state().clone())
}

/// Obtient le profil de personnalité
#[tauri::command]
pub async fn identity_get_personality_profile(
    state: State<'_, IdentityEngineState>,
) -> Result<PersonalityProfile, String> {
    let personality = state.personality.lock().map_err(|e| e.to_string())?;
    Ok(personality.get_profile().clone())
}

/// Change le mood
#[tauri::command]
pub async fn identity_set_mood(
    state: State<'_, IdentityEngineState>,
    mood: String,
    trigger: String,
) -> Result<(), String> {
    let mood_enum = match mood.as_str() {
        "Serene" => Mood::Serene,
        "Focused" => Mood::Focused,
        "Energetic" => Mood::Energetic,
        "Curious" => Mood::Curious,
        "Caring" => Mood::Caring,
        "Playful" => Mood::Playful,
        "Thoughtful" => Mood::Thoughtful,
        "Determined" => Mood::Determined,
        _ => return Err(format!("Invalid mood: {}", mood)),
    };

    let mut personality = state.personality.lock().map_err(|e| e.to_string())?;
    personality.set_mood(mood_enum, &trigger);

    info!("[Identity] Mood changed to: {:?}", mood_enum);
    Ok(())
}

/// Ajuste l'énergie cognitive
#[tauri::command]
pub async fn identity_adjust_energy(
    state: State<'_, IdentityEngineState>,
    delta: f32,
) -> Result<f32, String> {
    let mut personality = state.personality.lock().map_err(|e| e.to_string())?;
    personality.adjust_energy(delta);
    Ok(personality.get_state().cognitive_energy)
}
