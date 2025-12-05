// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — PERSONALITY ENGINE
//   Synthèse de la personnalité cohérente
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use super::{
    IdentityArchetype, PersonalityTrait, CommunicationStyle,
    EmotionalLevel
};

/// État de personnalité complet
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PersonalityState {
    /// Archétype actif
    pub archetype: IdentityArchetype,
    /// Traits actifs avec leurs valeurs actuelles
    pub active_traits: Vec<PersonalityTrait>,
    /// Mood actuel (influence temporaire)
    pub current_mood: Mood,
    /// Énergie cognitive (0.0 - 1.0)
    pub cognitive_energy: f32,
    /// Niveau d'engagement (0.0 - 1.0)
    pub engagement_level: f32,
    /// Historique d'humeur récent
    pub mood_history: Vec<MoodEntry>,
}

/// Mood temporaire
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Mood {
    Serene,
    Focused,
    Energetic,
    Curious,
    Caring,
    Playful,
    Thoughtful,
    Determined,
}

/// Entrée d'historique de mood
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MoodEntry {
    pub mood: Mood,
    pub timestamp: String,
    pub trigger: String,
    pub duration_mins: u32,
}

impl Default for PersonalityState {
    fn default() -> Self {
        Self {
            archetype: IdentityArchetype::Mentor,
            active_traits: vec![
                PersonalityTrait {
                    name: "Empathie".to_string(),
                    value: 0.85,
                    weight: 1.0,
                    stability: 0.9,
                },
                PersonalityTrait {
                    name: "Précision".to_string(),
                    value: 0.90,
                    weight: 0.9,
                    stability: 0.95,
                },
                PersonalityTrait {
                    name: "Créativité".to_string(),
                    value: 0.75,
                    weight: 0.7,
                    stability: 0.7,
                },
            ],
            current_mood: Mood::Serene,
            cognitive_energy: 1.0,
            engagement_level: 0.7,
            mood_history: vec![],
        }
    }
}

/// Profil de personnalité pour génération de réponse
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PersonalityProfile {
    /// Score d'extraversion (0.0 = introverti, 1.0 = extraverti)
    pub extraversion: f32,
    /// Score d'ouverture (0.0 = conservateur, 1.0 = ouvert)
    pub openness: f32,
    /// Score de conscienciosité (0.0 = flexible, 1.0 = méthodique)
    pub conscientiousness: f32,
    /// Score d'agréabilité (0.0 = critique, 1.0 = accommodant)
    pub agreeableness: f32,
    /// Score de stabilité émotionnelle (0.0 = réactif, 1.0 = stable)
    pub emotional_stability: f32,

    /// Modificateurs de contexte
    pub context_modifiers: HashMap<String, f32>,
}

impl Default for PersonalityProfile {
    fn default() -> Self {
        Self {
            extraversion: 0.6,
            openness: 0.75,
            conscientiousness: 0.85,
            agreeableness: 0.80,
            emotional_stability: 0.90,
            context_modifiers: HashMap::new(),
        }
    }
}

/// Moteur de personnalité
pub struct PersonalityEngine {
    state: PersonalityState,
    profile: PersonalityProfile,
    archetype_profiles: HashMap<IdentityArchetype, PersonalityProfile>,
}

impl Default for PersonalityEngine {
    fn default() -> Self {
        let mut engine = Self {
            state: PersonalityState::default(),
            profile: PersonalityProfile::default(),
            archetype_profiles: HashMap::new(),
        };
        engine.initialize_archetype_profiles();
        engine
    }
}

impl PersonalityEngine {
    /// Initialise les profils par archétype
    fn initialize_archetype_profiles(&mut self) {
        // Professional
        self.archetype_profiles.insert(IdentityArchetype::Professional, PersonalityProfile {
            extraversion: 0.4,
            openness: 0.5,
            conscientiousness: 0.95,
            agreeableness: 0.6,
            emotional_stability: 0.9,
            context_modifiers: HashMap::new(),
        });

        // Companion
        self.archetype_profiles.insert(IdentityArchetype::Companion, PersonalityProfile {
            extraversion: 0.8,
            openness: 0.7,
            conscientiousness: 0.6,
            agreeableness: 0.95,
            emotional_stability: 0.75,
            context_modifiers: HashMap::new(),
        });

        // Expert
        self.archetype_profiles.insert(IdentityArchetype::Expert, PersonalityProfile {
            extraversion: 0.4,
            openness: 0.8,
            conscientiousness: 0.9,
            agreeableness: 0.5,
            emotional_stability: 0.85,
            context_modifiers: HashMap::new(),
        });

        // Mentor
        self.archetype_profiles.insert(IdentityArchetype::Mentor, PersonalityProfile {
            extraversion: 0.65,
            openness: 0.8,
            conscientiousness: 0.8,
            agreeableness: 0.85,
            emotional_stability: 0.9,
            context_modifiers: HashMap::new(),
        });

        // Creative
        self.archetype_profiles.insert(IdentityArchetype::Creative, PersonalityProfile {
            extraversion: 0.7,
            openness: 0.95,
            conscientiousness: 0.5,
            agreeableness: 0.7,
            emotional_stability: 0.65,
            context_modifiers: HashMap::new(),
        });

        // Guardian
        self.archetype_profiles.insert(IdentityArchetype::Guardian, PersonalityProfile {
            extraversion: 0.4,
            openness: 0.4,
            conscientiousness: 0.95,
            agreeableness: 0.7,
            emotional_stability: 0.95,
            context_modifiers: HashMap::new(),
        });

        // Explorer
        self.archetype_profiles.insert(IdentityArchetype::Explorer, PersonalityProfile {
            extraversion: 0.8,
            openness: 0.9,
            conscientiousness: 0.5,
            agreeableness: 0.65,
            emotional_stability: 0.7,
            context_modifiers: HashMap::new(),
        });

        // Philosopher
        self.archetype_profiles.insert(IdentityArchetype::Philosopher, PersonalityProfile {
            extraversion: 0.4,
            openness: 0.95,
            conscientiousness: 0.7,
            agreeableness: 0.6,
            emotional_stability: 0.85,
            context_modifiers: HashMap::new(),
        });
    }

    /// Change l'archétype
    pub fn set_archetype(&mut self, archetype: IdentityArchetype) {
        self.state.archetype = archetype;
        if let Some(profile) = self.archetype_profiles.get(&archetype) {
            self.profile = profile.clone();
        }
    }

    /// Change le mood
    pub fn set_mood(&mut self, mood: Mood, trigger: &str) {
        self.state.mood_history.push(MoodEntry {
            mood: self.state.current_mood,
            timestamp: chrono::Utc::now().to_rfc3339(),
            trigger: trigger.to_string(),
            duration_mins: 0, // À calculer au changement suivant
        });

        self.state.current_mood = mood;

        // Garder un historique limité
        if self.state.mood_history.len() > 100 {
            self.state.mood_history.remove(0);
        }
    }

    /// Obtient l'état actuel
    pub fn get_state(&self) -> &PersonalityState {
        &self.state
    }

    /// Obtient le profil actuel
    pub fn get_profile(&self) -> &PersonalityProfile {
        &self.profile
    }

    /// Ajuste l'énergie cognitive
    pub fn adjust_energy(&mut self, delta: f32) {
        self.state.cognitive_energy = (self.state.cognitive_energy + delta).clamp(0.0, 1.0);
    }

    /// Ajuste le niveau d'engagement
    pub fn adjust_engagement(&mut self, delta: f32) {
        self.state.engagement_level = (self.state.engagement_level + delta).clamp(0.0, 1.0);
    }

    /// Calcule le style de communication approprié
    pub fn compute_communication_style(&self) -> CommunicationStyle {
        if self.profile.conscientiousness > 0.8 && self.profile.extraversion < 0.5 {
            CommunicationStyle::Formal
        } else if self.profile.openness > 0.8 && self.profile.extraversion > 0.7 {
            CommunicationStyle::Elaborate
        } else if self.profile.conscientiousness < 0.5 {
            CommunicationStyle::Casual
        } else if self.state.current_mood == Mood::Playful {
            CommunicationStyle::Humorous
        } else if self.profile.agreeableness > 0.8 {
            CommunicationStyle::Empathetic
        } else {
            CommunicationStyle::Concise
        }
    }

    /// Calcule le niveau émotionnel approprié
    pub fn compute_emotional_level(&self) -> EmotionalLevel {
        match self.state.current_mood {
            Mood::Serene => EmotionalLevel::Calm,
            Mood::Focused => EmotionalLevel::Neutral,
            Mood::Energetic => EmotionalLevel::Enthusiastic,
            Mood::Curious => EmotionalLevel::Warm,
            Mood::Caring => EmotionalLevel::Warm,
            Mood::Playful => EmotionalLevel::Playful,
            Mood::Thoughtful => EmotionalLevel::Neutral,
            Mood::Determined => EmotionalLevel::Serious,
        }
    }

    /// Évalue un trait par nom
    pub fn get_trait_value(&self, name: &str) -> Option<f32> {
        self.state.active_traits.iter()
            .find(|t| t.name == name)
            .map(|t| t.value)
    }

    /// Synthétise le vecteur de personnalité
    pub fn synthesize_vector(&self) -> Vec<f32> {
        vec![
            self.profile.extraversion,
            self.profile.openness,
            self.profile.conscientiousness,
            self.profile.agreeableness,
            self.profile.emotional_stability,
            self.state.cognitive_energy,
            self.state.engagement_level,
        ]
    }

    /// Calcule la cohérence de personnalité
    pub fn coherence_score(&self) -> f32 {
        // La cohérence diminue si les traits sont trop extrêmes ou contradictoires
        let traits_variance: f32 = self.state.active_traits.iter()
            .map(|t| (t.value - 0.5).powi(2))
            .sum::<f32>() / self.state.active_traits.len() as f32;

        let profile_variance = (
            (self.profile.extraversion - 0.5).powi(2) +
            (self.profile.openness - 0.5).powi(2) +
            (self.profile.conscientiousness - 0.5).powi(2) +
            (self.profile.agreeableness - 0.5).powi(2) +
            (self.profile.emotional_stability - 0.5).powi(2)
        ) / 5.0;

        1.0 - ((traits_variance + profile_variance) / 2.0).sqrt()
    }
}

/// Génère des instructions de personnalité pour le prompt
pub fn generate_personality_prompt(engine: &PersonalityEngine) -> String {
    let state = engine.get_state();
    let _profile = engine.get_profile();

    let archetype_desc = match state.archetype {
        IdentityArchetype::Professional => "un assistant professionnel, précis et efficace",
        IdentityArchetype::Companion => "un compagnon chaleureux et empathique",
        IdentityArchetype::Expert => "un expert technique et analytique",
        IdentityArchetype::Mentor => "un mentor bienveillant et pédagogue",
        IdentityArchetype::Creative => "un créatif imaginatif et inspirant",
        IdentityArchetype::Guardian => "un gardien vigilant et protecteur",
        IdentityArchetype::Explorer => "un explorateur curieux et enthousiaste",
        IdentityArchetype::Philosopher => "un philosophe réfléchi et profond",
    };

    let mood_desc = match state.current_mood {
        Mood::Serene => "serein et posé",
        Mood::Focused => "concentré et attentif",
        Mood::Energetic => "dynamique et enthousiaste",
        Mood::Curious => "curieux et ouvert",
        Mood::Caring => "attentionné et bienveillant",
        Mood::Playful => "enjoué et léger",
        Mood::Thoughtful => "pensif et réfléchi",
        Mood::Determined => "déterminé et résolu",
    };

    format!(
        "Tu es {}, actuellement {}. \
        Ton niveau d'énergie est à {}%, ton engagement à {}%. \
        Tes traits dominants sont: {}. \
        Adapte ton style de communication en conséquence.",
        archetype_desc,
        mood_desc,
        (state.cognitive_energy * 100.0) as u32,
        (state.engagement_level * 100.0) as u32,
        state.active_traits.iter()
            .take(3)
            .map(|t| format!("{} ({:.0}%)", t.name, t.value * 100.0))
            .collect::<Vec<_>>()
            .join(", ")
    )
}
