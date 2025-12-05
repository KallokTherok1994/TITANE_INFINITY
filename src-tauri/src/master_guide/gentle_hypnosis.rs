// TITANE∞ v14.1 - Hypnose Conversationnelle Douce
// Hypnose Ericksonienne adaptée

#![allow(dead_code)]

use serde::{Deserialize, Serialize};

/// Moteur d'hypnose conversationnelle douce
pub struct GentleHypnosis {
    techniques: Vec<HypnosisTechnique>,
    safety_level: SafetyLevel,
}

impl GentleHypnosis {
    pub fn new() -> Self {
        Self {
            techniques: vec![
                HypnosisTechnique::Metaphor,
                HypnosisTechnique::SoftSuggestion,
                HypnosisTechnique::Visualization,
                HypnosisTechnique::Pacing,
            ],
            safety_level: SafetyLevel::Maximum,
        }
    }

    /// Suggère des visualisations douces
    pub fn suggest_visualizations(&self) -> Vec<String> {
        vec![
            "Visualisation : Imagine-toi dans un lieu de sécurité et de calme...".to_string(),
            "Métaphore : Comme une rivière qui trouve son chemin naturellement...".to_string(),
            "Suggestion indirecte : Tu pourrais remarquer que ta respiration devient plus douce...".to_string(),
        ]
    }

    /// Génère une métaphore thérapeutique
    pub fn generate_metaphor(&self, theme: &str) -> MetaphorResponse {
        let metaphor = if theme.contains("changement") {
            MetaphorStory {
                title: "La Chenille et le Papillon".to_string(),
                story: "Imagine une chenille qui, sans savoir comment, sent qu'il est temps de tisser son cocon. Elle ne sait pas ce qui va se passer. Elle fait juste confiance au processus naturel. Et un jour, sans forcer, les ailes apparaissent...".to_string(),
                embedded_suggestion: "Et peut-être que toi aussi, tu peux faire confiance à ton processus naturel de transformation...".to_string(),
            }
        } else if theme.contains("difficulté") || theme.contains("obstacle") {
            MetaphorStory {
                title: "L'Arbre et la Tempête".to_string(),
                story: "Un arbre face à la tempête ne lutte pas contre le vent. Il plie, s'adapte, laisse passer l'énergie. Ses racines restent ancrées pendant que ses branches dansent avec le vent...".to_string(),
                embedded_suggestion: "Et tu peux toi aussi trouver ta façon de rester ancré tout en t'adaptant...".to_string(),
            }
        } else {
            MetaphorStory {
                title: "La Graine et le Temps".to_string(),
                story: "Une graine plantée dans la terre ne se demande pas 'suis-je en train de pousser ?'. Elle pousse simplement, à son rythme, sans forcer. Un jour, une petite pousse apparaît. Puis une tige. Puis une fleur. Tout au bon moment...".to_string(),
                embedded_suggestion: "Et peut-être que tu peux aussi te donner le temps et la permission de grandir à ton rythme...".to_string(),
            }
        };

        MetaphorResponse {
            metaphor,
            invitation: "Prends un moment pour laisser cette image résonner en toi...".to_string(),
        }
    }

    /// Pacing & Leading (synchronisation puis guidance douce)
    pub fn pace_and_lead(&self, current_state: &str) -> PacingLeading {
        PacingLeading {
            pacing: vec![
                format!("Tu es là, maintenant, et tu observes : {}", current_state),
                "Tu respires...".to_string(),
                "Tu ressens ce qui est présent...".to_string(),
            ],
            leading: vec![
                "Et peut-être que tu pourrais remarquer...".to_string(),
                "Qu'il y a aussi un espace de calme qui existe...".to_string(),
                "Même au milieu de tout cela...".to_string(),
            ],
        }
    }

    /// Suggestion permissive (langage Ericksonien)
    pub fn permissive_suggestion(&self, desired_state: &str) -> PermissiveSuggestion {
        PermissiveSuggestion {
            suggestion: format!(
                "Tu pourrais remarquer que {}... ou peut-être pas maintenant, mais bientôt... à ton rythme...",
                desired_state
            ),
            presupposition: "Ton inconscient sait déjà ce dont tu as besoin".to_string(),
            choice: "Tu es libre de laisser venir ce qui vient, ou de le laisser partir".to_string(),
        }
    }

    /// Visualisation guidée simple
    pub fn guided_visualization(&self, intention: &str) -> GuidedVisualization {
        GuidedVisualization {
            intention: intention.to_string(),
            steps: vec![
                "Ferme doucement les yeux si tu le souhaites...".to_string(),
                "Prends trois respirations profondes...".to_string(),
                format!("Imagine maintenant : {}", intention),
                "Observe les détails... les couleurs, les sons, les sensations...".to_string(),
                "Laisse cette image devenir de plus en plus claire...".to_string(),
                "Et quand tu es prêt, ramène ton attention ici, maintenant...".to_string(),
            ],
            grounding: "Prends ton temps pour revenir à ta respiration".to_string(),
        }
    }

    /// Langage hypnotique doux (patterns Ericksoniens)
    pub fn generate_hypnotic_language(&self, theme: &str) -> HypnoticLanguage {
        HypnoticLanguage {
            opening: "Peut-être as-tu remarqué...".to_string(),
            development: format!(
                "Qu'il y a quelque chose en toi qui sait déjà comment {}... même si tu ne sais pas encore consciemment...",
                theme
            ),
            deepening: "Et pendant que tu observes cela... tu peux te sentir de plus en plus...".to_string(),
            reorientation: "Et quand tu es prêt, tu peux revenir ici, avec cette compréhension nouvelle...".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HypnosisTechnique {
    Metaphor,
    SoftSuggestion,
    Visualization,
    Pacing,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SafetyLevel {
    Maximum, // Uniquement suggestions douces
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetaphorStory {
    pub title: String,
    pub story: String,
    pub embedded_suggestion: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetaphorResponse {
    pub metaphor: MetaphorStory,
    pub invitation: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PacingLeading {
    pub pacing: Vec<String>,
    pub leading: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PermissiveSuggestion {
    pub suggestion: String,
    pub presupposition: String,
    pub choice: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GuidedVisualization {
    pub intention: String,
    pub steps: Vec<String>,
    pub grounding: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HypnoticLanguage {
    pub opening: String,
    pub development: String,
    pub deepening: String,
    pub reorientation: String,
}
