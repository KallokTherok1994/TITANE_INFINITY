// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v19.8 - MODULE QA
//   Système de tests automatisés et self-tests vivants
// ═══════════════════════════════════════════════════════════════

pub mod live_selftest;
pub mod qa_commands;
pub mod qa_engine;

pub use live_selftest::{
    LiveSelfTestEngine, MicroTestResult, RepairAttempt, SignalSeverity, TestStatus, UrgentReport,
    WatchdogSignal,
};
pub use qa_commands::QaState;
pub use qa_engine::{QaEngine, QaReport, QaResult, QaStatus, QaSubResult, QaSummary};
