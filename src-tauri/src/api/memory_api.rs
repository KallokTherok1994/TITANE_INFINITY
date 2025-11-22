// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — API: MEMORY
//   Storage & Timeline Commands
// ═══════════════════════════════════════════════════════════════

use crate::{
    core::MemoryCore,
    types::{MemoryState, Snapshot, LogEntry, TimelineEvent},
    utils::AppResult,
};

#[tauri::command]
pub async fn get_memory_state(memory: tauri::State<'_, MemoryCore>) -> AppResult<MemoryState> {
    memory.get_state().await
}

#[tauri::command]
pub async fn write_snapshot(
    memory: tauri::State<'_, MemoryCore>,
    snapshot: Snapshot,
) -> AppResult<()> {
    memory.write_snapshot(snapshot).await
}

#[tauri::command]
pub async fn read_snapshot(memory: tauri::State<'_, MemoryCore>) -> AppResult<Option<Snapshot>> {
    memory.read_snapshot().await
}

#[tauri::command]
pub async fn write_log(
    memory: tauri::State<'_, MemoryCore>,
    log: LogEntry,
) -> AppResult<()> {
    memory.write_log(log).await
}

#[tauri::command]
pub async fn read_logs(
    memory: tauri::State<'_, MemoryCore>,
    count: usize,
) -> AppResult<Vec<LogEntry>> {
    memory.read_logs(count).await
}

#[tauri::command]
pub async fn add_timeline_event(
    memory: tauri::State<'_, MemoryCore>,
    event: TimelineEvent,
) -> AppResult<()> {
    memory.add_event(event).await
}
