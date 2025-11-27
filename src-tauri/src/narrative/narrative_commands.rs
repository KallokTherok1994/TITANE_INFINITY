// ═══════════════════════════════════════════════════════════════════════════════
//   TITANE∞ v22 — NARRATIVE COMMANDS
//   Commandes Tauri pour le NarrativeEngine
// ═══════════════════════════════════════════════════════════════════════════════

use tauri::State;
use tokio::sync::Mutex;
use crate::narrative::{
    NarrativeEngine,
    IdentityProfile,
    StyleProfile,
    NarrativeOutput,
    NarrativeArchetype,
};

/// État global du moteur narratif
pub struct NarrativeEngineGlobal(pub Mutex<NarrativeEngine>);

impl NarrativeEngineGlobal {
    pub fn new() -> Self {
        Self(Mutex::new(NarrativeEngine::new()))
    }
}

impl Default for NarrativeEngineGlobal {
    fn default() -> Self {
        Self::new()
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   COMMANDES TAURI
// ═══════════════════════════════════════════════════════════════════════════════

/// Génère une expression narrative
#[tauri::command]
pub async fn narrative_generate(
    state: State<'_, NarrativeEngineGlobal>,
    input: String,
    cognitive_stability: f32,
    sync_quality: f32,
) -> Result<NarrativeOutput, String> {
    log::info!("[NarrativeCommands] narrative_generate called");

    let engine = state.0.lock().await;
    let output = engine.generate_expression(cognitive_stability, sync_quality, &input);

    Ok(output)
}

/// Récupère le style actuel
#[tauri::command]
pub async fn narrative_get_style(
    state: State<'_, NarrativeEngineGlobal>,
) -> Result<String, String> {
    log::info!("[NarrativeCommands] narrative_get_style called");

    let engine = state.0.lock().await;
    Ok(format!("{:?}", engine.tone_model.base_style))
}

/// Définit le style narratif
#[tauri::command]
pub async fn narrative_set_style(
    state: State<'_, NarrativeEngineGlobal>,
    style: String,
) -> Result<(), String> {
    log::info!("[NarrativeCommands] narrative_set_style called: {}", style);

    let mut engine = state.0.lock().await;

    let profile = match style.as_str() {
        "clear" => StyleProfile::Clear,
        "structured" => StyleProfile::Structured,
        "elegant" => StyleProfile::Elegant,
        "embodied" => StyleProfile::Embodied,
        "technical" => StyleProfile::Technical,
        "synthetic" => StyleProfile::Synthetic,
        _ => return Err(format!("Invalid style: {}", style)),
    };

    engine.tone_model.base_style = profile;
    Ok(())
}

/// Récupère le profil d'identité
#[tauri::command]
pub async fn narrative_get_identity(
    state: State<'_, NarrativeEngineGlobal>,
) -> Result<IdentityProfile, String> {
    log::info!("[NarrativeCommands] narrative_get_identity called");

    let engine = state.0.lock().await;
    Ok(engine.identity_profile.clone())
}

/// Évolue l'identité narrative
#[tauri::command]
pub async fn narrative_evolve(
    state: State<'_, NarrativeEngineGlobal>,
    total_interactions: usize,
) -> Result<String, String> {
    log::info!("[NarrativeCommands] narrative_evolve called");

    let mut engine = state.0.lock().await;
    engine.evolve_identity(total_interactions);

    Ok("Identity evolved successfully".to_string())
}

/// Récupère l'archétype actif
#[tauri::command]
pub async fn narrative_get_archetype(
    state: State<'_, NarrativeEngineGlobal>,
) -> Result<Option<NarrativeArchetype>, String> {
    log::info!("[NarrativeCommands] narrative_get_archetype called");

    let engine = state.0.lock().await;
    Ok(engine.get_active_archetype())
}

/// Définit l'archétype actif
#[tauri::command]
pub async fn narrative_set_archetype(
    state: State<'_, NarrativeEngineGlobal>,
    archetype_name: String,
) -> Result<(), String> {
    log::info!("[NarrativeCommands] narrative_set_archetype called: {}", archetype_name);

    let mut engine = state.0.lock().await;
    engine.set_active_archetype(archetype_name);

    Ok(())
}
