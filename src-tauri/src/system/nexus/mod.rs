// TITANE∞ v8.0 - NEXUS Module (Optimized)
// Global cognitive pressure & system aggregation - No unwrap

use crate::shared::types::{CognitiveNode, HealthStatus, ModuleHealth, TitaneResult};
use crate::shared::utils::{clamp, current_timestamp};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
const MODULE_NAME: &str = "Nexus";
/// Nexus module state - Global cognitive pressure
#[derive(Debug)]
pub struct NexusModule {
    pub initialized: bool,
    pub last_update: u64,
    pub cognitive_pressure: f32, // Global cognitive load
    pub system_load: f32,        // Aggregated system state
    pub global_score: f32,       // Overall health score
    nodes: HashMap<String, CognitiveNode>,
    start_time: u64,
}
#[derive(Serialize, Deserialize)]
struct NexusGraph {
    nodes: Vec<CognitiveNode>,
    connections: usize,
}
impl NexusModule {
    /// Initialize Nexus module
    pub fn init() -> TitaneResult<Self> {
        log::info!("🔗 [{}] Initializing cognitive graph", MODULE_NAME);

        let mut nodes = HashMap::new();
        nodes.insert(
            "root".to_string(),
            CognitiveNode {
                id: "root".to_string(),
                node_type: "core".to_string(),
                connections: vec![],
                weight: 1.0,
            },
        );
        Ok(Self {
            initialized: true,
            last_update: current_timestamp(),
            cognitive_pressure: 0.0,
            system_load: 0.0,
            global_score: 100.0,
            nodes,
            start_time: current_timestamp(),
        })
    }

    /// Tick - Update cognitive pressure
    pub fn tick(&mut self) -> TitaneResult<()> {
        self.last_update = current_timestamp();
        // Update cognitive pressure (simulated)
        self.cognitive_pressure = clamp(
            self.cognitive_pressure + ((rand::random::<f32>() - 0.5) * 0.1),
            0.0,
            1.0,
        );
        // Aggregate system load
        self.system_load = (self.cognitive_pressure + self.nodes.len() as f32 * 0.01).min(1.0);
        // Calculate global score
        self.global_score = clamp(100.0 - (self.system_load * 100.0), 0.0, 100.0);
        Ok(())
    }
    /// Get module health
    pub fn health(&self) -> ModuleHealth {
        let current = current_timestamp();
        let uptime = current.saturating_sub(self.start_time);
        let status = if !self.initialized {
            HealthStatus::Offline
        } else if self.global_score < 30.0 {
            HealthStatus::Critical
        } else if self.global_score < 60.0 {
            HealthStatus::Degraded
        } else {
            HealthStatus::Healthy
        };
        ModuleHealth {
            name: MODULE_NAME.to_string(),
            status,
            uptime,
            last_tick: self.last_update,
            message: format!(
                "Nodes: {} | Pressure: {:.1}%",
                self.nodes.len(),
                self.cognitive_pressure * 100.0
            ),
        }
    }
    /// Get graph as JSON string
    pub fn get_graph(&self) -> String {
        let connections = self.nodes.values().map(|n| n.connections.len()).sum();
        let graph = NexusGraph {
            nodes: self.nodes.values().cloned().collect(),
            connections,
        };
        serde_json::to_string(&graph).unwrap_or_else(|_| "{}".to_string())
    }
}
