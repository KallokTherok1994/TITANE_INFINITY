// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1 — DEVTOOLS OS MODULE
//   Système de télémétrie, logs, métriques, debugging, analyse
//   Super Prompt #9: Observabilité complète et outils développeur
// ═══════════════════════════════════════════════════════════════

// Core DevTools
pub mod docs_commands;
pub mod docs_engine;
pub mod logging;
pub mod metrics;
pub mod telemetry;

// DevTools OS v20.1 — Super Prompt #9
pub mod analyzer;
pub mod api;
pub mod debugger;
pub mod memory_inspector;

// Re-exports — Core
pub use docs_commands::*;
pub use docs_engine::{CommandCategory, CommandDoc, DocsEngine, DOCS_ENGINE};
pub use logging::*;
pub use metrics::*;
pub use telemetry::*;

// Re-exports — DevTools OS
pub use analyzer::{AnalyzerEngine, AnalyzerReport, AnalyzerWarning, Severity};
pub use debugger::{DebugEventType, DebuggerEvent, DebuggerStats, LiveDebugger};
pub use memory_inspector::{MemoryEntry, MemoryHealthReport, MemoryInspector, MemorySystemStats};
