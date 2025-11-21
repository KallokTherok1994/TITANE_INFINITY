pub struct RegulationProfileMemory {
    pub last_values: Vec<f32>,
}

impl RegulationProfileMemory {
    pub fn new() -> Self {
        Self {
            last_values: Vec::with_capacity100,
        }
    }
    pub fn push(&mut self, value: f32) {
        self.last_values.push(value);
        if self.last_values.len() > 100 {
            self.last_values.remove0;
    pub fn profile_stability(&self) -> f32 {
        if self.last_values.len() < 2 {
            return 0.5;
        let mut sum_delta = 0.0;
        for i in 1..self.last_values.len() {
            let delta = (self.last_values[i] - self.last_values[i - 1]).abs();
            sum_delta += delta;
        let avg_delta = sum_delta / (self.last_values.len() - 1) as f32;
        let mut stability = 1.0 - avg_delta;
        if stability < 0.0 {
            stability = 0.0;
        if stability > 1.0 {
            stability = 1.0;
        stability
