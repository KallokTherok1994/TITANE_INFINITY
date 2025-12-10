//! ═══════════════════════════════════════════════════════════════════════════
//! TITANE∞ v∞ — LIGHTING SYSTEM
//! Système d'éclairage avec lumières et ombres
//! ═══════════════════════════════════════════════════════════════════════════

use super::{RealityError, RealityResult, Vec3};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Type de lumière
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum LightType {
    Directional,
    Point,
    Spot,
    Area,
    Ambient,
}

/// Couleur RGB
#[derive(Debug, Clone, Copy, Serialize, Deserialize, Default)]
pub struct Color {
    pub r: f32,
    pub g: f32,
    pub b: f32,
    pub a: f32,
}

impl Color {
    pub fn new(r: f32, g: f32, b: f32) -> Self {
        Self { r, g, b, a: 1.0 }
    }

    pub fn white() -> Self {
        Self::new(1.0, 1.0, 1.0)
    }

    pub fn black() -> Self {
        Self::new(0.0, 0.0, 0.0)
    }

    pub fn from_hex(hex: u32) -> Self {
        Self {
            r: ((hex >> 16) & 0xFF) as f32 / 255.0,
            g: ((hex >> 8) & 0xFF) as f32 / 255.0,
            b: (hex & 0xFF) as f32 / 255.0,
            a: 1.0,
        }
    }
}

/// Configuration de lumière
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Light {
    pub id: String,
    pub name: String,
    pub light_type: LightType,
    pub position: Vec3,
    pub direction: Vec3,
    pub color: Color,
    pub intensity: f32,
    pub range: f32,
    pub inner_cone_angle: f32,
    pub outer_cone_angle: f32,
    pub cast_shadows: bool,
    pub shadow_resolution: u32,
    pub shadow_bias: f32,
    pub enabled: bool,
    pub layer_mask: u32,
}

impl Light {
    pub fn directional(name: &str, direction: Vec3) -> Self {
        Self {
            id: format!("light-{}", uuid::Uuid::new_v4()),
            name: name.to_string(),
            light_type: LightType::Directional,
            position: Vec3::zero(),
            direction: direction.normalize(),
            color: Color::white(),
            intensity: 1.0,
            range: f32::INFINITY,
            inner_cone_angle: 0.0,
            outer_cone_angle: 0.0,
            cast_shadows: true,
            shadow_resolution: 2048,
            shadow_bias: 0.001,
            enabled: true,
            layer_mask: u32::MAX,
        }
    }

    pub fn point(name: &str, position: Vec3, range: f32) -> Self {
        Self {
            id: format!("light-{}", uuid::Uuid::new_v4()),
            name: name.to_string(),
            light_type: LightType::Point,
            position,
            direction: Vec3::zero(),
            color: Color::white(),
            intensity: 1.0,
            range,
            inner_cone_angle: 0.0,
            outer_cone_angle: 0.0,
            cast_shadows: true,
            shadow_resolution: 1024,
            shadow_bias: 0.001,
            enabled: true,
            layer_mask: u32::MAX,
        }
    }

    pub fn spot(name: &str, position: Vec3, direction: Vec3, angle: f32) -> Self {
        Self {
            id: format!("light-{}", uuid::Uuid::new_v4()),
            name: name.to_string(),
            light_type: LightType::Spot,
            position,
            direction: direction.normalize(),
            color: Color::white(),
            intensity: 1.0,
            range: 50.0,
            inner_cone_angle: angle * 0.8,
            outer_cone_angle: angle,
            cast_shadows: true,
            shadow_resolution: 1024,
            shadow_bias: 0.001,
            enabled: true,
            layer_mask: u32::MAX,
        }
    }

    pub fn ambient(intensity: f32) -> Self {
        Self {
            id: format!("light-{}", uuid::Uuid::new_v4()),
            name: "Ambient Light".to_string(),
            light_type: LightType::Ambient,
            position: Vec3::zero(),
            direction: Vec3::zero(),
            color: Color::white(),
            intensity,
            range: f32::INFINITY,
            inner_cone_angle: 0.0,
            outer_cone_angle: 0.0,
            cast_shadows: false,
            shadow_resolution: 0,
            shadow_bias: 0.0,
            enabled: true,
            layer_mask: u32::MAX,
        }
    }
}

/// Configuration du système d'éclairage
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LightingConfig {
    pub ambient_intensity: f32,
    pub ambient_color: Color,
    pub environment_intensity: f32,
    pub shadows_enabled: bool,
    pub soft_shadows: bool,
    pub shadow_distance: f32,
    pub max_shadow_cascades: u32,
    pub reflection_probes_enabled: bool,
    pub global_illumination: bool,
}

impl Default for LightingConfig {
    fn default() -> Self {
        Self {
            ambient_intensity: 0.3,
            ambient_color: Color::new(0.5, 0.5, 0.6),
            environment_intensity: 1.0,
            shadows_enabled: true,
            soft_shadows: true,
            shadow_distance: 100.0,
            max_shadow_cascades: 4,
            reflection_probes_enabled: true,
            global_illumination: false,
        }
    }
}

/// Système d'éclairage
pub struct LightingSystem {
    lights: HashMap<String, Light>,
    config: LightingConfig,
    active: bool,
    shadow_map_updates: u64,
}

impl LightingSystem {
    pub fn new() -> Self {
        Self {
            lights: HashMap::new(),
            config: LightingConfig::default(),
            active: false,
            shadow_map_updates: 0,
        }
    }

    pub async fn initialize(&mut self) -> RealityResult<()> {
        log::info!("[LightingSystem] Initializing...");

        // Create default lights
        let sun = Light::directional("Sun", Vec3::new(-0.5, -1.0, -0.3));
        self.lights.insert(sun.id.clone(), sun);

        let ambient = Light::ambient(0.2);
        self.lights.insert(ambient.id.clone(), ambient);

        self.active = true;
        log::info!(
            "[LightingSystem] ✅ Initialized with {} lights",
            self.lights.len()
        );
        Ok(())
    }

    pub async fn update(&mut self) -> RealityResult<()> {
        if !self.active {
            return Ok(());
        }

        // Update shadow maps for shadow-casting lights
        for light in self.lights.values() {
            if light.enabled && light.cast_shadows {
                self.shadow_map_updates += 1;
            }
        }

        Ok(())
    }

    pub fn add_light(&mut self, light: Light) -> String {
        let id = light.id.clone();
        log::debug!("[LightingSystem] Adding light: {} ({})", light.name, id);
        self.lights.insert(id.clone(), light);
        id
    }

    pub fn remove_light(&mut self, light_id: &str) -> Option<Light> {
        self.lights.remove(light_id)
    }

    pub fn get_light(&self, light_id: &str) -> Option<&Light> {
        self.lights.get(light_id)
    }

    pub fn get_light_mut(&mut self, light_id: &str) -> Option<&mut Light> {
        self.lights.get_mut(light_id)
    }

    pub fn set_light_intensity(&mut self, light_id: &str, intensity: f32) -> RealityResult<()> {
        let light = self
            .lights
            .get_mut(light_id)
            .ok_or_else(|| RealityError::Lighting(format!("Light not found: {}", light_id)))?;
        light.intensity = intensity;
        Ok(())
    }

    pub fn set_light_color(&mut self, light_id: &str, color: Color) -> RealityResult<()> {
        let light = self
            .lights
            .get_mut(light_id)
            .ok_or_else(|| RealityError::Lighting(format!("Light not found: {}", light_id)))?;
        light.color = color;
        Ok(())
    }

    pub fn toggle_light(&mut self, light_id: &str, enabled: bool) -> RealityResult<()> {
        let light = self
            .lights
            .get_mut(light_id)
            .ok_or_else(|| RealityError::Lighting(format!("Light not found: {}", light_id)))?;
        light.enabled = enabled;
        Ok(())
    }

    pub fn light_count(&self) -> usize {
        self.lights.len()
    }

    pub fn active_lights(&self) -> Vec<&Light> {
        self.lights.values().filter(|l| l.enabled).collect()
    }

    pub fn shadow_casting_lights(&self) -> Vec<&Light> {
        self.lights
            .values()
            .filter(|l| l.enabled && l.cast_shadows)
            .collect()
    }

    pub fn set_config(&mut self, config: LightingConfig) {
        self.config = config;
    }

    pub fn get_config(&self) -> &LightingConfig {
        &self.config
    }

    pub fn list_lights(&self) -> Vec<LightInfo> {
        self.lights
            .values()
            .map(|l| LightInfo {
                id: l.id.clone(),
                name: l.name.clone(),
                light_type: l.light_type,
                intensity: l.intensity,
                enabled: l.enabled,
                cast_shadows: l.cast_shadows,
            })
            .collect()
    }

    pub fn get_stats(&self) -> LightingStats {
        LightingStats {
            total_lights: self.lights.len(),
            active_lights: self.lights.values().filter(|l| l.enabled).count(),
            shadow_casting_lights: self.shadow_casting_lights().len(),
            shadow_map_updates: self.shadow_map_updates,
        }
    }
}

impl Default for LightingSystem {
    fn default() -> Self {
        Self::new()
    }
}

/// Info résumée d'une lumière
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LightInfo {
    pub id: String,
    pub name: String,
    pub light_type: LightType,
    pub intensity: f32,
    pub enabled: bool,
    pub cast_shadows: bool,
}

/// Statistiques d'éclairage
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LightingStats {
    pub total_lights: usize,
    pub active_lights: usize,
    pub shadow_casting_lights: usize,
    pub shadow_map_updates: u64,
}
