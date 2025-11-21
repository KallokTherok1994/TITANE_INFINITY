use std::collections::VecDeque;

pub struct HAOMemory {
    history: VecDeque<f32>,
    max_size: usize,
}
impl HAOMemory {
    pub fn new() -> Self {
        Self {
            history: VecDeque::new(),
            max_size: 100,
        }
    }
    
    pub fn push(&mut self, value: f32) {
        if self.history.len() >= self.max_size {
            self.history.pop_front();
        self.history.push_back(value);
    pub fn average(&self) -> f32 {
        if self.history.is_empty() { return 0.5; }
        let sum: f32 = self.history.iter().sum();
        sum / self.history.len() as f32
