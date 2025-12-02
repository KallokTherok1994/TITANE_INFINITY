//! ═══════════════════════════════════════════════════════════════════════════
//! TITANE∞ v∞ — REALITY RENDERING LAYER (OPUS #19)
//! Moteur de rendu de réalité avec scènes, physique, éclairage et spatial
//! ═══════════════════════════════════════════════════════════════════════════

pub mod commands;
pub mod lighting;
pub mod physics;
pub mod scene;
pub mod spatial;

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use thiserror::Error;
use tokio::sync::RwLock;

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & ERRORS
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Error, Debug)]
pub enum RealityError {
    #[error("Scene error: {0}")]
    Scene(String),
    #[error("Physics error: {0}")]
    Physics(String),
    #[error("Lighting error: {0}")]
    Lighting(String),
    #[error("Spatial error: {0}")]
    Spatial(String),
    #[error("Render error: {0}")]
    Render(String),
}

pub type RealityResult<T> = Result<T, RealityError>;

// ═══════════════════════════════════════════════════════════════════════════
// CORE TYPES
// ═══════════════════════════════════════════════════════════════════════════

/// Vecteur 3D
#[derive(Debug, Clone, Copy, Serialize, Deserialize, Default)]
pub struct Vec3 {
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

impl Vec3 {
    pub fn new(x: f64, y: f64, z: f64) -> Self {
        Self { x, y, z }
    }

    pub fn zero() -> Self {
        Self::default()
    }

    pub fn magnitude(&self) -> f64 {
        (self.x * self.x + self.y * self.y + self.z * self.z).sqrt()
    }

    pub fn normalize(&self) -> Self {
        let mag = self.magnitude();
        if mag > 0.0 {
            Self {
                x: self.x / mag,
                y: self.y / mag,
                z: self.z / mag,
            }
        } else {
            Self::zero()
        }
    }

    pub fn dot(&self, other: &Self) -> f64 {
        self.x * other.x + self.y * other.y + self.z * other.z
    }

    pub fn cross(&self, other: &Self) -> Self {
        Self {
            x: self.y * other.z - self.z * other.y,
            y: self.z * other.x - self.x * other.z,
            z: self.x * other.y - self.y * other.x,
        }
    }
}

/// Quaternion pour rotations
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct Quaternion {
    pub w: f64,
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

impl Default for Quaternion {
    fn default() -> Self {
        Self {
            w: 1.0,
            x: 0.0,
            y: 0.0,
            z: 0.0,
        }
    }
}

impl Quaternion {
    pub fn identity() -> Self {
        Self::default()
    }

    pub fn from_euler(roll: f64, pitch: f64, yaw: f64) -> Self {
        let (sr, cr) = (roll / 2.0).sin_cos();
        let (sp, cp) = (pitch / 2.0).sin_cos();
        let (sy, cy) = (yaw / 2.0).sin_cos();

        Self {
            w: cr * cp * cy + sr * sp * sy,
            x: sr * cp * cy - cr * sp * sy,
            y: cr * sp * cy + sr * cp * sy,
            z: cr * cp * sy - sr * sp * cy,
        }
    }
}

/// Transform complet
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transform {
    pub position: Vec3,
    pub rotation: Quaternion,
    pub scale: Vec3,
}

impl Default for Transform {
    fn default() -> Self {
        Self {
            position: Vec3::zero(),
            rotation: Quaternion::identity(),
            scale: Vec3::new(1.0, 1.0, 1.0),
        }
    }
}

/// Type d'entité dans la scène
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum EntityType {
    Object,
    Light,
    Camera,
    Particle,
    Volume,
    Audio,
    Trigger,
}

/// Entité dans la scène
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Entity {
    pub id: String,
    pub name: String,
    pub entity_type: EntityType,
    pub transform: Transform,
    pub visible: bool,
    pub active: bool,
    pub layer: u32,
    pub tags: Vec<String>,
    pub metadata: HashMap<String, serde_json::Value>,
    pub parent_id: Option<String>,
    pub children_ids: Vec<String>,
}

impl Entity {
    pub fn new(name: &str, entity_type: EntityType) -> Self {
        Self {
            id: format!("entity-{}", uuid::Uuid::new_v4()),
            name: name.to_string(),
            entity_type,
            transform: Transform::default(),
            visible: true,
            active: true,
            layer: 0,
            tags: Vec::new(),
            metadata: HashMap::new(),
            parent_id: None,
            children_ids: Vec::new(),
        }
    }
}

/// Mode de rendu
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum RenderMode {
    Wireframe,
    Solid,
    Textured,
    PBR,
    RayTraced,
    PathTraced,
}

impl Default for RenderMode {
    fn default() -> Self {
        Self::PBR
    }
}

/// Configuration du rendu
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RenderConfig {
    pub mode: RenderMode,
    pub resolution_x: u32,
    pub resolution_y: u32,
    pub fov: f64,
    pub near_clip: f64,
    pub far_clip: f64,
    pub antialiasing: bool,
    pub shadows: bool,
    pub reflections: bool,
    pub ambient_occlusion: bool,
    pub bloom: bool,
    pub target_fps: u32,
}

impl Default for RenderConfig {
    fn default() -> Self {
        Self {
            mode: RenderMode::PBR,
            resolution_x: 1920,
            resolution_y: 1080,
            fov: 75.0,
            near_clip: 0.1,
            far_clip: 10000.0,
            antialiasing: true,
            shadows: true,
            reflections: true,
            ambient_occlusion: true,
            bloom: true,
            target_fps: 60,
        }
    }
}

/// État du Reality Renderer
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RealityRendererState {
    pub active: bool,
    pub scene_count: usize,
    pub active_scene_id: Option<String>,
    pub entity_count: usize,
    pub light_count: usize,
    pub fps: f64,
    pub frame_time_ms: f64,
    pub render_config: RenderConfig,
    pub physics_enabled: bool,
    pub spatial_enabled: bool,
}

impl Default for RealityRendererState {
    fn default() -> Self {
        Self {
            active: false,
            scene_count: 0,
            active_scene_id: None,
            entity_count: 0,
            light_count: 0,
            fps: 0.0,
            frame_time_ms: 0.0,
            render_config: RenderConfig::default(),
            physics_enabled: true,
            spatial_enabled: true,
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// REALITY RENDERER PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

/// Moteur de rendu Reality
pub struct RealityRenderer {
    state: Arc<RwLock<RealityRendererState>>,
    scene_manager: Arc<RwLock<scene::SceneManager>>,
    physics_engine: Arc<RwLock<physics::PhysicsEngine>>,
    lighting_system: Arc<RwLock<lighting::LightingSystem>>,
    spatial_system: Arc<RwLock<spatial::SpatialSystem>>,
    frame_count: Arc<RwLock<u64>>,
    last_frame_time: Arc<RwLock<std::time::Instant>>,
}

impl RealityRenderer {
    pub fn new() -> Self {
        Self {
            state: Arc::new(RwLock::new(RealityRendererState::default())),
            scene_manager: Arc::new(RwLock::new(scene::SceneManager::new())),
            physics_engine: Arc::new(RwLock::new(physics::PhysicsEngine::new())),
            lighting_system: Arc::new(RwLock::new(lighting::LightingSystem::new())),
            spatial_system: Arc::new(RwLock::new(spatial::SpatialSystem::new())),
            frame_count: Arc::new(RwLock::new(0)),
            last_frame_time: Arc::new(RwLock::new(std::time::Instant::now())),
        }
    }

    pub async fn initialize(&self) -> RealityResult<()> {
        log::info!("[RealityRenderer] Initializing...");

        // Initialize subsystems
        self.scene_manager.write().await.initialize().await?;
        self.physics_engine.write().await.initialize().await?;
        self.lighting_system.write().await.initialize().await?;
        self.spatial_system.write().await.initialize().await?;

        // Activate
        let mut state = self.state.write().await;
        state.active = true;

        log::info!("[RealityRenderer] ✅ Initialized successfully");
        Ok(())
    }

    pub async fn get_state(&self) -> RealityRendererState {
        let mut state = self.state.read().await.clone();

        // Update counts from subsystems
        let scene_mgr = self.scene_manager.read().await;
        state.scene_count = scene_mgr.scene_count();
        state.active_scene_id = scene_mgr.active_scene_id();

        if let Some(scene) = scene_mgr.active_scene() {
            state.entity_count = scene.entity_count();
        }

        let lighting = self.lighting_system.read().await;
        state.light_count = lighting.light_count();

        state
    }

    pub async fn render_frame(&self) -> RealityResult<FrameStats> {
        let start = std::time::Instant::now();

        // Update physics
        if self.state.read().await.physics_enabled {
            self.physics_engine.write().await.step(1.0 / 60.0).await?;
        }

        // Update spatial
        if self.state.read().await.spatial_enabled {
            self.spatial_system.write().await.update().await?;
        }

        // Update lighting
        self.lighting_system.write().await.update().await?;

        // Render scene
        let scene_mgr = self.scene_manager.read().await;
        if let Some(_scene) = scene_mgr.active_scene() {
            // Render logic here (mock)
        }

        // Update frame stats
        let elapsed = start.elapsed();
        let frame_time_ms = elapsed.as_secs_f64() * 1000.0;

        let mut last_frame = self.last_frame_time.write().await;
        let delta = last_frame.elapsed().as_secs_f64();
        *last_frame = std::time::Instant::now();

        let fps = if delta > 0.0 { 1.0 / delta } else { 0.0 };

        *self.frame_count.write().await += 1;

        let mut state = self.state.write().await;
        state.fps = fps;
        state.frame_time_ms = frame_time_ms;

        Ok(FrameStats {
            frame_number: *self.frame_count.read().await,
            frame_time_ms,
            fps,
            draw_calls: 0,
            triangles: 0,
            entities_rendered: 0,
        })
    }

    pub async fn create_scene(&self, name: &str) -> RealityResult<String> {
        self.scene_manager.write().await.create_scene(name).await
    }

    pub async fn load_scene(&self, scene_id: &str) -> RealityResult<()> {
        self.scene_manager
            .write()
            .await
            .set_active_scene(scene_id)
            .await
    }

    pub async fn add_entity(&self, entity: Entity) -> RealityResult<String> {
        let mut scene_mgr = self.scene_manager.write().await;
        scene_mgr.add_entity(entity).await
    }

    pub async fn remove_entity(&self, entity_id: &str) -> RealityResult<()> {
        let mut scene_mgr = self.scene_manager.write().await;
        scene_mgr.remove_entity(entity_id).await
    }

    pub async fn set_render_config(&self, config: RenderConfig) -> RealityResult<()> {
        let mut state = self.state.write().await;
        state.render_config = config;
        Ok(())
    }

    pub async fn toggle_physics(&self, enabled: bool) -> RealityResult<()> {
        let mut state = self.state.write().await;
        state.physics_enabled = enabled;
        Ok(())
    }
}

impl Default for RealityRenderer {
    fn default() -> Self {
        Self::new()
    }
}

/// Statistiques de frame
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FrameStats {
    pub frame_number: u64,
    pub frame_time_ms: f64,
    pub fps: f64,
    pub draw_calls: u32,
    pub triangles: u64,
    pub entities_rendered: u32,
}

// Re-exports
pub use lighting::{Light, LightType, LightingSystem};
pub use physics::{PhysicsBody, PhysicsEngine, RigidBodyType};
pub use scene::{Scene, SceneManager};
pub use spatial::{SpatialCell, SpatialSystem};
