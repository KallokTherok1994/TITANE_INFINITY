// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v19.5.2 — IPC Module
//   P2-1 Phase 4: Cache + Profiling + Command Wrappers
// ═══════════════════════════════════════════════════════════════

pub mod cache;
pub mod cached_commands;

pub use cache::{CacheStats, IPCCache};
pub use cached_commands::{FAST_CACHE, MEDIUM_CACHE, SLOW_CACHE};
