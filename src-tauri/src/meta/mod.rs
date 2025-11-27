// TITANE∞ v18 — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

//! META-COGNITION & DEEP SYNC LAYER
//!
//! This module implements the highest-level cognitive supervision:
//! - Meta-cognition: self-evaluation, anomaly detection, cognitive regulation
//! - Deep Sync: multi-engine synchronization, coherence validation, drift prevention
//! - Monitoring: production metrics, alerting, historical tracking (v18.2)
//! - Auto-Healing: autonomous correction, rollback, recalibration (v18.2)

pub mod meta_cognition;
pub mod deep_sync_engine;
pub mod commands;
pub mod monitoring; // v18.2
pub mod auto_healing; // v18.2

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

// v18.2 exports
pub use monitoring::{
    MetaMonitoringEngine, MetaMonitoringMetrics, EvaluationHistoryEntry, SyncHistoryEntry,
    MetaAlert, AlertSeverity,
};
pub use auto_healing::{
    AutoHealingEngine, HealingActionResult, RecalibrationResult, CognitiveBackupSnapshot,
};

// Re-export commands with __cmd__ prefix for Tauri
pub use commands::{
    meta_get_report,
    meta_trigger_sync,
    meta_get_alignment,
    meta_get_state,
    meta_selftest_all,
    // v18.2 monitoring commands
    meta_get_monitoring_metrics,
    meta_get_evaluation_history,
    meta_get_sync_history,
    meta_get_alerts,
    meta_acknowledge_alert,
    // v18.2 auto-healing commands
    meta_set_auto_healing,
    meta_get_auto_healing_status,
    meta_get_healing_history,
    meta_get_recalibration_history,
    meta_trigger_recalibration,
    // Tauri command prefixes
    __cmd__meta_get_report,
    __cmd__meta_trigger_sync,
    __cmd__meta_get_alignment,
    __cmd__meta_get_state,
    __cmd__meta_selftest_all,
    __cmd__meta_get_monitoring_metrics,
    __cmd__meta_get_evaluation_history,
    __cmd__meta_get_sync_history,
    __cmd__meta_get_alerts,
    __cmd__meta_acknowledge_alert,
    __cmd__meta_set_auto_healing,
    __cmd__meta_get_auto_healing_status,
    __cmd__meta_get_healing_history,
    __cmd__meta_get_recalibration_history,
    __cmd__meta_trigger_recalibration,
};
