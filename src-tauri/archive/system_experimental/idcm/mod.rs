// MODULE #77 — INTERNAL DIALOGUE & CROSS-MODULE COMMUNICATION ENGINE (IDCM)
use std::collections::HashMap;
// Dialogue interne, communication croisée, émergence discours intérieur

use std::collections::{HashMap, VecDeque};
use std::time::{SystemTime, UNIX_EPOCH};
/// État principal du IDCM
pub struct IDCMState {
    pub internal_dialogue_stream: Vec<DialogueMessage>,
    pub internal_consensus_state: f32,  // ICS2 [0,1]
    pub dialogue_coherence: f32,  // [0,1]
    pub active_voices: HashMap<String, VoiceState>,
    pub dialogue_memory: VecDeque<DialogueExchange>,
    pub harmony_index: f32,  // [0,1]
    pub communication_graph: HashMap<String, Vec<String>>,
    pub last_update_ms: u64,
}
/// Message de dialogue interne
#[derive(Clone)]
pub struct DialogueMessage {
    pub source: String,
    pub target: String,
    pub content: MessageContent,
    pub priority: f32,  // [0,1]
    pub timestamp_ms: u64,
pub enum MessageContent {
    StateUpdate(f32),
    IntentProposal(Vec<f32>),
    ActionRequest(String),
    EvaluationFeedback(f32),
    IdentityReflection(String),
    ConsensusRequest,
    ConflictResolution(String),
/// État d'une voix interne
pub struct VoiceState {
    pub intensity: f32,  // [0,1]
    pub coherence: f32,  // [0,1]
    pub last_message_ms: u64,
/// Échange dialogique stocké
pub struct DialogueExchange {
    pub participants: Vec<String>,
    pub resolution: Option<String>,
    pub consensus_reached: bool,
impl IDCMState {
    pub fn init() -> Self {
        let mut active_voices = HashMap::new();
        let voices = vec!["perception", "memory", "intent", "action", "evaluation", "identity"];
        
        for voice in voices {
            active_voices.insert(voice.to_string(), VoiceState {
                intensity: 0.5,
                coherence: 0.7,
                last_message_ms: now_ms(),
            });
        }
        IDCMState {
            internal_dialogue_stream: Vec::new(),
            internal_consensus_state: 0.5,
            dialogue_coherence: 0.6,
            active_voices,
            dialogue_memory: VecDeque::with_capacity100,
            harmony_index: 0.5,
            communication_graph: HashMap::new(),
            last_update_ms: now_ms(),
    }
    pub fn tick(
        &mut self,
        perception: f32,
        memory: f32,
        intent: f32,
        action: f32,
        evaluation: f32,
        identity: f32,
    ) {
        let now = now_ms();
        // 1. Mettre à jour voix actives
        self.update_voices(perception, memory, intent, action, evaluation, identity, now);
        // 2. Router messages internes
        self.route_messages();
        // 3. Synthétiser dialogue
        self.synthesize_dialogue();
        // 4. Rechercher consensus
        self.seek_consensus();
        // 5. Résoudre conflits
        self.resolve_conflicts();
        // 6. Calculer harmonie
        self.update_harmony();
        // 7. Stocker échanges importants
        self.store_exchange(now);
        self.last_update_ms = now;
    fn update_voices(
        timestamp: u64,
        if let Some(voice) = self.active_voices.get_mut("perception") {
            voice.intensity = smooth(voice.intensity, perception, 0.85, 0.15);
            voice.last_message_ms = timestamp;
        if let Some(voice) = self.active_voices.get_mut("memory") {
            voice.intensity = smooth(voice.intensity, memory, 0.87, 0.13);
        if let Some(voice) = self.active_voices.get_mut("intent") {
            voice.intensity = smooth(voice.intensity, intent, 0.88, 0.12);
        if let Some(voice) = self.active_voices.get_mut("action") {
            voice.intensity = smooth(voice.intensity, action, 0.84, 0.16);
        if let Some(voice) = self.active_voices.get_mut("evaluation") {
            voice.intensity = smooth(voice.intensity, evaluation, 0.86, 0.14);
        if let Some(voice) = self.active_voices.get_mut("identity") {
            voice.intensity = smooth(voice.intensity, identity, 0.90, 0.10);
    fn route_messages(&mut self) {
        self.internal_dialogue_stream.clear();
        // Créer messages entre voix actives
        if let Some(intent_voice) = self.active_voices.get("intent") {
            if intent_voice.intensity > 0.6 {
                self.internal_dialogue_stream.push(DialogueMessage {
                    source: "intent".to_string(),
                    target: "action".to_string(),
                    content: MessageContent::ActionRequest("execute_intent".to_string()),
                    priority: intent_voice.intensity,
                    timestamp_ms: now_ms(),
                });
            }
        if let Some(eval_voice) = self.active_voices.get("evaluation") {
            if eval_voice.intensity > 0.5 {
                    source: "evaluation".to_string(),
                    target: "identity".to_string(),
                    content: MessageContent::EvaluationFeedback(eval_voice.intensity),
                    priority: 0.7,
    fn synthesize_dialogue(&mut self) {
        // Calculer cohérence du dialogue
        if self.internal_dialogue_stream.is_empty() {
            self.dialogue_coherence = smooth(self.dialogue_coherence, 0.5, 0.90, 0.10);
            return;
        let avg_priority = self.internal_dialogue_stream
            .iter()
            .map(|m| m.priority)
            .sum::<f32>() / self.internal_dialogue_stream.len() as f32;
        self.dialogue_coherence = smooth(self.dialogue_coherence, avg_priority, 0.88, 0.12);
    fn seek_consensus(&mut self) {
        // Calculer consensus basé sur cohérence des voix
        let coherences: Vec<f32> = self.active_voices.values().map(|v| v.coherence).collect();
        let avg_coherence = if !coherences.is_empty() {
            coherences.iter().sum::<f32>() / coherences.len() as f32
        } else {
            0.5
        };
        let new_consensus = (avg_coherence + self.dialogue_coherence) / 2.0;
        self.internal_consensus_state = smooth(self.internal_consensus_state, new_consensus, 0.87, 0.13);
    fn resolve_conflicts(&mut self) {
        // Détecter conflits entre voix
        let intensities: Vec<f32> = self.active_voices.values().map(|v| v.intensity).collect();
        if intensities.len() < 2 {
        let max_intensity = intensities.iter().cloned().fold(0.0_f32, f32::max);
        let min_intensity = intensities.iter().cloned().fold(1.0_f32, f32::min);
        let conflict = max_intensity - min_intensity;
        if conflict > 0.5 {
            // Réduire conflits par harmonisation
            for voice in self.active_voices.values_mut() {
                let target = (voice.intensity + 0.5) / 2.0;
                voice.intensity = smooth(voice.intensity, target, 0.92, 0.08);
    fn update_harmony(&mut self) {
        // Harmonie = consensus + cohérence dialogue
        let new_harmony = (self.internal_consensus_state + self.dialogue_coherence) / 2.0;
        self.harmony_index = smooth(self.harmony_index, new_harmony, 0.89, 0.11);
    fn store_exchange(&mut self, timestamp_ms: u64) {
        if self.dialogue_memory.len() >= 100 {
            self.dialogue_memory.pop_front();
        let participants: Vec<String> = self.active_voices.keys().cloned().collect();
        self.dialogue_memory.push_back(DialogueExchange {
            participants,
            resolution: Some(format!("Consensus: {:.2}", self.internal_consensus_state)),
            consensus_reached: self.internal_consensus_state > 0.7,
            timestamp_ms,
        });
// Utilitaires
fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
fn smooth(old: f32, new: f32, alpha: f32, beta: f32) -> f32 {
    (old * alpha + new * beta).max0.0.min1.0
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_idcm_init() {
        let idcm = IDCMState::init();
        assert!(idcm.internal_consensus_state >= 0.0 && idcm.internal_consensus_state <= 1.0);
        assert_eq!(idcm.active_voices.len(), 6);
    fn test_idcm_tick() {
        let mut idcm = IDCMState::init();
        idcm.tick(0.7, 0.6, 0.8, 0.7, 0.75, 0.8);
        assert!(idcm.harmony_index >= 0.0 && idcm.harmony_index <= 1.0);

}
