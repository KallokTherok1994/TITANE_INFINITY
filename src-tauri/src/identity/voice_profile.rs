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

        emotion_mappings.insert(
            "neutral".to_string(),
            VoiceAdjustment {
                pitch_delta: 0.0,
                rate_delta: 0.0,
                volume_delta: 0.0,
                emphasis_delta: 0.0,
                warmth_delta: 0.0,
            },
        );

        emotion_mappings.insert(
            "happy".to_string(),
            VoiceAdjustment {
                pitch_delta: 20.0,
                rate_delta: 15.0,
                volume_delta: 0.1,
                emphasis_delta: 0.2,
                warmth_delta: 0.2,
            },
        );

        emotion_mappings.insert(
            "sad".to_string(),
            VoiceAdjustment {
                pitch_delta: -15.0,
                rate_delta: -20.0,
                volume_delta: -0.15,
                emphasis_delta: -0.1,
                warmth_delta: 0.1,
            },
        );

        emotion_mappings.insert(
            "excited".to_string(),
            VoiceAdjustment {
                pitch_delta: 30.0,
                rate_delta: 25.0,
                volume_delta: 0.15,
                emphasis_delta: 0.3,
                warmth_delta: 0.15,
            },
        );

        emotion_mappings.insert(
            "calm".to_string(),
            VoiceAdjustment {
                pitch_delta: -10.0,
                rate_delta: -15.0,
                volume_delta: -0.1,
                emphasis_delta: -0.2,
                warmth_delta: 0.25,
            },
        );

        emotion_mappings.insert(
            "serious".to_string(),
            VoiceAdjustment {
                pitch_delta: -5.0,
                rate_delta: -5.0,
                volume_delta: 0.0,
                emphasis_delta: 0.15,
                warmth_delta: -0.1,
            },
        );

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
        self.active_profile_id
            .as_ref()
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

    // ========== VoiceCharacteristics Tests ==========

    #[test]
    fn test_voice_characteristics_default() {
        let chars = VoiceCharacteristics::default();
        assert_eq!(chars.pitch, 200.0);
        assert_eq!(chars.rate, 150.0);
        assert_eq!(chars.volume, 0.8);
        assert_eq!(chars.pitch_variance, 0.3);
        assert_eq!(chars.emphasis, 0.5);
        assert_eq!(chars.pause_duration, 200);
        assert_eq!(chars.warmth, 0.7);
    }

    #[test]
    fn test_voice_characteristics_clone() {
        let chars = VoiceCharacteristics::default();
        let cloned = chars.clone();
        assert_eq!(cloned.pitch, chars.pitch);
        assert_eq!(cloned.rate, chars.rate);
    }

    #[test]
    fn test_voice_characteristics_debug() {
        let chars = VoiceCharacteristics::default();
        let debug = format!("{:?}", chars);
        assert!(debug.contains("pitch"));
        assert!(debug.contains("rate"));
    }

    #[test]
    fn test_voice_characteristics_serialize() {
        let chars = VoiceCharacteristics::default();
        let json = test_ok!(
            serde_json::to_string(&chars),
            "VoiceCharacteristics should serialize"
        );
        assert!(json.contains("pitch"));
        assert!(json.contains("volume"));
    }

    #[test]
    fn test_voice_characteristics_custom() {
        let chars = VoiceCharacteristics {
            pitch: 300.0,
            rate: 200.0,
            volume: 1.0,
            pitch_variance: 0.5,
            emphasis: 0.8,
            pause_duration: 100,
            warmth: 0.9,
        };
        assert_eq!(chars.pitch, 300.0);
        assert_eq!(chars.warmth, 0.9);
    }

    // ========== VoiceAdjustment Tests ==========

    #[test]
    fn test_voice_adjustment_creation() {
        let adj = VoiceAdjustment {
            pitch_delta: 10.0,
            rate_delta: 5.0,
            volume_delta: 0.1,
            emphasis_delta: 0.2,
            warmth_delta: 0.15,
        };
        assert_eq!(adj.pitch_delta, 10.0);
        assert_eq!(adj.warmth_delta, 0.15);
    }

    #[test]
    fn test_voice_adjustment_clone() {
        let adj = VoiceAdjustment {
            pitch_delta: -10.0,
            rate_delta: -5.0,
            volume_delta: -0.1,
            emphasis_delta: -0.2,
            warmth_delta: -0.15,
        };
        let cloned = adj.clone();
        assert_eq!(cloned.pitch_delta, adj.pitch_delta);
    }

    #[test]
    fn test_voice_adjustment_debug() {
        let adj = VoiceAdjustment {
            pitch_delta: 0.0,
            rate_delta: 0.0,
            volume_delta: 0.0,
            emphasis_delta: 0.0,
            warmth_delta: 0.0,
        };
        let debug = format!("{:?}", adj);
        assert!(debug.contains("pitch_delta"));
    }

    #[test]
    fn test_voice_adjustment_serialize() {
        let adj = VoiceAdjustment {
            pitch_delta: 20.0,
            rate_delta: 15.0,
            volume_delta: 0.1,
            emphasis_delta: 0.2,
            warmth_delta: 0.2,
        };
        let json = test_ok!(
            serde_json::to_string(&adj),
            "VoiceAdjustment should serialize"
        );
        assert!(json.contains("pitch_delta"));
    }

    // ========== VoiceProfile Tests ==========

    #[test]
    fn test_voice_profile_default() {
        let profile = VoiceProfile::default();
        assert_eq!(profile.name, "TITANE Default");
        assert_eq!(profile.tts_model, "piper");
        assert_eq!(profile.language, "fr-FR");
        assert!(profile.active);
    }

    #[test]
    fn test_voice_profile_default_accents() {
        let profile = VoiceProfile::default();
        assert!(profile.accents.contains(&"fr-FR".to_string()));
        assert!(profile.accents.contains(&"en-US".to_string()));
    }

    #[test]
    fn test_voice_profile_default_emotion_mappings() {
        let profile = VoiceProfile::default();
        assert!(profile.emotion_mappings.contains_key("neutral"));
        assert!(profile.emotion_mappings.contains_key("happy"));
        assert!(profile.emotion_mappings.contains_key("sad"));
        assert!(profile.emotion_mappings.contains_key("excited"));
        assert!(profile.emotion_mappings.contains_key("calm"));
        assert!(profile.emotion_mappings.contains_key("serious"));
    }

    #[test]
    fn test_voice_profile_clone() {
        let profile = VoiceProfile::default();
        let cloned = profile.clone();
        assert_eq!(cloned.name, profile.name);
        assert_eq!(cloned.id, profile.id);
    }

    #[test]
    fn test_voice_profile_debug() {
        let profile = VoiceProfile::default();
        let debug = format!("{:?}", profile);
        assert!(debug.contains("TITANE Default"));
    }

    #[test]
    fn test_voice_profile_serialize() {
        let profile = VoiceProfile::default();
        let json = test_ok!(
            serde_json::to_string(&profile),
            "VoiceProfile should serialize"
        );
        assert!(json.contains("TITANE Default"));
        assert!(json.contains("piper"));
    }

    #[test]
    fn test_voice_profile_get_adjusted_characteristics_neutral() {
        let profile = VoiceProfile::default();
        let adjusted = profile.get_adjusted_characteristics("neutral");
        // Neutral has zero deltas
        assert_eq!(adjusted.pitch, profile.characteristics.pitch);
        assert_eq!(adjusted.rate, profile.characteristics.rate);
    }

    #[test]
    fn test_voice_profile_get_adjusted_characteristics_happy() {
        let profile = VoiceProfile::default();
        let adjusted = profile.get_adjusted_characteristics("happy");
        // Happy has positive pitch delta
        assert!(adjusted.pitch > profile.characteristics.pitch);
        assert!(adjusted.rate > profile.characteristics.rate);
    }

    #[test]
    fn test_voice_profile_get_adjusted_characteristics_sad() {
        let profile = VoiceProfile::default();
        let adjusted = profile.get_adjusted_characteristics("sad");
        // Sad has negative pitch delta
        assert!(adjusted.pitch < profile.characteristics.pitch);
        assert!(adjusted.rate < profile.characteristics.rate);
    }

    #[test]
    fn test_voice_profile_get_adjusted_characteristics_excited() {
        let profile = VoiceProfile::default();
        let adjusted = profile.get_adjusted_characteristics("excited");
        // Excited has high positive deltas
        assert!(adjusted.pitch > profile.characteristics.pitch);
        assert!(adjusted.emphasis > profile.characteristics.emphasis);
    }

    #[test]
    fn test_voice_profile_get_adjusted_characteristics_calm() {
        let profile = VoiceProfile::default();
        let adjusted = profile.get_adjusted_characteristics("calm");
        // Calm has negative rate delta
        assert!(adjusted.rate < profile.characteristics.rate);
        assert!(adjusted.warmth > profile.characteristics.warmth);
    }

    #[test]
    fn test_voice_profile_get_adjusted_characteristics_serious() {
        let profile = VoiceProfile::default();
        let adjusted = profile.get_adjusted_characteristics("serious");
        // Serious has negative warmth delta
        assert!(adjusted.warmth < profile.characteristics.warmth);
    }

    #[test]
    fn test_voice_profile_get_adjusted_characteristics_unknown() {
        let profile = VoiceProfile::default();
        let adjusted = profile.get_adjusted_characteristics("unknown_emotion");
        // Unknown emotion should return original characteristics
        assert_eq!(adjusted.pitch, profile.characteristics.pitch);
    }

    #[test]
    fn test_voice_profile_get_adjusted_characteristics_clamp_pitch_max() {
        let mut profile = VoiceProfile::default();
        profile.characteristics.pitch = 390.0; // Close to max
        let adjusted = profile.get_adjusted_characteristics("excited"); // +30
        assert!(adjusted.pitch <= 400.0);
    }

    #[test]
    fn test_voice_profile_get_adjusted_characteristics_clamp_pitch_min() {
        let mut profile = VoiceProfile::default();
        profile.characteristics.pitch = 90.0; // Close to min
        let adjusted = profile.get_adjusted_characteristics("sad"); // -15
        assert!(adjusted.pitch >= 80.0);
    }

    #[test]
    fn test_voice_profile_get_adjusted_characteristics_clamp_volume() {
        let mut profile = VoiceProfile::default();
        profile.characteristics.volume = 0.95;
        let adjusted = profile.get_adjusted_characteristics("excited"); // +0.15
        assert!(adjusted.volume <= 1.0);
    }

    #[test]
    fn test_voice_profile_to_ssml_params() {
        let profile = VoiceProfile::default();
        let ssml = profile.to_ssml_params("neutral");
        assert!(ssml.contains("pitch="));
        assert!(ssml.contains("rate="));
        assert!(ssml.contains("volume="));
    }

    #[test]
    fn test_voice_profile_to_ssml_params_format() {
        let profile = VoiceProfile::default();
        let ssml = profile.to_ssml_params("neutral");
        assert!(ssml.contains("Hz"));
        assert!(ssml.contains("%"));
    }

    #[test]
    fn test_voice_profile_unique_ids() {
        let profile1 = VoiceProfile::default();
        let profile2 = VoiceProfile::default();
        assert_ne!(profile1.id, profile2.id);
    }

    // ========== VoiceProfileManager Tests ==========

    #[test]
    fn test_voice_profile_manager_default() {
        let manager = VoiceProfileManager::default();
        assert!(manager.active_profile_id.is_some());
    }

    #[test]
    fn test_voice_profile_manager_get_active() {
        let manager = VoiceProfileManager::default();
        let active = manager.get_active();
        assert!(active.is_some());
        assert_eq!(
            test_some!(
                active,
                "VoiceProfileManager should have an active profile"
            )
            .name,
            "TITANE Default"
        );
    }

    #[test]
    fn test_voice_profile_manager_list_profiles() {
        let manager = VoiceProfileManager::default();
        let profiles = manager.list_profiles();
        assert_eq!(profiles.len(), 1);
    }

    #[test]
    fn test_voice_profile_manager_add_profile() {
        let mut manager = VoiceProfileManager::default();
        let new_profile = VoicePresets::professional();
        let new_id = new_profile.id.clone();
        manager.add_profile(new_profile);

        let profiles = manager.list_profiles();
        assert_eq!(profiles.len(), 2);
        assert!(manager.get_profile(&new_id).is_some());
    }

    #[test]
    fn test_voice_profile_manager_remove_profile() {
        let mut manager = VoiceProfileManager::default();
        let new_profile = VoicePresets::warm();
        let new_id = new_profile.id.clone();
        manager.add_profile(new_profile);

        let removed = manager.remove_profile(&new_id);
        assert!(removed);
        assert!(manager.get_profile(&new_id).is_none());
    }

    #[test]
    fn test_voice_profile_manager_cannot_remove_active() {
        let mut manager = VoiceProfileManager::default();
        let active_id = manager
            .active_profile_id
            .clone()
            .unwrap_or_else(|| panic!("VoiceProfileManager should have an active_profile_id"));

        let removed = manager.remove_profile(&active_id);
        assert!(!removed);
        assert!(manager.get_profile(&active_id).is_some());
    }

    #[test]
    fn test_voice_profile_manager_set_active() {
        let mut manager = VoiceProfileManager::default();
        let new_profile = VoicePresets::energetic();
        let new_id = new_profile.id.clone();
        manager.add_profile(new_profile);

        let result = manager.set_active(&new_id);
        assert!(result);
        assert_eq!(
            manager
                .active_profile_id
                .as_ref()
                .unwrap_or_else(|| panic!("active_profile_id should be set after set_active")),
            &new_id
        );
    }

    #[test]
    fn test_voice_profile_manager_set_active_nonexistent() {
        let mut manager = VoiceProfileManager::default();
        let result = manager.set_active("nonexistent_id");
        assert!(!result);
    }

    #[test]
    fn test_voice_profile_manager_get_profile() {
        let manager = VoiceProfileManager::default();
        let active_id = manager
            .active_profile_id
            .clone()
            .unwrap_or_else(|| panic!("VoiceProfileManager should have an active_profile_id"));
        let profile = manager.get_profile(&active_id);
        assert!(profile.is_some());
    }

    #[test]
    fn test_voice_profile_manager_get_profile_nonexistent() {
        let manager = VoiceProfileManager::default();
        let profile = manager.get_profile("nonexistent");
        assert!(profile.is_none());
    }

    // ========== VoicePresets Tests ==========

    #[test]
    fn test_voice_presets_professional() {
        let profile = VoicePresets::professional();
        assert_eq!(profile.name, "Professional");
        assert_eq!(profile.characteristics.pitch, 180.0);
        assert_eq!(profile.characteristics.warmth, 0.4);
    }

    #[test]
    fn test_voice_presets_warm() {
        let profile = VoicePresets::warm();
        assert_eq!(profile.name, "Warm");
        assert_eq!(profile.characteristics.pitch, 210.0);
        assert_eq!(profile.characteristics.warmth, 0.9);
    }

    #[test]
    fn test_voice_presets_energetic() {
        let profile = VoicePresets::energetic();
        assert_eq!(profile.name, "Energetic");
        assert_eq!(profile.characteristics.rate, 170.0);
        assert_eq!(profile.characteristics.emphasis, 0.7);
    }

    #[test]
    fn test_voice_presets_calm() {
        let profile = VoicePresets::calm();
        assert_eq!(profile.name, "Calm");
        assert_eq!(profile.characteristics.rate, 120.0);
        assert_eq!(profile.characteristics.pause_duration, 350);
    }

    #[test]
    fn test_voice_presets_professional_description() {
        let profile = VoicePresets::professional();
        assert!(profile.description.contains("formelle"));
    }

    #[test]
    fn test_voice_presets_warm_description() {
        let profile = VoicePresets::warm();
        assert!(profile.description.contains("chaleureuse"));
    }

    #[test]
    fn test_voice_presets_energetic_description() {
        let profile = VoicePresets::energetic();
        assert!(profile.description.contains("dynamique"));
    }

    #[test]
    fn test_voice_presets_calm_description() {
        let profile = VoicePresets::calm();
        assert!(profile.description.contains("apaisante"));
    }

    #[test]
    fn test_voice_presets_unique_ids() {
        let prof = VoicePresets::professional();
        let warm = VoicePresets::warm();
        let energetic = VoicePresets::energetic();
        let calm = VoicePresets::calm();

        assert_ne!(prof.id, warm.id);
        assert_ne!(warm.id, energetic.id);
        assert_ne!(energetic.id, calm.id);
    }

    #[test]
    fn test_voice_presets_all_have_default_mappings() {
        let profiles = vec![
            VoicePresets::professional(),
            VoicePresets::warm(),
            VoicePresets::energetic(),
            VoicePresets::calm(),
        ];

        for profile in profiles {
            assert!(profile.emotion_mappings.contains_key("neutral"));
            assert!(profile.emotion_mappings.contains_key("happy"));
        }
    }

    // ========== Edge Cases ==========

    #[test]
    fn test_voice_profile_rate_clamping_max() {
        let mut profile = VoiceProfile::default();
        profile.characteristics.rate = 290.0;
        let adjusted = profile.get_adjusted_characteristics("excited"); // +25
        assert!(adjusted.rate <= 300.0);
    }

    #[test]
    fn test_voice_profile_rate_clamping_min() {
        let mut profile = VoiceProfile::default();
        profile.characteristics.rate = 60.0;
        let adjusted = profile.get_adjusted_characteristics("sad"); // -20
        assert!(adjusted.rate >= 50.0);
    }

    #[test]
    fn test_voice_profile_emphasis_clamping() {
        let mut profile = VoiceProfile::default();
        profile.characteristics.emphasis = 0.95;
        let adjusted = profile.get_adjusted_characteristics("excited"); // +0.3
        assert!(adjusted.emphasis <= 1.0);
    }

    #[test]
    fn test_voice_profile_warmth_clamping_min() {
        let mut profile = VoiceProfile::default();
        profile.characteristics.warmth = 0.05;
        let adjusted = profile.get_adjusted_characteristics("serious"); // -0.1
        assert!(adjusted.warmth >= 0.0);
    }
}
