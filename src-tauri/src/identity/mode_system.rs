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
