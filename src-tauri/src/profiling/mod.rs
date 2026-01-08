// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v27.0.0 — Profiling Module (DEPRECATED)
//   Performance monitoring and metrics collection
//   ⚠️ This module is deprecated. Use crate::monitoring::metrics instead.
// ═══════════════════════════════════════════════════════════════

// Re-export from monitoring/metrics for backward compatibility
pub use crate::monitoring::metrics::ipc_profiler::{
    get_ipc_metrics, get_ipc_summary, reset_ipc_metrics, CommandMetrics, IPCProfiler,
    ProfileGuard, ProfilerSummary,
};

// Deprecated re-export of ipc_profiler module
#[deprecated(
    since = "27.0.0",
    note = "Use crate::monitoring::metrics::ipc_profiler instead"
)]
pub use crate::monitoring::metrics::ipc_profiler;
