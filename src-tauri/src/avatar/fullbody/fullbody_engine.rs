// Copyright © 2025 TITANE∞ — Full-Body Avatar Engine v24
// License: Proprietary — TITANE OS
// Module: FullBodyAvatarEngine — Avatar féminin corps entier athlétique & expressif

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

// ═══════════════════════════════════════════════════════════════════════════
// BODY PROFILE — Profil morphologique et esthétique
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BodyProfile {
    /// Taille en mètres (1.65–1.72m pour proportion réaliste)
    pub height: f32,

    /// Type de corpulence: "athletic-toned" | "lean" | "balanced"
    pub build: String,

    /// Posture par défaut: "open" | "confident" | "aligned"
    pub posture_default: String,

    /// Largeur d'épaules (facteur multiplicateur, 1.0 = standard)
    pub shoulder_width: f32,

    /// Ratio taille/hanches (0.7–0.75 pour subtil hourglass)
    pub waist_ratio: f32,

    /// Proportions jambes: "athletic" | "standard" | "long"
    pub leg_proportions: String,

    /// Style de mouvement: "fluid" | "controlled" | "expressive"
    pub movement_style: String,

    /// Pose de repos: "poised" | "relaxed" | "alert"
    pub resting_pose: String,
}

impl Default for BodyProfile {
    fn default() -> Self {
        Self {
            height: 1.68,
            build: "athletic-toned".to_string(),
            posture_default: "confident".to_string(),
            shoulder_width: 1.0,
            waist_ratio: 0.72,
            leg_proportions: "athletic".to_string(),
            movement_style: "fluid".to_string(),
            resting_pose: "poised".to_string(),
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// SKELETON MODEL — Modèle squelettique simplifié (IK + BlendShapes)
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BoneTransform {
    pub position: [f32; 3],
    pub rotation: [f32; 4], // Quaternion [x, y, z, w]
    pub scale: [f32; 3],
}

impl Default for BoneTransform {
    fn default() -> Self {
        Self {
            position: [0.0, 0.0, 0.0],
            rotation: [0.0, 0.0, 0.0, 1.0],
            scale: [1.0, 1.0, 1.0],
        }
    }
}

#[derive(Debug, Clone)]
pub struct SkeletonModel {
    /// Hiérarchie des os principaux (18 bones simplifiés)
    pub bones: HashMap<String, BoneTransform>,

    /// Chaîne IK pour bras/mains (simplifiée)
    pub ik_chains: HashMap<String, Vec<String>>,

    /// Profil morphologique
    pub body_profile: BodyProfile,
}

impl SkeletonModel {
    pub fn new(profile: BodyProfile) -> Self {
        let mut bones = HashMap::new();

        // Définir squelette de base (18 bones)
        let bone_names = vec![
            "root",
            "spine_lower",
            "spine_mid",
            "spine_upper",
            "neck",
            "head",
            "shoulder_left",
            "upper_arm_left",
            "forearm_left",
            "hand_left",
            "shoulder_right",
            "upper_arm_right",
            "forearm_right",
            "hand_right",
            "hip_left",
            "thigh_left",
            "calf_left",
            "foot_left",
        ];

        for name in bone_names {
            bones.insert(name.to_string(), BoneTransform::default());
        }

        // Configurer chaînes IK (bras gauche/droit)
        let mut ik_chains = HashMap::new();
        ik_chains.insert(
            "arm_left".to_string(),
            vec![
                "shoulder_left".to_string(),
                "upper_arm_left".to_string(),
                "forearm_left".to_string(),
                "hand_left".to_string(),
            ],
        );
        ik_chains.insert(
            "arm_right".to_string(),
            vec![
                "shoulder_right".to_string(),
                "upper_arm_right".to_string(),
                "forearm_right".to_string(),
                "hand_right".to_string(),
            ],
        );

        Self {
            bones,
            ik_chains,
            body_profile: profile,
        }
    }

    /// Appliquer posture de base (debout, aligné, épaules ouvertes)
    pub fn apply_default_posture(&mut self) {
        // Spine alignment
        if let Some(spine_mid) = self.bones.get_mut("spine_mid") {
            spine_mid.position[1] = self.body_profile.height * 0.5;
        }

        // Shoulder width adjustment
        if let Some(shoulder_left) = self.bones.get_mut("shoulder_left") {
            shoulder_left.position[0] = -0.18 * self.body_profile.shoulder_width;
        }
        if let Some(shoulder_right) = self.bones.get_mut("shoulder_right") {
            shoulder_right.position[0] = 0.18 * self.body_profile.shoulder_width;
        }

        // Head height
        if let Some(head) = self.bones.get_mut("head") {
            head.position[1] = self.body_profile.height * 0.92;
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// GESTURE DEFINITIONS — Bibliothèque de gestes clés
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GestureKeyframe {
    pub bone_name: String,
    pub transform: BoneTransform,
    pub duration_ms: u32,
    pub easing: String, // "linear" | "ease-in-out" | "ease-out"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Gesture {
    pub name: String,
    pub keyframes: Vec<GestureKeyframe>,
    pub loop_enabled: bool,
    pub transition_in_ms: u32,
    pub transition_out_ms: u32,
}

impl Gesture {
    /// Geste: Écoute active (micro-nod, slight lean forward)
    pub fn listening() -> Self {
        Self {
            name: "listening".to_string(),
            keyframes: vec![
                GestureKeyframe {
                    bone_name: "head".to_string(),
                    transform: BoneTransform {
                        rotation: [0.05, 0.0, 0.0, 0.998], // Léger tilt avant
                        ..Default::default()
                    },
                    duration_ms: 800,
                    easing: "ease-in-out".to_string(),
                },
                GestureKeyframe {
                    bone_name: "spine_upper".to_string(),
                    transform: BoneTransform {
                        rotation: [0.03, 0.0, 0.0, 0.999], // Lean forward subtil
                        ..Default::default()
                    },
                    duration_ms: 800,
                    easing: "ease-in-out".to_string(),
                },
            ],
            loop_enabled: true,
            transition_in_ms: 200,
            transition_out_ms: 200,
        }
    }

    /// Geste: Explication (geste main droite ouvert, bras supportif gauche)
    pub fn explaining() -> Self {
        Self {
            name: "explaining".to_string(),
            keyframes: vec![
                GestureKeyframe {
                    bone_name: "upper_arm_right".to_string(),
                    transform: BoneTransform {
                        rotation: [0.0, 0.4, 0.2, 0.9], // Bras droit levé
                        ..Default::default()
                    },
                    duration_ms: 600,
                    easing: "ease-out".to_string(),
                },
                GestureKeyframe {
                    bone_name: "hand_right".to_string(),
                    transform: BoneTransform {
                        rotation: [0.0, 0.0, 0.1, 0.995], // Main ouverte
                        ..Default::default()
                    },
                    duration_ms: 600,
                    easing: "ease-out".to_string(),
                },
                GestureKeyframe {
                    bone_name: "upper_arm_left".to_string(),
                    transform: BoneTransform {
                        rotation: [0.0, -0.2, 0.1, 0.97], // Bras gauche support
                        ..Default::default()
                    },
                    duration_ms: 600,
                    easing: "ease-out".to_string(),
                },
            ],
            loop_enabled: false,
            transition_in_ms: 250,
            transition_out_ms: 350,
        }
    }

    /// Geste: Réflexion (regard détourné, sourcil contracté)
    pub fn thinking() -> Self {
        Self {
            name: "thinking".to_string(),
            keyframes: vec![
                GestureKeyframe {
                    bone_name: "head".to_string(),
                    transform: BoneTransform {
                        rotation: [0.0, 0.15, 0.02, 0.988], // Look-away léger
                        ..Default::default()
                    },
                    duration_ms: 900,
                    easing: "ease-in-out".to_string(),
                },
                GestureKeyframe {
                    bone_name: "spine_upper".to_string(),
                    transform: BoneTransform {
                        rotation: [-0.02, 0.0, 0.0, 0.9998], // Inhale-pause
                        ..Default::default()
                    },
                    duration_ms: 900,
                    easing: "linear".to_string(),
                },
            ],
            loop_enabled: false,
            transition_in_ms: 300,
            transition_out_ms: 300,
        }
    }

    /// Geste: Sourire chaleureux (micro-expression + micro-breath)
    pub fn smiling_warm() -> Self {
        Self {
            name: "smiling_warm".to_string(),
            keyframes: vec![GestureKeyframe {
                bone_name: "head".to_string(),
                transform: BoneTransform {
                    rotation: [0.02, 0.0, 0.0, 0.9998], // Léger tilt
                    ..Default::default()
                },
                duration_ms: 500,
                easing: "ease-out".to_string(),
            }],
            loop_enabled: false,
            transition_in_ms: 150,
            transition_out_ms: 200,
        }
    }

    /// Geste: Changement d'attention (saccade oculaire + alignement tête)
    pub fn attention_shift() -> Self {
        Self {
            name: "attention_shift".to_string(),
            keyframes: vec![GestureKeyframe {
                bone_name: "head".to_string(),
                transform: BoneTransform {
                    rotation: [0.0, 0.1, 0.0, 0.995], // Rotation rapide
                    ..Default::default()
                },
                duration_ms: 200,
                easing: "ease-out".to_string(),
            }],
            loop_enabled: false,
            transition_in_ms: 100,
            transition_out_ms: 150,
        }
    }

    /// Geste: Cycle idle (respiration douce + micro-mouvement colonne)
    pub fn idle_cycle() -> Self {
        Self {
            name: "idle_cycle".to_string(),
            keyframes: vec![
                GestureKeyframe {
                    bone_name: "spine_mid".to_string(),
                    transform: BoneTransform {
                        position: [0.0, 0.002, 0.0], // Respiration thorax
                        ..Default::default()
                    },
                    duration_ms: 3000,
                    easing: "ease-in-out".to_string(),
                },
                GestureKeyframe {
                    bone_name: "spine_mid".to_string(),
                    transform: BoneTransform {
                        position: [0.0, -0.002, 0.0],
                        ..Default::default()
                    },
                    duration_ms: 3000,
                    easing: "ease-in-out".to_string(),
                },
            ],
            loop_enabled: true,
            transition_in_ms: 0,
            transition_out_ms: 0,
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// MOTION LAYER — Gestion animations et transitions
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone)]
pub struct MotionLayer {
    pub current_gesture: Option<Gesture>,
    pub gesture_library: HashMap<String, Gesture>,
    pub transition_progress: f32, // 0.0–1.0
    pub elapsed_ms: u32,
}

impl Default for MotionLayer {
    fn default() -> Self {
        Self::new()
    }
}

impl MotionLayer {
    pub fn new() -> Self {
        let mut library = HashMap::new();
        library.insert("listening".to_string(), Gesture::listening());
        library.insert("explaining".to_string(), Gesture::explaining());
        library.insert("thinking".to_string(), Gesture::thinking());
        library.insert("smiling_warm".to_string(), Gesture::smiling_warm());
        library.insert("attention_shift".to_string(), Gesture::attention_shift());
        library.insert("idle_cycle".to_string(), Gesture::idle_cycle());

        Self {
            current_gesture: Some(Gesture::idle_cycle()),
            gesture_library: library,
            transition_progress: 1.0,
            elapsed_ms: 0,
        }
    }

    /// Activer un geste (avec transition fluide)
    pub fn activate_gesture(&mut self, gesture_name: &str) {
        if let Some(gesture) = self.gesture_library.get(gesture_name).cloned() {
            self.current_gesture = Some(gesture);
            self.transition_progress = 0.0;
            self.elapsed_ms = 0;
        }
    }

    /// Avancer l'animation (appelé chaque frame)
    pub fn advance_frame(&mut self, delta_ms: u32) {
        self.elapsed_ms += delta_ms;

        // Vérifier état geste et décider action (éviter double borrow)
        let should_loop = self.current_gesture.as_ref().map(|g| {
            let total_duration: u32 = g.keyframes.iter().map(|k| k.duration_ms).sum();
            let loop_enabled = g.loop_enabled;
            (self.elapsed_ms >= total_duration, loop_enabled)
        });

        if let Some((elapsed_exceeded, loop_enabled)) = should_loop {
            if elapsed_exceeded {
                if loop_enabled {
                    self.elapsed_ms = 0; // Recommencer cycle
                } else {
                    self.activate_gesture("idle_cycle"); // Retour idle
                }
            }
        }

        // Progression transition
        if self.transition_progress < 1.0 {
            if let Some(gesture) = &self.current_gesture {
                let transition_speed = 1.0 / (gesture.transition_in_ms as f32 / delta_ms as f32);
                self.transition_progress = (self.transition_progress + transition_speed).min(1.0);
            }
        }
    }

    /// Appliquer transformations courantes au skeleton
    pub fn apply_to_skeleton(&self, skeleton: &mut SkeletonModel) {
        if let Some(gesture) = &self.current_gesture {
            for keyframe in &gesture.keyframes {
                if let Some(bone) = skeleton.bones.get_mut(&keyframe.bone_name) {
                    // Interpolation linéaire simplifiée (améliorer avec easing curves)
                    let blend = self.transition_progress;

                    // Position blend
                    for i in 0..3 {
                        bone.position[i] = bone.position[i] * (1.0 - blend)
                            + keyframe.transform.position[i] * blend;
                    }

                    // Rotation blend (quaternion slerp simplifié)
                    for i in 0..4 {
                        bone.rotation[i] = bone.rotation[i] * (1.0 - blend)
                            + keyframe.transform.rotation[i] * blend;
                    }
                }
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPRESSION BRIDGE — Lien avec ExpressionModel v23
// ═══════════════════════════════════════════════════════════════════════════

use super::super::immersive_avatar_engine::FacialExpression;

#[derive(Debug, Clone)]
pub struct ExpressionBridge {
    pub current_expression: FacialExpression,
    pub intensity: f32, // 0.0–1.0
}

impl Default for ExpressionBridge {
    fn default() -> Self {
        Self::new()
    }
}

impl ExpressionBridge {
    pub fn new() -> Self {
        Self {
            current_expression: FacialExpression::Neutral,
            intensity: 0.5,
        }
    }

    /// Mettre à jour l'expression faciale
    pub fn update_expression(&mut self, expression: FacialExpression, intensity: f32) {
        self.current_expression = expression;
        self.intensity = intensity.clamp(0.0, 1.0);
    }

    /// Mapper expression → geste corporel associé
    pub fn map_to_body_gesture(&self) -> Option<String> {
        match self.current_expression {
            FacialExpression::ExplainMode => Some("explaining".to_string()),
            FacialExpression::SoftSmile | FacialExpression::WarmFocus => {
                Some("smiling_warm".to_string())
            }
            FacialExpression::Attentive => Some("listening".to_string()),
            _ => None,
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// LIP-SYNC FEED — Flux depuis LipSyncModel v23
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone)]
pub struct LipSyncFeed {
    pub current_phoneme: String,
    pub morph_weights: [f32; 4], // Jaw, Lips, Tongue, Cheeks
    pub speech_active: bool,
}

impl Default for LipSyncFeed {
    fn default() -> Self {
        Self::new()
    }
}

impl LipSyncFeed {
    pub fn new() -> Self {
        Self {
            current_phoneme: "silence".to_string(),
            morph_weights: [0.0, 0.0, 0.0, 0.0],
            speech_active: false,
        }
    }

    /// Mettre à jour depuis le moteur lip-sync v23
    pub fn update_from_lipsync(&mut self, phoneme: String, weights: [f32; 4]) {
        self.current_phoneme = phoneme;
        self.morph_weights = weights;
        self.speech_active = weights.iter().any(|&w| w > 0.01);
    }

    /// Ajuster micro-gestuelle en fonction de l'activité vocale
    pub fn adjust_body_motion(&self, motion_layer: &mut MotionLayer) {
        if self.speech_active {
            // Réduire amplitude gestes pendant parole (plus stable)
            motion_layer.transition_progress *= 0.85;
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// AVATAR STATE BINDING — Liaison avec SingularityState v∞
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AvatarStateSnapshot {
    pub cognitive_load: f32,         // 0.0–1.0
    pub emotional_tone: String,      // "neutral" | "warm" | "focused" | "creative"
    pub meta_intention: String,      // "explain" | "listen" | "inspire" | "guide"
    pub narrative_archetype: String, // "Architecte" | "Sage" | "Innovateur"
    pub timeline_state: String,      // "present" | "past" | "future"
    pub xp_progression: f32,         // 0.0–100.0+
}

impl Default for AvatarStateSnapshot {
    fn default() -> Self {
        Self {
            cognitive_load: 0.3,
            emotional_tone: "neutral".to_string(),
            meta_intention: "guide".to_string(),
            narrative_archetype: "Architecte".to_string(),
            timeline_state: "present".to_string(),
            xp_progression: 0.0,
        }
    }
}

#[derive(Debug, Clone)]
pub struct AvatarStateBinding {
    pub current_state: AvatarStateSnapshot,
}

impl Default for AvatarStateBinding {
    fn default() -> Self {
        Self::new()
    }
}

impl AvatarStateBinding {
    pub fn new() -> Self {
        Self {
            current_state: AvatarStateSnapshot::default(),
        }
    }

    /// Mettre à jour l'état depuis SingularityState
    pub fn update_from_state(&mut self, snapshot: AvatarStateSnapshot) {
        self.current_state = snapshot;
    }

    /// Ajuster posture/gestuelle selon l'état cognitif
    pub fn adjust_motion_for_state(&self, motion_layer: &mut MotionLayer) {
        // High cognitive load → mouvements réduits, stabilité
        if self.current_state.cognitive_load > 0.7 {
            motion_layer.transition_progress *= 0.7;
        }

        // Meta-intention → gestes adaptés
        match self.current_state.meta_intention.as_str() {
            "explain" => motion_layer.activate_gesture("explaining"),
            "listen" => motion_layer.activate_gesture("listening"),
            "inspire" => motion_layer.activate_gesture("smiling_warm"),
            _ => {}
        }

        // XP gain → micro-ouverture torse
        if self.current_state.xp_progression > 0.0 {
            // Trigger subtle expansion animation (à implémenter)
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// FULL-BODY AVATAR ENGINE — Structure principale
// ═══════════════════════════════════════════════════════════════════════════

pub struct FullBodyAvatarEngine {
    pub skeleton: SkeletonModel,
    pub motion_layer: MotionLayer,
    pub expression_bridge: ExpressionBridge,
    pub lip_sync_feed: LipSyncFeed,
    pub state_binding: AvatarStateBinding,
    pub frame_count: u64,
    pub target_fps: u32,
}

impl Default for FullBodyAvatarEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl FullBodyAvatarEngine {
    /// Créer nouvelle instance avec profil par défaut
    pub fn new() -> Self {
        let profile = BodyProfile::default();
        let mut skeleton = SkeletonModel::new(profile);
        skeleton.apply_default_posture();

        Self {
            skeleton,
            motion_layer: MotionLayer::new(),
            expression_bridge: ExpressionBridge::new(),
            lip_sync_feed: LipSyncFeed::new(),
            state_binding: AvatarStateBinding::new(),
            frame_count: 0,
            target_fps: 60,
        }
    }

    /// Créer avec profil personnalisé
    pub fn with_profile(profile: BodyProfile) -> Self {
        let mut skeleton = SkeletonModel::new(profile);
        skeleton.apply_default_posture();

        Self {
            skeleton,
            motion_layer: MotionLayer::new(),
            expression_bridge: ExpressionBridge::new(),
            lip_sync_feed: LipSyncFeed::new(),
            state_binding: AvatarStateBinding::new(),
            frame_count: 0,
            target_fps: 60,
        }
    }

    /// Avancer d'une frame (appelé à 60 FPS)
    pub fn advance_frame(&mut self) {
        let delta_ms = 1000 / self.target_fps;

        // 1. Avancer animation gestuelle
        self.motion_layer.advance_frame(delta_ms);

        // 2. Ajuster gestes selon lip-sync
        self.lip_sync_feed
            .adjust_body_motion(&mut self.motion_layer);

        // 3. Ajuster selon état cognitif
        self.state_binding
            .adjust_motion_for_state(&mut self.motion_layer);

        // 4. Appliquer au squelette
        self.motion_layer.apply_to_skeleton(&mut self.skeleton);

        self.frame_count += 1;
    }

    /// Activer un geste manuellement
    pub fn activate_gesture(&mut self, gesture_name: &str) {
        self.motion_layer.activate_gesture(gesture_name);
    }

    /// Mettre à jour expression faciale
    pub fn update_expression(&mut self, expression: FacialExpression, intensity: f32) {
        self.expression_bridge
            .update_expression(expression, intensity);

        // Mapper expression → geste corporel si applicable
        if let Some(gesture_name) = self.expression_bridge.map_to_body_gesture() {
            self.motion_layer.activate_gesture(&gesture_name);
        }
    }

    /// Mettre à jour lip-sync
    pub fn update_lipsync(&mut self, phoneme: String, morph_weights: [f32; 4]) {
        self.lip_sync_feed
            .update_from_lipsync(phoneme, morph_weights);
    }

    /// Mettre à jour état SingularityState
    pub fn update_state(&mut self, snapshot: AvatarStateSnapshot) {
        self.state_binding.update_from_state(snapshot);
    }

    /// Réaction wake-word "TITANE"
    pub fn on_wake_word(&mut self) {
        self.motion_layer.activate_gesture("attention_shift");
        // Expression faciale + halo (géré par ExpressionModel v23)
    }

    /// Exporter snapshot skeleton (pour rendu frontend)
    pub fn export_skeleton_snapshot(&self) -> SkeletonSnapshot {
        SkeletonSnapshot {
            bones: self.skeleton.bones.clone(),
            frame: self.frame_count,
            timestamp_ms: self.frame_count * (1000 / self.target_fps as u64),
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// SKELETON SNAPSHOT — Exportation pour frontend
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkeletonSnapshot {
    pub bones: HashMap<String, BoneTransform>,
    pub frame: u64,
    pub timestamp_ms: u64,
}

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL INSTANCE (Thread-Safe)
// ═══════════════════════════════════════════════════════════════════════════

lazy_static::lazy_static! {
    static ref FULLBODY_ENGINE: Arc<Mutex<FullBodyAvatarEngine>> =
        Arc::new(Mutex::new(FullBodyAvatarEngine::new()));
}

/// Accès global thread-safe au moteur
pub fn get_fullbody_engine() -> Arc<Mutex<FullBodyAvatarEngine>> {
    FULLBODY_ENGINE.clone()
}
