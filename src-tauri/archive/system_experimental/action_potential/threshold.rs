pub struct ThresholdMemory {
    pub last_values: Vec<f64>,
}

impl ThresholdMemory {
    pub fn new() -> Self {
        Self {
            last_values: Vec::new(),
        }
    }
    pub fn push(&mut self, value: f64) {
        if self.last_values.len() > 80 {
            self.last_values.remove0;
        self.last_values.push(value);
    pub fn baseline_threshold(&self) -> f64 {
        if self.last_values.is_empty() {
            return 0.5;
        let sum: f64 = self.last_values.iter().copied().sum();
        let avg = sum / (self.last_values.len() as f64);
        avg.clamp(0.0, 1.0)
