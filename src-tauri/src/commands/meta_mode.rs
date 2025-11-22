//! 🚀 TAURI COMMANDS — Meta-Mode Engine Integration + Auto-Evolution v15.0
//! Commandes Tauri exposant le Meta-Mode Engine au frontend

use crate::meta_mode_engine::{MetaModeEngine, MetaModeConfig, MetaModeResponse, KevinState};
use crate::auto_evolution_v15::{AutoEvolutionEngine, KevinMetrics};
use tokio::sync::RwLock;
use tauri::State;

/// État global du Meta-Mode Engine partagé entre les commandes
pub struct MetaModeState {
    engine: RwLock<MetaModeEngine>,
    evolution_engine: RwLock<AutoEvolutionEngine>,
}

impl MetaModeState {
    pub fn new() -> Self {
        Self {
            engine: RwLock::new(MetaModeEngine::new(MetaModeConfig::default())),
            evolution_engine: RwLock::new(AutoEvolutionEngine::new()),
        }
    }
}

/// Structure de requête pour process_interaction
#[derive(Debug, serde::Deserialize)]
pub struct InteractionRequest {
    pub input: String,
    pub context: String,
}

/// Structure de réponse simplifiée pour le frontend
#[derive(Debug, serde::Serialize)]
pub struct InteractionResponse {
    pub active_mode: String,
    pub mode_justification: String,
    pub content: String,
    pub adapted_tone: String,
    pub adapted_depth: String,
    pub adapted_speed: String,
    pub next_suggested_modes: Vec<String>,
    pub timestamp: String,
}

impl From<MetaModeResponse> for InteractionResponse {
    fn from(response: MetaModeResponse) -> Self {
        Self {
            active_mode: response.active_mode.name().to_string(),
            mode_justification: response.mode_justification,
            content: response.content,
            adapted_tone: response.adapted_tone,
            adapted_depth: response.adapted_depth,
            adapted_speed: response.adapted_speed,
            next_suggested_modes: response.next_suggested_modes
                .iter()
                .map(|mode| mode.name().to_string())
                .collect(),
            timestamp: response.timestamp.to_rfc3339(),
        }
    }
}

/// Structure pour l'état Kevin simplifié
#[derive(Debug, serde::Serialize)]
pub struct KevinStateResponse {
    pub emotional_tone: String,
    pub stress_level: f32,
    pub emotional_stability: f32,
    pub cognitive_load: f32,
    pub clarity_level: f32,
    pub focus_level: f32,
    pub energy_level: f32,
    pub saturation_level: f32,
    pub need_structure: bool,
    pub need_validation: bool,
    pub need_guidance: bool,
    pub need_autonomy: bool,
    pub need_creativity: bool,
    pub need_rest: bool,
    pub task_type: String,
    pub implicit_signals: Vec<String>,
}

impl From<&KevinState> for KevinStateResponse {
    fn from(state: &KevinState) -> Self {
        Self {
            emotional_tone: state.emotional_tone.clone(),
            stress_level: state.stress_level,
            emotional_stability: state.emotional_stability,
            cognitive_load: state.cognitive_load,
            clarity_level: state.clarity_level,
            focus_level: state.focus_level,
            energy_level: state.energy_level,
            saturation_level: state.saturation_level,
            need_structure: state.need_structure,
            need_validation: state.need_validation,
            need_guidance: state.need_guidance,
            need_autonomy: state.need_autonomy,
            need_creativity: state.need_creativity,
            need_rest: state.need_rest,
            task_type: state.task_type.clone(),
            implicit_signals: state.implicit_signals.clone(),
        }
    }
}

/// **COMMANDE PRINCIPALE : Traiter une interaction avec le Meta-Mode Engine + Auto-Évolution**
#[tauri::command]
pub async fn meta_mode_process(
    request: InteractionRequest,
    state: State<'_, MetaModeState>,
) -> Result<InteractionResponse, String> {
    let response = {
        let mut engine = state.engine.write().await;
        engine.process_interaction(&request.input, &request.context)
    };
    
    // Déclencher cycle d'évolution (apprentissage continu)
    let kevin_metrics = {
        let engine = state.engine.read().await;
        kevin_state_to_metrics(&engine.kevin_state)
    };
    
    {
        let mut evolution_engine = state.evolution_engine.write().await;
        let _evolution_result = evolution_engine.evolution_cycle(&kevin_metrics);
    }
    
    Ok(InteractionResponse::from(response))
}

/// Convertir KevinState en KevinMetrics pour Auto-Evolution
fn kevin_state_to_metrics(state: &KevinState) -> KevinMetrics {
    KevinMetrics {
        emotional_state: if state.emotional_tone.contains("positif") { 0.5 } 
                        else if state.emotional_tone.contains("négatif") { -0.5 } 
                        else { 0.0 },
        cognitive_load: state.cognitive_load,
        energy_level: state.energy_level,
        clarity_level: state.clarity_level,
        creativity_level: if state.need_creativity { 0.7 } else { 0.5 },
        stress_level: state.stress_level,
        focus_level: state.focus_level,
        interaction_context: state.task_type.clone(),
    }
}

/// **Obtenir l'état actuel de Kevin**
#[tauri::command]
pub async fn meta_mode_get_kevin_state(
    state: State<'_, MetaModeState>,
) -> Result<KevinStateResponse, String> {
    let engine = state.engine.read().await;
    Ok(KevinStateResponse::from(&engine.kevin_state))
}

/// **Obtenir le mode actif**
#[tauri::command]
pub async fn meta_mode_get_current_mode(
    state: State<'_, MetaModeState>,
) -> Result<String, String> {
    let engine = state.engine.read().await;
    Ok(engine.current_mode.name().to_string())
}

/// **Obtenir tous les modes disponibles**
#[tauri::command]
pub async fn meta_mode_list_modes() -> Result<Vec<String>, String> {
    let modes = vec![
        // Modes d'accompagnement humain
        "Maître-Thérapeute Humaniste",
        "Coach Professionnel ICF",
        "PNL Master Practitioner",
        "Hypnose douce non médicale",
        "Méditation profonde TITANE ZÉRO",
        // Modes cognitifs & internes
        "Digital Twin (Kevin+)",
        "Emotional Engine",
        "Behavioral Engine",
        "LifeEngine",
        "Clarity Engine",
        "Meaning Engine",
        // Modes stratégiques
        "Stratège",
        "Architecte Systémique",
        "Analyste",
        "Focus Engine",
        "Project Navigator",
        // Modes productifs
        "Autopilot Proactif",
        "Creator Engine",
        "Optimizer",
        "Refactor Engine",
        // Modes immersifs
        "Voice Mode",
        "Voice Intuitive",
        "Deep Presence Mode",
        // Modes avancés
        "Forecast Engine",
        "Risk Detector",
        "Holistic Consistency Engine",
        "OmniContext",
    ];
    
    Ok(modes.into_iter().map(String::from).collect())
}

/// **Obtenir l'historique des modes (10 derniers)**
#[tauri::command]
pub async fn meta_mode_get_history(
    state: State<'_, MetaModeState>,
) -> Result<Vec<(String, String)>, String> {
    let engine = state.engine.read().await;
    
    let history: Vec<(String, String)> = engine.mode_history
        .iter()
        .rev()
        .take(10)
        .map(|(mode, timestamp)| (mode.name().to_string(), timestamp.to_rfc3339()))
        .collect();
    
    Ok(history)
}

/// **Obtenir les statistiques du Meta-Mode Engine**
#[derive(Debug, serde::Serialize)]
pub struct MetaModeStats {
    pub total_interactions: usize,
    pub current_mode: String,
    pub mode_transitions_count: usize,
    pub average_stress: f32,
    pub average_clarity: f32,
    pub average_energy: f32,
}

#[tauri::command]
pub async fn meta_mode_get_stats(
    state: State<'_, MetaModeState>,
) -> Result<MetaModeStats, String> {
    let engine = state.engine.read().await;
    
    let avg_stress = if engine.emotional_sync.stress_history.is_empty() {
        0.0
    } else {
        engine.emotional_sync.stress_history.iter().sum::<f32>() / engine.emotional_sync.stress_history.len() as f32
    };
    
    Ok(MetaModeStats {
        total_interactions: engine.response_history.len(),
        current_mode: engine.current_mode.name().to_string(),
        mode_transitions_count: engine.mode_history.len(),
        average_stress: avg_stress,
        average_clarity: engine.kevin_state.clarity_level,
        average_energy: engine.kevin_state.energy_level,
    })
}

/// **Réinitialiser le Meta-Mode Engine**
#[tauri::command]
pub async fn meta_mode_reset(
    state: State<'_, MetaModeState>,
) -> Result<String, String> {
    let mut engine = state.engine.write().await;
    *engine = MetaModeEngine::new(MetaModeConfig::default());
    Ok("Meta-Mode Engine réinitialisé avec succès".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_meta_mode_state_creation() {
        let state = MetaModeState::new();
        let engine = state.engine.read().await;
        assert_eq!(engine.current_mode.name(), "Digital Twin (Kevin+)");
    }
}
