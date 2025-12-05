pub struct HierarchicalMemory {
    pub instantaneous: Vec<f32>,
    pub episodic: Vec<f32>,
    pub narrative: Vec<f32>,
}

impl HierarchicalMemory {
    pub fn new() -> Self {
        Self {
            instantaneous: Vec::new(),
            episodic: Vec::new(),
            narrative: Vec::new(),
        }
    }
