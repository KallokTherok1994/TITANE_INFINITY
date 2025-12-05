/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.19.3Ω — MULTI-AGENTS IA PERMISSIONS
 * Définition des permissions IA par agent
 * ═══════════════════════════════════════════════════════════════════
 */

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use log::{info, warn};

/// Permission IA pour un agent
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum AgentIAPermission {
    /// Aucun accès aux IA externes (uniquement local)
    NoExternal,

    /// Uniquement OpenAI GPT
    OpenAIOnly,

    /// Uniquement Claude
    ClaudeOnly,

    /// Uniquement Gemini
    GeminiOnly,

    /// Toutes les IA externes autorisées
    AllExternal,

    /// Choix automatique basé sur le contexte
    Auto,
}

/// Rôle d'un agent dans le système
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum AgentRole {
    /// Agent de sécurité (surveillance, validation)
    Security,

    /// Agent de génération de code
    CodeGenerator,

    /// Agent d'analyse et de diagnostic
    Analyst,

    /// Agent créatif (écriture, design)
    Creative,

    /// Agent de conversation utilisateur
    Conversational,

    /// Agent de recherche et documentation
    Researcher,

    /// Agent de test et QA
    Tester,

    /// Agent de planification et stratégie
    Planner,

    /// Agent d'orchestration (coordinateur)
    Orchestrator,

    /// Agent système (maintenance, monitoring)
    System,

    /// Agent de debug et résolution de problèmes
    Debugger,

    /// Agent administrateur (accès complet)
    Admin,
}

impl AgentRole {
    /// Obtenir la permission IA recommandée pour ce rôle
    pub fn default_ia_permission(&self) -> AgentIAPermission {
        match self {
            // Agents de sécurité: local uniquement
            AgentRole::Security => AgentIAPermission::NoExternal,

            // Agents de code: préférence OpenAI (meilleur pour code)
            AgentRole::CodeGenerator => AgentIAPermission::OpenAIOnly,
            AgentRole::Debugger => AgentIAPermission::OpenAIOnly,
            AgentRole::Tester => AgentIAPermission::OpenAIOnly,

            // Agents d'analyse: préférence Claude (raisonnement profond)
            AgentRole::Analyst => AgentIAPermission::ClaudeOnly,
            AgentRole::Planner => AgentIAPermission::ClaudeOnly,
            AgentRole::Researcher => AgentIAPermission::ClaudeOnly,

            // Agents créatifs: préférence Gemini (créativité)
            AgentRole::Creative => AgentIAPermission::GeminiOnly,

            // Agents conversationnels: accès à tous
            AgentRole::Conversational => AgentIAPermission::AllExternal,

            // Agents système: local uniquement (sécurité)
            AgentRole::System => AgentIAPermission::NoExternal,

            // Orchestrateurs et admins: accès complet
            AgentRole::Orchestrator => AgentIAPermission::AllExternal,
            AgentRole::Admin => AgentIAPermission::AllExternal,
        }
    }

    /// Nom d'affichage du rôle
    pub fn display_name(&self) -> &'static str {
        match self {
            AgentRole::Security => "Agent de Sécurité",
            AgentRole::CodeGenerator => "Agent de Code",
            AgentRole::Analyst => "Agent d'Analyse",
            AgentRole::Creative => "Agent Créatif",
            AgentRole::Conversational => "Agent Conversationnel",
            AgentRole::Researcher => "Agent de Recherche",
            AgentRole::Tester => "Agent de Test",
            AgentRole::Planner => "Agent de Planification",
            AgentRole::Orchestrator => "Orchestrateur",
            AgentRole::System => "Agent Système",
            AgentRole::Debugger => "Agent de Debug",
            AgentRole::Admin => "Administrateur",
        }
    }
}

/// Configuration d'un agent
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentConfig {
    pub id: String,
    pub role: AgentRole,
    pub name: String,
    pub ia_permission: AgentIAPermission,
    pub priority: u8, // 0-255, plus élevé = plus prioritaire
    pub enabled: bool,
}

impl AgentConfig {
    /// Créer un nouvel agent avec permissions par défaut
    pub fn new(id: String, role: AgentRole, name: String) -> Self {
        Self {
            id,
            role,
            name,
            ia_permission: role.default_ia_permission(),
            priority: 100, // Priorité moyenne
            enabled: true,
        }
    }

    /// Vérifier si l'agent peut utiliser un provider IA
    pub fn can_use_provider(&self, provider: &str) -> bool {
        match self.ia_permission {
            AgentIAPermission::NoExternal => {
                provider == "local" || provider == "ollama"
            }
            AgentIAPermission::OpenAIOnly => {
                provider == "openai" || provider == "gpt" || provider == "local" || provider == "ollama"
            }
            AgentIAPermission::ClaudeOnly => {
                provider == "claude" || provider == "anthropic" || provider == "local" || provider == "ollama"
            }
            AgentIAPermission::GeminiOnly => {
                provider == "gemini" || provider == "local" || provider == "ollama"
            }
            AgentIAPermission::AllExternal => true,
            AgentIAPermission::Auto => true,
        }
    }

    /// Obtenir le provider préféré pour cet agent
    pub fn preferred_provider(&self) -> Option<&'static str> {
        match self.ia_permission {
            AgentIAPermission::NoExternal => Some("local"),
            AgentIAPermission::OpenAIOnly => Some("openai"),
            AgentIAPermission::ClaudeOnly => Some("claude"),
            AgentIAPermission::GeminiOnly => Some("gemini"),
            AgentIAPermission::AllExternal => None, // Auto-select
            AgentIAPermission::Auto => None,
        }
    }
}

/// Gestionnaire des permissions multi-agents
pub struct AgentPermissionManager {
    agents: HashMap<String, AgentConfig>,
}

impl AgentPermissionManager {
    /// Créer un nouveau gestionnaire
    pub fn new() -> Self {
        let mut manager = Self {
            agents: HashMap::new(),
        };

        // Initialiser avec agents par défaut
        manager.register_default_agents();

        manager
    }

    /// Enregistrer les agents par défaut
    fn register_default_agents(&mut self) {
        let default_agents = vec![
            AgentConfig::new(
                "security_guard".to_string(),
                AgentRole::Security,
                "Gardien de Sécurité".to_string(),
            ),
            AgentConfig::new(
                "code_gen".to_string(),
                AgentRole::CodeGenerator,
                "Générateur de Code".to_string(),
            ),
            AgentConfig::new(
                "analyst".to_string(),
                AgentRole::Analyst,
                "Analyste Expert".to_string(),
            ),
            AgentConfig::new(
                "creative_writer".to_string(),
                AgentRole::Creative,
                "Créateur Littéraire".to_string(),
            ),
            AgentConfig::new(
                "conversation".to_string(),
                AgentRole::Conversational,
                "Assistant Conversationnel".to_string(),
            ),
            AgentConfig::new(
                "orchestrator".to_string(),
                AgentRole::Orchestrator,
                "Orchestrateur Principal".to_string(),
            ),
        ];

        for agent in default_agents {
            info!("[AgentPermissions] Registered: {} ({})", agent.name, agent.role.display_name());
            self.agents.insert(agent.id.clone(), agent);
        }
    }

    /// Enregistrer un nouvel agent
    pub fn register_agent(&mut self, agent: AgentConfig) {
        info!(
            "[AgentPermissions] Register agent: {} (role={:?}, permission={:?})",
            agent.name, agent.role, agent.ia_permission
        );
        self.agents.insert(agent.id.clone(), agent);
    }

    /// Obtenir la configuration d'un agent
    pub fn get_agent(&self, agent_id: &str) -> Option<&AgentConfig> {
        self.agents.get(agent_id)
    }

    /// Vérifier si un agent peut utiliser un provider
    pub fn can_agent_use_provider(&self, agent_id: &str, provider: &str) -> bool {
        match self.get_agent(agent_id) {
            Some(agent) => {
                let can_use = agent.can_use_provider(provider);
                if !can_use {
                    warn!(
                        "[AgentPermissions] Agent '{}' denied access to provider '{}'",
                        agent_id, provider
                    );
                }
                can_use
            }
            None => {
                warn!("[AgentPermissions] Unknown agent: {}", agent_id);
                false
            }
        }
    }

    /// Obtenir le provider recommandé pour un agent
    pub fn get_recommended_provider(&self, agent_id: &str) -> Option<&'static str> {
        self.get_agent(agent_id)
            .and_then(|agent| agent.preferred_provider())
    }

    /// Lister tous les agents
    pub fn list_agents(&self) -> Vec<&AgentConfig> {
        let mut agents: Vec<_> = self.agents.values().collect();
        agents.sort_by(|a, b| b.priority.cmp(&a.priority));
        agents
    }

    /// Mettre à jour les permissions d'un agent
    pub fn update_agent_permission(
        &mut self,
        agent_id: &str,
        permission: AgentIAPermission,
    ) -> Result<(), String> {
        match self.agents.get_mut(agent_id) {
            Some(agent) => {
                info!(
                    "[AgentPermissions] Update agent '{}': {:?} -> {:?}",
                    agent_id, agent.ia_permission, permission
                );
                agent.ia_permission = permission;
                Ok(())
            }
            None => Err(format!("Agent '{}' not found", agent_id)),
        }
    }

    /// Obtenir statistiques des permissions
    pub fn get_permission_stats(&self) -> HashMap<AgentIAPermission, usize> {
        let mut stats = HashMap::new();
        for agent in self.agents.values() {
            *stats.entry(agent.ia_permission).or_insert(0) += 1;
        }
        stats
    }
}

impl Default for AgentPermissionManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_agent_role_permissions() {
        assert_eq!(
            AgentRole::Security.default_ia_permission(),
            AgentIAPermission::NoExternal
        );
        assert_eq!(
            AgentRole::CodeGenerator.default_ia_permission(),
            AgentIAPermission::OpenAIOnly
        );
        assert_eq!(
            AgentRole::Analyst.default_ia_permission(),
            AgentIAPermission::ClaudeOnly
        );
    }

    #[test]
    fn test_agent_can_use_provider() {
        let agent = AgentConfig::new(
            "test".to_string(),
            AgentRole::CodeGenerator,
            "Test Agent".to_string(),
        );

        assert!(agent.can_use_provider("openai"));
        assert!(agent.can_use_provider("local"));
        assert!(!agent.can_use_provider("claude"));
    }

    #[test]
    fn test_permission_manager() {
        let manager = AgentPermissionManager::new();

        // Vérifier agent par défaut
        assert!(manager.get_agent("security_guard").is_some());
        assert!(manager.can_agent_use_provider("security_guard", "local"));
        assert!(!manager.can_agent_use_provider("security_guard", "openai"));

        // Vérifier code generator
        assert!(manager.can_agent_use_provider("code_gen", "openai"));
        assert!(!manager.can_agent_use_provider("code_gen", "claude"));
    }
}
