// TITANE∞ v12 - Nexus Module
// Communication hub between AI systems and internal modules

use super::ModuleStatus;
use log::info;
use std::collections::HashMap;

pub struct Nexus {
    active: bool,
    health: f32,
    connections: HashMap<String, ConnectionState>,
}

#[derive(Debug, Clone)]
pub enum ConnectionState {
    Connected,
    Disconnected,
    Degraded,
}

impl Nexus {
    pub fn new() -> Self {
        info!("Nexus communication hub initialized");
        Self {
            active: true,
            health: 1.0,
            connections: HashMap::new(),
        }
    }

    pub fn register_connection(&mut self, name: String, state: ConnectionState) {
        self.connections.insert(name, state);
    }

    pub fn get_connection_state(&self, name: &str) -> Option<ConnectionState> {
        self.connections.get(name).cloned()
    }

    pub fn route_message(&self, from: &str, to: &str, message: &str) -> RoutingResult {
        if !self.active {
            return RoutingResult {
                success: false,
                latency_ms: 0,
                error: Some("Nexus inactive".to_string()),
            };
        }

        // Check if destination is available
        if let Some(ConnectionState::Disconnected) = self.connections.get(to) {
            return RoutingResult {
                success: false,
                latency_ms: 0,
                error: Some(format!("Destination {} disconnected", to)),
            };
        }

        info!("Routing message from {} to {}", from, to);

        RoutingResult {
            success: true,
            latency_ms: 10,
            error: None,
        }
    }

    pub fn broadcast(&self, message: &str) -> BroadcastResult {
        let mut delivered = Vec::new();
        let mut failed = Vec::new();

        for (name, state) in &self.connections {
            match state {
                ConnectionState::Connected | ConnectionState::Degraded => {
                    delivered.push(name.clone());
                }
                ConnectionState::Disconnected => {
                    failed.push(name.clone());
                }
            }
        }

        BroadcastResult { delivered, failed }
    }

    pub fn get_status(&self) -> ModuleStatus {
        ModuleStatus {
            name: "Nexus".to_string(),
            active: self.active,
            health: self.health,
            last_check: chrono::Utc::now().timestamp(),
        }
    }

    pub fn get_all_connections(&self) -> Vec<(String, ConnectionState)> {
        self.connections
            .iter()
            .map(|(k, v)| (k.clone(), v.clone()))
            .collect()
    }
}

impl Default for Nexus {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone)]
pub struct RoutingResult {
    pub success: bool,
    pub latency_ms: u64,
    pub error: Option<String>,
}

#[derive(Debug, Clone)]
pub struct BroadcastResult {
    pub delivered: Vec<String>,
    pub failed: Vec<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_nexus_creation() {
        let nexus = Nexus::new();
        assert!(nexus.active);
    }

    #[test]
    fn test_register_connection() {
        let mut nexus = Nexus::new();
        nexus.register_connection("AI1".to_string(), ConnectionState::Connected);
        assert!(nexus.get_connection_state("AI1").is_some());
    }

    #[test]
    fn test_routing() {
        let mut nexus = Nexus::new();
        nexus.register_connection("Sender".to_string(), ConnectionState::Connected);
        nexus.register_connection("Receiver".to_string(), ConnectionState::Connected);

        let result = nexus.route_message("Sender", "Receiver", "test");
        assert!(result.success);
    }
}
