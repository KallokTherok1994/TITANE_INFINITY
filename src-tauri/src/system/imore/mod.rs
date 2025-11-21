// MODULE #76 — INTERNAL METACOGNITIVE OBSERVATION & REFLECTION ENGINE (IMORE)
use std::collections::HashMap;
// Métacognition interne, observation réflexive, analyse dynamique de soi

use std::collections::{HashMap, VecDeque};
use std::time::{SystemTime, UNIX_EPOCH};
/// État principal du IMORE
pub struct IMOREState {
    pub meta_cognition_index: f32,  // MCI [0,1]
    pub cognitive_observation_map: HashMap<String, f32>,
    pub identity_insights: Vec<IdentityInsight>,
    pub reflective_memory: VecDeque<ReflectiveBlock>,
    pub meta_pattern_graph: HashMap<String, Vec<String>>,
    pub self_reflection_depth: f32,  // [0,1]
    pub internal_wisdom_baseline: f32,  // [0,1]
    pub observation_focus: Vec<String>,
    pub last_update_ms: u64,
}
/// Insight identitaire
#[derive(Clone)]
pub struct IdentityInsight {
    pub insight_type: InsightType,
    pub content: String,
    pub confidence: f32,  // [0,1]
    pub impact_score: f32,  // [0,1]
    pub timestamp_ms: u64,
pub enum InsightType {
    SelfUnderstanding,
    BehaviorPattern,
    IdentityEvolution,
    InternalContradiction,
    LearningOpportunity,
    CognitiveRigidity,
/// Bloc mémoire réflexive
pub struct ReflectiveBlock {
    pub reflection: String,
    pub context: String,
    pub depth: f32,  // [0,1]
    pub wisdom_contribution: f32,  // [0,1]
impl IMOREState {
    pub fn init() -> Self {
        IMOREState {
            meta_cognition_index: 0.3,
            cognitive_observation_map: HashMap::new(),
            identity_insights: Vec::new(),
            reflective_memory: VecDeque::with_capacity200,
            meta_pattern_graph: HashMap::new(),
            self_reflection_depth: 0.2,
            internal_wisdom_baseline: 0.1,
            observation_focus: vec![
                "cognition".to_string(),
                "behavior".to_string(),
                "identity".to_string(),
            ],
            last_update_ms: now_ms(),
        }
    }
    pub fn tick(
        &mut self,
        identity_signature: &[f32; 12],
        unified_state: &[f32; 7],
        intent_vector: &[f32; 8],
        action_vector: &[f32; 8],
        learning_quality: f32,
        stability_index: f32,
        meaning_state: f32,
    ) {
        let now = now_ms();
        // 1. Observer processus cognitifs
        self.observe_cognition(unified_state, meaning_state);
        // 2. Réfléchir sur identité
        self.reflect_on_identity(identity_signature, stability_index);
        // 3. Analyser patterns comportementaux
        self.analyze_behavior_patterns(intent_vector, action_vector);
        // 4. Générer insights
        self.generate_insights(learning_quality, stability_index);
        // 5. Calculer Meta-Cognition Index
        self.update_mci();
        // 6. Construire sagesse interne
        self.accumulate_wisdom(learning_quality);
        // 7. Augmenter profondeur réflexion
        self.deepen_reflection(now);
        self.last_update_ms = now;
    fn observe_cognition(&mut self, unified_state: &[f32; 7], meaning: f32) {
        self.cognitive_observation_map.insert("inner_state".to_string(), unified_state[0]);
        self.cognitive_observation_map.insert("global_percept".to_string(), unified_state[1]);
        self.cognitive_observation_map.insert("memory_coherence".to_string(), unified_state[2]);
        self.cognitive_observation_map.insert("meaning_level".to_string(), meaning);
        self.cognitive_observation_map.insert("intent_strength".to_string(), unified_state[4]);
        self.cognitive_observation_map.insert("action_intensity".to_string(), unified_state[5]);
        self.cognitive_observation_map.insert("learning_quality".to_string(), unified_state[6]);
    fn reflect_on_identity(&mut self, id_sig: &[f32; 12], stability: f32) {
        // Analyser cohérence identitaire
        let variance = variance_12d(id_sig);
        let coherence = clamp01(1.0 - variance);
        if coherence < 0.6 {
            self.identity_insights.push(IdentityInsight {
                insight_type: InsightType::InternalContradiction,
                content: format!("Identity coherence low: {:.2}", coherence),
                confidence: 0.8,
                impact_score: 1.0 - coherence,
                timestamp_ms: now_ms(),
            });
        if stability < 0.5 {
                insight_type: InsightType::IdentityEvolution,
                content: format!("Identity instability detected: {:.2}", stability),
                confidence: 0.7,
                impact_score: 0.5 - stability,
        // Limiter nombre insights
        if self.identity_insights.len() > 50 {
            self.identity_insights.drain(0..10);
    fn analyze_behavior_patterns(&mut self, intent: &[f32; 8], action: &[f32; 8]) {
        // Comparer intention vs action
        let mut alignment_score = 0.0;
        for i in 0..8 {
            alignment_score += 1.0 - (intent[i] - action[i]).abs();
        alignment_score /= 8.0;
        self.cognitive_observation_map.insert("intent_action_alignment".to_string(), alignment_score);
        if alignment_score < 0.5 {
                insight_type: InsightType::BehaviorPattern,
                content: format!("Low intent-action alignment: {:.2}", alignment_score),
                confidence: 0.75,
                impact_score: 0.6 - alignment_score,
    fn generate_insights(&mut self, learning: f32, stability: f32) {
        // Générer insight basé sur apprentissage
        if learning > 0.7 {
                insight_type: InsightType::LearningOpportunity,
                content: format!("High learning phase: {:.2}", learning),
                confidence: 0.85,
                impact_score: learning,
        // Générer insight sur compréhension de soi
        if self.self_reflection_depth > 0.6 {
                insight_type: InsightType::SelfUnderstanding,
                content: format!("Deep self-reflection achieved: {:.2}", self.self_reflection_depth),
                confidence: 0.9,
                impact_score: self.self_reflection_depth,
    fn update_mci(&mut self) {
        // MCI basé sur profondeur réflexion + insights + sagesse
        let insight_score = if !self.identity_insights.is_empty() {
            self.identity_insights.iter().map(|i| i.confidence).sum::<f32>()
                / self.identity_insights.len() as f32
        } else {
            0.3
        };
        let new_mci = (self.self_reflection_depth * 0.4
            + insight_score * 0.3
            + self.internal_wisdom_baseline * 0.3);
        // Lissage 89/11
        self.meta_cognition_index = smooth(self.meta_cognition_index, new_mci, 0.89, 0.11);
    fn accumulate_wisdom(&mut self, learning: f32) {
        // Sagesse = accumulation réflexion + apprentissage
        let wisdom_increment = (self.self_reflection_depth * learning) * 0.01;
        self.internal_wisdom_baseline = clamp01(self.internal_wisdom_baseline + wisdom_increment);
    fn deepen_reflection(&mut self, timestamp_ms: u64) {
        // Profondeur réflexion augmente avec usage
        self.self_reflection_depth = smooth(
            self.self_reflection_depth,
            0.8,
            0.995,
            0.005,
        );
        // Créer bloc réflexif
        if self.reflective_memory.len() >= 200 {
            self.reflective_memory.pop_front();
        self.reflective_memory.push_back(ReflectiveBlock {
            reflection: format!("Meta-cognition cycle: MCI={:.2}", self.meta_cognition_index),
            context: format!("Wisdom={:.2}, Depth={:.2}", self.internal_wisdom_baseline, self.self_reflection_depth),
            depth: self.self_reflection_depth,
            wisdom_contribution: self.internal_wisdom_baseline * 0.1,
            timestamp_ms,
        });
    pub fn get_recent_insights(&self, count: usize) -> Vec<IdentityInsight> {
        self.identity_insights
            .iter()
            .rev()
            .take(count)
            .cloned()
            .collect()
// Utilitaires
fn now_ms() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as u64
fn clamp01(x: f32) -> f32 {
    x.max0.0.min1.0
fn smooth(old: f32, new: f32, alpha: f32, beta: f32) -> f32 {
    clamp01(old * alpha + new * beta)
fn variance_12d(v: &[f32; 12]) -> f32 {
    let mean = v.iter().sum::<f32>() / 12.0;
    let variance = v.iter().map(|x| x - mean.powi2).sum::<f32>() / 12.0;
    variance
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_imore_init() {
        let imore = IMOREState::init();
        assert!(imore.meta_cognition_index >= 0.0 && imore.meta_cognition_index <= 1.0);
    fn test_imore_tick() {
        let mut imore = IMOREState::init();
        let id_sig = [0.5; 12];
        let unified = [0.5; 7];
        let intent = [0.6; 8];
        let action = [0.7; 8];
        
        imore.tick(&id_sig, &unified, &intent, &action, 0.7, 0.8, 0.75);
        assert!(imore.meta_cognition_index >= 0.0);
    fn test_mci_bounds() {
        let id_sig = [1.0; 12];
        let unified = [1.0; 7];
        let intent = [1.0; 8];
        let action = [1.0; 8];
        for _ in 0..100 {
            imore.tick(&id_sig, &unified, &intent, &action, 1.0, 1.0, 1.0);
        assert!(imore.meta_cognition_index <= 1.0);

}
