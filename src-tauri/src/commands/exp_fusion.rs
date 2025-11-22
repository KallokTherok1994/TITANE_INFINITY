// 🎮 Tauri Commands — EXP Fusion Engine
// Exposition du système EXP au frontend React

use crate::exp_fusion_v15::{
    ExpFusionEngine, GlobalExpState, ExpSource, ExpEvent,
    timeline::{TimelineEntry, TimelineStats},
    categories::CategoryState,
    projects::{ProjectState, ProjectStats},
    talents::TalentTreeState,
};
use tokio::sync::RwLock;
use tauri::State;

/// État global partagé
pub struct ExpFusionState {
    pub engine: RwLock<ExpFusionEngine>,
}

impl ExpFusionState {
    pub fn new() -> Self {
        Self {
            engine: RwLock::new(ExpFusionEngine::new()),
        }
    }
}

/// Obtenir état global XP
#[tauri::command]
pub async fn exp_get_global_state(state: State<'_, ExpFusionState>) -> Result<GlobalExpState, String> {
    let engine = state.engine.read().await;
    Ok(engine.get_global_state())
}

/// Obtenir toutes les catégories
#[tauri::command]
pub async fn exp_get_categories(state: State<'_, ExpFusionState>) -> Result<Vec<CategoryState>, String> {
    let engine = state.engine.read().await;
    Ok(engine.get_categories())
}

/// Obtenir tous les projets
#[tauri::command]
pub async fn exp_get_projects(state: State<'_, ExpFusionState>) -> Result<Vec<ProjectState>, String> {
    let engine = state.engine.read().await;
    Ok(engine.get_projects())
}

/// Obtenir statistiques projets
#[tauri::command]
pub async fn exp_get_project_stats(state: State<'_, ExpFusionState>) -> Result<ProjectStats, String> {
    let engine = state.engine.read().await;
    Ok(engine.get_projects().iter().fold(
        ProjectStats {
            total_projects: 0,
            total_exp: 0,
            avg_level: 0.0,
            most_active: None,
        },
        |mut acc, p| {
            acc.total_projects += 1;
            acc.total_exp += p.total_exp;
            acc
        },
    ))
}

/// Obtenir arbre de talents
#[tauri::command]
pub async fn exp_get_talents(state: State<'_, ExpFusionState>) -> Result<TalentTreeState, String> {
    let engine = state.engine.read().await;
    Ok(engine.get_talents())
}

/// Obtenir timeline (N derniers jours)
#[tauri::command]
pub async fn exp_get_timeline(state: State<'_, ExpFusionState>, days: u32) -> Result<Vec<TimelineEntry>, String> {
    let engine = state.engine.read().await;
    Ok(engine.get_timeline(days))
}

/// Obtenir statistiques timeline
#[tauri::command]
pub async fn exp_get_timeline_stats(state: State<'_, ExpFusionState>, days: u32) -> Result<TimelineStats, String> {
    let engine = state.engine.read().await;
    let timeline = engine.get_timeline(days);
    
    let total_exp: u64 = timeline.iter().map(|e| e.exp_gained).sum();
    let event_count = timeline.len();
    
    Ok(TimelineStats {
        days,
        total_exp,
        event_count,
        avg_exp: if event_count > 0 { total_exp / event_count as u64 } else { 0 },
        peak_exp: timeline.iter().map(|e| e.exp_gained).max().unwrap_or(0),
        active_categories: timeline.iter().map(|e| e.category.clone()).collect::<std::collections::HashSet<_>>().len(),
    })
}

/// Ajouter connaissance (déclenche XP)
#[tauri::command]
pub async fn exp_add_knowledge(
    state: State<'_, ExpFusionState>,
    data: String,
    category: String,
    project: Option<String>,
    description: String,
) -> Result<ExpEvent, String> {
    let mut engine = state.engine.write().await;

    // Calculer XP basé sur la taille/complexité
    let base_exp = (data.len() / 100).clamp(1, 100) as u64;

    let event = engine.gain_exp(
        base_exp,
        ExpSource::KnowledgeAcquisition,
        &category,
        project.as_deref(),
        &description,
    );

    Ok(event)
}

/// Ajouter XP manuel (pour testing/admin)
#[tauri::command]
pub async fn exp_gain_manual(
    state: State<'_, ExpFusionState>,
    amount: u64,
    source: String,
    category: String,
    project: Option<String>,
    description: String,
) -> Result<ExpEvent, String> {
    let mut engine = state.engine.write().await;

    let exp_source = match source.as_str() {
        "Interaction" => ExpSource::Interaction,
        "MetaMode" => ExpSource::MetaMode,
        "AutoEvolution" => ExpSource::AutoEvolution,
        "FileImport" => ExpSource::FileImport,
        "ProjectUpdate" => ExpSource::ProjectUpdate,
        "SystemOptimization" => ExpSource::SystemOptimization,
        _ => ExpSource::KnowledgeAcquisition,
    };

    let event = engine.gain_exp(
        amount,
        exp_source,
        &category,
        project.as_deref(),
        &description,
    );

    Ok(event)
}

/// Synchroniser mémoire (forcer sauvegarde)
#[tauri::command]
pub async fn exp_sync_memory(state: State<'_, ExpFusionState>) -> Result<(), String> {
    let _engine = state.engine.read().await;
    // La sauvegarde est automatique dans gain_exp, mais on peut forcer
    Ok(())
}

/// Réinitialiser (DANGER)
#[tauri::command]
pub async fn exp_reset(state: State<'_, ExpFusionState>) -> Result<(), String> {
    let mut engine = state.engine.write().await;
    engine.reset();
    Ok(())
}

/// Exporter toutes les données EXP
#[tauri::command]
pub async fn exp_export_all(state: State<'_, ExpFusionState>) -> Result<String, String> {
    let engine = state.engine.read().await;
    
    let data = serde_json::json!({
        "global_state": engine.get_global_state(),
        "categories": engine.get_categories(),
        "projects": engine.get_projects(),
        "talents": engine.get_talents(),
        "timeline": engine.get_timeline(365),
    });

    serde_json::to_string_pretty(&data).map_err(|e| e.to_string())
}
