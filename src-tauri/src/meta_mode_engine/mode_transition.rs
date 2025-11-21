#![allow(dead_code)]
//! 🔁 MODE TRANSITION ENGINE
//! Transitions fluides entre tous les modes sans casser le fil

use super::{TitaneMode, KevinState};

pub struct ModeTransitioner {
    transition_history: Vec<(TitaneMode, TitaneMode)>,
}

impl ModeTransitioner {
    pub fn new() -> Self {
        Self {
            transition_history: vec![],
        }
    }
    
    /// **Effectue une transition fluide entre deux modes**
    /// Retourne true si transition douce, false si brutale
    pub fn transition(&mut self, from: &TitaneMode, to: &TitaneMode, _state: &KevinState) -> bool {
        self.transition_history.push((from.clone(), to.clone()));
        
        // Transitions douces (cohérentes)
        let smooth_transitions = vec![
            (TitaneMode::TherapeuteHumaniste, TitaneMode::CoachProfessionnelICF),
            (TitaneMode::CoachProfessionnelICF, TitaneMode::PNLMasterPractitioner),
            (TitaneMode::PNLMasterPractitioner, TitaneMode::HypnoseDouceCeNonMedicale),
            (TitaneMode::DigitalTwin, TitaneMode::EmotionalEngine),
            (TitaneMode::EmotionalEngine, TitaneMode::BehavioralEngine),
            (TitaneMode::Strategiste, TitaneMode::ArchitecteSystemique),
            (TitaneMode::ArchitecteSystemique, TitaneMode::Analyste),
            (TitaneMode::CreatorEngine, TitaneMode::Optimizer),
            (TitaneMode::AutopilotProactif, TitaneMode::CreatorEngine),
        ];
        
        smooth_transitions.contains(&(from.clone(), to.clone()))
    }
    
    /// Ralentir si état émotionnel dégradé
    pub fn should_slow_down(&self, state: &KevinState) -> bool {
        state.stress_level > 0.7 || state.saturation_level > 0.7 || state.energy_level < 0.3
    }
    
    /// Accélérer si énergie et clarté élevées
    pub fn should_speed_up(&self, state: &KevinState) -> bool {
        state.energy_level > 0.7 && state.clarity_level > 0.6 && state.stress_level < 0.4
    }
}
