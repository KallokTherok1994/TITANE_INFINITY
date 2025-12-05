// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   TIME MODULE — Super-Prompt N
//   Snapshots, Backups, Time-Travel, Redundancy
// ═══════════════════════════════════════════════════════════════

pub mod backup_engine;
pub mod snapshot;
pub mod travel_engine;

pub use backup_engine::BackupEngine;
pub use snapshot::{Snapshot, SnapshotMetadata};
pub use travel_engine::TravelEngine;
