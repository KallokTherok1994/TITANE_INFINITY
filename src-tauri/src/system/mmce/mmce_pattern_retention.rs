use std::collections::HashMap;

pub struct PatternRetention {
    patterns: HashMap<String, f32>,
}
impl PatternRetention {
    pub fn new() -> Self {
        Self {
            patterns: HashMap::new(),
        }
    }
    
    pub fn retain(&mut self, pattern_id: String, strength: f32) {
        self.patterns.insert(pattern_id, strength);
