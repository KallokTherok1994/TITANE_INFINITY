use std::collections::HashMap;

pub struct DeepStructMemory {
    patterns: HashMap<String, f32>,
}
impl DeepStructMemory {
    pub fn new() -> Self {
        Self {
            patterns: HashMap::new(),
        }
    }
    
    pub fn store_pattern(&mut self, key: String, value: f32) {
        self.patterns.insert(key, value);
    pub fn recall_pattern(&self, key: &str) -> Option<f32> {
        self.patterns.get(key).copied()
