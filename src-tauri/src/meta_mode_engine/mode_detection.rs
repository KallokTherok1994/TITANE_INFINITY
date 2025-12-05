#![allow(dead_code)]
//! 🔮 MODE DETECTION ENGINE
//! Détection automatique du mode optimal selon état/contexte/besoin réel de Kevin

use super::{TitaneMode, KevinState};

pub struct ModeDetector {
    // Historique de détections pour affiner
    detection_accuracy: f32,
}

impl ModeDetector {
    pub fn new() -> Self {
        Self {
            detection_accuracy: 0.8,
        }
    }
    
    /// **Détecte le mode optimal à partir de l'état Kevin**
    pub fn detect_optimal_mode(&self, state: &KevinState, _current_mode: &TitaneMode) -> TitaneMode {
        // Priorité 1 : Détresse émotionnelle → Thérapeute ou Méditation
        if state.stress_level > 0.8 || state.emotional_tone == "overwhelmed" {
            return TitaneMode::TherapeuteHumaniste;
        }
        
        if state.saturation_level > 0.8 || state.need_rest {
            return TitaneMode::MeditationTitaneZero;
        }
        
        // Priorité 2 : Besoin de décision → Coach ICF
        if state.task_type == "decision" || state.need_guidance {
            return TitaneMode::CoachProfessionnelICF;
        }
        
        // Priorité 3 : Confusion cognitive → PNL (recadrage)
        if state.emotional_tone == "confused" || state.clarity_level < 0.3 {
            return TitaneMode::PNLMasterPractitioner;
        }
        
        // Priorité 3b : Introspection profonde → Hypnose douce
        if state.task_type == "introspection" && state.stress_level < 0.7 {
            return TitaneMode::HypnoseDouceCeNonMedicale;
        }
        
        // Priorité 4 : Création → Creator Engine
        if state.task_type == "creation" || state.need_creativity {
            return TitaneMode::CreatorEngine;
        }
        
        // Priorité 5 : Analyse → Analyste
        if state.task_type == "analysis" {
            return TitaneMode::Analyste;
        }
        
        // Priorité 6 : Vision globale → Stratège
        if state.need_structure && state.clarity_level > 0.6 {
            return TitaneMode::Strategiste;
        }
        
        // Priorité 6b : Architecture systémique
        if state.task_type == "architecture" && state.clarity_level > 0.6 {
            return TitaneMode::ArchitecteSystemique;
        }
        
        // Priorité 7 : Autonomie productive → Autopilot
        if state.need_autonomy && state.energy_level > 0.6 && state.clarity_level > 0.5 {
            return TitaneMode::AutopilotProactif;
        }
        
        // Priorité 8 : Voice Mode
        if state.task_type == "voice" {
            return TitaneMode::VoiceMode;
        }
        
        // Priorité 9 : Prévision/Anticipation → Forecast
        if state.task_type == "forecast" {
            return TitaneMode::ForecastEngine;
        }
        
        // Par défaut : Digital Twin (mode universel)
        TitaneMode::DigitalTwin
    }
    
    /// Détecte si l'input contient des mots-clés à risque
    pub fn detect_risk(&self, input: &str) -> bool {
        let risk_keywords = ["suppr", "efface", "détruit", "tout", "delete", "remove all"];
        let input_lower = input.to_lowercase();
        risk_keywords.iter().any(|k| input_lower.contains(k))
    }
}
