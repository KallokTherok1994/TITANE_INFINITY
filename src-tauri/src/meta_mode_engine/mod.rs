#![allow(dead_code)]
//! ╔═══════════════════════════════════════════════════════════════════════════╗
//! ║                   TITANE∞ v14.1 — META-MODE ENGINE                        ║
//! ║              Système d'accompagnement multidisciplinaire intelligent       ║
//! ╚═══════════════════════════════════════════════════════════════════════════╝
//!
//! **Intégration de TOUS les modes TITANE∞ :**
//! - Thérapeute Humaniste + Coach ICF + PNL + Hypnose + Méditation TITANE ZÉRO
//! - Digital Twin + Autopilot + Creator + Strategist + Analyst
//! - Emotional Engine + Behavioral Engine + LifeEngine + Voice Mode
//! - Forecast + Risk + Consistency + OmniContext
//!
//! **Capacités :**
//! - Détection automatique du mode optimal selon état/contexte/besoin réel
//! - Transitions fluides sans friction entre modes
//! - Adaptation temps réel émotionnelle et comportementale
//! - Fusion avec Digital Twin pour cohérence Kevin+

use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use chrono::{DateTime, Utc};

// Modules du Meta-Mode Engine
pub mod mode_detection;
pub mod mode_transition;
pub mod mode_intuition;
pub mod emotional_sync;
pub mod behavior_sync;
pub mod life_rhythm;
pub mod context_engine;
pub mod digital_twin_bridge;
pub mod autopilot_core;
pub mod therapeutic_core;
pub mod coach_core;
pub mod pnl_core;
pub mod hypnose_core;
pub mod meditation_core;
pub mod creator_core;
pub mod strategist_core;
pub mod analyst_core;
pub mod system_map;
pub mod selfheal;

use mode_detection::ModeDetector;
use mode_transition::ModeTransitioner;
use emotional_sync::EmotionalSynchronizer;
use behavior_sync::BehaviorSynchronizer;
use digital_twin_bridge::DigitalTwinBridge;

/// **Mode actif dans TITANE∞ v14.1**
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum TitaneMode {
    // Modes d'accompagnement humain
    TherapeuteHumaniste,
    CoachProfessionnelICF,
    PNLMasterPractitioner,
    HypnoseDouceCeNonMedicale,
    MeditationTitaneZero,
    
    // Modes cognitifs & internes
    DigitalTwin,
    EmotionalEngine,
    BehavioralEngine,
    LifeEngine,
    ClarityEngine,
    MeaningEngine,
    
    // Modes stratégiques
    Strategiste,
    ArchitecteSystemique,
    Analyste,
    FocusEngine,
    ProjectNavigator,
    
    // Modes productifs
    AutopilotProactif,
    CreatorEngine,
    Optimizer,
    RefactorEngine,
    
    // Modes immersifs
    VoiceMode,
    VoiceIntuitive,
    DeepPresenceMode,
    
    // Modes avancés
    ForecastEngine,
    RiskDetector,
    HolisticConsistency,
    OmniContext,
}

impl TitaneMode {
    /// Obtenir le nom humain du mode
    pub fn name(&self) -> &str {
        match self {
            TitaneMode::TherapeuteHumaniste => "Maître-Thérapeute Humaniste",
            TitaneMode::CoachProfessionnelICF => "Coach Professionnel ICF",
            TitaneMode::PNLMasterPractitioner => "PNL Master Practitioner",
            TitaneMode::HypnoseDouceCeNonMedicale => "Hypnose douce non médicale",
            TitaneMode::MeditationTitaneZero => "Méditation profonde TITANE ZÉRO",
            TitaneMode::DigitalTwin => "Digital Twin (Kevin+)",
            TitaneMode::EmotionalEngine => "Emotional Engine",
            TitaneMode::BehavioralEngine => "Behavioral Engine",
            TitaneMode::LifeEngine => "LifeEngine",
            TitaneMode::ClarityEngine => "Clarity Engine",
            TitaneMode::MeaningEngine => "Meaning Engine",
            TitaneMode::Strategiste => "Stratège",
            TitaneMode::ArchitecteSystemique => "Architecte Systémique",
            TitaneMode::Analyste => "Analyste",
            TitaneMode::FocusEngine => "Focus Engine",
            TitaneMode::ProjectNavigator => "Project Navigator",
            TitaneMode::AutopilotProactif => "Autopilot Proactif",
            TitaneMode::CreatorEngine => "Creator Engine",
            TitaneMode::Optimizer => "Optimizer",
            TitaneMode::RefactorEngine => "Refactor Engine",
            TitaneMode::VoiceMode => "Voice Mode",
            TitaneMode::VoiceIntuitive => "Voice Intuitive",
            TitaneMode::DeepPresenceMode => "Deep Presence Mode",
            TitaneMode::ForecastEngine => "Forecast Engine",
            TitaneMode::RiskDetector => "Risk Detector",
            TitaneMode::HolisticConsistency => "Holistic Consistency Engine",
            TitaneMode::OmniContext => "OmniContext",
        }
    }
}

/// **État global de Kevin détecté en temps réel**
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KevinState {
    // État émotionnel
    pub emotional_tone: String,          // calm, overwhelmed, tired, motivated, confused
    pub stress_level: f32,                // 0.0-1.0
    pub emotional_stability: f32,         // 0.0-1.0
    
    // État cognitif
    pub cognitive_load: f32,              // 0.0-1.0
    pub clarity_level: f32,               // 0.0-1.0
    pub focus_level: f32,                 // 0.0-1.0
    
    // État énergétique
    pub energy_level: f32,                // 0.0-1.0
    pub saturation_level: f32,            // 0.0-1.0
    
    // Besoins détectés
    pub need_structure: bool,
    pub need_validation: bool,
    pub need_guidance: bool,
    pub need_autonomy: bool,
    pub need_creativity: bool,
    pub need_rest: bool,
    
    // Contexte
    pub task_type: String,                // creation, analysis, decision, exploration, etc.
    pub implicit_signals: Vec<String>,    // signaux non-verbaux détectés
    
    pub timestamp: DateTime<Utc>,
}

/// **Réponse Meta-Mode adaptée**
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetaModeResponse {
    pub active_mode: TitaneMode,
    pub mode_justification: String,
    pub content: String,
    pub adapted_tone: String,            // chaleureux, neutre, direct, profond
    pub adapted_depth: String,           // surface, medium, deep, profound
    pub adapted_speed: String,           // slow, normal, fast
    pub next_suggested_modes: Vec<TitaneMode>,
    pub timestamp: DateTime<Utc>,
}

/// **Configuration du Meta-Mode Engine**
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetaModeConfig {
    pub enable_auto_detection: bool,
    pub enable_transitions: bool,
    pub enable_emotional_sync: bool,
    pub enable_behavioral_sync: bool,
    pub enable_digital_twin_fusion: bool,
    pub history_size: usize,
}

impl Default for MetaModeConfig {
    fn default() -> Self {
        Self {
            enable_auto_detection: true,
            enable_transitions: true,
            enable_emotional_sync: true,
            enable_behavioral_sync: true,
            enable_digital_twin_fusion: true,
            history_size: 100,
        }
    }
}

/// **Meta-Mode Engine principal — Pilote tous les modes TITANE∞**
pub struct MetaModeEngine {
    config: MetaModeConfig,
    
    // Moteurs internes
    mode_detector: ModeDetector,
    mode_transitioner: ModeTransitioner,
    pub emotional_sync: EmotionalSynchronizer,
    behavior_sync: BehaviorSynchronizer,
    twin_bridge: DigitalTwinBridge,
    
    // État (public pour accès Tauri)
    pub current_mode: TitaneMode,
    pub kevin_state: KevinState,
    pub mode_history: VecDeque<(TitaneMode, DateTime<Utc>)>,
    pub response_history: VecDeque<MetaModeResponse>,
}

impl MetaModeEngine {
    /// Créer un nouveau Meta-Mode Engine
    pub fn new(config: MetaModeConfig) -> Self {
        let mode_detector = ModeDetector::new();
        let mode_transitioner = ModeTransitioner::new();
        let emotional_sync = EmotionalSynchronizer::new();
        let behavior_sync = BehaviorSynchronizer::new();
        let twin_bridge = DigitalTwinBridge::new();
        
        let initial_state = KevinState {
            emotional_tone: "neutral".to_string(),
            stress_level: 0.3,
            emotional_stability: 0.7,
            cognitive_load: 0.4,
            clarity_level: 0.6,
            focus_level: 0.5,
            energy_level: 0.6,
            saturation_level: 0.3,
            need_structure: false,
            need_validation: false,
            need_guidance: false,
            need_autonomy: true,
            need_creativity: false,
            need_rest: false,
            task_type: "general".to_string(),
            implicit_signals: vec![],
            timestamp: Utc::now(),
        };
        
        Self {
            config,
            mode_detector,
            mode_transitioner,
            emotional_sync,
            behavior_sync,
            twin_bridge,
            current_mode: TitaneMode::DigitalTwin,
            kevin_state: initial_state,
            mode_history: VecDeque::with_capacity(100),
            response_history: VecDeque::with_capacity(100),
        }
    }
    
    /// **MÉTHODE PRINCIPALE : Traiter une interaction avec détection auto du mode optimal**
    pub fn process_interaction(&mut self, input: &str, context: &str) -> MetaModeResponse {
        // 1. Détection intuitive de l'état Kevin
        self.kevin_state = self.detect_kevin_state(input, context);
        
        // 2. Synchronisation émotionnelle et comportementale
        if self.config.enable_emotional_sync {
            self.emotional_sync.synchronize(&self.kevin_state);
        }
        if self.config.enable_behavioral_sync {
            self.behavior_sync.synchronize(input);
        }
        
        // 3. Détection du mode optimal
        let optimal_mode = if self.config.enable_auto_detection {
            self.mode_detector.detect_optimal_mode(&self.kevin_state, &self.current_mode)
        } else {
            self.current_mode.clone()
        };
        
        // 3b. Vérifier si input contient risque → override RiskDetector
        let optimal_mode = if self.mode_detector.detect_risk(input) {
            TitaneMode::RiskDetector
        } else {
            optimal_mode
        };
        
        // 4. Transition fluide si changement de mode
        let (active_mode, transition_smooth) = if optimal_mode != self.current_mode && self.config.enable_transitions {
            let smooth = self.mode_transitioner.transition(&self.current_mode, &optimal_mode, &self.kevin_state);
            self.current_mode = optimal_mode.clone();
            self.mode_history.push_back((optimal_mode.clone(), Utc::now()));
            if self.mode_history.len() > self.config.history_size {
                self.mode_history.pop_front();
            }
            (optimal_mode, smooth)
        } else {
            (self.current_mode.clone(), true)
        };
        
        // 5. Exécution du mode avec fusion Digital Twin
        let content = self.execute_mode(&active_mode, input, context);
        
        // 6. Adaptation dynamique (ton, profondeur, vitesse)
        let adapted_tone = self.adapt_tone(&self.kevin_state);
        let adapted_depth = self.adapt_depth(&self.kevin_state);
        let adapted_speed = self.adapt_speed(&self.kevin_state);
        
        // 7. Suggestion des prochains modes
        let next_suggested_modes = self.suggest_next_modes(&active_mode, &self.kevin_state);
        
        // 8. Construire la réponse
        let response = MetaModeResponse {
            active_mode: active_mode.clone(),
            mode_justification: format!(
                "Mode {} activé : {} (transition: {})",
                active_mode.name(),
                self.justify_mode(&active_mode, &self.kevin_state),
                if transition_smooth { "fluide" } else { "brute" }
            ),
            content,
            adapted_tone,
            adapted_depth,
            adapted_speed,
            next_suggested_modes,
            timestamp: Utc::now(),
        };
        
        // 9. Sauvegarder dans l'historique
        self.response_history.push_back(response.clone());
        if self.response_history.len() > self.config.history_size {
            self.response_history.pop_front();
        }
        
        response
    }
    
    /// Détecter l'état global de Kevin à partir de l'input
    fn detect_kevin_state(&self, input: &str, context: &str) -> KevinState {
        // Utilise les moteurs d'analyse pour détecter l'état réel
        let emotional_tone = self.detect_emotional_tone(input);
        let stress_level = self.detect_stress(input);
        let cognitive_load = self.estimate_cognitive_load(input);
        let clarity_level = self.assess_clarity(input);
        let energy_level = self.estimate_energy(input);
        
        KevinState {
            emotional_tone,
            stress_level,
            emotional_stability: 1.0 - stress_level,
            cognitive_load,
            clarity_level,
            focus_level: if cognitive_load < 0.5 { 0.7 } else { 0.4 },
            energy_level,
            saturation_level: cognitive_load * 0.8,
            need_structure: input.contains("perdu") || input.contains("bloqu") || cognitive_load > 0.7,
            need_validation: input.contains("bon") || input.contains("correct") || stress_level > 0.6,
            need_guidance: input.contains("aide") || input.contains("comment") || clarity_level < 0.4,
            need_autonomy: input.contains("seul") || input.contains("continue") || energy_level > 0.6,
            need_creativity: input.contains("cr") || input.contains("nouveau") || input.contains("id"),
            need_rest: energy_level < 0.3 || cognitive_load > 0.8,
            task_type: self.detect_task_type(input, context),
            implicit_signals: self.detect_implicit_signals(input),
            timestamp: Utc::now(),
        }
    }
    
    fn detect_emotional_tone(&self, input: &str) -> String {
        let lower = input.to_lowercase();
        if lower.contains("stress") || lower.contains("angoiss") || lower.contains("paniqu") {
            "overwhelmed".to_string()
        } else if lower.contains("fatigu") || lower.contains("puis") || lower.contains("lent") {
            "tired".to_string()
        } else if lower.contains("motiv") || lower.contains("excit") || lower.contains("let's go") {
            "motivated".to_string()
        } else if lower.contains("perdu") || lower.contains("confus") || lower.contains("comprends pas") {
            "confused".to_string()
        } else {
            "calm".to_string()
        }
    }
    
    fn detect_stress(&self, input: &str) -> f32 {
        let stress_keywords = ["urgent", "vite", "probl", "erreur", "bug", "cass", "marche pas"];
        let count = stress_keywords.iter().filter(|kw| input.to_lowercase().contains(*kw)).count();
        (count as f32 * 0.2).min(1.0)
    }
    
    fn estimate_cognitive_load(&self, input: &str) -> f32 {
        let complexity = input.split_whitespace().count() as f32 / 100.0;
        complexity.min(1.0)
    }
    
    fn assess_clarity(&self, input: &str) -> f32 {
        let clarity_indicators = ["clair", "pr cis", "exact", "simple"];
        let confusion_indicators = ["confus", "perdu", "comprends pas", "compliqué"];
        let clarity_score = clarity_indicators.iter().filter(|kw| input.to_lowercase().contains(*kw)).count() as f32;
        let confusion_score = confusion_indicators.iter().filter(|kw| input.to_lowercase().contains(*kw)).count() as f32;
        ((clarity_score - confusion_score + 5.0) / 10.0).clamp(0.0, 1.0)
    }
    
    fn estimate_energy(&self, input: &str) -> f32 {
        let energy_markers = ["go", "continue", "!", "rapide", "actif"];
        let fatigue_markers = ["fatigu", "lent", "...", "pause"];
        let energy_score = energy_markers.iter().filter(|kw| input.to_lowercase().contains(*kw)).count() as f32;
        let fatigue_score = fatigue_markers.iter().filter(|kw| input.to_lowercase().contains(*kw)).count() as f32;
        ((energy_score - fatigue_score + 5.0) / 10.0).clamp(0.0, 1.0)
    }
    
    fn detect_task_type(&self, input: &str, _context: &str) -> String {
        let lower = input.to_lowercase();
        if lower.contains("cr") || lower.contains("nouveau") || lower.contains("g n r") {
            "creation".to_string()
        } else if lower.contains("analys") || lower.contains("v rif") || lower.contains("audit") {
            "analysis".to_string()
        } else if lower.contains("d cid") || lower.contains("choisir") || lower.contains("option") {
            "decision".to_string()
        } else if lower.contains("explor") || lower.contains("recherch") || lower.contains("d couv") {
            "exploration".to_string()
        } else if lower.contains("corrig") || lower.contains("fix") || lower.contains("r par") {
            "correction".to_string()
        } else {
            "general".to_string()
        }
    }
    
    fn detect_implicit_signals(&self, input: &str) -> Vec<String> {
        let mut signals = vec![];
        if input.contains("...") { signals.push("hésitation".to_string()); }
        if input.contains("!!") { signals.push("urgence".to_string()); }
        if input.len() < 20 { signals.push("concision".to_string()); }
        if input.split('\n').count() > 5 { signals.push("détail".to_string()); }
        signals
    }
    
    /// Exécuter le mode actif avec fusion Digital Twin
    fn execute_mode(&self, mode: &TitaneMode, input: &str, _context: &str) -> String {
        let base_response = match mode {
            TitaneMode::TherapeuteHumaniste => self.execute_therapeutic(input),
            TitaneMode::CoachProfessionnelICF => self.execute_coaching(input),
            TitaneMode::PNLMasterPractitioner => self.execute_pnl(input),
            TitaneMode::HypnoseDouceCeNonMedicale => self.execute_hypnosis(input),
            TitaneMode::MeditationTitaneZero => self.execute_meditation(input),
            TitaneMode::DigitalTwin => format!("Digital Twin Kevin+ analyse : {}", input),
            TitaneMode::AutopilotProactif => self.execute_autopilot(input),
            TitaneMode::CreatorEngine => self.execute_creator(input),
            TitaneMode::Strategiste => self.execute_strategist(input),
            TitaneMode::Analyste => self.execute_analyst(input),
            TitaneMode::ArchitecteSystemique => self.execute_architect(input),
            TitaneMode::RiskDetector => self.execute_risk_detector(input),
            TitaneMode::ForecastEngine => self.execute_forecast(input),
            TitaneMode::VoiceMode => self.execute_voice(input),
            _ => format!("Mode {} : traitement de '{}'", mode.name(), input),
        };
        
        // Fusion avec Digital Twin pour cohérence Kevin+
        if self.config.enable_digital_twin_fusion {
            self.twin_bridge.fuse_with_kevin_style(&base_response, &self.kevin_state)
        } else {
            base_response
        }
    }
    
    fn execute_therapeutic(&self, input: &str) -> String {
        format!("🌿 Thérapeute : Je t'écoute profondément. {} [validation empathique]", input)
    }
    
    fn execute_coaching(&self, input: &str) -> String {
        format!("🎯 Coach ICF : Quelle est ta priorité réelle ici ? {} [question puissante]", input)
    }
    
    fn execute_pnl(&self, input: &str) -> String {
        format!("🧠 PNL : Recadrage possible : {} [nouvelle perspective]", input)
    }
    
    fn execute_hypnosis(&self, input: &str) -> String {
        format!("🌀 Hypnose douce : Imagine que... {} [métaphore thérapeutique]", input)
    }
    
    fn execute_meditation(&self, _input: &str) -> String {
        "🧘 TITANE ZÉRO : Ancre-toi. Respire. Observe. Dissous. ZÉRO. Reviens.".to_string()
    }
    
    fn execute_autopilot(&self, input: &str) -> String {
        format!("🚀 Autopilot : J'avance de manière autonome sur : {}", input)
    }
    
    fn execute_creator(&self, input: &str) -> String {
        format!("✨ Creator : Génération de contenu structuré pour : {}", input)
    }
    
    fn execute_strategist(&self, input: &str) -> String {
        format!("🗺️ Stratège : Vision globale et séquence d'actions pour : {}", input)
    }
    
    fn execute_analyst(&self, input: &str) -> String {
        format!("🔍 Analyste : Analyse systématique et logique de : {}", input)
    }
    
    fn execute_architect(&self, input: &str) -> String {
        format!("🏗️ Architecte : Conception système et framework pour : {}", input)
    }
    
    fn execute_risk_detector(&self, input: &str) -> String {
        format!("⚠️ Risk Detector : ATTENTION - Action potentiellement risquée détectée : '{}'\n\
                Analyse d'impact recommandée avant exécution.", input)
    }
    
    fn execute_forecast(&self, input: &str) -> String {
        format!("🔮 Forecast Engine : Anticipation proactive - Analyse des étapes futures pour : {}", input)
    }
    
    fn execute_voice(&self, input: &str) -> String {
        format!("🎤 Voice Mode : Interaction vocale activée - Traitement : {}", input)
    }
    
    /// Adapter le ton selon l'état Kevin
    fn adapt_tone(&self, state: &KevinState) -> String {
        if state.stress_level > 0.7 {
            "chaleureux et apaisant".to_string()
        } else if state.emotional_tone == "motivated" {
            "dynamique et encourageant".to_string()
        } else if state.clarity_level < 0.4 {
            "clair et structuré".to_string()
        } else {
            "neutre et précis".to_string()
        }
    }
    
    fn adapt_depth(&self, state: &KevinState) -> String {
        if state.cognitive_load > 0.7 {
            "surface".to_string()
        } else if state.clarity_level > 0.7 && state.energy_level > 0.6 {
            "profound".to_string()
        } else {
            "medium".to_string()
        }
    }
    
    fn adapt_speed(&self, state: &KevinState) -> String {
        if state.saturation_level > 0.7 || state.stress_level > 0.6 {
            "slow".to_string()
        } else if state.energy_level > 0.7 && state.clarity_level > 0.6 {
            "fast".to_string()
        } else {
            "normal".to_string()
        }
    }
    
    fn suggest_next_modes(&self, _current: &TitaneMode, state: &KevinState) -> Vec<TitaneMode> {
        let mut suggestions = vec![];
        
        if state.stress_level > 0.6 {
            suggestions.push(TitaneMode::TherapeuteHumaniste);
            suggestions.push(TitaneMode::MeditationTitaneZero);
        }
        
        if state.need_structure {
            suggestions.push(TitaneMode::ArchitecteSystemique);
            suggestions.push(TitaneMode::Strategiste);
        }
        
        if state.need_creativity {
            suggestions.push(TitaneMode::CreatorEngine);
        }
        
        if state.task_type == "decision" {
            suggestions.push(TitaneMode::CoachProfessionnelICF);
            suggestions.push(TitaneMode::Analyste);
        }
        
        suggestions
    }
    
    fn justify_mode(&self, _mode: &TitaneMode, state: &KevinState) -> String {
        format!(
            "stress={:.1}, clarté={:.1}, énergie={:.1}, tâche={}",
            state.stress_level,
            state.clarity_level,
            state.energy_level,
            state.task_type
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_meta_mode_engine_creation() {
        let engine = MetaModeEngine::new(MetaModeConfig::default());
        assert_eq!(engine.current_mode, TitaneMode::DigitalTwin);
    }
    
    #[test]
    fn test_mode_detection() {
        let mut engine = MetaModeEngine::new(MetaModeConfig::default());
        let response = engine.process_interaction("Je suis stressé et perdu", "");
        // Devrait activer mode thérapeutique
        println!("Mode activé : {}", response.active_mode.name());
    }
}
