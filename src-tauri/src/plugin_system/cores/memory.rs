// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — PLUGIN SYSTEM: MEMORY MODULE
//   CoreModule Implementation - Unified Storage & Timeline
// ═══════════════════════════════════════════════════════════════

use crate::{
    plugin_system::{CoreModule, CoreStatus, CoreHealth, CoreResult, CoreError},
    types::{
        MemoryState, Snapshot, LogEntry, TimelineEvent,
        ProjectSummary, ProjectStatus, DecisionSummary, ImpactLevel,
        KnowledgeEntry, RitualInfo, TimelineEntry, TimelineEntryType,
        ChatInteraction,
    },
    services::StorageService,
    utils::{log_info, MEMORY_MAX_SNAPSHOTS},
};
use async_trait::async_trait;
use chrono::Utc;
use std::sync::Arc;
use tokio::sync::RwLock;
use std::collections::{VecDeque, HashMap};

// ═══════════════════════════════════════════════════════════════
//   MEMORY MODULE STRUCTURE
// ═══════════════════════════════════════════════════════════════

pub struct MemoryModule {
    name: String,
    version: String,
    status: Arc<RwLock<CoreStatus>>,

    // Storage collections
    snapshots: Arc<RwLock<VecDeque<Snapshot>>>,
    logs: Arc<RwLock<VecDeque<LogEntry>>>,
    timeline: Arc<RwLock<VecDeque<TimelineEvent>>>,

    // Persistence service
    storage: Arc<StorageService>,
}

// ═══════════════════════════════════════════════════════════════
//   IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════

impl MemoryModule {
    pub fn new(storage: StorageService) -> Self {
        Self {
            name: "Memory".to_string(),
            version: "17.2.0".to_string(),
            status: Arc::new(RwLock::new(CoreStatus::Stopped)),
            snapshots: Arc::new(RwLock::new(VecDeque::new())),
            logs: Arc::new(RwLock::new(VecDeque::new())),
            timeline: Arc::new(RwLock::new(VecDeque::new())),
            storage: Arc::new(storage),
        }
    }

    // ───────────────────────────────────────────────────────────
    //   BUSINESS METHODS
    // ───────────────────────────────────────────────────────────

    /// Write snapshot to memory and persist
    pub async fn write_snapshot(&self, snapshot: Snapshot) -> CoreResult<()> {
        log_info("MemoryModule", "Writing snapshot");

        let mut snapshots = self.snapshots.write().await;

        // Add new snapshot
        snapshots.push_back(snapshot.clone());

        // Keep only last N snapshots (circular buffer)
        if snapshots.len() > MEMORY_MAX_SNAPSHOTS {
            snapshots.pop_front();
        }

        drop(snapshots); // Release lock before async I/O

        // Persist to disk
        self.storage
            .save(&format!("snapshot_{}", snapshot.id), &snapshot)
            .await
            .map_err(|e| CoreError::Internal(format!("Failed to persist snapshot: {}", e)))?;

        Ok(())
    }

    /// Read latest snapshot
    pub async fn read_snapshot(&self) -> CoreResult<Option<Snapshot>> {
        let snapshots = self.snapshots.read().await;
        Ok(snapshots.back().cloned())
    }

    /// Read specific snapshot by ID
    pub async fn read_snapshot_by_id(&self, id: &str) -> CoreResult<Option<Snapshot>> {
        let snapshots = self.snapshots.read().await;
        Ok(snapshots.iter().find(|s| s.id == id).cloned())
    }

    /// Write log entry
    pub async fn write_log(&self, log: LogEntry) -> CoreResult<()> {
        let mut logs = self.logs.write().await;

        logs.push_back(log);

        // Keep only last 1000 logs (circular buffer)
        if logs.len() > 1000 {
            logs.pop_front();
        }

        Ok(())
    }

    /// Read recent logs (last N entries)
    pub async fn read_logs(&self, count: usize) -> CoreResult<Vec<LogEntry>> {
        let logs = self.logs.read().await;

        let start = logs.len().saturating_sub(count);
        Ok(logs.iter().skip(start).cloned().collect())
    }

    /// Read all logs
    pub async fn read_all_logs(&self) -> CoreResult<Vec<LogEntry>> {
        let logs = self.logs.read().await;
        Ok(logs.iter().cloned().collect())
    }

    /// Add timeline event
    pub async fn add_event(&self, event: TimelineEvent) -> CoreResult<()> {
        let mut timeline = self.timeline.write().await;

        timeline.push_back(event);

        // Keep only last 500 events (circular buffer)
        if timeline.len() > 500 {
            timeline.pop_front();
        }

        Ok(())
    }

    /// Read recent timeline events
    pub async fn read_events(&self, count: usize) -> CoreResult<Vec<TimelineEvent>> {
        let timeline = self.timeline.read().await;

        let start = timeline.len().saturating_sub(count);
        Ok(timeline.iter().skip(start).cloned().collect())
    }

    /// Get current memory state (metrics)
    pub async fn get_memory_state(&self) -> CoreResult<MemoryState> {
        let snapshots = self.snapshots.read().await;
        let logs = self.logs.read().await;
        let timeline = self.timeline.read().await;

        // Calculate approximate storage size (rough estimate)
        let storage_size_mb = (
            snapshots.len() * 5 +  // ~5KB per snapshot
            logs.len() * 1 +        // ~1KB per log
            timeline.len() * 2      // ~2KB per event
        ) as f64 / 1024.0;

        Ok(MemoryState {
            snapshots_count: snapshots.len(),
            log_entries_count: logs.len(),
            timeline_events: timeline.len(),
            storage_size_mb,
            timestamp: Utc::now().timestamp(),
        })
    }

    /// Clear all memory (dangerous - for testing)
    pub async fn clear_all(&self) -> CoreResult<()> {
        let mut snapshots = self.snapshots.write().await;
        let mut logs = self.logs.write().await;
        let mut timeline = self.timeline.write().await;

        snapshots.clear();
        logs.clear();
        timeline.clear();

        Ok(())
    }

    // ───────────────────────────────────────────────────────────
    //   CHAT IA ↔ MEMORY CORE INTEGRATION (v17.3.0)
    // ───────────────────────────────────────────────────────────

    /// Récupère projets actifs (MOCK pour l'instant)
    pub async fn get_active_projects(&self, limit: usize) -> CoreResult<Vec<ProjectSummary>> {
        // TODO: Implémenter vrai stockage projets
        Ok(vec![
            ProjectSummary {
                id: "proj_1".to_string(),
                name: "TITANE∞ v17.3.0 - Chat IA Optimization".to_string(),
                status: ProjectStatus::Active,
                priority: 1,
                last_activity: chrono::Utc::now().to_rfc3339(),
                tags: vec!["ia".to_string(), "refactor".to_string()],
            },
        ]
        .into_iter()
        .take(limit)
        .collect())
    }

    /// Récupère décisions récentes (MOCK)
    pub async fn get_recent_decisions(
        &self,
        limit: usize,
        _time_window: &str,
    ) -> CoreResult<Vec<DecisionSummary>> {
        Ok(vec![
            DecisionSummary {
                id: "dec_1".to_string(),
                title: "Unifier architecture Chat IA".to_string(),
                context: "Fusion useChat + useAI en un seul hook".to_string(),
                outcome: "ChatEngine créé avec 6 modes".to_string(),
                timestamp: chrono::Utc::now().to_rfc3339(),
                impact: ImpactLevel::High,
            },
        ]
        .into_iter()
        .take(limit)
        .collect())
    }

    /// Récupère connaissances (MOCK)
    pub async fn get_knowledge(&self, limit: usize) -> CoreResult<Vec<KnowledgeEntry>> {
        Ok(vec![
            KnowledgeEntry {
                id: "know_1".to_string(),
                topic: "Architecture Memory Core".to_string(),
                content: "Système multi-niveaux: court/moyen/long terme".to_string(),
                source: "docs/backend/architecture.md".to_string(),
                relevance: 0.95,
                timestamp: chrono::Utc::now().to_rfc3339(),
            },
        ]
        .into_iter()
        .take(limit)
        .collect())
    }

    /// Récupère rituels actifs (MOCK)
    pub async fn get_active_rituals(&self) -> CoreResult<Vec<RitualInfo>> {
        Ok(vec![
            RitualInfo {
                id: "ritual_1".to_string(),
                name: "Code Review matinal".to_string(),
                frequency: "daily".to_string(),
                last_execution: chrono::Utc::now().to_rfc3339(),
                next_scheduled: Some(
                    (chrono::Utc::now() + chrono::Duration::days(1)).to_rfc3339(),
                ),
                impact: "Qualité code +20%".to_string(),
            },
        ])
    }

    /// Récupère timeline (MOCK)
    pub async fn get_timeline(&self, _time_window: &str) -> CoreResult<Vec<TimelineEntry>> {
        Ok(vec![
            TimelineEntry {
                timestamp: chrono::Utc::now().to_rfc3339(),
                entry_type: TimelineEntryType::Chat,
                content: "Discussion architecture Chat IA".to_string(),
                metadata: None,
            },
        ])
    }

    /// Sauvegarde interaction chat
    pub async fn save_chat_interaction(&self, interaction: ChatInteraction) -> CoreResult<()> {
        log_info("MemoryModule", "Saving chat interaction");

        // Créer événement timeline
        let event = TimelineEvent {
            id: format!("chat_{}", chrono::Utc::now().timestamp_millis()),
            timestamp: chrono::Utc::now().timestamp_millis(),
            event_type: crate::types::memory::EventType::Alert, // Utiliser un type existant
            description: format!("Chat interaction: mode {}", interaction.mode),
            data: {
                let mut map = HashMap::new();
                map.insert(
                    "interaction".to_string(),
                    serde_json::json!({
                        "user_message": interaction.user_message,
                        "ai_response": interaction.ai_response,
                        "mode": interaction.mode,
                        "emotion_state": interaction.emotion_state,
                    }),
                );
                map
            },
        };

        self.add_event(event).await?;

        Ok(())
    }

    /// Get current status (non-trait method)
    pub async fn get_status(&self) -> CoreStatus {
        *self.status.read().await
    }
}

// ═══════════════════════════════════════════════════════════════
//   CORE MODULE TRAIT IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════

#[async_trait]
impl CoreModule for MemoryModule {
    fn name(&self) -> &str {
        &self.name
    }

    fn version(&self) -> &str {
        &self.version
    }

    fn description(&self) -> &str {
        "Unified storage system managing snapshots, logs, and timeline events with circular buffers and disk persistence"
    }

    fn dependencies(&self) -> Vec<String> {
        vec![] // Independent core - no dependencies
    }

    fn capabilities(&self) -> Vec<String> {
        vec![
            "storage.snapshot.write".to_string(),
            "storage.snapshot.read".to_string(),
            "storage.logs.write".to_string(),
            "storage.logs.read".to_string(),
            "storage.timeline.write".to_string(),
            "storage.timeline.read".to_string(),
            "storage.state".to_string(),
            "storage.clear".to_string(),
        ]
    }

    async fn initialize(&self, _config: serde_json::Value) -> CoreResult<()> {
        log_info("MemoryModule", "Initializing Memory core");

        let mut status = self.status.write().await;
        *status = CoreStatus::Initializing;
        drop(status);

        // Load persisted snapshots from disk (optional recovery)
        // In production, you might want to load last snapshot here

        let mut status = self.status.write().await;
        *status = CoreStatus::Ready;

        Ok(())
    }

    async fn shutdown(&self) -> CoreResult<()> {
        log_info("MemoryModule", "Shutting down Memory core");

        // Optional: Persist final snapshot before shutdown

        let mut status = self.status.write().await;
        *status = CoreStatus::Stopped;

        Ok(())
    }

    async fn health_check(&self) -> CoreResult<CoreHealth> {
        let status = self.status.read().await;

        match *status {
            CoreStatus::Running => {
                // Check storage health
                let state = self.get_memory_state().await?;

                // Warn if storage is getting full
                if state.snapshots_count >= MEMORY_MAX_SNAPSHOTS {
                    Ok(CoreHealth::Degraded)
                } else if state.log_entries_count >= 900 {
                    Ok(CoreHealth::Degraded)
                } else {
                    Ok(CoreHealth::Healthy)
                }
            }
            CoreStatus::Ready | CoreStatus::Stopped => Ok(CoreHealth::Healthy),
            CoreStatus::Initializing | CoreStatus::Stopping => Ok(CoreHealth::Degraded),
            CoreStatus::Uninitialized => Ok(CoreHealth::Degraded),
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   UNIT TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{LogLevel, EventType};

    fn create_test_module() -> MemoryModule {
        let temp_dir = std::env::temp_dir().join("titane_test_storage");
        let storage = StorageService::new(temp_dir).unwrap();
        MemoryModule::new(storage)
    }

    fn create_test_snapshot(id: &str) -> Snapshot {
        Snapshot {
            id: id.to_string(),
            timestamp: Utc::now().timestamp(),
            helios: None,
            nexus: None,
            harmonia: None,
            sentinel: None,
            metadata: HashMap::new(),
        }
    }

    fn create_test_log(message: &str) -> LogEntry {
        LogEntry {
            id: uuid::Uuid::new_v4().to_string(),
            timestamp: Utc::now().timestamp(),
            level: LogLevel::Info,
            module: "test".to_string(),
            message: message.to_string(),
        }
    }

    fn create_test_event(description: &str) -> TimelineEvent {
        TimelineEvent {
            id: uuid::Uuid::new_v4().to_string(),
            timestamp: Utc::now().timestamp(),
            event_type: EventType::SystemStart,
            description: description.to_string(),
            data: HashMap::new(),
        }
    }

    #[tokio::test]
    async fn test_memory_lifecycle() {
        let module = create_test_module();

        // Initial state
        assert_eq!(module.get_status().await, CoreStatus::Stopped);

        // Initialize
        module.initialize(serde_json::json!({})).await.unwrap();
        assert_eq!(module.get_status().await, CoreStatus::Ready);

        // Start
        module.start().await.unwrap();
        assert_eq!(module.get_status().await, CoreStatus::Running);

        // Stop
        module.stop().await.unwrap();
        assert_eq!(module.get_status().await, CoreStatus::Stopped);

        // Shutdown
        module.shutdown().await.unwrap();
        assert_eq!(module.get_status().await, CoreStatus::Stopped);
    }

    #[tokio::test]
    async fn test_snapshot_write_read() {
        let module = create_test_module();
        module.initialize(serde_json::json!({})).await.unwrap();
        module.start().await.unwrap();

        // Write snapshot
        let snapshot = create_test_snapshot("test-001");
        module.write_snapshot(snapshot.clone()).await.unwrap();

        // Read latest
        let read_snapshot = module.read_snapshot().await.unwrap();
        assert!(read_snapshot.is_some());
        assert_eq!(read_snapshot.unwrap().id, "test-001");

        // Read by ID
        let by_id = module.read_snapshot_by_id("test-001").await.unwrap();
        assert!(by_id.is_some());
        assert_eq!(by_id.unwrap().id, "test-001");
    }

    #[tokio::test]
    async fn test_snapshot_circular_buffer() {
        let module = create_test_module();
        module.initialize(serde_json::json!({})).await.unwrap();

        // Write more than max snapshots
        for i in 0..MEMORY_MAX_SNAPSHOTS + 10 {
            let snapshot = create_test_snapshot(&format!("snap-{:03}", i));
            module.write_snapshot(snapshot).await.unwrap();
        }

        // Check count is capped at max
        let state = module.get_memory_state().await.unwrap();
        assert_eq!(state.snapshots_count, MEMORY_MAX_SNAPSHOTS);

        // Check oldest snapshots were removed
        let oldest = module.read_snapshot_by_id("snap-000").await.unwrap();
        assert!(oldest.is_none());

        // Check newest snapshot exists
        let newest = module.read_snapshot_by_id(&format!("snap-{:03}", MEMORY_MAX_SNAPSHOTS + 9)).await.unwrap();
        assert!(newest.is_some());
    }

    #[tokio::test]
    async fn test_logs_write_read() {
        let module = create_test_module();
        module.initialize(serde_json::json!({})).await.unwrap();

        // Write logs
        module.write_log(create_test_log("Log 1")).await.unwrap();
        module.write_log(create_test_log("Log 2")).await.unwrap();
        module.write_log(create_test_log("Log 3")).await.unwrap();

        // Read last 2
        let logs = module.read_logs(2).await.unwrap();
        assert_eq!(logs.len(), 2);
        assert_eq!(logs[0].message, "Log 2");
        assert_eq!(logs[1].message, "Log 3");

        // Read all
        let all_logs = module.read_all_logs().await.unwrap();
        assert_eq!(all_logs.len(), 3);
    }

    #[tokio::test]
    async fn test_logs_circular_buffer() {
        let module = create_test_module();
        module.initialize(serde_json::json!({})).await.unwrap();

        // Write 1100 logs (exceeds 1000 max)
        for i in 0..1100 {
            module.write_log(create_test_log(&format!("Log {}", i))).await.unwrap();
        }

        // Check count is capped at 1000
        let state = module.get_memory_state().await.unwrap();
        assert_eq!(state.log_entries_count, 1000);

        // Check oldest logs were removed (logs 100-1099 should remain)
        let all_logs = module.read_all_logs().await.unwrap();
        assert_eq!(all_logs[0].message, "Log 100");
        assert_eq!(all_logs[999].message, "Log 1099");
    }

    #[tokio::test]
    async fn test_timeline_events() {
        let module = create_test_module();
        module.initialize(serde_json::json!({})).await.unwrap();

        // Add events
        module.add_event(create_test_event("Event 1")).await.unwrap();
        module.add_event(create_test_event("Event 2")).await.unwrap();
        module.add_event(create_test_event("Event 3")).await.unwrap();

        // Read last 2
        let events = module.read_events(2).await.unwrap();
        assert_eq!(events.len(), 2);
        assert_eq!(events[0].description, "Event 2");
        assert_eq!(events[1].description, "Event 3");

        // Check state
        let state = module.get_memory_state().await.unwrap();
        assert_eq!(state.timeline_events, 3);
    }

    #[tokio::test]
    async fn test_timeline_circular_buffer() {
        let module = create_test_module();
        module.initialize(serde_json::json!({})).await.unwrap();

        // Add 550 events (exceeds 500 max)
        for i in 0..550 {
            module.add_event(create_test_event(&format!("Event {}", i))).await.unwrap();
        }

        // Check count is capped at 500
        let state = module.get_memory_state().await.unwrap();
        assert_eq!(state.timeline_events, 500);

        // Check oldest events were removed
        let events = module.read_events(500).await.unwrap();
        assert_eq!(events[0].description, "Event 50");
        assert_eq!(events[499].description, "Event 549");
    }

    #[tokio::test]
    async fn test_memory_state() {
        let module = create_test_module();
        module.initialize(serde_json::json!({})).await.unwrap();

        // Add some data
        module.write_snapshot(create_test_snapshot("s1")).await.unwrap();
        module.write_snapshot(create_test_snapshot("s2")).await.unwrap();
        module.write_log(create_test_log("Log 1")).await.unwrap();
        module.add_event(create_test_event("Event 1")).await.unwrap();

        // Check state
        let state = module.get_memory_state().await.unwrap();
        assert_eq!(state.snapshots_count, 2);
        assert_eq!(state.log_entries_count, 1);
        assert_eq!(state.timeline_events, 1);
        assert!(state.storage_size_mb > 0.0);
    }

    #[tokio::test]
    async fn test_clear_all() {
        let module = create_test_module();
        module.initialize(serde_json::json!({})).await.unwrap();

        // Add data
        module.write_snapshot(create_test_snapshot("s1")).await.unwrap();
        module.write_log(create_test_log("Log 1")).await.unwrap();
        module.add_event(create_test_event("Event 1")).await.unwrap();

        // Clear
        module.clear_all().await.unwrap();

        // Verify empty
        let state = module.get_memory_state().await.unwrap();
        assert_eq!(state.snapshots_count, 0);
        assert_eq!(state.log_entries_count, 0);
        assert_eq!(state.timeline_events, 0);
    }

    #[tokio::test]
    async fn test_health_check() {
        let module = create_test_module();
        module.initialize(serde_json::json!({})).await.unwrap();
        module.start().await.unwrap();

        // Initially healthy
        let health = module.health_check().await.unwrap();
        assert_eq!(health, CoreHealth::Healthy);

        // Add 950 logs (approaching limit)
        for i in 0..950 {
            module.write_log(create_test_log(&format!("Log {}", i))).await.unwrap();
        }

        // Should be degraded (>900 logs)
        let health = module.health_check().await.unwrap();
        assert_eq!(health, CoreHealth::Degraded);
    }

    #[tokio::test]
    async fn test_capabilities() {
        let module = create_test_module();
        let caps = module.capabilities();

        assert_eq!(caps.len(), 8);
        assert!(caps.contains(&"storage.snapshot.write".to_string()));
        assert!(caps.contains(&"storage.snapshot.read".to_string()));
        assert!(caps.contains(&"storage.logs.write".to_string()));
        assert!(caps.contains(&"storage.logs.read".to_string()));
        assert!(caps.contains(&"storage.timeline.write".to_string()));
        assert!(caps.contains(&"storage.timeline.read".to_string()));
        assert!(caps.contains(&"storage.state".to_string()));
        assert!(caps.contains(&"storage.clear".to_string()));
    }

    #[tokio::test]
    async fn test_dependencies() {
        let module = create_test_module();
        let deps = module.dependencies();

        assert_eq!(deps.len(), 0); // Independent core
    }
}
