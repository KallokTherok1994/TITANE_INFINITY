// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — API: MEMORY
//   Storage & Timeline Commands
// ═══════════════════════════════════════════════════════════════

use crate::{
    core::MemoryCore,
    memory::telemetry,
    types::{
        ChatInteraction, DecisionSummary, KnowledgeEntry, LogEntry, MemoryDirectoryReport,
        MemoryState, ProjectSummary, RitualInfo, Snapshot, TimelineEntry, TimelineEvent,
    },
    utils::AppResult,
};
use chrono::Utc;
use serde::Serialize;

#[tauri::command]
pub async fn get_memory_state(memory: tauri::State<'_, MemoryCore>) -> AppResult<MemoryState> {
    let state = memory.get_state().await?;
    if !state.synthetic_mode {
        log::debug!(
            target: "memory",
            "get_memory_state disk_mode={:?} synthetic={} issues={}",
            state.disk_mode,
            state.synthetic_mode,
            state.issues.len()
        );
    }
    Ok(state)
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
pub async fn write_log(memory: tauri::State<'_, MemoryCore>, log: LogEntry) -> AppResult<()> {
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

// ═══════════════════════════════════════════════════════════════
// COMMANDES CHAT IA ↔ MEMORY CORE (v17.3.0)
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Serialize)]
pub struct ChatInteractionAck {
    status: &'static str,
    saved: bool,
    timestamp_ms: i64,
}

impl ChatInteractionAck {
    fn success() -> Self {
        Self {
            status: "ok",
            saved: true,
            timestamp_ms: Utc::now().timestamp_millis(),
        }
    }
}

/// Récupère les projets actifs pour contexte chat
#[tauri::command]
pub async fn memory_get_active_projects(
    memory: tauri::State<'_, MemoryCore>,
    limit: usize,
) -> AppResult<Vec<ProjectSummary>> {
    memory.get_active_projects(limit).await
}

/// Récupère les décisions récentes
#[tauri::command]
pub async fn memory_get_recent_decisions(
    memory: tauri::State<'_, MemoryCore>,
    limit: usize,
    time_window: String,
) -> AppResult<Vec<DecisionSummary>> {
    memory.get_recent_decisions(limit, &time_window).await
}

/// Récupère les connaissances pertinentes
#[tauri::command]
pub async fn memory_get_knowledge(
    memory: tauri::State<'_, MemoryCore>,
    limit: usize,
) -> AppResult<Vec<KnowledgeEntry>> {
    memory.get_knowledge(limit).await
}

/// Récupère les rituels actifs
#[tauri::command]
pub async fn memory_get_active_rituals(
    memory: tauri::State<'_, MemoryCore>,
) -> AppResult<Vec<RitualInfo>> {
    memory.get_active_rituals().await
}

/// Récupère la timeline récente
#[tauri::command]
pub async fn memory_get_timeline(
    memory: tauri::State<'_, MemoryCore>,
    time_window: String,
) -> AppResult<Vec<TimelineEntry>> {
    memory.get_timeline(&time_window).await
}

/// Sauvegarde une interaction chat dans Memory Core
#[tauri::command]
pub async fn memory_save_chat_interaction(
    memory: tauri::State<'_, MemoryCore>,
    interaction: ChatInteraction,
) -> AppResult<ChatInteractionAck> {
    memory.save_chat_interaction(interaction).await?;
    Ok(ChatInteractionAck::success())
}

/// Debug helper exposing the memory/ directory scan (Phase Ω.6)
#[tauri::command]
pub async fn memory_debug_scan() -> AppResult<MemoryDirectoryReport> {
    let report = telemetry::scan_memory_directory();
    log::info!(
        target: "memory",
        "memory_debug_scan path={} files={} size_bytes={}",
        report.base_path,
        report.files.len(),
        report.total_size_bytes
    );
    Ok(report)
}
