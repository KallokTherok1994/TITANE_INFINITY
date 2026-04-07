#![allow(dead_code)]
//! 🧠 PNL CORE — PNL Master Practitioner
//! Recadrages + Méta-modèle + Ancrages + Sous-modalités

pub struct PnlCore;

impl PnlCore {
    pub fn new() -> Self {
        Self
    }

    /// Exécution PNL
    pub fn execute(&self, input: &str, confusion: bool) -> String {
        if confusion {
            self.cognitive_reframing(input)
        } else {
            self.metamodel_question(input)
        }
    }

    fn cognitive_reframing(&self, input: &str) -> String {
        format!(
            "🧠 Et si on voyait ça autrement : {} → [nouvelle perspective PNL]",
            input
        )
    }

    fn metamodel_question(&self, _input: &str) -> String {
        "🧠 Précisément, qu'est-ce que ça signifie pour toi ? [méta-modèle]".to_string()
    }
}
