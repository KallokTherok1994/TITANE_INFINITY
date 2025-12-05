//! ═══════════════════════════════════════════════════════════════════════════
//! TITANE∞ v∞ — SCENE MANAGER
//! Gestion des scènes et entités
//! ═══════════════════════════════════════════════════════════════════════════

use super::{Entity, EntityType, RealityError, RealityResult, Transform};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Scène 3D
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Scene {
    pub id: String,
    pub name: String,
    pub entities: HashMap<String, Entity>,
    pub root_entities: Vec<String>,
    pub ambient_color: [f32; 3],
    pub skybox_enabled: bool,
    pub fog_enabled: bool,
    pub fog_density: f32,
    pub active: bool,
    pub created_at: u64,
    pub modified_at: u64,
}

impl Scene {
    pub fn new(name: &str) -> Self {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;

        Self {
            id: format!("scene-{}", uuid::Uuid::new_v4()),
            name: name.to_string(),
            entities: HashMap::new(),
            root_entities: Vec::new(),
            ambient_color: [0.1, 0.1, 0.15],
            skybox_enabled: true,
            fog_enabled: false,
            fog_density: 0.001,
            active: false,
            created_at: now,
            modified_at: now,
        }
    }

    pub fn entity_count(&self) -> usize {
        self.entities.len()
    }

    pub fn add_entity(&mut self, entity: Entity) -> String {
        let id = entity.id.clone();

        if entity.parent_id.is_none() {
            self.root_entities.push(id.clone());
        }

        self.entities.insert(id.clone(), entity);
        self.update_modified();
        id
    }

    pub fn remove_entity(&mut self, entity_id: &str) -> Option<Entity> {
        self.root_entities.retain(|id| id != entity_id);
        let entity = self.entities.remove(entity_id);
        self.update_modified();
        entity
    }

    pub fn get_entity(&self, entity_id: &str) -> Option<&Entity> {
        self.entities.get(entity_id)
    }

    pub fn get_entity_mut(&mut self, entity_id: &str) -> Option<&mut Entity> {
        self.entities.get_mut(entity_id)
    }

    pub fn get_entities_by_type(&self, entity_type: EntityType) -> Vec<&Entity> {
        self.entities
            .values()
            .filter(|e| e.entity_type == entity_type)
            .collect()
    }

    pub fn get_entities_by_tag(&self, tag: &str) -> Vec<&Entity> {
        self.entities
            .values()
            .filter(|e| e.tags.contains(&tag.to_string()))
            .collect()
    }

    fn update_modified(&mut self) {
        self.modified_at = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;
    }
}

/// Gestionnaire de scènes
pub struct SceneManager {
    scenes: HashMap<String, Scene>,
    active_scene_id: Option<String>,
    scene_history: Vec<String>,
}

impl SceneManager {
    pub fn new() -> Self {
        Self {
            scenes: HashMap::new(),
            active_scene_id: None,
            scene_history: Vec::new(),
        }
    }

    pub async fn initialize(&mut self) -> RealityResult<()> {
        log::info!("[SceneManager] Initializing...");

        // Create default scene
        let default_scene = Scene::new("Default Scene");
        let scene_id = default_scene.id.clone();
        self.scenes.insert(scene_id.clone(), default_scene);
        self.active_scene_id = Some(scene_id);

        log::info!("[SceneManager] ✅ Initialized with default scene");
        Ok(())
    }

    pub async fn create_scene(&mut self, name: &str) -> RealityResult<String> {
        let scene = Scene::new(name);
        let id = scene.id.clone();
        self.scenes.insert(id.clone(), scene);
        log::info!("[SceneManager] Created scene: {}", name);
        Ok(id)
    }

    pub async fn delete_scene(&mut self, scene_id: &str) -> RealityResult<()> {
        if self.active_scene_id.as_deref() == Some(scene_id) {
            return Err(RealityError::Scene(
                "Cannot delete active scene".to_string(),
            ));
        }

        self.scenes.remove(scene_id);
        self.scene_history.retain(|id| id != scene_id);
        Ok(())
    }

    pub async fn set_active_scene(&mut self, scene_id: &str) -> RealityResult<()> {
        if !self.scenes.contains_key(scene_id) {
            return Err(RealityError::Scene(format!(
                "Scene not found: {}",
                scene_id
            )));
        }

        // Deactivate current scene
        if let Some(current_id) = &self.active_scene_id {
            if let Some(scene) = self.scenes.get_mut(current_id) {
                scene.active = false;
            }
        }

        // Activate new scene
        if let Some(scene) = self.scenes.get_mut(scene_id) {
            scene.active = true;
        }

        self.scene_history.push(scene_id.to_string());
        self.active_scene_id = Some(scene_id.to_string());

        log::info!("[SceneManager] Activated scene: {}", scene_id);
        Ok(())
    }

    pub fn active_scene(&self) -> Option<&Scene> {
        self.active_scene_id
            .as_ref()
            .and_then(|id| self.scenes.get(id))
    }

    pub fn active_scene_mut(&mut self) -> Option<&mut Scene> {
        if let Some(id) = self.active_scene_id.clone() {
            self.scenes.get_mut(&id)
        } else {
            None
        }
    }

    pub fn active_scene_id(&self) -> Option<String> {
        self.active_scene_id.clone()
    }

    pub fn scene_count(&self) -> usize {
        self.scenes.len()
    }

    pub fn get_scene(&self, scene_id: &str) -> Option<&Scene> {
        self.scenes.get(scene_id)
    }

    pub fn list_scenes(&self) -> Vec<SceneInfo> {
        self.scenes
            .values()
            .map(|s| SceneInfo {
                id: s.id.clone(),
                name: s.name.clone(),
                entity_count: s.entity_count(),
                active: s.active,
                created_at: s.created_at,
            })
            .collect()
    }

    pub async fn add_entity(&mut self, entity: Entity) -> RealityResult<String> {
        let scene = self
            .active_scene_mut()
            .ok_or_else(|| RealityError::Scene("No active scene".to_string()))?;

        Ok(scene.add_entity(entity))
    }

    pub async fn remove_entity(&mut self, entity_id: &str) -> RealityResult<()> {
        let scene = self
            .active_scene_mut()
            .ok_or_else(|| RealityError::Scene("No active scene".to_string()))?;

        scene
            .remove_entity(entity_id)
            .ok_or_else(|| RealityError::Scene(format!("Entity not found: {}", entity_id)))?;

        Ok(())
    }

    pub async fn update_entity_transform(
        &mut self,
        entity_id: &str,
        transform: Transform,
    ) -> RealityResult<()> {
        let scene = self
            .active_scene_mut()
            .ok_or_else(|| RealityError::Scene("No active scene".to_string()))?;

        let entity = scene
            .get_entity_mut(entity_id)
            .ok_or_else(|| RealityError::Scene(format!("Entity not found: {}", entity_id)))?;

        entity.transform = transform;
        Ok(())
    }
}

impl Default for SceneManager {
    fn default() -> Self {
        Self::new()
    }
}

/// Info résumée d'une scène
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SceneInfo {
    pub id: String,
    pub name: String,
    pub entity_count: usize,
    pub active: bool,
    pub created_at: u64,
}
