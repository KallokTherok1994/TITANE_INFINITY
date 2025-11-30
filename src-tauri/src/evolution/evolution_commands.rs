// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                    TITANE INFINITY - Evolution Engine Commands                ║
// ║                              vΩ∞ TRANSCENDANT                                 ║
// ╠══════════════════════════════════════════════════════════════════════════════╣
// ║  Sécurité > Stabilité > Cohérence > Optimisation > Évolution                 ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
//
// Copyright (c) 2024-∞ MUSIC Music Music & CODE∞ (musicmusic.music.music0@gmail.com)
// Licensed under Apache 2.0 - NO CONTRIBUTION LICENSE
//
// Ce fichier contient les commandes Tauri pour l'Evolution Engine vΩ∞.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::State;

// ══════════════════════════════════════════════════════════════════
// TYPES ALIGNÉS SUR TYPESCRIPT
// ══════════════════════════════════════════════════════════════════

/// Niveaux de risque alignés sur TypeScript
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum EvolutionRiskLevel {
    Low,
    Medium,
    High,
    Critical,
}

impl Default for EvolutionRiskLevel {
    fn default() -> Self {
        Self::Low
    }
}

/// Rôles de gouvernance
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum GovernanceRole {
    User,
    Dev,
    Admin,
    System,
}

impl Default for GovernanceRole {
    fn default() -> Self {
        Self::User
    }
}

/// Statut d'une suggestion
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum SuggestionStatus {
    Pending,
    Approved,
    Rejected,
    Applied,
    Reverted,
}

impl Default for SuggestionStatus {
    fn default() -> Self {
        Self::Pending
    }
}

/// Catégories de données
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum DataCategory {
    IaUsage,
    EngineMetrics,
    PerformanceTrend,
    UserBehavior,
    ErrorPattern,
    SystemHealth,
}

/// Types de pattern
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum PatternType {
    Recurring,
    Anomaly,
    Trend,
    Correlation,
    Threshold,
}

/// Catégories de suggestion
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum SuggestionCategory {
    Performance,
    Stability,
    Security,
    UserExperience,
    ResourceOptimization,
    ConfigTuning,
}

/// Types d'action
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum EvolutionActionType {
    ConfigUpdate,
    CacheOptimization,
    ThresholdAdjustment,
    FeatureToggle,
    ResourceReallocation,
    SecurityHardening,
}

/// Résultat d'action
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum ActionResult {
    Success,
    Failed,
    Partial,
    Reverted,
}

/// Phases d'évolution
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum EvolutionPhase {
    Collection,
    Analysis,
    Planning,
    Execution,
    Validation,
    Idle,
}

impl Default for EvolutionPhase {
    fn default() -> Self {
        Self::Idle
    }
}

/// Direction de tendance
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum TrendDirection {
    Up,
    Down,
    Stable,
}

impl Default for TrendDirection {
    fn default() -> Self {
        Self::Stable
    }
}

/// Modules TITANE
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum TitaneModule {
    Singularity,
    SelfHealing,
    Admin,
    Performance,
    Evolution,
    Tts,
    Avatar,
    Neural,
    Global,
}

// ══════════════════════════════════════════════════════════════════
// STRUCTURES DE DONNÉES
// ══════════════════════════════════════════════════════════════════

/// Point de données d'évolution
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EvolutionDataPoint {
    pub id: String,
    pub category: DataCategory,
    pub module: TitaneModule,
    pub timestamp: u64,
    pub value: f64,
    pub metadata: HashMap<String, serde_json::Value>,
}

/// Pattern détecté
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EvolutionPattern {
    pub id: String,
    pub pattern_type: PatternType,
    pub confidence: f64,
    pub data_points: Vec<String>,
    pub description: String,
    pub detected_at: u64,
}

/// Insight généré
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EvolutionInsight {
    pub id: String,
    pub pattern_id: String,
    pub title: String,
    pub description: String,
    pub impact: f64,
    pub risk_level: EvolutionRiskLevel,
    pub action_required: bool,
}

/// Scores d'évolution
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EvolutionScores {
    pub stability: f64,
    pub coherence: f64,
    pub performance: f64,
    pub security: f64,
    pub user_satisfaction: f64,
    pub overall: f64,
}

/// Rapport d'évolution complet
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EvolutionFullReport {
    pub id: String,
    pub timestamp: u64,
    pub cycle_number: u64,
    pub phase: EvolutionPhase,
    pub scores: EvolutionScores,
    pub patterns_detected: usize,
    pub insights_generated: usize,
    pub suggestions_count: usize,
    pub actions_executed: usize,
    pub trends: HashMap<String, TrendDirection>,
}

/// Suggestion d'amélioration
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EvolutionSuggestion {
    pub id: String,
    pub title: String,
    pub description: String,
    pub category: SuggestionCategory,
    pub risk_level: EvolutionRiskLevel,
    pub expected_improvement: f64,
    pub status: SuggestionStatus,
    pub created_at: u64,
    pub requires_approval: bool,
    pub minimum_role: GovernanceRole,
}

/// Action d'évolution
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EvolutionAction {
    pub id: String,
    pub suggestion_id: String,
    pub action_type: EvolutionActionType,
    pub target_module: TitaneModule,
    pub parameters: HashMap<String, serde_json::Value>,
    pub executed_at: Option<u64>,
    pub result: Option<ActionResult>,
    pub rollback_data: Option<serde_json::Value>,
}

/// Entrée d'historique
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EvolutionHistoryEntry {
    pub id: String,
    pub timestamp: u64,
    pub action_type: String,
    pub description: String,
    pub success: bool,
    pub changes: HashMap<String, serde_json::Value>,
}

/// État global de l'Evolution Engine
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EvolutionEngineState {
    pub is_running: bool,
    pub current_phase: EvolutionPhase,
    pub cycle_count: u64,
    pub last_cycle_timestamp: u64,
    pub scores: EvolutionScores,
    pub pending_suggestions: usize,
    pub active_patterns: usize,
    pub health_status: String,
}

// ══════════════════════════════════════════════════════════════════
// STATE MANAGEMENT
// ══════════════════════════════════════════════════════════════════

/// État persistant de l'Evolution Engine
#[derive(Default)]
pub struct EvolutionEngineStore {
    pub state: EvolutionEngineState,
    pub data_points: Vec<EvolutionDataPoint>,
    pub patterns: Vec<EvolutionPattern>,
    pub insights: Vec<EvolutionInsight>,
    pub suggestions: Vec<EvolutionSuggestion>,
    pub actions: Vec<EvolutionAction>,
    pub history: Vec<EvolutionHistoryEntry>,
}

impl EvolutionEngineStore {
    pub fn new() -> Self {
        Self {
            state: EvolutionEngineState {
                is_running: false,
                current_phase: EvolutionPhase::Idle,
                cycle_count: 0,
                last_cycle_timestamp: 0,
                scores: EvolutionScores {
                    stability: 95.0,
                    coherence: 92.0,
                    performance: 88.0,
                    security: 97.0,
                    user_satisfaction: 90.0,
                    overall: 92.4,
                },
                pending_suggestions: 0,
                active_patterns: 0,
                health_status: "healthy".to_string(),
            },
            data_points: Vec::new(),
            patterns: Vec::new(),
            insights: Vec::new(),
            suggestions: Vec::new(),
            actions: Vec::new(),
            history: Vec::new(),
        }
    }

    /// Calculer le score global
    fn calculate_overall_score(&self) -> f64 {
        let s = &self.state.scores;
        // Pondération: Sécurité > Stabilité > Cohérence > Performance > UX
        (s.security * 0.25)
            + (s.stability * 0.25)
            + (s.coherence * 0.20)
            + (s.performance * 0.15)
            + (s.user_satisfaction * 0.15)
    }

    /// Générer un ID unique
    fn generate_id(prefix: &str) -> String {
        format!(
            "{}_{}_{}",
            prefix,
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis(),
            uuid::Uuid::new_v4().to_string().split('-').next().unwrap()
        )
    }

    /// Obtenir le timestamp actuel
    fn current_timestamp() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs()
    }
}

/// Type pour le state Tauri
pub type EvolutionState = Mutex<EvolutionEngineStore>;

// ══════════════════════════════════════════════════════════════════
// COMMANDES TAURI - ÉTAT
// ══════════════════════════════════════════════════════════════════

/// Obtenir l'état de l'Evolution Engine
#[tauri::command]
pub async fn evolution_get_state(
    state: State<'_, EvolutionState>,
) -> Result<EvolutionEngineState, String> {
    let store = state.lock().map_err(|e| e.to_string())?;
    Ok(store.state.clone())
}

/// Démarrer l'Evolution Engine
#[tauri::command]
pub async fn evolution_start(state: State<'_, EvolutionState>) -> Result<bool, String> {
    let mut store = state.lock().map_err(|e| e.to_string())?;

    if store.state.is_running {
        return Err("Evolution Engine already running".to_string());
    }

    store.state.is_running = true;
    store.state.current_phase = EvolutionPhase::Collection;
    store.state.health_status = "running".to_string();

    // Ajouter à l'historique
    store.history.push(EvolutionHistoryEntry {
        id: EvolutionEngineStore::generate_id("hist"),
        timestamp: EvolutionEngineStore::current_timestamp(),
        action_type: "ENGINE_START".to_string(),
        description: "Evolution Engine started".to_string(),
        success: true,
        changes: HashMap::new(),
    });

    Ok(true)
}

/// Arrêter l'Evolution Engine
#[tauri::command]
pub async fn evolution_stop(state: State<'_, EvolutionState>) -> Result<bool, String> {
    let mut store = state.lock().map_err(|e| e.to_string())?;

    if !store.state.is_running {
        return Err("Evolution Engine not running".to_string());
    }

    store.state.is_running = false;
    store.state.current_phase = EvolutionPhase::Idle;
    store.state.health_status = "stopped".to_string();

    // Ajouter à l'historique
    store.history.push(EvolutionHistoryEntry {
        id: EvolutionEngineStore::generate_id("hist"),
        timestamp: EvolutionEngineStore::current_timestamp(),
        action_type: "ENGINE_STOP".to_string(),
        description: "Evolution Engine stopped".to_string(),
        success: true,
        changes: HashMap::new(),
    });

    Ok(true)
}

// ══════════════════════════════════════════════════════════════════
// COMMANDES TAURI - SCORES ET RAPPORTS
// ══════════════════════════════════════════════════════════════════

/// Obtenir les scores actuels
#[tauri::command]
pub async fn evolution_get_scores(
    state: State<'_, EvolutionState>,
) -> Result<EvolutionScores, String> {
    let store = state.lock().map_err(|e| e.to_string())?;
    Ok(store.state.scores.clone())
}

/// Mettre à jour un score (avec validation)
#[tauri::command]
pub async fn evolution_update_score(
    state: State<'_, EvolutionState>,
    score_type: String,
    value: f64,
) -> Result<EvolutionScores, String> {
    // Validation: score entre 0 et 100
    if !(0.0..=100.0).contains(&value) {
        return Err("Score must be between 0 and 100".to_string());
    }

    let mut store = state.lock().map_err(|e| e.to_string())?;

    match score_type.as_str() {
        "stability" => store.state.scores.stability = value,
        "coherence" => store.state.scores.coherence = value,
        "performance" => store.state.scores.performance = value,
        "security" => store.state.scores.security = value,
        "userSatisfaction" => store.state.scores.user_satisfaction = value,
        _ => return Err(format!("Unknown score type: {}", score_type)),
    }

    // Recalculer le score global
    store.state.scores.overall = store.calculate_overall_score();

    Ok(store.state.scores.clone())
}

/// Générer un rapport complet
#[tauri::command]
pub async fn evolution_generate_report(
    state: State<'_, EvolutionState>,
) -> Result<EvolutionFullReport, String> {
    let store = state.lock().map_err(|e| e.to_string())?;

    let mut trends = HashMap::new();
    trends.insert("stability".to_string(), TrendDirection::Stable);
    trends.insert("coherence".to_string(), TrendDirection::Up);
    trends.insert("performance".to_string(), TrendDirection::Stable);
    trends.insert("security".to_string(), TrendDirection::Stable);

    Ok(EvolutionFullReport {
        id: EvolutionEngineStore::generate_id("report"),
        timestamp: EvolutionEngineStore::current_timestamp(),
        cycle_number: store.state.cycle_count,
        phase: store.state.current_phase,
        scores: store.state.scores.clone(),
        patterns_detected: store.patterns.len(),
        insights_generated: store.insights.len(),
        suggestions_count: store.suggestions.len(),
        actions_executed: store.actions.iter().filter(|a| a.executed_at.is_some()).count(),
        trends,
    })
}

// ══════════════════════════════════════════════════════════════════
// COMMANDES TAURI - COLLECTE DE DONNÉES
// ══════════════════════════════════════════════════════════════════

/// Ajouter un point de données
#[tauri::command]
pub async fn evolution_add_data_point(
    state: State<'_, EvolutionState>,
    category: DataCategory,
    module: TitaneModule,
    value: f64,
    metadata: Option<HashMap<String, serde_json::Value>>,
) -> Result<EvolutionDataPoint, String> {
    let mut store = state.lock().map_err(|e| e.to_string())?;

    let data_point = EvolutionDataPoint {
        id: EvolutionEngineStore::generate_id("dp"),
        category,
        module,
        timestamp: EvolutionEngineStore::current_timestamp(),
        value,
        metadata: metadata.unwrap_or_default(),
    };

    store.data_points.push(data_point.clone());

    // Garder seulement les 10000 derniers points
    if store.data_points.len() > 10000 {
        store.data_points.remove(0);
    }

    Ok(data_point)
}

/// Obtenir les points de données récents
#[tauri::command]
pub async fn evolution_get_data_points(
    state: State<'_, EvolutionState>,
    category: Option<DataCategory>,
    module: Option<TitaneModule>,
    limit: Option<usize>,
) -> Result<Vec<EvolutionDataPoint>, String> {
    let store = state.lock().map_err(|e| e.to_string())?;
    let limit = limit.unwrap_or(100);

    let filtered: Vec<EvolutionDataPoint> = store
        .data_points
        .iter()
        .rev()
        .filter(|dp| {
            category.map_or(true, |c| dp.category == c)
                && module.map_or(true, |m| dp.module == m)
        })
        .take(limit)
        .cloned()
        .collect();

    Ok(filtered)
}

// ══════════════════════════════════════════════════════════════════
// COMMANDES TAURI - PATTERNS ET INSIGHTS
// ══════════════════════════════════════════════════════════════════

/// Obtenir les patterns détectés
#[tauri::command]
pub async fn evolution_get_patterns(
    state: State<'_, EvolutionState>,
    pattern_type: Option<PatternType>,
) -> Result<Vec<EvolutionPattern>, String> {
    let store = state.lock().map_err(|e| e.to_string())?;

    let filtered: Vec<EvolutionPattern> = store
        .patterns
        .iter()
        .filter(|p| pattern_type.map_or(true, |t| p.pattern_type == t))
        .cloned()
        .collect();

    Ok(filtered)
}

/// Obtenir les insights
#[tauri::command]
pub async fn evolution_get_insights(
    state: State<'_, EvolutionState>,
    risk_level: Option<EvolutionRiskLevel>,
) -> Result<Vec<EvolutionInsight>, String> {
    let store = state.lock().map_err(|e| e.to_string())?;

    let filtered: Vec<EvolutionInsight> = store
        .insights
        .iter()
        .filter(|i| risk_level.map_or(true, |r| i.risk_level == r))
        .cloned()
        .collect();

    Ok(filtered)
}

// ══════════════════════════════════════════════════════════════════
// COMMANDES TAURI - SUGGESTIONS
// ══════════════════════════════════════════════════════════════════

/// Obtenir les suggestions
#[tauri::command]
pub async fn evolution_get_suggestions(
    state: State<'_, EvolutionState>,
    status: Option<SuggestionStatus>,
    category: Option<SuggestionCategory>,
) -> Result<Vec<EvolutionSuggestion>, String> {
    let store = state.lock().map_err(|e| e.to_string())?;

    let filtered: Vec<EvolutionSuggestion> = store
        .suggestions
        .iter()
        .filter(|s| {
            status.map_or(true, |st| s.status == st)
                && category.map_or(true, |c| s.category == c)
        })
        .cloned()
        .collect();

    Ok(filtered)
}

/// Approuver une suggestion
#[tauri::command]
pub async fn evolution_approve_suggestion(
    state: State<'_, EvolutionState>,
    suggestion_id: String,
    role: GovernanceRole,
) -> Result<EvolutionSuggestion, String> {
    let mut store = state.lock().map_err(|e| e.to_string())?;

    // Trouver l'index et vérifier les permissions
    let suggestion_index = store
        .suggestions
        .iter()
        .position(|s| s.id == suggestion_id)
        .ok_or_else(|| format!("Suggestion not found: {}", suggestion_id))?;

    // Vérifier les permissions
    let role_level = match role {
        GovernanceRole::User => 0,
        GovernanceRole::Dev => 1,
        GovernanceRole::Admin => 2,
        GovernanceRole::System => 3,
    };

    let required_level = match store.suggestions[suggestion_index].minimum_role {
        GovernanceRole::User => 0,
        GovernanceRole::Dev => 1,
        GovernanceRole::Admin => 2,
        GovernanceRole::System => 3,
    };

    if role_level < required_level {
        return Err(format!(
            "Insufficient permissions. Required: {:?}, Got: {:?}",
            store.suggestions[suggestion_index].minimum_role, role
        ));
    }

    // Mettre à jour le statut
    store.suggestions[suggestion_index].status = SuggestionStatus::Approved;
    let title = store.suggestions[suggestion_index].title.clone();
    let result = store.suggestions[suggestion_index].clone();

    // Ajouter à l'historique
    store.history.push(EvolutionHistoryEntry {
        id: EvolutionEngineStore::generate_id("hist"),
        timestamp: EvolutionEngineStore::current_timestamp(),
        action_type: "SUGGESTION_APPROVED".to_string(),
        description: format!("Suggestion '{}' approved", title),
        success: true,
        changes: {
            let mut map = HashMap::new();
            map.insert("suggestion_id".to_string(), serde_json::json!(suggestion_id));
            map.insert("approved_by".to_string(), serde_json::json!(format!("{:?}", role)));
            map
        },
    });

    Ok(result)
}

/// Rejeter une suggestion
#[tauri::command]
pub async fn evolution_reject_suggestion(
    state: State<'_, EvolutionState>,
    suggestion_id: String,
    reason: String,
) -> Result<EvolutionSuggestion, String> {
    let mut store = state.lock().map_err(|e| e.to_string())?;

    // Trouver l'index
    let suggestion_index = store
        .suggestions
        .iter()
        .position(|s| s.id == suggestion_id)
        .ok_or_else(|| format!("Suggestion not found: {}", suggestion_id))?;

    // Mettre à jour le statut
    store.suggestions[suggestion_index].status = SuggestionStatus::Rejected;
    let title = store.suggestions[suggestion_index].title.clone();
    let result = store.suggestions[suggestion_index].clone();

    // Ajouter à l'historique
    store.history.push(EvolutionHistoryEntry {
        id: EvolutionEngineStore::generate_id("hist"),
        timestamp: EvolutionEngineStore::current_timestamp(),
        action_type: "SUGGESTION_REJECTED".to_string(),
        description: format!("Suggestion '{}' rejected: {}", title, reason),
        success: true,
        changes: {
            let mut map = HashMap::new();
            map.insert("suggestion_id".to_string(), serde_json::json!(suggestion_id));
            map.insert("reason".to_string(), serde_json::json!(reason));
            map
        },
    });

    Ok(result)
}

// ══════════════════════════════════════════════════════════════════
// COMMANDES TAURI - ACTIONS
// ══════════════════════════════════════════════════════════════════

/// Créer une action depuis une suggestion approuvée
#[tauri::command]
pub async fn evolution_create_action(
    state: State<'_, EvolutionState>,
    suggestion_id: String,
    action_type: EvolutionActionType,
    target_module: TitaneModule,
    parameters: HashMap<String, serde_json::Value>,
) -> Result<EvolutionAction, String> {
    let mut store = state.lock().map_err(|e| e.to_string())?;

    // Vérifier que la suggestion est approuvée
    let suggestion = store
        .suggestions
        .iter()
        .find(|s| s.id == suggestion_id)
        .ok_or_else(|| format!("Suggestion not found: {}", suggestion_id))?;

    if suggestion.status != SuggestionStatus::Approved {
        return Err("Suggestion must be approved before creating an action".to_string());
    }

    let action = EvolutionAction {
        id: EvolutionEngineStore::generate_id("action"),
        suggestion_id,
        action_type,
        target_module,
        parameters,
        executed_at: None,
        result: None,
        rollback_data: None,
    };

    store.actions.push(action.clone());

    Ok(action)
}

/// Exécuter une action (avec validation triple couche)
#[tauri::command]
pub async fn evolution_execute_action(
    state: State<'_, EvolutionState>,
    action_id: String,
    role: GovernanceRole,
) -> Result<EvolutionAction, String> {
    let mut store = state.lock().map_err(|e| e.to_string())?;

    // Trouver l'action
    let action_index = store
        .actions
        .iter()
        .position(|a| a.id == action_id)
        .ok_or_else(|| format!("Action not found: {}", action_id))?;

    // VALIDATION 1: Vérifier que l'action n'a pas déjà été exécutée
    if store.actions[action_index].executed_at.is_some() {
        return Err("Action already executed".to_string());
    }

    // VALIDATION 2: Vérifier les permissions
    let role_level = match role {
        GovernanceRole::User => 0,
        GovernanceRole::Dev => 1,
        GovernanceRole::Admin => 2,
        GovernanceRole::System => 3,
    };

    // Actions critiques nécessitent Admin+
    let action_type = store.actions[action_index].action_type;
    let required_level = match action_type {
        EvolutionActionType::SecurityHardening => 2,  // Admin+
        EvolutionActionType::ResourceReallocation => 1, // Dev+
        _ => 0,  // User+
    };

    if role_level < required_level {
        return Err(format!(
            "Insufficient permissions for action type {:?}",
            action_type
        ));
    }

    // VALIDATION 3: Vérifier la whitelist (simulation)
    let is_whitelisted = matches!(
        action_type,
        EvolutionActionType::ConfigUpdate
            | EvolutionActionType::CacheOptimization
            | EvolutionActionType::ThresholdAdjustment
            | EvolutionActionType::FeatureToggle
    );

    if !is_whitelisted && role != GovernanceRole::System {
        return Err("Action type not in whitelist. System approval required.".to_string());
    }

    // Capturer les infos pour l'historique avant modification
    let target_module = store.actions[action_index].target_module;
    let suggestion_id = store.actions[action_index].suggestion_id.clone();

    // Exécuter l'action
    let timestamp = EvolutionEngineStore::current_timestamp();
    store.actions[action_index].executed_at = Some(timestamp);
    store.actions[action_index].result = Some(ActionResult::Success);

    // Stocker les données de rollback (simulation)
    store.actions[action_index].rollback_data = Some(serde_json::json!({
        "previous_state": "captured",
        "timestamp": timestamp
    }));

    // Mettre à jour la suggestion associée
    if let Some(sugg_idx) = store.suggestions.iter().position(|s| s.id == suggestion_id) {
        store.suggestions[sugg_idx].status = SuggestionStatus::Applied;
    }

    // Ajouter à l'historique
    store.history.push(EvolutionHistoryEntry {
        id: EvolutionEngineStore::generate_id("hist"),
        timestamp,
        action_type: "ACTION_EXECUTED".to_string(),
        description: format!("Action {:?} executed on {:?}", action_type, target_module),
        success: true,
        changes: {
            let mut map = HashMap::new();
            map.insert("action_id".to_string(), serde_json::json!(action_id.clone()));
            map.insert("executed_by".to_string(), serde_json::json!(format!("{:?}", role)));
            map
        },
    });

    // Incrémenter le cycle
    store.state.cycle_count += 1;
    store.state.last_cycle_timestamp = timestamp;

    Ok(store.actions[action_index].clone())
}

/// Annuler une action (rollback)
#[tauri::command]
pub async fn evolution_rollback_action(
    state: State<'_, EvolutionState>,
    action_id: String,
    reason: String,
) -> Result<EvolutionAction, String> {
    let mut store = state.lock().map_err(|e| e.to_string())?;

    let action_index = store
        .actions
        .iter()
        .position(|a| a.id == action_id)
        .ok_or_else(|| format!("Action not found: {}", action_id))?;

    // Vérifier que l'action a été exécutée
    if store.actions[action_index].executed_at.is_none() {
        return Err("Action was never executed, cannot rollback".to_string());
    }

    // Vérifier qu'il y a des données de rollback
    if store.actions[action_index].rollback_data.is_none() {
        return Err("No rollback data available".to_string());
    }

    // Capturer l'ID de suggestion avant modification
    let suggestion_id = store.actions[action_index].suggestion_id.clone();

    // Effectuer le rollback
    let timestamp = EvolutionEngineStore::current_timestamp();
    store.actions[action_index].result = Some(ActionResult::Reverted);

    // Mettre à jour la suggestion associée
    if let Some(sugg_idx) = store.suggestions.iter().position(|s| s.id == suggestion_id) {
        store.suggestions[sugg_idx].status = SuggestionStatus::Reverted;
    }

    // Ajouter à l'historique
    store.history.push(EvolutionHistoryEntry {
        id: EvolutionEngineStore::generate_id("hist"),
        timestamp,
        action_type: "ACTION_ROLLBACK".to_string(),
        description: format!("Action {} rolled back: {}", action_id, reason),
        success: true,
        changes: {
            let mut map = HashMap::new();
            map.insert("action_id".to_string(), serde_json::json!(action_id.clone()));
            map.insert("reason".to_string(), serde_json::json!(reason));
            map
        },
    });

    Ok(store.actions[action_index].clone())
}

// ══════════════════════════════════════════════════════════════════
// COMMANDES TAURI - HISTORIQUE
// ══════════════════════════════════════════════════════════════════

/// Obtenir l'historique
#[tauri::command]
pub async fn evolution_get_history(
    state: State<'_, EvolutionState>,
    limit: Option<usize>,
    action_type_filter: Option<String>,
) -> Result<Vec<EvolutionHistoryEntry>, String> {
    let store = state.lock().map_err(|e| e.to_string())?;
    let limit = limit.unwrap_or(100);

    let filtered: Vec<EvolutionHistoryEntry> = store
        .history
        .iter()
        .rev()
        .filter(|h| {
            action_type_filter
                .as_ref()
                .map_or(true, |t| h.action_type.contains(t))
        })
        .take(limit)
        .cloned()
        .collect();

    Ok(filtered)
}

/// Effacer l'historique ancien
#[tauri::command]
pub async fn evolution_clear_old_history(
    state: State<'_, EvolutionState>,
    before_timestamp: u64,
) -> Result<usize, String> {
    let mut store = state.lock().map_err(|e| e.to_string())?;

    let original_len = store.history.len();
    store.history.retain(|h| h.timestamp >= before_timestamp);
    let removed = original_len - store.history.len();

    Ok(removed)
}

// ══════════════════════════════════════════════════════════════════
// COMMANDES TAURI - CYCLE D'ÉVOLUTION
// ══════════════════════════════════════════════════════════════════

/// Exécuter un cycle complet d'évolution
#[tauri::command]
pub async fn evolution_run_full_cycle(
    state: State<'_, EvolutionState>,
) -> Result<EvolutionFullReport, String> {
    {
        let mut store = state.lock().map_err(|e| e.to_string())?;

        if !store.state.is_running {
            return Err("Evolution Engine is not running. Call evolution_start first.".to_string());
        }

        // Phase 1: Collection
        store.state.current_phase = EvolutionPhase::Collection;
    }

    // Simuler le temps de collection
    tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;

    {
        let mut store = state.lock().map_err(|e| e.to_string())?;

        // Phase 2: Analysis
        store.state.current_phase = EvolutionPhase::Analysis;

        // Simuler la détection de patterns
        let pattern = EvolutionPattern {
            id: EvolutionEngineStore::generate_id("pattern"),
            pattern_type: PatternType::Trend,
            confidence: 0.85,
            data_points: vec![],
            description: "Performance trend detected".to_string(),
            detected_at: EvolutionEngineStore::current_timestamp(),
        };
        store.patterns.push(pattern);
        store.state.active_patterns = store.patterns.len();
    }

    tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;

    {
        let mut store = state.lock().map_err(|e| e.to_string())?;

        // Phase 3: Planning
        store.state.current_phase = EvolutionPhase::Planning;

        // Générer des insights et suggestions
        let insight = EvolutionInsight {
            id: EvolutionEngineStore::generate_id("insight"),
            pattern_id: store.patterns.last().map(|p| p.id.clone()).unwrap_or_default(),
            title: "Performance Optimization Opportunity".to_string(),
            description: "Cache hit rate could be improved".to_string(),
            impact: 0.15,
            risk_level: EvolutionRiskLevel::Low,
            action_required: true,
        };
        store.insights.push(insight);

        let suggestion = EvolutionSuggestion {
            id: EvolutionEngineStore::generate_id("sugg"),
            title: "Optimize Cache Configuration".to_string(),
            description: "Adjust cache TTL based on usage patterns".to_string(),
            category: SuggestionCategory::Performance,
            risk_level: EvolutionRiskLevel::Low,
            expected_improvement: 0.10,
            status: SuggestionStatus::Pending,
            created_at: EvolutionEngineStore::current_timestamp(),
            requires_approval: false,
            minimum_role: GovernanceRole::Dev,
        };
        store.suggestions.push(suggestion);
        store.state.pending_suggestions = store
            .suggestions
            .iter()
            .filter(|s| s.status == SuggestionStatus::Pending)
            .count();
    }

    tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;

    {
        let mut store = state.lock().map_err(|e| e.to_string())?;

        // Phase 4: Execution (auto-approve low-risk)
        store.state.current_phase = EvolutionPhase::Execution;
    }

    tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;

    {
        let mut store = state.lock().map_err(|e| e.to_string())?;

        // Phase 5: Validation
        store.state.current_phase = EvolutionPhase::Validation;

        // Mettre à jour les métriques
        store.state.scores.performance += 0.5;
        store.state.scores.overall = store.calculate_overall_score();

        // Retour à Idle
        store.state.current_phase = EvolutionPhase::Idle;
        store.state.cycle_count += 1;
        store.state.last_cycle_timestamp = EvolutionEngineStore::current_timestamp();

        // Capturer les valeurs pour l'historique
        let cycle_count = store.state.cycle_count;
        let timestamp = store.state.last_cycle_timestamp;

        // Ajouter à l'historique
        store.history.push(EvolutionHistoryEntry {
            id: EvolutionEngineStore::generate_id("hist"),
            timestamp,
            action_type: "CYCLE_COMPLETE".to_string(),
            description: format!("Evolution cycle {} completed", cycle_count),
            success: true,
            changes: {
                let mut map = HashMap::new();
                map.insert("cycle".to_string(), serde_json::json!(cycle_count));
                map
            },
        });
    }

    // Générer le rapport final
    evolution_generate_report(state).await
}

// ══════════════════════════════════════════════════════════════════
// COMMANDES TAURI - STATISTIQUES
// ══════════════════════════════════════════════════════════════════

/// Obtenir les statistiques complètes
#[tauri::command]
pub async fn evolution_get_statistics(
    state: State<'_, EvolutionState>,
) -> Result<HashMap<String, serde_json::Value>, String> {
    let store = state.lock().map_err(|e| e.to_string())?;

    let mut stats = HashMap::new();

    stats.insert("totalCycles".to_string(), serde_json::json!(store.state.cycle_count));
    stats.insert("isRunning".to_string(), serde_json::json!(store.state.is_running));
    stats.insert("currentPhase".to_string(), serde_json::json!(format!("{:?}", store.state.current_phase)));
    stats.insert("dataPointsCount".to_string(), serde_json::json!(store.data_points.len()));
    stats.insert("patternsCount".to_string(), serde_json::json!(store.patterns.len()));
    stats.insert("insightsCount".to_string(), serde_json::json!(store.insights.len()));
    stats.insert("suggestionsCount".to_string(), serde_json::json!(store.suggestions.len()));
    stats.insert("actionsCount".to_string(), serde_json::json!(store.actions.len()));
    stats.insert("historyCount".to_string(), serde_json::json!(store.history.len()));

    // Statistiques par catégorie
    let pending_suggestions = store
        .suggestions
        .iter()
        .filter(|s| s.status == SuggestionStatus::Pending)
        .count();
    let approved_suggestions = store
        .suggestions
        .iter()
        .filter(|s| s.status == SuggestionStatus::Approved)
        .count();
    let applied_suggestions = store
        .suggestions
        .iter()
        .filter(|s| s.status == SuggestionStatus::Applied)
        .count();

    stats.insert("pendingSuggestions".to_string(), serde_json::json!(pending_suggestions));
    stats.insert("approvedSuggestions".to_string(), serde_json::json!(approved_suggestions));
    stats.insert("appliedSuggestions".to_string(), serde_json::json!(applied_suggestions));

    // Actions par résultat
    let successful_actions = store
        .actions
        .iter()
        .filter(|a| a.result == Some(ActionResult::Success))
        .count();
    let failed_actions = store
        .actions
        .iter()
        .filter(|a| a.result == Some(ActionResult::Failed))
        .count();
    let reverted_actions = store
        .actions
        .iter()
        .filter(|a| a.result == Some(ActionResult::Reverted))
        .count();

    stats.insert("successfulActions".to_string(), serde_json::json!(successful_actions));
    stats.insert("failedActions".to_string(), serde_json::json!(failed_actions));
    stats.insert("revertedActions".to_string(), serde_json::json!(reverted_actions));

    // Scores
    stats.insert("scores".to_string(), serde_json::to_value(&store.state.scores).unwrap());

    Ok(stats)
}

// ══════════════════════════════════════════════════════════════════
// HELPER: ENREGISTRER LE STATE DANS TAURI
// ══════════════════════════════════════════════════════════════════

/// Fonction pour créer le state initial
pub fn create_evolution_state() -> EvolutionState {
    Mutex::new(EvolutionEngineStore::new())
}
