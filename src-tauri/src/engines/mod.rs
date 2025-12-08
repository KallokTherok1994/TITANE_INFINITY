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
pub use qa_engine::{
    QAEngineState,
    QATestResult,
    QASeverity,
    QATestSuite,
    QAReport,
    SystemInfo,
};

// Monitoring Engine exports
pub use monitoring_engine::{
    MonitoringState,
    SystemMetricsRealtime,
    EngineHeartbeat,
    DetectedAnomaly,
    HealthStatus,
    MonitoringConfig,
    MetricsHistory,
    MetricsDataPoint,
};

// Developer Mode exports
pub use developer_mode::{
    DeveloperModeState,
    PatchAction,
    PatchResult,
    PatchType,
    ChangeSeverity,
    PatchChange,
    PatchMetadata,
    PatchHistory,
    SecurityValidation,
    DiffPreview,
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
