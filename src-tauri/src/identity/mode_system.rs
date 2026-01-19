// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — MODE SYSTEM ENGINE
//   Gestion des modes opérationnels
// ═══════════════════════════════════════════════════════════════

use super::{CommunicationStyle, EmotionalLevel, OperationalMode, Tone};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Configuration d'un mode opérationnel
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModeConfig {
    pub mode: OperationalMode,
    pub name: String,
    pub description: String,
    pub icon: String,
    /// Style de communication pour ce mode
    pub communication_style: CommunicationStyle,
    /// Niveau émotionnel pour ce mode
    pub emotional_level: EmotionalLevel,
    /// Tonalité par défaut
    pub default_tone: Tone,
    /// Verbosité (0.0 = minimal, 1.0 = très détaillé)
    pub verbosity: f32,
    /// Proactivité (0.0 = réactif, 1.0 = très proactif)
    pub proactivity: f32,
    /// Créativité autorisée (0.0 - 1.0)
    pub creativity: f32,
    /// Rigueur (0.0 = flexible, 1.0 = strict)
    pub rigor: f32,
    /// Fonctionnalités activées
    pub features: ModeFeatures,
    /// Contraintes
    pub constraints: ModeConstraints,
}

/// Fonctionnalités du mode
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModeFeatures {
    pub suggestions_enabled: bool,
    pub emojis_enabled: bool,
    pub code_blocks_enabled: bool,
    pub diagrams_enabled: bool,
    pub voice_enabled: bool,
    pub auto_save_enabled: bool,
    pub learning_enabled: bool,
}

impl Default for ModeFeatures {
    fn default() -> Self {
        Self {
            suggestions_enabled: true,
            emojis_enabled: true,
            code_blocks_enabled: true,
            diagrams_enabled: true,
            voice_enabled: true,
            auto_save_enabled: true,
            learning_enabled: true,
        }
    }
}

/// Contraintes du mode
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModeConstraints {
    pub max_response_length: Option<usize>,
    pub max_thinking_time_ms: Option<u64>,
    pub allowed_topics: Option<Vec<String>>,
    pub forbidden_topics: Option<Vec<String>>,
    pub require_citations: bool,
    pub require_step_by_step: bool,
}

impl Default for ModeConstraints {
    fn default() -> Self {
        Self {
            max_response_length: None,
            max_thinking_time_ms: None,
            allowed_topics: None,
            forbidden_topics: None,
            require_citations: false,
            require_step_by_step: false,
        }
    }
}

/// Gestionnaire de modes
pub struct ModeSystemEngine {
    current_mode: OperationalMode,
    mode_configs: HashMap<OperationalMode, ModeConfig>,
    mode_history: Vec<ModeTransition>,
    auto_switch_enabled: bool,
}

/// Transition de mode
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModeTransition {
    pub timestamp: String,
    pub from_mode: OperationalMode,
    pub to_mode: OperationalMode,
    pub reason: String,
    pub automatic: bool,
}

impl Default for ModeSystemEngine {
    fn default() -> Self {
        let mut engine = Self {
            current_mode: OperationalMode::Standard,
            mode_configs: HashMap::new(),
            mode_history: vec![],
            auto_switch_enabled: true,
        };
        engine.initialize_modes();
        engine
    }
}

impl ModeSystemEngine {
    /// Initialise tous les modes
    fn initialize_modes(&mut self) {
        // Standard
        self.mode_configs.insert(
            OperationalMode::Standard,
            ModeConfig {
                mode: OperationalMode::Standard,
                name: "Standard".to_string(),
                description: "Mode équilibré pour usage général".to_string(),
                icon: "⚖️".to_string(),
                communication_style: CommunicationStyle::Casual,
                emotional_level: EmotionalLevel::Warm,
                default_tone: Tone::Friendly,
                verbosity: 0.5,
                proactivity: 0.5,
                creativity: 0.5,
                rigor: 0.5,
                features: ModeFeatures::default(),
                constraints: ModeConstraints::default(),
            },
        );

        // Focus
        self.mode_configs.insert(
            OperationalMode::Focus,
            ModeConfig {
                mode: OperationalMode::Focus,
                name: "Focus".to_string(),
                description: "Mode productivité maximale".to_string(),
                icon: "🎯".to_string(),
                communication_style: CommunicationStyle::Concise,
                emotional_level: EmotionalLevel::Neutral,
                default_tone: Tone::Professional,
                verbosity: 0.3,
                proactivity: 0.7,
                creativity: 0.3,
                rigor: 0.8,
                features: ModeFeatures {
                    emojis_enabled: false,
                    ..Default::default()
                },
                constraints: ModeConstraints {
                    max_response_length: Some(500),
                    ..Default::default()
                },
            },
        );

        // Creative
        self.mode_configs.insert(
            OperationalMode::Creative,
            ModeConfig {
                mode: OperationalMode::Creative,
                name: "Créatif".to_string(),
                description: "Mode exploration et idéation".to_string(),
                icon: "🎨".to_string(),
                communication_style: CommunicationStyle::Elaborate,
                emotional_level: EmotionalLevel::Enthusiastic,
                default_tone: Tone::Playful,
                verbosity: 0.8,
                proactivity: 0.9,
                creativity: 1.0,
                rigor: 0.2,
                features: ModeFeatures::default(),
                constraints: ModeConstraints::default(),
            },
        );

        // Learning
        self.mode_configs.insert(
            OperationalMode::Learning,
            ModeConfig {
                mode: OperationalMode::Learning,
                name: "Apprentissage".to_string(),
                description: "Mode pédagogique et explicatif".to_string(),
                icon: "📚".to_string(),
                communication_style: CommunicationStyle::Elaborate,
                emotional_level: EmotionalLevel::Encouraging,
                default_tone: Tone::Instructive,
                verbosity: 0.9,
                proactivity: 0.8,
                creativity: 0.5,
                rigor: 0.6,
                features: ModeFeatures::default(),
                constraints: ModeConstraints {
                    require_step_by_step: true,
                    ..Default::default()
                },
            },
        );

        // Debug
        self.mode_configs.insert(
            OperationalMode::Debug,
            ModeConfig {
                mode: OperationalMode::Debug,
                name: "Debug".to_string(),
                description: "Mode technique et diagnostic".to_string(),
                icon: "🔧".to_string(),
                communication_style: CommunicationStyle::Technical,
                emotional_level: EmotionalLevel::Serious,
                default_tone: Tone::Serious,
                verbosity: 1.0,
                proactivity: 0.6,
                creativity: 0.2,
                rigor: 0.95,
                features: ModeFeatures {
                    emojis_enabled: false,
                    ..Default::default()
                },
                constraints: ModeConstraints {
                    require_citations: true,
                    ..Default::default()
                },
            },
        );

        // Casual
        self.mode_configs.insert(
            OperationalMode::Casual,
            ModeConfig {
                mode: OperationalMode::Casual,
                name: "Détendu".to_string(),
                description: "Mode conversation libre".to_string(),
                icon: "☕".to_string(),
                communication_style: CommunicationStyle::Casual,
                emotional_level: EmotionalLevel::Playful,
                default_tone: Tone::Playful,
                verbosity: 0.6,
                proactivity: 0.4,
                creativity: 0.7,
                rigor: 0.2,
                features: ModeFeatures::default(),
                constraints: ModeConstraints::default(),
            },
        );

        // Emergency
        self.mode_configs.insert(
            OperationalMode::Emergency,
            ModeConfig {
                mode: OperationalMode::Emergency,
                name: "Urgence".to_string(),
                description: "Mode critique et prioritaire".to_string(),
                icon: "🚨".to_string(),
                communication_style: CommunicationStyle::Concise,
                emotional_level: EmotionalLevel::Serious,
                default_tone: Tone::Urgent,
                verbosity: 0.2,
                proactivity: 1.0,
                creativity: 0.1,
                rigor: 1.0,
                features: ModeFeatures {
                    emojis_enabled: false,
                    diagrams_enabled: false,
                    ..Default::default()
                },
                constraints: ModeConstraints {
                    max_response_length: Some(200),
                    max_thinking_time_ms: Some(1000),
                    ..Default::default()
                },
            },
        );

        // Silent
        self.mode_configs.insert(
            OperationalMode::Silent,
            ModeConfig {
                mode: OperationalMode::Silent,
                name: "Silencieux".to_string(),
                description: "Mode minimal, réponses courtes".to_string(),
                icon: "🤫".to_string(),
                communication_style: CommunicationStyle::Concise,
                emotional_level: EmotionalLevel::Calm,
                default_tone: Tone::Neutral,
                verbosity: 0.1,
                proactivity: 0.1,
                creativity: 0.1,
                rigor: 0.5,
                features: ModeFeatures {
                    suggestions_enabled: false,
                    emojis_enabled: false,
                    voice_enabled: false,
                    ..Default::default()
                },
                constraints: ModeConstraints {
                    max_response_length: Some(100),
                    ..Default::default()
                },
            },
        );
    }

    /// Change le mode actuel
    pub fn set_mode(&mut self, mode: OperationalMode, reason: &str) -> Result<(), String> {
        let from_mode = self.current_mode;
        self.current_mode = mode;

        self.mode_history.push(ModeTransition {
            timestamp: chrono::Utc::now().to_rfc3339(),
            from_mode,
            to_mode: mode,
            reason: reason.to_string(),
            automatic: false,
        });

        Ok(())
    }

    /// Obtient le mode actuel
    pub fn current(&self) -> OperationalMode {
        self.current_mode
    }

    /// Obtient la configuration du mode actuel
    pub fn current_config(&self) -> Option<&ModeConfig> {
        self.mode_configs.get(&self.current_mode)
    }

    /// Liste tous les modes disponibles
    pub fn list_modes(&self) -> Vec<&ModeConfig> {
        self.mode_configs.values().collect()
    }

    /// Détecte automatiquement le mode approprié
    pub fn detect_mode(&self, context: &str) -> OperationalMode {
        let context_lower = context.to_lowercase();

        if context_lower.contains("urgent")
            || context_lower.contains("critique")
            || context_lower.contains("erreur grave")
        {
            OperationalMode::Emergency
        } else if context_lower.contains("debug")
            || context_lower.contains("bug")
            || context_lower.contains("trace")
        {
            OperationalMode::Debug
        } else if context_lower.contains("apprend")
            || context_lower.contains("expliqu")
            || context_lower.contains("comment")
        {
            OperationalMode::Learning
        } else if context_lower.contains("créatif")
            || context_lower.contains("idée")
            || context_lower.contains("brainstorm")
        {
            OperationalMode::Creative
        } else if context_lower.contains("focus")
            || context_lower.contains("productif")
            || context_lower.contains("rapide")
        {
            OperationalMode::Focus
        } else if context_lower.contains("bavard")
            || context_lower.contains("détend")
            || context_lower.contains("chat")
        {
            OperationalMode::Casual
        } else {
            OperationalMode::Standard
        }
    }

    /// Active/désactive le switch automatique
    pub fn set_auto_switch(&mut self, enabled: bool) {
        self.auto_switch_enabled = enabled;
    }

    /// Tente un switch automatique si approprié
    pub fn try_auto_switch(&mut self, context: &str) -> bool {
        if !self.auto_switch_enabled {
            return false;
        }

        let detected = self.detect_mode(context);
        if detected != self.current_mode {
            let from = self.current_mode;
            self.current_mode = detected;

            self.mode_history.push(ModeTransition {
                timestamp: chrono::Utc::now().to_rfc3339(),
                from_mode: from,
                to_mode: detected,
                reason: format!("Auto-detected from context: {}", context),
                automatic: true,
            });

            true
        } else {
            false
        }
    }

    /// Historique des transitions
    pub fn get_history(&self) -> &[ModeTransition] {
        &self.mode_history
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    macro_rules! test_ok {
        ($expr:expr, $msg:expr $(,)?) => {
            match $expr {
                Ok(val) => val,
                Err(err) => panic!("{}: {err}", $msg),
            }
        };
    }

    macro_rules! test_some {
        ($expr:expr, $msg:expr $(,)?) => {
            match $expr {
                Some(val) => val,
                None => panic!("{}: got None", $msg),
            }
        };
    }

    // ========== ModeFeatures Tests ==========

    #[test]
    fn test_mode_features_default() {
        let features = ModeFeatures::default();
        assert!(features.suggestions_enabled);
        assert!(features.emojis_enabled);
        assert!(features.code_blocks_enabled);
        assert!(features.diagrams_enabled);
        assert!(features.voice_enabled);
        assert!(features.auto_save_enabled);
        assert!(features.learning_enabled);
    }

    #[test]
    fn test_mode_features_clone() {
        let features = ModeFeatures::default();
        let cloned = features.clone();
        assert_eq!(cloned.suggestions_enabled, features.suggestions_enabled);
    }

    #[test]
    fn test_mode_features_debug() {
        let features = ModeFeatures::default();
        let debug = format!("{:?}", features);
        assert!(debug.contains("suggestions_enabled"));
    }

    #[test]
    fn test_mode_features_serialize() {
        let features = ModeFeatures::default();
        let json = test_ok!(
            serde_json::to_string(&features),
            "ModeFeatures should serialize to JSON"
        );
        assert!(json.contains("suggestions_enabled"));
    }

    #[test]
    fn test_mode_features_custom() {
        let features = ModeFeatures {
            suggestions_enabled: false,
            emojis_enabled: false,
            code_blocks_enabled: true,
            diagrams_enabled: true,
            voice_enabled: false,
            auto_save_enabled: true,
            learning_enabled: false,
        };
        assert!(!features.suggestions_enabled);
        assert!(!features.voice_enabled);
    }

    // ========== ModeConstraints Tests ==========

    #[test]
    fn test_mode_constraints_default() {
        let constraints = ModeConstraints::default();
        assert!(constraints.max_response_length.is_none());
        assert!(constraints.max_thinking_time_ms.is_none());
        assert!(constraints.allowed_topics.is_none());
        assert!(constraints.forbidden_topics.is_none());
        assert!(!constraints.require_citations);
        assert!(!constraints.require_step_by_step);
    }

    #[test]
    fn test_mode_constraints_clone() {
        let constraints = ModeConstraints::default();
        let cloned = constraints.clone();
        assert_eq!(cloned.require_citations, constraints.require_citations);
    }

    #[test]
    fn test_mode_constraints_debug() {
        let constraints = ModeConstraints::default();
        let debug = format!("{:?}", constraints);
        assert!(debug.contains("max_response_length"));
    }

    #[test]
    fn test_mode_constraints_serialize() {
        let constraints = ModeConstraints::default();
        let json = test_ok!(
            serde_json::to_string(&constraints),
            "ModeConstraints should serialize to JSON"
        );
        assert!(json.contains("require_citations"));
    }

    #[test]
    fn test_mode_constraints_with_limits() {
        let constraints = ModeConstraints {
            max_response_length: Some(500),
            max_thinking_time_ms: Some(1000),
            allowed_topics: Some(vec!["code".to_string()]),
            forbidden_topics: Some(vec!["adult".to_string()]),
            require_citations: true,
            require_step_by_step: true,
        };
        assert_eq!(constraints.max_response_length, Some(500));
        assert!(constraints.require_citations);
    }

    // ========== ModeTransition Tests ==========

    #[test]
    fn test_mode_transition_creation() {
        let transition = ModeTransition {
            timestamp: "2024-01-01T00:00:00Z".to_string(),
            from_mode: OperationalMode::Standard,
            to_mode: OperationalMode::Focus,
            reason: "User request".to_string(),
            automatic: false,
        };
        assert_eq!(transition.from_mode, OperationalMode::Standard);
        assert_eq!(transition.to_mode, OperationalMode::Focus);
        assert!(!transition.automatic);
    }

    #[test]
    fn test_mode_transition_clone() {
        let transition = ModeTransition {
            timestamp: "2024-01-01T00:00:00Z".to_string(),
            from_mode: OperationalMode::Creative,
            to_mode: OperationalMode::Debug,
            reason: "Testing".to_string(),
            automatic: true,
        };
        let cloned = transition.clone();
        assert_eq!(cloned.from_mode, transition.from_mode);
        assert!(cloned.automatic);
    }

    #[test]
    fn test_mode_transition_debug() {
        let transition = ModeTransition {
            timestamp: "2024-01-01T00:00:00Z".to_string(),
            from_mode: OperationalMode::Standard,
            to_mode: OperationalMode::Learning,
            reason: "Learn".to_string(),
            automatic: false,
        };
        let debug = format!("{:?}", transition);
        assert!(debug.contains("Learning"));
    }

    #[test]
    fn test_mode_transition_serialize() {
        let transition = ModeTransition {
            timestamp: "2024-01-01T00:00:00Z".to_string(),
            from_mode: OperationalMode::Casual,
            to_mode: OperationalMode::Emergency,
            reason: "Alert".to_string(),
            automatic: true,
        };
        let json = test_ok!(
            serde_json::to_string(&transition),
            "ModeTransition should serialize to JSON"
        );
        assert!(json.contains("Emergency"));
    }

    // ========== ModeConfig Tests ==========

    #[test]
    fn test_mode_config_creation() {
        let config = ModeConfig {
            mode: OperationalMode::Standard,
            name: "Test".to_string(),
            description: "Test mode".to_string(),
            icon: "🔧".to_string(),
            communication_style: CommunicationStyle::Casual,
            emotional_level: EmotionalLevel::Neutral,
            default_tone: Tone::Friendly,
            verbosity: 0.5,
            proactivity: 0.5,
            creativity: 0.5,
            rigor: 0.5,
            features: ModeFeatures::default(),
            constraints: ModeConstraints::default(),
        };
        assert_eq!(config.name, "Test");
        assert_eq!(config.verbosity, 0.5);
    }

    #[test]
    fn test_mode_config_clone() {
        let config = ModeConfig {
            mode: OperationalMode::Focus,
            name: "Focus".to_string(),
            description: "Focus mode".to_string(),
            icon: "🎯".to_string(),
            communication_style: CommunicationStyle::Concise,
            emotional_level: EmotionalLevel::Neutral,
            default_tone: Tone::Professional,
            verbosity: 0.3,
            proactivity: 0.7,
            creativity: 0.3,
            rigor: 0.8,
            features: ModeFeatures::default(),
            constraints: ModeConstraints::default(),
        };
        let cloned = config.clone();
        assert_eq!(cloned.name, config.name);
    }

    #[test]
    fn test_mode_config_debug() {
        let config = ModeConfig {
            mode: OperationalMode::Creative,
            name: "Creative".to_string(),
            description: "Creative mode".to_string(),
            icon: "🎨".to_string(),
            communication_style: CommunicationStyle::Elaborate,
            emotional_level: EmotionalLevel::Enthusiastic,
            default_tone: Tone::Playful,
            verbosity: 0.8,
            proactivity: 0.9,
            creativity: 1.0,
            rigor: 0.2,
            features: ModeFeatures::default(),
            constraints: ModeConstraints::default(),
        };
        let debug = format!("{:?}", config);
        assert!(debug.contains("Creative"));
    }

    // ========== ModeSystemEngine Tests ==========

    #[test]
    fn test_mode_system_engine_default() {
        let engine = ModeSystemEngine::default();
        assert_eq!(engine.current(), OperationalMode::Standard);
        assert!(engine.auto_switch_enabled);
    }

    #[test]
    fn test_mode_system_engine_current() {
        let engine = ModeSystemEngine::default();
        assert_eq!(engine.current(), OperationalMode::Standard);
    }

    #[test]
    fn test_mode_system_engine_current_config() {
        let engine = ModeSystemEngine::default();
        let config = engine.current_config();
        assert!(config.is_some());
        assert_eq!(
            test_some!(
                config,
                "current_config should exist for default engine"
            )
            .name,
            "Standard"
        );
    }

    #[test]
    fn test_mode_system_engine_list_modes() {
        let engine = ModeSystemEngine::default();
        let modes = engine.list_modes();
        assert!(modes.len() >= 8);
    }

    #[test]
    fn test_mode_system_engine_set_mode_focus() {
        let mut engine = ModeSystemEngine::default();
        let result = engine.set_mode(OperationalMode::Focus, "Testing");
        assert!(result.is_ok());
        assert_eq!(engine.current(), OperationalMode::Focus);
    }

    #[test]
    fn test_mode_system_engine_set_mode_creative() {
        let mut engine = ModeSystemEngine::default();
        test_ok!(
            engine.set_mode(OperationalMode::Creative, "Testing"),
            "set_mode(Creative) should succeed in tests"
        );
        assert_eq!(engine.current(), OperationalMode::Creative);
    }

    #[test]
    fn test_mode_system_engine_set_mode_learning() {
        let mut engine = ModeSystemEngine::default();
        test_ok!(
            engine.set_mode(OperationalMode::Learning, "Testing"),
            "set_mode(Learning) should succeed in tests"
        );
        assert_eq!(engine.current(), OperationalMode::Learning);
    }

    #[test]
    fn test_mode_system_engine_set_mode_debug() {
        let mut engine = ModeSystemEngine::default();
        test_ok!(
            engine.set_mode(OperationalMode::Debug, "Testing"),
            "set_mode(Debug) should succeed in tests"
        );
        assert_eq!(engine.current(), OperationalMode::Debug);
    }

    #[test]
    fn test_mode_system_engine_set_mode_casual() {
        let mut engine = ModeSystemEngine::default();
        test_ok!(
            engine.set_mode(OperationalMode::Casual, "Testing"),
            "set_mode(Casual) should succeed in tests"
        );
        assert_eq!(engine.current(), OperationalMode::Casual);
    }

    #[test]
    fn test_mode_system_engine_set_mode_emergency() {
        let mut engine = ModeSystemEngine::default();
        test_ok!(
            engine.set_mode(OperationalMode::Emergency, "Testing"),
            "set_mode(Emergency) should succeed in tests"
        );
        assert_eq!(engine.current(), OperationalMode::Emergency);
    }

    #[test]
    fn test_mode_system_engine_set_mode_silent() {
        let mut engine = ModeSystemEngine::default();
        test_ok!(
            engine.set_mode(OperationalMode::Silent, "Testing"),
            "set_mode(Silent) should succeed in tests"
        );
        assert_eq!(engine.current(), OperationalMode::Silent);
    }

    #[test]
    fn test_mode_system_engine_history() {
        let mut engine = ModeSystemEngine::default();
        test_ok!(
            engine.set_mode(OperationalMode::Focus, "Testing"),
            "set_mode(Focus) should succeed in tests"
        );
        let history = engine.get_history();
        assert_eq!(history.len(), 1);
    }

    #[test]
    fn test_mode_system_engine_history_multiple() {
        let mut engine = ModeSystemEngine::default();
        test_ok!(
            engine.set_mode(OperationalMode::Focus, "Test1"),
            "set_mode(Focus) should succeed in tests"
        );
        test_ok!(
            engine.set_mode(OperationalMode::Creative, "Test2"),
            "set_mode(Creative) should succeed in tests"
        );
        test_ok!(
            engine.set_mode(OperationalMode::Debug, "Test3"),
            "set_mode(Debug) should succeed in tests"
        );
        let history = engine.get_history();
        assert_eq!(history.len(), 3);
    }

    #[test]
    fn test_mode_system_engine_detect_mode_urgent() {
        let engine = ModeSystemEngine::default();
        let detected = engine.detect_mode("C'est urgent!");
        assert_eq!(detected, OperationalMode::Emergency);
    }

    #[test]
    fn test_mode_system_engine_detect_mode_critique() {
        let engine = ModeSystemEngine::default();
        let detected = engine.detect_mode("Situation critique");
        assert_eq!(detected, OperationalMode::Emergency);
    }

    #[test]
    fn test_mode_system_engine_detect_mode_erreur_grave() {
        let engine = ModeSystemEngine::default();
        let detected = engine.detect_mode("erreur grave");
        assert_eq!(detected, OperationalMode::Emergency);
    }

    #[test]
    fn test_mode_system_engine_detect_mode_debug() {
        let engine = ModeSystemEngine::default();
        let detected = engine.detect_mode("Mode debug");
        assert_eq!(detected, OperationalMode::Debug);
    }

    #[test]
    fn test_mode_system_engine_detect_mode_bug() {
        let engine = ModeSystemEngine::default();
        let detected = engine.detect_mode("J'ai un bug");
        assert_eq!(detected, OperationalMode::Debug);
    }

    #[test]
    fn test_mode_system_engine_detect_mode_trace() {
        let engine = ModeSystemEngine::default();
        let detected = engine.detect_mode("Je trace le problème");
        assert_eq!(detected, OperationalMode::Debug);
    }

    #[test]
    fn test_mode_system_engine_detect_mode_apprendre() {
        let engine = ModeSystemEngine::default();
        let detected = engine.detect_mode("J'apprends le Rust");
        assert_eq!(detected, OperationalMode::Learning);
    }

    #[test]
    fn test_mode_system_engine_detect_mode_expliquer() {
        let engine = ModeSystemEngine::default();
        let detected = engine.detect_mode("Explique-moi");
        assert_eq!(detected, OperationalMode::Learning);
    }

    #[test]
    fn test_mode_system_engine_detect_mode_comment() {
        let engine = ModeSystemEngine::default();
        let detected = engine.detect_mode("Comment faire?");
        assert_eq!(detected, OperationalMode::Learning);
    }

    #[test]
    fn test_mode_system_engine_detect_mode_creatif() {
        let engine = ModeSystemEngine::default();
        let detected = engine.detect_mode("Mode créatif");
        assert_eq!(detected, OperationalMode::Creative);
    }

    #[test]
    fn test_mode_system_engine_detect_mode_idee() {
        let engine = ModeSystemEngine::default();
        let detected = engine.detect_mode("J'ai une idée");
        assert_eq!(detected, OperationalMode::Creative);
    }

    #[test]
    fn test_mode_system_engine_detect_mode_brainstorm() {
        let engine = ModeSystemEngine::default();
        let detected = engine.detect_mode("Faisons un brainstorm");
        assert_eq!(detected, OperationalMode::Creative);
    }

    #[test]
    fn test_mode_system_engine_detect_mode_focus() {
        let engine = ModeSystemEngine::default();
        let detected = engine.detect_mode("Je veux focus");
        assert_eq!(detected, OperationalMode::Focus);
    }

    #[test]
    fn test_mode_system_engine_detect_mode_productif() {
        let engine = ModeSystemEngine::default();
        let detected = engine.detect_mode("Soyons productif");
        assert_eq!(detected, OperationalMode::Focus);
    }

    #[test]
    fn test_mode_system_engine_detect_mode_rapide() {
        let engine = ModeSystemEngine::default();
        let detected = engine.detect_mode("Fais ça rapide");
        assert_eq!(detected, OperationalMode::Focus);
    }

    #[test]
    fn test_mode_system_engine_detect_mode_bavard() {
        let engine = ModeSystemEngine::default();
        let detected = engine.detect_mode("Je suis bavard");
        assert_eq!(detected, OperationalMode::Casual);
    }

    #[test]
    fn test_mode_system_engine_detect_mode_detend() {
        let engine = ModeSystemEngine::default();
        let detected = engine.detect_mode("On se détend");
        assert_eq!(detected, OperationalMode::Casual);
    }

    #[test]
    fn test_mode_system_engine_detect_mode_chat() {
        let engine = ModeSystemEngine::default();
        let detected = engine.detect_mode("Juste chat");
        assert_eq!(detected, OperationalMode::Casual);
    }

    #[test]
    fn test_mode_system_engine_detect_mode_default() {
        let engine = ModeSystemEngine::default();
        let detected = engine.detect_mode("Bonjour!");
        assert_eq!(detected, OperationalMode::Standard);
    }

    #[test]
    fn test_mode_system_engine_set_auto_switch() {
        let mut engine = ModeSystemEngine::default();
        engine.set_auto_switch(false);
        assert!(!engine.auto_switch_enabled);
    }

    #[test]
    fn test_mode_system_engine_try_auto_switch_disabled() {
        let mut engine = ModeSystemEngine::default();
        engine.set_auto_switch(false);
        let switched = engine.try_auto_switch("C'est urgent!");
        assert!(!switched);
        assert_eq!(engine.current(), OperationalMode::Standard);
    }

    #[test]
    fn test_mode_system_engine_try_auto_switch_enabled() {
        let mut engine = ModeSystemEngine::default();
        let switched = engine.try_auto_switch("C'est urgent!");
        assert!(switched);
        assert_eq!(engine.current(), OperationalMode::Emergency);
    }

    #[test]
    fn test_mode_system_engine_try_auto_switch_same_mode() {
        let mut engine = ModeSystemEngine::default();
        let switched = engine.try_auto_switch("Bonjour!");
        assert!(!switched);
        assert_eq!(engine.current(), OperationalMode::Standard);
    }

    #[test]
    fn test_mode_system_engine_auto_switch_history() {
        let mut engine = ModeSystemEngine::default();
        engine.try_auto_switch("C'est urgent!");
        let history = engine.get_history();
        assert_eq!(history.len(), 1);
        assert!(history[0].automatic);
    }

    // ========== Mode Config Specific Tests ==========

    #[test]
    fn test_focus_mode_config() {
        let engine = ModeSystemEngine::default();
        let config = test_some!(
            engine.mode_configs.get(&OperationalMode::Focus),
            "Focus mode config should exist"
        );
        assert_eq!(config.verbosity, 0.3);
        assert_eq!(config.rigor, 0.8);
        assert!(!config.features.emojis_enabled);
    }

    #[test]
    fn test_creative_mode_config() {
        let engine = ModeSystemEngine::default();
        let config = test_some!(
            engine.mode_configs.get(&OperationalMode::Creative),
            "Creative mode config should exist"
        );
        assert_eq!(config.creativity, 1.0);
        assert_eq!(config.rigor, 0.2);
    }

    #[test]
    fn test_learning_mode_config() {
        let engine = ModeSystemEngine::default();
        let config = test_some!(
            engine.mode_configs.get(&OperationalMode::Learning),
            "Learning mode config should exist"
        );
        assert!(config.constraints.require_step_by_step);
        assert_eq!(config.verbosity, 0.9);
    }

    #[test]
    fn test_debug_mode_config() {
        let engine = ModeSystemEngine::default();
        let config = test_some!(
            engine.mode_configs.get(&OperationalMode::Debug),
            "Debug mode config should exist"
        );
        assert!(config.constraints.require_citations);
        assert_eq!(config.rigor, 0.95);
    }

    #[test]
    fn test_emergency_mode_config() {
        let engine = ModeSystemEngine::default();
        let config = test_some!(
            engine.mode_configs.get(&OperationalMode::Emergency),
            "Emergency mode config should exist"
        );
        assert_eq!(config.constraints.max_response_length, Some(200));
        assert_eq!(config.constraints.max_thinking_time_ms, Some(1000));
        assert_eq!(config.rigor, 1.0);
    }

    #[test]
    fn test_silent_mode_config() {
        let engine = ModeSystemEngine::default();
        let config = test_some!(
            engine.mode_configs.get(&OperationalMode::Silent),
            "Silent mode config should exist"
        );
        assert!(!config.features.suggestions_enabled);
        assert!(!config.features.voice_enabled);
        assert_eq!(config.verbosity, 0.1);
    }

    #[test]
    fn test_casual_mode_config() {
        let engine = ModeSystemEngine::default();
        let config = test_some!(
            engine.mode_configs.get(&OperationalMode::Casual),
            "Casual mode config should exist"
        );
        assert_eq!(config.creativity, 0.7);
        assert_eq!(config.default_tone, Tone::Playful);
    }

    #[test]
    fn test_standard_mode_config() {
        let engine = ModeSystemEngine::default();
        let config = test_some!(
            engine.mode_configs.get(&OperationalMode::Standard),
            "Standard mode config should exist"
        );
        assert_eq!(config.verbosity, 0.5);
        assert_eq!(config.proactivity, 0.5);
        assert_eq!(config.creativity, 0.5);
        assert_eq!(config.rigor, 0.5);
    }
}
