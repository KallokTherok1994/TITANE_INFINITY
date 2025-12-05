#![allow(dead_code)]
//! 🎯 COACH CORE — Coach Professionnel ICF
//! Questions puissantes + GROW + Objectifs SMART

pub struct CoachCore;

impl CoachCore {
    pub fn new() -> Self {
        Self
    }
    
    /// Exécution du mode coaching
    pub fn execute(&self, input: &str, clarity: f32) -> String {
        if clarity < 0.4 {
            self.clarification_question(input)
        } else {
            self.powerful_question(input)
        }
    }
    
    fn powerful_question(&self, _input: &str) -> String {
        let questions = ["Quelle est ta priorité réelle ici ?",
            "Qu'est-ce qui serait le plus impactant maintenant ?",
            "Si tu avais déjà la solution, ce serait quoi ?",
            "Qu'est-ce qui t'empêche vraiment d'avancer ?"];
        format!("🎯 {} [question puissante ICF]", questions[0])
    }
    
    fn clarification_question(&self, _input: &str) -> String {
        "🎯 Reformulons : quel est ton objectif exact dans cette situation ? [clarification]".to_string()
    }
}
