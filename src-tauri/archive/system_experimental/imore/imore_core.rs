// IMORE Core

use super::*;
use std::collections::VecDeque;
pub struct IMORECore {
    pub mci_history: VecDeque<f32>,
    pub reflection_cycles: u64,
}
impl IMORECore {
    pub fn init() -> Self {
        IMORECore {
            mci_history: VecDeque::with_capacity100,
            reflection_cycles: 0,
        }
    }
    pub fn compute_mci(&mut self, depth: f32, insights: f32, wisdom: f32) -> f32 {
        let mci = depth * 0.4 + insights * 0.3 + wisdom * 0.3;
        
        if self.mci_history.len() >= 100 {
            self.mci_history.pop_front();
        self.mci_history.push_back(mci);
        self.reflection_cycles += 1;
        mci.max0.0.min1.0
    pub fn get_mci_trend(&self) -> f32 {
        if self.mci_history.len() < 2 {
            return 0.0;
        let recent = self.mci_history.back().unwrap();
        let old = self.mci_history.front().unwrap();
        recent - old
