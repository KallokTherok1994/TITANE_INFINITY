// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v14 — LEGACY COMPATIBILITY
//   Backward compatibility adapters for old API
// ═══════════════════════════════════════════════════════════════

use crate::types::{
    ChatInteraction, DecisionSummary, HeliosState, KnowledgeEntry, LogEntry,
    MemoryState as TypesMemoryState, ProjectSummary, RitualInfo, Snapshot, TimelineEntry,
    TimelineEvent,
};
use crate::utils::AppResult;

/// Legacy HeliosCore adapter
#[derive(Clone)]
pub struct HeliosCore;

impl Default for HeliosCore {
    fn default() -> Self {
        Self::new()
    }
}

impl HeliosCore {
    pub fn new() -> Self {
        Self
    }

    pub async fn collect(&self) -> AppResult<HeliosState> {
        // Return default HeliosState for compatibility
        Ok(HeliosState::default())
    }
}

/// Legacy MemoryCore adapter with stub methods
#[derive(Clone)]
pub struct MemoryCore;

impl Default for MemoryCore {
    fn default() -> Self {
        Self::new()
    }
}

impl MemoryCore {
    pub fn new() -> Self {
        Self
    }

    pub async fn get_state(&self) -> AppResult<TypesMemoryState> {
        use std::time::{SystemTime, UNIX_EPOCH};
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_millis() as i64)
            .unwrap_or(0); // Fallback si l'horloge système est avant UNIX_EPOCH

        Ok(TypesMemoryState {
            snapshots_count: 0,
            log_entries_count: 0,
            timeline_events: 0,
            storage_size_mb: 0.0,
            timestamp: now,
        })
    }

    pub async fn write_snapshot(&self, _data: Snapshot) -> AppResult<()> {
        Ok(())
    }

    pub async fn read_snapshot(&self) -> AppResult<Option<Snapshot>> {
        Ok(None)
    }

    pub async fn write_log(&self, _log: LogEntry) -> AppResult<()> {
        Ok(())
    }

    pub async fn read_logs(&self, _count: usize) -> AppResult<Vec<LogEntry>> {
        Ok(Vec::new())
    }

    pub async fn add_event(&self, _event: TimelineEvent) -> AppResult<()> {
        Ok(())
    }

    pub async fn get_active_projects(&self) -> AppResult<Vec<ProjectSummary>> {
        Ok(Vec::new())
    }

    pub async fn get_recent_decisions(&self, _count: usize) -> AppResult<Vec<DecisionSummary>> {
        Ok(Vec::new())
    }

    pub async fn get_knowledge(&self) -> AppResult<Vec<KnowledgeEntry>> {
        Ok(Vec::new())
    }

    pub async fn get_active_rituals(&self) -> AppResult<Vec<RitualInfo>> {
        Ok(Vec::new())
    }

    pub async fn get_timeline(&self, _limit: usize) -> AppResult<Vec<TimelineEntry>> {
        Ok(Vec::new())
    }

    pub async fn save_chat_interaction(&self, _interaction: ChatInteraction) -> AppResult<()> {
        Ok(())
    }
}

/// Legacy NexusCore adapter
#[derive(Clone)]
pub struct NexusCore;

impl Default for NexusCore {
    fn default() -> Self {
        Self::new()
    }
}

impl NexusCore {
    pub fn new() -> Self {
        Self
    }

    pub async fn validate(&self) -> AppResult<bool> {
        Ok(true)
    }
}

/// Legacy HarmoniaCore adapter
#[derive(Clone)]
pub struct HarmoniaCore;

impl Default for HarmoniaCore {
    fn default() -> Self {
        Self::new()
    }
}

impl HarmoniaCore {
    pub fn new() -> Self {
        Self
    }

    pub async fn balance(&self) -> AppResult<f32> {
        Ok(1.0)
    }
}

/// Legacy SentinelCore adapter
#[derive(Clone)]
pub struct SentinelCore;

impl Default for SentinelCore {
    fn default() -> Self {
        Self::new()
    }
}

impl SentinelCore {
    pub fn new() -> Self {
        Self
    }

    pub fn iter(&self) -> std::iter::Empty<String> {
        std::iter::empty()
    }
}
