// IAEE Action Memory - Mémoire d'actions
// TITANE∞ v8.1

use std::collections::VecDeque;
use super::{IAEEState, ActionRecord, ActionOutcome, BehaviorType};
/// Stocke action dans mémoire
pub fn store_action(state: &mut IAEEState, record: ActionRecord) {
    state.action_memory.push_back(record);
    
    // Limite à 500 records
    if state.action_memory.len() > 500 {
        state.action_memory.pop_front();
    }
}
/// Récupère actions accomplies
pub fn get_completed_actions(memory: &VecDeque<ActionRecord>) -> Vec<ActionRecord> {
    memory
        .iter()
        .filter(|r| matches!(r.outcome, ActionOutcome::Success))
        .cloned()
        .collect()
/// Récupère actions corrigées
pub fn get_corrected_actions(memory: &VecDeque<ActionRecord>) -> Vec<ActionRecord> {
        .filter(|r| matches!(r.outcome, ActionOutcome::Partial))
/// Récupère actions annulées
pub fn get_cancelled_actions(memory: &VecDeque<ActionRecord>) -> Vec<ActionRecord> {
        .filter(|r| matches!(r.outcome, ActionOutcome::Cancelled))
/// Analyse réussites et échecs
pub fn analyze_outcomes(memory: &VecDeque<ActionRecord>) -> OutcomeAnalysis {
    let mut success_count = 0;
    let mut partial_count = 0;
    let mut failed_count = 0;
    let mut cancelled_count = 0;
    for record in memory.iter() {
        match record.outcome {
            ActionOutcome::Success => success_count += 1,
            ActionOutcome::Partial => partial_count += 1,
            ActionOutcome::Failed => failed_count += 1,
            ActionOutcome::Cancelled => cancelled_count += 1,
        }
    let total = memory.len();
    let success_rate = if total > 0 {
        success_count as f32 / total as f32
    } else {
        0.0
    };
    OutcomeAnalysis {
        success_count,
        partial_count,
        failed_count,
        cancelled_count,
        success_rate,
/// Extrait patterns comportementaux
pub fn extract_behavior_patterns(memory: &VecDeque<ActionRecord>) -> Vec<BehaviorPattern> {
    let mut patterns = Vec::new();
    // Compte fréquence de chaque type de comportement
    let mut stabilization_count = 0;
    let mut alignment_count = 0;
    let mut optimization_count = 0;
    let mut evolution_count = 0;
    let mut adaptation_count = 0;
        match record.behavior_type {
            BehaviorType::Stabilization => stabilization_count += 1,
            BehaviorType::Alignment => alignment_count += 1,
            BehaviorType::Optimization => optimization_count += 1,
            BehaviorType::Evolution => evolution_count += 1,
            BehaviorType::Adaptation => adaptation_count += 1,
    let total = memory.len() as f32;
    patterns.push(BehaviorPattern {
        behavior_type: BehaviorType::Stabilization,
        frequency: stabilization_count as f32 / total,
        avg_effectiveness: compute_avg_effectiveness(memory, &BehaviorType::Stabilization),
    });
        behavior_type: BehaviorType::Alignment,
        frequency: alignment_count as f32 / total,
        avg_effectiveness: compute_avg_effectiveness(memory, &BehaviorType::Alignment),
        behavior_type: BehaviorType::Optimization,
        frequency: optimization_count as f32 / total,
        avg_effectiveness: compute_avg_effectiveness(memory, &BehaviorType::Optimization),
    patterns
/// Calcule efficacité moyenne pour un type de comportement
fn compute_avg_effectiveness(memory: &VecDeque<ActionRecord>, behavior: &BehaviorType) -> f32 {
    let relevant: Vec<&ActionRecord> = memory
        .filter(|r| &r.behavior_type == behavior)
        .collect();
    if relevant.is_empty() {
        return 0.0;
    let sum: f32 = relevant.iter().map(|r| r.effectiveness).sum();
    sum / relevant.len() as f32
/// Analyse de résultats
#[derive(Debug, Clone)]
pub struct OutcomeAnalysis {
    pub success_count: usize,
    pub partial_count: usize,
    pub failed_count: usize,
    pub cancelled_count: usize,
    pub success_rate: f32,
/// Pattern comportemental
pub struct BehaviorPattern {
    pub behavior_type: BehaviorType,
    pub frequency: f32,
    pub avg_effectiveness: f32,
#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};
    #[test]
    fn test_store_action() {
        let mut state = IAEEState::new();
        let record = ActionRecord {
            action_vector: [0.5; 8],
            behavior_type: BehaviorType::Stabilization,
            outcome: ActionOutcome::Success,
            effectiveness: 0.8,
            timestamp: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as u64,
        };
        
        store_action(&mut state, record);
        assert_eq!(state.action_memory.len(), 1);
    fn test_outcome_analysis() {
        let mut memory = VecDeque::new();
        for i in 0..10 {
            memory.push_back(ActionRecord {
                action_vector: [0.5; 8],
                behavior_type: BehaviorType::Stabilization,
                outcome: if i < 7 { ActionOutcome::Success } else { ActionOutcome::Failed },
                effectiveness: 0.8,
                timestamp: 0,
            });
        let analysis = analyze_outcomes(&memory);
        assert_eq!(analysis.success_count, 7);
        assert!(analysis.success_rate >= 0.6 && analysis.success_rate <= 0.8);
