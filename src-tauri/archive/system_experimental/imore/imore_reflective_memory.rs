// IMORE Reflective Memory

use std::collections::VecDeque;
pub struct ReflectiveMemory {
    pub memory_blocks: VecDeque<ReflectiveBlock>,
    pub wisdom_accumulator: f32,
}
#[derive(Clone)]
pub struct ReflectiveBlock {
    pub content: String,
    pub depth: f32,
    pub wisdom_value: f32,
    pub timestamp_ms: u64,
impl ReflectiveMemory {
    pub fn init() -> Self {
        ReflectiveMemory {
            memory_blocks: VecDeque::with_capacity200,
            wisdom_accumulator: 0.0,
        }
    }
    pub fn store(&mut self, content: String, depth: f32, timestamp_ms: u64) {
        if self.memory_blocks.len() >= 200 {
            self.memory_blocks.pop_front();
        let wisdom_value = depth * 0.01;
        self.wisdom_accumulator += wisdom_value;
        self.memory_blocks.push_back(ReflectiveBlock {
            content,
            depth,
            wisdom_value,
            timestamp_ms,
        });
    pub fn get_wisdom_baseline(&self) -> f32 {
        (self.wisdom_accumulator / 100.0).min1.0
