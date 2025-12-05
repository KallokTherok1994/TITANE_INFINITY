use std::collections::HashMap;

pub struct InterpretationMemory {
    insights: HashMap<String, String>,
}
impl InterpretationMemory {
    pub fn new() -> Self {
        Self {
            insights: HashMap::new(),
        }
    }
    
    pub fn store_insight(&mut self, key: String, interpretation: String) {
        self.insights.insert(key, interpretation);
