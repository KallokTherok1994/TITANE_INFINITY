//! ═══════════════════════════════════════════════════════════════════════════
//! TITANE∞ v∞ — REALITY RENDERER COMMANDS
//! Commandes Tauri pour le Reality Rendering Layer
//! ═══════════════════════════════════════════════════════════════════════════

use super::{
    Entity, EntityType, FrameStats, RealityRenderer, RealityRendererState, RenderConfig,
    RenderMode, Vec3,
};
use crate::utils::AppError;
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL STATE
// ═══════════════════════════════════════════════════════════════════════════

static REALITY_RENDERER: Lazy<Arc<RwLock<Option<RealityRenderer>>>> =
    Lazy::new(|| Arc::new(RwLock::new(None)));

// ═══════════════════════════════════════════════════════════════════════════
// COMMANDS
// ═══════════════════════════════════════════════════════════════════════════

/// Initialise le Reality Renderer
#[tauri::command]
pub async fn reality_init() -> Result<RealityRendererState, AppError> {
    log::info!("[RealityRenderer] Initializing via command...");

    let renderer = RealityRenderer::new();
    renderer
        .initialize()
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    let state = renderer.get_state().await;

    let mut global = REALITY_RENDERER.write().await;
    *global = Some(renderer);

    log::info!("[RealityRenderer] ✅ Initialized successfully");
    Ok(state)
}

/// Récupère l'état actuel
#[tauri::command]
pub async fn reality_get_state() -> Result<RealityRendererState, AppError> {
    let global = REALITY_RENDERER.read().await;

    match &*global {
        Some(renderer) => Ok(renderer.get_state().await),
        None => Err(AppError::Internal(
            "Reality Renderer not initialized".to_string(),
        )),
    }
}

/// Rend un frame
#[tauri::command]
pub async fn reality_render_frame() -> Result<FrameStats, AppError> {
    let global = REALITY_RENDERER.read().await;

    match &*global {
        Some(renderer) => renderer
            .render_frame()
            .await
            .map_err(|e| AppError::Internal(e.to_string())),
        None => Err(AppError::Internal(
            "Reality Renderer not initialized".to_string(),
        )),
    }
}

/// Crée une nouvelle scène
#[tauri::command]
pub async fn reality_create_scene(name: String) -> Result<String, AppError> {
    let global = REALITY_RENDERER.read().await;

    match &*global {
        Some(renderer) => renderer
            .create_scene(&name)
            .await
            .map_err(|e| AppError::Internal(e.to_string())),
        None => Err(AppError::Internal(
            "Reality Renderer not initialized".to_string(),
        )),
    }
}

/// Charge une scène
#[tauri::command]
pub async fn reality_load_scene(scene_id: String) -> Result<(), AppError> {
    let global = REALITY_RENDERER.read().await;

    match &*global {
        Some(renderer) => renderer
            .load_scene(&scene_id)
            .await
            .map_err(|e| AppError::Internal(e.to_string())),
        None => Err(AppError::Internal(
            "Reality Renderer not initialized".to_string(),
        )),
    }
}

/// Paramètres pour créer une entité
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateEntityParams {
    pub name: String,
    pub entity_type: String,
    pub position: Option<[f64; 3]>,
    pub rotation: Option<[f64; 3]>,
    pub scale: Option<[f64; 3]>,
    pub tags: Option<Vec<String>>,
}

/// Ajoute une entité
#[tauri::command]
pub async fn reality_add_entity(params: CreateEntityParams) -> Result<String, AppError> {
    let global = REALITY_RENDERER.read().await;

    let entity_type = match params.entity_type.to_lowercase().as_str() {
        "object" => EntityType::Object,
        "light" => EntityType::Light,
        "camera" => EntityType::Camera,
        "particle" => EntityType::Particle,
        "volume" => EntityType::Volume,
        "audio" => EntityType::Audio,
        "trigger" => EntityType::Trigger,
        _ => EntityType::Object,
    };

    let mut entity = Entity::new(&params.name, entity_type);

    if let Some(pos) = params.position {
        entity.transform.position = Vec3::new(pos[0], pos[1], pos[2]);
    }

    if let Some(scale) = params.scale {
        entity.transform.scale = Vec3::new(scale[0], scale[1], scale[2]);
    }

    if let Some(tags) = params.tags {
        entity.tags = tags;
    }

    match &*global {
        Some(renderer) => renderer
            .add_entity(entity)
            .await
            .map_err(|e| AppError::Internal(e.to_string())),
        None => Err(AppError::Internal(
            "Reality Renderer not initialized".to_string(),
        )),
    }
}

/// Supprime une entité
#[tauri::command]
pub async fn reality_remove_entity(entity_id: String) -> Result<(), AppError> {
    let global = REALITY_RENDERER.read().await;

    match &*global {
        Some(renderer) => renderer
            .remove_entity(&entity_id)
            .await
            .map_err(|e| AppError::Internal(e.to_string())),
        None => Err(AppError::Internal(
            "Reality Renderer not initialized".to_string(),
        )),
    }
}

/// Configure le rendu
#[tauri::command]
pub async fn reality_set_render_config(
    mode: Option<String>,
    resolution: Option<[u32; 2]>,
    antialiasing: Option<bool>,
    shadows: Option<bool>,
    target_fps: Option<u32>,
) -> Result<(), AppError> {
    let global = REALITY_RENDERER.read().await;

    let mut config = RenderConfig::default();

    if let Some(m) = mode {
        config.mode = match m.to_lowercase().as_str() {
            "wireframe" => RenderMode::Wireframe,
            "solid" => RenderMode::Solid,
            "textured" => RenderMode::Textured,
            "pbr" => RenderMode::PBR,
            "raytraced" => RenderMode::RayTraced,
            "pathtraced" => RenderMode::PathTraced,
            _ => RenderMode::PBR,
        };
    }

    if let Some([w, h]) = resolution {
        config.resolution_x = w;
        config.resolution_y = h;
    }

    if let Some(aa) = antialiasing {
        config.antialiasing = aa;
    }

    if let Some(s) = shadows {
        config.shadows = s;
    }

    if let Some(fps) = target_fps {
        config.target_fps = fps;
    }

    match &*global {
        Some(renderer) => renderer
            .set_render_config(config)
            .await
            .map_err(|e| AppError::Internal(e.to_string())),
        None => Err(AppError::Internal(
            "Reality Renderer not initialized".to_string(),
        )),
    }
}

/// Active/désactive la physique
#[tauri::command]
pub async fn reality_toggle_physics(enabled: bool) -> Result<(), AppError> {
    let global = REALITY_RENDERER.read().await;

    match &*global {
        Some(renderer) => renderer
            .toggle_physics(enabled)
            .await
            .map_err(|e| AppError::Internal(e.to_string())),
        None => Err(AppError::Internal(
            "Reality Renderer not initialized".to_string(),
        )),
    }
}

/// Rapport complet
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RealityReport {
    pub state: RealityRendererState,
    pub frame_stats: Option<FrameStats>,
    pub summary: String,
}

#[tauri::command]
pub async fn reality_get_report() -> Result<RealityReport, AppError> {
    let global = REALITY_RENDERER.read().await;

    match &*global {
        Some(renderer) => {
            let state = renderer.get_state().await;

            let summary = format!(
                "Reality Renderer: {} scenes, {} entities, {} lights, {:.1} FPS",
                state.scene_count, state.entity_count, state.light_count, state.fps
            );

            Ok(RealityReport {
                state,
                frame_stats: None,
                summary,
            })
        }
        None => Err(AppError::Internal(
            "Reality Renderer not initialized".to_string(),
        )),
    }
}
