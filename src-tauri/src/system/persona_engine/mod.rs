// ═══════════════════════════════════════════════════════════════════════════
// TITANE∞ v24 — PERSONA ENGINE (Rust Backend)
// Non-anthropomorphic personality system with mood, behavior, and memory
// ═══════════════════════════════════════════════════════════════════════════

pub mod commands;

use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & STRUCTURES
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PersonalityTraits {
    pub calm: f32,          // 0.0 - 1.0
    pub precise: f32,       // 0.0 - 1.0
    pub analytical: f32,    // 0.0 - 1.0
    pub stable: f32,        // 0.0 - 1.0
    pub responsive: f32,    // 0.0 - 1.0
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Temperament {
    Serene,
    Focused,
    Alert,
    Dormant,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PersonalityCore {
    pub traits: PersonalityTraits,
    pub temperament: Temperament,
    pub evolution: f32, // Ultra-slow evolution rate
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Mood {
    Clair,      // Clear, lucid
    Vibrant,    // Energetic, active
    Attentif,   // Attentive, focused
    Alerte,     // Alert, vigilant
    Neutre,     // Neutral, baseline
    Dormant,    // Dormant, low-energy
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MoodState {
    pub current: Mood,
    pub intensity: f32,     // 0.0 - 1.0
    pub duration: u64,      // milliseconds
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Posture {
    Attentive,
    Relaxed,
    Vigilant,
    Minimal,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehaviorState {
    pub posture: Posture,
    pub active_reactions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VisualMultipliers {
    pub glow: f32,
    pub motion: f32,
    pub sound: f32,
    pub depth: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PersonaState {
    pub personality: PersonalityCore,
    pub mood: MoodState,
    pub behavior: BehaviorState,
    pub presence_level: f32,        // 0.0 - 1.0
    pub visual_multipliers: VisualMultipliers,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemMetrics {
    pub cpu: f32,
    pub memory: f32,
    pub errors: u32,
}

// ═══════════════════════════════════════════════════════════════════════════
// PERSONA ENGINE
// ═══════════════════════════════════════════════════════════════════════════

pub struct PersonaEngine {
    state: Arc<Mutex<PersonaState>>,
}

impl PersonaEngine {
    pub fn new() -> Self {
        let default_state = PersonaState {
            personality: PersonalityCore {
                traits: PersonalityTraits {
                    calm: 0.85,
                    precise: 0.92,
                    analytical: 0.88,
                    stable: 0.90,
                    responsive: 0.78,
                },
                temperament: Temperament::Focused,
                evolution: 0.0001, // Ultra-slow
            },
            mood: MoodState {
                current: Mood::Neutre,
                intensity: 0.6,
                duration: 0,
            },
            behavior: BehaviorState {
                posture: Posture::Relaxed,
                active_reactions: Vec::new(),
            },
            presence_level: 0.68,
            visual_multipliers: VisualMultipliers {
                glow: 1.0,
                motion: 1.0,
                sound: 0.5,
                depth: 0.5,
            },
            timestamp: Self::current_timestamp(),
        };

        Self {
            state: Arc::new(Mutex::new(default_state)),
        }
    }

    fn current_timestamp() -> u64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64
    }

    pub fn get_state(&self) -> PersonaState {
        self.state.lock().unwrap().clone()
    }

    pub fn update(&self, system_state: &str, metrics: SystemMetrics) {
        let mut state = self.state.lock().unwrap();
        
        // Update mood based on system state
        state.mood.current = match system_state {
            "stable" => Mood::Clair,
            "processing" => Mood::Vibrant,
            "warning" => Mood::Attentif,
            "danger" => Mood::Alerte,
            "offline" => Mood::Dormant,
            _ => Mood::Neutre,
        };

        // Update mood intensity based on metrics
        let stress = (metrics.cpu + metrics.memory + metrics.errors as f32 * 10.0) / 220.0;
        state.mood.intensity = 0.4 + stress * 0.6;

        // Update temperament based on stress
        state.personality.temperament = if stress > 0.8 {
            Temperament::Alert
        } else if stress > 0.5 {
            Temperament::Focused
        } else if stress < 0.2 {
            Temperament::Dormant
        } else {
            Temperament::Serene
        };

        // Update posture based on system state
        state.behavior.posture = match system_state {
            "danger" | "warning" => Posture::Vigilant,
            "processing" => Posture::Attentive,
            "stable" => Posture::Relaxed,
            _ => Posture::Minimal,
        };

        // Calculate visual multipliers
        let mood_mult = match state.mood.current {
            Mood::Alerte => 1.5,
            Mood::Attentif => 1.3,
            Mood::Vibrant => 1.2,
            Mood::Clair => 1.1,
            Mood::Neutre => 1.0,
            Mood::Dormant => 0.8,
        };

        let temp_mult = match state.personality.temperament {
            Temperament::Alert => 1.3,
            Temperament::Focused => 1.1,
            Temperament::Serene => 1.0,
            Temperament::Dormant => 0.7,
        };

        state.visual_multipliers.glow = mood_mult * temp_mult * 0.9;
        state.visual_multipliers.motion = mood_mult * 0.9;
        state.visual_multipliers.sound = state.mood.intensity * 0.8 + 0.2;
        state.visual_multipliers.depth = state.mood.intensity * 0.6 + 0.3;

        // Update presence level
        state.presence_level = (state.mood.intensity + state.visual_multipliers.glow - 1.0) * 0.5 + 0.5;
        state.presence_level = state.presence_level.max(0.3).min(1.0);

        state.timestamp = Self::current_timestamp();
    }

    pub fn react(&self, reaction_type: &str) {
        let mut state = self.state.lock().unwrap();
        
        match reaction_type {
            "error" => {
                state.mood.current = Mood::Alerte;
                state.mood.intensity = 1.0;
                state.behavior.posture = Posture::Vigilant;
                state.visual_multipliers.glow = 1.5;
            }
            "success" => {
                state.mood.current = Mood::Vibrant;
                state.mood.intensity = 0.8;
                state.behavior.posture = Posture::Attentive;
                state.visual_multipliers.glow = 1.3;
            }
            "warning" => {
                state.mood.current = Mood::Attentif;
                state.mood.intensity = 0.7;
                state.behavior.posture = Posture::Vigilant;
                state.visual_multipliers.glow = 1.2;
            }
            "idle" => {
                state.mood.current = Mood::Dormant;
                state.mood.intensity = 0.3;
                state.behavior.posture = Posture::Minimal;
                state.visual_multipliers.glow = 0.8;
            }
            _ => {}
        }

        state.timestamp = Self::current_timestamp();
    }

    pub fn reset(&self) {
        let mut state = self.state.lock().unwrap();
        state.mood = MoodState {
            current: Mood::Neutre,
            intensity: 0.6,
            duration: 0,
        };
        state.behavior = BehaviorState {
            posture: Posture::Relaxed,
            active_reactions: Vec::new(),
        };
        state.presence_level = 0.68;
        state.visual_multipliers = VisualMultipliers {
            glow: 1.0,
            motion: 1.0,
            sound: 0.5,
            depth: 0.5,
        };
        state.timestamp = Self::current_timestamp();
    }
}

impl Default for PersonaEngine {
    fn default() -> Self {
        Self::new()
    }
}
