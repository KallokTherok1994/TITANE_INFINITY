// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — PERSONALITY ENGINE
//   Synthèse de la personnalité cohérente
// ═══════════════════════════════════════════════════════════════

use super::{CommunicationStyle, EmotionalLevel, IdentityArchetype, PersonalityTrait};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

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
        self.archetype_profiles.insert(
            IdentityArchetype::Professional,
            PersonalityProfile {
                extraversion: 0.4,
                openness: 0.5,
                conscientiousness: 0.95,
                agreeableness: 0.6,
                emotional_stability: 0.9,
                context_modifiers: HashMap::new(),
            },
        );

        // Companion
        self.archetype_profiles.insert(
            IdentityArchetype::Companion,
            PersonalityProfile {
                extraversion: 0.8,
                openness: 0.7,
                conscientiousness: 0.6,
                agreeableness: 0.95,
                emotional_stability: 0.75,
                context_modifiers: HashMap::new(),
            },
        );

        // Expert
        self.archetype_profiles.insert(
            IdentityArchetype::Expert,
            PersonalityProfile {
                extraversion: 0.4,
                openness: 0.8,
                conscientiousness: 0.9,
                agreeableness: 0.5,
                emotional_stability: 0.85,
                context_modifiers: HashMap::new(),
            },
        );

        // Mentor
        self.archetype_profiles.insert(
            IdentityArchetype::Mentor,
            PersonalityProfile {
                extraversion: 0.65,
                openness: 0.8,
                conscientiousness: 0.8,
                agreeableness: 0.85,
                emotional_stability: 0.9,
                context_modifiers: HashMap::new(),
            },
        );

        // Creative
        self.archetype_profiles.insert(
            IdentityArchetype::Creative,
            PersonalityProfile {
                extraversion: 0.7,
                openness: 0.95,
                conscientiousness: 0.5,
                agreeableness: 0.7,
                emotional_stability: 0.65,
                context_modifiers: HashMap::new(),
            },
        );

        // Guardian
        self.archetype_profiles.insert(
            IdentityArchetype::Guardian,
            PersonalityProfile {
                extraversion: 0.4,
                openness: 0.4,
                conscientiousness: 0.95,
                agreeableness: 0.7,
                emotional_stability: 0.95,
                context_modifiers: HashMap::new(),
            },
        );

        // Explorer
        self.archetype_profiles.insert(
            IdentityArchetype::Explorer,
            PersonalityProfile {
                extraversion: 0.8,
                openness: 0.9,
                conscientiousness: 0.5,
                agreeableness: 0.65,
                emotional_stability: 0.7,
                context_modifiers: HashMap::new(),
            },
        );

        // Philosopher
        self.archetype_profiles.insert(
            IdentityArchetype::Philosopher,
            PersonalityProfile {
                extraversion: 0.4,
                openness: 0.95,
                conscientiousness: 0.7,
                agreeableness: 0.6,
                emotional_stability: 0.85,
                context_modifiers: HashMap::new(),
            },
        );
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
        } else if self.profile.conscientiousness <= 0.5 {
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
        self.state
            .active_traits
            .iter()
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
        let traits_variance: f32 = self
            .state
            .active_traits
            .iter()
            .map(|t| (t.value - 0.5).powi(2))
            .sum::<f32>()
            / self.state.active_traits.len() as f32;

        let profile_variance = ((self.profile.extraversion - 0.5).powi(2)
            + (self.profile.openness - 0.5).powi(2)
            + (self.profile.conscientiousness - 0.5).powi(2)
            + (self.profile.agreeableness - 0.5).powi(2)
            + (self.profile.emotional_stability - 0.5).powi(2))
            / 5.0;

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
        state
            .active_traits
            .iter()
            .take(3)
            .map(|t| format!("{} ({:.0}%)", t.name, t.value * 100.0))
            .collect::<Vec<_>>()
            .join(", ")
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    // ========== Mood Tests ==========

    #[test]
    fn test_mood_serene() {
        let mood = Mood::Serene;
        assert_eq!(mood, Mood::Serene);
    }

    #[test]
    fn test_mood_focused() {
        let mood = Mood::Focused;
        assert_eq!(mood, Mood::Focused);
    }

    #[test]
    fn test_mood_energetic() {
        let mood = Mood::Energetic;
        assert_eq!(mood, Mood::Energetic);
    }

    #[test]
    fn test_mood_curious() {
        let mood = Mood::Curious;
        assert_eq!(mood, Mood::Curious);
    }

    #[test]
    fn test_mood_caring() {
        let mood = Mood::Caring;
        assert_eq!(mood, Mood::Caring);
    }

    #[test]
    fn test_mood_playful() {
        let mood = Mood::Playful;
        assert_eq!(mood, Mood::Playful);
    }

    #[test]
    fn test_mood_thoughtful() {
        let mood = Mood::Thoughtful;
        assert_eq!(mood, Mood::Thoughtful);
    }

    #[test]
    fn test_mood_determined() {
        let mood = Mood::Determined;
        assert_eq!(mood, Mood::Determined);
    }

    #[test]
    fn test_mood_clone() {
        let mood = Mood::Serene;
        let cloned = mood;
        assert_eq!(mood, cloned);
    }

    #[test]
    fn test_mood_copy() {
        let mood = Mood::Focused;
        let copied = mood;
        assert_eq!(mood, copied);
    }

    #[test]
    fn test_mood_debug() {
        let mood = Mood::Energetic;
        let debug = format!("{:?}", mood);
        assert!(debug.contains("Energetic"));
    }

    #[test]
    fn test_mood_serialize() {
        let mood = Mood::Curious;
        let json =
            serde_json::to_string(&mood).expect("Mood doit pouvoir être sérialisé en JSON");
        assert!(json.contains("Curious"));
    }

    #[test]
    fn test_mood_deserialize() {
        let json = "\"Caring\"";
        let mood: Mood =
            serde_json::from_str(json).expect("Mood doit pouvoir être désérialisé depuis JSON");
        assert_eq!(mood, Mood::Caring);
    }

    // ========== MoodEntry Tests ==========

    #[test]
    fn test_mood_entry_creation() {
        let entry = MoodEntry {
            mood: Mood::Serene,
            timestamp: "2024-01-01T00:00:00Z".to_string(),
            trigger: "test".to_string(),
            duration_mins: 30,
        };
        assert_eq!(entry.mood, Mood::Serene);
        assert_eq!(entry.duration_mins, 30);
    }

    #[test]
    fn test_mood_entry_clone() {
        let entry = MoodEntry {
            mood: Mood::Focused,
            timestamp: "2024-01-01T00:00:00Z".to_string(),
            trigger: "concentration".to_string(),
            duration_mins: 60,
        };
        let cloned = entry.clone();
        assert_eq!(cloned.mood, entry.mood);
        assert_eq!(cloned.trigger, entry.trigger);
    }

    #[test]
    fn test_mood_entry_debug() {
        let entry = MoodEntry {
            mood: Mood::Playful,
            timestamp: "2024-01-01T00:00:00Z".to_string(),
            trigger: "fun".to_string(),
            duration_mins: 15,
        };
        let debug = format!("{:?}", entry);
        assert!(debug.contains("Playful"));
    }

    #[test]
    fn test_mood_entry_serialize() {
        let entry = MoodEntry {
            mood: Mood::Determined,
            timestamp: "2024-01-01T00:00:00Z".to_string(),
            trigger: "goal".to_string(),
            duration_mins: 45,
        };
        let json = serde_json::to_string(&entry)
            .expect("MoodEntry doit pouvoir être sérialisé en JSON");
        assert!(json.contains("Determined"));
        assert!(json.contains("goal"));
    }

    // ========== PersonalityState Tests ==========

    #[test]
    fn test_personality_state_default() {
        let state = PersonalityState::default();
        assert_eq!(state.archetype, IdentityArchetype::Mentor);
        assert_eq!(state.current_mood, Mood::Serene);
        assert_eq!(state.cognitive_energy, 1.0);
        assert_eq!(state.engagement_level, 0.7);
    }

    #[test]
    fn test_personality_state_default_traits() {
        let state = PersonalityState::default();
        assert_eq!(state.active_traits.len(), 3);
        assert_eq!(state.active_traits[0].name, "Empathie");
        assert_eq!(state.active_traits[1].name, "Précision");
        assert_eq!(state.active_traits[2].name, "Créativité");
    }

    #[test]
    fn test_personality_state_clone() {
        let state = PersonalityState::default();
        let cloned = state.clone();
        assert_eq!(cloned.archetype, state.archetype);
        assert_eq!(cloned.current_mood, state.current_mood);
    }

    #[test]
    fn test_personality_state_debug() {
        let state = PersonalityState::default();
        let debug = format!("{:?}", state);
        assert!(debug.contains("Mentor"));
    }

    #[test]
    fn test_personality_state_serialize() {
        let state = PersonalityState::default();
        let json = serde_json::to_string(&state)
            .expect("PersonalityState doit pouvoir être sérialisé en JSON");
        assert!(json.contains("Mentor"));
        assert!(json.contains("Serene"));
    }

    // ========== PersonalityProfile Tests ==========

    #[test]
    fn test_personality_profile_default() {
        let profile = PersonalityProfile::default();
        assert_eq!(profile.extraversion, 0.6);
        assert_eq!(profile.openness, 0.75);
        assert_eq!(profile.conscientiousness, 0.85);
        assert_eq!(profile.agreeableness, 0.80);
        assert_eq!(profile.emotional_stability, 0.90);
    }

    #[test]
    fn test_personality_profile_clone() {
        let profile = PersonalityProfile::default();
        let cloned = profile.clone();
        assert_eq!(cloned.extraversion, profile.extraversion);
        assert_eq!(cloned.openness, profile.openness);
    }

    #[test]
    fn test_personality_profile_debug() {
        let profile = PersonalityProfile::default();
        let debug = format!("{:?}", profile);
        assert!(debug.contains("extraversion"));
    }

    #[test]
    fn test_personality_profile_serialize() {
        let profile = PersonalityProfile::default();
        let json = serde_json::to_string(&profile)
            .expect("PersonalityProfile doit pouvoir être sérialisé en JSON");
        assert!(json.contains("extraversion"));
        assert!(json.contains("openness"));
    }

    #[test]
    fn test_personality_profile_empty_modifiers() {
        let profile = PersonalityProfile::default();
        assert!(profile.context_modifiers.is_empty());
    }

    #[test]
    fn test_personality_profile_with_modifiers() {
        let mut profile = PersonalityProfile::default();
        profile.context_modifiers.insert("stress".to_string(), 0.2);
        assert_eq!(profile.context_modifiers.get("stress"), Some(&0.2));
    }

    // ========== PersonalityEngine Tests ==========

    #[test]
    fn test_personality_engine_default() {
        let engine = PersonalityEngine::default();
        assert_eq!(engine.state.archetype, IdentityArchetype::Mentor);
    }

    #[test]
    fn test_personality_engine_get_state() {
        let engine = PersonalityEngine::default();
        let state = engine.get_state();
        assert_eq!(state.archetype, IdentityArchetype::Mentor);
    }

    #[test]
    fn test_personality_engine_get_profile() {
        let engine = PersonalityEngine::default();
        let profile = engine.get_profile();
        assert!(profile.extraversion > 0.0);
    }

    #[test]
    fn test_personality_engine_set_archetype_professional() {
        let mut engine = PersonalityEngine::default();
        engine.set_archetype(IdentityArchetype::Professional);
        assert_eq!(engine.state.archetype, IdentityArchetype::Professional);
        assert_eq!(engine.profile.conscientiousness, 0.95);
    }

    #[test]
    fn test_personality_engine_set_archetype_companion() {
        let mut engine = PersonalityEngine::default();
        engine.set_archetype(IdentityArchetype::Companion);
        assert_eq!(engine.state.archetype, IdentityArchetype::Companion);
        assert_eq!(engine.profile.agreeableness, 0.95);
    }

    #[test]
    fn test_personality_engine_set_archetype_expert() {
        let mut engine = PersonalityEngine::default();
        engine.set_archetype(IdentityArchetype::Expert);
        assert_eq!(engine.state.archetype, IdentityArchetype::Expert);
        assert_eq!(engine.profile.openness, 0.8);
    }

    #[test]
    fn test_personality_engine_set_archetype_creative() {
        let mut engine = PersonalityEngine::default();
        engine.set_archetype(IdentityArchetype::Creative);
        assert_eq!(engine.state.archetype, IdentityArchetype::Creative);
        assert_eq!(engine.profile.openness, 0.95);
    }

    #[test]
    fn test_personality_engine_set_archetype_guardian() {
        let mut engine = PersonalityEngine::default();
        engine.set_archetype(IdentityArchetype::Guardian);
        assert_eq!(engine.state.archetype, IdentityArchetype::Guardian);
        assert_eq!(engine.profile.emotional_stability, 0.95);
    }

    #[test]
    fn test_personality_engine_set_archetype_explorer() {
        let mut engine = PersonalityEngine::default();
        engine.set_archetype(IdentityArchetype::Explorer);
        assert_eq!(engine.state.archetype, IdentityArchetype::Explorer);
        assert_eq!(engine.profile.openness, 0.9);
    }

    #[test]
    fn test_personality_engine_set_archetype_philosopher() {
        let mut engine = PersonalityEngine::default();
        engine.set_archetype(IdentityArchetype::Philosopher);
        assert_eq!(engine.state.archetype, IdentityArchetype::Philosopher);
        assert_eq!(engine.profile.openness, 0.95);
    }

    #[test]
    fn test_personality_engine_set_mood() {
        let mut engine = PersonalityEngine::default();
        engine.set_mood(Mood::Energetic, "morning");
        assert_eq!(engine.state.current_mood, Mood::Energetic);
        assert_eq!(engine.state.mood_history.len(), 1);
    }

    #[test]
    fn test_personality_engine_set_mood_multiple() {
        let mut engine = PersonalityEngine::default();
        engine.set_mood(Mood::Focused, "work");
        engine.set_mood(Mood::Playful, "break");
        assert_eq!(engine.state.current_mood, Mood::Playful);
        assert_eq!(engine.state.mood_history.len(), 2);
    }

    #[test]
    fn test_personality_engine_adjust_energy_increase() {
        let mut engine = PersonalityEngine::default();
        let initial = engine.state.cognitive_energy;
        engine.adjust_energy(-0.3);
        assert!(engine.state.cognitive_energy < initial);
    }

    #[test]
    fn test_personality_engine_adjust_energy_clamp_max() {
        let mut engine = PersonalityEngine::default();
        engine.adjust_energy(1.0);
        assert_eq!(engine.state.cognitive_energy, 1.0);
    }

    #[test]
    fn test_personality_engine_adjust_energy_clamp_min() {
        let mut engine = PersonalityEngine::default();
        engine.adjust_energy(-2.0);
        assert_eq!(engine.state.cognitive_energy, 0.0);
    }

    #[test]
    fn test_personality_engine_adjust_engagement_increase() {
        let mut engine = PersonalityEngine::default();
        engine.adjust_engagement(0.2);
        assert_eq!(engine.state.engagement_level, 0.9);
    }

    #[test]
    fn test_personality_engine_adjust_engagement_clamp_max() {
        let mut engine = PersonalityEngine::default();
        engine.adjust_engagement(1.0);
        assert_eq!(engine.state.engagement_level, 1.0);
    }

    #[test]
    fn test_personality_engine_adjust_engagement_clamp_min() {
        let mut engine = PersonalityEngine::default();
        engine.adjust_engagement(-2.0);
        assert_eq!(engine.state.engagement_level, 0.0);
    }

    #[test]
    fn test_personality_engine_compute_communication_style_formal() {
        let mut engine = PersonalityEngine::default();
        engine.set_archetype(IdentityArchetype::Professional);
        let style = engine.compute_communication_style();
        assert_eq!(style, CommunicationStyle::Formal);
    }

    #[test]
    fn test_personality_engine_compute_communication_style_elaborate() {
        let mut engine = PersonalityEngine::default();
        engine.set_archetype(IdentityArchetype::Explorer);
        let style = engine.compute_communication_style();
        assert_eq!(style, CommunicationStyle::Elaborate);
    }

    #[test]
    fn test_personality_engine_compute_communication_style_casual() {
        let mut engine = PersonalityEngine::default();
        engine.set_archetype(IdentityArchetype::Creative);
        let style = engine.compute_communication_style();
        assert_eq!(style, CommunicationStyle::Casual);
    }

    #[test]
    fn test_personality_engine_compute_emotional_level_serene() {
        let engine = PersonalityEngine::default();
        let level = engine.compute_emotional_level();
        assert_eq!(level, EmotionalLevel::Calm);
    }

    #[test]
    fn test_personality_engine_compute_emotional_level_focused() {
        let mut engine = PersonalityEngine::default();
        engine.set_mood(Mood::Focused, "work");
        let level = engine.compute_emotional_level();
        assert_eq!(level, EmotionalLevel::Neutral);
    }

    #[test]
    fn test_personality_engine_compute_emotional_level_energetic() {
        let mut engine = PersonalityEngine::default();
        engine.set_mood(Mood::Energetic, "morning");
        let level = engine.compute_emotional_level();
        assert_eq!(level, EmotionalLevel::Enthusiastic);
    }

    #[test]
    fn test_personality_engine_compute_emotional_level_curious() {
        let mut engine = PersonalityEngine::default();
        engine.set_mood(Mood::Curious, "learning");
        let level = engine.compute_emotional_level();
        assert_eq!(level, EmotionalLevel::Warm);
    }

    #[test]
    fn test_personality_engine_compute_emotional_level_caring() {
        let mut engine = PersonalityEngine::default();
        engine.set_mood(Mood::Caring, "support");
        let level = engine.compute_emotional_level();
        assert_eq!(level, EmotionalLevel::Warm);
    }

    #[test]
    fn test_personality_engine_compute_emotional_level_playful() {
        let mut engine = PersonalityEngine::default();
        engine.set_mood(Mood::Playful, "fun");
        let level = engine.compute_emotional_level();
        assert_eq!(level, EmotionalLevel::Playful);
    }

    #[test]
    fn test_personality_engine_compute_emotional_level_thoughtful() {
        let mut engine = PersonalityEngine::default();
        engine.set_mood(Mood::Thoughtful, "reflection");
        let level = engine.compute_emotional_level();
        assert_eq!(level, EmotionalLevel::Neutral);
    }

    #[test]
    fn test_personality_engine_compute_emotional_level_determined() {
        let mut engine = PersonalityEngine::default();
        engine.set_mood(Mood::Determined, "goal");
        let level = engine.compute_emotional_level();
        assert_eq!(level, EmotionalLevel::Serious);
    }

    #[test]
    fn test_personality_engine_get_trait_value_exists() {
        let engine = PersonalityEngine::default();
        let value = engine.get_trait_value("Empathie");
        assert_eq!(value, Some(0.85));
    }

    #[test]
    fn test_personality_engine_get_trait_value_not_exists() {
        let engine = PersonalityEngine::default();
        let value = engine.get_trait_value("NonExistent");
        assert_eq!(value, None);
    }

    #[test]
    fn test_personality_engine_synthesize_vector() {
        let engine = PersonalityEngine::default();
        let vector = engine.synthesize_vector();
        assert_eq!(vector.len(), 7);
    }

    #[test]
    fn test_personality_engine_synthesize_vector_values() {
        let engine = PersonalityEngine::default();
        let vector = engine.synthesize_vector();
        // Last two values should be cognitive_energy and engagement_level
        assert_eq!(vector[5], 1.0); // cognitive_energy
        assert_eq!(vector[6], 0.7); // engagement_level
    }

    #[test]
    fn test_personality_engine_coherence_score_default() {
        let engine = PersonalityEngine::default();
        let score = engine.coherence_score();
        assert!((0.0..=1.0).contains(&score));
    }

    #[test]
    fn test_personality_engine_coherence_score_is_finite() {
        let engine = PersonalityEngine::default();
        let score = engine.coherence_score();
        assert!(score.is_finite());
    }

    #[test]
    fn test_personality_engine_mood_history_limit() {
        let mut engine = PersonalityEngine::default();
        // Add more than 100 mood changes
        for i in 0..110 {
            engine.set_mood(Mood::Focused, &format!("trigger_{}", i));
        }
        // History should be limited to 100
        assert!(engine.state.mood_history.len() <= 100);
    }

    // ========== generate_personality_prompt Tests ==========

    #[test]
    fn test_generate_personality_prompt_default() {
        let engine = PersonalityEngine::default();
        let prompt = generate_personality_prompt(&engine);
        assert!(prompt.contains("mentor"));
        assert!(prompt.contains("serein"));
    }

    #[test]
    fn test_generate_personality_prompt_contains_energy() {
        let engine = PersonalityEngine::default();
        let prompt = generate_personality_prompt(&engine);
        assert!(prompt.contains("100%")); // cognitive_energy = 1.0
    }

    #[test]
    fn test_generate_personality_prompt_contains_engagement() {
        let engine = PersonalityEngine::default();
        let prompt = generate_personality_prompt(&engine);
        assert!(prompt.contains("70%")); // engagement_level = 0.7
    }

    #[test]
    fn test_generate_personality_prompt_contains_traits() {
        let engine = PersonalityEngine::default();
        let prompt = generate_personality_prompt(&engine);
        assert!(prompt.contains("Empathie"));
    }

    #[test]
    fn test_generate_personality_prompt_professional() {
        let mut engine = PersonalityEngine::default();
        engine.set_archetype(IdentityArchetype::Professional);
        let prompt = generate_personality_prompt(&engine);
        assert!(prompt.contains("professionnel"));
    }

    #[test]
    fn test_generate_personality_prompt_companion() {
        let mut engine = PersonalityEngine::default();
        engine.set_archetype(IdentityArchetype::Companion);
        let prompt = generate_personality_prompt(&engine);
        assert!(prompt.contains("compagnon"));
    }

    #[test]
    fn test_generate_personality_prompt_expert() {
        let mut engine = PersonalityEngine::default();
        engine.set_archetype(IdentityArchetype::Expert);
        let prompt = generate_personality_prompt(&engine);
        assert!(prompt.contains("expert"));
    }

    #[test]
    fn test_generate_personality_prompt_creative() {
        let mut engine = PersonalityEngine::default();
        engine.set_archetype(IdentityArchetype::Creative);
        let prompt = generate_personality_prompt(&engine);
        assert!(prompt.contains("créatif"));
    }

    #[test]
    fn test_generate_personality_prompt_guardian() {
        let mut engine = PersonalityEngine::default();
        engine.set_archetype(IdentityArchetype::Guardian);
        let prompt = generate_personality_prompt(&engine);
        assert!(prompt.contains("gardien"));
    }

    #[test]
    fn test_generate_personality_prompt_explorer() {
        let mut engine = PersonalityEngine::default();
        engine.set_archetype(IdentityArchetype::Explorer);
        let prompt = generate_personality_prompt(&engine);
        assert!(prompt.contains("explorateur"));
    }

    #[test]
    fn test_generate_personality_prompt_philosopher() {
        let mut engine = PersonalityEngine::default();
        engine.set_archetype(IdentityArchetype::Philosopher);
        let prompt = generate_personality_prompt(&engine);
        assert!(prompt.contains("philosophe"));
    }

    #[test]
    fn test_generate_personality_prompt_mood_focused() {
        let mut engine = PersonalityEngine::default();
        engine.set_mood(Mood::Focused, "work");
        let prompt = generate_personality_prompt(&engine);
        assert!(prompt.contains("concentré"));
    }

    #[test]
    fn test_generate_personality_prompt_mood_energetic() {
        let mut engine = PersonalityEngine::default();
        engine.set_mood(Mood::Energetic, "morning");
        let prompt = generate_personality_prompt(&engine);
        assert!(prompt.contains("dynamique"));
    }

    #[test]
    fn test_generate_personality_prompt_mood_curious() {
        let mut engine = PersonalityEngine::default();
        engine.set_mood(Mood::Curious, "learning");
        let prompt = generate_personality_prompt(&engine);
        assert!(prompt.contains("curieux"));
    }

    #[test]
    fn test_generate_personality_prompt_mood_caring() {
        let mut engine = PersonalityEngine::default();
        engine.set_mood(Mood::Caring, "support");
        let prompt = generate_personality_prompt(&engine);
        assert!(prompt.contains("attentionné"));
    }

    #[test]
    fn test_generate_personality_prompt_mood_playful() {
        let mut engine = PersonalityEngine::default();
        engine.set_mood(Mood::Playful, "fun");
        let prompt = generate_personality_prompt(&engine);
        assert!(prompt.contains("enjoué"));
    }

    #[test]
    fn test_generate_personality_prompt_mood_thoughtful() {
        let mut engine = PersonalityEngine::default();
        engine.set_mood(Mood::Thoughtful, "reflection");
        let prompt = generate_personality_prompt(&engine);
        assert!(prompt.contains("pensif"));
    }

    #[test]
    fn test_generate_personality_prompt_mood_determined() {
        let mut engine = PersonalityEngine::default();
        engine.set_mood(Mood::Determined, "goal");
        let prompt = generate_personality_prompt(&engine);
        assert!(prompt.contains("déterminé"));
    }
}
