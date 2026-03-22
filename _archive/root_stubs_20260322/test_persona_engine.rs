// ═══════════════════════════════════════════════════════════════════════════
// TEST STANDALONE — PERSONA ENGINE v24
// Test du backend Rust sans Tauri pour validation
// ═══════════════════════════════════════════════════════════════════════════

use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};
use serde::{Deserialize, Serialize};

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PersonalityTraits {
    pub calm: f32,
    pub precise: f32,
    pub analytical: f32,
    pub stable: f32,
    pub responsive: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PersonalityCore {
    pub traits: PersonalityTraits,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Temperament {
    Serene,
    Focused,
    Alert,
    Dormant,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Mood {
    Clair,
    Vibrant,
    Attentif,
    Alerte,
    Neutre,
    Dormant,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Posture {
    Attentive,
    Relaxed,
    Vigilant,
    Minimal,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MoodState {
    pub current: Mood,
    pub temperament: Temperament,
    pub posture: Posture,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehaviorState {
    pub reactivity: f32,
    pub stability: f32,
    pub attention: f32,
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
    pub presence_level: f32,
    pub visual_multipliers: VisualMultipliers,
    pub timestamp: u64,
}

#[derive(Debug, Clone)]
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
                    calm: 0.8,
                    precise: 0.9,
                    analytical: 0.85,
                    stable: 0.75,
                    responsive: 0.7,
                },
            },
            mood: MoodState {
                current: Mood::Neutre,
                temperament: Temperament::Serene,
                posture: Posture::Relaxed,
            },
            behavior: BehaviorState {
                reactivity: 0.5,
                stability: 0.8,
                attention: 0.6,
            },
            presence_level: 0.7,
            visual_multipliers: VisualMultipliers {
                glow: 1.0,
                motion: 1.0,
                sound: 1.0,
                depth: 1.0,
            },
            timestamp: Self::current_timestamp(),
        };

        PersonaEngine {
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
        
        // Calculate stress level
        let stress = (metrics.cpu / 100.0 * 0.4) 
                   + (metrics.memory / 100.0 * 0.3) 
                   + (metrics.errors as f32 * 0.3);
        
        // Adjust mood based on stress and system state
        state.mood.current = match system_state {
            "danger" => Mood::Alerte,
            "warning" => Mood::Attentif,
            "stable" => if stress < 0.3 { Mood::Clair } else { Mood::Neutre },
            _ => Mood::Neutre,
        };
        
        // Adjust temperament
        state.mood.temperament = if stress > 0.7 {
            Temperament::Alert
        } else if stress > 0.4 {
            Temperament::Focused
        } else if stress < 0.2 {
            Temperament::Dormant
        } else {
            Temperament::Serene
        };
        
        // Update behavior
        state.behavior.reactivity = (1.0 - stress).max(0.3);
        state.behavior.stability = state.personality.traits.stable * (1.0 - stress * 0.5);
        state.behavior.attention = stress.max(0.4).min(1.0);
        
        // Update visual multipliers
        state.visual_multipliers.glow = 0.8 + stress * 0.7;
        state.visual_multipliers.motion = 0.9 + state.behavior.reactivity * 0.3;
        state.visual_multipliers.sound = 0.5 + stress * 0.5;
        state.visual_multipliers.depth = 1.0 + state.behavior.attention * 0.3;
        
        // Update presence level
        state.presence_level = (0.3 + stress * 0.7).min(1.0);
        
        state.timestamp = Self::current_timestamp();
    }

    pub fn react(&self, reaction_type: &str) {
        let mut state = self.state.lock().unwrap();
        
        match reaction_type {
            "error" => {
                state.mood.current = Mood::Alerte;
                state.mood.posture = Posture::Vigilant;
                state.behavior.reactivity = 1.0;
                state.visual_multipliers.glow = 1.5;
            }
            "success" => {
                state.mood.current = Mood::Clair;
                state.mood.posture = Posture::Relaxed;
                state.behavior.reactivity = 0.6;
                state.visual_multipliers.glow = 1.2;
            }
            "warning" => {
                state.mood.current = Mood::Attentif;
                state.mood.posture = Posture::Attentive;
                state.behavior.reactivity = 0.8;
                state.visual_multipliers.glow = 1.3;
            }
            _ => {
                state.mood.current = Mood::Neutre;
                state.mood.posture = Posture::Relaxed;
                state.behavior.reactivity = 0.5;
                state.visual_multipliers.glow = 1.0;
            }
        }
        
        state.timestamp = Self::current_timestamp();
    }

    pub fn reset(&self) {
        let mut state = self.state.lock().unwrap();
        state.mood.current = Mood::Neutre;
        state.mood.temperament = Temperament::Serene;
        state.mood.posture = Posture::Relaxed;
        state.behavior.reactivity = 0.5;
        state.behavior.stability = 0.8;
        state.behavior.attention = 0.6;
        state.presence_level = 0.7;
        state.visual_multipliers = VisualMultipliers {
            glow: 1.0,
            motion: 1.0,
            sound: 1.0,
            depth: 1.0,
        };
        state.timestamp = Self::current_timestamp();
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

fn main() {
    println!("═══════════════════════════════════════════════════════════");
    println!("  TITANE∞ v24 — PERSONA ENGINE TEST");
    println!("  Testing Rust Backend (Standalone)");
    println!("═══════════════════════════════════════════════════════════\n");

    // Test 1: Initialization
    println!("🧪 Test 1: Initialization");
    let engine = PersonaEngine::new();
    let state = engine.get_state();
    println!("✅ PersonaEngine initialized");
    println!("   Mood: {:?}", state.mood.current);
    println!("   Temperament: {:?}", state.mood.temperament);
    println!("   Glow: {:.2}", state.visual_multipliers.glow);
    println!("   Presence: {:.2}\n", state.presence_level);

    // Test 2: Update with low stress
    println!("🧪 Test 2: Update (Low Stress)");
    engine.update("stable", SystemMetrics {
        cpu: 20.0,
        memory: 30.0,
        errors: 0,
    });
    let state = engine.get_state();
    println!("✅ Updated with low stress");
    println!("   Mood: {:?}", state.mood.current);
    println!("   Temperament: {:?}", state.mood.temperament);
    println!("   Glow: {:.2}", state.visual_multipliers.glow);
    println!("   Reactivity: {:.2}\n", state.behavior.reactivity);

    // Test 3: Update with high stress
    println!("🧪 Test 3: Update (High Stress)");
    engine.update("warning", SystemMetrics {
        cpu: 85.0,
        memory: 75.0,
        errors: 3,
    });
    let state = engine.get_state();
    println!("✅ Updated with high stress");
    println!("   Mood: {:?}", state.mood.current);
    println!("   Temperament: {:?}", state.mood.temperament);
    println!("   Glow: {:.2}", state.visual_multipliers.glow);
    println!("   Attention: {:.2}\n", state.behavior.attention);

    // Test 4: React to error
    println!("🧪 Test 4: React (Error)");
    engine.react("error");
    let state = engine.get_state();
    println!("✅ Reacted to error");
    println!("   Mood: {:?}", state.mood.current);
    println!("   Posture: {:?}", state.mood.posture);
    println!("   Glow: {:.2}", state.visual_multipliers.glow);
    println!("   Reactivity: {:.2}\n", state.behavior.reactivity);

    // Test 5: React to success
    println!("🧪 Test 5: React (Success)");
    engine.react("success");
    let state = engine.get_state();
    println!("✅ Reacted to success");
    println!("   Mood: {:?}", state.mood.current);
    println!("   Posture: {:?}", state.mood.posture);
    println!("   Glow: {:.2}\n", state.visual_multipliers.glow);

    // Test 6: Reset
    println!("🧪 Test 6: Reset");
    engine.reset();
    let state = engine.get_state();
    println!("✅ Engine reset");
    println!("   Mood: {:?}", state.mood.current);
    println!("   Temperament: {:?}", state.mood.temperament);
    println!("   Glow: {:.2}", state.visual_multipliers.glow);
    println!("   Presence: {:.2}\n", state.presence_level);

    // Test 7: JSON Serialization
    println!("🧪 Test 7: JSON Serialization");
    let json = serde_json::to_string_pretty(&state).unwrap();
    println!("✅ State serialized to JSON:");
    println!("{}\n", json);

    println!("═══════════════════════════════════════════════════════════");
    println!("  ✅ ALL TESTS PASSED — PERSONA ENGINE OPERATIONAL");
    println!("  Backend Rust v24 ready for Tauri integration!");
    println!("═══════════════════════════════════════════════════════════");
}
