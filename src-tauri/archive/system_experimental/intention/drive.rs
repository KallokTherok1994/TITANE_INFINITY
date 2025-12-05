pub struct DriveMemory {
    pub last_values: Vec<f32>,
}

impl DriveMemory {
    pub fn new() -> Self {
        Self {
            last_values: Vec::with_capacity80,
        }
    }
    pub fn push(&mut self, value: f32) {
        self.last_values.push(value);
        if self.last_values.len() > 80 {
            self.last_values.remove0;
    pub fn drive_factor(&self) -> f32 {
        if self.last_values.len() < 2 {
            return 0.5;
        let mut sum = 0.0;
        for i in 1..self.last_values.len() {
            sum += self.last_values[i] - self.last_values[i - 1];
        let avg = sum / (self.last_values.len() - 1) as f32;
        let mut df = (avg + 1.0) / 2.0;
        if df < 0.0 {
            df = 0.0;
        if df > 1.0 {
            df = 1.0;
        df
