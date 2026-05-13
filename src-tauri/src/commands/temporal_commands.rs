// ═══════════════════════════════════════════════════════════════
// TITANE∞ — TEMPORAL COMMANDS
// Données temporelles: blocs agenda, timeline, énergie
// + TIME-IPC v3 (17 commandes exposant le TemporalIntelligenceEngine)
// ═══════════════════════════════════════════════════════════════

use crate::security::permission_guard::PERMISSION_GUARD;
use crate::security::permissions::Role;
use titane_infinity::temporal_engine::{
    anticipator::AnticipatorStats,
    long_term_alignment::{Goal, GoalCategory, Milestone},
    planner::{PlanningHorizon, Task, TaskPriority, UpdateResult},
    routines::{Routine, RoutinePattern, RoutineStats, RoutineTrigger},
    temporal_memory::{MemoryStats, TemporalTrace},
    AlignmentScore, Prediction, TemporalContext, TemporalHealth, TemporalIntelligenceEngine,
    TemporalState as EngineTemporalState, TickResult,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::State;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeBlock {
    pub id: String,
    pub start: String,
    pub end: String,
    pub title: String,
    pub block_type: String,
    pub priority: String,
    pub energy: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineEvent {
    pub id: String,
    pub date: String,
    pub title: String,
    pub event_type: String,
    pub description: String,
    pub importance: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemporalState {
    pub current_energy: u8,
    pub today_blocks: Vec<TimeBlock>,
    pub current_block_id: Option<String>,
}

/// Obtenir l'état temporel actuel (blocs du jour + énergie)
#[tauri::command]
pub async fn temporal_get_today_state() -> Result<TemporalState, String> {
    PERMISSION_GUARD
        .require("system_read", Role::User, "temporal_get_today_state")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    // Lire depuis la base de données ou le fichier de configuration
    let state_path = std::path::Path::new("data/temporal_state.json");

    if state_path.exists() {
        let content = std::fs::read_to_string(state_path)
            .map_err(|e| format!("Failed to read temporal state: {}", e))?;
        let state: TemporalState = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse temporal state: {}", e))?;
        return Ok(state);
    }

    // État par défaut si aucun fichier n'existe
    Ok(TemporalState {
        current_energy: 72,
        today_blocks: vec![],
        current_block_id: None,
    })
}

/// Sauvegarder les blocs du jour
#[tauri::command]
pub async fn temporal_save_today_blocks(blocks: Vec<TimeBlock>) -> Result<(), String> {
    PERMISSION_GUARD
        .require("system_write", Role::User, "temporal_save_today_blocks")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    let state_path = std::path::Path::new("data/temporal_state.json");

    // Créer le répertoire si nécessaire
    if let Some(parent) = state_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create data directory: {}", e))?;
    }

    // Lire l'état existant ou créer un nouveau
    let mut state = if state_path.exists() {
        let content = std::fs::read_to_string(state_path)
            .map_err(|e| format!("Failed to read temporal state: {}", e))?;
        serde_json::from_str::<TemporalState>(&content)
            .map_err(|e| format!("Failed to parse temporal state: {}", e))?
    } else {
        TemporalState {
            current_energy: 72,
            today_blocks: vec![],
            current_block_id: None,
        }
    };

    state.today_blocks = blocks;

    let json = serde_json::to_string_pretty(&state)
        .map_err(|e| format!("Failed to serialize temporal state: {}", e))?;
    std::fs::write(state_path, json)
        .map_err(|e| format!("Failed to write temporal state: {}", e))?;

    Ok(())
}

/// Obtenir les événements de la timeline
#[tauri::command]
pub async fn temporal_get_timeline_events(
    start_date: Option<String>,
    end_date: Option<String>,
) -> Result<Vec<TimelineEvent>, String> {
    PERMISSION_GUARD
        .require("system_read", Role::User, "temporal_get_timeline_events")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    let events_path = std::path::Path::new("data/timeline_events.json");

    if !events_path.exists() {
        return Ok(vec![]);
    }

    let content = std::fs::read_to_string(events_path)
        .map_err(|e| format!("Failed to read timeline events: {}", e))?;
    let mut events: Vec<TimelineEvent> = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse timeline events: {}", e))?;

    // Filtrer par dates si spécifiées
    if let Some(start) = start_date {
        events.retain(|e| e.date >= start);
    }
    if let Some(end) = end_date {
        events.retain(|e| e.date <= end);
    }

    // Trier par date
    events.sort_by(|a, b| a.date.cmp(&b.date));

    Ok(events)
}

/// Ajouter un événement à la timeline
#[tauri::command]
pub async fn temporal_add_timeline_event(event: TimelineEvent) -> Result<(), String> {
    PERMISSION_GUARD
        .require("system_write", Role::User, "temporal_add_timeline_event")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    let events_path = std::path::Path::new("data/timeline_events.json");

    if let Some(parent) = events_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create data directory: {}", e))?;
    }

    let mut events: Vec<TimelineEvent> = if events_path.exists() {
        let content = std::fs::read_to_string(events_path)
            .map_err(|e| format!("Failed to read timeline events: {}", e))?;
        serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse timeline events: {}", e))?
    } else {
        vec![]
    };

    events.push(event);
    events.sort_by(|a, b| a.date.cmp(&b.date));

    let json = serde_json::to_string_pretty(&events)
        .map_err(|e| format!("Failed to serialize timeline events: {}", e))?;
    std::fs::write(events_path, json)
        .map_err(|e| format!("Failed to write timeline events: {}", e))?;

    Ok(())
}

/// Mettre à jour le niveau d'énergie actuel
#[tauri::command]
pub async fn temporal_update_energy(energy: u8) -> Result<(), String> {
    PERMISSION_GUARD
        .require("system_write", Role::User, "temporal_update_energy")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    let state_path = std::path::Path::new("data/temporal_state.json");

    let mut state = if state_path.exists() {
        let content = std::fs::read_to_string(state_path)
            .map_err(|e| format!("Failed to read temporal state: {}", e))?;
        serde_json::from_str::<TemporalState>(&content)
            .map_err(|e| format!("Failed to parse temporal state: {}", e))?
    } else {
        TemporalState {
            current_energy: 72,
            today_blocks: vec![],
            current_block_id: None,
        }
    };

    state.current_energy = energy.min(100);

    if let Some(parent) = state_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create data directory: {}", e))?;
    }

    let json = serde_json::to_string_pretty(&state)
        .map_err(|e| format!("Failed to serialize temporal state: {}", e))?;
    std::fs::write(state_path, json)
        .map_err(|e| format!("Failed to write temporal state: {}", e))?;

    Ok(())
}

// ════════════════════════════════════════════════════════════════════
// TIME-IPC v3 — 17 nouvelles commandes (TemporalIntelligenceEngine)
// Doctrine Single Door: chaque commande retourne Result<T, String>.
// ════════════════════════════════════════════════════════════════════

/// Handle global vers le moteur temporel (managé par Tauri).
pub type TemporalEngineHandle = Arc<RwLock<TemporalIntelligenceEngine>>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoutineTriggerPayload {
    pub pattern: String,
    pub time_of_day: Option<String>,
    pub hour: Option<u8>,
    pub minute: Option<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoutineUpsertPayload {
    pub id: Option<String>,
    pub name: String,
    pub description: Option<String>,
    pub trigger: RoutineTriggerPayload,
    pub enabled: Option<bool>,
    pub priority: Option<u8>,
    pub cooldown_ms: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskAddPayload {
    pub title: String,
    pub description: Option<String>,
    pub priority: Option<String>,
    pub horizon: Option<String>,
    pub due_at: Option<u64>,
    pub estimated_duration_ms: Option<u64>,
    pub energy_required: Option<f32>,
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MilestonePayload {
    pub id: Option<String>,
    pub title: String,
    pub due_date: Option<u64>,
    pub order: Option<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GoalUpsertPayload {
    pub id: Option<String>,
    pub title: String,
    pub description: Option<String>,
    pub category: String,
    pub priority: Option<u8>,
    pub target_date: Option<u64>,
    pub milestones: Option<Vec<MilestonePayload>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryRecordPayload {
    pub event_type: String,
    pub context: String,
    pub data: serde_json::Value,
    pub significance: Option<f32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryRecallPayload {
    pub event_type: Option<String>,
    pub context_tag: Option<String>,
    pub since_ms: Option<u64>,
    pub limit: Option<usize>,
    pub min_strength: Option<f32>,
}

fn parse_priority(s: &str) -> TaskPriority {
    match s.to_ascii_lowercase().as_str() {
        "low" => TaskPriority::Low,
        "high" => TaskPriority::High,
        "urgent" => TaskPriority::Urgent,
        "critical" => TaskPriority::Critical,
        _ => TaskPriority::Normal,
    }
}

fn parse_horizon(s: &str) -> PlanningHorizon {
    match s.to_ascii_lowercase().as_str() {
        "today" => PlanningHorizon::Today,
        "this_week" | "week" => PlanningHorizon::ThisWeek,
        "this_month" | "month" => PlanningHorizon::ThisMonth,
        "this_quarter" | "quarter" => PlanningHorizon::ThisQuarter,
        "this_year" | "year" => PlanningHorizon::ThisYear,
        "long_term" => PlanningHorizon::LongTerm,
        _ => PlanningHorizon::Today,
    }
}

fn parse_category(s: &str) -> GoalCategory {
    match s.to_ascii_lowercase().as_str() {
        "professional" => GoalCategory::Professional,
        "health" => GoalCategory::Health,
        "learning" => GoalCategory::Learning,
        "financial" => GoalCategory::Financial,
        "relationships" => GoalCategory::Relationships,
        "creative" => GoalCategory::Creative,
        "contribution" => GoalCategory::Contribution,
        _ => GoalCategory::Personal,
    }
}

fn parse_routine_pattern(s: &str) -> RoutinePattern {
    if s.eq_ignore_ascii_case("daily") {
        return RoutinePattern::Daily;
    }
    if let Some(rest) = s.strip_prefix("weekly:") {
        let days: Vec<u8> = rest.split(',').filter_map(|t| t.trim().parse::<u8>().ok()).collect();
        return RoutinePattern::Weekly(days);
    }
    if let Some(rest) = s.strip_prefix("monthly:") {
        let days: Vec<u8> = rest.split(',').filter_map(|t| t.trim().parse::<u8>().ok()).collect();
        return RoutinePattern::Monthly(days);
    }
    if let Some(rest) = s.strip_prefix("interval:") {
        let hours = rest.trim_end_matches('h').parse::<u32>().unwrap_or(1);
        return RoutinePattern::Interval { hours };
    }
    if let Some(rest) = s.strip_prefix("event:") {
        return RoutinePattern::EventTriggered(rest.to_string());
    }
    RoutinePattern::Daily
}

fn parse_time_of_day(s: &str) -> Option<titane_infinity::temporal_engine::time_model::TimeOfDay> {
    use titane_infinity::temporal_engine::time_model::TimeOfDay;
    Some(match s.to_ascii_lowercase().as_str() {
        "early_morning" | "earlymorning" => TimeOfDay::EarlyMorning,
        "morning" => TimeOfDay::Morning,
        "midday" => TimeOfDay::Midday,
        "afternoon" => TimeOfDay::Afternoon,
        "evening" => TimeOfDay::Evening,
        "night" => TimeOfDay::Night,
        "late_night" | "latenight" => TimeOfDay::LateNight,
        _ => return None,
    })
}

#[tauri::command]
pub async fn temporal_get_full_context(
    engine: State<'_, TemporalEngineHandle>,
) -> Result<TemporalContext, String> {
    PERMISSION_GUARD.require("system_read", Role::User, "temporal_get_full_context").await
        .map_err(|e| format!("Permission denied: {}", e))?;
    let eng = engine.read().await;
    eng.time_model().sync_now().await;
    Ok(eng.time_model().current_context().await)
}

#[tauri::command]
pub async fn temporal_get_state_v3(
    engine: State<'_, TemporalEngineHandle>,
) -> Result<EngineTemporalState, String> {
    PERMISSION_GUARD.require("system_read", Role::User, "temporal_get_state_v3").await
        .map_err(|e| format!("Permission denied: {}", e))?;
    let eng = engine.read().await;
    Ok(eng.get_state().await)
}

#[tauri::command]
pub async fn temporal_tick(
    engine: State<'_, TemporalEngineHandle>,
) -> Result<TickResult, String> {
    PERMISSION_GUARD.require("system_write", Role::User, "temporal_tick").await
        .map_err(|e| format!("Permission denied: {}", e))?;
    let mut eng = engine.write().await;
    eng.tick().await.map_err(|e| format!("Tick failed: {}", e))
}

#[tauri::command]
pub async fn temporal_memory_record(
    engine: State<'_, TemporalEngineHandle>,
    payload: MemoryRecordPayload,
) -> Result<String, String> {
    PERMISSION_GUARD.require("system_write", Role::User, "temporal_memory_record").await
        .map_err(|e| format!("Permission denied: {}", e))?;
    let mut trace = TemporalTrace::new(&payload.event_type, &payload.context, payload.data);
    if let Some(sig) = payload.significance {
        trace.significance = sig.clamp(0.0, 1.0);
    }
    let id = trace.id.clone();
    let eng = engine.read().await;
    eng.temporal_memory().record(trace).await;
    Ok(id)
}

#[tauri::command]
pub async fn temporal_memory_recall(
    engine: State<'_, TemporalEngineHandle>,
    payload: MemoryRecallPayload,
) -> Result<Vec<TemporalTrace>, String> {
    PERMISSION_GUARD.require("system_read", Role::User, "temporal_memory_recall").await
        .map_err(|e| format!("Permission denied: {}", e))?;
    let eng = engine.read().await;
    let memory = eng.temporal_memory();
    let limit = payload.limit.unwrap_or(50).min(500);

    let mut traces: Vec<TemporalTrace> = if let Some(event_type) = payload.event_type.as_ref() {
        memory.search_by_type(event_type).await
    } else if let Some(since) = payload.since_ms {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;
        memory.search_by_time(since, now).await
    } else {
        memory.recent(limit * 2).await
    };

    if let Some(tag) = payload.context_tag.as_ref() {
        traces.retain(|t| t.context.contains(tag));
    }
    if let Some(min) = payload.min_strength {
        traces.retain(|t| t.current_strength() >= min);
    }

    traces.sort_by(|a, b| b.timestamp_ms.cmp(&a.timestamp_ms));
    traces.truncate(limit);
    Ok(traces)
}

#[tauri::command]
pub async fn temporal_memory_metrics(
    engine: State<'_, TemporalEngineHandle>,
) -> Result<MemoryStats, String> {
    PERMISSION_GUARD.require("system_read", Role::User, "temporal_memory_metrics").await
        .map_err(|e| format!("Permission denied: {}", e))?;
    let eng = engine.read().await;
    Ok(eng.temporal_memory().stats().await)
}

#[tauri::command]
pub async fn temporal_memory_consolidate(
    engine: State<'_, TemporalEngineHandle>,
) -> Result<MemoryStats, String> {
    PERMISSION_GUARD.require("system_write", Role::User, "temporal_memory_consolidate").await
        .map_err(|e| format!("Permission denied: {}", e))?;
    let eng = engine.read().await;
    eng.temporal_memory().consolidate().await;
    Ok(eng.temporal_memory().stats().await)
}

#[tauri::command]
pub async fn temporal_routine_list(
    engine: State<'_, TemporalEngineHandle>,
) -> Result<Vec<Routine>, String> {
    PERMISSION_GUARD.require("system_read", Role::User, "temporal_routine_list").await
        .map_err(|e| format!("Permission denied: {}", e))?;
    let eng = engine.read().await;
    Ok(eng.routine_engine().all_routines().await)
}

#[tauri::command]
pub async fn temporal_routine_upsert(
    engine: State<'_, TemporalEngineHandle>,
    payload: RoutineUpsertPayload,
) -> Result<String, String> {
    PERMISSION_GUARD.require("system_write", Role::User, "temporal_routine_upsert").await
        .map_err(|e| format!("Permission denied: {}", e))?;

    let id = payload.id.clone().unwrap_or_else(|| uuid::Uuid::new_v4().to_string());

    let trigger = RoutineTrigger {
        pattern: parse_routine_pattern(&payload.trigger.pattern),
        time_of_day: payload.trigger.time_of_day.as_deref().and_then(parse_time_of_day),
        hour: payload.trigger.hour,
        minute: payload.trigger.minute,
        conditions: vec![],
    };

    let mut routine = Routine::new(&id, &payload.name, trigger);
    if let Some(desc) = payload.description { routine.description = desc; }
    if let Some(en) = payload.enabled { routine.enabled = en; }
    if let Some(p) = payload.priority { routine.priority = p; }
    if let Some(cd) = payload.cooldown_ms { routine.cooldown_ms = cd; }

    let eng = engine.read().await;
    eng.routine_engine().remove_routine(&id).await;
    eng.routine_engine().add_routine(routine).await;
    Ok(id)
}

#[tauri::command]
pub async fn temporal_routine_check_triggers(
    engine: State<'_, TemporalEngineHandle>,
) -> Result<Vec<Routine>, String> {
    PERMISSION_GUARD.require("system_read", Role::User, "temporal_routine_check_triggers").await
        .map_err(|e| format!("Permission denied: {}", e))?;
    let eng = engine.read().await;
    eng.time_model().sync_now().await;
    let context = eng.time_model().current_context().await;
    Ok(eng.routine_engine().check_triggers(&context).await)
}

#[tauri::command]
pub async fn temporal_planner_get_plan(
    engine: State<'_, TemporalEngineHandle>,
    horizon: Option<String>,
) -> Result<Vec<Task>, String> {
    PERMISSION_GUARD.require("system_read", Role::User, "temporal_planner_get_plan").await
        .map_err(|e| format!("Permission denied: {}", e))?;
    let h = horizon.as_deref().map(parse_horizon).unwrap_or(PlanningHorizon::Today);
    let eng = engine.read().await;
    Ok(eng.planner().tasks_by_horizon(h).await)
}

#[tauri::command]
pub async fn temporal_planner_add_task(
    engine: State<'_, TemporalEngineHandle>,
    payload: TaskAddPayload,
) -> Result<String, String> {
    PERMISSION_GUARD.require("system_write", Role::User, "temporal_planner_add_task").await
        .map_err(|e| format!("Permission denied: {}", e))?;
    if payload.title.trim().is_empty() {
        return Err("Task title cannot be empty".into());
    }
    if payload.title.len() > 500 {
        return Err("Task title too long (max 500)".into());
    }

    let id = uuid::Uuid::new_v4().to_string();
    let mut task = Task::new(&id, &payload.title);
    if let Some(d) = payload.description { task.description = d; }
    if let Some(p) = payload.priority.as_deref() { task.priority = parse_priority(p); }
    if let Some(h) = payload.horizon.as_deref() { task.horizon = parse_horizon(h); }
    task.due_at = payload.due_at;
    task.estimated_duration_ms = payload.estimated_duration_ms;
    if let Some(e) = payload.energy_required { task.energy_required = e.clamp(0.0, 1.0); }
    if let Some(tags) = payload.tags { task.tags = tags; }

    let eng = engine.read().await;
    eng.planner().add_task(task).await;
    Ok(id)
}

#[tauri::command]
pub async fn temporal_planner_optimize(
    engine: State<'_, TemporalEngineHandle>,
) -> Result<UpdateResult, String> {
    PERMISSION_GUARD.require("system_write", Role::User, "temporal_planner_optimize").await
        .map_err(|e| format!("Permission denied: {}", e))?;
    let eng = engine.read().await;
    eng.time_model().sync_now().await;
    let context = eng.time_model().current_context().await;
    Ok(eng.planner().update(&context).await)
}

#[tauri::command]
pub async fn temporal_planner_stats(
    engine: State<'_, TemporalEngineHandle>,
) -> Result<titane_infinity::temporal_engine::planner::PlannerStats, String> {
    PERMISSION_GUARD.require("system_read", Role::User, "temporal_planner_stats").await
        .map_err(|e| format!("Permission denied: {}", e))?;
    let eng = engine.read().await;
    Ok(eng.planner().stats().await)
}

#[tauri::command]
pub async fn temporal_anticipator_predict(
    engine: State<'_, TemporalEngineHandle>,
    horizon: Option<String>,
) -> Result<Vec<Prediction>, String> {
    PERMISSION_GUARD.require("system_read", Role::User, "temporal_anticipator_predict").await
        .map_err(|e| format!("Permission denied: {}", e))?;
    let eng = engine.read().await;
    eng.time_model().sync_now().await;
    let context = eng.time_model().current_context().await;
    if let Some(h) = horizon.as_deref() {
        Ok(eng.anticipator().predict_horizon(&context, eng.temporal_memory(), parse_horizon(h)).await)
    } else {
        Ok(eng.anticipator().predict(&context, eng.temporal_memory()).await)
    }
}

#[tauri::command]
pub async fn temporal_alignment_score(
    engine: State<'_, TemporalEngineHandle>,
) -> Result<AlignmentScore, String> {
    PERMISSION_GUARD.require("system_read", Role::User, "temporal_alignment_score").await
        .map_err(|e| format!("Permission denied: {}", e))?;
    let eng = engine.read().await;
    eng.time_model().sync_now().await;
    let context = eng.time_model().current_context().await;
    Ok(eng.aligner().check_alignment(&context).await)
}

#[tauri::command]
pub async fn temporal_alignment_goal_upsert(
    engine: State<'_, TemporalEngineHandle>,
    payload: GoalUpsertPayload,
) -> Result<String, String> {
    PERMISSION_GUARD.require("system_write", Role::User, "temporal_alignment_goal_upsert").await
        .map_err(|e| format!("Permission denied: {}", e))?;
    if payload.title.trim().is_empty() {
        return Err("Goal title cannot be empty".into());
    }

    let id = payload.id.clone().unwrap_or_else(|| uuid::Uuid::new_v4().to_string());
    let mut goal = Goal::new(&id, &payload.title, parse_category(&payload.category));
    if let Some(d) = payload.description { goal.description = d; }
    if let Some(p) = payload.priority { goal.priority = p; }
    goal.target_date = payload.target_date;
    if let Some(ms) = payload.milestones {
        goal.milestones = ms.into_iter().enumerate().map(|(i, m)| {
            let mid = m.id.unwrap_or_else(|| uuid::Uuid::new_v4().to_string());
            let mut milestone = Milestone::new(&mid, &id, &m.title, m.order.unwrap_or(i as u8));
            milestone.due_date = m.due_date;
            milestone
        }).collect();
    }
    goal.calculate_progress();

    let eng = engine.read().await;
    eng.aligner().add_goal(goal).await;
    Ok(id)
}

#[tauri::command]
pub async fn temporal_metrics_health(
    engine: State<'_, TemporalEngineHandle>,
) -> Result<TemporalHealth, String> {
    PERMISSION_GUARD.require("system_read", Role::User, "temporal_metrics_health").await
        .map_err(|e| format!("Permission denied: {}", e))?;
    let eng = engine.read().await;
    Ok(eng.get_metrics().await)
}

#[cfg(test)]
mod tests_v3 {
    use super::*;

    #[test]
    fn parse_priority_maps_canonical_values() {
        assert_eq!(parse_priority("low"), TaskPriority::Low);
        assert_eq!(parse_priority("HIGH"), TaskPriority::High);
        assert_eq!(parse_priority("urgent"), TaskPriority::Urgent);
        assert_eq!(parse_priority("critical"), TaskPriority::Critical);
        assert_eq!(parse_priority("garbage"), TaskPriority::Normal);
    }

    #[test]
    fn parse_horizon_maps_aliases() {
        assert_eq!(parse_horizon("today"), PlanningHorizon::Today);
        assert_eq!(parse_horizon("week"), PlanningHorizon::ThisWeek);
        assert_eq!(parse_horizon("this_month"), PlanningHorizon::ThisMonth);
        assert_eq!(parse_horizon("long_term"), PlanningHorizon::LongTerm);
    }

    #[test]
    fn parse_routine_pattern_handles_grammar() {
        match parse_routine_pattern("daily") {
            RoutinePattern::Daily => {}
            _ => panic!("expected Daily"),
        }
        match parse_routine_pattern("weekly:1,2,3") {
            RoutinePattern::Weekly(d) => assert_eq!(d, vec![1, 2, 3]),
            _ => panic!("expected Weekly"),
        }
        match parse_routine_pattern("interval:2h") {
            RoutinePattern::Interval { hours } => assert_eq!(hours, 2),
            _ => panic!("expected Interval"),
        }
    }

    #[tokio::test]
    async fn memory_record_and_recall_roundtrip() {
        let engine = Arc::new(RwLock::new(TemporalIntelligenceEngine::default()));
        let trace = TemporalTrace::new("user_msg", "chat", serde_json::json!({"a":1}));
        let id = trace.id.clone();
        {
            let eng = engine.read().await;
            eng.temporal_memory().record(trace).await;
        }
        let eng = engine.read().await;
        let recent = eng.temporal_memory().recent(10).await;
        assert!(recent.iter().any(|t| t.id == id));
    }

    #[tokio::test]
    async fn planner_add_task_increases_pending() {
        let engine = Arc::new(RwLock::new(TemporalIntelligenceEngine::default()));
        let task = Task::new(&uuid::Uuid::new_v4().to_string(), "Focus 2h livre");
        {
            let eng = engine.read().await;
            eng.planner().add_task(task).await;
        }
        let eng = engine.read().await;
        let stats = eng.planner().stats().await;
        assert_eq!(stats.total_tasks, 1);
        assert_eq!(stats.pending_tasks, 1);
    }

    #[tokio::test]
    async fn alignment_goal_upsert_records_goal() {
        let engine = Arc::new(RwLock::new(TemporalIntelligenceEngine::default()));
        let goal = Goal::new("g1", "Sortir le livre", GoalCategory::Creative);
        {
            let eng = engine.read().await;
            eng.aligner().add_goal(goal).await;
        }
        let eng = engine.read().await;
        eng.time_model().sync_now().await;
        let context = eng.time_model().current_context().await;
        let score = eng.aligner().check_alignment(&context).await;
        assert!(score.score >= 0.0 && score.score <= 1.0);
    }

    #[tokio::test]
    async fn tick_runs_without_error() {
        let engine = Arc::new(RwLock::new(TemporalIntelligenceEngine::default()));
        let mut eng = engine.write().await;
        eng.routine_engine().load_default_routines().await;
        let result = eng.tick().await.expect("tick should succeed");
        assert!(result.tick_duration_ms < 10_000);
    }
}
