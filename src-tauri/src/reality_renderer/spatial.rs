//! ═══════════════════════════════════════════════════════════════════════════
//! TITANE∞ v∞ — SPATIAL SYSTEM
//! Système spatial avec partitionnement et requêtes
//! ═══════════════════════════════════════════════════════════════════════════

use super::{RealityResult, Vec3};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Bounding Box Axis-Aligned
#[derive(Debug, Clone, Copy, Serialize, Deserialize, Default)]
pub struct AABB {
    pub min: Vec3,
    pub max: Vec3,
}

impl AABB {
    pub fn new(min: Vec3, max: Vec3) -> Self {
        Self { min, max }
    }

    pub fn from_center_size(center: Vec3, size: Vec3) -> Self {
        Self {
            min: Vec3::new(
                center.x - size.x / 2.0,
                center.y - size.y / 2.0,
                center.z - size.z / 2.0,
            ),
            max: Vec3::new(
                center.x + size.x / 2.0,
                center.y + size.y / 2.0,
                center.z + size.z / 2.0,
            ),
        }
    }

    pub fn center(&self) -> Vec3 {
        Vec3::new(
            (self.min.x + self.max.x) / 2.0,
            (self.min.y + self.max.y) / 2.0,
            (self.min.z + self.max.z) / 2.0,
        )
    }

    pub fn size(&self) -> Vec3 {
        Vec3::new(
            self.max.x - self.min.x,
            self.max.y - self.min.y,
            self.max.z - self.min.z,
        )
    }

    pub fn contains_point(&self, point: &Vec3) -> bool {
        point.x >= self.min.x
            && point.x <= self.max.x
            && point.y >= self.min.y
            && point.y <= self.max.y
            && point.z >= self.min.z
            && point.z <= self.max.z
    }

    pub fn intersects(&self, other: &AABB) -> bool {
        self.min.x <= other.max.x
            && self.max.x >= other.min.x
            && self.min.y <= other.max.y
            && self.max.y >= other.min.y
            && self.min.z <= other.max.z
            && self.max.z >= other.min.z
    }
}

/// Cellule spatiale
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpatialCell {
    pub id: String,
    pub bounds: AABB,
    pub entity_ids: Vec<String>,
    pub cell_index: (i32, i32, i32),
}

impl SpatialCell {
    pub fn new(index: (i32, i32, i32), cell_size: f64) -> Self {
        let min = Vec3::new(
            index.0 as f64 * cell_size,
            index.1 as f64 * cell_size,
            index.2 as f64 * cell_size,
        );
        let max = Vec3::new(
            min.x + cell_size,
            min.y + cell_size,
            min.z + cell_size,
        );

        Self {
            id: format!("cell-{}-{}-{}", index.0, index.1, index.2),
            bounds: AABB::new(min, max),
            entity_ids: Vec::new(),
            cell_index: index,
        }
    }
}

/// Entrée spatiale pour une entité
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpatialEntry {
    pub entity_id: String,
    pub position: Vec3,
    pub bounds: AABB,
    pub cell_indices: Vec<(i32, i32, i32)>,
}

/// Configuration du système spatial
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpatialConfig {
    pub cell_size: f64,
    pub world_min: Vec3,
    pub world_max: Vec3,
    pub max_entities_per_cell: usize,
    pub dynamic_subdivision: bool,
}

impl Default for SpatialConfig {
    fn default() -> Self {
        Self {
            cell_size: 100.0,
            world_min: Vec3::new(-10000.0, -1000.0, -10000.0),
            world_max: Vec3::new(10000.0, 1000.0, 10000.0),
            max_entities_per_cell: 100,
            dynamic_subdivision: false,
        }
    }
}

/// Système spatial (grille uniforme)
pub struct SpatialSystem {
    cells: HashMap<(i32, i32, i32), SpatialCell>,
    entries: HashMap<String, SpatialEntry>,
    config: SpatialConfig,
    active: bool,
    query_count: u64,
}

impl SpatialSystem {
    pub fn new() -> Self {
        Self {
            cells: HashMap::new(),
            entries: HashMap::new(),
            config: SpatialConfig::default(),
            active: false,
            query_count: 0,
        }
    }

    pub async fn initialize(&mut self) -> RealityResult<()> {
        log::info!("[SpatialSystem] Initializing with cell size: {}", self.config.cell_size);
        self.active = true;
        log::info!("[SpatialSystem] ✅ Initialized");
        Ok(())
    }

    pub async fn update(&mut self) -> RealityResult<()> {
        if !self.active {
            return Ok(());
        }
        // Update spatial indices as needed
        Ok(())
    }

    fn position_to_cell_index(&self, position: &Vec3) -> (i32, i32, i32) {
        (
            (position.x / self.config.cell_size).floor() as i32,
            (position.y / self.config.cell_size).floor() as i32,
            (position.z / self.config.cell_size).floor() as i32,
        )
    }

    fn bounds_to_cell_indices(&self, bounds: &AABB) -> Vec<(i32, i32, i32)> {
        let min_idx = self.position_to_cell_index(&bounds.min);
        let max_idx = self.position_to_cell_index(&bounds.max);

        let mut indices = Vec::new();
        for x in min_idx.0..=max_idx.0 {
            for y in min_idx.1..=max_idx.1 {
                for z in min_idx.2..=max_idx.2 {
                    indices.push((x, y, z));
                }
            }
        }
        indices
    }

    pub fn insert(&mut self, entity_id: &str, position: Vec3, bounds: AABB) {
        let cell_indices = self.bounds_to_cell_indices(&bounds);

        // Create or update cells
        for &idx in &cell_indices {
            let cell = self
                .cells
                .entry(idx)
                .or_insert_with(|| SpatialCell::new(idx, self.config.cell_size));
            if !cell.entity_ids.contains(&entity_id.to_string()) {
                cell.entity_ids.push(entity_id.to_string());
            }
        }

        // Store entry
        self.entries.insert(
            entity_id.to_string(),
            SpatialEntry {
                entity_id: entity_id.to_string(),
                position,
                bounds,
                cell_indices,
            },
        );
    }

    pub fn remove(&mut self, entity_id: &str) {
        if let Some(entry) = self.entries.remove(entity_id) {
            for idx in entry.cell_indices {
                if let Some(cell) = self.cells.get_mut(&idx) {
                    cell.entity_ids.retain(|id| id != entity_id);
                }
            }
        }
    }

    pub fn update_position(&mut self, entity_id: &str, new_position: Vec3, new_bounds: AABB) {
        self.remove(entity_id);
        self.insert(entity_id, new_position, new_bounds);
    }

    pub fn query_point(&mut self, point: &Vec3) -> Vec<String> {
        self.query_count += 1;
        let idx = self.position_to_cell_index(point);

        self.cells
            .get(&idx)
            .map(|cell| cell.entity_ids.clone())
            .unwrap_or_default()
    }

    pub fn query_bounds(&mut self, bounds: &AABB) -> Vec<String> {
        self.query_count += 1;
        let indices = self.bounds_to_cell_indices(bounds);

        let mut result: Vec<String> = Vec::new();
        for idx in indices {
            if let Some(cell) = self.cells.get(&idx) {
                for entity_id in &cell.entity_ids {
                    if let Some(entry) = self.entries.get(entity_id) {
                        if entry.bounds.intersects(bounds) && !result.contains(entity_id) {
                            result.push(entity_id.clone());
                        }
                    }
                }
            }
        }

        result
    }

    pub fn query_radius(&mut self, center: &Vec3, radius: f64) -> Vec<String> {
        self.query_count += 1;
        let bounds = AABB::from_center_size(
            *center,
            Vec3::new(radius * 2.0, radius * 2.0, radius * 2.0),
        );

        let candidates = self.query_bounds(&bounds);
        let radius_sq = radius * radius;

        candidates
            .into_iter()
            .filter(|id| {
                if let Some(entry) = self.entries.get(id) {
                    let dx = entry.position.x - center.x;
                    let dy = entry.position.y - center.y;
                    let dz = entry.position.z - center.z;
                    dx * dx + dy * dy + dz * dz <= radius_sq
                } else {
                    false
                }
            })
            .collect()
    }

    pub fn raycast(&mut self, origin: &Vec3, direction: &Vec3, max_distance: f64) -> Vec<RaycastHit> {
        self.query_count += 1;
        let mut hits = Vec::new();

        // Simple raycast through cells
        let dir_normalized = direction.normalize();
        let step_size = self.config.cell_size / 2.0;
        let steps = (max_distance / step_size) as i32;

        let mut checked_entities = Vec::new();

        for i in 0..steps {
            let t = i as f64 * step_size;
            let point = Vec3::new(
                origin.x + dir_normalized.x * t,
                origin.y + dir_normalized.y * t,
                origin.z + dir_normalized.z * t,
            );

            let idx = self.position_to_cell_index(&point);
            if let Some(cell) = self.cells.get(&idx) {
                for entity_id in &cell.entity_ids {
                    if !checked_entities.contains(entity_id) {
                        checked_entities.push(entity_id.clone());
                        if let Some(entry) = self.entries.get(entity_id) {
                            // Simple AABB ray intersection test
                            if self.ray_intersects_aabb(origin, &dir_normalized, &entry.bounds) {
                                hits.push(RaycastHit {
                                    entity_id: entity_id.clone(),
                                    distance: t,
                                    point,
                                    normal: Vec3::zero(), // Simplified
                                });
                            }
                        }
                    }
                }
            }
        }

        hits.sort_by(|a, b| a.distance.partial_cmp(&b.distance).unwrap_or(std::cmp::Ordering::Equal));
        hits
    }

    fn ray_intersects_aabb(&self, origin: &Vec3, direction: &Vec3, aabb: &AABB) -> bool {
        let inv_dir = Vec3::new(1.0 / direction.x, 1.0 / direction.y, 1.0 / direction.z);

        let t1 = (aabb.min.x - origin.x) * inv_dir.x;
        let t2 = (aabb.max.x - origin.x) * inv_dir.x;
        let t3 = (aabb.min.y - origin.y) * inv_dir.y;
        let t4 = (aabb.max.y - origin.y) * inv_dir.y;
        let t5 = (aabb.min.z - origin.z) * inv_dir.z;
        let t6 = (aabb.max.z - origin.z) * inv_dir.z;

        let tmin = t1.min(t2).max(t3.min(t4)).max(t5.min(t6));
        let tmax = t1.max(t2).min(t3.max(t4)).min(t5.max(t6));

        tmax >= 0.0 && tmin <= tmax
    }

    pub fn get_stats(&self) -> SpatialStats {
        SpatialStats {
            cell_count: self.cells.len(),
            entry_count: self.entries.len(),
            query_count: self.query_count,
            avg_entities_per_cell: if self.cells.is_empty() {
                0.0
            } else {
                self.entries.len() as f64 / self.cells.len() as f64
            },
        }
    }

    pub fn set_config(&mut self, config: SpatialConfig) {
        self.config = config;
        // Rebuild grid would be needed here
    }
}

impl Default for SpatialSystem {
    fn default() -> Self {
        Self::new()
    }
}

/// Résultat de raycast
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RaycastHit {
    pub entity_id: String,
    pub distance: f64,
    pub point: Vec3,
    pub normal: Vec3,
}

/// Statistiques spatiales
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpatialStats {
    pub cell_count: usize,
    pub entry_count: usize,
    pub query_count: u64,
    pub avg_entities_per_cell: f64,
}
