// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.0 — TAURI BRIDGE SECURITY HARDENING
//   Command whitelist, secure invoke, parameter/response validation
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashSet;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CommandSecurityError {
    UnknownCommand(String),
    InvalidParameters(String),
    InvalidResponse(String),
    ExecutionFailed(String),
}

/// Liste blanche stricte des commandes Tauri autorisées
pub fn get_allowed_commands() -> HashSet<&'static str> {
    let mut commands = HashSet::new();

    // Memory commands
    commands.insert("memory_get_active_projects");
    commands.insert("memory_get_recent_decisions");
    commands.insert("memory_get_knowledge");
    commands.insert("memory_get_active_rituals");
    commands.insert("memory_save_chat_interaction");
    commands.insert("get_active_projects");
    commands.insert("get_recent_decisions");
    commands.insert("get_knowledge");
    commands.insert("get_active_rituals");
    commands.insert("save_chat_interaction");

    // AI commands
    commands.insert("query_ai");
    commands.insert("get_ai_status");
    commands.insert("test_gemini");
    commands.insert("test_ollama");

    // Singularity commands
    commands.insert("get_singularity_state");
    commands.insert("update_singularity_state");
    commands.insert("singularity_self_check");

    // State commands
    commands.insert("get_system_state");
    commands.insert("get_module_health");

    // XP commands
    commands.insert("xp_add");
    commands.insert("xp_get_level");
    commands.insert("xp_get_state");

    // Cognitive commands
    commands.insert("get_cognitive_state");
    commands.insert("update_cognitive_mode");

    // Session commands
    commands.insert("start_session");
    commands.insert("end_session");
    commands.insert("get_session_info");

    commands
}

/// Valider qu'une commande est autorisée
pub fn validate_command(command: &str) -> Result<(), CommandSecurityError> {
    let allowed = get_allowed_commands();

    if !allowed.contains(command) {
        log::error!("❌ Unauthorized command attempt: {}", command);
        return Err(CommandSecurityError::UnknownCommand(command.to_string()));
    }

    log::debug!("✅ Command validated: {}", command);
    Ok(())
}

/// Valider les paramètres d'une commande (vérification basique)
pub fn validate_parameters(params: &serde_json::Value) -> Result<(), CommandSecurityError> {
    // Vérifier que c'est un objet ou un tableau valide
    if !params.is_object() && !params.is_array() && !params.is_null() {
        return Err(CommandSecurityError::InvalidParameters(
            "Parameters must be object, array, or null".to_string(),
        ));
    }

    // Vérifier la taille (éviter les payloads énormes)
    let json_str = serde_json::to_string(params)
        .map_err(|e| CommandSecurityError::InvalidParameters(e.to_string()))?;

    const MAX_PARAM_SIZE: usize = 1024 * 1024; // 1 MB
    if json_str.len() > MAX_PARAM_SIZE {
        return Err(CommandSecurityError::InvalidParameters(format!(
            "Parameters too large: {} bytes",
            json_str.len()
        )));
    }

    Ok(())
}

/// Valider une réponse de commande
pub fn validate_response(response: &serde_json::Value) -> Result<(), CommandSecurityError> {
    // Vérifier que la réponse est valide JSON
    if response.is_null() {
        log::warn!("⚠️  Command returned null response");
    }

    // Vérifier la taille
    let json_str = serde_json::to_string(response)
        .map_err(|e| CommandSecurityError::InvalidResponse(e.to_string()))?;

    const MAX_RESPONSE_SIZE: usize = 10 * 1024 * 1024; // 10 MB
    if json_str.len() > MAX_RESPONSE_SIZE {
        return Err(CommandSecurityError::InvalidResponse(format!(
            "Response too large: {} bytes",
            json_str.len()
        )));
    }

    Ok(())
}

/// Logger une tentative de commande non autorisée
pub fn log_unauthorized_attempt(command: &str, source: &str) {
    log::error!(
        "🚨 SECURITY: Unauthorized command '{}' attempted from {}",
        command,
        source
    );
}

/// Statistiques de sécurité
#[derive(Debug, Clone, Default)]
pub struct SecurityStats {
    pub total_commands: u64,
    pub blocked_commands: u64,
    pub invalid_parameters: u64,
    pub invalid_responses: u64,
}

impl SecurityStats {
    pub fn record_command(&mut self) {
        self.total_commands += 1;
    }

    pub fn record_blocked(&mut self) {
        self.blocked_commands += 1;
    }

    pub fn record_invalid_params(&mut self) {
        self.invalid_parameters += 1;
    }

    pub fn record_invalid_response(&mut self) {
        self.invalid_responses += 1;
    }

    pub fn get_block_rate(&self) -> f64 {
        if self.total_commands == 0 {
            return 0.0;
        }
        self.blocked_commands as f64 / self.total_commands as f64
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_command() {
        assert!(validate_command("memory_get_active_projects").is_ok());
        assert!(validate_command("query_ai").is_ok());
        assert!(validate_command("unknown_command").is_err());
        assert!(validate_command("malicious_command").is_err());
    }

    #[test]
    fn test_validate_parameters() {
        let valid = serde_json::json!({"key": "value"});
        assert!(validate_parameters(&valid).is_ok());

        let null_params = serde_json::json!(null);
        assert!(validate_parameters(&null_params).is_ok());

        // Test taille limite (simulé avec un petit objet pour le test)
        let array = serde_json::json!([1, 2, 3, 4, 5]);
        assert!(validate_parameters(&array).is_ok());
    }

    #[test]
    fn test_validate_response() {
        let valid = serde_json::json!({"status": "ok", "data": []});
        assert!(validate_response(&valid).is_ok());

        let null_response = serde_json::json!(null);
        assert!(validate_response(&null_response).is_ok());
    }

    #[test]
    fn test_security_stats() {
        let mut stats = SecurityStats::default();

        stats.record_command();
        stats.record_command();
        stats.record_blocked();

        assert_eq!(stats.total_commands, 2);
        assert_eq!(stats.blocked_commands, 1);
        assert_eq!(stats.get_block_rate(), 0.5);
    }

    #[test]
    fn test_allowed_commands_count() {
        let commands = get_allowed_commands();
        assert!(commands.len() > 20); // Au moins 20 commandes
        assert!(commands.contains("memory_get_active_projects"));
        assert!(commands.contains("query_ai"));
    }
}
