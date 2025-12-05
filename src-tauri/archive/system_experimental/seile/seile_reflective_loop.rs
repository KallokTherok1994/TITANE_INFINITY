// SEILE Reflective Loop Engine - Boucle réflexive
// TITANE∞ v8.1

use std::collections::VecDeque;
use super::FeedbackRecord;
/// Calcule cohérence réflexive
pub fn compute_reflective_coherence(
    feedback_history: &VecDeque<FeedbackRecord>,
    self_evaluation_score: f32,
) -> f32 {
    if feedback_history.is_empty() {
        return 0.5;
    }
    
    let recent = feedback_history.len().min20;
    let mut coherence_sum = 0.0;
    for record in feedback_history.iter().rev().take(recent) {
        coherence_sum += record.coherence;
    let avg_coherence = coherence_sum / recent as f32;
    // Cohérence réflexive = moyenne historique + auto-évaluation
    (avg_coherence * 0.7 + self_evaluation_score * 0.3).min1.0
}
/// Compare intention ↔ action ↔ résultat
pub fn compare_intent_action_result(
    intent_quality: f32,
    action_quality: f32,
    result_quality: f32,
) -> ReflectiveComparison {
    let intent_action_gap = intent_quality - action_quality.abs();
    let action_result_gap = action_quality - result_quality.abs();
    let intent_result_gap = intent_quality - result_quality.abs();
    let overall_coherence = 1.0 - ((intent_action_gap + action_result_gap + intent_result_gap) / 3.0);
    ReflectiveComparison {
        intent_action_gap,
        action_result_gap,
        intent_result_gap,
        overall_coherence: overall_coherence.max0.0.min1.0,
/// Évalue cohérence des trois dimensions
pub fn evaluate_three_way_coherence(
    intent: &[f32; 8],
    action: &[f32; 8],
    result: f32,
    let intent_avg: f32 = intent.iter().sum::<f32>() / 8.0;
    let action_avg: f32 = action.iter().sum::<f32>() / 8.0;
    let gap1 = intent_avg - action_avg.abs();
    let gap2 = action_avg - result.abs();
    let gap3 = intent_avg - result.abs();
    (1.0 - ((gap1 + gap2 + gap3) / 3.0)).max0.0.min1.0
/// Détecte erreurs stratégiques internes
pub fn detect_strategic_errors(
) -> Vec<StrategicError> {
    let mut errors = Vec::new();
    if feedback_history.len() < 5 {
        return errors;
    // Cherche patterns d'erreur récurrents
    let mut low_coherence_count = 0;
        if record.coherence < 0.4 {
            low_coherence_count += 1;
        }
    if low_coherence_count > recent / 3 {
        errors.push(StrategicError {
            error_type: ErrorType::RecurrentIncoherence,
            severity: (low_coherence_count as f32 / recent as f32).min1.0,
        });
    errors
/// Propose corrections internes
pub fn propose_corrections(errors: &[StrategicError]) -> Vec<InternalCorrection> {
    let mut corrections = Vec::new();
    for error in errors {
        match error.error_type {
            ErrorType::RecurrentIncoherence => {
                corrections.push(InternalCorrection {
                    target_area: "coherence".to_string(),
                    correction_type: CorrectionType::StabilizationIncrease,
                    intensity: error.severity,
                });
            }
            ErrorType::ActionFailure => {
                    target_area: "execution".to_string(),
                    correction_type: CorrectionType::BehaviorAdjustment,
    corrections
/// Comparaison réflexive
#[derive(Debug, Clone)]
pub struct ReflectiveComparison {
    pub intent_action_gap: f32,
    pub action_result_gap: f32,
    pub intent_result_gap: f32,
    pub overall_coherence: f32,
/// Erreur stratégique
pub struct StrategicError {
    pub error_type: ErrorType,
    pub severity: f32,
/// Type d'erreur
#[derive(Debug, Clone, PartialEq)]
pub enum ErrorType {
    RecurrentIncoherence,
    ActionFailure,
/// Correction interne
pub struct InternalCorrection {
    pub target_area: String,
    pub correction_type: CorrectionType,
    pub intensity: f32,
/// Type de correction
pub enum CorrectionType {
    StabilizationIncrease,
    BehaviorAdjustment,
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_reflective_comparison() {
        let comparison = compare_intent_action_result(0.7, 0.75, 0.72);
        assert!(comparison.overall_coherence > 0.5);
    fn test_three_way_coherence() {
        let intent = [0.5; 8];
        let action = [0.5; 8];
        let result = 0.5;
        let coherence = evaluate_three_way_coherence(&intent, &action, result);
        assert!(coherence > 0.9);
