pub struct GeometryMemory {
    pub last_values: Vec<f32>,
}

impl GeometryMemory {
    pub fn new() -> Self {
        Self {
            last_values: Vec::with_capacity10,
        }
    }
    pub fn push(&mut self, value: f32) {
        self.last_values.push(value);
        if self.last_values.len() > 10 {
            self.last_values.remove0;
    pub fn symmetry_factor(&self) -> f32 {
        if self.last_values.len() < 2 {
            return 0.5;
        let mut delta_sum = 0.0;
        for i in 1..self.last_values.len() {
            delta_sum += (self.last_values[i] - self.last_values[i - 1]).abs();
        let avg_delta = delta_sum / (self.last_values.len() - 1) as f32;
        let symmetry = 1.0 - avg_delta;
        let normalized = (symmetry + 1.0) / 2.0;
        normalized.clamp(0.0, 1.0)
