// TITANE∞ v14.1 - Guidance Engine
// Moteur de fusion holistique

#![allow(dead_code)]

use serde::{Deserialize, Serialize};

/// Moteur de guidance holistique
pub struct GuidanceEngine {
    integration_level: u8,
}

impl GuidanceEngine {
    pub fn new() -> Self {
        Self {
            integration_level: 1,
        }
    }

    /// Fusionne les différentes approches en guidance cohérente
    pub fn synthesize_guidance(
        &self,
        psychology_insights: Vec<String>,
        coaching_tools: Vec<String>,
        nlp_reframes: Vec<String>,
        hypnosis_metaphors: Vec<String>,
        meditation_practices: Vec<String>,
    ) -> HolisticGuidance {
        HolisticGuidance {
            core_message: self.extract_core_message(&psychology_insights, &coaching_tools),
            embodiment_practices: meditation_practices,
            cognitive_tools: coaching_tools,
            reframing_perspectives: nlp_reframes,
            metaphors: hypnosis_metaphors,
            integration_suggestion: self.generate_integration_path(),
        }
    }

    fn extract_core_message(&self, psychology: &[String], coaching: &[String]) -> String {
        if !psychology.is_empty() {
            format!("Message central : {}", psychology[0])
        } else if !coaching.is_empty() {
            format!("Direction : {}", coaching[0])
        } else {
            "Reste présent à ce qui émerge".to_string()
        }
    }

    fn generate_integration_path(&self) -> String {
        "Commence par une pratique d'ancrage (méditation 5 min), puis explore une perspective nouvelle (PNL), et enfin pose une action concrète (coaching).".to_string()
    }

    /// Adapte la profondeur selon le niveau de confiance
    pub fn adapt_depth(&mut self, trust_level: f32, emotional_intensity: f32) {
        if trust_level > 0.8 && emotional_intensity < 0.5 {
            self.integration_level = 3; // Profond
        } else if trust_level > 0.6 {
            self.integration_level = 2; // Modéré
        } else {
            self.integration_level = 1; // Léger
        }
    }

    /// Génère un parcours progressif
    pub fn generate_journey(&self, intention: &str) -> GuidanceJourney {
        GuidanceJourney {
            intention: intention.to_string(),
            steps: vec![
                JourneyStep {
                    phase: "Accueil".to_string(),
                    action: "Reconnaître ce qui est présent sans jugement".to_string(),
                    practice: "3 respirations conscientes".to_string(),
                },
                JourneyStep {
                    phase: "Exploration".to_string(),
                    action: "Clarifier l'intention et les besoins".to_string(),
                    practice: "Questions puissantes du coaching".to_string(),
                },
                JourneyStep {
                    phase: "Transformation".to_string(),
                    action: "Ouvrir de nouvelles perspectives".to_string(),
                    practice: "Recadrage PNL + Métaphore".to_string(),
                },
                JourneyStep {
                    phase: "Intégration".to_string(),
                    action: "Ancrer dans le corps et l'action".to_string(),
                    practice: "Méditation + Plan d'action".to_string(),
                },
            ],
            duration: "1-2 heures (ou plusieurs sessions)".to_string(),
        }
    }

    /// Détecte si guidance thérapeutique nécessaire (alerte)
    pub fn detect_therapeutic_need(&self, content: &str) -> TherapeuticAlert {
        let crisis_keywords = ["suicide", "me faire du mal", "plus envie de vivre"];
        let medical_keywords = ["dépression sévère", "trouble", "diagnostic"];

        let is_crisis = crisis_keywords.iter().any(|k| content.to_lowercase().contains(k));
        let is_medical = medical_keywords.iter().any(|k| content.to_lowercase().contains(k));

        if is_crisis {
            TherapeuticAlert {
                level: AlertLevel::Critical,
                message: "⚠️ Situation critique détectée. Il est essentiel de contacter immédiatement un professionnel de santé mentale ou un service d'urgence.".to_string(),
                resources: vec![
                    "France : 3114 (Numéro national de prévention du suicide)".to_string(),
                    "SOS Amitié : 09 72 39 40 50".to_string(),
                ],
            }
        } else if is_medical {
            TherapeuticAlert {
                level: AlertLevel::High,
                message: "Cette situation semble nécessiter l'accompagnement d'un professionnel de santé mentale (psychologue, psychiatre).".to_string(),
                resources: vec![
                    "Consulte ton médecin traitant pour une orientation".to_string(),
                    "Doctolib : recherche de psychologues près de chez toi".to_string(),
                ],
            }
        } else {
            TherapeuticAlert {
                level: AlertLevel::None,
                message: "Guidance holistique adaptée".to_string(),
                resources: vec![],
            }
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HolisticGuidance {
    pub core_message: String,
    pub embodiment_practices: Vec<String>,
    pub cognitive_tools: Vec<String>,
    pub reframing_perspectives: Vec<String>,
    pub metaphors: Vec<String>,
    pub integration_suggestion: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GuidanceJourney {
    pub intention: String,
    pub steps: Vec<JourneyStep>,
    pub duration: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JourneyStep {
    pub phase: String,
    pub action: String,
    pub practice: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TherapeuticAlert {
    pub level: AlertLevel,
    pub message: String,
    pub resources: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AlertLevel {
    None,
    High,
    Critical,
}
