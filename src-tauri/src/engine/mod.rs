// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — ENGINE MODULE
//   Auto-Evolution System
// ═══════════════════════════════════════════════════════════════

pub mod auto_evolution;
pub mod diagnostics;
pub mod health_check;
pub mod repair;

pub use auto_evolution::AutoEvolutionEngine;
pub use diagnostics::DiagnosticsEngine;
pub use health_check::HealthCheckEngine;
pub use repair::RepairEngine;
