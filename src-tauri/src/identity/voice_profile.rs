// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — VOICE PROFILE ENGINE
//   Gestion des profils vocaux et paramètres TTS
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Caractéristiques vocales
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoiceCharacteristics {
    /// Hauteur de la voix (Hz)
    pub pitch: f32,
    /// Vitesse de parole (mots/min)
    pub rate: f32,
    /// Volume (0.0 - 1.0)
    pub volume: f32,
    /// Variabilité tonale (0.0 - 1.0)
    pub pitch_variance: f32,
    /// Emphase (0.0 - 1.0)
    pub emphasis: f32,
    /// Pauses naturelles (ms)
    pub pause_duration: u32,
    /// Chaleur vocale (0.0 - 1.0)
    pub warmth: f32,
}

impl Default for VoiceCharacteristics {
    fn default() -> Self {
        Self {
            pitch: 200.0,
            rate: 150.0,
            volume: 0.8,
            pitch_variance: 0.3,
            emphasis: 0.5,
            pause_duration: 200,
            warmth: 0.7,
        }
    }
}

/// Profil vocal complet
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoiceProfile {
    pub id: String,
    pub name: String,
    pub description: String,
    pub characteristics: VoiceCharacteristics,
    /// Modèle TTS à utiliser
    pub tts_model: String,
    /// Langue principale
    pub language: String,
    /// Accents supportés
    pub accents: Vec<String>,
    /// Émotions mappées à des ajustements
    pub emotion_mappings: HashMap<String, VoiceAdjustment>,
    /// Actif
    pub active: bool,
}

/// Ajustement vocal pour une émotion
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoiceAdjustment {
    pub pitch_delta: f32,
    pub rate_delta: f32,
    pub volume_delta: f32,
    pub emphasis_delta: f32,
    pub warmth_delta: f32,
}

impl Default for VoiceProfile {
    fn default() -> Self {
        let mut emotion_mappings = HashMap::new();

        emotion_mappings.insert("neutral".to_string(), VoiceAdjustment {
            pitch_delta: 0.0,
            rate_delta: 0.0,
            volume_delta: 0.0,
            emphasis_delta: 0.0,
            warmth_delta: 0.0,
        });

        emotion_mappings.insert("happy".to_string(), VoiceAdjustment {
            pitch_delta: 20.0,
            rate_delta: 15.0,
            volume_delta: 0.1,
            emphasis_delta: 0.2,
            warmth_delta: 0.2,
        });

        emotion_mappings.insert("sad".to_string(), VoiceAdjustment {
            pitch_delta: -15.0,
            rate_delta: -20.0,
            volume_delta: -0.15,
            emphasis_delta: -0.1,
            warmth_delta: 0.1,
        });

        emotion_mappings.insert("excited".to_string(), VoiceAdjustment {
            pitch_delta: 30.0,
            rate_delta: 25.0,
            volume_delta: 0.15,
            emphasis_delta: 0.3,
            warmth_delta: 0.15,
        });

        emotion_mappings.insert("calm".to_string(), VoiceAdjustment {
            pitch_delta: -10.0,
            rate_delta: -15.0,
            volume_delta: -0.1,
            emphasis_delta: -0.2,
            warmth_delta: 0.25,
        });

        emotion_mappings.insert("serious".to_string(), VoiceAdjustment {
            pitch_delta: -5.0,
            rate_delta: -5.0,
            volume_delta: 0.0,
            emphasis_delta: 0.15,
            warmth_delta: -0.1,
        });

        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name: "TITANE Default".to_string(),
            description: "Voix par défaut TITANE∞, équilibrée et chaleureuse".to_string(),
            characteristics: VoiceCharacteristics::default(),
            tts_model: "piper".to_string(),
            language: "fr-FR".to_string(),
            accents: vec!["fr-FR".to_string(), "en-US".to_string()],
            emotion_mappings,
            active: true,
        }
    }
}

impl VoiceProfile {
    /// Calcule les caractéristiques ajustées pour une émotion
    pub fn get_adjusted_characteristics(&self, emotion: &str) -> VoiceCharacteristics {
        let mut result = self.characteristics.clone();

        if let Some(adj) = self.emotion_mappings.get(emotion) {
            result.pitch = (result.pitch + adj.pitch_delta).max(80.0).min(400.0);
            result.rate = (result.rate + adj.rate_delta).max(50.0).min(300.0);
            result.volume = (result.volume + adj.volume_delta).clamp(0.0, 1.0);
            result.emphasis = (result.emphasis + adj.emphasis_delta).clamp(0.0, 1.0);
            result.warmth = (result.warmth + adj.warmth_delta).clamp(0.0, 1.0);
        }

        result
    }

    /// Génère les paramètres SSML
    pub fn to_ssml_params(&self, emotion: &str) -> String {
        let chars = self.get_adjusted_characteristics(emotion);

        format!(
            "pitch=\"{}Hz\" rate=\"{}%\" volume=\"{}%\"",
            chars.pitch as u32,
            (chars.rate / 150.0 * 100.0) as u32,
            (chars.volume * 100.0) as u32
        )
    }
}

/// Gestionnaire de profils vocaux
pub struct VoiceProfileManager {
    profiles: HashMap<String, VoiceProfile>,
    active_profile_id: Option<String>,
}

impl Default for VoiceProfileManager {
    fn default() -> Self {
        let mut profiles = HashMap::new();
        let default_profile = VoiceProfile::default();
        let id = default_profile.id.clone();
        profiles.insert(id.clone(), default_profile);

        Self {
            profiles,
            active_profile_id: Some(id),
        }
    }
}

impl VoiceProfileManager {
    /// Ajoute un profil
    pub fn add_profile(&mut self, profile: VoiceProfile) {
        self.profiles.insert(profile.id.clone(), profile);
    }

    /// Supprime un profil
    pub fn remove_profile(&mut self, id: &str) -> bool {
        if Some(id.to_string()) == self.active_profile_id {
            return false; // Ne pas supprimer le profil actif
        }
        self.profiles.remove(id).is_some()
    }

    /// Active un profil
    pub fn set_active(&mut self, id: &str) -> bool {
        if self.profiles.contains_key(id) {
            self.active_profile_id = Some(id.to_string());
            true
        } else {
            false
        }
    }

    /// Obtient le profil actif
    pub fn get_active(&self) -> Option<&VoiceProfile> {
        self.active_profile_id.as_ref()
            .and_then(|id| self.profiles.get(id))
    }

    /// Liste tous les profils
    pub fn list_profiles(&self) -> Vec<&VoiceProfile> {
        self.profiles.values().collect()
    }

    /// Obtient un profil par ID
    pub fn get_profile(&self, id: &str) -> Option<&VoiceProfile> {
        self.profiles.get(id)
    }
}

/// Profils prédéfinis
pub struct VoicePresets;

impl VoicePresets {
    /// Voix professionnelle
    pub fn professional() -> VoiceProfile {
        let mut profile = VoiceProfile::default();
        profile.name = "Professional".to_string();
        profile.description = "Voix formelle et claire".to_string();
        profile.characteristics.pitch = 180.0;
        profile.characteristics.rate = 140.0;
        profile.characteristics.warmth = 0.4;
        profile.characteristics.emphasis = 0.6;
        profile
    }

    /// Voix chaleureuse
    pub fn warm() -> VoiceProfile {
        let mut profile = VoiceProfile::default();
        profile.name = "Warm".to_string();
        profile.description = "Voix chaleureuse et amicale".to_string();
        profile.characteristics.pitch = 210.0;
        profile.characteristics.rate = 145.0;
        profile.characteristics.warmth = 0.9;
        profile.characteristics.emphasis = 0.4;
        profile
    }

    /// Voix énergique
    pub fn energetic() -> VoiceProfile {
        let mut profile = VoiceProfile::default();
        profile.name = "Energetic".to_string();
        profile.description = "Voix dynamique et enthousiaste".to_string();
        profile.characteristics.pitch = 220.0;
        profile.characteristics.rate = 170.0;
        profile.characteristics.emphasis = 0.7;
        profile.characteristics.pitch_variance = 0.5;
        profile
    }

    /// Voix calme
    pub fn calm() -> VoiceProfile {
        let mut profile = VoiceProfile::default();
        profile.name = "Calm".to_string();
        profile.description = "Voix apaisante et méditative".to_string();
        profile.characteristics.pitch = 190.0;
        profile.characteristics.rate = 120.0;
        profile.characteristics.warmth = 0.8;
        profile.characteristics.pause_duration = 350;
        profile
    }
}
