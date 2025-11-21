// SEILE Feedback Analyzer - Analyse de feedback d'actions
// TITANE∞ v8.1

/// Analyse feedback d'action
pub fn analyze_feedback(
    action_quality: f32,
    intent_quality: f32,
    outcome_quality: f32,
) -> ActionFeedbackReport {
    let overall_quality = (action_quality + intent_quality + outcome_quality) / 3.0;
    let coherence_score = compute_coherence(action_quality, intent_quality, outcome_quality);
    
    let assessment = if overall_quality > 0.75 {
        FeedbackAssessment::Excellent
    } else if overall_quality > 0.6 {
        FeedbackAssessment::Good
    } else if overall_quality > 0.4 {
        FeedbackAssessment::Moderate
    } else {
        FeedbackAssessment::Poor
    };
    ActionFeedbackReport {
        overall_quality,
        coherence_score,
        assessment,
    }
}
/// Calcule cohérence feedback
fn compute_coherence(a: f32, b: f32, c: f32) -> f32 {
    let avg = (a + b + c) / 3.0;
    let variance = (a - avg.powi2 + b - avg.powi2 + c - avg.powi2) / 3.0;
    (1.0 / (1.0 + variance)).min1.0
/// Identifie actions réussies
pub fn identify_successful_actions(
    action_records: &[ActionRecord],
) -> Vec<ActionRecord> {
    action_records
        .iter()
        .filter(|r| r.effectiveness > 0.7)
        .cloned()
        .collect()
/// Identifie actions inefficaces
pub fn identify_ineffective_actions(
        .filter(|r| r.effectiveness < 0.4)
/// Identifie actions incohérentes
pub fn identify_incoherent_actions(
        .filter(|r| {
            let coherence = compute_coherence(
                r.intent_alignment,
                r.effectiveness,
                r.outcome_quality,
            );
            coherence < 0.5
        })
/// Rapport de feedback d'action
#[derive(Debug, Clone)]
pub struct ActionFeedbackReport {
    pub overall_quality: f32,
    pub coherence_score: f32,
    pub assessment: FeedbackAssessment,
/// Évaluation feedback
#[derive(Debug, Clone, PartialEq)]
pub enum FeedbackAssessment {
    Excellent,
    Good,
    Moderate,
    Poor,
/// Enregistrement d'action (simplifié pour analyse)
pub struct ActionRecord {
    pub effectiveness: f32,
    pub intent_alignment: f32,
    pub outcome_quality: f32,
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_feedback_analysis() {
        let report = analyze_feedback(0.8, 0.75, 0.78);
        assert!(report.overall_quality > 0.7);
        assert_eq!(report.assessment, FeedbackAssessment::Good);
    fn test_successful_actions() {
        let records = vec![
            ActionRecord {
                effectiveness: 0.8,
                intent_alignment: 0.75,
                outcome_quality: 0.78,
            },
                effectiveness: 0.3,
                intent_alignment: 0.4,
                outcome_quality: 0.35,
        ];
        
        let successful = identify_successful_actions(&records);
        assert_eq!(successful.len(), 1);
