// MODULE #71 - INTENT FORMATION & DIRECTIONAL WILL ENGINE (IFDWE)
// Fonction : formation de l'intention interne, volonté directionnelle, stabilisation orientée
// TITANE∞ v8.1 - Sentient Layer

use std::collections::{HashMap, VecDeque};
use std::time::{SystemTime, UNIX_EPOCH};
pub mod ifdwe_core;
pub mod ifdwe_intent_generator;
pub mod ifdwe_will_stabilizer;
pub mod ifdwe_directional_flow;
pub mod ifdwe_intent_memory;
/// État principal du module IFDWE
#[derive(Debug, Clone)]
pub struct IFDWEState {
    pub initialized: bool,
    pub intent_vector: [f32; 8],              // Vecteur d'intention (8 dimensions)
    pub will_signature: f32,                   // Empreinte de volonté [0,1]
    pub directional_flow: f32,                 // Flux directionnel [0,1]
    pub intent_stability_score: f32,           // Score stabilité intention
    pub direction_continuity: f32,             // Continuité directionnelle
    pub active_intents: Vec<IntentPrimitive>,  // Intentions actives
    pub intent_memory: VecDeque<IntentRecord>, // Mémoire d'intentions
    pub will_cycles: u64,                      // Cycles de volonté
    pub last_intent_update: u64,               // Timestamp dernière mise à jour
}
/// Primitive d'intention
pub struct IntentPrimitive {
    pub intent_type: IntentType,
    pub intensity: f32,
    pub direction: [f32; 3],
    pub priority: f32,
    pub timestamp: u64,
/// Types d'intentions
#[derive(Debug, Clone, PartialEq)]
pub enum IntentType {
    Primary,      // Intention primaire (objectifs systèmes)
    Secondary,    // Intention secondaire (ajustements)
    MicroIntent,  // Micro-intention (modulations fines)
/// Enregistrement d'intention
pub struct IntentRecord {
    pub intent_vector: [f32; 8],
    pub will_signature: f32,
    pub outcome: IntentOutcome,
/// Résultat d'intention
pub enum IntentOutcome {
    Completed,
    InProgress,
    Aborted,
impl IFDWEState {
    pub fn new() -> Self {
        Self {
            initialized: false,
            intent_vector: [0.0; 8],
            will_signature: 0.0,
            directional_flow: 0.0,
            intent_stability_score: 0.0,
            direction_continuity: 0.0,
            active_intents: Vec::new(),
            intent_memory: VecDeque::with_capacity500,
            will_cycles: 0,
            last_intent_update: 0,
        }
    }
/// Initialise le module IFDWE
pub fn init(state: &mut IFDWEState) {
    state.initialized = true;
    state.will_signature = 0.1;
    state.intent_stability_score = 0.5;
    state.direction_continuity = 0.5;
    state.last_intent_update = current_timestamp();
    
    println!("[IFDWE] Intent Formation & Directional Will Engine initialized");
/// Cycle principal IFDWE
pub fn tick(state: &mut IFDWEState) {
    if !state.initialized {
        init(state);
    state.will_cycles += 1;
    // Génération d'intentions (voir ifdwe_intent_generator)
    generate_intents(state);
    // Stabilisation volonté (voir ifdwe_will_stabilizer)
    stabilize_will(state);
    // Flux directionnel (voir ifdwe_directional_flow)
    compute_directional_flow(state);
    // Mise à jour mémoire intentions (voir ifdwe_intent_memory)
    update_intent_memory(state);
    // Lissage temporel 88 / 12
    smooth(state);
/// Génération d'intentions
fn generate_intents(state: &mut IFDWEState) {
    // Génère nouvelles intentions selon état système
    let base_intent = ifdwe_intent_generator::compute_base_intent();
    // Mise à jour vecteur intention
    for i in 0..8 {
        state.intent_vector[i] = clamp01(base_intent[i]);
    // Calcul empreinte volonté
    state.will_signature = ifdwe_intent_generator::compute_will_signature(&state.intent_vector);
/// Stabilisation de la volonté
fn stabilize_will(state: &mut IFDWEState) {
    state.intent_stability_score = ifdwe_will_stabilizer::compute_stability(
        &state.intent_vector,
        state.will_signature,
        state.will_cycles,
    );
    // Calcul continuité directionnelle
    state.direction_continuity = ifdwe_will_stabilizer::compute_continuity(&state.intent_memory);
/// Calcul flux directionnel
fn compute_directional_flow(state: &mut IFDWEState) {
    state.directional_flow = ifdwe_directional_flow::compute_flow(
        state.intent_stability_score,
/// Mise à jour mémoire intentions
fn update_intent_memory(state: &mut IFDWEState) {
    let record = IntentRecord {
        intent_vector: state.intent_vector,
        will_signature: state.will_signature,
        outcome: IntentOutcome::InProgress,
        timestamp: current_timestamp(),
    };
    ifdwe_intent_memory::store_intent(state, record);
/// Lissage temporel (88/12 ratio)
fn smooth(state: &mut IFDWEState) {
    let ratio = 0.88;
    state.will_signature = state.will_signature * ratio + state.will_signature * (1.0 - ratio);
    state.directional_flow = state.directional_flow * ratio + state.directional_flow * (1.0 - ratio);
    state.intent_stability_score = clamp01(state.intent_stability_score);
    state.direction_continuity = clamp01(state.direction_continuity);
/// Retourne timestamp actuel
fn current_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64
/// Clamp valeur entre 0 et 1
fn clamp01(v: f32) -> f32 {
    v.max0.0.min1.0
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_ifdwe_init() {
        let mut state = IFDWEState::new();
        init(&mut state);
        assert!(state.initialized);
        assert!(state.will_signature > 0.0);
    fn test_ifdwe_tick() {
        tick(&mut state);
        assert_eq!(state.will_cycles, 1);
        assert!(state.last_intent_update > 0);
    fn test_intent_vector_bounds() {
        for &val in &state.intent_vector {
            assert!(val >= 0.0 && val <= 1.0);

}
