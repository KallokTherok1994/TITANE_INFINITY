// ═══════════════════════════════════════════════════════════════════════════
// TITANE∞ v19.5.0 — CENTRE D'ORCHESTRATION COGNITIVE (OPUS #5/6/7)
// Fusion: Multi-AI + Nexus + Harmonia + Timeline + Cognitive State
// ═══════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};
use lazy_static::lazy_static;

type CommandResult<T> = Result<T, String>;

// ─────────────────────────────────────────────────────────────────────────────
// PATHS - Data storage locations
// ─────────────────────────────────────────────────────────────────────────────

fn get_data_dir() -> PathBuf {
    let home = std::env::var("HOME").unwrap_or_else(|_| "/tmp".to_string());
    PathBuf::from(home).join(".local/share/titane-infinity/orchestration")
}

fn ensure_data_dir() -> CommandResult<PathBuf> {
    let dir = get_data_dir();
    fs::create_dir_all(&dir).map_err(|e| format!("Failed to create data dir: {}", e))?;
    Ok(dir)
}

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1: MULTI-AI ENGINE (Sélection IA Automatique)
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProviderStatus {
    pub name: String,
    pub available: bool,
    pub latency_ms: u64,
    pub score: u8,  // 0-100
    pub last_checked: u64,
    pub error: Option<String>,
    pub model: Option<String>,
    pub capabilities: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MultiAIState {
    pub providers: Vec<ProviderStatus>,
    pub best_provider: String,
    pub auto_mode: bool,
    pub global_score: u8,
    pub last_update: u64,
}

impl Default for MultiAIState {
    fn default() -> Self {
        Self {
            providers: vec![
                ProviderStatus {
                    name: "gemini".into(),
                    available: false,
                    latency_ms: 0,
                    score: 0,
                    last_checked: 0,
                    error: Some("Not checked".into()),
                    model: Some("gemini-2.0-flash-exp".into()),
                    capabilities: vec!["text".into(), "multimodal".into(), "streaming".into()],
                },
                ProviderStatus {
                    name: "ollama".into(),
                    available: false,
                    latency_ms: 0,
                    score: 0,
                    last_checked: 0,
                    error: Some("Not checked".into()),
                    model: Some("titane-local".into()),
                    capabilities: vec!["text".into(), "local".into(), "offline".into()],
                },
                ProviderStatus {
                    name: "local".into(),
                    available: true,
                    latency_ms: 5,
                    score: 50,
                    last_checked: now_ms(),
                    error: None,
                    model: Some("fallback".into()),
                    capabilities: vec!["text".into(), "offline".into(), "basic".into()],
                },
            ],
            best_provider: "local".into(),
            auto_mode: true,
            global_score: 50,
            last_update: now_ms(),
        }
    }
}

lazy_static! {
    static ref MULTI_AI_STATE: Mutex<MultiAIState> = Mutex::new(MultiAIState::default());
}

/// Ping Gemini provider (via backend)
async fn ping_gemini_internal() -> ProviderStatus {
    let start = std::time::Instant::now();
    let now = now_ms();

    // Check if GEMINI_API_KEY is set
    let has_key = std::env::var("GEMINI_API_KEY").is_ok();

    if !has_key {
        return ProviderStatus {
            name: "gemini".into(),
            available: false,
            latency_ms: 0,
            score: 0,
            last_checked: now,
            error: Some("API key not configured".into()),
            model: Some("gemini-2.0-flash-exp".into()),
            capabilities: vec!["text".into(), "multimodal".into(), "streaming".into()],
        };
    }

    // Try to ping Gemini API (simplified check)
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(5))
        .build();

    match client {
        Ok(c) => {
            let api_key = std::env::var("GEMINI_API_KEY").unwrap_or_default();
            let url = format!(
                "https://generativelanguage.googleapis.com/v1beta/models?key={}",
                api_key
            );

            match c.get(&url).send().await {
                Ok(resp) => {
                    let latency = start.elapsed().as_millis() as u64;
                    let available = resp.status().is_success();
                    let score = if available {
                        calculate_provider_score(latency, true, 95)
                    } else {
                        0
                    };

                    ProviderStatus {
                        name: "gemini".into(),
                        available,
                        latency_ms: latency,
                        score,
                        last_checked: now,
                        error: if available { None } else { Some(format!("HTTP {}", resp.status())) },
                        model: Some("gemini-2.0-flash-exp".into()),
                        capabilities: vec!["text".into(), "multimodal".into(), "streaming".into()],
                    }
                }
                Err(e) => ProviderStatus {
                    name: "gemini".into(),
                    available: false,
                    latency_ms: start.elapsed().as_millis() as u64,
                    score: 0,
                    last_checked: now,
                    error: Some(format!("Connection error: {}", e)),
                    model: Some("gemini-2.0-flash-exp".into()),
                    capabilities: vec!["text".into(), "multimodal".into(), "streaming".into()],
                },
            }
        }
        Err(e) => ProviderStatus {
            name: "gemini".into(),
            available: false,
            latency_ms: 0,
            score: 0,
            last_checked: now,
            error: Some(format!("Client error: {}", e)),
            model: Some("gemini-2.0-flash-exp".into()),
            capabilities: vec!["text".into(), "multimodal".into(), "streaming".into()],
        },
    }
}

/// Ping Ollama local provider
async fn ping_ollama_internal() -> ProviderStatus {
    let start = std::time::Instant::now();
    let now = now_ms();
    let ollama_url = std::env::var("OLLAMA_BASE_URL")
        .unwrap_or_else(|_| "http://localhost:11434".into());

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(3))
        .build();

    match client {
        Ok(c) => {
            match c.get(format!("{}/api/tags", ollama_url)).send().await {
                Ok(resp) => {
                    let latency = start.elapsed().as_millis() as u64;
                    let available = resp.status().is_success();
                    let score = if available {
                        calculate_provider_score(latency, true, 85)
                    } else {
                        0
                    };

                    ProviderStatus {
                        name: "ollama".into(),
                        available,
                        latency_ms: latency,
                        score,
                        last_checked: now,
                        error: if available { None } else { Some(format!("HTTP {}", resp.status())) },
                        model: Some("titane-local".into()),
                        capabilities: vec!["text".into(), "local".into(), "offline".into()],
                    }
                }
                Err(e) => ProviderStatus {
                    name: "ollama".into(),
                    available: false,
                    latency_ms: start.elapsed().as_millis() as u64,
                    score: 0,
                    last_checked: now,
                    error: Some(format!("Not running: {}", e)),
                    model: Some("titane-local".into()),
                    capabilities: vec!["text".into(), "local".into(), "offline".into()],
                },
            }
        }
        Err(e) => ProviderStatus {
            name: "ollama".into(),
            available: false,
            latency_ms: 0,
            score: 0,
            last_checked: now,
            error: Some(format!("Client error: {}", e)),
            model: Some("titane-local".into()),
            capabilities: vec!["text".into(), "local".into(), "offline".into()],
        },
    }
}

/// Calculate provider score based on latency, availability, and quality
fn calculate_provider_score(latency_ms: u64, available: bool, base_quality: u8) -> u8 {
    if !available {
        return 0;
    }

    // Latency penalty: 0-100ms = 0, 100-500ms = -10, 500-1000ms = -20, >1000ms = -30
    let latency_penalty = if latency_ms < 100 {
        0
    } else if latency_ms < 500 {
        10
    } else if latency_ms < 1000 {
        20
    } else {
        30
    };

    base_quality.saturating_sub(latency_penalty)
}

/// Select best provider based on scores
fn select_best_provider(providers: &[ProviderStatus]) -> String {
    providers
        .iter()
        .filter(|p| p.available)
        .max_by_key(|p| p.score)
        .map(|p| p.name.clone())
        .unwrap_or_else(|| "local".into())
}

// ─────────────────────────────────────────────────────────────────────────────
// MULTI-AI TAURI COMMANDS
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn orchestration_get_multi_ai() -> CommandResult<MultiAIState> {
    let state = MULTI_AI_STATE.lock().map_err(|e| e.to_string())?;
    Ok(state.clone())
}

#[tauri::command]
pub async fn orchestration_ping_providers() -> CommandResult<MultiAIState> {
    // Ping all providers
    let gemini = ping_gemini_internal().await;
    let ollama = ping_ollama_internal().await;
    let local = ProviderStatus {
        name: "local".into(),
        available: true,
        latency_ms: 5,
        score: 50,
        last_checked: now_ms(),
        error: None,
        model: Some("fallback".into()),
        capabilities: vec!["text".into(), "offline".into(), "basic".into()],
    };

    let providers = vec![gemini, ollama, local];
    let best = select_best_provider(&providers);
    let global_score = providers.iter()
        .filter(|p| p.available)
        .map(|p| p.score as u32)
        .max()
        .unwrap_or(0) as u8;

    let new_state = MultiAIState {
        providers,
        best_provider: best,
        auto_mode: true,
        global_score,
        last_update: now_ms(),
    };

    // Update state
    let mut state = MULTI_AI_STATE.lock().map_err(|e| e.to_string())?;
    *state = new_state.clone();

    Ok(new_state)
}

#[tauri::command]
pub async fn orchestration_force_provider(provider_name: String) -> CommandResult<MultiAIState> {
    let mut state = MULTI_AI_STATE.lock().map_err(|e| e.to_string())?;
    state.best_provider = provider_name;
    state.auto_mode = false;
    state.last_update = now_ms();
    Ok(state.clone())
}

#[tauri::command]
pub async fn orchestration_set_auto_mode(enabled: bool) -> CommandResult<MultiAIState> {
    let mut state = MULTI_AI_STATE.lock().map_err(|e| e.to_string())?;
    state.auto_mode = enabled;
    if enabled {
        state.best_provider = select_best_provider(&state.providers);
    }
    state.last_update = now_ms();
    Ok(state.clone())
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2: NEXUS ENGINE (Cohérence Cognitive)
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NexusNode {
    pub id: String,
    pub name: String,
    pub node_type: String,
    pub active: bool,
    pub health: u8,
    pub connections: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NexusState {
    pub active_nodes: u32,
    pub total_nodes: u32,
    pub link_count: u32,
    pub coherence_score: u8,  // 0-100
    pub nodes: Vec<NexusNode>,
    pub anomalies: Vec<String>,
    pub last_update: u64,
}

lazy_static! {
    static ref NEXUS_STATE: Mutex<NexusState> = Mutex::new(NexusState::default());
}

impl Default for NexusState {
    fn default() -> Self {
        let nodes = vec![
            NexusNode { id: "helios".into(), name: "Helios".into(), node_type: "physical".into(), active: true, health: 100, connections: vec!["harmonia".into(), "watchdog".into()] },
            NexusNode { id: "harmonia".into(), name: "Harmonia".into(), node_type: "flow".into(), active: true, health: 100, connections: vec!["helios".into(), "nexus".into()] },
            NexusNode { id: "nexus".into(), name: "Nexus".into(), node_type: "cognitive".into(), active: true, health: 100, connections: vec!["harmonia".into(), "memory".into()] },
            NexusNode { id: "memory".into(), name: "Memory".into(), node_type: "storage".into(), active: true, health: 100, connections: vec!["nexus".into(), "knowledge".into()] },
            NexusNode { id: "knowledge".into(), name: "Knowledge".into(), node_type: "storage".into(), active: true, health: 95, connections: vec!["memory".into()] },
            NexusNode { id: "watchdog".into(), name: "Watchdog".into(), node_type: "security".into(), active: true, health: 100, connections: vec!["helios".into(), "selfheal".into()] },
            NexusNode { id: "selfheal".into(), name: "Self-Heal".into(), node_type: "repair".into(), active: true, health: 100, connections: vec!["watchdog".into()] },
            NexusNode { id: "chat_ai".into(), name: "Chat IA".into(), node_type: "ai".into(), active: true, health: 100, connections: vec!["memory".into(), "harmonia".into()] },
        ];

        let active = nodes.iter().filter(|n| n.active).count() as u32;
        let links = nodes.iter().map(|n| n.connections.len()).sum::<usize>() as u32 / 2;

        Self {
            active_nodes: active,
            total_nodes: nodes.len() as u32,
            link_count: links,
            coherence_score: 95,
            nodes,
            anomalies: vec![],
            last_update: now_ms(),
        }
    }
}

fn calculate_nexus_coherence(nodes: &[NexusNode]) -> u8 {
    if nodes.is_empty() {
        return 0;
    }

    let active_count = nodes.iter().filter(|n| n.active).count();
    let avg_health: u32 = nodes.iter().map(|n| n.health as u32).sum::<u32>() / nodes.len() as u32;
    let connectivity = nodes.iter().map(|n| n.connections.len()).sum::<usize>() as f32 / nodes.len() as f32;

    // Score = (active_ratio * 40) + (avg_health * 0.4) + (connectivity_bonus * 20)
    let active_ratio = (active_count as f32 / nodes.len() as f32) * 40.0;
    let health_score = avg_health as f32 * 0.4;
    let connectivity_bonus = (connectivity / 2.0).min(1.0) * 20.0;

    (active_ratio + health_score + connectivity_bonus).min(100.0) as u8
}

#[tauri::command]
pub async fn orchestration_get_nexus() -> CommandResult<NexusState> {
    let mut state = NEXUS_STATE.lock().map_err(|e| e.to_string())?;
    state.coherence_score = calculate_nexus_coherence(&state.nodes);
    state.last_update = now_ms();
    Ok(state.clone())
}

#[tauri::command]
pub async fn orchestration_update_nexus_node(node_id: String, active: bool, health: u8) -> CommandResult<NexusState> {
    let mut state = NEXUS_STATE.lock().map_err(|e| e.to_string())?;

    if let Some(node) = state.nodes.iter_mut().find(|n| n.id == node_id) {
        node.active = active;
        node.health = health;
    }

    state.active_nodes = state.nodes.iter().filter(|n| n.active).count() as u32;
    state.coherence_score = calculate_nexus_coherence(&state.nodes);
    state.last_update = now_ms();

    Ok(state.clone())
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3: HARMONIA ENGINE (Équilibrage des Flux)
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FlowMetrics {
    pub id: String,
    pub name: String,
    pub cpu_usage: f32,
    pub ram_usage: f32,
    pub io_rate: f32,
    pub status: String,  // active, idle, throttled
    pub priority: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HarmoniaState {
    pub active_flows: Vec<FlowMetrics>,
    pub cpu_usage: f32,
    pub ram_usage: f32,
    pub io_balance: f32,
    pub harmony_score: u8,  // 0-100
    pub mode: String,  // normal, balanced, throttled
    pub last_update: u64,
}

lazy_static! {
    static ref HARMONIA_STATE: Mutex<HarmoniaState> = Mutex::new(HarmoniaState::default());
}

impl Default for HarmoniaState {
    fn default() -> Self {
        Self {
            active_flows: vec![
                FlowMetrics { id: "chat".into(), name: "Chat IA".into(), cpu_usage: 5.0, ram_usage: 8.0, io_rate: 2.0, status: "active".into(), priority: 1 },
                FlowMetrics { id: "memory".into(), name: "Memory Engine".into(), cpu_usage: 3.0, ram_usage: 12.0, io_rate: 5.0, status: "active".into(), priority: 2 },
                FlowMetrics { id: "knowledge".into(), name: "Knowledge Vault".into(), cpu_usage: 2.0, ram_usage: 6.0, io_rate: 3.0, status: "idle".into(), priority: 3 },
                FlowMetrics { id: "selfheal".into(), name: "Self-Healing".into(), cpu_usage: 1.0, ram_usage: 2.0, io_rate: 1.0, status: "active".into(), priority: 2 },
                FlowMetrics { id: "ui".into(), name: "Interface".into(), cpu_usage: 4.0, ram_usage: 15.0, io_rate: 1.0, status: "active".into(), priority: 1 },
            ],
            cpu_usage: 15.0,
            ram_usage: 43.0,
            io_balance: 85.0,
            harmony_score: 90,
            mode: "normal".into(),
            last_update: now_ms(),
        }
    }
}

fn calculate_harmony_score(flows: &[FlowMetrics], cpu: f32, ram: f32) -> (u8, String) {
    let active_count = flows.iter().filter(|f| f.status == "active").count();
    let throttled_count = flows.iter().filter(|f| f.status == "throttled").count();

    let cpu_score = if cpu < 60.0 { 100.0 } else if cpu < 80.0 { 80.0 } else { 50.0 };
    let ram_score = if ram < 70.0 { 100.0 } else if ram < 85.0 { 75.0 } else { 40.0 };
    let balance_score = if throttled_count == 0 { 100.0 } else { 70.0 };

    let score = ((cpu_score + ram_score + balance_score) / 3.0) as u8;

    let mode = if cpu > 80.0 || ram > 85.0 {
        "throttled"
    } else if cpu > 60.0 || ram > 70.0 {
        "balanced"
    } else {
        "normal"
    };

    (score, mode.into())
}

#[tauri::command]
pub async fn orchestration_get_harmonia() -> CommandResult<HarmoniaState> {
    // Get real CPU/RAM from system
    let mut sys = sysinfo::System::new();
    sys.refresh_cpu();
    sys.refresh_memory();

    let cpu_usage = sys.cpus().first().map(|c| c.cpu_usage()).unwrap_or(0.0);
    let total_mem = sys.total_memory() as f32;
    let used_mem = sys.used_memory() as f32;
    let ram_usage = if total_mem > 0.0 { (used_mem / total_mem) * 100.0 } else { 0.0 };

    let mut state = HARMONIA_STATE.lock().map_err(|e| e.to_string())?;
    state.cpu_usage = cpu_usage;
    state.ram_usage = ram_usage;

    let (score, mode) = calculate_harmony_score(&state.active_flows, cpu_usage, ram_usage);
    state.harmony_score = score;
    state.mode = mode;
    state.last_update = now_ms();

    Ok(state.clone())
}

#[tauri::command]
pub async fn orchestration_throttle_flow(flow_id: String, throttle: bool) -> CommandResult<HarmoniaState> {
    let mut state = HARMONIA_STATE.lock().map_err(|e| e.to_string())?;

    if let Some(flow) = state.active_flows.iter_mut().find(|f| f.id == flow_id) {
        flow.status = if throttle { "throttled".into() } else { "active".into() };
    }

    let (score, mode) = calculate_harmony_score(&state.active_flows, state.cpu_usage, state.ram_usage);
    state.harmony_score = score;
    state.mode = mode;
    state.last_update = now_ms();

    Ok(state.clone())
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4: TIME NAVIGATOR (Timeline Interne)
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TimelineEvent {
    pub id: String,
    pub timestamp: u64,
    pub category: String,  // chat, memory, system, healing, evolution, user
    pub message: String,
    pub severity: String,  // info, warning, error, success
    pub metadata: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TimelineState {
    pub events: Vec<TimelineEvent>,
    pub total_events: u64,
    pub categories: HashMap<String, u32>,
    pub oldest_event: u64,
    pub newest_event: u64,
}

lazy_static! {
    static ref TIMELINE_STATE: Mutex<Vec<TimelineEvent>> = Mutex::new(Vec::new());
}

fn get_timeline_path() -> PathBuf {
    get_data_dir().join("timeline.json")
}

fn load_timeline() -> Vec<TimelineEvent> {
    let path = get_timeline_path();
    if path.exists() {
        fs::read_to_string(&path)
            .ok()
            .and_then(|s| serde_json::from_str(&s).ok())
            .unwrap_or_default()
    } else {
        Vec::new()
    }
}

fn save_timeline(events: &[TimelineEvent]) -> CommandResult<()> {
    let _ = ensure_data_dir()?;
    let path = get_timeline_path();
    let json = serde_json::to_string_pretty(events)
        .map_err(|e| format!("Serialization error: {}", e))?;
    fs::write(&path, json).map_err(|e| format!("Write error: {}", e))?;
    Ok(())
}

#[tauri::command]
pub async fn orchestration_get_timeline(limit: Option<u32>, category: Option<String>) -> CommandResult<TimelineState> {
    let mut events = TIMELINE_STATE.lock().map_err(|e| e.to_string())?;

    // Load from disk if empty
    if events.is_empty() {
        *events = load_timeline();
    }

    let mut filtered: Vec<TimelineEvent> = events
        .iter()
        .filter(|e| category.as_ref().map_or(true, |c| &e.category == c))
        .cloned()
        .collect();

    filtered.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

    if let Some(l) = limit {
        filtered.truncate(l as usize);
    }

    let mut categories: HashMap<String, u32> = HashMap::new();
    for event in events.iter() {
        *categories.entry(event.category.clone()).or_insert(0) += 1;
    }

    let oldest = events.iter().map(|e| e.timestamp).min().unwrap_or(0);
    let newest = events.iter().map(|e| e.timestamp).max().unwrap_or(0);

    Ok(TimelineState {
        events: filtered,
        total_events: events.len() as u64,
        categories,
        oldest_event: oldest,
        newest_event: newest,
    })
}

#[tauri::command]
pub async fn orchestration_add_timeline_event(
    category: String,
    message: String,
    severity: Option<String>,
    metadata: Option<HashMap<String, serde_json::Value>>,
) -> CommandResult<TimelineEvent> {
    let event = TimelineEvent {
        id: uuid::Uuid::new_v4().to_string(),
        timestamp: now_ms(),
        category,
        message,
        severity: severity.unwrap_or_else(|| "info".into()),
        metadata: metadata.unwrap_or_default(),
    };

    let mut events = TIMELINE_STATE.lock().map_err(|e| e.to_string())?;
    events.push(event.clone());

    // Keep last 1000 events
    if events.len() > 1000 {
        events.drain(0..events.len() - 1000);
    }

    // Save to disk
    save_timeline(&events)?;

    Ok(event)
}

#[tauri::command]
pub async fn orchestration_clear_timeline(older_than_days: Option<u32>) -> CommandResult<u32> {
    let mut events = TIMELINE_STATE.lock().map_err(|e| e.to_string())?;
    let initial_count = events.len();

    if let Some(days) = older_than_days {
        let threshold = now_ms() - (days as u64 * 24 * 60 * 60 * 1000);
        events.retain(|e| e.timestamp > threshold);
    } else {
        events.clear();
    }

    save_timeline(&events)?;

    Ok((initial_count - events.len()) as u32)
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 5: COGNITIVE STATE ENGINE
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CognitiveState {
    pub provider: String,
    pub mode: String,  // fast, balanced, deep
    pub depth: u8,  // 0-10
    pub stability: u8,  // 0-100
    pub cognitive_score: u8,  // 0-100
    pub mental_load: u8,  // 0-100
    pub reasoning_quality: u8,  // 0-100
    pub active_processes: Vec<String>,
    pub last_update: u64,
}

lazy_static! {
    static ref COGNITIVE_STATE: Mutex<CognitiveState> = Mutex::new(CognitiveState::default());
}

impl Default for CognitiveState {
    fn default() -> Self {
        Self {
            provider: "auto".into(),
            mode: "balanced".into(),
            depth: 5,
            stability: 95,
            cognitive_score: 85,
            mental_load: 20,
            reasoning_quality: 90,
            active_processes: vec!["reasoning".into(), "memory_recall".into(), "context_building".into()],
            last_update: now_ms(),
        }
    }
}

fn calculate_cognitive_score(state: &CognitiveState) -> u8 {
    let stability_weight = state.stability as f32 * 0.3;
    let depth_weight = (state.depth as f32 * 10.0) * 0.2;
    let quality_weight = state.reasoning_quality as f32 * 0.3;
    let load_penalty = (100 - state.mental_load) as f32 * 0.2;

    (stability_weight + depth_weight + quality_weight + load_penalty).min(100.0) as u8
}

#[tauri::command]
pub async fn orchestration_get_cognitive_state() -> CommandResult<CognitiveState> {
    let mut state = COGNITIVE_STATE.lock().map_err(|e| e.to_string())?;
    state.cognitive_score = calculate_cognitive_score(&state);
    state.last_update = now_ms();
    Ok(state.clone())
}

#[tauri::command]
pub async fn orchestration_set_cognitive_mode(mode: String) -> CommandResult<CognitiveState> {
    let mut state = COGNITIVE_STATE.lock().map_err(|e| e.to_string())?;

    state.mode = mode.clone();
    state.depth = match mode.as_str() {
        "fast" => 3,
        "balanced" => 5,
        "deep" => 8,
        _ => 5,
    };

    state.cognitive_score = calculate_cognitive_score(&state);
    state.last_update = now_ms();

    Ok(state.clone())
}

#[tauri::command]
pub async fn orchestration_analyze_cognitive() -> CommandResult<CognitiveState> {
    // Get states from other engines
    let multi_ai = MULTI_AI_STATE.lock().map_err(|e| e.to_string())?;
    let nexus = NEXUS_STATE.lock().map_err(|e| e.to_string())?;
    let harmonia = HARMONIA_STATE.lock().map_err(|e| e.to_string())?;

    let mut state = COGNITIVE_STATE.lock().map_err(|e| e.to_string())?;

    // Update provider from Multi-AI
    state.provider = multi_ai.best_provider.clone();

    // Calculate stability from Nexus coherence
    state.stability = nexus.coherence_score;

    // Calculate mental load from Harmonia
    state.mental_load = ((harmonia.cpu_usage + harmonia.ram_usage) / 2.0) as u8;

    // Calculate reasoning quality
    state.reasoning_quality = ((multi_ai.global_score as u32 + nexus.coherence_score as u32) / 2) as u8;

    state.cognitive_score = calculate_cognitive_score(&state);
    state.last_update = now_ms();

    Ok(state.clone())
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 6: UNIFIED ORCHESTRATION STATE
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OrchestrationUnifiedState {
    pub multi_ai: MultiAIState,
    pub nexus: NexusState,
    pub harmonia: HarmoniaState,
    pub timeline: TimelineState,
    pub cognitive: CognitiveState,
    pub global_score: u8,
    pub system_status: String,
    pub last_update: u64,
}

#[tauri::command]
pub async fn orchestration_get_unified_state() -> CommandResult<OrchestrationUnifiedState> {
    let multi_ai = orchestration_get_multi_ai().await?;
    let nexus = orchestration_get_nexus().await?;
    let harmonia = orchestration_get_harmonia().await?;
    let timeline = orchestration_get_timeline(Some(10), None).await?;
    let cognitive = orchestration_get_cognitive_state().await?;

    // Calculate global score
    let global_score = (
        (multi_ai.global_score as u32 +
         nexus.coherence_score as u32 +
         harmonia.harmony_score as u32 +
         cognitive.cognitive_score as u32) / 4
    ) as u8;

    let system_status = if global_score >= 80 {
        "optimal"
    } else if global_score >= 60 {
        "stable"
    } else if global_score >= 40 {
        "degraded"
    } else {
        "critical"
    };

    Ok(OrchestrationUnifiedState {
        multi_ai,
        nexus,
        harmonia,
        timeline,
        cognitive,
        global_score,
        system_status: system_status.into(),
        last_update: now_ms(),
    })
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 7: SINGULARITY STATE SYNC
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OrchestrationFragment {
    pub best_provider: String,
    pub nexus_score: u8,
    pub harmony_score: u8,
    pub cognitive_score: u8,
    pub timeline_events: u64,
    pub global_score: u8,
    pub system_status: String,
}

#[tauri::command]
pub async fn orchestration_get_singularity_fragment() -> CommandResult<OrchestrationFragment> {
    let unified = orchestration_get_unified_state().await?;

    Ok(OrchestrationFragment {
        best_provider: unified.multi_ai.best_provider,
        nexus_score: unified.nexus.coherence_score,
        harmony_score: unified.harmonia.harmony_score,
        cognitive_score: unified.cognitive.cognitive_score,
        timeline_events: unified.timeline.total_events,
        global_score: unified.global_score,
        system_status: unified.system_status,
    })
}
