// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — TONE ENGINE
//   Moteur de tonalité adaptative
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Tonalité de communication
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Tone {
    Neutral,
    Friendly,
    Professional,
    Empathetic,
    Encouraging,
    Instructive,
    Playful,
    Serious,
    Curious,
    Celebratory,
    Apologetic,
    Urgent,
    Calm,
    Enthusiastic,
}

/// Paramètres de tonalité
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToneParameters {
    /// Formalité (0.0 = très formel, 1.0 = très décontracté)
    pub formality: f32,
    /// Chaleur émotionnelle (0.0 - 1.0)
    pub warmth: f32,
    /// Énergie (0.0 - 1.0)
    pub energy: f32,
    /// Directivité (0.0 = suggestif, 1.0 = directif)
    pub directness: f32,
    /// Complexité lexicale (0.0 = simple, 1.0 = élaboré)
    pub complexity: f32,
    /// Utilisation d'humour (0.0 - 1.0)
    pub humor: f32,
    /// Empathie exprimée (0.0 - 1.0)
    pub empathy: f32,
}

impl Default for ToneParameters {
    fn default() -> Self {
        Self {
            formality: 0.4,
            warmth: 0.7,
            energy: 0.5,
            directness: 0.5,
            complexity: 0.4,
            humor: 0.2,
            empathy: 0.6,
        }
    }
}

/// Configuration de tonalité pour un contexte
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToneConfig {
    pub primary_tone: Tone,
    pub secondary_tone: Option<Tone>,
    pub parameters: ToneParameters,
    pub text_markers: ToneTextMarkers,
}

/// Marqueurs textuels de tonalité
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToneTextMarkers {
    /// Préfixes de phrase possibles
    pub prefixes: Vec<String>,
    /// Suffixes de phrase possibles
    pub suffixes: Vec<String>,
    /// Interjections
    pub interjections: Vec<String>,
    /// Emojis autorisés
    pub emojis: Vec<String>,
    /// Expressions caractéristiques
    pub expressions: Vec<String>,
}

impl Default for ToneTextMarkers {
    fn default() -> Self {
        Self {
            prefixes: vec![],
            suffixes: vec![],
            interjections: vec![],
            emojis: vec![],
            expressions: vec![],
        }
    }
}

/// Moteur de tonalité
pub struct ToneEngine {
    current_tone: Tone,
    parameters: ToneParameters,
    tone_presets: HashMap<Tone, ToneConfig>,
    context_stack: Vec<Tone>,
}

impl Default for ToneEngine {
    fn default() -> Self {
        let mut engine = Self {
            current_tone: Tone::Friendly,
            parameters: ToneParameters::default(),
            tone_presets: HashMap::new(),
            context_stack: vec![],
        };
        engine.initialize_presets();
        engine
    }
}

impl ToneEngine {
    /// Initialise les préréglages
    fn initialize_presets(&mut self) {
        // Friendly
        self.tone_presets.insert(
            Tone::Friendly,
            ToneConfig {
                primary_tone: Tone::Friendly,
                secondary_tone: None,
                parameters: ToneParameters {
                    formality: 0.3,
                    warmth: 0.8,
                    energy: 0.6,
                    directness: 0.4,
                    complexity: 0.3,
                    humor: 0.3,
                    empathy: 0.7,
                },
                text_markers: ToneTextMarkers {
                    prefixes: vec!["Bien sûr!".to_string(), "Avec plaisir!".to_string()],
                    suffixes: vec!["😊".to_string(), "N'hésite pas!".to_string()],
                    interjections: vec!["Super!".to_string(), "Génial!".to_string()],
                    emojis: vec!["😊".to_string(), "👍".to_string(), "✨".to_string()],
                    expressions: vec![],
                },
            },
        );

        // Professional
        self.tone_presets.insert(
            Tone::Professional,
            ToneConfig {
                primary_tone: Tone::Professional,
                secondary_tone: None,
                parameters: ToneParameters {
                    formality: 0.8,
                    warmth: 0.3,
                    energy: 0.4,
                    directness: 0.7,
                    complexity: 0.6,
                    humor: 0.0,
                    empathy: 0.3,
                },
                text_markers: ToneTextMarkers {
                    prefixes: vec!["Voici".to_string(), "Concernant".to_string()],
                    suffixes: vec!["Cordialement.".to_string()],
                    interjections: vec![],
                    emojis: vec![],
                    expressions: vec![],
                },
            },
        );

        // Empathetic
        self.tone_presets.insert(
            Tone::Empathetic,
            ToneConfig {
                primary_tone: Tone::Empathetic,
                secondary_tone: Some(Tone::Calm),
                parameters: ToneParameters {
                    formality: 0.3,
                    warmth: 0.95,
                    energy: 0.3,
                    directness: 0.2,
                    complexity: 0.3,
                    humor: 0.0,
                    empathy: 1.0,
                },
                text_markers: ToneTextMarkers {
                    prefixes: vec![
                        "Je comprends...".to_string(),
                        "C'est normal de ressentir...".to_string(),
                    ],
                    suffixes: vec!["Je suis là.".to_string(), "Prends ton temps.".to_string()],
                    interjections: vec![],
                    emojis: vec!["💙".to_string(), "🤗".to_string()],
                    expressions: vec![],
                },
            },
        );

        // Encouraging
        self.tone_presets.insert(
            Tone::Encouraging,
            ToneConfig {
                primary_tone: Tone::Encouraging,
                secondary_tone: Some(Tone::Enthusiastic),
                parameters: ToneParameters {
                    formality: 0.2,
                    warmth: 0.9,
                    energy: 0.8,
                    directness: 0.5,
                    complexity: 0.3,
                    humor: 0.2,
                    empathy: 0.7,
                },
                text_markers: ToneTextMarkers {
                    prefixes: vec!["Tu peux le faire!".to_string(), "Excellent!".to_string()],
                    suffixes: vec!["Continue comme ça!".to_string(), "Bravo!".to_string()],
                    interjections: vec!["Super!".to_string(), "Wow!".to_string()],
                    emojis: vec!["🚀".to_string(), "💪".to_string(), "⭐".to_string()],
                    expressions: vec![],
                },
            },
        );

        // Instructive
        self.tone_presets.insert(
            Tone::Instructive,
            ToneConfig {
                primary_tone: Tone::Instructive,
                secondary_tone: None,
                parameters: ToneParameters {
                    formality: 0.5,
                    warmth: 0.5,
                    energy: 0.5,
                    directness: 0.7,
                    complexity: 0.6,
                    humor: 0.1,
                    empathy: 0.4,
                },
                text_markers: ToneTextMarkers {
                    prefixes: vec!["Voici comment".to_string(), "Pour cela".to_string()],
                    suffixes: vec!["Essaie et dis-moi.".to_string()],
                    interjections: vec![],
                    emojis: vec!["📝".to_string(), "💡".to_string()],
                    expressions: vec![],
                },
            },
        );

        // Playful
        self.tone_presets.insert(
            Tone::Playful,
            ToneConfig {
                primary_tone: Tone::Playful,
                secondary_tone: Some(Tone::Friendly),
                parameters: ToneParameters {
                    formality: 0.1,
                    warmth: 0.8,
                    energy: 0.9,
                    directness: 0.3,
                    complexity: 0.2,
                    humor: 0.8,
                    empathy: 0.5,
                },
                text_markers: ToneTextMarkers {
                    prefixes: vec!["Haha!".to_string(), "Devine quoi?".to_string()],
                    suffixes: vec!["😄".to_string(), "Amusant, non?".to_string()],
                    interjections: vec!["Hehe".to_string(), "Woohoo!".to_string()],
                    emojis: vec![
                        "😄".to_string(),
                        "🎉".to_string(),
                        "🎮".to_string(),
                        "✨".to_string(),
                    ],
                    expressions: vec![],
                },
            },
        );

        // Serious
        self.tone_presets.insert(
            Tone::Serious,
            ToneConfig {
                primary_tone: Tone::Serious,
                secondary_tone: None,
                parameters: ToneParameters {
                    formality: 0.7,
                    warmth: 0.2,
                    energy: 0.3,
                    directness: 0.8,
                    complexity: 0.5,
                    humor: 0.0,
                    empathy: 0.3,
                },
                text_markers: ToneTextMarkers {
                    prefixes: vec!["Important:".to_string(), "Attention:".to_string()],
                    suffixes: vec![],
                    interjections: vec![],
                    emojis: vec![],
                    expressions: vec![],
                },
            },
        );

        // Urgent
        self.tone_presets.insert(
            Tone::Urgent,
            ToneConfig {
                primary_tone: Tone::Urgent,
                secondary_tone: Some(Tone::Serious),
                parameters: ToneParameters {
                    formality: 0.6,
                    warmth: 0.2,
                    energy: 0.9,
                    directness: 1.0,
                    complexity: 0.3,
                    humor: 0.0,
                    empathy: 0.2,
                },
                text_markers: ToneTextMarkers {
                    prefixes: vec!["⚠️ URGENT:".to_string(), "IMMÉDIATEMENT:".to_string()],
                    suffixes: vec!["Agis maintenant.".to_string()],
                    interjections: vec![],
                    emojis: vec!["⚠️".to_string(), "🚨".to_string()],
                    expressions: vec![],
                },
            },
        );
    }

    /// Change la tonalité actuelle
    pub fn set_tone(&mut self, tone: Tone) {
        self.context_stack.push(self.current_tone);
        self.current_tone = tone;
        if let Some(preset) = self.tone_presets.get(&tone) {
            self.parameters = preset.parameters.clone();
        }
    }

    /// Restaure la tonalité précédente
    pub fn restore_tone(&mut self) {
        if let Some(prev) = self.context_stack.pop() {
            self.current_tone = prev;
            if let Some(preset) = self.tone_presets.get(&prev) {
                self.parameters = preset.parameters.clone();
            }
        }
    }

    /// Obtient la tonalité actuelle
    pub fn current(&self) -> Tone {
        self.current_tone
    }

    /// Obtient les paramètres actuels
    pub fn parameters(&self) -> &ToneParameters {
        &self.parameters
    }

    /// Obtient la config pour une tonalité
    pub fn get_config(&self, tone: Tone) -> Option<&ToneConfig> {
        self.tone_presets.get(&tone)
    }

    /// Adapte un texte à la tonalité actuelle
    pub fn adapt_text(&self, text: &str) -> String {
        let config = self.tone_presets.get(&self.current_tone);

        if let Some(cfg) = config {
            let mut result = text.to_string();

            // Ajouter un préfixe aléatoire si approprié
            if !cfg.text_markers.prefixes.is_empty() && rand::random::<f32>() < 0.3 {
                if let Some(prefix) = cfg.text_markers.prefixes.first() {
                    result = format!("{} {}", prefix, result);
                }
            }

            // Ajouter un emoji si approprié
            if !cfg.text_markers.emojis.is_empty() && rand::random::<f32>() < 0.2 {
                if let Some(emoji) = cfg.text_markers.emojis.first() {
                    result = format!("{} {}", result, emoji);
                }
            }

            result
        } else {
            text.to_string()
        }
    }

    /// Détecte la tonalité appropriée pour un contexte
    pub fn detect_appropriate_tone(&self, context: &str) -> Tone {
        let context_lower = context.to_lowercase();

        if context_lower.contains("urgent") || context_lower.contains("critique") {
            Tone::Urgent
        } else if context_lower.contains("erreur") || context_lower.contains("problème") {
            Tone::Empathetic
        } else if context_lower.contains("bravo") || context_lower.contains("réussi") {
            Tone::Celebratory
        } else if context_lower.contains("comment") || context_lower.contains("expliqu") {
            Tone::Instructive
        } else if context_lower.contains("aide") || context_lower.contains("support") {
            Tone::Encouraging
        } else if context_lower.contains("professionnel") || context_lower.contains("formel") {
            Tone::Professional
        } else {
            Tone::Friendly
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // ========== Tone Tests ==========

    #[test]
    fn test_tone_neutral() {
        let tone = Tone::Neutral;
        assert_eq!(tone, Tone::Neutral);
    }

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

    #[test]
    fn test_tone_friendly() {
        let tone = Tone::Friendly;
        assert_eq!(tone, Tone::Friendly);
    }

    #[test]
    fn test_tone_professional() {
        let tone = Tone::Professional;
        assert_eq!(tone, Tone::Professional);
    }

    #[test]
    fn test_tone_empathetic() {
        let tone = Tone::Empathetic;
        assert_eq!(tone, Tone::Empathetic);
    }

    #[test]
    fn test_tone_encouraging() {
        let tone = Tone::Encouraging;
        assert_eq!(tone, Tone::Encouraging);
    }

    #[test]
    fn test_tone_instructive() {
        let tone = Tone::Instructive;
        assert_eq!(tone, Tone::Instructive);
    }

    #[test]
    fn test_tone_playful() {
        let tone = Tone::Playful;
        assert_eq!(tone, Tone::Playful);
    }

    #[test]
    fn test_tone_serious() {
        let tone = Tone::Serious;
        assert_eq!(tone, Tone::Serious);
    }

    #[test]
    fn test_tone_curious() {
        let tone = Tone::Curious;
        assert_eq!(tone, Tone::Curious);
    }

    #[test]
    fn test_tone_celebratory() {
        let tone = Tone::Celebratory;
        assert_eq!(tone, Tone::Celebratory);
    }

    #[test]
    fn test_tone_apologetic() {
        let tone = Tone::Apologetic;
        assert_eq!(tone, Tone::Apologetic);
    }

    #[test]
    fn test_tone_urgent() {
        let tone = Tone::Urgent;
        assert_eq!(tone, Tone::Urgent);
    }

    #[test]
    fn test_tone_calm() {
        let tone = Tone::Calm;
        assert_eq!(tone, Tone::Calm);
    }

    #[test]
    fn test_tone_enthusiastic() {
        let tone = Tone::Enthusiastic;
        assert_eq!(tone, Tone::Enthusiastic);
    }

    #[test]
    fn test_tone_clone() {
        let tone = Tone::Friendly;
        let cloned = tone;
        assert_eq!(tone, cloned);
    }

    #[test]
    fn test_tone_copy() {
        let tone = Tone::Professional;
        let copied = tone;
        assert_eq!(tone, copied);
    }

    #[test]
    fn test_tone_debug() {
        let tone = Tone::Empathetic;
        let debug = format!("{:?}", tone);
        assert!(debug.contains("Empathetic"));
    }

    #[test]
    fn test_tone_serialize() {
        let tone = Tone::Encouraging;
        let json = test_ok!(
            serde_json::to_string(&tone),
            "tone should serialize to JSON"
        );
        assert!(json.contains("Encouraging"));
    }

    #[test]
    fn test_tone_deserialize() {
        let json = "\"Instructive\"";
        let tone: Tone = test_ok!(
            serde_json::from_str(json),
            "tone should deserialize from JSON"
        );
        assert_eq!(tone, Tone::Instructive);
    }

    #[test]
    fn test_tone_hash() {
        let mut map: HashMap<Tone, i32> = HashMap::new();
        map.insert(Tone::Friendly, 1);
        map.insert(Tone::Professional, 2);
        assert_eq!(map.get(&Tone::Friendly), Some(&1));
        assert_eq!(map.get(&Tone::Professional), Some(&2));
    }

    // ========== ToneParameters Tests ==========

    #[test]
    fn test_tone_parameters_default() {
        let params = ToneParameters::default();
        assert_eq!(params.formality, 0.4);
        assert_eq!(params.warmth, 0.7);
        assert_eq!(params.energy, 0.5);
        assert_eq!(params.directness, 0.5);
        assert_eq!(params.complexity, 0.4);
        assert_eq!(params.humor, 0.2);
        assert_eq!(params.empathy, 0.6);
    }

    #[test]
    fn test_tone_parameters_clone() {
        let params = ToneParameters::default();
        let cloned = params.clone();
        assert_eq!(cloned.formality, params.formality);
        assert_eq!(cloned.warmth, params.warmth);
    }

    #[test]
    fn test_tone_parameters_debug() {
        let params = ToneParameters::default();
        let debug = format!("{:?}", params);
        assert!(debug.contains("formality"));
        assert!(debug.contains("warmth"));
    }

    #[test]
    fn test_tone_parameters_serialize() {
        let params = ToneParameters::default();
        let json = test_ok!(
            serde_json::to_string(&params),
            "ToneParameters should serialize to JSON"
        );
        assert!(json.contains("formality"));
        assert!(json.contains("warmth"));
    }

    #[test]
    fn test_tone_parameters_custom() {
        let params = ToneParameters {
            formality: 0.9,
            warmth: 0.1,
            energy: 0.2,
            directness: 0.8,
            complexity: 0.7,
            humor: 0.0,
            empathy: 0.3,
        };
        assert_eq!(params.formality, 0.9);
        assert_eq!(params.humor, 0.0);
    }

    // ========== ToneTextMarkers Tests ==========

    #[test]
    fn test_tone_text_markers_default() {
        let markers = ToneTextMarkers::default();
        assert!(markers.prefixes.is_empty());
        assert!(markers.suffixes.is_empty());
        assert!(markers.interjections.is_empty());
        assert!(markers.emojis.is_empty());
        assert!(markers.expressions.is_empty());
    }

    #[test]
    fn test_tone_text_markers_clone() {
        let mut markers = ToneTextMarkers::default();
        markers.prefixes.push("Hello".to_string());
        let cloned = markers.clone();
        assert_eq!(cloned.prefixes, markers.prefixes);
    }

    #[test]
    fn test_tone_text_markers_debug() {
        let markers = ToneTextMarkers::default();
        let debug = format!("{:?}", markers);
        assert!(debug.contains("prefixes"));
    }

    #[test]
    fn test_tone_text_markers_serialize() {
        let markers = ToneTextMarkers::default();
        let json = test_ok!(
            serde_json::to_string(&markers),
            "ToneTextMarkers should serialize to JSON"
        );
        assert!(json.contains("prefixes"));
    }

    #[test]
    fn test_tone_text_markers_with_content() {
        let markers = ToneTextMarkers {
            prefixes: vec!["Hi!".to_string()],
            suffixes: vec!["Bye!".to_string()],
            interjections: vec!["Wow!".to_string()],
            emojis: vec!["😊".to_string()],
            expressions: vec!["Indeed".to_string()],
        };
        assert_eq!(markers.prefixes.len(), 1);
        assert_eq!(markers.emojis[0], "😊");
    }

    // ========== ToneConfig Tests ==========

    #[test]
    fn test_tone_config_creation() {
        let config = ToneConfig {
            primary_tone: Tone::Friendly,
            secondary_tone: Some(Tone::Friendly),
            parameters: ToneParameters::default(),
            text_markers: ToneTextMarkers::default(),
        };
        assert_eq!(config.primary_tone, Tone::Friendly);
    }

    #[test]
    fn test_tone_config_clone() {
        let config = ToneConfig {
            primary_tone: Tone::Professional,
            secondary_tone: None,
            parameters: ToneParameters::default(),
            text_markers: ToneTextMarkers::default(),
        };
        let cloned = config.clone();
        assert_eq!(cloned.primary_tone, config.primary_tone);
    }

    #[test]
    fn test_tone_config_debug() {
        let config = ToneConfig {
            primary_tone: Tone::Serious,
            secondary_tone: None,
            parameters: ToneParameters::default(),
            text_markers: ToneTextMarkers::default(),
        };
        let debug = format!("{:?}", config);
        assert!(debug.contains("Serious"));
    }

    #[test]
    fn test_tone_config_serialize() {
        let config = ToneConfig {
            primary_tone: Tone::Calm,
            secondary_tone: None,
            parameters: ToneParameters::default(),
            text_markers: ToneTextMarkers::default(),
        };
        let json = test_ok!(
            serde_json::to_string(&config),
            "ToneConfig should serialize to JSON"
        );
        assert!(json.contains("Calm"));
    }

    // ========== ToneEngine Tests ==========

    #[test]
    fn test_tone_engine_default() {
        let engine = ToneEngine::default();
        assert_eq!(engine.current(), Tone::Friendly);
    }

    #[test]
    fn test_tone_engine_current() {
        let engine = ToneEngine::default();
        let current = engine.current();
        assert_eq!(current, Tone::Friendly);
    }

    #[test]
    fn test_tone_engine_parameters() {
        let engine = ToneEngine::default();
        let params = engine.parameters();
        assert!(params.warmth > 0.0);
    }

    #[test]
    fn test_tone_engine_set_tone_professional() {
        let mut engine = ToneEngine::default();
        engine.set_tone(Tone::Professional);
        assert_eq!(engine.current(), Tone::Professional);
    }

    #[test]
    fn test_tone_engine_set_tone_empathetic() {
        let mut engine = ToneEngine::default();
        engine.set_tone(Tone::Empathetic);
        assert_eq!(engine.current(), Tone::Empathetic);
    }

    #[test]
    fn test_tone_engine_set_tone_encouraging() {
        let mut engine = ToneEngine::default();
        engine.set_tone(Tone::Encouraging);
        assert_eq!(engine.current(), Tone::Encouraging);
    }

    #[test]
    fn test_tone_engine_set_tone_instructive() {
        let mut engine = ToneEngine::default();
        engine.set_tone(Tone::Instructive);
        assert_eq!(engine.current(), Tone::Instructive);
    }

    #[test]
    fn test_tone_engine_set_tone_playful() {
        let mut engine = ToneEngine::default();
        engine.set_tone(Tone::Playful);
        assert_eq!(engine.current(), Tone::Playful);
    }

    #[test]
    fn test_tone_engine_set_tone_serious() {
        let mut engine = ToneEngine::default();
        engine.set_tone(Tone::Serious);
        assert_eq!(engine.current(), Tone::Serious);
    }

    #[test]
    fn test_tone_engine_set_tone_urgent() {
        let mut engine = ToneEngine::default();
        engine.set_tone(Tone::Urgent);
        assert_eq!(engine.current(), Tone::Urgent);
    }

    #[test]
    fn test_tone_engine_restore_tone() {
        let mut engine = ToneEngine::default();
        engine.set_tone(Tone::Professional);
        engine.restore_tone();
        assert_eq!(engine.current(), Tone::Friendly);
    }

    #[test]
    fn test_tone_engine_restore_tone_multiple() {
        let mut engine = ToneEngine::default();
        engine.set_tone(Tone::Professional);
        engine.set_tone(Tone::Serious);
        engine.restore_tone();
        assert_eq!(engine.current(), Tone::Professional);
        engine.restore_tone();
        assert_eq!(engine.current(), Tone::Friendly);
    }

    #[test]
    fn test_tone_engine_restore_tone_empty_stack() {
        let mut engine = ToneEngine::default();
        engine.restore_tone(); // Should not panic
        assert_eq!(engine.current(), Tone::Friendly);
    }

    #[test]
    fn test_tone_engine_get_config_friendly() {
        let engine = ToneEngine::default();
        let config = engine.get_config(Tone::Friendly);
        assert!(config.is_some());
    }

    #[test]
    fn test_tone_engine_get_config_professional() {
        let engine = ToneEngine::default();
        let config = engine.get_config(Tone::Professional);
        assert!(config.is_some());
    }

    #[test]
    fn test_tone_engine_get_config_empathetic() {
        let engine = ToneEngine::default();
        let config = engine.get_config(Tone::Empathetic);
        assert!(config.is_some());
    }

    #[test]
    fn test_tone_engine_get_config_encouraging() {
        let engine = ToneEngine::default();
        let config = engine.get_config(Tone::Encouraging);
        assert!(config.is_some());
    }

    #[test]
    fn test_tone_engine_get_config_instructive() {
        let engine = ToneEngine::default();
        let config = engine.get_config(Tone::Instructive);
        assert!(config.is_some());
    }

    #[test]
    fn test_tone_engine_get_config_playful() {
        let engine = ToneEngine::default();
        let config = engine.get_config(Tone::Playful);
        assert!(config.is_some());
    }

    #[test]
    fn test_tone_engine_get_config_serious() {
        let engine = ToneEngine::default();
        let config = engine.get_config(Tone::Serious);
        assert!(config.is_some());
    }

    #[test]
    fn test_tone_engine_get_config_urgent() {
        let engine = ToneEngine::default();
        let config = engine.get_config(Tone::Urgent);
        assert!(config.is_some());
    }

    #[test]
    fn test_tone_engine_get_config_none() {
        let engine = ToneEngine::default();
        let config = engine.get_config(Tone::Apologetic);
        assert!(config.is_none());
    }

    #[test]
    fn test_tone_engine_adapt_text_no_config() {
        let mut engine = ToneEngine::default();
        engine.set_tone(Tone::Neutral);
        let text = engine.adapt_text("Hello world");
        assert!(text.contains("Hello world"));
    }

    #[test]
    fn test_tone_engine_adapt_text_basic() {
        let engine = ToneEngine::default();
        let text = engine.adapt_text("Test message");
        assert!(text.contains("Test message"));
    }

    #[test]
    fn test_tone_engine_detect_urgent() {
        let engine = ToneEngine::default();
        let tone = engine.detect_appropriate_tone("C'est urgent!");
        assert_eq!(tone, Tone::Urgent);
    }

    #[test]
    fn test_tone_engine_detect_critique() {
        let engine = ToneEngine::default();
        let tone = engine.detect_appropriate_tone("Situation critique");
        assert_eq!(tone, Tone::Urgent);
    }

    #[test]
    fn test_tone_engine_detect_erreur() {
        let engine = ToneEngine::default();
        let tone = engine.detect_appropriate_tone("J'ai une erreur");
        assert_eq!(tone, Tone::Empathetic);
    }

    #[test]
    fn test_tone_engine_detect_probleme() {
        let engine = ToneEngine::default();
        let tone = engine.detect_appropriate_tone("J'ai un problème");
        assert_eq!(tone, Tone::Empathetic);
    }

    #[test]
    fn test_tone_engine_detect_bravo() {
        let engine = ToneEngine::default();
        let tone = engine.detect_appropriate_tone("Bravo pour le travail!");
        assert_eq!(tone, Tone::Celebratory);
    }

    #[test]
    fn test_tone_engine_detect_reussi() {
        let engine = ToneEngine::default();
        let tone = engine.detect_appropriate_tone("J'ai réussi l'examen");
        assert_eq!(tone, Tone::Celebratory);
    }

    #[test]
    fn test_tone_engine_detect_comment() {
        let engine = ToneEngine::default();
        let tone = engine.detect_appropriate_tone("Comment faire cela?");
        assert_eq!(tone, Tone::Instructive);
    }

    #[test]
    fn test_tone_engine_detect_expliquer() {
        let engine = ToneEngine::default();
        let tone = engine.detect_appropriate_tone("Peux-tu m'expliquer?");
        assert_eq!(tone, Tone::Instructive);
    }

    #[test]
    fn test_tone_engine_detect_aide() {
        let engine = ToneEngine::default();
        let tone = engine.detect_appropriate_tone("J'ai besoin d'aide");
        assert_eq!(tone, Tone::Encouraging);
    }

    #[test]
    fn test_tone_engine_detect_support() {
        let engine = ToneEngine::default();
        let tone = engine.detect_appropriate_tone("Je cherche du support");
        assert_eq!(tone, Tone::Encouraging);
    }

    #[test]
    fn test_tone_engine_detect_professionnel() {
        let engine = ToneEngine::default();
        let tone = engine.detect_appropriate_tone("Contexte professionnel");
        assert_eq!(tone, Tone::Professional);
    }

    #[test]
    fn test_tone_engine_detect_formel() {
        let engine = ToneEngine::default();
        let tone = engine.detect_appropriate_tone("Communication formelle");
        assert_eq!(tone, Tone::Professional);
    }

    #[test]
    fn test_tone_engine_detect_default() {
        let engine = ToneEngine::default();
        let tone = engine.detect_appropriate_tone("Bonjour!");
        assert_eq!(tone, Tone::Friendly);
    }

    #[test]
    fn test_tone_engine_detect_case_insensitive() {
        let engine = ToneEngine::default();
        let tone = engine.detect_appropriate_tone("URGENT!");
        assert_eq!(tone, Tone::Urgent);
    }

    // ========== Preset Config Tests ==========

    #[test]
    fn test_friendly_config_warmth() {
        let engine = ToneEngine::default();
        let config = test_some!(
            engine.get_config(Tone::Friendly),
            "Tone::Friendly config should exist"
        );
        assert_eq!(config.parameters.warmth, 0.8);
    }

    #[test]
    fn test_professional_config_formality() {
        let engine = ToneEngine::default();
        let config = test_some!(
            engine.get_config(Tone::Professional),
            "Tone::Professional config should exist"
        );
        assert_eq!(config.parameters.formality, 0.8);
    }

    #[test]
    fn test_empathetic_config_empathy() {
        let engine = ToneEngine::default();
        let config = test_some!(
            engine.get_config(Tone::Empathetic),
            "Tone::Empathetic config should exist"
        );
        assert_eq!(config.parameters.empathy, 1.0);
    }

    #[test]
    fn test_encouraging_config_energy() {
        let engine = ToneEngine::default();
        let config = test_some!(
            engine.get_config(Tone::Encouraging),
            "Tone::Encouraging config should exist"
        );
        assert_eq!(config.parameters.energy, 0.8);
    }

    #[test]
    fn test_playful_config_humor() {
        let engine = ToneEngine::default();
        let config = test_some!(
            engine.get_config(Tone::Playful),
            "Tone::Playful config should exist"
        );
        assert_eq!(config.parameters.humor, 0.8);
    }

    #[test]
    fn test_urgent_config_directness() {
        let engine = ToneEngine::default();
        let config = test_some!(
            engine.get_config(Tone::Urgent),
            "Tone::Urgent config should exist"
        );
        assert_eq!(config.parameters.directness, 1.0);
    }

    #[test]
    fn test_serious_config_humor() {
        let engine = ToneEngine::default();
        let config = test_some!(
            engine.get_config(Tone::Serious),
            "Tone::Serious config should exist"
        );
        assert_eq!(config.parameters.humor, 0.0);
    }

    #[test]
    fn test_friendly_has_emojis() {
        let engine = ToneEngine::default();
        let config = test_some!(
            engine.get_config(Tone::Friendly),
            "Tone::Friendly config should exist"
        );
        assert!(!config.text_markers.emojis.is_empty());
    }

    #[test]
    fn test_professional_no_emojis() {
        let engine = ToneEngine::default();
        let config = test_some!(
            engine.get_config(Tone::Professional),
            "Tone::Professional config should exist"
        );
        assert!(config.text_markers.emojis.is_empty());
    }

    #[test]
    fn test_empathetic_secondary_tone() {
        let engine = ToneEngine::default();
        let config = test_some!(
            engine.get_config(Tone::Empathetic),
            "Tone::Empathetic config should exist"
        );
        assert_eq!(config.secondary_tone, Some(Tone::Calm));
    }

    #[test]
    fn test_encouraging_secondary_tone() {
        let engine = ToneEngine::default();
        let config = test_some!(
            engine.get_config(Tone::Encouraging),
            "Tone::Encouraging config should exist"
        );
        assert_eq!(config.secondary_tone, Some(Tone::Enthusiastic));
    }

    #[test]
    fn test_professional_no_secondary_tone() {
        let engine = ToneEngine::default();
        let config = test_some!(
            engine.get_config(Tone::Professional),
            "Tone::Professional config should exist"
        );
        assert_eq!(config.secondary_tone, None);
    }
}
