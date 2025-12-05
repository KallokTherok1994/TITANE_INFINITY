pub struct TrendMemory {
    pub last_values: Vec<f32>,
}

impl TrendMemory {
    pub fn new() -> Self {
        Self {
            last_values: Vec::with_capacity60,
        }
    }
    pub fn push(&mut self, value: f32) {
        self.last_values.push(value);
        if self.last_values.len() > 60 {
            self.last_values.remove0;
    pub fn trend_factor(&self) -> f32 {
        if self.last_values.len() < 2 {
            return 0.5;
        let mut deltas = 0.0;
        for i in 1..self.last_values.len() {
            deltas += self.last_values[i] - self.last_values[i - 1];
        let trend = deltas / (self.last_values.len() - 1) as f32;
        let mut tf = (trend + 1.0) / 2.0;
        if tf < 0.0 {
            tf = 0.0;
        if tf > 1.0 {
            tf = 1.0;
        tf
