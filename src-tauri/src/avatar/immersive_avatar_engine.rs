// ═══════════════════════════════════════════════════════════════════════════════
//   TITANE∞ v23 — IMMERSIVE AVATAR ENGINE (Backend Core)
//   Synthèse vocale immersive + Lip-sync + Expression dynamique
// ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};

// ═══════════════════════════════════════════════════════════════════════════════
//   VOICE PROFILES — ELEVENLABS ADINA OPTIMIZED
// ═══════════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImmersiveVoiceProfile {
    pub voice_id: String,       // "FvmvwvObRqIHojkEGh5N" (Adina)
    pub stability: f32,         // 0.45 (éviter rigidité)
    pub clarity: f32,           // 0.78 (intelligibilité)
    pub similarity_boost: f32,  // 0.92 (préserver timbre)
    pub style: f32,             // 0.65 (expressivité)
    pub exaggeration: f32,      // 0.22 (éviter mélodrame)
    pub speech_rate: f32,       // 0.88 (réduire vitesse native)
    pub breathiness: f32,       // 0.15 (légère respiration)
    pub soft_transitions: bool, // true (transitions douces)
    pub dynamic_range: f32,     // 0.70 (modulation)
}

impl Default for ImmersiveVoiceProfile {
    fn default() -> Self {
        Self {
            voice_id: "FvmvwvObRqIHojkEGh5N".to_string(),
            stability: 0.45,
            clarity: 0.78,
            similarity_boost: 0.92,
            style: 0.65,
            exaggeration: 0.22,
            speech_rate: 0.88,
            breathiness: 0.15,
            soft_transitions: true,
            dynamic_range: 0.70,
        }
    }
}

impl ImmersiveVoiceProfile {
    /// Ajuste le profil selon le contexte narratif
    pub fn adjust_for_narrative(&mut self, archetype: &str, mood: &str) {
        match archetype {
            "Architecte" => {
                self.stability = 0.50; // Plus stable
                self.speech_rate = 0.86; // Légèrement plus lent
                self.style = 0.60; // Moins expressif
            }
            "Observateur" => {
                self.stability = 0.42;
                self.clarity = 0.82; // Plus clair
                self.style = 0.55; // Neutre
            }
            "Tisseur" => {
                self.stability = 0.40;
                self.style = 0.70; // Plus expressif
                self.dynamic_range = 0.75;
            }
            "Flux" => {
                self.stability = 0.38; // Plus variable
                self.speech_rate = 0.90; // Plus rapide
                self.style = 0.68;
            }
            _ => {} // Garder profil par défaut
        }

        // Ajustement selon mood
        match mood {
            "calm" => {
                self.speech_rate *= 0.95;
                self.breathiness = 0.18;
            }
            "energized" => {
                self.speech_rate *= 1.05;
                self.exaggeration = 0.28;
            }
            "soft-guide" => {
                self.stability = 0.48;
                self.breathiness = 0.20;
            }
            _ => {}
        }
    }

    /// Ajuste selon charge cognitive (SingularityState)
    pub fn adjust_for_cognitive_load(&mut self, cognitive_stability: f32, cpu_load: f32) {
        if cognitive_stability < 0.5 {
            // Système en stress → voix plus douce
            self.speech_rate *= 0.92;
            self.stability += 0.05;
            self.breathiness += 0.05;
        }

        if cpu_load > 0.8 {
            // CPU élevé → simplifier voix
            self.similarity_boost *= 0.95;
            self.dynamic_range *= 0.90;
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   PROSODY CONTROLLER — MICRO-PAUSES & INTONATION
// ═══════════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProsodyControl {
    pub pause_after_comma: u32,   // ms (120)
    pub pause_after_period: u32,  // ms (180)
    pub pause_emotional: u32,     // ms (250-300)
    pub soft_r_phonemes: bool,    // Adoucir "r" roulés
    pub smooth_consonants: bool,  // Lisser "tr", "cr", "pr"
    pub intonation_curve: String, // "natural" | "flat" | "dynamic"
}

impl Default for ProsodyControl {
    fn default() -> Self {
        Self {
            pause_after_comma: 120,
            pause_after_period: 180,
            pause_emotional: 270,
            soft_r_phonemes: true,
            smooth_consonants: true,
            intonation_curve: "natural".to_string(),
        }
    }
}

impl ProsodyControl {
    /// Prépare le texte avec balises SSML/pauses
    pub fn prepare_text(&self, input: &str) -> String {
        let mut output = input.to_string();

        // Ajouter pauses après virgules
        if self.pause_after_comma > 0 {
            output = output.replace(
                ", ",
                &format!(", <break time='{}ms'/>", self.pause_after_comma),
            );
        }

        // Ajouter pauses après points
        if self.pause_after_period > 0 {
            output = output.replace(
                ". ",
                &format!(". <break time='{}ms'/>", self.pause_after_period),
            );
        }

        // Adoucir phonèmes FR difficiles
        if self.soft_r_phonemes {
            // Simuler adoucissement (préprocessing simple)
            output = output.replace("rr", "r"); // éviter double roulement
        }

        output
    }

    /// Segmente texte long en chunks cohérents
    pub fn segment_text(&self, input: &str) -> Vec<String> {
        let sentences: Vec<&str> = input.split(". ").collect();
        let mut segments = Vec::new();
        let mut current = String::new();

        for sentence in sentences {
            let word_count = sentence.split_whitespace().count();

            if current.split_whitespace().count() + word_count > 15 {
                // Segment plein → pousser
                if !current.is_empty() {
                    segments.push(current.trim().to_string());
                    current.clear();
                }
            }

            current.push_str(sentence);
            current.push_str(". ");
        }

        if !current.is_empty() {
            segments.push(current.trim().to_string());
        }

        segments
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   LIP-SYNC MODEL — PHONÈME → MORPH TARGETS
// ═══════════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FrenchPhoneme {
    // Voyelles
    A,
    E,
    I,
    O,
    U,
    EU,
    OU,
    AN,
    ON,
    IN,
    // Consonnes
    P,
    B,
    T,
    D,
    K,
    G,
    F,
    V,
    S,
    Z,
    CH,
    J,
    L,
    R,
    M,
    N,
    // Silence
    Silence,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MorphTarget {
    pub phoneme: FrenchPhoneme,
    pub jaw_open: f32,        // 0.0-1.0
    pub lip_rounding: f32,    // 0.0-1.0
    pub tongue_position: f32, // 0.0-1.0
    pub lip_spread: f32,      // 0.0-1.0
    pub duration_ms: u32,
}

impl MorphTarget {
    pub fn from_phoneme(phoneme: FrenchPhoneme, duration_ms: u32) -> Self {
        match phoneme {
            FrenchPhoneme::A => Self {
                phoneme,
                jaw_open: 0.8,
                lip_rounding: 0.1,
                tongue_position: 0.3,
                lip_spread: 0.6,
                duration_ms,
            },
            FrenchPhoneme::O => Self {
                phoneme,
                jaw_open: 0.6,
                lip_rounding: 0.9,
                tongue_position: 0.5,
                lip_spread: 0.2,
                duration_ms,
            },
            FrenchPhoneme::I => Self {
                phoneme,
                jaw_open: 0.3,
                lip_rounding: 0.1,
                tongue_position: 0.8,
                lip_spread: 0.9,
                duration_ms,
            },
            FrenchPhoneme::M | FrenchPhoneme::P | FrenchPhoneme::B => Self {
                phoneme,
                jaw_open: 0.0,
                lip_rounding: 0.5,
                tongue_position: 0.3,
                lip_spread: 0.1,
                duration_ms,
            },
            FrenchPhoneme::R => Self {
                phoneme,
                jaw_open: 0.4,
                lip_rounding: 0.3,
                tongue_position: 0.7,
                lip_spread: 0.4,
                duration_ms,
            },
            FrenchPhoneme::Silence => Self {
                phoneme,
                jaw_open: 0.1,
                lip_rounding: 0.2,
                tongue_position: 0.4,
                lip_spread: 0.3,
                duration_ms,
            },
            _ => Self {
                phoneme,
                jaw_open: 0.4,
                lip_rounding: 0.4,
                tongue_position: 0.5,
                lip_spread: 0.5,
                duration_ms,
            },
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LipSyncModel {
    pub active: bool,
    pub quality: String, // "low" | "medium" | "high"
    pub morph_targets: Vec<MorphTarget>,
    pub current_frame: usize,
}

impl Default for LipSyncModel {
    fn default() -> Self {
        Self {
            active: false,
            quality: "high".to_string(),
            morph_targets: Vec::new(),
            current_frame: 0,
        }
    }
}

impl LipSyncModel {
    /// Génère morph targets depuis texte
    pub fn generate_from_text(&mut self, text: &str) {
        // TODO: Implémenter phonemizer réel (G2P French)
        // Pour l'instant: mapping simple basé sur voyelles/consonnes

        self.morph_targets.clear();
        let words: Vec<&str> = text.split_whitespace().collect();

        for word in words {
            for ch in word.chars() {
                let phoneme = self.char_to_phoneme(ch);
                let morph = MorphTarget::from_phoneme(phoneme, 80); // ~80ms par phonème
                self.morph_targets.push(morph);
            }

            // Pause entre mots
            self.morph_targets
                .push(MorphTarget::from_phoneme(FrenchPhoneme::Silence, 40));
        }
    }

    fn char_to_phoneme(&self, ch: char) -> FrenchPhoneme {
        match ch.to_lowercase().next().unwrap_or('a') {
            'a' => FrenchPhoneme::A,
            'e' | 'é' | 'è' | 'ê' => FrenchPhoneme::E,
            'i' => FrenchPhoneme::I,
            'o' => FrenchPhoneme::O,
            'u' => FrenchPhoneme::U,
            'p' => FrenchPhoneme::P,
            'b' => FrenchPhoneme::B,
            't' => FrenchPhoneme::T,
            'd' => FrenchPhoneme::D,
            'k' => FrenchPhoneme::K,
            'g' => FrenchPhoneme::G,
            'f' => FrenchPhoneme::F,
            'v' => FrenchPhoneme::V,
            's' => FrenchPhoneme::S,
            'z' => FrenchPhoneme::Z,
            'l' => FrenchPhoneme::L,
            'r' => FrenchPhoneme::R,
            'm' => FrenchPhoneme::M,
            'n' => FrenchPhoneme::N,
            _ => FrenchPhoneme::Silence,
        }
    }

    pub fn get_current_morph(&self) -> Option<&MorphTarget> {
        self.morph_targets.get(self.current_frame)
    }

    pub fn advance_frame(&mut self) {
        if self.current_frame < self.morph_targets.len() {
            self.current_frame += 1;
        }
    }

    pub fn reset(&mut self) {
        self.current_frame = 0;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   EXPRESSION MODEL — ÉTATS ÉMOTIONNELS VISUELS
// ═══════════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum FacialExpression {
    Neutral,
    SoftSmile,
    Attentive,
    WarmFocus,
    ExplainMode,
    LiftedBrows,  // Intérêt
    RelaxedBrows, // Apaisement
    TinyNod,      // Acquiescement
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExpressionModel {
    pub current_expression: FacialExpression,
    pub transition_speed: f32, // 0.0-1.0
    pub intensity: f32,        // 0.0-1.0
    pub blink_rate: f32,       // par seconde
    pub micro_movements: bool,
}

impl Default for ExpressionModel {
    fn default() -> Self {
        Self {
            current_expression: FacialExpression::Neutral,
            transition_speed: 0.6,
            intensity: 0.7,
            blink_rate: 0.3, // 1 clignement toutes les ~3 secondes
            micro_movements: true,
        }
    }
}

impl ExpressionModel {
    /// Sélectionne expression selon contexte SingularityState
    pub fn update_from_state(
        &mut self,
        cognitive_stability: f32,
        xp_level: u32,
        archetype: &str,
        is_speaking: bool,
    ) {
        // Règles d'expression basées sur état interne
        if cognitive_stability < 0.5 {
            self.current_expression = FacialExpression::RelaxedBrows;
            self.intensity = 0.6;
        } else if cognitive_stability > 0.85 {
            self.current_expression = FacialExpression::WarmFocus;
            self.intensity = 0.8;
        }

        // XP récent → micro-sourire
        if xp_level % 10 == 0 && xp_level > 0 {
            self.current_expression = FacialExpression::SoftSmile;
            self.intensity = 0.75;
        }

        // Mode parole → ajuster expression
        if is_speaking {
            match archetype {
                "Architecte" => {
                    self.current_expression = FacialExpression::ExplainMode;
                }
                "Observateur" => {
                    self.current_expression = FacialExpression::Attentive;
                }
                "Tisseur" => {
                    self.current_expression = FacialExpression::SoftSmile;
                }
                _ => {}
            }
        } else {
            // Au repos → neutral ou soft
            if self.current_expression == FacialExpression::ExplainMode {
                self.current_expression = FacialExpression::Neutral;
            }
        }
    }

    /// Réaction au wake-word "TITANE"
    pub fn on_wake_word(&mut self) {
        self.current_expression = FacialExpression::LiftedBrows;
        self.intensity = 0.85;
        self.transition_speed = 0.8; // Transition rapide
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   IMMERSIVE AVATAR ENGINE — STRUCTURE PRINCIPALE
// ═══════════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImmersiveAvatarEngine {
    pub voice_profile: ImmersiveVoiceProfile,
    pub prosody_control: ProsodyControl,
    pub lip_sync: LipSyncModel,
    pub expression: ExpressionModel,
    pub immersion_mode: bool,
    pub wake_word_active: bool,
    pub is_speaking: bool,
}

impl Default for ImmersiveAvatarEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl ImmersiveAvatarEngine {
    pub fn new() -> Self {
        Self {
            voice_profile: ImmersiveVoiceProfile::default(),
            prosody_control: ProsodyControl::default(),
            lip_sync: LipSyncModel::default(),
            expression: ExpressionModel::default(),
            immersion_mode: false,
            wake_word_active: false,
            is_speaking: false,
        }
    }

    /// Prépare texte pour synthèse vocale immersive
    pub fn prepare_for_speech(
        &mut self,
        text: &str,
        archetype: &str,
        mood: &str,
        cognitive_stability: f32,
        cpu_load: f32,
    ) -> String {
        // 1. Ajuster profil vocal
        self.voice_profile.adjust_for_narrative(archetype, mood);
        self.voice_profile
            .adjust_for_cognitive_load(cognitive_stability, cpu_load);

        // 2. Préparer texte avec prosodie
        let prepared_text = self.prosody_control.prepare_text(text);

        // 3. Générer lip-sync
        self.lip_sync.generate_from_text(&prepared_text);
        self.lip_sync.active = self.immersion_mode;

        // 4. Mettre à jour expression
        self.expression
            .update_from_state(cognitive_stability, 0, archetype, true);

        // 5. Marquer comme parlant
        self.is_speaking = true;

        prepared_text
    }

    /// Termine synthèse vocale
    pub fn finish_speech(&mut self) {
        self.is_speaking = false;
        self.lip_sync.reset();
        self.expression.current_expression = FacialExpression::Neutral;
    }

    /// Active mode immersion
    pub fn enable_immersion(&mut self) {
        self.immersion_mode = true;
        self.lip_sync.quality = "high".to_string();
        self.expression.micro_movements = true;
    }

    /// Réaction au wake-word
    pub fn on_wake_word_detected(&mut self) {
        self.wake_word_active = true;
        self.expression.on_wake_word();
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   GLOBAL STATE
// ═══════════════════════════════════════════════════════════════════════════════

pub struct AvatarEngineGlobal(pub Arc<Mutex<ImmersiveAvatarEngine>>);

impl Default for AvatarEngineGlobal {
    fn default() -> Self {
        Self::new()
    }
}

impl AvatarEngineGlobal {
    pub fn new() -> Self {
        AvatarEngineGlobal(Arc::new(Mutex::new(ImmersiveAvatarEngine::new())))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // ImmersiveVoiceProfile Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_voice_profile_default() {
        let profile = ImmersiveVoiceProfile::default();
        assert_eq!(profile.voice_id, "FvmvwvObRqIHojkEGh5N");
        assert_eq!(profile.stability, 0.45);
        assert_eq!(profile.clarity, 0.78);
        assert_eq!(profile.similarity_boost, 0.92);
        assert_eq!(profile.style, 0.65);
        assert!(profile.soft_transitions);
    }

    #[test]
    fn test_voice_profile_clone() {
        let profile = ImmersiveVoiceProfile::default();
        let cloned = profile.clone();
        assert_eq!(cloned.voice_id, profile.voice_id);
    }

    #[test]
    fn test_voice_profile_debug() {
        let profile = ImmersiveVoiceProfile::default();
        let debug_str = format!("{:?}", profile);
        assert!(debug_str.contains("ImmersiveVoiceProfile"));
    }

    #[test]
    fn test_voice_profile_serialization() {
        let profile = ImmersiveVoiceProfile::default();
        let json = serde_json::to_string(&profile).unwrap();
        let restored: ImmersiveVoiceProfile = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.voice_id, profile.voice_id);
    }

    #[test]
    fn test_voice_profile_adjust_architecte() {
        let mut profile = ImmersiveVoiceProfile::default();
        profile.adjust_for_narrative("Architecte", "neutral");
        assert_eq!(profile.stability, 0.50);
        assert_eq!(profile.speech_rate, 0.86);
        assert_eq!(profile.style, 0.60);
    }

    #[test]
    fn test_voice_profile_adjust_observateur() {
        let mut profile = ImmersiveVoiceProfile::default();
        profile.adjust_for_narrative("Observateur", "neutral");
        assert_eq!(profile.stability, 0.42);
        assert_eq!(profile.clarity, 0.82);
        assert_eq!(profile.style, 0.55);
    }

    #[test]
    fn test_voice_profile_adjust_tisseur() {
        let mut profile = ImmersiveVoiceProfile::default();
        profile.adjust_for_narrative("Tisseur", "neutral");
        assert_eq!(profile.stability, 0.40);
        assert_eq!(profile.style, 0.70);
        assert_eq!(profile.dynamic_range, 0.75);
    }

    #[test]
    fn test_voice_profile_adjust_flux() {
        let mut profile = ImmersiveVoiceProfile::default();
        profile.adjust_for_narrative("Flux", "neutral");
        assert_eq!(profile.stability, 0.38);
        assert_eq!(profile.speech_rate, 0.90);
    }

    #[test]
    fn test_voice_profile_adjust_mood_calm() {
        let mut profile = ImmersiveVoiceProfile::default();
        let original_rate = profile.speech_rate;
        profile.adjust_for_narrative("Default", "calm");
        assert!(profile.speech_rate < original_rate);
        assert_eq!(profile.breathiness, 0.18);
    }

    #[test]
    fn test_voice_profile_adjust_mood_energized() {
        let mut profile = ImmersiveVoiceProfile::default();
        let original_rate = profile.speech_rate;
        profile.adjust_for_narrative("Default", "energized");
        assert!(profile.speech_rate > original_rate);
        assert_eq!(profile.exaggeration, 0.28);
    }

    #[test]
    fn test_voice_profile_adjust_mood_soft_guide() {
        let mut profile = ImmersiveVoiceProfile::default();
        profile.adjust_for_narrative("Default", "soft-guide");
        assert_eq!(profile.stability, 0.48);
        assert_eq!(profile.breathiness, 0.20);
    }

    #[test]
    fn test_voice_profile_cognitive_load_low_stability() {
        let mut profile = ImmersiveVoiceProfile::default();
        let original_rate = profile.speech_rate;
        profile.adjust_for_cognitive_load(0.3, 0.5);
        assert!(profile.speech_rate < original_rate);
        assert_eq!(profile.stability, 0.50);
    }

    #[test]
    fn test_voice_profile_cognitive_load_high_cpu() {
        let mut profile = ImmersiveVoiceProfile::default();
        let original_boost = profile.similarity_boost;
        profile.adjust_for_cognitive_load(0.8, 0.85);
        assert!(profile.similarity_boost < original_boost);
    }

    // ─────────────────────────────────────────────────────────────
    // ProsodyControl Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_prosody_control_default() {
        let prosody = ProsodyControl::default();
        assert_eq!(prosody.pause_after_comma, 120);
        assert_eq!(prosody.pause_after_period, 180);
        assert_eq!(prosody.pause_emotional, 270);
        assert!(prosody.soft_r_phonemes);
        assert!(prosody.smooth_consonants);
        assert_eq!(prosody.intonation_curve, "natural");
    }

    #[test]
    fn test_prosody_control_clone() {
        let prosody = ProsodyControl::default();
        let cloned = prosody.clone();
        assert_eq!(cloned.pause_after_comma, prosody.pause_after_comma);
    }

    #[test]
    fn test_prosody_control_serialization() {
        let prosody = ProsodyControl::default();
        let json = serde_json::to_string(&prosody).unwrap();
        let restored: ProsodyControl = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.pause_after_comma, 120);
    }

    #[test]
    fn test_prosody_prepare_text_comma() {
        let prosody = ProsodyControl::default();
        let text = "Hello, world";
        let prepared = prosody.prepare_text(text);
        assert!(prepared.contains("<break time='120ms'/>"));
    }

    #[test]
    fn test_prosody_prepare_text_period() {
        let prosody = ProsodyControl::default();
        let text = "Hello. World";
        let prepared = prosody.prepare_text(text);
        assert!(prepared.contains("<break time='180ms'/>"));
    }

    #[test]
    fn test_prosody_prepare_text_double_r() {
        let prosody = ProsodyControl::default();
        let text = "terrrain";
        let prepared = prosody.prepare_text(text);
        assert!(!prepared.contains("rr"));
    }

    #[test]
    fn test_prosody_segment_text_short() {
        let prosody = ProsodyControl::default();
        let text = "Hello world.";
        let segments = prosody.segment_text(text);
        assert_eq!(segments.len(), 1);
    }

    #[test]
    fn test_prosody_segment_text_long() {
        let prosody = ProsodyControl::default();
        let text = "This is the first sentence with many words. This is the second sentence with many words. This is the third sentence.";
        let segments = prosody.segment_text(text);
        assert!(segments.len() >= 2);
    }

    // ─────────────────────────────────────────────────────────────
    // FrenchPhoneme Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_french_phoneme_clone() {
        let phoneme = FrenchPhoneme::A;
        let cloned = phoneme.clone();
        assert!(matches!(cloned, FrenchPhoneme::A));
    }

    #[test]
    fn test_french_phoneme_debug() {
        let phoneme = FrenchPhoneme::E;
        let debug_str = format!("{:?}", phoneme);
        assert!(debug_str.contains("E"));
    }

    #[test]
    fn test_french_phoneme_serialization() {
        let phoneme = FrenchPhoneme::O;
        let json = serde_json::to_string(&phoneme).unwrap();
        let restored: FrenchPhoneme = serde_json::from_str(&json).unwrap();
        assert!(matches!(restored, FrenchPhoneme::O));
    }

    #[test]
    fn test_french_phoneme_all_variants() {
        let phonemes = vec![
            FrenchPhoneme::A, FrenchPhoneme::E, FrenchPhoneme::I, FrenchPhoneme::O, FrenchPhoneme::U,
            FrenchPhoneme::EU, FrenchPhoneme::OU, FrenchPhoneme::AN, FrenchPhoneme::ON, FrenchPhoneme::IN,
            FrenchPhoneme::P, FrenchPhoneme::B, FrenchPhoneme::T, FrenchPhoneme::D, FrenchPhoneme::K,
            FrenchPhoneme::G, FrenchPhoneme::F, FrenchPhoneme::V, FrenchPhoneme::S, FrenchPhoneme::Z,
            FrenchPhoneme::CH, FrenchPhoneme::J, FrenchPhoneme::L, FrenchPhoneme::R, FrenchPhoneme::M,
            FrenchPhoneme::N, FrenchPhoneme::Silence,
        ];
        assert_eq!(phonemes.len(), 27);
    }

    // ─────────────────────────────────────────────────────────────
    // MorphTarget Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_morph_target_from_phoneme_a() {
        let morph = MorphTarget::from_phoneme(FrenchPhoneme::A, 100);
        assert_eq!(morph.jaw_open, 0.8);
        assert_eq!(morph.lip_spread, 0.6);
        assert_eq!(morph.duration_ms, 100);
    }

    #[test]
    fn test_morph_target_from_phoneme_o() {
        let morph = MorphTarget::from_phoneme(FrenchPhoneme::O, 80);
        assert_eq!(morph.jaw_open, 0.6);
        assert_eq!(morph.lip_rounding, 0.9);
    }

    #[test]
    fn test_morph_target_from_phoneme_i() {
        let morph = MorphTarget::from_phoneme(FrenchPhoneme::I, 80);
        assert_eq!(morph.jaw_open, 0.3);
        assert_eq!(morph.lip_spread, 0.9);
    }

    #[test]
    fn test_morph_target_from_phoneme_m() {
        let morph = MorphTarget::from_phoneme(FrenchPhoneme::M, 80);
        assert_eq!(morph.jaw_open, 0.0);
    }

    #[test]
    fn test_morph_target_from_phoneme_silence() {
        let morph = MorphTarget::from_phoneme(FrenchPhoneme::Silence, 50);
        assert_eq!(morph.jaw_open, 0.1);
        assert_eq!(morph.duration_ms, 50);
    }

    #[test]
    fn test_morph_target_clone() {
        let morph = MorphTarget::from_phoneme(FrenchPhoneme::R, 100);
        let cloned = morph.clone();
        assert_eq!(cloned.duration_ms, 100);
    }

    #[test]
    fn test_morph_target_serialization() {
        let morph = MorphTarget::from_phoneme(FrenchPhoneme::E, 80);
        let json = serde_json::to_string(&morph).unwrap();
        let restored: MorphTarget = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.duration_ms, 80);
    }

    // ─────────────────────────────────────────────────────────────
    // LipSyncModel Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_lip_sync_model_default() {
        let model = LipSyncModel::default();
        assert!(!model.active);
        assert_eq!(model.quality, "high");
        assert!(model.morph_targets.is_empty());
        assert_eq!(model.current_frame, 0);
    }

    #[test]
    fn test_lip_sync_model_generate_from_text() {
        let mut model = LipSyncModel::default();
        model.generate_from_text("Hello");
        assert!(!model.morph_targets.is_empty());
    }

    #[test]
    fn test_lip_sync_model_get_current_morph() {
        let mut model = LipSyncModel::default();
        model.generate_from_text("Test");
        assert!(model.get_current_morph().is_some());
    }

    #[test]
    fn test_lip_sync_model_advance_frame() {
        let mut model = LipSyncModel::default();
        model.generate_from_text("AB");
        model.advance_frame();
        assert_eq!(model.current_frame, 1);
    }

    #[test]
    fn test_lip_sync_model_reset() {
        let mut model = LipSyncModel::default();
        model.generate_from_text("Test");
        model.advance_frame();
        model.advance_frame();
        model.reset();
        assert_eq!(model.current_frame, 0);
    }

    #[test]
    fn test_lip_sync_model_serialization() {
        let model = LipSyncModel::default();
        let json = serde_json::to_string(&model).unwrap();
        let restored: LipSyncModel = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.quality, "high");
    }

    // ─────────────────────────────────────────────────────────────
    // FacialExpression Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_facial_expression_equality() {
        assert_eq!(FacialExpression::Neutral, FacialExpression::Neutral);
        assert_ne!(FacialExpression::Neutral, FacialExpression::SoftSmile);
    }

    #[test]
    fn test_facial_expression_clone() {
        let expr = FacialExpression::WarmFocus;
        let cloned = expr.clone();
        assert_eq!(cloned, FacialExpression::WarmFocus);
    }

    #[test]
    fn test_facial_expression_serialization() {
        let expr = FacialExpression::Attentive;
        let json = serde_json::to_string(&expr).unwrap();
        let restored: FacialExpression = serde_json::from_str(&json).unwrap();
        assert_eq!(restored, FacialExpression::Attentive);
    }

    // ─────────────────────────────────────────────────────────────
    // ExpressionModel Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_expression_model_default() {
        let model = ExpressionModel::default();
        assert_eq!(model.current_expression, FacialExpression::Neutral);
        assert_eq!(model.transition_speed, 0.6);
        assert_eq!(model.intensity, 0.7);
        assert!(model.micro_movements);
    }

    #[test]
    fn test_expression_model_update_low_stability() {
        let mut model = ExpressionModel::default();
        model.update_from_state(0.3, 0, "Default", false);
        assert_eq!(model.current_expression, FacialExpression::RelaxedBrows);
    }

    #[test]
    fn test_expression_model_update_high_stability() {
        let mut model = ExpressionModel::default();
        model.update_from_state(0.9, 0, "Default", false);
        assert_eq!(model.current_expression, FacialExpression::WarmFocus);
    }

    #[test]
    fn test_expression_model_update_xp_milestone() {
        let mut model = ExpressionModel::default();
        model.update_from_state(0.7, 10, "Default", false);
        assert_eq!(model.current_expression, FacialExpression::SoftSmile);
    }

    #[test]
    fn test_expression_model_speaking_architecte() {
        let mut model = ExpressionModel::default();
        model.update_from_state(0.7, 0, "Architecte", true);
        assert_eq!(model.current_expression, FacialExpression::ExplainMode);
    }

    #[test]
    fn test_expression_model_speaking_observateur() {
        let mut model = ExpressionModel::default();
        model.update_from_state(0.7, 0, "Observateur", true);
        assert_eq!(model.current_expression, FacialExpression::Attentive);
    }

    #[test]
    fn test_expression_model_speaking_tisseur() {
        let mut model = ExpressionModel::default();
        model.update_from_state(0.7, 0, "Tisseur", true);
        assert_eq!(model.current_expression, FacialExpression::SoftSmile);
    }

    #[test]
    fn test_expression_model_on_wake_word() {
        let mut model = ExpressionModel::default();
        model.on_wake_word();
        assert_eq!(model.current_expression, FacialExpression::LiftedBrows);
        assert_eq!(model.intensity, 0.85);
        assert_eq!(model.transition_speed, 0.8);
    }

    #[test]
    fn test_expression_model_serialization() {
        let model = ExpressionModel::default();
        let json = serde_json::to_string(&model).unwrap();
        let restored: ExpressionModel = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.intensity, 0.7);
    }

    // ─────────────────────────────────────────────────────────────
    // ImmersiveAvatarEngine Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_immersive_avatar_engine_new() {
        let engine = ImmersiveAvatarEngine::new();
        assert!(!engine.immersion_mode);
        assert!(!engine.wake_word_active);
        assert!(!engine.is_speaking);
    }

    #[test]
    fn test_immersive_avatar_engine_default() {
        let engine = ImmersiveAvatarEngine::default();
        assert!(!engine.immersion_mode);
    }

    #[test]
    fn test_immersive_avatar_engine_clone() {
        let engine = ImmersiveAvatarEngine::new();
        let cloned = engine.clone();
        assert!(!cloned.is_speaking);
    }

    #[test]
    fn test_immersive_avatar_engine_prepare_for_speech() {
        let mut engine = ImmersiveAvatarEngine::new();
        let prepared = engine.prepare_for_speech("Hello world", "Architecte", "calm", 0.8, 0.3);
        assert!(!prepared.is_empty());
        assert!(engine.is_speaking);
    }

    #[test]
    fn test_immersive_avatar_engine_finish_speech() {
        let mut engine = ImmersiveAvatarEngine::new();
        engine.is_speaking = true;
        engine.finish_speech();
        assert!(!engine.is_speaking);
        assert_eq!(engine.expression.current_expression, FacialExpression::Neutral);
    }

    #[test]
    fn test_immersive_avatar_engine_enable_immersion() {
        let mut engine = ImmersiveAvatarEngine::new();
        engine.enable_immersion();
        assert!(engine.immersion_mode);
        assert_eq!(engine.lip_sync.quality, "high");
        assert!(engine.expression.micro_movements);
    }

    #[test]
    fn test_immersive_avatar_engine_on_wake_word() {
        let mut engine = ImmersiveAvatarEngine::new();
        engine.on_wake_word_detected();
        assert!(engine.wake_word_active);
        assert_eq!(engine.expression.current_expression, FacialExpression::LiftedBrows);
    }

    #[test]
    fn test_immersive_avatar_engine_serialization() {
        let engine = ImmersiveAvatarEngine::new();
        let json = serde_json::to_string(&engine).unwrap();
        let restored: ImmersiveAvatarEngine = serde_json::from_str(&json).unwrap();
        assert!(!restored.immersion_mode);
    }

    // ─────────────────────────────────────────────────────────────
    // AvatarEngineGlobal Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_avatar_engine_global_new() {
        let global = AvatarEngineGlobal::new();
        let guard = global.0.lock().unwrap();
        assert!(!guard.is_speaking);
    }

    #[test]
    fn test_avatar_engine_global_default() {
        let global = AvatarEngineGlobal::default();
        let guard = global.0.lock().unwrap();
        assert!(!guard.immersion_mode);
    }
}
