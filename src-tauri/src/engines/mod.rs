// ═══════════════════════════════════════════════════════════════════════════════
// TITANE INFINITY - ENGINES MODULE v∞
// ═══════════════════════════════════════════════════════════════════════════════
// Description: Central orchestration of all TITANE engines
// Created: 2025 | License: MIT
// ═══════════════════════════════════════════════════════════════════════════════
//
// Architecture des Engines:
// ┌─────────────────────────────────────────────────────────────────┐
// │                    TITANE ENGINES CORE                          │
// ├─────────────────────────────────────────────────────────────────┤
// │  QA Engine        │ Tests automatisés, validation système      │
// │  Monitoring       │ Métriques CPU/RAM/IO, heartbeats           │
// │  Developer Mode   │ Auto-modification, patches sécurisés       │
// └─────────────────────────────────────────────────────────────────┘
//
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// MODULES - Core Engines
// ═══════════════════════════════════════════════════════════════════════════════

/// Unified Memory Engine v2 - Advanced STM/MTM/LTM architecture
///
/// Fonctionnalités:
/// - Short-Term Memory (FIFO bounded, 100 entries)
/// - Mid-Term Memory (rolling summaries, 300 entries)
/// - Long-Term Memory (Tantivy-ready, 10k+ entries)
/// - Vector Store (384D embeddings, kNN search)
/// - Semantic recall (hybrid lexical + vector)
/// - Auto-promotion (STM → MTM → LTM)
pub mod unified_memory;

/// Behavior Engine vΩ - Comportements Cognitifs Unifiés (Super Prompt #16)
///
/// Fonctionnalités:
/// - BehaviorProfile (modes: Coach, Meta, Analyst, Creative, Neutral)
/// - BehaviorRules (règles dynamiques)
/// - BehaviorState (état interne)
/// - Intent detection & Emotion signals
pub mod behavior;

/// Quantum Predictive Engine vΩ - Prédiction et anticipation (Super Prompt #20)
///
/// Fonctionnalités:
/// - PredictionModel (n-grams, transitions)
/// - PatternAnalyzer (détection de patterns comportementaux)
/// - ProbabilityEngine (inférence bayésienne)
/// - QuantumState (superposition de prédictions)
/// - IntentionDetector (détection d'intentions)
pub mod quantum;

/// Temporal Engine vΩ - Gestion temporelle et undo/redo (Super Prompt #22)
///
/// Fonctionnalités:
/// - SnapshotManager (LRU cache de snapshots)
/// - Timeline (historique linéaire)
/// - TemporalDiff (calcul des différences)
/// - Branches (timeline branching)
pub mod temporal;

/// QA Engine - Pipeline de tests et validation intégrale
///
/// Fonctionnalités:
/// - Tests système (CPU, RAM, réseau)
/// - Tests mémoire (leaks, fragmentation)
/// - Tests IA (inference, latence)
/// - Tests sécurité (vulnérabilités, audit)
/// - Tests UI (composants, responsive)
/// - Tests backend (API, BDD)
/// - Tests build (compilation, packaging)
/// - Tests cohérence (architecture, patterns)
/// - Tests latence (performance, throughput)
/// - Génération rapports QA complets
pub mod qa_engine;

/// Monitoring Engine - Surveillance système temps réel
///
/// Fonctionnalités:
/// - Collecte métriques (CPU, RAM, disque, threads)
/// - Heartbeats des engines
/// - Détection anomalies
/// - Santé globale système
/// - Alertes automatiques
pub mod monitoring_engine;

/// Developer Mode Engine - Auto-modification sécurisée
///
/// Fonctionnalités:
/// - Validation patches (syntaxe, sécurité)
/// - Application patches contrôlée
/// - Rollback automatique
/// - Backup/restore
/// - Audit trail complet
/// - Accès Kevin-only
pub mod developer_mode;

// ═══════════════════════════════════════════════════════════════════════════════
// RE-EXPORTS - API Publique
// ═══════════════════════════════════════════════════════════════════════════════

// QA Engine exports
pub use qa_engine::{QAEngineState, QAReport, QASeverity, QATestResult, QATestSuite, SystemInfo};

// Monitoring Engine exports
pub use monitoring_engine::{
    DetectedAnomaly, EngineHeartbeat, HealthStatus, MetricsDataPoint, MetricsHistory,
    MonitoringConfig, MonitoringState, SystemMetricsRealtime,
};

// Developer Mode exports
pub use developer_mode::{
    ChangeSeverity, DeveloperModeState, DiffPreview, PatchAction, PatchChange, PatchHistory,
    PatchMetadata, PatchResult, PatchType, SecurityValidation,
};

// Behavior Engine exports (Super Prompt #16)
pub use behavior::{
    BehaviorEngine, BehaviorMode, BehaviorProfile, BehaviorRules, BehaviorState, EmotionSignal,
    Intent,
};

// Quantum Predictive Engine exports (Super Prompt #20)
pub use quantum::{
    PredictedAction, Prediction, QuantumConfig, QuantumPredictiveEngine, QuantumStats, UserEvent,
};

// Temporal Engine exports (Super Prompt #22)
pub use temporal::{
    SnapshotInfo, StateSnapshot, TemporalConfig, TemporalDiff, TemporalEngine, TemporalResult,
    TemporalStats, Timeline,
};

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_qa_engine_state_creation() {
        let state = QAEngineState::default();
        assert!(state.initialized);
    }

    #[test]
    fn test_developer_mode_state_creation() {
        let state = DeveloperModeState::default();
        assert!(!state.enabled);
    }
}
