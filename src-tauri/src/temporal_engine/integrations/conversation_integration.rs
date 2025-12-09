//! ═══════════════════════════════════════════════════════════════════════════════
//! TEMPORAL ENGINE ↔ CONVERSATION OS INTEGRATION
//! ═══════════════════════════════════════════════════════════════════════════════

use crate::temporal_engine::{TemporalContext, PlanningHorizon};
use serde::{Deserialize, Serialize};

/// Bridge entre Temporal Engine et Conversation OS
pub struct TemporalConversationBridge;

impl TemporalConversationBridge {
    /// Obtient les ajustements conversationnels selon le contexte temporel
    pub fn get_conversation_adjustments(context: &TemporalContext) -> ConversationTemporalAdjustments {
        let hour = context.now.hour;
        let is_weekend = context.now.is_weekend;
        let season = &context.now.season;

        ConversationTemporalAdjustments {
            tone: Self::determine_tone(hour, is_weekend),
            verbosity: Self::calculate_verbosity(hour),
            formality: Self::calculate_formality(hour, is_weekend),
            response_speed_preference: Self::determine_speed_preference(hour),
            context_recall_depth: Self::calculate_recall_depth(hour),
            proactive_suggestions: Self::should_be_proactive(hour),
            emotional_intelligence: Self::calculate_emotional_weight(season),
            temporal_awareness: Self::calculate_temporal_awareness(context),
        }
    }

    /// Détermine le ton conversationnel
    fn determine_tone(hour: u8, is_weekend: bool) -> ConversationTone {
        match (hour, is_weekend) {
            (6..=8, false) => ConversationTone::Energizing,
            (9..=11, false) => ConversationTone::Professional,
            (12..=13, _) => ConversationTone::Casual,
            (14..=17, false) => ConversationTone::Focused,
            (18..=21, _) => ConversationTone::Relaxed,
            (22..=23 | 0..=5, _) => ConversationTone::Gentle,
            (_, true) => ConversationTone::Friendly,
            _ => ConversationTone::Neutral,
        }
    }

    /// Niveau de verbosité
    fn calculate_verbosity(hour: u8) -> f32 {
        match hour {
            10..=11 => 0.7,   // Peak: moderate detail
            12..=13 => 0.4,   // Midday: concise
            22..=5 => 0.5,    // Night: moderate
            _ => 0.6,
        }
    }

    /// Niveau de formalité
    fn calculate_formality(hour: u8, is_weekend: bool) -> f32 {
        let base = match hour {
            9..=17 => 0.7,    // Work hours: formal
            18..=21 => 0.4,   // Evening: casual
            22..=5 => 0.3,    // Night: very casual
            _ => 0.5,
        };

        if is_weekend {
            base * 0.7
        } else {
            base
        }
    }

    /// Préférence de vitesse de réponse
    fn determine_speed_preference(hour: u8) -> ResponseSpeed {
        match hour {
            10..=11 => ResponseSpeed::Balanced,
            12..=13 => ResponseSpeed::Fast,
            2..=4 => ResponseSpeed::Thorough,
            _ => ResponseSpeed::Balanced,
        }
    }

    /// Profondeur de rappel contextuel
    fn calculate_recall_depth(hour: u8) -> usize {
        match hour {
            10..=11 => 10,    // Peak: deep context
            22..=5 => 3,      // Night: shallow
            _ => 6,
        }
    }

    /// Suggestions proactives
    fn should_be_proactive(hour: u8) -> bool {
        matches!(hour, 9..=11 | 14..=16)
    }

    /// Poids intelligence émotionnelle (saisonnier)
    fn calculate_emotional_weight(season: &crate::temporal_engine::time_model::Season) -> f32 {
        use crate::temporal_engine::time_model::Season;
        match season {
            Season::Spring => 0.7,
            Season::Summer => 0.8,
            Season::Autumn => 0.6,
            Season::Winter => 0.5,
        }
    }

    /// Conscience temporelle dans les réponses
    fn calculate_temporal_awareness(context: &TemporalContext) -> f32 {
        let hour = context.now.hour;
        
        match hour {
            6..=9 => 0.8,     // Morning: high awareness ("good morning", time-based suggestions)
            22..=23 => 0.7,   // Night: moderate ("late evening", rest suggestions)
            _ => 0.4,         // Default: subtle
        }
    }

    /// Suggère les stratégies de conversation
    pub fn suggest_conversation_strategies(context: &TemporalContext) -> Vec<ConversationStrategy> {
        let hour = context.now.hour;
        let day_of_week = context.now.day_of_week;

        let mut strategies = vec![];

        // Morning: energize and plan
        if hour >= 7 && hour <= 9 {
            strategies.push(ConversationStrategy::DailyPlanning);
            strategies.push(ConversationStrategy::MotivationalTone);
        }

        // Peak hours: efficiency
        if hour >= 10 && hour <= 11 {
            strategies.push(ConversationStrategy::ConciseResponses);
            strategies.push(ConversationStrategy::ActionOriented);
        }

        // Midday: quick and casual
        if hour == 12 || hour == 13 {
            strategies.push(ConversationStrategy::LightInteractions);
        }

        // Evening: reflection
        if hour >= 19 && hour <= 21 {
            strategies.push(ConversationStrategy::ReflectiveMode);
        }

        // Night: gentle and supportive
        if hour >= 22 || hour <= 5 {
            strategies.push(ConversationStrategy::GentleGuidance);
            strategies.push(ConversationStrategy::RestPrompts);
        }

        // Monday: motivational
        if day_of_week == 1 && hour <= 12 {
            strategies.push(ConversationStrategy::WeekStartMotivation);
        }

        // Friday: celebratory
        if day_of_week == 5 && hour >= 16 {
            strategies.push(ConversationStrategy::WeekEndCelebration);
        }

        strategies
    }

    /// Maintient le fil narratif temporel
    pub fn maintain_temporal_narrative(context: &TemporalContext) -> TemporalNarrative {
        let hour = context.now.hour;
        let day_of_week = context.now.day_of_week;

        let thread = match (day_of_week, hour) {
            (1, 6..=12) => "Début de semaine — planification et énergie",
            (5, 16..=23) => "Fin de semaine — célébration des accomplissements",
            (_, 6..=9) => "Matinée — préparation et concentration",
            (_, 10..=16) => "Journée productive — focus et action",
            (_, 17..=21) => "Soirée — réflexion et consolidation",
            (_, 22..=23 | 0..=5) => "Nuit — repos et régénération",
            _ => "Continuité temporelle",
        };

        let temporal_markers = Self::generate_temporal_markers(context);

        TemporalNarrative {
            current_thread: thread.to_string(),
            temporal_markers,
            maintain_continuity: true,
        }
    }

    /// Génère les marqueurs temporels
    fn generate_temporal_markers(context: &TemporalContext) -> Vec<String> {
        let mut markers = vec![];

        let hour = context.now.hour;
        let day_of_week = context.now.day_of_week;

        // Time of day
        markers.push(match hour {
            6..=11 => "ce matin".to_string(),
            12..=13 => "à midi".to_string(),
            14..=17 => "cet après-midi".to_string(),
            18..=21 => "ce soir".to_string(),
            _ => "cette nuit".to_string(),
        });

        // Day context
        markers.push(match day_of_week {
            1 => "en début de semaine".to_string(),
            2..=4 => "en milieu de semaine".to_string(),
            5 => "en fin de semaine".to_string(),
            6..=7 => "ce week-end".to_string(),
            _ => "aujourd'hui".to_string(),
        });

        // Season context
        use crate::temporal_engine::time_model::Season;
        markers.push(match context.now.season {
            Season::Spring => "au printemps".to_string(),
            Season::Summer => "en été".to_string(),
            Season::Autumn => "en automne".to_string(),
            Season::Winter => "en hiver".to_string(),
        });

        markers
    }
}

/// Ajustements temporels pour la conversation
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ConversationTemporalAdjustments {
    pub tone: ConversationTone,
    pub verbosity: f32,
    pub formality: f32,
    pub response_speed_preference: ResponseSpeed,
    pub context_recall_depth: usize,
    pub proactive_suggestions: bool,
    pub emotional_intelligence: f32,
    pub temporal_awareness: f32,
}

/// Ton conversationnel
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum ConversationTone {
    Energizing,
    Professional,
    Casual,
    Focused,
    Relaxed,
    Gentle,
    Friendly,
    Neutral,
}

/// Vitesse de réponse
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum ResponseSpeed {
    Fast,
    Balanced,
    Thorough,
}

/// Stratégies conversationnelles
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum ConversationStrategy {
    DailyPlanning,
    MotivationalTone,
    ConciseResponses,
    ActionOriented,
    LightInteractions,
    ReflectiveMode,
    GentleGuidance,
    RestPrompts,
    WeekStartMotivation,
    WeekEndCelebration,
}

/// Fil narratif temporel
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TemporalNarrative {
    pub current_thread: String,
    pub temporal_markers: Vec<String>,
    pub maintain_continuity: bool,
}
