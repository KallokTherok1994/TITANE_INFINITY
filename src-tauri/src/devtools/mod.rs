// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1 — DEVTOOLS OS MODULE
//   Système de télémétrie, logs, métriques, debugging, analyse
//   Super Prompt #9: Observabilité complète et outils développeur
// ═══════════════════════════════════════════════════════════════

// Core DevTools
pub mod logging;
pub mod metrics;
pub mod telemetry;
pub mod docs_engine;
pub mod docs_commands;

// DevTools OS v20.1 — Super Prompt #9
pub mod debugger;
pub mod memory_inspector;
pub mod analyzer;
pub mod api;

// Re-exports — Core
pub use logging::*;
pub use metrics::*;
pub use telemetry::*;
pub use docs_engine::{DocsEngine, CommandDoc, CommandCategory, DOCS_ENGINE};
pub use docs_commands::*;

// Re-exports — DevTools OS
pub use debugger::{LiveDebugger, DebuggerEvent, DebugEventType, DebuggerStats};
pub use memory_inspector::{MemoryInspector, MemoryEntry, MemorySystemStats, MemoryHealthReport};
pub use analyzer::{AnalyzerEngine, AnalyzerReport, AnalyzerWarning, Severity};
