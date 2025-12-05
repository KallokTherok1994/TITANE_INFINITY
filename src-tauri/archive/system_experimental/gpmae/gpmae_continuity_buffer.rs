use std::collections::VecDeque;

pub struct ContinuityBuffer {
    buffer: VecDeque<f32>,
    max_size: usize,
}
impl ContinuityBuffer {
    pub fn new() -> Self {
        Self {
            buffer: VecDeque::new(),
            max_size: 30,
        }
    }
    
    pub fn push(&mut self, value: f32) {
        if self.buffer.len() >= self.max_size {
            self.buffer.pop_front();
        self.buffer.push_back(value);
