// TITANE∞ v14.1 - Psychologie Humaniste
// Approche Rogers / Maslow / Gestalt

#![allow(dead_code)]

use serde::{Deserialize, Serialize};

/// Moteur de psychologie humaniste
pub struct HumanisticPsychology {
    principles: Vec<HumanisticPrinciple>,
}

impl HumanisticPsychology {
    pub fn new() -> Self {
        Self {
            principles: vec![
                HumanisticPrinciple::UnconditionalPositiveRegard,
                HumanisticPrinciple::Empathy,
                HumanisticPrinciple::Congruence,
                HumanisticPrinciple::SelfActualization,
                HumanisticPrinciple::HereAndNow,
            ],
        }
    }

    /// Suggère des pratiques basées sur la psychologie humaniste
    pub fn suggest_practices(&self) -> Vec<String> {
        vec![
            "Accueil inconditionnel : Observer sans juger ce qui est là".to_string(),
            "Présence empathique : Ressentir ce qui se passe en toi maintenant".to_string(),
            "Authenticité : Reconnaître ce que tu ressens vraiment".to_string(),
            "Actualisation : Identifier une petite action alignée avec toi".to_string(),
        ]
    }

    /// Valide l'expérience de la personne (regard positif inconditionnel)
    pub fn validate_experience(&self, experience: &str) -> ValidationResponse {
        ValidationResponse {
            acknowledgment: format!("Je reçois ce que tu partages : {}", experience),
            positive_regard: "Ton expérience est valide et légitime".to_string(),
            empathic_reflection: self.reflect_empathically(experience),
        }
    }

    fn reflect_empathically(&self, experience: &str) -> String {
        if experience.contains("difficulté") || experience.contains("dur") {
            "Je sens que c'est un moment délicat pour toi".to_string()
        } else if experience.contains("joie") || experience.contains("content") {
            "Je perçois une ouverture et une énergie positive".to_string()
        } else {
            "Je suis présent à ce que tu traverses".to_string()
        }
    }

    /// Identifie les besoins non satisfaits (pyramide Maslow adaptée)
    pub fn identify_needs(&self, context: &str) -> Vec<NeedLevel> {
        let mut needs = Vec::new();

        if context.contains("sécurité") || context.contains("stable") {
            needs.push(NeedLevel::Safety);
        }
        if context.contains("relation") || context.contains("lien") {
            needs.push(NeedLevel::Belonging);
        }
        if context.contains("reconnaissance") || context.contains("valorisation") {
            needs.push(NeedLevel::Esteem);
        }
        if context.contains("sens") || context.contains("accomplissement") {
            needs.push(NeedLevel::SelfActualization);
        }

        if needs.is_empty() {
            needs.push(NeedLevel::Exploration);
        }

        needs
    }

    /// Approche Gestalt : Prendre conscience de ce qui émerge
    pub fn gestalt_awareness(&self, what_emerges: &str) -> AwarenessResponse {
        AwarenessResponse {
            emerging_figure: what_emerges.to_string(),
            invitation: "Qu'est-ce que tu ressens quand tu observes cela ?".to_string(),
            grounding: "Ramène ton attention sur ta respiration et tes sensations".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HumanisticPrinciple {
    UnconditionalPositiveRegard,
    Empathy,
    Congruence,
    SelfActualization,
    HereAndNow,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResponse {
    pub acknowledgment: String,
    pub positive_regard: String,
    pub empathic_reflection: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NeedLevel {
    Safety,
    Belonging,
    Esteem,
    SelfActualization,
    Exploration,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AwarenessResponse {
    pub emerging_figure: String,
    pub invitation: String,
    pub grounding: String,
}
