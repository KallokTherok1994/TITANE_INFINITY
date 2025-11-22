// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — CORE: MEMORY
//   Unified Storage - Snapshots, Logs, Timeline
// ═══════════════════════════════════════════════════════════════

use crate::{
    types::{MemoryState, Snapshot, LogEntry, TimelineEvent},
    services::StorageService,
    utils::{AppResult, log_info, MEMORY_MAX_SNAPSHOTS},
};
use chrono::Utc;
use std::sync::Arc;
use tokio::sync::RwLock;
use std::collections::VecDeque;

pub struct MemoryCore {
    snapshots: Arc<RwLock<VecDeque<Snapshot>>>,
    logs: Arc<RwLock<VecDeque<LogEntry>>>,
    timeline: Arc<RwLock<VecDeque<TimelineEvent>>>,
    storage: Arc<StorageService>,
}

impl MemoryCore {
    pub fn new(storage: StorageService) -> Self {
        Self {
            snapshots: Arc::new(RwLock::new(VecDeque::new())),
            logs: Arc::new(RwLock::new(VecDeque::new())),
            timeline: Arc::new(RwLock::new(VecDeque::new())),
            storage: Arc::new(storage),
        }
    }
    
    /// Write snapshot
    pub async fn write_snapshot(&self, snapshot: Snapshot) -> AppResult<()> {
        log_info("Memory", "Writing snapshot");
        
        let mut snapshots = self.snapshots.write().await;
        
        // Add new snapshot
        snapshots.push_back(snapshot.clone());
        
        // Keep only last N snapshots
        if snapshots.len() > MEMORY_MAX_SNAPSHOTS {
            snapshots.pop_front();
        }
        
        drop(snapshots); // Release lock before async operation
        
        // Persist to disk
        self.storage.save(&format!("snapshot_{}", snapshot.id), &snapshot).await?;
        
        Ok(())
    }
    
    /// Read latest snapshot
    pub async fn read_snapshot(&self) -> AppResult<Option<Snapshot>> {
        let snapshots = self.snapshots.read().await;
        Ok(snapshots.back().cloned())
    }
    
    /// Write log entry
    pub async fn write_log(&self, log: LogEntry) -> AppResult<()> {
        let mut logs = self.logs.write().await;
        
        logs.push_back(log);
        
        // Keep only last 1000 logs
        if logs.len() > 1000 {
            logs.pop_front();
        }
        
        Ok(())
    }
    
    /// Read logs
    pub async fn read_logs(&self, count: usize) -> AppResult<Vec<LogEntry>> {
        let logs = self.logs.read().await;
        
        let start = logs.len().saturating_sub(count);
        Ok(logs.iter().skip(start).cloned().collect())
    }
    
    /// Add timeline event
    pub async fn add_event(&self, event: TimelineEvent) -> AppResult<()> {
        let mut timeline = self.timeline.write().await;
        
        timeline.push_back(event);
        
        // Keep only last 500 events
        if timeline.len() > 500 {
            timeline.pop_front();
        }
        
        Ok(())
    }
    
    /// Get current state
    pub async fn get_state(&self) -> AppResult<MemoryState> {
        let snapshots = self.snapshots.read().await;
        let logs = self.logs.read().await;
        let timeline = self.timeline.read().await;
        
        Ok(MemoryState {
            snapshots_count: snapshots.len(),
            log_entries_count: logs.len(),
            timeline_events: timeline.len(),
            storage_size_mb: 0.0, // TODO: Calculate actual size
            timestamp: Utc::now().timestamp(),
        })
    }
}
