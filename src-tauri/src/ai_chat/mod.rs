// TITANE∞ v∞ - AI Chat & Training Module
// Système d'entraînement IA et commandes de chat
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════════════════════
// OPUS #12 — AI TRAINING MODE
// ═══════════════════════════════════════════════════════════════════════════════

pub mod training_engine;
pub mod training_commands;

pub use training_engine::{AITrainingEngine, TrainingMode, TrainingState, AI_TRAINING_ENGINE};
pub use training_commands::*;

/// Initialiser le module AI Training
pub fn init_ai_training() {
    log::info!("[AIChat] 🧠 AI Training Module initialized");
    log::info!("[AIChat] ⚠️ Training mode requires Kevin verification");
}
