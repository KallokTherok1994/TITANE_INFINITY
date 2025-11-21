// TITANE∞ v14.1 - Coaching Professionnel
// Standards ICF (International Coaching Federation)

#![allow(dead_code)]

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Moteur de coaching professionnel
pub struct ProfessionalCoaching {
    core_competencies: Vec<CoachingCompetency>,
}

impl ProfessionalCoaching {
    pub fn new() -> Self {
        Self {
            core_competencies: vec![
                CoachingCompetency::ActiveListening,
                CoachingCompetency::PowerfulQuestions,
                CoachingCompetency::DirectCommunication,
                CoachingCompetency::ActionPlanning,
                CoachingCompetency::Accountability,
            ],
        }
    }

    /// Suggère des outils de coaching
    pub fn suggest_tools(&self, context: &HashMap<String, String>) -> Vec<String> {
        let mut tools = Vec::new();

        if context.get("intention").is_some_and(|i| i.contains("objectif")) {
            tools.push("SMART Goals : Formule un objectif Spécifique, Mesurable, Atteignable, Réaliste, Temporel".to_string());
        }

        if context.get("intention").is_some_and(|i| i.contains("décision")) {
            tools.push("GROW Model : Goal (objectif), Reality (réalité), Options, Way forward (action)".to_string());
        }

        if context.get("situation").is_some_and(|s| s.contains("changement")) {
            tools.push("Roue de la Vie : Évalue ton niveau de satisfaction dans chaque domaine".to_string());
        }

        tools.push("Questions puissantes : Qu'est-ce qui serait différent si tu réussissais ?".to_string());

        tools
    }

    /// Génère des questions puissantes (core competency ICF)
    pub fn generate_powerful_questions(&self, situation: &str) -> Vec<String> {
        let mut questions = Vec::new();

        questions.push("Qu'est-ce que tu veux vraiment ?".to_string());
        questions.push("Qu'est-ce qui t'empêche de l'obtenir ?".to_string());
        questions.push("Qu'est-ce que tu ferais si tu ne pouvais pas échouer ?".to_string());

        if situation.contains("objectif") {
            questions.push("Comment sauras-tu que tu as atteint ton objectif ?".to_string());
            questions.push("Quelle sera la première étape concrète ?".to_string());
        }

        if situation.contains("obstacle") {
            questions.push("Qu'est-ce que cet obstacle t'apprend sur toi ?".to_string());
            questions.push("Quelles ressources as-tu déjà utilisées dans le passé ?".to_string());
        }

        questions
    }

    /// Modèle GROW (Goal, Reality, Options, Way forward)
    pub fn apply_grow_model(&self, goal: &str) -> GrowModel {
        GrowModel {
            goal: goal.to_string(),
            reality: "Où en es-tu actuellement par rapport à cet objectif ?".to_string(),
            options: vec![
                "Quelles sont toutes les options possibles ?".to_string(),
                "Qu'est-ce que tu pourrais faire d'autre ?".to_string(),
            ],
            way_forward: "Quelle action concrète vas-tu poser dans les prochaines 24h ?".to_string(),
        }
    }

    /// Plan d'action (accountability)
    pub fn create_action_plan(&self, intention: &str) -> ActionPlan {
        ActionPlan {
            objective: intention.to_string(),
            action_steps: vec![
                ActionStep {
                    description: "Clarifier l'objectif précis".to_string(),
                    deadline: "Aujourd'hui".to_string(),
                    accountability: "Je m'engage à l'écrire".to_string(),
                },
                ActionStep {
                    description: "Identifier la première action minimale".to_string(),
                    deadline: "Demain".to_string(),
                    accountability: "Je pose cette action et j'observe".to_string(),
                },
            ],
            success_indicators: vec![
                "Je me sens plus clair".to_string(),
                "J'ai posé une action concrète".to_string(),
            ],
        }
    }

    /// Roue de la vie (satisfaction dans 8 domaines)
    pub fn life_wheel_assessment(&self) -> LifeWheel {
        LifeWheel {
            domains: vec![
                ("Santé".to_string(), 0),
                ("Relations".to_string(), 0),
                ("Travail".to_string(), 0),
                ("Finances".to_string(), 0),
                ("Croissance personnelle".to_string(), 0),
                ("Loisirs".to_string(), 0),
                ("Environnement".to_string(), 0),
                ("Contribution".to_string(), 0),
            ],
            instruction: "Évalue ta satisfaction de 0 à 10 dans chaque domaine".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CoachingCompetency {
    ActiveListening,
    PowerfulQuestions,
    DirectCommunication,
    ActionPlanning,
    Accountability,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GrowModel {
    pub goal: String,
    pub reality: String,
    pub options: Vec<String>,
    pub way_forward: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionPlan {
    pub objective: String,
    pub action_steps: Vec<ActionStep>,
    pub success_indicators: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionStep {
    pub description: String,
    pub deadline: String,
    pub accountability: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LifeWheel {
    pub domains: Vec<(String, u8)>,
    pub instruction: String,
}
