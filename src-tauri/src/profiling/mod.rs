// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v19.5.0 — Profiling Module
//   Performance monitoring and metrics collection
// ═══════════════════════════════════════════════════════════════

pub mod ipc_profiler;

pub use ipc_profiler::{
    CommandMetrics, IPCProfiler, ProfileGuard, ProfilerSummary,
};

// Re-export Tauri commands
pub use ipc_profiler::{
    get_ipc_metrics, 
    get_ipc_summary, 
    reset_ipc_metrics,
};
