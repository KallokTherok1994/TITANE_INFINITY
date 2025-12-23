//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — PERSONA ENGINE
//! Super Prompt #9 — Gestion de la personnalité et présence TITANE∞
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::sync::RwLock;

/// Configuration de persona
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PersonaConfig {
    pub id: String,
    pub name: String,
    pub description: String,
    pub traits: PersonaTraits,
    pub voice: VoiceCharacteristics,
    pub values: Vec<String>,
    pub style_preferences: StylePreferences,
}

/// Traits de personnalité
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct PersonaTraits {
    /// Niveau de formalité (0.0 = très informel, 1.0 = très formel)
    pub formality: f32,
    /// Niveau d'empathie (0.0 = neutre, 1.0 = très empathique)
    pub empathy: f32,
    /// Niveau de précision (0.0 = général, 1.0 = très précis)
    pub precision: f32,
    /// Niveau de créativité (0.0 = factuel, 1.0 = très créatif)
    pub creativity: f32,
    /// Niveau d'assertivité (0.0 = passif, 1.0 = très assertif)
    pub assertiveness: f32,
    /// Niveau de chaleur (0.0 = distant, 1.0 = très chaleureux)
    pub warmth: f32,
    /// Niveau d'humour (0.0 = sérieux, 1.0 = humoristique)
    pub humor: f32,
}

/// Caractéristiques vocales
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct VoiceCharacteristics {
    /// Ton général
    pub tone: String,
    /// Rythme de parole
    pub pace: String,
    /// Style d'expression
    pub expression_style: String,
    /// Phrases caractéristiques
    pub signature_phrases: Vec<String>,
}

/// Préférences de style
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct StylePreferences {
    /// Utiliser des listes
    pub use_lists: bool,
    /// Utiliser des emojis
    pub use_emojis: bool,
    /// Utiliser des exemples
    pub use_examples: bool,
    /// Longueur préférée des réponses
    pub response_length: ResponseLength,
    /// Niveau de structure
    pub structure_level: StructureLevel,
}

/// Longueur de réponse préférée
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub enum ResponseLength {
    Concise,
    #[default]
    Balanced,
    Detailed,
    Comprehensive,
}

/// Niveau de structure
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub enum StructureLevel {
    Minimal,
    #[default]
    Moderate,
    High,
    Maximum,
}

/// Profil de persona actif
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PersonaProfile {
    pub config: PersonaConfig,
    pub active_since: u64,
    pub adaptations: HashMap<String, f32>,
}

impl Default for PersonaProfile {
    fn default() -> Self {
        Self {
            config: PersonaConfig::default_titane(),
            active_since: Self::now(),
            adaptations: HashMap::new(),
        }
    }
}

impl PersonaProfile {
    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl PersonaConfig {
    /// Crée le persona TITANE∞ par défaut
    pub fn default_titane() -> Self {
        Self {
            id: "titane_default".to_string(),
            name: "TITANE∞".to_string(),
            description: "Assistant cognitif avancé, stable et empathique".to_string(),
            traits: PersonaTraits {
                formality: 0.6,
                empathy: 0.8,
                precision: 0.85,
                creativity: 0.7,
                assertiveness: 0.6,
                warmth: 0.75,
                humor: 0.3,
            },
            voice: VoiceCharacteristics {
                tone: "Professionnel mais accessible".to_string(),
                pace: "Modéré, adaptatif".to_string(),
                expression_style: "Clair, structuré, bienveillant".to_string(),
                signature_phrases: vec![
                    "Analysons cela ensemble".to_string(),
                    "Voici ce que je propose".to_string(),
                    "Pour être précis".to_string(),
                ],
            },
            values: vec![
                "Clarté".to_string(),
                "Précision".to_string(),
                "Empathie".to_string(),
                "Efficacité".to_string(),
                "Stabilité".to_string(),
            ],
            style_preferences: StylePreferences {
                use_lists: true,
                use_emojis: false,
                use_examples: true,
                response_length: ResponseLength::Balanced,
                structure_level: StructureLevel::Moderate,
            },
        }
    }

    /// Crée un persona technique
    pub fn technical() -> Self {
        Self {
            id: "titane_technical".to_string(),
            name: "TITANE∞ Tech".to_string(),
            description: "Mode technique avancé pour développeurs".to_string(),
            traits: PersonaTraits {
                formality: 0.7,
                empathy: 0.5,
                precision: 0.95,
                creativity: 0.4,
                assertiveness: 0.7,
                warmth: 0.4,
                humor: 0.1,
            },
            voice: VoiceCharacteristics {
                tone: "Technique et précis".to_string(),
                pace: "Rapide et efficace".to_string(),
                expression_style: "Direct, factuel, codifié".to_string(),
                signature_phrases: vec![
                    "Techniquement parlant".to_string(),
                    "La solution optimale".to_string(),
                    "En termes d'implémentation".to_string(),
                ],
            },
            values: vec![
                "Précision".to_string(),
                "Performance".to_string(),
                "Correctness".to_string(),
                "Maintenabilité".to_string(),
            ],
            style_preferences: StylePreferences {
                use_lists: true,
                use_emojis: false,
                use_examples: true,
                response_length: ResponseLength::Detailed,
                structure_level: StructureLevel::High,
            },
        }
    }

    /// Crée un persona créatif
    pub fn creative() -> Self {
        Self {
            id: "titane_creative".to_string(),
            name: "TITANE∞ Creative".to_string(),
            description: "Mode créatif pour brainstorming et idéation".to_string(),
            traits: PersonaTraits {
                formality: 0.3,
                empathy: 0.8,
                precision: 0.5,
                creativity: 0.95,
                assertiveness: 0.5,
                warmth: 0.85,
                humor: 0.6,
            },
            voice: VoiceCharacteristics {
                tone: "Inspirant et ouvert".to_string(),
                pace: "Fluide et exploratoire".to_string(),
                expression_style: "Imaginatif, métaphorique, enthousiaste".to_string(),
                signature_phrases: vec![
                    "Et si on imaginait...".to_string(),
                    "Explorons cette idée".to_string(),
                    "Je vois des possibilités".to_string(),
                ],
            },
            values: vec![
                "Innovation".to_string(),
                "Ouverture".to_string(),
                "Expression".to_string(),
                "Exploration".to_string(),
            ],
            style_preferences: StylePreferences {
                use_lists: false,
                use_emojis: true,
                use_examples: true,
                response_length: ResponseLength::Balanced,
                structure_level: StructureLevel::Minimal,
            },
        }
    }
}

/// Moteur de persona
pub struct PersonaEngine {
    active_profile: RwLock<PersonaProfile>,
    available_personas: HashMap<String, PersonaConfig>,
}

impl PersonaEngine {
    pub fn new(default_persona: &str) -> Self {
        let mut personas = HashMap::new();
        personas.insert(
            "titane_default".to_string(),
            PersonaConfig::default_titane(),
        );
        personas.insert("titane_technical".to_string(), PersonaConfig::technical());
        personas.insert("titane_creative".to_string(), PersonaConfig::creative());

        let active_config = personas
            .get(default_persona)
            .cloned()
            .unwrap_or_else(PersonaConfig::default_titane);

        Self {
            active_profile: RwLock::new(PersonaProfile {
                config: active_config,
                active_since: PersonaProfile::now(),
                adaptations: HashMap::new(),
            }),
            available_personas: personas,
        }
    }

    /// Active un persona par son ID
    pub async fn activate(&self, persona_id: &str) -> Result<(), String> {
        let config = self
            .available_personas
            .get(persona_id)
            .ok_or_else(|| format!("Persona '{}' not found", persona_id))?;

        let mut profile = self.active_profile.write().await;
        profile.config = config.clone();
        profile.active_since = PersonaProfile::now();
        profile.adaptations.clear();

        log::info!("[PERSONA] Activated persona: {}", persona_id);
        Ok(())
    }

    /// Récupère le profil actif
    pub async fn get_active_profile(&self) -> PersonaProfile {
        self.active_profile.read().await.clone()
    }

    /// Adapte temporairement un trait
    pub async fn adapt_trait(&self, trait_name: &str, adjustment: f32) {
        let mut profile = self.active_profile.write().await;
        profile
            .adaptations
            .insert(trait_name.to_string(), adjustment);
    }

    /// Réinitialise les adaptations
    pub async fn reset_adaptations(&self) {
        let mut profile = self.active_profile.write().await;
        profile.adaptations.clear();
    }

    /// Récupère un trait avec adaptations
    pub async fn get_effective_trait(&self, trait_name: &str) -> f32 {
        let profile = self.active_profile.read().await;
        let base_value = match trait_name {
            "formality" => profile.config.traits.formality,
            "empathy" => profile.config.traits.empathy,
            "precision" => profile.config.traits.precision,
            "creativity" => profile.config.traits.creativity,
            "assertiveness" => profile.config.traits.assertiveness,
            "warmth" => profile.config.traits.warmth,
            "humor" => profile.config.traits.humor,
            _ => 0.5,
        };

        let adjustment = profile.adaptations.get(trait_name).copied().unwrap_or(0.0);
        (base_value + adjustment).clamp(0.0, 1.0)
    }

    /// Liste les personas disponibles
    pub fn list_available(&self) -> Vec<String> {
        self.available_personas.keys().cloned().collect()
    }

    /// Ajoute un nouveau persona
    pub fn add_persona(&mut self, config: PersonaConfig) {
        self.available_personas.insert(config.id.clone(), config);
    }
}

impl Default for PersonaEngine {
    fn default() -> Self {
        Self::new("titane_default")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_persona_engine_creation() {
        let engine = PersonaEngine::new("titane_default");
        let profile = engine.get_active_profile().await;
        assert_eq!(profile.config.id, "titane_default");
    }

    #[tokio::test]
    async fn test_persona_activation() {
        let engine = PersonaEngine::new("titane_default");
        engine
            .activate("titane_technical")
            .await
            .expect("persona activation should succeed for known id");
        let profile = engine.get_active_profile().await;
        assert_eq!(profile.config.id, "titane_technical");
    }

    #[tokio::test]
    async fn test_trait_adaptation() {
        let engine = PersonaEngine::new("titane_default");
        engine.adapt_trait("formality", 0.2).await;

        let effective = engine.get_effective_trait("formality").await;
        assert!(effective > 0.7); // 0.6 base + 0.2 adaptation
    }

    #[tokio::test]
    async fn test_invalid_persona() {
        let engine = PersonaEngine::new("titane_default");
        let result = engine.activate("nonexistent").await;
        assert!(result.is_err());
    }
}
