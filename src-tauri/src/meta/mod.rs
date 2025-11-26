// TITANE∞ v18 — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

//! META-COGNITION & DEEP SYNC LAYER
//!
//! This module implements the highest-level cognitive supervision:
//! - Meta-cognition: self-evaluation, anomaly detection, cognitive regulation
//! - Deep Sync: multi-engine synchronization, coherence validation, drift prevention

pub mod meta_cognition;
pub mod deep_sync_engine;
pub mod commands;

pub use meta_cognition::{
    MetaCognitionEngine, MetaCognitiveReport, DeepSyncAction, CognitiveRegulationStrategy,
    CognitiveSnapshot, MetaCognitionState, CognitiveHealthIndicators,
};
pub use deep_sync_engine::{
    DeepSyncEngine, DeepSyncState, SyncedState, EngineAlignment, SyncQuality, EngineState,
};

pub use commands::{
    SelfTestReport,
};

// Re-export commands with __cmd__ prefix for Tauri
pub use commands::{
    meta_get_report,
    meta_trigger_sync,
    meta_get_alignment,
    meta_get_state,
    meta_selftest_all,
    __cmd__meta_get_report,
    __cmd__meta_trigger_sync,
    __cmd__meta_get_alignment,
    __cmd__meta_get_state,
    __cmd__meta_selftest_all,
};
