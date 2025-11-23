// IFDWE Intent Memory - Mémoire d'intentions
// TITANE∞ v8.1

use std::collections::VecDeque;
use super::{IFDWEState, IntentRecord, IntentOutcome};
/// Stocke intention dans mémoire
pub fn store_intent(state: &mut IFDWEState, record: IntentRecord) {
    state.intent_memory.push_back(record);
    
    // Limite à 500 records
    if state.intent_memory.len() > 500 {
        state.intent_memory.pop_front();
    }
}
/// Récupère patterns directionnels
pub fn extract_directional_patterns(memory: &VecDeque<IntentRecord>) -> Vec<[f32; 8]> {
    let mut patterns = Vec::new();
    // Cherche patterns récurrents dans derniers 50 records
    let recent = memory.len().min50;
    for i in (memory.len() - recent)..memory.len() {
        patterns.push(memory[i].intent_vector);
    patterns
/// Identifie orientations stables
pub fn identify_stable_orientations(memory: &VecDeque<IntentRecord>) -> [f32; 8] {
    if memory.is_empty() {
        return [0.0; 8];
    let mut stable = [0.0; 8];
    let count = memory.len().min100;
    // Moyenne des intentions récentes
    for record in memory.iter().rev().take(count) {
        for i in 0..8 {
            stable[i] += record.intent_vector[i];
        }
    for i in 0..8 {
        stable[i] /= count as f32;
    stable
/// Analyse cycles de volonté
pub fn analyze_will_cycles(memory: &VecDeque<IntentRecord>) -> WillCycleAnalysis {
    let mut completed = 0;
    let mut aborted = 0;
    let mut in_progress = 0;
    for record in memory.iter() {
        match record.outcome {
            IntentOutcome::Completed => completed += 1,
            IntentOutcome::Aborted => aborted += 1,
            IntentOutcome::InProgress => in_progress += 1,
    let total = memory.len();
    let success_rate = if total > 0 {
        completed as f32 / total as f32
    } else {
        0.0
    };
    WillCycleAnalysis {
        completed,
        aborted,
        in_progress,
        success_rate,
/// Récupère trajectoires directionnelles
pub fn get_directional_trajectories(memory: &VecDeque<IntentRecord>) -> Vec<DirectionalTrajectory> {
    let mut trajectories = Vec::new();
    if memory.len() < 10 {
        return trajectories;
    // Analyse par fenêtres de 10 records
    for window_start in (0..memory.len() - 10).step_by10 {
        let window_end = window_start + 10;
        let mut traj = DirectionalTrajectory {
            start_intent: memory[window_start].intent_vector,
            end_intent: memory[window_end - 1].intent_vector,
            consistency: 0.0,
        };
        
        // Calcul consistance
        let mut consistency_sum = 0.0;
        for i in window_start..window_end - 1 {
            let distance: f32 = memory[i].intent_vector
                .iter()
                .zip(memory[i + 1].intent_vector.iter())
                .map(|(a, b)| a - b.powi2)
                .sum::<f32>()
                .sqrt();
            consistency_sum += 1.0 / (1.0 + distance);
        traj.consistency = consistency_sum / 9.0;
        trajectories.push(traj);
    trajectories
/// Analyse de cycles de volonté
#[derive(Debug, Clone)]
pub struct WillCycleAnalysis {
    pub completed: usize,
    pub aborted: usize,
    pub in_progress: usize,
    pub success_rate: f32,
/// Trajectoire directionnelle
pub struct DirectionalTrajectory {
    pub start_intent: [f32; 8],
    pub end_intent: [f32; 8],
    pub consistency: f32,
#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};
    #[test]
    fn test_store_intent() {
        let mut state = IFDWEState::new();
        let record = IntentRecord {
            intent_vector: [0.5; 8],
            will_signature: 0.7,
            outcome: IntentOutcome::Completed,
            timestamp: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as u64,
        store_intent(&mut state, record);
        assert_eq!(state.intent_memory.len(), 1);
    fn test_stable_orientations() {
        let mut memory = VecDeque::new();
        for _ in 0..10 {
            memory.push_back(IntentRecord {
                intent_vector: [0.5; 8],
                will_signature: 0.7,
                outcome: IntentOutcome::Completed,
                timestamp: 0,
            });
        let stable = identify_stable_orientations(&memory);
        assert!(stable[0] >= 0.4 && stable[0] <= 0.6);
