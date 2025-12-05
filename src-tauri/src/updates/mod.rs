// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   UPDATES MODULE — Super-Prompt L
//   Système de mise à jour sécurisé avec signatures Ed25519
// ═══════════════════════════════════════════════════════════════

pub mod manifest;
pub mod migration;
pub mod update_engine;

pub use manifest::{FileEntry, UpdateManifest};
pub use migration::MigrationScript;
pub use update_engine::UpdateEngine;
