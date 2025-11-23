// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — CORE MODULE
//   Legacy core module exports (Phase 2 cleanup - kept for compatibility)
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests_integration;  // Integration tests for old CoreModule system

// Note: Core implementations migrated to plugin_system/cores/
// This module kept for backward compatibility with old code

// Type alias for Memory Module
pub type MemoryCore = crate::plugin_system::cores::MemoryModule;
