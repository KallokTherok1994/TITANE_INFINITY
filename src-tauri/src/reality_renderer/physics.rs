//! ═══════════════════════════════════════════════════════════════════════════
//! TITANE∞ v∞ — PHYSICS ENGINE
//! Simulation physique avec corps rigides et collisions
//! ═══════════════════════════════════════════════════════════════════════════

use super::{RealityResult, Vec3};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Type de corps rigide
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum RigidBodyType {
    Static,
    Dynamic,
    Kinematic,
}

/// Corps physique
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhysicsBody {
    pub id: String,
    pub entity_id: String,
    pub body_type: RigidBodyType,
    pub mass: f64,
    pub position: Vec3,
    pub velocity: Vec3,
    pub acceleration: Vec3,
    pub angular_velocity: Vec3,
    pub friction: f64,
    pub restitution: f64,
    pub gravity_scale: f64,
    pub is_sleeping: bool,
    pub collision_layer: u32,
    pub collision_mask: u32,
}

impl PhysicsBody {
    pub fn new(entity_id: &str, body_type: RigidBodyType) -> Self {
        Self {
            id: format!("body-{}", uuid::Uuid::new_v4()),
            entity_id: entity_id.to_string(),
            body_type,
            mass: 1.0,
            position: Vec3::zero(),
            velocity: Vec3::zero(),
            acceleration: Vec3::zero(),
            angular_velocity: Vec3::zero(),
            friction: 0.5,
            restitution: 0.3,
            gravity_scale: 1.0,
            is_sleeping: false,
            collision_layer: 1,
            collision_mask: u32::MAX,
        }
    }

    pub fn apply_force(&mut self, force: Vec3) {
        if self.body_type == RigidBodyType::Dynamic {
            self.acceleration.x += force.x / self.mass;
            self.acceleration.y += force.y / self.mass;
            self.acceleration.z += force.z / self.mass;
            self.is_sleeping = false;
        }
    }

    pub fn apply_impulse(&mut self, impulse: Vec3) {
        if self.body_type == RigidBodyType::Dynamic {
            self.velocity.x += impulse.x / self.mass;
            self.velocity.y += impulse.y / self.mass;
            self.velocity.z += impulse.z / self.mass;
            self.is_sleeping = false;
        }
    }
}

/// Forme de collision
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ColliderShape {
    Sphere { radius: f64 },
    Box { half_extents: Vec3 },
    Capsule { radius: f64, height: f64 },
    Cylinder { radius: f64, height: f64 },
    Mesh { vertices: Vec<Vec3> },
}

/// Collider
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Collider {
    pub id: String,
    pub body_id: String,
    pub shape: ColliderShape,
    pub offset: Vec3,
    pub is_trigger: bool,
}

/// Résultat de collision
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CollisionResult {
    pub body_a_id: String,
    pub body_b_id: String,
    pub contact_point: Vec3,
    pub contact_normal: Vec3,
    pub penetration_depth: f64,
}

/// Configuration physique
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhysicsConfig {
    pub gravity: Vec3,
    pub time_step: f64,
    pub velocity_iterations: u32,
    pub position_iterations: u32,
    pub sleep_threshold: f64,
    pub continuous_collision: bool,
}

impl Default for PhysicsConfig {
    fn default() -> Self {
        Self {
            gravity: Vec3::new(0.0, -9.81, 0.0),
            time_step: 1.0 / 60.0,
            velocity_iterations: 8,
            position_iterations: 3,
            sleep_threshold: 0.01,
            continuous_collision: false,
        }
    }
}

/// Moteur physique
pub struct PhysicsEngine {
    bodies: HashMap<String, PhysicsBody>,
    colliders: HashMap<String, Collider>,
    config: PhysicsConfig,
    active: bool,
    simulation_time: f64,
    step_count: u64,
}

impl PhysicsEngine {
    pub fn new() -> Self {
        Self {
            bodies: HashMap::new(),
            colliders: HashMap::new(),
            config: PhysicsConfig::default(),
            active: false,
            simulation_time: 0.0,
            step_count: 0,
        }
    }

    pub async fn initialize(&mut self) -> RealityResult<()> {
        log::info!("[PhysicsEngine] Initializing...");
        self.active = true;
        log::info!("[PhysicsEngine] ✅ Initialized");
        Ok(())
    }

    pub async fn step(&mut self, delta_time: f64) -> RealityResult<()> {
        if !self.active {
            return Ok(());
        }

        let dt = delta_time.min(self.config.time_step * 4.0); // Clamp to prevent explosion

        // Apply gravity to dynamic bodies
        for body in self.bodies.values_mut() {
            if body.body_type == RigidBodyType::Dynamic && !body.is_sleeping {
                // Apply gravity
                body.acceleration.x += self.config.gravity.x * body.gravity_scale;
                body.acceleration.y += self.config.gravity.y * body.gravity_scale;
                body.acceleration.z += self.config.gravity.z * body.gravity_scale;

                // Integrate velocity
                body.velocity.x += body.acceleration.x * dt;
                body.velocity.y += body.acceleration.y * dt;
                body.velocity.z += body.acceleration.z * dt;

                // Integrate position
                body.position.x += body.velocity.x * dt;
                body.position.y += body.velocity.y * dt;
                body.position.z += body.velocity.z * dt;

                // Reset acceleration
                body.acceleration = Vec3::zero();

                // Apply damping
                let damping = 0.99;
                body.velocity.x *= damping;
                body.velocity.y *= damping;
                body.velocity.z *= damping;

                // Sleep check
                let speed = body.velocity.magnitude();
                if speed < self.config.sleep_threshold {
                    body.is_sleeping = true;
                }
            }
        }

        // Detect and resolve collisions (simplified)
        // In a real implementation, this would use a broad phase + narrow phase

        self.simulation_time += dt;
        self.step_count += 1;

        Ok(())
    }

    pub fn add_body(&mut self, body: PhysicsBody) -> String {
        let id = body.id.clone();
        self.bodies.insert(id.clone(), body);
        id
    }

    pub fn remove_body(&mut self, body_id: &str) -> Option<PhysicsBody> {
        // Remove associated colliders
        self.colliders.retain(|_, c| c.body_id != body_id);
        self.bodies.remove(body_id)
    }

    pub fn get_body(&self, body_id: &str) -> Option<&PhysicsBody> {
        self.bodies.get(body_id)
    }

    pub fn get_body_mut(&mut self, body_id: &str) -> Option<&mut PhysicsBody> {
        self.bodies.get_mut(body_id)
    }

    pub fn add_collider(&mut self, collider: Collider) -> String {
        let id = collider.id.clone();
        self.colliders.insert(id.clone(), collider);
        id
    }

    pub fn set_config(&mut self, config: PhysicsConfig) {
        self.config = config;
    }

    pub fn get_config(&self) -> &PhysicsConfig {
        &self.config
    }

    pub fn body_count(&self) -> usize {
        self.bodies.len()
    }

    pub fn is_active(&self) -> bool {
        self.active
    }

    pub fn get_stats(&self) -> PhysicsStats {
        PhysicsStats {
            body_count: self.bodies.len(),
            collider_count: self.colliders.len(),
            dynamic_bodies: self.bodies.values().filter(|b| b.body_type == RigidBodyType::Dynamic).count(),
            sleeping_bodies: self.bodies.values().filter(|b| b.is_sleeping).count(),
            simulation_time: self.simulation_time,
            step_count: self.step_count,
        }
    }
}

impl Default for PhysicsEngine {
    fn default() -> Self {
        Self::new()
    }
}

/// Statistiques physique
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhysicsStats {
    pub body_count: usize,
    pub collider_count: usize,
    pub dynamic_bodies: usize,
    pub sleeping_bodies: usize,
    pub simulation_time: f64,
    pub step_count: u64,
}
