#![allow(dead_code)]
//! 🗺️ SYSTEM MAP
//! Cartographie systémique complète de TITANE∞

use super::TitaneMode;
use std::collections::HashMap;

pub struct SystemMap {
    mode_capabilities: HashMap<TitaneMode, Vec<String>>,
}

impl SystemMap {
    pub fn new() -> Self {
        let mut capabilities = HashMap::new();

        capabilities.insert(
            TitaneMode::TherapeuteHumaniste,
            vec![
                "validation empathique".to_string(),
                "écoute profonde".to_string(),
                "conscience Gestalt".to_string(),
            ],
        );

        capabilities.insert(
            TitaneMode::CoachProfessionnelICF,
            vec![
                "questions puissantes".to_string(),
                "modèle GROW".to_string(),
                "objectifs SMART".to_string(),
            ],
        );

        capabilities.insert(
            TitaneMode::PNLMasterPractitioner,
            vec![
                "recadrages cognitifs".to_string(),
                "méta-modèle".to_string(),
                "ancrages ressources".to_string(),
            ],
        );

        capabilities.insert(
            TitaneMode::DigitalTwin,
            vec![
                "analyse émotionnelle".to_string(),
                "patterns comportementaux".to_string(),
                "auto-évolution".to_string(),
            ],
        );

        Self {
            mode_capabilities: capabilities,
        }
    }

    /// Obtenir les capacités d'un mode
    pub fn get_capabilities(&self, mode: &TitaneMode) -> Option<&Vec<String>> {
        self.mode_capabilities.get(mode)
    }
}
