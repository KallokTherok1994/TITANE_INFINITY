// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — SERVICES MODULE
//   Technical isolation layer
// ═══════════════════════════════════════════════════════════════

pub mod fetch_service; // P2: WebResearch — single network gate
pub mod io_service;
pub mod network_policy; // P2: WebResearch — policy guard
pub mod storage_service;
pub mod system_service;

pub use storage_service::StorageService;
pub use system_service::SystemService;
