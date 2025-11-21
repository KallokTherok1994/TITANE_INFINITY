use std::collections::VecDeque;

pub struct StateMemory {
    states: VecDeque<f32>,
    max_size: usize,
}
impl StateMemory {
    pub fn new() -> Self {
        Self {
            states: VecDeque::new(),
            max_size: 50,
        }
    }
    
    pub fn record(&mut self, state: f32) {
        if self.states.len() >= self.max_size {
            self.states.pop_front();
        self.states.push_back(state);
