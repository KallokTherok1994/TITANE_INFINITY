// DSE Bridge - Interface inter-modulaire

use std::collections::HashMap;
#[derive(Debug, Clone)]
pub struct DSEBridgeState {
    pub connections: HashMap<String, f32>,
}
impl DSEBridgeState {
    pub fn new() -> Self {
        Self {
            connections: HashMap::new(),
        }
    }
    
    pub fn register_module(&mut self, module_name: String, sync_level: f32) {
        self.connections.insert(module_name, sync_level);
    pub fn get_average_sync(&self) -> f32 {
        if self.connections.is_empty() {
            return 0.5;
        
        let sum: f32 = self.connections.values().sum();
        sum / self.connections.len() as f32
