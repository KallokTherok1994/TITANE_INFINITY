// ═══════════════════════════════════════════════════════════════════════════
// TITANE∞ v19.3.0 — CENTRE D'ÉVOLUTION COGNITIVE (OPUS #4)
// Commandes unifiées: Progression + Knowledge + Evolution + Memory
// ═══════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

type CommandResult<T> = Result<T, String>;

// ─────────────────────────────────────────────────────────────────────────────
// PATHS - Data storage locations
// ─────────────────────────────────────────────────────────────────────────────

fn get_data_dir() -> PathBuf {
    let home = std::env::var("HOME").unwrap_or_else(|_| "/tmp".to_string());
    PathBuf::from(home).join(".local/share/titane-infinity/cognitive")
}

fn ensure_data_dir() -> CommandResult<PathBuf> {
    let dir = get_data_dir();
    fs::create_dir_all(&dir).map_err(|e| format!("Failed to create data dir: {}", e))?;
    Ok(dir)
}

// ═══════════════════════════════════════════════════════════════════════════
// PROGRESSION / XP ENGINE
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProgressionState {
    pub level: u32,
    pub total_xp: u64,
    pub xp_in_current_level: u64,
    pub xp_to_next_level: u64,
    pub milestones: Vec<Milestone>,
    pub unlocked_milestones: Vec<String>,
    pub streak_days: u32,
    pub last_active_date: String,
    pub created_at: u64,
    pub updated_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Milestone {
    pub id: String,
    pub name: String,
    pub description: String,
    pub required_xp: u64,
    pub required_level: u32,
    pub unlocked_at: Option<u64>,
    pub icon: String,
    pub reward: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct XPEvent {
    pub id: String,
    pub timestamp: u64,
    pub amount: u64,
    pub source: String,
    pub description: String,
}

const XP_PER_LEVEL: u64 = 500;

impl Default for ProgressionState {
    fn default() -> Self {
        let now = chrono::Utc::now().timestamp_millis() as u64;
        Self {
            level: 1,
            total_xp: 0,
            xp_in_current_level: 0,
            xp_to_next_level: XP_PER_LEVEL,
            milestones: default_milestones(),
            unlocked_milestones: vec![],
            streak_days: 0,
            last_active_date: chrono::Utc::now().format("%Y-%m-%d").to_string(),
            created_at: now,
            updated_at: now,
        }
    }
}

fn default_milestones() -> Vec<Milestone> {
    vec![
        Milestone {
            id: "first_message".into(),
            name: "Premier Contact".into(),
            description: "Envoyez votre premier message".into(),
            required_xp: 5,
            required_level: 1,
            unlocked_at: None,
            icon: "💬".into(),
            reward: Some("+10 XP".into()),
        },
        Milestone {
            id: "level_5".into(),
            name: "Apprenti".into(),
            description: "Atteignez le niveau 5".into(),
            required_xp: 2500,
            required_level: 5,
            unlocked_at: None,
            icon: "🌱".into(),
            reward: Some("Badge Apprenti".into()),
        },
        Milestone {
            id: "level_10".into(),
            name: "Initié".into(),
            description: "Atteignez le niveau 10".into(),
            required_xp: 5000,
            required_level: 10,
            unlocked_at: None,
            icon: "⭐".into(),
            reward: Some("Badge Initié".into()),
        },
        Milestone {
            id: "level_25".into(),
            name: "Expert".into(),
            description: "Atteignez le niveau 25".into(),
            required_xp: 12500,
            required_level: 25,
            unlocked_at: None,
            icon: "🌟".into(),
            reward: Some("Badge Expert".into()),
        },
    ]
}

fn calculate_level(total_xp: u64) -> (u32, u64, u64) {
    let level = ((total_xp / XP_PER_LEVEL) + 1) as u32;
    let xp_for_current_level = (level as u64 - 1) * XP_PER_LEVEL;
    let xp_in_level = total_xp - xp_for_current_level;
    let xp_to_next = XP_PER_LEVEL;
    (level.min(100), xp_in_level, xp_to_next)
}

fn load_progression() -> ProgressionState {
    let path = get_data_dir().join("progression_state.json");
    if let Ok(content) = fs::read_to_string(&path) {
        if let Ok(state) = serde_json::from_str(&content) {
            return state;
        }
    }
    ProgressionState::default()
}

fn save_progression(state: &ProgressionState) -> CommandResult<()> {
    let dir = ensure_data_dir()?;
    let path = dir.join("progression_state.json");
    let content =
        serde_json::to_string_pretty(state).map_err(|e| format!("Failed to serialize: {}", e))?;
    fs::write(&path, content).map_err(|e| format!("Failed to write: {}", e))
}

#[tauri::command]
pub async fn cognitive_get_progression() -> CommandResult<ProgressionState> {
    log::info!("[Cognitive] get_progression");
    Ok(load_progression())
}

#[tauri::command]
pub async fn cognitive_add_xp(
    amount: u64,
    source: String,
    description: String,
) -> CommandResult<ProgressionState> {
    log::info!("[Cognitive] add_xp: {} from {}", amount, source);

    let mut state = load_progression();
    state.total_xp += amount;

    let (level, xp_in_level, xp_to_next) = calculate_level(state.total_xp);
    state.level = level;
    state.xp_in_current_level = xp_in_level;
    state.xp_to_next_level = xp_to_next;
    state.updated_at = chrono::Utc::now().timestamp_millis() as u64;

    // Check milestone unlocks
    let now = chrono::Utc::now().timestamp_millis() as u64;
    for milestone in &mut state.milestones {
        if milestone.unlocked_at.is_none()
            && state.total_xp >= milestone.required_xp
            && state.level >= milestone.required_level
        {
            milestone.unlocked_at = Some(now);
            if !state.unlocked_milestones.contains(&milestone.id) {
                state.unlocked_milestones.push(milestone.id.clone());
            }
        }
    }

    save_progression(&state)?;
    Ok(state)
}

#[tauri::command]
pub async fn cognitive_reset_progression() -> CommandResult<ProgressionState> {
    log::info!("[Cognitive] reset_progression");
    let state = ProgressionState::default();
    save_progression(&state)?;
    Ok(state)
}

// ═══════════════════════════════════════════════════════════════════════════
// KNOWLEDGE VAULT
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KnowledgeEntry {
    pub id: String,
    pub title: String,
    pub path: String,
    pub category: String,
    pub format: String,
    pub summary: String,
    pub size_bytes: u64,
    pub word_count: u32,
    pub line_count: u32,
    pub indexed_at: u64,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct KnowledgeVaultState {
    pub total_documents: u32,
    pub total_size_bytes: u64,
    pub category_counts: HashMap<String, u32>,
    pub last_ingestion: Option<u64>,
    pub entries: Vec<KnowledgeEntry>,
}

fn load_knowledge_vault() -> KnowledgeVaultState {
    let path = get_data_dir().join("knowledge_vault.json");
    if let Ok(content) = fs::read_to_string(&path) {
        if let Ok(state) = serde_json::from_str(&content) {
            return state;
        }
    }
    KnowledgeVaultState::default()
}

fn save_knowledge_vault(state: &KnowledgeVaultState) -> CommandResult<()> {
    let dir = ensure_data_dir()?;
    let path = dir.join("knowledge_vault.json");
    let content =
        serde_json::to_string_pretty(state).map_err(|e| format!("Failed to serialize: {}", e))?;
    fs::write(&path, content).map_err(|e| format!("Failed to write: {}", e))
}

fn detect_category(path: &str) -> String {
    let ext = path.rsplit('.').next().unwrap_or("");
    match ext {
        "rs" => "code-rust",
        "ts" | "tsx" => "code-typescript",
        "js" | "jsx" => "code-javascript",
        "py" => "code-python",
        "md" => "document",
        "json" | "yaml" | "toml" => "config",
        "txt" => "notes",
        _ => "unknown",
    }
    .to_string()
}

fn generate_summary(content: &str, max_len: usize) -> String {
    let cleaned: String = content
        .lines()
        .filter(|l| {
            !l.trim().is_empty() && !l.trim().starts_with("//") && !l.trim().starts_with("#")
        })
        .take(5)
        .collect::<Vec<_>>()
        .join(" ");

    if cleaned.len() > max_len {
        format!("{}...", &cleaned[..max_len])
    } else {
        cleaned
    }
}

#[tauri::command]
pub async fn cognitive_get_knowledge_vault() -> CommandResult<KnowledgeVaultState> {
    log::info!("[Cognitive] get_knowledge_vault");
    Ok(load_knowledge_vault())
}

#[tauri::command]
pub async fn cognitive_ingest_file(
    path: String,
    title: Option<String>,
) -> CommandResult<KnowledgeEntry> {
    log::info!("[Cognitive] ingest_file: {}", path);

    // Read file
    let content = fs::read_to_string(&path).map_err(|e| format!("Failed to read file: {}", e))?;

    let metadata = fs::metadata(&path).map_err(|e| format!("Failed to get metadata: {}", e))?;

    let now = chrono::Utc::now().timestamp_millis() as u64;
    let file_name = path.rsplit('/').next().unwrap_or(&path);

    let entry = KnowledgeEntry {
        id: format!("kv_{}", now),
        title: title.unwrap_or_else(|| file_name.to_string()),
        path: path.clone(),
        category: detect_category(&path),
        format: path.rsplit('.').next().unwrap_or("unknown").to_string(),
        summary: generate_summary(&content, 200),
        size_bytes: metadata.len(),
        word_count: content.split_whitespace().count() as u32,
        line_count: content.lines().count() as u32,
        indexed_at: now,
        tags: vec![],
    };

    // Add to vault
    let mut vault = load_knowledge_vault();
    vault.entries.push(entry.clone());
    vault.total_documents = vault.entries.len() as u32;
    vault.total_size_bytes = vault.entries.iter().map(|e| e.size_bytes).sum();
    vault.last_ingestion = Some(now);

    // Update category counts
    *vault
        .category_counts
        .entry(entry.category.clone())
        .or_insert(0) += 1;

    save_knowledge_vault(&vault)?;

    // Add XP for ingestion
    let _ = cognitive_add_xp(
        15,
        "knowledge_ingest".into(),
        format!("Imported: {}", entry.title),
    )
    .await;

    Ok(entry)
}

#[tauri::command]
pub async fn cognitive_search_knowledge(query: String) -> CommandResult<Vec<KnowledgeEntry>> {
    log::info!("[Cognitive] search_knowledge: {}", query);

    let vault = load_knowledge_vault();
    let query_lower = query.to_lowercase();

    let results: Vec<KnowledgeEntry> = vault
        .entries
        .into_iter()
        .filter(|e| {
            e.title.to_lowercase().contains(&query_lower)
                || e.summary.to_lowercase().contains(&query_lower)
                || e.tags
                    .iter()
                    .any(|t| t.to_lowercase().contains(&query_lower))
        })
        .collect();

    Ok(results)
}

#[tauri::command]
pub async fn cognitive_delete_knowledge(id: String) -> CommandResult<()> {
    log::info!("[Cognitive] delete_knowledge: {}", id);

    let mut vault = load_knowledge_vault();

    if let Some(pos) = vault.entries.iter().position(|e| e.id == id) {
        let entry = vault.entries.remove(pos);
        vault.total_documents = vault.entries.len() as u32;
        vault.total_size_bytes = vault.entries.iter().map(|e| e.size_bytes).sum();

        if let Some(count) = vault.category_counts.get_mut(&entry.category) {
            *count = count.saturating_sub(1);
        }

        save_knowledge_vault(&vault)?;
    }

    Ok(())
}

// ═══════════════════════════════════════════════════════════════════════════
// EVOLUTION ENGINE
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EvolutionState {
    pub version: String,
    pub phase: String,
    pub total_cycles: u32,
    pub total_mutations: u32,
    pub last_update: u64,
    pub changelog: Vec<ChangelogEntry>,
    pub metrics: EvolutionMetrics,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChangelogEntry {
    pub version: String,
    pub date: String,
    pub entry_type: String,
    pub title: String,
    pub description: String,
    pub changes: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct EvolutionMetrics {
    pub stability: f32,
    pub coherence: f32,
    pub performance: f32,
    pub cognitive_depth: f32,
}

impl Default for EvolutionState {
    fn default() -> Self {
        Self {
            version: "19.3.0".into(),
            phase: "learning".into(),
            total_cycles: 0,
            total_mutations: 0,
            last_update: chrono::Utc::now().timestamp_millis() as u64,
            changelog: default_changelog(),
            metrics: EvolutionMetrics {
                stability: 0.85,
                coherence: 0.80,
                performance: 0.75,
                cognitive_depth: 0.60,
            },
        }
    }
}

fn default_changelog() -> Vec<ChangelogEntry> {
    vec![ChangelogEntry {
        version: "19.3.0".into(),
        date: "2025-12-01".into(),
        entry_type: "major".into(),
        title: "Centre d'Évolution Cognitive".into(),
        description: "Fusion Progression + Knowledge + Evolution + Memory".into(),
        changes: vec![
            "XP Engine unifié avec persistence".into(),
            "Knowledge Vault avec ingestion".into(),
            "Evolution Engine avec changelog".into(),
            "Memory Engine CT/MT/LT".into(),
        ],
    }]
}

fn load_evolution() -> EvolutionState {
    let path = get_data_dir().join("evolution_state.json");
    if let Ok(content) = fs::read_to_string(&path) {
        if let Ok(state) = serde_json::from_str(&content) {
            return state;
        }
    }
    EvolutionState::default()
}

fn save_evolution(state: &EvolutionState) -> CommandResult<()> {
    let dir = ensure_data_dir()?;
    let path = dir.join("evolution_state.json");
    let content =
        serde_json::to_string_pretty(state).map_err(|e| format!("Failed to serialize: {}", e))?;
    fs::write(&path, content).map_err(|e| format!("Failed to write: {}", e))
}

#[tauri::command]
pub async fn cognitive_get_evolution() -> CommandResult<EvolutionState> {
    log::info!("[Cognitive] get_evolution");
    Ok(load_evolution())
}

#[tauri::command]
pub async fn cognitive_run_evolution_cycle() -> CommandResult<EvolutionState> {
    log::info!("[Cognitive] run_evolution_cycle");

    let mut state = load_evolution();
    state.total_cycles += 1;
    state.last_update = chrono::Utc::now().timestamp_millis() as u64;

    // Améliorer les métriques légèrement
    state.metrics.stability = (state.metrics.stability + 0.01).min(1.0);
    state.metrics.coherence = (state.metrics.coherence + 0.01).min(1.0);
    state.metrics.performance = (state.metrics.performance + 0.005).min(1.0);
    state.metrics.cognitive_depth = (state.metrics.cognitive_depth + 0.02).min(1.0);

    // Mettre à jour la phase
    state.phase = match state.total_cycles {
        0..=5 => "nascent",
        6..=20 => "learning",
        21..=50 => "adapting",
        51..=100 => "optimizing",
        101..=200 => "evolving",
        _ => "singularity",
    }
    .into();

    save_evolution(&state)?;

    // Add XP for evolution cycle
    let _ = cognitive_add_xp(
        30,
        "evolution_cycle".into(),
        "Cycle d'évolution complété".into(),
    )
    .await;

    Ok(state)
}

#[tauri::command]
pub async fn cognitive_add_changelog(
    version: String,
    title: String,
    description: String,
    changes: Vec<String>,
) -> CommandResult<EvolutionState> {
    log::info!("[Cognitive] add_changelog: {} - {}", version, title);

    let mut state = load_evolution();

    let entry = ChangelogEntry {
        version: version.clone(),
        date: chrono::Utc::now().format("%Y-%m-%d").to_string(),
        entry_type: "minor".into(),
        title,
        description,
        changes,
    };

    state.changelog.insert(0, entry);
    state.version = version;
    state.last_update = chrono::Utc::now().timestamp_millis() as u64;

    save_evolution(&state)?;
    Ok(state)
}

// ═══════════════════════════════════════════════════════════════════════════
// MEMORY ENGINE (CT/MT/LT)
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MemoryState {
    pub short_term: Vec<MemoryItem>,
    pub medium_term: Vec<MemoryItem>,
    pub long_term: Vec<MemoryItem>,
    pub stats: MemoryStats,
    pub last_consolidation: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MemoryItem {
    pub id: String,
    pub content: String,
    pub memory_type: String,
    pub importance: f32,
    pub strength: f32,
    pub created_at: u64,
    pub last_access: u64,
    pub access_count: u32,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MemoryStats {
    pub total_memories: u32,
    pub short_term_count: u32,
    pub medium_term_count: u32,
    pub long_term_count: u32,
    pub total_size_bytes: u64,
    pub compression_ratio: f32,
    pub last_retrieval: u64,
    pub memory_usage: f32,
}

impl Default for MemoryState {
    fn default() -> Self {
        Self {
            short_term: vec![],
            medium_term: vec![],
            long_term: vec![],
            stats: MemoryStats::default(),
            last_consolidation: chrono::Utc::now().timestamp_millis() as u64,
        }
    }
}

fn load_memory() -> MemoryState {
    let path = get_data_dir().join("memory_state.json");
    if let Ok(content) = fs::read_to_string(&path) {
        if let Ok(state) = serde_json::from_str(&content) {
            return state;
        }
    }
    MemoryState::default()
}

fn save_memory(state: &MemoryState) -> CommandResult<()> {
    let dir = ensure_data_dir()?;
    let path = dir.join("memory_state.json");
    let content =
        serde_json::to_string_pretty(state).map_err(|e| format!("Failed to serialize: {}", e))?;
    fs::write(&path, content).map_err(|e| format!("Failed to write: {}", e))
}

fn update_memory_stats(state: &mut MemoryState) {
    state.stats.short_term_count = state.short_term.len() as u32;
    state.stats.medium_term_count = state.medium_term.len() as u32;
    state.stats.long_term_count = state.long_term.len() as u32;
    state.stats.total_memories =
        state.stats.short_term_count + state.stats.medium_term_count + state.stats.long_term_count;

    let total_size: usize = state
        .short_term
        .iter()
        .map(|m| m.content.len())
        .sum::<usize>()
        + state
            .medium_term
            .iter()
            .map(|m| m.content.len())
            .sum::<usize>()
        + state
            .long_term
            .iter()
            .map(|m| m.content.len())
            .sum::<usize>();

    state.stats.total_size_bytes = total_size as u64;
    state.stats.compression_ratio = 0.9; // Placeholder
    state.stats.last_retrieval = chrono::Utc::now().timestamp_millis() as u64;
    state.stats.memory_usage = (total_size as f32) / (1024.0 * 1024.0); // MB
}

#[tauri::command]
pub async fn cognitive_get_memory() -> CommandResult<MemoryState> {
    log::info!("[Cognitive] get_memory");
    let mut state = load_memory();
    update_memory_stats(&mut state);
    Ok(state)
}

#[tauri::command]
pub async fn cognitive_store_memory(
    content: String,
    memory_type: String,
    importance: f32,
    tags: Vec<String>,
) -> CommandResult<MemoryItem> {
    log::info!(
        "[Cognitive] store_memory: type={}, importance={}",
        memory_type,
        importance
    );

    let now = chrono::Utc::now().timestamp_millis() as u64;

    let item = MemoryItem {
        id: format!("mem_{}", now),
        content,
        memory_type: memory_type.clone(),
        importance,
        strength: 1.0,
        created_at: now,
        last_access: now,
        access_count: 0,
        tags,
    };

    let mut state = load_memory();

    // Store based on importance
    if importance >= 0.8 {
        state.long_term.push(item.clone());
    } else if importance >= 0.5 {
        state.medium_term.push(item.clone());
    } else {
        state.short_term.push(item.clone());
    }

    // Limit sizes
    const MAX_SHORT: usize = 100;
    const MAX_MEDIUM: usize = 500;
    const MAX_LONG: usize = 1000;

    if state.short_term.len() > MAX_SHORT {
        state
            .short_term
            .drain(0..(state.short_term.len() - MAX_SHORT));
    }
    if state.medium_term.len() > MAX_MEDIUM {
        state
            .medium_term
            .drain(0..(state.medium_term.len() - MAX_MEDIUM));
    }
    if state.long_term.len() > MAX_LONG {
        state.long_term.drain(0..(state.long_term.len() - MAX_LONG));
    }

    update_memory_stats(&mut state);
    save_memory(&state)?;

    Ok(item)
}

#[tauri::command]
pub async fn cognitive_purge_memory(level: String) -> CommandResult<MemoryStats> {
    log::info!("[Cognitive] purge_memory: {}", level);

    let mut state = load_memory();

    match level.as_str() {
        "short" => state.short_term.clear(),
        "medium" => state.medium_term.clear(),
        "long" => state.long_term.clear(),
        "all" => {
            state.short_term.clear();
            state.medium_term.clear();
            state.long_term.clear();
        }
        _ => return Err("Invalid level: use short, medium, long, or all".into()),
    }

    update_memory_stats(&mut state);
    save_memory(&state)?;

    Ok(state.stats)
}

#[tauri::command]
pub async fn cognitive_consolidate_memory() -> CommandResult<MemoryStats> {
    log::info!("[Cognitive] consolidate_memory");

    let mut state = load_memory();
    let now = chrono::Utc::now().timestamp_millis() as u64;

    // Move high-importance short-term to medium-term
    let to_promote: Vec<MemoryItem> = state
        .short_term
        .iter()
        .filter(|m| m.importance >= 0.6 || m.access_count >= 3)
        .cloned()
        .collect();

    state
        .short_term
        .retain(|m| m.importance < 0.6 && m.access_count < 3);
    state.medium_term.extend(to_promote);

    // Move high-importance medium-term to long-term
    let to_promote: Vec<MemoryItem> = state
        .medium_term
        .iter()
        .filter(|m| m.importance >= 0.8 || m.access_count >= 5)
        .cloned()
        .collect();

    state
        .medium_term
        .retain(|m| m.importance < 0.8 && m.access_count < 5);
    state.long_term.extend(to_promote);

    state.last_consolidation = now;
    update_memory_stats(&mut state);
    save_memory(&state)?;

    Ok(state.stats)
}

#[tauri::command]
pub async fn cognitive_backup_memory() -> CommandResult<String> {
    log::info!("[Cognitive] backup_memory");

    let state = load_memory();
    let dir = ensure_data_dir()?;
    let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S");
    let backup_path = dir.join(format!("memory_backup_{}.json", timestamp));

    let content =
        serde_json::to_string_pretty(&state).map_err(|e| format!("Failed to serialize: {}", e))?;
    fs::write(&backup_path, content).map_err(|e| format!("Failed to write backup: {}", e))?;

    Ok(backup_path.to_string_lossy().to_string())
}

// ═══════════════════════════════════════════════════════════════════════════
// UNIFIED STATE (SingularityState integration)
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CognitiveUnifiedState {
    pub progression: ProgressionState,
    pub knowledge: KnowledgeVaultState,
    pub evolution: EvolutionState,
    pub memory: MemoryState,
}

#[tauri::command]
pub async fn cognitive_get_unified_state() -> CommandResult<CognitiveUnifiedState> {
    log::info!("[Cognitive] get_unified_state");

    let progression = load_progression();
    let knowledge = load_knowledge_vault();
    let evolution = load_evolution();
    let mut memory = load_memory();
    update_memory_stats(&mut memory);

    Ok(CognitiveUnifiedState {
        progression,
        knowledge,
        evolution,
        memory,
    })
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND LIST (for registration)
// ═══════════════════════════════════════════════════════════════════════════

#[allow(dead_code)]
pub fn get_cognitive_center_commands() -> Vec<&'static str> {
    vec![
        "cognitive_get_progression",
        "cognitive_add_xp",
        "cognitive_reset_progression",
        "cognitive_get_knowledge_vault",
        "cognitive_ingest_file",
        "cognitive_search_knowledge",
        "cognitive_delete_knowledge",
        "cognitive_get_evolution",
        "cognitive_run_evolution_cycle",
        "cognitive_add_changelog",
        "cognitive_get_memory",
        "cognitive_store_memory",
        "cognitive_purge_memory",
        "cognitive_consolidate_memory",
        "cognitive_backup_memory",
        "cognitive_get_unified_state",
    ]
}
