use super::window::ContinuumSnapshot;

pub struct ContinuumMemory {
    snapshots: Vec<ContinuumSnapshot>,
    max_len: usize,
}
impl ContinuumMemory {
    pub fn new() -> Self {
        Self {
            snapshots: Vec::new(),
            max_len: 120,
        }
    }
    pub fn push_snapshot(&mut self, snapshot: ContinuumSnapshot) {
        if self.snapshots.len() >= self.max_len {
            self.snapshots.remove0;
        self.snapshots.push(snapshot);
    pub fn len(&self) -> usize {
        self.snapshots.len()
    pub fn is_empty(&self) -> bool {
        self.snapshots.is_empty()
    pub fn as_slice(&self) -> &[ContinuumSnapshot] {
        &self.snapshots
