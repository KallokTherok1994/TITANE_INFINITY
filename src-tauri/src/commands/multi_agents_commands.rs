/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.19.3Ω — MULTI-AGENTS COMMANDS
 * Commandes Tauri pour gérer les agents et leurs permissions
 * ═══════════════════════════════════════════════════════════════════
 */
use tauri::State;
use std::sync::Arc;
use tokio::sync::RwLock;
use serde::{Deserialize, Serialize};

use titane_infinity::multi_agents::{
    AgentConfig, AgentIAPermission, AgentPermissionManager, AgentRole,
};

/// État global du gestionnaire d'agents
pub type AgentManagerState = Arc<RwLock<AgentPermissionManager>>;

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

/// Requête pour créer un agent
#[derive(Debug, Deserialize)]
pub struct CreateAgentRequest {
    pub id: String,
    pub role: String,
    pub name: String,
    pub permission: Option<String>,
}

/// Requête pour mettre à jour les permissions
#[derive(Debug, Deserialize)]
pub struct UpdatePermissionRequest {
    pub agent_id: String,
    pub permission: String,
}

/// Convertir string en AgentRole
fn parse_agent_role(role: &str) -> Result<AgentRole, String> {
    match role.to_lowercase().as_str() {
        "security" => Ok(AgentRole::Security),
        "code_generator" | "code" => Ok(AgentRole::CodeGenerator),
        "analyst" | "analysis" => Ok(AgentRole::Analyst),
        "creative" | "writer" => Ok(AgentRole::Creative),
        "conversational" | "conversation" => Ok(AgentRole::Conversational),
        "researcher" | "research" => Ok(AgentRole::Researcher),
        "tester" | "test" | "qa" => Ok(AgentRole::Tester),
        "planner" | "planning" => Ok(AgentRole::Planner),
        "orchestrator" => Ok(AgentRole::Orchestrator),
        "system" => Ok(AgentRole::System),
        "debugger" | "debug" => Ok(AgentRole::Debugger),
        "admin" | "administrator" => Ok(AgentRole::Admin),
        _ => Err(format!("Unknown role: {}", role)),
    }
}

/// Convertir string en AgentIAPermission
fn parse_ia_permission(permission: &str) -> Result<AgentIAPermission, String> {
    match permission.to_lowercase().as_str() {
        "no_external" | "local_only" => Ok(AgentIAPermission::NoExternal),
        "openai_only" | "openai" | "gpt" => Ok(AgentIAPermission::OpenAIOnly),
        "claude_only" | "claude" | "anthropic" => Ok(AgentIAPermission::ClaudeOnly),
        "gemini_only" | "gemini" => Ok(AgentIAPermission::GeminiOnly),
        "all_external" | "all" => Ok(AgentIAPermission::AllExternal),
        "auto" => Ok(AgentIAPermission::Auto),
        _ => Err(format!("Unknown permission: {}", permission)),
    }
}

/// Lister tous les agents
#[tauri::command]
pub async fn list_agents(
    manager: State<'_, AgentManagerState>,
) -> Result<CommandResult<Vec<AgentConfig>>, String> {
    let manager = manager.read().await;
    let agents = manager
        .list_agents()
        .into_iter()
        .cloned()
        .collect::<Vec<_>>();

    Ok(CommandResult::ok(agents))
}

/// Obtenir un agent spécifique
#[tauri::command]
pub async fn get_agent(
    manager: State<'_, AgentManagerState>,
    agent_id: String,
) -> Result<CommandResult<AgentConfig>, String> {
    let manager = manager.read().await;

    match manager.get_agent(&agent_id) {
        Some(agent) => Ok(CommandResult::ok(agent.clone())),
        None => Ok(CommandResult::err(format!("Agent '{}' not found", agent_id))),
    }
}

/// Créer un nouvel agent
#[tauri::command]
pub async fn create_agent(
    manager: State<'_, AgentManagerState>,
    request: CreateAgentRequest,
) -> Result<CommandResult<AgentConfig>, String> {
    let role = parse_agent_role(&request.role).map_err(|e| e.to_string())?;

    let mut agent = AgentConfig::new(request.id, role, request.name);

    // Appliquer permission personnalisée si fournie
    if let Some(perm_str) = request.permission {
        let permission = parse_ia_permission(&perm_str).map_err(|e| e.to_string())?;
        agent.ia_permission = permission;
    }

    let mut manager = manager.write().await;
    manager.register_agent(agent.clone());

    Ok(CommandResult::ok(agent))
}

/// Mettre à jour les permissions d'un agent
#[tauri::command]
pub async fn update_agent_permission(
    manager: State<'_, AgentManagerState>,
    request: UpdatePermissionRequest,
) -> Result<CommandResult<String>, String> {
    let permission = parse_ia_permission(&request.permission).map_err(|e| e.to_string())?;

    let mut manager = manager.write().await;
    match manager.update_agent_permission(&request.agent_id, permission) {
        Ok(()) => Ok(CommandResult::ok(format!(
            "Permission updated for agent '{}'",
            request.agent_id
        ))),
        Err(e) => Ok(CommandResult::err(e)),
    }
}

/// Vérifier si un agent peut utiliser un provider
#[tauri::command]
pub async fn can_agent_use_provider(
    manager: State<'_, AgentManagerState>,
    agent_id: String,
    provider: String,
) -> Result<CommandResult<bool>, String> {
    let manager = manager.read().await;
    let can_use = manager.can_agent_use_provider(&agent_id, &provider);

    Ok(CommandResult::ok(can_use))
}

/// Obtenir le provider recommandé pour un agent
#[tauri::command]
pub async fn get_agent_recommended_provider(
    manager: State<'_, AgentManagerState>,
    agent_id: String,
) -> Result<CommandResult<Option<String>>, String> {
    let manager = manager.read().await;
    let provider = manager
        .get_recommended_provider(&agent_id)
        .map(|s| s.to_string());

    Ok(CommandResult::ok(provider))
}

/// Obtenir les statistiques des permissions
#[tauri::command]
pub async fn get_agent_permission_stats(
    manager: State<'_, AgentManagerState>,
) -> Result<CommandResult<Vec<(String, usize)>>, String> {
    let manager = manager.read().await;
    let stats = manager.get_permission_stats();

    let stats_vec: Vec<(String, usize)> = stats
        .into_iter()
        .map(|(perm, count)| (format!("{:?}", perm), count))
        .collect();

    Ok(CommandResult::ok(stats_vec))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_agent_role() {
        assert!(parse_agent_role("security").is_ok());
        assert!(parse_agent_role("code_generator").is_ok());
        assert!(parse_agent_role("invalid").is_err());
    }

    #[test]
    fn test_parse_ia_permission() {
        assert!(parse_ia_permission("openai").is_ok());
        assert!(parse_ia_permission("claude_only").is_ok());
        assert!(parse_ia_permission("invalid").is_err());
    }
}
