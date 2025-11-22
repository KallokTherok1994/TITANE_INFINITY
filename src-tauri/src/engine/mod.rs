// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — ENGINE MODULE
//   Auto-Evolution System
// ═══════════════════════════════════════════════════════════════

pub mod auto_evolution;
pub mod diagnostics;
pub mod repair;
pub mod health_check;

pub use auto_evolution::AutoEvolutionEngine;
pub use diagnostics::DiagnosticsEngine;
pub use repair::RepairEngine;
pub use health_check::HealthCheckEngine;
