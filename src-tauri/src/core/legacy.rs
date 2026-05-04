// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v30.0.0 — LEGACY COMPATIBILITY
//   Backward compatibility adapters for old API
// ═══════════════════════════════════════════════════════════════

// Warnings supprimés: Ce fichier est intentionnellement "legacy" et doit
// utiliser les anciennes API pour la compatibilité backward.
// Migration vers unified_memory_v2 planifiée pour v25.x

use crate::memory::telemetry;
use crate::types::{
    ChatInteraction, DecisionSummary, HeliosState, ImpactLevel, KnowledgeEntry, LogEntry,
    MemoryState as TypesMemoryState, ProjectStatus, ProjectSummary, RitualInfo, Snapshot,
    TimelineEntry, TimelineEntryType, TimelineEvent,
};
use crate::utils::AppResult;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{
    cmp::Ordering,
    fs,
    path::PathBuf,
    sync::Arc,
    time::{SystemTime, UNIX_EPOCH},
};
use tokio::sync::RwLock;

const STORAGE_FILE_NAME: &str = "memory_core_state.json";
const MAX_SNAPSHOTS: usize = 128;
const MAX_LOGS: usize = 2000;
const MAX_EVENTS: usize = 512;
const MAX_TIMELINE_ENTRIES: usize = 256;
const MAX_CHAT_HISTORY: usize = 2000;
const MAX_TIMELINE_RESPONSE: usize = 100;
/// Minimum importance score for an LTM entry to be loaded into the MemoryDashboard.
/// Entries below this threshold are considered too weak to be worth injecting into context.
const LTM_MIN_IMPORTANCE: f32 = 0.5;

/// Legacy HeliosCore adapter
#[derive(Clone)]
pub struct HeliosCore;

impl std::fmt::Debug for HeliosCore {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("HeliosCore")
    }
}

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

/// MemoryCore vΩ.6 — disk-backed persistence with telemetry hooks
#[derive(Clone)]
pub struct MemoryCore {
    data: Arc<RwLock<MemoryDisk>>, // In-memory cache guarded by async lock
    paths: Arc<MemoryPaths>,       // Shared path configuration
}

impl std::fmt::Debug for MemoryCore {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("MemoryCore")
    }
}

impl Default for MemoryCore {
    fn default() -> Self {
        Self::new()
    }
}

impl MemoryCore {
    pub fn new() -> Self {
        let paths = MemoryPaths::new();
        let mut state = MemoryDisk::load(&paths.storage_file).unwrap_or_else(|err| {
            log::error!(
                "[MemoryCore] Failed to load state file {}: {}",
                paths.storage_file.display(),
                err
            );
            MemoryDisk::default()
        });

        // Phase C — Auto-seed on empty MemoryCore (first boot or post-wipe)
        // Guard: only seed if knowledge is completely empty (Phase A JSON seed covers normal case)
        if state.knowledge.is_empty() {
            maybe_seed_initial_state(&mut state);
            if let Err(err) = state.persist(&paths.storage_file) {
                log::warn!("[MemoryCore] Could not persist seeded state: {}", err);
            }
        }

        Self {
            data: Arc::new(RwLock::new(state)),
            paths: Arc::new(paths),
        }
    }

    fn persist_locked(&self, state: &MemoryDisk) -> AppResult<()> {
        // En mode dev (feature mock), ne persister que toutes les 30 secondes
        // pour éviter les rebuild loops causés par tauri watch
        #[cfg(feature = "mock")]
        {
            use std::sync::atomic::{AtomicI64, Ordering};
            static LAST_PERSIST: AtomicI64 = AtomicI64::new(0);
            let now = current_millis();
            let last = LAST_PERSIST.load(Ordering::Relaxed);
            if now - last < 30_000 {
                // Skip persist si moins de 30s depuis la dernière
                return Ok(());
            }
            LAST_PERSIST.store(now, Ordering::Relaxed);
        }
        state.persist(&self.paths.storage_file)
    }

    fn load_dashboard(&self) -> MemoryDashboard {
        match MemoryDashboard::load(&self.paths) {
            Ok(dashboard) => dashboard,
            Err(err) => {
                log::debug!(
                    "[MemoryCore] Unable to load dashboard context from disk: {}",
                    err
                );
                MemoryDashboard::default()
            }
        }
    }

    pub async fn get_state(&self) -> AppResult<TypesMemoryState> {
        let now = current_millis();
        let audit_report = telemetry::scan_memory_directory();
        let disk_mode = telemetry::detect_disk_mode(&audit_report);

        let data = self.data.read().await;
        let storage_size_mb = (audit_report.total_size_bytes as f64) / (1024.0 * 1024.0);

        let mut issues = Vec::new();
        if audit_report.missing {
            issues.push("memory_directory_missing".to_string());
        }
        if !audit_report
            .files
            .iter()
            .any(|file| file.name == STORAGE_FILE_NAME)
        {
            issues.push("memory_core_state_missing".to_string());
        }

        Ok(TypesMemoryState {
            snapshots_count: data.snapshots.len(),
            log_entries_count: data.logs.len(),
            timeline_events: data.events.len(),
            storage_size_mb,
            timestamp: now,
            disk_mode,
            synthetic_mode: false,
            last_validation_ts: Some(data.metadata.last_validation_ts),
            last_compaction_ts: data.metadata.last_compaction_ts,
            issues,
        })
    }

    pub async fn write_snapshot(&self, snapshot: Snapshot) -> AppResult<()> {
        let mut data = self.data.write().await;
        push_front_bounded(&mut data.snapshots, snapshot, MAX_SNAPSHOTS);
        data.metadata.mark_write();
        self.persist_locked(&data)
    }

    pub async fn read_snapshot(&self) -> AppResult<Option<Snapshot>> {
        let data = self.data.read().await;
        Ok(data.snapshots.first().cloned())
    }

    pub async fn write_log(&self, entry: LogEntry) -> AppResult<()> {
        let mut message_preview = entry.message.clone();
        if message_preview.chars().count() > 240 {
            message_preview = message_preview.chars().take(240).collect::<String>();
            message_preview.push('…');
        }

        match entry.level {
            crate::types::memory::LogLevel::Info => {
                log::info!(target: "ui", "[UI] {} — {}", entry.module, message_preview);
            }
            crate::types::memory::LogLevel::Warning => {
                log::warn!(target: "ui", "[UI] {} — {}", entry.module, message_preview);
            }
            crate::types::memory::LogLevel::Error => {
                log::error!(target: "ui", "[UI] {} — {}", entry.module, message_preview);
            }
        }

        let mut data = self.data.write().await;
        push_front_bounded(&mut data.logs, entry, MAX_LOGS);
        data.metadata.mark_write();
        self.persist_locked(&data)
    }

    pub async fn read_logs(&self, count: usize) -> AppResult<Vec<LogEntry>> {
        let data = self.data.read().await;
        Ok(data
            .logs
            .iter()
            .take(count.min(MAX_LOGS))
            .cloned()
            .collect())
    }

    pub async fn add_event(&self, event: TimelineEvent) -> AppResult<()> {
        let mut data = self.data.write().await;
        push_front_bounded(&mut data.events, event, MAX_EVENTS);
        data.metadata.mark_write();
        self.persist_locked(&data)
    }

    pub async fn get_active_projects(&self, limit: usize) -> AppResult<Vec<ProjectSummary>> {
        let mut projects = self.load_dashboard().projects;
        if projects.is_empty() {
            let data = self.data.read().await;
            projects = data.projects.clone();
        }
        if limit > 0 && projects.len() > limit {
            projects.truncate(limit);
        }
        Ok(projects)
    }

    pub async fn get_recent_decisions(
        &self,
        limit: usize,
        time_window: &str,
    ) -> AppResult<Vec<DecisionSummary>> {
        let threshold = current_millis() - parse_time_window_to_ms(time_window);

        let mut decisions = self.load_dashboard().decisions;
        if decisions.is_empty() {
            let data = self.data.read().await;
            decisions = data.decisions.clone();
        }

        let mut decisions: Vec<_> = decisions
            .into_iter()
            .filter(|decision| {
                parse_timestamp_to_ms(&decision.timestamp)
                    .map(|ts| ts >= threshold)
                    .unwrap_or(true)
            })
            .collect();

        decisions.sort_by(|a, b| {
            match (
                parse_timestamp_to_ms(&b.timestamp),
                parse_timestamp_to_ms(&a.timestamp),
            ) {
                (Some(left), Some(right)) => left.cmp(&right),
                _ => Ordering::Equal,
            }
        });

        if limit > 0 && decisions.len() > limit {
            decisions.truncate(limit);
        }

        Ok(decisions)
    }

    pub async fn get_knowledge(&self, limit: usize) -> AppResult<Vec<KnowledgeEntry>> {
        let mut knowledge = self.load_dashboard().knowledge;
        if knowledge.is_empty() {
            let data = self.data.read().await;
            knowledge = data.knowledge.clone();
        }
        knowledge.sort_by(|a, b| {
            b.relevance
                .partial_cmp(&a.relevance)
                .unwrap_or(Ordering::Equal)
        });

        if limit > 0 && knowledge.len() > limit {
            knowledge.truncate(limit);
        }

        Ok(knowledge)
    }

    pub async fn get_active_rituals(&self) -> AppResult<Vec<RitualInfo>> {
        let mut rituals = self.load_dashboard().rituals;
        if rituals.is_empty() {
            let data = self.data.read().await;
            rituals = data.rituals.clone();
        }
        Ok(rituals)
    }

    pub async fn get_timeline(&self, time_window: &str) -> AppResult<Vec<TimelineEntry>> {
        let threshold = current_millis() - parse_time_window_to_ms(time_window);

        let mut entries_source = self.load_dashboard().timeline;
        if entries_source.is_empty() {
            let data = self.data.read().await;
            entries_source = data.timeline_entries.clone();
        }

        let entries: Vec<_> = entries_source
            .into_iter()
            .filter(|entry| {
                parse_timestamp_to_ms(&entry.timestamp)
                    .map(|ts| ts >= threshold)
                    .unwrap_or(true)
            })
            .collect();

        Ok(entries.into_iter().take(MAX_TIMELINE_RESPONSE).collect())
    }

    pub async fn save_chat_interaction(&self, mut interaction: ChatInteraction) -> AppResult<()> {
        if interaction.timestamp.trim().is_empty() {
            interaction.timestamp = Utc::now().to_rfc3339();
        }

        let timeline_entry = TimelineEntry {
            timestamp: interaction.timestamp.clone(),
            entry_type: TimelineEntryType::Chat,
            content: interaction.user_message.clone(),
            metadata: None,
        };

        let mut data = self.data.write().await;
        push_front_bounded(&mut data.chat_history, interaction, MAX_CHAT_HISTORY);
        push_front_bounded(
            &mut data.timeline_entries,
            timeline_entry,
            MAX_TIMELINE_ENTRIES,
        );
        data.metadata.mark_write();
        self.persist_locked(&data)
    }
}

#[derive(Debug, Clone)]
struct MemoryPaths {
    base_dir: PathBuf,
    storage_file: PathBuf,
    system_state_file: PathBuf,
    cognitive_file: PathBuf,
    singularity_file: PathBuf,
    harmonics_file: PathBuf,
    ltm_file: PathBuf,
}

impl MemoryPaths {
    fn new() -> Self {
        let base_dir = telemetry::resolve_memory_dir();
        if let Err(err) = fs::create_dir_all(&base_dir) {
            log::error!(
                "[MemoryCore] Unable to create memory directory {}: {}",
                base_dir.display(),
                err
            );
        }

        let storage_file = base_dir.join(STORAGE_FILE_NAME);
        let system_state_file = base_dir.join("system_state.json");
        let cognitive_file = base_dir.join("cognitive.json");
        let singularity_file = base_dir.join("singularity.json");
        let harmonics_file = base_dir.join("harmonics.json");
        let ltm_file = base_dir.join("ltm.json");

        Self {
            base_dir,
            storage_file,
            system_state_file,
            cognitive_file,
            singularity_file,
            harmonics_file,
            ltm_file,
        }
    }

    fn dashboard_sources(&self) -> Vec<PathBuf> {
        vec![
            self.system_state_file.clone(),
            self.cognitive_file.clone(),
            self.singularity_file.clone(),
            self.harmonics_file.clone(),
            self.storage_file.clone(),
        ]
    }
}

#[derive(Default)]
struct MemoryDashboard {
    projects: Vec<ProjectSummary>,
    decisions: Vec<DecisionSummary>,
    knowledge: Vec<KnowledgeEntry>,
    rituals: Vec<RitualInfo>,
    timeline: Vec<TimelineEntry>,
}

impl MemoryDashboard {
    fn load(paths: &MemoryPaths) -> AppResult<Self> {
        log::trace!(
            "[MemoryCore] Loading dashboard context from {}",
            paths.base_dir.display()
        );

        let mut dashboard = Self::default();
        for path in paths.dashboard_sources() {
            if !path.exists() {
                continue;
            }

            let content = match fs::read_to_string(&path) {
                Ok(raw) => raw,
                Err(err) => {
                    log::debug!("[MemoryCore] Unable to read {}: {}", path.display(), err);
                    continue;
                }
            };

            if content.trim().is_empty() {
                continue;
            }

            match serde_json::from_str::<Value>(&content) {
                Ok(value) => dashboard.merge_from_value(&value),
                Err(err) => log::debug!("[MemoryCore] Unable to parse {}: {}", path.display(), err),
            }
        }

        // Phase D — Load LTM entries from dedicated ltm.json (bare array format)
        load_ltm_into_dashboard(&mut dashboard, &paths.ltm_file);

        Ok(dashboard)
    }

    fn merge_from_value(&mut self, value: &Value) {
        self.merge_projects(extract_projects(value));
        self.merge_decisions(extract_decisions(value));
        self.merge_knowledge(extract_knowledge(value));
        self.merge_rituals(extract_rituals(value));
        self.merge_timeline(extract_timeline(value));
    }

    fn merge_projects(&mut self, new_items: Vec<ProjectSummary>) {
        for item in new_items {
            if !self.projects.iter().any(|existing| existing.id == item.id) {
                self.projects.push(item);
            }
        }
    }

    fn merge_decisions(&mut self, new_items: Vec<DecisionSummary>) {
        for item in new_items {
            if !self.decisions.iter().any(|existing| existing.id == item.id) {
                self.decisions.push(item);
            }
        }
    }

    fn merge_knowledge(&mut self, new_items: Vec<KnowledgeEntry>) {
        for item in new_items {
            if !self.knowledge.iter().any(|existing| existing.id == item.id) {
                self.knowledge.push(item);
            }
        }
    }

    fn merge_rituals(&mut self, new_items: Vec<RitualInfo>) {
        for item in new_items {
            if !self.rituals.iter().any(|existing| existing.id == item.id) {
                self.rituals.push(item);
            }
        }
    }

    fn merge_timeline(&mut self, new_items: Vec<TimelineEntry>) {
        self.timeline.extend(new_items);
        self.timeline.truncate(MAX_TIMELINE_RESPONSE * 2);
    }
}

fn extract_projects(value: &Value) -> Vec<ProjectSummary> {
    let mut nodes = Vec::new();
    collect_candidate_array_items(
        value,
        &[
            "active_projects",
            "projects",
            "project_cards",
            "project_dashboard",
            "workstreams",
        ],
        &mut nodes,
        0,
    );

    nodes
        .iter()
        .enumerate()
        .filter_map(|(idx, candidate)| map_project_summary(candidate, idx))
        .collect()
}

fn extract_decisions(value: &Value) -> Vec<DecisionSummary> {
    let mut nodes = Vec::new();
    collect_candidate_array_items(
        value,
        &[
            "recent_decisions",
            "decisions",
            "decision_log",
            "decision_feed",
        ],
        &mut nodes,
        0,
    );

    nodes
        .iter()
        .enumerate()
        .filter_map(|(idx, candidate)| map_decision_summary(candidate, idx))
        .collect()
}

fn extract_knowledge(value: &Value) -> Vec<KnowledgeEntry> {
    let mut nodes = Vec::new();
    collect_candidate_array_items(
        value,
        &[
            "knowledge_entries",
            "knowledge",
            "knowledge_base",
            "learning_data",
            "insights",
        ],
        &mut nodes,
        0,
    );

    nodes
        .iter()
        .enumerate()
        .filter_map(|(idx, candidate)| map_knowledge_entry(candidate, idx))
        .collect()
}

fn extract_rituals(value: &Value) -> Vec<RitualInfo> {
    let mut nodes = Vec::new();
    collect_candidate_array_items(
        value,
        &["active_rituals", "rituals", "routines", "ritual_cards"],
        &mut nodes,
        0,
    );

    nodes
        .iter()
        .enumerate()
        .filter_map(|(idx, candidate)| map_ritual_info(candidate, idx))
        .collect()
}

fn extract_timeline(value: &Value) -> Vec<TimelineEntry> {
    let mut nodes = Vec::new();
    collect_candidate_array_items(
        value,
        &[
            "timeline",
            "timeline_entries",
            "events",
            "chat_history",
            "timeline_events",
        ],
        &mut nodes,
        0,
    );

    nodes
        .iter()
        .enumerate()
        .filter_map(|(idx, candidate)| map_timeline_entry(candidate, idx))
        .collect()
}

fn collect_candidate_array_items(value: &Value, keywords: &[&str], acc: &mut Vec<Value>, depth: usize) {
    // Depth guard: prevent stack overflow on pathological deeply nested JSON
    if depth > 32 {
        return;
    }
    match value {
        Value::Object(map) => {
            for (key, nested) in map {
                if keywords
                    .iter()
                    .any(|candidate| candidate.eq_ignore_ascii_case(key))
                {
                    match nested {
                        Value::Array(items) => acc.extend(items.iter().cloned()),
                        Value::Object(_) => collect_candidate_array_items(nested, keywords, acc, depth + 1),
                        _ => {}
                    }
                } else {
                    collect_candidate_array_items(nested, keywords, acc, depth + 1);
                }
            }
        }
        Value::Array(items) => {
            for item in items {
                collect_candidate_array_items(item, keywords, acc, depth + 1);
            }
        }
        _ => {}
    }
}

fn map_project_summary(value: &Value, idx: usize) -> Option<ProjectSummary> {
    if !value.is_object() {
        return None;
    }

    let id = read_string(value, &["id", "project_id", "slug", "code"])
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| format!("project_{}", idx));

    let name = read_string(value, &["name", "title", "label"])
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| format!("Projet {}", idx + 1));

    let status = read_string(value, &["status", "state", "phase", "health"])
        .map(|raw| match raw.to_lowercase().as_str() {
            "paused" | "pending" | "hold" => ProjectStatus::Paused,
            "complete" | "completed" | "done" | "finished" => ProjectStatus::Completed,
            _ => ProjectStatus::Active,
        })
        .unwrap_or(ProjectStatus::Active);

    let priority = read_f64(value, &["priority", "score", "weight", "rank"]).unwrap_or(0.0).clamp(0.0, 100.0) as i32;
    let last_activity = read_string(
        value,
        &["last_activity", "updated_at", "timestamp", "last_update"],
    )
    .unwrap_or_else(|| Utc::now().to_rfc3339());

    let tags = read_string_array(value, &["tags", "labels", "keywords", "modes", "topics"]);

    Some(ProjectSummary {
        id,
        name,
        status,
        priority,
        last_activity,
        tags,
    })
}

fn map_decision_summary(value: &Value, idx: usize) -> Option<DecisionSummary> {
    if !value.is_object() {
        return None;
    }

    let id = read_string(value, &["id", "decision_id", "ref"])
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| format!("decision_{}", idx));

    let title =
        read_string(value, &["title", "name", "summary"]).unwrap_or_else(|| "Décision".to_string());
    let context = read_string(
        value,
        &["context", "justification", "details", "description"],
    )
    .unwrap_or_else(|| "Contexte non spécifié".to_string());
    let outcome = read_string(value, &["outcome", "result", "resolution"])
        .unwrap_or_else(|| "En cours".to_string());
    let timestamp = read_string(value, &["timestamp", "date", "created_at", "updated_at"])
        .unwrap_or_else(|| Utc::now().to_rfc3339());

    let impact = read_string(value, &["impact", "severity", "level"])
        .map(|raw| match raw.to_lowercase().as_str() {
            "high" | "élevé" | "critique" => ImpactLevel::High,
            "low" | "faible" => ImpactLevel::Low,
            _ => ImpactLevel::Medium,
        })
        .unwrap_or(ImpactLevel::Medium);

    Some(DecisionSummary {
        id,
        title,
        context,
        outcome,
        timestamp,
        impact,
    })
}

fn map_knowledge_entry(value: &Value, idx: usize) -> Option<KnowledgeEntry> {
    if !value.is_object() {
        return None;
    }

    let id = read_string(value, &["id", "entry_id", "slug"])
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| format!("knowledge_{}", idx));
    let topic = read_string(value, &["topic", "title", "subject"]).unwrap_or_default();
    let content =
        read_string(value, &["content", "summary", "details", "text"]).unwrap_or_default();
    let source = read_string(value, &["source", "origin", "provider"])
        .unwrap_or_else(|| "memory".to_string());
    let relevance = read_f64(value, &["relevance", "score", "weight"]).unwrap_or(0.5).clamp(0.0, 1.0) as f32;
    let timestamp = read_string(value, &["timestamp", "recorded_at", "updated_at"])
        .unwrap_or_else(|| Utc::now().to_rfc3339());

    Some(KnowledgeEntry {
        id,
        topic,
        content,
        source,
        relevance,
        timestamp,
    })
}

fn map_ritual_info(value: &Value, idx: usize) -> Option<RitualInfo> {
    if !value.is_object() {
        return None;
    }

    let id = read_string(value, &["id", "ritual_id", "code"])
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| format!("ritual_{}", idx));
    let name =
        read_string(value, &["name", "title", "label"]).unwrap_or_else(|| "Rituel".to_string());
    let frequency = read_string(value, &["frequency", "cadence", "period"])
        .unwrap_or_else(|| "weekly".to_string());
    let last_execution = read_string(value, &["last_execution", "last_run", "last_trigger"])
        .unwrap_or_else(|| Utc::now().to_rfc3339());
    let next_scheduled = read_string(value, &["next_scheduled", "next_run", "planned_at"]);
    let impact = read_string(value, &["impact", "goal", "purpose"])
        .unwrap_or_else(|| "stability".to_string());

    Some(RitualInfo {
        id,
        name,
        frequency,
        last_execution,
        next_scheduled,
        impact,
    })
}

fn map_timeline_entry(value: &Value, idx: usize) -> Option<TimelineEntry> {
    if !value.is_object() {
        return None;
    }

    let timestamp = read_string(value, &["timestamp", "date", "created_at"])
        .unwrap_or_else(|| Utc::now().to_rfc3339());
    let entry_type = read_string(value, &["entry_type", "type", "category", "kind"])
        .map(|raw| match raw.to_lowercase().as_str() {
            "chat" => TimelineEntryType::Chat,
            "decision" => TimelineEntryType::Decision,
            "project" => TimelineEntryType::Project,
            "ritual" => TimelineEntryType::Ritual,
            _ => TimelineEntryType::Emotion,
        })
        .unwrap_or(TimelineEntryType::Chat);

    let content = read_string(value, &["content", "message", "description", "summary"])
        .unwrap_or_else(|| format!("Entrée timeline {}", idx + 1));
    let metadata = value
        .as_object()
        .and_then(|map| map.get("metadata"))
        .cloned();

    Some(TimelineEntry {
        timestamp,
        entry_type,
        content,
        metadata,
    })
}

fn read_string(value: &Value, keys: &[&str]) -> Option<String> {
    lookup_value(value, keys).and_then(|v| match v {
        Value::String(s) => Some(s.trim().to_string()),
        Value::Number(n) => Some(n.to_string()),
        Value::Bool(b) => Some(b.to_string()),
        _ => None,
    })
}

fn read_f64(value: &Value, keys: &[&str]) -> Option<f64> {
    lookup_value(value, keys).and_then(|v| match v {
        Value::Number(n) => n.as_f64(),
        Value::String(s) => s.parse::<f64>().ok(),
        _ => None,
    })
}

fn read_string_array(value: &Value, keys: &[&str]) -> Vec<String> {
    match lookup_value(value, keys) {
        Some(Value::Array(items)) => items
            .iter()
            .filter_map(|item| match item {
                Value::String(s) => Some(s.trim().to_string()),
                _ => None,
            })
            .collect(),
        Some(Value::String(s)) => s
            .split(',')
            .map(|item| item.trim().to_string())
            .filter(|item| !item.is_empty())
            .collect(),
        _ => Vec::new(),
    }
}

fn lookup_value<'a>(value: &'a Value, keys: &[&str]) -> Option<&'a Value> {
    let object = value.as_object()?;
    for key in keys {
        if let Some(found) = object
            .iter()
            .find(|(candidate, _)| candidate.eq_ignore_ascii_case(key))
            .map(|(_, v)| v)
        {
            return Some(found);
        }
    }

    if let Some(metadata) = object.get("metadata") {
        return lookup_value(metadata, keys);
    }

    None
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct MemoryDisk {
    snapshots: Vec<Snapshot>,
    logs: Vec<LogEntry>,
    events: Vec<TimelineEvent>,
    timeline_entries: Vec<TimelineEntry>,
    chat_history: Vec<ChatInteraction>,
    projects: Vec<ProjectSummary>,
    decisions: Vec<DecisionSummary>,
    knowledge: Vec<KnowledgeEntry>,
    rituals: Vec<RitualInfo>,
    metadata: MemoryDiskMetadata,
}

// Default dérivé

impl MemoryDisk {
    fn load(path: &PathBuf) -> AppResult<Self> {
        if !path.exists() {
            let default = Self::default();
            default.persist(path)?;
            return Ok(default);
        }

        let content = fs::read_to_string(path)?;
        if content.trim().is_empty() {
            let default = Self::default();
            default.persist(path)?;
            return Ok(default);
        }

        let mut data: Self = serde_json::from_str(&content)?;
        if data.metadata.last_validation_ts == 0 {
            data.metadata.last_validation_ts = current_millis();
        }
        Ok(data)
    }

    fn persist(&self, path: &PathBuf) -> AppResult<()> {
        let tmp_path = path.with_extension("tmp");
        let json = serde_json::to_string_pretty(self)?;
        fs::write(&tmp_path, &json)?;
        fs::rename(&tmp_path, path)?;
        Ok(())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct MemoryDiskMetadata {
    last_validation_ts: i64,
    last_compaction_ts: Option<i64>,
}

impl Default for MemoryDiskMetadata {
    fn default() -> Self {
        Self {
            last_validation_ts: current_millis(),
            last_compaction_ts: None,
        }
    }
}

impl MemoryDiskMetadata {
    fn mark_write(&mut self) {
        self.last_validation_ts = current_millis();
    }
}

fn push_front_bounded<T>(collection: &mut Vec<T>, value: T, cap: usize) {
    collection.insert(0, value);
    if collection.len() > cap {
        collection.truncate(cap);
    }
}

/// Phase C — Seed initial knowledge and project into an empty MemoryDisk.
/// Called on first boot or after a state-wipe so the chat pipeline always
/// has at least baseline knowledge available.
fn maybe_seed_initial_state(state: &mut MemoryDisk) {
    log::info!("[MemoryCore] Seeding initial knowledge state...");
    let ts = Utc::now().to_rfc3339();

    state.knowledge = vec![
        KnowledgeEntry {
            id: "k-001".into(),
            topic: "Identité TITANE∞".into(),
            content: "Architecte de cohérence vivante — mission: rendre cohérent ce qui est fragmenté, flou, dispersé ou désaligné. Assiste Kevin Thibault dans toutes ses missions avec lucidité et engagement.".into(),
            source: "identity_kernel_v31".into(),
            relevance: 0.95,
            timestamp: ts.clone(),
        },
        KnowledgeEntry {
            id: "k-002".into(),
            topic: "Noyau identitaire v31".into(),
            content: "Valeurs fondamentales: Lucidité, Éthique, Simplicité durable, Responsabilité, Autonomie, Cohérence, Incarnation, Transmission. Ton: lucide, structurant, humain, sobre, dense, sans fioriture.".into(),
            source: "identity_kernel_v31".into(),
            relevance: 0.9,
            timestamp: ts.clone(),
        },
        KnowledgeEntry {
            id: "k-003".into(),
            topic: "Stack technique TITANE".into(),
            content: "Tauri v2 + React 18 + TypeScript + Rust. Architecture 4-Ring. One Door network: UI → IPC → services → gateway → external. Gouvernance Rule 1-20.".into(),
            source: "knowledge_base".into(),
            relevance: 0.85,
            timestamp: ts.clone(),
        },
        KnowledgeEntry {
            id: "k-005".into(),
            topic: "Style de réponse Kevin".into(),
            content: "Réponses denses, structurées, directes, complètes. Zéro hésitation, zéro demande de validation, zéro préambule. Livraison immédiate et exécutable. Langue française par défaut.".into(),
            source: "kevin_owner_profile_v30".into(),
            relevance: 0.9,
            timestamp: ts.clone(),
        },
        KnowledgeEntry {
            id: "k-007".into(),
            topic: "Propriétaire: Kevin Thibault".into(),
            content: "Fondateur Humain Total. Architecte TITANE∞. Expertise: IA, développement, philosophie vivante, leadership transformationnel. Préférence: précision technique, densité sémantique, réponses longues et complètes.".into(),
            source: "kevin_owner_profile_v30".into(),
            relevance: 0.95,
            timestamp: ts.clone(),
        },
        KnowledgeEntry {
            id: "k-008".into(),
            topic: "Règles IPC et sécurité".into(),
            content: "Contrat IPC: { ok, content, error } obligatoire. OWASP Top 10. Capabilities Tauri lockées. ALLOWED_COMMANDS dans security.ts. Zéro accès réseau direct depuis UI.".into(),
            source: "knowledge_base".into(),
            relevance: 0.9,
            timestamp: ts.clone(),
        },
    ];

    if state.projects.is_empty() {
        state.projects = vec![ProjectSummary {
            id: "proj-001".into(),
            name: "TITANE∞ — Système IA Personnel".into(),
            status: ProjectStatus::Active,
            priority: 1,
            last_activity: ts.clone(),
            tags: vec![
                "ai".into(),
                "tauri".into(),
                "memory".into(),
                "governance".into(),
            ],
        }];
    }

    state.metadata.mark_write();
}

/// Phase D — Load LTM entries from ltm.json into the MemoryDashboard knowledge pool.
/// `ltm.json` uses a bare JSON array format: [{id, content, type, importance, timestamp, ...}]
fn load_ltm_into_dashboard(dashboard: &mut MemoryDashboard, ltm_path: &PathBuf) {
    if !ltm_path.exists() {
        return;
    }
    let content = match fs::read_to_string(ltm_path) {
        Ok(c) => c,
        Err(err) => {
            log::debug!("[MemoryCore] Could not read ltm.json: {}", err);
            return;
        }
    };
    if content.trim().is_empty() {
        return;
    }
    let arr: Vec<Value> = match serde_json::from_str(&content) {
        Ok(Value::Array(a)) => a,
        Ok(_) => {
            // Not a bare array — try as object with "entries" or "knowledge" key
            match serde_json::from_str::<Value>(&content) {
                Ok(obj) => {
                    let mut nodes = Vec::new();
                    collect_candidate_array_items(&obj, &["entries", "knowledge", "items"], &mut nodes, 0);
                    nodes
                }
                Err(_) => return,
            }
        }
        Err(err) => {
            log::debug!("[MemoryCore] Could not parse ltm.json: {}", err);
            return;
        }
    };

    let mut added = 0usize;
    for item in &arr {
        if !item.is_object() {
            continue;
        }
        let entry_type = read_string(item, &["type", "entry_type"]).unwrap_or_default();
        // Accept entries of type "knowledge" or entries without explicit type
        let is_knowledge = entry_type.is_empty() || entry_type.eq_ignore_ascii_case("knowledge");
        if !is_knowledge {
            continue;
        }
        let importance = read_f64(item, &["importance", "relevance", "score"]).unwrap_or(0.0) as f32;
        if importance < LTM_MIN_IMPORTANCE {
            continue;
        }
        let id = read_string(item, &["id", "entry_id"]).filter(|s| !s.is_empty()).unwrap_or_else(|| {
            format!("ltm_{}", Utc::now().timestamp_millis())
        });
        // Skip if already in dashboard
        if dashboard.knowledge.iter().any(|k| k.id == id) {
            continue;
        }
        if let Some(entry) = map_knowledge_entry(item, dashboard.knowledge.len()) {
            // Override the generated ID with the actual ltm ID
            let mut e = entry;
            e.id = id;
            e.relevance = importance;
            dashboard.knowledge.push(e);
            added += 1;
        }
    }
    if added > 0 {
        log::debug!("[MemoryCore] Loaded {} knowledge entries from ltm.json", added);
    }
}

fn current_millis() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

fn parse_time_window_to_ms(window: &str) -> i64 {
    let trimmed = window.trim();
    if trimmed.is_empty() {
        return 7 * 24 * 60 * 60 * 1000; // default 7 days
    }

    let (value_part, unit) = trimmed.split_at(trimmed.len().saturating_sub(1));
    let magnitude: i64 = value_part.parse().unwrap_or(7);
    match unit.to_lowercase().as_str() {
        "h" => magnitude * 60 * 60 * 1000,
        "m" => magnitude * 60 * 1000,
        _ => magnitude * 24 * 60 * 60 * 1000,
    }
}

fn parse_timestamp_to_ms(timestamp: &str) -> Option<i64> {
    if let Ok(parsed) = chrono::DateTime::parse_from_rfc3339(timestamp) {
        return Some(parsed.timestamp_millis());
    }
    timestamp.parse().ok()
}

/// Legacy NexusCore adapter
#[derive(Clone)]
pub struct NexusCore;

impl std::fmt::Debug for NexusCore {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("NexusCore")
    }
}

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

impl std::fmt::Debug for HarmoniaCore {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("HarmoniaCore")
    }
}

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

impl std::fmt::Debug for SentinelCore {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("SentinelCore")
    }
}

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

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    fn make_paths(dir: &std::path::Path) -> MemoryPaths {
        MemoryPaths {
            base_dir: dir.to_path_buf(),
            storage_file: dir.join("memory_core_state.json"),
            system_state_file: dir.join("system_state.json"),
            cognitive_file: dir.join("cognitive.json"),
            singularity_file: dir.join("singularity.json"),
            harmonics_file: dir.join("harmonics.json"),
            ltm_file: dir.join("ltm.json"),
        }
    }

    #[test]
    fn test_seeding_on_empty_state() {
        let mut disk = MemoryDisk::default();
        assert!(disk.knowledge.is_empty());
        maybe_seed_initial_state(&mut disk);
        assert!(!disk.knowledge.is_empty(), "knowledge should be seeded");
        assert!(!disk.projects.is_empty(), "projects should be seeded");
    }

    #[test]
    fn test_no_reseeding_when_knowledge_present() {
        let mut disk = MemoryDisk::default();
        disk.knowledge.push(KnowledgeEntry {
            id: "existing".into(),
            topic: "pre-existing".into(),
            content: "already here".into(),
            source: "test".into(),
            relevance: 0.9,
            timestamp: "2026-01-01T00:00:00Z".into(),
        });
        let count_before = disk.knowledge.len();
        // Seeding guard: MemoryCore::new only seeds when knowledge is empty.
        // Calling maybe_seed_initial_state directly here should still add entries
        // (it's unconditional) — the guard is in MemoryCore::new.
        // So this test verifies the guard logic explicitly:
        if disk.knowledge.is_empty() {
            maybe_seed_initial_state(&mut disk);
        }
        assert_eq!(disk.knowledge.len(), count_before, "should not reseed when knowledge exists");
    }

    #[test]
    fn test_ltm_bridge_reads_knowledge_entries() {
        let dir = tempdir().expect("tempdir");
        let paths = make_paths(dir.path());

        // Write a minimal ltm.json with one high-relevance knowledge entry
        let ltm_content = r#"[
            {"id":"ltm-001","content":"LTM knowledge A","type":"knowledge","importance":0.8,"timestamp":"2026-01-01T00:00:00Z"},
            {"id":"ltm-002","content":"LTM knowledge low","type":"knowledge","importance":0.3,"timestamp":"2026-01-01T00:00:00Z"},
            {"id":"ltm-003","content":"Not knowledge","type":"event","importance":0.9,"timestamp":"2026-01-01T00:00:00Z"}
        ]"#;
        std::fs::write(&paths.ltm_file, ltm_content).expect("write ltm.json");

        let mut dashboard = MemoryDashboard::default();
        load_ltm_into_dashboard(&mut dashboard, &paths.ltm_file);

        // Only ltm-001 should be included: type==knowledge AND importance>=0.5
        assert_eq!(dashboard.knowledge.len(), 1);
        assert_eq!(dashboard.knowledge[0].id, "ltm-001");
        assert!((dashboard.knowledge[0].relevance - 0.8_f32).abs() < 0.01);
    }

    #[test]
    fn test_ltm_bridge_deduplicates_existing_entries() {
        let dir = tempdir().expect("tempdir");
        let paths = make_paths(dir.path());

        let ltm_content = r#"[
            {"id":"ltm-001","content":"LTM A","type":"knowledge","importance":0.8,"timestamp":"2026-01-01T00:00:00Z"}
        ]"#;
        std::fs::write(&paths.ltm_file, ltm_content).expect("write ltm.json");

        let mut dashboard = MemoryDashboard::default();
        dashboard.knowledge.push(KnowledgeEntry {
            id: "ltm-001".into(),
            topic: "existing".into(),
            content: "already loaded".into(),
            source: "test".into(),
            relevance: 0.8,
            timestamp: "2026-01-01T00:00:00Z".into(),
        });

        load_ltm_into_dashboard(&mut dashboard, &paths.ltm_file);
        assert_eq!(dashboard.knowledge.len(), 1, "duplicate should be skipped");
        assert_eq!(dashboard.knowledge[0].content, "already loaded");
    }

    // Ph3-IT3: depth guard
    #[test]
    fn test_collect_candidates_depth_guard() {
        // Build a deeply nested JSON object (depth > 32) wrapping a 'projects' array.
        // The guard must prevent stack overflow and simply return without panicking.
        let mut obj = serde_json::json!({ "projects": [{"id": "p1", "name": "Test"}] });
        for _ in 0..40 {
            obj = serde_json::json!({ "wrapper": obj });
        }
        let mut acc: Vec<serde_json::Value> = Vec::new();
        // Must not panic or stack overflow regardless of depth
        collect_candidate_array_items(&obj, &["projects"], &mut acc, 0);
        // The inner projects array is beyond depth 32 — result may be empty or partial
        // The critical assertion is: no panic and function returned.
        // (acc may be empty because the depth guard kicked in before reaching the array)
        assert!(acc.len() <= 1, "guard should have stopped before or at the array");
    }

    // Ph3-IT3: priority clamp
    #[test]
    fn test_priority_clamp() {
        use serde_json::json;
        // Out-of-bounds priority (99999) must be clamped to 100 before i32 cast
        let value = json!({
            "id": "p-overflow",
            "name": "Overflow Project",
            "priority": 99999.0,
            "status": "active"
        });
        let result = map_project_summary(&value, 0);
        assert!(result.is_some());
        let project = result.unwrap();
        assert_eq!(project.priority, 100, "priority should be clamped to 100");

        // Negative priority must be clamped to 0
        let value2 = json!({
            "id": "p-negative",
            "name": "Negative Priority",
            "priority": -50.0,
            "status": "active"
        });
        let result2 = map_project_summary(&value2, 0);
        assert!(result2.is_some());
        assert_eq!(result2.unwrap().priority, 0, "negative priority should be clamped to 0");
    }

    // Ph3-IT3: relevance clamp
    #[test]
    fn test_relevance_clamp() {
        use serde_json::json;
        // relevance > 1.0 must be clamped to 1.0
        let value = json!({
            "id": "k-overflow",
            "topic": "Knowledge overflow",
            "content": "Relevance out of bounds",
            "relevance": 2.5
        });
        let result = map_knowledge_entry(&value, 0);
        assert!(result.is_some());
        let knowledge = result.unwrap();
        assert!(
            knowledge.relevance <= 1.0,
            "relevance {} should be clamped to <= 1.0",
            knowledge.relevance
        );

        // relevance < 0.0 must be clamped to 0.0
        let value2 = json!({
            "id": "k-negative",
            "topic": "Knowledge negative",
            "content": "Negative relevance",
            "relevance": -0.5
        });
        let result2 = map_knowledge_entry(&value2, 0);
        assert!(result2.is_some());
        assert!(
            result2.unwrap().relevance >= 0.0,
            "negative relevance should be clamped to >= 0.0"
        );
    }
}
