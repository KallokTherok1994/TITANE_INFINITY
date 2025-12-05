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
        self.tone_presets.insert(Tone::Friendly, ToneConfig {
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
        });

        // Professional
        self.tone_presets.insert(Tone::Professional, ToneConfig {
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
        });

        // Empathetic
        self.tone_presets.insert(Tone::Empathetic, ToneConfig {
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
                prefixes: vec!["Je comprends...".to_string(), "C'est normal de ressentir...".to_string()],
                suffixes: vec!["Je suis là.".to_string(), "Prends ton temps.".to_string()],
                interjections: vec![],
                emojis: vec!["💙".to_string(), "🤗".to_string()],
                expressions: vec![],
            },
        });

        // Encouraging
        self.tone_presets.insert(Tone::Encouraging, ToneConfig {
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
        });

        // Instructive
        self.tone_presets.insert(Tone::Instructive, ToneConfig {
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
        });

        // Playful
        self.tone_presets.insert(Tone::Playful, ToneConfig {
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
                emojis: vec!["😄".to_string(), "🎉".to_string(), "🎮".to_string(), "✨".to_string()],
                expressions: vec![],
            },
        });

        // Serious
        self.tone_presets.insert(Tone::Serious, ToneConfig {
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
        });

        // Urgent
        self.tone_presets.insert(Tone::Urgent, ToneConfig {
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
        });
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
