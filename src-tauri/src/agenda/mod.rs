// ═══════════════════════════════════════════════════════════════════
// TITANE∞ v∞ — AGENDA ENGINE (Rust Backend)
// Gestion de l'agenda et des événements côté Tauri
// ═══════════════════════════════════════════════════════════════════
//
// Architecture:
// - Stockage local JSON des événements
// - CRUD complet (Create, Read, Update, Delete)
// - Validation des données
// - Synchronisation avec le frontend

pub mod commands;
pub mod storage;
pub mod types;

pub use commands::*;
pub use storage::*;
pub use types::*;
