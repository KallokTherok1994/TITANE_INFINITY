// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞.19.3Ω — IA Context Commands
//   Tauri commands for IAContext state management
//   Phase 8: Singularity Integration
// ═══════════════════════════════════════════════════════════════

#[allow(dead_code)]
use tauri::State;
use std::sync::Arc;
use tokio::sync::RwLock;
use serde::{Deserialize, Serialize};

use titane_infinity::singularity::ia_context::{
    IAContext, IAEngineMetrics, IAGlobalStats, IARequestRecord, IAStatus,
};

/// État global du contexte IA
pub type IAContextState = Arc<RwLock<IAContext>>;

/// Résultat de commande générique
#[derive(Debug, Serialize, Deserialize)]
pub struct CommandResult<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T> CommandResult<T> {
    pub fn ok(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn err(error: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(error),
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// COMMANDES TAURI
// ═══════════════════════════════════════════════════════════════

/// Récupère le contexte IA complet
#[tauri::command]
pub async fn get_ia_context(
    context: State<'_, IAContextState>,
) -> Result<CommandResult<IAContext>, String> {
    let ctx = context.read().await;
    Ok(CommandResult::ok(ctx.clone()))
}

/// Récupère les statistiques globales IA
#[tauri::command]
pub async fn get_ia_global_stats(
    context: State<'_, IAContextState>,
) -> Result<CommandResult<IAGlobalStats>, String> {
    let ctx = context.read().await;
    let stats = ctx.get_global_stats();
    Ok(CommandResult::ok(stats))
}

/// Met à jour le moteur IA actif
#[tauri::command]
pub async fn set_active_ia_engine(
    context: State<'_, IAContextState>,
    engine: String,
) -> Result<CommandResult<String>, String> {
    let mut ctx = context.write().await;

    if !ctx.available_engines.contains(&engine) {
        return Ok(CommandResult::err(format!(
            "Engine '{}' is not available",
            engine
        )));
    }

    ctx.set_active_engine(engine.clone());
    Ok(CommandResult::ok(format!("Active engine set to '{}'", engine)))
}

/// Met à jour la liste des moteurs disponibles
#[tauri::command]
pub async fn update_available_ia_engines(
    context: State<'_, IAContextState>,
    engines: Vec<String>,
) -> Result<CommandResult<String>, String> {
    let mut ctx = context.write().await;
    ctx.update_available_engines(engines.clone());
    Ok(CommandResult::ok(format!(
        "{} engines now available",
        engines.len()
    )))
}

/// Met à jour le statut d'un moteur IA
#[tauri::command]
pub async fn update_ia_engine_status(
    context: State<'_, IAContextState>,
    engine: String,
    status: String,
) -> Result<CommandResult<String>, String> {
    let mut ctx = context.write().await;

    let ia_status = match status.to_lowercase().as_str() {
        "available" => IAStatus::Available,
        "unavailable" => IAStatus::Unavailable,
        "error" => IAStatus::Error,
        "disabled" => IAStatus::Disabled,
        "testing" => IAStatus::Testing,
        _ => {
            return Ok(CommandResult::err(format!(
                "Invalid status: '{}'. Must be one of: available, unavailable, error, disabled, testing",
                status
            )));
        }
    };

    ctx.update_engine_status(&engine, ia_status);
    Ok(CommandResult::ok(format!(
        "Engine '{}' status set to '{}'",
        engine, status
    )))
}

/// Enregistre une requête IA
#[tauri::command]
pub async fn record_ia_request(
    context: State<'_, IAContextState>,
    record: IARequestRecord,
) -> Result<CommandResult<String>, String> {
    let mut ctx = context.write().await;
    ctx.record_request(record);
    Ok(CommandResult::ok("Request recorded".to_string()))
}

/// Récupère les métriques d'un moteur spécifique
#[tauri::command]
pub async fn get_ia_engine_metrics(
    context: State<'_, IAContextState>,
    engine: String,
) -> Result<CommandResult<IAEngineMetrics>, String> {
    let ctx = context.read().await;

    if let Some(metrics) = ctx.engine_metrics.get(&engine) {
        Ok(CommandResult::ok(metrics.clone()))
    } else {
        Ok(CommandResult::err(format!("Engine '{}' not found", engine)))
    }
}

/// Récupère l'historique des requêtes (limité aux N dernières)
#[tauri::command]
pub async fn get_ia_request_history(
    context: State<'_, IAContextState>,
    limit: Option<usize>,
) -> Result<CommandResult<Vec<IARequestRecord>>, String> {
    let ctx = context.read().await;
    let limit = limit.unwrap_or(20);

    let history: Vec<IARequestRecord> = ctx
        .request_history
        .iter()
        .rev()
        .take(limit)
        .cloned()
        .collect();

    Ok(CommandResult::ok(history))
}

/// Met à jour le dernier agent ayant utilisé l'IA
#[tauri::command]
pub async fn set_last_used_ia_agent(
    context: State<'_, IAContextState>,
    agent_id: String,
) -> Result<CommandResult<String>, String> {
    let mut ctx = context.write().await;
    ctx.set_last_used_agent(agent_id.clone());
    Ok(CommandResult::ok(format!(
        "Last used agent set to '{}'",
        agent_id
    )))
}

/// Met à jour la permission IA d'un agent
#[tauri::command]
pub async fn update_agent_ia_permission(
    context: State<'_, IAContextState>,
    agent_id: String,
    permission: String,
) -> Result<CommandResult<String>, String> {
    let mut ctx = context.write().await;
    ctx.update_agent_permission(agent_id.clone(), permission.clone());
    Ok(CommandResult::ok(format!(
        "Agent '{}' permission updated to '{}'",
        agent_id, permission
    )))
}

/// Met à jour la recommandation de moteur pour un agent
#[tauri::command]
pub async fn update_agent_ia_recommendation(
    context: State<'_, IAContextState>,
    agent_id: String,
    engine: String,
) -> Result<CommandResult<String>, String> {
    let mut ctx = context.write().await;
    ctx.update_agent_recommendation(agent_id.clone(), engine.clone());
    Ok(CommandResult::ok(format!(
        "Agent '{}' recommendation set to '{}'",
        agent_id, engine
    )))
}

/// Obtient le prochain moteur en cas de fallback
#[tauri::command]
pub async fn get_next_fallback_ia_engine(
    context: State<'_, IAContextState>,
    current_engine: String,
) -> Result<CommandResult<Option<String>>, String> {
    let ctx = context.read().await;
    let next_engine = ctx.get_next_fallback_engine(&current_engine);
    Ok(CommandResult::ok(next_engine))
}

/// Active/désactive le fallback automatique
#[tauri::command]
pub async fn set_ia_auto_fallback(
    context: State<'_, IAContextState>,
    enabled: bool,
) -> Result<CommandResult<String>, String> {
    let mut ctx = context.write().await;
    ctx.auto_fallback_enabled = enabled;
    ctx.updated_at = chrono::Utc::now().to_rfc3339();

    Ok(CommandResult::ok(format!(
        "Auto-fallback {}",
        if enabled { "enabled" } else { "disabled" }
    )))
}

/// Met à jour l'ordre de fallback
#[tauri::command]
pub async fn set_ia_fallback_order(
    context: State<'_, IAContextState>,
    order: Vec<String>,
) -> Result<CommandResult<String>, String> {
    let mut ctx = context.write().await;
    ctx.fallback_order = order.clone();
    ctx.updated_at = chrono::Utc::now().to_rfc3339();

    Ok(CommandResult::ok(format!(
        "Fallback order updated: {}",
        order.join(" → ")
    )))
}

/// Efface l'historique des requêtes
#[tauri::command]
pub async fn clear_ia_request_history(
    context: State<'_, IAContextState>,
) -> Result<CommandResult<String>, String> {
    let mut ctx = context.write().await;
    let count = ctx.request_history.len();
    ctx.request_history.clear();
    ctx.updated_at = chrono::Utc::now().to_rfc3339();

    Ok(CommandResult::ok(format!("{} requests cleared", count)))
}

/// Réinitialise les métriques d'un moteur
#[tauri::command]
pub async fn reset_ia_engine_metrics(
    context: State<'_, IAContextState>,
    engine: String,
) -> Result<CommandResult<String>, String> {
    let mut ctx = context.write().await;

    if ctx.engine_metrics.contains_key(&engine) {
        ctx.engine_metrics.insert(engine.clone(), IAEngineMetrics::default());
        ctx.updated_at = chrono::Utc::now().to_rfc3339();
        Ok(CommandResult::ok(format!("Metrics reset for '{}'", engine)))
    } else {
        Ok(CommandResult::err(format!("Engine '{}' not found", engine)))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_set_active_engine_logic() {
        let mut context = IAContext::new();

        // Ajouter OpenAI aux engines disponibles
        context.available_engines.push("openai".to_string());

        // Test la logique interne
        context.set_active_engine("openai".to_string());

        assert_eq!(context.active_engine, Some("openai".to_string()));
    }

    #[test]
    fn test_record_request_logic() {
        let mut context = IAContext::new();

        let record = IARequestRecord {
            request_id: "test-1".to_string(),
            engine: "openai".to_string(),
            agent_id: Some("code_gen".to_string()),
            timestamp: chrono::Utc::now().to_rfc3339(),
            latency_ms: 150,
            tokens: 500,
            success: true,
            error_message: None,
            fallback_used: false,
        };

        // Test la logique interne
        context.record_request(record);

        assert_eq!(context.request_history.len(), 1);
        assert_eq!(context.request_history[0].request_id, "test-1");
    }
}
