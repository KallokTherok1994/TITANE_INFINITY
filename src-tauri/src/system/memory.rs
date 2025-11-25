// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v14 — COMPAT: Memory module stub
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryEntry {
    pub content: String,
    pub timestamp: u64,
}

pub fn save_entry(_entry: MemoryEntry) -> Result<(), String> {
    Ok(())
}

pub fn load_entries() -> Result<Vec<MemoryEntry>, String> {
    Ok(Vec::new())
}

pub fn clear_memory() -> Result<(), String> {
    Ok(())
}

pub fn get_memory_state() -> Result<String, String> {
    Ok("Memory stub active".to_string())
}
